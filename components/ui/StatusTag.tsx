import type { ContentStatus } from "@/lib/game/types";
import styles from "./StatusTag.module.scss";

const LABELS: Record<Exclude<ContentStatus, "approved">, string> = {
  draft: "Draft",
  fixture: "Fixture",
};

// A visible label on content that isn't approved yet (see ContentStatus), so prototype
// wording and stand-ins can never pass for final copy. Renders nothing for approved text.
export default function StatusTag({ status, tone = "light" }: { status: ContentStatus; tone?: "light" | "dark" }) {
  if (status === "approved") return null;
  return <span className={`${styles.tag} ${tone === "dark" ? styles.dark : ""}`}>{LABELS[status]}</span>;
}
