import { ARRIVAL_NEARBY, GAN_HATUT_MISSION, checkMissionArrival, choiceStep, missionState, type ArrivalPolicy, type MissionArrival, type MissionDefinition, type MissionView } from "./mission-arrival.ts";
import { findMission, SHUK_MISSIONS } from "./missions.ts";
import type { GroupAction } from "./group-action.ts";
import { evaluateChoice, isValidChoiceSelection, toggleChoice, type ChoiceChallenge } from "./choice-task.ts";
import { createWaterPerformance, adjustWaterTiming, awardWaterPerformance, measuredWaterTime, type WaterPerformance } from "./water-performance.ts";
import { createHash, randomBytes, randomInt } from "node:crypto";
import { link, mkdir, readFile, open, rename, rm, stat } from "node:fs/promises";
import { EMPTY_WATER_CUPS, WATER_PUZZLE_REVISION, WATER_TASK_ID, isValidCups, isWaterPuzzleSolved, type WaterCups } from "./water-measurement.ts";
import { cleanDisplayName, isValidNames, rosterParticipants, setDisplayName, type ParticipantNames } from "./participant-names.ts";
import { claimGroupRole, releaseGroupRole, roleForParticipant, setGroupRole, type GroupRoleAssignments } from "./roles.ts";
import { basename, dirname, resolve } from "node:path";
import { LOBBY_COUNT, recommendedTeamCount } from "./adventure-lobby.ts";
import { JOIN_ERROR, TEAM_JOIN_COPY, type JoinErrorCode } from "./team-membership.ts";
import { applyDevWaterAction, DEV_GUIDE_ID, DEV_PARTICIPANTS, type DevWaterSession } from "./dev-water-session.ts";

export const SESSION_COOKIE = "shuk_session";
const DAY = 86_400_000;
type Credential = { participantId: string; expiresAt: number };
/** A session. `host` marks the one session made by redeeming the host invitation: host rights belong to that session, never to
 * the seat, so another session of the same seat (earlier, later or replaced) has none. Older sessions have no flag.
 * `leaderTeamId` does the same for a team's leadership (schema 7): the session that became the leader carries it, and it counts only
 * while its participant is still that team's leader, so a change of leader ends it without touching any session. */
type Session = Credential & { host?: true; leaderTeamId?: string };
/** Schema 6 and earlier: an invitation named the participant it signs in. */
type LegacyInvitation = Credential & { kind?: "host" | "leader"; teamId?: string };
/** An operator's single-use invitation (schema 7) names a seat, not a participant: the seat (player-1…7, or the guide) is only a
 * label for the command-line fallback. Redeeming it signs in the participant who holds that seat, or makes one with a random ID.
 * A host invitation also makes that participant the adventure's host and its team's leader. "leader" is reserved for the team
 * leaders' invitations (I7a); nothing issues one yet, and redeeming one is refused. */
type Invitation = { seat: string; expiresAt: number; kind?: "host" | "leader"; teamId?: string; overCap?: true };
/** A member of the adventure (schema 7). Only redeeming an invitation makes one: an ID alone, a seat or a name never does.
 * `seat` links a member to the operator's seat label; members who arrive through I3b's join link will have none.
 * `joinedAt` orders the roster (0 for members carried over from schema 6). `name` is a display label, never a credential. */
type ParticipantRecord = { teamId: string; joinedAt: number; seat?: string; name?: string };
/** One mission's shared progress. Its award and arrival bonus are immutable once recorded.
 * `kind` follows the mission's challenge: the well keeps cups, a "choose N" challenge keeps the group's picks.
 * A mission with follow-up questions also keeps the question it is on (`step`, from 0) and how many of the shared hints had been
 * used when that question opened (`stepHintsStart`). Both are absent, meaning 0, for single-question missions.
 */
type MissionRecord = { completed: boolean; arrival: MissionArrival | null; performance: WaterPerformance; bonus?: BonusRecord }
  & ({ kind: "water"; cups: WaterCups } | { kind: "choice"; selected: string[]; step?: number; stepHintsStart?: number });
/** An optional bonus question's shared picks and its one-time points, recorded once and never changed. */
type BonusRecord = { selected: string[]; award: { points: number; awardedAt: number } | null };
const EMPTY_BONUS: BonusRecord = { selected: [], award: null };
/** Schema 4 and earlier held a single mission: the well. */
type LegacyDatabase = { version: number; arrival: MissionArrival | null; performance: WaterPerformance; invitations: Record<string, Credential>; sessions: Record<string, Credential>; group: Omit<DevWaterSession, "activeActorId">; applied: Record<string, string[]> };
// `names` (optional): display names by participant ID, set by an admin command; absent means "Player N".
/** Schema 5 held one group: its roles and missions sat at the top level. */
type Schema5Database = { version: 5; invitations: Record<string, LegacyInvitation>; sessions: Record<string, Session>; roles: GroupRoleAssignments; missions: Record<string, MissionRecord>; applied: Record<string, string[]>; names?: ParticipantNames };
/** The team every existing group becomes, and the one the guide acts on until the guide can choose a team. */
export const DEFAULT_TEAM_ID = "A";
/** One team's shared play: its leader (none until a host joins), its roles, and its missions' progress and rewards.
 * `joinLink` and `joinRequests` (I3b, optional under schema 7) are its join link, stored hashed, and the requests made with it. */
type TeamRecord = { leaderId: string | null; roles: GroupRoleAssignments; missions: Record<string, MissionRecord>;
  joinLink?: { tokenHash: string; createdAt: number }; joinRequests?: Record<string, JoinRequest> };
/** A device's request to join (I3b), keyed by a public ID the leader's screen refers to. Only the device holds the secret, in its
 * `shuk_join` cookie; `code` is shown on both phones so the leader lets in the right one, and proves nothing. A pending request
 * lasts 10 minutes; let in, it holds a place for 15 more until the device collects its session. A declined one stays until it
 * would have expired, so the same cookie can't ask again. `name` is a display label only. */
type JoinRequest = { code: string; secretHash: string; createdAt: number; expiresAt: number; status: "pending" | "approved" | "declined"; name?: string };
/** The adventure around the teams. `intendedCount` is the host's answer to "how many are playing?"; null when never asked.
 * `format` is stored for the I1 app, which reads only "together" or "twoTeams": while there is one team it stays "together".
 * A team count replaces it when multiple teams arrive (I7a, schema 7). */
type AdventureRecord = { status: "lobby" | "active"; format: "together" | "twoTeams"; hostId: string | null; intendedCount: number | null };
/** Schema 6: an adventure of teams; every fixed seat was a member of team A from the start, and names were keyed by seat. */
type Schema6Database = { version: 6; adventure: AdventureRecord; teams: Record<string, TeamRecord>; participants: Record<string, { teamId: string }>;
  invitations: Record<string, LegacyInvitation>; sessions: Record<string, Session>; applied: Record<string, string[]>; names?: ParticipantNames };
/** Schema 7: the participant registry is the only roster. Players belong to one team; the guide oversees every team and is in none.
 * `seatNames` are the operator's display names for the seats (set with scripts/shuk-name.ts); they outlive adventures, as before. */
type Database = { version: 7; adventure: AdventureRecord; teams: Record<string, TeamRecord>; participants: Record<string, ParticipantRecord>;
  invitations: Record<string, Invitation>; sessions: Record<string, Session>; applied: Record<string, string[]>; seatNames?: ParticipantNames };
export const SCHEMA_VERSION = 7;
/** O6 (owner, 31 Oct 2026): members per team, the leader included; the guide is in no team. Members plus requests let in but not
 * yet collected count. Operator invitations over it need the explicit --over-cap override. */
