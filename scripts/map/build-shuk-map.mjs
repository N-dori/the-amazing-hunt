#!/usr/bin/env node
// Builds the Nahlaot navigation map (Type B, docs/design/map-types-spec.md) from an OpenStreetMap extract.
// Plan: steps 1–2 of the OSM map (owner, 11 Nov 2026). This script is the generated half; the CURATION block below is
// the hand-made half.
//
// Adapted (not imported) from the DORI platform's scripts/map/build-old-city-map.mjs (Tour-Tech/TourTechToolBox,
// ddf0b38): the OSM XML reader, the local equirectangular projection, Douglas–Peucker and the Liang–Barsky clip.
//
// Get the extract (once; media-originals/ is ignored by git and Docker). A generic client name, no personal details:
//   curl -A "DORI-map-build/0.1" -o media-originals/maps/nahlaot.osm \
//     "https://api.openstreetmap.org/api/0.6/map?bbox=35.2060,31.7735,35.2190,31.7890"
// Then:
//   node scripts/map/build-shuk-map.mjs [--frame small|large|both] [--in <file.osm>]
//
// Data © OpenStreetMap contributors, ODbL (https://www.openstreetmap.org/copyright). The credit is drawn on every
// output and must stay visible wherever the map is shown.
//
// Zero dependencies: the OSM API's XML is fixed and flat, so it is read with regular expressions.

import { mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { layoutLabels, makeMeasurer, straightRuns } from "./label-layout.mjs";

const args = Object.fromEntries(process.argv.slice(2).reduce((pairs, arg, i, all) => {
  if (arg.startsWith("--")) pairs.push([arg.slice(2), all[i + 1]]);
  return pairs;
}, []));
const IN = args.in ?? "media-originals/maps/nahlaot.osm";
const FRAME_ARG = args.frame ?? "both";

// ---- CURATION (the hand-made half) --------------------------------------------------------------------------------
// The frames are the owner's decision (11 Nov 2026), not a historical boundary: Jaffa Road (north), King George (east),
// Ben Zvi (west), and Bezalel (small) or Ramban (large) to the south. Where two edge streets don't meet, the owner chose
// how to close the corner (11 Nov 2026): Ben Yehuda (small, south-east; a few metres of Shmuel HaNagid join Bezalel's
// end to it), Ruppin (large, south-west), and in the north-west HaRav Shmuel Baruch then Sha'arei Tzedek, from Ben Zvi's
// northern end up to Jaffa Road (Zalman Shazar meets Jaffa Road only ~745 m west, so it was not used).
//
// A frame is a ring of legs. Each leg is the shortest walk between two corners, using only streets whose Hebrew name
// is listed for that leg, or a straight line (`straight: true`, unused today). Corners are approximate positions; on a street leg each
// snaps to the nearest node of the leg's streets.
const S = {
  jaffa: "יפו",
  kingGeorge: ["המלך ג'ורג'", "המלך ג׳ורג׳"], // OSM spells it both ways
  benZvi: "בן צבי",
  shmuelBaruch: "הרב שמואל ברוך",
  shaareiTzedek: "שערי צדק",
  bezalel: "בצלאל",
  shmuelHaNagid: "שמואל הנגיד",
  benYehuda: "בן יהודה",
  ramban: "רמב\"ן",
  ruppin: "רופין",
};
const C = {
  jaffaKingGeorge: { lat: 31.78322, lon: 35.21777 },
  jaffaShaareiTzedek: { lat: 31.78699, lon: 35.20917 },
  benZviNorthEnd: { lat: 31.78637, lon: 35.20718 },
  bezalelBenZvi: { lat: 31.78295, lon: 35.20834 },
  benYehudaKingGeorge: { lat: 31.78112, lon: 35.21607 },
  benZviSouthEnd: { lat: 31.77631, lon: 35.20912 },
  rambanKingGeorge: { lat: 31.77523, lon: 35.21764 },
};
const NORTH_AND_WEST = [
  { from: C.jaffaKingGeorge, to: C.jaffaShaareiTzedek, streets: [S.jaffa] },
  { from: C.jaffaShaareiTzedek, to: C.benZviNorthEnd, streets: [S.shaareiTzedek, S.shmuelBaruch] },
];
const FRAMES = {
  small: {
    title: "Nahlaot, small frame (south edge: Bezalel)",
    legs: [
      ...NORTH_AND_WEST,
      { from: C.benZviNorthEnd, to: C.bezalelBenZvi, streets: [S.benZvi] },
      { from: C.bezalelBenZvi, to: C.benYehudaKingGeorge, streets: [S.bezalel, S.shmuelHaNagid, S.benYehuda] },
      { from: C.benYehudaKingGeorge, to: C.jaffaKingGeorge, streets: [...S.kingGeorge] },
    ],
  },
  large: {
    title: "Nahlaot, large frame (south edge: Ramban)",
    legs: [
      ...NORTH_AND_WEST,
      { from: C.benZviNorthEnd, to: C.benZviSouthEnd, streets: [S.benZvi] },
      { from: C.benZviSouthEnd, to: C.rambanKingGeorge, streets: [S.ruppin, S.ramban] },
      { from: C.rambanKingGeorge, to: C.jaffaKingGeorge, streets: [...S.kingGeorge] },
    ],
  },
};

// Streets drawn as main: OSM's own road classes (primary to tertiary), plus any listed here by Hebrew name.
const EXTRA_MAIN_STREETS = [];
// The owner's corrections, read off the street signs (never from Google): OSM Hebrew name → { he?, en? }.
const NAME_OVERRIDES = {};
// Street names the owner has checked against the signs on site (OSM Hebrew name, as in the names list).
const CHECKED_ON_SITE = [];
// Names the owner adds to a place, beside OSM's own name: OSM id → { he?, en? }. Shown as a second line.
const PLACE_ALT_NAMES = {
  // HaBustan HaSefaradi, between HaGilboa and HaHermon, touching HaCarmel (owner, 11 Nov 2026). Hebrew not yet given.
  "way/121760440": { en: "Gan ha'toot" },
};
// Open areas, drawn under the buildings (places of worship over them, tinted). First match wins.
const AREA_KINDS = [
  { kind: "market", test: (t) => t.amenity === "marketplace" },
  { kind: "worship", test: (t) => t.amenity === "place_of_worship" },
  { kind: "square", test: (t) => t.place === "square" || (t.highway === "pedestrian" && t.area === "yes") },
  { kind: "green", test: (t) => ["park", "garden", "playground", "dog_park", "pitch", "recreation_ground"].includes(t.leisure)
    || ["grass", "forest", "meadow", "recreation_ground", "cemetery"].includes(t.landuse) },
];

// Courtyards and small neighbourhoods OSM doesn't have, at the positions the owner gave (11 Nov 2026). Spelling: the
// suggestion the owner approved. `pending`: no position yet, so not drawn (listed in the names document).
const COURTYARDS = [
  { en: "Knesset Yisrael A", he: "כנסת ישראל א׳", lat: 31.781284, lon: 35.213069 },
  // Sent as "31.781803.35.212507", read as 31.781803, 35.212507.
  { en: "Knesset Yisrael B", he: "כנסת ישראל ב׳", lat: 31.781803, lon: 35.212507 },
  { en: "Batei Broida", he: "בתי ברוידא", lat: 31.781612, lon: 35.213003 },
  // The owner gave the English only; the Hebrew is a draft.
  { en: "Batei Rand", he: "בתי רנד", heDraft: true, lat: 31.78187, lon: 35.213985 },
  { en: "Knesset Yisrael C", he: "כנסת ישראל ג׳", pending: true },
  { en: "Batei Munkatch", he: "בתי מונקאטש", pending: true },
];
// Real road widths in metres, by OSM class, where the way has no `width` tag. Roads are drawn at these widths, never
// widened (owner, 11 Nov 2026).
const ROAD_WIDTH_M = {
  primary: 14, secondary: 14, tertiary: 10, primary_link: 8, secondary_link: 8, tertiary_link: 7,
  unclassified: 6, residential: 6, living_street: 5, service: 4, track: 3,
  pedestrian: 3, footway: 3, path: 2, steps: 2.5, corridor: 2, cycleway: 2,
};
// Label styles (owner, 11 Nov 2026). Main roads: English and Hebrew side by side on one line, inside the road's width.
// Alleys: one language (the game's), a slightly smaller font, may overflow the width. Sizes in screen pixels.
// fit: the share of the text width a straight stretch must have. zooms: the range a label kind is shown in.
const LABEL = {
  main: { fontPx: 11, padPx: 2, fit: 1.1 },
  alley: { fontPx: 9.5, fit: 0.6 },
  place: { fontPx: 10, altFontPx: 9 },
  neighbourhood: { fontPx: 12, letterPx: 1.2, zooms: [-1.5, 0.5] },
  courtyard: { fontPx: 10, letterPx: 0.8, zooms: [0.5, 2.5] },
  lineHeight: 1.25, marginPx: 2, repeatPx: 250, maxBendDeg: 20,
};
// Zoom levels (Leaflet CRS.Simple: 2^z pixels per map unit, about 1.1 m per unit), from the whole frame on a phone to
// street level; and the three the previews show.
const ZOOMS = [-1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2, 2.5];
const PREVIEW_ZOOMS = [-1.5, 0.5, 2.5];
const LANGUAGES = ["en", "he"];

// Streets drawn beyond the frame, so players never reach a blank edge (drawn faded).
const MARGIN_M = 60;
// Largest gap a street leg may bridge between two dead ends of its own streets (see legPath).
const BRIDGE_M = 25;
// How far a corner may be from the nodes it snaps to.
const SNAP_M = 40;
const ARTBOARD_WIDTH = 1000;
const WALKABLE = new Set(["primary", "secondary", "tertiary", "unclassified", "residential", "living_street", "pedestrian",
  "footway", "steps", "path", "service", "track", "corridor", "primary_link", "secondary_link", "tertiary_link", "cycleway"]);
// Simplification tolerance in artboard units.
const TOLERANCE = { street: 0.4, frame: 0.5, building: 0.45, area: 0.8 };

// ---- Read the OSM XML ---------------------------------------------------------------------------------------------
const xml = readFileSync(IN, "utf8");
const decode = (s) => s.replace(/&quot;/g, "\"").replace(/&apos;/g, "'").replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const attr = (s, name) => new RegExp(`\\b${name}="([^"]*)"`).exec(s)?.[1];
const tagsOf = (body) => Object.fromEntries([...body.matchAll(/<tag k="([^"]*)" v="([^"]*)"\s*\/>/g)].map((m) => [decode(m[1]), decode(m[2])]));

const nodes = new Map(); // id → { lat, lon }
const ways = new Map(); // id → { id, refs, tags }
const relations = new Map(); // id → { id, members, tags }
for (const m of xml.matchAll(/<(node|way|relation)\b([^>]*?)(?:\/>|>([\s\S]*?)<\/\1>)/g)) {
  const [, kind, head, body = ""] = m;
  const id = attr(head, "id");
  if (kind === "node") nodes.set(id, { lat: Number(attr(head, "lat")), lon: Number(attr(head, "lon")), ...(body ? { tags: tagsOf(body) } : {}) });
  else if (kind === "way") ways.set(id, { id, refs: [...body.matchAll(/<nd ref="(\d+)"\s*\/>/g)].map((r) => r[1]), tags: tagsOf(body) });
  else relations.set(id, { id, members: [...body.matchAll(/<member type="(\w+)" ref="(\d+)" role="([^"]*)"\s*\/>/g)].map((r) => ({ type: r[1], ref: r[2], role: r[3] })), tags: tagsOf(body) });
}
// The API's XML carries no date: the download date is the file's.
const extractDate = statSync(IN).mtime.toISOString().slice(0, 10);
const wayLatLons = (way) => way.refs.map((ref) => nodes.get(ref)).filter(Boolean);

// ---- Distances on the ground (a local metric good to well under 1% at this scale) ---------------------------------
const metresBetween = (a, b) => {
  const lat = ((a.lat + b.lat) / 2) * Math.PI / 180;
  return Math.hypot((a.lat - b.lat) * 111132.92, (a.lon - b.lon) * 111412.84 * Math.cos(lat));
};

// ---- Frame rings: shortest walk along the named edge streets between corners --------------------------------------
function legPath(leg) {
  if (leg.straight) return { points: [leg.from, leg.to], metres: metresBetween(leg.from, leg.to), wayIds: [], names: ["(straight line)"], bridges: [] };
  const allowed = new Set(leg.streets);
  const graph = new Map();
  for (const w of ways.values()) {
    if (!w.tags.highway || !allowed.has(w.tags["name:he"] ?? w.tags.name)) continue;
    for (let i = 0; i < w.refs.length - 1; i++) {
      const a = w.refs[i], b = w.refs[i + 1];
      if (!nodes.has(a) || !nodes.has(b)) continue;
      const cost = metresBetween(nodes.get(a), nodes.get(b));
      if (!graph.has(a)) graph.set(a, []);
      if (!graph.has(b)) graph.set(b, []);
      graph.get(a).push({ to: b, cost, way: w.id });
      graph.get(b).push({ to: a, cost, way: w.id });
    }
  }
  // Dual carriageways (Ben Zvi, King George) are mapped as separate one-way pieces that don't always share a node at a
  // junction: let a dead end join the nearest node of the same leg's streets within BRIDGE_M. Reported, so it's seen.
  const bridges = [];
  const ids = [...graph.keys()];
  for (const a of ids) {
    if (graph.get(a).length !== 1) continue;
    let best = null, bestD = Infinity;
    for (const b of ids) {
      if (b === a || graph.get(a).some((e) => e.to === b)) continue;
      const d = metresBetween(nodes.get(a), nodes.get(b));
      if (d < bestD) { bestD = d; best = b; }
    }
    if (best && bestD <= BRIDGE_M) {
      graph.get(a).push({ to: best, cost: bestD, way: null });
      graph.get(best).push({ to: a, cost: bestD, way: null });
      bridges.push(Math.round(bestD));
    }
  }
  // A corner snaps to any node of the leg's streets within SNAP_M (a dual carriageway gives two candidates); the walk
  // is charged the snap distance, so the nearest connected candidate wins.
  const near = (ll) => {
    const found = new Map();
    for (const id of graph.keys()) { const d = metresBetween(ll, nodes.get(id)); if (d <= SNAP_M) found.set(id, d); }
    if (!found.size) throw new Error(`A corner is over ${SNAP_M} m from the streets ${leg.streets.join(", ")}: check the CURATION corners`);
    return found;
  };
  const starts = near(leg.from), ends = near(leg.to);
  // Dijkstra from all start candidates; the graphs here are a few hundred nodes, so a plain scan is enough.
  const dist = new Map(starts), prev = new Map(), done = new Set();
  let to = null, total = Infinity;
  for (;;) {
    let u = null, du = Infinity;
    for (const [id, d] of dist) if (!done.has(id) && d < du) { u = id; du = d; }
    if (u === null || du >= total) break;
    done.add(u);
    if (ends.has(u) && du + ends.get(u) < total) { to = u; total = du + ends.get(u); }
    for (const { to: v, cost, way } of graph.get(u)) {
      if (du + cost < (dist.get(v) ?? Infinity)) { dist.set(v, du + cost); prev.set(v, { node: u, way }); }
    }
  }
  if (to === null) throw new Error(`No path along ${leg.streets.join(", ")} between the corners`);
  const refs = [to], wayIds = new Set();
  while (prev.has(refs[0])) { const p = prev.get(refs[0]); if (p.way) wayIds.add(p.way); refs.unshift(p.node); }
  const names = [...new Set([...wayIds].map((id) => ways.get(id).tags["name:he"] ?? ways.get(id).tags.name))];
  return { points: refs.map((ref) => nodes.get(ref)), metres: total, wayIds: [...wayIds].map((id) => `way/${id}`), names, bridges };
}

// ---- Projection (one for every layer of a frame) -------------------------------------------------------------------
function makeProjection(ringLatLons) {
  const lat0 = (Math.min(...ringLatLons.map((p) => p.lat)) + Math.max(...ringLatLons.map((p) => p.lat))) / 2;
  const lon0 = (Math.min(...ringLatLons.map((p) => p.lon)) + Math.max(...ringLatLons.map((p) => p.lon))) / 2;
  const rad = (lat0 * Math.PI) / 180;
  // Metres per degree at lat0 (standard series for the WGS84 ellipsoid).
  const mPerDegLat = 111132.92 - 559.82 * Math.cos(2 * rad) + 1.175 * Math.cos(4 * rad);
  const mPerDegLon = 111412.84 * Math.cos(rad) - 93.5 * Math.cos(3 * rad);
  const toMetres = ({ lat, lon }) => ({ x: (lon - lon0) * mPerDegLon, y: (lat0 - lat) * mPerDegLat });
  const ringM = ringLatLons.map(toMetres);
  const minX = Math.min(...ringM.map((p) => p.x)) - MARGIN_M, maxX = Math.max(...ringM.map((p) => p.x)) + MARGIN_M;
  const minY = Math.min(...ringM.map((p) => p.y)) - MARGIN_M, maxY = Math.max(...ringM.map((p) => p.y)) + MARGIN_M;
  const unitsPerMetre = ARTBOARD_WIDTH / (maxX - minX);
  const project = (ll) => { const m = toMetres(ll); return { x: (m.x - minX) * unitsPerMetre, y: (m.y - minY) * unitsPerMetre }; };
  return {
    project,
    artboard: { width: ARTBOARD_WIDTH, height: Math.round((maxY - minY) * unitsPerMetre) },
    sizeM: { width: Math.round(maxX - minX - 2 * MARGIN_M), height: Math.round(maxY - minY - 2 * MARGIN_M) },
    constants: {
      kind: "local-equirectangular",
      lat0: Number(lat0.toFixed(7)), lon0: Number(lon0.toFixed(7)),
      mPerDegLat: Number(mPerDegLat.toFixed(3)), mPerDegLon: Number(mPerDegLon.toFixed(3)),
      minX: Number(minX.toFixed(3)), minY: Number(minY.toFixed(3)), unitsPerMetre: Number(unitsPerMetre.toFixed(6)),
    },
  };
}

// ---- Geometry helpers ---------------------------------------------------------------------------------------------
function simplify(points, tolerance) { // Douglas–Peucker
  if (points.length < 3) return points;
  const keep = new Uint8Array(points.length);
  keep[0] = keep[points.length - 1] = 1;
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    const A = points[a], B = points[b];
    const dx = B.x - A.x, dy = B.y - A.y, len = Math.hypot(dx, dy) || 1e-9;
    let worst = -1, index = -1;
    for (let i = a + 1; i < b; i++) {
      const d = Math.abs(dy * points[i].x - dx * points[i].y + B.x * A.y - B.y * A.x) / len;
      if (d > worst) { worst = d; index = i; }
    }
    if (worst > tolerance) { keep[index] = 1; stack.push([a, index], [index, b]); }
  }
  return points.filter((_, i) => keep[i]);
}

const r1 = (n) => Math.round(n * 10) / 10;
// SVG path data, compact: an absolute move, then relative steps between the rounded points (no drift, about half
// the size of absolute coordinates). Repeated points are dropped.
const num = (n) => String(Math.round(n * 10) / 10).replace(/^(-?)0\./, "$1.");
function pathOf(points, close = false) {
  const rounded = [];
  for (const p of points) {
    const q = { x: r1(p.x), y: r1(p.y) };
    if (!rounded.length || q.x !== rounded.at(-1).x || q.y !== rounded.at(-1).y) rounded.push(q);
  }
  if (rounded.length < 2) return "";
  let d = `M${num(rounded[0].x)} ${num(rounded[0].y)}l`;
  for (let i = 1; i < rounded.length; i++) {
    const dx = num(rounded[i].x - rounded[i - 1].x), dy = num(rounded[i].y - rounded[i - 1].y);
    d += `${i > 1 && !dx.startsWith("-") ? " " : ""}${dx}${dy.startsWith("-") ? "" : " "}${dy}`;
  }
  return close ? `${d}z` : d;
}

// A closed ring starts and ends on one point, which gives Douglas–Peucker a zero-length baseline: split it at the
// point farthest from the start and simplify the two halves.
function simplifyRing(points, tolerance) {
  if (points.length < 4) return points;
  const first = points[0];
  let far = 1;
  points.forEach((p, i) => { if (Math.hypot(p.x - first.x, p.y - first.y) > Math.hypot(points[far].x - first.x, points[far].y - first.y)) far = i; });
  return simplify(points.slice(0, far + 1), tolerance).concat(simplify(points.slice(far), tolerance).slice(1));
}

// Joins a relation's member ways (one role), or the given lists of node refs, end to end into rings or lines.
function joinWays(relation, role, given) {
  const pieces = given ?? relation.members.filter((m) => m.type === "way" && m.role === role && ways.has(m.ref)).map((m) => [...ways.get(m.ref).refs]);
  const chains = [];
  while (pieces.length) {
    let chain = pieces.shift();
    let grown = true;
    while (grown && chain[0] !== chain.at(-1)) {
      grown = false;
      for (let i = 0; i < pieces.length; i++) {
        const q = pieces[i];
        if (q[0] === chain.at(-1)) chain = chain.concat(q.slice(1));
        else if (q.at(-1) === chain.at(-1)) chain = chain.concat([...q].reverse().slice(1));
        else if (q.at(-1) === chain[0]) chain = q.concat(chain.slice(1));
        else if (q[0] === chain[0]) chain = [...q].reverse().concat(chain.slice(1));
        else continue;
        pieces.splice(i, 1);
        grown = true;
        break;
      }
    }
    chains.push(chain.map((ref) => nodes.get(ref)).filter(Boolean));
  }
  return chains;
}

// Clips a polyline to the artboard (segment by segment, Liang–Barsky); returns the pieces inside.
function clipLine(points, W, H) {
  const out = [];
  let current = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p = points[i], q = points[i + 1];
    let t0 = 0, t1 = 1, inside = true;
    const dx = q.x - p.x, dy = q.y - p.y;
    for (const [pe, qe] of [[-dx, p.x], [dx, W - p.x], [-dy, p.y], [dy, H - p.y]]) {
      if (pe === 0) { if (qe < 0) { inside = false; break; } continue; }
      const t = qe / pe;
      if (pe < 0) { if (t > t1) { inside = false; break; } if (t > t0) t0 = t; }
      else { if (t < t0) { inside = false; break; } if (t < t1) t1 = t; }
    }
    if (!inside) { if (current.length > 1) out.push(current); current = []; continue; }
    const a = { x: p.x + t0 * dx, y: p.y + t0 * dy }, b = { x: p.x + t1 * dx, y: p.y + t1 * dy };
    if (!current.length) current.push(a);
    current.push(b);
    if (t1 < 1) { out.push(current); current = []; }
  }
  if (current.length > 1) out.push(current);
  return out;
}

function pointInRing(pt, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i], b = ring[j];
    if ((a.y > pt.y) !== (b.y > pt.y) && pt.x < ((b.x - a.x) * (pt.y - a.y)) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}

const usableWay = (w) => WALKABLE.has(w.tags.highway) && w.tags.tunnel !== "yes" && w.tags.indoor !== "yes"
  && !["private", "no"].includes(w.tags.access) && w.tags.area !== "yes";

// ---- Street classes and names -------------------------------------------------------------------------------------
const MAIN_CLASSES = new Set(["primary", "secondary", "tertiary", "primary_link", "secondary_link", "tertiary_link"]);
const PATH_CLASSES = new Set(["footway", "pedestrian", "steps", "path", "corridor", "cycleway", "track"]);
// One key per street: the Hebrew name, with the Hebrew geresh and gershayim folded to ASCII quotes, because OSM spells
// the same street both ways (King George: המלך ג'ורג' and המלך ג׳ורג׳).
const streetKey = (tags) => (tags["name:he"] ?? tags.name ?? "").replace(/׳/g, "'").replace(/״/g, "\"").trim();
const streetClass = (w) => (MAIN_CLASSES.has(w.tags.highway) || EXTRA_MAIN_STREETS.includes(streetKey(w.tags)) ? "main"
  : PATH_CLASSES.has(w.tags.highway) ? "path" : "street");

// ---- Areas and buildings ------------------------------------------------------------------------------------------
// Every closed way or multipolygon relation with the wanted tags, as lat/lon outer rings.
function areaRings(test) {
  const out = [];
  for (const w of ways.values()) if (w.refs.length > 3 && w.refs[0] === w.refs.at(-1) && test(w.tags)) out.push({ osm: `way/${w.id}`, tags: w.tags, rings: [wayLatLons(w)] });
  for (const r of relations.values()) if (r.tags.type === "multipolygon" && test(r.tags)) out.push({ osm: `relation/${r.id}`, tags: r.tags, rings: joinWays(r, "outer").filter((ring) => ring.length > 3) });
  return out;
}

// Area-weighted centroid of a ring: the label point of a place.
function centroid(ring) {
  let a = 0, cx = 0, cy = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const f = ring[j].x * ring[i].y - ring[i].x * ring[j].y;
    a += f; cx += (ring[j].x + ring[i].x) * f; cy += (ring[j].y + ring[i].y) * f;
  }
  return a === 0 ? ring[0] : { x: cx / (3 * a), y: cy / (3 * a) };
}
const ringArea = (ring) => Math.abs(ring.reduce((s, p, i) => { const q = ring[(i + 1) % ring.length]; return s + p.x * q.y - q.x * p.y; }, 0) / 2);

