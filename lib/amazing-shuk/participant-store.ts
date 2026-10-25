import { ARRIVAL_NEARBY, checkMissionArrival, choiceStep, missionState, type ArrivalPolicy, type MissionArrival, type MissionDefinition, type MissionView } from "./mission-arrival.ts";
import { findMission, SHUK_MISSIONS } from "./missions.ts";
import type { GroupAction } from "./group-action.ts";
import { evaluateChoice, isValidChoiceSelection, toggleChoice, type ChoiceChallenge } from "./choice-task.ts";
import { createWaterPerformance, adjustWaterTiming, awardWaterPerformance, measuredWaterTime, type WaterPerformance } from "./water-performance.ts";
import { createHash, randomBytes } from "node:crypto";
import { mkdir, readFile, open, rename, rm } from "node:fs/promises";
import { EMPTY_WATER_CUPS, WATER_PUZZLE_REVISION, WATER_TASK_ID, isValidCups, isWaterPuzzleSolved, type WaterCups } from "./water-measurement.ts";
import { groupParticipants, isValidNames, setDisplayName, type ParticipantNames } from "./participant-names.ts";
import { claimGroupRole, releaseGroupRole, roleForParticipant, setGroupRole, type GroupRoleAssignments } from "./roles.ts";
import { dirname, resolve } from "node:path";
import { applyDevWaterAction, createDevWaterSession, DEV_GUIDE_ID, DEV_PARTICIPANTS, type DevWaterSession } from "./dev-water-session.ts";

export const SESSION_COOKIE = "shuk_session";
const DAY = 86_400_000;
type Credential = { participantId: string; expiresAt: number };
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
type Database = { version: 5; invitations: Record<string, Credential>; sessions: Record<string, Credential>; roles: GroupRoleAssignments; missions: Record<string, MissionRecord>; applied: Record<string, string[]>; names?: ParticipantNames };
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
function initial(): Database {
  return { version: 5, invitations: {}, sessions: {}, roles: createDevWaterSession().roles, missions: {}, applied: {} };
}
function isValidMission(record: MissionRecord): boolean {
  if (!record || !(record.arrival === null || (Boolean(record.arrival) && Number.isSafeInteger(record.arrival.points) && record.arrival.points >= 0))) return false;
  if (record.bonus !== undefined && !(record.bonus && Array.isArray(record.bonus.selected) && record.bonus.selected.every(id => typeof id === "string")
    && (record.bonus.award === null || (Boolean(record.bonus.award) && Number.isSafeInteger(record.bonus.award.points) && record.bonus.award.points >= 0)))) return false;
  return record.kind === "water" ? isValidCups(record.cups) : Array.isArray(record.selected) && record.selected.every(id => typeof id === "string")
    && [record.step, record.stepHintsStart].every(n => n === undefined || (Number.isSafeInteger(n) && n >= 0));
}
const stepOf = (record: MissionRecord) => record.kind === "choice" ? record.step ?? 0 : 0;
export const defaultStorePath = () => resolve(process.env.SHUK_DATA_FILE ?? ".local/amazing-shuk/state.json");

/** Reads the latest published snapshot and migrates it in memory; writers persist the migration. */
async function load(path: string): Promise<Database> {
  let stored: LegacyDatabase | Database;
  try { stored = JSON.parse(await readFile(path, "utf8")) as LegacyDatabase | Database; }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; stored = initial(); }
  if (stored.version !== 5) {
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
  const db = stored as Database;
  if (!db.roles || !db.missions || (db.names !== undefined && !isValidNames(db.names))) throw new Error("Unsupported Shuk storage state");
  // The first schema-5 records had no kind; they were all the well.
  for (const [id, record] of Object.entries(db.missions)) if (record && !("kind" in record)) db.missions = { ...db.missions, [id]: { ...(record as object), kind: "water" } as MissionRecord };
  if (!Object.values(db.missions).every(isValidMission)) throw new Error("Unsupported Shuk storage state");
  // A mission added to the catalogue starts empty. Records of missions no longer listed are kept, with their rewards.
  for (const mission of SHUK_MISSIONS) {
    const record = db.missions[mission.id];
    if (!record) db.missions = { ...db.missions, [mission.id]: emptyMission(mission) };
    else if (record.kind !== mission.challenge.kind || (record.kind === "choice" && !isValidChoiceSelection(choiceStep(mission, stepOf(record))?.challenge ?? mission.challenge as ChoiceChallenge, record.selected))
      || (record.kind === "choice" && !choiceStep(mission, stepOf(record)))) throw new Error("Unsupported Shuk storage state");
    // A bonus added to an existing mission starts empty; the main record is kept as it is.
    else if (mission.bonus && !record.bonus) db.missions = { ...db.missions, [mission.id]: { ...record, bonus: EMPTY_BONUS } };
    else if (mission.bonus && record.bonus && !isValidChoiceSelection(mission.bonus.challenge, record.bonus.selected)) throw new Error("Unsupported Shuk storage state");
  }
  return db;
}

/** A filesystem lock serializes CLI and HTTP writers. Atomic rename publishes whole snapshots.
 * A crashed writer leaves a lock: recover manually with the server stopped, never steal a live lock.
 */
