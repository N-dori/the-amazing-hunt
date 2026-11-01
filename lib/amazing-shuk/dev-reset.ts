import { lstat, readFile, realpath } from "node:fs/promises";
import { dirname, isAbsolute, join, resolve, sep } from "node:path";
import { isDevSimulationEnabled } from "./dev-water-session.ts";
import type { DevResetMode, DevStateSummary } from "./participant-store.ts";

/**
 * The development reset's guard rails (scripts/shuk-dev-reset.ts). A reset runs only in the local simulation's environment, from
 * this repo's root, on a state file the operator names explicitly, which must be a regular file inside the repo's `.local/`.
 * The Shuk app's environment, the live volume (`/data` in the container, Docker's volumes on the host) and a SHUK_DATA_FILE
 * naming a different file are refused.
 */
export type ResetEnvironment = NodeJS.ProcessEnv;

/** Predefined onboarding scenarios for "adventure": the host's seat, the other players' seats, and always the guide. At most 5 members (O6). */
export const DEV_RESET_SCENARIOS = Object.freeze({
  solo: Object.freeze({ host: "player-1", players: Object.freeze([] as string[]) }),
  pair: Object.freeze({ host: "player-1", players: Object.freeze(["player-2"]) }),
  team: Object.freeze({ host: "player-1", players: Object.freeze(["player-2", "player-3", "player-4", "player-5"]) }),
});
export type DevResetScenario = keyof typeof DEV_RESET_SCENARIOS;
export const isDevResetScenario = (name: string): name is DevResetScenario => Object.hasOwn(DEV_RESET_SCENARIOS, name);

const LIVE_PATHS = [/^\/data(\/|$)/, /\/var\/lib\/docker\//, /\/volumes\//];

/** The environment may run a reset: the local simulation, never the Shuk app. Throws the reason otherwise. */
export function checkResetEnvironment(env: ResetEnvironment): void {
  if (env.SHUK_APP === "1" || env.NEXT_PUBLIC_DORI_APP === "shuk") throw new Error("Refused: this is the Shuk app's environment. Resets are for the local simulation only.");
  if (!isDevSimulationEnabled(env)) throw new Error("Refused: requires NODE_ENV=development and SHUK_DEV_SIMULATION=1.");
}

/** The absolute path of the state file to reset, after every check; throws the first reason it is refused. */
export async function resolveResetTarget(file: string | undefined, env: ResetEnvironment, cwd: string): Promise<string> {
  checkResetEnvironment(env);
  if (!file) throw new Error("Refused: name the state file with --file. There is no default target.");
  const target = resolve(cwd, file);
  if (LIVE_PATHS.some(pattern => pattern.test(target))) throw new Error("Refused: the target looks like a live Docker volume.");
  // The repo root, so `.local/` means this repo's: its package.json names the game.
  const manifest = await readFile(join(cwd, "package.json"), "utf8").then(text => JSON.parse(text) as { name?: unknown }, () => null);
  if (manifest?.name !== "the-amazing-shuk") throw new Error("Refused: run from the game repo's root.");
  if (env.SHUK_DATA_FILE && resolve(cwd, env.SHUK_DATA_FILE) !== target) throw new Error("Refused: SHUK_DATA_FILE names a different file. Unset it or point both at the same file.");
  const entry = await lstat(target).catch(() => null);
  if (!entry) throw new Error("Refused: no state file at the target.");
  if (entry.isSymbolicLink() || !entry.isFile()) throw new Error("Refused: the target must be a regular file, not a link.");
  const local = await realpath(join(cwd, ".local")).catch(() => null);
  const directory = await realpath(dirname(target));
  if (!local || !isAbsolute(directory) || !(directory === local || directory.startsWith(local + sep))) throw new Error("Refused: the target must be inside this repo's .local/ directory.");
  return target;
}

/** What each mode changes, for the preview. */
export const RESET_PLAN: Readonly<Record<DevResetMode, readonly string[]>> = Object.freeze({
  progress: Object.freeze([
    "Clears every team's mission progress: challenges, arrivals, timers, hints, points, food tokens and bonuses.",
    "Keeps members, teams, leaders, roles, sessions, invitations and join requests.",
    "Sets a new reset epoch: actions queued on phones before the reset are refused; receipts stay, so applied actions never reapply.",
  ]),
  adventure: Object.freeze([
    "Opens a fresh adventure in its lobby with no host.",
    "Removes every member, session, invitation, join link, join request, role and all progress. Old sessions and unused invitations stop working.",
    "Keeps seat names and receipts, and sets a new reset epoch: actions queued before the reset are refused.",
  ]),
});

/** Counts only: no names, tokens or IDs. */
export function formatSummary(summary: DevStateSummary): string {
  return [
    `schema ${summary.storedSchema}, adventure ${summary.adventure}${summary.host ? " with a host" : ", no host"}`,
    `members ${summary.members}, leaders ${summary.leaders}, roles held ${summary.roles}`,
    `sessions ${summary.sessions}, invitations ${summary.invitations}, join links ${summary.joinLinks}, join requests ${summary.joinRequests}`,
    `missions with progress ${summary.missionsWithProgress}, points ${summary.points}, food tokens ${summary.foodTokens}`,
    `receipts ${summary.receipts}, reset before: ${summary.resetBefore ? "yes" : "no"}`,
  ].map(line => "  " + line).join("\n");
}