// Named ways of one street joined end to end, so a street split into many OSM ways gets labels along its whole length.
function joinRefChains(pieces) {
  return joinWays({ members: [] }, null, pieces.map((w) => [...w.refs]));
}

// ---- Build one frame ----------------------------------------------------------------------------------------------
function buildFrame(id, frame) {
  const legs = frame.legs.map(legPath);
  const ringLatLons = legs.flatMap((leg, i) => (i === 0 ? leg.points : leg.points.slice(1)));
  const projection = makeProjection(ringLatLons);
  const { project, artboard, constants } = projection;
  const ring = ringLatLons.map(project);
  const W = artboard.width, H = artboard.height;
  const inFrame = (p) => pointInRing(p, ring);
  const onArtboard = (pts) => pts.some((p) => p.x >= 0 && p.x <= W && p.y >= 0 && p.y <= H);
  const metres = (units) => units / constants.unitsPerMetre;

  // Roads, grouped by class and real width, inside the frame or in the margin.
  const roadWidthM = (w) => {
    const tagged = Number.parseFloat(w.tags.width);
    return Number.isFinite(tagged) && tagged >= 1 && tagged <= 40 ? tagged : ROAD_WIDTH_M[w.tags.highway] ?? 3;
  };
  const roads = new Map(); // "class|width" → { class, widthM, inside: [], outside: [] }
  const streetGroups = new Map(); // "key|main" → { key, main, ways: [], widthM }
  const names = new Map(); // key → { he, en:Set, osmName:Set, wayIds:Set, insideM, marginM }
  for (const w of ways.values()) {
    if (!usableWay(w)) continue;
    const pts = wayLatLons(w).map(project);
    if (pts.length < 2) continue;
    for (const piece of clipLine(pts, W, H)) {
      const d = pathOf(simplify(piece, TOLERANCE.street));
      if (!d) continue;
      const inside = inFrame(piece[Math.floor(piece.length / 2)]);
      const cls = streetClass(w), widthM = roadWidthM(w);
      if (!roads.has(`${cls}|${widthM}`)) roads.set(`${cls}|${widthM}`, { class: cls, widthM, inside: [], outside: [] });
      roads.get(`${cls}|${widthM}`)[inside ? "inside" : "outside"].push(d);
      const key = streetKey(w.tags);
      if (!key) continue;
      const gKey = `${key}|${cls === "main"}`;
      if (!streetGroups.has(gKey)) streetGroups.set(gKey, { key, main: cls === "main", ways: new Set(), widthM: Infinity });
      const group = streetGroups.get(gKey);
      group.ways.add(w);
      group.widthM = Math.min(group.widthM, widthM);
      if (!names.has(key)) names.set(key, { he: w.tags["name:he"] ?? null, en: new Set(), osmName: new Set(), wayIds: new Set(), insideM: 0, marginM: 0 });
      const entry = names.get(key);
      if (w.tags["name:en"]) entry.en.add(w.tags["name:en"]);
      if (w.tags.name) entry.osmName.add(w.tags.name);
      entry.wayIds.add(`way/${w.id}`);
      const len = metres(piece.reduce((s, p, i) => (i ? s + Math.hypot(p.x - piece[i - 1].x, p.y - piece[i - 1].y) : 0), 0));
      entry[inside ? "insideM" : "marginM"] += len;
    }
  }

  // Street label stretches: each street's ways (main and the rest apart) joined into chains, clipped to the drawing,
  // and split where they bend; the layout (label-layout.mjs) places the names on them, per language.
  const streetRuns = [...streetGroups.values()].map((g) => {
    const runs = joinRefChains([...g.ways]).flatMap((chain) => clipLine(chain.map(project), W, H))
      .flatMap((piece) => straightRuns(piece, LABEL.maxBendDeg));
    const inside = runs.some((r) => inFrame(r.pts[Math.floor(r.pts.length / 2)]));
    return { key: g.key, main: g.main, widthM: g.widthM, runs, inside, length: runs.reduce((t, r) => t + r.length, 0) };
  });

  // Neighbourhood names OSM has (tagged points) and the owner's courtyards.
  const neighbourhoods = [];
  for (const [nid, n] of nodes) {
    if (!n.tags || !["suburb", "neighbourhood", "quarter"].includes(n.tags.place)) continue;
    const p = project(n);
    if (p.x < 0 || p.x > W || p.y < 0 || p.y > H) continue;
    const name = n.tags.name ?? "";
    neighbourhoods.push({
      he: n.tags["name:he"] ?? (/[\u0590-\u05FF]/.test(name) ? name : null), en: n.tags["name:en"] ?? null,
      lat: n.lat, lon: n.lon, x: Math.round(p.x), y: Math.round(p.y), scale: "neighbourhood", source: "osm", osm: `node/${nid}`,
      ...(inFrame(p) ? {} : { inFrame: false }),
    });
  }
  for (const c of COURTYARDS) {
    if (c.pending) continue;
    const p = project(c);
    if (p.x < 0 || p.x > W || p.y < 0 || p.y > H) continue;
    neighbourhoods.push({
      he: c.he, en: c.en, ...(c.heDraft ? { heDraft: true } : {}), lat: c.lat, lon: c.lon, x: Math.round(p.x), y: Math.round(p.y),
      scale: "courtyard", source: "owner, 11 Nov 2026", ...(inFrame(p) ? {} : { inFrame: false }),
    });
  }

  // Areas by kind, and buildings, each inside the frame or in the margin (by the shape's first point's side).
  const shapeD = (rings, tolerance) => rings.map((r) => r.map(project)).filter(onArtboard)
    .map((r) => ({ d: pathOf(simplifyRing(r, tolerance), true), inside: inFrame(r[0]) })).filter((s) => s.d);
  const areas = Object.fromEntries(AREA_KINDS.map((k) => [k.kind, []]));
  const places = [];
  for (const a of areaRings((t) => AREA_KINDS.some((k) => k.test(t)))) {
    const kind = AREA_KINDS.find((k) => k.test(a.tags)).kind;
    for (const s of shapeD(a.rings, TOLERANCE.area)) areas[kind].push(s.d);
    // A named place gets a label at the centre of its largest ring, if that is on the drawing.
    const he = a.tags["name:he"] ?? (/[\u0590-\u05FF]/.test(a.tags.name ?? "") ? a.tags.name : null);
    const en = a.tags["name:en"] ?? (a.tags.name && !/[\u0590-\u05FF]/.test(a.tags.name) ? a.tags.name : null);
    if (!he && !en) continue;
    const largest = a.rings.map((r) => r.map(project)).reduce((best, r) => (ringArea(r) > ringArea(best) ? r : best));
    const c = centroid(largest);
    if (c.x < 0 || c.x > W || c.y < 0 || c.y > H) continue;
    const alt = PLACE_ALT_NAMES[a.osm];
    places.push({ osm: a.osm, kind, he, en, ...(alt ? { alt } : {}), x: Math.round(c.x), y: Math.round(c.y), ...(inFrame(c) ? {} : { inFrame: false }) });
  }
  const buildings = { inside: [], outside: [] };
  for (const b of areaRings((t) => t.building && t.building !== "no" && t.amenity !== "place_of_worship")) {
    for (const s of shapeD(b.rings, TOLERANCE.building)) buildings[s.inside ? "inside" : "outside"].push(s.d);
  }

  const nameRows = [...names.entries()].map(([key, n]) => {
    const override = NAME_OVERRIDES[key] ?? {};
    return {
      street: key,
      he: override.he ?? n.he ?? (/[֐-׿]/.test(key) ? key : null),
      en: override.en ?? (n.en.size ? [...n.en][0] : null),
      enVariants: [...n.en],
      osmName: [...n.osmName],
      wayIds: [...n.wayIds],
      insideM: Math.round(n.insideM), marginM: Math.round(n.marginM),
      checkedOnSite: CHECKED_ON_SITE.includes(key),
      corrected: Boolean(NAME_OVERRIDES[key]),
    };
  }).sort((a, b) => a.street.localeCompare(b.street, "he"));

  const roadList = [...roads.values()].sort((a, b) => ["path", "street", "main"].indexOf(a.class) - ["path", "street", "main"].indexOf(b.class) || a.widthM - b.widthM);
  return { id, title: frame.title, legs, projection, ring, roads: roadList, streetRuns, neighbourhoods, areas, buildings, nameRows, places };
}

