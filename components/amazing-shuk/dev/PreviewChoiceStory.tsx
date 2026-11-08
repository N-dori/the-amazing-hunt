import Picture from "@/components/media/Picture";
import type { ChoiceTaskContent } from "@/lib/amazing-shuk/choice-missions";
import styles from "./PreviewChoiceStory.module.scss";
type Props = {
  instruction: string; title: string; paragraphs: readonly { label: string; text: string }[];
  image?: ChoiceTaskContent["story"]["image"]; open: boolean; onToggle: () => void;
  // Before Start (UX-3) the story is the whole screen: always open, with no fold.
  collapsible?: boolean;
};
/** Evidence labels and the source stay in the data; players see the text only (owner's decision, 26 Oct 2026). */
export default function PreviewChoiceStory({ instruction, title, paragraphs, image, open, onToggle, collapsible = true }: Props) {
  const body = <>
    <div className={styles.prose}>{paragraphs.map(paragraph => <p key={paragraph.text}>{paragraph.text}</p>)}</div>
    {image ? <figure className={styles.figure}>
      <Picture src={image.src} width={image.width} height={image.height} alt={image.alt} className={styles.image} sizes="(min-width: 48rem) 24rem, 100vw" />
      <figcaption className={styles.caption}>{image.caption}</figcaption>
    </figure> : null}
  </>;
  return <section className={styles.story} aria-label="Mission story">
    <p className={styles.instruction}>{instruction}</p>
    {collapsible ? <details open={open}>
      <summary onClick={event => { event.preventDefault(); onToggle(); }}><span>{title}</span><span className={styles.toggle}>{open ? "Hide story" : "Read story"}</span></summary>
      {body}
    </details> : <><h3 className={styles.title}>{title}</h3>{body}</>}
  </section>;
}
