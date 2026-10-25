import type { ChoiceChallenge } from "./choice-task.ts";
import type { WaterSubmissionRole } from "./water-measurement.ts";

export type ChoiceOptionView = Readonly<{ id: string; label: string; lang?: "he"; selected: boolean; disabled: boolean }>;
export type ChoiceTaskView = Readonly<{
  options: readonly ChoiceOptionView[]; chosen: number; required: number;
  completed: boolean; busy: boolean; canSubmit: boolean; submitDisabled: boolean; canReset: boolean;
  answerKeyVerified: boolean; status: string;
}>;

/** Anyone may change the shared picks; only the answer-submitter or guide submits them. */
export function buildChoiceTaskView(challenge: ChoiceChallenge, selected: readonly string[], completed: boolean, role: WaterSubmissionRole, busy: boolean, started: boolean): ChoiceTaskView {
  const full = selected.length >= challenge.required;
  return {
    options: challenge.options.map(option => {
      const isSelected = selected.includes(option.id);
      return { id: option.id, label: option.label, ...(option.lang ? { lang: option.lang } : {}), selected: isSelected,
        disabled: !started || busy || completed || (full && !isSelected) };
    }),
    chosen: selected.length, required: challenge.required, completed, busy,
    canSubmit: ["guide", "answerSubmitter", "navigatorAndAnswerSubmitter"].includes(role),
    submitDisabled: busy || completed || !started || selected.length !== challenge.required,
    canReset: started && !busy && !completed && selected.length > 0,
    answerKeyVerified: challenge.answerKeyVerified,
    status: completed ? "Group answer accepted." : started ? `${selected.length} of ${challenge.required} selected` : "",
  };
}
