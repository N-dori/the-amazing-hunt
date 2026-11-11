/**
 * The OSM map's base layer as SVG layers: the paint order and the stroke widths, in map units. Pure; used by
 * components/map/LeafletOsmMap.tsx. Mirrors the review previews in scripts/map/build-shuk-map.mjs (previewSvg).
 *
 * Map units are artboard units; at Leaflet CRS.Simple zoom z one unit is 2^z screen pixels. Road bands keep their drawn
 * width in map units (they grow with the zoom like the real street); only the casing's hairline is a fixed pixel width.
 */
import type { OsmMapGeometry, OsmMapRoad } from "./osm-projection.ts";

/** The casing's hairline on each side together, in screen pixels, and the narrowest band drawn, in screen pixels. */
export const CASING_PX = 1.2;
export const MIN_ROAD_PX = 1.5;

export type OsmSvgLayer =
  | Readonly<{ kind: "fill"; style: "green" | "square" | "market" | "worship" | "buildings" | "buildingsMargin"; d: string }>
  | Readonly<{ kind: "road"; style: "casing" | "fill"; margin: boolean; road: number; d: string }>;

/** The layers in paint order: areas, buildings, places of worship, then the roads (the margin's first, faded). */
export function svgLayers(map: Pick<OsmMapGeometry, "areas" | "buildings" | "roads">): OsmSvgLayer[] {
  const roadsOf = (margin: boolean): OsmSvgLayer[] => (["casing", "fill"] as const).flatMap((style) =>
    map.roads.map((r, road) => ({ kind: "road" as const, style, margin, road, d: margin ? r.outside : r.inside })).filter((l) => l.d));
  const fills: OsmSvgLayer[] = [
    { kind: "fill", style: "green", d: map.areas.green },
    { kind: "fill", style: "square", d: map.areas.square },
    { kind: "fill", style: "market", d: map.areas.market },
    { kind: "fill", style: "buildings", d: map.buildings.inside },
    { kind: "fill", style: "buildingsMargin", d: map.buildings.outside },
    { kind: "fill", style: "worship", d: map.areas.worship },
  ];
  return [...fills.filter((l) => l.d), ...roadsOf(true), ...roadsOf(false)];
}

/** A road band's stroke width in map units at a zoom: its drawn width, never thinner than MIN_ROAD_PX on screen. */
export function roadWidth(road: Pick<OsmMapRoad, "drawM">, unitsPerMetre: number, zoom: number): number {
  return Math.max(road.drawM * unitsPerMetre, MIN_ROAD_PX / 2 ** zoom);
}

/** The casing under a band: the band plus CASING_PX on screen. */
export function casingWidth(road: Pick<OsmMapRoad, "drawM">, unitsPerMetre: number, zoom: number): number {
  return roadWidth(road, unitsPerMetre, zoom) + CASING_PX / 2 ** zoom;
}
