import { buildParticipantIdentities, type ParticipantIdentity } from "@/lib/amazing-shuk/participant-identity";
import type { GroupRoleAssignments } from "@/lib/amazing-shuk/roles";
import PreviewParticipantIdentity from "./PreviewParticipantIdentity";
import styles from "./ListParticipantIdentity.module.scss";
type Props = { participants: readonly ParticipantIdentity[]; roles: GroupRoleAssignments; currentId: string; currentRole: string };
export default function ListParticipantIdentity({ participants, roles, currentId, currentRole }: Props) {
  const view = buildParticipantIdentities(participants, roles, currentId);
  return <div className={styles.group}>
    {view.current ? <PreviewParticipantIdentity {...view.current} label="Signed in as" showResponsibilities={false} /> : null}
    <ul className={styles.assignments} aria-label="Group role assignments">
      {view.assignments.map(participant => <li key={participant.participantId}><PreviewParticipantIdentity {...participant} /></li>)}
      {view.unassigned.map(role => <li key={role}>{role}: Unassigned</li>)}
    </ul>
    <p>Your role: {currentRole}</p>
  </div>;
}
