/** The part of `window.history` the sheets use, so tests can drive it with a fake. */
export type HistoryLike = { readonly state: unknown; pushState(data: unknown, unused: string): void; replaceState(data: unknown, unused: string): void; back(): void };
type OpenSheet = { token: string; onBack: () => void };

const markerOf = (state: unknown) => state && typeof state === "object" ? (state as { shukSheet?: unknown }).shukSheet : undefined;

/**
 * The phone's Back button closes an open bottom sheet before it leaves the screen. Opening a sheet pushes one history entry: a copy
 * of the current entry (so the game's own `shukNav` still restores the same screen) marked with the sheet's token. Back pops it and
 * the sheet closes. Closing any other way (Close, Escape, the backdrop, a swipe) steps back over the marker, so no dead entry is
 * left behind. Until that step lands, a new sheet waits to push its marker, and `after` (e.g. a tab change) waits to run.
 * Forward onto an old marker re-enters the same screen with no sheet; a sheet opened there reuses that entry instead of stacking a
 * second marker on it, so Back never lands on a stale one.
 */
export function createSheetHistory(history: HistoryLike) {
  let open: OpenSheet | null = null;
  let stepping = false;
  let queued: string | null = null;
  let afterStep: (() => void) | null = null;
  let count = 0;
  const push = (token: string) => {
    const state = history.state && typeof history.state === "object" ? history.state : {};
    if (markerOf(state) === undefined) history.pushState({ ...state, shukSheet: token }, "");
    else history.replaceState({ ...state, shukSheet: token }, "");
  };
  return {
    /** A sheet opened; `onBack` closes it when the phone's Back pops its marker. Returns its token. */
    open(onBack: () => void): string {
      const token = `sheet-${++count}`;
      open = { token, onBack };
      if (stepping) queued = token; else push(token);
      return token;
    },
    /** The sheet closed by itself. `after` runs once history is back on the screen's own entry. */
    close(token: string, after?: () => void): void {
      if (open?.token !== token) { after?.(); return; }
      open = null;
      if (queued === token) { queued = null; after?.(); return; }
      if (markerOf(history.state) !== token) { after?.(); return; }
      stepping = true; afterStep = after ?? null;
      history.back();
    },
    /** Every `popstate`. Returns true when it closed the open sheet. */
    popped(state: unknown): boolean {
      if (stepping) {
        stepping = false;
        const after = afterStep; afterStep = null;
        if (queued) { push(queued); queued = null; }
        after?.();
        return false;
      }
      if (open && markerOf(state) !== open.token) {
        const { onBack } = open; open = null;
        onBack();
        return true;
      }
      return false;
    },
  };
}
export type SheetHistory = ReturnType<typeof createSheetHistory>;
