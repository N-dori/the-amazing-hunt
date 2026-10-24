// Base maps and map marker records, stored apart from any image. See
// docs/map/nahlaot-map-audit.md for the audit behind every value here.
//
// A marker record knows two independent things:
//   geo:        where the place is in the real world (lat/lon), with its source and whether
//               it has been verified in the field. External navigation uses only this.
//   placements: where the place is drawn on each base map, in that image's pixels, with
//               how the point was set and whether that placement has been checked.
// Replacing or regenerating an illustration means re-placing points on the new image; the
// real-world records stay the same.

import type { ClaimType, Copy } from "./types.ts";

const approved = (text: string): Copy => ({ text, status: "approved" });
const draft = (text: string): Copy => ({ text, status: "draft" });
const fixture = (text: string): Copy => ({ text, status: "fixture" });

// ---- Base maps ------------------------------------------------------------------------------

export type BaseMapId = "schematic" | "illustratedCandidate";

export type BaseMap = {
  id: BaseMapId;
  label: Copy;
  // Path under public/; the component adds the base path.
  src: string;
  width: number;
  height: number;
  // Shown on the map, so nobody mistakes the art for verified geography.
  notice: Copy;
};

export const baseMaps: Record<BaseMapId, BaseMap> = {
  illustratedCandidate: {
    id: "illustratedCandidate",
    label: draft("Illustrated (candidate)"),
    src: "/map/nahlaot-illustrated-candidate.jpg",
    width: 1586,
    height: 992,
    notice: fixture("Candidate artwork. Street labels in the image are unverified and partly wrong; do not use it for directions."),
  },
  schematic: {
    id: "schematic",
    label: draft("Schematic (current prototype)"),
    src: "/map/investigation-map-prototype.svg",
    width: 1600,
    height: 1100,
    notice: fixture("Prototype schematic. Not to scale and not geographically accurate."),
  },
};

// ---- Marker records --------------------------------------------------------------------------

export type GeoPoint = {
  lat: number;
  lon: number;
  source: "osm" | "field";
  // True only after a field check (position, public viewing point, GPS accuracy).
  verified: boolean;
};

export type Placement = {
  x: number;
  y: number;
  // manual: set by hand from the place's position relative to nearby streets.
  method: "manual" | "derived";
  verified: boolean;
  // Set when the place lies outside the artwork: the marker sits on that edge and says so.
  offMap?: "west";
};

// The first four match SiteId in types.ts, so player-map markers join site records by id.
export type MarkerId = "library" | "synagogue" | "pictureInStone" | "borekas" | "nahlaotFuture1";

export type MarkerRecord = {
  id: MarkerId;
  name: Copy;
  geo: GeoPoint | null;
  placements: Partial<Record<BaseMapId, Placement>>;
  // Why the marker is or isn't on the map, shown in the dev preview's list.
  fieldStatus: Copy;
  enabled: boolean;
};

export const markerRecords: MarkerRecord[] = [
  {
    id: "library",
    name: approved("National Library of Israel"),
    // The Library (Givat Ram) is west of the illustrated area. No geo point until the
    // briefing spot is chosen.
    geo: null,
    placements: {
      illustratedCandidate: { x: 46, y: 470, method: "manual", verified: false, offMap: "west" },
      schematic: { x: 260, y: 520, method: "manual", verified: false },
    },
    fieldStatus: fixture("Off the illustrated map, to the west. Briefing spot outside the Library not yet set."),
    enabled: true,
  },
  {
    id: "synagogue",
    name: approved("Hesed VeRahamim synagogue"),
    // OSM "Hessed Ve-Rahamim" (בית הכנסת חסד ורחמים), fetched 16 Oct 2026. Not field-verified.
    geo: { lat: 31.78357, lon: 35.21364, source: "osm", verified: false },
    placements: {
      // First block south of Agripas, just west of the Kiach junction: OSM puts the
      // synagogue about 22 m south of Agripas and 14 m west of Kiach.
      illustratedCandidate: { x: 712, y: 560, method: "manual", verified: false },
      // The existing prototype point (content.ts sites.synagogue.mapPoint).
      schematic: { x: 1060, y: 610, method: "manual", verified: false },
    },
    fieldStatus: fixture("Provisional: OpenStreetMap position, not yet checked in the field."),
    enabled: true,
  },
  {
    id: "pictureInStone",
    name: approved("Picture in Stone (תמונה באבן)"),
    geo: null,
    placements: {},
    fieldStatus: fixture("Not placed: the wall and image have not been field-verified."),
    enabled: true,
  },
  {
    id: "borekas",
    name: approved("Hakmat HaBorekas MeHaifa (חכמת הבורקס מחיפה)"),
    geo: null,
    placements: {},
    fieldStatus: fixture("Not placed: stall position, address and hours not confirmed."),
    enabled: true,
  },
  {
    id: "nahlaotFuture1",
    name: fixture("Future Nahlaot mission"),
    geo: null,
    placements: {},
    fieldStatus: fixture("Reserved slot for a later mission."),
    enabled: false,
  },
];

// ---- Pure helpers -----------------------------------------------------------------------------

export type PlacedMarker = { id: MarkerId; name: Copy; x: number; y: number; provisional: boolean; offMap: boolean };

