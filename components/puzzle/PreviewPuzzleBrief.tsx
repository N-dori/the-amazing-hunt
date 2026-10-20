import ActionButton from "@/components/ui/ActionButton";
import EvidenceTag from "@/components/ui/EvidenceTag";
import type { LabelledCopy } from "@/lib/game/library";
import styles from "./PreviewPuzzleBrief.module.scss";

type PreviewPuzzleBriefProps = {
  title: string;
  lines: LabelledCopy[];
  shown: number;
  nextLabel: string;
  startLabel: string;
  onNext: () => void;
  onStart: () => void;
};

// HARMONY's short brief, one line at a time. Every line is fiction, so one label covers them.
export default function PreviewPuzzleBrief({ title, lines, shown, nextLabel, startLabel, onNext, onStart }: PreviewPuzzleBriefProps) {
  const done = shown >= lines.length;

  return (
    <section className={styles.brief}>
      <div className={styles.body}>
        <p className={styles.signal}>HARMONY</p>
        <h1 className={styles.title} tabIndex={-1} data-screen-heading>
          {title}
        </h1>
        <ol className={styles.lines}>
          {lines.slice(0, shown).map((line, i) => (
            <li key={i} className={`${styles.line} ${i === shown - 1 ? styles.lineNew : ""}`}>
              {line.text}
            </li>
          ))}
        </ol>
        <EvidenceTag claim={lines[0].claim} tone="dark" />
      </div>

      <div className={styles.controls}>
        {done ? (
          <ActionButton variant="light" icon="arrowForward" block onClick={onStart}>
            {startLabel}
          </ActionButton>
        ) : (
          <ActionButton variant="light" icon="arrowForward" block onClick={onNext}>
            {nextLabel}
          </ActionButton>
        )}
      </div>
    </section>
  );
}
