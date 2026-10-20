"use client";

import { useEffect, useRef } from "react";
import { Icon } from "@/components/icons";
import ActionButton from "@/components/ui/ActionButton";
import EvidenceTag from "@/components/ui/EvidenceTag";
import StatusTag from "@/components/ui/StatusTag";
import type { MarkerState } from "@/lib/game/missionMap";
import { BASE_PATH } from "@/lib/base-path";
import { mapScreen } from "@/lib/game/screens";
import type { ClaimType, Copy, SiteId } from "@/lib/game/types";
import styles from "./PreviewMission.module.scss";

export type DestinationView = {
  id: SiteId;
  order: number;
  name: string;
  hebrew: string | null;
  state: MarkerState;
  stateLabel: string;
  kicker: string;
  summary: string;
  clue: Copy | null;
  lockedReason: string | null;
  action: string | null;
  // The mission this stop starts, e.g. "Mission 00B · The First Memory Keepers".
  missionTitle: string | null;
  // Progress at this stop, e.g. "Mission 00B complete · …".
  statusNote: string | null;
  // Set when the stop has no point on the current map yet.
  locationNote: string | null;
  photo: { src: string; alt: string; caption: Copy } | null;
  memory: DestinationMemory | null;
};

export type DestinationMemory = {
  title: string;
  before: string;
  after: string;
  note: string;
  claim: ClaimType;
  image: { src: string; alt: string } | null;
  illustrative: Copy | null;
};

type PreviewMissionProps = {
  destination: DestinationView;
  onClose: () => void;
  onAction: () => void;
};

// The destination card: a bottom sheet on phones, a panel beside the map on wide screens.
export default function PreviewMission({ destination: d, onClose, onAction }: PreviewMissionProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const headingId = `destination-${d.id}`;
  const open = d.state === "next" || d.state === "complete";

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, [d.id]);

  return (
    <section className={`${styles.card} ${open ? "" : styles.closed}`} aria-labelledby={headingId}>
      <div className={styles.top}>
        <p className={styles.kicker}>
          <span className={styles.order}>{String(d.order).padStart(2, "0")}</span>
          <span className={styles.state}>
            {open ? null : <Icon name="locked" className={styles.stateIcon} />}
            {d.stateLabel}
          </span>
          <span>{d.kicker}</span>
        </p>
        <button type="button" className={styles.close} onClick={onClose} aria-label={mapScreen.close.text}>
          <Icon name="close" className={styles.closeIcon} />
        </button>
      </div>

      {d.photo ? (
        <figure className={styles.photo}>
          <img src={`${BASE_PATH}${d.photo.src}`} alt={d.photo.alt} className={styles.photoImage} />
          <figcaption className={styles.photoCaption}>
            {d.photo.caption.text}
            <StatusTag status={d.photo.caption.status} />
          </figcaption>
        </figure>
      ) : null}

      {d.missionTitle ? <p className={styles.mission}>{d.missionTitle}</p> : null}

      <h2 ref={headingRef} id={headingId} className={styles.name} tabIndex={-1}>
        {d.name}
        {d.hebrew ? (
          <span className={`${styles.hebrew} rtl`} lang="he">
            {d.hebrew}
          </span>
        ) : null}
      </h2>

      {d.statusNote ? (
        <p className={styles.statusNote}>
          <Icon name="check" className={styles.statusIcon} />
          {d.statusNote}
        </p>
      ) : null}

      <p className={styles.summary}>{d.summary}</p>

      {d.locationNote ? (
        <p className={styles.locationNote}>
          <Icon name="mapMarker" className={styles.locationIcon} />
          {d.locationNote}
        </p>
      ) : null}

      {d.clue ? (
        <div className={styles.clue}>
          <p className={styles.clueLabel}>
            <Icon name="compass" className={styles.clueIcon} />
            {mapScreen.clueLabel.text}
          </p>
          <p className={styles.clueText}>
            {d.clue.text}
            <StatusTag status={d.clue.status} />
          </p>
        </div>
      ) : null}

      {d.memory ? (
        <div className={styles.memory} role="status">
          <p className={styles.memoryTitle}>{d.memory.title}</p>
          {d.memory.image ? <img src={`${BASE_PATH}${d.memory.image.src}`} alt={d.memory.image.alt} className={styles.memoryImage} /> : null}
          <p className={styles.memoryChange}>
            <span>{d.memory.before}</span>
            <Icon name="arrowForward" className={styles.memoryArrow} />
            <span>{d.memory.after}</span>
          </p>
          <p className={styles.memoryNote}>{d.memory.note}</p>
          <EvidenceTag claim={d.memory.claim} />
          {d.memory.illustrative ? (
            <p className={styles.illustrative}>
              {d.memory.illustrative.text}
              <StatusTag status={d.memory.illustrative.status} />
            </p>
          ) : null}
        </div>
      ) : null}

      {d.lockedReason ? (
        <p className={styles.locked}>
          <Icon name="locked" className={styles.lockedIcon} />
          {d.lockedReason}
        </p>
      ) : null}

      {d.action ? (
        <div className={styles.actions}>
          <ActionButton icon="arrowForward" block onClick={onAction}>
            {d.action}
          </ActionButton>
        </div>
      ) : null}
    </section>
  );
}
