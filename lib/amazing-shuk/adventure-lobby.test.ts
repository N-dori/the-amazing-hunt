import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, readdir, stat, writeFile, rm } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { buildLobbyView, recommendedTeamCount, recommendedTeamSizes, stepCount, type AdventureView } from "./adventure-lobby.ts";
import { parseAction } from "./parse-water-action.ts";
import { issueHostInvitation, issueInvitation, redeemInvitation, sessionAction, sessionView, setParticipantName, startNewAdventure } from "./participant-store.ts";
import { schema5Snapshot } from "./legacy-store-fixture.ts";
import { LOBBY_COPY } from "./welcome-copy.ts";
import { GAN_HATUT_MISSION } from "./mission-arrival.ts";
const WELL = GAN_HATUT_MISSION.id;
const NOW = Date.UTC(2026, 9, 29, 22, 0, 0);
const forbidden = (error: Error & { status?: number }) => error.status === 403;
const unauthorised = (error: Error & { status?: number }) => error.status === 401;
const conflict = (error: Error & { status?: number }) => error.status === 409;
async function fixture(run: (path: string) => Promise<void>) {
  await mkdir(".local", { recursive: true });
  const directory = await mkdtemp(join(process.cwd(), ".local", "shuk-lobby-"));
  try { await run(join(directory, "state.json")); } finally { await rm(directory, { recursive: true, force: true }); }
}
const newAdventureCopies = async (path: string) => (await readdir(dirname(path))).filter(name => name.startsWith(basename(path) + ".before-new-adventure-"));
/** A lobby with player-1 as its host, plus a player and the guide, each signed in. */
async function lobbyWithHost(path: string) {
  const guide = await redeemInvitation(path, await issueInvitation(path, "guide", NOW), NOW);
  await startNewAdventure(path, NOW);
  const host = await redeemInvitation(path, await issueHostInvitation(path, "player-1", NOW), NOW);
  const player = await redeemInvitation(path, await issueInvitation(path, "player-4", NOW), NOW);
  // The new adventure signed the guide out; the guide comes back with a new invitation.
  await assert.rejects(sessionView(path, guide, NOW), unauthorised);
  return { host, player, guide: await redeemInvitation(path, await issueInvitation(path, "guide", NOW), NOW) };
}

test("the recommended teams: never more than five in a team, split as evenly as possible (owner, 29 Oct 2026)", () => {
  const expected: Record<number, number[]> = { 1: [1], 5: [5], 6: [3, 3], 7: [4, 3], 11: [4, 4, 3], 17: [5, 4, 4, 4], 30: [5, 5, 5, 5, 5, 5] };
  for (const [count, sizes] of Object.entries(expected)) {
    assert.equal(recommendedTeamCount(Number(count)), sizes.length, `teams for ${count}`);
    assert.deepEqual(recommendedTeamSizes(Number(count)), sizes, `sizes for ${count}`);
  }
  for (let count = 1; count <= 30; count++) {
    const sizes = recommendedTeamSizes(count);
    assert.equal(sizes.reduce((sum, size) => sum + size, 0), count);
    assert.ok(Math.max(...sizes) <= 5 && Math.max(...sizes) - Math.min(...sizes) <= 1, `even split for ${count}`);
  }
});

