import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { test } from "node:test";
import { distanceMeters } from "../amazing-shuk/mission-arrival.ts";
import { geoToMap, mapToGeo, metresToUnits, type OsmMapGeometry } from "./osm-projection.ts";

const FRAMES = ["small", "large"] as const;
const file = (frame: string) => new URL(`../../data/shuk-map-nahlaot-${frame}.json`, import.meta.url);
const load = (frame: string) => JSON.parse(readFileSync(file(frame), "utf8")) as OsmMapGeometry;

for (const frame of FRAMES) {
  const map = load(frame);
  const { projection, artboard } = map;
  const corners = [mapToGeo(projection, 0, 0), mapToGeo(projection, artboard.width, artboard.height)];
  const centre = mapToGeo(projection, artboard.width / 2, artboard.height / 2);

  test(`${frame}: a GPS position goes to the map and back within half a metre`, () => {
    for (const [x, y] of [[0, 0], [artboard.width, artboard.height], [312.4, 587.9], [artboard.width / 2, artboard.height / 2]]) {
      const geo = mapToGeo(projection, x, y);
      const back = mapToGeo(projection, geoToMap(projection, geo.lat, geo.lon).x, geoToMap(projection, geo.lat, geo.lon).y);
      assert.ok(distanceMeters({ latitude: geo.lat, longitude: geo.lon }, { latitude: back.lat, longitude: back.lon }) < 0.5);
    }
  });

  test(`${frame}: distances on the map match distances on the ground within 1%`, () => {
    const pairs = [[corners[0], corners[1]], [corners[0], centre], [mapToGeo(projection, 0, artboard.height), mapToGeo(projection, artboard.width, 0)]];
    for (const [a, b] of pairs) {
      const ground = distanceMeters({ latitude: a.lat, longitude: a.lon }, { latitude: b.lat, longitude: b.lon });
      const pa = geoToMap(projection, a.lat, a.lon), pb = geoToMap(projection, b.lat, b.lon);
      const onMap = Math.hypot(pa.x - pb.x, pa.y - pb.y);
      assert.ok(Math.abs(onMap - metresToUnits(projection, ground)) / onMap < 0.01, `${onMap} vs ${metresToUnits(projection, ground)}`);
    }
  });

  test(`${frame}: north is up and east is right`, () => {
    const p = geoToMap(projection, centre.lat, centre.lon);
    assert.ok(geoToMap(projection, centre.lat + 0.001, centre.lon).y < p.y);
    assert.ok(geoToMap(projection, centre.lat, centre.lon + 0.001).x > p.x);
  });

  test(`${frame}: the data carries the OSM credit, stays under 150 KB, and every place is on the drawing`, () => {
    assert.match(map.meta.credit, /OpenStreetMap contributors/);
    assert.equal(map.meta.licence, "ODbL 1.0");
    assert.ok(statSync(file(frame)).size <= 150 * 1024);
    assert.ok(map.roads.some((r) => r.class === "main" && r.inside.length > 0));
    for (const place of map.places) {
      assert.ok(place.he || place.en, `${place.osm} has no name`);
      assert.ok(place.x >= 0 && place.x <= artboard.width && place.y >= 0 && place.y <= artboard.height);
    }
  });
}
