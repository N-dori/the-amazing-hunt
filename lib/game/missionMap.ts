// View models for the illustrated investigation map: which marker is next, which are locked
// and where each sits on the map image. Pure functions over content.ts; no React here.

import { MAP_SIZE, ROUTE, sites } from "./content.ts";
import type { Copy, SiteId } from "./types.ts";

export type MarkerState = "next" | "locked" | "conditional" | "complete";

export type MapMarker = {
  id: SiteId;
  order: number; // 1-based position on the route
  name: Copy;
  state: MarkerState;
  // Position as a percentage of the map image, so markers scale with it.
  xPct: number;
  yPct: number;
};

// Sites a team may skip without penalty while their target is unverified [spec 7].
const CONDITIONAL: ReadonlySet<SiteId> = new Set<SiteId>(["pictureInStone"]);

const round = (n: number) => Math.round(n * 100) / 100;

// The first route site not yet completed is "next"; later ones are locked (or conditional,
// when the stop is optional and still locked).
export function mapMarkers(completed: readonly SiteId[] = []): MapMarker[] {
  const done = new Set(completed);
  const nextId = ROUTE.find((id) => !done.has(id)) ?? null;

  return ROUTE.map((id, i) => {
    const site = sites[id];
    let state: MarkerState;
    if (done.has(id)) state = "complete";
    else if (id === nextId) state = "next";
    else if (CONDITIONAL.has(id)) state = "conditional";
    else state = "locked";

    return {
      id,
      order: i + 1,
      name: site.name,
      state,
      xPct: round((site.mapPoint.x / MAP_SIZE.width) * 100),
      yPct: round((site.mapPoint.y / MAP_SIZE.height) * 100),
    };
  });
}

// "Picture in Stone (תמונה באבן)" → the English name and the Hebrew in brackets, so the
// Hebrew can be rendered in its own right-to-left span.
export function splitSiteName(name: string): { primary: string; hebrew: string | null } {
  const match = /^(.*?)\s*\(([^)]*[\u0590-\u05FF][^)]*)\)\s*$/.exec(name);
  return match ? { primary: match[1], hebrew: match[2] } : { primary: name, hebrew: null };
}

export function isOpenable(marker: MapMarker): boolean {
  return marker.state === "next" || marker.state === "complete";
}
