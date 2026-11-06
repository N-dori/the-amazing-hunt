import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { issueHostInvitation, issueInvitation, redeemInvitation, sessionAction, sessionView, startNewAdventure } from "./participant-store.ts";
import { parseAction } from "./parse-water-action.ts";
import { finaleLocked, GAN_HATUT_MISSION } from "./mission-arrival.ts";
import { SHUK_MISSIONS } from "./missions.ts";
import { MURAL_MISSION_ID } from "./mural-task.ts";
import { MONTEFIORE_MISSION_ID } from "./montefiore-task.ts";
import { MARZIPAN_MISSION } from "./marzipan-task.ts";
import { storedTeam } from "./legacy-store-fixture.ts";
import { classicRoles } from "./seat-fixture.ts";
import type { GroupAction } from "./group-action.ts";

// Phase 2b, "I'm completely stuck" (owner, 2 Nov 2026): every core challenge except Marzipan; 0 challenge points, the core's food
// tokens (D3); pressed by the Submitter, anyone while that seat is empty, or the guide (D5); recorded exactly once.
const MURAL = MURAL_MISSION_ID, WELL = GAN_HATUT_MISSION.id, MONTEFIORE = MONTEFIORE_MISSION_ID, MARZIPAN = MARZIPAN_MISSION.id;
const NOW = Date.UTC(2026, 10, 2, 12, 0, 0);
let counter = 0;
const key = (name: string) => `${name}-reveal-${String(++counter).padStart(8, "0")}`;
const act = (path: string, token: string, action: GroupAction, actionId = key("act"), offset = 0) => sessionAction(path, token, action, actionId, NOW + offset);
const view = (path: string, token: string, missionId: string, offset = 0) => sessionView(path, token, NOW + offset, missionId);
const reveal = (missionId: string) => ({ type: "reveal", missionId }) as GroupAction;

async function directory(run: (path: string) => Promise<void>) {
  await mkdir(".local", { recursive: true });
  const folder = await mkdtemp(join(process.cwd(), ".local", "shuk-reveal-"));
  try { await run(join(folder, "state.json")); } finally { await rm(folder, { recursive: true, force: true }); }
}
/** player-1 navigates, player-2 submits, player-3 advises; plus the guide. */
const team = (run: (path: string, tokens: Record<string, string>, ids: Record<string, string>) => Promise<void>) => directory(async path => {
  const tokens: Record<string, string> = {};
  for (const seat of ["player-1", "player-2", "player-3", "guide"]) tokens[seat] = await redeemInvitation(path, await issueInvitation(path, seat, NOW), NOW);
  await run(path, tokens, await classicRoles(path, tokens, NOW));
});

