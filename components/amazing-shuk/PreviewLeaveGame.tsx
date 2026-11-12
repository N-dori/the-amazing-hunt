"use client";
import { useRef } from "react";
import ActionButton from "@/components/ui/ActionButton";
import PreviewBottomSheet from "./PreviewBottomSheet";
import styles from "./PreviewLeaveGame.module.scss";

type Props = { open: boolean; copy: Readonly<{ title: string; text: string; stay: string; leave: string }>;
  afterClose: { current: (() => void) | null }; onStay: () => void; onLeave: () => void };
/** "Leave the game?" (owner, 5 Nov 2026): the phone's Back from the game's first screen asks first. Stay is focused first, so a second
 * Back or a mis-tap keeps the player in the game; both choices are 3rem targets. */
export default function PreviewLeaveGame({ open, copy, afterClose, onStay, onLeave }: Props) {
  const stay = useRef<HTMLButtonElement>(null);
  return <PreviewBottomSheet open={open} title={copy.title} closeLabel={copy.stay} onClose={onStay} initialFocus={stay} afterClose={afterClose}
    footer={<div className={styles.choices}>
      <button ref={stay} type="button" className={styles.keep} onClick={onStay}>{copy.stay}</button>
      <ActionButton onClick={onLeave}>{copy.leave}</ActionButton>
    </div>}>
    <p className={styles.text}>{copy.text}</p>
  </PreviewBottomSheet>;
}
