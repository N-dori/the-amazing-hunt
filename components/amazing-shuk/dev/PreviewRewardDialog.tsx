"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import ActionButton from "@/components/ui/ActionButton";
import { Icon } from "@/components/icons";
import { COUNT_UP_MS, countUpValue } from "@/lib/amazing-shuk/count-up";
import type { RewardAmount } from "@/lib/amazing-shuk/mission-cheer";
import PreviewBottomSheet from "../PreviewBottomSheet";
import styles from "./PreviewRewardDialog.module.scss";

type Props = {
  open: boolean; title: string; celebrate: boolean; weight: "full" | "light" | "quiet";
  // The server's award, one line per amount. The points count up once, quickly (UX-4); the rest shows as it is.
  amounts: readonly RewardAmount[];
  onContinue: () => void;
};

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const subscribeMotion = (onChange: () => void) => {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};
const reducedMotion = () => window.matchMedia(REDUCED_MOTION).matches;
// Rendered without a browser (the server, tests), the final numbers show: nothing to animate there.
const reducedMotionOnServer = () => true;

// TODO(copy): "Continue" and "Close" are drafts (Phase 2d).
/** One compact, dismissible pop-up per new award (plan §8a), on the shared sheet: Escape, Back and a backdrop tap close it.
 * Focus goes to the amounts so they are read first; Continue comes last. A screen reader hears each final amount once:
 * the moving digits are hidden from it. Each new award mounts a new pop-up (keyed by the caller), so the count-up plays once. */
export default function PreviewRewardDialog({ open, title, celebrate, weight, amounts, onContinue }: Props) {
  const summary = useRef<HTMLDivElement>(null);
  const reduce = useSyncExternalStore(subscribeMotion, reducedMotion, reducedMotionOnServer);
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!open || reduce) return;
    let frame = 0;
    let start: number | null = null;
    const tick = (time: number) => {
      start ??= time;
      setElapsed(time - start);
      if (time - start < COUNT_UP_MS) frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [open, reduce]);
  return <PreviewBottomSheet open={open} title={title} closeLabel="Close" onClose={onContinue} initialFocus={summary}
    footer={<ActionButton block onClick={onContinue}>Continue</ActionButton>}>
    <div ref={summary} tabIndex={-1} className={`${styles.reward} ${styles[weight]}`}>
      {celebrate ? <span className={styles.badge} aria-hidden="true"><Icon name="check" className={styles.badgeIcon} /></span> : null}
      {amounts.length ? <ul className={styles.amounts}>{amounts.map(amount => <li key={amount.key}>
        <span aria-hidden="true">+<span className={styles.digits}>{amount.countUp && !reduce ? countUpValue(amount.value, elapsed) : amount.value}</span> {amount.unit}</span>
        <span className="srOnly">{amount.label}</span>
      </li>)}</ul> : null}
    </div>
  </PreviewBottomSheet>;
}
