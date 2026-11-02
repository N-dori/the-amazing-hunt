import styles from "./PreviewRewardToast.module.scss";

type Props = { text: string; onDismiss: () => void };
// TODO(copy): "Dismiss" is a draft (Phase 2d).
/** A small, non-modal note of an award when this phone is on another screen: it never takes focus or interrupts reading. */
export default function PreviewRewardToast({ text, onDismiss }: Props) {
  return <div className={styles.toast} role="status">
    <p className={styles.text}>{text}</p>
    <button type="button" className={styles.dismiss} onClick={onDismiss}>Dismiss</button>
  </div>;
}
