import { evaluateChoice, isValidChoiceSelection, toggleChoice } from "./choice-task.ts";
import { GATEWAY_LANGUAGES, GATEWAY_YEAR } from "./montefiore-task.ts";
export type GatewayStage = "languages" | "year";
export type GatewayProgress = Readonly<{ stage: GatewayStage | "completed"; selected: readonly string[]; yearAnswer: string; attempts: Readonly<Record<GatewayStage, number>> }>;
export const emptyGatewayProgress = (): GatewayProgress => ({ stage: "languages", selected: [], yearAnswer: "", attempts: { languages: 0, year: 0 } });
export function validGatewayProgress(value: GatewayProgress): boolean {
  return Boolean(value) && ["languages", "year", "completed"].includes(value.stage)
    && isValidChoiceSelection(GATEWAY_LANGUAGES, value.selected) && typeof value.yearAnswer === "string" && /^[0-9]{0,4}$/.test(value.yearAnswer)
    && Boolean(value.attempts) && [value.attempts.languages,value.attempts.year].every(n => Number.isSafeInteger(n) && n >= 0)
    && (value.stage === "languages" || evaluateChoice(GATEWAY_LANGUAGES,value.selected) === "accepted")
    && (value.stage !== "completed" || value.yearAnswer === GATEWAY_YEAR.gregorianYear);
}
export type GatewayPuzzleAction = Readonly<{ type: "toggle-choice"; optionId: string }> | Readonly<{ type: "set-gateway-year"; answer: string }> | Readonly<{ type: "submit" | "guide-approve" | "reset" }>;
/** Authorization and timing belong to the existing store; this pure reducer cannot skip either question. */
export function applyGatewayAction(current: GatewayProgress, action: GatewayPuzzleAction, stage: GatewayStage | undefined) {
  if (!validGatewayProgress(current)) throw new Error("Invalid gateway progress");
  if (current.stage === "completed") {
    if (action.type === "submit" || action.type === "guide-approve") return { progress: current, message: "This challenge is already complete." };
    throw new Error("This challenge is already complete");
  }
  if (stage !== current.stage) throw new Error("The shared stage changed; refresh before continuing.");
  if (action.type === "reset") return { progress: { ...current, ...(stage === "languages" ? { selected: [] } : { yearAnswer: "" }) }, message: "Answer cleared." };
  if (action.type === "toggle-choice") {
    if (stage !== "languages") throw new Error("The language question is already complete");
    const selected = toggleChoice(GATEWAY_LANGUAGES,current.selected,action.optionId);
    if (!selected) throw new Error("Choose up to three languages.");
    return { progress: { ...current,selected }, message: "" };
  }
  if (action.type === "set-gateway-year") {
    if (stage !== "year" || !/^[0-9]{0,4}$/.test(action.answer)) throw new Error("Enter a four-digit Gregorian year.");
    return { progress: { ...current,yearAnswer:action.answer }, message: "" };
  }
  const attempts = { ...current.attempts, [stage]: current.attempts[stage] + 1 };
  const accepted = stage === "languages" ? evaluateChoice(GATEWAY_LANGUAGES,current.selected) === "accepted" : current.yearAnswer === GATEWAY_YEAR.gregorianYear;
  return { progress: { ...current, attempts, stage: accepted ? (stage === "languages" ? "year" : "completed") : current.stage } as GatewayProgress,
    message: accepted ? (stage === "languages" ? "Languages confirmed. Now decipher the year." : "Challenge completed!") : "Not quite. Look again and talk it over." };
}
