"use client";
import { useRef } from "react";
import ActionButton from "@/components/ui/ActionButton";
import { Icon } from "@/components/icons";
import PreviewBottomSheet from "../PreviewBottomSheet";
import styles from "./PreviewRewardDialog.module.scss";

type Props = {
  open: boolean; title: string; celebrate: boolean; weight: "full" | "light" | "quiet";
  // Text only ("+100 points"), read as text: no count-up.
  amounts: readonly string[];
  onContinue: () => void;
};
// TODO(copy): "Continue" and "Close" are drafts (Phase 2d).
/** One compact, dismissible pop-up per new award (plan §8a), on the shared sheet: Escape, Back and a backdrop tap close it.
 * Focus goes to the amounts so they are read first; Continue comes last. */
export default function PreviewRewardDialog({ open, title, celebrate, weight, amounts, onContinue }: Props) {
  const summary = useRef<HTMLDivElement>(null);
  return <PreviewBottomSheet open={open} title={title} closeLabel="Close" onClose={onContinue} initialFocus={summary}
    footer={<ActionButton block onClick={onContinue}>Continue</ActionButton>}>
    <div ref={summary} tabIndex={-1} className={`${styles.reward} ${styles[weight]}`}>
      {celebrate ? <span className={styles.badge} aria-hidden="true"><Icon name="check" className={styles.badgeIcon} /></span> : null}
      {amounts.length ? <ul className={styles.amounts}>{amounts.map(amount => <li key={amount}>{amount}</li>)}</ul> : null}
    </div>
  </PreviewBottomSheet>;
}
