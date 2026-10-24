import { buildParticipantIdentities, type ParticipantIdentity } from "@/lib/amazing-shuk/participant-identity";
import type { GroupRoleAssignments } from "@/lib/amazing-shuk/roles";
import ParticipantAvatar from "./ParticipantAvatar";
import styles from "./ListParticipantBadges.module.scss";
type Props = { participants: readonly ParticipantIdentity[]; roles: GroupRoleAssignments; currentId: string };
/** One compact line: who navigates and who submits answers, so everyone can find them without opening the profile. */
export default function ListParticipantBadges({ participants, roles, currentId }: Props) {
  const view = buildParticipantIdentities(participants, roles, currentId);
  return <ul className={styles.badges} aria-label="Group roles">
    {view.assignments.map(participant => <li key={participant.participantId} className={styles.badge}>
      <ParticipantAvatar participantId={participant.participantId} displayName={participant.displayName} customImageSrc={participant.customImageSrc} size={24} label="" />
      <span><strong>{participant.displayName}</strong> {participant.responsibilities.join(" / ")}</span>
    </li>)}
    {view.unassigned.map(role => <li key={role} className={`${styles.badge} ${styles.unassigned}`}>{role}: Unassigned</li>)}
  </ul>;
}
