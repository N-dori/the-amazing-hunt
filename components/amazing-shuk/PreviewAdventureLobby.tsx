import { Icon } from "@/components/icons";
import ActionButton from "@/components/ui/ActionButton";
import type { LobbyView } from "@/lib/amazing-shuk/adventure-lobby";
import type { LobbyCopy } from "@/lib/amazing-shuk/welcome-copy";
import styles from "./PreviewAdventureLobby.module.scss";

type Props = { copy: LobbyCopy; lobby: LobbyView; lead: string; busy: boolean; message: string; onStep: (delta: -1 | 1) => void; onStart: () => void };
/** The lobby: who is setting up, how many are playing, the recommended teams, and Start Adventure. Players without lobby powers see the lead only. */
export default function PreviewAdventureLobby({ copy, lobby, lead, busy, message, onStep, onStart }: Props) {
  return <section className={styles.lobby} aria-labelledby="lobby-title">
    <p className={styles.eyebrow}>{copy.eyebrow}</p>
    <h1 id="lobby-title" className={styles.title}>{copy.title}</h1>
    <p className={styles.lead}>{lead}</p>
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
        <h2 className={styles.question}>{copy.recommendationHeading}</h2>
        <p className={styles.recommendation}><Icon name="team" className={styles.recommendationIcon} />{copy.recommendation(lobby.recommendation.teams, lobby.recommendation.sizes)}</p>
        {/* A recommendation only: no team beyond the first exists until multiple teams are built (I7a). */}
        {lobby.startsAsOneTeam ? <p className={styles.notYet}><Icon name="info" className={styles.notYetIcon} />{copy.notYet}</p> : null}
      </div> : null}
      <div className={styles.action}>
        <ActionButton block icon="arrowForward" className={styles.start} disabled={busy || !lobby.canStart} onClick={onStart}>{busy ? copy.starting : lobby.startsAsOneTeam ? copy.startAsOneTeam : copy.start}</ActionButton>
        {lobby.count === null ? <p className={styles.help}>{copy.needCount}</p> : null}
      </div>
    </> : null}
    <p className={styles.message} role="status">{message}</p>
  </section>;
}
