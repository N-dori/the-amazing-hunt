import ActionButton from "@/components/ui/ActionButton";
import StatusTag from "@/components/ui/StatusTag";
import { BASE_PATH } from "@/lib/base-path";
import { tagline, title } from "@/lib/game/content";
import { common, prototypeNote, welcome } from "@/lib/game/screens";
import styles from "./WelcomeScreen.module.scss";

// The tagline is two sentences; the second is set apart for emphasis. Presentation only:
// the words are Story V1's, unchanged.
function splitSentences(text: string): string[] {
  return text.split(/(?<=\.)\s+/);
}

export default function WelcomeScreen({ onBegin }: { onBegin: () => void }) {
  const [before, after] = splitSentences(tagline.text);

  return (
    <main className={styles.welcome}>
      {/* The schematic map, faded behind the title, as an atmosphere rather than content. */}
      <img className={styles.backdrop} src={`${BASE_PATH}/map/investigation-map-prototype.svg`} alt="" aria-hidden="true" />

      <div className={styles.top}>
        <img className={styles.wordmark} src={`${BASE_PATH}/DORI_wordmark_only_sumac.svg`} alt="DORI" width={349} height={114} />
        <span className={styles.prototype}>{common.prototype.text}</span>
      </div>

      <div className={styles.body}>
        <p className={styles.route}>{welcome.route.text}</p>
        <h1 className={styles.title} tabIndex={-1} data-screen-heading>
          {title.text}
        </h1>
        <p className={styles.tagline}>
          <span>{before}</span> <span className={styles.taglineTurn}>{after}</span>
        </p>
      </div>

      <div className={styles.footer}>
        <p className={styles.format}>{welcome.format.text}</p>
        <ActionButton icon="arrowForward" block onClick={onBegin}>
          {welcome.begin.text}
        </ActionButton>
        <p className={styles.note}>
          {prototypeNote.text}
          <StatusTag status={prototypeNote.status} />
        </p>
      </div>
    </main>
  );
}