test("the lobby view recommends teams without claiming them: 1 to 5 can start, 6 and more can't until teams exist", () => {
  const host: AdventureView = { status: "lobby", intendedCount: null, host: true, leader: true, canManage: true };
  assert.deepEqual(buildLobbyView(host, null), { canManage: true, count: null, canDecrease: false, canIncrease: true, recommendation: null, needsTeams: false, canStart: false });
  for (const count of [1, 5]) assert.deepEqual([buildLobbyView(host, count).needsTeams, buildLobbyView(host, count).canStart], [false, true], `count ${count}`);
  assert.deepEqual(buildLobbyView(host, 5).recommendation, { teams: 1, sizes: [5] });
  assert.deepEqual(buildLobbyView(host, 6).recommendation, { teams: 2, sizes: [3, 3] });
  for (const count of [6, 7, 11, 17, 30]) assert.deepEqual([buildLobbyView(host, count).needsTeams, buildLobbyView(host, count).canStart], [true, false], `count ${count}`);
  assert.equal(buildLobbyView({ ...host, intendedCount: 3 }, null).count, 3);
  assert.equal(buildLobbyView(host, 30).canIncrease, false);
  assert.equal(buildLobbyView(host, 1).canDecrease, false);
  const player = { ...host, host: false, leader: false, canManage: false };
  assert.deepEqual([buildLobbyView(player, 4).canStart, buildLobbyView(player, 4).canIncrease, buildLobbyView(player, 4).canDecrease], [false, false, false]);
  assert.equal(buildLobbyView({ ...host, status: "active" }, 4).canStart, false);
  assert.deepEqual([stepCount(null, 1), stepCount(null, -1), stepCount(1, -1), stepCount(30, 1), stepCount(6, 1)], [1, 1, 1, 30, 7]);
  // The draft wording names a recommendation, and says plainly that one team plays for now.
  // The approved wording, filled from the actual count.
  const eleven = buildLobbyView(host, 11).recommendation!;
  assert.equal(LOBBY_COPY.recommendedTeams(eleven.teams), "Recommended teams: 3");
  assert.equal(LOBBY_COPY.suggestedSplit(eleven.sizes), "Suggested split: 4 + 4 + 3");
  const thirty = buildLobbyView(host, 30).recommendation!;
  assert.deepEqual([LOBBY_COPY.recommendedTeams(thirty.teams), LOBBY_COPY.suggestedSplit(thirty.sizes)], ["Recommended teams: 6", "Suggested split: 5 + 5 + 5 + 5 + 5 + 5"]);
  assert.deepEqual([LOBBY_COPY.recommendedTeams(1), LOBBY_COPY.suggestedSplit(buildLobbyView(host, 4).recommendation!.sizes)], ["Recommended teams: 1", "Suggested split: 4"]);
  assert.match(LOBBY_COPY.needsTeams, /coming soon/);
});

test("lobby actions parse only with a whole count", () => {
  assert.deepEqual(parseAction({ type: "set-intended-count", count: 7 }), { type: "set-intended-count", count: 7 });
  assert.deepEqual(parseAction({ type: "start-adventure", missionId: WELL }), { type: "start-adventure" });
  // No one-team stand-in for a larger group: an "as one team" flag is dropped, and the server decides from the stored count.
  assert.deepEqual(parseAction({ type: "start-adventure", asOneTeam: true }), { type: "start-adventure" });
  for (const count of [2.5, "7", null, undefined, Number.MAX_VALUE]) assert.equal(parseAction({ type: "set-intended-count", count }), null);
  assert.equal(parseAction({ type: "start-adventure", part: "bonus" }), null);
});

test("a host invitation makes its seat the host and team A's leader, once; host rights come only from it", () => fixture(async path => {
  // An adventure already under way (the migrated live game) takes no host invitation.
  await assert.rejects(issueHostInvitation(path, "player-1", NOW), conflict);
  await startNewAdventure(path, NOW);
  await assert.rejects(issueHostInvitation(path, "guide", NOW), forbidden);
  await assert.rejects(issueHostInvitation(path, "player-9", NOW), forbidden);
  // A plain invitation in the lobby signs in a player with no host rights.
  const plain = await redeemInvitation(path, await issueInvitation(path, "player-1", NOW), NOW);
  assert.deepEqual((await sessionView(path, plain, NOW)).adventure, { status: "lobby", intendedCount: null, host: false, leader: false, canManage: false });
  const token = await issueHostInvitation(path, "player-1", NOW);
  const stored = JSON.parse(await readFile(path, "utf8"));
  assert.ok(!JSON.stringify(stored).includes(token));
  assert.deepEqual(Object.values(stored.invitations), [{ participantId: "player-1", expiresAt: NOW + 86_400_000, kind: "host", teamId: "A" }]);
  // Expired after 24 hours.
  await assert.rejects(redeemInvitation(path, token, NOW + 86_400_000), unauthorised);
  const fresh = await issueHostInvitation(path, "player-1", NOW);
  const host = await redeemInvitation(path, fresh, NOW);
  assert.deepEqual((await sessionView(path, host, NOW)).adventure, { status: "lobby", intendedCount: null, host: true, leader: true, canManage: true });
  // The earlier plain session of the same seat stays an ordinary player: host rights belong to the host invitation's session.
  assert.deepEqual((await sessionView(path, plain, NOW)).adventure, { status: "lobby", intendedCount: null, host: false, leader: true, canManage: false });
  await assert.rejects(sessionAction(path, plain, { type: "set-intended-count", count: 3 }, "plain-seat-count-00001", NOW), forbidden);
  const written = JSON.parse(await readFile(path, "utf8"));
  assert.equal(written.adventure.hostId, "player-1");
  assert.equal(written.teams.A.leaderId, "player-1");
  await assert.rejects(redeemInvitation(path, fresh, NOW), unauthorised);
  await assert.rejects(issueHostInvitation(path, "player-2", NOW), conflict);
}));

