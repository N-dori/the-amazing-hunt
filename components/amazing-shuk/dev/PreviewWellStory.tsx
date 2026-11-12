import styles from "./PreviewWellStory.module.scss";
type Props = {
<<<<<<< HEAD
  instruction: string; title: string; label: string; paragraphs: readonly string[];
  open: boolean; onToggle: () => void;
};
export default function PreviewWellStory({ instruction, title, paragraphs, open, onToggle }: Props) {
=======
  instruction: string; title: string; paragraphs: readonly string[];
  showOriginalHebrew: boolean; originalHebrew: readonly string[]; open: boolean; onToggle: () => void;
  // Before Start (UX-3) the story is the whole screen: always open, with no fold.
  collapsible?: boolean;
};
export default function PreviewWellStory({ instruction, title, paragraphs, showOriginalHebrew, originalHebrew, open, onToggle, collapsible = true }: Props) {
  const body = <>
    <div className={styles.prose}>{paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div>
    {/* The source stays in the data for review; players never see it. The original Hebrew is for development only. */}
    {showOriginalHebrew ? <details className={styles.original}>
      <summary>Original Hebrew</summary>
      {originalHebrew.map(paragraph => <p className="rtl" lang="he" key={paragraph}>{paragraph}</p>)}
    </details> : null}
  </>;
>>>>>>> bb4234fb5b66e55047f6343e266fa8ee539f0a27
  return <section className={styles.story} aria-label="Well story">
    <p className={styles.instruction}>{instruction}</p>
    {collapsible ? <details open={open}>
      <summary onClick={event => { event.preventDefault(); onToggle(); }}><span>{title}</span><span className={styles.toggle}>{open ? "Hide story" : "Read story"}</span></summary>
<<<<<<< HEAD
      <div className={styles.prose}>{paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div>
    </details>
=======
      {body}
    </details> : <><h3 className={styles.title}>{title}</h3>{body}</>}
>>>>>>> bb4234fb5b66e55047f6343e266fa8ee539f0a27
  </section>;
}
