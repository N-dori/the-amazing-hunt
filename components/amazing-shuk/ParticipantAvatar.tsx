"use client";
import { useMemo, useState, type CSSProperties } from "react";
import Image from "next/image";
import { availableAvatarSource, createParticipantAvatar, customParticipantImage, participantInitials } from "@/lib/amazing-shuk/participant-avatar";
import styles from "./ParticipantAvatar.module.scss";

type Props = { participantId: string; displayName: string; customImageSrc?: string | null; size?: number; label?: string };
export default function ParticipantAvatar({ participantId, displayName, customImageSrc, size = 48, label }: Props) {
  const generated = useMemo(() => createParticipantAvatar(participantId), [participantId]);
  const [failed, setFailed] = useState<readonly string[]>([]);
  const source = availableAvatarSource(customParticipantImage(customImageSrc), generated, failed);
  const pixels = Number.isFinite(size) ? Math.max(16, Math.min(128, size)) : 48;
  const accessibleLabel = label ?? `Avatar for ${displayName}`;
  return <span className={styles.avatar} style={{ "--participant-avatar-size": `${pixels}px` } as CSSProperties}>
    {source ? <Image unoptimized src={source} width={pixels} height={pixels} alt={accessibleLabel} className={styles.image}
      referrerPolicy="no-referrer" onError={() => setFailed(current => current.includes(source) ? current : [...current, source])} />
      : <span className={styles.initials} role={accessibleLabel ? "img" : undefined} aria-label={accessibleLabel || undefined} aria-hidden={accessibleLabel ? undefined : true}>{participantInitials(displayName)}</span>}
  </span>;
}
