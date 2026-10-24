export type WaterCups = Readonly<{ small: number; large: number }>;
export type WaterMove = "fill-small" | "fill-large" | "empty-small" | "empty-large" | "pour-small-into-large" | "pour-large-into-small";
export type WaterSubmissionRole = "navigator" | "answerSubmitter" | "navigatorAndAnswerSubmitter" | "follower" | "guide";
export type WaterSubmissionResult = "accepted" | "incorrect" | "unauthorized";

export const WATER_TASK_ID = "water-measurement-400ml";
export const WATER_TARGET_ML = 400;
export const EMPTY_WATER_CUPS: WaterCups = Object.freeze({ small: 0, large: 0 });
const CAPACITY = Object.freeze({ small: 300, large: 500 });

function isValidCups(cups: WaterCups): boolean {
  return Number.isInteger(cups.small) && Number.isInteger(cups.large) &&
    cups.small >= 0 && cups.small <= CAPACITY.small && cups.large >= 0 && cups.large <= CAPACITY.large;
}

export function applyWaterMove(cups: WaterCups, move: WaterMove): WaterCups | null {
  if (!isValidCups(cups)) return null;
  const next = { small: cups.small, large: cups.large };
  switch (move) {
    case "fill-small": next.small = CAPACITY.small; break;
    case "fill-large": next.large = CAPACITY.large; break;
    case "empty-small": next.small = 0; break;
    case "empty-large": next.large = 0; break;
    case "pour-small-into-large": {
      const amount = Math.min(next.small, CAPACITY.large - next.large);
      next.small -= amount; next.large += amount; break;
    }
    case "pour-large-into-small": {
      const amount = Math.min(next.large, CAPACITY.small - next.small);
      next.large -= amount; next.small += amount; break;
    }
    default: return null;
  }
  return Object.freeze(next);
}

export function isWaterPuzzleSolved(cups: WaterCups): boolean {
  return isValidCups(cups) && (cups.small === WATER_TARGET_ML || cups.large === WATER_TARGET_ML);
}

/** Only the answer-submitter may submit; guide approval is an explicit override. */
export function evaluateWaterSubmission(role: WaterSubmissionRole, cups: WaterCups, guideApproved = false): WaterSubmissionResult {
  if (role === "guide") return guideApproved ? "accepted" : "incorrect";
  if (role !== "answerSubmitter" && role !== "navigatorAndAnswerSubmitter") return "unauthorized";
  return isWaterPuzzleSolved(cups) ? "accepted" : "incorrect";
}
