// Checks the generated label files (data/shuk-map-nahlaot-<frame>.labels-<lang>.json) against the owner's label rules
// (docs/map/nahlaot-osm-map.md). The overlap maths here is written independently of scripts/map/label-layout.mjs, so
// the layout is checked, not re-run.
import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { test } from "node:test";
import { geoToMap, type OsmMapGeometry, type OsmMapLabel, type OsmMapLabelFile } from "./osm-projection.ts";

type Pt = { x: number; y: number };
const FRAMES = ["small", "large"] as const;
const LANGS = ["en", "he"] as const;
const url = (name: string) => new URL(`../../data/${name}`, import.meta.url);
const json = <T,>(name: string) => JSON.parse(readFileSync(url(name), "utf8")) as T;
const small = json<OsmMapGeometry>("shuk-map-nahlaot-small.json");

function corners(l: OsmMapLabel, z: number, marginPx: number): Pt[] {
  const s = 2 ** z, hw = (l.w / 2 + marginPx) / s, hh = (l.h / 2 + marginPx) / s;
  const r = (l.angle * Math.PI) / 180, c = Math.cos(r), sn = Math.sin(r);
  return [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]].map(([u, v]) => ({ x: l.x + u * c - v * sn, y: l.y + u * sn + v * c }));
}

// Two convex shapes overlap unless some edge normal separates their projections (touching doesn't count).
function overlap(a: Pt[], b: Pt[]): boolean {
  for (const poly of [a, b]) {
    for (let i = 0; i < poly.length; i++) {
      const p = poly[i], q = poly[(i + 1) % poly.length];
      const nx = q.y - p.y, ny = p.x - q.x;
      const pa = a.map((v) => v.x * nx + v.y * ny), pb = b.map((v) => v.x * nx + v.y * ny);
      if (Math.max(...pa) <= Math.min(...pb) + 1e-6 || Math.max(...pb) <= Math.min(...pa) + 1e-6) return false;
    }
  }
  return true;
}

const shownAt = (l: OsmMapLabel, z: number) => l.minZoom <= z && (l.maxZoom ?? Infinity) >= z;

for (const frame of FRAMES) {
  const map = json<OsmMapGeometry>(`shuk-map-nahlaot-${frame}.json`);
  const upm = map.projection.unitsPerMetre;

  for (const lang of LANGS) {
    const name = `shuk-map-nahlaot-${frame}.labels-${lang}.json`;
    const file = json<OsmMapLabelFile>(name);
    const { styles, zooms } = file.meta;

    test(`${frame}/${lang}: no two labels overlap at any zoom`, () => {
      for (const z of zooms) {
        const boxes = file.labels.filter((l) => shownAt(l, z)).map((l) => {
          const c = corners(l, z, styles.marginPx);
          return { l, c, x0: Math.min(...c.map((p) => p.x)), x1: Math.max(...c.map((p) => p.x)), y0: Math.min(...c.map((p) => p.y)), y1: Math.max(...c.map((p) => p.y)) };
        });
        for (let i = 0; i < boxes.length; i++) {
          for (let j = i + 1; j < boxes.length; j++) {
            const a = boxes[i], b = boxes[j];
            if (a.x1 <= b.x0 || b.x1 <= a.x0 || a.y1 <= b.y0 || b.y1 <= a.y0) continue;
            assert.ok(!overlap(a.c, b.c), `zoom ${z}: "${a.l.text.join(" ")}" overlaps "${b.l.text.join(" ")}"`);
          }
        }
      }
    });

    test(`${frame}/${lang}: main-road names sit inside the road, and every street name fits its stretch`, () => {
      for (const l of file.labels) {
        if (l.kind !== "main" && l.kind !== "alley") continue;
        const s = 2 ** l.minZoom;
        if (l.kind === "main") {
          assert.equal(l.text.length, 1);
          assert.ok(l.roadM !== undefined && l.roadM * upm * s >= styles.main.fontPx + 2 * (styles.main.padPx ?? 0) - 1e-6, `"${l.text[0]}" is taller than its road at zoom ${l.minZoom}`);
        }
        const fit = (l.kind === "main" ? styles.main.fit : styles.alley.fit) ?? 1;
        assert.ok(l.run !== undefined && (l.w / s) * fit <= l.run + 0.15, `"${l.text[0]}" is longer than its stretch at zoom ${l.minZoom}`);
      }
    });

    test(`${frame}/${lang}: main roads show both languages side by side; alleys only the game's language`, () => {
      const hebrew = /[֐-׿]/, latin = /[A-Za-z]/;
      for (const l of file.labels) {
        const n = l.n !== undefined ? map.names[l.n] : undefined;
        if (l.kind === "main" && n?.en && n.he) assert.equal(l.text[0], lang === "en" ? `${n.en} · ${n.he}` : `${n.he} · ${n.en}`);
        if (l.kind === "alley") assert.ok(lang === "en" ? !hebrew.test(l.text[0]) : !latin.test(l.text[0]) || !n?.he, `"${l.text[0]}" in the ${lang} set`);
      }
    });

    test(`${frame}/${lang}: every name in the frame is shown by street level, or is reported`, () => {
      const top = Math.max(...zooms);
      const reported = new Set(file.meta.unplaced.flatMap((u) => u.text));
      map.names.forEach((n, i) => {
        const own = lang === "en" ? n.en : n.he;
        if (!n.inFrame || !own) return;
        const shown = file.labels.some((l) => l.n === i && shownAt(l, top));
        const listed = [...reported].some((t) => t.includes(own));
        assert.ok(shown || listed, `"${own}" is neither shown nor reported`);
      });
    });

    test(`${frame}/${lang}: the label file stays under 150 KB`, () => {
      assert.ok(statSync(url(name)).size <= 150 * 1024);
    });
  }

  test(`${frame}: the owner's courtyards are where the owner put them, and each shows in its zoom range`, () => {
    const courtyards = map.neighbourhoods.filter((n) => n.scale === "courtyard");
    assert.deepEqual(courtyards.map((c) => c.en).sort(), ["Batei Broida", "Batei Rand", "Knesset Yisrael A", "Knesset Yisrael B"]);
    const labels = json<OsmMapLabelFile>(`shuk-map-nahlaot-${frame}.labels-en.json`);
    for (const c of courtyards) {
      const p = geoToMap(map.projection, c.lat, c.lon);
      assert.ok(Math.abs(p.x - c.x) <= 1 && Math.abs(p.y - c.y) <= 1, `${c.en} is drawn away from its position`);
      const i = map.neighbourhoods.indexOf(c);
      assert.ok(labels.labels.some((l) => l.nb === i && l.kind === "courtyard"), `${c.en} has no label`);
    }
    // Pending entries (no position yet) are never drawn.
    for (const pending of ["Knesset Yisrael C", "Batei Munkatch"]) assert.ok(!map.neighbourhoods.some((n) => n.en === pending));
  });
}

test("the owner's courtyards lie inside the small frame", () => {
  for (const c of small.neighbourhoods.filter((n) => n.scale === "courtyard")) assert.notEqual(c.inFrame, false, c.en ?? "");
});
