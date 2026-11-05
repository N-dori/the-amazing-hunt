import ActionButton from "@/components/ui/ActionButton";
import type { RoleAssigneeView, RoleChoiceView } from "@/lib/amazing-shuk/participant-identity";
import styles from "./PreviewRoleChoices.module.scss";

type Props = {
  choices: readonly RoleChoiceView[]; guide: boolean; busy: boolean; onClaim: (role: RoleChoiceView["role"]) => void; onRelease: (role: RoleChoiceView["role"]) => void;
  // The team's leader only (I4a): the members a role can go to, and the change itself (a member, or null to free the role).
  assignees?: readonly RoleAssigneeView[]; onAssign?: (role: RoleChoiceView["role"], participantId: string | null) => void;
};
// TODO(copy): draft wording for owner review. Advisor was removed (owner, 5 Nov 2026): the others get the stop's parts.
// The leader's Change, "(you)", "No one" and the leader note are I4a drafts too (O16).
/** The two roles: who holds each, and a button to take a free one or step down from your own. Everyone else advises.
 * The team's leader also gets Change on each role, to give it to any member or free it. */
export default function PreviewRoleChoices({ choices, guide, busy, onClaim, onRelease, assignees, onAssign }: Props) {
  return <section className={styles.roles} aria-labelledby="role-choices-title">
    <h3 id="role-choices-title" className={styles.title}>Roles</h3>
    <p className={styles.intro}>Choose who navigates and who submits the group&apos;s answers. Everyone else helps at each stop.</p>
    {assignees && onAssign ? <p className={styles.note}>As team leader, you can change who holds each role.</p> : null}
    <ul className={styles.list}>
      {choices.map(choice => <li key={choice.role} className={styles.role}>
        <p><strong>{choice.label}:</strong> {choice.holder === null ? "free" : choice.mine ? "you" : choice.holder}</p>
        {choice.mine ? <ActionButton variant="quiet" disabled={busy} onClick={() => onRelease(choice.role)}>Step down</ActionButton>
          : choice.canClaim ? <ActionButton disabled={busy} onClick={() => onClaim(choice.role)}>Take this role</ActionButton> : null}
        {assignees && onAssign ? <details className={styles.change}>
          <summary className={styles.changeSummary}>Change<span className="srOnly"> {choice.label}</span></summary>
          <ul className={styles.options} aria-label={`Who is the ${choice.label}?`}>
            {assignees.map(person => <li key={person.id}>
              <ActionButton variant="quiet" disabled={busy || person.id === choice.holderId} aria-pressed={person.id === choice.holderId}
                onClick={() => onAssign(choice.role, person.id)}>{person.you ? `${person.name} (you)` : person.name}</ActionButton>
            </li>)}
            <li><ActionButton variant="quiet" disabled={busy || choice.holderId === null} aria-pressed={choice.holderId === null}
              onClick={() => onAssign(choice.role, null)}>No one</ActionButton></li>
          </ul>
        </details> : null}
      </li>)}
    </ul>
    {guide ? <p className={styles.note}>As guide, assign or change roles from the guide panel.</p> : null}
  </section>;
}
