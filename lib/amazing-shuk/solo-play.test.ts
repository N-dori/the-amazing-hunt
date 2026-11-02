import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { askToJoin, createJoinLink, exchangeJoin, issueHostInvitation, issueInvitation, redeemInvitation, sessionAction, sessionView, startNewAdventure } from "./participant-store.ts";
import { choiceStep, GAN_HATUT_MISSION, finaleLocked } from "./mission-arrival.ts";
import { SHUK_MISSIONS } from "./missions.ts";
import type { GroupAction } from "./group-action.ts";

// Phase 1, solo-first play (owner, 2 Nov 2026): a team of exactly one holds both roles (D12) and can confirm its own arrival with
// "We're here" (D6). Every other team keeps the multiplayer rules unchanged.
const WELL = GAN_HATUT_MISSION.id;
const NOW = Date.UTC(2026, 10, 2, 12, 0, 0);
const WELL_SOLUTION = ["fill-large", "pour-large-into-small", "empty-small", "pour-large-into-small", "fill-large", "pour-large-into-small", "pour-large-into-jar"] as const;
const refused = (pattern: RegExp) => (error: Error & { status?: number }) => error.status === 403 && pattern.test(error.message);
let counter = 0;
const key = (name: string) => `${name}-solo-${String(++counter).padStart(8, "0")}`;
const act = (path: string, token: string, action: GroupAction, actionId = key("act")) => sessionAction(path, token, action, actionId, NOW);
const view = (path: string, token: string, missionId: string = WELL) => sessionView(path, token, NOW, missionId);
async function fixture(run: (path: string) => Promise<void>) {
  await mkdir(".local", { recursive: true });
  const directory = await mkdtemp(join(process.cwd(), ".local", "shuk-solo-"));
  try { await run(join(directory, "state.json")); } finally { await rm(directory, { recursive: true, force: true }); }
}
const signIn = async (path: string, seat: string) => redeemInvitation(path, await issueInvitation(path, seat, NOW), NOW);
/** A host alone in the lobby, then started with a count of 1, plus the guide (never a team member). */
async function solo(path: string, start = true) {
  await startNewAdventure(path, NOW);
  const player = await redeemInvitation(path, await issueHostInvitation(path, "player-1", NOW), NOW);
  const guide = await signIn(path, "guide");
  if (start) {
    await act(path, player, { type: "set-intended-count", count: 1 });
    await act(path, player, { type: "start-adventure" });
  }
  return { player, guide, id: (await view(path, player)).session.activeActorId };
}
/** A second member who asks with the leader's join link; `collect` exchanges the approval for a session. */
async function secondMember(path: string, leader: string, collect: boolean) {
  const asked = await askToJoin(path, await createJoinLink(path, leader, false, NOW), null, "", NOW);
  const request = (await view(path, leader)).membership!.requests.find(item => item.code === asked.code)!;
  await act(path, leader, { type: "let-in", requestId: request.id });
  return collect ? exchangeJoin(path, asked.secret!, NOW) : null;
}

test("a solo player holds both roles without claiming any; the stored roles stay empty", () => fixture(async path => {
  const { player, id } = await solo(path);
  const shown = await view(path, player);
  assert.equal(shown.solo, true);
  assert.deepEqual(shown.session.roles, { navigator: id, answerSubmitter: id });
  assert.equal(shown.performance.canStart, true);
  const file = JSON.parse(await readFile(path, "utf8"));
  assert.deepEqual(file.teams.A.roles, { navigator: null, answerSubmitter: null }, "nothing is written to the stored roles");
  // The guide reads the same team but is never counted: it stays a team of one.
  assert.equal((await view(path, (await solo(path, false)).guide)).solo, true);
}));

