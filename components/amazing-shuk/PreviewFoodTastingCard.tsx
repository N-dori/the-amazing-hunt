import Image from "next/image";
import { Icon } from "@/components/icons";
import { BASE_PATH } from "@/lib/base-path";
import type { FoodTastingView } from "@/lib/amazing-shuk/food-catalogue-view";
import PreviewFoodPhotoCredit from "./PreviewFoodPhotoCredit";
import styles from "./FoodTasting.module.scss";

type Props = { view: FoodTastingView; actionLabel: string; onSelect: () => void; onImageError: () => void };
export default function PreviewFoodTastingCard({ view, actionLabel, onSelect, onImageError }: Props) {
  return <article className={styles.entry}>
    <button id={`food-entry-${view.id}`} type="button" className={styles.card} aria-labelledby={`food-name-${view.id}`} aria-describedby={`food-price-${view.id}`} onClick={onSelect}>
      {view.photo ? <Image src={BASE_PATH + view.photo.src} width={view.photo.width} height={view.photo.height} alt={view.photo.alt} className={styles.image} sizes="(min-width: 48rem) 16rem, 100vw" onError={onImageError} /> : null}
      <span className={styles.body}>
        <strong id={`food-name-${view.id}`} className={styles.name}>{view.name}</strong>
        <span>{view.description}</span>
        <span id={`food-price-${view.id}`} className={styles.price}>Token cost: {view.price}</span>
        <span className={styles.view}>{actionLabel}<Icon name="arrowForward" className={styles.icon} /></span>
      </span>
    </button>
    {view.photo ? <PreviewFoodPhotoCredit photo={view.photo} /> : null}
  </article>;
}
