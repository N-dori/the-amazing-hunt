import type { WaterPerformanceView } from "@/lib/amazing-shuk/water-performance";
import type { WaterSubmissionRole } from "@/lib/amazing-shuk/water-measurement";
import type { ChoiceChallenge } from "@/lib/amazing-shuk/choice-task";
import type { ChoiceTaskContent } from "@/lib/amazing-shuk/choice-missions";
import { buildChoiceTaskView } from "@/lib/amazing-shuk/mural-task-view";
import PreviewChoiceTask from "./PreviewChoiceTask";
type Props = {
  task: ChoiceTaskContent; challenge: ChoiceChallenge;
  // The question the group is on: 0 is `challenge`, then `followUps` in order (Marzipan's second question).
  step: number; followUps?: readonly ChoiceChallenge[];
  selected: readonly string[]; completed: boolean; feedback: string; activeRole: WaterSubmissionRole; busy: boolean; performance: WaterPerformanceView;
  onToggle: (optionId: string) => void; onStart: () => void; onSubmit: () => void; onReset: () => void; onHint: () => void;
};
/** Any "choose N" mission (the mural, the synagogue): shared picks, revealed hints and the reveal once accepted. */
export default function ListChoiceTask({ task, challenge, step, followUps, selected, completed, activeRole, busy, performance, ...rest }: Props) {
  const followUp = step > 0 ? task.followUps?.[step - 1] : undefined;
  const current = step > 0 ? followUps?.[step - 1] ?? challenge : challenge;
  const stepHints = followUp?.hints ?? task.hints;
  const used = performance.stepHintsUsed ?? performance.hintsUsed;
  const hints = stepHints.slice(0, Math.max(0, Math.min(stepHints.length, used)));
  return <PreviewChoiceTask view={buildChoiceTaskView(current, selected, completed, activeRole, busy, performance.started)}
    question={followUp?.question ?? task.question} lead={followUp?.lead} performance={performance} reveal={task.reveal} completionTitle={task.completionTitle} hints={hints}
    hasMoreHints={performance.started && !completed && hints.length < stepHints.length} {...rest} />;
}