test("a solo player finishes every mission with correct answers, using \"We're here\", with no guide or role claiming", () => fixture(async path => {
  const { player } = await solo(path);
  for (const mission of SHUK_MISSIONS) {
    const missionId = mission.id;
    assert.match(await act(path, player, { type: "self-arrival", missionId }), /You've made it!/);
    await act(path, player, { type: "start", missionId });
    if (mission.challenge.kind === "water") {
      for (const move of WELL_SOLUTION) await act(path, player, { type: "move", move, missionId });
      assert.match(await act(path, player, { type: "submit", missionId }), /Challenge complete|correct/);
    } else {
      for (let step = 0; choiceStep(mission, step); step++) {
        const { challenge } = choiceStep(mission, step)!;
        for (const option of challenge.options.filter(item => item.correct === true).slice(0, challenge.required)) {
          await act(path, player, { type: "toggle-choice", optionId: option.id, missionId });
        }
        await act(path, player, { type: "submit", missionId });
      }
    }
    const after = await view(path, player, missionId);
    assert.equal(after.session.completed, true, `${missionId} completes`);
    assert.equal(after.mission.arrivalMethod, "self");
    assert.equal(after.mission.arrivalPoints, mission.arrival.rewardPoints);
  }
  const final = await view(path, player);
  assert.ok(final.missions.every(mission => mission.state === "completed"));
  const finale = SHUK_MISSIONS.find(mission => mission.finale)!;
  assert.equal(finaleLocked(finale, final.missions), false);
  // One arrival and one award per mission, nothing counted twice.
  const expected = SHUK_MISSIONS.reduce((sum, mission) => sum + mission.arrival.rewardPoints, 0);
  assert.ok(final.sharedBalance.points >= expected);
  assert.equal(final.sharedBalance.foodTokens, SHUK_MISSIONS.reduce((sum, mission) => sum + mission.rewards.foodTokens, 0));
}));

test("\"We're here\" is recorded once: replays, second taps, GPS and guide arrivals never add a second award", () => fixture(async path => {
  const { player, guide } = await solo(path);
  const id = key("self");
  assert.equal(await act(path, player, { type: "self-arrival", missionId: WELL }, id), "You've made it!");
  assert.equal(await act(path, player, { type: "self-arrival", missionId: WELL }, id), "Action already synced.");
  assert.equal(await act(path, player, { type: "self-arrival", missionId: WELL }), "Arrival already recorded.");
  await act(path, guide, { type: "confirm-arrival", missionId: WELL });
  const shown = await view(path, player);
  assert.equal(shown.mission.arrivalMethod, "self");
  assert.equal(shown.sharedBalance.points, GAN_HATUT_MISSION.arrival.rewardPoints);
  // The other way round: after the guide's confirmation, "We're here" adds nothing.
  const mural = SHUK_MISSIONS[0].id;
  await act(path, guide, { type: "confirm-arrival", missionId: mural });
  assert.equal(await act(path, player, { type: "self-arrival", missionId: mural }), "Arrival already recorded.");
  assert.equal((await view(path, player, mural)).mission.arrivalMethod, "guide");
  // Gan HaTut's GPS point is unverified, yet "We're here" works there (it reads no location).
  assert.equal(GAN_HATUT_MISSION.arrival.destination?.verified, false);
}));

test("\"We're here\" is refused in the lobby and for followers in a larger team; the guide may use it", () => fixture(async path => {
  const lobby = await solo(path, false);
  await assert.rejects(act(path, lobby.player, { type: "self-arrival", missionId: WELL }), refused(/hasn't started/));
  await act(path, lobby.player, { type: "set-intended-count", count: 2 });
  await act(path, lobby.player, { type: "start-adventure" });
  const second = (await secondMember(path, lobby.player, true))!;
  // Two members: the stored roles apply again, and nobody holds Navigator yet.
  await assert.rejects(act(path, second, { type: "self-arrival", missionId: WELL }), refused(/Only the navigator or guide/));
  await assert.rejects(act(path, lobby.player, { type: "self-arrival", missionId: WELL }), refused(/Only the navigator or guide/));
  assert.match(await act(path, lobby.guide, { type: "self-arrival", missionId: WELL }), /made it/);
}));

test("solo status follows real membership: requests don't count, a collected session ends it, removal restores it", () => fixture(async path => {
  const { player, id } = await solo(path);
  await secondMember(path, player, false);
  assert.equal((await view(path, player)).solo, true, "a let-in request that hasn't been collected isn't a member");
  await act(path, player, { type: "start", missionId: WELL });
  const fresh = await solo(path);
  const second = (await secondMember(path, fresh.player, true))!;
  const pair = await view(path, fresh.player);
  assert.equal(pair.solo, false);
  assert.deepEqual(pair.session.roles, { navigator: null, answerSubmitter: null });
  await assert.rejects(act(path, fresh.player, { type: "submit", missionId: WELL }), refused(/Only the answer-submitter/));
  await assert.rejects(act(path, second, { type: "start", missionId: WELL }), refused(/Only the navigator, answer-submitter or guide/));
  const secondId = (await view(path, second)).session.activeActorId;
  await act(path, fresh.player, { type: "remove-member", participantId: secondId });
  assert.equal((await view(path, fresh.player)).solo, true);
  assert.notEqual(id, secondId);
}));

test("a solo player gains no guide-only power", () => fixture(async path => {
  const { player } = await solo(path);
  await act(path, player, { type: "start", missionId: WELL });
  await assert.rejects(act(path, player, { type: "timing", operation: "pause", missionId: WELL }), refused(/Only the guide/));
  await assert.rejects(act(path, player, { type: "guide-approve", missionId: WELL }), refused(/guide/));
  await assert.rejects(act(path, player, { type: "confirm-arrival", missionId: WELL }), refused(/Only the guide/));
}));

test("a solo player uses every well control: move, reset and submit", () => fixture(async path => {
  const { player } = await solo(path);
  await act(path, player, { type: "start", missionId: WELL });
  await act(path, player, { type: "move", move: "fill-large", missionId: WELL });
  assert.match(await act(path, player, { type: "reset", missionId: WELL }), /reset/i);
  for (const move of WELL_SOLUTION) await act(path, player, { type: "move", move, missionId: WELL });
  await act(path, player, { type: "submit", missionId: WELL });
  assert.equal((await view(path, player)).session.completed, true);
}));

test("stored arrivals: \"self\" loads, an unknown method is refused", () => fixture(async path => {
  const { player } = await solo(path);
  await act(path, player, { type: "self-arrival", missionId: WELL });
  assert.equal((await view(path, player)).mission.arrivalMethod, "self");
  const file = JSON.parse(await readFile(path, "utf8"));
  file.teams.A.missions[WELL].arrival.method = "teleport";
  await writeFile(path, JSON.stringify(file));
  await assert.rejects(view(path, player), /Unsupported|Storage|unavailable/i);
}));