export const TEAM_CAPACITY = 5;
/** O6: requests waiting for the leader, per team. */
export const PENDING_LIMIT = 5;
export const PENDING_MS = 10 * 60_000;
export const APPROVED_MS = 15 * 60_000;
// TODO(copy): drafts for the join flow (O16).
export const TEAM_FULL = "This team is full. Ask your guide.";
// The joining phone's own copy, kept once in team-membership.ts; the app tells these refusals apart by their codes (JOIN_ERROR).
export const JOIN_LINK_UNUSABLE = TEAM_JOIN_COPY.noLink;
export const JOIN_REQUEST_GONE = TEAM_JOIN_COPY.gone;
export const ALREADY_IN = TEAM_JOIN_COPY.alreadyIn;
/** Shown on the welcome screen for any invitation that can't sign in: the same words whatever the reason. TODO(copy): draft (O16). */
export const INVITATION_UNUSABLE = "This invitation link has expired or has already been used. Ask your guide for a new one.";
/** A refusal with its HTTP status; `code` is a stable reason the app can act on (I3b join refusals only). */
export class AccessError extends Error {
  status: number;
  code?: JoinErrorCode;
  constructor(message: string, status = 403, code?: JoinErrorCode) { super(message); this.status = status; this.code = code; }
}
const hash = (token: string) => createHash("sha256").update(token).digest("hex");
const secret = () => randomBytes(32).toString("base64url");
function emptyMission(definition: MissionDefinition): MissionRecord {
  const base = { completed: false, arrival: null, performance: createWaterPerformance(), ...(definition.bonus ? { bonus: EMPTY_BONUS } : {}) };
  return definition.challenge.kind === "water" ? { ...base, kind: "water", cups: EMPTY_WATER_CUPS } : { ...base, kind: "choice", selected: [] };
}
const isEmptyProgress = (record: MissionRecord) => record.kind === "water" ? record.cups.small + record.cups.large + record.cups.jar === 0 : record.selected.length === 0;
/** The single group becomes team A of an adventure that is already under way, played together, with no host yet. */
function toSchema6({ roles, missions, ...rest }: Schema5Database): Schema6Database {
  return { ...rest, version: 6, adventure: { status: "active", format: "together", hostId: null, intendedCount: null },
    teams: { [DEFAULT_TEAM_ID]: { leaderId: null, roles, missions } },
    participants: Object.fromEntries(DEV_PARTICIPANTS.map(participant => [participant.id, { teamId: DEFAULT_TEAM_ID }])) };
}
/**
 * Schema 6 → 7: the registry keeps the seats someone actually uses, under their existing IDs, so sessions, roles, the host,
 * progress, receipts and phones' queued actions (which name their participant) all carry on. A seat is in use when a session
 * (live or expired) names it, it holds a role, or it is the host or a leader. The other seats are dropped: they become labels
 * for the operator's invitations again. Invitations move from participant to seat; names keyed by seat become seat names.
 * The session that holds the host rights also gets team A's leadership, which I2 tied to the host.
 */
function toSchema7({ participants, invitations, sessions, names, ...rest }: Schema6Database): Database {
  const inUse = new Set<string>([...Object.values(sessions).map(session => session.participantId), rest.adventure.hostId ?? "",
    ...Object.values(rest.teams).flatMap(team => [team.leaderId ?? "", team.roles?.navigator ?? "", team.roles?.answerSubmitter ?? ""])]);
  const registry: Record<string, ParticipantRecord> = {};
  for (const [id, member] of Object.entries(participants ?? {})) if (inUse.has(id) && id !== DEV_GUIDE_ID) registry[id] = { teamId: member?.teamId, joinedAt: 0, seat: id };
  const hostTeam = Object.entries(rest.teams ?? {}).find(([, team]) => team?.leaderId !== null && team?.leaderId === rest.adventure?.hostId)?.[0];
  return { ...rest, version: 7, participants: registry,
    invitations: Object.fromEntries(Object.entries(invitations ?? {}).map(([key, { participantId, ...invitation }]) => [key, { ...invitation, seat: participantId }])),
    sessions: Object.fromEntries(Object.entries(sessions ?? {}).map(([key, session]) => [key,
      session.host && hostTeam && session.participantId === rest.adventure.hostId ? { ...session, leaderTeamId: hostTeam } : session])),
    ...(names ? { seatNames: names } : {}) };
}
/** A file that has never been written: an adventure under way with no members, no host and no roles (the local simulation). */
function initial(): Database {
  return toSchema7(toSchema6({ version: 5, invitations: {}, sessions: {}, roles: { navigator: null, answerSubmitter: null }, missions: {}, applied: {} }));
}
/** The operator's seats: player-1…7 and the guide. Labels for command-line invitations and names, never members by themselves. */
const SEATS: readonly string[] = [...DEV_PARTICIPANTS.map(participant => participant.id), DEV_GUIDE_ID];
/** A new member's ID: 128 random bits, so an ID can't be guessed, and it means nothing without a session. */
const newParticipantId = () => "p_" + randomBytes(16).toString("base64url");
const isParticipantId = (id: string) => /^p_[A-Za-z0-9_-]{22}$/.test(id) || (SEATS.includes(id) && id !== DEV_GUIDE_ID);
function isValidRegistry(db: Database): boolean {
  const seats = Object.values(db.participants).flatMap(member => member?.seat === undefined ? [] : [member.seat]);
  return new Set(seats).size === seats.length && Object.entries(db.participants).every(([id, member]) => isParticipantId(id) && Boolean(member)
    && Object.hasOwn(db.teams, member.teamId) && Number.isSafeInteger(member.joinedAt) && member.joinedAt >= 0
    && (member.seat === undefined || (SEATS.includes(member.seat) && member.seat !== DEV_GUIDE_ID))
    && (member.name === undefined || cleanDisplayName(member.name) === member.name))
    && Object.values(db.invitations).every(invitation => Boolean(invitation) && SEATS.includes(invitation.seat));
}
const isValidAdventure = (adventure: AdventureRecord) => Boolean(adventure) && ["lobby", "active"].includes(adventure.status)
  && ["together", "twoTeams"].includes(adventure.format) && (adventure.hostId === null || typeof adventure.hostId === "string")
  && (adventure.intendedCount === null || (Number.isSafeInteger(adventure.intendedCount) && adventure.intendedCount > 0));
function isValidMission(record: MissionRecord): boolean {
  if (!record || !(record.arrival === null || (Boolean(record.arrival) && Number.isSafeInteger(record.arrival.points) && record.arrival.points >= 0))) return false;
  if (record.bonus !== undefined && !(record.bonus && Array.isArray(record.bonus.selected) && record.bonus.selected.every(id => typeof id === "string")
    && (record.bonus.award === null || (Boolean(record.bonus.award) && Number.isSafeInteger(record.bonus.award.points) && record.bonus.award.points >= 0)))) return false;
  return record.kind === "water" ? isValidCups(record.cups) : Array.isArray(record.selected) && record.selected.every(id => typeof id === "string")
    && [record.step, record.stepHintsStart].every(n => n === undefined || (Number.isSafeInteger(n) && n >= 0));
}
/** I3b's optional join fields: absent, or well formed. */
function isValidJoin(team: TeamRecord): boolean {
  if (team.joinLink !== undefined && !(team.joinLink && /^[0-9a-f]{64}$/.test(team.joinLink.tokenHash) && Number.isSafeInteger(team.joinLink.createdAt))) return false;
  if (team.joinRequests === undefined) return true;
  if (!team.joinRequests || typeof team.joinRequests !== "object") return false;
  return Object.entries(team.joinRequests).every(([id, request]) => /^r_[A-Za-z0-9_-]{16}$/.test(id) && Boolean(request)
    && /^[A-Z0-9]{4}$/.test(request.code) && /^[0-9a-f]{64}$/.test(request.secretHash) && Number.isSafeInteger(request.createdAt)
    && Number.isSafeInteger(request.expiresAt) && ["pending", "approved", "declined"].includes(request.status)
    && (request.name === undefined || cleanDisplayName(request.name) === request.name));
}
const stepOf = (record: MissionRecord) => record.kind === "choice" ? record.step ?? 0 : 0;
export const defaultStorePath = () => resolve(process.env.SHUK_DATA_FILE ?? ".local/amazing-shuk/state.json");

