import { defaultStorePath, setParticipantName } from "../lib/amazing-shuk/participant-store.ts";
import { isDevSimulationEnabled } from "../lib/amazing-shuk/dev-water-session.ts";
// Sets a display name on this server: for a seat, kept across adventures (shuk-name.ts player-4 "Ari", or --clear to go back to
// "Player 4"), or for one member by their ID (shuk-name.ts p_… "Ari"). Names are personal data: they live only in the state file,
// never in git. A name is a label only and grants nothing.
const [participantId, name] = process.argv.slice(2);
const app = process.env.NEXT_PUBLIC_DORI_APP === "shuk" && process.env.SHUK_APP === "1";
if (!app && !isDevSimulationEnabled(process.env)) throw new Error("Requires the Shuk app (SHUK_APP=1) or the local simulation");
if (!participantId || name === undefined) throw new Error('Usage: shuk-name.ts <seat | member ID> "<Name>" | --clear');
const saved = await setParticipantName(defaultStorePath(), participantId, name === "--clear" ? null : name);
console.log(`${participantId}: ${saved ?? "(cleared)"}`);
