"use client";
import type { GroupAction } from "@/lib/amazing-shuk/group-action";
import ActionButton from "@/components/ui/ActionButton";
import type { GuideTimingView } from "@/lib/amazing-shuk/water-performance";
import styles from "./IndexGuideWaterTask.module.scss";

<<<<<<< HEAD
type Props = { missionId: string; timing?: GuideTimingView; completed: boolean; canConfirmArrival?: boolean; busy: boolean; onAction: (action: GroupAction) => void };
/** Guide feature boundary. The server independently authorizes every callback. */
export default function IndexGuideWaterTask({ missionId, timing, completed, canConfirmArrival = false, busy, onAction }: Props) {
  if (!canConfirmArrival && (!timing || timing.startedAt === null)) return null;
  return <section className={styles.simulation} aria-label="Guide controls">
    <details className={styles.timingReview}>
      <summary>Guide controls</summary>
      {canConfirmArrival ? <ActionButton variant="quiet" disabled={busy} onClick={() => onAction({ type: "confirm-arrival", missionId })}>Confirm Group Arrival</ActionButton> : null}
    {timing && timing.startedAt !== null ? <details className={styles.timingReview}>
=======
// `participants`: the players the guide can give a role to, with their display names.
// `part`: where it sits. Role assignment belongs with the group (the Group tab); the timing review with the challenge it measures.
type Props = { part: "roles" | "timing"; participants: readonly { id: string; name: string }[]; missionId: string; roles: GroupRoleAssignments; timing?: GuideTimingView; completed: boolean; busy: boolean; onAction: (action: GroupAction) => void };
/** Guide feature boundary. The server independently authorizes every callback. */
export default function IndexGuideWaterTask({ part, participants, missionId, roles, timing, completed, busy, onAction }: Props) {
  if (part === "timing" && !(timing && timing.startedAt !== null)) return null;
  return <section className={styles.simulation} aria-label="Guide controls">
    {part === "roles" ? <div className={styles.guideControls}>
      <label className={styles.label} htmlFor="navigator">Assign navigator</label>
      <select id="navigator" value={roles.navigator ?? ""} disabled={busy}
        onChange={event => onAction({ type: "assign-role", role: "navigator", participantId: event.target.value || null })}>
        <option value="">Unassigned</option>
        {participants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
      <label className={styles.label} htmlFor="submitter">Assign answer-submitter</label>
      <select id="submitter" value={roles.answerSubmitter ?? ""} disabled={busy}
        onChange={event => onAction({ type: "assign-role", role: "answerSubmitter", participantId: event.target.value || null })}>
        <option value="">Unassigned</option>
        {participants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
    </div> : null}
    {part === "timing" && timing && timing.startedAt !== null ? <details className={styles.timingReview}>
>>>>>>> bb4234fb5b66e55047f6343e266fa8ee539f0a27
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
