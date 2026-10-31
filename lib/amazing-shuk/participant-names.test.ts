import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { cleanDisplayName, isValidNames, rosterParticipants, setDisplayName } from "./participant-names.ts";
import { issueInvitation, redeemInvitation, sessionView, setParticipantName } from "./participant-store.ts";

test("names are trimmed, 1–40 characters, with no control characters; only known participants", () => {
  assert.equal(cleanDisplayName("  Bea   Cohen Levi "), "Bea Cohen Levi");
  assert.equal(cleanDisplayName("סטייסי"), "סטייסי");
  for (const bad of ["", "   ", "x".repeat(41), "Mi\u0000chael", 7, null]) assert.equal(cleanDisplayName(bad), null, String(bad));
  assert.deepEqual(setDisplayName({}, "player-4", " Ari "), { "player-4": "Ari" });
  assert.deepEqual(setDisplayName({ "player-4": "Ari" }, "player-4", null), {});
  assert.throws(() => setDisplayName({}, "player-99", "Nobody"), /Unknown participant/);
  assert.throws(() => setDisplayName({}, "player-4", " "), /1–40/);
  assert.equal(isValidNames({ "player-4": "Ari", guide: "Dana" }), true);
  assert.equal(isValidNames({ "player-99": "x" }), false); assert.equal(isValidNames({ "player-4": " padded" }), false); assert.equal(isValidNames([]), false);
});

test("the roster lists members in the order they joined, then the guide: own name, else the seat's name, else Player N", () => {
  const members = [
    { id: "p_BBBBBBBBBBBBBBBBBBBBBB", joinedAt: 20, seat: "player-5" },
    { id: "p_AAAAAAAAAAAAAAAAAAAAAA", joinedAt: 10, seat: "player-4", name: "Own Name" },
    { id: "player-2", joinedAt: 0, seat: "player-2" },
    { id: "player-1", joinedAt: 0, seat: "player-1" },
    { id: "p_CCCCCCCCCCCCCCCCCCCCCC", joinedAt: 30 },
  ];
  assert.deepEqual(rosterParticipants(members, { "player-4": "Seat Name", "player-5": "Bea", "player-1": "Ari" }), [
    { id: "player-1", name: "Ari" }, { id: "player-2", name: "Player 2" }, { id: "p_AAAAAAAAAAAAAAAAAAAAAA", name: "Own Name" },
    { id: "p_BBBBBBBBBBBBBBBBBBBBBB", name: "Bea" }, { id: "p_CCCCCCCCCCCCCCCCCCCCCC", name: "Participant" }, { id: "guide", name: "Guide" }]);
  // Seats nobody holds are not members, so they are never listed.
  assert.deepEqual(rosterParticipants([], { "player-4": "Ari", guide: "Dana" }), [{ id: "guide", name: "Dana" }]);
});

async function fixture(run: (path: string) => Promise<void>) {
  await mkdir(".local", { recursive: true });
  const directory = await mkdtemp(join(process.cwd(), ".local", "shuk-names-"));
  try { await run(join(directory, "state.json")); } finally { await rm(directory, { recursive: true, force: true }); }
}

test("server: names are saved in the state file, sent to signed-in members, and a bad stored name is refused", () => fixture(async path => {
  const bea = await redeemInvitation(path, await issueInvitation(path, "player-5"));
  assert.equal(await setParticipantName(path, "player-4", "Ari"), "Ari");
  await setParticipantName(path, "player-5", "Bea");
  const view = await sessionView(path, bea);
  // Only members are listed: player-4 has a name but nobody has redeemed that seat.
  assert.deepEqual(view.participants.map(p => p.name), ["Bea", "Guide"]);
  await assert.rejects(sessionView(path, "not-a-session"), /Invitation login required/);
  await assert.rejects(setParticipantName(path, "player-4", ""), /1–40/);
  // A member's own name, by their ID; an ID nobody has is refused.
  const id = view.session.activeActorId;
  assert.equal(await setParticipantName(path, id, "Own Name"), "Own Name");
  assert.deepEqual((await sessionView(path, bea)).participants.map(p => p.name), ["Own Name", "Guide"]);
  assert.equal(await setParticipantName(path, id, null), null);
  await assert.rejects(setParticipantName(path, "p_AAAAAAAAAAAAAAAAAAAAAA", "Nobody"), /Unknown participant/);
  const disk = JSON.parse(await readFile(path, "utf8"));
  assert.deepEqual(disk.seatNames, { "player-4": "Ari", "player-5": "Bea" });
  assert.equal(disk.participants[id].name, undefined);
  await writeFile(path, JSON.stringify({ ...disk, seatNames: { "player-4": "\u0007bell" } }));
  await assert.rejects(sessionView(path, bea), /Unsupported Shuk storage state/);
  await writeFile(path, JSON.stringify({ ...disk, participants: { ...disk.participants, [id]: { ...disk.participants[id], name: " padded" } } }));
  await assert.rejects(sessionView(path, bea), /Unsupported Shuk storage state/);
}));

test("the naming script sets and clears a name in the app, and refuses without the app or simulation settings", () => fixture(async path => {
  const run = (args: string[], env: Record<string, string> & { NODE_ENV: "production" }) => promisify(execFile)(process.execPath,
    ["--experimental-strip-types", "--disable-warning=ExperimentalWarning", "scripts/shuk-name.ts", ...args], { env: { PATH: process.env.PATH ?? "", SHUK_DATA_FILE: path, ...env } });
  const app = { NODE_ENV: "production", NEXT_PUBLIC_DORI_APP: "shuk", SHUK_APP: "1" } as const;
  assert.equal((await run(["player-6", "Cal"], app)).stdout.trim(), "player-6: Cal");
  assert.deepEqual(JSON.parse(await readFile(path, "utf8")).seatNames, { "player-6": "Cal" });
  assert.equal((await run(["player-6", "--clear"], app)).stdout.trim(), "player-6: (cleared)");
  await assert.rejects(run(["player-6", "Cal"], { NODE_ENV: "production" }));
  await assert.rejects(run(["player-6"], app), /Usage/);
}));
