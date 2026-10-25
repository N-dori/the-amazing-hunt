"use client";
import { useState } from "react";
import { GATEWAY_DISCOVERY, GATEWAY_VICTORY } from "@/lib/amazing-shuk/mission-completion";
import { GATEWAY_LANGUAGES, GATEWAY_YEAR, MONTEFIORE_MISSION_ID, MONTEFIORE_TASK } from "@/lib/amazing-shuk/montefiore-task";
import { buildGatewayView } from "@/lib/amazing-shuk/gateway-view";
import type { GatewayProgress } from "@/lib/amazing-shuk/gateway-progress";
import type { GroupAction } from "@/lib/amazing-shuk/group-action";
import type { WaterPerformanceView } from "@/lib/amazing-shuk/water-performance";
import type { WaterSubmissionRole } from "@/lib/amazing-shuk/water-measurement";
import PreviewChoiceStory from "./PreviewChoiceStory";
import ListChoiceTask from "./ListChoiceTask";
import PreviewGatewayTask from "./PreviewGatewayTask";

type Props = { progress: GatewayProgress; performance: WaterPerformanceView; activeRole: WaterSubmissionRole; busy: boolean; feedback: string;
  onExplore: () => void;
  draft: { base: string; value: string } | null; onDraftChange: (draft: { base: string; value: string } | null) => void;
  onAction: (action: GroupAction) => Promise<void> };
const languageContent = { ...MONTEFIORE_TASK, question: MONTEFIORE_TASK.languageQuestion, hints: [], reveal: { image: null } };
export default function IndexGatewayTask({ progress, performance, activeRole, busy, feedback, draft, onDraftChange, onAction, onExplore }: Props) {
  const [storyOpen,setStoryOpen] = useState(true);
  const year = draft?.base === progress.yearAnswer ? draft.value : progress.yearAnswer;
  const view = buildGatewayView(progress,activeRole,busy);
  const missionId = MONTEFIORE_MISSION_ID;
  const submitYear = async () => {
    await onAction({ type: "set-gateway-year", missionId, stage: "year", answer: year });
    await onAction({ type: "submit", missionId, stage: "year" });
  };
  return <>
    {progress.stage !== "completed" ? <><h2>{MONTEFIORE_TASK.title}</h2>
    <PreviewChoiceStory {...MONTEFIORE_TASK.story} instruction={MONTEFIORE_TASK.instruction} open={storyOpen} onToggle={() => setStoryOpen(!storyOpen)} /></> : null}
    {progress.stage === "languages" ? <ListChoiceTask task={languageContent} challenge={GATEWAY_LANGUAGES}
      selected={progress.selected} completed={false} activeRole={activeRole} busy={busy} performance={performance} feedback={feedback}
      onExplore={onExplore}
      onToggle={optionId => void onAction({ type: "toggle-choice", missionId, stage: "languages", optionId })}
      onStart={() => void onAction({ type: "start", missionId })} onHint={() => {}}
      onSubmit={() => void onAction({ type: "submit", missionId, stage: "languages" })}
      onReset={() => void onAction({ type: "reset", missionId, stage: "languages" })} />
      : <PreviewGatewayTask view={view} victory={GATEWAY_VICTORY} discovery={GATEWAY_DISCOVERY} onExplore={onExplore} year={year} inscription={GATEWAY_YEAR.inscription} question={MONTEFIORE_TASK.yearQuestion}
        hints={MONTEFIORE_TASK.hints.slice(0,performance.hintsUsed)} hasMoreHints={performance.hintsUsed < MONTEFIORE_TASK.hints.length}
        reward={performance.reward} feedback={feedback} onChange={value => onDraftChange({ base: progress.yearAnswer,value })}
        onSubmit={() => void submitYear()} onHint={() => void onAction({ type: "hint", missionId, stage: "year", hint: performance.hintsUsed + 1 })}
        onReset={() => { onDraftChange(null); void onAction({ type: "reset", missionId, stage: "year" }); }} />}
  </>;
}