/** The stored file's exact bytes, or null before the first write. */
async function readStored(path: string): Promise<Buffer | null> {
  try { return await readFile(path); }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; return null; }
}
/** Reads the latest published snapshot and migrates it in memory; writers persist the migration. */
async function load(path: string): Promise<Database> {
  return migrate(await readStored(path)).db;
}
/** Parses stored bytes and migrates them in memory to schema 7. `older`: a file exists and was stored in an older schema. */
function migrate(raw: Buffer | null): { db: Database; older: boolean } {
  let stored = (raw === null ? initial() : JSON.parse(raw.toString("utf8"))) as LegacyDatabase | Schema5Database | Schema6Database | Database;
  // Only versions 1 to 7 get past the checks below, so any stored version other than 7 is older.
  const older = raw !== null && stored.version !== SCHEMA_VERSION;
  if (stored.version !== 5 && stored.version !== 6 && stored.version !== 7) {
    let legacy = stored as LegacyDatabase;
    if (legacy.version === 1) {
      // The old measuring-cup task is a different puzzle. Keep credentials and roles,
      // start this revised task empty, and retain old receipts to reject stale replays.
      legacy = { ...legacy, version: 4, arrival: null, performance: createWaterPerformance(), group: { ...legacy.group, cups: EMPTY_WATER_CUPS, completed: false } };
    }
    if (legacy.version === 2) legacy = { ...legacy, version: 4, arrival: null, performance: createWaterPerformance() };
    if (legacy.version === 3) legacy = { ...legacy, version: 4, arrival: null };
    if (legacy.version !== 4 || !legacy.group) throw new Error("Unsupported Shuk storage state");
    // Keep the well's progress, timing and rewards under its stable mission ID.
    const { group, arrival, performance, ...rest } = legacy;
    stored = { ...rest, version: 5, roles: group.roles, missions: { [WATER_TASK_ID]: { kind: "water", cups: group.cups, completed: group.completed, arrival, performance } } };
  }
  if (stored.version === 5) {
    const group = stored as Schema5Database;
    if (!group.roles || !group.missions) throw new Error("Unsupported Shuk storage state");
    stored = toSchema6(group);
  }
  if (stored.version === 6) {
    const adventure = stored as Schema6Database;
    if (!isValidAdventure(adventure.adventure) || !adventure.teams || !adventure.participants || (adventure.names !== undefined && !isValidNames(adventure.names))) throw new Error("Unsupported Shuk storage state");
    stored = toSchema7(adventure);
  }
  const db = stored as Database;
  if (!isValidAdventure(db.adventure) || !db.teams || !db.teams[DEFAULT_TEAM_ID] || !db.participants || !db.invitations || !db.sessions || !db.applied
    || (db.seatNames !== undefined && !isValidNames(db.seatNames)) || !isValidRegistry(db)) throw new Error("Unsupported Shuk storage state");
  if (db.adventure.hostId !== null && !Object.hasOwn(db.participants, db.adventure.hostId)) throw new Error("Unsupported Shuk storage state");
  const teams: Record<string, TeamRecord> = {};
  for (const [teamId, team] of Object.entries(db.teams)) {
    const members = memberIds(db, teamId);
    if (!team || !team.roles || !team.missions || !isValidJoin(team) || (team.leaderId !== null && !members.includes(team.leaderId))
      || [team.roles.navigator, team.roles.answerSubmitter].some(id => id !== null && !members.includes(id))) throw new Error("Unsupported Shuk storage state");
    teams[teamId] = { ...team, missions: catalogueMissions(team.missions) };
  }
  db.teams = teams;
  return { db, older };
}

/**
 * Before the first schema-7 write, keeps the file's exact older bytes beside it: a rollback to the previous app restores this copy.
 * The name carries the bytes' hash, so a later migration (after a restore) gets its own copy, and a copy is never overwritten:
 * it is written whole to a temporary file and linked into place, which fails if the name exists, and its directory entry reaches
 * the disk before the state file is replaced. It runs under the write lock, and any failure stops the write, leaving the older
 * file as it was (fail closed: queued actions retry until an operator clears the cause the log names).
 */
async function keepPreMigrationBackup(path: string, raw: Buffer): Promise<void> {
  try { await keepExactCopy(path, `${path}.pre-schema${SCHEMA_VERSION}-${createHash("sha256").update(raw).digest("hex").slice(0, 12)}`, raw); } catch (error) {
    // No paths or contents: the code or reason says whether the disk is full, permissions are wrong or the name is taken.
    console.error(`Shuk storage: the pre-schema-${SCHEMA_VERSION} backup could not be kept:`, (error as NodeJS.ErrnoException).code ?? (error as Error).message);
    throw new AccessError("Storage unavailable: the pre-migration backup could not be kept. Nothing was changed.", 503);
  }
}
/** Keeps `raw` at `backup`, mode 600, beside the state file: whole or not at all, never over a different file, on disk before the caller writes. */
async function keepExactCopy(path: string, backup: string, raw: Buffer): Promise<void> {
  const temporary = backup + "." + secret() + ".tmp";
  try {
    if (await holdsBytes(backup, raw)) return;
    const file = await open(temporary, "wx", 0o600);
    try { await file.writeFile(raw); await file.sync(); } finally { await file.close(); }
    try { await link(temporary, backup); } catch (error) { if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error; }
    // A new copy, or a file already under its name: either way it must hold exactly these bytes.
    if (!(await holdsBytes(backup, raw))) throw new Error("a different file holds the copy's name");
    const directory = await open(dirname(path), "r");
    try { await directory.sync(); } finally { await directory.close(); }
  } finally { await rm(temporary, { force: true }); }
}
/** Whether `file` exists and holds exactly `bytes`. */
async function holdsBytes(file: string, bytes: Buffer): Promise<boolean> {
  try { return (await readFile(file)).equals(bytes); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return false; throw error; }
}
/** A team's missions, checked and brought up to the current catalogue. */
function catalogueMissions(stored: Record<string, MissionRecord>): Record<string, MissionRecord> {
  let missions = stored;
  // The first schema-5 records had no kind; they were all the well.
  for (const [id, record] of Object.entries(missions)) if (record && !("kind" in record)) missions = { ...missions, [id]: { ...(record as object), kind: "water" } as MissionRecord };
  if (!Object.values(missions).every(isValidMission)) throw new Error("Unsupported Shuk storage state");
  // A mission added to the catalogue starts empty. Records of missions no longer listed are kept, with their rewards.
  for (const mission of SHUK_MISSIONS) {
    const record = missions[mission.id];
    if (!record) missions = { ...missions, [mission.id]: emptyMission(mission) };
    else if (record.kind !== mission.challenge.kind || (record.kind === "choice" && !isValidChoiceSelection(choiceStep(mission, stepOf(record))?.challenge ?? mission.challenge as ChoiceChallenge, record.selected))
      || (record.kind === "choice" && !choiceStep(mission, stepOf(record)))) throw new Error("Unsupported Shuk storage state");
    // A bonus added to an existing mission starts empty; the main record is kept as it is.
    else if (mission.bonus && !record.bonus) missions = { ...missions, [mission.id]: { ...record, bonus: EMPTY_BONUS } };
    else if (mission.bonus && record.bonus && !isValidChoiceSelection(mission.bonus.challenge, record.bonus.selected)) throw new Error("Unsupported Shuk storage state");
  }
  return missions;
}
const memberIds = (db: Database, teamId: string) => Object.keys(db.participants).filter(id => db.participants[id].teamId === teamId);
/** The team a participant plays in. The guide oversees every team; until the guide can choose one, that is team A. */
function teamIdOf(db: Database, participantId: string): string {
  if (participantId === DEV_GUIDE_ID) return DEFAULT_TEAM_ID;
  if (!Object.hasOwn(db.participants, participantId)) throw new AccessError("Not a member of this adventure");
  return db.participants[participantId].teamId;
}

/** A real write holds the lock for milliseconds; a lock older than this was left by a writer that was killed mid-write. */
export const STALE_LOCK_MS = 10_000;
const busy = () => new AccessError("Storage busy; retry the same action.", 503);

/**
 * Takes the write lock (a directory, created atomically). A crashed writer (out of memory, docker kill, reboot) leaves its lock
 * on the data volume, where a restart doesn't clear it; such a lock is moved aside once and the write goes ahead. A lock younger
 * than STALE_LOCK_MS is a live writer: "busy" (`waitForLock` retries briefly first). Security review, 25 Oct 2026.
 */
