import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { cleanDisplayName, groupParticipants, isValidNames, setDisplayName } from "./participant-names.ts";
import { issueInvitation, redeemInvitation, sessionView, setParticipantName } from "./participant-store.ts";

const NONE = { navigator: null, answerSubmitter: null };

test("names are trimmed, 1–40 characters, with no control characters; only known participants", () => {
  assert.equal(cleanDisplayName("  Ellen   Arnovitz "), "Ellen Arnovitz");
  assert.equal(cleanDisplayName("סטייסי"), "סטייסי");
  for (const bad of ["", "   ", "x".repeat(41), "Mi\u0000chael", 7, null]) assert.equal(cleanDisplayName(bad), null, String(bad));
  assert.deepEqual(setDisplayName({}, "player-4", " Michael "), { "player-4": "Michael" });
  assert.deepEqual(setDisplayName({ "player-4": "Michael" }, "player-4", null), {});
  assert.throws(() => setDisplayName({}, "player-99", "Nobody"), /Unknown participant/);
  assert.throws(() => setDisplayName({}, "player-4", " "), /1–40/);
  assert.equal(isValidNames({ "player-4": "Michael", guide: "Nadav" }), true);
  assert.equal(isValidNames({ "player-99": "x" }), false); assert.equal(isValidNames({ "player-4": " padded" }), false); assert.equal(isValidNames([]), false);
});

test("with no names everyone shows as Player N; once named, only named players and role holders are listed, then the guide", () => {
  const all = groupParticipants({}, NONE);
  assert.equal(all.length, 8); assert.deepEqual(all[3], { id: "player-4", name: "Player 4" }); assert.deepEqual(all.at(-1), { id: "guide", name: "Guide" });
  const names = { "player-4": "Michael", "player-5": "Ellen", "player-6": "Staci" };
  assert.deepEqual(groupParticipants(names, { navigator: "player-4", answerSubmitter: "player-5" }).map(p => p.name), ["Michael", "Ellen", "Staci", "Guide"]);
  // An unnamed role holder still shows, so the guide can see and change the role.
  assert.deepEqual(groupParticipants(names, { navigator: "player-1", answerSubmitter: null }).map(p => p.name), ["Player 1", "Michael", "Ellen", "Staci", "Guide"]);
  assert.equal(groupParticipants({ guide: "Nadav" }, NONE).at(-1)!.name, "Nadav");
});

async function fixture(run: (path: string) => Promise<void>) {
  await mkdir(".local", { recursive: true });
  const directory = await mkdtemp(join(process.cwd(), ".local", "shuk-names-"));
  try { await run(join(directory, "state.json")); } finally { await rm(directory, { recursive: true, force: true }); }
}

test("server: names are saved in the state file, sent to signed-in members, and a bad stored name is refused", () => fixture(async path => {
  const ellen = await redeemInvitation(path, await issueInvitation(path, "player-5"));
  assert.equal(await setParticipantName(path, "player-4", "Michael"), "Michael");
  await setParticipantName(path, "player-5", "Ellen");
  const view = await sessionView(path, ellen);
  assert.deepEqual(view.participants.map(p => p.name), ["Player 1", "Player 2", "Michael", "Ellen", "Guide"], "default role holders still listed");
  await assert.rejects(sessionView(path, "not-a-session"), /Invitation login required/);
  await assert.rejects(setParticipantName(path, "player-4", ""), /1–40/);
  const disk = JSON.parse(await readFile(path, "utf8"));
  assert.deepEqual(disk.names, { "player-4": "Michael", "player-5": "Ellen" });
  await writeFile(path, JSON.stringify({ ...disk, names: { "player-4": "\u0007bell" } }));
  await assert.rejects(sessionView(path, ellen), /Unsupported Shuk storage state/);
}));

test("the naming script sets and clears a name in the app, and refuses without the app or simulation settings", () => fixture(async path => {
  const run = (args: string[], env: Record<string, string> & { NODE_ENV: "production" }) => promisify(execFile)(process.execPath,
    ["--experimental-strip-types", "--disable-warning=ExperimentalWarning", "scripts/shuk-name.ts", ...args], { env: { PATH: process.env.PATH ?? "", SHUK_DATA_FILE: path, ...env } });
  const app = { NODE_ENV: "production", NEXT_PUBLIC_DORI_APP: "shuk", SHUK_APP: "1" } as const;
  assert.equal((await run(["player-6", "Staci"], app)).stdout.trim(), "player-6: Staci");
  assert.deepEqual(JSON.parse(await readFile(path, "utf8")).names, { "player-6": "Staci" });
  assert.equal((await run(["player-6", "--clear"], app)).stdout.trim(), "player-6: (cleared)");
  await assert.rejects(run(["player-6", "Staci"], { NODE_ENV: "production" }));
  await assert.rejects(run(["player-6"], app), /Usage/);
}));
