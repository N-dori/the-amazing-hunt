import { Icon } from "@/components/icons";
import ActionButton from "@/components/ui/ActionButton";
import type { TEAM_JOIN_COPY, TeamJoinStage } from "@/lib/amazing-shuk/team-membership";
import styles from "./PreviewTeamJoin.module.scss";

type Props = { copy: typeof TEAM_JOIN_COPY; stage: TeamJoinStage; name: string; code: string | null; approved: boolean; busy: boolean; message: string;
  onName: (name: string) => void; onAsk: () => void };
/** The joining phone, one purpose per screen like the lobby: an optional name and Ask to join, then the wait with the check code.
 * A request that ended, or join links switched off, gets one plain line and no form. */
export default function PreviewTeamJoin({ copy, stage, name, code, approved, busy, message, onName, onAsk }: Props) {
  return <main className={styles.lobby}>
    <p className={styles.eyebrow}>{copy.eyebrow}</p>
    {stage === "ask" ? <>
      <h1 className={styles.title}>{copy.title}</h1>
      <p className={styles.lead}>{copy.lead}</p>
      <form className={styles.card} onSubmit={event => { event.preventDefault(); onAsk(); }}>
        <label className={styles.question} htmlFor="join-name">{copy.nameLabel}</label>
        <input id="join-name" className={styles.field} type="text" autoComplete="given-name" maxLength={40} value={name}
          aria-describedby="join-name-help" onChange={event => onName(event.target.value)} />
        <p className={styles.help} id="join-name-help">{copy.nameHelp}</p>
        <div className={styles.action}>
          <ActionButton block type="submit" icon="arrowForward" className={styles.primary} disabled={busy}>{busy ? copy.asking : copy.ask}</ActionButton>
        </div>
      </form>
    </> : stage === "waiting" ? <div className={styles.waiting} role="status">
      <span className={styles.waitingBadge}><Icon name="team" className={styles.waitingIcon} /></span>
      <h1 className={styles.title}>{approved ? copy.joining : copy.waitingTitle}</h1>
      {code ? <><p className={styles.lead}>{copy.codeIntro}</p><p className={styles.code} aria-label={code.split("").join(" ")}>{code}</p></> : null}
    </div> : stage === "declined" || stage === "ended" || stage === "unavailable" ? <div className={styles.waiting} role="status">
      <h1 className={styles.title}>{stage === "declined" ? copy.declined : stage === "ended" ? copy.ended : copy.linksOff}</h1>
    </div> : null}
    <p className={styles.message} role="status">{message}</p>
  </main>;
}
