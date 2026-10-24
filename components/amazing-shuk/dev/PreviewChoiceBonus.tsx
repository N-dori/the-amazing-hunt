import ActionButton from "@/components/ui/ActionButton";
import type { ChoiceTaskView } from "@/lib/amazing-shuk/mural-task-view";
import type { BonusContent } from "@/lib/amazing-shuk/choice-missions";
import PreviewChoiceOptions from "./PreviewChoiceOptions";
import styles from "./PreviewChoiceBonus.module.scss";

type Props = {
  content: BonusContent; view: ChoiceTaskView; points: number; feedback: string;
  onToggle: (optionId: string) => void; onSubmit: () => void; onReset: () => void;
};
/** An optional question after the main challenge: same cards and roles, retries allowed, its reveal only once it's right. */
export default function PreviewChoiceBonus({ content, view, points, feedback, onToggle, onSubmit, onReset }: Props) {
  return <section className={styles.bonus} aria-labelledby="choice-bonus-title">
    <h3 id="choice-bonus-title" className={styles.bonusTitle}>{content.title}</h3>
    <p className={styles.bonusIntro}>{content.intro}</p>
    <p className={styles.bonusQuestion}>{content.question}</p>
    {view.completed ? <div role="status">
      <p className={styles.bonusPoints}>Bonus points earned: <strong>{points}</strong></p>
      {content.reveal.map(paragraph => <div key={paragraph.text} className={styles.revealText}>
        <p className={styles.revealLabel}>{paragraph.label}</p>
        <p>{paragraph.text}</p>
      </div>)}
    </div> : <>
      <PreviewChoiceOptions legend={content.question} options={view.options} onToggle={onToggle} />
      <div className={styles.bonusActions}>
        <div className={styles.progress}>
          <p role="status" aria-live="polite">{view.status}</p>
          <ActionButton variant="quiet" className={styles.reset} disabled={!view.canReset} onClick={onReset}>Clear choices</ActionButton>
        </div>
        {feedback ? <p className={styles.feedback} role="status" aria-live="polite">{feedback}</p> : null}
        {view.canSubmit ? <ActionButton block disabled={view.submitDisabled} onClick={onSubmit}>Submit Our Answer</ActionButton>
          : <p className={styles.followerNote}>Talk it over. Your answer-submitter or guide submits the group&apos;s answer.</p>}
      </div>
    </>}
  </section>;
}
