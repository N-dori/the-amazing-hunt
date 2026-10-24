import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { issueInvitation, redeemInvitation, sessionView, sessionAction } from "./participant-store.ts";
import { parseAction } from "./parse-water-action.ts";
import { GAN_HATUT_MISSION } from "./mission-arrival.ts";
import { schema4Snapshot } from "./legacy-store-fixture.ts";
const WELL = GAN_HATUT_MISSION.id;
// The well's detail; null if the view is for a "choose N" mission.
const cupsOf = (view: Awaited<ReturnType<typeof sessionView>>) => "cups" in view.session ? view.session.cups : null;
async function fixture(run: (path: string, tokens: Record<string, string>, base: number) => Promise<void>) {
  await mkdir(".local", { recursive: true });
  const directory = await mkdtemp(join(process.cwd(), ".local", "shuk-performance-"));
  const path = join(directory, "state.json");
  try {
    const tokens: Record<string, string> = {};
    for (const id of ["player-1", "player-2", "player-3", "guide"]) tokens[id] = await redeemInvitation(path, await issueInvitation(path, id));
    await run(path, tokens, Date.now());
  } finally { await rm(directory, { recursive: true, force: true }); }
}
const snapshot = async (path: string) => JSON.parse(await readFile(path, "utf8"));

test("server clock survives devices and stops on solution; rewards issue only once", () => fixture(async (path, tokens, base) => {
  const act = (id: string, action: Parameters<typeof sessionAction>[2], key: string, offset: number) => sessionAction(path, tokens[id], action, key, base + offset);
  await assert.rejects(act("player-1", { missionId: WELL, type: "move", move: "fill-large" }, "before-start-move-001", 0));
  await assert.rejects(act("player-3", { missionId: WELL, type: "start" }, "follower-start-001", 0));
  await act("player-1", { missionId: WELL, type: "start" }, "authorized-start-001", 0);
  await act("player-2", { missionId: WELL, type: "start" }, "other-device-start-001", 60000);
  assert.equal((await snapshot(path)).missions[WELL].performance.startedAt, base);
  await act("player-1", { missionId: WELL, type: "hint", hint: 1 }, "first-hint-device-001", 60001);
  await act("player-3", { missionId: WELL, type: "hint", hint: 1 }, "repeat-hint-device-001", 60002);
  await act("player-2", { missionId: WELL, type: "hint", hint: 2 }, "second-hint-device-001", 60003);
  const before = await sessionView(path, tokens["player-1"], base + 60004);
  assert.equal(before.performance.hintsUsed, 2);
  assert.equal(before.performance.reward, null);
  assert.equal(before.performance.started, true);
  assert.equal("guideTiming" in before, false);
  assert.doesNotMatch(JSON.stringify(before), /startedAt|solvedAt|elapsedMs|clockStartedAt/);
  await act("player-3", { missionId: WELL, type: "move", move: "fill-large" }, "follower-fill-large-001", 119000);
  await act("player-2", { missionId: WELL, type: "move", move: "pour-large-into-jar" }, "submitter-fill-jar-001", 119999);
  const stopped = await sessionView(path, tokens.guide, base + 700000);
  assert.equal(stopped.guideTiming!.startedAt, base);
  assert.equal(stopped.guideTiming!.solvedAt, base + 119999);
  assert.equal(stopped.guideTiming!.stoppedElapsedMs, 119999);
  await assert.rejects(act("player-1", { missionId: WELL, type: "hint", hint: 3 }, "late-hint-001-test", 700001));
  await assert.rejects(act("player-1", { missionId: WELL, type: "submit" }, "unauthorized-submit-001", 700002));
  await act("player-2", { missionId: WELL, type: "submit" }, "authorized-submit-001", 800000);
  const awarded = (await snapshot(path)).missions[WELL].performance.award;
  assert.deepEqual(awarded, { points: 75, foodTokens: 2, hintsUsed: 2, elapsedMs: 119999, awardedAt: base + 800000 });
  await act("player-2", { missionId: WELL, type: "submit" }, "authorized-submit-001", 900000);
  await act("guide", { missionId: WELL, type: "submit" }, "guide-duplicate-submit-001", 1000000);
  assert.deepEqual((await snapshot(path)).missions[WELL].performance.award, awarded);
  for (const id of ["player-1", "player-2", "player-3"]) {
    const view = await sessionView(path, tokens[id], base + 1000001);
    assert.deepEqual(view.performance.reward, { points: 75, foodTokens: 2, hintsUsed: 2 });
    assert.equal(view.sharedBalance.foodTokens, 2);
    assert.equal(view.sharedBalance.points, 75);
    assert.equal("guideTiming" in view, false);
  }
}));

