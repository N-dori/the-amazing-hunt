"use client";
import { useRef, useState, useSyncExternalStore } from "react";
import { buildHintSheetView, type HintContent } from "@/lib/amazing-shuk/challenge-help";
import type { WaterPerformanceView, WaterRewardConfig } from "@/lib/amazing-shuk/water-performance";
import PreviewHintSheet from "./PreviewHintSheet";
import PreviewStuckConfirm from "./PreviewStuckConfirm";

// Render with a key per mission and question, so a new question starts with no sheet open and no hint pending.
type Props = {
  // The current question's hints and how many of them, and of the mission's shared total, are used.
  hints: readonly HintContent[]; stepUsed: number; totalUsed: number;
  performance: WaterPerformanceView; completed: boolean;
  // The well, once the jar holds 4 L: the answer only needs submitting, so no more help is offered.
  solved?: boolean;
  rewards: WaterRewardConfig; busy: boolean;
  onHint: () => void; onReveal: () => void;
};
type Sheet = "hints" | "stuck" | null;
function subscribeOnline(onChange: () => void) {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => { window.removeEventListener("online", onChange); window.removeEventListener("offline", onChange); };
}
/** Help during a challenge (Phase 2c): the hint sheet and "I'm completely stuck". Owns which sheet is open and the hint this phone
 * asked for; the hints themselves come only from the server's view, so every phone in the team shows the same ones. */
export default function IndexChallengeHelp({ hints, stepUsed, totalUsed, performance, completed, solved = false, rewards, busy, onHint, onReveal }: Props) {
  const [sheet, setSheet] = useState<Sheet>(null);
  const [requested, setRequested] = useState(0);
  const offline = useSyncExternalStore(subscribeOnline, () => !navigator.onLine, () => false);
  const afterClose = useRef<(() => void) | null>(null);
  const canReveal = performance.canReveal === true && !solved;
  const view = buildHintSheetView({ hints, stepUsed, totalUsed, started: performance.started, completed: completed || solved, canReveal, rewards });
  // A sheet whose challenge has just ended (solved, revealed, or the next question) has nothing left to do.
  const live = performance.started && !completed && !solved;
  const openSheet = live ? sheet : null;
  // Waiting for the hint this phone asked for: while its action is being sent, or queued offline. Once the queue has been
  // answered (shown or refused), the button is free again; a repeated request for the same hint does nothing on the server.
  const pending = view.next !== null && requested === totalUsed + 1 && (busy || offline);

  const showHint = () => {
    if (!view.next || pending) return;
    setRequested(totalUsed + 1);
    onHint();
  };
  // From the hint sheet: close it first, then open the confirmation once history is back on the screen's own entry.
  const stuckFromHints = () => { afterClose.current = () => { afterClose.current = null; setSheet("stuck"); }; setSheet(null); };
  const reveal = () => { setSheet(null); onReveal(); };

  return <>
    <PreviewHintSheet view={view} open={openSheet === "hints"} pending={pending} offline={offline} busy={busy}
      onOpen={() => setSheet("hints")} onClose={() => setSheet(null)} onShowHint={showHint} onStuck={stuckFromHints} afterClose={afterClose} />
    <PreviewStuckConfirm canReveal={live && canReveal} open={openSheet === "stuck"} busy={busy} foodTokens={rewards.foodTokens}
      onOpen={() => setSheet("stuck")} onKeepTrying={() => setSheet(null)} onReveal={reveal} />
  </>;
}
