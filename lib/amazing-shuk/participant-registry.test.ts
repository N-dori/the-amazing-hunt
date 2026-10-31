import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { issueHostInvitation, issueInvitation, redeemInvitation, sessionAction, sessionView, setParticipantName, startNewAdventure } from "./participant-store.ts";
import { schema6Snapshot } from "./legacy-store-fixture.ts";
import { GAN_HATUT_MISSION } from "./mission-arrival.ts";

// I3a: the participant registry (schema 7). Members come only from redeeming an invitation; IDs are random; host and leader
// rights belong to one session; a session counts only while its member is in the registry.
const WELL = GAN_HATUT_MISSION.id;
const NOW = Date.UTC(2026, 9, 31, 12, 0, 0);
const RANDOM_ID = /^p_[A-Za-z0-9_-]{22}$/;
const forbidden = (error: Error & { status?: number }) => error.status === 403;
const signedOut = (error: Error & { status?: number }) => error.status === 401;
const conflict = (error: Error & { status?: number }) => error.status === 409;
const hash = (token: string) => createHash("sha256").update(token).digest("hex");
const stored = async (path: string) => JSON.parse(await readFile(path, "utf8"));
const idOf = async (path: string, token: string) => (await sessionView(path, token, NOW)).session.activeActorId;
// The well's cups; null if the view is for a "choose N" mission.
const cupsOf = (view: Awaited<ReturnType<typeof sessionView>>) => "cups" in view.session ? view.session.cups : null;
async function fixture(run: (path: string) => Promise<void>) {
  await mkdir(".local", { recursive: true });
  const directory = await mkdtemp(join(process.cwd(), ".local", "shuk-registry-"));
  try { await run(join(directory, "state.json")); } finally { await rm(directory, { recursive: true, force: true }); }
}
const signIn = async (path: string, seat: string) => redeemInvitation(path, await issueInvitation(path, seat, NOW), NOW);
/** A started adventure: player-1 is the host (through the host invitation), player-4 the navigator, plus the guide. */
async function hostedAdventure(path: string) {
  await startNewAdventure(path, NOW);
  const host = await redeemInvitation(path, await issueHostInvitation(path, "player-1", NOW), NOW);
  const player = await signIn(path, "player-4");
  const guide = await signIn(path, "guide");
  await sessionAction(path, host, { type: "set-intended-count", count: 3 }, "registry-host-count-001", NOW);
  await sessionAction(path, host, { type: "start-adventure" }, "registry-host-start-001", NOW);
  await sessionAction(path, player, { type: "claim-role", role: "navigator" }, "registry-claim-nav-0001", NOW);
  await sessionAction(path, player, { missionId: WELL, type: "start" }, "registry-well-start-001", NOW);
  await sessionAction(path, player, { missionId: WELL, type: "move", move: "fill-large" }, "registry-well-fill-0001", NOW);
  return { host, player, guide };
}

test("only redeeming an invitation makes a member, with a random ID; an issued invitation, a seat or a guessed ID never does", () => fixture(async path => {
  await startNewAdventure(path, NOW);
  assert.deepEqual((await stored(path)).participants, {}, "a new adventure has no members");
  await issueInvitation(path, "player-3", NOW);
  assert.deepEqual((await stored(path)).participants, {}, "an invitation alone makes no member");
  const first = await signIn(path, "player-3");
  const id = await idOf(path, first);
  assert.match(id, RANDOM_ID); assert.ok(!id.includes("player"), "the ID says nothing about the seat");
  assert.deepEqual((await stored(path)).participants, { [id]: { teamId: "A", joinedAt: NOW, seat: "player-3" } });
  // A second phone for the same seat signs in as the same member; another seat is another member.
  const second = await signIn(path, "player-3");
  assert.equal(await idOf(path, second), id);
  const other = await signIn(path, "player-6");
  assert.notEqual(await idOf(path, other), id); assert.match(await idOf(path, other), RANDOM_ID);
  // The guide is never a member.
  const guide = await signIn(path, "guide");
  assert.equal(await idOf(path, guide), "guide");
  assert.ok(!Object.hasOwn((await stored(path)).participants, "guide"));
  // A role can't go to an ID that isn't a member, guessed or a seat.
  for (const [index, guess] of ["p_AAAAAAAAAAAAAAAAAAAAAA", "player-5", "guide"].entries()) {
    await assert.rejects(sessionAction(path, guide, { type: "assign-role", role: "navigator", participantId: guess }, `registry-guess-role-${index}`, NOW), /current group participant/);
  }
  // A session that names a non-member (written into the file, as a forged or stale record would be) signs nobody in.
  const db = await stored(path);
  const forged = "f".repeat(43);
  await writeFile(path, JSON.stringify({ ...db, sessions: { ...db.sessions, [hash(forged)]: { participantId: "p_AAAAAAAAAAAAAAAAAAAAAA", expiresAt: NOW + 1e9 } } }));
  await assert.rejects(sessionView(path, forged, NOW), signedOut);
  // After a new adventure the same seat gets a new member: the old ID means nothing any more.
  await startNewAdventure(path, NOW);
  const again = await signIn(path, "player-3");
  assert.notEqual(await idOf(path, again), id);
  await assert.rejects(sessionView(path, first, NOW), signedOut);
}));

