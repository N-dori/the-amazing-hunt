import { Icon } from "@/components/icons";
import ActionButton from "@/components/ui/ActionButton";
import EvidenceTag from "@/components/ui/EvidenceTag";
import StatusTag from "@/components/ui/StatusTag";
import type { MemoryOverlay } from "@/lib/game/basemaps";
import type { Copy } from "@/lib/game/types";
import styles from "./PreviewMapDestination.module.scss";

type PreviewMapDestinationProps = {
  name: string;
  status: Copy;
  // Null once the place and its placement are field-verified.
  provisionalLabel: string | null;
  photoPending: Copy;
  nav: { osm: string; google: string } | null;
  navLabel: string;
  navNote: Copy;
  stateLabel: string;
  memory: MemoryOverlay | null;
  completeLabel: string;
  resetLabel: string;
  closeLabel: string;
  completed: boolean;
  onComplete: () => void;
  onReset: () => void;
  onClose: () => void;
};

// The destination card of the map preview: photo slot, field status, external walking
// directions, and, once the mission is completed, the restored memory.
export default function PreviewMapDestination(p: PreviewMapDestinationProps) {
  return (
    <section className={`${styles.card} ${p.completed ? styles.cardDone : ""}`} aria-label={p.name}>
      <div className={styles.top}>
        <p className={styles.state}>{p.stateLabel}</p>
        <button type="button" className={styles.close} onClick={p.onClose} aria-label={p.closeLabel}>
          <Icon name="close" className={styles.closeIcon} />
        </button>
      </div>

      <figure className={styles.photo}>
        <Icon name="camera" className={styles.photoIcon} />
        <figcaption className={styles.photoCaption}>
          {p.photoPending.text}
          <StatusTag status={p.photoPending.status} />
        </figcaption>
      </figure>

      <h2 className={styles.name}>{p.name}</h2>
      <p className={styles.status}>
        {p.provisionalLabel ? <span className={styles.provisional}>{p.provisionalLabel}</span> : null}
        {p.status.text}
        <StatusTag status={p.status.status} />
      </p>

      {p.nav ? (
        <div className={styles.nav}>
          <p className={styles.navLabel}>
            <Icon name="compass" className={styles.navIcon} />
            {p.navLabel}
          </p>
          <p className={styles.navLinks}>
            <a href={p.nav.osm} target="_blank" rel="noopener noreferrer" className={styles.navLink}>
              OpenStreetMap
              <Icon name="externalLink" className={styles.navLinkIcon} />
            </a>
            <a href={p.nav.google} target="_blank" rel="noopener noreferrer" className={styles.navLink}>
              Google Maps
              <Icon name="externalLink" className={styles.navLinkIcon} />
            </a>
          </p>
          <p className={styles.navNote}>
            {p.navNote.text}
            <StatusTag status={p.navNote.status} />
          </p>
        </div>
      ) : null}

      {p.memory ? (
        <div className={styles.memory} role="status">
          <p className={styles.memoryTitle}>{p.memory.title.text}</p>
          <p className={styles.memoryChange}>
            <span>{p.memory.before.text}</span>
            <Icon name="arrowForward" className={styles.memoryArrow} />
            <span>{p.memory.after.text}</span>
          </p>
          <p className={styles.memoryNote}>{p.memory.uncertainty.text}</p>
          <EvidenceTag claim={p.memory.claim} />
          {p.memory.illustrative ? (
            <p className={styles.memoryNote}>
              {p.memory.illustrative.text}
              <StatusTag status={p.memory.illustrative.status} />
            </p>
          ) : null}
        </div>
      ) : null}

      {p.completed ? (
        <ActionButton variant="quiet" onClick={p.onReset}>
          {p.resetLabel}
        </ActionButton>
      ) : (
        <ActionButton icon="check" block onClick={p.onComplete}>
          {p.completeLabel}
        </ActionButton>
      )}
    </section>
  );
}
