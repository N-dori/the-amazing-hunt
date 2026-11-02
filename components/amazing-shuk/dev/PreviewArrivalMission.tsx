import { useState, type ReactNode } from "react";
import Image from "next/image";
import ActionButton from "@/components/ui/ActionButton";
import { Icon } from "@/components/icons";
import { BASE_PATH } from "@/lib/base-path";
import type { MissionPresentation, MissionProgressStage } from "@/lib/amazing-shuk/mission-arrival";
import PreviewBottomSheet from "@/components/amazing-shuk/PreviewBottomSheet";
import PreviewMissionProgress from "@/components/amazing-shuk/PreviewMissionProgress";
import styles from "./PreviewArrivalMission.module.scss";

// `map`: the destination strip (ListArrivalMission), the illustrated map with this mission's marker only.
// `canSelfArrive`: this player may say "We're here" (the navigator, a solo player or the guide; D6). `solo`: a team of one (D12).
type Props = { view: MissionPresentation; stage: MissionProgressStage; map?: ReactNode; guide: boolean; busy: boolean; feedback: string;
  canSelfArrive: boolean; solo: boolean;
  onArrival: () => void; onConfirm: () => void; onSelfArrive: () => void; onOpenChallenge: () => void };
// TODO(copy): drafts for owner review (30 Oct 2026): the section title (was "Look for") and the photo's enlarge and close labels.
// "We're here" (2 Nov 2026): "You've made it!" is approved for solo; the button and confirmation lines are drafts.
const COPY = { lookFor: "What to look for", enlarge: "Enlarge the photo", closePhoto: "Close photo",
  weAreHere: "We're here", iAmHere: "I'm here", confirmTitle: "Confirm your arrival", closeConfirm: "Close without confirming",
  confirmQuestion: (place: string) => `Are you at ${place}?`, confirmYesSolo: "Yes, I'm here", confirmYes: "Yes, we're here", notYet: "Not yet",
  arrivedSolo: (points: number) => `You've made it! ${points} arrival points earned.`,
  arrivedGroup: (points: number) => `Group arrival confirmed! ${points} arrival points earned.` };
/** Find this place: the destination, then an outdoor recognition task. Where it is (the strip of map), what to look for (the clue, its
 * photo, the landmarks), have we found it (an optional location check: GPS is reassurance and never gates the challenge), what next
 * (Open Challenge). The Map tab and the phone's Back lead back to the map. */