test("removing a member from the registry signs out every session they hold", () => fixture(async path => {
  const { player, guide } = await hostedAdventure(path);
  const secondPhone = await signIn(path, "player-4");
  const id = await idOf(path, player);
  const db = await stored(path);
  const rest = Object.fromEntries(Object.entries(db.participants).filter(([member]) => member !== id));
  // I3c's removal will also free the member's roles; here the role is cleared the way the guide would, before the removal.
  await writeFile(path, JSON.stringify({ ...db, participants: rest, teams: { ...db.teams, A: { ...db.teams.A, roles: { navigator: null, answerSubmitter: null } } } }));
  for (const token of [player, secondPhone]) {
    await assert.rejects(sessionView(path, token, NOW), signedOut);
    await assert.rejects(sessionAction(path, token, { missionId: WELL, type: "move", move: "empty-large" }, "registry-removed-move-1", NOW), signedOut);
  }
  assert.equal(cupsOf(await sessionView(path, guide, NOW))?.large, 5, "the team keeps its progress");
}));

test("host and leader rights belong to the host invitation's session, and end when the leadership moves", () => fixture(async path => {
  await startNewAdventure(path, NOW);
  const before = await signIn(path, "player-1");
  const host = await redeemInvitation(path, await issueHostInvitation(path, "player-1", NOW), NOW);
  const later = await signIn(path, "player-1");
  const hostId = await idOf(path, host);
  assert.equal(await idOf(path, before), hostId, "one member, three sessions");
  assert.deepEqual((await sessionView(path, host, NOW)).adventure, { status: "lobby", intendedCount: null, host: true, leader: true, canManage: true });
  for (const session of [before, later]) {
    assert.deepEqual((await sessionView(path, session, NOW)).adventure, { status: "lobby", intendedCount: null, host: false, leader: false, canManage: false });
  }
  // Only the new session made by redeeming carries the rights; nothing was added to the seat's existing sessions.
  const sessions = (await stored(path)).sessions;
  assert.deepEqual(sessions[hash(host)], { participantId: hostId, expiresAt: NOW + 7 * 86_400_000, host: true, leaderTeamId: "A" });
  for (const session of [before, later]) assert.deepEqual(sessions[hash(session)], { participantId: hostId, expiresAt: NOW + 7 * 86_400_000 });
  // A lost phone: a new host link for the seat moves both rights to the new session; the old host session keeps only its sign-in.
  const replacement = await redeemInvitation(path, await issueHostInvitation(path, "player-1", NOW), NOW);
  assert.equal((await sessionView(path, host, NOW)).adventure.leader, false);
  assert.equal((await sessionView(path, host, NOW)).adventure.host, false);
  assert.equal((await sessionView(path, replacement, NOW)).adventure.leader, true);
  assert.deepEqual((await stored(path)).sessions[hash(host)], { participantId: hostId, expiresAt: NOW + 7 * 86_400_000 });
  // Another seat can't take the host invitation while this seat is host.
  await assert.rejects(issueHostInvitation(path, "player-2", NOW), conflict);
  // When the team's leader changes (I4 will do this; written directly here), the old leader session is no longer the leader,
  // even though its flag is still stored, and the new leader has no leader session until one is granted.
  const other = await signIn(path, "player-2");
  const db = await stored(path);
  await writeFile(path, JSON.stringify({ ...db, teams: { ...db.teams, A: { ...db.teams.A, leaderId: await idOf(path, other) } } }));
  assert.equal((await sessionView(path, replacement, NOW)).adventure.leader, false);
  assert.equal((await sessionView(path, other, NOW)).adventure.leader, false);
}));

test("a name is a label only: being named Guide grants nothing", () => fixture(async path => {
  const { player } = await hostedAdventure(path);
  const id = await idOf(path, player);
  await setParticipantName(path, id, "Guide");
  await setParticipantName(path, "player-4", "Guide");
  const view = await sessionView(path, player, NOW);
  assert.equal(view.participants.find(participant => participant.id === id)?.name, "Guide");
  assert.deepEqual(view.adventure, { status: "active", intendedCount: 3, host: false, leader: false, canManage: false });
  assert.equal("guideTiming" in view, false);
  await assert.rejects(sessionAction(path, player, { type: "confirm-arrival", missionId: WELL }, "registry-named-arrive-1", NOW), /Only the guide/);
  await assert.rejects(sessionAction(path, player, { type: "assign-role", role: "answerSubmitter", participantId: id }, "registry-named-assign-1", NOW), /Only the guide/);
  await assert.rejects(sessionAction(path, player, { type: "timing", operation: "pause", missionId: WELL }, "registry-named-timing-1", NOW), /Only the guide/);
}));

