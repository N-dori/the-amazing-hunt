import ActionButton from "@/components/ui/ActionButton";
import { useMemo } from "react";
import LeafletBaseMap, { type MapView } from "@/components/map/LeafletBaseMap";
import { ILLUSTRATED_MARKET_MAP } from "@/lib/map/image-map";
import { buildMissionPresentation, type MissionView } from "@/lib/amazing-shuk/mission-arrival";
import { findMission, SHUK_MISSIONS } from "@/lib/amazing-shuk/missions";
import PreviewArrivalMission from "./PreviewArrivalMission";
import PreviewMissionCard from "./PreviewMissionCard";

const NO_MEMORY_LAYERS: [] = [];
/** The first three stages of every mission: the map, a compact preview, then the location details. */
export type MissionStage = "map" | "preview" | "location";
type Props = { missions: readonly MissionView[]; mission: MissionView; stage: MissionStage; busy: boolean; feedback: string;
  mapView: MapView | null; onMapViewChange: (view: MapView) => void;
  onSelect: (id: string) => void; onDismiss: () => void; onClosePreview: () => void; onViewLocation: () => void;
  onArrival: () => void; onOpenChallenge: () => void };
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
    return view ? <PreviewArrivalMission view={view} busy={props.busy} feedback={props.feedback}
      onArrival={props.onArrival} onOpenChallenge={props.onOpenChallenge} onBack={props.onDismiss} /> : null;
  }
  return <>
    <LeafletBaseMap baseMap={ILLUSTRATED_MARKET_MAP} touchSize={48} alt="Illustrated market map with mission markers"
      markers={markers.filter(marker => !marker.offMap)} selectedId={stage === "preview" ? mission.id : null} memoryLayers={NO_MEMORY_LAYERS} attribution={null}
      notice="Illustrated prototype: approximate marker and unverified street labels. Follow the clue and guide."
      initialView={mapView} onViewChange={onMapViewChange} onSelect={props.onSelect} onBackground={props.onDismiss} />
    {markers.filter(marker => marker.offMap).map(marker => <div key={marker.id}>
      <p>Map position awaiting owner review</p>
      <ActionButton variant="quiet" onClick={() => props.onSelect(marker.id)}>{marker.label}</ActionButton>
    </div>)}
    {stage === "preview" && view ? <PreviewMissionCard view={view} onViewLocation={props.onViewLocation} onClose={props.onClosePreview} /> : null}
  </>;
}
