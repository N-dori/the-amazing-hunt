"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type * as Leaflet from "leaflet";
import { BASE_PATH } from "@/lib/base-path";
import { imageToLatLng, type ImageBaseMap } from "@/lib/map/image-map";
import { NEW_HINT_MEMORY, shouldShowTwoFingerHint, TWO_FINGER_HINT, type TwoFingerHintMemory } from "@/lib/map/two-finger-hint";
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
  // Optional frame styling from the caller (The Amazing Shuk's field card); it may set --map-height and --map-border.
  frameClassName?: string;
  // Pan just enough to keep the selected marker in view when it changes or the frame resizes. `bottomInset` is the
  // height (px) of anything overlapping the frame's lower edge, such as The Amazing Shuk's preview sheet.
  keepSelectedVisible?: { bottomInset: number };
  // Names under the pins; on by default. The Amazing Shuk hides them: the pin's number and its preview name the place.
  showLabels?: boolean;
  // Zoom levels to allow below "contain", so the group can pinch out further.
  zoomOutBy?: number;
  // Open on all the markers, as close as fits them (with a pin's margin), instead of "cover" around `focusId`.
  openOnMarkers?: boolean;
  // Two-finger mode (The Amazing Shuk): one finger scrolls the page, two fingers pan and pinch, a mouse still drags. The text is
  // the hint shown when a finger tries to drag the map alone.
  twoFingerHint?: string;
};

type MapHandle = { L: typeof Leaflet; map: Leaflet.Map; markers: Leaflet.LayerGroup; memory: Leaflet.LayerGroup };

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

// Kept for the page's life, across the map's remounts (map → location → map), so the hint's cooldown holds.
let hintMemory: TwoFingerHintMemory = NEW_HINT_MEMORY;
const pageScroll = () => document.scrollingElement?.scrollTop ?? 0;

