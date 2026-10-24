import type { WaterPerformanceView } from "@/lib/amazing-shuk/water-performance";
import type { WaterSubmissionRole } from "@/lib/amazing-shuk/water-measurement";
import { MURAL_CHALLENGE, MURAL_TASK } from "@/lib/amazing-shuk/mural-task";
import { buildChoiceTaskView } from "@/lib/amazing-shuk/mural-task-view";
import PreviewMuralTask from "./PreviewMuralTask";
type Props = {
  selected: readonly string[]; completed: boolean; activeRole: WaterSubmissionRole; busy: boolean; performance: WaterPerformanceView;
  onToggle: (optionId: string) => void; onStart: () => void; onSubmit: () => void; onReset: () => void; onHint: () => void;
};
export default function ListMuralTask({ selected, completed, activeRole, busy, performance, ...callbacks }: Props) {
  const hints = MURAL_TASK.hints.slice(0, Math.max(0, Math.min(MURAL_TASK.hints.length, performance.hintsUsed)));
  return <PreviewMuralTask view={buildChoiceTaskView(MURAL_CHALLENGE, selected, completed, activeRole, busy, performance.started)}
    question={MURAL_TASK.question} performance={performance} reveal={MURAL_TASK.reveal.image} hints={hints}
    hasMoreHints={performance.started && !completed && hints.length < MURAL_TASK.hints.length} {...callbacks} />;
}
