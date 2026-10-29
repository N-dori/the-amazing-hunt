import { defaultStorePath, startNewAdventure } from "../lib/amazing-shuk/participant-store.ts";
import { isDevSimulationEnabled } from "../lib/amazing-shuk/dev-water-session.ts";
// Opens a fresh adventure in its lobby, after keeping the current state beside it:  shuk-new-adventure.ts --confirm
// Development and testing only (owner, 29 Oct 2026): it refuses in the Shuk app, and the app image doesn't ship it.
const app = process.env.NEXT_PUBLIC_DORI_APP === "shuk" || process.env.SHUK_APP === "1";
if (app || !isDevSimulationEnabled(process.env)) throw new Error("Development only: requires the local simulation (SHUK_DEV_SIMULATION=1)");
if (process.argv[2] !== "--confirm") throw new Error("Usage: shuk-new-adventure.ts --confirm   (signs everyone out and clears the roles and progress)");
const kept = await startNewAdventure(defaultStorePath());
console.log(kept ? `Kept the previous state as ${kept}. The new adventure waits in its lobby.` : "No previous state. The new adventure waits in its lobby.");