test("a host invitation issued for one lobby can't be redeemed once the lobby has a host or has started", () => fixture(async path => {
  await startNewAdventure(path, NOW);
  const first = await issueHostInvitation(path, "player-1", NOW);
  // A second host invitation replaces the first.
  const second = await issueHostInvitation(path, "player-2", NOW);
  await assert.rejects(redeemInvitation(path, first, NOW), unauthorised);
  const guide = await redeemInvitation(path, await issueInvitation(path, "guide", NOW), NOW);
  await sessionAction(path, guide, { type: "set-intended-count", count: 3 }, "guide-count-before-host", NOW);
  await sessionAction(path, guide, { type: "start-adventure" }, "guide-start-before-host", NOW);
  await assert.rejects(redeemInvitation(path, second, NOW), unauthorised);
  assert.equal(JSON.parse(await readFile(path, "utf8")).adventure.hostId, null);
}));

test("only the host or the guide sets the count and starts; Start needs a count and happens once", () => fixture(async path => {
  const { host, player, guide } = await lobbyWithHost(path);
  await assert.rejects(sessionAction(path, player, { type: "set-intended-count", count: 4 }, "player-count-attempt-1", NOW), forbidden);
  await assert.rejects(sessionAction(path, player, { type: "start-adventure" }, "player-start-attempt-01", NOW), forbidden);
  await assert.rejects(sessionAction(path, host, { type: "start-adventure" }, "host-start-without-count", NOW), /how many are playing/);
  for (const count of [0, 31, 2.5]) await assert.rejects(sessionAction(path, host, { type: "set-intended-count", count }, `host-bad-count-${count}`.replace(".", "-") + "-x", NOW), forbidden);
  await sessionAction(path, guide, { type: "set-intended-count", count: 9 }, "guide-count-nine-0001", NOW);
  assert.deepEqual((await sessionView(path, player, NOW)).adventure, { status: "lobby", intendedCount: 9, host: false, leader: false, canManage: false });
  // 9 recommends two teams, which don't exist yet: Start is refused.
  await assert.rejects(sessionAction(path, host, { type: "start-adventure" }, "host-start-nine-plain-1", NOW), /needs multiple teams/);
  assert.equal((await sessionView(path, player, NOW)).adventure.status, "lobby");
  await sessionAction(path, host, { type: "set-intended-count", count: 5 }, "host-count-five-00001", NOW);
  assert.equal(await sessionAction(path, host, { type: "start-adventure" }, "host-start-adventure-1", NOW), "The adventure has started!");
  assert.equal((await sessionView(path, player, NOW)).adventure.status, "active");
  // A second Start (the guide's, queued at the same time) changes nothing; the count is fixed once play begins.
  assert.equal(await sessionAction(path, guide, { type: "start-adventure" }, "guide-start-adventure-2", NOW), "The adventure has already started.");
  await assert.rejects(sessionAction(path, host, { type: "set-intended-count", count: 6 }, "host-count-after-start", NOW), /already started/);
  assert.deepEqual(JSON.parse(await readFile(path, "utf8")).adventure, { status: "active", format: "together", hostId: "player-1", intendedCount: 5 });
}));

