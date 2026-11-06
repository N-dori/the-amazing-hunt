import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { CREATE_TEAMS_FIRST, issueHostInvitation, issueInvitation, issueLeaderInvitation, redeemInvitation, sessionAction, sessionView, startNewAdventure,
  TEAM_HAS_PLAYERS } from "./participant-store.ts";
import { GAN_HATUT_MISSION } from "./mission-arrival.ts";

// I7a, multi-team play: the host accepts the recommended teams, shares one leader invitation per team, each leader names their team and
// gives the roles, and the host starts once every team is ready. Points stay with each team; food tokens are pooled.
const NOW = Date.UTC(2026, 10, 6, 12, 0, 0);
const WELL = GAN_HATUT_MISSION.id;
let counter = 0;
const key = (name: string) => `${name}-${String(++counter).padStart(10, "0")}`;
const act = (path: string, token: string, action: Parameters<typeof sessionAction>[2]) => sessionAction(path, token, action, key("multi-team"), NOW);
async function fixture(run: (path: string) => Promise<void>) {
  await mkdir(".local", { recursive: true });
  const directory = await mkdtemp(join(process.cwd(), ".local", "shuk-multi-team-"));
  try { await run(join(directory, "state.json")); } finally { await rm(directory, { recursive: true, force: true }); }
}
const stored = async (path: string) => JSON.parse(await readFile(path, "utf8"));
const idOf = async (path: string, token: string) => (await sessionView(path, token, NOW)).session.activeActorId;

async function lobby(path: string) {
  await startNewAdventure(path, NOW);
  const host = await redeemInvitation(path, await issueHostInvitation(path, "player-1", NOW), NOW);
  const guide = await redeemInvitation(path, await issueInvitation(path, "guide", NOW), NOW);
  return { host, guide };
}
/** Teams of `count` created, each of B… with a leader signed in from the host's invitation. */
async function teams(path: string, count: number) {
  const { host, guide } = await lobby(path);
  await act(path, host, { type: "set-intended-count", count });
  await act(path, host, { type: "set-teams" });
  const ids = Object.keys((await stored(path)).teams);
  const leaders: Record<string, string> = {};
  for (const id of ids.slice(1)) leaders[id] = await redeemInvitation(path, await issueLeaderInvitation(path, host, id, NOW), NOW);
  return { host, guide, ids, leaders };
}

test("the host accepts the recommended teams: 11 players make A, B and C, each with its own avatar; a smaller count drops empty teams", () => fixture(async path => {
  const { host } = await lobby(path);
  await act(path, host, { type: "set-intended-count", count: 11 });
  await assert.rejects(act(path, host, { type: "start-adventure" }), (error: Error) => error.message === CREATE_TEAMS_FIRST);
  await act(path, host, { type: "set-teams" });
  const file = await stored(path);
  assert.deepEqual(Object.keys(file.teams), ["A", "B", "C"]);
  const avatars = ["B", "C"].map(id => file.teams[id].avatarId);
  assert.equal(new Set(avatars).size, 2);
  await act(path, host, { type: "set-intended-count", count: 30 });
  await act(path, host, { type: "set-teams" });
  assert.equal(Object.keys((await stored(path)).teams).length, 6);
  await act(path, host, { type: "set-intended-count", count: 4 });
  await act(path, host, { type: "set-teams" });
  assert.deepEqual(Object.keys((await stored(path)).teams), ["A"]);
}));