export default function PreviewArrivalMission({ view, stage, map, guide, busy, feedback, canSelfArrive, solo, onArrival, onConfirm, onSelfArrive, onOpenChallenge }: Props) {
  const [photoOpen, setPhotoOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  return <section className={styles.preview} id="mission-location" aria-labelledby="mission-location-title">
    {/* The header shows "Find …" on this screen; the place's name stays the heading for screen readers. */}
    <h2 id="mission-location-title" className="srOnly">{view.name}</h2>
    <div className={styles.top}>
      {/* The pin's number only: missions can be played in any order. */}
      <p className={styles.pill}>Mission {view.marker.order}</p>
      <PreviewMissionProgress stage={stage} />
    </div>
    <p className={styles.meta}>
      <span className={styles.area}><Icon name="mapMarker" className={styles.icon} /><span>{view.neighborhood}</span></span>
      {/* The name as the street signs show it, to ask a passer-by the way. */}
      {view.location.hebrewName ? <span className={`rtl ${styles.hebrew}`} lang="he">{view.location.hebrewName}</span> : null}
    </p>
    {map}
    <section className={styles.lookFor} aria-labelledby="mission-look-for">
      <h3 id="mission-look-for" className={styles.cardTitle}><Icon name="search" className={styles.icon} /><span>{COPY.lookFor}</span></h3>
      <p>{view.clue}</p>
      {view.photo ? <figure className={styles.hero}>
        {/* The whole photo is the button: a tap shows it larger in a sheet over this screen. */}
        <button type="button" className={styles.enlarge} aria-label={`${COPY.enlarge}: ${view.photo.alt}`} aria-haspopup="dialog" onClick={() => setPhotoOpen(true)}>
          <Image src={BASE_PATH + view.photo.src} alt={view.photo.alt} width={640} height={640} sizes="(min-width: 48rem) 42rem, 100vw" className={styles.photo} />
        </button>
        {view.photo.credit ? <figcaption className={styles.credit}>{view.photo.credit}</figcaption> : null}
      </figure> : <p className={styles.photoGap}><Icon name="camera" className={styles.icon} /><span>Reference photograph not yet available. Use the landmark clue and your guide.</span></p>}
      {view.cluePhoto ? <Image src={BASE_PATH + view.cluePhoto.src} alt={view.cluePhoto.alt} width={640} height={640} sizes="(min-width: 48rem) 42rem, 100vw" className={styles.photo} /> : null}
      {/* Always shown: on every stop the landmarks carry how to behave there, not only where it is. */}
      {view.location.landmarks.length ? <>
        <h4 className={styles.subTitle}>Landmarks</h4>
        <ul className={styles.landmarks}>{view.location.landmarks.map(landmark => <li key={landmark}>{landmark}</li>)}</ul>
      </> : null}
      {/* Supplementary, and already on the map's preview card. TODO(copy): "About this place" is a draft label. */}
      <details className={styles.about}>
        <summary className={styles.aboutToggle}>About this place</summary>
        <p>{view.location.summary}</p>
      </details>
    </section>
    {view.arrivedPoints > 0 ? <p className={styles.success}>{solo ? COPY.arrivedSolo(view.arrivedPoints) : COPY.arrivedGroup(view.arrivedPoints)}</p> : null}
    <div className={styles.arrival}>
      {/* "We're here" (D6): an explicit confirmation, so a missing or poor GPS reading is never taken as arrival. */}
      {canSelfArrive && view.arrivedPoints === 0 && view.state !== "arrived" ? <ActionButton icon="check" disabled={busy} aria-haspopup="dialog"
        onClick={() => setConfirmOpen(true)}>{solo ? COPY.iAmHere : COPY.weAreHere}</ActionButton> : null}
      <ActionButton variant="quiet" icon="compass" disabled={busy} onClick={onArrival}>Check our location</ActionButton>
      <p className={styles.note}><Icon name="info" className={styles.icon} /><span>Optional: check the area once. You can play without checking your location.</span></p>
      {guide && view.arrivedPoints === 0 ? <ActionButton variant="quiet" disabled={busy} onClick={onConfirm}>Confirm Group Arrival</ActionButton> : null}
      {feedback ? <p role="status" aria-live="polite">{feedback}</p> : null}
    </div>
    <div className={styles.launch}>
      <ActionButton block icon="arrowForward" onClick={onOpenChallenge}>Open Challenge</ActionButton>
      {/* Food tokens reward completion; points depend on play, so none are promised here. */}
      <p className={styles.reward}><Icon name="food" className={styles.icon} /><span>+{view.rewards.foodTokens} food tokens</span></p>
    </div>
    <PreviewBottomSheet open={confirmOpen} title={COPY.confirmTitle} closeLabel={COPY.closeConfirm} onClose={() => setConfirmOpen(false)}>
      <div className={styles.confirm}>
        <p>{COPY.confirmQuestion(view.name)}</p>
        <ActionButton block icon="check" disabled={busy} onClick={() => { setConfirmOpen(false); onSelfArrive(); }}>{solo ? COPY.confirmYesSolo : COPY.confirmYes}</ActionButton>
        <ActionButton block variant="quiet" onClick={() => setConfirmOpen(false)}>{COPY.notYet}</ActionButton>
      </div>
    </PreviewBottomSheet>
    {view.photo ? <PreviewBottomSheet open={photoOpen} title={view.name} closeLabel={COPY.closePhoto} onClose={() => setPhotoOpen(false)}>
      <figure className={styles.large}>
        <Image src={BASE_PATH + view.photo.src} alt={view.photo.alt} width={1280} height={1280} sizes="(min-width: 40rem) 40rem, 100vw" className={styles.largePhoto} />
        {view.photo.credit ? <figcaption className={styles.credit}>{view.photo.credit}</figcaption> : null}
      </figure>
    </PreviewBottomSheet> : null}
  </section>;
}
