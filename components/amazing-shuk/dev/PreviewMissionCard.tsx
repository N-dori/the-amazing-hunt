import Image from "next/image";
import ActionButton from "@/components/ui/ActionButton";
import { Icon } from "@/components/icons";
import { BASE_PATH } from "@/lib/base-path";
import type { MissionPresentation } from "@/lib/amazing-shuk/mission-arrival";
import styles from "./PreviewMissionCard.module.scss";

type Props = { view: MissionPresentation; onViewLocation: () => void; onClose: () => void };
/** First tap on a marker: where is it, and do we want to go? No story, question or answer here. */
export default function PreviewMissionCard({ view, onViewLocation, onClose }: Props) {
  return <section className={styles.sheet} id="mission-preview" aria-labelledby="mission-preview-title">
    <div className={styles.top}>
      <p className={styles.status}>{view.status}</p>
      <button type="button" className={styles.close} aria-label="Close preview" onClick={onClose}><Icon name="close" className={styles.icon} /></button>
    </div>
    <div className={styles.body}>
      {view.photo ? <Image src={BASE_PATH + view.photo.src} alt={view.photo.alt} width={160} height={120} className={styles.photo} />
        : <p className={styles.photoGap}>Reference photograph not yet available.</p>}
      <div className={styles.text}>
        <h2 id="mission-preview-title">{view.title}</h2>
        <p className={styles.place}>{view.name}</p>
        <p>{view.location.summary}</p>
      </div>
    </div>
    <ActionButton onClick={onViewLocation}>View Location</ActionButton>
  </section>;
}
