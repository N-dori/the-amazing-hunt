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
const smallEn = () => json<OsmMapLabelFile>("shuk-map-nahlaot-small.labels-en.json");

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

    test(`${frame}/${lang}: labels shown up to street level stop before it; street level has its own, larger labels`, () => {
      const top = file.meta.streetLevel.zoom;
      assert.ok(file.meta.streetLevel.scale > 1);
      for (const l of file.labels) assert.ok(l.minZoom === top ? l.maxZoom === undefined || l.maxZoom >= top : (l.maxZoom ?? Infinity) < top, `"${l.text.join(" ")}" spans street level`);
      const main = file.labels.find((l) => l.kind === "main" && l.minZoom === top), before = file.labels.find((l) => l.kind === "main" && l.text[0] === main?.text[0] && l.minZoom < top);
      if (main && before) assert.ok(main.w > before.w, "street-level text is not larger");
    });

    test(`${frame}/${lang}: main-road names sit inside the road once it is wide enough, beside it before; every street name fits its stretch`, () => {
      for (const l of file.labels) {
        if (l.kind !== "main" && l.kind !== "mainBrief" && l.kind !== "alley") continue;
        const s = 2 ** l.minZoom;
        if (l.kind !== "alley") {
          const style = l.kind === "main" ? styles.main : styles.mainBrief;
          assert.equal(l.text.length, 1);
          assert.ok(l.roadM !== undefined);
          // Street level reads larger: there the name needs a proportionally wider road.
          const k = l.minZoom === file.meta.streetLevel.zoom ? file.meta.streetLevel.scale : 1;
          const wide = l.roadM * upm * s >= (style.minRoadPx ?? Infinity) * k - 1e-6;
          if (l.kind === "main" || !l.beside) assert.ok(wide, `"${l.text[0]}" is taller than its road at zoom ${l.minZoom}`);
          else assert.ok(!wide, `"${l.text[0]}" is beside a road it would fit inside, at zoom ${l.minZoom}`);
        }
        if (l.kind === "mainBrief") assert.equal(l.maxZoom, l.minZoom, `"${l.text[0]}" is a brief label shown beyond its zoom`);
        const fit = (l.kind === "alley" ? styles.alley.fit : styles[l.kind].fit) ?? 1;
        assert.ok(l.run !== undefined && (l.w / s) * fit <= l.run + 0.15, `"${l.text[0]}" is longer than its stretch at zoom ${l.minZoom}`);
      }
    });

    test(`${frame}/${lang}: main roads show both languages side by side; brief labels and alleys only the game's language`, () => {
      const hebrew = /[֐-׿]/, latin = /[A-Za-z]/;
      for (const l of file.labels) {
        const n = l.n !== undefined ? map.names[l.n] : undefined;
        if (l.kind === "main" && n?.en && n.he) assert.equal(l.text[0], lang === "en" ? `${n.en} · ${n.he}` : `${n.he} · ${n.en}`);
        if (l.kind === "mainBrief") assert.equal(l.text[0], (lang === "en" ? n?.en : n?.he) ?? undefined);
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

    test(`${frame}/${lang}: every map-layer icon shows by street level, and each name only beside its shown icon`, () => {
      const top = Math.max(...zooms);
      map.pois.forEach((poi, i) => {
        const icon = file.labels.find((l) => l.kind === "poi" && l.poi === i);
        // Benches are a nicety: one may give way where street level is full. Everything else must show.
        if (poi.kind === "bench" && !icon) return;
        assert.ok(icon && icon.minZoom <= top, `the ${poi.kind} icon ${poi.he ?? poi.en ?? i} never shows`);
        assert.equal(icon.x, poi.x);
        assert.equal(icon.y, poi.y);
        const named = (poi.kind === "synagogue" || poi.kind === "tram") && (poi.he || poi.en);
        const names = file.labels.filter((l) => l.kind === "poiName" && l.poi === i);
        if (!named) assert.equal(names.length, 0);
        else if (poi.inFrame !== false) assert.ok(names.some((l) => l.minZoom === top), `${poi.he ?? poi.en} has no name at street level`);
        for (const l of names) {
          assert.equal(l.maxZoom, l.minZoom);
          assert.ok(l.minZoom >= icon.minZoom, `${l.text[0]} shows before its icon`);
          // Beside the icon: its centre within the icon's half-width, the gap and the text's own size, in screen pixels.
          const s = 2 ** l.minZoom, d = Math.hypot(l.x - poi.x, l.y - poi.y) * s;
          const k = l.minZoom === file.meta.streetLevel.zoom ? file.meta.streetLevel.scale : 1;
          assert.ok(d <= icon.w / 2 + 2 * styles.marginPx + (styles.poiName.gapPx ?? 0) * k + Math.max(l.w, l.h) / 2 + 0.5, `${l.text[0]} is ${d.toFixed(1)} px from its icon`);
        }
      });
    });

    // Raw size; served compressed it is about a sixth (11 Nov 2026: 20–32 KB gzipped).
    test(`${frame}/${lang}: the label file stays under 256 KB`, () => {
      assert.ok(statSync(url(name)).size <= 256 * 1024);
    });
  }

  test(`${frame}: the owner's courtyards are where the owner put them, and each shows in its zoom range`, () => {
    const courtyards = map.neighbourhoods.filter((n) => n.scale === "courtyard");
    assert.deepEqual(courtyards.map((c) => c.en).sort(), ["Batei Broida", "Batei Munkatch", "Batei Rand", "Knesset Yisrael A", "Knesset Yisrael B"]);
    const labels = json<OsmMapLabelFile>(`shuk-map-nahlaot-${frame}.labels-en.json`);
    for (const c of courtyards) {
      const p = geoToMap(map.projection, c.lat, c.lon);
      assert.ok(Math.abs(p.x - c.x) <= 1 && Math.abs(p.y - c.y) <= 1, `${c.en} is drawn away from its position`);
      const i = map.neighbourhoods.indexOf(c);
      assert.ok(labels.labels.some((l) => l.nb === i && l.kind === "courtyard"), `${c.en} has no label`);
    }
    // Pending entries (no position yet) are never drawn.
    for (const pending of ["Knesset Yisrael C"]) assert.ok(!map.neighbourhoods.some((n) => n.en === pending));
  });
}

test("the owner's courtyards lie inside the small frame", () => {
  for (const c of small.neighbourhoods.filter((n) => n.scale === "courtyard")) assert.notEqual(c.inFrame, false, c.en ?? "");
});

test("the map layers hold the synagogues, toilets, drinking water and light-rail stations, one icon each", () => {
  const large = json<OsmMapGeometry>("shuk-map-nahlaot-large.json");
  for (const map of [small, large]) {
    const kinds = new Set(map.pois.map((p) => p.kind));
    for (const k of ["synagogue", "toilets", "tram", "bench"]) assert.ok(kinds.has(k as never), `no ${k} in the ${map.frame.id} frame`);
    // Drinking water was dropped from the map (owner, 11 Nov 2026).
    assert.ok(!map.pois.some((p) => (p.kind as string) === "drinkingWater"));
    // The owner's synagogue (Ohel Moshe) is on the map, at the owner's position.
    const ohelMoshe = map.pois.find((p) => p.kind === "synagogue" && p.en === "Ohel Moshe Synagogue");
    assert.ok(ohelMoshe?.source?.startsWith("owner"), "Ohel Moshe is not on the map");
    const at = geoToMap(map.projection, 31.782575, 35.2132);
    assert.ok(Math.abs(at.x - ohelMoshe!.x) <= 0.1 && Math.abs(at.y - ohelMoshe!.y) <= 0.1);
    // A station's two stops (one per direction) are one icon.
    const trams = map.pois.filter((p) => p.kind === "tram").map((p) => p.he);
    assert.equal(new Set(trams).size, trams.length);
    // Synagogue outlines are named by their icon, not also as a place.
    assert.ok(!map.places.some((p) => p.kind === "worship" && map.pois.some((s) => s.kind === "synagogue" && s.he === p.he && p.he)));
  }
  assert.ok(large.pois.filter((p) => p.kind === "synagogue").length >= 40);
});

test("benches show from zoom 2 only", () => {
  for (const frame of FRAMES) for (const lang of LANGS) {
    const map = json<OsmMapGeometry>(`shuk-map-nahlaot-${frame}.json`), file = json<OsmMapLabelFile>(`shuk-map-nahlaot-${frame}.labels-${lang}.json`);
    for (const l of file.labels) if (l.kind === "poi" && map.pois[l.poi!]?.kind === "bench") assert.ok(l.minZoom >= 2);
  }
});

test("the owner's name corrections are in the data", () => {
  const large = json<OsmMapGeometry>("shuk-map-nahlaot-large.json");
  for (const map of [small, large]) {
    assert.ok(map.places.some((p) => p.he === "השוק העיראקי" && p.en === "Iraqi Market"));
    assert.ok(map.places.some((p) => p.alt?.en === "Gan HaTut (Mulberry Garden)" && p.alt?.he === "גן התות"));
    assert.ok(map.neighbourhoods.some((n) => n.en === "Batei Rand" && n.he === "בתי ראנד" && !n.heDraft));
    assert.ok(!map.neighbourhoods.some((n) => n.he?.includes("אבו בסל")));
  }
  assert.ok(large.neighbourhoods.some((n) => n.he === "שערי ירושלים"));
});

test("place names stack: the game's language first", () => {
  const he = json<OsmMapLabelFile>("shuk-map-nahlaot-small.labels-he.json");
  const iraqiEn = smallEn().labels.find((l) => l.kind === "place" && l.text[0] === "Iraqi Market");
  const iraqiHe = he.labels.find((l) => l.kind === "place" && l.text[0] === "השוק העיראקי");
  assert.deepEqual(iraqiEn?.text.slice(0, 2), ["Iraqi Market", "השוק העיראקי"]);
  assert.deepEqual(iraqiHe?.text.slice(0, 2), ["השוק העיראקי", "Iraqi Market"]);
});
