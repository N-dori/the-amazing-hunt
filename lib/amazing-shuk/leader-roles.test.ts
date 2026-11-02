import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { issueHostInvitation, issueInvitation, redeemInvitation, ROLE_CHANGE_REFUSED, sessionAction, sessionView, startNewAdventure } from "./participant-store.ts";
import { roleForParticipant } from "./roles.ts";
import { GAN_HATUT_MISSION } from "./mission-arrival.ts";

// I4a (owner, 31 Oct 2026): the session that leads a team assigns, reassigns and frees Navigator and Submitter among its own
// members. Self-claim and the guide stay; leading grants no guide-only permission and no right to submit.
const WELL = GAN_HATUT_MISSION.id;
const NOW = Date.UTC(2026, 9, 31, 12, 0, 0);
const DAY = 86_400_000;
const refused = (pattern: RegExp) => (error: Error & { status?: number }) => error.status === 403 && pattern.test(error.message);
const signedOut = (error: Error & { status?: number }) => error.status === 401;
const notLeader = refused(new RegExp(ROLE_CHANGE_REFUSED.replace(/[.']/g, ".")));
const hash = (token: string) => createHash("sha256").update(token).digest("hex");
const stored = async (path: string) => JSON.parse(await readFile(path, "utf8"));
const idOf = async (path: string, token: string) => (await sessionView(path, token, NOW)).session.activeActorId;
const rolesOf = async (path: string, token: string) => (await sessionView(path, token, NOW)).session.roles;
let counter = 0;
const key = (name: string) => `${name}-action-${String(++counter).padStart(8, "0")}`;
const assign = (path: string, token: string, role: "navigator" | "answerSubmitter", participantId: string | null, actionId = key("leader-assign")) =>
  sessionAction(path, token, { type: "assign-role", role, participantId }, actionId, NOW);
async function fixture(run: (path: string) => Promise<void>) {
  await mkdir(".local", { recursive: true });
  const directory = await mkdtemp(join(process.cwd(), ".local", "shuk-leader-roles-"));
  try { await run(join(directory, "state.json")); } finally { await rm(directory, { recursive: true, force: true }); }
}
const signIn = async (path: string, seat: string) => redeemInvitation(path, await issueInvitation(path, seat, NOW), NOW);
/** A team of `size`: player-1 hosts and leads; player-2… join; plus the guide. Started unless `lobby`. */
async function team(path: string, size: number, lobby = false) {
  await startNewAdventure(path, NOW);
  const leader = await redeemInvitation(path, await issueHostInvitation(path, "player-1", NOW), NOW);
  const players: string[] = [];
  for (let seat = 2; seat <= size; seat++) players.push(await signIn(path, `player-${seat}`));
  const guide = await signIn(path, "guide");
  if (!lobby) {
    await sessionAction(path, leader, { type: "set-intended-count", count: size }, key("count"), NOW);
    await sessionAction(path, leader, { type: "start-adventure" }, key("start"), NOW);
  }
  const ids = [await idOf(path, leader), ...await Promise.all(players.map(token => idOf(path, token)))];
  return { leader, players, guide, ids };
}

test("teams of 1 to 5: the leader assigns, reassigns and frees both roles among the team's members", async () => {
  for (let size = 1; size <= 5; size++) await fixture(async path => {
    const { leader, players, ids } = await team(path, size);
    const last = ids[ids.length - 1];
    await assign(path, leader, "navigator", last);
    await assign(path, leader, "answerSubmitter", ids[0]);
    assert.deepEqual(await rolesOf(path, leader), { navigator: last, answerSubmitter: ids[0] }, `size ${size}`);
    if (size === 1) assert.equal(roleForParticipant(ids[0], await rolesOf(path, leader)), "navigatorAndAnswerSubmitter", "a team of one holds both");
    // Reassigning a held role moves it; No one frees it.
    await assign(path, leader, "answerSubmitter", ids[1 % size]);
    await assign(path, leader, "navigator", null);
    // A team of one still holds both whatever is stored (D12); larger teams show exactly what the leader set.
    assert.deepEqual(await rolesOf(path, leader), size === 1 ? { navigator: ids[0], answerSubmitter: ids[0] } : { navigator: null, answerSubmitter: ids[1 % size] }, `size ${size}`);
    // Players still choose for themselves; a player who isn't the leader can't change anyone's role.
    if (size > 1) {
      assert.match(await sessionAction(path, players[0], { type: "claim-role", role: "navigator" }, key("claim"), NOW), /navigator now/);
      await assert.rejects(assign(path, players[players.length - 1], "navigator", ids[ids.length - 1]), notLeader);
      await assert.rejects(assign(path, players[0], "answerSubmitter", ids[1]), notLeader);
      assert.deepEqual(await rolesOf(path, leader), { navigator: ids[1], answerSubmitter: ids[1 % size] }, `size ${size}`);
    }
  });
});

test("leading grants no guide-only permission and no right to submit without the Submitter role", () => fixture(async path => {
  const { leader, players, guide, ids } = await team(path, 3);
  await assign(path, leader, "navigator", ids[0]);
  await assign(path, leader, "answerSubmitter", ids[2]);
  await sessionAction(path, leader, { type: "start", missionId: WELL }, key("start-well"), NOW);
  await assert.rejects(sessionAction(path, leader, { type: "submit", missionId: WELL }, key("leader-submit"), NOW), refused(/Only the answer-submitter/));
  await assert.rejects(sessionAction(path, leader, { type: "confirm-arrival", missionId: WELL }, key("leader-arrival"), NOW), refused(/Only the guide/));
  await assert.rejects(sessionAction(path, leader, { type: "timing", operation: "pause", missionId: WELL }, key("leader-timing"), NOW), refused(/Only the guide/));
  await assert.rejects(sessionAction(path, leader, { type: "guide-approve", missionId: WELL }, key("leader-approve"), NOW), refused(/./));
  assert.equal("guideTiming" in await sessionView(path, leader, NOW), false);
  // The Submitter the leader chose may submit (the jar isn't solved, so the answer is wrong, but it is theirs to give).
  assert.match(await sessionAction(path, players[1], { type: "submit", missionId: WELL }, key("submitter-submit"), NOW), /exactly 4 liters/);
  // The guide keeps oversight: it can reassign what the leader assigned.
  await assign(path, guide, "answerSubmitter", ids[1]);
  assert.deepEqual(await rolesOf(path, leader), { navigator: ids[0], answerSubmitter: ids[1] });
  // A replayed assignment changes nothing.
  const actionId = key("leader-replay");
  await assign(path, leader, "navigator", ids[2], actionId);
  await assign(path, guide, "navigator", ids[1]);
  assert.match(await assign(path, leader, "navigator", ids[2], actionId), /already synced/);
  assert.equal((await rolesOf(path, leader)).navigator, ids[1]);
}));

test("cross-team isolation: a leader changes roles only in their own team, and only to their own members", () => fixture(async path => {
  const { leader, players, ids } = await team(path, 3);
  // A second team, written directly (nothing creates one yet): player-3 moves to team B and leads it from their session.
  const db = await stored(path);
  const bId = ids[2];
  db.participants[bId] = { ...db.participants[bId], teamId: "B" };
  db.teams.B = { leaderId: bId, roles: { navigator: null, answerSubmitter: null }, missions: {} };
  db.sessions[hash(players[1])] = { ...db.sessions[hash(players[1])], leaderTeamId: "B" };
  await writeFile(path, JSON.stringify(db));
  const bLeader = players[1];
  assert.equal((await sessionView(path, bLeader, NOW)).adventure.leader, true);
  // Team A's leader can't give a role to team B's member, and team B's leader can't give one to team A's.
  await assert.rejects(assign(path, leader, "navigator", bId), refused(/current group participant/));
  await assert.rejects(assign(path, bLeader, "navigator", ids[0]), refused(/current group participant/));
  // Each leader's change lands in their own team only.
  await assign(path, leader, "navigator", ids[1]);
  await assign(path, bLeader, "navigator", bId);
  const after = await stored(path);
  assert.deepEqual(after.teams.A.roles, { navigator: ids[1], answerSubmitter: null });
  assert.deepEqual(after.teams.B.roles, { navigator: bId, answerSubmitter: null });
  // A's member who isn't a leader can't change B's roles (nor A's).
  await assert.rejects(assign(path, players[0], "navigator", ids[1]), notLeader);
}));

test("stale sessions: a replaced leader session, an expired one and one from an earlier adventure can't change roles", () => fixture(async path => {
  const { leader, ids } = await team(path, 2, true);
  // The host lost their phone: a new host link signs the same member in again; the old session keeps its sign-in, not the lead.
  const newLeader = await redeemInvitation(path, await issueHostInvitation(path, "player-1", NOW), NOW);
  assert.equal(await idOf(path, newLeader), ids[0]);
  await assert.rejects(assign(path, leader, "navigator", ids[1]), notLeader);
  await assign(path, newLeader, "navigator", ids[1]);
  // Seven days on, the session has expired.
  await assert.rejects(sessionAction(path, newLeader, { type: "assign-role", role: "navigator", participantId: null }, key("expired"), NOW + 7 * DAY), signedOut);
  // A new adventure signs everyone out.
  await startNewAdventure(path, NOW);
  await assert.rejects(assign(path, newLeader, "navigator", null), signedOut);
}));

test("concurrent changes: simultaneous leader, guide and player actions apply one at a time, with no lost update", () => fixture(async path => {
  const { leader, players, guide, ids } = await team(path, 5);
  // Both roles at once: each lands.
  await Promise.all([assign(path, leader, "navigator", ids[1]), assign(path, leader, "answerSubmitter", ids[2])]);
  assert.deepEqual(await rolesOf(path, leader), { navigator: ids[1], answerSubmitter: ids[2] });
  // The holder steps down while the leader reassigns and another player tries to claim: every outcome is a whole action.
  const results = await Promise.allSettled([
    sessionAction(path, players[0], { type: "release-role", role: "navigator" }, key("release"), NOW),
    assign(path, leader, "navigator", ids[3]),
    sessionAction(path, players[3], { type: "claim-role", role: "navigator" }, key("claim"), NOW),
    assign(path, guide, "answerSubmitter", ids[4]),
  ]);
  assert.equal(results[1].status, "fulfilled", "the leader's reassignment never fails");
  assert.equal(results[3].status, "fulfilled", "the guide's never fails");
  for (const result of results) if (result.status === "rejected") assert.match(String(result.reason.message), /aren't the navigator|already the navigator/);
  const roles = await rolesOf(path, leader);
  assert.ok([null, ids[3], ids[4]].includes(roles.navigator), "the navigator is someone a successful action named, or free");
  assert.equal(roles.answerSubmitter, ids[4]);
  assert.ok(Object.hasOwn((await stored(path)).participants, roles.navigator ?? ids[0]));
}));
