/** Provisional local-development settings for this task only. */
export type WaterRewardConfig = Readonly<{
  maxPoints: number; minimumPoints: number; foodTokens: number;
  fastUnderMs: number; standardThroughMs: number; standardPoints: number; slowPoints: number;
  hintPenalties: readonly number[];
}>;
export const WELL_REWARDS: WaterRewardConfig = Object.freeze({
  maxPoints: 100, minimumPoints: 40, foodTokens: 2,
  fastUnderMs: 120_000, standardThroughMs: 240_000, standardPoints: 90, slowPoints: 80,
  hintPenalties: Object.freeze([10, 15, 20]),
});
export type TimingOperation = "pause" | "resume" | "reset" | "exclude";
// `reveal` is "I'm completely stuck" (Phase 2): the answer is shown, the challenge earns 0 points, and the team carries on.
export type WaterPerformanceAction = Readonly<{ type: "start" }> | Readonly<{ type: "hint"; hint: number; step?: number }> | Readonly<{ type: "timing"; operation: TimingOperation }>
  | Readonly<{ type: "reveal" }>;
export type WaterReward = Readonly<{ points: number; foodTokens: number; hintsUsed: number }>;
export type WaterPerformance = Readonly<{
  startedAt: number | null; clockStartedAt: number | null; solvedAt: number | null;
  pausedAt: number | null; pausedMs: number; excluded: boolean; hintsUsed: number;
  // `outcome` is absent for a solve (every award before Phase 2), "revealed" after "I'm completely stuck".
  // Phase 2e adds a silent record for analytics only (never points): `outcome` "solved" or "revealed" (absent on older awards
  // means solved), `endedAt` (the server's time), and, when the phone's action carried when it was queued, `queuedMs` (the delay
  // before it reached the server) with `uncertain` when that delay or the phone's clock can't be trusted.
  award: (WaterReward & { awardedAt: number; elapsedMs: number | null; outcome?: "solved" | "revealed"; endedAt?: number; queuedMs?: number; uncertain?: true }) | null;
  adjustments: readonly { operation: TimingOperation; at: number; actorId: string }[];
}>;
// `stepHintsUsed` counts the current question's hints in a mission with follow-up questions; it equals `hintsUsed` otherwise.
// `canReveal`: this phone may press "I'm completely stuck" now; `revealed`: the award came from a reveal (0 points).
export type WaterPerformanceView = Readonly<{ started: boolean; hintsUsed: number; stepHintsUsed?: number; canStart: boolean; reward: WaterReward | null;
  canReveal?: boolean; revealed?: boolean;
  // When the challenge's award was recorded (Phase 2d): the reward pop-up's key.
  awardedAt?: number }>;