// ---- Outputs ------------------------------------------------------------------------------------------------------
const join = (list) => list.join("");
const CREDIT = "© OpenStreetMap contributors";
const CREDIT_URL = "https://www.openstreetmap.org/copyright";

function mapData(built) {
  const { artboard, constants } = built.projection;
  // Same order as labelData's index, so a label's `n` points at the right street.
  const namesOut = built.nameRows.filter((r) => r.he || r.en)
    .map((r) => ({ he: r.he, en: r.en, checkedOnSite: r.checkedOnSite, inFrame: r.insideM > 0 }));
  return {
    meta: {
      note: "Generated by scripts/map/build-shuk-map.mjs. Do not edit by hand; change its CURATION block and re-run.",
      credit: CREDIT, creditUrl: CREDIT_URL, licence: "ODbL 1.0",
      extract: IN, extractDate,
      frameSetBy: "owner, 11 Nov 2026",
    },
    frame: {
      id: built.id, title: built.title,
      outline: pathOf(simplify(built.ring, TOLERANCE.frame), true),
      edges: built.legs.map((l) => ({ streets: l.names, osm: l.wayIds, metres: Math.round(l.metres) })),
    },
    projection: constants,
    artboard,
    areas: Object.fromEntries(Object.entries(built.areas).map(([k, list]) => [k, join(list)])),
    buildings: { inside: join(built.buildings.inside), outside: join(built.buildings.outside) },
    // Roads by class and real width (metres), drawn as bands at that width; painted path, street, main.
    roads: built.roads.map((r) => ({ class: r.class, widthM: r.widthM, inside: join(r.inside), outside: join(r.outside) })),
    names: namesOut,
    // Named parks, squares, the market and synagogues (outlines only), with any name the owner added (alt).
    places: built.places,
    // OSM's neighbourhood names and the owner's courtyards. Their labels, like the streets', are in the label files.
    neighbourhoods: built.neighbourhoods,
  };
}

