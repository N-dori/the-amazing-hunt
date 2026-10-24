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
export type WaterPerformanceAction = Readonly<{ type: "start" }> | Readonly<{ type: "hint"; hint: number }> | Readonly<{ type: "timing"; operation: TimingOperation }>;
export type WaterReward = Readonly<{ points: number; foodTokens: number; hintsUsed: number }>;
export type WaterPerformance = Readonly<{
  startedAt: number | null; clockStartedAt: number | null; solvedAt: number | null;
  pausedAt: number | null; pausedMs: number; excluded: boolean; hintsUsed: number;
  award: (WaterReward & { awardedAt: number; elapsedMs: number | null }) | null;
  adjustments: readonly { operation: TimingOperation; at: number; actorId: string }[];
}>;
export type WaterPerformanceView = Readonly<{ started: boolean; hintsUsed: number; canStart: boolean; reward: WaterReward | null }>;
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
