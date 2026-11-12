import type { Metadata } from "next";
import { connection } from "next/server";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import IndexWaterTask from "@/components/amazing-shuk/dev/IndexWaterTask";
import { shukAccess } from "@/lib/amazing-shuk/shuk-access";

export const metadata: Metadata = { title: "Water measurement · Amazing Shuk development", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function WaterTaskDevelopmentPage() {
  await connection();
  const requestHeaders = await headers();
  if (shukAccess(process.env, requestHeaders.get("host")) !== "dev") notFound();
  return <IndexWaterTask mode="dev" />;
}
