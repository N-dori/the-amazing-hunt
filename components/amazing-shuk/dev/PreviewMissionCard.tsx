import { useEffect, useRef, type KeyboardEvent } from "react";
import Image from "next/image";
import ActionButton from "@/components/ui/ActionButton";
import { Icon } from "@/components/icons";
import { BASE_PATH } from "@/lib/base-path";
import type { MissionPresentation } from "@/lib/amazing-shuk/mission-arrival";
import styles from "./PreviewMissionCard.module.scss";

type Props = { view: MissionPresentation; onViewLocation: () => void; onClose: () => void };
// The pill repeats the tapped pin (its number and state colour), so the sheet reads as that marker's card.
const PILL_STATE = { active: styles.pillActive, conditional: styles.pillArrived, completed: styles.pillDone, locked: "" };
// TODO(copy): draft from the owner's idea, 26 Oct 2026 ("for earning the best chocolate in the market you have to answer…").
const LOCKED_NOTE = "To earn the best chocolate in the market, first complete all the other missions. This stop opens last.";
/** First tap on a marker: where is it, and do we want to go? No story, question or answer here. */
export default function PreviewMissionCard({ view, onViewLocation, onClose }: Props) {
  const title = useRef<HTMLHeadingElement>(null);
  // Move focus into the sheet when a marker opens it, so keyboard and screen-reader users land on the mission.
  useEffect(() => { title.current?.focus({ preventScroll: true }); }, [view.id]);
  const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
  return <section className={`${styles.sheet} ${view.state === "completed" ? styles.sheetDone : ""}`} id="mission-preview"
    aria-labelledby="mission-preview-title" onKeyDown={closeOnEscape}>
    <div className={styles.top}>
      <p className={`${styles.pill} ${PILL_STATE[view.marker.state]}`}>Mission {view.marker.order} · {view.status}</p>
      <button type="button" className={styles.close} aria-label="Close preview" onClick={onClose}><Icon name="close" className={styles.icon} /></button>
    </div>
    {/* Only this part scrolls, and only when large text makes it taller than the sheet; the action stays in view. */}
    <div className={styles.body}>
      <h2 id="mission-preview-title" className={styles.title} tabIndex={-1} ref={title}>{view.title}</h2>
      <p className={styles.place}><Icon name="mapMarker" className={styles.placeIcon} /><span>{view.name}</span></p>
      <div className={styles.teaser}>
        {view.photo ? <Image src={BASE_PATH + view.photo.src} alt={view.photo.alt} width={144} height={144} sizes="4.5rem" className={styles.thumb} />
          : <p className={styles.thumbGap}><Icon name="camera" className={styles.icon} /><span className="srOnly">Reference photograph not yet available.</span></p>}
        <p className={styles.summary}>{view.location.summary}</p>
      </div>
    </div>
    <div className={styles.action}>
      {view.locked ? <p className={styles.locked} role="status"><Icon name="info" className={styles.icon} /><span>{LOCKED_NOTE}</span></p>
        : <ActionButton block icon="arrowForward" onClick={onViewLocation}>View Location</ActionButton>}
    </div>
  </section>;
}
