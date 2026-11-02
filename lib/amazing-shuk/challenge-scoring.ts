import type { WaterRewardConfig } from "./water-performance.ts";

/** Model B (owner, D1, 2 Nov 2026): a challenge's hints together take at most `budgetShare` of its maximum, later hints cost more
 * (weights 1 : 2 : 3 …), and a correct solve always keeps the rest: the floor (D2). */
export type BudgetScoring = Readonly<{ maxPoints: number; budgetShare: number; foodTokens: number }>;

const STEP = 5;
const roundToStep = (value: number) => Math.round(value / STEP) * STEP;

/** The points a challenge's whole hint budget may take, rounded to 5. */
export function hintBudget(maxPoints: number, budgetShare: number): number {
  if (!Number.isSafeInteger(maxPoints) || maxPoints <= 0 || !Number.isFinite(budgetShare) || budgetShare < 0 || budgetShare > 1) throw new Error("Invalid hint budget");
  return Math.min(maxPoints, roundToStep(maxPoints * budgetShare));
}

/** Each hint's cost, in order. Costs are rounded to 5 and the last absorbs the remainder, so they always add up to the budget
 * and never fall. No hints: no costs. */
export function hintLadder(maxPoints: number, hintCount: number, budgetShare: number): readonly number[] {
  const budget = hintBudget(maxPoints, budgetShare);
  if (!Number.isSafeInteger(hintCount) || hintCount < 0) throw new Error("Invalid hint count");
  if (hintCount === 0) return [];
  const weightSum = (hintCount * (hintCount + 1)) / 2;
  const costs: number[] = [];
  for (let index = 1; index < hintCount; index++) costs.push(Math.max(costs.at(-1) ?? 0, roundToStep((budget * index) / weightSum)));
  const rest = budget - costs.reduce((sum, cost) => sum + cost, 0);
  // Rounding can leave the last hint cheaper than the one before; then spread evenly from the end, still adding up to the budget.
  if (rest < (costs.at(-1) ?? 0)) return evenLadder(budget, hintCount);
  return [...costs, rest];
}

/** A fallback for small budgets: costs as equal as steps of 5 allow, with any larger ones last. */
function evenLadder(budget: number, hintCount: number): readonly number[] {
  const steps = budget / STEP;
  const base = Math.floor(steps / hintCount);
  const extra = steps - base * hintCount;
  return Array.from({ length: hintCount }, (_, index) => (base + (index >= hintCount - extra ? 1 : 0)) * STEP);
}

/** Model-B reward settings in the shape `calculateWaterReward` already scores. Speed never changes the points. */
export function budgetRewards(scoring: BudgetScoring, hintCount: number): WaterRewardConfig {
  if (!Number.isSafeInteger(scoring.foodTokens) || scoring.foodTokens < 0) throw new Error("Invalid food tokens");
  const budget = hintBudget(scoring.maxPoints, scoring.budgetShare);
  // Speed never changes the points: every time earns the maximum.
  return Object.freeze({
    maxPoints: scoring.maxPoints, minimumPoints: scoring.maxPoints - budget, foodTokens: scoring.foodTokens,
    fastUnderMs: Number.POSITIVE_INFINITY, standardThroughMs: Number.POSITIVE_INFINITY, standardPoints: scoring.maxPoints, slowPoints: scoring.maxPoints,
    hintPenalties: Object.freeze([...hintLadder(scoring.maxPoints, hintCount, scoring.budgetShare)]),
  });
}

/** D2: an optional challenge may be worth at most twice its stop's core challenge. */
export const OPTIONAL_MAX_MULTIPLE = 2;
export function withinOptionalCap(coreMaxPoints: number, optionalMaxPoints: number): boolean {
  return optionalMaxPoints <= coreMaxPoints * OPTIONAL_MAX_MULTIPLE;
}
