import type { ReactNode, Ref } from "react";
import { Icon } from "@/components/icons";
import styles from "./PreviewShukHeader.module.scss";

type Props = { title: string; points: number; foodTokens: number; menu: ReactNode; badges: ReactNode; ref?: Ref<HTMLElement> };
/** The slim header: game name and screen title, the profile avatar, then one line with the roles and the group's balance. */
export default function PreviewShukHeader({ title, points, foodTokens, menu, badges, ref }: Props) {
  return <header className={styles.header} ref={ref}>
    <div className={styles.titles}>
      <p className={styles.eyebrow}>The Amazing Shuk</p>
      <h1 className={styles.title}>{title}</h1>
    </div>
    {menu}
    <div className={styles.status}>
      {badges}
      {/* The group's shared balance, not a live challenge score. */}
      <ul className={styles.balance} aria-label="Shared group rewards">
        <li className={`${styles.chip} ${styles.points}`} aria-label={`Group points: ${points}`}>
          <Icon name="score" className={styles.icon} /><span aria-hidden="true">{points} pts</span>
        </li>
        <li className={`${styles.chip} ${styles.tokens}`} aria-label={`Food tokens: ${foodTokens}`}>
          <Icon name="food" className={styles.icon} /><span aria-hidden="true">{foodTokens} tokens</span>
        </li>
      </ul>
    </div>
  </header>;
}
