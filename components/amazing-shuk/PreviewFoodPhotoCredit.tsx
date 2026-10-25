import Link from "next/link";
import type { FoodPhoto } from "@/lib/amazing-shuk/food-catalogue";
import styles from "./FoodTasting.module.scss";

export default function PreviewFoodPhotoCredit({ photo }: { photo: FoodPhoto }) {
  return <p className={styles.credit}>{photo.caption} <Link href={photo.sourceUrl}>{photo.author}</Link>{" · "}
    <Link href={photo.licenseUrl}>{photo.license}</Link>. {photo.changes}</p>;
}
