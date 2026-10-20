"use client";

import { useEffect, useRef, type CSSProperties, type MouseEvent } from "react";
import { Icon } from "@/components/icons";
import { BASE_PATH } from "@/lib/base-path";
import type { MarkerState } from "@/lib/game/missionMap";
import type { SiteId } from "@/lib/game/types";
import styles from "./MissionMap.module.scss";

export type MarkerView = {
  id: SiteId;
  order: number;
  shortName: string;
  state: MarkerState;
  stateLabel: string;
  xPct: number;
  yPct: number;
  active: boolean;
};

export type AreaView = { id: string; name: string; xPct: number; yPct: number };

type MissionMapProps = {
  markers: MarkerView[];
  areas: AreaView[];
  // The marker to bring into view when the map is wider than the screen.
  focusId: SiteId | null;
  alt: string;
  onOpen: (id: SiteId) => void;
  onBackgroundClick: () => void;
};

const pos = (xPct: number, yPct: number) => ({ "--x": `${xPct}%`, "--y": `${yPct}%` }) as CSSProperties;

// The illustrated map: a static artwork with HTML markers on top, positioned in percentages so
// they stay on their spot at any size. On phones the map is taller than the screen is wide,
// so it pans sideways inside its own frame.
export default function MissionMap({ markers, areas, focusId, alt, onOpen, onBackgroundClick }: MissionMapProps) {
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    const focus = markers.find((m) => m.id === focusId);
    if (!viewport || !focus) return;
    const canvasWidth = viewport.scrollWidth;
    viewport.scrollLeft = Math.max(0, (focus.xPct / 100) * canvasWidth - viewport.clientWidth * 0.3);
  }, []); // On mount only: later panning is the visitor's.

  const onCanvasClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!(e.target instanceof Element) || !e.target.closest("button")) onBackgroundClick();
  };

  return (
    <div className={styles.frame}>
      <div ref={viewportRef} className={styles.viewport}>
        {/* Clicking the artwork closes an open card; markers and the stop list are the controls. */}
        <div className={styles.canvas} onClick={onCanvasClick}>
          <img className={styles.art} src={`${BASE_PATH}/map/investigation-map-prototype.svg`} alt={alt} draggable={false} />

          {areas.map((area) => (
            <span key={area.id} className={styles.area} style={pos(area.xPct, area.yPct)} aria-hidden="true">
              {area.name}
            </span>
          ))}

          {markers.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`${styles.marker} ${styles[m.state]} ${m.active ? styles.active : ""}`}
              style={pos(m.xPct, m.yPct)}
              aria-label={`${m.order}. ${m.shortName}: ${m.stateLabel}`}
              aria-pressed={m.active}
              onClick={() => onOpen(m.id)}
            >
              <span className={styles.pin}>
                {m.state === "next" ? (
                  <span className={styles.order}>{m.order}</span>
                ) : m.state === "complete" ? (
                  <Icon name="check" className={styles.pinIcon} />
                ) : (
                  <Icon name="locked" className={styles.pinIcon} />
                )}
              </span>
              <span className={styles.label} aria-hidden="true">
                {m.state === "next" ? <span className={styles.labelState}>{m.stateLabel}</span> : null}
                {m.shortName}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
