import { test } from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, readdir, rm, stat, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { promisify } from "node:util";
import { askToJoin, createJoinLink, issueHostInvitation, issueInvitation, redeemInvitation, resetDevState, sessionAction, sessionView, startNewAdventure, summariseDevState } from "./participant-store.ts";
import { resolveResetTarget } from "./dev-reset.ts";
import { GAN_HATUT_MISSION } from "./mission-arrival.ts";
import { startWithRoles } from "./seat-fixture.ts";

// The development reset (scripts/shuk-dev-reset.ts): both modes, stale sessions, replay protection, idempotency and the guard rails.
const WELL = GAN_HATUT_MISSION.id;
const NOW = Date.UTC(2026, 9, 31, 12, 0, 0);
const DEV = { NODE_ENV: "development", SHUK_DEV_SIMULATION: "1" } as const;
const signedOut = (error: Error & { status?: number }) => error.status === 401;
const stale = (error: Error & { status?: number }) => error.status === 410;
const stored = async (path: string) => JSON.parse(await readFile(path, "utf8"));
const withoutEpoch = (state: Record<string, unknown>) => Object.fromEntries(Object.entries(state).filter(([name]) => name !== "resetEpoch"));
const cupsOf = (view: Awaited<ReturnType<typeof sessionView>>) => "cups" in view.session ? view.session.cups : null;
/** A repo-shaped directory under .local/: its own package.json and .local/, so the CLI's files stay inside it. */
async function fixture(run: (path: string, root: string) => Promise<void>) {
  await mkdir(".local", { recursive: true });
  const root = await mkdtemp(join(process.cwd(), ".local", "shuk-dev-reset-"));
  try {
    await writeFile(join(root, "package.json"), JSON.stringify({ name: "the-amazing-shuk" }));
    await mkdir(join(root, ".local"));
    await run(join(root, ".local", "state.json"), root);
  } finally { await rm(root, { recursive: true, force: true }); }
}
const signIn = async (path: string, seat: string) => redeemInvitation(path, await issueInvitation(path, seat, NOW), NOW);
/** A started adventure with progress: player-1 hosts, player-4 navigates and has filled the 5 L vessel, with a join link and a request. */
async function played(path: string) {
  await startNewAdventure(path, NOW);
  const host = await redeemInvitation(path, await issueHostInvitation(path, "player-1", NOW), NOW);
  const player = await signIn(path, "player-4");
  const guide = await signIn(path, "guide");
  await sessionAction(path, host, { type: "set-intended-count", count: 3 }, "reset-host-count-0001", NOW);
  await startWithRoles(path, host, "reset-host-start-0001", NOW);
  await sessionAction(path, player, { type: "claim-role", role: "navigator" }, "reset-claim-nav-00001", NOW);
  await sessionAction(path, player, { missionId: WELL, type: "start" }, "reset-well-start-0001", NOW);
  await sessionAction(path, player, { missionId: WELL, type: "move", move: "fill-large" }, "reset-well-fill-00001", NOW);
  await askToJoin(path, await createJoinLink(path, host, false, NOW), null, "", NOW);
  const unused = await issueInvitation(path, "player-6", NOW);
  return { host, player, guide, unused };
}

