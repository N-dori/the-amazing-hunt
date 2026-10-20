"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MapView } from "@/components/map/LeafletBaseMap";
import ScreenHeader from "@/components/protocol/ScreenHeader";
import StatusTag from "@/components/ui/StatusTag";
import { mapScreen, prototypeNote, teams } from "@/lib/game/screens";
import type { BaseMapId, MemoryMissionId } from "@/lib/game/basemaps";
import type { LibraryProgress } from "@/lib/game/library";
import type { SiteId, TeamId } from "@/lib/game/types";
import DevMapControls from "./DevMapControls";
import ListMission from "./ListMission";
import styles from "./IndexMission.module.scss";

type IndexMissionProps = {
  teamId: TeamId | null;
  // The team's Library progress (00B, 00C), which changes the Library card.
  libraryProgress: LibraryProgress;
  baseMapId: BaseMapId;
  mapView: MapView | null;
  completedMissions: ReadonlySet<MemoryMissionId>;
  completedSites: SiteId[];
  // Development controls exist only in development or the local preview, never for visitors.
  devTools: boolean;
  synagogueSimulated: boolean;
  onBaseMapChange: (id: BaseMapId) => void;
  onMapViewChange: (view: MapView) => void;
  onSimulateSynagogue: (done: boolean) => void;
  onBack: () => void;
  onStartLibrary: () => void;
};

// The investigation map screen. Owns which destination card is open and returns focus to
// whatever opened it when the card closes. The illustrated concept map is primary; the
// schematic is the fallback. The Library card starts the Library chapter.
export default function IndexMission(props: IndexMissionProps) {
  const { teamId, libraryProgress, baseMapId, mapView, completedMissions, completedSites, devTools, synagogueSimulated, onBaseMapChange, onMapViewChange, onSimulateSynagogue, onBack, onStartLibrary } = props;
  const [activeId, setActiveId] = useState<SiteId | null>(null);
  const [devVisible, setDevVisible] = useState(true);
  const opener = useRef<HTMLElement | null>(null);

  const open = useCallback((id: SiteId) => {
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setActiveId((current) => (current === id ? null : id));
  }, []);

  const close = useCallback(() => {
    setActiveId(null);
    opener.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (!activeId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeId, close]);

  return (
    <main className={styles.screen}>
      <div className={styles.inner}>
        <ScreenHeader
          onBack={onBack}
          step={4}
          total={4}
          aside={
            teamId ? (
              <span className={`${styles.team} ${teamId === "B" ? styles.teamB : ""}`}>
                <span className={styles.teamDot} aria-hidden="true" />
                {teams[teamId].name.text}
              </span>
            ) : null
          }
        />
        <div className={styles.titleRow}>
          <h1 className={styles.heading} tabIndex={-1} data-screen-heading>
            {mapScreen.heading.text}
          </h1>
        </div>
      </div>

      {devTools ? (
        <DevMapControls
          visible={devVisible}
          baseMapId={baseMapId}
          synagogueSimulated={synagogueSimulated}
          onToggleVisible={() => setDevVisible((v) => !v)}
          onBaseMapChange={onBaseMapChange}
          onSimulateSynagogue={onSimulateSynagogue}
        />
      ) : null}

      {/* If the artwork fails to load, ListMission's map reports it and the schematic takes over. */}
      <ListMission
        activeId={activeId}
        teamId={teamId}
        libraryProgress={libraryProgress}
        baseMapId={baseMapId}
        mapView={mapView}
        completedMissions={completedMissions}
        completedSites={completedSites}
        onMapViewChange={onMapViewChange}
        onImageError={() => onBaseMapChange("schematic")}
        onOpen={open}
        onClose={close}
        onAction={(id) => {
          if (id === "library") onStartLibrary();
        }}
      />

      <p className={styles.note}>
        {prototypeNote.text}
        <StatusTag status={prototypeNote.status} />
      </p>
    </main>
  );
}