async function acquireLock(lock: string, now: number): Promise<void> {
  try { await mkdir(lock); return; } catch (error) { if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error; }
  let age: number;
  try { age = now - (await stat(lock)).mtimeMs; } catch (error) {
    // Released between the two calls: one more try.
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    try { await mkdir(lock); return; } catch { throw busy(); }
  }
  if (age < STALE_LOCK_MS) throw busy();
  // Rename is atomic: if two writers find the same stale lock, only one moves it; the other reports busy.
  const aside = lock + ".stale-" + secret();
  try { await rename(lock, aside); } catch { throw busy(); }
  await rm(aside, { recursive: true, force: true });
  try { await mkdir(lock); } catch { throw busy(); }
}

/** A team's join requests that haven't expired. Reads use this; writes also drop the rest (`withoutExpired`). */
const liveRequests = (team: TeamRecord, now: number) => Object.entries(team.joinRequests ?? {}).filter(([, request]) => request.expiresAt > now);
/** The team with exactly these join requests (none: no field at all, as before I3b). */
function withRequests(team: TeamRecord, requests: readonly [string, JoinRequest][]): TeamRecord {
  const copy = { ...team };
  delete copy.joinRequests;
  return requests.length ? { ...copy, joinRequests: Object.fromEntries(requests) } : copy;
}
const withoutExpired = (team: TeamRecord, now: number) => withRequests(team, liveRequests(team, now));
/** Places taken in a team: its members, plus requests let in whose device hasn't collected its session yet. */
const placesTaken = (db: Database, teamId: string, now: number) =>
  memberIds(db, teamId).length + liveRequests(db.teams[teamId], now).filter(([, request]) => request.status === "approved").length;
/** The team whose current join link this is, if any. */
const teamOfLink = (db: Database, link: string) => Object.keys(db.teams).find(id => db.teams[id].joinLink?.tokenHash === hash(link));
/** The team and live request a device's join secret belongs to, if any. */
function requestOfSecret(db: Database, joinSecret: string, now: number) {
  const secretHash = hash(joinSecret);
  for (const [teamId, team] of Object.entries(db.teams)) {
    const found = liveRequests(team, now).find(([, request]) => request.secretHash === secretHash);
    if (found) return { teamId, requestId: found[0], request: found[1] };
  }
  return null;
}
// The check code's letters and digits leave out look-alikes (0/O, 1/I/L, 2/Z, 5/S, 6/G, 8/B).
const CODE_ALPHABET = "ACDEFHJKMNPRTUVWXY3479";
function checkCode(team: TeamRecord, now: number): string {
  const used = new Set(liveRequests(team, now).map(([, request]) => request.code));
  for (;;) {
    const code = Array.from({ length: 4 }, () => CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]).join("");
    if (!used.has(code)) return code;
  }
}
const isJoinSecret = (value: string) => /^[A-Za-z0-9_-]{43}$/.test(value);

/** Another process (the operator CLI) holds the lock for milliseconds: wait this long for it, in short jittered steps, before "busy". */
export const LOCK_WAIT_MS = 1_500;
async function waitForLock(lock: string): Promise<void> {
  const deadline = Date.now() + LOCK_WAIT_MS;
  for (;;) {
    try { return await acquireLock(lock, Date.now()); } catch (error) {
      if ((error as AccessError).status !== 503 || Date.now() >= deadline) throw error;
    }
    await new Promise(wake => setTimeout(wake, 20 + Math.random() * 40));
  }
}

/** At most this many writes per state file wait in line in one process, the running one included; one more is told "busy". */
export const WRITE_QUEUE_LIMIT = 64;
/** A write that has waited this long for its turn gives up with "busy"; its queued action retries. */
export const WRITE_TURN_WAIT_MS = 10_000;
type WriteLine = { tail: Promise<void>; waiting: number };
// On globalThis so that every copy of this module in one server process (Next bundles each route separately) shares one line per file.
const lines = globalThis as typeof globalThis & { shukWriteLines?: Map<string, WriteLine> };
const writeLines = lines.shukWriteLines ??= new Map<string, WriteLine>();

/**
 * Writes from this process take turns per state file, so a burst of taps waits milliseconds in line instead of colliding on the
 * lock and failing with "busy" (S0-B, 31 Oct 2026). The line only orders writers: the filesystem lock is still taken for every
 * write and is what keeps the file safe, from other processes too. A failed write still hands on its turn.
 */
async function inTurn<T>(path: string, write: () => Promise<T>): Promise<T> {
  const key = resolve(path);
  const line = writeLines.get(key) ?? { tail: Promise.resolve(), waiting: 0 };
  if (line.waiting >= WRITE_QUEUE_LIMIT) throw busy();
  line.waiting++;
  writeLines.set(key, line);
  const previous = line.tail;
  let handOn!: () => void;
  line.tail = new Promise<void>(done => { handOn = done; });
  let timer: NodeJS.Timeout | undefined;
  const late = new Promise<"late">(give => { timer = setTimeout(() => give("late"), WRITE_TURN_WAIT_MS); });
  try {
    if (await Promise.race([previous, late]) === "late") {
      // Hand on only after the writer ahead finishes, so the writers behind keep their order.
      void previous.then(handOn);
      handOn = () => {};
      throw busy();
    }
    return await write();
  } finally {
    clearTimeout(timer);
    handOn();
    if (--line.waiting === 0 && writeLines.get(key) === line) writeLines.delete(key);
  }
}

/** A filesystem lock serializes CLI and HTTP writers; writers in one process also take turns (`inTurn`). Atomic rename publishes
 * whole snapshots. `beforeWrite` runs under the lock after the operation succeeded and before the file is replaced; if it throws,
 * nothing is written. */
export function transact<T>(path: string, operation: (db: Database) => T, beforeWrite?: (raw: Buffer | null) => Promise<void>): Promise<T> {
  return inTurn(path, () => write(path, operation, beforeWrite));
}

async function write<T>(path: string, operation: (db: Database) => T, beforeWrite?: (raw: Buffer | null) => Promise<void>): Promise<T> {
  await mkdir(dirname(path), { recursive: true, mode: 0o700 });
  const lock = path + ".lock";
  await waitForLock(lock);
  const temporary = path + "." + secret() + ".tmp";
  try {
    const raw = await readStored(path);
    const { db, older } = migrate(raw);
    const result = operation(db);
    // Only an action that succeeded writes, so only then is the older file copied, once, before it is replaced.
    if (older && raw) await keepPreMigrationBackup(path, raw);
    if (beforeWrite) await beforeWrite(raw);
    const file = await open(temporary, "wx", 0o600);
    try { await file.writeFile(JSON.stringify(db)); await file.sync(); } finally { await file.close(); }
    await rename(temporary, path);
    return result;
  } finally {
    await rm(temporary, { force: true });
    await rm(lock, { recursive: true });
  }
}
/** Whether a seat's invitation would add a member to a full team. The seat's own member signing in again adds nobody. */
const overCapacity = (db: Database, seat: string, teamId: string, now: number) =>
  seat !== DEV_GUIDE_ID && seatHolder(db, seat) === undefined && placesTaken(db, teamId, now) >= TEAM_CAPACITY;
/** The operator's single-use invitation for a seat (scripts/shuk-invite.ts <seat>): 24 hours. It makes no member by itself; see redeemInvitation.
 * A seat that would add a member to a full team is refused unless `overCap` (the script's --over-cap), which the invitation records. */
export async function issueInvitation(path: string, seat: string, now = Date.now(), overCap = false) {
  if (!SEATS.includes(seat)) throw new AccessError("Unknown participant");
  const token = secret();
  await transact(path, db => {
    if (!overCap && overCapacity(db, seat, DEFAULT_TEAM_ID, now)) throw new AccessError(TEAM_FULL, 409);
    for (const [key, invitation] of Object.entries(db.invitations)) if (invitation.seat === seat || invitation.expiresAt <= now) delete db.invitations[key];
    db.invitations[hash(token)] = { seat, expiresAt: now + DAY, ...(overCap ? { overCap: true as const } : {}) };
  });
  return token;
}
/** The member who holds `seat`, if anyone does. */
const seatHolder = (db: Database, seat: string) => Object.keys(db.participants).find(id => db.participants[id].seat === seat);
/**
 * The operator's host invitation (scripts/shuk-invite.ts host <seat>): single-use, 24 hours, for a player seat in team A.
 * Only while the adventure waits in its lobby, with no host yet or with this seat as host (a host who lost their phone gets a
 * new link; redeeming it moves the host rights to the new session). It replaces the seat's other invitations and any other
 * host invitation.
 */
