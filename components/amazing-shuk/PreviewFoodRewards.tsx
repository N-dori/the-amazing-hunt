import styles from "./PreviewFoodRewards.module.scss";

type Props = { foodTokens: number; intro?: string; notice?: string };
/** One compact display of the group's actual shared balance, never a participant wallet. */
export default function PreviewFoodRewards({ foodTokens, intro, notice }: Props) {
  return <section className={styles.food} aria-label="Shared food rewards">
    <p className={styles.balance}><span>Group food tokens</span><strong>{foodTokens}</strong></p>
    {intro ? <p>{intro}</p> : null}
    {notice ? <p className={styles.notice}>{notice}</p> : null}
  </section>;
}
