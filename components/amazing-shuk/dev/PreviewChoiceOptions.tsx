import { Icon } from "@/components/icons";
import type { ChoiceOptionView } from "@/lib/amazing-shuk/mural-task-view";
import styles from "./PreviewChoiceTask.module.scss";

type Props = { legend: string; options: readonly ChoiceOptionView[]; onToggle: (optionId: string) => void };
/** Answer cards for any "choose N" question. Real checkboxes: the whole card is the label, so a tap anywhere toggles the shared pick. */
export default function PreviewChoiceOptions({ legend, options, onToggle }: Props) {
  return <fieldset className={styles.options}>
    <legend className="srOnly">{legend}</legend>
    {options.map(option => <label key={option.id} className={[styles.option, option.selected ? styles.optionSelected : "", option.disabled ? styles.optionDisabled : ""].filter(Boolean).join(" ")}>
      <input type="checkbox" className={styles.input} checked={option.selected} disabled={option.disabled} onChange={() => onToggle(option.id)} />
      <span className={styles.mark} aria-hidden="true">{option.selected ? <Icon name="check" className={styles.markIcon} /> : null}</span>
      {option.lang ? <span className={`${styles.optionLabel} rtl`} lang={option.lang}>{option.label}</span> : <span className={styles.optionLabel}>{option.label}</span>}
    </label>)}
  </fieldset>;
}
