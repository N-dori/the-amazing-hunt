"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BASE_PATH } from "@/lib/base-path";
import { DEV_GUIDE_ID, DEV_PARTICIPANTS, getDevWaterActorRole, type DevWaterSession } from "@/lib/amazing-shuk/dev-water-session";
import type { GroupAction } from "@/lib/amazing-shuk/group-action";
import IndexParticipantMenu from "@/components/amazing-shuk/IndexParticipantMenu";
import ListParticipantBadges from "@/components/amazing-shuk/ListParticipantBadges";
import ListGroupOverview from "@/components/amazing-shuk/ListGroupOverview";
import PreviewFoodRewards from "@/components/amazing-shuk/PreviewFoodRewards";
import PreviewShukNav from "@/components/amazing-shuk/PreviewShukNav";
import { activeTab, goToStage, goToTab, initialNavState, parseNavState, previewMission, type JourneyStage, type ShukNavState } from "@/lib/amazing-shuk/shuk-navigation";
import IndexGuideWaterTask from "./IndexGuideWaterTask";
import ListArrivalMission from "./ListArrivalMission";
import ActionButton from "@/components/ui/ActionButton";
import type { MapView } from "@/components/map/LeafletBaseMap";
import { GAN_HATUT_MISSION, type MissionView } from "@/lib/amazing-shuk/mission-arrival";
import { LOCATION_UNAVAILABLE_MESSAGE, requestArrivalLocation } from "@/lib/amazing-shuk/request-arrival-location";
import ListWaterTask from "./ListWaterTask";
import PreviewWellStory from "./PreviewWellStory";
import { WATER_TASK } from "@/lib/amazing-shuk/water-task";
import { INITIAL_WATER_INTERACTION, type WaterInteraction, type WaterContainerId, type WaterActionView } from "@/lib/amazing-shuk/water-task-view";
import type { WaterPerformanceView, GuideTimingView } from "@/lib/amazing-shuk/water-performance";
import { WATER_PUZZLE_REVISION, type WaterMove } from "@/lib/amazing-shuk/water-measurement";
import { findMission } from "@/lib/amazing-shuk/missions";
import { findChoiceTask } from "@/lib/amazing-shuk/choice-missions";
import ListChoiceTask from "./ListChoiceTask";
import PreviewChoiceStory from "./PreviewChoiceStory";
import ListChoiceBonus from "./ListChoiceBonus";
import PreviewAppreciation from "./PreviewAppreciation";
import styles from "./IndexWaterTask.module.scss";

const PARTICIPANT_IDENTITIES = [...DEV_PARTICIPANTS, { id: DEV_GUIDE_ID, name: "Guide" }];
const WELL_MISSION_ID = GAN_HATUT_MISSION.id;
const INITIAL_NAV = initialNavState(WELL_MISSION_ID);
// Where the player is survives a refresh in this tab; shared progress always comes from the server.
const NAV_STORAGE_KEY = "shuk:navigation";
const isMission = (id: string) => Boolean(findMission(id));

// The server returns the detail of the requested mission: cups for the well, picks for a "choose N" challenge.
type MissionSession = DevWaterSession & { kind?: "water" | "choice"; selected?: string[]; bonus?: { selected: string[]; completed: boolean; points: number } };
type ServerView = { missions: MissionView[]; mission: MissionView; puzzleRevision: number; session: MissionSession; performance: WaterPerformanceView; guideTiming?: GuideTimingView; message?: string; error?: string; sharedBalance: { points: number; foodTokens: number; status: string } };

