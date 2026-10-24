import ParticipantAvatar from "./ParticipantAvatar";
import type { ParticipantIdentityView } from "@/lib/amazing-shuk/participant-identity";
import styles from "./PreviewParticipantIdentity.module.scss";
type Props = ParticipantIdentityView & { label?: string; showResponsibilities?: boolean };
export default function PreviewParticipantIdentity({ participantId, displayName, customImageSrc, responsibilities, label, showResponsibilities = true }: Props) {
  return <div className={styles.identity}>
    <ParticipantAvatar participantId={participantId} displayName={displayName} customImageSrc={customImageSrc} label="" />
    <div className={styles.caption}>
      {label ? <span className={styles.label}>{label}</span> : null}
      <strong>{displayName}</strong>
      {showResponsibilities && responsibilities.length ? <span>{responsibilities.join(" / ")}</span> : null}
    </div>
  </div>;
}
