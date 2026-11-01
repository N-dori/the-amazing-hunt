import { mkdir, open } from "node:fs/promises";
import { join } from "node:path";
import { issueHostInvitation, issueInvitation, resetDevState, summariseDevState } from "../lib/amazing-shuk/participant-store.ts";
import { DEV_RESET_SCENARIOS, RESET_PLAN, formatSummary, isDevResetScenario, resolveResetTarget } from "../lib/amazing-shuk/dev-reset.ts";
import { DEV_GUIDE_ID, isLocalDevelopmentHost } from "../lib/amazing-shuk/dev-water-session.ts";
import { BASE_PATH } from "../lib/base-path.ts";
// Development only: resets a local simulation's state file. Previews by default; --confirm keeps a backup, then resets.
//   shuk-dev-reset.ts progress  --file .local/amazing-shuk/state.json [--confirm]
//   shuk-dev-reset.ts adventure --file .local/amazing-shuk/state.json [--scenario solo|pair|team] [--origin http://localhost:3300] [--confirm]
// With --scenario, fresh single-use invitations for that scenario go to a file under .local/shuk-dev-reset/ (mode 600), never the terminal.
const USAGE = "Usage: shuk-dev-reset.ts <progress|adventure> --file <state file in .local/> [--scenario solo|pair|team] [--origin <loopback http origin>] [--confirm]";
const args = process.argv.slice(2);
const option = (name: string) => { const at = args.indexOf(name); return at === -1 ? undefined : args[at + 1]; };
const [mode] = args;
if (mode !== "progress" && mode !== "adventure") throw new Error(USAGE);
const known = new Set(["--file", "--scenario", "--origin", "--confirm"]);
for (const [index, arg] of args.entries()) if (index > 0 && arg.startsWith("--") && !known.has(arg)) throw new Error(`Unknown option ${arg}. ${USAGE}`);
const scenarioName = option("--scenario");
if (scenarioName !== undefined && (mode !== "adventure" || !isDevResetScenario(scenarioName))) throw new Error(`--scenario is solo, pair or team, with "adventure" only. ${USAGE}`);
const scenario = scenarioName !== undefined && isDevResetScenario(scenarioName) ? DEV_RESET_SCENARIOS[scenarioName] : null;
const origin = new URL(option("--origin") ?? "http://localhost:3300");
if (origin.protocol !== "http:" || !isLocalDevelopmentHost(origin.host) || origin.pathname !== "/" || origin.search || origin.hash || origin.username || origin.password) {
  throw new Error("Refused: --origin must be a bare loopback HTTP origin, such as http://localhost:3300.");
}

const target = await resolveResetTarget(option("--file"), process.env, process.cwd());
console.log(`Target: ${target}`);
console.log(`Now:\n${formatSummary(await summariseDevState(target))}`);
console.log(`Reset ${mode}:\n${RESET_PLAN[mode].map(line => "  - " + line).join("\n")}`);
if (scenario) console.log(`Then issues single-use invitations: host ${scenario.host}${scenario.players.length ? ", players " + scenario.players.join(", ") : ""}, guide.`);
if (!args.includes("--confirm")) {
  console.log("Preview only; nothing changed. Add --confirm to keep a backup and reset.");
  process.exit(0);
}

const { summary, backup } = await resetDevState(target, mode);
console.log(`Backup: ${backup} (beside the state file)\nAfter:\n${formatSummary(summary)}`);
if (scenario) {
  const links: string[] = [];
  const link = (seat: string, token: string) => links.push(`${seat}\t${origin.origin}${BASE_PATH}/dev/amazing-shuk/water#invite=${token}`);
  link(`${scenario.host} (host)`, await issueHostInvitation(target, scenario.host));
  for (const seat of scenario.players) link(seat, await issueInvitation(target, seat));
  link(DEV_GUIDE_ID, await issueInvitation(target, DEV_GUIDE_ID));
  const directory = join(process.cwd(), ".local", "shuk-dev-reset");
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const file = join(directory, `links-${new Date().toISOString().replace(/[-:]/g, "").replace(".", "")}.txt`);
  const handle = await open(file, "wx", 0o600);
  try { await handle.writeFile(links.join("\n") + "\n"); } finally { await handle.close(); }
  console.log(`${links.length} single-use invitations (24 hours) written to ${file}`);
}
