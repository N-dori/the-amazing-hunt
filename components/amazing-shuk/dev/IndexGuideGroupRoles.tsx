"use client";
import { buildGroupRoster, type ParticipantIdentity } from "@/lib/amazing-shuk/participant-identity";
import type { GroupRoleAssignments, GroupRoleCandidates } from "@/lib/amazing-shuk/roles";
import type { GroupAction } from "@/lib/amazing-shuk/group-action";
import ActionButton from "@/components/ui/ActionButton";
import PreviewParticipantIdentity from "@/components/amazing-shuk/PreviewParticipantIdentity";
import styles from "../ListGroupRoles.module.scss";
type Props = { participants: readonly ParticipantIdentity[]; roles: GroupRoleAssignments; candidates: GroupRoleCandidates;
  busy: boolean; onAction: (action: GroupAction) => void };
/** Separate authenticated-guide feature. Server independently validates all assignments. */
export default function IndexGuideGroupRoles({ participants, roles, candidates, busy, onAction }: Props) {
  const roster = buildGroupRoster(participants, roles, "guide").filter(p => p.participantId !== "guide");
  return <details className={styles.roles}><summary>Change Roles</summary><section aria-label="Guide role confirmation">
    {(["navigator", "answerSubmitter"] as const).map(role => <div className={styles.role} key={role}>
      <h4>{role === "navigator" ? "Confirm navigator" : "Confirm answer-submitter"}</h4>
      <ul className={styles.candidates}>
        {roster.filter(p => candidates[role].includes(p.participantId)).map(candidate => <li key={candidate.participantId}>
          <PreviewParticipantIdentity {...candidate} showResponsibilities={false} />
          <ActionButton variant="quiet" disabled={busy || roles[role] === candidate.participantId}
            onClick={() => onAction({ type: "assign-role", role, participantId: candidate.participantId })}>Confirm {candidate.displayName}</ActionButton>
        </li>)}
      </ul>
      <label htmlFor={`group-assign-${role}`}>{role === "navigator" ? "Assign navigator" : "Assign answer-submitter"}</label>
      <select className={styles.select} id={`group-assign-${role}`} value={roles[role] ?? ""} disabled={busy}
        onChange={event => onAction({ type: "assign-role", role, participantId: event.target.value || null })}>
        <option value="">Unassigned</option>
        {roster.map(p => <option key={p.participantId} value={p.participantId}>{p.displayName}</option>)}
      </select>
    </div>)}
  </section></details>;
}
