"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { BASE_PATH } from "@/lib/base-path";
import { TEAM_JOIN_COPY, type JoinStatusView } from "@/lib/amazing-shuk/team-membership";
import PreviewTeamJoin, { type TeamJoinStage } from "./PreviewTeamJoin";

const API = BASE_PATH + "/api/amazing-shuk/dev";
const POLL_MS = 2000;
const post = (body: object) => fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
const errorOf = async (response: Response) => ((await response.json().catch(() => ({}))) as { error?: string }).error;
type Props = { link: string | null; fallback: ReactNode; onJoined: () => Promise<void> };

/**
 * A phone with no session joins its team (I3b): it asks with the team's link, waits for the leader with its check code, then
 * collects its own session once. The request's secret lives only in an HttpOnly cookie, so after a reload this screen finds the
 * request again by asking the server. With no request and no link (or join links switched off) it shows `fallback`.
 */
export default function IndexTeamJoin({ link, fallback, onJoined }: Props) {
  const [request, setRequest] = useState<JoinStatusView | null>(null);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [attempt, setAttempt] = useState(0);
  // The last status seen, so a request that expires while this phone waits says so.
  const waiting = useRef(false);
  // The parent's callback changes on every render; the exchange must not run again because of that.
  const joined = useRef(onJoined);
  useEffect(() => { joined.current = onJoined; }, [onJoined]);
  const poll = useCallback(async () => {
    try {
      const response = await fetch(API + "?join=status", { cache: "no-store" });
      // 404: join links are switched off, so there is nothing to wait for.
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
    if (status !== "pending") return;
    const timer = window.setInterval(() => void poll(), POLL_MS);
    return () => window.clearInterval(timer);
  }, [status, poll]);
  // Let in: collect the session, once. A lost connection tries again; a refused exchange means the request has gone.
  useEffect(() => {
    if (status !== "approved") return;
    let cancelled = false;
    let retry: number | undefined;
    void (async () => {
      try {
        const response = await post({ type: "join-exchange" });
        if (cancelled) return;
        if (response.ok || response.status === 409) { await joined.current(); return; }
        setRequest({ status: "gone" }); setMessage(TEAM_JOIN_COPY.gone);
      } catch {
        if (!cancelled) { setMessage(TEAM_JOIN_COPY.failed); retry = window.setTimeout(() => setAttempt(count => count + 1), POLL_MS); }
      }
    })();
    return () => { cancelled = true; window.clearTimeout(retry); };
  }, [status, attempt]);
  const ask = async () => {
    if (!link) return;
    setBusy(true); setMessage("");
    try {
      const response = await post({ type: "join-ask", link, name: name.trim() || null });
      if (!response.ok) {
        const error = await errorOf(response);
        if (error === TEAM_JOIN_COPY.alreadyIn) { await joined.current(); return; }
        setMessage(response.status === 404 ? TEAM_JOIN_COPY.noLink : error ?? TEAM_JOIN_COPY.failed);
        return;
      }
      const next = await response.json() as JoinStatusView;
      waiting.current = next.status === "pending";
      setRequest(next);
    } catch { setMessage(TEAM_JOIN_COPY.failed); }
    finally { setBusy(false); }
  };
  const stage: TeamJoinStage | null = request === null ? "checking" : request.status === "pending" || request.status === "approved" ? "waiting"
    : request.status === "declined" ? "declined" : link ? "ask" : null;
  if (stage === null) return <>{fallback}</>;
  return <PreviewTeamJoin copy={TEAM_JOIN_COPY} stage={stage} name={name} busy={busy} message={message}
    code={request && request.status !== "gone" ? request.code : null} approved={status === "approved"}
    onName={setName} onAsk={() => void ask()} />;
}
