"use client";
import { useRef } from "react";
import ActionButton from "@/components/ui/ActionButton";
import { Icon } from "@/components/icons";
import { ROLE_EMBLEM } from "@/lib/amazing-shuk/role-emblems";
import type { AssignableGroupRole } from "@/lib/amazing-shuk/roles";
import PreviewBottomSheet from "./PreviewBottomSheet";
import styles from "./PreviewRoleCard.module.scss";

type Props = { open: boolean; role: AssignableGroupRole; title: string; text: string; ok: string; onClose: () => void };
/** The role card (owner, 5 Nov 2026): the moment a player is given a role, their own phone says so, with the role's emblem settling
 * in and one line on the job. Focus goes to the card's words, so they are read first; the emblem's motion is decorative. */
export default function PreviewRoleCard({ open, role, title, text, ok, onClose }: Props) {
  const words = useRef<HTMLDivElement>(null);
  return <PreviewBottomSheet open={open} title={title} closeLabel={ok} onClose={onClose} initialFocus={words}
    footer={<ActionButton block onClick={onClose}>{ok}</ActionButton>}>
    <div ref={words} tabIndex={-1} className={styles.card}>
      <span className={styles.emblem} aria-hidden="true"><Icon name={ROLE_EMBLEM[role]} className={styles.emblemIcon} /></span>
      <p className={styles.text}>{text}</p>
    </div>
  </PreviewBottomSheet>;
}
