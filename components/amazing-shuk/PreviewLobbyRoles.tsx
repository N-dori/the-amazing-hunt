import { Icon } from "@/components/icons";
import { ROLE_EMBLEM } from "@/lib/amazing-shuk/role-emblems";
import type { LobbyRoleRowView } from "@/lib/amazing-shuk/participant-identity";
import type { AssignableGroupRole } from "@/lib/amazing-shuk/roles";
import type { LobbyCopy } from "@/lib/amazing-shuk/welcome-copy";
import ParticipantAvatar from "./ParticipantAvatar";
import styles from "./PreviewLobbyRoles.module.scss";

type Props = { copy: LobbyCopy; rows: readonly LobbyRoleRowView[]; busy: boolean; onGive: (role: AssignableGroupRole, participantId: string | null) => void };
/** The casting call (owner, 5 Nov 2026): one question per role, read out to the group, and a chip for each player. The leader taps the
 * person the group chose; tapping the holder again frees the role. One player may hold several. */
export default function PreviewLobbyRoles({ copy, rows, busy, onGive }: Props) {
  return <div className={styles.roles}>
    {rows.map(row => {
      const name = copy.roleNames[row.role];
      return <fieldset key={row.role} className={styles.row}>
        <legend className={styles.legend}>
          <span className={styles.badge} aria-hidden="true"><Icon name={ROLE_EMBLEM[row.role]} className={styles.badgeIcon} /></span>
          <span className={styles.heading}><span className={styles.name}>{name}</span><span className={styles.question}>{copy.roleQuestions[row.role]}</span></span>
        </legend>
        <ul className={styles.chips}>
          {row.chips.map(chip => <li key={chip.id}>
            <button type="button" className={`${styles.chip} ${chip.selected ? styles.chipSelected : ""}`} aria-pressed={chip.selected}
              aria-label={copy.giveRole(chip.name, name)} disabled={busy} onClick={() => onGive(row.role, chip.selected ? null : chip.id)}>
              <ParticipantAvatar participantId={chip.id} displayName={chip.name} size={32} label="" />
              <span className={styles.chipName}>{chip.name}</span>
              {chip.selected ? <Icon name="check" className={styles.chipCheck} /> : null}
            </button>
          </li>)}
        </ul>
        {row.holderId === null ? <p className={styles.nobody}>{copy.roleNobody}</p> : null}
      </fieldset>;
    })}
  </div>;
}