test("schema 6 → 7 keeps the members in use under their IDs, with their roles, host, sessions, progress and receipts", () => fixture(async path => {
  const { host, player, guide } = await hostedAdventure(path);
  await signIn(path, "player-6");
  await issueInvitation(path, "player-7", NOW);
  await setParticipantName(path, "player-5", "Unused Seat");
  // The file as an I2 server (schema 6) would hold it: every seat in team A, members named by seat.
  const v6 = schema6Snapshot(await stored(path));
  await writeFile(path, JSON.stringify(v6));
  const bytes = await readFile(path);
  const before = { host: await sessionView(path, host, NOW), player: await sessionView(path, player, NOW), guide: await sessionView(path, guide, NOW) };
  assert.equal((await readFile(path)).equals(bytes), true, "reads migrate in memory only");
  assert.equal(before.player.session.activeActorId, "player-4");
  assert.deepEqual(before.host.adventure, { status: "active", intendedCount: 3, host: true, leader: true, canManage: true });
  assert.deepEqual(before.player.session.roles, { navigator: "player-4", answerSubmitter: null });
  assert.deepEqual(cupsOf(before.player), { small: 0, large: 5, jar: 0 });
  // Only the seats someone uses are members; seat player-5 (just a name) and player-7 (an unused invitation) are not.
  assert.deepEqual(before.player.participants.map(participant => participant.id), ["player-1", "player-4", "player-6", "guide"]);
  // The first write keeps the exact v6 bytes beside the file, then persists the same game.
  await sessionAction(path, player, { missionId: WELL, type: "move", move: "pour-large-into-small" }, "registry-after-v6-move-1", NOW);
  const copies = (await readdir(dirname(path))).filter(name => name.startsWith(basename(path) + ".pre-schema7-"));
  assert.equal(copies.length, 1);
  assert.ok((await readFile(join(dirname(path), copies[0]))).equals(bytes));
  const migrated = await stored(path);
  assert.equal(migrated.version, 7);
  assert.deepEqual(migrated.participants, Object.fromEntries(["player-1", "player-4", "player-6"].map(seat => [seat, { teamId: "A", joinedAt: 0, seat }])));
  assert.deepEqual(migrated.adventure, v6.adventure);
  assert.equal(migrated.teams.A.leaderId, "player-1");
  assert.deepEqual(migrated.seatNames, v6.names); assert.equal(migrated.names, undefined);
  assert.deepEqual(Object.values(migrated.invitations).map(invitation => (invitation as { seat: string }).seat), ["player-7"]);
  assert.deepEqual(migrated.applied, { ...v6.applied, "player-4": [...v6.applied["player-4"], "registry-after-v6-move-1"] });
  // The host session gained the leadership it had in I2; the seat's other sessions gained nothing.
  const hostSession = migrated.sessions[hash(host)];
  assert.deepEqual(hostSession, { ...v6.sessions[hash(host)], leaderTeamId: "A" });
  assert.equal(Object.values(migrated.sessions as Record<string, { leaderTeamId?: string }>).filter(session => session.leaderTeamId).length, 1);
  // Every session still works, and a queued action naming the seat's ID still matches its member.
  assert.deepEqual((await sessionView(path, host, NOW)).adventure, before.host.adventure);
  assert.deepEqual(cupsOf(await sessionView(path, player, NOW)), { small: 3, large: 2, jar: 0 });
  await sessionAction(path, player, { missionId: WELL, type: "move", move: "empty-small" }, "registry-queued-seat-id1", NOW, "player-4");
  assert.deepEqual((await sessionView(path, guide, NOW)).sharedBalance, before.guide.sharedBalance);
  // An unused seat redeemed after the migration gets a random ID; the host seat can still get a lost-phone link only in a lobby.
  assert.match(await idOf(path, await signIn(path, "player-5")), RANDOM_ID);
  await assert.rejects(issueHostInvitation(path, "player-1", NOW), conflict);
}));

