import { Icon } from "@/components/icons";
import ActionButton from "@/components/ui/ActionButton";
import StatusTag from "@/components/ui/StatusTag";
import { unlockScreen, type InvestigationView } from "@/lib/game/library";
import type { Copy, TeamId } from "@/lib/game/types";
import styles from "./PreviewInvestigations.module.scss";

type PreviewInvestigationsProps = {
  items: InvestigationView[];
  // Shown once the visitor's own team has finished 00C: the next mission and that it isn't built.
  next: { label: string; title: string; note: Copy } | null;
  // Development only: the other team's mission can be played from this phone too.
  devTools: boolean;
  onBegin: (teamId: TeamId) => void;
  onToMap: () => void;
};

// After 00B: both Mission 00C investigations are open; the visitor's own team comes first and
// is the one main action. Once it is done, the next mission is named and the map is the action.
export default function PreviewInvestigations({ items, next, devTools, onBegin, onToMap }: PreviewInvestigationsProps) {
  return (
    <section className={styles.unlocked}>
      <div className={styles.head}>
        <Icon name="unlocked" className={styles.headIcon} />
        <h1 className={styles.heading} tabIndex={-1} data-screen-heading>
          {unlockScreen.heading.text}
        </h1>
        <p className={styles.intro}>{unlockScreen.intro.text}</p>
      </div>

      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.id} className={`${styles.item} ${item.teamId === "B" ? styles.teamB : ""} ${item.yours ? styles.yours : ""}`}>
            <span className={styles.letter} aria-hidden="true">
              {item.teamId}
            </span>
            <div className={styles.body}>
              <span className={styles.badge}>{item.yours ? unlockScreen.yourTeam.text : unlockScreen.otherTeam.text}</span>
              <span className={styles.title}>{item.title}</span>
              <span className={styles.where}>{item.where}</span>
              {item.completed ? (
                <span className={styles.done}>
                  <Icon name="check" className={styles.doneIcon} />
                  {unlockScreen.done.text}
                </span>
              ) : null}
              {item.yours ? (
                <ActionButton variant={item.completed ? "quiet" : "primary"} icon="arrowForward" className={styles.itemAction} onClick={() => onBegin(item.teamId)}>
                  {item.completed ? unlockScreen.review.text : unlockScreen.begin.text}
                </ActionButton>
              ) : devTools ? (
                <span className={styles.devAction}>
                  <ActionButton variant="quiet" onClick={() => onBegin(item.teamId)}>
                    {unlockScreen.devPreview.text}
                  </ActionButton>
                  <StatusTag status={unlockScreen.devPreview.status} />
                </span>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      {next ? (
        <div className={styles.next}>
          <p className={styles.badge}>{unlockScreen.nextHeading.text}</p>
          <p className={styles.nextTitle}>
            {next.label} · {next.title}
          </p>
          <p className={styles.notice}>
            <Icon name="info" className={styles.noticeIcon} />
            <span>
              {next.note.text}
              <StatusTag status={next.note.status} />
            </span>
          </p>
        </div>
      ) : null}

      <ActionButton variant={next ? "primary" : "quiet"} icon="mapMarker" block onClick={onToMap}>
        {unlockScreen.toMap.text}
      </ActionButton>
    </section>
  );
}