test("being host and leader grants no guide-only permission", () => fixture(async path => {
  const { host, guide } = await lobbyWithHost(path);
  await sessionAction(path, host, { type: "set-intended-count", count: 3 }, "host-count-three-0001", NOW);
  await sessionAction(path, host, { type: "start-adventure" }, "host-start-adventure-3", NOW);
  await assert.rejects(sessionAction(path, host, { type: "confirm-arrival", missionId: WELL }, "host-confirm-arrival-1", NOW), /Only the guide/);
  await assert.rejects(sessionAction(path, host, { type: "assign-role", role: "navigator", participantId: "player-1" }, "host-assign-role-0001", NOW), /Only the guide/);
  await assert.rejects(sessionAction(path, host, { type: "timing", operation: "pause", missionId: WELL }, "host-timing-pause-0001", NOW), /Only the guide/);
  // With no role, the host can't start a challenge or submit either: gameplay powers come from roles.
  await assert.rejects(sessionAction(path, host, { type: "start", missionId: WELL }, "host-start-challenge-01", NOW), /Only the navigator/);
  await assert.rejects(sessionAction(path, host, { type: "submit", missionId: WELL }, "host-submit-answer-0001", NOW), /Only the answer-submitter/);
  await sessionAction(path, guide, { type: "start", missionId: WELL }, "guide-start-challenge-1", NOW);
  await assert.rejects(sessionAction(path, host, { type: "guide-approve", missionId: WELL }, "host-guide-approve-0001", NOW), forbidden);
  const view = await sessionView(path, host, NOW);
  assert.equal("guideTiming" in view, false);
  assert.equal(view.performance.canStart, false);
}));

test("nothing on the journey counts in the lobby, for anyone; roles may be settled while the group waits", () => fixture(async path => {
  const { host, player, guide } = await lobbyWithHost(path);
  const refused = /hasn't started yet/;
  await assert.rejects(sessionAction(path, guide, { type: "start", missionId: WELL }, "lobby-guide-start-0001", NOW), refused);
  await assert.rejects(sessionAction(path, guide, { type: "confirm-arrival", missionId: WELL }, "lobby-guide-arrival-01", NOW), refused);
  await assert.rejects(sessionAction(path, guide, { type: "timing", operation: "pause", missionId: WELL }, "lobby-guide-timing-001", NOW), refused);
  await assert.rejects(sessionAction(path, player, { type: "hint", hint: 1, missionId: WELL }, "lobby-player-hint-0001", NOW), refused);
  await sessionAction(path, player, { type: "claim-role", role: "navigator" }, "lobby-claim-navigator-1", NOW);
  await sessionAction(path, guide, { type: "assign-role", role: "answerSubmitter", participantId: "player-1" }, "lobby-assign-submitter", NOW);
  await assert.rejects(sessionAction(path, player, { type: "start", missionId: WELL }, "lobby-navigator-start-1", NOW), refused);
  await sessionAction(path, host, { type: "set-intended-count", count: 2 }, "lobby-host-count-two-1", NOW);
  await sessionAction(path, host, { type: "start-adventure" }, "lobby-host-start-00001", NOW);
  await sessionAction(path, player, { type: "start", missionId: WELL }, "after-start-navigator-1", NOW);
  const view = await sessionView(path, player, NOW);
  assert.equal(view.performance.started, true);
  assert.deepEqual(view.session.roles, { navigator: "player-4", answerSubmitter: "player-1" });
}));

test("the migrated live game stays an active adventure with no host: play goes on as before", () => fixture(async path => {
  const player = await redeemInvitation(path, await issueInvitation(path, "player-1", NOW), NOW);
  await writeFile(path, JSON.stringify(schema5Snapshot(JSON.parse(await readFile(path, "utf8")))));
  assert.deepEqual((await sessionView(path, player, NOW)).adventure, { status: "active", intendedCount: null, host: false, leader: false, canManage: false });
  await sessionAction(path, player, { type: "start", missionId: WELL }, "migrated-navigator-start", NOW);
  await assert.rejects(sessionAction(path, player, { type: "start-adventure" }, "migrated-player-start-1", NOW), forbidden);
  assert.equal((await sessionView(path, player, NOW)).performance.started, true);
}));

