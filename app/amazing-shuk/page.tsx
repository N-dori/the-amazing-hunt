import type { Metadata } from "next";
import { connection } from "next/server";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import IndexWaterTask from "@/components/amazing-shuk/dev/IndexWaterTask";
import { shukAccess } from "@/lib/amazing-shuk/shuk-access";

// TODO(copy): the app's page title is a draft.
export const metadata: Metadata = { title: "The Amazing Shuk", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/** The protected Shuk app's game: only on its configured public host, in the Shuk build. Everyone else gets a 404. */
export default async function AmazingShukPage() {
  await connection();
  const requestHeaders = await headers();
  if (shukAccess(process.env, requestHeaders.get("host")) !== "app") notFound();
  return <IndexWaterTask mode="app" />;
}
