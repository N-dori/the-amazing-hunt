import { Icon } from "@/components/icons";
import ActionButton from "@/components/ui/ActionButton";
import type { GroupSummary, TeamOverviewView } from "@/lib/amazing-shuk/adventure-lobby";
import type { LobbyCopy } from "@/lib/amazing-shuk/welcome-copy";
import styles from "./PreviewLobbyTeams.module.scss";

type Props = { copy: LobbyCopy; summary: GroupSummary; teams: readonly TeamOverviewView[]; created: boolean; busy: boolean; linkBusy: string | null; notice: string;
  onCreate: () => void; onShare: (teamId: string) => void };
/** The host's teams (I7a, owner, 6 Nov 2026): the recommended groups, then one row per team: its initials (standing in for the avatar),
 * its name or "Team B", its leader's status, players and readiness, and Share invite for every team but the host's own. The invitation
 * itself is never shown here; Share and Copy hand it on. */
export default function PreviewLobbyTeams({ copy, summary, teams, created, busy, linkBusy, notice, onCreate, onShare }: Props) {
  return <div className={styles.teams}>
    {summary?.kind === "groups" ? <div className={styles.summary}>
      <p className={styles.groups}>{copy.groups(summary.groups)}</p>
      <p className={styles.sizes}><Icon name="team" className={styles.icon} />{copy.groupSizes(summary.sizes)}</p>
    </div> : null}
    {!created ? <ActionButton block icon="team" disabled={busy} onClick={onCreate}>{copy.createTeams}</ActionButton> : <ul className={styles.list}>
      {teams.map(team => {
        const label = team.name ?? copy.teamLabel(team.id);
        return <li key={team.id} className={styles.row}>
          <span className={styles.avatar} aria-hidden="true">{team.initials}</span>
          <span className={styles.details}>
            <strong className={styles.name}>{label}</strong>
            <span className={styles.status}>{team.host ? copy.leaderStatus.host : copy.leaderStatus[team.leader]} · {copy.teamMembers(team.members)}</span>
            <span className={team.ready ? styles.ready : styles.notReady}>
              <Icon name={team.ready ? "check" : "timer"} className={styles.icon} />{team.ready ? copy.teamReady : copy.teamNotReady}
            </span>
          </span>
          {team.host ? null : <ActionButton variant={team.leader === "accepted" ? "quiet" : "primary"} disabled={busy || linkBusy !== null}
            aria-label={`${team.leader === "none" ? copy.shareInvite : copy.newInvite}: ${label}`} onClick={() => onShare(team.id)}>
            {linkBusy === team.id ? "…" : team.leader === "none" ? copy.shareInvite : copy.newInvite}
          </ActionButton>}
        </li>;
      })}
    </ul>}
    <p className={styles.notice} role="status">{notice}</p>
  </div>;
}
