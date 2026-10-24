import Image from "next/image";
import { BASE_PATH } from "@/lib/base-path";
import styles from "./PreviewMuralStory.module.scss";
type Props = {
  instruction: string; title: string; paragraphs: readonly { label: string; text: string }[];
  image: { src: string; width: number; height: number; alt: string; caption: string };
  source: string; open: boolean; onToggle: () => void;
};
/** Each paragraph shows its own evidence label, so a fact and a tradition are never one statement. */
export default function PreviewMuralStory({ instruction, title, paragraphs, image, source, open, onToggle }: Props) {
  return <section className={styles.story} aria-label="Mural story">
    <p className={styles.instruction}>{instruction}</p>
    <details open={open}>
      <summary onClick={event => { event.preventDefault(); onToggle(); }}><span>{title}</span><span className={styles.toggle}>{open ? "Hide story" : "Read story"}</span></summary>
      <figure className={styles.figure}>
        <Image src={BASE_PATH + image.src} width={image.width} height={image.height} alt={image.alt} className={styles.image} sizes="(min-width: 48rem) 24rem, 100vw" />
        <figcaption className={styles.caption}>{image.caption}</figcaption>
      </figure>
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
