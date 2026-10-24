import styles from "./PreviewChoiceStory.module.scss";
type Props = {
  instruction: string; title: string; paragraphs: readonly { label: string; text: string }[];
  source: string; open: boolean; onToggle: () => void;
};
/** Each paragraph shows its own evidence label, so a fact and a tradition are never one statement. */
export default function PreviewChoiceStory({ instruction, title, paragraphs, source, open, onToggle }: Props) {
  return <section className={styles.story} aria-label="Mission story">
    <p className={styles.instruction}>{instruction}</p>
    <details open={open}>
      <summary onClick={event => { event.preventDefault(); onToggle(); }}><span>{title}</span><span className={styles.toggle}>{open ? "Hide story" : "Read story"}</span></summary>
      <div className={styles.prose}>{paragraphs.map(paragraph => <div key={paragraph.text}>
        <p className={styles.label}>{paragraph.label}</p>
        <p>{paragraph.text}</p>
      </div>)}</div>
      <details className={styles.original}>
        <summary>Source</summary>
        <cite className={styles.source}>{source}</cite>
      </details>
    </details>
  </section>;
}
