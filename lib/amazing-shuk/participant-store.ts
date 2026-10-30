import { ARRIVAL_NEARBY, GAN_HATUT_MISSION, checkMissionArrival, choiceStep, missionState, type ArrivalPolicy, type MissionArrival, type MissionDefinition, type MissionView } from "./mission-arrival.ts";
import { findMission, SHUK_MISSIONS } from "./missions.ts";
import type { GroupAction } from "./group-action.ts";
import { evaluateChoice, isValidChoiceSelection, toggleChoice, type ChoiceChallenge } from "./choice-task.ts";
import { createWaterPerformance, adjustWaterTiming, awardWaterPerformance, measuredWaterTime, type WaterPerformance } from "./water-performance.ts";
import { createHash, randomBytes } from "node:crypto";
import { link, mkdir, readFile, open, rename, rm, stat } from "node:fs/promises";
import { EMPTY_WATER_CUPS, WATER_PUZZLE_REVISION, WATER_TASK_ID, isValidCups, isWaterPuzzleSolved, type WaterCups } from "./water-measurement.ts";
import { groupParticipants, isValidNames, setDisplayName, type ParticipantNames } from "./participant-names.ts";
import { claimGroupRole, releaseGroupRole, roleForParticipant, setGroupRole, type GroupRoleAssignments } from "./roles.ts";
import { basename, dirname, resolve } from "node:path";
import { LOBBY_COUNT, recommendedTeamCount } from "./adventure-lobby.ts";
import { applyDevWaterAction, createDevWaterSession, DEV_GUIDE_ID, DEV_PARTICIPANTS, type DevWaterSession } from "./dev-water-session.ts";

export const SESSION_COOKIE = "shuk_session";
const DAY = 86_400_000;
type Credential = { participantId: string; expiresAt: number };
/** A session. `host` marks the one session made by redeeming the host invitation: host rights belong to that session, never to
 * the seat, so another session of the same seat (earlier, later or replaced) has none. Older sessions have no flag. */
type Session = Credential & { host?: true };
/** An invitation is a credential that may carry a kind and a team: a host invitation makes its seat the adventure's host and its
 * team's leader. "leader" is reserved for the team leaders' invitations (I7a); nothing issues one yet, and redeeming one is refused.
 * Older invitations have neither field and sign a participant in as before. */
type Invitation = Credential & { kind?: "host" | "leader"; teamId?: string };
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
type Schema5Database = { version: 5; invitations: Record<string, Invitation>; sessions: Record<string, Session>; roles: GroupRoleAssignments; missions: Record<string, MissionRecord>; applied: Record<string, string[]>; names?: ParticipantNames };
/** The team every existing group becomes, and the one the guide acts on until the guide can choose a team. */
export const DEFAULT_TEAM_ID = "A";
/** One team's shared play: its leader (none until a host joins), its roles, and its missions' progress and rewards. */
type TeamRecord = { leaderId: string | null; roles: GroupRoleAssignments; missions: Record<string, MissionRecord> };
/** The adventure around the teams. `intendedCount` is the host's answer to "how many are playing?"; null when never asked.
 * `format` is stored for the I1 app, which reads only "together" or "twoTeams": while there is one team it stays "together".
 * A team count replaces it when multiple teams arrive (I7a, schema 7). */
type AdventureRecord = { status: "lobby" | "active"; format: "together" | "twoTeams"; hostId: string | null; intendedCount: number | null };
/** Schema 6: an adventure of teams (any number of team IDs; one, "A", until I7a). Players belong to one team; the guide oversees every team and is in none. */
type Database = { version: 6; adventure: AdventureRecord; teams: Record<string, TeamRecord>; participants: Record<string, { teamId: string }>;
  invitations: Record<string, Invitation>; sessions: Record<string, Session>; applied: Record<string, string[]>; names?: ParticipantNames };
