"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { BASE_PATH } from "@/lib/base-path";
import { JOIN_ERROR, joinStage, TEAM_JOIN_COPY, type JoinStatusView } from "@/lib/amazing-shuk/team-membership";
import PreviewTeamJoin from "./PreviewTeamJoin";

const API = BASE_PATH + "/api/amazing-shuk/dev";
const POLL_MS = 2000;
const post = (body: object) => fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
// Refusals carry a stable `code`; the app decides by it, never by the message's words (C4).
const refusalOf = async (response: Response) => (await response.json().catch(() => ({}))) as { error?: string; code?: string };
type Props = { link: string | null; fallback: ReactNode; onJoined: () => Promise<void> };

/**
 * A phone with no session joins its team (I3b): it asks with the team's link, waits for the leader with its check code, then
 * collects its own session once. The request's secret lives only in an HttpOnly cookie, so after a reload this screen finds the
 * request again by asking the server, or learns that it ended. Join links switched off hide the form. With no request and no link
 * it shows `fallback`.
 */
export default function IndexTeamJoin({ link, fallback, onJoined }: Props) {
  const [request, setRequest] = useState<JoinStatusView | null>(null);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [linksOff, setLinksOff] = useState(false);
  // The last status seen, so a request that expires while this phone waits says so.
  const waiting = useRef(false);
  // The parent's callback changes on every render; the exchange must not run again because of that.
  const joined = useRef(onJoined);
  useEffect(() => { joined.current = onJoined; }, [onJoined]);
  const poll = useCallback(async () => {
    try {
      const response = await fetch(API + "?join=status", { cache: "no-store" });
      // Switched off, even mid-wait: stop polling and say so (the request, if any, stays on screen as the reason to explain).
      if (!response.ok && (await refusalOf(response)).code === JOIN_ERROR.linksOff) { waiting.current = false; setLinksOff(true); setRequest(current => current ?? { status: "gone" }); return; }
      const next = response.ok ? await response.json() as JoinStatusView : { status: "gone" as const };
      if (waiting.current && next.status === "gone") setMessage(TEAM_JOIN_COPY.gone);
      waiting.current = next.status === "pending";
      setRequest(next);
    } catch { setMessage(TEAM_JOIN_COPY.failed); }
  }, []);
  // The first check runs after mount, as the game's other start-up reads do.
  useEffect(() => {
    const timer = window.setTimeout(() => void poll(), 0);
    return () => window.clearTimeout(timer);
  }, [poll]);
  const status = request?.status;
  useEffect(() => {
    if (status !== "pending" || linksOff) return;
    const timer = window.setInterval(() => void poll(), POLL_MS);
    return () => window.clearInterval(timer);
  }, [status, linksOff, poll]);
  // Let in: collect the session, once. A lost connection tries again; a refused exchange means the request has gone.
  useEffect(() => {
    if (status !== "approved" || linksOff) return;
    let cancelled = false;
    let retry: number | undefined;
    void (async () => {
      try {
        const response = await post({ type: "join-exchange" });
        if (cancelled) return;
        const code = response.ok ? null : (await refusalOf(response)).code;
        if (response.ok || code === JOIN_ERROR.alreadyIn) { await joined.current(); return; }
        if (code === JOIN_ERROR.linksOff) { setLinksOff(true); return; }
        setRequest({ status: "gone", ended: true }); setMessage(TEAM_JOIN_COPY.gone);
      } catch {
        if (!cancelled) { setMessage(TEAM_JOIN_COPY.failed); retry = window.setTimeout(() => setAttempt(count => count + 1), POLL_MS); }
      }
    })();
    return () => { cancelled = true; window.clearTimeout(retry); };
  }, [status, linksOff, attempt]);
  const ask = async () => {
    if (!link) return;
    setBusy(true); setMessage("");
    try {
      const response = await post({ type: "join-ask", link, name: name.trim() || null });
      if (!response.ok) {
        const refusal = await refusalOf(response);
        if (refusal.code === JOIN_ERROR.alreadyIn) { await joined.current(); return; }
        if (refusal.code === JOIN_ERROR.linksOff) { setLinksOff(true); return; }
        setMessage(refusal.code === JOIN_ERROR.linkUnusable ? TEAM_JOIN_COPY.noLink : refusal.error ?? TEAM_JOIN_COPY.failed);
        return;
      }
      const next = await response.json() as JoinStatusView;
      waiting.current = next.status === "pending";
      setRequest(next);
    } catch { setMessage(TEAM_JOIN_COPY.failed); }
    finally { setBusy(false); }
  };
  const stage = joinStage(request, link, linksOff);
  if (stage === null) return <>{fallback}</>;
  return <PreviewTeamJoin copy={TEAM_JOIN_COPY} stage={stage} name={name} busy={busy} message={message}
    code={request && request.status !== "gone" ? request.code : null} approved={status === "approved"}
    onName={setName} onAsk={() => void ask()} />;
}
