import type { ChoiceChallenge } from "@/lib/amazing-shuk/choice-task";
import type { BonusContent } from "@/lib/amazing-shuk/choice-missions";
import type { WaterSubmissionRole } from "@/lib/amazing-shuk/water-measurement";
import { buildChoiceTaskView } from "@/lib/amazing-shuk/mural-task-view";
import PreviewChoiceBonus from "./PreviewChoiceBonus";

type Props = {
  content: BonusContent; challenge: ChoiceChallenge; state: { selected: readonly string[]; completed: boolean; points: number };
  activeRole: WaterSubmissionRole; busy: boolean; feedback: string;
  onToggle: (optionId: string) => void; onSubmit: () => void; onReset: () => void;
};
/** The bonus opens once the main answer is accepted, so it's always "started": no Start button and no timing. */
export default function ListChoiceBonus({ content, challenge, state, activeRole, busy, ...rest }: Props) {
  return <PreviewChoiceBonus content={content} points={state.points}
    view={buildChoiceTaskView(challenge, state.selected, state.completed, activeRole, busy, true)} {...rest} />;
}
