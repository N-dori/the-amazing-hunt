"use client";
import { useRef } from "react";
import { Icon } from "@/components/icons";
import ActionButton from "@/components/ui/ActionButton";
import PreviewBottomSheet from "../PreviewBottomSheet";
import styles from "./PreviewStuckConfirm.module.scss";

type Props = {
  // The quiet "I'm completely stuck" button shows only while this phone may press it.
  canReveal: boolean; open: boolean; busy: boolean;
  // The core challenge's food tokens, kept after a reveal (D3).
  foodTokens: number;
  onOpen: () => void; onKeepTrying: () => void; onReveal: () => void;
};
// TODO(copy): every visible line below is a draft (plan §5, 2 Nov 2026), pending the owner's approval.
// TODO(copy): "Stuck?" is a draft caption (8 Nov 2026). The button's full name stays "I'm completely stuck" for screen readers.
const STUCK_LABEL = "I'm completely stuck";
const STUCK_CAPTION = "Stuck?";
/** "I'm completely stuck": a lifebuoy beside the hints, above the challenge's title (owner, 5 Nov 2026: a real button, not a link at the
 * foot; 8 Nov 2026: an icon). A short caption under the icon keeps it discoverable for anyone who doesn't know the symbol. Then its
 * confirmation, with "Keep trying" focused first so a mis-tap costs nothing. */
export default function PreviewStuckConfirm({ canReveal, open, busy, foodTokens, onOpen, onKeepTrying, onReveal }: Props) {
  const keepTrying = useRef<HTMLButtonElement>(null);
  if (!canReveal) return null;
  return <>
    <button type="button" className={styles.stuck} aria-label={STUCK_LABEL} title={STUCK_LABEL} aria-haspopup="dialog" onClick={onOpen}>
      <span className={styles.stuckCircle}><Icon name="lifebuoy" className={styles.stuckIcon} /></span>
      <span className={styles.caption} aria-hidden="true">{STUCK_CAPTION}</span>
    </button>
    <PreviewBottomSheet open={open} title="Show the answer?" closeLabel="Close" onClose={onKeepTrying} initialFocus={keepTrying}
      footer={<div className={styles.choices}>
        <button ref={keepTrying} type="button" className={styles.keep} onClick={onKeepTrying}>Keep trying</button>
        <ActionButton disabled={busy} onClick={onReveal}>Show the answer</ActionButton>
      </div>}>
      <p className={styles.text}>You&apos;ll see the answer and can carry on. This challenge will give 0 points.</p>
      {foodTokens > 0 ? <p className={styles.text}>You&apos;ll still get {foodTokens === 1 ? "1 food token" : `${foodTokens} food tokens`}.</p> : null}
    </PreviewBottomSheet>
  </>;
}