test("rollback: restoring the pre-schema-7 copy gives back the exact v6 file; a failed migration changes nothing", () => fixture(async path => {
  const { player } = await hostedAdventure(path);
  await writeFile(path, JSON.stringify(schema6Snapshot(await stored(path))));
  const bytes = await readFile(path);
  const copy = `${path}.pre-schema7-${createHash("sha256").update(bytes).digest("hex").slice(0, 12)}`;
  // Something already under the copy's name: the migrating write stops and the v6 file stays exactly as it was.
  await mkdir(copy);
  await assert.rejects(sessionAction(path, player, { missionId: WELL, type: "move", move: "empty-large" }, "registry-blocked-move-01", NOW), (error: Error & { status?: number }) => error.status === 503);
  assert.ok((await readFile(path)).equals(bytes));
  assert.equal((await stored(path)).version, 6);
  await rm(copy, { recursive: true });
  // A rejected action never writes, so it migrates nothing either.
  await assert.rejects(sessionAction(path, player, { missionId: WELL, type: "hint", hint: 9 }, "registry-bad-hint-00001", NOW));
  assert.ok((await readFile(path)).equals(bytes));
  // The first successful write migrates; restoring the copy (the documented path) returns the I2 file byte for byte.
  await sessionAction(path, player, { missionId: WELL, type: "move", move: "empty-large" }, "registry-blocked-move-01", NOW);
  assert.equal((await stored(path)).version, 7);
  await writeFile(path + ".restore", await readFile(copy), { mode: 0o600 });
  await rename(path + ".restore", path);
  assert.ok((await readFile(path)).equals(bytes));
  assert.equal((await stored(path)).version, 6);
  // Read by this version again, it is the same game as before the restore point (the move after it is gone, as documented).
  assert.deepEqual(cupsOf(await sessionView(path, player, NOW)), { small: 0, large: 5, jar: 0 });
}));

test("a schema 7 file that breaks the registry's rules is refused, never repaired", () => fixture(async path => {
  const { player } = await hostedAdventure(path);
  const db = await stored(path);
  const id = await idOf(path, player);
  const broken = [
    { ...db, participants: { ...db.participants, "p_short": { teamId: "A", joinedAt: NOW } } },
    { ...db, participants: { ...db.participants, "p_AAAAAAAAAAAAAAAAAAAAAA": { teamId: "A", joinedAt: NOW, seat: db.participants[id].seat } } },
    { ...db, participants: { ...db.participants, "p_AAAAAAAAAAAAAAAAAAAAAA": { teamId: "A", joinedAt: NOW, seat: "guide" } } },
    { ...db, participants: { ...db.participants, guide: { teamId: "A", joinedAt: 0 } } },
    { ...db, participants: { ...db.participants, [id]: { ...db.participants[id], joinedAt: -1 } } },
    { ...db, invitations: { x: { seat: "player-99", expiresAt: NOW } } },
    { ...db, adventure: { ...db.adventure, hostId: "p_AAAAAAAAAAAAAAAAAAAAAA" } },
    { ...db, seatNames: { "p_AAAAAAAAAAAAAAAAAAAAAA": "Not a seat" } },
  ];
  for (const [index, file] of broken.entries()) {
    await writeFile(path, JSON.stringify(file));
    await assert.rejects(sessionView(path, player, NOW), /Unsupported Shuk storage state/, String(index));
  }
}));

test("an edited invitation can't make the guide a host or a member of a missing team; odd IDs never reach a member's name", () => fixture(async path => {
  await startNewAdventure(path, NOW);
  const token = await issueInvitation(path, "player-3", NOW);
  const db = await stored(path);
  const [key] = Object.keys(db.invitations);
  for (const invitation of [{ seat: "guide", expiresAt: NOW + 1e9, kind: "host", teamId: "A" }, { seat: "player-3", expiresAt: NOW + 1e9, teamId: "Z" }]) {
    await writeFile(path, JSON.stringify({ ...db, invitations: { [key]: invitation } }));
    await assert.rejects(redeemInvitation(path, token, NOW), signedOut);
    const after = await stored(path);
    assert.deepEqual([after.participants, after.sessions, after.adventure.hostId], [{}, {}, null]);
  }
  for (const id of ["__proto__", "constructor", "toString"]) await assert.rejects(setParticipantName(path, id, "Name"), /Unknown participant/);
  assert.equal(Object.getPrototypeOf((await stored(path)).participants), Object.prototype);
}));

test("the operator's seats stay a fallback: unknown seats are refused, and the guide can't be the host", () => fixture(async path => {
  await startNewAdventure(path, NOW);
  for (const seat of ["player-8", "p_AAAAAAAAAAAAAAAAAAAAAA", ""]) await assert.rejects(issueInvitation(path, seat, NOW), forbidden);
  await assert.rejects(issueHostInvitation(path, "guide", NOW), forbidden);
  // The host invitation needs no earlier member: redeeming it makes the seat's member and its host together.
  const host = await redeemInvitation(path, await issueHostInvitation(path, "player-2", NOW), NOW);
  const db = await stored(path);
  assert.equal(db.adventure.hostId, await idOf(path, host));
  assert.deepEqual(Object.values(db.participants), [{ teamId: "A", joinedAt: NOW, seat: "player-2" }]);
}));
