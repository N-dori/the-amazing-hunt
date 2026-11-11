// Label layout for the OSM navigation map: text measuring, straight stretches along a street, rotated-box overlap
// tests, and the placement that gives every label the zoom level it first appears at (minZoom).
// Pure functions, no dependencies; used by scripts/map/build-shuk-map.mjs. Rules: docs/map/nahlaot-osm-map.md.
//
// Zoom follows Leaflet's CRS.Simple: at zoom z one map unit is 2^z screen pixels. Text has a fixed size in pixels, so
// its box in map units shrinks as z grows. Labels that don't overlap at one zoom therefore never overlap at a closer
// one, so placing from far to near and keeping what was placed gives a set that is clear at every zoom.

const HEBREW = /[֐-׿]/;

/** A text measurer from the glyph-width table (scripts/map/plex-widths.json). Throws on a character it doesn't know. */
export function makeMeasurer(table) {
  const { latin, latinItalic, hebrew } = table.fonts;
  return function measure(text, fontPx, { italic = false, letterPx = 0 } = {}) {
    let units = 0;
    const chars = [...text];
    for (const ch of chars) {
      const font = HEBREW.test(ch) ? hebrew : italic ? latinItalic : latin;
      const w = font.widths[ch] ?? hebrew.widths[ch];
      if (w === undefined) throw new Error(`No glyph width for "${ch}" (U+${ch.codePointAt(0).toString(16)}) in "${text}": extend scripts/map/plex-widths.json`);
      units += w / font.unitsPerEm;
    }
    return units * fontPx + letterPx * Math.max(0, chars.length - 1);
  };
}

/** Splits a polyline into stretches that bend less than maxBendDeg from their first segment's heading. */
export function straightRuns(points, maxBendDeg) {
  const runs = [];
  let current = [points[0]];
  let heading = null;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i];
    if (Math.hypot(b.x - a.x, b.y - a.y) < 1e-6) continue;
    const h = Math.atan2(b.y - a.y, b.x - a.x);
    if (heading !== null) {
      const diff = Math.abs(((h - heading + 3 * Math.PI) % (2 * Math.PI)) - Math.PI) * 180 / Math.PI;
      if (diff > maxBendDeg) { runs.push(current); current = [a]; heading = h; }
    } else heading = h;
    current.push(b);
  }
  if (current.length > 1) runs.push(current);
  return runs.map((pts) => {
    const cum = [0];
    for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
    return { pts, cum, length: cum.at(-1) };
  });
}

/** The point at distance s along a run. */
export function pointAt(run, s) {
  const t = Math.min(Math.max(s, 0), run.length);
  let i = 1;
  while (i < run.cum.length - 1 && run.cum[i] < t) i++;
  const f = (t - run.cum[i - 1]) / ((run.cum[i] - run.cum[i - 1]) || 1);
  const a = run.pts[i - 1], b = run.pts[i];
  return { x: a.x + f * (b.x - a.x), y: a.y + f * (b.y - a.y) };
}

/** An angle in degrees turned so the text reads upright: (-90, 90]. */
export function upright(deg) {
  let a = deg % 360;
  if (a > 180) a -= 360;
  if (a <= -180) a += 360;
  if (a > 90) a -= 180;
  if (a <= -90) a += 180;
  return a;
}

/** The corners of a rotated box centred at (x, y), half-sizes hw × hh, angle in degrees. */
export function boxCorners(x, y, hw, hh, angleDeg) {
  const r = (angleDeg * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r);
  return [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]].map(([u, v]) => ({ x: x + u * c - v * s, y: y + u * s + v * c }));
}

/** Separating-axis test for two convex quadrilaterals. Touching edges don't count as overlap. */
export function boxesOverlap(a, b) {
  for (const poly of [a, b]) {
    for (let i = 0; i < 4; i++) {
      const p = poly[i], q = poly[(i + 1) % 4];
      const nx = q.y - p.y, ny = p.x - q.x;
      let aMin = Infinity, aMax = -Infinity, bMin = Infinity, bMax = -Infinity;
      for (const v of a) { const d = v.x * nx + v.y * ny; aMin = Math.min(aMin, d); aMax = Math.max(aMax, d); }
      for (const v of b) { const d = v.x * nx + v.y * ny; bMin = Math.min(bMin, d); bMax = Math.max(bMax, d); }
      if (aMax <= bMin + 1e-9 || bMax <= aMin + 1e-9) return false;
    }
  }
  return true;
}