export async function issueHostInvitation(path: string, seat: string, now = Date.now(), overCap = false) {
  if (!SEATS.includes(seat) || seat === DEV_GUIDE_ID) throw new AccessError("The host must be a player seat");
  const token = secret();
  await transact(path, db => {
    if (db.adventure.status !== "lobby") throw new AccessError("The adventure has already started; start a new adventure first", 409);
    if (db.adventure.hostId !== null && db.participants[db.adventure.hostId]?.seat !== seat) throw new AccessError("This adventure already has a host", 409);
    const holder = seatHolder(db, seat);
    if (holder !== undefined && db.participants[holder].teamId !== DEFAULT_TEAM_ID) throw new AccessError("The host must be a member of team A");
    if (!overCap && overCapacity(db, seat, DEFAULT_TEAM_ID, now)) throw new AccessError(TEAM_FULL, 409);
    for (const [key, invitation] of Object.entries(db.invitations)) {
      if (invitation.seat === seat || invitation.kind === "host" || invitation.expiresAt <= now) delete db.invitations[key];
    }
    db.invitations[hash(token)] = { seat, expiresAt: now + DAY, kind: "host", teamId: DEFAULT_TEAM_ID, ...(overCap ? { overCap: true as const } : {}) };
  });
  return token;
}
export async function redeemInvitation(path: string, token: string, now = Date.now(), replaceSession = "") {
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) throw new AccessError(INVITATION_UNUSABLE, 401);
  const session = secret();
  await transact(path, db => {
    const invitation = db.invitations[hash(token)];
    if (!invitation || invitation.expiresAt <= now) throw new AccessError(INVITATION_UNUSABLE, 401);
    // Fail closed on any kind this version doesn't grant.
    if (invitation.kind !== undefined && invitation.kind !== "host") throw new AccessError(INVITATION_UNUSABLE, 401);
    const teamId = invitation.teamId ?? DEFAULT_TEAM_ID;
    // The guide is never a member, so never a host; and a member joins only a team that exists (fail closed on an edited file).
    if (!Object.hasOwn(db.teams, teamId) || (invitation.kind === "host" && invitation.seat === DEV_GUIDE_ID)) throw new AccessError(INVITATION_UNUSABLE, 401);
    // The seat's member signs in again; a seat nobody holds gets a new member with a random ID. Only this point makes members.
    const existing = invitation.seat === DEV_GUIDE_ID ? DEV_GUIDE_ID : seatHolder(db, invitation.seat);
    if (invitation.kind === "host") {
      // Host rights come only from this invitation, only in the lobby, and only for a lobby with no host or with this seat as host.
      if (db.adventure.status !== "lobby" || (db.adventure.hostId !== null && db.adventure.hostId !== existing)
        || (existing !== undefined && db.participants[existing]?.teamId !== teamId)) {
        throw new AccessError(INVITATION_UNUSABLE, 401);
      }
    }
    // The cap holds here too: places may have filled since the invitation was issued.
    if (existing === undefined && !invitation.overCap && placesTaken(db, teamId, now) >= TEAM_CAPACITY) throw new AccessError(TEAM_FULL, 409);
    const participantId = existing ?? newParticipantId();
    if (existing === undefined) db.participants[participantId] = { teamId, joinedAt: now, seat: invitation.seat };
    if (invitation.kind === "host") {
      db.adventure = { ...db.adventure, hostId: participantId };
      db.teams = { ...db.teams, [teamId]: { ...db.teams[teamId], leaderId: participantId } };
      // One host session at a time: an earlier host or leader session (a lost phone) keeps its sign-in but loses those rights.
      for (const [key, other] of Object.entries(db.sessions)) if (other.host || other.leaderTeamId === teamId) db.sessions[key] = { participantId: other.participantId, expiresAt: other.expiresAt };
    }
    delete db.invitations[hash(token)];
    if (replaceSession) delete db.sessions[hash(replaceSession)];
    // Rights are granted only to the new session made here, never added to one that already exists.
    db.sessions[hash(session)] = { participantId, expiresAt: now + 7 * DAY, ...(invitation.kind === "host" ? { host: true as const, leaderTeamId: teamId } : {}) };
  });
  return session;
}
/** The signed-in participant. A session counts only while its participant is still a member (or is the guide), so removing a
 * member from the registry ends every session they hold, wherever it is. */
function identity(db: Database, token: string, now: number) {
  const credential = db.sessions[hash(token)];
  if (!credential || credential.expiresAt <= now) throw new AccessError("Invitation login required", 401);
  if (credential.participantId !== DEV_GUIDE_ID && !Object.hasOwn(db.participants, credential.participantId)) throw new AccessError("Invitation login required", 401);
  return credential.participantId;
}
/** Whether this session holds the host rights: it came from the host invitation, and its participant is still the adventure's host. */
const isHostSession = (db: Database, token: string) => db.sessions[hash(token)]?.host === true && db.sessions[hash(token)].participantId === db.adventure.hostId;
/** Whether this session leads `teamId`: it was given the leadership, and its participant is still that team's leader. */
const isLeaderSession = (db: Database, token: string, teamId: string) => {
  const session = db.sessions[hash(token)];
  return session?.leaderTeamId === teamId && session.participantId === db.teams[teamId]?.leaderId;
};
/** Whether this browser session is signed in as a member or the guide (a read; no lock). */
export async function isSignedIn(path: string, token: string, now = Date.now()) {
  if (!token) return false;
  try { identity(await load(path), token, now); return true; } catch (error) { if (error instanceof AccessError) return false; throw error; }
}
/**
 * The team's join link (I3b), for its leader's session or the guide. The link is stored hashed, so it is returned only here, once.
 * Without `replace`, it is made only when the team has none: opening Invite players never invalidates anything. With `replace`
 * (an explicit confirmation on the phone), a new link replaces the old one and cancels the requests still waiting; requests already
 * let in keep their place.
 */
export async function createJoinLink(path: string, token: string, replace: boolean, now = Date.now()) {
  const link = secret();
  await transact(path, db => {
    const participantId = identity(db, token, now);
    const teamId = teamIdOf(db, participantId);
    if (participantId !== DEV_GUIDE_ID && !isLeaderSession(db, token, teamId)) throw new AccessError("Only your team's leader or the guide can invite players.");
    const team = withoutExpired(db.teams[teamId], now);
    if (team.joinLink && !replace) throw new AccessError("Your team already has a join link. Replace it to get a new one.", 409);
    const kept = Object.entries(team.joinRequests ?? {}).filter(([, request]) => request.status === "approved");
    db.teams = { ...db.teams, [teamId]: { ...withRequests(team, kept), joinLink: { tokenHash: hash(link), createdAt: now } } };
  });
  return link;
}
export type JoinStatus = { status: "pending" | "approved" | "declined"; code: string; name: string | null };
const statusOf = (request: JoinRequest): JoinStatus => ({ status: request.status, code: request.code, name: request.name ?? null });
/**
 * A device asks to join with a team's link (I3b): no session, no rights; only a pending request the leader or guide decides on.
 * `joinSecret` is the device's `shuk_join` cookie: a device that already has a live request with this link's team gets that
 * request back, whatever its state, so asking again creates nothing (and a declined device can't ask again until it expires).
 * Returns the new secret only when a request was made. `beforeAsk` (the caller's rate limit) runs once the link is known to be
 * live and before the lock, and throws to refuse: a flood never reaches the lock, and unknown links are never counted.
 */
