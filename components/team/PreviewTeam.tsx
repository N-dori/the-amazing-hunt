import { Icon } from "@/components/icons";
import { TEAM_SIZE, teamScreen } from "@/lib/game/screens";
import type { TeamId } from "@/lib/game/types";
import styles from "./PreviewTeam.module.scss";

export type TeamView = {
  id: TeamId;
  name: string;
  track: string;
  summary: string;
  seats: ("taken" | "you" | "open")[];
  full: boolean;
  chosen: boolean;
};

// One team as a selectable row: letter mark, track, summary and three seats.
export default function PreviewTeam({ team, onChoose }: { team: TeamView; onChoose: () => void }) {
  const joined = team.seats.filter((s) => s !== "open").length;
  const classes = [styles.team, team.id === "A" ? styles.teamA : styles.teamB, team.chosen ? styles.chosen : ""].join(" ");

  return (
    <button type="button" className={classes} aria-pressed={team.chosen} disabled={team.full} onClick={onChoose}>
      <span className={styles.letter} aria-hidden="true">
        {team.id}
      </span>
      <span className={styles.body}>
        <span className={styles.name}>{team.name}</span>
        <span className={styles.track}>{team.track}</span>
        <span className={styles.summary}>{team.summary}</span>
        <span className={styles.seats}>
          {team.seats.map((seat, i) => (
            <span key={i} className={`${styles.seat} ${styles[seat]}`} aria-hidden="true">
              {seat === "you" ? <Icon name="check" className={styles.seatIcon} /> : null}
            </span>
          ))}
          <span className={styles.count}>
            {team.full ? teamScreen.full.text : `${joined} / ${TEAM_SIZE}`}
            {team.chosen ? <span className={styles.youLabel}>{teamScreen.you.text}</span> : null}
          </span>
        </span>
      </span>
    </button>
  );
}