export async function transact<T>(path: string, operation: (db: Database) => T): Promise<T> {
  await mkdir(dirname(path), { recursive: true, mode: 0o700 });
  const lock = path + ".lock";
  try { await mkdir(lock); } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "EEXIST") throw new AccessError("Storage busy; retry the same action.", 503);
    throw error;
  }
  const temporary = path + "." + secret() + ".tmp";
  try {
    const db = await load(path);
    const result = operation(db);
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
export async function redeemInvitation(path: string, token: string, now = Date.now(), replaceSession = "") {
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) throw new AccessError("Invalid or expired invitation", 401);
  const session = secret();
  await transact(path, db => {
    const invitation = db.invitations[hash(token)];
    if (!invitation || invitation.expiresAt <= now) throw new AccessError("Invalid or expired invitation", 401);
    delete db.invitations[hash(token)];
    if (replaceSession) delete db.sessions[hash(replaceSession)];
    db.sessions[hash(session)] = { participantId: invitation.participantId, expiresAt: now + 7 * DAY };
  });
  return session;
}
function identity(db: Database, token: string, now: number) {
  const credential = db.sessions[hash(token)];
  if (!credential || credential.expiresAt <= now) throw new AccessError("Invitation login required", 401);
  return credential.participantId;
}
function missionView(definition: MissionDefinition, record: MissionRecord): MissionView {
  return { id: definition.id, state: missionState(record.arrival, record.completed),
    arrivalPoints: record.arrival?.points ?? 0, arrivalMethod: record.arrival?.method ?? null,
    gpsEnabled: Boolean(definition.arrival.destination?.verified) };
}
/** Polling reads take no lock and never write, so they cannot block or delay group actions.
 * `missionId` selects the mission whose challenge detail is returned; every mission appears in `missions`.
 */
export async function sessionView(path: string, token: string, now = Date.now(), missionId = SHUK_MISSIONS[0].id) {
  const db = await load(path);
  const participantId = identity(db, token, now);
  const definition = findMission(missionId);
  if (!definition) throw new AccessError("Unknown mission", 400);
  const record = db.missions[missionId];
  const guide = participantId === DEV_GUIDE_ID;
  const role = roleForParticipant(participantId, db.roles);
  const award = record.performance.award;
  const records = Object.values(db.missions);
  return {
    puzzleRevision: WATER_PUZZLE_REVISION,
    missions: SHUK_MISSIONS.map(mission => missionView(mission, db.missions[mission.id])),
    // Names are shown only to signed-in members of the group (this view needs a session).
    participants: groupParticipants(db.names ?? {}, db.roles),
    mission: missionView(definition, record),
    session: { roles: db.roles, completed: record.completed, activeActorId: participantId,
      ...(record.kind === "water" ? { kind: record.kind, cups: record.cups } : { kind: record.kind, selected: record.selected, step: stepOf(record) }),
      ...(record.bonus ? { bonus: { selected: record.bonus.selected, completed: record.bonus.award !== null, points: record.bonus.award?.points ?? 0 } } : {}) },
    performance: { started: record.performance.startedAt !== null, hintsUsed: record.performance.hintsUsed,
      stepHintsUsed: record.performance.hintsUsed - (record.kind === "choice" ? record.stepHintsStart ?? 0 : 0),
      canStart: guide || role !== "follower", reward: award ? { points: award.points, foodTokens: award.foodTokens, hintsUsed: award.hintsUsed } : null },
    // The group's balance covers every mission's recorded rewards.
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
    if (action.type === "submit" && participantId !== DEV_GUIDE_ID && !["answerSubmitter", "navigatorAndAnswerSubmitter"].includes(roleForParticipant(participantId, db.roles))) throw new AccessError("Only the answer-submitter may submit");
    if (action.type === "confirm-arrival" && participantId !== DEV_GUIDE_ID) throw new AccessError("Only the guide may confirm group arrival");
    if (action.type === "switch-actor") throw new AccessError("Identity comes from the authenticated session");
    if (!/^[A-Za-z0-9-]{16,80}$/.test(actionId)) throw new AccessError("Invalid action ID", 400);
    const applied = db.applied[participantId] ?? [];
    if (applied.includes(actionId)) return "Action already synced.";
    const guide = participantId === DEV_GUIDE_ID;
    const role = roleForParticipant(participantId, db.roles);
    let message = "";
    try {
      if (action.type === "assign-role") {
        if (!guide) throw new Error("Only the guide may assign roles.");
        db.roles = setGroupRole(DEV_PARTICIPANTS.map(participant => participant.id), db.roles, action.role, action.participantId);
        message = "Group role updated.";
      } else if (action.type === "claim-role" || action.type === "release-role") {
        // Players choose their own roles: a free role can be taken, your own can be given up. The guide assigns any role.
        if (guide) throw new Error("The guide assigns roles from the guide panel.");
        const ids = DEV_PARTICIPANTS.map(participant => participant.id);
        const label = action.role === "navigator" ? "navigator" : "answer-submitter";
        if (action.type === "claim-role") {
          if (db.roles[action.role] !== null && db.roles[action.role] !== participantId) throw new Error(`Someone else is already the ${label}. They can step down, or ask your guide.`);
          db.roles = claimGroupRole(ids, db.roles, action.role, participantId);
          message = `You're the ${label} now.`;
        } else {
          if (db.roles[action.role] !== participantId) throw new Error(`You aren't the ${label}.`);
          db.roles = releaseGroupRole(ids, db.roles, action.role, participantId);
          message = `You've stepped down. The ${label} role is free for someone else.`;
        }
      } else {
        const definition = findMission(action.missionId);
        if (!definition) throw new Error("Unknown mission");
        const mission = { ...db.missions[action.missionId] };
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
          const result = applyDevWaterAction({ roles: db.roles, cups: mission.cups, completed: mission.completed, activeActorId: participantId }, action);
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
        db.missions = { ...db.missions, [action.missionId]: mission };
      }
    } catch (error) { throw new AccessError(error instanceof Error ? error.message : "Action rejected"); }
    db.applied[participantId] = [...applied, actionId];
    return message;
  });
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
