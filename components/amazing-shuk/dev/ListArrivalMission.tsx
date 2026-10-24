import { useMemo } from "react";
import LeafletBaseMap from "@/components/map/LeafletBaseMap";
import { ILLUSTRATED_MARKET_MAP } from "@/lib/map/image-map";
import { buildMissionPresentation, type MissionView } from "@/lib/amazing-shuk/mission-arrival";
import PreviewArrivalMission from "./PreviewArrivalMission";

const NO_MEMORY_LAYERS: [] = [];
type Props = { mission: MissionView; selected: boolean; guide: boolean; busy: boolean; feedback: string;
  onSelect: () => void; onDismiss: () => void; onArrival: () => void; onConfirm: () => void };
/** Pure shared-state projection; the Index owns requests and GPS. */
export default function ListArrivalMission({ mission, ...props }: Props) {
  const { id, state, arrivalPoints, arrivalMethod, gpsEnabled } = mission;
  const view = useMemo(() => buildMissionPresentation({ id, state, arrivalPoints, arrivalMethod, gpsEnabled }), [id, state, arrivalPoints, arrivalMethod, gpsEnabled]);
  const markers = useMemo(() => [view.marker], [view]);
  return <>
    <LeafletBaseMap baseMap={ILLUSTRATED_MARKET_MAP} touchSize={48} alt="Illustrated market map with Gan HaTut mission"
      markers={markers} selectedId={props.selected ? mission.id : null} memoryLayers={NO_MEMORY_LAYERS} attribution={null}
      notice="Illustrated prototype: approximate marker and unverified street labels. Follow the clue and guide."
      onSelect={props.onSelect} onBackground={props.onDismiss} />
    <PreviewArrivalMission {...props} view={view} />
  </>;
}
