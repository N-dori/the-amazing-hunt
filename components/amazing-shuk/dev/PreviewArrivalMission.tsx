import Image from "next/image";
import ActionButton from "@/components/ui/ActionButton";
import { BASE_PATH } from "@/lib/base-path";
import type { MissionPresentation } from "@/lib/amazing-shuk/mission-arrival";
import styles from "./PreviewArrivalMission.module.scss";

type Props = { view: MissionPresentation; selected: boolean; guide: boolean; busy: boolean; feedback: string;
  onSelect: () => void; onArrival: () => void; onConfirm: () => void };
/** GPS status is optional reassurance and never gates the story or challenge. */
export default function PreviewArrivalMission({ view, selected, guide, busy, feedback, onSelect, onArrival, onConfirm }: Props) {
  return <section className={styles.preview} id="mission-preview" aria-label="Mission destination">
    <p className={styles.status}>{view.status}</p>
    {!selected ? <ActionButton onClick={onSelect}>Explore Gan HaTut</ActionButton> : <>
      <h2>{view.name}</h2><p>{view.neighborhood}</p>
      {view.photo ? <Image src={BASE_PATH + view.photo.src} alt={view.photo.alt} width={640} height={420} className={styles.photo} />
        : <p className={styles.photoGap}>Reference photograph not yet available. Use the landmark clue and your guide.</p>}
      <p>{view.clue}</p>
      {view.arrivedPoints > 0 ? <p className={styles.success}>Group arrival confirmed! {view.arrivedPoints} arrival points earned.</p> : null}
      <ActionButton disabled={busy} onClick={onArrival}>We&apos;re Here?</ActionButton>
      <p>Optional: check the area once. You can play without checking your location.</p>
      {guide && view.arrivedPoints === 0 ? <ActionButton variant="quiet" disabled={busy} onClick={onConfirm}>Confirm Group Arrival</ActionButton> : null}
      {feedback ? <p role="status" aria-live="polite">{feedback}</p> : null}
    </>}
  </section>;
}
