import { useMemo } from "react";
import { Icon } from "@/components/icons";
import LeafletBaseMap, { type MapMarkerState, type MapMarkerView, type MapView, type MemoryLayerView } from "@/components/map/LeafletBaseMap";
import { baseMaps, mapPreview, visibleMemoryLayers, type BaseMapId, type MemoryMissionId } from "@/lib/game/basemaps";
import { MAP_SIZE, sites } from "@/lib/game/content";
import { libraryCard, type LibraryProgress } from "@/lib/game/library";
import { isOpenable, mapMarkers, splitSiteName, type MapMarker, type MarkerState } from "@/lib/game/missionMap";
import { memoryAtSite, positionMarkers } from "@/lib/game/playerMap";
import { destinationPhotos, destinations, mapAreas, mapScreen } from "@/lib/game/screens";
import type { Copy, SiteId, TeamId } from "@/lib/game/types";
import MissionMap, { type AreaView, type MarkerView } from "./MissionMap";
import PreviewMission, { type DestinationMemory, type DestinationView } from "./PreviewMission";
import styles from "./ListMission.module.scss";

type ListMissionProps = {
  activeId: SiteId | null;
  teamId: TeamId | null;
  libraryProgress: LibraryProgress;
  baseMapId: BaseMapId;
  mapView: MapView | null;
  completedMissions: ReadonlySet<MemoryMissionId>;
  // Route stops counted as done (only simulated in this prototype).
  completedSites: SiteId[];
  onMapViewChange: (view: MapView) => void;
  onImageError: () => void;
  onOpen: (id: SiteId) => void;
  onClose: () => void;
  onAction: (id: SiteId) => void;
};

const LEAFLET_STATES: Record<MarkerState, MapMarkerState> = { next: "active", locked: "locked", conditional: "conditional", complete: "completed" };

const STATE_LABELS: Record<MarkerState, Copy> = {
  next: mapScreen.nextLabel,
  locked: mapScreen.lockedLabel,
  conditional: mapScreen.conditionalLabel,
  complete: mapScreen.completeLabel,
};

function markerView(marker: MapMarker, activeId: SiteId | null): MarkerView {
  return {
    id: marker.id,
    order: marker.order,
    shortName: splitSiteName(marker.name.text).primary,
    state: marker.state,
    stateLabel: STATE_LABELS[marker.state].text,
    xPct: marker.xPct,
    yPct: marker.yPct,
    active: marker.id === activeId,
  };
}

type DestinationContext = {
  teamId: TeamId | null;
  libraryProgress: LibraryProgress;
  baseMapId: BaseMapId;
  unplaced: ReadonlySet<SiteId>;
  completedMissions: ReadonlySet<MemoryMissionId>;
};

function memoryView(marker: MapMarker, ctx: DestinationContext): DestinationMemory | null {
  const layer = memoryAtSite(marker.id, ctx.baseMapId, ctx.completedMissions);
  if (!layer) return null;
  const o = layer.overlay;
  return {
    title: o.title.text,
    before: o.before.text,
    after: o.after.text,
    note: o.uncertainty.text,
    claim: o.claim,
    image: o.image ? { src: o.image.src, alt: o.image.alt.text } : null,
    illustrative: o.illustrative,
  };
}

function destinationView(marker: MapMarker, ctx: DestinationContext): DestinationView {
  const libraryStarted = ctx.libraryProgress.timelineSolved;
  const library = marker.id === "library" ? libraryCard(ctx.libraryProgress, ctx.teamId) : null;
  const copy = destinations[marker.id];
  const photo = destinationPhotos[marker.id];
  const { primary, hebrew } = splitSiteName(marker.name.text);
  const open = isOpenable(marker);
  return {
    id: marker.id,
    order: marker.order,
    name: primary,
    hebrew,
    state: marker.state,
    stateLabel: STATE_LABELS[marker.state].text,
    kicker: copy.kicker.text,
    summary: copy.summary.text,
    // The clue is only shown for an open stop, so later routes aren't spoiled.
    clue: open ? sites[marker.id].clue : null,
    lockedReason: open ? null : copy.lockedReason?.text ?? null,
    action: !open ? null : marker.id === "library" && libraryStarted ? mapScreen.continueAction.text : copy.action?.text ?? null,
    missionTitle: library?.missionTitle ?? null,
    statusNote: library?.statusNote ?? null,
    locationNote: ctx.unplaced.has(marker.id) ? mapScreen.locationPending.text : null,
    photo: photo ? { src: photo.src, alt: photo.alt.text, caption: photo.caption } : null,
    memory: memoryView(marker, ctx),
  };
}

