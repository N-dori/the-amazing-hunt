import { Icon } from "@/components/icons";
import { MISSION_STAGES, type MissionProgressStage } from "@/lib/amazing-shuk/mission-arrival";
import styles from "./PreviewMissionProgress.module.scss";

type Props = { stage: MissionProgressStage };
/** One compact line: three numbered steps and the current one in words. Done steps show a tick, the current one is filled, so
 * the stage never rests on colour alone. It reflects the game, not a location reading. */
export default function PreviewMissionProgress({ stage }: Props) {
  const current = MISSION_STAGES.findIndex(item => item.id === stage);
  return <div className={styles.progress}>
    <ol className={styles.steps} aria-label="Mission progress">
      {MISSION_STAGES.map((item, index) => {
        const done = index < current || stage === "complete";
        return <li key={item.id} className={`${styles.step} ${done ? styles.stepDone : index === current ? styles.stepCurrent : ""}`}
          aria-current={index === current ? "step" : undefined}>
          <span className={styles.dot} aria-hidden="true">{done ? <Icon name="check" className={styles.icon} /> : index + 1}</span>
          <span className="srOnly">{item.label}{done ? " (done)" : index === current ? " (current)" : ""}</span>
        </li>;
      })}
    </ol>
    <p className={styles.status}>{MISSION_STAGES[current].status}</p>
  </div>;
}
