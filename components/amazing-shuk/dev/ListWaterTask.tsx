import type { WaterPerformanceView } from "@/lib/amazing-shuk/water-performance";
import { WATER_TASK } from "@/lib/amazing-shuk/water-task";
import { buildWaterTaskView, type WaterInteraction, type WaterActionView, type WaterContainerId } from "@/lib/amazing-shuk/water-task-view";
import { waterAnswer } from "@/lib/amazing-shuk/challenge-help";
import type { ReactNode } from "react";
import type { WaterCups, WaterMove, WaterSubmissionRole } from "@/lib/amazing-shuk/water-measurement";
import { soloLine } from "@/lib/amazing-shuk/solo-copy";
import PreviewWaterTask from "./PreviewWaterTask";
import { MISSION_VICTORY, WELL_DISCOVERY } from "@/lib/amazing-shuk/mission-completion";
type Props = {
  cups: WaterCups; completed: boolean; activeRole: WaterSubmissionRole; busy: boolean;
<<<<<<< HEAD
  interaction: WaterInteraction; performance: WaterPerformanceView;
  onExplore: () => void;
=======
  interaction: WaterInteraction; performance: WaterPerformanceView; solo?: boolean;
>>>>>>> bb4234fb5b66e55047f6343e266fa8ee539f0a27
  onSelect: (id: WaterContainerId, move: WaterMove | null) => void;
  onAction: (action: WaterActionView["id"]) => void; onCancelPour: () => void;
  onStart: () => void; onSubmit: () => void; onReset: () => void; onOpenRoles?: () => void;
  // The hint sheet and "I'm completely stuck" (IndexChallengeHelp), shown during play.
  help?: ReactNode;
  // UX-3: the challenge only after the server's accepted Start (default); `false` keeps the old screen.
  storyFirst?: boolean;
};
<<<<<<< HEAD
export default function ListWaterTask({ cups, completed, activeRole, busy, interaction, performance, ...callbacks }: Props) {
  return <PreviewWaterTask view={buildWaterTaskView(cups, completed, activeRole, busy, interaction, performance.started)} narrative={WATER_TASK.narrative}
    performance={performance} victory={MISSION_VICTORY} discovery={WELL_DISCOVERY} hints={visibleWaterHints(performance.hintsUsed)} hasMoreHints={performance.started && !completed && cups.jar < 4 && performance.hintsUsed < WATER_HINTS.length} {...callbacks} />;
=======
export default function ListWaterTask({ cups, completed, activeRole, busy, interaction, performance, solo = false, ...callbacks }: Props) {
  const view = buildWaterTaskView(cups, completed, activeRole, busy, interaction, performance.started, performance.canAnswer ?? true);
  return <PreviewWaterTask view={{ ...view, status: soloLine(view.status, solo) }} narrative={WATER_TASK.narrative}
    performance={performance} answer={performance.revealed ? waterAnswer() : undefined} {...callbacks} />;
>>>>>>> bb4234fb5b66e55047f6343e266fa8ee539f0a27
}
