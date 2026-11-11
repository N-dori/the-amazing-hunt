/** When a map's folding notice closes by itself (owner, 8 Nov 2026; refined 9 Nov 2026). Pure: the map passes what it knows.
 *
 * Only a notice that holds **nonessential guidance** may fold on its own: the caller opts in by giving a delay. A warning the player
 * must read never passes one. A folded notice stays one tap away behind its (i) button, and a notice the player has opened or closed
 * themselves is left as they set it. */

/** The Amazing Shuk's map notice: it repeats guidance the screen already gives, so it folds after 30 s. */
export const NOTICE_AUTO_FOLD_MS = 30_000;

export type NoticeFoldState = Readonly<{
  /** The caller's delay (ms), given only for nonessential guidance; absent or 0 means never fold on its own. */
  autoFoldMs: number | undefined;
  /** Whether the notice is showing now. */
  open: boolean;
  /** Whether the player has used the (i) button on this map: then their choice stands. */
  touched: boolean;
}>;

export function shouldAutoFoldNotice({ autoFoldMs, open, touched }: NoticeFoldState): boolean {
  return typeof autoFoldMs === "number" && autoFoldMs > 0 && open && !touched;
}
