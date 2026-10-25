import Image from "next/image";
import ActionButton from "@/components/ui/ActionButton";
import { BASE_PATH } from "@/lib/base-path";
import type { FoodTastingView } from "@/lib/amazing-shuk/food-catalogue-view";
import PreviewFoodPhotoCredit from "./PreviewFoodPhotoCredit";
import styles from "./FoodTasting.module.scss";

type Props = { view: FoodTastingView; backLabel: string; onBack: () => void; onImageError: () => void };
export default function PreviewFoodTasting({ view, backLabel, onBack, onImageError }: Props) {
  return <section className={styles.detail} aria-labelledby="food-tasting-title">
    <ActionButton variant="quiet" icon="arrowBack" className={styles.back} onClick={onBack}>{backLabel}</ActionButton>
    <h2 id="food-tasting-title" tabIndex={-1}>{view.name}</h2>
    <p className={styles.provisional}>{view.notice}</p>
    {view.photo ? <figure className={styles.figure}>
      <Image src={BASE_PATH + view.photo.src} width={view.photo.width} height={view.photo.height} alt={view.photo.alt} className={styles.image} sizes="(min-width: 48rem) 42rem, 100vw" onError={onImageError} />
      <figcaption><PreviewFoodPhotoCredit photo={view.photo} /></figcaption>
    </figure> : null}
    <p>{view.description}</p>
    <dl className={styles.facts}>
      <div><dt>Vendor</dt><dd>{view.vendor}{view.vendorStatus ? <span className={styles.pending}>{view.vendorStatus}</span> : null}</dd></div>
      <div><dt>Shared serving</dt><dd>{view.portion}</dd></div>
      <div><dt>Token cost</dt><dd>{view.price}</dd></div>
      <div><dt>Ingredients &amp; dietary information</dt><dd>{view.dietary}</dd></div>
      <div><dt>Location</dt><dd>{view.location}</dd></div>
      <div><dt>Availability</dt><dd>{view.availability}</dd></div>
    </dl>
  </section>;
}
