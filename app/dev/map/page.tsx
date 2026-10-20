import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import IndexMapPreview from "@/components/map/IndexMapPreview";

export const metadata: Metadata = {
  title: "Map preview (dev)",
  robots: { index: false, follow: false },
};

// Development preview of the candidate illustrated map. Available under `next dev`, and in a
// production build only when the container is started with MP_DEV_PREVIEW=1 (the local
// preview container). The deployed game never sets it, so there it returns 404.
export default async function MapPreviewPage() {
  await connection();
  if (process.env.NODE_ENV === "production" && process.env.MP_DEV_PREVIEW !== "1") notFound();
  return <IndexMapPreview />;
}
