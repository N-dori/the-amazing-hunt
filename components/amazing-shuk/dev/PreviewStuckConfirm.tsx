"use client";
import { useRef } from "react";
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
/** "I'm completely stuck": a strong button beside the hints, above the challenge's title (owner, 5 Nov 2026; it was a quiet link at the
 * foot), and its confirmation, with "Keep trying" focused first so a mis-tap costs nothing. */
export default function PreviewStuckConfirm({ canReveal, open, busy, foodTokens, onOpen, onKeepTrying, onReveal }: Props) {
  const keepTrying = useRef<HTMLButtonElement>(null);
  if (!canReveal) return null;
  return <>
    <button type="button" className={styles.stuck} aria-haspopup="dialog" onClick={onOpen}>I&apos;m completely stuck</button>
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
