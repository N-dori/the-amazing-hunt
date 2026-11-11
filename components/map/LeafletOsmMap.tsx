"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import { Icon, type IconName } from "@/components/icons";
import { labelsAt, labelStyle, labelTransform, snapZoom } from "@/lib/map/osm-label-view";
import type { OsmMapGeometry, OsmMapLabel, OsmMapLabelFile, OsmMapPoi } from "@/lib/map/osm-projection";
import { casingWidth, roadWidth, svgLayers } from "@/lib/map/osm-svg";
import styles from "./LeafletOsmMap.module.scss";

type Props = {
  map: OsmMapGeometry;
  labels: OsmMapLabelFile;
  alt: string;
  // The label step the map shows and how many labels it holds, after every zoom.
  onZoomChange?: (step: number, labelCount: number) => void;
};

const SVG_NS = "http://www.w3.org/2000/svg";
// The map layers' icons, from the game's icon set (components/icons/iconPaths.tsx).
const POI_ICONS: Record<OsmMapPoi["kind"], IconName> = { synagogue: "starOfDavid", toilets: "toilets", drinkingWater: "drinkingWater", tram: "tram" };
const POI_KINDS = Object.keys(POI_ICONS) as OsmMapPoi["kind"][];
const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

// The OSM navigation map (Type B, docs/design/map-types-spec.md) drawn from data/shuk-map-nahlaot-<frame>.json: the
// streets, buildings and areas as one SVG overlay in map units, and the names as HTML text at a fixed pixel size in a
// pane above it, redrawn at each label step. Leaflet CRS.Simple: zoom z shows 2^z pixels per map unit, which is what the
// labels' minZoom was computed for (scripts/map/label-layout.mjs), so the data is never rescaled.
export default function LeafletOsmMap({ map: geo, labels, alt, onZoomChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  // The icons rendered once by React, hidden; each map-layer marker on the map is a copy.
  const spriteRef = useRef<HTMLDivElement>(null);
  const onZoom = useRef(onZoomChange);
  useEffect(() => {
    onZoom.current = onZoomChange;
  });

  useEffect(() => {
    let cancelled = false;
    let leafletMap: import("leaflet").Map | null = null;
    import("leaflet").then(({ default: L }) => {
      const el = containerRef.current;
      if (cancelled || !el) return;
      const { width: W, height: H } = geo.artboard;
      const upm = geo.projection.unitsPerMetre;
      const zooms = labels.meta.zooms;
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const m = L.map(el, {
        crs: L.CRS.Simple, zoomSnap: 0.5, zoomDelta: 0.5, attributionControl: true,
        zoomAnimation: !reduceMotion, fadeAnimation: !reduceMotion, markerZoomAnimation: !reduceMotion, inertia: !reduceMotion,
      });
      leafletMap = m;
      m.attributionControl.setPrefix(false);
      m.attributionControl.addAttribution(`<a href="${escapeHtml(geo.meta.creditUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(geo.meta.credit)}</a>`);

      // The base layer: one SVG in map units. Its top-left is the bounds' north-west, so data y (down) needs no flip here.
      const bounds = L.latLngBounds([0, 0], [H, W]);
      const svg = document.createElementNS(SVG_NS, "svg");
      svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
      svg.setAttribute("class", styles.base);
      const marginRoads = document.createElementNS(SVG_NS, "g");
      marginRoads.setAttribute("class", `${styles.roads} ${styles.margin}`);
      const frameRoads = document.createElementNS(SVG_NS, "g");
      frameRoads.setAttribute("class", styles.roads);
      const bands: { path: SVGPathElement; road: number; casing: boolean }[] = [];
      for (const layer of svgLayers(geo)) {
        const path = document.createElementNS(SVG_NS, "path");
        path.setAttribute("d", layer.d);
        if (layer.kind === "fill") {
          path.setAttribute("class", styles[layer.style]);
          svg.appendChild(path);
        } else {
          path.setAttribute("class", layer.style === "casing" ? styles.casing : styles.band);
          (layer.margin ? marginRoads : frameRoads).appendChild(path);
          bands.push({ path, road: layer.road, casing: layer.style === "casing" });
        }
      }
      svg.append(marginRoads, frameRoads);
      L.svgOverlay(svg, bounds, { interactive: false }).addTo(m);

      // Bands keep their width in map units; only the casing's hairline and the narrowest band are fixed on screen.
      const restyle = () => {
        const z = m.getZoom();
        for (const b of bands) {
          const road = geo.roads[b.road];
          b.path.setAttribute("stroke-width", String(b.casing ? casingWidth(road, upm, z) : roadWidth(road, upm, z)));
        }
      };

      // The names: HTML text in its own pane (bidi-safe for mixed Hebrew and English), hidden while a zoom animates.
      const pane = m.createPane("osmLabels");
      pane.classList.add(styles.labels);
      const s = labels.meta.styles;
      for (const [name, px] of [["main", s.main.fontPx], ["brief", s.mainBrief.fontPx], ["alley", s.alley.fontPx], ["place", s.place.fontPx],
        ["placeAlt", s.place.altFontPx ?? s.place.fontPx], ["neighbourhood", s.neighbourhood.fontPx], ["courtyard", s.courtyard.fontPx],
        ["neighbourhoodLetter", s.neighbourhood.letterPx ?? 0], ["courtyardLetter", s.courtyard.letterPx ?? 0],
        ["poiName", s.poiName.fontPx], ["poiIcon", s.poi.iconPx]] as const) {
        pane.style.setProperty(`--label-${name}`, `${px}px`);
      }
      const iconOf = (kind: OsmMapPoi["kind"]) => spriteRef.current?.querySelector(`[data-poi="${kind}"] svg`)?.cloneNode(true) ?? null;
      const labelEl = (l: OsmMapLabel) => {
        const span = document.createElement("span");
        const poi = l.poi !== undefined ? geo.pois[l.poi] : undefined;
        if (l.kind === "poi" && poi) {
          span.className = [styles.poi, styles[`poi_${poi.kind}`], poi.inFrame === false ? styles.outside : ""].join(" ");
          const icon = iconOf(poi.kind);
          if (icon) span.appendChild(icon);
          const p = m.latLngToLayerPoint([H - l.y, l.x]);
          span.style.left = `${p.x}px`;
          span.style.top = `${p.y}px`;
          return span;
        }
        const placeKind = l.kind === "place" && l.p !== undefined ? geo.places[l.p]?.kind : undefined;
        span.className = [styles.label, styles[labelStyle(l)], placeKind ? styles[`place_${placeKind}`] : "", poi ? styles[`poiName_${poi.kind}`] : "",
          l.inFrame === false ? styles.outside : ""].join(" ");
        span.dir = "auto";
        for (const [i, line] of l.text.entries()) {
          const lineEl = document.createElement("span");
          lineEl.className = i ? styles.altLine : styles.line;
          lineEl.textContent = line;
          span.appendChild(lineEl);
        }
        // Position and angle differ for every label: the one place this component sets inline styles.
        const p = m.latLngToLayerPoint([H - l.y, l.x]);
        span.style.left = `${p.x}px`;
        span.style.top = `${p.y}px`;
        span.style.transform = labelTransform(l);
        return span;
      };
      const drawLabels = () => {
        const step = snapZoom(m.getZoom(), zooms);
        const shown = labelsAt(labels.labels, step);
        // Street level reads larger: the layout sized those labels for it (labels.meta.streetLevel).
        const { streetLevel } = labels.meta;
        pane.style.setProperty("--label-scale", String(step === streetLevel.zoom ? streetLevel.scale : 1));
        pane.replaceChildren(...shown.map(labelEl));
        pane.classList.remove(styles.labelsHidden);
        onZoom.current?.(step, shown.length);
      };

      // Zoom range: from the whole artboard (never further out than the labels' first step) to street level.
      const fit = Math.floor(m.getBoundsZoom(bounds, false) * 2) / 2;
      m.setMinZoom(Math.max(zooms[0], Math.min(fit, zooms.at(-1)!)));
      m.setMaxZoom(zooms.at(-1)!);
      m.setMaxBounds(bounds.pad(0.05));
      m.on("zoomstart", () => pane.classList.add(styles.labelsHidden));
      m.on("zoomend viewreset", () => { restyle(); drawLabels(); });
      m.setView(bounds.getCenter(), m.getMinZoom(), { animate: false });
      restyle();
      drawLabels();
    });
    return () => {
      cancelled = true;
      leafletMap?.remove();
    };
  }, [geo, labels]);

  return <>
    <div ref={containerRef} className={styles.map} role="region" aria-label={alt} />
    <div ref={spriteRef} hidden>{POI_KINDS.map((kind) => <span key={kind} data-poi={kind}><Icon name={POI_ICONS[kind]} /></span>)}</div>
  </>;
}
