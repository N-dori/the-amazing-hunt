import Image from "next/image";
import ActionButton from "@/components/ui/ActionButton";
import { Icon } from "@/components/icons";
import { BASE_PATH } from "@/lib/base-path";
import type { MissionPresentation } from "@/lib/amazing-shuk/mission-arrival";
import styles from "./PreviewArrivalMission.module.scss";

type Props = { view: MissionPresentation; guide: boolean; busy: boolean; feedback: string;
  onArrival: () => void; onConfirm: () => void; onOpenChallenge: () => void; onBack: () => void };
/** Location details: help the group recognise the place. GPS is optional reassurance and never gates the challenge. */
export default function PreviewArrivalMission({ view, guide, busy, feedback, onArrival, onConfirm, onOpenChallenge, onBack }: Props) {
  return <section className={styles.preview} id="mission-location" aria-labelledby="mission-location-title">
    <div className={styles.top}>
      <button type="button" className={styles.back} onClick={onBack}><Icon name="arrowBack" className={styles.icon} /><span>Back to map</span></button>
      {/* The pin's number only: missions can be played in any order. */}
      <p className={styles.pill}>Mission {view.marker.order} · {view.status}</p>
    </div>
    {view.photo ? <div className={styles.hero}>
      <Image src={BASE_PATH + view.photo.src} alt={view.photo.alt} width={640} height={640} sizes="(min-width: 48rem) 42rem, 100vw" className={styles.photo} />
    </div> : <p className={styles.photoGap}><Icon name="camera" className={styles.icon} /><span>Reference photograph not yet available. Use the landmark clue and your guide.</span></p>}
    <h2 id="mission-location-title" className={styles.title}>{view.name}</h2>
    {view.location.hebrewName ? <p className={`rtl ${styles.hebrew}`} lang="he">{view.location.hebrewName}</p> : null}
    <p className={styles.area}><Icon name="mapMarker" className={styles.icon} /><span>{view.neighborhood}</span></p>
    <p className={styles.summary}>{view.location.summary}</p>
    <section className={styles.lookFor} aria-labelledby="mission-look-for">
      <h3 id="mission-look-for" className={styles.cardTitle}><Icon name="search" className={styles.icon} /><span>Look for</span></h3>
      <p>{view.clue}</p>
      {view.cluePhoto ? <Image src={BASE_PATH + view.cluePhoto.src} alt={view.cluePhoto.alt} width={640} height={640} sizes="(min-width: 48rem) 42rem, 100vw" className={styles.cluePhoto} /> : null}
      {view.location.landmarks.length ? <>
        <h4 className={styles.subTitle}>Landmarks</h4>
        <ul className={styles.landmarks}>{view.location.landmarks.map(landmark => <li key={landmark}>{landmark}</li>)}</ul>
      </> : null}
    </section>
    {view.arrivedPoints > 0 ? <p className={styles.success}>Group arrival confirmed! {view.arrivedPoints} arrival points earned.</p> : null}
    <div className={styles.arrival}>
      <ActionButton variant="quiet" icon="compass" disabled={busy} onClick={onArrival}>We&apos;re Here?</ActionButton>
      <p className={styles.note}><Icon name="info" className={styles.icon} /><span>Optional: check the area once. You can play without checking your location.</span></p>
      {guide && view.arrivedPoints === 0 ? <ActionButton variant="quiet" disabled={busy} onClick={onConfirm}>Confirm Group Arrival</ActionButton> : null}
      {feedback ? <p role="status" aria-live="polite">{feedback}</p> : null}
    </div>
    <div className={styles.launch}>
      <ActionButton block icon="arrowForward" onClick={onOpenChallenge}>Open Challenge</ActionButton>
      {/* Food tokens reward completion; points depend on play, so none are promised here. */}
      <p className={styles.reward}><Icon name="food" className={styles.icon} /><span>+{view.rewards.foodTokens} food tokens</span></p>
    </div>
  </section>;
}
