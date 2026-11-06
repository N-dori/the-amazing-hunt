"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BASE_PATH } from "@/lib/base-path";
import { DEV_GUIDE_ID, getDevWaterActorRole, type DevWaterSession } from "@/lib/amazing-shuk/dev-water-session";
import type { GroupAction } from "@/lib/amazing-shuk/group-action";
import IndexParticipantMenu from "@/components/amazing-shuk/IndexParticipantMenu";
import IndexGroupSheet from "@/components/amazing-shuk/IndexGroupSheet";
import PreviewMissionProgress from "@/components/amazing-shuk/PreviewMissionProgress";
import PreviewShukHeader from "@/components/amazing-shuk/PreviewShukHeader";
import ListGroupOverview from "@/components/amazing-shuk/ListGroupOverview";
import PreviewFoodRewards from "@/components/amazing-shuk/PreviewFoodRewards";
import PreviewShukNav from "@/components/amazing-shuk/PreviewShukNav";
import PreviewShukWelcome from "@/components/amazing-shuk/PreviewShukWelcome";
import IndexAdventureLobby from "@/components/amazing-shuk/IndexAdventureLobby";
import IndexRoleCard from "@/components/amazing-shuk/IndexRoleCard";
import PreviewLeaveGame from "@/components/amazing-shuk/PreviewLeaveGame";
import { createLeaveGuard } from "@/lib/amazing-shuk/leave-guard";
import IndexTeamJoin from "@/components/amazing-shuk/IndexTeamJoin";
import IndexTeamMembers from "@/components/amazing-shuk/IndexTeamMembers";
import { JOIN_ERROR, TEAM_JOIN_COPY, TEAM_MEMBERS_COPY, type MembershipView } from "@/lib/amazing-shuk/team-membership";
import { queuedActionOutcome } from "@/lib/amazing-shuk/action-sync";
import type { AdventureView, TeamOverviewView, TeamView } from "@/lib/amazing-shuk/adventure-lobby";
import { LEAVE_COPY, WELCOME_COPY } from "@/lib/amazing-shuk/welcome-copy";
import { activeTab, goToStage, goToTab, initialNavState, parseNavState, previewMission, type JourneyStage, type ShukNavState } from "@/lib/amazing-shuk/shuk-navigation";
import IndexGuideWaterTask from "./IndexGuideWaterTask";
import ListArrivalMission from "./ListArrivalMission";
import ActionButton from "@/components/ui/ActionButton";
import type { MapView } from "@/components/map/LeafletBaseMap";
import { destinationTitle, finaleLocked, missionStage, type MissionView } from "@/lib/amazing-shuk/mission-arrival";
import { LOCATION_UNAVAILABLE_MESSAGE, requestArrivalLocation } from "@/lib/amazing-shuk/request-arrival-location";
import ListWaterTask from "./ListWaterTask";
import PreviewWellStory from "./PreviewWellStory";
import { WATER_TASK } from "@/lib/amazing-shuk/water-task";
import { challengePhase, storyDefaultOpen, storyKey } from "@/lib/amazing-shuk/challenge-phase";
import { INITIAL_WATER_INTERACTION, type WaterInteraction, type WaterContainerId, type WaterActionView } from "@/lib/amazing-shuk/water-task-view";
import type { WaterPerformanceView, GuideTimingView } from "@/lib/amazing-shuk/water-performance";
import { isWaterPuzzleSolved, WATER_PUZZLE_REVISION, type WaterMove } from "@/lib/amazing-shuk/water-measurement";
import { WATER_HINTS } from "@/lib/amazing-shuk/water-hints";
import IndexChallengeHelp from "./IndexChallengeHelp";
import { findMission, SHUK_MISSIONS } from "@/lib/amazing-shuk/missions";
import { findChoiceTask } from "@/lib/amazing-shuk/choice-missions";
import ListChoiceTask from "./ListChoiceTask";
import PreviewChoiceStory from "./PreviewChoiceStory";
import ListChoiceBonus from "./ListChoiceBonus";
import PreviewAppreciation from "./PreviewAppreciation";
import PreviewChoicePrediction from "./PreviewChoicePrediction";
import PreviewMissionCheer from "./PreviewMissionCheer";
import { missionCheer, NEXT_STOP_COPY, nextMission, rewardAmountItems, rewardHeadline, rewardToastText } from "@/lib/amazing-shuk/mission-cheer";
import { mayLead } from "@/lib/amazing-shuk/roles";
import { pendingRewardEvent, readSeenRewards, rememberSeenRewards, rewardRecords, type RewardEvent } from "@/lib/amazing-shuk/reward-events";
import { readLinkFragment } from "@/lib/amazing-shuk/link-fragment";
import PreviewRewardDialog from "./PreviewRewardDialog";
import PreviewRewardToast from "./PreviewRewardToast";
import styles from "./IndexWaterTask.module.scss";

