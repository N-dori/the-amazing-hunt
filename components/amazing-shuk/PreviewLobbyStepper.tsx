import { Icon } from "@/components/icons";
import type { LobbyStage, StepperState } from "@/lib/amazing-shuk/adventure-lobby";
import styles from "./PreviewLobbyStepper.module.scss";

type Props = { label: string; states: readonly StepperState[]; names: Readonly<Record<LobbyStage, string>> };
/** Where the group is in getting ready (owner's note, 5 Nov 2026): the host's steps, and the same steps, read-only, on the players'
 * waiting screen. An ordered list, the current step marked for screen readers; nothing here is pressable. */
export default function PreviewLobbyStepper({ label, states, names }: Props) {
  return <nav className={styles.stepper} aria-label={label}>
    <ol className={styles.steps}>
      {states.map((state, index) => <li key={state.stage} className={`${styles.step} ${styles[state.status]}`} aria-current={state.status === "current" ? "step" : undefined}>
        <span className={styles.marker} aria-hidden="true">{state.status === "done" ? <Icon name="check" className={styles.check} /> : index + 1}</span>
        <span className={styles.name}>{names[state.stage]}</span>
      </li>)}
    </ol>
  </nav>;
}
