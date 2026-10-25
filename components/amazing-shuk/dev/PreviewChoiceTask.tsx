import ActionButton from "@/components/ui/ActionButton";
import PreviewChoiceOptions from "./PreviewChoiceOptions";
import type { WaterPerformanceView } from "@/lib/amazing-shuk/water-performance";
import type { ChoiceTaskView } from "@/lib/amazing-shuk/mural-task-view";
import type { MissionDiscovery, MissionVictoryCopy } from "@/lib/amazing-shuk/mission-completion";
import PreviewMissionVictory from "./PreviewMissionVictory";
import PreviewMissionDiscovery from "./PreviewMissionDiscovery";
import styles from "./PreviewChoiceTask.module.scss";
type Props = {
  view: ChoiceTaskView; question: string; performance: WaterPerformanceView;
  victory: MissionVictoryCopy; discovery: MissionDiscovery; onExplore: () => void;
  hints: readonly { title: string; text: string }[]; hasMoreHints: boolean;
  // The latest reply to this device's action (e.g. a wrong answer), shown beside the submit button.
  feedback: string;
  onToggle: (optionId: string) => void; onStart: () => void; onSubmit: () => void; onReset: () => void; onHint: () => void;
};
export default function PreviewChoiceTask({ view, question, performance, victory, discovery, onExplore, hints, hasMoreHints, feedback, onToggle, onStart, onSubmit, onReset, onHint }: Props) {
  if (view.completed) return <PreviewMissionVictory {...victory} reward={performance.reward} onExplore={onExplore}><PreviewMissionDiscovery {...discovery} /></PreviewMissionVictory>;
  const playing = performance.started && !view.completed;
  return <section className={styles.task} aria-labelledby="mural-task-title">
    <h2 id="mural-task-title" className={styles.question}>{question}</h2>
    {!performance.started && !view.completed ? <div className={styles.actions}>
      {performance.canStart ? <ActionButton disabled={view.busy} onClick={onStart}>Start challenge</ActionButton> : <p>Your navigator, answer-submitter or guide can start after the story.</p>}
    </div> : null}
    <PreviewChoiceOptions legend={question} options={view.options} onToggle={onToggle} />
    {!view.completed && !view.answerKeyVerified ? <p className={styles.keyNotice}>Draft: the answer key still needs a field check, so answers can&apos;t be scored yet.</p> : null}
    {/* Sticks to the foot of the screen while the group scrolls the options, and stops at the end of the challenge. */}
    {playing ? <div className={styles.submitBar}>
      <div className={styles.progress}>
        <span className={styles.pips} aria-hidden="true">{Array.from({ length: view.required }, (_, index) => <span key={index} className={index < view.chosen ? styles.pipOn : styles.pip} />)}</span>
        <p role="status" aria-live="polite">{view.status}</p>
        <ActionButton variant="quiet" className={styles.reset} disabled={!view.canReset} onClick={onReset}>Clear choices</ActionButton>
      </div>
      {feedback ? <p className={styles.feedback} role="status" aria-live="polite">{feedback}</p> : null}
      {view.canSubmit ? <ActionButton block disabled={view.submitDisabled} onClick={onSubmit}>Submit Our Answer</ActionButton>
        : <p className={styles.followerNote}>Talk it over. Your answer-submitter or guide submits the group&apos;s answer.</p>}
    </div> : null}
    {!performance.started && !view.canSubmit && !view.completed ? <p>Talk it over. Your answer-submitter or guide submits the group&apos;s answer.</p> : null}
    <aside className={styles.hints} aria-label="Optional hints">
      {hasMoreHints ? <ActionButton variant="quiet" className={styles.reset} disabled={view.busy} onClick={onHint}>{hints.length ? "Another hint?" : "Need a hint?"}</ActionButton> : null}
      <ol aria-live="polite" aria-relevant="additions" className={styles.hintList}>
        {hints.map(hint => <li key={hint.title}><strong>{hint.title}</strong><p>{hint.text}</p></li>)}
      </ol>
    </aside>
  </section>;
}
