import { applyWaterMove, WATER_TARGET_ML, type WaterCups, type WaterMove } from "@/lib/amazing-shuk/water-measurement";
import styles from "./IndexWaterTask.module.scss";

type Props = {
  cups: WaterCups; completed: boolean; activeRole: string; busy: boolean;
  onMove: (move: WaterMove) => void; onSubmit: () => void; onGuideApprove: () => void; onReset: () => void;
};
const moves: readonly { id: WaterMove; label: string }[] = [
  { id: "fill-small", label: "Fill 300 ml" }, { id: "fill-large", label: "Fill 500 ml" },
  { id: "empty-small", label: "Empty 300 ml" }, { id: "empty-large", label: "Empty 500 ml" },
  { id: "pour-small-into-large", label: "Pour 300 ml into 500 ml" }, { id: "pour-large-into-small", label: "Pour 500 ml into 300 ml" },
];

export default function PreviewWaterTask({ cups, completed, activeRole, busy, onMove, onSubmit, onGuideApprove, onReset }: Props) {
  return (
    <section className={styles.task} aria-labelledby="water-task-title">
      <div className={styles.taskIntro}>
        <p className={styles.sourceCopy}>Your family may take exactly 4 litres. You have a 3-litre jug and a 5-litre jug, nothing else.</p>
        <p>Digital simulation: use 300 ml and 500 ml cups to measure exactly 400 ml.</p>
      </div>
      <h2 id="water-task-title">Shared cups</h2>
      <div className={styles.cups}><Cup label="300 ml cup" amount={cups.small} capacity={300} /><Cup label="500 ml cup" amount={cups.large} capacity={500} /></div>
      <p className={styles.target}>Target: {WATER_TARGET_ML} ml in either cup</p>
      <div className={styles.moves}>
        {moves.map((move) => {
          const next = applyWaterMove(cups, move.id);
          const unchanged = next !== null && next.small === cups.small && next.large === cups.large;
          return <button key={move.id} type="button" disabled={busy || completed || activeRole === "guide" || unchanged} onClick={() => onMove(move.id)}>{move.label}</button>;
        })}
      </div>
      <div className={styles.actions}>
        {activeRole === "answerSubmitter" || activeRole === "navigatorAndAnswerSubmitter" ? <button type="button" disabled={busy || completed} onClick={onSubmit}>Submit group answer</button> : null}
        {activeRole === "guide" ? <button type="button" disabled={busy || completed} onClick={onGuideApprove}>Guide approves completion</button> : null}
        <button type="button" disabled={busy} onClick={onReset}>Reset local simulation</button>
      </div>
      <p className={completed ? styles.complete : styles.incomplete} role="status">{completed ? "Shared task complete" : "Not complete yet"}</p>
    </section>
  );
}
function Cup({ label, amount, capacity }: { label: string; amount: number; capacity: number }) {
  return (
    <div className={styles.cup} role="img" aria-label={label + ": " + amount + " ml"}>
      <div className={styles.cupTrack}><div className={styles.water} style={{ height: ((amount / capacity) * 100) + "%" }} /></div>
      <strong>{amount} ml</strong><span>{label}</span>
    </div>
  );
}