// A static base map (Leaflet CRS.Simple + ImageOverlay) with separate layers for mission
// markers and historical memory overlays. One image pixel is one map unit, so marker points
// come straight from the base map's placement records, never from the artwork. Pan,
// pinch-zoom and keyboard come from Leaflet.
export default function LeafletBaseMap(props: LeafletBaseMapProps) {
  const { baseMap, alt, markers, selectedId, memoryLayers, attribution, notice } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<MapHandle | null>(null);
  const [ready, setReady] = useState(0);
  const [hintVisible, setHintVisible] = useState(false);
  const twoFinger = Boolean(props.twoFingerHint);
  // Latest props for Leaflet's listeners and the one-time setup, so they never go stale.
  const latest = useRef(props);
  useEffect(() => {
    latest.current = props;
  });

  // Pans only if the selected marker (with its label) would sit under the edges or the overlapping sheet.
  function revealSelected() {
    const h = handleRef.current;
    const { keepSelectedVisible, selectedId: id, markers: current } = latest.current;
    const selected = keepSelectedVisible && id ? current.find((m) => m.id === id) : undefined;
    if (!h || !keepSelectedVisible || !selected) return;
    const size = selected.size ?? 44;
    const reduceMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    h.map.panInside(imageToLatLng(baseMap, selected.x, selected.y), {
      paddingTopLeft: [size, size],
      // The label sits under the pin, so leave room for it as well as the overlap.
      paddingBottomRight: [size, keepSelectedVisible.bottomInset + size * 1.5],
      animate: !reduceMotion,
    });
  }

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
      const zoomOutBy = p.zoomOutBy ?? 0;
      m.setMinZoom(contain - zoomOutBy);
      m.setMaxZoom(Math.max(cover, contain) + 1.5);
      m.setMaxBounds(bounds.pad(0.1));
      const focus = p.markers.find((mk) => mk.id === p.focusId);
      if (p.initialView) m.setView(p.initialView.center, p.initialView.zoom, { animate: false });
      else if (p.openOnMarkers && p.markers.length > 1) {
        const pin = Math.max(...p.markers.map((mk) => mk.size ?? 44));
        m.fitBounds(L.latLngBounds(p.markers.map((mk) => imageToLatLng(baseMap, mk.x, mk.y))), { padding: [pin, pin], maxZoom: cover + 1, animate: false });
      } else m.setView(focus ? imageToLatLng(baseMap, focus.x, focus.y) : bounds.getCenter(), cover, { animate: false });
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
        html: `<span class="${classes}" style="width:${m.size ?? 44}px;height:${m.size ?? 44}px">${escapeHtml(m.symbol ?? String(m.order))}</span>${latest.current.showLabels === false ? "" : `<span class="${styles.label}">${escapeHtml(m.label)}</span>`}`,
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

  // Leaflet only re-measures on window resize; a caller's layout can also resize the frame (e.g. a sheet opening below it).
  useEffect(() => {
    const h = handleRef.current;
    const el = containerRef.current;
    if (!h || !el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      h.map.invalidateSize({ pan: false });
      revealSelected();
    });
    observer.observe(el);
    return () => observer.disconnect();
    // revealSelected reads the latest props through `latest`, so it needn't re-subscribe the observer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  useEffect(() => { revealSelected(); }, [ready, selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Two-finger mode. Leaflet's two-finger handler already pans with the fingers' midpoint while it pinches, so only its one-finger
  // drag has to step aside: it is turned off for touch and back on for a mouse or pen. The listeners capture on the frame, so they
  // run before Leaflet's own on the map container; the stylesheet lets the browser scroll the page under one finger.
  useEffect(() => {
    const h = handleRef.current;
    const frame = frameRef.current;
    if (!h || !frame || !twoFinger) return;
    const { map } = h;
    let gesture: { x: number; y: number; scroll: number; shown: boolean } | null = null;
    let timer: number | undefined;
    const hide = () => { window.clearTimeout(timer); setHintVisible(false); };
    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "touch") map.dragging.disable();
      else map.dragging.enable();
    };
    const onTouchStart = (e: TouchEvent) => {
      map.dragging.disable();
      if (e.touches.length > 1) {
        // Two fingers: the player knows the gesture, so the hint goes and doesn't come back.
        gesture = null;
        hintMemory = { ...hintMemory, learned: true };
        hide();
        return;
      }
      gesture = { x: e.touches[0].clientX, y: e.touches[0].clientY, scroll: pageScroll(), shown: false };
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!gesture || e.touches.length !== 1) return;
      const distance = Math.hypot(e.touches[0].clientX - gesture.x, e.touches[0].clientY - gesture.y);
      const now = Date.now();
      if (!shouldShowTwoFingerHint({ distance, pageScrolled: pageScroll() !== gesture.scroll, alreadyShown: gesture.shown }, hintMemory, now)) return;
      gesture.shown = true;
      hintMemory = { ...hintMemory, lastShownAt: now };
      window.clearTimeout(timer);
      setHintVisible(true);
      timer = window.setTimeout(() => setHintVisible(false), TWO_FINGER_HINT.showFor);
    };
    const onTouchEnd = (e: TouchEvent) => { if (e.touches.length === 0) gesture = null; };
    const passive = { capture: true, passive: true } as const;
    frame.addEventListener("pointerdown", onPointerDown, true);
    frame.addEventListener("touchstart", onTouchStart, passive);
    frame.addEventListener("touchmove", onTouchMove, passive);
    frame.addEventListener("touchend", onTouchEnd, passive);
    frame.addEventListener("touchcancel", onTouchEnd, passive);
    return () => {
      frame.removeEventListener("pointerdown", onPointerDown, true);
      frame.removeEventListener("touchstart", onTouchStart, passive);
      frame.removeEventListener("touchmove", onTouchMove, passive);
      frame.removeEventListener("touchend", onTouchEnd, passive);
      frame.removeEventListener("touchcancel", onTouchEnd, passive);
      hide();
    };
  }, [ready, twoFinger]);

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
    <div ref={frameRef} className={`${styles.frame} ${props.frameClassName ?? ""}`} style={{ "--map-control-size": props.touchSize ? `${props.touchSize}px` : undefined } as CSSProperties}>
      <div ref={containerRef} className={`${styles.map} ${twoFinger ? styles.twoFinger : ""}`} role="region" aria-label={alt} />
      {notice ? <p className={styles.notice}>{notice}</p> : null}
      {/* Always in the page, so a screen reader announces the hint when it appears; it never takes a tap. */}
      {twoFinger ? <p className={`${styles.gestureHint} ${hintVisible ? styles.gestureHintVisible : ""}`} role="status">{hintVisible ? props.twoFingerHint : ""}</p> : null}
    </div>
  );
}