export async function askToJoin(path: string, link: string, name: string | null, joinSecret: string, now = Date.now(), beforeAsk: () => void = () => {}): Promise<JoinStatus & { secret?: string }> {
  if (!isJoinSecret(link)) throw new AccessError(JOIN_LINK_UNUSABLE, 404, JOIN_ERROR.linkUnusable);
  const clean = name === null ? null : cleanDisplayName(name);
  if (name !== null && !clean) throw new AccessError("A name needs 1–40 characters.", 400);
  // Checked without the lock first, so an unknown link or a repeated ask writes nothing.
  const current = await load(path);
  const linkTeam = teamOfLink(current, link);
  if (linkTeam === undefined) throw new AccessError(JOIN_LINK_UNUSABLE, 404, JOIN_ERROR.linkUnusable);
  beforeAsk();
  const mine = isJoinSecret(joinSecret) ? requestOfSecret(current, joinSecret, now) : null;
  if (mine && mine.teamId === linkTeam) return statusOf(mine.request);
  const fresh = secret();
  return transact(path, db => {
    const teamId = teamOfLink(db, link);
    if (teamId === undefined) throw new AccessError(JOIN_LINK_UNUSABLE, 404, JOIN_ERROR.linkUnusable);
    const team = withoutExpired(db.teams[teamId], now);
    const pending = liveRequests(team, now).filter(([, request]) => request.status === "pending").length;
    if (pending >= PENDING_LIMIT) throw new AccessError("Too many people are waiting to join. Try again in a few minutes.", 429);
    if (placesTaken(db, teamId, now) >= TEAM_CAPACITY) throw new AccessError(TEAM_FULL, 409);
    const request: JoinRequest = { code: checkCode(team, now), secretHash: hash(fresh), createdAt: now, expiresAt: now + PENDING_MS, status: "pending", ...(clean ? { name: clean } : {}) };
    db.teams = { ...db.teams, [teamId]: { ...team, joinRequests: { ...team.joinRequests, ["r_" + randomBytes(12).toString("base64url")]: request } } };
    return { ...statusOf(request), secret: fresh };
  });
}
/** The joining device's poll: its request's state, or null when it has none or it expired. A read; no lock. */
export async function joinStatus(path: string, joinSecret: string, now = Date.now()): Promise<JoinStatus | null> {
  if (!isJoinSecret(joinSecret)) return null;
  const found = requestOfSecret(await load(path), joinSecret, now);
  return found ? statusOf(found.request) : null;
}
/**
 * Once let in, the device exchanges its join secret, once, for a new member with a random ID and its own session. The request is
 * deleted in the same write, so a second exchange fails; only the device holding the secret can make it.
 */
export async function exchangeJoin(path: string, joinSecret: string, now = Date.now()) {
  if (!isJoinSecret(joinSecret)) throw new AccessError(JOIN_REQUEST_GONE, 401, JOIN_ERROR.requestGone);
  // Checked without the lock first, so a guessed or replayed secret writes nothing.
  const current = requestOfSecret(await load(path), joinSecret, now);
  if (!current || current.request.status !== "approved") throw current ? new AccessError("Your leader hasn't let you in yet.", 409) : new AccessError(JOIN_REQUEST_GONE, 401, JOIN_ERROR.requestGone);
  const session = secret();
  await transact(path, db => {
    const found = requestOfSecret(db, joinSecret, now);
    if (!found || found.request.status !== "approved") throw new AccessError(JOIN_REQUEST_GONE, 401, JOIN_ERROR.requestGone);
    const { teamId, requestId, request } = found;
    const participantId = newParticipantId();
    db.participants[participantId] = { teamId, joinedAt: now, ...(request.name ? { name: request.name } : {}) };
    const team = db.teams[teamId];
    db.teams = { ...db.teams, [teamId]: withRequests(team, liveRequests(team, now).filter(([id]) => id !== requestId)) };
    db.sessions[hash(session)] = { participantId, expiresAt: now + 7 * DAY };
  });
  return session;
}
function missionView(definition: MissionDefinition, record: MissionRecord): MissionView {
  return { id: definition.id, state: missionState(record.arrival, record.completed),
    arrivalPoints: record.arrival?.points ?? 0, arrivalMethod: record.arrival?.method ?? null,
    gpsEnabled: Boolean(definition.arrival.destination?.verified) };
}
/** Polling reads take no lock and never write, so they cannot block or delay group actions.
 * `missionId` selects the mission whose challenge detail is returned; every mission appears in `missions`.
 * With none named (older clients), it is the well, which was marker 1 before the map was reordered.
 */
