import { createWaterPerformance, adjustWaterTiming, awardWaterPerformance, measuredWaterTime, type WaterPerformance } from "./water-performance.ts";
import { createHash, randomBytes } from "node:crypto";
import { mkdir, readFile, open, rename, rm } from "node:fs/promises";
import { EMPTY_WATER_CUPS, WATER_PUZZLE_REVISION, isValidCups, isWaterPuzzleSolved } from "./water-measurement.ts";
import { roleForParticipant } from "./roles.ts";
import { dirname, resolve } from "node:path";
import { applyDevWaterAction, createDevWaterSession, DEV_GUIDE_ID, DEV_PARTICIPANTS, type DevWaterAction, type DevWaterSession } from "./dev-water-session.ts";

export const SESSION_COOKIE = "shuk_session";
const DAY = 86_400_000;
type Credential = { participantId: string; expiresAt: number };
type GroupState = Omit<DevWaterSession, "activeActorId">;
type Database = { version: 3; performance: WaterPerformance; invitations: Record<string, Credential>; sessions: Record<string, Credential>; group: GroupState; applied: Record<string, string[]> };
export class AccessError extends Error {
  status: number;
  constructor(message: string, status = 403) { super(message); this.status = status; }
}
const hash = (token: string) => createHash("sha256").update(token).digest("hex");
const secret = () => randomBytes(32).toString("base64url");
function initial(): Database {
  const { roles, cups, completed } = createDevWaterSession();
  return { version: 3, performance: createWaterPerformance(), invitations: {}, sessions: {}, group: { roles, cups, completed }, applied: {} };
}
export const defaultStorePath = () => resolve(process.env.SHUK_DATA_FILE ?? ".local/amazing-shuk/state.json");

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
    let db: Database;
    try { db = JSON.parse(await readFile(path, "utf8")) as Database; }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; db = initial(); }
    if ((db as { version: number }).version === 1) {
      // The old measuring-cup task is a different puzzle. Keep credentials and roles,
      // start this revised task empty, and retain old receipts to reject stale replays.
      db = { ...db, version: 3, performance: createWaterPerformance(), group: { ...db.group, cups: EMPTY_WATER_CUPS, completed: false } };
    }
    if ((db as { version: number }).version === 2) db = { ...db, version: 3, performance: createWaterPerformance() };
    if (db.version !== 3 || !isValidCups(db.group.cups)) throw new Error("Unsupported Shuk storage state");
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
export async function sessionView(path: string, token: string, now = Date.now()) {
  return transact(path, db => {
    const participantId = identity(db, token, now);
    const guide = participantId === DEV_GUIDE_ID;
    const role = roleForParticipant(participantId, db.group.roles);
    const award = db.performance.award;
    return {
      puzzleRevision: WATER_PUZZLE_REVISION, session: { ...db.group, activeActorId: participantId },
      performance: { started: db.performance.startedAt !== null, hintsUsed: db.performance.hintsUsed,
        canStart: guide || role !== "follower", reward: award ? { points: award.points, foodTokens: award.foodTokens, hintsUsed: award.hintsUsed } : null },
      sharedBalance: { points: award?.points ?? 0, foodTokens: award?.foodTokens ?? 0, status: "Provisional local-development rewards" },
      ...(guide ? { guideTiming: { startedAt: db.performance.startedAt, solvedAt: db.performance.solvedAt,
        stoppedElapsedMs: db.performance.solvedAt === null ? null : measuredWaterTime(db.performance, now), paused: db.performance.pausedAt !== null, excluded: db.performance.excluded } } : {}),
    };
  });
}
export async function sessionAction(path: string, token: string, action: DevWaterAction, actionId: string, now = Date.now(), expectedParticipantId?: string) {
  return transact(path, db => {
    const participantId = identity(db, token, now);
    if (expectedParticipantId !== undefined && expectedParticipantId !== participantId) throw new AccessError("Browser identity changed; reload before syncing actions", 409);
    if (action.type === "submit" && participantId !== DEV_GUIDE_ID && !["answerSubmitter", "navigatorAndAnswerSubmitter"].includes(roleForParticipant(participantId, db.group.roles))) throw new AccessError("Only the answer-submitter may submit");
    if (action.type === "switch-actor") throw new AccessError("Identity comes from the authenticated session");
    if (!/^[A-Za-z0-9-]{16,80}$/.test(actionId)) throw new AccessError("Invalid action ID", 400);
    const applied = db.applied[participantId] ?? [];
    if (applied.includes(actionId)) return "Action already synced.";
    const guide = participantId === DEV_GUIDE_ID;
    const role = roleForParticipant(participantId, db.group.roles);
    let message = "";
    try {
      if (action.type === "start") {
        if (!guide && role === "follower") throw new Error("Only the navigator, answer-submitter or guide may start");
        if (db.group.completed) throw new Error("This challenge is already complete");
        if (db.performance.startedAt === null) {
          // Existing in-progress puzzles are retained, but their earlier time is unknown.
          db.performance = { ...db.performance, startedAt: now, clockStartedAt: now,
            excluded: db.group.cups.small + db.group.cups.large + db.group.cups.jar > 0,
            solvedAt: isWaterPuzzleSolved(db.group.cups) ? now : null };
        }
      } else if (action.type === "timing") {
        if (!guide) throw new Error("Only the guide may adjust timing");
        if (db.group.completed) throw new Error("This challenge is already complete");
        db.performance = adjustWaterTiming(db.performance, action.operation, now, participantId);
      } else if (action.type === "hint") {
        if (!Number.isInteger(action.hint) || action.hint < 1 || action.hint > 3) throw new Error("Invalid hint");
        if (action.hint > db.performance.hintsUsed) {
          if (db.performance.startedAt === null || db.performance.solvedAt !== null || db.group.completed) throw new Error("Hints are available during the challenge");
          if (action.hint !== db.performance.hintsUsed + 1) throw new Error("Reveal hints in order");
          db.performance = { ...db.performance, hintsUsed: action.hint };
        }
      } else {
        if ((action.type === "move" || ((action.type === "submit" || action.type === "guide-approve") && !db.group.completed)) && db.performance.startedAt === null) throw new Error("Start the challenge after reading the story");
        const result = applyDevWaterAction({ ...db.group, activeActorId: participantId }, action);
        if (action.type === "move" && isWaterPuzzleSolved(result.session.cups) && db.performance.solvedAt === null) db.performance = { ...db.performance, solvedAt: now };
        if (action.type === "reset") db.performance = { ...db.performance, solvedAt: null };
        if (result.session.completed && !db.group.completed) db.performance = awardWaterPerformance(db.performance, now);
        const { roles, cups, completed } = result.session;
        db.group = { roles, cups, completed };
        message = result.message;
      }
    } catch (error) { throw new AccessError(error instanceof Error ? error.message : "Action rejected"); }
    db.applied[participantId] = [...applied, actionId];
    return message;
  });
}
export async function logout(path: string, token: string) {
  await transact(path, db => { delete db.sessions[hash(token)]; });
}