// The roster always comes from the server (its participant registry); before a view arrives there is only the guide.
const PARTICIPANT_IDENTITIES = [{ id: DEV_GUIDE_ID, name: "Guide" }];
// The map opens on marker 1.
const INITIAL_NAV = initialNavState(SHUK_MISSIONS[0].id);
// Where the player is survives a refresh in this tab; shared progress always comes from the server.
const NAV_STORAGE_KEY = "shuk:navigation";
const isMission = (id: string) => Boolean(findMission(id));
// One queued action: its receipt ID, the reset epoch the phone was shown, and when it was queued (Phase 2e, the silent timing
// record only). Outside the component: it reads the clock, which only ever happens in an event handler.
const queueEntry = (action: GroupAction, resetEpoch: string | undefined) => ({ ...action, actionId: crypto.randomUUID(), resetEpoch, queuedAt: Date.now() });
// The Shuk API, under the app's base path. Its route name dates from the development simulation.
const API = BASE_PATH + "/api/amazing-shuk/dev";
// The local simulation says it is one; the protected app speaks to players.
// TODO(copy): the app's lines are drafts for owner review.
const MODE_COPY = {
  dev: { connecting: "Connecting to the local development session…", unavailable: "The local simulation is unavailable.",
    loadFailed: "Could not load the local simulation." },
  app: { connecting: "Connecting to the game…", unavailable: "The game isn't available right now. Try again in a moment, or ask your guide.",
    loadFailed: "Could not load the game. Check your connection and try again." },
} as const;
type Props = { mode: keyof typeof MODE_COPY };

// The server returns the detail of the requested mission: cups for the well, picks for a "choose N" challenge.
type MissionSession = DevWaterSession & { kind?: "water" | "choice"; selected?: string[]; step?: number; bonus?: { selected: string[]; completed: boolean; points: number; awardedAt?: number } };
// `participants` carries the group's display names (from the server's state, never git); older servers omit it, and `adventure` too.
// `membership` comes only to the team's leader session and the guide, and only while join links are on (I3b).
// `solo`: a team of one (D12), computed by the server; it holds both roles and reads personal wording.
type ServerView = { resetEpoch?: string; solo?: boolean; adventure?: AdventureView; team?: TeamView; teams?: readonly TeamOverviewView[]; membership?: MembershipView; participants?: { id: string; name: string }[]; missions: MissionView[]; mission: MissionView; puzzleRevision: number; session: MissionSession; performance: WaterPerformanceView; guideTiming?: GuideTimingView; message?: string; error?: string; sharedBalance: { points: number; foodTokens: number; status: string } };