test("the Submitter reveals once: 0 points, the core's food tokens, hints kept; replays and later submits change nothing", () => team(async (path, tokens) => {
  await assert.rejects(act(path, tokens["player-2"], reveal(MURAL)), /Start the challenge/);
  await act(path, tokens["player-1"], { type: "start", missionId: MURAL });
  assert.equal((await view(path, tokens["player-2"], MURAL)).performance.canReveal, true);
  assert.equal((await view(path, tokens["player-3"], MURAL)).performance.canReveal, false);
  await assert.rejects(act(path, tokens["player-3"], reveal(MURAL)), /answer-submitter or guide/);
  await assert.rejects(act(path, tokens["player-1"], reveal(MURAL)), /answer-submitter or guide/);
  await act(path, tokens["player-3"], { type: "hint", hint: 1, missionId: MURAL });
  const id = key("submitter-reveal");
  assert.match(await act(path, tokens["player-2"], reveal(MURAL), id, 1), /Here's the answer/);
  // Two phones and a replayed queue: the same action ID is a receipt, a new one finds the award.
  assert.equal(await act(path, tokens["player-2"], reveal(MURAL), id, 2), "Action already synced.");
  assert.match(await act(path, tokens.guide, reveal(MURAL), key("guide-late"), 3), /already complete/);
  await assert.rejects(act(path, tokens["player-2"], { type: "toggle-choice", optionId: "plaque", missionId: MURAL }), /already complete/);
  await act(path, tokens["player-2"], { type: "submit", missionId: MURAL }, key("late-submit"), 4);
  const shown = await view(path, tokens["player-3"], MURAL, 5);
  assert.equal(shown.session.completed, true); assert.equal(shown.mission.state, "completed");
  assert.deepEqual(shown.performance.reward, { points: 0, foodTokens: 2, hintsUsed: 1 });
  assert.equal(shown.performance.revealed, true); assert.equal(shown.performance.canReveal, false);
  // The award's own time travels in the view, so each phone can tell a new award from an old one (Phase 2d).
  assert.equal(shown.performance.awardedAt, NOW + 1);
  assert.deepEqual(shown.sharedBalance, { points: 0, foodTokens: 2, status: "Provisional local-development rewards" });
  const award = storedTeam(JSON.parse(await readFile(path, "utf8"))).missions[MURAL].performance.award;
  assert.equal(award.outcome, "revealed"); assert.equal(award.endedAt, NOW + 1); assert.equal(award.awardedAt, NOW + 1);
}));

test("a solve that lands first wins: a later reveal is a no-op and the points stay", () => team(async (path, tokens) => {
  await act(path, tokens["player-1"], { type: "start", missionId: MURAL });
  for (const optionId of ["air-vents", "plaque"]) await act(path, tokens["player-2"], { type: "toggle-choice", optionId, missionId: MURAL });
  await act(path, tokens["player-2"], { type: "submit", missionId: MURAL }, key("solve-first"), 1);
  assert.match(await act(path, tokens["player-2"], reveal(MURAL), key("reveal-second"), 2), /already complete/);
  const shown = await view(path, tokens["player-1"], MURAL, 3);
  assert.deepEqual(shown.performance.reward, { points: 100, foodTokens: 2, hintsUsed: 0 });
  assert.equal(shown.performance.revealed, false);
}));

test("while the Submitter seat is empty anyone may reveal, the well included; submitting keeps its own rule", () => team(async (path, tokens) => {
  await act(path, tokens["player-1"], { type: "start", missionId: WELL });
  await act(path, tokens.guide, { type: "assign-role", role: "answerSubmitter", participantId: null });
  assert.equal((await view(path, tokens["player-3"], WELL)).performance.canReveal, true);
  await assert.rejects(act(path, tokens["player-3"], { type: "submit", missionId: WELL }), /Only the answer-submitter may submit/);
  await act(path, tokens["player-3"], reveal(WELL), key("empty-seat"), 1);
  const shown = await view(path, tokens["player-1"], WELL, 2);
  assert.equal(shown.session.completed, true);
  assert.deepEqual(shown.performance.reward, { points: 0, foodTokens: GAN_HATUT_MISSION.rewards.foodTokens, hintsUsed: 0 });
  assert.equal(shown.performance.revealed, true);
}));

test("a solo player can reveal without claiming a role or calling a guide", () => directory(async path => {
  await startNewAdventure(path, NOW);
  const player = await redeemInvitation(path, await issueHostInvitation(path, "player-1", NOW), NOW);
  await act(path, player, { type: "set-intended-count", count: 1 });
  await act(path, player, { type: "start-adventure" });
  await act(path, player, { type: "start", missionId: MONTEFIORE });
  assert.equal((await view(path, player, MONTEFIORE)).performance.canReveal, true);
  await act(path, player, reveal(MONTEFIORE), key("solo"), 1);
  const shown = await view(path, player, MONTEFIORE, 2);
  assert.equal(shown.session.completed, true); assert.equal(shown.performance.reward?.points, 0);
}));

test("Marzipan has no reveal in Phase 2", () => team(async (path, tokens) => {
  await act(path, tokens["player-1"], { type: "start", missionId: MARZIPAN });
  assert.equal((await view(path, tokens["player-2"], MARZIPAN)).performance.canReveal, false);
  await assert.rejects(act(path, tokens.guide, reveal(MARZIPAN)), /no answer to show/);
  assert.equal((await view(path, tokens["player-2"], MARZIPAN)).session.completed, false);
}));

test("revealing the other five unlocks the finale; reveals add only food tokens to the balance", () => team(async (path, tokens) => {
  const others = SHUK_MISSIONS.filter(mission => !mission.finale);
  assert.equal(others.length, 5);
  for (const mission of others) {
    await act(path, tokens.guide, { type: "start", missionId: mission.id });
    await act(path, tokens.guide, reveal(mission.id));
  }
  const shown = await view(path, tokens["player-1"], MARZIPAN, 1);
  assert.equal(finaleLocked(MARZIPAN_MISSION, shown.missions), false);
  assert.deepEqual(shown.sharedBalance, { points: 0, foodTokens: others.reduce((sum, mission) => sum + mission.rewards.foodTokens, 0),
    status: "Provisional local-development rewards" });
}));

test("browsers may send reveal for a mission, never for the bonus", () => {
  assert.deepEqual(parseAction({ type: "reveal", missionId: MURAL }), { type: "reveal", missionId: MURAL });
  assert.equal(parseAction({ type: "reveal" }), null);
  assert.equal(parseAction({ type: "reveal", missionId: MURAL, part: "bonus" }), null);
});
