"use client";
import type { GroupAction } from "@/lib/amazing-shuk/group-action";
import ActionButton from "@/components/ui/ActionButton";
import type { GuideTimingView } from "@/lib/amazing-shuk/water-performance";
import styles from "./IndexGuideWaterTask.module.scss";

type Props = { missionId: string; timing?: GuideTimingView; completed: boolean; canConfirmArrival?: boolean; busy: boolean; onAction: (action: GroupAction) => void };
/** Guide feature boundary. The server independently authorizes every callback. */
export default function IndexGuideWaterTask({ missionId, timing, completed, canConfirmArrival = false, busy, onAction }: Props) {
  if (!canConfirmArrival && (!timing || timing.startedAt === null)) return null;
  return <section className={styles.simulation} aria-label="Guide controls">
    <details className={styles.timingReview}>
      <summary>Guide controls</summary>
      {canConfirmArrival ? <ActionButton variant="quiet" disabled={busy} onClick={() => onAction({ type: "confirm-arrival", missionId })}>Confirm Group Arrival</ActionButton> : null}
    {timing && timing.startedAt !== null ? <details className={styles.timingReview}>
      <summary>Timing review (guide)</summary>
      <p>Started: {new Date(timing.startedAt).toISOString()}</p>
      {timing.solvedAt !== null ? <p>Solution recorded: {new Date(timing.solvedAt).toISOString()}</p> : null}
      {timing.stoppedElapsedMs !== null ? <p>Recorded duration: {Math.round(timing.stoppedElapsedMs / 1000)} seconds</p> : null}
      <p>{timing.excluded ? "Timing excluded from scoring." : timing.paused ? "Timing paused." : "Timing enabled."}</p>
      {!completed ? <div className={styles.guideControls}>
        {timing.solvedAt === null ? <>
          <ActionButton variant="quiet" disabled={busy} onClick={() => onAction({ type: "timing", operation: timing.paused ? "resume" : "pause", missionId })}>{timing.paused ? "Resume timing" : "Pause timing"}</ActionButton>
          <ActionButton variant="quiet" disabled={busy} onClick={() => onAction({ type: "timing", operation: "reset", missionId })}>Reset timing only</ActionButton>
        </> : null}
        <ActionButton variant="quiet" disabled={busy || timing.excluded} onClick={() => onAction({ type: "timing", operation: "exclude", missionId })}>Exclude timing</ActionButton>
      </div> : null}
    </details> : null}
    </details>
  </section>;
}
