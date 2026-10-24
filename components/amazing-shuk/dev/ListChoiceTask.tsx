import type { WaterPerformanceView } from "@/lib/amazing-shuk/water-performance";
import type { WaterSubmissionRole } from "@/lib/amazing-shuk/water-measurement";
import type { ChoiceChallenge } from "@/lib/amazing-shuk/choice-task";
import type { ChoiceTaskContent } from "@/lib/amazing-shuk/choice-missions";
import { buildChoiceTaskView } from "@/lib/amazing-shuk/mural-task-view";
import PreviewChoiceTask from "./PreviewChoiceTask";
type Props = {
  task: ChoiceTaskContent; challenge: ChoiceChallenge;
  selected: readonly string[]; completed: boolean; feedback: string; activeRole: WaterSubmissionRole; busy: boolean; performance: WaterPerformanceView;
  onToggle: (optionId: string) => void; onStart: () => void; onSubmit: () => void; onReset: () => void; onHint: () => void;
};
/** Any "choose N" mission (the mural, the synagogue): shared picks, revealed hints and the reveal once accepted. */
export default function ListChoiceTask({ task, challenge, selected, completed, activeRole, busy, performance, ...rest }: Props) {
  const hints = task.hints.slice(0, Math.max(0, Math.min(task.hints.length, performance.hintsUsed)));
  return <PreviewChoiceTask view={buildChoiceTaskView(challenge, selected, completed, activeRole, busy, performance.started)}
    question={task.question} performance={performance} reveal={task.reveal} hints={hints}
    hasMoreHints={performance.started && !completed && hints.length < task.hints.length} {...rest} />;
}
