import { buildParticipantIdentities, roleLabel, type ParticipantIdentity } from "@/lib/amazing-shuk/participant-identity";
import type { GroupRoleAssignments, ParticipantRole } from "@/lib/amazing-shuk/roles";
import PreviewParticipantIdentity from "./PreviewParticipantIdentity";
import styles from "./ListParticipantIdentity.module.scss";
type Props = { participants: readonly ParticipantIdentity[]; roles: GroupRoleAssignments; currentId: string; currentRole: ParticipantRole | "guide" };
/** The profile's identity: who is signed in and their own role. The group's roles live in the group sheet and the Group tab. */
export default function ListParticipantIdentity({ participants, roles, currentId, currentRole }: Props) {
  const view = buildParticipantIdentities(participants, roles, currentId);
  return <div className={styles.group}>
    {view.current ? <PreviewParticipantIdentity {...view.current} label="Signed in as" showResponsibilities={false} /> : null}
    <p>Your role: {roleLabel(currentRole)}</p>
  </div>;
}
