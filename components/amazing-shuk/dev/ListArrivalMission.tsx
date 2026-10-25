import { useMemo } from "react";
import LeafletBaseMap, { type MapView } from "@/components/map/LeafletBaseMap";
import { ILLUSTRATED_MARKET_MAP } from "@/lib/map/image-map";
import { buildMissionPresentation, type MissionView } from "@/lib/amazing-shuk/mission-arrival";
import { findMission, SHUK_MISSIONS } from "@/lib/amazing-shuk/missions";
import PreviewArrivalMission from "./PreviewArrivalMission";
import PreviewMissionCard from "./PreviewMissionCard";
import styles from "./ListArrivalMission.module.scss";

const NO_MEMORY_LAYERS: [] = [];
// The preview sheet overlaps the map's lower edge by 1.5rem (ListArrivalMission.module.scss); the map keeps the selected pin above it.
const SHEET_OVERLAP = { bottomInset: 24 };
/** The first three stages of every mission: the map, a compact preview, then the location details. */
export type MissionStage = "map" | "preview" | "location";
type Props = { missions: readonly MissionView[]; mission: MissionView; stage: MissionStage; guide: boolean; busy: boolean; feedback: string;
  mapView: MapView | null; onMapViewChange: (view: MapView) => void;
  onSelect: (id: string) => void; onDismiss: () => void; onClosePreview: () => void; onViewLocation: () => void;
  onArrival: () => void; onConfirm: () => void; onOpenChallenge: () => void };
/** Pure shared-state projection: a marker per catalogue mission, and the selected mission's preview or details. The Index owns requests and GPS. */
export default function ListArrivalMission({ missions, mission, stage, mapView, onMapViewChange, ...props }: Props) {
  const markers = useMemo(() => SHUK_MISSIONS.flatMap((definition, index) => {
    const state = missions.find(item => item.id === definition.id);
    return state ? [buildMissionPresentation(definition, state, index + 1).marker] : [];
  }), [missions]);
  const { id, state, arrivalPoints, arrivalMethod, gpsEnabled } = mission;
  const view = useMemo(() => {
    const definition = findMission(id);
    return definition ? buildMissionPresentation(definition, { id, state, arrivalPoints, arrivalMethod, gpsEnabled }, SHUK_MISSIONS.indexOf(definition) + 1) : null;
  }, [id, state, arrivalPoints, arrivalMethod, gpsEnabled]);
  if (stage === "location") {
    return view ? <PreviewArrivalMission view={view} guide={props.guide} busy={props.busy} feedback={props.feedback}
      onArrival={props.onArrival} onConfirm={props.onConfirm} onOpenChallenge={props.onOpenChallenge} onBack={props.onDismiss} /> : null;
  }
  // One stage between the header and the bottom bar: the map shrinks when the sheet opens, so neither needs the page to scroll.
  return <div className={styles.stage}>
    <LeafletBaseMap baseMap={ILLUSTRATED_MARKET_MAP} touchSize={48} alt="Illustrated market map with mission markers"
      markers={markers} selectedId={stage === "preview" ? mission.id : null} memoryLayers={NO_MEMORY_LAYERS} attribution={null}
      notice="Illustrated prototype: approximate marker and unverified street labels. Follow the clue and guide."
      initialView={mapView} onViewChange={onMapViewChange} onSelect={props.onSelect} onBackground={props.onDismiss}
      frameClassName={styles.mapCard} keepSelectedVisible={SHEET_OVERLAP} />
    {stage === "preview" && view ? <PreviewMissionCard view={view} onViewLocation={props.onViewLocation} onClose={props.onClosePreview} /> : null}
  </div>;
}
