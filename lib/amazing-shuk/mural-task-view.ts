import type { ChoiceChallenge } from "./choice-task.ts";
import type { WaterSubmissionRole } from "./water-measurement.ts";

export type ChoiceOptionView = Readonly<{ id: string; label: string; lang?: "he"; selected: boolean; disabled: boolean }>;
export type ChoiceTaskView = Readonly<{
  options: readonly ChoiceOptionView[]; chosen: number; required: number;
  completed: boolean; busy: boolean; canSubmit: boolean; submitDisabled: boolean; canReset: boolean;
  answerKeyVerified: boolean; status: string;
  /** Someone else is the Submitter: this phone sees the picks live but can't change them (owner, 5 Nov 2026). */
  readOnly: boolean;
}>;

// TODO(copy): draft (owner, 5 Nov 2026: only the Submitter picks or moves; the others watch).
export const READ_ONLY_NOTE = "Only the Submitter chooses. Tell them what you think.";

/** Only the Submitter (or the guide, or anyone while the seat is empty: `canAnswer`) changes the shared picks and submits them; the others
 * see them live, read-only (owner, 5 Nov 2026). */
export function buildChoiceTaskView(challenge: ChoiceChallenge, selected: readonly string[], completed: boolean, role: WaterSubmissionRole, busy: boolean, started: boolean, canAnswer = true): ChoiceTaskView {
  const full = selected.length >= challenge.required;
  return {
    options: challenge.options.map(option => {
      const isSelected = selected.includes(option.id);
      return { id: option.id, label: option.label, ...(option.lang ? { lang: option.lang } : {}), selected: isSelected,
        disabled: !started || busy || completed || !canAnswer || (full && !isSelected) };
    }),
    chosen: selected.length, required: challenge.required, completed, busy,
    canSubmit: ["guide", "answerSubmitter", "navigatorAndAnswerSubmitter"].includes(role),
    submitDisabled: busy || completed || !started || selected.length !== challenge.required,
    canReset: started && !busy && !completed && canAnswer && selected.length > 0,
    answerKeyVerified: challenge.answerKeyVerified,
    readOnly: started && !completed && !canAnswer,
    status: completed ? "Group answer accepted." : started ? `${selected.length} of ${challenge.required} selected${canAnswer ? "" : `. ${READ_ONLY_NOTE}`}` : "",
  };
}
