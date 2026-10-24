import ActionButton from "@/components/ui/ActionButton";
import type { WaterPerformanceView } from "@/lib/amazing-shuk/water-performance";
import type { ChoiceTaskView } from "@/lib/amazing-shuk/mural-task-view";
import styles from "./PreviewMuralTask.module.scss";
type Props = {
  view: ChoiceTaskView; question: string; performance: WaterPerformanceView;
  hints: readonly { title: string; text: string }[]; hasMoreHints: boolean;
  onToggle: (optionId: string) => void; onStart: () => void; onSubmit: () => void; onReset: () => void; onHint: () => void;
};
export default function PreviewMuralTask({ view, question, performance, hints, hasMoreHints, onToggle, onStart, onSubmit, onReset, onHint }: Props) {
  return <section className={styles.task} aria-labelledby="mural-task-title">
    <div className={styles.taskIntro}>
      <h2 id="mural-task-title">{question}</h2>
    </div>
    {!performance.started && !view.completed ? <div className={styles.actions}>
      {performance.canStart ? <ActionButton disabled={view.busy} onClick={onStart}>Start challenge</ActionButton> : <p>Your navigator, answer-submitter or guide can start after the story.</p>}
    </div> : null}
    <ul className={styles.options} aria-label="Things on the wall">
      {view.options.map(option => <li key={option.id}>
        <button type="button" className={[styles.option, option.selected ? styles.optionSelected : ""].filter(Boolean).join(" ")}
          aria-pressed={option.selected} disabled={option.disabled} onClick={() => onToggle(option.id)}>
          <span className={styles.mark} aria-hidden="true">{option.selected ? "✓" : ""}</span>
          <span>{option.label}</span>
        </button>
      </li>)}
    </ul>
    {view.completed ? <section className={styles.success} role="status" aria-label="Challenge result">
      <h3>Challenge completed!</h3>
      {performance.reward ? <dl className={styles.reward}>
        <div><dt>Points earned</dt><dd>{performance.reward.points}</dd></div>
        <div><dt>Food tokens earned</dt><dd>{performance.reward.foodTokens}</dd></div>
        <div><dt>Hints used</dt><dd>{performance.reward.hintsUsed}</dd></div>
      </dl> : null}
    </section> : view.status ? <p className={styles.prompt} role="status" aria-live="polite">{view.status}</p> : null}
    {!view.completed && !view.answerKeyVerified ? <p className={styles.keyNotice}>Draft: the answer key still needs a field check, so answers can&apos;t be scored yet.</p> : null}
    <div className={styles.actions}>
      {view.completed ? null : view.canSubmit ? <ActionButton disabled={view.submitDisabled} onClick={onSubmit}>Submit Group Answer</ActionButton>
        : <p>Talk it over. Your answer-submitter or guide submits the group&apos;s answer.</p>}
      <ActionButton variant="quiet" className={styles.reset} disabled={!view.canReset} onClick={onReset}>Clear choices</ActionButton>
    </div>
    <aside className={styles.hints} aria-label="Optional hints">
      {hasMoreHints ? <ActionButton variant="quiet" className={styles.reset} disabled={view.busy} onClick={onHint}>{hints.length ? "Another hint?" : "Need a hint?"}</ActionButton> : null}
      <ol aria-live="polite" aria-relevant="additions" className={styles.hintList}>
        {hints.map(hint => <li key={hint.title}><strong>{hint.title}</strong><p>{hint.text}</p></li>)}
      </ol>
    </aside>
  </section>;
}
