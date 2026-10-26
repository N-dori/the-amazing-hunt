import Image from "next/image";
import { Icon } from "@/components/icons";
import ActionButton from "@/components/ui/ActionButton";
import { BASE_PATH } from "@/lib/base-path";
import { ILLUSTRATED_MARKET_MAP } from "@/lib/map/image-map";
import type { WelcomeCopy } from "@/lib/amazing-shuk/welcome-copy";
import styles from "./PreviewShukWelcome.module.scss";

type Props = { copy: WelcomeCopy; message: string; busy: boolean; onStart?: () => void };
/** The welcome screen: the illustrated neighbourhood, what the game is, and one action. Without `onStart` the player is signed out and has no link. */
export default function PreviewShukWelcome({ copy, message, busy, onStart }: Props) {
  return <main className={styles.welcome}>
    <div className={styles.hero}>
      <Image src={BASE_PATH + ILLUSTRATED_MARKET_MAP.src} alt="" width={ILLUSTRATED_MARKET_MAP.width} height={ILLUSTRATED_MARKET_MAP.height}
        sizes="(min-width: 48rem) 30rem, 100vw" priority className={styles.map} />
      <span className={styles.pin} aria-hidden="true"><Icon name="mapMarker" className={styles.pinIcon} /></span>
    </div>
    <div className={styles.body}>
      <p className={styles.eyebrow}>{copy.eyebrow}</p>
      <h1 className={styles.title}>{copy.title}</h1>
      <p className={styles.lead}>{copy.lead}</p>
      <ul className={styles.highlights}>
        {copy.highlights.map(item => <li key={item.text} className={styles.highlight}>
          <span className={styles.badge}><Icon name={item.icon} className={styles.icon} /></span>{item.text}
        </li>)}
      </ul>
      <div className={styles.action}>
        {onStart ? <>
          <ActionButton block icon="arrowForward" className={styles.start} disabled={busy} onClick={onStart}>{busy ? copy.starting : copy.start}</ActionButton>
          <p className={styles.note}><Icon name="locked" className={styles.noteIcon} />{copy.personal}</p>
        </> : <p className={styles.signedOut}>{copy.signedOut}</p>}
        <p className={styles.message} role="status">{message}</p>
      </div>
    </div>
  </main>;
}
