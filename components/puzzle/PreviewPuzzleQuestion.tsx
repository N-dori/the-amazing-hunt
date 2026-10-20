import { Icon } from "@/components/icons";
import ActionButton from "@/components/ui/ActionButton";
import StatusTag from "@/components/ui/StatusTag";
import { BASE_PATH } from "@/lib/base-path";
import type { firstKeepers } from "@/lib/game/library";
import styles from "./PreviewPuzzleQuestion.module.scss";

type PreviewPuzzleQuestionProps = {
  content: typeof firstKeepers;
  answer: string;
  feedback: string | null;
  hint: string | null;
  showGuide: boolean;
  onAnswerChange: (value: string) => void;
  onCheck: () => void;
  onGuideConfirm: () => void;
};

// Find the wall, observe the scene, answer one question.
export default function PreviewPuzzleQuestion({ content: c, answer, feedback, hint, showGuide, onAnswerChange, onCheck, onGuideConfirm }: PreviewPuzzleQuestionProps) {
  return (
    <section className={styles.question}>
      <h1 className={styles.title} tabIndex={-1} data-screen-heading>
        {c.title.text}
      </h1>

      <div className={styles.step}>
        <p className={styles.stepLabel}>
          <span className={styles.stepNumber}>1</span>
          {c.findLabel.text}
        </p>
        <p className={styles.text}>{c.location.text}</p>
        <figure className={styles.locator}>
          <img src={`${BASE_PATH}/library/timeline-wall-level-minus2.jpg`} alt={c.locatorAlt.text} className={styles.locatorImage} loading="lazy" />
          <figcaption className={styles.caption}>
            {c.locatorCaption.text}
            <StatusTag status={c.locatorCaption.status} />
          </figcaption>
        </figure>
      </div>

      <div className={styles.step}>
        <p className={styles.stepLabel}>
          <span className={styles.stepNumber}>2</span>
          {c.observeLabel.text}
        </p>
        <figure className={styles.clue}>
          <img src={`${BASE_PATH}/library/timeline-1946-scene.jpg`} alt={c.clueAlt.text} className={styles.clueImage} />
          <figcaption className={styles.clueCaption}>{c.clueCaption.text}</figcaption>
        </figure>
      </div>

      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          onCheck();
        }}
      >
        <label htmlFor="firstKeepersYear" className={styles.prompt}>
          {c.question.text}
        </label>
        <div className={styles.answerRow}>
          <input
            id="firstKeepersYear"
            className={styles.input}
            value={answer}
            onChange={(e) => onAnswerChange(e.target.value)}
            inputMode="numeric"
            autoComplete="off"
            maxLength={8}
            placeholder="····"
            aria-describedby="firstKeepersFeedback"
          />
          <ActionButton type="submit" disabled={answer.trim().length === 0}>
            {c.check.text}
          </ActionButton>
        </div>

        <div id="firstKeepersFeedback" className={styles.feedback} role="status" aria-live="polite">
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
            {c.guideConfirm.text}
          </button>
        ) : null}
      </form>
    </section>
  );
}