export async function sessionView(path: string, token: string, now = Date.now(), missionId: string = GAN_HATUT_MISSION.id) {
  const db = await load(path);
  const participantId = identity(db, token, now);
  const definition = findMission(missionId);
  if (!definition) throw new AccessError("Unknown mission", 400);
  // Everything below is the participant's own team: its roles, progress, members and balance.
  const teamId = teamIdOf(db, participantId);
  const team = db.teams[teamId];
  const record = team.missions[missionId];
  const guide = participantId === DEV_GUIDE_ID;
  const role = roleForParticipant(participantId, team.roles);
  const award = record.performance.award;
  const records = Object.values(team.missions);
  const host = isHostSession(db, token);
  const adventure = { status: db.adventure.status, intendedCount: db.adventure.intendedCount,
    host, leader: isLeaderSession(db, token, teamId), canManage: guide || host };
  return {
    puzzleRevision: WATER_PUZZLE_REVISION,
    adventure,
    missions: SHUK_MISSIONS.map(mission => missionView(mission, team.missions[mission.id])),
    // Names are shown only to signed-in members of the team (this view needs a session), plus the guide.
    participants: rosterParticipants(memberIds(db, teamId).map(id => ({ id, ...db.participants[id] })), db.seatNames ?? {}),
    mission: missionView(definition, record),
    session: { roles: team.roles, completed: record.completed, activeActorId: participantId,
      ...(record.kind === "water" ? { kind: record.kind, cups: record.cups } : { kind: record.kind, selected: record.selected, step: stepOf(record) }),
      ...(record.bonus ? { bonus: { selected: record.bonus.selected, completed: record.bonus.award !== null, points: record.bonus.award?.points ?? 0 } } : {}) },
    performance: { started: record.performance.startedAt !== null, hintsUsed: record.performance.hintsUsed,
      stepHintsUsed: record.performance.hintsUsed - (record.kind === "choice" ? record.stepHintsStart ?? 0 : 0),
      canStart: guide || role !== "follower", reward: award ? { points: award.points, foodTokens: award.foodTokens, hintsUsed: award.hintsUsed } : null },
    // The team's balance covers every one of its missions' recorded rewards.
    sharedBalance: { points: records.reduce((sum, item) => sum + (item.performance.award?.points ?? 0) + (item.arrival?.points ?? 0) + (item.bonus?.award?.points ?? 0), 0),
      foodTokens: records.reduce((sum, item) => sum + (item.performance.award?.foodTokens ?? 0), 0), status: "Provisional local-development rewards" },
    // Membership (I3b) for the team's leader session and the guide only: requests (never their secrets), the space and the leader.
    ...(guide || adventure.leader ? { membership: { capacity: TEAM_CAPACITY, taken: placesTaken(db, teamId, now), leaderId: team.leaderId,
      hasLink: Boolean(team.joinLink), requests: liveRequests(team, now).filter(([, request]) => request.status !== "declined")
        .map(([id, request]) => ({ id, code: request.code, name: request.name ?? null, status: request.status, expiresAt: request.expiresAt })) } } : {}),
    ...(guide ? { guideTiming: { startedAt: record.performance.startedAt, solvedAt: record.performance.solvedAt,
      stoppedElapsedMs: record.performance.solvedAt === null ? null : measuredWaterTime(record.performance, now), paused: record.performance.pausedAt !== null, excluded: record.performance.excluded } } : {}),
  };
}
/** `arrivalPolicy` and `choiceChallenge` override the mission's own settings; tests use them for a verified destination or answer key. */
export async function sessionAction(path: string, token: string, action: GroupAction, actionId: string, now = Date.now(), expectedParticipantId?: string, arrivalPolicy?: ArrivalPolicy, choiceChallenge?: ChoiceChallenge) {
  return transact(path, db => {
    const participantId = identity(db, token, now);
    if (expectedParticipantId !== undefined && expectedParticipantId !== participantId) throw new AccessError("Browser identity changed; reload before syncing actions", 409);
    // Every action reads and writes only the actor's own team; the team is written back once the action succeeds.
    const teamId = teamIdOf(db, participantId);
    const team = { ...db.teams[teamId] };
    if (action.type === "submit" && participantId !== DEV_GUIDE_ID && !["answerSubmitter", "navigatorAndAnswerSubmitter"].includes(roleForParticipant(participantId, team.roles))) throw new AccessError("Only the answer-submitter may submit");
    if (action.type === "confirm-arrival" && participantId !== DEV_GUIDE_ID) throw new AccessError("Only the guide may confirm group arrival");
    if (action.type === "switch-actor") throw new AccessError("Identity comes from the authenticated session");
    if (!/^[A-Za-z0-9-]{16,80}$/.test(actionId)) throw new AccessError("Invalid action ID", 400);
    const applied = db.applied[participantId] ?? [];
    if (applied.includes(actionId)) return "Action already synced.";
    const guide = participantId === DEV_GUIDE_ID;
    const role = roleForParticipant(participantId, team.roles);
    const ids = memberIds(db, teamId);
    let message = "";
    try {
      if (action.type === "set-intended-count" || action.type === "start-adventure") {
        // Lobby powers: the host's and the guide's only. Being host or leader grants nothing else (no guide-only permission).
        if (!guide && !isHostSession(db, token)) throw new Error("Only the host or the guide can set up the adventure.");
        if (db.adventure.status !== "lobby") {
          if (action.type === "set-intended-count") throw new Error("The adventure has already started.");
          message = "The adventure has already started.";
        } else if (action.type === "set-intended-count") {
          if (!Number.isSafeInteger(action.count) || action.count < LOBBY_COUNT.min || action.count > LOBBY_COUNT.max) {
            throw new Error(`Choose a number from ${LOBBY_COUNT.min} to ${LOBBY_COUNT.max}.`);
          }
          // The count only feeds the recommended number of teams; the adventure keeps its one team until teams can be created.
          db.adventure = { ...db.adventure, intendedCount: action.count, format: "together" };
          message = "Got it. Player count saved.";
        } else {
          if (db.adventure.intendedCount === null) throw new Error("First, tell us how many are playing.");
          // A count that needs more than one team can't start until teams can be created (I7a): no one-team stand-in.
          if (recommendedTeamCount(db.adventure.intendedCount) > 1) throw new Error("Your adventure needs multiple teams. For now, adventures can start with up to five players.");
          db.adventure = { ...db.adventure, status: "active" };
          message = "The adventure has started!";
        }
      } else if (action.type === "let-in" || action.type === "decline" || action.type === "remove-member") {
        // Membership (I3b), in the lobby and during the adventure: the session that leads this team, or the guide. Never a seat,
        // a role or a name. Every check runs here, inside the lock, so simultaneous approvals can't overfill the team.
        if (!guide && !isLeaderSession(db, token, teamId)) throw new Error("Only your team's leader or the guide can do that.");
        // Expired requests go; with none left the field is undefined, which the file doesn't keep.
        team.joinRequests = withoutExpired(team, now).joinRequests;
        if (action.type === "remove-member") {
          const target = action.participantId;
          if (target === DEV_GUIDE_ID || !ids.includes(target)) throw new Error("That person isn't in your team.");
          if (target === team.leaderId) throw new Error("The team leader can't be removed.");
          // Deleting the member ends all their sessions (`identity`); their roles free up and their receipts go, so nothing they
          // queued can ever apply.
          delete db.participants[target];
          for (const [key, session] of Object.entries(db.sessions)) if (session.participantId === target) delete db.sessions[key];
          delete db.applied[target];
          team.roles = { navigator: team.roles.navigator === target ? null : team.roles.navigator,
            answerSubmitter: team.roles.answerSubmitter === target ? null : team.roles.answerSubmitter };
          message = "Removed from the team.";
        } else {
          const request = team.joinRequests?.[action.requestId];
          if (!request) throw new Error(JOIN_REQUEST_GONE);
          if (action.type === "decline") {
            if (request.status === "approved") throw new Error("They're already let in.");
            team.joinRequests = { ...team.joinRequests, [action.requestId]: { ...request, status: "declined" } };
            message = "Request declined.";
          } else if (request.status === "approved") {
            message = "They're already let in.";
          } else {
            if (request.status === "declined") throw new Error("This request was declined.");
            if (placesTaken(db, teamId, now) >= TEAM_CAPACITY) throw new Error(TEAM_FULL);
            team.joinRequests = { ...team.joinRequests, [action.requestId]: { ...request, status: "approved", expiresAt: now + APPROVED_MS } };
            message = "Let in. Their phone will join in a moment.";
          }
        }
      } else if (db.adventure.status === "lobby" && !["assign-role", "claim-role", "release-role"].includes(action.type)) {
        // Nothing on the journey counts until the adventure starts; roles may be settled while the group waits.
        throw new Error("The adventure hasn't started yet. Your host will start it soon.");
      } else if (action.type === "assign-role") {
        if (!guide) throw new Error("Only the guide may assign roles.");
        team.roles = setGroupRole(ids, team.roles, action.role, action.participantId);
        message = "Group role updated.";
      } else if (action.type === "claim-role" || action.type === "release-role") {
        // Players choose their own roles: a free role can be taken, your own can be given up. The guide assigns any role.
        if (guide) throw new Error("The guide assigns roles from the guide panel.");
        const label = action.role === "navigator" ? "navigator" : "answer-submitter";
        if (action.type === "claim-role") {
          if (team.roles[action.role] !== null && team.roles[action.role] !== participantId) throw new Error(`Someone else is already the ${label}. They can step down, or ask your guide.`);
          team.roles = claimGroupRole(ids, team.roles, action.role, participantId);
          message = `You're the ${label} now.`;
        } else {
          if (team.roles[action.role] !== participantId) throw new Error(`You aren't the ${label}.`);
          team.roles = releaseGroupRole(ids, team.roles, action.role, participantId);
          message = `You've stepped down. The ${label} role is free for someone else.`;
        }
      } else {
        const definition = findMission(action.missionId);
        if (!definition) throw new Error("Unknown mission");
        const mission = { ...team.missions[action.missionId] };
        if (action.type === "arrival" || action.type === "confirm-arrival") {
          const policy = arrivalPolicy ?? definition.arrival;
          // Rechecking proximity still validates this reading even after the group has its bonus.
          if (action.type === "arrival") {
            const error = checkMissionArrival(action.reading, policy, now);
            if (error) throw new Error(error);
          }
          if (!mission.arrival) {
            if (!Number.isSafeInteger(policy.rewardPoints) || policy.rewardPoints < 0) throw new Error("Arrival reward configuration is unavailable");
            mission.arrival = { method: action.type === "arrival" ? "gps" : "guide", acceptedAt: now, points: policy.rewardPoints };
          }
          message = action.type === "arrival" ? ARRIVAL_NEARBY : "Group arrival confirmed. Arrival bonus recorded.";
        } else if (action.type === "start") {
          if (!guide && role === "follower") throw new Error("Only the navigator, answer-submitter or guide may start");
          if (mission.completed) throw new Error("This challenge is already complete");
          if (mission.performance.startedAt === null) {
            // Existing in-progress puzzles are retained, but their earlier time is unknown. An untimed mission is never measured.
            mission.performance = { ...mission.performance, startedAt: now, clockStartedAt: now,
              excluded: definition.timed === false || !isEmptyProgress(mission),
              solvedAt: mission.kind === "water" && isWaterPuzzleSolved(mission.cups) ? now : null };
          }
        } else if (action.type === "timing") {
          if (!guide) throw new Error("Only the guide may adjust timing");
          if (mission.completed) throw new Error("This challenge is already complete");
          mission.performance = adjustWaterTiming(mission.performance, action.operation, now, participantId);
        } else if (action.type === "hint") {
          // Hints are numbered within the current question; every hint adds to the mission's one shared total.
          const step = stepOf(mission);
          const hintCount = mission.kind === "choice" ? choiceStep(definition, step)?.hintCount ?? 0 : definition.hintCount;
          const used = mission.performance.hintsUsed - (mission.kind === "choice" ? mission.stepHintsStart ?? 0 : 0);
          if (!Number.isInteger(action.hint) || action.hint < 1 || action.hint > hintCount) throw new Error("Invalid hint");
          if (action.step !== undefined && action.step !== step) message = "The group has moved on to the next question.";
          else if (action.hint > used) {
            if (mission.performance.startedAt === null || mission.performance.solvedAt !== null || mission.completed) throw new Error("Hints are available during the challenge");
            if (action.hint !== used + 1) throw new Error("Reveal hints in order");
            mission.performance = { ...mission.performance, hintsUsed: mission.performance.hintsUsed + 1 };
          }
        } else if ("part" in action && action.part === "bonus") {
          // The optional bonus: shared picks like the main challenge, retries allowed, points recorded once. No timing or hints.
          if (!definition.bonus || !mission.bonus) throw new Error("This mission has no bonus question");
          if (!mission.completed) throw new Error("The bonus opens after the main challenge");
          const bonus = { ...mission.bonus };
          if (bonus.award) {
            if (action.type !== "submit") throw new Error("The bonus is already complete");
            message = "The bonus is already complete.";
          } else if (action.type === "toggle-choice") {
            const selected = toggleChoice(definition.bonus.challenge, bonus.selected, action.optionId);
            if (!selected) throw new Error(`Choose up to ${definition.bonus.challenge.required}.`);
            bonus.selected = [...selected];
          } else if (action.type === "reset") {
            bonus.selected = [];
          } else if (action.type === "submit") {
            const result = evaluateChoice(definition.bonus.challenge, bonus.selected);
            if (result === "accepted" && (!Number.isSafeInteger(definition.bonus.points) || definition.bonus.points < 0)) throw new Error("Bonus reward configuration is unavailable");
            if (result === "accepted") bonus.award = { points: definition.bonus.points, awardedAt: now };
            message = result === "accepted" ? "That's right! Bonus complete."
              : result === "incomplete" ? `Choose ${definition.bonus.challenge.required} before submitting.`
              : result === "unverified" ? "This answer can't be checked yet. Ask your guide."
              : "Not quite. Talk it over and try again.";
          } else throw new Error("This action doesn't fit the bonus");
          mission.bonus = bonus;
        } else if (mission.kind === "water") {
          if (action.type === "toggle-choice") throw new Error("This action doesn't fit this mission");
          if ((action.type === "move" || ((action.type === "submit" || action.type === "guide-approve") && !mission.completed)) && mission.performance.startedAt === null) throw new Error("Start the challenge after reading the story");
          const result = applyDevWaterAction({ roles: team.roles, cups: mission.cups, completed: mission.completed, activeActorId: participantId }, action);
          if (action.type === "move" && isWaterPuzzleSolved(result.session.cups) && mission.performance.solvedAt === null) mission.performance = { ...mission.performance, solvedAt: now };
          if (action.type === "reset") mission.performance = { ...mission.performance, solvedAt: null };
          if (result.session.completed && !mission.completed) mission.performance = awardWaterPerformance(mission.performance, now, definition.rewards);
          mission.cups = result.session.cups;
          mission.completed = result.session.completed;
          message = result.message;
        } else {
          const step = stepOf(mission);
          const challenge = (step === 0 ? choiceChallenge : undefined) ?? choiceStep(definition, step)?.challenge;
          if (!challenge) throw new Error("This challenge is unavailable");
          if (action.type === "move") throw new Error("This action doesn't fit this mission");
          if (action.type === "guide-approve" && !guide) throw new Error("Only the guide may approve a task.");
          if (mission.completed) {
            if (action.type === "toggle-choice" || action.type === "reset") throw new Error("This challenge is already complete");
            message = "This task is already complete.";
          } else if (mission.performance.startedAt === null) {
            throw new Error("Start the challenge after reading the story");
          } else if (action.type === "toggle-choice") {
            const selected = toggleChoice(challenge, mission.selected, action.optionId);
            if (!selected) throw new Error(`Choose up to ${challenge.required}.`);
            mission.selected = [...selected];
          } else if (action.type === "reset") {
            mission.selected = [];
            message = "Choices cleared.";
          } else {
            // Submit and guide approval both check the group's shared picks; neither can bypass the key.
            const result = evaluateChoice(challenge, mission.selected);
            const next = result === "accepted" ? choiceStep(definition, step + 1) : null;
            if (next) {
              // A follow-up question opens with no picks; the clock keeps running and only the last answer is the solution.
              mission.step = step + 1; mission.stepHintsStart = mission.performance.hintsUsed; mission.selected = [];
            } else if (result === "accepted") {
              mission.completed = true;
              mission.performance = awardWaterPerformance({ ...mission.performance, solvedAt: mission.performance.solvedAt ?? now }, now, definition.rewards);
            }
            message = next ? "That's right! On to the next question."
              : result === "accepted" ? "The group's answer is correct. Task complete."
              : result === "incomplete" ? `Choose ${challenge.required} before submitting.`
              : result === "unverified" ? "This answer can't be checked yet: the answer key still needs a field check. Ask your guide."
              : "Not quite. Look again and talk it over.";
          }
        }
        team.missions = { ...team.missions, [action.missionId]: mission };
      }
    } catch (error) { throw new AccessError(error instanceof Error ? error.message : "Action rejected"); }
    db.teams = { ...db.teams, [teamId]: team };
    db.applied[participantId] = [...applied, actionId];
    return message;
  });
}
/**
 * Operator only (scripts/shuk-new-adventure.ts --confirm, on the server): keeps the current file's exact bytes as
 * `<state>.before-new-adventure-<UTC time>`, mode 600, then opens a fresh adventure in its lobby with no host.
 * The registry is emptied (members come back by redeeming new invitations); sessions, invitations, roles and progress are cleared.
 * The seats' display names stay (they belong to the seats and the server, never git), and so do action receipts, which keep
 * stale queued actions from replaying.
 * If the copy can't be kept, nothing changes. Returns the copy's file name, or null when there was no file to keep.
 */
