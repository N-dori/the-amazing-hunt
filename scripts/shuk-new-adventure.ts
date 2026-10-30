import { defaultStorePath, startNewAdventure } from "../lib/amazing-shuk/participant-store.ts";
import { isDevSimulationEnabled } from "../lib/amazing-shuk/dev-water-session.ts";
// Opens a fresh adventure in its lobby, after keeping the current state beside it:  shuk-new-adventure.ts --confirm
// Runs in the Shuk app (inside the dori-shuk container, by the operator; owner-approved for the live app on 30 Oct 2026) or the local simulation.
const app = process.env.NEXT_PUBLIC_DORI_APP === "shuk" && process.env.SHUK_APP === "1";
if (!app && !isDevSimulationEnabled(process.env)) throw new Error("Requires the Shuk app (SHUK_APP=1) or the local simulation");
if (process.argv[2] !== "--confirm") throw new Error("Usage: shuk-new-adventure.ts --confirm   (signs everyone out and clears the roles and progress)");
const kept = await startNewAdventure(defaultStorePath());
console.log(kept ? `Kept the previous state as ${kept}. The new adventure waits in its lobby.` : "No previous state. The new adventure waits in its lobby.");
