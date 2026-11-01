import { buildGroupRoster, buildRoleAssignees, buildRoleChoices, type ParticipantIdentity, type RoleChoiceView } from "@/lib/amazing-shuk/participant-identity";
import type { GroupRoleAssignments } from "@/lib/amazing-shuk/roles";
import PreviewParticipantIdentity from "./PreviewParticipantIdentity";
import PreviewRoleChoices from "./PreviewRoleChoices";
import styles from "./ListGroupOverview.module.scss";

type Props = {
  participants: readonly ParticipantIdentity[]; roles: GroupRoleAssignments; currentId: string;
  missions: readonly { state: string }[]; balance: { points: number; foodTokens: number };
  guide: boolean; busy: boolean; onClaim: (role: RoleChoiceView["role"]) => void; onRelease: (role: RoleChoiceView["role"]) => void;
  // The team's leader session (I4a): Change on each role. The server checks it again.
  leader: boolean; onAssign: (role: RoleChoiceView["role"], participantId: string | null) => void;
};
/** The Group tab: shared progress, the two roles players choose for themselves, then everyone with their avatar and role. */
export default function ListGroupOverview({ participants, roles, currentId, missions, balance, guide, busy, onClaim, onRelease, leader, onAssign }: Props) {
  const roster = buildGroupRoster(participants, roles, currentId);
  const completed = missions.filter(mission => mission.state === "completed").length;
  return <section className={styles.group} aria-labelledby="group-title">
    <h2 id="group-title" className={styles.title}>Group</h2>
    <dl className={styles.progress} aria-label="Shared progress">
      <div><dt>Missions completed</dt><dd>{completed} of {missions.length}</dd></div>
      <div><dt>Group points</dt><dd>{balance.points}</dd></div>
      <div><dt>Food tokens</dt><dd>{balance.foodTokens}</dd></div>
    </dl>
    <PreviewRoleChoices choices={buildRoleChoices(participants, roles, currentId, guide)} guide={guide} busy={busy} onClaim={onClaim} onRelease={onRelease}
      {...(leader && !guide ? { assignees: buildRoleAssignees(participants, currentId), onAssign } : {})} />
    <ul className={styles.roster} aria-label="Participants">
      {roster.map(({ current, ...member }) => <li key={member.participantId} className={current ? styles.current : undefined}>
        <PreviewParticipantIdentity {...member} label={current ? "You" : undefined} />
      </li>)}
    </ul>
  </section>;
}
