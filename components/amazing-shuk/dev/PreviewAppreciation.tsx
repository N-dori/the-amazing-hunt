import type { AppreciationContent } from "@/lib/amazing-shuk/choice-missions";
import styles from "./PreviewAppreciation.module.scss";

/** An optional, unscored moment: nothing to tap, type or submit, and nothing stored. */
export default function PreviewAppreciation({ title, paragraphs, invitation, note }: AppreciationContent) {
  return <section className={styles.moment} aria-labelledby="appreciation-title">
    <h3 id="appreciation-title" className={styles.title}>{title}</h3>
<<<<<<< HEAD
    {paragraphs.map(paragraph => <div key={paragraph.text}>
      <p>{paragraph.text}</p>
    </div>)}
=======
    {paragraphs.map(paragraph => <p key={paragraph.text}>{paragraph.text}</p>)}
>>>>>>> bb4234fb5b66e55047f6343e266fa8ee539f0a27
    <p className={styles.invitation}>{invitation}</p>
    <p className={styles.note}>{note}</p>
  </section>;
}
