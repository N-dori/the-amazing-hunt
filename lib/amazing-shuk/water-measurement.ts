export type WaterCups = Readonly<{ small: number; large: number; jar: number }>;
export const WATER_MOVES = ["fill-small", "fill-large", "empty-small", "empty-large", "pour-small-into-large", "pour-large-into-small", "pour-small-into-jar", "pour-large-into-jar"] as const;
export type WaterMove = typeof WATER_MOVES[number];
export type WaterSubmissionRole = "navigator" | "answerSubmitter" | "navigatorAndAnswerSubmitter" | "follower" | "guide";
export type WaterSubmissionResult = "accepted" | "incorrect" | "unauthorized";

export const WATER_TASK_ID = "water-measurement-family-jar";
export const WATER_PUZZLE_REVISION = 3;
export const WATER_TARGET_LITERS = 4;
export const WATER_CAPACITY = Object.freeze({ small: 3, large: 5, jar: 4 });
export const EMPTY_WATER_CUPS: WaterCups = Object.freeze({ small: 0, large: 0, jar: 0 });

export function isValidCups(cups: WaterCups): boolean {
  return Object.entries(WATER_CAPACITY).every(([key, capacity]) => {
    const value = cups[key as keyof WaterCups];
    return Number.isInteger(value) && value >= 0 && value <= capacity;
  });
}

export function applyWaterMove(cups: WaterCups, move: WaterMove): WaterCups | null {
  if (!isValidCups(cups)) return null;
  const next = { ...cups };
  const pour = (from: "small" | "large", to: keyof WaterCups) => {
    const amount = Math.min(next[from], WATER_CAPACITY[to] - next[to]);
    next[from] -= amount;
    next[to] += amount;
  };
  switch (move) {
    case "fill-small": next.small = WATER_CAPACITY.small; break;
    case "fill-large": next.large = WATER_CAPACITY.large; break;
    case "empty-small": next.small = 0; break;
    case "empty-large": next.large = 0; break;
    case "pour-small-into-large": pour("small", "large"); break;
    case "pour-large-into-small": pour("large", "small"); break;
    case "pour-small-into-jar": pour("small", "jar"); break;
    case "pour-large-into-jar": pour("large", "jar"); break;
    default: return null;
  }
  return Object.freeze(next);
}

export function isWaterPuzzleSolved(cups: WaterCups): boolean {
  return isValidCups(cups) && cups.jar === WATER_TARGET_LITERS;
}

/** The guide and answer-submitter finalize only a correctly filled family jar. */
export function evaluateWaterSubmission(role: WaterSubmissionRole, cups: WaterCups): WaterSubmissionResult {
  if (!["guide", "answerSubmitter", "navigatorAndAnswerSubmitter"].includes(role)) return "unauthorized";
  return isWaterPuzzleSolved(cups) ? "accepted" : "incorrect";
}
