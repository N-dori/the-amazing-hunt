"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BASE_PATH } from "@/lib/base-path";
import { DEV_GUIDE_ID, DEV_PARTICIPANTS, getDevWaterActorRole, type DevWaterAction, type DevWaterSession } from "@/lib/amazing-shuk/dev-water-session";
import PreviewWaterTask from "./PreviewWaterTask";
import styles from "./IndexWaterTask.module.scss";

type ServerView = { session: DevWaterSession; message?: string; error?: string; sharedBalance: { points: number; foodTokens: number; status: string } };

export default function IndexWaterTask() {
  const [view, setView] = useState<ServerView | null>(null);
  const [message, setMessage] = useState("Connecting to the local development session…");
  const [busy, setBusy] = useState(false);
  const refresh = useCallback(async () => {
    try {
      const response = await fetch(BASE_PATH + "/api/amazing-shuk/dev", { cache: "no-store" });
      if (!response.ok) throw new Error("The local simulation is unavailable.");
      setView(await response.json() as ServerView);
      setMessage("");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not load the local simulation."); }
  }, []);
  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => { void refresh(); }, 1500);
    return () => window.clearInterval(timer);
  }, [refresh]);
  const activeRole = useMemo(() => view ? getDevWaterActorRole(view.session) : null, [view]);

  const act = useCallback(async (action: DevWaterAction) => {
    setBusy(true);
    try {
      const response = await fetch(BASE_PATH + "/api/amazing-shuk/dev", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(action),
      });
      const data = await response.json() as ServerView;
      if (!response.ok) throw new Error(data.error ?? "The action was rejected.");
      setView(data);
      setMessage(data.message ?? "");
    } catch (error) { setMessage(error instanceof Error ? error.message : "The action failed."); }
    finally { setBusy(false); }
  }, []);

  if (!view) return <main className={styles.page}><p role="status">{message}</p></main>;
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>The Amazing Shuk · local prototype</p>
        <h1>How many families share the water?</h1>
        <p className={styles.draft}>Task idea #24 · draft content, not approved for participants</p>
      </header>
      <section className={styles.simulation} aria-label="Development participant simulation">
        <div>
          <label className={styles.label} htmlFor="active-actor">Simulate as</label>
          <select id="active-actor" value={view.session.activeActorId} disabled={busy}
            onChange={(event) => void act({ type: "switch-actor", actorId: event.target.value })}>
            {DEV_PARTICIPANTS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            <option value={DEV_GUIDE_ID}>Guide</option>
          </select>
        </div>
        <div className={styles.roleSummary}>
          <span>Navigator: {DEV_PARTICIPANTS.find((p) => p.id === view.session.roles.navigator)?.name ?? "Unassigned"}</span>
          <span>Answer-submitter: {DEV_PARTICIPANTS.find((p) => p.id === view.session.roles.answerSubmitter)?.name ?? "Unassigned"}</span>
          <span>Acting role: {activeRole}</span>
        </div>
        {activeRole === "guide" ? (
          <div className={styles.guideControls}>
            <label className={styles.label} htmlFor="navigator">Assign navigator</label>
            <select id="navigator" value={view.session.roles.navigator ?? ""} disabled={busy}
              onChange={(event) => void act({ type: "assign-role", role: "navigator", participantId: event.target.value || null })}>
              <option value="">Unassigned</option>
              {DEV_PARTICIPANTS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <label className={styles.label} htmlFor="submitter">Assign answer-submitter</label>
            <select id="submitter" value={view.session.roles.answerSubmitter ?? ""} disabled={busy}
              onChange={(event) => void act({ type: "assign-role", role: "answerSubmitter", participantId: event.target.value || null })}>
              <option value="">Unassigned</option>
              {DEV_PARTICIPANTS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        ) : null}
      </section>
      <section className={styles.balance} aria-label="Shared group balance">
        <div><span>Shared points</span><strong>{view.sharedBalance.points}</strong></div>
        <div><span>Food tokens</span><strong>{view.sharedBalance.foodTokens}</strong></div>
        <p>{view.sharedBalance.status}; this task has no approved reward amount yet.</p>
      </section>
      <PreviewWaterTask cups={view.session.cups} completed={view.session.completed} activeRole={activeRole ?? "follower"} busy={busy}
        onMove={(move) => void act({ type: "move", move })} onSubmit={() => void act({ type: "submit" })}
        onGuideApprove={() => void act({ type: "guide-approve" })} onReset={() => void act({ type: "reset" })} />
      {message ? <p className={styles.message} role="status">{message}</p> : null}
      <aside className={styles.safety}>Local development only. Fictional participants and in-memory state reset with the server. Do not expose this development server to the network.</aside>
      <p className={styles.reference}>Reference image unavailable in this checkout. The task idea cites photo #66; check the photo index before using imagery.</p>
      <button className={styles.refresh} type="button" onClick={() => void refresh()} disabled={busy}>Refresh shared state</button>
    </main>
  );
}
