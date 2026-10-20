import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Icon, iconNames } from "@/components/icons";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "Icons (dev)",
  robots: { index: false, follow: false },
};

// Development catalogue of the icon set, as the platform keeps its app/dev mockups:
// unavailable in production builds. Names are code identifiers, not visitor copy.
export default function IconsPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <main className={styles.page}>
      <ul className={styles.grid}>
        {iconNames.map((name) => (
          <li key={name} className={styles.cell}>
            <Icon name={name} className={styles.icon} />
            <code className={styles.name}>{name}</code>
          </li>
        ))}
      </ul>
    </main>
  );
}
