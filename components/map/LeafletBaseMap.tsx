"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type * as Leaflet from "leaflet";
import { BASE_PATH } from "@/lib/base-path";
import { imageToLatLng, type ImageBaseMap } from "@/lib/map/image-map";
import styles from "./LeafletBaseMap.module.scss";

export type MapMarkerState = "active" | "locked" | "conditional" | "completed";

export type MapMarkerView = {
  id: string;
  label: string;
  // The number on the pin (route order).
  order: number;
  x: number;
  y: number;
  state: MapMarkerState;
  provisional: boolean;
  offMap: boolean;
  // Accessible name, e.g. "1. National Library of Israel: Next".
  ariaLabel?: string;
  symbol?: string;
  size?: 44 | 48;
};

export type MemoryLayerView = { id: string; x: number; y: number; radius: number; label: string; alignStart?: boolean };

// Where the visitor left the map: restored when they come back from a mission.
export type MapView = { center: [number, number]; zoom: number };

type LeafletBaseMapProps = {
  baseMap: ImageBaseMap;
  touchSize?: 48;
  alt: string;
  markers: MapMarkerView[];
  selectedId: string | null;
  memoryLayers: MemoryLayerView[];
  attribution: string | null;
  // A small notice over the map, e.g. "Concept map — not for navigation".
  notice?: string | null;
  // Marker to centre on when there is no saved view.
  focusId?: string | null;
  initialView?: MapView | null;
  onViewChange?: (view: MapView) => void;
  onImageError?: () => void;
  onSelect: (id: string) => void;
  onBackground: () => void;
};

type MapHandle = { L: typeof Leaflet; map: Leaflet.Map; markers: Leaflet.LayerGroup; memory: Leaflet.LayerGroup };

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

// A static base map (Leaflet CRS.Simple + ImageOverlay) with separate layers for mission
// markers and historical memory overlays. One image pixel is one map unit, so marker points
// come straight from the base map's placement records, never from the artwork. Pan,
// pinch-zoom and keyboard come from Leaflet.
export default function LeafletBaseMap(props: LeafletBaseMapProps) {
  const { baseMap, alt, markers, selectedId, memoryLayers, attribution, notice } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<MapHandle | null>(null);
  const [ready, setReady] = useState(0);
  // Latest props for Leaflet's listeners and the one-time setup, so they never go stale.
  const latest = useRef(props);
  useEffect(() => {
    latest.current = props;
  });

  // Create the map once per base map. Leaflet touches `window`, so it loads in the browser only.
  useEffect(() => {
    let cancelled = false;
    let map: Leaflet.Map | null = null;
    import("leaflet").then(({ default: L }) => {
      const el = containerRef.current;
      if (cancelled || !el) return;
      const p = latest.current;
      const m = L.map(el, { crs: L.CRS.Simple, zoomSnap: 0.25, zoomDelta: 0.5, attributionControl: true });
      map = m;
      m.attributionControl.setPrefix(false);
      const bounds = L.latLngBounds([0, 0], [baseMap.height, baseMap.width]);
      const overlay = L.imageOverlay(`${BASE_PATH}${baseMap.src}`, bounds, { alt });
      overlay.on("error", () => latest.current.onImageError?.());
      overlay.addTo(m);
      // Contain: the whole map fits. Cover: the map fills the frame (phones in portrait).
      const contain = m.getBoundsZoom(bounds, false);
      const cover = m.getBoundsZoom(bounds, true);
      m.setMinZoom(contain);
      m.setMaxZoom(Math.max(cover, contain) + 1.5);
      m.setMaxBounds(bounds.pad(0.1));
      const focus = p.markers.find((mk) => mk.id === p.focusId);
      if (p.initialView) m.setView(p.initialView.center, p.initialView.zoom, { animate: false });
      else m.setView(focus ? imageToLatLng(baseMap, focus.x, focus.y) : bounds.getCenter(), cover, { animate: false });
      m.on("moveend zoomend", () => {
        const c = m.getCenter();
        latest.current.onViewChange?.({ center: [c.lat, c.lng], zoom: m.getZoom() });
      });
      m.on("click", () => latest.current.onBackground());
      handleRef.current = { L, map: m, markers: L.layerGroup().addTo(m), memory: L.layerGroup().addTo(m) };
      setReady((n) => n + 1);
    });
    return () => {
      cancelled = true;
      map?.remove();
      handleRef.current = null;
    };
  }, [baseMap, alt]);

  // Attribution for the positions shown on top of the art.
  useEffect(() => {
    const h = handleRef.current;
    if (!h || !attribution) return;
    h.map.attributionControl.addAttribution(attribution);
    return () => {
      h.map.attributionControl.removeAttribution(attribution);
    };
  }, [ready, attribution]);

  // Marker layer.
  useEffect(() => {
    const h = handleRef.current;
    if (!h) return;
    h.markers.clearLayers();
    for (const m of markers) {
      const classes = [styles.pin, styles[m.state] ?? "", m.provisional ? styles.provisional : "", m.id === selectedId ? styles.selected : ""].join(" ");
      const icon = h.L.divIcon({
        className: `${styles.markerIcon} ${m.offMap ? styles.markerIconOffMap : ""}`,
        html: `<span class="${classes}" style="width:${m.size ?? 44}px;height:${m.size ?? 44}px">${escapeHtml(m.symbol ?? String(m.order))}</span><span class="${styles.label}">${escapeHtml(m.label)}</span>`,
        iconSize: [m.size ?? 44, m.size ?? 44],
        iconAnchor: [(m.size ?? 44) / 2, (m.size ?? 44) / 2],
      });
      const marker = h.L.marker(imageToLatLng(baseMap, m.x, m.y), { icon, keyboard: true, title: m.label, riseOnHover: true });
      // Marker clicks don't bubble to the map's click, which closes the card.
      marker.on("click", () => latest.current.onSelect(m.id));
      marker.on("add", () => {
        const el = marker.getElement();
        el?.setAttribute("role", "button");
        el?.setAttribute("aria-label", m.ariaLabel ?? m.label);
        el?.setAttribute("aria-pressed", String(m.id === selectedId));
      });
      marker.addTo(h.markers);
    }
  }, [ready, markers, selectedId, baseMap]);

  // Historical memory layer.
  useEffect(() => {
    const h = handleRef.current;
    if (!h) return;
    h.memory.clearLayers();
    for (const layer of memoryLayers) {
      h.L.circle(imageToLatLng(baseMap, layer.x, layer.y), { radius: layer.radius, className: styles.memory, interactive: false }).addTo(h.memory);
      h.L.marker(imageToLatLng(baseMap, layer.x, layer.y - layer.radius - 14), {
        icon: h.L.divIcon({ className: styles.memoryLabelIcon, html: `<span class="${styles.memoryLabel} ${layer.alignStart ? styles.memoryLabelStart : ""}">${escapeHtml(layer.label)}</span>`, iconSize: [0, 0] }),
        interactive: false,
        keyboard: false,
      }).addTo(h.memory);
    }
  }, [ready, memoryLayers, baseMap]);

  return (
    <div className={styles.frame} style={{ "--map-control-size": props.touchSize ? `${props.touchSize}px` : undefined } as CSSProperties}>
      <div ref={containerRef} className={styles.map} role="region" aria-label={alt} />
      {notice ? <p className={styles.notice}>{notice}</p> : null}
    </div>
  );
}
