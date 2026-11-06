import ActionButton from "@/components/ui/ActionButton";
import type { TEAM_NAME_COPY } from "@/lib/amazing-shuk/team-name";
import styles from "./PreviewTeamName.module.scss";

type Props = { copy: typeof TEAM_NAME_COPY; value: string; error: string; saved: string | null; saving: boolean; suggestions: readonly string[]; maxLength: number;
  onChange: (value: string) => void; onPick: (name: string) => void; onConfirm: () => void };
/** "Name your team" (I7a, owner, 31 Oct 2026; approved copy): the field, the suggestions under it (a tap fills the field), and Confirm.
 * A name is shown as the team's only once the server has confirmed it; while saving, it never looks secured. */
export default function PreviewTeamName({ copy, value, error, saved, saving, suggestions, maxLength, onChange, onPick, onConfirm }: Props) {
  return <form className={styles.form} onSubmit={event => { event.preventDefault(); onConfirm(); }}>
    <p className={styles.description}>{copy.description}</p>
    <label className={styles.label} htmlFor="team-name">{copy.field}</label>
    <input id="team-name" className={styles.input} value={value} autoComplete="off" autoCapitalize="words" spellCheck={false}
      maxLength={maxLength * 4} aria-invalid={error ? true : undefined} aria-describedby={error ? "team-name-error" : undefined}
      onChange={event => onChange(event.target.value)} />
    {error ? <p id="team-name-error" className={styles.error} role="alert">{error}</p> : null}
    {suggestions.length ? <fieldset className={styles.suggestions}>
      <legend className={styles.suggestionsLabel}>{copy.suggestions}</legend>
      <ul className={styles.chips}>
        {suggestions.map(name => <li key={name}><button type="button" className={styles.chip} onClick={() => onPick(name)}>{name}</button></li>)}
      </ul>
    </fieldset> : null}
    <ActionButton type="submit" block disabled={saving}>{saving ? copy.saving : copy.confirm}</ActionButton>
    {saved && !saving ? <p className={styles.saved} role="status">{copy.success(saved)}</p> : null}
  </form>;
}
