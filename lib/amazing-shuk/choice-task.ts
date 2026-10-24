/** A shared "choose N" challenge: the group picks options together, then one official answer is checked. */
export type ChoiceOption = Readonly<{
  id: string; label: string;
  // The answer key: true is a correct pick, false a wrong one, null unknown (sources disagree).
  correct: boolean | null;
  source: string;
}>;
export type ChoiceChallenge = Readonly<{
  kind: "choice"; options: readonly ChoiceOption[]; required: number;
  // Only a field-verified key may score answers; until then submissions are not judged.
  answerKeyVerified: boolean;
}>;
export type ChoiceResult = "accepted" | "incorrect" | "incomplete" | "unverified";

export function isValidChoiceSelection(challenge: ChoiceChallenge, selected: unknown): selected is string[] {
  return Array.isArray(selected) && selected.length <= challenge.required && new Set(selected).size === selected.length
    && selected.every(id => typeof id === "string" && challenge.options.some(option => option.id === id));
}

/** Adds or removes one option, keeping the catalogue order. Returns null for an unknown option or too many picks. */
export function toggleChoice(challenge: ChoiceChallenge, selected: readonly string[], optionId: string): readonly string[] | null {
  if (!challenge.options.some(option => option.id === optionId)) return null;
  const next = selected.includes(optionId) ? selected.filter(id => id !== optionId) : [...selected, optionId];
  if (next.length > challenge.required) return null;
  return challenge.options.map(option => option.id).filter(id => next.includes(id));
}

export function evaluateChoice(challenge: ChoiceChallenge, selected: readonly string[]): ChoiceResult {
  if (selected.length !== challenge.required) return "incomplete";
  if (!challenge.answerKeyVerified) return "unverified";
  return selected.every(id => challenge.options.find(option => option.id === id)?.correct === true) ? "accepted" : "incorrect";
}
