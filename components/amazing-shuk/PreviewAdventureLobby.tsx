import type { Ref } from "react";
import { Icon } from "@/components/icons";
import ActionButton from "@/components/ui/ActionButton";
import type { LobbyStep, LobbyView } from "@/lib/amazing-shuk/adventure-lobby";
import type { LobbyCopy } from "@/lib/amazing-shuk/welcome-copy";
import styles from "./PreviewAdventureLobby.module.scss";

type Props = { copy: LobbyCopy; lobby: LobbyView; step: LobbyStep; lead: string | null; busy: boolean; message: string; headingRef: Ref<HTMLHeadingElement>;
  onStep: (delta: -1 | 1) => void; onContinue: () => void; onChangeCount: () => void; onStart: () => void };
/** The lobby, one purpose per screen: the host's count, then Ready to Start (one team) or the teams recommendation (not startable yet).
 * Players without lobby powers see the waiting state only. */
export default function PreviewAdventureLobby({ copy, lobby, step, lead, busy, message, headingRef, onStep, onContinue, onChangeCount, onStart }: Props) {
  if (step === "waiting") return <section className={styles.lobby} aria-labelledby="lobby-title">
    <p className={styles.eyebrow}>{copy.eyebrow}</p>
    <div className={styles.waiting} role="status">
      <span className={styles.waitingBadge}><Icon name="team" className={styles.waitingIcon} /></span>
      <h1 id="lobby-title" className={styles.title} ref={headingRef} tabIndex={-1}>{copy.waitingTitle}</h1>
      <p className={styles.lead}>{copy.waiting}</p>
    </div>
    <p className={styles.message} role="status">{message}</p>
  </section>;

  const { recommendation } = lobby;
  return <section className={styles.lobby} aria-labelledby="lobby-title">
    <p className={styles.eyebrow}>{copy.eyebrow}</p>
    <h1 id="lobby-title" className={styles.title} ref={headingRef} tabIndex={-1}>{copy.title}</h1>
    {step === "count" ? <>
      {lead ? <p className={styles.lead}>{lead}</p> : null}
      <fieldset className={styles.card}>
        <legend className={styles.question}>{copy.countQuestion}</legend>
        <p className={styles.help}>{copy.countHelp}</p>
        <div className={styles.stepper}>
          <button type="button" className={styles.step} aria-label={copy.decrease} disabled={busy || !lobby.canDecrease} onClick={() => onStep(-1)}>
            <Icon name="minus" className={styles.stepIcon} />
          </button>
          <output className={`${styles.count} ${lobby.count === null ? styles.countEmpty : ""}`} aria-live="polite">{lobby.count ?? copy.countEmpty}</output>
          <button type="button" className={styles.step} aria-label={copy.increase} disabled={busy || !lobby.canIncrease} onClick={() => onStep(1)}>
            <Icon name="plus" className={styles.stepIcon} />
          </button>
        </div>
      </fieldset>
      <div className={styles.action}>
        <ActionButton block icon="arrowForward" className={styles.primary} disabled={busy || lobby.count === null} onClick={onContinue}
          aria-describedby={lobby.count === null ? "lobby-need-count" : undefined}>{copy.next}</ActionButton>
        {lobby.count === null ? <p className={styles.help} id="lobby-need-count">{copy.needCount}</p> : null}
      </div>
    </> : recommendation ? <>
      {/* The count the host chose, and the advice it gives. A recommendation only: no team beyond the first exists until multiple teams are built (I7a). */}
      <div className={styles.card}>
        <p className={styles.summary}><span className={styles.help}>{copy.countQuestion}</span><span className={styles.summaryCount}>{lobby.count}</span></p>
        <h2 className={styles.question}>{copy.recommendedTeams(recommendation.teams)}</h2>
        <p className={styles.recommendation}><Icon name="team" className={styles.recommendationIcon} />{copy.suggestedSplit(recommendation.sizes)}</p>
        {step === "teams" ? <div className={styles.notYet}><Icon name="info" className={styles.notYetIcon} />
          <p><strong>{copy.needsTeamsTitle}</strong> {copy.needsTeams}</p></div> : null}
      </div>
      {/* Ready to Start is the only step that can start; the teams step has no Start at all, and the server refuses one too. */}
      <div className={styles.action}>
        {step === "ready" ? <ActionButton block icon="arrowForward" className={styles.primary} disabled={busy || !lobby.canStart} onClick={onStart}>
          {busy ? copy.starting : copy.start}</ActionButton> : null}
        <ActionButton variant="quiet" className={styles.back} disabled={busy} onClick={onChangeCount}>{copy.changeCount}</ActionButton>
      </div>
    </> : null}
    <p className={styles.message} role="status">{message}</p>
  </section>;
}
