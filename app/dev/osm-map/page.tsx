import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import IndexOsmMap from "@/components/map/IndexOsmMap";

export const metadata: Metadata = {
  title: "OSM map (dev)",
  robots: { index: false, follow: false },
};

// Development page for the Nahlaot OSM navigation map on its own (no markers, no challenge), for the owner to pick the
// frame. Like app/dev/map: available under `next dev`, and in a production build only with MP_DEV_PREVIEW=1; the
// deployed game returns 404.
export default async function OsmMapPage() {
  await connection();
  if (process.env.NODE_ENV === "production" && process.env.MP_DEV_PREVIEW !== "1") notFound();
  return <IndexOsmMap />;
}
