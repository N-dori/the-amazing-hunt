import assert from "node:assert/strict";
import { test } from "node:test";
import { isOpenable, mapMarkers, splitSiteName } from "./missionMap.ts";

test("at the start, the Library is next and every later stop is closed", () => {
  const markers = mapMarkers();
  assert.deepEqual(markers.map((m) => [m.id, m.state]), [
    ["library", "next"],
    ["pictureInStone", "conditional"],
    ["synagogue", "locked"],
    ["borekas", "locked"],
  ]);
  assert.deepEqual(markers.filter(isOpenable).map((m) => m.id), ["library"]);
});

test("completing a stop moves 'next' along the route", () => {
  const markers = mapMarkers(["library"]);
  assert.equal(markers[0].state, "complete");
  assert.equal(markers[1].state, "next");
});

test("marker positions are percentages inside the map", () => {
  for (const m of mapMarkers()) {
    assert.ok(m.xPct > 0 && m.xPct < 100, `${m.id} x`);
    assert.ok(m.yPct > 0 && m.yPct < 100, `${m.id} y`);
  }
});

test("a site name's Hebrew part is split out for right-to-left rendering", () => {
  assert.deepEqual(splitSiteName("Picture in Stone (תמונה באבן)"), { primary: "Picture in Stone", hebrew: "תמונה באבן" });
  assert.deepEqual(splitSiteName("Hesed VeRahamim synagogue"), { primary: "Hesed VeRahamim synagogue", hebrew: null });
});