test("leader invitations: host or guide only, lobby only, never team A; one use; a new one replaces the old; the redeemer leads", () => fixture(async path => {
  const { host, guide, leaders } = await teams(path, 8);
  const player = await redeemInvitation(path, await issueInvitation(path, "player-2", NOW), NOW);
  await assert.rejects(issueLeaderInvitation(path, player, "B", NOW), /Only the host or the guide/);
  await assert.rejects(issueLeaderInvitation(path, host, "A", NOW), /no such team/);
  await assert.rejects(issueLeaderInvitation(path, host, "Z", NOW), /no such team/);
  const leaderB = leaders.B;
  const view = await sessionView(path, leaderB, NOW);
  assert.equal(view.team.id, "B"); assert.equal(view.adventure.leader, true); assert.equal(view.adventure.canManage, false);
  assert.equal("teams" in view, false, "a team leader gets no overview of the other teams");
  // A new invitation from the guide replaces the leader: the old session keeps its sign-in but loses the leadership.
  const replacement = await issueLeaderInvitation(path, guide, "B", NOW);
  const old = await issueLeaderInvitation(path, guide, "B", NOW);
  await assert.rejects(redeemInvitation(path, replacement, NOW), { status: 401 });
  const newLeader = await redeemInvitation(path, old, NOW);
  await assert.rejects(redeemInvitation(path, old, NOW), { status: 401 });
  assert.equal((await sessionView(path, newLeader, NOW)).adventure.leader, true);
  assert.equal((await sessionView(path, leaderB, NOW)).adventure.leader, false);
}));

test("names: unique in the adventure; only the team's leader before Start; the host overview shows each team's state, no answers", () => fixture(async path => {
  const { host, leaders } = await teams(path, 8);
  assert.match(await act(path, leaders.B, { type: "name-team", name: "Falafel  Fugitives" }), /You're Falafel Fugitives!/);
  await assert.rejects(act(path, host, { type: "name-team", name: "falafel fugitives" }), /That name's taken/);
  await assert.rejects(act(path, host, { type: "name-team", name: "Halva Main Characters" }), /Keep it under 20/);
  await act(path, host, { type: "name-team", name: "Sabich Side Quest" });
  // Renaming frees the old name for others at once.
  await act(path, leaders.B, { type: "name-team", name: "Pickle Plot Twist" });
  await act(path, host, { type: "name-team", name: "Falafel Fugitives" });
  const overview = (await sessionView(path, host, NOW)).teams!;
  assert.deepEqual(overview.map(team => [team.id, team.name, team.leader, team.members, team.ready]),
    [["A", "Falafel Fugitives", "accepted", 1, true], ["B", "Pickle Plot Twist", "accepted", 1, true]]);
  assert.doesNotMatch(JSON.stringify(overview), /selected|cups|award|hint/);
}));

test("Start waits for every team: a leader, a name, players and their roles; then points stay per team and food tokens are pooled", () => fixture(async path => {
  const { host, guide, leaders } = await teams(path, 7);
  await act(path, host, { type: "name-team", name: "Falafel Fugitives" });
  await assert.rejects(act(path, host, { type: "start-adventure" }), /Team B isn't ready yet/);
  await act(path, leaders.B, { type: "name-team", name: "Olive Squad Goals" });
  assert.match(await act(path, host, { type: "start-adventure" }), /started/);
  await assert.rejects(act(path, leaders.B, { type: "name-team", name: "Baklava No Cap" }), /Ask your guide/);
  // Team B solves the well alone: its points are B's, its food tokens everyone's.
  await act(path, leaders.B, { missionId: WELL, type: "start" });
  for (const move of ["fill-large", "pour-large-into-small", "pour-large-into-jar", "empty-small", "fill-large", "pour-large-into-small", "pour-large-into-jar"] as const) {
    await act(path, leaders.B, { missionId: WELL, type: "move", move });
  }
  await act(path, leaders.B, { missionId: WELL, type: "submit" });
  const b = (await sessionView(path, leaders.B, NOW)).sharedBalance;
  const a = (await sessionView(path, host, NOW)).sharedBalance;
  assert.ok(b.points > 0 && b.foodTokens > 0);
  assert.equal(a.points, 0); assert.equal(a.foodTokens, b.foodTokens);
  // Cross-team: team A's view of the well is untouched.
  assert.equal((await sessionView(path, host, NOW)).session.completed, false);
  void guide;
}));

test("a team with players can't be dropped by a smaller count", () => fixture(async path => {
  const { host } = await teams(path, 8);
  await act(path, host, { type: "set-intended-count", count: 3 });
  await assert.rejects(act(path, host, { type: "set-teams" }), (error: Error) => error.message === TEAM_HAS_PLAYERS);
  void idOf;
}));
