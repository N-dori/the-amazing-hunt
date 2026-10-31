import type { ReactNode, Ref } from "react";
import styles from "./PreviewShukHeader.module.scss";

type Props = { title: string; group: ReactNode; menu: ReactNode; ref?: Ref<HTMLElement> };
/** The slim header: game name and screen title, the group button, the profile avatar. The roles and the group's balance live in the
 * group sheet; a free role shows as a count on the group button. */
export default function PreviewShukHeader({ title, group, menu, ref }: Props) {
  return <header className={styles.header} ref={ref}>
    <div className={styles.titles}>
      <p className={styles.eyebrow}>The Amazing Shuk</p>
      <h1 className={styles.title}>{title}</h1>
    </div>
    {group}
    {menu}
  </header>;
}
