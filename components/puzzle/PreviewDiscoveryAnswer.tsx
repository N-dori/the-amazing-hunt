import { Icon } from "@/components/icons";
import ActionButton from "@/components/ui/ActionButton";
import styles from "./PreviewDiscoveryAnswer.module.scss";

export type DiscoveryAnswerView = {
  title: string;
  number: number;
  label: string;
  prompt: string;
  // A sentence or two (textarea) rather than a word.
  long: boolean;
  check: string;
  guideConfirm: string;
};

type PreviewDiscoveryAnswerProps = {
  view: DiscoveryAnswerView;
  answer: string;
  feedback: string | null;
  hint: string | null;
  showGuide: boolean;
  onAnswerChange: (value: string) => void;
  onCheck: () => void;
  onGuideConfirm: () => void;
};

// The one question of a discovery mission, with escalating hints and the guide's override.
export default function PreviewDiscoveryAnswer({ view: v, answer, feedback, hint, showGuide, onAnswerChange, onCheck, onGuideConfirm }: PreviewDiscoveryAnswerProps) {
  const fieldProps = {
    id: "discoveryAnswer",
    value: answer,
    autoComplete: "off",
    "aria-describedby": "discoveryFeedback",
  };

  return (
    <section className={styles.question}>
      <h1 className={styles.title} tabIndex={-1} data-screen-heading>
        {v.title}
      </h1>

      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          onCheck();
        }}
      >
        <p className={styles.stepLabel}>
          <span className={styles.stepNumber}>{v.number}</span>
          {v.label}
        </p>
        <label htmlFor={fieldProps.id} className={styles.prompt}>
          {v.prompt}
        </label>

        {v.long ? (
          <div className={styles.longRow}>
            <textarea {...fieldProps} className={styles.textArea} rows={4} maxLength={600} onChange={(e) => onAnswerChange(e.target.value)} />
            <ActionButton type="submit" block disabled={answer.trim().length === 0}>
              {v.check}
            </ActionButton>
          </div>
        ) : (
          <div className={styles.answerRow}>
            <input {...fieldProps} className={styles.textInput} maxLength={60} onChange={(e) => onAnswerChange(e.target.value)} />
            <ActionButton type="submit" disabled={answer.trim().length === 0}>
              {v.check}
            </ActionButton>
          </div>
        )}

        <div id="discoveryFeedback" className={styles.feedback} role="status" aria-live="polite">
          {feedback ? <p className={styles.wrong}>{feedback}</p> : null}
          {hint ? (
            <p className={styles.hint}>
              <Icon name="hint" className={styles.hintIcon} />
              {hint}
            </p>
          ) : null}
        </div>

        {showGuide ? (
          <button type="button" className={styles.guide} onClick={onGuideConfirm}>
            <Icon name="guide" className={styles.guideIcon} />
            {v.guideConfirm}
          </button>
        ) : null}
      </form>
    </section>
  );
}