const areaViews: AreaView[] = mapAreas.map((a) => ({
  id: a.id,
  name: a.name.text,
  xPct: (a.x / MAP_SIZE.width) * 100,
  yPct: (a.y / MAP_SIZE.height) * 100,
}));

// Prepares markers, the open destination and the stop list, then lays them out: the map
// with its card, and the stop list as the text alternative and the obvious next action.
export default function ListMission(props: ListMissionProps) {
  const { activeId, teamId, libraryProgress, baseMapId, mapView, completedMissions, completedSites, onMapViewChange, onImageError, onOpen, onClose, onAction } = props;
  // Memoised so map panning (which updates the saved view upstream) never rebuilds the layers.
  const markers = useMemo(() => mapMarkers(completedSites), [completedSites]);
  const active = markers.find((m) => m.id === activeId) ?? null;
  const next = markers.find((m) => m.state === "next") ?? null;
  const illustrated = baseMapId === "illustratedCandidate";
  const { placed, unplaced } = useMemo(() => positionMarkers(markers, baseMapId), [markers, baseMapId]);
  const ctx: DestinationContext = { teamId, libraryProgress, baseMapId, unplaced: new Set(illustrated ? unplaced : []), completedMissions };

  const leafletMarkers = useMemo<MapMarkerView[]>(() => placed.map((p) => {
    const shortName = splitSiteName(p.marker.name.text).primary;
    return {
      id: p.marker.id,
      label: shortName,
      order: p.marker.order,
      x: p.x,
      y: p.y,
      state: LEAFLET_STATES[p.marker.state],
      provisional: p.provisional,
      offMap: p.offMap,
      ariaLabel: `${p.marker.order}. ${shortName}: ${STATE_LABELS[p.marker.state].text}`,
    };
  }), [placed]);
  const memoryLayers = useMemo<MemoryLayerView[]>(() => visibleMemoryLayers(baseMapId, completedMissions).map((l) => ({
    id: l.overlay.id,
    x: l.x,
    y: l.y,
    radius: l.overlay.radius,
    label: l.overlay.title.text,
    alignStart: l.x < 160,
  })), [baseMapId, completedMissions]);

  return (
    <div className={styles.layout}>
      <section className={styles.mapColumn}>
        {illustrated ? (
          <LeafletBaseMap
            baseMap={baseMaps.illustratedCandidate}
            alt={mapScreen.mapAlt.text}
            markers={leafletMarkers}
            selectedId={activeId}
            memoryLayers={memoryLayers}
            attribution={mapPreview.attribution}
            notice={mapScreen.conceptNotice.text}
            focusId={next?.id ?? null}
            initialView={mapView}
            onViewChange={onMapViewChange}
            onImageError={onImageError}
            onSelect={(id) => onOpen(id as SiteId)}
            onBackground={onClose}
          />
        ) : (
          <MissionMap
            markers={markers.map((m) => markerView(m, activeId))}
            areas={areaViews}
            focusId={next?.id ?? null}
            alt={mapScreen.mapAlt.text}
            onOpen={onOpen}
            onBackgroundClick={onClose}
          />
        )}
        <p className={styles.disclaimer}>
          <Icon name="info" className={styles.disclaimerIcon} />
          {illustrated ? baseMaps.illustratedCandidate.notice.text : mapScreen.disclaimer.text}
        </p>
      </section>

      <aside className={styles.aside}>
        {active ? (
          <PreviewMission key={active.id} destination={destinationView(active, ctx)} onClose={onClose} onAction={() => onAction(active.id)} />
        ) : null}

        <h2 className={styles.legendHeading}>{mapScreen.legendHeading.text}</h2>
        <ol className={styles.legend}>
          {markers.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                className={`${styles.stop} ${styles[m.state]} ${m.id === activeId ? styles.stopActive : ""}`}
                aria-pressed={m.id === activeId}
                onClick={() => onOpen(m.id)}
              >
                <span className={styles.stopOrder}>{String(m.order).padStart(2, "0")}</span>
                <span className={styles.stopName}>{splitSiteName(m.name.text).primary}</span>
                <span className={styles.stopState}>
                  {m.state === "next" ? null : <Icon name={m.state === "complete" ? "check" : "locked"} className={styles.stopIcon} />}
                  {STATE_LABELS[m.state].text}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </aside>

      {next && !active ? (
        <div className={styles.nextBar}>
          <div className={styles.nextInner}>
            <p className={styles.nextText}>
              <span className={styles.nextLabel}>{mapScreen.nextLabel.text}</span>
              <span className={styles.nextName}>{splitSiteName(next.name.text).primary}</span>
            </p>
            <button type="button" className={styles.nextButton} onClick={() => onOpen(next.id)}>
              {mapScreen.view.text}
              <Icon name="arrowForward" className={styles.nextIcon} />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
