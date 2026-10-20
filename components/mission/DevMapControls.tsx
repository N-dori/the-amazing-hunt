import { baseMaps, type BaseMapId } from "@/lib/game/basemaps";
import { devMapControls } from "@/lib/game/screens";
import styles from "./DevMapControls.module.scss";

type DevMapControlsProps = {
  visible: boolean;
  baseMapId: BaseMapId;
  synagogueSimulated: boolean;
  onToggleVisible: () => void;
  onBaseMapChange: (id: BaseMapId) => void;
  onSimulateSynagogue: (done: boolean) => void;
};

const ORDER: BaseMapId[] = ["illustratedCandidate", "schematic"];

// Development-only controls for the Investigation Map. The parent renders this only when
// development tools are enabled; "Hide" shows the visitor view without them.
export default function DevMapControls({ visible, baseMapId, synagogueSimulated, onToggleVisible, onBaseMapChange, onSimulateSynagogue }: DevMapControlsProps) {
  if (!visible) {
    return (
      <button type="button" className={styles.reopen} onClick={onToggleVisible}>
        {devMapControls.show.text}
      </button>
    );
  }

  return (
    <section className={styles.panel} aria-label={devMapControls.heading.text}>
      <p className={styles.heading}>{devMapControls.heading.text}</p>
      <fieldset className={styles.group}>
        <legend className={styles.legend}>{devMapControls.baseMap.text}</legend>
        {ORDER.map((id) => (
          <label key={id} className={`${styles.option} ${id === baseMapId ? styles.optionOn : ""}`}>
            <input type="radio" name="devBaseMap" value={id} checked={id === baseMapId} onChange={() => onBaseMapChange(id)} className="srOnly" />
            {baseMaps[id].label.text}
          </label>
        ))}
      </fieldset>
      <label className={styles.check}>
        <input type="checkbox" checked={synagogueSimulated} onChange={(e) => onSimulateSynagogue(e.target.checked)} />
        {devMapControls.simulate.text}
      </label>
      <button type="button" className={styles.hide} onClick={onToggleVisible}>
        {devMapControls.hide.text}
      </button>
    </section>
  );
}