/** Shown on the welcome screen for any invitation that can't sign in: the same words whatever the reason. TODO(copy): draft (O16). */
export const INVITATION_UNUSABLE = "This invitation link has expired or has already been used. Ask your guide for a new one.";
export class AccessError extends Error {
  status: number;
  constructor(message: string, status = 403) { super(message); this.status = status; }
}
const hash = (token: string) => createHash("sha256").update(token).digest("hex");
const secret = () => randomBytes(32).toString("base64url");
function emptyMission(definition: MissionDefinition): MissionRecord {
  const base = { completed: false, arrival: null, performance: createWaterPerformance(), ...(definition.bonus ? { bonus: EMPTY_BONUS } : {}) };
  return definition.challenge.kind === "water" ? { ...base, kind: "water", cups: EMPTY_WATER_CUPS } : { ...base, kind: "choice", selected: [] };
}
const isEmptyProgress = (record: MissionRecord) => record.kind === "water" ? record.cups.small + record.cups.large + record.cups.jar === 0 : record.selected.length === 0;
/** The single group becomes team A of an adventure that is already under way, played together, with no host yet. */
function toSchema6({ roles, missions, ...rest }: Schema5Database): Database {
  return { ...rest, version: 6, adventure: { status: "active", format: "together", hostId: null, intendedCount: null },
    teams: { [DEFAULT_TEAM_ID]: { leaderId: null, roles, missions } },
    participants: Object.fromEntries(DEV_PARTICIPANTS.map(participant => [participant.id, { teamId: DEFAULT_TEAM_ID }])) };
}
function initial(): Database {
  return toSchema6({ version: 5, invitations: {}, sessions: {}, roles: createDevWaterSession().roles, missions: {}, applied: {} });
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
/** Parses stored bytes and migrates them in memory to schema 6. `preSchema6`: a file exists and was stored in an older schema. */
function migrate(raw: Buffer | null): { db: Database; preSchema6: boolean } {
  let stored = (raw === null ? initial() : JSON.parse(raw.toString("utf8"))) as LegacyDatabase | Schema5Database | Database;
  // Only versions 1 to 6 get past the checks below, so any stored version other than 6 is older.
  const preSchema6 = raw !== null && stored.version !== 6;
  if (stored.version !== 5 && stored.version !== 6) {
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
  const db = stored as Database;
  if (!isValidAdventure(db.adventure) || !db.teams || !db.teams[DEFAULT_TEAM_ID] || !db.participants || (db.names !== undefined && !isValidNames(db.names))) throw new Error("Unsupported Shuk storage state");
  if (!Object.values(db.participants).every(member => Boolean(member) && Object.hasOwn(db.teams, member.teamId))) throw new Error("Unsupported Shuk storage state");
  const teams: Record<string, TeamRecord> = {};
  for (const [teamId, team] of Object.entries(db.teams)) {
    const members = memberIds(db, teamId);
    if (!team || !team.roles || !team.missions || (team.leaderId !== null && !members.includes(team.leaderId))
      || [team.roles.navigator, team.roles.answerSubmitter].some(id => id !== null && !members.includes(id))) throw new Error("Unsupported Shuk storage state");
    teams[teamId] = { ...team, missions: catalogueMissions(team.missions) };
  }
  db.teams = teams;
  return { db, preSchema6 };
}

/**
 * Before the first schema-6 write, keeps the file's exact older bytes beside it: a rollback to the previous app restores this copy.
 * The name carries the bytes' hash, so a later migration (after a restore) gets its own copy, and a copy is never overwritten:
 * it is written whole to a temporary file and linked into place, which fails if the name exists, and its directory entry reaches
 * the disk before the state file is replaced. It runs under the write lock, and any failure stops the write, leaving the older
 * file as it was (fail closed: queued actions retry until an operator clears the cause the log names).
 */
async function keepPreSchema6Backup(path: string, raw: Buffer): Promise<void> {
  try { await keepExactCopy(path, `${path}.pre-schema6-${createHash("sha256").update(raw).digest("hex").slice(0, 12)}`, raw); } catch (error) {
    // No paths or contents: the code or reason says whether the disk is full, permissions are wrong or the name is taken.
    console.error("Shuk storage: the pre-schema-6 backup could not be kept:", (error as NodeJS.ErrnoException).code ?? (error as Error).message);
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
 * than STALE_LOCK_MS is a live writer: the caller gets "busy" and its queued action retries. Security review, 25 Oct 2026.
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

/** A filesystem lock serializes CLI and HTTP writers. Atomic rename publishes whole snapshots.
 * `beforeWrite` runs under the lock after the operation succeeded and before the file is replaced; if it throws, nothing is written. */
export async function transact<T>(path: string, operation: (db: Database) => T, beforeWrite?: (raw: Buffer | null) => Promise<void>): Promise<T> {
  await mkdir(dirname(path), { recursive: true, mode: 0o700 });
  const lock = path + ".lock";
  await acquireLock(lock, Date.now());
  const temporary = path + "." + secret() + ".tmp";
  try {
    const raw = await readStored(path);
    const { db, preSchema6 } = migrate(raw);
    const result = operation(db);
    // Only an action that succeeded writes, so only then is the older file copied, once, before it is replaced.
    if (preSchema6 && raw) await keepPreSchema6Backup(path, raw);
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
export async function issueInvitation(path: string, participantId: string, now = Date.now()) {
  if (participantId !== DEV_GUIDE_ID && !DEV_PARTICIPANTS.some(p => p.id === participantId)) throw new AccessError("Unknown participant");
  const token = secret();
  await transact(path, db => {
    for (const [key, invitation] of Object.entries(db.invitations)) if (invitation.participantId === participantId || invitation.expiresAt <= now) delete db.invitations[key];
    db.invitations[hash(token)] = { participantId, expiresAt: now + DAY };
  });
  return token;
}
/**
 * The operator's host invitation (scripts/shuk-invite.ts host <seat>): single-use, 24 hours, for a player seat in team A.
 * Only while the adventure waits in its lobby, with no host yet or with this seat as host (a host who lost their phone gets a
 * new link; redeeming it moves the host rights to the new session). It replaces the seat's other invitations and any other
 * host invitation.
 */
export async function issueHostInvitation(path: string, participantId: string, now = Date.now()) {
  if (!DEV_PARTICIPANTS.some(p => p.id === participantId)) throw new AccessError("The host must be a player seat");
  const token = secret();
  await transact(path, db => {
    if (db.adventure.status !== "lobby") throw new AccessError("The adventure has already started; start a new adventure first", 409);
    if (db.adventure.hostId !== null && db.adventure.hostId !== participantId) throw new AccessError("This adventure already has a host", 409);
    if (db.participants[participantId]?.teamId !== DEFAULT_TEAM_ID) throw new AccessError("The host must be a member of team A");
    for (const [key, invitation] of Object.entries(db.invitations)) {
      if (invitation.participantId === participantId || invitation.kind === "host" || invitation.expiresAt <= now) delete db.invitations[key];
    }
    db.invitations[hash(token)] = { participantId, expiresAt: now + DAY, kind: "host", teamId: DEFAULT_TEAM_ID };
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
    if (invitation.kind === "host") {
      // Host rights come only from this invitation, only in the lobby, and only for a lobby with no host or with this seat as host.
      const teamId = invitation.teamId ?? DEFAULT_TEAM_ID;
      if (db.adventure.status !== "lobby" || (db.adventure.hostId !== null && db.adventure.hostId !== invitation.participantId)
        || db.participants[invitation.participantId]?.teamId !== teamId || !db.teams[teamId]) {
        throw new AccessError(INVITATION_UNUSABLE, 401);
      }
      db.adventure = { ...db.adventure, hostId: invitation.participantId };
      db.teams = { ...db.teams, [teamId]: { ...db.teams[teamId], leaderId: invitation.participantId } };
      // One host session at a time: an earlier host session (a lost phone) keeps its sign-in but loses the host rights.
      for (const [key, existing] of Object.entries(db.sessions)) if (existing.host) db.sessions[key] = { participantId: existing.participantId, expiresAt: existing.expiresAt };
    }
    delete db.invitations[hash(token)];
    if (replaceSession) delete db.sessions[hash(replaceSession)];
    db.sessions[hash(session)] = { participantId: invitation.participantId, expiresAt: now + 7 * DAY, ...(invitation.kind === "host" ? { host: true as const } : {}) };
  });
  return session;
}
function identity(db: Database, token: string, now: number) {
  const credential = db.sessions[hash(token)];
  if (!credential || credential.expiresAt <= now) throw new AccessError("Invitation login required", 401);
  return credential.participantId;
}
/** Whether this session holds the host rights: it came from the host invitation, and its seat is still the adventure's host. */
const isHostSession = (db: Database, token: string) => db.sessions[hash(token)]?.host === true && db.sessions[hash(token)].participantId === db.adventure.hostId;
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
    host, leader: participantId === team.leaderId, canManage: guide || host };
  return {
    puzzleRevision: WATER_PUZZLE_REVISION,
    adventure,
    missions: SHUK_MISSIONS.map(mission => missionView(mission, team.missions[mission.id])),
    // Names are shown only to signed-in members of the team (this view needs a session), plus the guide.
    participants: groupParticipants(db.names ?? {}, team.roles).filter(participant => participant.id === DEV_GUIDE_ID || db.participants[participant.id]?.teamId === teamId),
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
 * Development and testing only (scripts/shuk-new-adventure.ts): keeps the current file's exact bytes as
 * `<state>.before-new-adventure-<UTC time>`, mode 600, then opens a fresh adventure in its lobby with no host.
 * Every seat is in team A again; sessions, invitations, roles and progress are cleared. Display names stay (they belong to
 * the seats and the server, never git), and so do action receipts, which keep stale queued actions from replaying.
 * If the copy can't be kept, nothing changes. Returns the copy's file name, or null when there was no file to keep.
 */
export async function startNewAdventure(path: string, now = Date.now()) {
  const backup = `${path}.before-new-adventure-${new Date(now).toISOString().replace(/[-:]|\.\d{3}/g, "")}`;
  let kept: string | null = null;
  await transact(path, db => {
    const fresh = initial();
    Object.assign(db, { ...fresh, adventure: { status: "lobby", format: "together", hostId: null, intendedCount: null },
      teams: { [DEFAULT_TEAM_ID]: { ...fresh.teams[DEFAULT_TEAM_ID], roles: { navigator: null, answerSubmitter: null } } },
      applied: db.applied, ...(db.names ? { names: db.names } : {}) });
  }, async raw => {
    if (!raw) return;
    try { await keepExactCopy(path, backup, raw); kept = basename(backup); } catch (error) {
      console.error("Shuk storage: the new-adventure backup could not be kept:", (error as NodeJS.ErrnoException).code ?? (error as Error).message);
      throw new AccessError("Storage unavailable: the backup could not be kept. Nothing was changed.", 503);
    }
  });
  return kept;
}
/** Admin only (scripts/shuk-name.ts, run on the server): sets or clears a participant's display name. */
export async function setParticipantName(path: string, participantId: string, name: string | null) {
  return transact(path, db => {
    db.names = setDisplayName(db.names ?? {}, participantId, name);
    return db.names[participantId] ?? null;
  });
}
export async function logout(path: string, token: string) {
  await transact(path, db => { delete db.sessions[hash(token)]; });
}
