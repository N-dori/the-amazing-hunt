import type { ReactNode } from "react";
import { Icon } from "@/components/icons";
import { common } from "@/lib/game/screens";
import styles from "./ScreenHeader.module.scss";

type ScreenHeaderProps = {
  onBack: () => void;
  step: number;
  total: number;
  tone?: "light" | "dark";
  // Right-hand slot, e.g. the visitor's team.
  aside?: ReactNode;
};

// The thin top bar shared by every screen after Welcome: back, position in the flow, and an
// optional status on the right.
export default function ScreenHeader({ onBack, step, total, tone = "light", aside }: ScreenHeaderProps) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <header className={`${styles.header} ${tone === "dark" ? styles.dark : ""}`}>
      <button type="button" className={styles.back} onClick={onBack} aria-label={common.back.text}>
        <Icon name="arrowBack" className={styles.backIcon} />
      </button>
      <p className={styles.step} aria-hidden="true">
        {pad(step)} <span className={styles.stepTotal}>/ {pad(total)}</span>
      </p>
      <div className={styles.aside}>{aside}</div>
    </header>
  );
}
