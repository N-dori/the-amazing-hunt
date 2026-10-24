import type { AppreciationContent } from "@/lib/amazing-shuk/choice-missions";
import styles from "./PreviewAppreciation.module.scss";

/** An optional, unscored moment: nothing to tap, type or submit, and nothing stored. */
export default function PreviewAppreciation({ title, paragraphs, invitation, note }: AppreciationContent) {
  return <section className={styles.moment} aria-labelledby="appreciation-title">
    <h3 id="appreciation-title" className={styles.title}>{title}</h3>
    {paragraphs.map(paragraph => <div key={paragraph.text}>
      <p className={styles.label}>{paragraph.label}</p>
      <p>{paragraph.text}</p>
    </div>)}
    <p className={styles.invitation}>{invitation}</p>
    <p className={styles.note}>{note}</p>
  </section>;
}
