import { Icon } from "@/components/icons";
import ActionButton from "@/components/ui/ActionButton";
import type { LobbyView } from "@/lib/amazing-shuk/adventure-lobby";
import type { LobbyCopy } from "@/lib/amazing-shuk/welcome-copy";
import styles from "./PreviewAdventureLobby.module.scss";

type Props = { copy: LobbyCopy; lobby: LobbyView; lead: string | null; busy: boolean; message: string; onStep: (delta: -1 | 1) => void; onStart: () => void };
/** The lobby: who is setting up, how many are playing, the recommended teams, and Start Adventure. Players without lobby powers see the waiting state only. */
export default function PreviewAdventureLobby({ copy, lobby, lead, busy, message, onStep, onStart }: Props) {
  return <section className={styles.lobby} aria-labelledby="lobby-title">
    <p className={styles.eyebrow}>{copy.eyebrow}</p>
    <h1 id="lobby-title" className={styles.title}>{copy.title}</h1>
    {lead ? <p className={styles.lead}>{lead}</p> : <div className={styles.card} role="status">
      <h2 className={styles.question}>{copy.waitingTitle}</h2>
      <p className={styles.help}>{copy.waiting}</p>
    </div>}
    {lobby.canManage ? <>
      <fieldset className={styles.card}>
        <legend className={styles.question}>{copy.countQuestion}</legend>
        <p className={styles.help}>{copy.countHelp}</p>
        <div className={styles.stepper}>
          <button type="button" className={styles.step} aria-label={copy.decrease} disabled={busy || !lobby.canDecrease} onClick={() => onStep(-1)}>
            <Icon name="minus" className={styles.stepIcon} />
          </button>
          <output className={styles.count} aria-live="polite">{lobby.count ?? copy.countEmpty}</output>
          <button type="button" className={styles.step} aria-label={copy.increase} disabled={busy || !lobby.canIncrease} onClick={() => onStep(1)}>
            <Icon name="plus" className={styles.stepIcon} />
          </button>
        </div>
      </fieldset>
      {lobby.recommendation ? <div className={styles.card}>
        <h2 className={styles.question}>{copy.recommendedTeams(lobby.recommendation.teams)}</h2>
        <p className={styles.recommendation}><Icon name="team" className={styles.recommendationIcon} />{copy.suggestedSplit(lobby.recommendation.sizes)}</p>
        {/* A recommendation only: no team beyond the first exists until multiple teams are built (I7a), so such a group can't start yet. */}
        {lobby.needsTeams ? <div className={styles.notYet} id="lobby-not-yet"><Icon name="info" className={styles.notYetIcon} />
          <p><strong>{copy.needsTeamsTitle}</strong> {copy.needsTeams}</p></div> : null}
      </div> : null}
      <div className={styles.action}>
        <ActionButton block icon="arrowForward" className={styles.start} disabled={busy || !lobby.canStart} onClick={onStart}
          aria-describedby={lobby.needsTeams ? "lobby-not-yet" : undefined}>{busy ? copy.starting : copy.start}</ActionButton>
        {lobby.count === null ? <p className={styles.help}>{copy.needCount}</p> : null}
      </div>
    </> : null}
    <p className={styles.message} role="status">{message}</p>
  </section>;
}
