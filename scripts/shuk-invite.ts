import { issueHostInvitation, issueInvitation, defaultStorePath } from "../lib/amazing-shuk/participant-store.ts";
import { isDevSimulationEnabled, isLocalDevelopmentHost } from "../lib/amazing-shuk/dev-water-session.ts";
import { shukPublicOrigin } from "../lib/amazing-shuk/shuk-access.ts";
import { BASE_PATH } from "../lib/base-path.ts";
// shuk-invite.ts <seat> [origin], or shuk-invite.ts host <player seat> [origin] for the single-use host invitation.
// Seats are player-1…7 and guide: labels for this fallback only. Redeeming the link signs in the seat's member, or makes one.
// A seat that would add a sixth member to the team is refused; --over-cap issues it anyway, and the invitation records the override.
const overCap = process.argv.includes("--over-cap");
const args = process.argv.slice(2).filter(arg => arg !== "--over-cap");
const host = args[0] === "host";
const [participantId, origin = "http://127.0.0.1:3000"] = host ? args.slice(1) : args;
if (!participantId) throw new Error("Usage: shuk-invite.ts [--over-cap] <seat> [origin] | [--over-cap] host <player seat> [origin]");
const url = new URL(origin);
const bare = !url.username && !url.password && url.pathname === "/" && !url.search && !url.hash;
// The protected app (inside the dori-shuk container) links to its one public https origin; the local simulation to loopback HTTP.
const app = process.env.NEXT_PUBLIC_DORI_APP === "shuk" && process.env.SHUK_APP === "1";
const publicOrigin = shukPublicOrigin(process.env);
if (app) {
  if (!bare || publicOrigin?.protocol !== "https:" || url.origin !== publicOrigin.origin) throw new Error("Requires the app's https SHUK_PUBLIC_ORIGIN as the origin");
} else if (!isDevSimulationEnabled(process.env) || !isLocalDevelopmentHost(url.host) || url.protocol !== "http:" || !bare) {
  throw new Error("Requires development, SHUK_DEV_SIMULATION=1, and a loopback HTTP origin");
}
const token = await (host ? issueHostInvitation : issueInvitation)(defaultStorePath(), participantId, Date.now(), overCap);
// The token travels in the fragment, which browsers never send to the server or its logs.
console.log(`${url.origin}${BASE_PATH}${app ? "/amazing-shuk" : "/dev/amazing-shuk/water"}#invite=${token}`);