/** The box a label occupies at zoom z, in map units: its pixel size plus a margin, divided by the zoom's scale. */
export function labelBox(label, z, marginPx) {
  const s = 2 ** z;
  return boxCorners(label.x, label.y, (label.w / 2 + marginPx) / s, (label.h / 2 + marginPx) / s, label.angle);
}

const visibleAt = (label, z) => label.minZoom <= z && (label.maxZoom ?? Infinity) >= z;

/**
 * Places labels without overlaps, from the farthest zoom to the nearest.
 * items, in priority order: { id, sid?, kind, text, w, h, minZoom, maxZoom?, ...extra } and either
 *   fixed: { x, y, angle }                      a point label (place, neighbourhood, courtyard), or
 *   runs: [{ pts, cum, length }], fit,          a street label along its straight stretches; `fit` is the share of
 *   roadUnits?, minRoadPx                       the text width a stretch must have; roadUnits, if set, is the road's
 *                                               drawn width in map units, which must be at least minRoadPx on screen.
 *   brief: { gapPx }                            (with runs) a zoomed-out label: placed afresh at every zoom and shown
 *                                               at that zoom only. Inside the road where it is wide enough, otherwise
 *                                               beside it, gapPx clear of the road's edge, on either side.
 *   fixed + perZoom: [{ dx, dy }], needs?     a point label placed afresh at each zoom and shown at that zoom only, at
 *                                               the first free offset (screen pixels) from its point, and only while the
 *                                               item `needs` (an icon) is shown: e.g. a synagogue's name beside its icon.
 * reserved: boxes (corners in map units) nothing may cover, e.g. mission markers.
 * Returns the placed labels (each with the zoom it first shows at) and the ids of items never placed.
 */
