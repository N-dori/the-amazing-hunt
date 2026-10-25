import { buildGroupRoster, type ParticipantIdentity } from "@/lib/amazing-shuk/participant-identity";
import type { GroupRoleAssignments, GroupRoleCandidates } from "@/lib/amazing-shuk/roles";
import type { GroupAction } from "@/lib/amazing-shuk/group-action";
import PreviewParticipantIdentity from "./PreviewParticipantIdentity";
import PreviewGroupRole from "./PreviewGroupRole";
import styles from "./ListGroupRoles.module.scss";
type Props = { participants: readonly ParticipantIdentity[]; roles: GroupRoleAssignments; candidates: GroupRoleCandidates;
  currentId: string; guide: boolean; busy: boolean; onAction: (action: GroupAction) => void };
export default function ListGroupRoles({ participants, roles, candidates, currentId, guide, busy, onAction }: Props) {
  const identities = buildGroupRoster(participants, roles, currentId);
  return <section className={styles.roles} aria-labelledby="group-roles-title">
    <h3 id="group-roles-title">Current group roles</h3>
    {/* TODO(copy): approve new role status/control wording before publication. */}
    <p className={styles.draft}>Draft role-selection wording</p>
    {(["navigator", "answerSubmitter"] as const).map(role => {
      const holder = identities.find(p => p.participantId === roles[role]);
      return <div key={role}><strong>{role === "navigator" ? "Navigator" : "Answers"}</strong>
        {holder ? <PreviewParticipantIdentity {...holder} showResponsibilities={false} /> : <p>Unassigned</p>}</div>;
    })}
    {!guide ? <details><summary>Choose Roles</summary>
      {(["navigator", "answerSubmitter"] as const).map(role => <PreviewGroupRole key={role}
        title={role === "navigator" ? "Navigator" : "Answers"}
        responsibility={role === "navigator" ? "Leads the group's physical navigation." : "Enters and submits the group's official challenge answers."}
        holder={identities.find(p => p.participantId === roles[role]) ?? null}
        candidates={identities.filter(p => candidates[role].includes(p.participantId))}
        volunteerLabel={role === "navigator" ? "I'll Navigate" : "I'll Submit Answers"}
        active={roles[role] === currentId} volunteered={candidates[role].includes(currentId)} guide={guide} busy={busy}
        onVolunteer={() => onAction({ type: "volunteer-role", role })}
        onWithdraw={() => onAction({ type: "withdraw-role", role })} onStepDown={() => onAction({ type: "step-down-role", role })} />)}
    </details> : null}
  </section>;
}
