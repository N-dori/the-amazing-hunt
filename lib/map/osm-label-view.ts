/**
 * Which of the OSM map's labels (data/shuk-map-nahlaot-<frame>.labels-<lang>.json) show at a zoom, and how each one is
 * placed on screen. Pure; used by components/map/LeafletOsmMap.tsx. Rules: docs/map/nahlaot-osm-map.md.
 */
import type { OsmMapLabel } from "./osm-projection.ts";

/** The label step nearest to a Leaflet zoom (labels were laid out at these steps only). */
export function snapZoom(zoom: number, zooms: ReadonlyArray<number>): number {
  if (!zooms.length) throw new Error("snapZoom needs at least one zoom step");
  return zooms.reduce((best, z) => (Math.abs(z - zoom) < Math.abs(best - zoom) ? z : best));
}

/** The labels shown at one label step: from `minZoom`, up to `maxZoom` if set. */
export function labelsAt(labels: ReadonlyArray<OsmMapLabel>, step: number): OsmMapLabel[] {
  return labels.filter((l) => l.minZoom <= step && (l.maxZoom ?? Infinity) >= step);
}

/** The CSS transform that centres a label on its point and turns it to its angle. */
export function labelTransform(label: Pick<OsmMapLabel, "angle">): string {
  return label.angle ? `translate(-50%, -50%) rotate(${label.angle}deg)` : "translate(-50%, -50%)";
}

/** The style a label is drawn in: its kind, and for a main road's zoomed-out label whether it sits beside the road. */
export type OsmLabelStyle = "main" | "mainBrief" | "mainBeside" | "alley" | "place" | "neighbourhood" | "courtyard" | "poi" | "poiName";

export function labelStyle(label: Pick<OsmMapLabel, "kind" | "beside">): OsmLabelStyle {
  return label.kind === "mainBrief" && label.beside ? "mainBeside" : label.kind;
}
