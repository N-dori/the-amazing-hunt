import styles from "./PreviewWellStory.module.scss";
type Props = {
  instruction: string; title: string; label: string; paragraphs: readonly string[];
  open: boolean; onToggle: () => void;
};
export default function PreviewWellStory({ instruction, title, paragraphs, open, onToggle }: Props) {
  return <section className={styles.story} aria-label="Well story">
    <p className={styles.instruction}>{instruction}</p>
    <details open={open}>
      <summary onClick={event => { event.preventDefault(); onToggle(); }}><span>{title}</span><span className={styles.toggle}>{open ? "Hide story" : "Read story"}</span></summary>
      <div className={styles.prose}>{paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div>
    </details>
  </section>;
}
