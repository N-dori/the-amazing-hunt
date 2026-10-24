import { checkMissionArrival, missionState, type ArrivalPolicy, type MissionArrival, type MissionDefinition, type MissionView } from "./mission-arrival.ts";
import { findMission, SHUK_MISSIONS } from "./missions.ts";
import type { GroupAction } from "./group-action.ts";
import { createWaterPerformance, adjustWaterTiming, awardWaterPerformance, measuredWaterTime, type WaterPerformance } from "./water-performance.ts";
import { createHash, randomBytes } from "node:crypto";
import { mkdir, readFile, open, rename, rm } from "node:fs/promises";
import { EMPTY_WATER_CUPS, WATER_PUZZLE_REVISION, WATER_TASK_ID, isValidCups, isWaterPuzzleSolved, type WaterCups } from "./water-measurement.ts";
import { roleForParticipant, setGroupRole, type GroupRoleAssignments } from "./roles.ts";
import { dirname, resolve } from "node:path";
import { applyDevWaterAction, createDevWaterSession, DEV_GUIDE_ID, DEV_PARTICIPANTS, type DevWaterSession } from "./dev-water-session.ts";

export const SESSION_COOKIE = "shuk_session";
const DAY = 86_400_000;
type Credential = { participantId: string; expiresAt: number };
/** One mission's shared progress. Its award and arrival bonus are immutable once recorded. */
type MissionRecord = { cups: WaterCups; completed: boolean; arrival: MissionArrival | null; performance: WaterPerformance };
/** Schema 4 and earlier held a single mission: the well. */
type LegacyDatabase = { version: number; arrival: MissionArrival | null; performance: WaterPerformance; invitations: Record<string, Credential>; sessions: Record<string, Credential>; group: Omit<DevWaterSession, "activeActorId">; applied: Record<string, string[]> };
type Database = { version: 5; invitations: Record<string, Credential>; sessions: Record<string, Credential>; roles: GroupRoleAssignments; missions: Record<string, MissionRecord>; applied: Record<string, string[]> };
export class AccessError extends Error {
  status: number;
  constructor(message: string, status = 403) { super(message); this.status = status; }
}
const hash = (token: string) => createHash("sha256").update(token).digest("hex");
const secret = () => randomBytes(32).toString("base64url");
const emptyMission = (): MissionRecord => ({ cups: EMPTY_WATER_CUPS, completed: false, arrival: null, performance: createWaterPerformance() });
function initial(): Database {
  return { version: 5, invitations: {}, sessions: {}, roles: createDevWaterSession().roles, missions: {}, applied: {} };
}
function isValidMission(record: MissionRecord): boolean {
  return Boolean(record) && (record.arrival === null || (Boolean(record.arrival) && Number.isSafeInteger(record.arrival.points) && record.arrival.points >= 0)) && isValidCups(record.cups);
}
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
    stored = { ...rest, version: 5, roles: group.roles, missions: { [WATER_TASK_ID]: { cups: group.cups, completed: group.completed, arrival, performance } } };
  }
  const db = stored as Database;
  if (!db.roles || !db.missions || !Object.values(db.missions).every(isValidMission)) throw new Error("Unsupported Shuk storage state");
  // A mission added to the catalogue starts empty. Records of missions no longer listed are kept, with their rewards.
  for (const mission of SHUK_MISSIONS) if (!db.missions[mission.id]) db.missions = { ...db.missions, [mission.id]: emptyMission() };
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
    mission: missionView(definition, record),
    session: { roles: db.roles, cups: record.cups, completed: record.completed, activeActorId: participantId },
    performance: { started: record.performance.startedAt !== null, hintsUsed: record.performance.hintsUsed,
      canStart: guide || role !== "follower", reward: award ? { points: award.points, foodTokens: award.foodTokens, hintsUsed: award.hintsUsed } : null },
    // The group's balance covers every mission's recorded rewards.
    sharedBalance: { points: records.reduce((sum, item) => sum + (item.performance.award?.points ?? 0) + (item.arrival?.points ?? 0), 0),
      foodTokens: records.reduce((sum, item) => sum + (item.performance.award?.foodTokens ?? 0), 0), status: "Provisional local-development rewards" },
    ...(guide ? { guideTiming: { startedAt: record.performance.startedAt, solvedAt: record.performance.solvedAt,
      stoppedElapsedMs: record.performance.solvedAt === null ? null : measuredWaterTime(record.performance, now), paused: record.performance.pausedAt !== null, excluded: record.performance.excluded } } : {}),
  };
}
/** `arrivalPolicy` overrides the mission's own policy; tests use it to supply a verified destination. */
export async function sessionAction(path: string, token: string, action: GroupAction, actionId: string, now = Date.now(), expectedParticipantId?: string, arrivalPolicy?: ArrivalPolicy) {
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
          message = action.type === "arrival" ? `You're very close! You're in the right area. Look around for ${definition.shortName}.` : "Group arrival confirmed. Arrival bonus recorded.";
        } else if (action.type === "start") {
          if (!guide && role === "follower") throw new Error("Only the navigator, answer-submitter or guide may start");
          if (mission.completed) throw new Error("This challenge is already complete");
          if (mission.performance.startedAt === null) {
            // Existing in-progress puzzles are retained, but their earlier time is unknown.
            mission.performance = { ...mission.performance, startedAt: now, clockStartedAt: now,
              excluded: mission.cups.small + mission.cups.large + mission.cups.jar > 0,
              solvedAt: isWaterPuzzleSolved(mission.cups) ? now : null };
          }
        } else if (action.type === "timing") {
          if (!guide) throw new Error("Only the guide may adjust timing");
          if (mission.completed) throw new Error("This challenge is already complete");
          mission.performance = adjustWaterTiming(mission.performance, action.operation, now, participantId);
        } else if (action.type === "hint") {
          if (!Number.isInteger(action.hint) || action.hint < 1 || action.hint > 3) throw new Error("Invalid hint");
          if (action.hint > mission.performance.hintsUsed) {
            if (mission.performance.startedAt === null || mission.performance.solvedAt !== null || mission.completed) throw new Error("Hints are available during the challenge");
            if (action.hint !== mission.performance.hintsUsed + 1) throw new Error("Reveal hints in order");
            mission.performance = { ...mission.performance, hintsUsed: action.hint };
          }
        } else {
          if ((action.type === "move" || ((action.type === "submit" || action.type === "guide-approve") && !mission.completed)) && mission.performance.startedAt === null) throw new Error("Start the challenge after reading the story");
          const result = applyDevWaterAction({ roles: db.roles, cups: mission.cups, completed: mission.completed, activeActorId: participantId }, action);
          if (action.type === "move" && isWaterPuzzleSolved(result.session.cups) && mission.performance.solvedAt === null) mission.performance = { ...mission.performance, solvedAt: now };
          if (action.type === "reset") mission.performance = { ...mission.performance, solvedAt: null };
          if (result.session.completed && !mission.completed) mission.performance = awardWaterPerformance(mission.performance, now);
          mission.cups = result.session.cups;
          mission.completed = result.session.completed;
          message = result.message;
        }
        db.missions = { ...db.missions, [action.missionId]: mission };
      }
    } catch (error) { throw new AccessError(error instanceof Error ? error.message : "Action rejected"); }
    db.applied[participantId] = [...applied, actionId];
    return message;
  });
}
export async function logout(path: string, token: string) {
  await transact(path, db => { delete db.sessions[hash(token)]; });
}
