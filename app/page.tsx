import { connection } from "next/server";
import { redirect } from "next/navigation";
import IndexProtocol from "@/components/protocol/IndexProtocol";
import { IS_SHUK_APP } from "@/lib/base-path";

// The visual prototype: Welcome → Team → HARMONY transmission → illustrated Investigation Map
// → the Library chapter → back to the map, on mock local state. Story text comes from
// Story V1 via lib/game/content.ts.
//
// Development controls (map style, simulated completions) appear under `next dev`, and in a
// production build only when the container is started with MP_DEV_PREVIEW=1 (the local
// preview). The deployed game never sets it, so visitors never see them.
export default async function Home() {
  await connection();
  // The Shuk build shares this codebase but never shows the Memory Protocol: its root is the Shuk game.
  if (IS_SHUK_APP) redirect("/amazing-shuk");
  const devTools = process.env.NODE_ENV !== "production" || process.env.MP_DEV_PREVIEW === "1";
  return <IndexProtocol devTools={devTools} />;
}