// Only enabled records with a point on this base map are drawn.
export function placedMarkers(baseMapId: BaseMapId, records: readonly MarkerRecord[] = markerRecords): PlacedMarker[] {
  return records.flatMap((r) => {
    const p = r.enabled ? r.placements[baseMapId] : undefined;
    if (!p) return [];
    return [{ id: r.id, name: r.name, x: p.x, y: p.y, provisional: !p.verified || !r.geo?.verified, offMap: Boolean(p.offMap) }];
  });
}

export function unplacedMarkers(baseMapId: BaseMapId, records: readonly MarkerRecord[] = markerRecords): MarkerRecord[] {
  return records.filter((r) => !r.enabled || !r.placements[baseMapId]);
}

// Shared image geometry; deliberately unrelated to geographic positioning.
export { imageToLatLng } from "../map/image-map.ts";

// External walking navigation, always from real-world coordinates, never from image pixels.
export function externalNavLinks(geo: GeoPoint | null): { osm: string; google: string } | null {
  if (!geo) return null;
  const lat = geo.lat.toFixed(5);
  const lon = geo.lon.toFixed(5);
  return {
    osm: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=19/${lat}/${lon}`,
    google: `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`,
  };
}

// ---- Historical memory overlays --------------------------------------------------------------
// Revealed on the map after the mission at that place is completed. Wording is draft and
// follows content.ts's reconstruction options; the uncertainty note is shown with it.

// Missions whose completion can reveal a layer. synagogueReconstruction isn't built yet; the
// player prototype can only simulate it from the development controls.
export type MemoryMissionId = "firstKeepers" | "synagogueReconstruction";

export type MemoryOverlay = {
  id: string;
  markerId: MarkerId;
  unlockedBy: MemoryMissionId;
  // Radius in image pixels of the base map it is drawn on.
  radius: number;
  title: Copy;
  // The change or the recovered evidence, as a short before → after or a single line.
  before: Copy;
  after: Copy;
  uncertainty: Copy;
  claim: ClaimType;
  // An authentic photo of the evidence, when there is one (path under public/).
  image: { src: string; alt: Copy } | null;
  // Shown whenever the layer's placement or picture is not an authentic record of the place.
  illustrative: Copy | null;
};

export const memoryOverlays: MemoryOverlay[] = [
  {
    id: "firstKeepers1946",
    markerId: "library",
    unlockedBy: "firstKeepers",
    radius: 56,
    title: draft("Memory restored · 1946"),
    before: draft("Books confiscated by the Nazis"),
    after: draft("An operation to rescue them, led from this Library"),
    uncertainty: draft("From the Library's own timeline entry for 1946. Rescue, ownership and restitution remain separate questions."),
    claim: "historicalFact",
    image: { src: "/library/timeline-1946-entry.jpg", alt: draft("The 1946 entry of the Library's illustrated timeline.") },
    illustrative: fixture("Illustrative placement: the Library lies off this map, to the west. The photo shows the real timeline panel; reuse rights not yet confirmed."),
  },
  {
    id: "synagogueChange",
    markerId: "synagogue",
    unlockedBy: "synagogueReconstruction",
    radius: 44,
    title: draft("Memory restored"),
    before: draft("A tavern / drinking establishment"),
    after: draft("A synagogue"),
    uncertainty: draft("According to the family's archival narrative. Sources give different dates and accounts; the game shows the uncertainty rather than choosing one version."),
    claim: "attributedTradition",
    image: null,
    illustrative: fixture("Illustrative: no authentic image of the building's earlier use yet, and the map position is provisional."),
  },
];

export type VisibleMemoryLayer = { overlay: MemoryOverlay; x: number; y: number };

// Layers revealed by completed missions, positioned from this base map's placements.
export function visibleMemoryLayers(baseMapId: BaseMapId, completed: ReadonlySet<MemoryMissionId>, records: readonly MarkerRecord[] = markerRecords): VisibleMemoryLayer[] {
  return memoryOverlays.flatMap((overlay) => {
    if (!completed.has(overlay.unlockedBy)) return [];
    const p = records.find((r) => r.id === overlay.markerId)?.placements[baseMapId];
    return p ? [{ overlay, x: p.x, y: p.y }] : [];
  });
}

// ---- Dev preview copy ------------------------------------------------------------------------

export const mapPreview = {
  title: fixture("Map integration preview"),
  devBadge: fixture("Development only"),
  intro: fixture("Candidate illustrated base map with separate interactive layers. Not part of the player flow."),
  baseMapLabel: fixture("Base map"),
  steps: [
    fixture("Clean illustrated map (candidate: labels still baked in, see the audit)"),
    fixture("One active destination marker"),
    fixture("Destination preview with a photograph"),
    fixture("Historical layer revealed after completing the mission"),
  ],
  provisional: fixture("Provisional position"),
  photoPending: fixture("Destination photo pending: take it from the public viewing point during the field check."),
  navigate: draft("Walking directions"),
  navigateNote: fixture("Opens an external map at the OpenStreetMap position, which is not yet field-verified."),
  complete: fixture("Complete the mission (demo)"),
  reset: fixture("Reset demo"),
  completed: draft("Completed"),
  active: draft("Next"),
  close: draft("Close"),
  pendingHeading: fixture("Not on the map yet"),
  audit: fixture("Audit: docs/map/nahlaot-map-audit.md"),
  attribution: "Candidate positions © OpenStreetMap contributors",
};