test("only guide adjusts timing; reset and exclusion preserve puzzle, roles and hints", () => fixture(async (path, tokens, base) => {
  await sessionAction(path, tokens.guide, { missionId: WELL, type: "start" }, "guide-start-001-test", base);
  await sessionAction(path, tokens["player-1"], { missionId: WELL, type: "hint", hint: 1 }, "first-shared-hint-001", base + 1);
  await sessionAction(path, tokens["player-2"], { missionId: WELL, type: "move", move: "fill-large" }, "start-fill-large-001", base + 2);
  for (const id of ["player-1", "player-2", "player-3"]) for (const operation of ["pause", "resume", "reset", "exclude"] as const) {
    await assert.rejects(sessionAction(path, tokens[id], { missionId: WELL, type: "timing", operation }, `deny-${id}-${operation}-001`, base + 10), { status: 403 });
  }
  const before = await sessionView(path, tokens["player-2"], base + 10);
  await sessionAction(path, tokens.guide, { missionId: WELL, type: "timing", operation: "pause" }, "guide-pause-001-test", base + 10000);
  await sessionAction(path, tokens.guide, { missionId: WELL, type: "timing", operation: "resume" }, "guide-resume-001", base + 20000);
  await sessionAction(path, tokens.guide, { missionId: WELL, type: "timing", operation: "reset" }, "guide-reset-clock-001", base + 90000);
  assert.deepEqual((await sessionView(path, tokens["player-2"], base + 90000)).session, before.session);
  assert.equal((await snapshot(path)).missions[WELL].performance.hintsUsed, 1);
  assert.equal((await snapshot(path)).missions[WELL].performance.startedAt, base);
  assert.equal((await snapshot(path)).missions[WELL].performance.clockStartedAt, base + 90000);
  await sessionAction(path, tokens.guide, { missionId: WELL, type: "timing", operation: "exclude" }, "guide-exclude-001", base + 90001);
  await sessionAction(path, tokens["player-2"], { missionId: WELL, type: "move", move: "pour-large-into-jar" }, "long-game-solution-001", base + 999999);
  await sessionAction(path, tokens["player-2"], { missionId: WELL, type: "submit" }, "long-game-submit-001", base + 1000000);
  assert.deepEqual((await sessionView(path, tokens["player-1"], base + 1000001)).performance.reward, { points: 90, foodTokens: 2, hintsUsed: 1 });
  assert.equal((await snapshot(path)).missions[WELL].performance.award.elapsedMs, null);
  assert.equal((await snapshot(path)).missions[WELL].performance.adjustments.length, 4);
  await assert.rejects(sessionAction(path, tokens.guide, { missionId: WELL, type: "timing", operation: "reset" }, "after-award-reset-001", base + 1000002));
}));

test("concurrent repeated hints are counted once per shared group", () => fixture(async (path, tokens, base) => {
  await sessionAction(path, tokens["player-1"], { missionId: WELL, type: "start" }, "shared-start-001", base);
  await assert.rejects(sessionAction(path, tokens["player-2"], { missionId: WELL, type: "hint", hint: 2 }, "skip-hint-001-test", base + 1));
  const attempts = ["player-1", "player-2"].map((id, index) => ({ token: tokens[id], key: `shared-hint-${index}-001` }));
  const results = await Promise.allSettled(attempts.map(item => sessionAction(path, item.token, { missionId: WELL, type: "hint", hint: 1 }, item.key, base + 2)));
  for (const [index, result] of results.entries()) if (result.status === "rejected") {
    assert.equal(result.reason.status, 503);
    await sessionAction(path, attempts[index].token, { missionId: WELL, type: "hint", hint: 1 }, attempts[index].key, base + 3);
  }
  assert.equal((await snapshot(path)).missions[WELL].performance.hintsUsed, 1);
  assert.equal((await sessionView(path, tokens["player-2"], base + 4)).performance.hintsUsed, 1);
}));

test("existing progress migrates without invented timing or retroactive rewards", () => fixture(async (path, tokens, base) => {
  const old = schema4Snapshot(await snapshot(path));
  old.version = 2;
  delete old.performance;
  old.group.cups = { small: 3, large: 0, jar: 2 };
  await writeFile(path, JSON.stringify(old));
  const migrated = await sessionView(path, tokens["player-2"], base);
  assert.deepEqual(cupsOf(migrated), old.group.cups);
  assert.equal(migrated.performance.started, false);
  assert.equal(migrated.performance.reward, null);
  await sessionAction(path, tokens["player-2"], { missionId: WELL, type: "start" }, "migrated-start-001", base);
  assert.equal((await snapshot(path)).missions[WELL].performance.excluded, true);
  const completed = schema4Snapshot(await snapshot(path));
  completed.version = 2;
  delete completed.performance;
  completed.group.completed = true;
  completed.group.cups = { small: 3, large: 0, jar: 4 };
  await writeFile(path, JSON.stringify(completed));
  const legacy = await sessionView(path, tokens["player-2"], base + 1);
  assert.equal(legacy.session.completed, true);
  assert.equal(legacy.performance.reward, null);
  await sessionAction(path, tokens["player-2"], { missionId: WELL, type: "submit" }, "legacy-no-retroaward-001", base + 2);
  assert.equal((await snapshot(path)).missions[WELL].performance.award, null);
}));

test("action validation discards client-provided clock and reward values", () => {
  assert.deepEqual(parseAction({ type: "start", missionId: WELL, startedAt: 1, now: 1, points: 9999 }), { type: "start", missionId: WELL });
  assert.deepEqual(parseAction({ type: "hint", hint: 1, missionId: WELL, hintsUsed: 0 }), { type: "hint", hint: 1, missionId: WELL });
  assert.equal(parseAction({ type: "hint", hint: 4, missionId: WELL }), null);
});
