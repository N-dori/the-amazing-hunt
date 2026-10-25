import { useEffect, useRef, type ReactNode } from "react";
import type { MissionVictoryCopy } from "@/lib/amazing-shuk/mission-completion";
import type { WaterReward } from "@/lib/amazing-shuk/water-performance";
import styles from "./PreviewMissionVictory.module.scss";
import ActionButton from "@/components/ui/ActionButton";

type Props = MissionVictoryCopy & { reward: WaterReward | null; children?: ReactNode; onExplore: () => void };
/** One celebration of the server's immutable result. No scoring or completion actions. */
export default function PreviewMissionVictory({ title, summary, reward, children, onExplore }: Props) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, []);
  return <section className={styles.victory} aria-labelledby="mission-victory-title">
    <h2 ref={heading} id="mission-victory-title" tabIndex={-1} className={styles.title}>{title}</h2>
    {summary ? <p className={styles.summary}>{summary}</p> : null}
    <dl className={styles.rewards} aria-label="Mission rewards">
      <div><dt>Points earned</dt><dd aria-label={reward ? undefined : "Not recorded"}>{reward?.points ?? "—"}</dd></div>
      <div><dt>Food tokens earned</dt><dd aria-label={reward ? undefined : "Not recorded"}>{reward?.foodTokens ?? "—"}</dd></div>
      <div><dt>Hints used</dt><dd aria-label={reward ? undefined : "Not recorded"}>{reward?.hintsUsed ?? "—"}</dd></div>
    </dl>
    {children}
    <ActionButton block className={styles.explore} icon="arrowForward" onClick={onExplore}>Explore Next Mission</ActionButton>
  </section>;
}
