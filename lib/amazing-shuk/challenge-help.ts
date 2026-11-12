import { calculateWaterReward, type WaterRewardConfig } from "./water-performance.ts";
import type { ChoiceChallenge } from "./choice-task.ts";
import type { WaterMove } from "./water-measurement.ts";

export type HintContent = Readonly<{ title: string; text: string }>;

/** What the hint sheet shows. Points are the most the challenge can still earn, so speed (on stops that still score it) only
 * ever lowers them further. */
export type HintSheetView = Readonly<{
  // The hint icon shows only during play, and only when the question has hints.
  available: boolean;
  remaining: number; total: number;
  revealed: readonly HintContent[];
  // The next hint, still locked: its number and the potential points before and after it.
  next: Readonly<{ number: number; fromPoints: number; toPoints: number }> | null;
  // Every hint used: the sheet offers "I'm completely stuck" too, if this phone may press it.
  offerStuck: boolean;
  // The hint pop-up's flow (owner, 5 Nov 2026): the cost first, then the hint, then, still in the pop-up, the way to the answer and its
  // explanation, whenever this phone may reveal it.
  offerAnswer: boolean;
}>;

export type HintSheetInput = Readonly<{
  // The current question's hints, in order.
  hints: readonly HintContent[];
  // Used in this question (numbering), and in the whole mission (scoring: a mission's follow-ups share one hint total).
  stepUsed: number; totalUsed: number;
  started: boolean; completed: boolean; canReveal: boolean;
  rewards: WaterRewardConfig;
}>;

const potential = (rewards: WaterRewardConfig, used: number) =>
  calculateWaterReward(null, Math.min(used, rewards.hintPenalties.length), rewards).points;

export function buildHintSheetView({ hints, stepUsed, totalUsed, started, completed, canReveal, rewards }: HintSheetInput): HintSheetView {
  const used = Math.max(0, Math.min(stepUsed, hints.length));
  const playing = started && !completed;
  const next = playing && used < hints.length
    ? { number: used + 1, fromPoints: potential(rewards, totalUsed), toPoints: potential(rewards, totalUsed + 1) } : null;
  return { available: playing && hints.length > 0, remaining: hints.length - used, total: hints.length,
    revealed: hints.slice(0, used), next, offerStuck: playing && canReveal && used >= hints.length, offerAnswer: playing && canReveal };
}

/** After "I'm completely stuck" on a "choose N" challenge: every option the field-checked key marks as right, in catalogue order. */
export function choiceAnswer(challenge: ChoiceChallenge): readonly string[] {
  return challenge.options.filter(option => option.correct === true).map(option => option.label);
}

// TODO(copy): drafts for the well's revealed solution, pending the owner's approval. The I5 rework will replace them.
const WATER_MOVE_STEPS: Readonly<Record<WaterMove, string>> = Object.freeze({
  "fill-small": "Fill the 3 L vessel from the well.",
  "fill-large": "Fill the 5 L vessel from the well.",
  "empty-small": "Return the 3 L vessel's water to the well.",
  "empty-large": "Return the 5 L vessel's water to the well.",
  "pour-small-into-large": "Pour the 3 L vessel into the 5 L vessel.",
  "pour-large-into-small": "Pour the 5 L vessel into the 3 L vessel.",
  "pour-small-into-jar": "Pour the 3 L vessel into your family's jar.",
  "pour-large-into-jar": "Pour the 5 L vessel into your family's jar.",
});

/** The puzzle's intended solution: measure 4 L with the 3 L and 5 L vessels, then pour it into the jar. A shorter path exists (pour a
 * full 5 L vessel into the 4 L jar); it is the known shortcut the I5 rework removes, so the reveal teaches the intended one. */
export const WATER_INTENDED_SOLUTION: readonly WaterMove[] = Object.freeze(["fill-large", "pour-large-into-small", "empty-small",
  "pour-large-into-small", "fill-large", "pour-large-into-small", "pour-large-into-jar"]);

/** The well's revealed answer, one step per line. */
export function waterAnswer(): readonly string[] {
  return WATER_INTENDED_SOLUTION.map(move => WATER_MOVE_STEPS[move]);
}
