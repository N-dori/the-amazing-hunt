import Image from "next/image";
import ActionButton from "@/components/ui/ActionButton";
import { BASE_PATH } from "@/lib/base-path";
import type { MissionPresentation } from "@/lib/amazing-shuk/mission-arrival";
import styles from "./PreviewArrivalMission.module.scss";

type Props = { view: MissionPresentation; guide: boolean; busy: boolean; feedback: string;
  onArrival: () => void; onConfirm: () => void; onOpenChallenge: () => void; onBack: () => void };
/** Location details: help the group recognise the place. GPS is optional reassurance and never gates the challenge. */
export default function PreviewArrivalMission({ view, guide, busy, feedback, onArrival, onConfirm, onOpenChallenge, onBack }: Props) {
  return <section className={styles.preview} id="mission-location" aria-labelledby="mission-location-title">
    <ActionButton variant="quiet" onClick={onBack}>Back to map</ActionButton>
    <p className={styles.status}>{view.status}</p>
    <h2 id="mission-location-title">{view.name}</h2>
    {view.location.hebrewName ? <p className={`rtl ${styles.hebrew}`} lang="he">{view.location.hebrewName}</p> : null}
    <p className={styles.area}>{view.neighborhood}</p>
    {view.photo ? <Image src={BASE_PATH + view.photo.src} alt={view.photo.alt} width={640} height={640} sizes="(min-width: 48rem) 42rem, 100vw" className={styles.photo} />
      : <p className={styles.photoGap}>Reference photograph not yet available. Use the landmark clue and your guide.</p>}
    <p>{view.location.summary}</p>
    <h3>Look for</h3>
    <p>{view.clue}</p>
    {view.cluePhoto ? <Image src={BASE_PATH + view.cluePhoto.src} alt={view.cluePhoto.alt} width={640} height={640} sizes="(min-width: 48rem) 42rem, 100vw" className={styles.photo} /> : null}
    {view.location.landmarks.length ? <>
      <h3>Landmarks</h3>
      <ul className={styles.landmarks}>{view.location.landmarks.map(landmark => <li key={landmark}>{landmark}</li>)}</ul>
    </> : null}
    {view.arrivedPoints > 0 ? <p className={styles.success}>Group arrival confirmed! {view.arrivedPoints} arrival points earned.</p> : null}
    <div className={styles.arrival}>
      <ActionButton variant="quiet" disabled={busy} onClick={onArrival}>We&apos;re Here?</ActionButton>
      <p>Optional: check the area once. You can play without checking your location.</p>
      {guide && view.arrivedPoints === 0 ? <ActionButton variant="quiet" disabled={busy} onClick={onConfirm}>Confirm Group Arrival</ActionButton> : null}
      {feedback ? <p role="status" aria-live="polite">{feedback}</p> : null}
    </div>
    <ActionButton onClick={onOpenChallenge}>Open Challenge</ActionButton>
  </section>;
}