test("a progress reset clears progress, keeps members, roles and sessions, and keeps an exact backup", () => fixture(async path => {
  const { host, player, guide } = await played(path);
  const before = await readFile(path);
  const was = await stored(path);
  const { summary, backup } = await resetDevState(path, "progress", NOW + 1000);
  assert.equal(summary.missionsWithProgress, 0);
  assert.equal(summary.points, 0);
  assert.deepEqual((await readFile(join(path, "..", backup))).equals(before), true);
  assert.equal(((await stat(join(path, "..", backup))).mode & 0o777), 0o600);
  const now = await stored(path);
  for (const key of ["participants", "sessions", "invitations", "adventure", "applied", "seatNames"]) assert.deepEqual(now[key], was[key], key);
  assert.deepEqual(now.teams.A.roles, was.teams.A.roles);
  assert.equal(now.teams.A.leaderId, was.teams.A.leaderId);
  assert.deepEqual(now.teams.A.joinLink, was.teams.A.joinLink);
  assert.deepEqual(now.teams.A.joinRequests, was.teams.A.joinRequests);
  // Sessions still work; the well is empty and unstarted, and the balance is zero.
  const view = await sessionView(path, player, NOW + 2000, WELL);
  assert.deepEqual(cupsOf(view), { small: 0, large: 0, jar: 0 });
  assert.equal(view.performance.started, false);
  assert.deepEqual([view.sharedBalance.points, view.sharedBalance.foodTokens], [0, 0]);
  assert.equal(view.session.roles.navigator, view.session.activeActorId);
  assert.equal((await sessionView(path, host, NOW + 2000)).adventure.leader, true);
  assert.equal(typeof (await sessionView(path, guide, NOW + 2000)).resetEpoch, "string");
}));

test("after a reset, actions queued before it are refused and applied ones never reapply; current ones apply", () => fixture(async path => {
  const { player } = await played(path);
  await resetDevState(path, "progress", NOW + 1000);
  const epoch = (await sessionView(path, player, NOW + 1000)).resetEpoch;
  const snapshot = await readFile(path);
  // A move queued before the reset: a new action ID, but no epoch or the old one.
  await assert.rejects(sessionAction(path, player, { missionId: WELL, type: "start" }, "reset-queued-start-01", NOW + 2000, undefined, undefined, undefined), stale);
  await assert.rejects(sessionAction(path, player, { missionId: WELL, type: "start" }, "reset-queued-start-01", NOW + 2000, undefined, undefined, undefined, "x".repeat(43)), stale);
  // An action that already applied before the reset, sent again with the current epoch: a no-op.
  assert.equal(await sessionAction(path, player, { missionId: WELL, type: "move", move: "fill-large" }, "reset-well-fill-00001", NOW + 2000, undefined, undefined, undefined, epoch), "Action already synced.");
  assert.ok((await readFile(path)).equals(snapshot), "refused and repeated actions change nothing");
  await sessionAction(path, player, { missionId: WELL, type: "start" }, "reset-after-start-001", NOW + 2000, undefined, undefined, undefined, epoch);
  await sessionAction(path, player, { missionId: WELL, type: "move", move: "fill-small" }, "reset-after-fill-0001", NOW + 2000, undefined, undefined, undefined, epoch);
  assert.deepEqual(cupsOf(await sessionView(path, player, NOW + 2000, WELL)), { small: 3, large: 0, jar: 0 });
  // A second reset makes the first epoch stale too.
  await resetDevState(path, "progress", NOW + 3000);
  await assert.rejects(sessionAction(path, player, { missionId: WELL, type: "start" }, "reset-second-start-01", NOW + 4000, undefined, undefined, undefined, epoch), stale);
}));

test("an adventure reset ends old sessions and invitations, clears joins and progress, and fresh invitations work", () => fixture(async path => {
  const { host, player, guide, unused } = await played(path);
  const oldHost = (await stored(path)).adventure.hostId;
  const { summary } = await resetDevState(path, "adventure", NOW + 1000);
  const { receipts, ...rest } = summary;
  assert.ok(receipts > 0, "receipts stay");
  assert.deepEqual(rest, { storedSchema: 7, adventure: "lobby", host: false, members: 0, leaders: 0, roles: 0, sessions: 0, invitations: 0,
    joinLinks: 0, joinRequests: 0, missionsWithProgress: 0, points: 0, foodTokens: 0, resetBefore: true });
  for (const token of [host, player, guide]) await assert.rejects(sessionView(path, token, NOW + 2000), signedOut);
  await assert.rejects(sessionAction(path, player, { missionId: WELL, type: "start" }, "reset-old-session-01", NOW + 2000), signedOut);
  await assert.rejects(redeemInvitation(path, unused, NOW + 2000), signedOut);
  // The same scenario again: a fresh host invitation in the lobby, single use.
  const invitation = await issueHostInvitation(path, "player-1", NOW + 2000);
  const newHost = await redeemInvitation(path, invitation, NOW + 2000);
  await assert.rejects(redeemInvitation(path, invitation, NOW + 2000), signedOut);
  const view = await sessionView(path, newHost, NOW + 2000);
  assert.equal(view.adventure.host, true);
  assert.notEqual(view.session.activeActorId, oldHost, "a new member, not the old one");
}));

