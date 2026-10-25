import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, IBM_Plex_Sans_Hebrew, IBM_Plex_Serif } from "next/font/google";
import "./globals.scss";

// Typography from the brand rules (docs/GPT_DORI_UI_Designer_Brand_to_Screen_Prompt(1).md §3):
// IBM Plex Sans for English, IBM Plex Sans Hebrew for Hebrew. Plex Mono is used sparingly for
// HARMONY's system signals only.
const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const plexHebrew = IBM_Plex_Sans_Hebrew({
  variable: "--font-plex-hebrew",
  subsets: ["hebrew"],
  weight: ["400", "500"],
});

// IBM Plex Serif for The Amazing Shuk's headings only (owner decision, 25 Oct 2026, from the Stitch reference).
const plexSerif = IBM_Plex_Serif({
  variable: "--font-plex-serif",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "The Memory Protocol",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f3efe6",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${plexSans.variable} ${plexHebrew.variable} ${plexSerif.variable} ${plexMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
