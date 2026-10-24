import StatusTag from "@/components/ui/StatusTag";
import styles from "./PreviewFoodRewards.module.scss";

type Props = { foodTokens: number };
// TODO(copy): owner to approve. No food offers, vendors or prices are approved yet (product-decisions: redemption is
// guide-controlled at the market), so the tab shows the shared balance and a marked gap, never invented offers.
const NO_OFFERS = "Food offers aren't confirmed yet. Your guide redeems food tokens at the market.";
/** The Food tab: the group's shared food tokens. Redemption isn't done here. */
export default function PreviewFoodRewards({ foodTokens }: Props) {
  return <section className={styles.food} aria-labelledby="food-title">
    <h2 id="food-title" className={styles.title}>Food</h2>
    <p className={styles.balance}><span>Food tokens</span><strong>{foodTokens}</strong></p>
    <p className={styles.gap}>{NO_OFFERS} <StatusTag status="draft" /></p>
  </section>;
}
