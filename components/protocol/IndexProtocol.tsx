"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MapView } from "@/components/map/LeafletBaseMap";
import IndexMission from "@/components/mission/IndexMission";
import IndexDiscovery from "@/components/puzzle/IndexDiscovery";
import IndexPuzzle from "@/components/puzzle/IndexPuzzle";
import IndexTeam from "@/components/team/IndexTeam";
import IndexTransmission from "@/components/transmission/IndexTransmission";
import type { BaseMapId, MemoryMissionId } from "@/lib/game/basemaps";
import type { DiscoveryResult } from "@/lib/game/discovery";
import type { LibraryProgress } from "@/lib/game/library";
import type { SiteId, TeamId } from "@/lib/game/types";
import WelcomeScreen from "./WelcomeScreen";
import styles from "./IndexProtocol.module.scss";

// The visual prototype's flow: Welcome → Team → HARMONY transmission (00A) → map → the
// Library chapter: 00B, then the team's 00C investigation → back to the map. Mock, local state
// only: no session, no server, nothing persisted.
export type FlowStep = "welcome" | "team" | "transmission" | "map" | "library" | "discovery";

const ORDER: FlowStep[] = ["welcome", "team", "transmission", "map", "library", "discovery"];

export default function IndexProtocol({ devTools = false }: { devTools?: boolean }) {
  const [step, setStep] = useState<FlowStep>("welcome");
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [teamId, setTeamId] = useState<TeamId | null>(null);
  const [firstKeepersSolved, setFirstKeepersSolved] = useState(false);
  // Mission 00C, per team. The team being played can differ from the visitor's team only
  // through the development preview.
  const [discoveryResults, setDiscoveryResults] = useState<Partial<Record<TeamId, DiscoveryResult>>>({});
  const [discoveryTeam, setDiscoveryTeam] = useState<TeamId | null>(null);
  const discoveryDone = useMemo(() => (Object.keys(discoveryResults) as TeamId[]), [discoveryResults]);
  const libraryProgress: LibraryProgress = {
    timelineSolved: firstKeepersSolved,
    discoveryDone: teamId !== null && discoveryResults[teamId] !== undefined,
  };
  // The map lives here, above the screens, so a mission round-trip returns to the same view.
  const [baseMapId, setBaseMapId] = useState<BaseMapId>("illustratedCandidate");
  const [mapViews, setMapViews] = useState<Partial<Record<BaseMapId, MapView>>>({});
  const [synagogueSimulated, setSynagogueSimulated] = useState(false);
  const completedMissions = useMemo(() => {
    const done = new Set<MemoryMissionId>();
    if (firstKeepersSolved) done.add("firstKeepers");
    if (synagogueSimulated) done.add("synagogueReconstruction");
    return done;
  }, [firstKeepersSolved, synagogueSimulated]);
  const completedSites = useMemo<SiteId[]>(() => (synagogueSimulated ? ["synagogue"] : []), [synagogueSimulated]);
  const saveMapView = useCallback((view: MapView) => setMapViews((v) => ({ ...v, [baseMapId]: view })), [baseMapId]);
  const rootRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  const go = useCallback((next: FlowStep) => {
    setDirection(ORDER.indexOf(next) >= ORDER.indexOf(step) ? "forward" : "back");
    setStep(next);
  }, [step]);

  // On every screen change, start at the top and move focus to the new screen's heading,
  // so keyboard and screen-reader users land where sighted users look.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.scrollTo({ top: 0 });
    rootRef.current?.querySelector<HTMLElement>("[data-screen-heading]")?.focus({ preventScroll: true });
  }, [step]);

  return (
    <div ref={rootRef} className={styles.flow}>
      <div key={step} className={`${styles.screen} ${direction === "back" ? styles.screenBack : ""}`}>
        {step === "welcome" && <WelcomeScreen onBegin={() => go("team")} />}
        {step === "team" && (
          <IndexTeam
            selected={teamId}
            onBack={() => go("welcome")}
            onJoin={(id) => {
              setTeamId(id);
              go("transmission");
            }}
          />
        )}
        {step === "transmission" && (
          <IndexTransmission teamId={teamId} onBack={() => go("team")} onComplete={() => go("map")} />
        )}
        {step === "map" && (
          <IndexMission
            teamId={teamId}
            libraryProgress={libraryProgress}
            baseMapId={baseMapId}
            mapView={mapViews[baseMapId] ?? null}
            completedMissions={completedMissions}
            completedSites={completedSites}
            devTools={devTools}
            synagogueSimulated={synagogueSimulated}
            onBaseMapChange={setBaseMapId}
            onMapViewChange={saveMapView}
            onSimulateSynagogue={setSynagogueSimulated}
            onBack={() => go("transmission")}
            onStartLibrary={() => go("library")}
          />
        )}
        {step === "library" && (
          <IndexPuzzle
            teamId={teamId}
            initialStage={firstKeepersSolved ? "unlocked" : "brief"}
            discoveryDone={discoveryDone}
            devTools={devTools}
            onExit={() => go("map")}
            onSolved={() => setFirstKeepersSolved(true)}
            onStartDiscovery={(id) => {
              setDiscoveryTeam(id);
              go("discovery");
            }}
          />
        )}
        {step === "discovery" && discoveryTeam && (
          <IndexDiscovery
            teamId={discoveryTeam}
            result={discoveryResults[discoveryTeam] ?? null}
            onExit={() => go("library")}
            onSolved={(result) => setDiscoveryResults((r) => ({ ...r, [discoveryTeam]: result }))}
          />
        )}
      </div>
    </div>
  );
}
