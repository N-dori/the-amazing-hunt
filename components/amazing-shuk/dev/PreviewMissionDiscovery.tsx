import Image from "next/image";
import { BASE_PATH } from "@/lib/base-path";
import type { MissionDiscovery } from "@/lib/amazing-shuk/mission-completion";
import styles from "./PreviewMissionDiscovery.module.scss";

/** Existing historical copy and credited imagery, shown only after accepted completion. */
export default function PreviewMissionDiscovery({ title, paragraphs, image, sequence, story }: MissionDiscovery) {
  return <section className={styles.discovery} aria-labelledby="mission-discovery-title">
    <h3 id="mission-discovery-title">{title}</h3>
    {sequence ? <ol className={styles.sequence} dir="ltr" aria-label="Year conversion">
      <li><span className="srOnly">Hebrew inscription: </span><span className="rtl" lang="he">{sequence.inscription}</span></li>
      <li><span className={styles.arrow} aria-hidden="true">→</span><span className="srOnly">Hebrew year: </span>{sequence.hebrewYear}</li>
      <li><span className={styles.arrow} aria-hidden="true">→</span><span className="srOnly">Gregorian year: </span>{sequence.gregorianYear}</li>
    </ol> : null}
    {paragraphs.map(paragraph => <p key={paragraph.text}>{paragraph.text}</p>)}
    {image ? <figure className={styles.figure}>
      <Image src={BASE_PATH + image.src} width={image.width} height={image.height} alt={image.alt} className={styles.image} sizes="(min-width: 48rem) 24rem, 100vw" />
      <figcaption>{image.caption}</figcaption>
    </figure> : null}
    {story ? <details className={styles.story}>
      <summary>{story.title}</summary>
      {story.paragraphs.map(paragraph => <p key={paragraph.text}>{paragraph.text}</p>)}
    </details> : null}
  </section>;
}
