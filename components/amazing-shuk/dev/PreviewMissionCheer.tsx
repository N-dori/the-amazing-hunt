import ActionButton from "@/components/ui/ActionButton";
import { Icon } from "@/components/icons";
import styles from "./PreviewMissionCheer.module.scss";

type Props = {
  cheer: string; celebrate: boolean;
  // The next mission on the map the group hasn't finished; null once every mission is done.
  next: { order: number; name: string } | null;
  // An optional bonus waits below this card.
  bonusBelow: boolean;
  onNext: () => void; onMap: () => void;
};
// TODO(copy): the lines below are drafts for owner review (26 Oct 2026).
/** After a mission's answer is accepted: a cheer, then a clear way to the next stop. */
export default function PreviewMissionCheer({ cheer, celebrate, next, bonusBelow, onNext, onMap }: Props) {
  return <section className={`${styles.cheer} ${celebrate ? styles.celebrate : ""}`} aria-labelledby="mission-cheer-title">
    {celebrate ? <span className={styles.badge} aria-hidden="true"><Icon name="check" className={styles.badgeIcon} /></span> : null}
    <h2 id="mission-cheer-title" className={styles.title}>{cheer}</h2>
    {next ? <>
      <p className={styles.next}>Next stop: mission {next.order}, {next.name}.</p>
      {bonusBelow ? <p>Got a minute first? There&apos;s an optional bonus below.</p> : null}
      <ActionButton block icon="arrowForward" onClick={onNext}>Go to the next stop</ActionButton>
      <ActionButton variant="quiet" icon="map" onClick={onMap}>Back to the map</ActionButton>
    </> : <>
      {/* The owner's closing line, 26 Oct 2026. */}
      <p className={styles.next}>That was the last one! Now go find what the market has to offer you…</p>
      <ActionButton block icon="map" onClick={onMap}>Back to the map</ActionButton>
    </>}
  </section>;
}
