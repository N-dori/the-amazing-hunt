"use client";
import { useEffect, useId, useRef, type MouseEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { Icon } from "@/components/icons";
import { createSheetHistory, type SheetHistory } from "@/lib/amazing-shuk/sheet-history";
import styles from "./PreviewBottomSheet.module.scss";

// One per page: only one sheet is open at a time, and its single popstate listener must outlive each sheet.
let sheetHistory: SheetHistory | null = null;
function sheets(): SheetHistory {
  if (!sheetHistory) {
    const created = createSheetHistory(window.history);
    window.addEventListener("popstate", event => { created.popped(event.state); });
    sheetHistory = created;
  }
  return sheetHistory;
}
// A downward drag this far (px) on the handle or heading closes the sheet; less springs it back.
const SWIPE_CLOSE = 80;

type Props = { open: boolean; title: string; closeLabel: string; onClose: () => void; children: ReactNode;
  // Read when the sheet closes, then run once history is back on the screen's own entry (e.g. a tab change from inside the
  // sheet, which would otherwise be undone by the step back over the sheet's marker). The owner clears it.
  afterClose?: { current: (() => void) | null } };
/**
 * A temporary sheet over the current screen, on the native modal `<dialog>`: the page behind is inert and dimmed but stays as it
 * was. It closes with its Close button, Escape, a tap on the dimmed backdrop, a downward swipe on its top, or the phone's Back,
 * and focus returns to whatever opened it.
 */
export default function PreviewBottomSheet({ open, title, closeLabel, onClose, children, afterClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const latestClose = useRef(onClose);
  useEffect(() => { latestClose.current = onClose; });
  const drag = useRef<{ id: number; y: number; dy: number } | null>(null);

  useEffect(() => {
    const d = dialog.current;
    if (!open || !d) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (!d.open) d.showModal();
    const history = sheets();
    const token = history.open(() => latestClose.current());
    // Escape, and Android's Back where the browser routes it to the dialog: close through React state, not natively.
    const cancel = (event: Event) => { event.preventDefault(); latestClose.current(); };
    // A dialog the browser closed by itself still has to tell React.
    const closed = () => latestClose.current();
    d.addEventListener("cancel", cancel);
    d.addEventListener("close", closed);
    return () => {
      d.removeEventListener("cancel", cancel);
      d.removeEventListener("close", closed);
      if (d.open) d.close();
      d.style.removeProperty("--sheet-drag");
      // Read at close on purpose: the owner sets it just before closing.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      history.close(token, afterClose?.current ?? undefined);
      opener?.focus({ preventScroll: true });
    };
  }, [open, afterClose]);

  // A tap on the backdrop lands on the dialog element itself; its content fills the rest.
  const onBackdrop = (event: MouseEvent<HTMLDialogElement>) => { if (event.target === event.currentTarget) onClose(); };
  const onDragStart = (event: ReactPointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button")) return;
    drag.current = { id: event.pointerId, y: event.clientY, dy: 0 };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onDragMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (drag.current?.id !== event.pointerId) return;
    drag.current.dy = Math.max(0, event.clientY - drag.current.y);
    dialog.current?.style.setProperty("--sheet-drag", `${drag.current.dy}px`);
  };
  const onDragEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (drag.current?.id !== event.pointerId) return;
    const far = drag.current.dy > SWIPE_CLOSE;
    drag.current = null;
    dialog.current?.style.removeProperty("--sheet-drag");
    if (far) onClose();
  };

  return <dialog ref={dialog} className={styles.sheet} aria-labelledby={titleId} onClick={onBackdrop}>
    <div className={styles.panel}>
      <div className={styles.top} onPointerDown={onDragStart} onPointerMove={onDragMove} onPointerUp={onDragEnd} onPointerCancel={onDragEnd}>
        <span className={styles.handle} aria-hidden="true" />
        <h2 id={titleId} className={styles.title}>{title}</h2>
        <button type="button" className={styles.close} aria-label={closeLabel} onClick={onClose}><Icon name="close" className={styles.icon} /></button>
      </div>
      <div className={styles.body}>{open ? children : null}</div>
    </div>
  </dialog>;
}
