// The OSM map's view helpers (osm-label-view.ts, osm-svg.ts), checked against the generated data files.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { labelsAt, labelStyle, labelTransform, snapZoom } from "./osm-label-view.ts";
import type { OsmMapGeometry, OsmMapLabelFile } from "./osm-projection.ts";
import { casingWidth, CASING_PX, MIN_ROAD_PX, roadWidth, svgLayers } from "./osm-svg.ts";

const json = <T,>(name: string) => JSON.parse(readFileSync(new URL(`../../data/${name}`, import.meta.url), "utf8")) as T;
const small = json<OsmMapGeometry>("shuk-map-nahlaot-small.json");
const smallEn = json<OsmMapLabelFile>("shuk-map-nahlaot-small.labels-en.json");
const ZOOMS = smallEn.meta.zooms;

test("snapZoom lands on the nearest label step, and holds the range's ends", () => {
  assert.equal(snapZoom(0.4, ZOOMS), 0.5);
  assert.equal(snapZoom(-0.1, ZOOMS), 0);
  assert.equal(snapZoom(-3, ZOOMS), -1.5);
  assert.equal(snapZoom(4, ZOOMS), 2.5);
  for (const z of ZOOMS) assert.equal(snapZoom(z, ZOOMS), z);
  assert.throws(() => snapZoom(0, []));
});

test("labelsAt shows each label from its minZoom to its maxZoom, and brief labels at one step only", () => {
  for (const step of ZOOMS) {
    const shown = labelsAt(smallEn.labels, step);
    assert.ok(shown.every((l) => l.minZoom <= step && (l.maxZoom ?? Infinity) >= step));
    assert.ok(shown.filter((l) => l.kind === "mainBrief").every((l) => l.minZoom === step));
  }
  // More is named as the map zooms in, and street level shows the most.
  const counts = ZOOMS.map((z) => labelsAt(smallEn.labels, z).length);
  assert.equal(Math.max(...counts), counts.at(-1));
  assert.ok(counts[0] < counts.at(-1)!);
});

test("labelTransform centres the label and turns it to its angle", () => {
  assert.equal(labelTransform({ angle: 0 }), "translate(-50%, -50%)");
  assert.equal(labelTransform({ angle: -32 }), "translate(-50%, -50%) rotate(-32deg)");
});

test("labelStyle tells a main road's label beside the road from one inside it", () => {
  assert.equal(labelStyle({ kind: "mainBrief", beside: true }), "mainBeside");
  assert.equal(labelStyle({ kind: "mainBrief" }), "mainBrief");
  assert.equal(labelStyle({ kind: "alley" }), "alley");
  assert.ok(smallEn.labels.some((l) => labelStyle(l) === "mainBeside"));
});

test("svgLayers paints areas and buildings first, then the margin's roads, then the frame's, casing under fill", () => {
  const layers = svgLayers(small);
  const firstRoad = layers.findIndex((l) => l.kind === "road");
  assert.ok(firstRoad > 0 && layers.slice(firstRoad).every((l) => l.kind === "road"));
  const roads = layers.filter((l) => l.kind === "road");
  const lastMargin = roads.findLastIndex((l) => l.margin), firstInside = roads.findIndex((l) => !l.margin);
  assert.ok(lastMargin < firstInside);
  for (const margin of [true, false]) {
    const group = roads.filter((l) => l.margin === margin);
    assert.ok(group.findLastIndex((l) => l.style === "casing") < group.findIndex((l) => l.style === "fill"));
  }
  assert.ok(layers.every((l) => l.d.length > 0));
});

test("road bands use the drawn width; the casing adds a hairline that stays the same on screen", () => {
  const upm = small.projection.unitsPerMetre;
  const main = small.roads.find((r) => r.class === "main")!;
  assert.ok(main.drawM > main.widthM, "main roads are drawn wider than real");
  for (const z of ZOOMS) {
    const s = 2 ** z;
    assert.ok(roadWidth(main, upm, z) >= main.drawM * upm - 1e-9);
    assert.ok(roadWidth({ drawM: 0.1 }, upm, z) * s >= MIN_ROAD_PX - 1e-9);
    assert.ok(Math.abs((casingWidth(main, upm, z) - roadWidth(main, upm, z)) * s - CASING_PX) < 1e-9);
  }
});
