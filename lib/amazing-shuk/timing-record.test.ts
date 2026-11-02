import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { issueInvitation, redeemInvitation, sessionAction, sessionView } from "./participant-store.ts";
import { CLOCK_AHEAD_TOLERANCE_MS, SYNC_UNCERTAIN_MS, recordAwardTiming, syncTiming } from "./water-performance.ts";
import { MURAL_MISSION_ID } from "./mural-task.ts";
import { MONTEFIORE_MISSION_ID } from "./montefiore-task.ts";
import { storedTeam } from "./legacy-store-fixture.ts";
import { classicRoles } from "./seat-fixture.ts";
import type { GroupAction } from "./group-action.ts";

// Phase 2e: a silent timing record on every award, for analytics only. It never changes points, food tokens or elapsed time.
const NOW = Date.UTC(2026, 10, 2, 12, 0, 0);

test("syncTiming: the delay on the phone, clamped at 0; uncertain past 60 s or with a phone clock ahead", () => {
  assert.deepEqual(syncTiming(undefined, NOW), {});
  assert.deepEqual(syncTiming(Number.NaN, NOW), {});
  assert.deepEqual(syncTiming(NOW - 1_500, NOW), { queuedMs: 1_500 });
  assert.deepEqual(syncTiming(NOW - SYNC_UNCERTAIN_MS, NOW), { queuedMs: SYNC_UNCERTAIN_MS });
  assert.deepEqual(syncTiming(NOW - SYNC_UNCERTAIN_MS - 1, NOW), { queuedMs: SYNC_UNCERTAIN_MS + 1, uncertain: true });
  // A clock slightly ahead is noise; far ahead is implausible.
  assert.deepEqual(syncTiming(NOW + 2_000, NOW), { queuedMs: 0 });
  assert.deepEqual(syncTiming(NOW + CLOCK_AHEAD_TOLERANCE_MS + 1, NOW), { queuedMs: 0, uncertain: true });
});

test("recordAwardTiming keeps the reward and an earlier outcome and end; a solve is named", () => {
  const solve = { points: 85, foodTokens: 2, hintsUsed: 1, awardedAt: NOW, elapsedMs: 90_000 };
  assert.deepEqual(recordAwardTiming(solve, NOW, NOW - 300), { ...solve, outcome: "solved", endedAt: NOW, queuedMs: 300 });
  const revealed = { ...solve, points: 0, outcome: "revealed" as const, endedAt: NOW - 5 };
  assert.deepEqual(recordAwardTiming(revealed, NOW), { ...revealed });
});

let counter = 0;
const key = (name: string) => `${name}-timing-${String(++counter).padStart(8, "0")}`;
const act = (path: string, token: string, action: GroupAction, offset = 0, queuedAt?: number) =>
  sessionAction(path, token, action, key("act"), NOW + offset, undefined, undefined, undefined, undefined, queuedAt);
async function team(run: (path: string, tokens: Record<string, string>) => Promise<void>) {
  await mkdir(".local", { recursive: true });
  const folder = await mkdtemp(join(process.cwd(), ".local", "shuk-timing-"));
  try {
    const path = join(folder, "state.json");
    const tokens: Record<string, string> = {};
    for (const seat of ["player-1", "player-2", "player-3", "guide"]) tokens[seat] = await redeemInvitation(path, await issueInvitation(path, seat, NOW), NOW);
    await classicRoles(path, tokens, NOW);
    await run(path, tokens);
  } finally { await rm(folder, { recursive: true, force: true }); }
}
const stored = async (path: string, missionId: string) => storedTeam(JSON.parse(await readFile(path, "utf8"))).missions[missionId].performance.award;

test("the awarding action records outcome, end and its queue delay; points and the view are unchanged", () => team(async (path, tokens) => {
  await act(path, tokens["player-1"], { type: "start", missionId: MURAL_MISSION_ID });
  for (const optionId of ["air-vents", "plaque"]) await act(path, tokens["player-3"], { type: "toggle-choice", optionId, missionId: MURAL_MISSION_ID }, 1);
  // Submitted offline 90 s before it synced: recorded as uncertain, still the full award.
  await act(path, tokens["player-2"], { type: "submit", missionId: MURAL_MISSION_ID }, 120_000, NOW + 30_000);
  const award = await stored(path, MURAL_MISSION_ID);
  assert.equal(award.outcome, "solved"); assert.equal(award.endedAt, NOW + 120_000); assert.equal(award.awardedAt, NOW + 120_000);
  assert.equal(award.queuedMs, 90_000); assert.equal(award.uncertain, true);
  assert.equal(award.points, 100); assert.equal(award.elapsedMs, 120_000);
  // A later action never rewrites the record.
  await act(path, tokens["player-2"], { type: "submit", missionId: MURAL_MISSION_ID }, 130_000, NOW + 130_000);
  assert.deepEqual(await stored(path, MURAL_MISSION_ID), award);
  // Analytics only: the players' view shows none of it.
  const shown = JSON.stringify(await sessionView(path, tokens["player-3"], NOW + 140_000, MURAL_MISSION_ID));
  assert.doesNotMatch(shown, /queuedMs|uncertain|endedAt|outcome/);
}));

test("a reveal records its delay too; an older phone that sends no queue time records none", () => team(async (path, tokens) => {
  await act(path, tokens["player-1"], { type: "start", missionId: MONTEFIORE_MISSION_ID });
  await act(path, tokens["player-2"], { type: "reveal", missionId: MONTEFIORE_MISSION_ID }, 10_000, NOW + 9_000);
  const revealed = await stored(path, MONTEFIORE_MISSION_ID);
  assert.equal(revealed.outcome, "revealed"); assert.equal(revealed.endedAt, NOW + 10_000);
  assert.equal(revealed.queuedMs, 1_000); assert.equal(revealed.uncertain, undefined); assert.equal(revealed.points, 0);
  await act(path, tokens["player-1"], { type: "start", missionId: MURAL_MISSION_ID });
  for (const optionId of ["air-vents", "plaque"]) await act(path, tokens["player-3"], { type: "toggle-choice", optionId, missionId: MURAL_MISSION_ID }, 1);
  await act(path, tokens["player-2"], { type: "submit", missionId: MURAL_MISSION_ID }, 20_000);
  const old = await stored(path, MURAL_MISSION_ID);
  assert.equal(old.outcome, "solved"); assert.equal(old.endedAt, NOW + 20_000);
  assert.ok(!("queuedMs" in old)); assert.ok(!("uncertain" in old));
}));
