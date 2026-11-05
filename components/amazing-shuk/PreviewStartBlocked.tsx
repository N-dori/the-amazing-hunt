"use client";
import { useRef } from "react";
import ActionButton from "@/components/ui/ActionButton";
import type { LobbyCopy } from "@/lib/amazing-shuk/welcome-copy";
import PreviewBottomSheet from "./PreviewBottomSheet";
import styles from "./PreviewStartBlocked.module.scss";

type Props = { copy: LobbyCopy; open: boolean; missing: readonly string[]; canGiveToMe: boolean; busy: boolean;
  onSetRoles: () => void; onGiveToMe: () => void; onClose: () => void };
/** Start with the Navigator or the Submitter still empty (owner, 5 Nov 2026): say which, then two ways on: go back and set the roles,
 * or, for the team's leader, take the missing ones and start. "Set the roles" is focused first: it changes nothing by itself. */
export default function PreviewStartBlocked({ copy, open, missing, canGiveToMe, busy, onSetRoles, onGiveToMe, onClose }: Props) {
  const setRoles = useRef<HTMLButtonElement>(null);
  return <PreviewBottomSheet open={open} title={copy.blockedTitle} closeLabel={copy.back} onClose={onClose} initialFocus={setRoles}
    footer={<div className={`${styles.choices} ${canGiveToMe ? "" : styles.single}`}>
      <button ref={setRoles} type="button" className={styles.keep} onClick={onSetRoles}>{copy.blockedSetRoles}</button>
      {canGiveToMe ? <ActionButton disabled={busy} onClick={onGiveToMe}>{copy.blockedGiveToMe}</ActionButton> : null}
    </div>}>
    <p className={styles.text}>{copy.blockedText(missing)}</p>
  </PreviewBottomSheet>;
}
