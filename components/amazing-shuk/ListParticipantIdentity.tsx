import { buildParticipantIdentities, roleLabel, type ParticipantIdentity } from "@/lib/amazing-shuk/participant-identity";
import type { GroupRoleAssignments, ParticipantRole } from "@/lib/amazing-shuk/roles";
import PreviewParticipantIdentity from "./PreviewParticipantIdentity";
import styles from "./ListParticipantIdentity.module.scss";
type Props = { participants: readonly ParticipantIdentity[]; roles: GroupRoleAssignments; currentId: string; currentRole: ParticipantRole | "guide" };
export default function ListParticipantIdentity({ participants, roles, currentId, currentRole }: Props) {
  const view = buildParticipantIdentities(participants, roles, currentId);
  return <div className={styles.group}>
    {view.current ? <PreviewParticipantIdentity {...view.current} label="Signed in as" showResponsibilities={false} /> : null}
    <ul className={styles.assignments} aria-label="Group role assignments">
      {view.assignments.map(participant => <li key={participant.participantId}><PreviewParticipantIdentity {...participant} /></li>)}
      {view.unassigned.map(role => <li key={role}>{role}: free (anyone can take it in the Group tab)</li>)}
    </ul>
    <p>Your role: {roleLabel(currentRole)}</p>
  </div>;
}
