import ActionButton from "@/components/ui/ActionButton";
import type { RoleChoiceView } from "@/lib/amazing-shuk/participant-identity";
import styles from "./PreviewRoleChoices.module.scss";

type Props = { choices: readonly RoleChoiceView[]; guide: boolean; busy: boolean; onClaim: (role: RoleChoiceView["role"]) => void; onRelease: (role: RoleChoiceView["role"]) => void };
// TODO(copy): draft wording for owner review, from the owner's direction "let them choose and the rest are advisors".
/** The two roles: who holds each, and a button to take a free one or step down from your own. Everyone else advises. */
export default function PreviewRoleChoices({ choices, guide, busy, onClaim, onRelease }: Props) {
  return <section className={styles.roles} aria-labelledby="role-choices-title">
    <h3 id="role-choices-title" className={styles.title}>Roles</h3>
    <p className={styles.intro}>Choose who navigates and who submits the group&apos;s answers. Everyone else is an advisor.</p>
    <ul className={styles.list}>
      {choices.map(choice => <li key={choice.role} className={styles.role}>
        <p><strong>{choice.label}:</strong> {choice.holder === null ? "free" : choice.mine ? "you" : choice.holder}</p>
        {choice.mine ? <ActionButton variant="quiet" disabled={busy} onClick={() => onRelease(choice.role)}>Step down</ActionButton>
          : choice.canClaim ? <ActionButton disabled={busy} onClick={() => onClaim(choice.role)}>Take this role</ActionButton> : null}
      </li>)}
    </ul>
    {guide ? <p className={styles.note}>As guide, assign or change roles from the guide panel.</p> : null}
  </section>;
}
