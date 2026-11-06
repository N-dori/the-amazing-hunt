"use client";
import { useState } from "react";
import ActionButton from "@/components/ui/ActionButton";
import { Icon } from "@/components/icons";
import styles from "./PreviewMissionCheer.module.scss";

type Props = {
  cheer: string; celebrate: boolean;
  // The next mission on the map the group hasn't finished; null once every mission is done.
  next: { order: number; name: string } | null;
  // An optional bonus waits below this card.
  bonusBelow: boolean;
  // Whether this phone takes the group on (the Navigator, the guide, solo, or anyone while the seat is empty; owner, 5 Nov 2026).
  canGoOn?: boolean;
  // A line under the cheer, e.g. after "I'm completely stuck": who taps Go to the next stop.
  instruction?: string;
  // Shown when someone else's phone taps the disabled button.
  onlyNavigator?: string;
  onNext: () => void; onMap: () => void;
};
// TODO(copy): the lines below are drafts for owner review (26 Oct 2026).
/** After a mission's answer is accepted: a cheer, then a clear way to the next stop. Only the Navigator's phone goes on; on the others
 * the button stays visible but disabled, and a tap says why (owner, 5 Nov 2026). */
export default function PreviewMissionCheer({ cheer, celebrate, next, bonusBelow, canGoOn = true, instruction, onlyNavigator, onNext, onMap }: Props) {
  const [why, setWhy] = useState(false);
  return <section className={`${styles.cheer} ${celebrate ? styles.celebrate : ""}`} aria-labelledby="mission-cheer-title">
    {celebrate ? <span className={styles.badge} aria-hidden="true"><Icon name="check" className={styles.badgeIcon} /></span> : null}
    <h2 id="mission-cheer-title" className={styles.title}>{cheer}</h2>
    {instruction && next ? <p className={styles.instruction}>{instruction}</p> : null}
    {next ? <>
      <p className={styles.next}>Next stop: mission {next.order}, {next.name}.</p>
      {bonusBelow ? <p>Got a minute first? There&apos;s an optional bonus below.</p> : null}
      {canGoOn ? <ActionButton block icon="arrowForward" onClick={onNext}>Go to the next stop</ActionButton>
        : <ActionButton block icon="arrowForward" className={styles.notMine} aria-disabled="true" aria-describedby={why ? "cheer-only-navigator" : undefined}
          onClick={() => setWhy(true)}>Go to the next stop</ActionButton>}
      {!canGoOn && why && onlyNavigator ? <p id="cheer-only-navigator" className={styles.why} role="status">{onlyNavigator}</p> : null}
      <ActionButton variant="quiet" icon="map" onClick={onMap}>Back to the map</ActionButton>
    </> : <>
      {/* The owner's closing line, 26 Oct 2026. */}
      <p className={styles.next}>That was the last one! Now go find what the market has to offer you…</p>
      <ActionButton block icon="map" onClick={onMap}>Back to the map</ActionButton>
    </>}
  </section>;
}
