import { Icon } from "@/components/icons";
import ActionButton from "@/components/ui/ActionButton";
import StatusTag from "@/components/ui/StatusTag";
import { BASE_PATH } from "@/lib/base-path";
import type { Copy } from "@/lib/game/types";
import styles from "./PreviewDiscoveryStep.module.scss";

export type DiscoveryStepView = {
  title: string;
  number: number;
  label: string;
  text: string;
  // Where `text` is quoted from, when it is a source's own words.
  textSource: string | null;
  // The clue is framed as an evidence print; a locator photo is plain.
  photo: { src: string; alt: string; caption: Copy; framed: boolean } | null;
  notes: Copy[];
  link: { href: string; label: string; note: Copy } | null;
  hint: { label: string; text: string } | null;
  action: string;
};

// One step of a discovery mission: one idea, one optional hint, one main action.
export default function PreviewDiscoveryStep({ view: v, onAction }: { view: DiscoveryStepView; onAction: () => void }) {
  return (
    <section className={styles.question}>
      <h1 className={styles.title} tabIndex={-1} data-screen-heading>
        {v.title}
      </h1>

      <div className={styles.step}>
        <p className={styles.stepLabel}>
          <span className={styles.stepNumber}>{v.number}</span>
          {v.label}
        </p>
        <p className={styles.text}>{v.text}</p>
        {v.textSource ? <p className={styles.caption}>{v.textSource}</p> : null}
      </div>

      {v.photo ? (
        <figure className={v.photo.framed ? styles.clue : styles.locator}>
          <img src={`${BASE_PATH}${v.photo.src}`} alt={v.photo.alt} className={v.photo.framed ? styles.clueImage : styles.photo} />
          <figcaption className={v.photo.framed ? styles.clueCaption : styles.caption}>
            {v.photo.caption.text}
            <StatusTag status={v.photo.caption.status} tone={v.photo.framed ? "dark" : "light"} />
          </figcaption>
        </figure>
      ) : null}

      {v.link ? (
        <p className={styles.linkBlock}>
          <a href={v.link.href} target="_blank" rel="noopener noreferrer" className={styles.link}>
            {v.link.label}
            <Icon name="externalLink" className={styles.linkIcon} />
          </a>
          <span className={styles.caption}>
            {v.link.note.text}
            <StatusTag status={v.link.note.status} />
          </span>
        </p>
      ) : null}

      {v.notes.length ? (
        <ul className={styles.notes}>
          {v.notes.map((note) => (
            <li key={note.text} className={styles.noteItem}>
              <Icon name="info" className={styles.noteIcon} />
              <span>
                {note.text}
                <StatusTag status={note.status} />
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {v.hint ? (
        <details className={styles.hintToggle}>
          <summary className={styles.hintSummary}>
            <Icon name="hint" className={styles.hintIcon} />
            {v.hint.label}
          </summary>
          <p className={styles.hint}>{v.hint.text}</p>
        </details>
      ) : null}

      <ActionButton icon="arrowForward" block onClick={onAction}>
        {v.action}
      </ActionButton>
    </section>
  );
}