export async function startNewAdventure(path: string, now = Date.now()) {
  const backup = `${path}.before-new-adventure-${new Date(now).toISOString().replace(/[-:]|\.\d{3}/g, "")}`;
  let kept: string | null = null;
  await transact(path, db => {
    const fresh = initial();
    Object.assign(db, { ...fresh, adventure: { status: "lobby", format: "together", hostId: null, intendedCount: null },
      applied: db.applied, ...(db.seatNames ? { seatNames: db.seatNames } : {}) });
  }, async raw => {
    if (!raw) return;
    try { await keepExactCopy(path, backup, raw); kept = basename(backup); } catch (error) {
      console.error("Shuk storage: the new-adventure backup could not be kept:", (error as NodeJS.ErrnoException).code ?? (error as Error).message);
      throw new AccessError("Storage unavailable: the backup could not be kept. Nothing was changed.", 503);
    }
  });
  return kept;
}
/** Admin only (scripts/shuk-name.ts, run on the server): sets or clears a display name, for a seat (player-1…7, guide; kept
 * across adventures) or for a member by their ID. A name is a label only: it grants nothing. */
export async function setParticipantName(path: string, id: string, name: string | null) {
  return transact(path, db => {
    if (SEATS.includes(id)) {
      db.seatNames = setDisplayName(db.seatNames ?? {}, id, name);
      return db.seatNames[id] ?? null;
    }
    if (!Object.hasOwn(db.participants, id)) throw new Error("Unknown participant");
    const member = db.participants[id];
    const clean = name === null ? null : cleanDisplayName(name);
    if (name !== null && !clean) throw new Error("A name needs 1–40 characters");
    const updated: ParticipantRecord = { ...member };
    if (clean) updated.name = clean; else delete updated.name;
    db.participants[id] = updated;
    return clean;
  });
}
export async function logout(path: string, token: string) {
  await transact(path, db => { delete db.sessions[hash(token)]; });
}
