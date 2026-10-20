// Joins the route's marker states (missionMap.ts) with a base map's placement records
// (basemaps.ts) for the player's Investigation Map. Pure; the image is never consulted.

import { placedMarkers, visibleMemoryLayers, type BaseMapId, type MemoryMissionId, type VisibleMemoryLayer } from "./basemaps.ts";
import type { MapMarker } from "./missionMap.ts";
import type { SiteId } from "./types.ts";

export type PositionedMarker = { marker: MapMarker; x: number; y: number; provisional: boolean; offMap: boolean };

// Route stops with a point on this base map are drawn; the rest stay in the stop list only.
export function positionMarkers(markers: readonly MapMarker[], baseMapId: BaseMapId): { placed: PositionedMarker[]; unplaced: SiteId[] } {
  const points = new Map(placedMarkers(baseMapId).map((p) => [p.id as string, p]));
  const placed: PositionedMarker[] = [];
  const unplaced: SiteId[] = [];
  for (const marker of markers) {
    const p = points.get(marker.id);
    if (p) placed.push({ marker, x: p.x, y: p.y, provisional: p.provisional, offMap: p.offMap });
    else unplaced.push(marker.id);
  }
  return { placed, unplaced };
}

// The memory layer a completed mission revealed at this stop, if any.
export function memoryAtSite(siteId: SiteId, baseMapId: BaseMapId, completed: ReadonlySet<MemoryMissionId>): VisibleMemoryLayer | null {
  return visibleMemoryLayers(baseMapId, completed).find((l) => l.overlay.markerId === siteId) ?? null;
}
