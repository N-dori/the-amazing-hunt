import { issueInvitation, defaultStorePath } from "../lib/amazing-shuk/participant-store.ts";
import { isDevSimulationEnabled, isLocalDevelopmentHost } from "../lib/amazing-shuk/dev-water-session.ts";
import { BASE_PATH } from "../lib/base-path.ts";
const [participantId, origin = "http://127.0.0.1:3000"] = process.argv.slice(2);
const url = new URL(origin);
if (!isDevSimulationEnabled(process.env) || !isLocalDevelopmentHost(url.host) || url.protocol !== "http:" || url.username || url.password || url.pathname !== "/" || url.search || url.hash) throw new Error("Requires development, SHUK_DEV_SIMULATION=1, and a loopback HTTP origin");
const token = await issueInvitation(defaultStorePath(), participantId);
console.log(`${url.origin}${BASE_PATH}/dev/amazing-shuk/water#invite=${token}`);
