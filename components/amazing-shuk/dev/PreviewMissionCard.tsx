import { useEffect, useRef, type KeyboardEvent } from "react";
import Image from "next/image";
import ActionButton from "@/components/ui/ActionButton";
import { Icon } from "@/components/icons";
import { BASE_PATH } from "@/lib/base-path";
import { destinationTitle, type MissionPresentation, type MissionProgressStage } from "@/lib/amazing-shuk/mission-arrival";
import PreviewMissionProgress from "@/components/amazing-shuk/PreviewMissionProgress";
import styles from "./PreviewMissionCard.module.scss";

type Props = { view: MissionPresentation; stage: MissionProgressStage; onViewLocation: () => void; onClose: () => void };
// The pill repeats the tapped pin (its number and state colour), so the sheet reads as that marker's card. Its words name only the
// states the progress line doesn't show (locked, arrival confirmed); "Available" and "Completed" are said by the progress line.
const PILL_STATE = { active: styles.pillActive, conditional: styles.pillArrived, completed: styles.pillDone, locked: "" };
// TODO(copy): draft from the owner's idea, 26 Oct 2026 ("for earning the best chocolate in the market you have to answer…").
const LOCKED_NOTE = "To earn the best chocolate in the market, first complete all the other missions. This stop opens last.";
// TODO(copy): "Find this place" is a draft from the owner's brief (30 Oct 2026); it replaced "View Location".
const FIND_ACTION = "Find this place";
/** First tap on a marker: the destination as a task (find this place), where it stands, and the way in. No story, question or answer. */
export default function PreviewMissionCard({ view, stage, onViewLocation, onClose }: Props) {
  const title = useRef<HTMLHeadingElement>(null);
  // Move focus into the sheet when a marker opens it, so keyboard and screen-reader users land on the mission.
  useEffect(() => { title.current?.focus({ preventScroll: true }); }, [view.id]);
  const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
  return <section className={`${styles.sheet} ${view.state === "completed" ? styles.sheetDone : ""}`} id="mission-preview"
    aria-labelledby="mission-preview-title" onKeyDown={closeOnEscape}>
    <div className={styles.top}>
      <p className={`${styles.pill} ${PILL_STATE[view.marker.state]}`}>Mission {view.marker.order}{view.locked || view.state === "arrived" ? ` · ${view.status}` : ""}</p>
      <button type="button" className={styles.close} aria-label="Close preview" onClick={onClose}><Icon name="close" className={styles.icon} /></button>
    </div>
    {/* Only this part scrolls, and only when large text makes it taller than the sheet; the action stays in view. */}
    <div className={styles.body}>
      <h2 id="mission-preview-title" className={styles.title} tabIndex={-1} ref={title}>{destinationTitle(view.name)}</h2>
      {/* The challenge's own name, as a promise of what waits there. */}
      <p className={styles.place}><Icon name="puzzle" className={styles.placeIcon} /><span>{view.title}</span></p>
      {view.locked ? null : <PreviewMissionProgress stage={stage} />}
      <div className={styles.teaser}>
        {view.photo ? <Image src={BASE_PATH + view.photo.src} alt={view.photo.alt} width={144} height={144} sizes="4.5rem" className={styles.thumb} />
          : <p className={styles.thumbGap}><Icon name="camera" className={styles.icon} /><span className="srOnly">Reference photograph not yet available.</span></p>}
        <p className={styles.summary}>{view.location.summary}</p>
      </div>
    </div>
    <div className={styles.action}>
      {view.locked ? <p className={styles.locked} role="status"><Icon name="info" className={styles.icon} /><span>{LOCKED_NOTE}</span></p>
        : <ActionButton block icon="arrowForward" onClick={onViewLocation}>{FIND_ACTION}</ActionButton>}
    </div>
  </section>;
}
