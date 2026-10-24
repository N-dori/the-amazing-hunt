"use client";
import { DEV_PARTICIPANTS, type DevWaterAction } from "@/lib/amazing-shuk/dev-water-session";
import ActionButton from "@/components/ui/ActionButton";
import type { GuideTimingView } from "@/lib/amazing-shuk/water-performance";
import type { GroupRoleAssignments } from "@/lib/amazing-shuk/roles";
import styles from "./IndexGuideWaterTask.module.scss";

type Props = { roles: GroupRoleAssignments; timing?: GuideTimingView; completed: boolean; busy: boolean; onAction: (action: DevWaterAction) => void };
/** Guide feature boundary. The server independently authorizes every callback. */
export default function IndexGuideWaterTask({ roles, timing, completed, busy, onAction }: Props) {
  return <section className={styles.simulation} aria-label="Guide controls">
    <div className={styles.guideControls}>
      <label className={styles.label} htmlFor="navigator">Assign navigator</label>
      <select id="navigator" value={roles.navigator ?? ""} disabled={busy}
        onChange={event => onAction({ type: "assign-role", role: "navigator", participantId: event.target.value || null })}>
        <option value="">Unassigned</option>
        {DEV_PARTICIPANTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
      <label className={styles.label} htmlFor="submitter">Assign answer-submitter</label>
      <select id="submitter" value={roles.answerSubmitter ?? ""} disabled={busy}
        onChange={event => onAction({ type: "assign-role", role: "answerSubmitter", participantId: event.target.value || null })}>
        <option value="">Unassigned</option>
        {DEV_PARTICIPANTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
    </div>
    {timing && timing.startedAt !== null ? <details className={styles.timingReview}>
      <summary>Timing review (guide)</summary>
      <p>Started: {new Date(timing.startedAt).toISOString()}</p>
      {timing.solvedAt !== null ? <p>Solution recorded: {new Date(timing.solvedAt).toISOString()}</p> : null}
      {timing.stoppedElapsedMs !== null ? <p>Recorded duration: {Math.round(timing.stoppedElapsedMs / 1000)} seconds</p> : null}
      <p>{timing.excluded ? "Timing excluded from scoring." : timing.paused ? "Timing paused." : "Timing enabled."}</p>
      {!completed ? <div className={styles.guideControls}>
        {timing.solvedAt === null ? <>
          <ActionButton variant="quiet" disabled={busy} onClick={() => onAction({ type: "timing", operation: timing.paused ? "resume" : "pause" })}>{timing.paused ? "Resume timing" : "Pause timing"}</ActionButton>
          <ActionButton variant="quiet" disabled={busy} onClick={() => onAction({ type: "timing", operation: "reset" })}>Reset timing only</ActionButton>
        </> : null}
        <ActionButton variant="quiet" disabled={busy || timing.excluded} onClick={() => onAction({ type: "timing", operation: "exclude" })}>Exclude timing</ActionButton>
      </div> : null}
    </details> : null}
  </section>;
}
