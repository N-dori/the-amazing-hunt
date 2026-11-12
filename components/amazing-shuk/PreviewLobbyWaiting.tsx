import type { Ref } from "react";
import type { StepperState } from "@/lib/amazing-shuk/adventure-lobby";
import type { LobbyCopy } from "@/lib/amazing-shuk/welcome-copy";
import PreviewLobbyStepper from "./PreviewLobbyStepper";
import styles from "./PreviewLobbyWaiting.module.scss";

type Props = { copy: LobbyCopy; brand: string; states: readonly StepperState[]; stageLine: string; yourRoles: string | null; message: string;
  headingRef: Ref<HTMLHeadingElement> };
/** The players' screen while the host gets ready (owner's note, 5 Nov 2026): the game's name, a loader in the brand colours, where
 * the host has got to, and the player's own roles once given. Never blank; nothing to press. */
export default function PreviewLobbyWaiting({ copy, brand, states, stageLine, yourRoles, message, headingRef }: Props) {
  return <section className={styles.waiting} aria-labelledby="lobby-title">
    <p className={styles.eyebrow}>{copy.eyebrow}</p>
    <p className={styles.brand}>{brand}</p>
    <div className={styles.centre}>
      {/* Three market stalls' awnings, one after another: a loader drawn in the brand tokens until the illustration exists. */}
      <span className={styles.loader} aria-hidden="true"><span /><span /><span /></span>
      <h1 id="lobby-title" className={styles.title} ref={headingRef} tabIndex={-1}>{copy.waitingTitle}</h1>
      <p className={styles.lead}>{copy.waiting}</p>
      <p className={styles.stage} role="status">{stageLine}</p>
      {yourRoles ? <p className={styles.yourRoles}>{yourRoles}</p> : null}
    </div>
    <PreviewLobbyStepper label={copy.stepperLabel} states={states} names={copy.stages} />
    <p className={styles.message} role="status">{message}</p>
  </section>;
}