export default function IndexWaterTask() {
  const [view, setView] = useState<ServerView | null>(null);
  const [message, setMessage] = useState("Connecting to the local development session…");
  const flushing = useRef(false);
  const checkingArrival = useRef(false);
  const arrivalGeneration = useRef(0);
  const currentActor = useRef<string | undefined>(undefined);
  const [arrivalBusy, setArrivalBusy] = useState(false);
  const [arrivalFeedback, setArrivalFeedback] = useState("");
  // Every mission follows map → preview → location → challenge; `missionId` is the mission on screen.
  // The bottom bar switches between that journey, Food and Group without losing the journey's place.
  const [nav, setNav] = useState<ShukNavState>(INITIAL_NAV);
  const { stage, missionId } = nav;
  // The map's last position, so returning to the map lands where the group left it.
  const [mapView, setMapView] = useState<MapView | null>(null);
  // Each screen change is a browser history entry, so the phone's Back button steps back through the game.
  const navigate = (next: ShukNavState, scrollToTop = true) => {
    if (next.missionId !== nav.missionId) setArrivalFeedback("");
    setNav(next);
    try { window.history.pushState({ shukNav: next }, ""); sessionStorage.setItem(NAV_STORAGE_KEY, JSON.stringify(next)); } catch { /* Navigation still works without history or storage. */ }
    if (scrollToTop) window.requestAnimationFrame(() => window.scrollTo({ top: 0 }));
  };
  const goTo = (next: JourneyStage) => navigate(goToStage(nav, next));
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = parseNavState(JSON.parse(sessionStorage.getItem(NAV_STORAGE_KEY) ?? "null"), isMission);
        if (saved) { setNav(saved); window.history.replaceState({ shukNav: saved }, ""); }
      } catch { /* Start from the map when storage is unavailable. */ }
    }, 0);
    const back = (event: PopStateEvent) => {
      const restored = parseNavState((event.state as { shukNav?: unknown } | null)?.shukNav, isMission);
      setNav(current => restored ?? goToTab(current, "map"));
      try { if (restored) sessionStorage.setItem(NAV_STORAGE_KEY, JSON.stringify(restored)); } catch { /* Optional. */ }
    };
    window.addEventListener("popstate", back);
    return () => { window.clearTimeout(timer); window.removeEventListener("popstate", back); };
  }, []);
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
      const response = await fetch(BASE_PATH + "/api/amazing-shuk/dev?mission=" + encodeURIComponent(missionId), { cache: "no-store" });
      if (response.status === 401) setView(null);
      if (!response.ok) throw new Error(response.status === 401 ? "Open your single-use invitation link to sign in." : "The local simulation is unavailable.");
      setView(await response.json() as ServerView);
      setMessage("");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not load the local simulation."); }
  }, [missionId]);
  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => { void refresh(); }, 1500);
    return () => window.clearInterval(timer);
  }, [refresh]);
  // The mural, the synagogue and any other "choose N" mission share one challenge screen; this is its content.
  const choiceTask = findChoiceTask(missionId);
  const activeRole = useMemo(() => view ? getDevWaterActorRole(view.session) : null, [view]);

  const actorId = view?.session.activeActorId;
  useEffect(() => {
    currentActor.current = actorId;
    arrivalGeneration.current += 1;
    return () => { currentActor.current = undefined; arrivalGeneration.current += 1; };
  }, [actorId]);
  const checkArrival = async () => {
    if (!actorId || checkingArrival.current || busy) return;
    if (!view?.mission.gpsEnabled) { setArrivalFeedback(LOCATION_UNAVAILABLE_MESSAGE); return; }
    checkingArrival.current = true;
    const generation = arrivalGeneration.current;
    setArrivalBusy(true); setArrivalFeedback("Checking your location...");
    try {
      const reading = await requestArrivalLocation(navigator.geolocation, window.isSecureContext);
      if (currentActor.current !== actorId || generation !== arrivalGeneration.current) return;
      // GPS evidence is sent once, never put in the persistent offline action queue.
      const response = await fetch(BASE_PATH + "/api/amazing-shuk/dev", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "arrival", missionId,
          reading, actionId: crypto.randomUUID(), expectedParticipantId: actorId, puzzleRevision: WATER_PUZZLE_REVISION }),
      });
      const data = await response.json() as ServerView;
      if (currentActor.current !== actorId || generation !== arrivalGeneration.current) return;
      if (!response.ok) throw new Error(data.error ?? "Arrival could not be checked. Please retry or ask the guide.");
      setView(data); setArrivalFeedback(data.message ?? "You're very close! You're in the right area. Look around for Gan HaTut.");
    } catch (error) {
      if (currentActor.current === actorId && generation === arrivalGeneration.current) setArrivalFeedback(error instanceof Error ? error.message : "Please retry or ask the guide.");
    } finally { checkingArrival.current = false; setArrivalBusy(false); }
  };
  const flush = useCallback(async () => {
    if (!actorId || flushing.current) return;
    const key = `shuk-pending:v${WATER_PUZZLE_REVISION}:` + actorId;
    const pending = JSON.parse(localStorage.getItem(key) ?? "[]") as (GroupAction & { actionId: string })[];
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
  const act = async (action: GroupAction) => {
    if (action.type === "arrival") return; // Never persist GPS readings.
    if (!actorId) return;
    const key = `shuk-pending:v${WATER_PUZZLE_REVISION}:` + actorId;
    const pending = JSON.parse(localStorage.getItem(key) ?? "[]");
    localStorage.setItem(key, JSON.stringify([...pending, { ...action, actionId: crypto.randomUUID() }]));
    await flush();
  };

  const signOut = async () => {
    setBusy(true);
    try {
      const response = await fetch(BASE_PATH + "/api/amazing-shuk/dev", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "logout" }) });
      if (!response.ok) throw new Error("Could not sign out; retry.");
      setView(null); await refresh();
    } catch { setMessage("Could not sign out; retry."); }
    finally { setBusy(false); }
  };

  const focusPuzzle = () => window.requestAnimationFrame(() => {
    const target = document.getElementById("water-puzzle-status") ?? document.getElementById("water-controls-heading");
    target?.focus();
  });
  const moveWater = async (move: WaterMove) => {
    setInteraction(current => ({ ...current, pouring: false }));
    await act({ type: "move", move, missionId });
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
    if (view) void act({ type: "hint", hint: view.performance.hintsUsed + 1, missionId });
  };

  if (invitation) return <main className={styles.page}><p>Local development invitation</p><button type="button" disabled={busy} onClick={() => void login()}>Sign in with this invitation</button><p role="status">{message}</p></main>;
  if (!view) return <main className={styles.page}><p role="status">{message}</p></main>;
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <p className={styles.eyebrow}>The Amazing Shuk</p>
          <h1>{nav.area === "journey" && (stage === "location" || stage === "challenge") ? findMission(missionId)?.name ?? "Explore the market" : "Explore the market"}</h1>
        </div>
        <IndexParticipantMenu participants={PARTICIPANT_IDENTITIES} roles={view.session.roles} currentId={view.session.activeActorId}
          currentRole={activeRole ?? "follower"} busy={busy} onSignOut={() => void signOut()} />
        <ListParticipantBadges participants={PARTICIPANT_IDENTITIES} roles={view.session.roles} currentId={view.session.activeActorId} />
      </header>
      <section className={styles.balance} aria-label="Shared group rewards">
        <div><span>Group points</span><strong>{view.sharedBalance.points}</strong></div>
        <div><span>Food tokens</span><strong>{view.sharedBalance.foodTokens}</strong></div>
      </section>
      {nav.area === "noMission" ? <section className={styles.empty} aria-labelledby="no-mission-title">
        <h2 id="no-mission-title">No mission open yet</h2>
        <p>Choose a mission on the map, then open its location.</p>
        <ActionButton icon="arrowForward" onClick={() => navigate(goToTab(nav, "map"))}>Go to the map</ActionButton>
      </section> : null}
      {nav.area === "food" ? <PreviewFoodRewards foodTokens={view.sharedBalance.foodTokens} /> : null}
      {nav.area === "group" ? <ListGroupOverview participants={PARTICIPANT_IDENTITIES} roles={view.session.roles} currentId={view.session.activeActorId}
        missions={view.missions} balance={view.sharedBalance} /> : null}
      {nav.area === "journey" && stage !== "challenge" ? <ListArrivalMission missions={view.missions} mission={view.mission} stage={stage} guide={activeRole === "guide"} busy={busy || arrivalBusy}
        feedback={arrivalFeedback} mapView={mapView} onMapViewChange={setMapView} onArrival={() => void checkArrival()}
        onSelect={(id) => {
          if (!findMission(id)) return;
          navigate(previewMission(nav, id), false);
          window.requestAnimationFrame(() => document.getElementById("mission-preview")?.scrollIntoView({ block: "nearest" }));
        }}
        onDismiss={() => goTo("map")} onClosePreview={() => {
          // Closing with the button or Escape hands focus back to the map, where the group chooses again.
          goTo("map");
          window.requestAnimationFrame(() => document.querySelector<HTMLElement>(".leaflet-container")?.focus({ preventScroll: true }));
        }} onViewLocation={() => goTo("location")} onOpenChallenge={() => goTo("challenge")}
        onConfirm={() => void act({ type: "confirm-arrival", missionId })} /> : null}
      {nav.area === "journey" && stage === "challenge" ? <nav className={styles.journey} aria-label="Mission navigation">
        <ActionButton variant="quiet" onClick={() => goTo("location")}>Back to location</ActionButton>
        <ActionButton variant="quiet" onClick={() => goTo("map")}>Back to map</ActionButton>
      </nav> : null}
      {nav.area === "journey" && stage === "challenge" && view.mission.id === missionId && view.session.kind === "choice" && choiceTask ? <>
      <h2>{choiceTask.task.title}</h2>
      <PreviewChoiceStory {...choiceTask.task.story} instruction={choiceTask.task.instruction} open={storyOpen} onToggle={() => setStoryOpen(!storyOpen)} />
      <ListChoiceTask task={choiceTask.task} challenge={choiceTask.challenge} selected={view.session.selected ?? []} completed={view.session.completed} feedback={message} activeRole={activeRole ?? "follower"} busy={busy}
        performance={view.performance} onToggle={(optionId) => void act({ type: "toggle-choice", optionId, missionId })}
        onStart={() => void act({ type: "start", missionId })} onHint={revealHint} onSubmit={() => void act({ type: "submit", missionId })}
        onReset={() => void act({ type: "reset", missionId })} />
      {/* Optional extras after the accepted answer: they never change the mission's completion or its food tokens. */}
      {view.session.completed && choiceTask.bonus && view.session.bonus ? <ListChoiceBonus content={choiceTask.bonus.content} challenge={choiceTask.bonus.challenge}
        state={view.session.bonus} activeRole={activeRole ?? "follower"} busy={busy} feedback={message}
        onToggle={(optionId) => void act({ type: "toggle-choice", optionId, missionId, part: "bonus" })}
        onSubmit={() => void act({ type: "submit", missionId, part: "bonus" })} onReset={() => void act({ type: "reset", missionId, part: "bonus" })} /> : null}
      {view.session.completed && choiceTask.appreciation ? <PreviewAppreciation {...choiceTask.appreciation} /> : null}
      </> : nav.area === "journey" && stage === "challenge" && view.mission.id === missionId && view.session.kind !== "choice" ? <>
      <h2>{WATER_TASK.title}</h2>
      <PreviewWellStory {...WATER_TASK.story} showOriginalHebrew={process.env.NODE_ENV === "development"} instruction={WATER_TASK.instruction} open={storyOpen} onToggle={() => {
        setStoryOpen(!storyOpen);
        try { localStorage.setItem("shuk:well-story-collapsed", storyOpen ? "1" : "0"); } catch { /* Preference storage is optional. */ }
      }} />
      <ListWaterTask cups={view.session.cups} completed={view.session.completed} activeRole={activeRole ?? "follower"} busy={busy}
        interaction={interaction} performance={view.performance} onSelect={selectContainer} onAction={contextualAction}
        onCancelPour={() => { setInteraction(current => ({ ...current, pouring: false })); window.requestAnimationFrame(() => document.getElementById(`water-container-${interaction.selected}`)?.focus()); }}
        onStart={() => void act({ type: "start", missionId })} onHint={revealHint} onSubmit={() => void act({ type: "submit", missionId })} onReset={() => {
          setInteraction(INITIAL_WATER_INTERACTION);
          void act({ type: "reset", missionId }).then(focusPuzzle);
        }} />
      </> : null}
      {activeRole === "guide" ? <IndexGuideWaterTask missionId={missionId} roles={view.session.roles} busy={busy} completed={view.session.completed} timing={view.guideTiming} onAction={(action) => void act(action)} /> : null}
      {/* On the mural, replies to an action appear beside its submit button instead. */}
      {message && !(nav.area === "journey" && stage === "challenge" && view.session.kind === "choice") ? <p className={styles.message} role="status">{message}</p> : null}
      <details className={styles.dev}>
        <summary>Development</summary>
        <aside className={styles.safety}>Local development only. Invitation sessions and shared progress use local JSON storage. Do not expose this development server to the network.</aside>
        <button className={styles.refresh} type="button" onClick={() => void refresh()} disabled={busy}>Refresh shared state</button>
      </details>
      <PreviewShukNav active={activeTab(nav)} onSelect={tab => navigate(goToTab(nav, tab))} />
    </main>
  );
}