export type GuideTimingView = Readonly<{ startedAt: number | null; solvedAt: number | null; stoppedElapsedMs: number | null; paused: boolean; excluded: boolean }>;
export function createWaterPerformance(): WaterPerformance {
  return { startedAt: null, clockStartedAt: null, solvedAt: null, pausedAt: null, pausedMs: 0, excluded: false, hintsUsed: 0, award: null, adjustments: [] };
}
export function measuredWaterTime(state: WaterPerformance, now: number): number | null {
  if (state.clockStartedAt === null) return null;
  const end = state.solvedAt ?? now;
  const pausedTail = state.pausedAt === null ? 0 : Math.max(0, end - state.pausedAt);
  return Math.max(0, end - state.clockStartedAt - state.pausedMs - pausedTail);
}
export function calculateWaterReward(elapsedMs: number | null, hintsUsed: number, config = WELL_REWARDS): WaterReward {
  if ((elapsedMs !== null && (!Number.isFinite(elapsedMs) || elapsedMs < 0)) || !Number.isInteger(hintsUsed) || hintsUsed < 0 || hintsUsed > config.hintPenalties.length) throw new Error("Invalid performance result");
  const base = elapsedMs === null || elapsedMs < config.fastUnderMs ? config.maxPoints : elapsedMs <= config.standardThroughMs ? config.standardPoints : config.slowPoints;
  const penalty = config.hintPenalties.slice(0, hintsUsed).reduce((sum, value) => sum + value, 0);
  return { points: Math.max(config.minimumPoints, Math.min(config.maxPoints, base - penalty)), foodTokens: config.foodTokens, hintsUsed };
}
/** Guide authorization is enforced by the caller inside the shared store transaction. */
export function adjustWaterTiming(state: WaterPerformance, operation: TimingOperation, now: number, actorId: string): WaterPerformance {
  if (state.startedAt === null || state.award) throw new Error("Timing cannot be adjusted for this challenge");
  if (state.solvedAt !== null && operation !== "exclude") throw new Error("The solution time is already recorded");
  let next = state;
  if (operation === "pause" && state.pausedAt === null) next = { ...state, pausedAt: now };
  if (operation === "resume" && state.pausedAt !== null) next = { ...state, pausedMs: state.pausedMs + Math.max(0, now - state.pausedAt), pausedAt: null };
  if (operation === "reset") next = { ...state, clockStartedAt: now, pausedAt: null, pausedMs: 0, excluded: false };
  if (operation === "exclude" && !state.excluded) next = { ...state, excluded: true };
  return next === state ? state : { ...next, adjustments: [...state.adjustments, { operation, at: now, actorId }] };
}
/** Each mission passes its own reward settings; the well's are the default. */
export function awardWaterPerformance(state: WaterPerformance, now: number, config = WELL_REWARDS): WaterPerformance {
  if (state.award) return state;
  if (state.startedAt === null || state.solvedAt === null) throw new Error("Start and solve the challenge before submitting");
  const elapsedMs = state.excluded ? null : measuredWaterTime(state, now);
  return { ...state, award: { ...calculateWaterReward(elapsedMs, state.hintsUsed, config), awardedAt: now, elapsedMs } };
}
/** "I'm completely stuck" (owner, 2 Nov 2026): 0 challenge points, the challenge's food tokens (D3: a core challenge keeps them),
 * recorded once like any award. An existing award is never replaced, so a reveal after a solve, or a second reveal, changes nothing. */
export function revealWaterPerformance(state: WaterPerformance, now: number, config = WELL_REWARDS): WaterPerformance {
  if (state.award) return state;
  if (state.startedAt === null) throw new Error("Start the challenge after reading the story");
  if (!Number.isSafeInteger(config.foodTokens) || config.foodTokens < 0) throw new Error("Reward configuration is unavailable");
  const elapsedMs = state.excluded ? null : measuredWaterTime(state, now);
  return { ...state, award: { points: 0, foodTokens: config.foodTokens, hintsUsed: state.hintsUsed, awardedAt: now, elapsedMs, outcome: "revealed", endedAt: now } };
}

/** Phase 2e: longer than this between the phone queueing an action and the server applying it, the timing is uncertain. */
export const SYNC_UNCERTAIN_MS = 60_000;
/** A phone clock this far ahead of the server's is implausible. */
export const CLOCK_AHEAD_TOLERANCE_MS = 5_000;
type Award = NonNullable<WaterPerformance["award"]>;
/** The delay a queued action spent on the phone, clamped at 0; nothing when the phone didn't say (an older app). */
export function syncTiming(queuedAt: number | undefined, now: number): Readonly<{ queuedMs?: number; uncertain?: true }> {
  if (queuedAt === undefined || !Number.isFinite(queuedAt)) return {};
  const delay = now - queuedAt;
  const uncertain = delay > SYNC_UNCERTAIN_MS || delay < -CLOCK_AHEAD_TOLERANCE_MS;
  return { queuedMs: Math.max(0, Math.round(delay)), ...(uncertain ? { uncertain: true as const } : {}) };
}
/** Adds the silent timing record to an award made just now. Points, food tokens and `elapsedMs` are never changed. */
export function recordAwardTiming(award: Award, now: number, queuedAt?: number): Award {
  return { ...award, outcome: award.outcome ?? "solved", endedAt: award.endedAt ?? now, ...syncTiming(queuedAt, now) };
}