// ---- Label files: one per frame and language (label-layout.mjs does the placing) ----------------------------------
const measure = makeMeasurer(JSON.parse(readFileSync(new URL("./plex-widths.json", import.meta.url), "utf8")));
const r1w = (n) => Math.round(n * 10) / 10;

function labelData(built, lang) {
  const upm = built.projection.constants.unitsPerMetre;
  const both = (en, he) => (en && he ? (lang === "he" ? `${he} · ${en}` : `${en} · ${he}`) : en ?? he ?? null);
  const own = (en, he) => (lang === "he" ? he : en) ?? null;
  const names = built.nameRows.filter((r) => r.he || r.en);
  const nameIndex = new Map(names.map((r, i) => [r.street, i]));
  const lh = LABEL.lineHeight;
  const items = [];
  const missing = [];

  built.neighbourhoods.forEach((nb, i) => {
    const style = LABEL[nb.scale], text = both(nb.en, nb.he);
    if (!text) return;
    items.push({
      id: `nb:${i}`, prio: 0, inside: nb.inFrame !== false, length: 0, minZoom: style.zooms[0], maxZoom: style.zooms[1],
      w: measure(text, style.fontPx, { letterPx: style.letterPx }), h: style.fontPx * lh,
      fixed: { x: nb.x, y: nb.y, angle: 0 }, out: { kind: nb.scale, text: [text], nb: i, ...(nb.inFrame === false ? { inFrame: false } : {}) },
    });
  });
  built.places.forEach((pl, i) => {
    const first = both(pl.en, pl.he), alt = pl.alt?.[lang];
    if (!first) return;
    const style = LABEL.place, text = alt ? [first, alt] : [first];
    items.push({
      id: `p:${i}`, prio: 1, inside: pl.inFrame !== false, length: 0, minZoom: ZOOMS[0],
      w: Math.max(measure(first, style.fontPx, { italic: true }), alt ? measure(alt, style.altFontPx, { italic: true }) : 0),
      h: (style.fontPx + (alt ? style.altFontPx : 0)) * lh,
      fixed: { x: pl.x, y: pl.y, angle: 0 }, out: { kind: "place", text, p: i, ...(pl.inFrame === false ? { inFrame: false } : {}) },
    });
  });
  for (const g of built.streetRuns) {
    const row = names[nameIndex.get(g.key)];
    if (!row) continue;
    const text = g.main ? both(row.en, row.he) : own(row.en, row.he);
    if (!text) { if (g.inside) missing.push(g.key); continue; }
    const style = g.main ? LABEL.main : LABEL.alley;
    items.push({
      id: `st:${g.key}|${g.main}`, sid: g.key, prio: g.main ? 2 : 3, inside: g.inside, length: g.length, minZoom: ZOOMS[0],
      w: measure(text, style.fontPx), h: style.fontPx * lh, fontPx: style.fontPx, padPx: style.padPx ?? 0, fit: style.fit,
      ...(g.main ? { roadUnits: g.widthM * upm } : {}), runs: g.runs,
      out: { kind: g.main ? "main" : "alley", text: [text], n: nameIndex.get(g.key), ...(g.main ? { roadM: g.widthM } : {}), ...(g.inside ? {} : { inFrame: false }) },
    });
  }
  items.sort((a, b) => a.prio - b.prio || Number(b.inside) - Number(a.inside) || b.length - a.length);

  const { labels, unplaced } = layoutLabels({ zooms: ZOOMS, items, marginPx: LABEL.marginPx, repeatPx: LABEL.repeatPx });
  const byId = new Map(items.map((i) => [i.id, i]));
  return {
    meta: {
      note: "Generated by scripts/map/build-shuk-map.mjs (layout: scripts/map/label-layout.mjs). Do not edit by hand.",
      credit: CREDIT, creditUrl: CREDIT_URL, licence: "ODbL 1.0", frame: built.id, lang,
      zooms: ZOOMS, styles: LABEL,
      // Inside the frame but never placed at any zoom, and named streets with no name in this language.
      unplaced: unplaced.map((id) => byId.get(id)).filter((i) => i.inside).map((i) => ({ kind: i.out.kind, text: i.out.text })),
      noNameInLanguage: [...new Set(missing)],
    },
    labels: labels.map((l) => ({ ...l, w: r1w(l.w), h: r1w(l.h) })),
  };
}

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Review previews: what a phone shows at one zoom level, for the owner's review only (the game draws the map itself in
// step 3). Roads are bands at their real width, text at its pixel size. If the Plex fonts are in media-originals/fonts/
// (not in git), they are embedded so the preview uses the same fonts the labels were measured with.
// Colours are the DORI tokens from app/globals.scss: chalk, chalk-shade, chalk-highlight, line-stone, ink, ink-subdued,
// zaatar, sumac, amber.
const FONT_FILES = [
  ["IBM Plex Sans", "normal", "media-originals/fonts/IBMPlexSans-Regular.woff"],
  ["IBM Plex Sans", "italic", "media-originals/fonts/IBMPlexSans-Italic.woff"],
  ["IBM Plex Sans Hebrew", "normal", "media-originals/fonts/IBMPlexSansHebrew-Regular.woff"],
];
const fontFaces = (() => {
  try {
    return FONT_FILES.map(([family, style, file]) => `@font-face{font-family:"${family}";font-style:${style};src:url(data:font/woff;base64,${readFileSync(file).toString("base64")}) format("woff")}`).join("");
  } catch { return null; }
})();