test("resets are idempotent: a second reset of either mode gives the same state apart from the epoch", () => fixture(async path => {
  await played(path);
  for (const mode of ["progress", "adventure"] as const) {
    await resetDevState(path, mode, NOW + 1000);
    const first = await stored(path);
    await resetDevState(path, mode, NOW + 2000);
    const second = await stored(path);
    assert.deepEqual(withoutEpoch(second), withoutEpoch(first), mode);
    assert.notEqual(second.resetEpoch, first.resetEpoch);
  }
}));

test("a reset needs an existing file and changes nothing when the backup can't be kept", () => fixture(async path => {
  await assert.rejects(resetDevState(path, "progress", NOW), /No state file/);
  await assert.rejects(readFile(path), { code: "ENOENT" });
  await played(path);
  const before = await readFile(path);
  // A different file already holds the backup's name.
  await writeFile(`${path}.before-dev-reset-progress-20261031T120000000Z`, "other");
  await assert.rejects(resetDevState(path, "progress", NOW), /backup could not be kept/);
  assert.ok((await readFile(path)).equals(before));
  await assert.rejects(resetDevState(path, "everything" as "progress", NOW), /Unknown reset mode/);
}));

test("the guard rails refuse the app, production, live volumes, paths outside .local/, links and an ambiguous SHUK_DATA_FILE", () => fixture(async (path, root) => {
  await played(path);
  assert.equal(await resolveResetTarget(".local/state.json", DEV, root), path);
  assert.equal(await resolveResetTarget(".local/state.json", { ...DEV, SHUK_DATA_FILE: path }, root), path);
  await assert.rejects(resolveResetTarget(".local/state.json", { ...DEV, SHUK_APP: "1", NEXT_PUBLIC_DORI_APP: "shuk" }, root), /Shuk app/);
  await assert.rejects(resolveResetTarget(".local/state.json", { ...DEV, NODE_ENV: "production" }, root), /NODE_ENV=development/);
  await assert.rejects(resolveResetTarget(".local/state.json", { NODE_ENV: "development" }, root), /SHUK_DEV_SIMULATION=1/);
  await assert.rejects(resolveResetTarget(undefined, DEV, root), /--file/);
  await assert.rejects(resolveResetTarget("/data/state.json", DEV, root), /live Docker volume/);
  await assert.rejects(resolveResetTarget("/var/lib/docker/volumes/dori-shuk_shuk_data/_data/state.json", DEV, root), /live Docker volume/);
  await assert.rejects(resolveResetTarget(".local/state.json", { ...DEV, SHUK_DATA_FILE: "/data/state.json" }, root), /different file/);
  await assert.rejects(resolveResetTarget(".local/missing.json", DEV, root), /no state file/);
  await assert.rejects(resolveResetTarget(".local/state.json", DEV, resolve(root, ".local")), /repo's root/);
  // Outside .local/: a copy in the fixture's root, a file in the system temp directory, and a link into .local/ from outside.
  await writeFile(join(root, "state.json"), await readFile(path));
  await assert.rejects(resolveResetTarget("state.json", DEV, root), /inside this repo's \.local/);
  const outside = await mkdtemp(join(tmpdir(), "shuk-dev-reset-"));
  try {
    await writeFile(join(outside, "state.json"), await readFile(path));
    await assert.rejects(resolveResetTarget(join(outside, "state.json"), DEV, root), /inside this repo's \.local/);
    await symlink(join(outside, "state.json"), join(root, ".local", "linked.json"));
    await assert.rejects(resolveResetTarget(".local/linked.json", DEV, root), /regular file/);
    await symlink(outside, join(root, ".local", "linked-dir"));
    await assert.rejects(resolveResetTarget(".local/linked-dir/state.json", DEV, root), /inside this repo's \.local/);
  } finally { await rm(outside, { recursive: true, force: true }); }
}));

test("the script previews without changing anything, then resets with --confirm and writes fresh links to a private file", () => fixture(async (path, root) => {
  const script = resolve("scripts/shuk-dev-reset.ts");
  const run = (args: string[], env: Record<string, string> & { NODE_ENV: "development" | "production" } = DEV) => promisify(execFile)(process.execPath,
    ["--experimental-strip-types", "--disable-warning=ExperimentalWarning", script, ...args], { cwd: root, env: { PATH: process.env.PATH ?? "", ...env } });
  await played(path);
  const before = await readFile(path);
  const preview = await run(["adventure", "--file", ".local/state.json", "--scenario", "pair"]);
  assert.match(preview.stdout, /Preview only; nothing changed/);
  assert.match(preview.stdout, /members 2, leaders 1, roles held 1/);
  assert.ok((await readFile(path)).equals(before));
  await assert.rejects(run(["adventure", "--file", ".local/state.json", "--confirm"], { ...DEV, SHUK_APP: "1", NEXT_PUBLIC_DORI_APP: "shuk" }), /Shuk app/);
  await assert.rejects(run(["progress", "--file", ".local/state.json", "--scenario", "pair", "--confirm"]), /--scenario/);
  await assert.rejects(run(["adventure", "--file", ".local/state.json", "--origin", "https://doriisrael.com", "--confirm"]), /loopback/);
  await assert.rejects(run(["adventure", "--file", ".local/state.json", "--force"]), /Unknown option/);
  assert.ok((await readFile(path)).equals(before), "refusals change nothing");

  const done = await run(["adventure", "--file", ".local/state.json", "--scenario", "pair", "--confirm"]);
  assert.doesNotMatch(done.stdout, /#invite=/, "links never reach the terminal");
  assert.match(done.stdout, /3 single-use invitations/);
  const backups = (await readdir(join(root, ".local"))).filter(name => name.startsWith("state.json.before-dev-reset-adventure-"));
  assert.equal(backups.length, 1);
  assert.ok((await readFile(join(root, ".local", backups[0]))).equals(before));
  const [links] = await readdir(join(root, ".local", "shuk-dev-reset"));
  const file = join(root, ".local", "shuk-dev-reset", links);
  assert.equal((await stat(file)).mode & 0o777, 0o600);
  const lines = (await readFile(file, "utf8")).trim().split("\n").map(line => line.split("\t"));
  assert.deepEqual(lines.map(([seat]) => seat), ["player-1 (host)", "player-2", "guide"]);
  for (const [, url] of lines) assert.match(url, /^http:\/\/localhost:3300\/memory-protocol\/dev\/amazing-shuk\/water#invite=[A-Za-z0-9_-]{43}$/);
  // The host's link signs in once, as the host of the fresh lobby.
  const token = lines[0][1].split("#invite=")[1];
  const host = await redeemInvitation(path, token);
  assert.equal((await sessionView(path, host)).adventure.host, true);
  assert.equal((await summariseDevState(path)).members, 1);

  const progress = await run(["progress", "--file", ".local/state.json", "--confirm"]);
  assert.match(progress.stdout, /Backup: state\.json\.before-dev-reset-progress-/);
}));
