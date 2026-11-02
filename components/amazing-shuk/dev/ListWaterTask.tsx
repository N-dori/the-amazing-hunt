import type { WaterPerformanceView } from "@/lib/amazing-shuk/water-performance";
import { WATER_TASK } from "@/lib/amazing-shuk/water-task";
import { buildWaterTaskView, type WaterInteraction, type WaterActionView, type WaterContainerId } from "@/lib/amazing-shuk/water-task-view";
import { waterAnswer } from "@/lib/amazing-shuk/challenge-help";
import type { ReactNode } from "react";
import type { WaterCups, WaterMove, WaterSubmissionRole } from "@/lib/amazing-shuk/water-measurement";
import { soloLine } from "@/lib/amazing-shuk/solo-copy";
import PreviewWaterTask from "./PreviewWaterTask";
type Props = {
  cups: WaterCups; completed: boolean; activeRole: WaterSubmissionRole; busy: boolean;
  interaction: WaterInteraction; performance: WaterPerformanceView; solo?: boolean;
  onSelect: (id: WaterContainerId, move: WaterMove | null) => void;
  onAction: (action: WaterActionView["id"]) => void; onCancelPour: () => void;
  onStart: () => void; onSubmit: () => void; onReset: () => void; onOpenRoles?: () => void;
  // The hint sheet and "I'm completely stuck" (IndexChallengeHelp), shown during play.
  help?: ReactNode;
  // UX-3: the challenge only after the server's accepted Start (default); `false` keeps the old screen.
  storyFirst?: boolean;
};
export default function ListWaterTask({ cups, completed, activeRole, busy, interaction, performance, solo = false, ...callbacks }: Props) {
  const view = buildWaterTaskView(cups, completed, activeRole, busy, interaction, performance.started);
  return <PreviewWaterTask view={{ ...view, status: soloLine(view.status, solo) }} narrative={WATER_TASK.narrative}
    performance={performance} answer={performance.revealed ? waterAnswer() : undefined} {...callbacks} />;
}
