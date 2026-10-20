import { Icon } from "@/components/icons";
import ActionButton from "@/components/ui/ActionButton";
import EvidenceTag from "@/components/ui/EvidenceTag";
import StatusTag from "@/components/ui/StatusTag";
import { BASE_PATH } from "@/lib/base-path";
import type { ClaimType, Copy } from "@/lib/game/types";
import styles from "./PreviewDiscoveryReveal.module.scss";

type Labelled = Copy & { claim: ClaimType };

export type DiscoveryRevealView = {
  kicker: string;
  heading: Copy;
  guideSolved: string | null;
  photo: { src: string; alt: string; caption: Copy };
  record: { lines: string[]; claim: ClaimType; source: string } | null;
  documented: Labelled;
  documentedSource: Copy;
  documentedNote: Copy | null;
  message: Labelled | null;
  yourReading: { label: string; text: string } | null;
  harmony: Labelled;
  sourcesLabel: string;
  sources: { id: string; title: string; url: string | null; note: Copy }[];
  continueLabel: string;
};

// The reveal: the answer, the whole photograph, the object's own record, what the source says,
// the team's own reading, and HARMONY's reflection. Each block carries its own evidence label.
export default function PreviewDiscoveryReveal({ view: v, onContinue }: { view: DiscoveryRevealView; onContinue: () => void }) {
  return (
    <section className={styles.reveal}>
      <header className={styles.head}>
        <p className={styles.kicker}>{v.kicker}</p>
        <h1 className={styles.answer} tabIndex={-1} data-screen-heading>
          {v.heading.text}
        </h1>
        {v.guideSolved ? <p className={styles.guide}>{v.guideSolved}</p> : null}
      </header>

      <figure className={styles.figure}>
        <img src={`${BASE_PATH}${v.photo.src}`} alt={v.photo.alt} className={styles.figureImage} />
        <figcaption className={styles.figureCaption}>
          {v.photo.caption.text}
          <StatusTag status={v.photo.caption.status} tone="dark" />
        </figcaption>
      </figure>

      {v.record ? (
        <div className={styles.record}>
          <EvidenceTag claim={v.record.claim} />
          <p className={styles.recordLines}>
            {v.record.lines.map((line) => (
              <span key={line} className={styles.recordLine}>
                {line}
              </span>
            ))}
          </p>
          <cite className={styles.cite}>{v.record.source}</cite>
        </div>
      ) : null}

      <blockquote className={styles.documented}>
        <EvidenceTag claim={v.documented.claim} />
        <p className={styles.quote}>
          {v.documented.text}
          <StatusTag status={v.documented.status} />
        </p>
        <cite className={styles.cite}>{v.documentedSource.text}</cite>
        {v.documentedNote ? (
          <p className={styles.sourceNote}>
            {v.documentedNote.text}
            <StatusTag status={v.documentedNote.status} />
          </p>
        ) : null}
      </blockquote>

      {v.yourReading ? (
        <div className={styles.reading}>
          <h2 className={styles.subheading}>{v.yourReading.label}</h2>
          <p className={styles.readingText}>{v.yourReading.text}</p>
        </div>
      ) : null}

      {v.message ? (
        <div className={styles.message}>
          <p className={styles.messageText}>{v.message.text}</p>
          <EvidenceTag claim={v.message.claim} />
        </div>
      ) : null}

      <aside className={styles.harmony}>
        <p className={styles.harmonyName}>HARMONY</p>
        <p className={styles.harmonyText}>{v.harmony.text}</p>
        <EvidenceTag claim={v.harmony.claim} tone="dark" />
      </aside>

      <details className={styles.sources}>
        <summary className={styles.sourcesSummary}>
          <Icon name="source" className={styles.sourcesIcon} />
          {v.sourcesLabel}
        </summary>
        <ul className={styles.sourceList}>
          {v.sources.map((source) => (
            <li key={source.id} className={styles.source}>
              {source.url ? (
                <a href={source.url} target="_blank" rel="noopener noreferrer" className={styles.sourceLink}>
                  {source.title}
                  <Icon name="externalLink" className={styles.sourceLinkIcon} />
                </a>
              ) : (
                <span className={styles.sourceTitle}>{source.title}</span>
              )}
              <span className={styles.sourceNote}>
                {source.note.text}
                <StatusTag status={source.note.status} />
              </span>
            </li>
          ))}
        </ul>
      </details>

      <ActionButton icon="arrowForward" block onClick={onContinue}>
        {v.continueLabel}
      </ActionButton>
    </section>
  );
}