function previewSvg(built, data, labelFile, z) {
  const { artboard } = data;
  const s = 2 ** z, px = (v) => v / s, upm = data.projection.unitsPerMetre;
  const roadW = (r) => Math.max(r.widthM * upm, px(1.5));
  const roadsG = (side) => `
  <g stroke="#54514d">${data.roads.map((r) => `<path d="${r[side]}" stroke-width="${(roadW(r) + px(1.2)).toFixed(2)}"/>`).join("")}</g>
  <g stroke="#eee9df">${data.roads.map((r) => `<path d="${r[side]}" stroke-width="${roadW(r).toFixed(2)}"/>`).join("")}</g>`;
  const styleOf = (l) => {
    if (l.kind === "main") return { size: LABEL.main.fontPx, fill: "#252b2a", halo: "#eee9df" };
    if (l.kind === "alley") return { size: LABEL.alley.fontPx, fill: "#252b2a", halo: "#f3efe6" };
    if (l.kind === "place") {
      const kind = data.places[l.p].kind;
      return { size: LABEL.place.fontPx, alt: LABEL.place.altFontPx, italic: true, halo: "#f3efe6",
        fill: kind === "worship" ? "#934a3a" : kind === "market" ? "#c07a2e" : "#667054" };
    }
    return { size: LABEL[l.kind].fontPx, letter: LABEL[l.kind].letterPx, fill: "#54514d", halo: "#f3efe6" };
  };
  const label = (l) => {
    const st = styleOf(l), lh = LABEL.lineHeight;
    const sizes = l.text.map((_, i) => (i && st.alt ? st.alt : st.size));
    const total = sizes.reduce((t, v) => t + v * lh, 0);
    let y = -total / 2;
    const lines = l.text.map((t, i) => { const mid = y + (sizes[i] * lh) / 2; y += sizes[i] * lh; return `<tspan x="0" y="${px(mid).toFixed(2)}" font-size="${px(sizes[i]).toFixed(2)}">${esc(t)}</tspan>`; });
    const attrs = [`fill="${st.fill}"`, `stroke="${st.halo}"`, st.italic ? `font-style="italic"` : "", st.letter ? `letter-spacing="${px(st.letter).toFixed(2)}"` : "", l.inFrame === false ? `opacity=".55"` : ""].filter(Boolean).join(" ");
    return `<text transform="translate(${l.x} ${l.y}) rotate(${l.angle})" ${attrs}>${lines.join("")}</text>`;
  };
  const shown = labelFile.labels.filter((l) => l.minZoom <= z && (l.maxZoom ?? Infinity) >= z);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${artboard.width} ${artboard.height}" width="${Math.round(artboard.width * s)}" height="${Math.round(artboard.height * s)}">
<title>${esc(built.title)}: zoom ${z}, ${labelFile.meta.lang}, review preview</title>
${fontFaces ? `<style>${fontFaces}</style>` : ""}
<rect width="100%" height="100%" fill="#f3efe6"/>
<g id="areas" stroke="none">
  <path d="${data.areas.green}" fill="#667054" fill-opacity=".2"/>
  <path d="${data.areas.square}" fill="#d9cfbe"/>
  <path d="${data.areas.market}" fill="#c07a2e" fill-opacity=".18"/>
</g>
<g id="buildings" fill="#ddd7cb" stroke="#d9cfbe" stroke-width="${px(0.6).toFixed(2)}">
  <path d="${data.buildings.inside}"/>
  <path d="${data.buildings.outside}" opacity=".45"/>
</g>
<g id="worship" fill="#934a3a" fill-opacity=".3" stroke="none"><path d="${data.areas.worship}"/></g>
<g id="roads-margin" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".4">${roadsG("outside")}
</g>
<g id="roads" fill="none" stroke-linecap="round" stroke-linejoin="round">${roadsG("inside")}
</g>
<g id="frame-review-only" fill="none" stroke="#934a3a" stroke-width="${px(1.5).toFixed(2)}" stroke-dasharray="${px(6).toFixed(1)} ${px(4).toFixed(1)}"><path d="${data.frame.outline}"/></g>
<g id="labels" font-family="IBM Plex Sans, IBM Plex Sans Hebrew, sans-serif" text-anchor="middle" dominant-baseline="central" stroke-width="${px(2.4).toFixed(2)}" stroke-linejoin="round" paint-order="stroke">
${shown.map(label).join("\n")}
</g>
<text x="${artboard.width - px(6)}" y="${artboard.height - px(6)}" text-anchor="end" font-family="IBM Plex Sans, sans-serif" font-size="${px(10).toFixed(2)}" fill="#54514d">${CREDIT}</text>
</svg>
`;
}

function namesMarkdown(frames) {
  const large = frames.large, small = frames.small;
  const inSmall = new Map(small.nameRows.map((r) => [r.street, r.insideM > 0]));
  const rows = large.nameRows.filter((r) => r.insideM > 0 || inSmall.get(r.street));
  const cell = (s) => (s ? String(s).replace(/\|/g, "\\|") : "—");
  const flag = (r) => [!r.he && "no Hebrew", !r.en && "no English", r.enVariants.length > 1 && `English varies: ${r.enVariants.join(" / ")}`,
    r.osmName.length > 1 && `OSM name varies: ${r.osmName.join(" / ")}`].filter(Boolean).join("; ");
  const missing = rows.filter((r) => !r.he || !r.en).length;
  return `<!-- Generated by scripts/map/build-shuk-map.mjs from the OSM extract of ${extractDate}. Don't edit the table by hand:
corrections go into NAME_OVERRIDES and checks into CHECKED_ON_SITE in the script's CURATION block, then re-run. -->

# Nahlaot street and place names (from OpenStreetMap, to check on site)

Every street, alley and path with a name inside the **large frame** (south edge Ramban), with a column for the **small
frame** (south edge Bezalel). Names are as OpenStreetMap has them today and are **not yet checked against the street
signs**. Spell them as on the signs; never take a correction from Google.

${rows.length} names · ${rows.filter((r) => inSmall.get(r.street)).length} in the small frame · ${missing} missing a Hebrew or English name · ${rows.filter((r) => r.checkedOnSite).length} checked on site

| Hebrew | English | Small frame | Length in frame | Checked on site | Note | OSM ways |
|---|---|---|---|---|---|---|
${rows.map((r) => `| <span dir="rtl">${cell(r.he)}</span> | ${cell(r.en)} | ${inSmall.get(r.street) ? "yes" : "no"} | ${r.insideM} m | ${r.checkedOnSite ? "yes" : "no"} | ${cell([r.corrected && "corrected by the owner", flag(r)].filter(Boolean).join("; ")) } | ${r.wayIds.length} |`).join("\n")}

## Places

Named parks, squares, the market and synagogues that OSM maps as outlines (most synagogues are only points in OSM and
aren't here). A second name is one the owner added (\`PLACE_ALT_NAMES\`).

| Hebrew | English | Added name | Kind | Small frame | OSM |
|---|---|---|---|---|---|
${large.places.filter((p) => p.inFrame !== false).map((p) => `| <span dir="rtl">${cell(p.he)}</span> | ${cell(p.en)} | ${cell([p.alt?.he, p.alt?.en].filter(Boolean).join(" / "))} | ${p.kind} | ${small.places.some((q) => q.osm === p.osm && q.inFrame !== false) ? "yes" : "no"} | ${p.osm} |`).join("\n")}

## Neighbourhoods and courtyards

OSM's neighbourhood names, and the courtyards the owner placed (\`COURTYARDS\`). Neighbourhoods show from the overview
to the middle zoom; courtyards from the middle zoom to street level.

| Hebrew | English | Kind | Source | Position | Small frame |
|---|---|---|---|---|---|
${large.neighbourhoods.map((n) => `| <span dir="rtl">${cell(n.he)}</span>${n.heDraft ? " (draft)" : ""} | ${cell(n.en)} | ${n.scale} | ${n.osm ?? n.source} | ${n.lat.toFixed(6)}, ${n.lon.toFixed(6)} | ${small.neighbourhoods.some((q) => q.lat === n.lat && q.lon === n.lon && q.inFrame !== false) ? "yes" : "no"} |`).join("\n")}
${COURTYARDS.filter((c) => c.pending).map((c) => `| <span dir="rtl">${cell(c.he)}</span> | ${cell(c.en)} | courtyard | owner | **pending: no position yet, not drawn** | — |`).join("\n")}

## Labels that found no place

Inside the frame but not placed at any zoom, because there wasn't room or the street is too short for its name. They
are still in the tables above.

${["small", "large"].flatMap((f) => LANGUAGES.map((lang) => { const u = labelFiles[f]?.[lang]?.meta.unplaced ?? []; return `- **${f}, ${lang}:** ${u.length ? u.map((x) => x.text.join(" / ")).join(" · ") : "none"}`; })).join("\n")}

Data © OpenStreetMap contributors, ODbL (${CREDIT_URL}).
`;
}

// ---- Run ----------------------------------------------------------------------------------------------------------
const MAX_DATA_KB = 150;
const kb = (s) => Buffer.byteLength(s) / 1024;
const wanted = FRAME_ARG === "both" ? Object.keys(FRAMES) : [FRAME_ARG];
const built = {};
const labelFiles = {};
const tooBig = [];
const write = (file, text) => { if (file.startsWith("data/") && kb(text) > MAX_DATA_KB) tooBig.push(file); else { mkdirSync(dirname(file), { recursive: true }); writeFileSync(file, text); } };
for (const id of wanted) {
  if (!FRAMES[id]) throw new Error(`Unknown frame "${id}": use small, large or both`);
  const b = (built[id] = buildFrame(id, FRAMES[id]));
  const data = mapData(b);
  const json = `${JSON.stringify(data)}\n`;
  write(`data/shuk-map-nahlaot-${id}.json`, json);
  const { artboard, sizeM, constants } = b.projection;
  console.log(`\n${b.title}`);
  console.log(`  Artboard ${artboard.width}×${artboard.height}, 1 unit ≈ ${(1 / constants.unitsPerMetre).toFixed(2)} m · frame about ${sizeM.width} × ${sizeM.height} m, plus ${MARGIN_M} m margin`);
  for (const leg of b.legs) console.log(`  Edge: ${leg.names.join(" → ")} (${Math.round(leg.metres)} m${leg.bridges.length ? `; gaps bridged: ${leg.bridges.map((m) => `${m} m`).join(", ")}` : ""})`);
  const roadKb = (side) => kb(data.roads.map((r) => r[side]).join("")).toFixed(0);
  console.log(`  data/shuk-map-nahlaot-${id}.json ${kb(json).toFixed(0)} KB: roads ${roadKb("inside")}+${roadKb("outside")} KB, buildings ${kb(data.buildings.inside + data.buildings.outside).toFixed(0)} KB, ${data.places.length} places, ${data.neighbourhoods.length} neighbourhoods and courtyards`);

  labelFiles[id] = {};
  for (const lang of LANGUAGES) {
    const lf = (labelFiles[id][lang] = labelData(b, lang));
    const file = `data/shuk-map-nahlaot-${id}.labels-${lang}.json`;
    const text = `${JSON.stringify(lf)}\n`;
    write(file, text);
    const counts = ZOOMS.map((z) => lf.labels.filter((l) => l.minZoom <= z && (l.maxZoom ?? Infinity) >= z).length);
    console.log(`  ${file} ${kb(text).toFixed(0)} KB · labels by zoom ${ZOOMS.map((z, i) => `${z}:${counts[i]}`).join(" ")} · never placed ${lf.meta.unplaced.length} · no ${lang} name ${lf.meta.noNameInLanguage.length}`);
    const zooms = lang === "en" ? PREVIEW_ZOOMS : [PREVIEW_ZOOMS.at(-1)];
    for (const z of zooms) write(`media-originals/maps/nahlaot-${id}-z${z}-${lang}.svg`, previewSvg(b, data, lf, z));
  }
}
if (built.small && built.large) {
  write("docs/map/nahlaot-street-names.md", namesMarkdown(built));
  console.log("\nNames list: docs/map/nahlaot-street-names.md");
}
console.log(`Previews: media-originals/maps/nahlaot-{small,large}-z{${PREVIEW_ZOOMS.join(",")}}-en.svg and the street-level -he.svg${fontFaces ? " (Plex embedded)" : " (Plex not found in media-originals/fonts: system fonts)"}`);
console.log(`Extract: ${IN} (${extractDate})`);
if (tooBig.length) { console.error(`Over ${MAX_DATA_KB} KB, not written: ${tooBig.join(", ")}`); process.exit(1); }