test("a new adventure keeps the exact old file first, then opens an empty lobby; names and receipts stay", () => fixture(async path => {
  const player = await redeemInvitation(path, await issueInvitation(path, "player-1", NOW), NOW);
  await setParticipantName(path, "player-3", "Test Name");
  await sessionAction(path, player, { type: "start", missionId: WELL }, "old-adventure-start-001", NOW);
  // The old file is schema 5, as live is now: both copies are kept, each with the bytes it was given.
  await writeFile(path, JSON.stringify(schema5Snapshot(JSON.parse(await readFile(path, "utf8")))));
  const before = await readFile(path);
  const kept = await startNewAdventure(path, NOW);
  assert.equal(kept, "state.json.before-new-adventure-20261029T220000Z");
  const copy = join(dirname(path), kept);
  assert.ok((await readFile(copy)).equals(before));
  assert.equal((await stat(copy)).mode & 0o777, 0o600);
  assert.equal((await readdir(dirname(path))).filter(name => name.includes(".pre-schema6-")).length, 1);
  const db = JSON.parse(await readFile(path, "utf8"));
  assert.deepEqual(db.adventure, { status: "lobby", format: "together", hostId: null, intendedCount: null });
  assert.deepEqual([db.teams.A.leaderId, db.teams.A.roles, db.sessions, db.invitations], [null, { navigator: null, answerSubmitter: null }, {}, {}]);
  // Missions are stored empty; the store rebuilds each one's empty record on load.
  assert.deepEqual(db.teams.A.missions, {});
  assert.equal(Object.keys(db.participants).length, 7);
  assert.equal(db.names["player-3"], "Test Name");
  assert.deepEqual(db.applied["player-1"], ["old-adventure-start-001"]);
  await assert.rejects(sessionView(path, player, NOW), unauthorised);
}));

test("if the new-adventure copy can't be kept, nothing changes", () => fixture(async path => {
  await redeemInvitation(path, await issueInvitation(path, "player-1", NOW), NOW);
  const before = await readFile(path);
  await writeFile(`${path}.before-new-adventure-20261029T220000Z`, "something else");
  await assert.rejects(startNewAdventure(path, NOW), (error: Error & { status?: number }) => error.status === 503);
  assert.ok((await readFile(path)).equals(before));
  assert.deepEqual(await newAdventureCopies(path), ["state.json.before-new-adventure-20261029T220000Z"]);
  assert.equal((await readdir(dirname(path))).filter(name => name.endsWith(".tmp")).length, 0);
  // With no file yet there is nothing to keep, and the lobby opens.
  await rm(path);
  await rm(`${path}.before-new-adventure-20261029T220000Z`);
  assert.equal(await startNewAdventure(path, NOW), null);
  assert.equal(JSON.parse(await readFile(path, "utf8")).adventure.status, "lobby");
}));

test("6 to 30 can't start, even with an \"as one team\" flag; 5 or fewer can, and the live format stays what I1 reads", () => fixture(async path => {
  const { host, guide } = await lobbyWithHost(path);
  for (const count of [6, 7, 11, 17, 30]) {
    await sessionAction(path, host, { type: "set-intended-count", count }, `host-count-${count}-big-0001`, NOW);
    await assert.rejects(sessionAction(path, host, { type: "start-adventure" }, `host-start-${count}-big-001`, NOW), /needs multiple teams/);
    await assert.rejects(sessionAction(path, guide, { type: "start-adventure", asOneTeam: true } as never, `guide-start-${count}-big-01`, NOW), /needs multiple teams/);
  }
  assert.equal(JSON.parse(await readFile(path, "utf8")).adventure.status, "lobby");
  await sessionAction(path, host, { type: "set-intended-count", count: 5 }, "host-count-back-to-five", NOW);
  assert.equal(await sessionAction(path, host, { type: "start-adventure" }, "host-start-five-0000001", NOW), "The adventure has started!");
  const db = JSON.parse(await readFile(path, "utf8"));
  assert.deepEqual(db.adventure, { status: "active", format: "together", hostId: "player-1", intendedCount: 5 });
  assert.deepEqual(Object.keys(db.teams), ["A"]);
}));

