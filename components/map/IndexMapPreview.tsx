"use client";

import { useCallback, useMemo, useState } from "react";
import StatusTag from "@/components/ui/StatusTag";
import {
  baseMaps,
  externalNavLinks,
  mapPreview,
  markerRecords,
  memoryOverlays,
  placedMarkers,
  unplacedMarkers,
  visibleMemoryLayers,
  type BaseMapId,
  type MarkerId,
  type MemoryMissionId,
} from "@/lib/game/basemaps";
import { mapScreen } from "@/lib/game/screens";
import LeafletBaseMap, { type MapMarkerView, type MemoryLayerView } from "./LeafletBaseMap";
import PreviewMapDestination from "./PreviewMapDestination";
import styles from "./IndexMapPreview.module.scss";

const BASE_MAP_ORDER: BaseMapId[] = ["illustratedCandidate", "schematic"];

// Development preview of the candidate illustrated base map: one active destination, its
// preview card with a photo slot, and the historical layer after the mission is completed.
// Local demo state only; the player flow is unchanged.
export default function IndexMapPreview() {
  const [baseMapId, setBaseMapId] = useState<BaseMapId>("illustratedCandidate");
  const [selectedId, setSelectedId] = useState<MarkerId | null>("synagogue");
  const [completed, setCompleted] = useState(false);
  const baseMap = baseMaps[baseMapId];

  const placed = useMemo(() => placedMarkers(baseMapId), [baseMapId]);
  const markers = useMemo<MapMarkerView[]>(
    () =>
      placed.map((m, i) => ({
        id: m.id,
        label: m.name.text,
        order: i + 1,
        x: m.x,
        y: m.y,
        state: completed && m.id === "synagogue" ? "completed" : m.id === "synagogue" ? "active" : "locked",
        provisional: m.provisional,
        offMap: m.offMap,
      })),
    [placed, completed],
  );
  // The demo completes the synagogue reconstruction only.
  const memoryLayers = useMemo<MemoryLayerView[]>(() => {
    const done = new Set<MemoryMissionId>(completed ? ["synagogueReconstruction"] : []);
    return visibleMemoryLayers(baseMapId, done).map((l) => ({ id: l.overlay.id, x: l.x, y: l.y, radius: l.overlay.radius, label: l.overlay.title.text, alignStart: l.x < 160 }));
  }, [completed, baseMapId]);

  const record = markerRecords.find((r) => r.id === selectedId) ?? null;
  const overlay = memoryOverlays.find((o) => o.markerId === selectedId && o.unlockedBy === "synagogueReconstruction") ?? null;
  const pending = unplacedMarkers(baseMapId);

  const select = useCallback((id: string) => setSelectedId((cur) => (cur === id ? null : (id as MarkerId))), []);
  const clear = useCallback(() => setSelectedId(null), []);

  return (
    <main className={styles.page}>
      <header className={styles.head}>
        <p className={styles.badge}>
          {mapPreview.devBadge.text}
          <StatusTag status={mapPreview.devBadge.status} />
        </p>
        <h1 className={styles.title}>{mapPreview.title.text}</h1>
        <p className={styles.intro}>{mapPreview.intro.text}</p>
        <ol className={styles.steps}>
          {mapPreview.steps.map((step, i) => (
            <li key={i}>{step.text}</li>
          ))}
        </ol>
      </header>

      <div className={styles.controls}>
        <fieldset className={styles.switch}>
          <legend className={styles.legend}>{mapPreview.baseMapLabel.text}</legend>
          {BASE_MAP_ORDER.map((id) => (
            <label key={id} className={`${styles.option} ${id === baseMapId ? styles.optionOn : ""}`}>
              <input type="radio" name="baseMap" value={id} checked={id === baseMapId} onChange={() => setBaseMapId(id)} className="srOnly" />
              {baseMaps[id].label.text}
            </label>
          ))}
        </fieldset>
        <p className={styles.notice}>
          {baseMap.notice.text}
          <StatusTag status={baseMap.notice.status} />
        </p>
      </div>

      <div className={styles.layout}>
        <LeafletBaseMap
          baseMap={baseMap}
          alt={mapScreen.mapAlt.text}
          markers={markers}
          selectedId={selectedId}
          memoryLayers={memoryLayers}
          attribution={placed.length > 0 ? mapPreview.attribution : null}
          onSelect={select}
          onBackground={clear}
        />

        <aside className={styles.aside}>
          {record ? (
            <PreviewMapDestination
              name={record.name.text}
              status={record.fieldStatus}
              provisionalLabel={record.geo?.verified ? null : mapPreview.provisional.text}
              photoPending={mapPreview.photoPending}
              nav={externalNavLinks(record.geo)}
              navLabel={mapPreview.navigate.text}
              navNote={mapPreview.navigateNote}
              stateLabel={completed ? mapPreview.completed.text : mapPreview.active.text}
              memory={completed && overlay ? overlay : null}
              completeLabel={mapPreview.complete.text}
              resetLabel={mapPreview.reset.text}
              closeLabel={mapPreview.close.text}
              completed={completed}
              onComplete={() => setCompleted(true)}
              onReset={() => setCompleted(false)}
              onClose={clear}
            />
          ) : null}

          <section className={styles.pending}>
            <h2 className={styles.pendingHeading}>{mapPreview.pendingHeading.text}</h2>
            <ul className={styles.pendingList}>
              {pending.map((r) => (
                <li key={r.id} className={styles.pendingItem}>
                  <span className={styles.pendingName}>{r.name.text}</span>
                  <span className={styles.pendingStatus}>{r.fieldStatus.text}</span>
                </li>
              ))}
            </ul>
            <p className={styles.audit}>{mapPreview.audit.text}</p>
          </section>
        </aside>
      </div>
    </main>
  );
}
