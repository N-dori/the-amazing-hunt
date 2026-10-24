"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BASE_PATH } from "@/lib/base-path";
import { DEV_GUIDE_ID, DEV_PARTICIPANTS, getDevWaterActorRole, type DevWaterAction, type DevWaterSession } from "@/lib/amazing-shuk/dev-water-session";
import ListParticipantIdentity from "@/components/amazing-shuk/ListParticipantIdentity";
import IndexGuideWaterTask from "./IndexGuideWaterTask";
import ListWaterTask from "./ListWaterTask";
import PreviewWellStory from "./PreviewWellStory";
import { WATER_TASK } from "@/lib/amazing-shuk/water-task";
import { INITIAL_WATER_INTERACTION, type WaterInteraction, type WaterContainerId, type WaterActionView } from "@/lib/amazing-shuk/water-task-view";
import type { WaterPerformanceView, GuideTimingView } from "@/lib/amazing-shuk/water-performance";
import { WATER_PUZZLE_REVISION, type WaterMove } from "@/lib/amazing-shuk/water-measurement";
import styles from "./IndexWaterTask.module.scss";

const PARTICIPANT_IDENTITIES = [...DEV_PARTICIPANTS, { id: DEV_GUIDE_ID, name: "Guide" }];

type ServerView = { puzzleRevision: number; session: DevWaterSession; performance: WaterPerformanceView; guideTiming?: GuideTimingView; message?: string; error?: string; sharedBalance: { points: number; foodTokens: number; status: string } };