/** The Shuk game: the local simulation ("dev") or the protected app ("app"), which differ only in wording and the dev panel. */
export default function IndexWaterTask({ mode }: Props) {
  const copy = MODE_COPY[mode];
  const [view, setView] = useState<ServerView | null>(null);
  const [message, setMessage] = useState<string>(copy.connecting);
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
  // "Leave the game?" (owner, 5 Nov 2026): Back from the first screen asks first. The guard needs the current screen, kept in a ref.
  const navRef = useRef(nav);
  useEffect(() => { navRef.current = nav; }, [nav]);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const leaveGuard = useRef<ReturnType<typeof createLeaveGuard> | null>(null);
  const afterLeaveClose = useRef<(() => void) | null>(null);
  useEffect(() => {
    let storage: Storage | null = null;
    try { storage = window.sessionStorage; } catch { /* The guard still works for this load. */ }
    leaveGuard.current = createLeaveGuard(window.history, storage);
    leaveGuard.current.install();
    const timer = window.setTimeout(() => {
      try {
        const saved = parseNavState(JSON.parse(sessionStorage.getItem(NAV_STORAGE_KEY) ?? "null"), isMission);
        if (saved) { setNav(saved); window.history.replaceState({ shukNav: saved }, ""); }
      } catch { /* Start from the map when storage is unavailable. */ }
    }, 0);
    const back = (event: PopStateEvent) => {
      const guarded = leaveGuard.current?.popped(event.state, { shukNav: navRef.current }) ?? "none";
      if (guarded === "ask") { setLeaveOpen(true); return; }
      if (guarded === "left") return;
      const restored = parseNavState((event.state as { shukNav?: unknown } | null)?.shukNav, isMission);
      setNav(current => restored ?? goToTab(current, "map"));
      try { if (restored) sessionStorage.setItem(NAV_STORAGE_KEY, JSON.stringify(restored)); } catch { /* Optional. */ }
    };
    window.addEventListener("popstate", back);
    return () => { window.clearTimeout(timer); window.removeEventListener("popstate", back); };
  }, []);
  const [busy, setBusy] = useState(false);
  // Reward pop-ups (Phase 2d): the award keys this phone already knew, per mission, and the one pop-up waiting to show.
  const knownRewards = useRef(new Map<string, Set<string>>());
  const [reward, setReward] = useState<RewardEvent | null>(null);
  // Every fresh server view passes through here: a new, unseen, recent award becomes the one pop-up (pure rules in reward-events).
  const noticeRewards = useCallback((next: ServerView) => {
    const records = rewardRecords(next);
    const known = knownRewards.current.get(next.mission.id) ?? null;
    let storage: Storage | null = null;
    try { storage = window.localStorage; } catch { /* Blocked storage: nothing is remembered. */ }
    const event = pendingRewardEvent(records, known, readSeenRewards(storage), Date.now());
    knownRewards.current.set(next.mission.id, new Set([...(known ?? []), ...records.map(record => record.key)]));
    if (event) { rememberSeenRewards(storage, event.keys); setReward(event); }
  }, []);
  // The pop-up shows only on the award's own stop (its location or challenge screen); anywhere else a small toast says it instead,
  // so it never interrupts reading. A toast leaves by itself after a few seconds; a pop-up waits for Continue.
  const rewardInline = reward !== null && nav.area === "journey" && reward.missionId === missionId && (stage === "location" || stage === "challenge");
  useEffect(() => {
    if (!reward || rewardInline) return;
    const timer = window.setTimeout(() => setReward(current => current === reward ? null : current), 6000);
    return () => window.clearTimeout(timer);
  }, [reward, rewardInline]);
  const [interaction, setInteraction] = useState<WaterInteraction>(INITIAL_WATER_INTERACTION);
  // Per mission and phase: the story's fold, where the player changed it (UX-3).
  const [storyFolds, setStoryFolds] = useState<Readonly<Record<string, boolean>>>({});
  const [invitation, setInvitation] = useState("");
  // A team's join link from `#join=` (I3b). A phone that turns out to be signed in already just says so.
  const [joinLink, setJoinLink] = useState("");
  const joinLinkRef = useRef("");
  // The server said there is no session: the welcome screen, without a sign-in button, replaces the bare status line.
  const [signedOut, setSignedOut] = useState(false);
  // Signed out because the server no longer knows this phone's session (removed from the team, a new adventure): said plainly.
  const [sessionEnded, setSessionEnded] = useState(false);
  // The link is read when the page opens and on every `hashchange` (a link pasted into a tab already on this page reloads
  // nothing). It is wiped from the address bar at once; that wipe fires no `hashchange`, so this never loops.
  useEffect(() => {
    const take = () => {
      const link = readLinkFragment(window.location.hash);
      if (!link) return;
      window.history.replaceState(null, "", window.location.pathname);
      if (link.kind === "invite") { setMessage(""); setInvitation(link.value); }
      else { joinLinkRef.current = link.value; setJoinLink(link.value); }
    };
    const timer = window.setTimeout(take, 0);
    window.addEventListener("hashchange", take);
    return () => { window.clearTimeout(timer); window.removeEventListener("hashchange", take); };
  }, []);
  const login = async () => {
    setBusy(true);
    try {
      const response = await fetch(API, {
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
      const response = await fetch(API + "?mission=" + encodeURIComponent(missionId), { cache: "no-store" });
      setSignedOut(response.status === 401);
      if (response.status === 401) {
        setView(null);
        const refusal = await response.json().catch(() => ({})) as { code?: string };
        setSessionEnded(refusal.code === JOIN_ERROR.sessionEnded);
      } else setSessionEnded(false);
      if (!response.ok) throw new Error(response.status === 401 ? "Open your single-use invitation link to sign in." : copy.unavailable);
      const fresh = await response.json() as ServerView;
      noticeRewards(fresh);
      setView(fresh);
      setMessage(joinLinkRef.current ? TEAM_JOIN_COPY.alreadyIn : "");
      if (joinLinkRef.current) { joinLinkRef.current = ""; setJoinLink(""); }
    } catch (error) { setMessage(error instanceof Error ? error.message : copy.loadFailed); }
  }, [missionId, copy, noticeRewards]);
  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => { void refresh(); }, 1500);
    return () => window.clearInterval(timer);
  }, [refresh]);
  // The mural, the synagogue and any other "choose N" mission share one challenge screen; this is its content.
  const choiceTask = findChoiceTask(missionId);
  const activeRole = useMemo(() => view ? getDevWaterActorRole(view.session) : null, [view]);
  // UX-3: the story, then Start, then the challenge. The server's accepted start decides the side, so every phone agrees.
  const storyFirst = findMission(missionId)?.storyFirst !== false;
  const phase = view ? challengePhase(view.performance.started, view.session.completed, storyFirst) : "story";
  const foldKey = storyKey(missionId, phase);
  const storyOpen = storyFolds[foldKey] ?? storyDefaultOpen(phase, storyFirst);
  const toggleStory = () => setStoryFolds(current => ({ ...current, [foldKey]: !storyOpen }));

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
      const response = await fetch(API, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "arrival", missionId,
          reading, actionId: crypto.randomUUID(), expectedParticipantId: actorId, puzzleRevision: WATER_PUZZLE_REVISION, resetEpoch: view?.resetEpoch }),
      });
      const data = await response.json() as ServerView;
      if (currentActor.current !== actorId || generation !== arrivalGeneration.current) return;
      if (!response.ok) throw new Error(data.error ?? "Arrival could not be checked. Please retry or ask the guide.");
      noticeRewards(data); setView(data); setArrivalFeedback(data.message ?? "You're very close! You're in the right area. Look around for Gan HaTut.");
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
        const response = await fetch(API, {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...action, expectedParticipantId: actorId, puzzleRevision: WATER_PUZZLE_REVISION }),
        });
        // A reply without a JSON body (a proxy's error page, an empty 404) must not stop the queue: it is judged by its status alone.
        // A success must carry the view, though; without it the action stays queued, as before.
        const body = await response.json().catch(() => null) as Partial<ServerView> | null;
        const data = body ?? {};
        const outcome = queuedActionOutcome(response.status);
        if (outcome === "retry" || (outcome === "applied" && body === null)) throw new Error(data.error ?? "Action saved; waiting to reconnect.");
        const remaining = JSON.parse(localStorage.getItem(key) ?? "[]") as { actionId: string }[];
        localStorage.setItem(key, JSON.stringify(remaining.filter(item => item.actionId !== action.actionId)));
        if (outcome === "applied") { noticeRewards(data as ServerView); setView(data as ServerView); setMessage(action.type === "move" ? "" : data.message ?? ""); }
        else setMessage(data.error ?? "Action rejected.");
      }
    } catch (error) { setMessage(error instanceof Error ? error.message : "Action saved; waiting to reconnect."); }
    finally { flushing.current = false; setBusy(false); }
  }, [actorId, noticeRewards]);
  useEffect(() => {
    const timer = window.setInterval(() => { void flush(); }, 2000);
    return () => window.clearInterval(timer);
  }, [flush]);
  const act = async (action: GroupAction) => {
    if (action.type === "arrival") return; // Never persist GPS readings.
    if (!actorId) return;
    const key = `shuk-pending:v${WATER_PUZZLE_REVISION}:` + actorId;
    const pending = JSON.parse(localStorage.getItem(key) ?? "[]");
    // The reset epoch the phone was shown (development resets only) travels with the action, so a reset drops what was queued before it.
    // `queuedAt` (Phase 2e) tells the server how long the action waited here, for the silent timing record only.
    localStorage.setItem(key, JSON.stringify([...pending, queueEntry(action, view?.resetEpoch)]));
    await flush();
  };

  const signOut = async () => {
    setBusy(true);
    try {
      const response = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "logout" }) });
      if (!response.ok) throw new Error("Could not sign out; retry.");
      setView(null); await refresh();
    } catch { setMessage("Could not sign out; retry."); }
    finally { setBusy(false); }
  };

  // The phone that pressed Start lands on the question or puzzle once the server accepts; a queued start moves nothing yet.
  const startChallenge = () => void act({ type: "start", missionId }).then(() => window.requestAnimationFrame(() =>
    document.getElementById(view?.session.kind === "choice" ? "mural-task-title" : "water-task-title")?.focus()));
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
    // A question's hints are numbered from 1; naming the step keeps a late hint from opening the next question's.
    if (view) void act({ type: "hint", hint: (view.performance.stepHintsUsed ?? view.performance.hintsUsed) + 1, missionId,
      ...(view.session.kind === "choice" ? { step: view.session.step ?? 0 } : {}) });
  };

  // The hint sheet and "I'm completely stuck" for the open challenge (Phase 2c). Keyed by question, so a new one starts fresh.
  const challengeHelp = () => {
    const definition = findMission(missionId);
    if (!view || !definition) return null;
    const step = view.session.kind === "choice" ? view.session.step ?? 0 : 0;
    const hints = view.session.kind === "choice" ? (step > 0 ? choiceTask?.task.followUps?.[step - 1]?.hints : choiceTask?.task.hints) ?? [] : WATER_HINTS;
    return <IndexChallengeHelp key={`${missionId}:${step}`} hints={hints} stepUsed={view.performance.stepHintsUsed ?? view.performance.hintsUsed}
      totalUsed={view.performance.hintsUsed} performance={view.performance} completed={view.session.completed}
      solved={view.session.kind === "water" && view.session.cups ? isWaterPuzzleSolved(view.session.cups) : false}
      rewards={definition.rewards} busy={busy} onHint={revealHint} onReveal={() => void act({ type: "reveal", missionId })} />;
  };

  // The one waiting award: a pop-up on its own stop, a toast elsewhere (Phase 2d).
  const rewardPopUp = () => {
    if (!reward || !view) return null;
    const solo = view.solo === true;
    if (!rewardInline) {
      const place = findMission(reward.missionId)?.shortName ?? "";
      return <PreviewRewardToast text={rewardToastText(reward.points, reward.foodTokens, place, solo)} onDismiss={() => setReward(null)} />;
    }
    const { text, celebrate } = rewardHeadline(reward.weight, reward.missionId, solo);
    // A new award mounts a new pop-up, so its count-up plays once (UX-4).
    return <PreviewRewardDialog key={reward.keys.join(" ")} open title={text} celebrate={celebrate && reward.weight === "full"} weight={reward.weight}
      amounts={rewardAmountItems(reward.points, reward.foodTokens)} onContinue={() => setReward(null)} />;
  };

  // The header's height wraps with the role badges and the text size; the map stage uses it to fill the rest of the screen.
  const pageRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const hasHeader = view !== null && !invitation;
  useEffect(() => {
    const page = pageRef.current;
    const header = headerRef.current;
    if (!page || !header || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => page.style.setProperty("--shuk-header-height", `${header.offsetHeight}px`));
    observer.observe(header);
    return () => observer.disconnect();
  }, [hasHeader]);

  // Once the answer is accepted: a cheer, and the way to the next stop. The bonus, if any, waits below it.
  const cheer = (bonusBelow: boolean) => {
    if (!view?.session.completed) return null;
    const { text, celebrate } = missionCheer(missionId, view.solo === true, view.performance.revealed === true);
    const next = nextMission(view.missions, missionId);
    // Only the Navigator takes the group on (owner, 5 Nov 2026); after a reveal, the card says who taps.
    const canGoOn = mayLead(view.session.activeActorId, view.session.roles, activeRole === "guide", view.solo === true);
    const instruction = view.performance.revealed && view.solo !== true ? (canGoOn ? NEXT_STOP_COPY.navigator : NEXT_STOP_COPY.others) : undefined;
    return <PreviewMissionCheer cheer={text} celebrate={celebrate} next={next} bonusBelow={bonusBelow}
      canGoOn={canGoOn} instruction={instruction} onlyNavigator={NEXT_STOP_COPY.onlyNavigator}
      onNext={() => { if (next) navigate(previewMission(nav, next.id)); }} onMap={() => goTo("map")} />;
  };

  // Stay closes the question and keeps the screen; Leave closes it, then steps back past the guard once the sheet's own entry is gone.
  const leaveDialog = <PreviewLeaveGame open={leaveOpen} copy={LEAVE_COPY} afterClose={afterLeaveClose} onStay={() => setLeaveOpen(false)}
    onLeave={() => { afterLeaveClose.current = () => { afterLeaveClose.current = null; leaveGuard.current?.leave(); }; setLeaveOpen(false); }} />;

  if (invitation) return <PreviewShukWelcome copy={WELCOME_COPY} message={message === copy.connecting ? "" : message} busy={busy} onStart={() => void login()} />;
  // No session: a join link, or a request this phone made earlier, leads to joining; otherwise the signed-out welcome.
  if (!view && signedOut) return <IndexTeamJoin link={joinLink || null} fallback={<PreviewShukWelcome copy={WELCOME_COPY} message="" busy={false} signedOut={sessionEnded ? TEAM_JOIN_COPY.sessionEnded : undefined} />}
    onJoined={async () => { joinLinkRef.current = ""; setJoinLink(""); await refresh(); }} />;
  if (!view) return <main className={styles.page}><p role="status">{message}</p></main>;
  // Before Start Adventure the lobby is the whole screen: nothing on the journey counts yet.
  if (view.adventure?.status === "lobby") return <main className={`${styles.page} ${styles.lobbyPage}`}>
    <IndexAdventureLobby adventure={view.adventure} guide={activeRole === "guide"} participants={view.participants ?? []} roles={view.session.roles}
      currentId={view.session.activeActorId} team={view.team} teams={view.teams} busy={busy} message={message} onAction={act} />
    {/* The role card (owner, 5 Nov 2026): this phone's player has just been given a role. */}
    <IndexRoleCard roles={view.session.roles} currentId={view.session.activeActorId} />
    {leaveDialog}
    {/* Players can join while the group waits in the lobby. */}
    {view.membership ? <IndexTeamMembers membership={view.membership} participants={view.participants ?? PARTICIPANT_IDENTITIES}
      {...(view.solo ? { title: TEAM_MEMBERS_COPY.titleSolo } : {})}
      currentId={view.session.activeActorId} busy={busy} onAction={act} /> : null}
  </main>;
  const participants = view.participants ?? PARTICIPANT_IDENTITIES;
  const solo = view.solo === true;
  // A locked finale (Marzipan) can't be played yet, even from a saved screen or the Mission tab: its map preview says why.
  const openDefinition = findMission(missionId);
  const journeyStage = stage === "challenge" && openDefinition && finaleLocked(openDefinition, view.missions) ? "location" : stage;
  // Where the mission on screen stands: from shared progress, plus this phone being on its challenge. Never from an arrival.
  const progress = missionStage({ state: view.mission.state, started: view.mission.id === missionId && view.performance.started,
    onChallenge: nav.area === "journey" && journeyStage === "challenge" });
  const guideTools = (part: "roles" | "timing") => <IndexGuideWaterTask part={part} participants={participants.filter(participant => participant.id !== DEV_GUIDE_ID)}
    missionId={missionId} roles={view.session.roles} busy={busy} completed={view.session.completed} timing={view.guideTiming} onAction={(action) => void act(action)} />;
  // While a role is free, a player who can't start the challenge gets the way to the Group tab beside the note that says why.
  const openRoles = view.session.roles.navigator && view.session.roles.answerSubmitter ? undefined : () => navigate(goToTab(nav, "group"));
  // Find this place names the destination as the task; a locked finale stays on the map, under its plain name.
  const headerTitle = nav.area !== "journey" || !openDefinition || (journeyStage !== "location" && journeyStage !== "challenge") ? "Explore the market"
    : journeyStage === "location" && !finaleLocked(openDefinition, view.missions) ? destinationTitle(openDefinition.name) : openDefinition.name;
  return (
    <main className={styles.page} ref={pageRef}>
      {/* A role given during play (the Group tab's Change) gets the same card as in the lobby. */}
      <IndexRoleCard roles={view.session.roles} currentId={view.session.activeActorId} />
      {leaveDialog}
      <PreviewShukHeader ref={headerRef} title={headerTitle}
        team={view.team && view.team.count > 1 && view.team.name ? { name: view.team.name, initials: view.team.initials } : null}
        group={<IndexGroupSheet participants={participants} roles={view.session.roles} currentId={view.session.activeActorId} solo={solo}
          missions={view.missions} balance={view.sharedBalance} onOpenGroupTab={() => navigate(goToTab(nav, "group"))} />}
        menu={<IndexParticipantMenu participants={participants} roles={view.session.roles} currentId={view.session.activeActorId}
          currentRole={activeRole ?? "follower"} solo={solo} busy={busy} onSignOut={() => void signOut()} />} />
      {nav.area === "noMission" ? <section className={styles.empty} aria-labelledby="no-mission-title">
        <h2 id="no-mission-title">No mission open yet</h2>
        <p>Choose a mission on the map, then open its location.</p>
        <ActionButton icon="arrowForward" onClick={() => navigate(goToTab(nav, "map"))}>Go to the map</ActionButton>
      </section> : null}
      {nav.area === "food" ? <PreviewFoodRewards foodTokens={view.sharedBalance.foodTokens} /> : null}
      {nav.area === "group" ? <ListGroupOverview participants={participants} roles={view.session.roles} currentId={view.session.activeActorId} solo={solo}
        missions={view.missions} balance={view.sharedBalance} guide={activeRole === "guide"} busy={busy}
        onClaim={role => void act({ type: "claim-role", role })} onRelease={role => void act({ type: "release-role", role })}
        leader={view.adventure?.leader === true} onAssign={(role, participantId) => void act({ type: "assign-role", role, participantId })} /> : null}
      {/* Solo, the Group tab's own heading says "Playing solo"; the leader's panel below is for inviting someone. */}
      {nav.area === "group" && view.membership ? <IndexTeamMembers membership={view.membership} participants={participants}
        {...(solo ? { title: TEAM_MEMBERS_COPY.invite } : {})}
        currentId={view.session.activeActorId} busy={busy} onAction={act} /> : null}
      {/* The guide assigns roles with the group, not under the map or a mission. */}
      {nav.area === "group" && activeRole === "guide" ? guideTools("roles") : null}
      {nav.area === "journey" && journeyStage !== "challenge" ? <ListArrivalMission missions={view.missions} mission={view.mission} stage={journeyStage} progress={progress} guide={activeRole === "guide"} busy={busy || arrivalBusy}
        feedback={arrivalFeedback} mapView={mapView} onMapViewChange={setMapView} onArrival={() => void checkArrival()}
        onSelect={(id) => {
          if (!findMission(id)) return;
          // The map stage fits the screen from the top of the page, so the sheet and its action are in view there.
          navigate(previewMission(nav, id));
        }}
        onDismiss={() => goTo("map")} onClosePreview={() => {
          // Closing with the button or Escape hands focus back to the map, where the group chooses again.
          goTo("map");
          window.requestAnimationFrame(() => document.querySelector<HTMLElement>(".leaflet-container")?.focus({ preventScroll: true }));
        }} onViewLocation={() => goTo("location")} onOpenChallenge={() => goTo("challenge")}
        canSelfArrive={activeRole === "guide" || activeRole === "navigator" || activeRole === "navigatorAndAnswerSubmitter"} solo={solo}
        onSelfArrive={() => void act({ type: "self-arrival", missionId })}
        onConfirm={() => void act({ type: "confirm-arrival", missionId })} /> : null}
      {/* UX-4 (owner, 2 Nov 2026): no Back buttons on the challenge; the phone's Back and the Map tab lead away. */}
      {nav.area === "journey" && journeyStage === "challenge" && view.mission.id === missionId ? <PreviewMissionProgress stage={progress} /> : null}
      {nav.area === "journey" && journeyStage === "challenge" && view.mission.id === missionId && view.session.kind === "choice" && choiceTask ? <>
      <h2>{choiceTask.task.title}</h2>
      <PreviewChoiceStory {...choiceTask.task.story} instruction={solo ? choiceTask.task.instructionSolo ?? choiceTask.task.instruction : choiceTask.task.instruction} open={storyOpen} onToggle={toggleStory} collapsible={phase !== "story"} />
      {choiceTask.task.prediction && !view.session.completed ? <PreviewChoicePrediction {...choiceTask.task.prediction} /> : null}
      <ListChoiceTask solo={solo} task={choiceTask.task} challenge={choiceTask.challenge} step={view.session.step ?? 0} followUps={choiceTask.followUps} selected={view.session.selected ?? []} completed={view.session.completed} feedback={message} activeRole={activeRole ?? "follower"} busy={busy}
        performance={view.performance} onToggle={(optionId) => void act({ type: "toggle-choice", optionId, missionId })}
        onStart={startChallenge} storyFirst={storyFirst} help={challengeHelp()} onSubmit={() => void act({ type: "submit", missionId })}
        onReset={() => void act({ type: "reset", missionId })} onOpenRoles={openRoles} />
      {cheer(Boolean(choiceTask.bonus && view.session.bonus && !view.session.bonus.completed))}
      {/* Optional extras after the accepted answer: they never change the mission's completion or its food tokens. */}
      {view.session.completed && choiceTask.bonus && view.session.bonus ? <ListChoiceBonus content={choiceTask.bonus.content} challenge={choiceTask.bonus.challenge}
        state={view.session.bonus} activeRole={activeRole ?? "follower"} busy={busy} feedback={message} canAnswer={view.performance.canAnswer ?? true}
        onToggle={(optionId) => void act({ type: "toggle-choice", optionId, missionId, part: "bonus" })}
        onSubmit={() => void act({ type: "submit", missionId, part: "bonus" })} onReset={() => void act({ type: "reset", missionId, part: "bonus" })} /> : null}
      {view.session.completed && choiceTask.appreciation ? <PreviewAppreciation {...choiceTask.appreciation} /> : null}
      {/* Opens the Food tab only: redemption stays with the guide at the market. */}
      {view.session.completed && choiceTask.task.foodAction ? <ActionButton icon="arrowForward" onClick={() => navigate(goToTab(nav, "food"))}>{choiceTask.task.foodAction}</ActionButton> : null}
      </> : nav.area === "journey" && journeyStage === "challenge" && view.mission.id === missionId && view.session.kind !== "choice" ? <>
      <h2>{WATER_TASK.title}</h2>
      <PreviewWellStory {...WATER_TASK.story} showOriginalHebrew={process.env.NODE_ENV === "development"} instruction={solo ? WATER_TASK.instructionSolo : WATER_TASK.instruction} open={storyOpen} onToggle={toggleStory} collapsible={phase !== "story"} />
      <ListWaterTask solo={solo} cups={view.session.cups} completed={view.session.completed} activeRole={activeRole ?? "follower"} busy={busy}
        interaction={interaction} performance={view.performance} onSelect={selectContainer} onAction={contextualAction}
        onCancelPour={() => { setInteraction(current => ({ ...current, pouring: false })); window.requestAnimationFrame(() => document.getElementById(`water-container-${interaction.selected}`)?.focus()); }}
        onStart={startChallenge} storyFirst={storyFirst} help={challengeHelp()} onOpenRoles={openRoles} onSubmit={() => void act({ type: "submit", missionId })} onReset={() => {
          setInteraction(INITIAL_WATER_INTERACTION);
          void act({ type: "reset", missionId }).then(focusPuzzle);
        }} />
      {cheer(false)}
      </> : null}
      {/* The timing review belongs to the challenge it measures. */}
      {nav.area === "journey" && journeyStage === "challenge" && activeRole === "guide" ? guideTools("timing") : null}
      {/* On the mural, replies to an action appear beside its submit button instead. */}
      {message && !(nav.area === "journey" && journeyStage === "challenge" && view.session.kind === "choice") ? <p className={styles.message} role="status">{message}</p> : null}
      {mode === "dev" ? <details className={styles.dev}>
        <summary>Development</summary>
        <aside className={styles.safety}>Local development only. Invitation sessions and shared progress use local JSON storage. Do not expose this development server to the network.</aside>
        <button className={styles.refresh} type="button" onClick={() => void refresh()} disabled={busy}>Refresh shared state</button>
      </details> : null}
      {rewardPopUp()}
      <PreviewShukNav active={activeTab(nav)} onSelect={tab => navigate(goToTab(nav, tab))} />
    </main>
  );
}
