import assert from "node:assert/strict";
import { test } from "node:test";
import { baseMaps, externalNavLinks, imageToLatLng, markerRecords, placedMarkers, unplacedMarkers, visibleMemoryLayers, type MarkerRecord } from "./basemaps.ts";

test("only placed, enabled records appear on a base map", () => {
  assert.deepEqual(placedMarkers("illustratedCandidate").map((m) => m.id), ["library", "synagogue"]);
  assert.deepEqual(unplacedMarkers("illustratedCandidate").map((m) => m.id), ["pictureInStone", "borekas", "nahlaotFuture1"]);
});

test("nothing unverified is presented as final", () => {
  for (const m of placedMarkers("illustratedCandidate")) assert.equal(m.provisional, true, m.id);
  const verified: MarkerRecord = {
    ...markerRecords[0],
    geo: { lat: 31.78357, lon: 35.21364, source: "field", verified: true },
    placements: { illustratedCandidate: { x: 1, y: 2, method: "manual", verified: true } },
  };
  assert.equal(placedMarkers("illustratedCandidate", [verified])[0].provisional, false);
});

test("placements lie inside their image", () => {
  for (const r of markerRecords) {
    for (const [id, p] of Object.entries(r.placements)) {
      const map = baseMaps[id as keyof typeof baseMaps];
      assert.ok(p && p.x >= 0 && p.x <= map.width && p.y >= 0 && p.y <= map.height, `${r.id} on ${id}`);
    }
  }
});

test("image pixels map to CRS.Simple with y counted from the bottom", () => {
  assert.deepEqual(imageToLatLng({ height: 992 }, 712, 560), [432, 712]);
});

test("external navigation comes from real coordinates, or not at all", () => {
  assert.equal(externalNavLinks(null), null);
  const links = externalNavLinks({ lat: 31.78357, lon: 35.21364, source: "osm", verified: false });
  assert.ok(links?.osm.includes("mlat=31.78357&mlon=35.21364"));
  assert.ok(links?.google.endsWith("query=31.78357,35.21364"));
});

test("the Library sits on the west edge of the illustration, flagged as off-map", () => {
  const lib = placedMarkers("illustratedCandidate").find((m) => m.id === "library");
  assert.equal(lib?.offMap, true);
  assert.equal(placedMarkers("schematic").find((m) => m.id === "library")?.offMap, false);
});

test("memory layers appear only after the mission that unlocks them", () => {
  assert.deepEqual(visibleMemoryLayers("illustratedCandidate", new Set()), []);
  const after00B = visibleMemoryLayers("illustratedCandidate", new Set(["firstKeepers"]));
  assert.deepEqual(after00B.map((l) => l.overlay.id), ["firstKeepers1946"]);
  assert.ok(after00B[0].overlay.illustrative, "an off-map placement is marked illustrative");
  const both = visibleMemoryLayers("schematic", new Set(["firstKeepers", "synagogueReconstruction"]));
  assert.deepEqual(both.map((l) => [l.overlay.id, l.x, l.y]), [["firstKeepers1946", 260, 520], ["synagogueChange", 1060, 610]]);
});