test("host rights belong to the host invitation's session: other sessions of the seat, replacements and later links get none", () => fixture(async path => {
  await startNewAdventure(path, NOW);
  // A session of the seat from before the host invitation.
  const before = await redeemInvitation(path, await issueInvitation(path, "player-1", NOW), NOW);
  const host = await redeemInvitation(path, await issueHostInvitation(path, "player-1", NOW), NOW);
  // A later ordinary invitation for the same seat (a second phone): signed in, but not the host.
  const later = await redeemInvitation(path, await issueInvitation(path, "player-1", NOW), NOW);
  for (const [label, session] of [["before", before], ["later", later]] as const) {
    assert.equal((await sessionView(path, session, NOW)).adventure.canManage, false, label);
    await assert.rejects(sessionAction(path, session, { type: "set-intended-count", count: 2 }, `seat-${label}-count-00001`, NOW), forbidden);
    await assert.rejects(sessionAction(path, session, { type: "start-adventure" }, `seat-${label}-start-00001`, NOW), forbidden);
  }
  assert.equal((await sessionView(path, host, NOW)).adventure.canManage, true);
  // The host's browser opens an ordinary link: the replaced host session is gone, and the new one isn't the host.
  const replaced = await redeemInvitation(path, await issueInvitation(path, "player-1", NOW), NOW, host);
  await assert.rejects(sessionView(path, host, NOW), unauthorised);
  assert.equal((await sessionView(path, replaced, NOW)).adventure.host, false);
  // A lost phone: the operator issues the same seat a new host link. Redeeming it (here replacing an ordinary session) moves the
  // rights to the new session; another seat can't be made host while this one is.
  await assert.rejects(issueHostInvitation(path, "player-2", NOW), conflict);
  const again = await redeemInvitation(path, await issueHostInvitation(path, "player-1", NOW), NOW, later);
  await assert.rejects(sessionView(path, later, NOW), unauthorised);
  assert.equal((await sessionView(path, again, NOW)).adventure.host, true);
  const third = await redeemInvitation(path, await issueHostInvitation(path, "player-1", NOW), NOW);
  assert.equal((await sessionView(path, third, NOW)).adventure.host, true);
  assert.equal((await sessionView(path, again, NOW)).adventure.host, false);
  await assert.rejects(sessionAction(path, again, { type: "set-intended-count", count: 2 }, "old-host-count-attempt", NOW), forbidden);
  const stored = JSON.parse(await readFile(path, "utf8"));
  assert.equal(Object.values(stored.sessions as Record<string, { host?: true }>).filter(session => session.host).length, 1);
  // Replayed, expired, and after the start.
  const unused = await issueHostInvitation(path, "player-1", NOW);
  await assert.rejects(redeemInvitation(path, unused, NOW + 86_400_000), unauthorised);
  await sessionAction(path, third, { type: "set-intended-count", count: 4 }, "host-third-count-00001", NOW);
  await sessionAction(path, third, { type: "start-adventure" }, "host-third-start-00001", NOW);
  await assert.rejects(issueHostInvitation(path, "player-1", NOW), conflict);
  await assert.rejects(redeemInvitation(path, unused, NOW), unauthorised);
}));

test("unknown or failed invitations get one friendly message", () => fixture(async path => {
  await assert.rejects(redeemInvitation(path, "x".repeat(43), NOW), (error: Error & { status?: number }) => error.status === 401 && /expired or has already been used/.test(error.message));
}));

test("an invitation of a kind this version doesn't grant is refused (leader invitations are reserved for I7a)", () => fixture(async path => {
  await startNewAdventure(path, NOW);
  const token = await issueInvitation(path, "player-5", NOW);
  const db = JSON.parse(await readFile(path, "utf8"));
  const [key] = Object.keys(db.invitations);
  for (const kind of ["leader", "guide", "admin"]) {
    await writeFile(path, JSON.stringify({ ...db, invitations: { [key]: { ...db.invitations[key], kind, teamId: "A" } } }));
    await assert.rejects(redeemInvitation(path, token, NOW), unauthorised);
  }
  const after = JSON.parse(await readFile(path, "utf8"));
  assert.deepEqual([after.sessions, after.teams.A.leaderId, after.adventure.hostId], [{}, null, null]);
}));
