import type { WaterPerformanceView } from "@/lib/amazing-shuk/water-performance";
import { WATER_TASK } from "@/lib/amazing-shuk/water-task";
import { buildWaterTaskView, type WaterInteraction, type WaterActionView, type WaterContainerId } from "@/lib/amazing-shuk/water-task-view";
import { visibleWaterHints, WATER_HINTS } from "@/lib/amazing-shuk/water-hints";
import type { WaterCups, WaterMove, WaterSubmissionRole } from "@/lib/amazing-shuk/water-measurement";
import PreviewWaterTask from "./PreviewWaterTask";
type Props = {
  cups: WaterCups; completed: boolean; activeRole: WaterSubmissionRole; busy: boolean;
  interaction: WaterInteraction; performance: WaterPerformanceView;
  onSelect: (id: WaterContainerId, move: WaterMove | null) => void;
  onAction: (action: WaterActionView["id"]) => void; onCancelPour: () => void;
  onStart: () => void; onSubmit: () => void; onReset: () => void; onHint: () => void; onOpenRoles?: () => void;
};
export default function ListWaterTask({ cups, completed, activeRole, busy, interaction, performance, ...callbacks }: Props) {
  return <PreviewWaterTask view={buildWaterTaskView(cups, completed, activeRole, busy, interaction, performance.started)} narrative={WATER_TASK.narrative}
    performance={performance} hints={visibleWaterHints(performance.hintsUsed)} hasMoreHints={performance.started && !completed && cups.jar < 4 && performance.hintsUsed < WATER_HINTS.length} {...callbacks} />;
}