export default function IndexWaterTask() {
  const [view, setView] = useState<ServerView | null>(null);
  const [message, setMessage] = useState("Connecting to the local development session…");
  const flushing = useRef(false);
  const [busy, setBusy] = useState(false);
  const [interaction, setInteraction] = useState<WaterInteraction>(INITIAL_WATER_INTERACTION);
  const [storyOpen, setStoryOpen] = useState(true);
  const [invitation, setInvitation] = useState("");
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try { setStoryOpen(localStorage.getItem("shuk:well-story-collapsed") !== "1"); } catch { /* Reading remains available without local preferences. */ }
      const token = new URLSearchParams(window.location.hash.slice(1)).get("invite");
      if (token) {
        window.history.replaceState(null, "", window.location.pathname);
        setInvitation(token);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  const login = async () => {
    setBusy(true);
    try {
      const response = await fetch(BASE_PATH + "/api/amazing-shuk/dev", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "login", token: invitation }),
      });
      const data = await response.json();
      if (!response.ok) { setMessage(data.error); return; }
      setInvitation("");
      await refresh();
    } catch { setMessage("Could not sign in. Retry with this invitation."); }
    finally { setBusy(false); }
  };
  const refresh = useCallback(async () => {
    try {
      const response = await fetch(BASE_PATH + "/api/amazing-shuk/dev", { cache: "no-store" });
      if (response.status === 401) setView(null);
      if (!response.ok) throw new Error(response.status === 401 ? "Open your single-use invitation link to sign in." : "The local simulation is unavailable.");
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

  const actorId = view?.session.activeActorId;
  const flush = useCallback(async () => {
    if (!actorId || flushing.current) return;
    const key = `shuk-pending:v${WATER_PUZZLE_REVISION}:` + actorId;
    const pending = JSON.parse(localStorage.getItem(key) ?? "[]") as (DevWaterAction & { actionId: string })[];
    if (!pending.length) return;
    flushing.current = true;
    setBusy(true);
    try {
      for (const action of pending) {
        const response = await fetch(BASE_PATH + "/api/amazing-shuk/dev", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...action, expectedParticipantId: actorId, puzzleRevision: WATER_PUZZLE_REVISION }),
        });
        const data = await response.json() as ServerView;
        if (response.status >= 500 || response.status === 401 || response.status === 409) throw new Error(data.error ?? "Action saved; waiting to reconnect.");
        const remaining = JSON.parse(localStorage.getItem(key) ?? "[]") as { actionId: string }[];
        localStorage.setItem(key, JSON.stringify(remaining.filter(item => item.actionId !== action.actionId)));
        if (response.ok) { setView(data); setMessage(action.type === "move" ? "" : data.message ?? ""); }
        else setMessage(data.error ?? "Action rejected.");
      }
    } catch (error) { setMessage(error instanceof Error ? error.message : "Action saved; waiting to reconnect."); }
    finally { flushing.current = false; setBusy(false); }
  }, [actorId]);
  useEffect(() => {
    const timer = window.setInterval(() => { void flush(); }, 2000);
    return () => window.clearInterval(timer);
  }, [flush]);
  const act = async (action: DevWaterAction) => {
    if (!actorId) return;
    const key = `shuk-pending:v${WATER_PUZZLE_REVISION}:` + actorId;
    const pending = JSON.parse(localStorage.getItem(key) ?? "[]");
    localStorage.setItem(key, JSON.stringify([...pending, { ...action, actionId: crypto.randomUUID() }]));
    await flush();
  };

  const focusPuzzle = () => window.requestAnimationFrame(() => {
    const target = document.getElementById("water-puzzle-status") ?? document.getElementById("water-controls-heading");
    target?.focus();
  });
  const moveWater = async (move: WaterMove) => {
    setInteraction(current => ({ ...current, pouring: false }));
    await act({ type: "move", move });
    focusPuzzle();
  };
  const selectContainer = (id: WaterContainerId, destinationMove: WaterMove | null) => {
    if (destinationMove) { void moveWater(destinationMove); return; }
    setInteraction({ selected: id, pouring: false });
  };
  const contextualAction = (id: WaterActionView["id"]) => {
    if (id !== "pour") { void moveWater(id); return; }
    setInteraction(current => ({ ...current, pouring: true }));
    window.requestAnimationFrame(() => document.querySelector<HTMLButtonElement>('[data-pour-destination="true"]')?.focus());
  };
  const revealHint = () => {
    if (view && view.performance.hintsUsed < 3) void act({ type: "hint", hint: view.performance.hintsUsed + 1 });
  };

  if (invitation) return <main className={styles.page}><p>Local development invitation</p><button type="button" disabled={busy} onClick={() => void login()}>Sign in with this invitation</button><p role="status">{message}</p></main>;
  if (!view) return <main className={styles.page}><p role="status">{message}</p></main>;
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>The Amazing Shuk</p>
        <h1>{WATER_TASK.title}</h1>
      </header>
      <PreviewWellStory {...WATER_TASK.story} showOriginalHebrew={process.env.NODE_ENV === "development"} instruction={WATER_TASK.instruction} open={storyOpen} onToggle={() => {
        setStoryOpen(!storyOpen);
        try { localStorage.setItem("shuk:well-story-collapsed", storyOpen ? "1" : "0"); } catch { /* Preference storage is optional. */ }
      }} />
      <ListWaterTask cups={view.session.cups} completed={view.session.completed} activeRole={activeRole ?? "follower"} busy={busy}
        interaction={interaction} performance={view.performance} onSelect={selectContainer} onAction={contextualAction}
        onCancelPour={() => { setInteraction(current => ({ ...current, pouring: false })); window.requestAnimationFrame(() => document.getElementById(`water-container-${interaction.selected}`)?.focus()); }}
        onStart={() => void act({ type: "start" })} onHint={revealHint} onSubmit={() => void act({ type: "submit" })} onReset={() => {
          setInteraction(INITIAL_WATER_INTERACTION);
          void act({ type: "reset" }).then(focusPuzzle);
        }} />
      <section className={styles.simulation} aria-label="Group participants and roles">
        <div>
          <ListParticipantIdentity participants={PARTICIPANT_IDENTITIES} roles={view.session.roles} currentId={view.session.activeActorId} currentRole={activeRole ?? "follower"} />
          <button type="button" disabled={busy} onClick={async () => {
            setBusy(true);
            try {
              const response = await fetch(BASE_PATH + "/api/amazing-shuk/dev", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "logout" }) });
              if (!response.ok) throw new Error("Could not sign out; retry.");
              setView(null); await refresh();
            } catch { setMessage("Could not sign out; retry."); }
            finally { setBusy(false); }
          }}>Sign out</button>
        </div>

      </section>
      {activeRole === "guide" ? <IndexGuideWaterTask roles={view.session.roles} busy={busy} completed={view.session.completed} timing={view.guideTiming} onAction={(action) => void act(action)} /> : null}
      {message ? <p className={styles.message} role="status">{message}</p> : null}
      <aside className={styles.safety}>Local development only. Invitation sessions and shared progress use local JSON storage. Do not expose this development server to the network.</aside>
      <button className={styles.refresh} type="button" onClick={() => void refresh()} disabled={busy}>Refresh shared state</button>
    </main>
  );
}
