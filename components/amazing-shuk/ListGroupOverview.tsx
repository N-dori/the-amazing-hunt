import { buildGroupRoster, type ParticipantIdentity } from "@/lib/amazing-shuk/participant-identity";
import type { GroupRoleAssignments } from "@/lib/amazing-shuk/roles";
import PreviewParticipantIdentity from "./PreviewParticipantIdentity";
import styles from "./ListGroupOverview.module.scss";

type Props = {
  participants: readonly ParticipantIdentity[]; roles: GroupRoleAssignments; currentId: string;
  missions: readonly { state: string }[]; balance: { points: number; foodTokens: number };
};
/** The Group tab: shared progress first, then everyone with their avatar and responsibilities. Role changes stay with the guide. */
export default function ListGroupOverview({ participants, roles, currentId, missions, balance }: Props) {
  const roster = buildGroupRoster(participants, roles, currentId);
  const completed = missions.filter(mission => mission.state === "completed").length;
  return <section className={styles.group} aria-labelledby="group-title">
    <h2 id="group-title" className={styles.title}>Group</h2>
    <dl className={styles.progress} aria-label="Shared progress">
      <div><dt>Missions completed</dt><dd>{completed} of {missions.length}</dd></div>
      <div><dt>Group points</dt><dd>{balance.points}</dd></div>
      <div><dt>Food tokens</dt><dd>{balance.foodTokens}</dd></div>
    </dl>
    <ul className={styles.roster} aria-label="Participants">
      {roster.map(({ current, ...member }) => <li key={member.participantId} className={current ? styles.current : undefined}>
        <PreviewParticipantIdentity {...member} label={current ? "You" : undefined} />
      </li>)}
    </ul>
  </section>;
}
