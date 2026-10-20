import type { ClaimType } from "@/lib/game/types";
import styles from "./EvidenceTag.module.scss";

// The evidence labels from the content rules. Every statement players see carries one.
const LABELS: Record<ClaimType, string> = {
  historicalFact: "Historical fact",
  interpretation: "Interpretation",
  attributedTradition: "Attributed tradition",
  fiction: "Fiction",
};

export default function EvidenceTag({ claim, tone = "light" }: { claim: ClaimType; tone?: "light" | "dark" }) {
  return <span className={`${styles.tag} ${styles[claim]} ${tone === "dark" ? styles.dark : ""}`}>{LABELS[claim]}</span>;
}
