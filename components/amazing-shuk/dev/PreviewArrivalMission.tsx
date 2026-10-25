import { Icon } from "@/components/icons";
import { ARRIVAL_UNAVAILABLE } from "@/lib/amazing-shuk/mission-arrival";
import Image from "next/image";
import ActionButton from "@/components/ui/ActionButton";
import { BASE_PATH } from "@/lib/base-path";
import type { MissionPresentation } from "@/lib/amazing-shuk/mission-arrival";
import styles from "./PreviewArrivalMission.module.scss";

type Props = { view: MissionPresentation; busy: boolean; feedback: string;
  onArrival: () => void; onOpenChallenge: () => void; onBack: () => void };
/** Location details: help the group recognise the place. GPS is optional reassurance and never gates the challenge. */
export default function PreviewArrivalMission({ view, busy, feedback, onArrival, onOpenChallenge, onBack }: Props) {
  return <section className={styles.preview} id="mission-location" aria-labelledby="mission-location-title">
    <ActionButton variant="quiet" onClick={onBack}>Back to map</ActionButton>
    {view.photo ? <Image src={BASE_PATH + view.photo.src} alt={view.photo.alt} width={640} height={640} sizes="(min-width: 48rem) 42rem, 100vw" className={styles.photo} />
      : <p className={styles.photoGap}>Reference photograph not yet available. Use the landmark clue and your guide.</p>}
    {view.state === "completed" ? <p className={styles.status}>{view.status}</p> : null}
    <h2 id="mission-location-title">{view.name}</h2>
    {view.location.hebrewName ? <p className={`rtl ${styles.hebrew}`} lang="he">{view.location.hebrewName}</p> : null}
    <p className={styles.area}>{view.location.detailsArea ?? view.neighborhood}</p>
    <h3>What to look for</h3>
    <p>{view.location.whatToLookFor}</p>
    {view.cluePhoto ? <Image src={BASE_PATH + view.cluePhoto.src} alt={view.cluePhoto.alt} width={640} height={640} sizes="(min-width: 48rem) 42rem, 100vw" className={styles.cluePhoto} /> : null}
    {view.arrivalConfirmed ? <div className={styles.success} role="status">
      <Icon name="check" className={styles.confirmationIcon} />
      <div><p>Group arrival confirmed</p><p>+{view.arrivedPoints} arrival points earned</p></div>
    </div> : <div className={styles.arrival}>
      {view.gpsEnabled ? <>
        <ActionButton variant="quiet" icon="mapMarker" className={styles.checkArrival} disabled={busy} onClick={onArrival}>We&apos;re Here?</ActionButton>
        {!feedback ? <p>Check if you&apos;re nearby. You can play without checking.</p> : null}
      </> : null}
      {feedback || !view.gpsEnabled ? <p role="status" aria-live="polite">{feedback || ARRIVAL_UNAVAILABLE}</p> : null}
    </div>}
    <div className={styles.actions}><ActionButton block onClick={onOpenChallenge}>Open Challenge</ActionButton></div>
  </section>;
}
