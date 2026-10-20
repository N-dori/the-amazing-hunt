import assert from "node:assert/strict";
import { test } from "node:test";
import { mapMarkers } from "./missionMap.ts";
import { memoryAtSite, positionMarkers } from "./playerMap.ts";

test("on the illustrated map, only placed stops get a marker; the rest wait in the list", () => {
  const { placed, unplaced } = positionMarkers(mapMarkers(), "illustratedCandidate");
  assert.deepEqual(placed.map((p) => [p.marker.id, p.marker.state, p.offMap]), [["library", "next", true], ["synagogue", "locked", false]]);
  assert.deepEqual(unplaced, ["pictureInStone", "borekas"]);
});

test("marker states come from progress, not from the base map", () => {
  const { placed } = positionMarkers(mapMarkers(["synagogue"]), "illustratedCandidate");
  assert.equal(placed.find((p) => p.marker.id === "synagogue")?.marker.state, "complete");
});

test("Mission 00B reveals the Library's memory layer, and nothing at the synagogue", () => {
  assert.equal(memoryAtSite("library", "illustratedCandidate", new Set()), null);
  assert.equal(memoryAtSite("library", "illustratedCandidate", new Set(["firstKeepers"]))?.overlay.id, "firstKeepers1946");
  assert.equal(memoryAtSite("synagogue", "illustratedCandidate", new Set(["firstKeepers"])), null);
});
