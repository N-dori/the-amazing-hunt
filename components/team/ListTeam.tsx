import { MOCK_SEATS_TAKEN, TEAM_SIZE, teams } from "@/lib/game/screens";
import type { TeamId } from "@/lib/game/types";
import PreviewTeam, { type TeamView } from "./PreviewTeam";
import styles from "./ListTeam.module.scss";

const TEAM_IDS: TeamId[] = ["A", "B"];

// Maps team copy and mock occupancy into view models. Joining adds the visitor's seat; a
// team already full (before the visitor) can't be chosen.
function teamViews(choice: TeamId | null): TeamView[] {
  return TEAM_IDS.map((id) => {
    const taken = MOCK_SEATS_TAKEN[id];
    const chosen = choice === id;
    return {
      id,
      name: teams[id].name.text,
      track: teams[id].track.text,
      summary: teams[id].summary.text,
      seats: Array.from({ length: TEAM_SIZE }, (_, i) => (i < taken ? "taken" : i === taken && chosen ? "you" : "open")),
      full: taken >= TEAM_SIZE,
      chosen,
    };
  });
}

export default function ListTeam({ choice, onChoose }: { choice: TeamId | null; onChoose: (id: TeamId) => void }) {
  return (
    <ul className={styles.list}>
      {teamViews(choice).map((team) => (
        <li key={team.id} className={styles.item}>
          <PreviewTeam team={team} onChoose={() => onChoose(team.id)} />
        </li>
      ))}
    </ul>
  );
}
