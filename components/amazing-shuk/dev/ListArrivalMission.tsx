import { useMemo } from "react";
import LeafletBaseMap from "@/components/map/LeafletBaseMap";
import { ILLUSTRATED_MARKET_MAP } from "@/lib/map/image-map";
import { buildMissionPresentation, type MissionView } from "@/lib/amazing-shuk/mission-arrival";
import { findMission, SHUK_MISSIONS } from "@/lib/amazing-shuk/missions";
import PreviewArrivalMission from "./PreviewArrivalMission";

const NO_MEMORY_LAYERS: [] = [];
type Props = { missions: readonly MissionView[]; mission: MissionView; selected: boolean; guide: boolean; busy: boolean; feedback: string;
  onSelect: (id: string) => void; onDismiss: () => void; onArrival: () => void; onConfirm: () => void };
/** Pure shared-state projection: a marker per catalogue mission, and the preview for `mission`. The Index owns requests and GPS. */
export default function ListArrivalMission({ missions, mission, ...props }: Props) {
  const markers = useMemo(() => SHUK_MISSIONS.flatMap((definition, index) => {
    const state = missions.find(item => item.id === definition.id);
    return state ? [buildMissionPresentation(definition, state, index + 1).marker] : [];
  }), [missions]);
  const { id, state, arrivalPoints, arrivalMethod, gpsEnabled } = mission;
  const view = useMemo(() => {
    const definition = findMission(id);
    return definition ? buildMissionPresentation(definition, { id, state, arrivalPoints, arrivalMethod, gpsEnabled }, SHUK_MISSIONS.indexOf(definition) + 1) : null;
  }, [id, state, arrivalPoints, arrivalMethod, gpsEnabled]);
  return <>
    <LeafletBaseMap baseMap={ILLUSTRATED_MARKET_MAP} touchSize={48} alt="Illustrated market map with mission markers"
      markers={markers} selectedId={props.selected ? mission.id : null} memoryLayers={NO_MEMORY_LAYERS} attribution={null}
      notice="Illustrated prototype: approximate marker and unverified street labels. Follow the clue and guide."
      onSelect={props.onSelect} onBackground={props.onDismiss} />
    {view ? <PreviewArrivalMission {...props} view={view} onSelect={() => props.onSelect(id)} /> : null}
  </>;
}