export function layoutLabels({ zooms, items, marginPx, repeatPx, reserved = [] }) {
  const placed = [];
  const bySid = new Map();
  const itemById = new Map(items.map((i) => [i.id, i]));
  for (const z of zooms) {
    const s = 2 ** z;
    // A uniform grid of the boxes shown at this zoom, so each test looks at its neighbours only.
    const cell = 96 / s;
    const grid = new Map();
    const cellsOf = (corners) => {
      const xs = corners.map((p) => p.x), ys = corners.map((p) => p.y);
      const out = [];
      for (let i = Math.floor(Math.min(...xs) / cell); i <= Math.floor(Math.max(...xs) / cell); i++) {
        for (let j = Math.floor(Math.min(...ys) / cell); j <= Math.floor(Math.max(...ys) / cell); j++) out.push(`${i},${j}`);
      }
      return out;
    };
    const insert = (corners) => { for (const k of cellsOf(corners)) { if (!grid.has(k)) grid.set(k, []); grid.get(k).push(corners); } };
    const collides = (corners) => {
      const seen = new Set();
      for (const k of cellsOf(corners)) {
        for (const other of grid.get(k) ?? []) {
          if (seen.has(other)) continue;
          seen.add(other);
          if (boxesOverlap(corners, other)) return true;
        }
      }
      return false;
    };
    for (const box of reserved) insert(box);
    for (const label of placed) if (visibleAt(label, z)) insert(labelBox(label, z, marginPx));

    const take = (item, at) => {
      const maxZoom = item.brief || item.perZoom ? z : item.maxZoom;
      const label = { ...item.out, x: at.x, y: at.y, angle: at.angle, w: item.w, h: item.h, minZoom: z, ...(maxZoom !== undefined ? { maxZoom } : {}), ...(at.run !== undefined ? { run: at.run } : {}), ...(at.beside ? { beside: true } : {}) };
      placed.push(label);
      item.placed = true;
      if (item.sid !== undefined) { if (!bySid.has(item.sid)) bySid.set(item.sid, []); bySid.get(item.sid).push(label); }
      insert(labelBox(label, z, marginPx));
    };

    for (const item of items) {
      if (z < item.minZoom || z > (item.maxZoom ?? Infinity)) continue;
      if (item.fixed && item.perZoom) {
        if (item.needs && !itemById.get(item.needs)?.placed) continue;
        for (const o of item.perZoom) {
          const at = { x: Math.round((item.fixed.x + o.dx / s) * 100) / 100, y: Math.round((item.fixed.y + o.dy / s) * 100) / 100, angle: 0 };
          if (!collides(labelBox({ ...at, w: item.w, h: item.h }, z, marginPx))) { take(item, at); break; }
        }
        continue;
      }
      if (item.fixed) {
        if (item.placed) continue;
        const at = item.fixed;
        // Nor may it take the spot of a point label before it in the order that is still waiting for room (an icon
        // must not push a place's name off the map), except at the last zoom, so every point label shows by then.
        const order = items.indexOf(item);
        const blocks = z < zooms.at(-1) && items.slice(0, order).some((f) => f.fixed && !f.perZoom && !f.placed && f.minZoom <= z
          && (f.maxZoom ?? Infinity) >= z
          && boxesOverlap(labelBox({ ...at, w: item.w, h: item.h }, z, marginPx), labelBox({ ...f.fixed, w: f.w, h: f.h }, z, marginPx)));
        if (!blocks && !collides(labelBox({ ...at, w: item.w, h: item.h }, z, marginPx))) take(item, at);
        continue;
      }
      // A street: the road must be wide enough on screen for the text, if the item asks for that. A brief label goes
      // beside a road that is too narrow.
      const fitsInside = item.roadUnits === undefined || item.roadUnits * s >= item.minRoadPx;
      if (!fitsInside && !item.brief) continue;
      const offsets = fitsInside ? [0] : [1, -1].map((side) => side * (item.roadUnits / 2 + (item.brief.gapPx + item.h / 2) / s));
      // Point labels not yet placed (a place hidden for now under a neighbourhood name, a courtyard that starts at a
      // closer zoom) keep their spot: a street label may not cover one at the zoom that label could first show at.
      // Both boxes scale alike, so clear there means clear at every closer zoom too.
      const waiting = items.filter((f) => f.fixed && !f.perZoom && !f.placed && (f.maxZoom ?? Infinity) >= z);
      const coversWaiting = (cand) => waiting.some((f) => {
        const zz = Math.max(z, f.minZoom);
        return boxesOverlap(labelBox({ ...cand, w: item.w, h: item.h }, zz, marginPx), labelBox({ ...f.fixed, w: f.w, h: f.h }, zz, marginPx));
      });
      const wU = item.w / s, spacing = repeatPx / s;
      const same = () => (bySid.get(item.sid) ?? []).filter((o) => visibleAt(o, z));
      for (const run of item.runs) {
        if (run.length < item.fit * wU) continue;
        // Positions: the centre first, then outwards, keeping the text on the stretch (or centred on a short one).
        const lo = Math.min(wU / 2, run.length / 2), hi = run.length - lo, mid = run.length / 2, step = Math.max(wU / 2, 4 / s);
        const spots = [mid];
        for (let k = 1; mid - k * step >= lo || mid + k * step <= hi; k++) {
          if (mid + k * step <= hi) spots.push(mid + k * step);
          if (mid - k * step >= lo) spots.push(mid - k * step);
        }
        for (const at of spots) {
          const p = pointAt(run, at);
          if (same().some((o) => Math.hypot(o.x - p.x, o.y - p.y) < spacing)) continue;
          const a = pointAt(run, at - wU / 2), b = pointAt(run, at + wU / 2);
          const heading = Math.atan2(b.y - a.y, b.x - a.x);
          const angle = Math.round(upright((heading * 180) / Math.PI));
          for (const off of offsets) {
            // Beside the road: moved along the stretch's normal, clear of the road's drawn edge.
            const x = p.x - Math.sin(heading) * off, y = p.y + Math.cos(heading) * off;
            const candidate = { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, angle, run: Math.round(run.length * 10) / 10, ...(off ? { beside: true } : {}) };
            if (collides(labelBox({ ...candidate, w: item.w, h: item.h }, z, marginPx)) || coversWaiting(candidate)) continue;
            take(item, candidate);
            break;
          }
        }
      }
    }
  }
  return { labels: placed, unplaced: items.filter((i) => !i.placed).map((i) => i.id) };
}
