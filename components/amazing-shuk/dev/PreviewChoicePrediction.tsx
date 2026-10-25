import type { PredictionContent } from "@/lib/amazing-shuk/choice-missions";
import styles from "./PreviewChoicePrediction.module.scss";

/** An unscored guess: the group talks, then opens the answer on this phone. Nothing is typed, sent or stored. */
export default function PreviewChoicePrediction({ title, question, invitation, reveal }: PredictionContent) {
  return <section className={styles.moment} aria-labelledby="prediction-title">
    <h3 id="prediction-title" className={styles.title}>{title}</h3>
    <p className={styles.invitation}>{question}</p>
    <p className={styles.note}>{invitation}</p>
    <details className={styles.answer}>
      <summary className={styles.summary}>Show the answer</summary>
      {reveal.map(paragraph => <div key={paragraph.text}>
        <p className={styles.label}>{paragraph.label}</p>
        <p>{paragraph.text}</p>
      </div>)}
    </details>
  </section>;
}
