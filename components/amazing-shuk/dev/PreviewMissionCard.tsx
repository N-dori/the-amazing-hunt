import { useEffect, useRef, type KeyboardEvent } from "react";
import Image from "next/image";
import ActionButton from "@/components/ui/ActionButton";
import { Icon } from "@/components/icons";
import { BASE_PATH } from "@/lib/base-path";
import type { MissionPresentation } from "@/lib/amazing-shuk/mission-arrival";
import styles from "./PreviewMissionCard.module.scss";

type Props = { view: MissionPresentation; onViewLocation: () => void; onClose: () => void };
// The badge repeats the tapped pin (same number or symbol, same state colour), so the sheet reads as that marker's card.
const BADGE_STATE = { active: styles.badgeActive, conditional: styles.badgeArrived, completed: styles.badgeDone, locked: "" };
/** First tap on a marker: where is it, and do we want to go? No story, question or answer here. */
export default function PreviewMissionCard({ view, onViewLocation, onClose }: Props) {
  const title = useRef<HTMLHeadingElement>(null);
  // Move focus into the sheet when a marker opens it, so keyboard and screen-reader users land on the mission.
  useEffect(() => { title.current?.focus({ preventScroll: true }); }, [view.id]);
  const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
  return <section className={`${styles.sheet} ${view.state === "completed" ? styles.sheetDone : ""}`} id="mission-preview"
    aria-labelledby="mission-preview-title" onKeyDown={closeOnEscape}>
    <div className={styles.top}>
      <span className={`${styles.badge} ${BADGE_STATE[view.marker.state]}`} aria-hidden="true">{view.marker.symbol}</span>
      <p className={styles.status}>{view.status}</p>
      <button type="button" className={styles.close} aria-label="Close preview" onClick={onClose}><Icon name="close" className={styles.icon} /></button>
    </div>
    <h2 id="mission-preview-title" className={styles.title} tabIndex={-1} ref={title}>{view.title}</h2>
    <p className={styles.place}><Icon name="mapMarker" className={styles.placeIcon} /><span>{view.name}</span></p>
    {view.photo ? <Image src={BASE_PATH + view.photo.src} alt={view.photo.alt} width={640} height={360} sizes="(min-width: 54rem) 54rem, 100vw" className={styles.photo} />
      : <p className={styles.photoGap}><Icon name="camera" className={styles.icon} /><span>Reference photograph not yet available.</span></p>}
    <p className={styles.summary}>{view.location.summary}</p>
    <ActionButton block icon="arrowForward" onClick={onViewLocation}>View Location</ActionButton>
  </section>;
}
