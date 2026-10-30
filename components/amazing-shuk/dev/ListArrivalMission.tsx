import { useMemo } from "react";
import LeafletBaseMap, { type MapView } from "@/components/map/LeafletBaseMap";
import { ILLUSTRATED_MARKET_MAP } from "@/lib/map/image-map";
import { buildMissionPresentation, finaleLocked, type MissionProgressStage, type MissionView } from "@/lib/amazing-shuk/mission-arrival";
import { findMission, SHUK_MISSIONS } from "@/lib/amazing-shuk/missions";
import PreviewArrivalMission from "./PreviewArrivalMission";
import PreviewMissionCard from "./PreviewMissionCard";
import styles from "./ListArrivalMission.module.scss";

const NO_MEMORY_LAYERS: [] = [];
// The preview sheet overlaps the map's lower edge by 1.5rem (ListArrivalMission.module.scss); the map keeps the selected pin above it.
const SHEET_OVERLAP = { bottomInset: 24 };
// The owner's wording (30 Oct 2026): one finger scrolls the page over the map, two fingers move it.
const TWO_FINGER_HINT_TEXT = "Use two fingers to move the map.";
const MAP_NOTICE = "Illustrated prototype: approximate marker and unverified street labels. Follow the clue and guide.";
const noop = () => {};
/** The first three stages of every mission: the map, a compact preview, then the location details. */
export type MissionStage = "map" | "preview" | "location";
// `progress`: where the selected mission stands (missionStage), for its preview card and location details.
type Props = { missions: readonly MissionView[]; mission: MissionView; stage: MissionStage; progress: MissionProgressStage; guide: boolean; busy: boolean; feedback: string;
  mapView: MapView | null; onMapViewChange: (view: MapView) => void;
  onSelect: (id: string) => void; onDismiss: () => void; onClosePreview: () => void; onViewLocation: () => void;
  onArrival: () => void; onConfirm: () => void; onOpenChallenge: () => void };
/** Pure shared-state projection: a marker per catalogue mission, and the selected mission's preview or details. The Index owns requests and GPS. */
export default function ListArrivalMission({ missions, mission, stage, progress, mapView, onMapViewChange, ...props }: Props) {
  const markers = useMemo(() => SHUK_MISSIONS.flatMap((definition, index) => {
    const state = missions.find(item => item.id === definition.id);
    return state ? [buildMissionPresentation(definition, state, index + 1, finaleLocked(definition, missions)).marker] : [];
  }), [missions]);
  const { id, state, arrivalPoints, arrivalMethod, gpsEnabled } = mission;
  const view = useMemo(() => {
    const definition = findMission(id);
    return definition ? buildMissionPresentation(definition, { id, state, arrivalPoints, arrivalMethod, gpsEnabled }, SHUK_MISSIONS.indexOf(definition) + 1,
      finaleLocked(definition, missions)) : null;
  }, [id, state, arrivalPoints, arrivalMethod, gpsEnabled, missions]);
  // The destination strip shows this mission's marker alone; the Map tab keeps every marker and its own saved view.
  const destination = useMemo(() => view ? [view.marker] : [], [view]);
  // A locked finale never opens its location: the map shows its preview, which says what opens it.
  if (stage === "location" && !view?.locked) {
    return view ? <PreviewArrivalMission view={view} stage={progress} guide={props.guide} busy={props.busy} feedback={props.feedback}
      map={<LeafletBaseMap baseMap={ILLUSTRATED_MARKET_MAP} touchSize={48} alt={`Illustrated market map with the marker for ${view.shortName}`}
        markers={destination} selectedId={view.id} focusId={view.id} memoryLayers={NO_MEMORY_LAYERS} attribution={null} notice={MAP_NOTICE}
        onSelect={noop} onBackground={noop} frameClassName={styles.strip} showLabels={false} twoFingerHint={TWO_FINGER_HINT_TEXT} />}
      onArrival={props.onArrival} onConfirm={props.onConfirm} onOpenChallenge={props.onOpenChallenge} /> : null;
  }
  // One stage between the header and the bottom bar: the map shrinks when the sheet opens, so neither needs the page to scroll.
  const sheet = stage === "preview" || (stage === "location" && view?.locked);
  return <div className={styles.stage}>
    <LeafletBaseMap baseMap={ILLUSTRATED_MARKET_MAP} touchSize={48} alt="Illustrated market map with mission markers"
      markers={markers} selectedId={sheet ? mission.id : null} memoryLayers={NO_MEMORY_LAYERS} attribution={null}
      notice={MAP_NOTICE}
      initialView={mapView} onViewChange={onMapViewChange} onSelect={props.onSelect} onBackground={props.onDismiss}
      frameClassName={styles.mapCard} keepSelectedVisible={SHEET_OVERLAP} showLabels={false} zoomOutBy={1} openOnMarkers
      twoFingerHint={TWO_FINGER_HINT_TEXT} />
    {sheet && view ? <PreviewMissionCard view={view} stage={progress} onViewLocation={props.onViewLocation} onClose={props.onClosePreview} /> : null}
  </div>;
}
