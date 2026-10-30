"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { AdventureView } from "@/lib/amazing-shuk/adventure-lobby";
import { buildLobbyView, lobbyStep, stepCount } from "@/lib/amazing-shuk/adventure-lobby";
import type { AdventureAction } from "@/lib/amazing-shuk/group-action";
import { LOBBY_COPY } from "@/lib/amazing-shuk/welcome-copy";
import PreviewAdventureLobby from "./PreviewAdventureLobby";

type Props = { adventure: AdventureView; guide: boolean; busy: boolean; message: string; onAction: (action: AdventureAction) => Promise<void> };
/** The lobby before Start Adventure, one step at a time. The count and the step stay on this phone until Start sends the count; the server checks both actions. */
export default function IndexAdventureLobby({ adventure, guide, busy, message, onAction }: Props) {
  const [draft, setDraft] = useState<number | null>(null);
  const [counted, setCounted] = useState(false);
  const lobby = useMemo(() => buildLobbyView(adventure, draft), [adventure, draft]);
  const step = lobbyStep(lobby, counted);
  // Players without lobby powers get the waiting state instead of a lead.
  const lead = adventure.host ? LOBBY_COPY.hostLead : guide ? LOBBY_COPY.guideLead : null;
  // A new step replaces the screen's content, so keyboard and screen-reader focus starts again at its heading.
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstStep = useRef(true);
  useEffect(() => {
    if (firstStep.current) { firstStep.current = false; return; }
    headingRef.current?.focus();
  }, [step]);
  const start = async () => {
    if (!lobby.canStart || lobby.count === null) return;
    // Both go through the offline queue in order: the count first, then Start.
    if (lobby.count !== adventure.intendedCount) await onAction({ type: "set-intended-count", count: lobby.count });
    await onAction({ type: "start-adventure" });
  };
  return <PreviewAdventureLobby copy={LOBBY_COPY} lobby={lobby} step={step} lead={lead} busy={busy} message={message} headingRef={headingRef}
    onStep={delta => setDraft(stepCount(lobby.count, delta))} onContinue={() => setCounted(true)} onChangeCount={() => setCounted(false)}
    onStart={() => void start()} />;
}
