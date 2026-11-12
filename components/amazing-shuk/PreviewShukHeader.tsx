import type { ReactNode, Ref } from "react";
import styles from "./PreviewShukHeader.module.scss";

// I7a: with several teams, the small line above the title shows the team's initials (standing in for its avatar) and its name.
type Props = { title: string; group: ReactNode; menu: ReactNode; ref?: Ref<HTMLElement>; team?: Readonly<{ name: string; initials: string }> | null };
/** The slim header: game name and screen title, the group button, the profile avatar. The roles and the group's balance live in the
 * group sheet; a free role shows as a count on the group button. */
export default function PreviewShukHeader({ title, group, menu, ref, team }: Props) {
  return <header className={styles.header} ref={ref}>
    <div className={styles.titles}>
      {team ? <p className={styles.eyebrow}><span className={styles.teamBadge} aria-hidden="true">{team.initials}</span>{team.name}</p>
        : <p className={styles.eyebrow}>The Amazing Shuk</p>}
      <h1 className={styles.title}>{title}</h1>
    </div>
    {group}
    {menu}
  </header>;
}
