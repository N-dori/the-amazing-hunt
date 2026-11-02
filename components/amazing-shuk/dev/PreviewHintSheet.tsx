"use client";
import { useEffect, useRef } from "react";
import ActionButton from "@/components/ui/ActionButton";
import { Icon } from "@/components/icons";
import PreviewBottomSheet from "../PreviewBottomSheet";
import type { HintSheetView } from "@/lib/amazing-shuk/challenge-help";
import styles from "./PreviewHintSheet.module.scss";

type Props = {
  view: HintSheetView; open: boolean;
  // This phone asked for the next hint and the server hasn't shown it yet (it may be queued offline).
  pending: boolean; offline: boolean; busy: boolean;
  onOpen: () => void; onClose: () => void; onShowHint: () => void; onStuck: () => void;
  afterClose: { current: (() => void) | null };
};
// TODO(copy): every visible line below is a draft (plan §5, 2 Nov 2026), pending the owner's approval.
/** The hint icon with its count, and the sheet that shows the hints so far and prices the next one. */
export default function PreviewHintSheet({ view, open, pending, offline, busy, onOpen, onClose, onShowHint, onStuck, afterClose }: Props) {
  const latest = useRef<HTMLHeadingElement>(null);
  const shown = view.revealed.length;
  const seen = useRef(shown);
  // A new hint while the sheet is open: focus moves to its heading, and the sheet stays open.
  useEffect(() => {
    if (open && shown > seen.current) latest.current?.focus();
    seen.current = shown;
  }, [open, shown]);
  if (!view.available) return null;
  const label = view.remaining > 0 ? `Hints, ${view.remaining} of ${view.total} left` : "Hints, all used";
  const next = view.next;
  return <>
    <button type="button" className={styles.trigger} aria-label={label} aria-haspopup="dialog" onClick={onOpen}>
      <Icon name="hint" className={styles.icon} />
      <span aria-hidden="true">Hints</span>
      <span className={styles.badge} aria-hidden="true">{view.remaining}</span>
    </button>
    <PreviewBottomSheet open={open} title="Hints" closeLabel="Close hints" onClose={onClose} afterClose={afterClose}
      footer={next ? <ActionButton block disabled={busy || pending} onClick={onShowHint}>{pending ? "Opening hint…" : `Show hint ${next.number}`}</ActionButton>
        : view.offerStuck ? <ActionButton block variant="quiet" onClick={onStuck}>I&apos;m completely stuck</ActionButton> : null}>
      {shown ? <ol className={styles.list} aria-live="polite" aria-relevant="additions">
        {view.revealed.map((hint, index) => <li key={hint.title}>
          <h3 ref={index === shown - 1 ? latest : undefined} tabIndex={-1} className={styles.title}>{hint.title}</h3>
          <p>{hint.text}</p>
        </li>)}
      </ol> : <p className={styles.note}>Each hint helps a little more.</p>}
      {next ? <p className={styles.cost}>{next.toPoints < next.fromPoints
        ? `Hint ${next.number} lowers the most this challenge can earn from ${next.fromPoints} to ${next.toPoints} points.`
        : `Hint ${next.number} won't lower your points.`}</p> : <p className={styles.note}>That was the last hint.</p>}
      {pending && offline ? <p className={styles.note} role="status">Your hint will appear when you&apos;re back online.</p> : null}
    </PreviewBottomSheet>
  </>;
}
