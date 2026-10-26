import type { WaterPerformanceView } from "@/lib/amazing-shuk/water-performance";
import type { CSSProperties } from "react";
import ActionButton from "@/components/ui/ActionButton";
import type { WaterTaskView, WaterActionView, WaterContainerId } from "@/lib/amazing-shuk/water-task-view";
import type { WaterMove } from "@/lib/amazing-shuk/water-measurement";
import styles from "./PreviewWaterTask.module.scss";
type Props = {
  view: WaterTaskView; performance: WaterPerformanceView; narrative: readonly string[];
  hints: readonly { title: string; text: string }[]; hasMoreHints: boolean;
  onSelect: (id: WaterContainerId, move: WaterMove | null) => void;
  onAction: (id: WaterActionView["id"]) => void; onCancelPour: () => void;
  onStart: () => void; onSubmit: () => void; onReset: () => void; onHint: () => void;
};
export default function PreviewWaterTask({ view, performance, narrative, hints, hasMoreHints, onSelect, onAction, onCancelPour, onStart, onSubmit, onReset, onHint }: Props) {
  return <section className={styles.task} aria-labelledby="water-task-title">
    <div className={styles.taskIntro}>
      <h2 id="water-task-title">Fill your family&apos;s jar</h2>
      {narrative.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
    </div>
    {!performance.started && !view.completed ? <div className={styles.actions}>
      {performance.canStart ? <ActionButton disabled={view.busy} onClick={onStart}>Start challenge</ActionButton> : <p>Your navigator, answer-submitter or guide can start after the story.</p>}
    </div> : null}
    <div className={styles.containers}>
      {view.containers.map(container => <figure key={container.id} className={[container.id === "jar" ? styles.goal : styles.container, container.selected ? styles.selected : "", container.destinationMove ? styles.destination : ""].filter(Boolean).join(" ")}>
        <button type="button" id={`water-container-${container.id}`} className={styles.containerButton}
          disabled={container.disabled} aria-pressed={container.selected} aria-label={container.accessibleLabel}
          data-pour-destination={container.destinationMove ? "true" : undefined}
          onClick={() => onSelect(container.id, container.destinationMove)}>
        <span className={styles.illustration} aria-hidden="true">
          {container.id === "jar" ? <span className={styles.jarShape}>
            <span className={styles.jarNeck} />
            <span className={styles.familyJar}><span className={styles.water} style={{ "--water-level": `${container.percentage}%` } as CSSProperties} /></span>
          </span> : <span className={[styles.vessel, container.id === "large" ? styles.largeVessel : ""].filter(Boolean).join(" ")}>
            <span className={styles.water} style={{ "--water-level": `${container.percentage}%` } as CSSProperties} />
          </span>}
        </span>
        <span className={styles.caption}>
          {container.id === "jar" ? <span className={styles.goalLabel}>{view.solved ? "Goal reached" : "Your goal"}</span> : null}
          <strong>{container.label}</strong>
          <span>{container.amount} L / {container.capacity} L</span>
        </span>
        </button>
        <meter className="srOnly" min={0} max={container.capacity} value={container.amount} aria-label={container.label} aria-valuetext={`${container.amount} of ${container.capacity} liters`}>{container.amount} of {container.capacity} liters</meter>
      </figure>)}
    </div>
    {view.completed ? <section className={styles.success} role="status" aria-label="Challenge result">
      <h3>Challenge completed!</h3>
      {performance.reward ? <dl className={styles.reward}>
        <div><dt>Points earned</dt><dd>{performance.reward.points}</dd></div>
        <div><dt>Food tokens earned</dt><dd>{performance.reward.foodTokens}</dd></div>
        <div><dt>Hints used</dt><dd>{performance.reward.hintsUsed}</dd></div>
      </dl> : null}
    </section> : null}
    {view.status && !view.completed ? <p id="water-puzzle-status" tabIndex={-1} className={styles.success} role="status" aria-live="polite">{view.status}</p> : null}
    <div className={styles.contextControls}>
      {view.prompt ? <p id="water-controls-heading" tabIndex={-1} className={styles.prompt} aria-live="polite">{view.prompt}</p> : null}
      {view.actions.map(action => <ActionButton key={action.id} variant="quiet" className={styles.moveButton} onClick={() => onAction(action.id)}>{action.label}</ActionButton>)}
      {view.pouring ? <ActionButton variant="quiet" className={styles.reset} onClick={onCancelPour}>Cancel pour</ActionButton> : null}
    </div>
    <div className={styles.actions}>
      {view.canSubmit && view.solved && !view.completed ? <ActionButton disabled={view.submitDisabled} onClick={onSubmit}>Submit Group Answer</ActionButton> : view.solved && !view.completed ? <p>Your answer-submitter or guide can submit.</p> : null}
      <ActionButton variant="quiet" className={styles.reset} disabled={!view.canReset} onClick={onReset}>Reset puzzle</ActionButton>
    </div>
    <aside className={styles.hints} aria-label="Optional puzzle hints">
      {hasMoreHints ? <ActionButton variant="quiet" className={styles.reset} disabled={view.busy} onClick={onHint}>{hints.length ? "Another hint?" : "Need a hint?"}</ActionButton> : null}
      <ol aria-live="polite" aria-relevant="additions" className={styles.hintList}>
        {hints.map(hint => <li key={hint.title}><strong>{hint.title}</strong><p>{hint.text}</p></li>)}
      </ol>
    </aside>
  </section>;
}
