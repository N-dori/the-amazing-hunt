import styles from "./PreviewWellStory.module.scss";
type Props = {
  instruction: string; title: string; label: string; paragraphs: readonly string[];
  source: string; showOriginalHebrew: boolean; originalHebrew: readonly string[]; open: boolean; onToggle: () => void;
};
export default function PreviewWellStory({ instruction, title, label, paragraphs, source, showOriginalHebrew, originalHebrew, open, onToggle }: Props) {
  return <section className={styles.story} aria-label="Well story">
    <p className={styles.instruction}>{instruction}</p>
    <details open={open}>
      <summary onClick={event => { event.preventDefault(); onToggle(); }}><span>{title}</span><span className={styles.toggle}>{open ? "Hide story" : "Read story"}</span></summary>
      <p className={styles.label}>{label}</p>
      <div className={styles.prose}>{paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div>
      <details className={styles.original}>
        <summary>{showOriginalHebrew ? "Source and original Hebrew" : "Source"}</summary>
        <cite className={styles.source}>{source}</cite>
        {showOriginalHebrew ? originalHebrew.map(paragraph => <p className="rtl" lang="he" key={paragraph}>{paragraph}</p>) : null}
      </details>
    </details>
  </section>;
}
