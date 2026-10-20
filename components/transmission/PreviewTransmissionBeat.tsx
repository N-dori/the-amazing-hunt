import type { CSSProperties, Ref } from "react";
import styles from "./PreviewTransmissionBeat.module.scss";

type PreviewTransmissionBeatProps = {
  number: number;
  count: number;
  heading: string;
  body: string;
  headingRef: Ref<HTMLHeadingElement>;
};

// The fiction's proper names, set in HARMONY's mono voice. Styling only; the words are Story V1's.
const NAMES = /(HARMONY|Israelianes)/;

function withNames(sentence: string, styleClass: string) {
  return sentence.split(NAMES).map((part, i) =>
    NAMES.test(part) ? (
      <span key={i} className={styleClass}>
        {part}
      </span>
    ) : (
      part
    ),
  );
}

// One beat of the story: its heading, then its sentences arriving one after another.
export default function PreviewTransmissionBeat({ number, count, heading, body, headingRef }: PreviewTransmissionBeatProps) {
  const sentences = body.split(/(?<=[.:])\s+/);
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <section className={styles.beat}>
      <p className={styles.index}>
        {pad(number)} — {pad(count)}
      </p>
      <h1 ref={headingRef} className={styles.heading} tabIndex={-1} data-screen-heading>
        {heading}
      </h1>
      <p className={styles.body}>
        {sentences.map((sentence, i) => (
          <span key={i} className={styles.sentence} style={{ "--i": i } as CSSProperties}>
            {withNames(sentence, styles.name)}{" "}
          </span>
        ))}
      </p>
    </section>
  );
}
