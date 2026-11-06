import type { HistoryLike } from "./sheet-history.ts";

/** The part of `sessionStorage` the guard uses, so tests can drive it with a fake. */
export type StorageLike = { getItem(key: string): string | null; setItem(key: string, value: string): void };
export const LEAVE_GUARD_KEY = "shuk-leave-guard";

const isGuard = (state: unknown) => Boolean(state && typeof state === "object" && (state as { shukGuard?: unknown }).shukGuard === true);

/**
 * "Leave the game?" (owner, 5 Nov 2026). The live test found that the phone's Back on the game's first screen left the game with no
 * warning, and browsers allow no custom text on their own leave prompt. So the game puts one guard entry under its first screen: Back
 * onto it puts the screen back and asks first. Stay keeps the player where they were; Leave steps back past the guard.
 *
 * The guard is installed once per tab (remembered in `sessionStorage`), so a reload doesn't stack a second guard. Back between the
 * game's own screens, a reload and closing the tab are never intercepted.
 */
export function createLeaveGuard(history: HistoryLike, storage: StorageLike | null) {
  let leaving = false;
  return {
    /** On the game's first load in this tab: the current entry becomes the guard and a copy of it, the first screen, goes on top. */
    install(): void {
      try { if (storage?.getItem(LEAVE_GUARD_KEY) === "1") return; storage?.setItem(LEAVE_GUARD_KEY, "1"); } catch { /* Install anyway. */ }
      if (isGuard(history.state)) return;
      const screen = history.state && typeof history.state === "object" ? history.state : {};
      history.replaceState({ shukGuard: true }, "");
      history.pushState(screen, "");
    },
    /**
     * Every `popstate`. On the guard: while leaving, keep stepping back ("left"); otherwise put `screen` (the game's current entry)
     * back on top and return "ask", so the caller opens the question. Anything else is the game's own navigation ("none").
     */
    popped(state: unknown, screen: unknown): "ask" | "left" | "none" {
      if (!isGuard(state)) return "none";
      if (leaving) { history.back(); return "left"; }
      history.pushState(screen ?? {}, "");
      return "ask";
    },
    /** Leave: step back onto the guard, and from there past it. */
    leave(): void {
      leaving = true;
      history.back();
    },
  };
}
