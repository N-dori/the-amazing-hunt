import Image from "next/image";
import ActionButton from "@/components/ui/ActionButton";
import PreviewChoiceOptions from "./PreviewChoiceOptions";
import { BASE_PATH } from "@/lib/base-path";
import type { WaterPerformanceView } from "@/lib/amazing-shuk/water-performance";
import type { ChoiceTaskView } from "@/lib/amazing-shuk/mural-task-view";
import type { ChoiceTaskContent } from "@/lib/amazing-shuk/choice-missions";
import styles from "./PreviewChoiceTask.module.scss";
type Props = {
  view: ChoiceTaskView; question: string; performance: WaterPerformanceView;
  // On a follow-up question: why the group's last answer was right, shown above the new question.
  lead?: readonly { label: string; text: string }[];
  reveal: ChoiceTaskContent["reveal"]; completionTitle?: string;
  hints: readonly { title: string; text: string }[]; hasMoreHints: boolean;
  // The latest reply to this device's action (e.g. a wrong answer), shown beside the submit button.
  feedback: string;
  onToggle: (optionId: string) => void; onStart: () => void; onSubmit: () => void; onReset: () => void; onHint: () => void;
  // Only while a role is free (it opens the Group tab).
  onOpenRoles?: () => void;
};
// One neutral heading over the text after an answer; evidence labels stay in the data (owner's decision, 26 Oct 2026).
// TODO(copy): "Behind the answer" is a draft.
export default function PreviewChoiceTask({ view, question, lead, performance, reveal, completionTitle = "Challenge completed!", hints, hasMoreHints, feedback, onToggle, onStart, onSubmit, onReset, onHint, onOpenRoles }: Props) {
  const playing = performance.started && !view.completed;
  return <section className={styles.task} aria-labelledby="mural-task-title">
    {lead && !view.completed ? <div className={styles.lead} role="status"><h3 className={styles.revealLabel}>Behind the answer</h3>
      {lead.map(paragraph => <div key={paragraph.text} className={styles.revealText}>
      <p>{paragraph.text}</p>
    </div>)}</div> : null}
    <h2 id="mural-task-title" className={styles.question}>{question}</h2>
    {!performance.started && !view.completed ? <div className={styles.actions}>
      {performance.canStart ? <ActionButton disabled={view.busy} onClick={onStart}>Start challenge</ActionButton> : <p>Your navigator, answer-submitter or guide can start after the story.</p>}
      {/* A free role is why nobody here can start: the way to take it, where it blocks. TODO(copy): the group sheet's draft link. */}
      {!performance.canStart && onOpenRoles ? <ActionButton variant="quiet" icon="arrowForward" onClick={onOpenRoles}>Open the Group tab</ActionButton> : null}
    </div> : null}
    <PreviewChoiceOptions legend={question} options={view.options} onToggle={onToggle} />
    {view.completed ? <section className={styles.success} role="status" aria-label="Challenge result">
      <h3>{completionTitle}</h3>
      {performance.reward ? <dl className={styles.reward}>
        <div><dt>Points earned</dt><dd>{performance.reward.points}</dd></div>
        <div><dt>Food tokens earned</dt><dd>{performance.reward.foodTokens}</dd></div>
        <div><dt>Hints used</dt><dd>{performance.reward.hintsUsed}</dd></div>
      </dl> : null}
      {reveal.paragraphs?.some(paragraph => paragraph.label) ? <h4 className={styles.revealLabel}>Behind the answer</h4> : null}
      {reveal.paragraphs?.map(paragraph => <div key={paragraph.text} className={styles.revealText}>
        <p>{paragraph.text}</p>
      </div>)}
      {reveal.image ? <figure className={styles.figure}>
        <Image src={BASE_PATH + reveal.image.src} width={reveal.image.width} height={reveal.image.height} alt={reveal.image.alt} className={styles.image} sizes="(min-width: 48rem) 24rem, 100vw" />
        <figcaption className={styles.caption}>{reveal.image.caption}</figcaption>
      </figure> : null}
    </section> : null}
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
