import { buildFoodTastingViews } from "@/lib/amazing-shuk/food-catalogue-view";
import type { FoodTasting } from "@/lib/amazing-shuk/food-catalogue";
import PreviewFoodTastingCard from "./PreviewFoodTastingCard";
import styles from "./FoodTasting.module.scss";

type Props = { items: readonly FoodTasting[]; failedImageIds: readonly string[]; actionLabel: string;
  onSelect: (id: string) => void; onImageError: (id: string) => void };
/** Pure catalogue projection. No fetching, purchasing, balance mutations or hidden offers. */
export default function ListFoodTasting({ items, failedImageIds, actionLabel, onSelect, onImageError }: Props) {
  return <ul className={styles.list} aria-label="Provisional tastings">
    {buildFoodTastingViews(items, failedImageIds).map(view => <li key={view.id}>
      <PreviewFoodTastingCard view={view} actionLabel={actionLabel} onSelect={() => onSelect(view.id)} onImageError={() => onImageError(view.id)} />
    </li>)}
  </ul>;
}
