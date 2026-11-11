"use client";

import { useEffect, useState } from "react";
import type { OsmMapGeometry, OsmMapLabelFile } from "@/lib/map/osm-projection";
import LeafletOsmMap from "./LeafletOsmMap";
import styles from "./IndexOsmMap.module.scss";

type Frame = "small" | "large";
type Lang = "en" | "he";
type Loaded = { key: string; map: OsmMapGeometry; labels: OsmMapLabelFile };

// One chunk per file, loaded when its frame and language are picked.
const LOAD: Record<Frame, { map: () => Promise<unknown>; labels: Record<Lang, () => Promise<unknown>> }> = {
  small: {
    map: () => import("@/data/shuk-map-nahlaot-small.json"),
    labels: { en: () => import("@/data/shuk-map-nahlaot-small.labels-en.json"), he: () => import("@/data/shuk-map-nahlaot-small.labels-he.json") },
  },
  large: {
    map: () => import("@/data/shuk-map-nahlaot-large.json"),
    labels: { en: () => import("@/data/shuk-map-nahlaot-large.labels-en.json"), he: () => import("@/data/shuk-map-nahlaot-large.labels-he.json") },
  },
};
const json = <T,>(mod: unknown) => (mod as { default: T }).default;

// The controls' wording is for the owner's review on this dev page only, not visitor copy.
const FRAMES: { id: Frame; label: string }[] = [{ id: "small", label: "Small (Bezalel)" }, { id: "large", label: "Large (Ramban)" }];
const LANGS: { id: Lang; label: string }[] = [{ id: "en", label: "English" }, { id: "he", label: "עברית" }];

// Development page for the OSM navigation map on its own: no markers, no challenge. The owner picks the frame here.
export default function IndexOsmMap() {
  const [frame, setFrame] = useState<Frame>("small");
  const [lang, setLang] = useState<Lang>("en");
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const [zoom, setZoom] = useState<{ step: number; count: number } | null>(null);
  const key = `${frame}/${lang}`;

  useEffect(() => {
    let cancelled = false;
    Promise.all([LOAD[frame].map(), LOAD[frame].labels[lang]()])
      .then(([map, labels]) => { if (!cancelled) { setFailed(null); setLoaded({ key, map: json<OsmMapGeometry>(map), labels: json<OsmMapLabelFile>(labels) }); } })
      .catch(() => { if (!cancelled) setFailed(key); });
    return () => { cancelled = true; };
  }, [frame, lang, key]);

  const ready = loaded?.key === key ? loaded : null;
  return (
    <main className={styles.page}>
      <header className={styles.bar}>
        <fieldset className={styles.switch}>
          <legend className="srOnly">Frame</legend>
          {FRAMES.map((f) => (
            <label key={f.id} className={`${styles.option} ${f.id === frame ? styles.optionOn : ""}`}>
              <input type="radio" name="frame" value={f.id} checked={f.id === frame} onChange={() => setFrame(f.id)} className="srOnly" />
              {f.label}
            </label>
          ))}
        </fieldset>
        <fieldset className={styles.switch}>
          <legend className="srOnly">Language</legend>
          {LANGS.map((l) => (
            <label key={l.id} className={`${styles.option} ${l.id === lang ? styles.optionOn : ""}`} lang={l.id}>
              <input type="radio" name="lang" value={l.id} checked={l.id === lang} onChange={() => setLang(l.id)} className="srOnly" />
              {l.label}
            </label>
          ))}
        </fieldset>
        <p className={styles.readout} aria-live="polite">{zoom ? `Zoom ${zoom.step} · ${zoom.count} names` : ""}</p>
      </header>
      <div className={styles.stage}>
        {failed === key ? <p className={styles.status}>The map data for {key} didn’t load.</p>
          : ready ? <LeafletOsmMap key={key} map={ready.map} labels={ready.labels} alt={`Nahlaot street map, ${frame} frame`}
            onZoomChange={(step, count) => setZoom({ step, count })} />
          : <p className={styles.status}>Loading the map…</p>}
      </div>
    </main>
  );
}
