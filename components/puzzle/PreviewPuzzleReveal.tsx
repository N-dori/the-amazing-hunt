import { Icon } from "@/components/icons";
import ActionButton from "@/components/ui/ActionButton";
import EvidenceTag from "@/components/ui/EvidenceTag";
import StatusTag from "@/components/ui/StatusTag";
import { BASE_PATH } from "@/lib/base-path";
import type { firstKeepers } from "@/lib/game/library";
import styles from "./PreviewPuzzleReveal.module.scss";

type PreviewPuzzleRevealProps = {
  content: typeof firstKeepers;
  solvedBy: "players" | "guide";
  onContinue: () => void;
};

// The reveal: the year, the documented entry, three separate questions, HARMONY's
// reflection, and an optional source panel. Each block carries its own evidence label.
export default function PreviewPuzzleReveal({ content: c, solvedBy, onContinue }: PreviewPuzzleRevealProps) {
  return (
    <section className={styles.reveal}>
      <header className={styles.head}>
        <p className={styles.kicker}>{c.revealLabel.text}</p>
        <h1 className={styles.year} tabIndex={-1} data-screen-heading>
          {c.year.text}
        </h1>
        {solvedBy === "guide" ? <p className={styles.guide}>{c.guideSolved.text}</p> : null}
      </header>

      <figure className={styles.entry}>
        <img src={`${BASE_PATH}/library/timeline-1946-entry.jpg`} alt={c.entryAlt.text} className={styles.entryImage} />
      </figure>

      <blockquote className={styles.documented}>
        <EvidenceTag claim={c.documented.claim} />
        <p className={styles.quote}>{c.documented.text}</p>
        <cite className={styles.cite}>{c.documentedSource.text}</cite>
      </blockquote>

      <div className={styles.separate}>
        <h2 className={styles.subheading}>{c.separateHeading.text}</h2>
        <p className={styles.separateIntro}>{c.separateIntro.text}</p>
        <dl className={styles.terms}>
          {c.separate.map((item, i) => (
            <div key={item.term.text} className={styles.term}>
              <dt className={styles.termName}>
                <span className={styles.termNumber}>{i + 1}</span>
                {item.term.text}
              </dt>
              <dd className={styles.termText}>{item.text.text}</dd>
            </div>
          ))}
        </dl>
        <EvidenceTag claim={c.separateIntro.claim} />
      </div>

      <aside className={styles.harmony}>
        <p className={styles.harmonyName}>HARMONY</p>
        <p className={styles.harmonyText}>{c.reflection.text}</p>
        <EvidenceTag claim={c.reflection.claim} tone="dark" />
      </aside>

      <details className={styles.sources}>
        <summary className={styles.sourcesSummary}>
          <Icon name="source" className={styles.sourcesIcon} />
          {c.sourcesLabel.text}
        </summary>
        <ul className={styles.sourceList}>
          {c.sources.map((source) => (
            <li key={source.id} className={styles.source}>
              {source.url ? (
                <a href={source.url} target="_blank" rel="noopener noreferrer" className={styles.sourceLink}>
                  {source.title.text}
                  <Icon name="externalLink" className={styles.sourceLinkIcon} />
                </a>
              ) : (
                <span className={styles.sourceTitle}>{source.title.text}</span>
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
        {c.continue.text}
      </ActionButton>
    </section>
  );
}
