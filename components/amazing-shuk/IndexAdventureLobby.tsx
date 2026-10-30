"use client";

import { useMemo, useState } from "react";
import type { AdventureView } from "@/lib/amazing-shuk/adventure-lobby";
import { buildLobbyView, stepCount } from "@/lib/amazing-shuk/adventure-lobby";
import type { AdventureAction } from "@/lib/amazing-shuk/group-action";
import { LOBBY_COPY } from "@/lib/amazing-shuk/welcome-copy";
import PreviewAdventureLobby from "./PreviewAdventureLobby";

type Props = { adventure: AdventureView; guide: boolean; busy: boolean; message: string; onAction: (action: AdventureAction) => Promise<void> };
/** The lobby before Start Adventure. The count stays on this phone until Start sends it; the server checks both actions. */
export default function IndexAdventureLobby({ adventure, guide, busy, message, onAction }: Props) {
  const [draft, setDraft] = useState<number | null>(null);
  const lobby = useMemo(() => buildLobbyView(adventure, draft), [adventure, draft]);
  // Players without lobby powers get the waiting state instead of a lead.
  const lead = adventure.host ? LOBBY_COPY.hostLead : guide ? LOBBY_COPY.guideLead : null;
  const start = async () => {
    if (!lobby.canStart || lobby.count === null) return;
    // Both go through the offline queue in order: the count first, then Start.
    if (lobby.count !== adventure.intendedCount) await onAction({ type: "set-intended-count", count: lobby.count });
    await onAction({ type: "start-adventure" });
  };
  return <PreviewAdventureLobby copy={LOBBY_COPY} lobby={lobby} lead={lead} busy={busy} message={message}
    onStep={delta => setDraft(stepCount(lobby.count, delta))} onStart={() => void start()} />;
}
