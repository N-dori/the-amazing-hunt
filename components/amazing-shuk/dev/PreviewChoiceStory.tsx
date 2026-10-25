import styles from "./PreviewChoiceStory.module.scss";
type Props = {
  instruction: string; title: string; paragraphs: readonly { label: string; text: string }[];
  open: boolean; onToggle: () => void;
};
/** Evidence stays in content metadata; uncertainty belongs in the story's own wording. */
export default function PreviewChoiceStory({ instruction, title, paragraphs, open, onToggle }: Props) {
  return <section className={styles.story} aria-label="Mission story">
    <p className={styles.instruction}>{instruction}</p>
    <details open={open}>
      <summary onClick={event => { event.preventDefault(); onToggle(); }}><span>{title}</span><span className={styles.toggle}>{open ? "Hide story" : "Read story"}</span></summary>
      <div className={styles.prose}>{paragraphs.map(paragraph => <p key={paragraph.text}>{paragraph.text}</p>)}</div>
    </details>
  </section>;
}
