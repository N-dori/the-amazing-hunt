import test from "node:test";
import assert from "node:assert/strict";
import { buildHintSheetView, choiceAnswer, WATER_INTENDED_SOLUTION, waterAnswer } from "./challenge-help.ts";
import { applyWaterMove, EMPTY_WATER_CUPS, isWaterPuzzleSolved, type WaterCups } from "./water-measurement.ts";
import { MURAL_CHALLENGE, MURAL_REWARDS, MURAL_TASK } from "./mural-task.ts";
import { MARZIPAN_REWARDS, MARZIPAN_TASK } from "./marzipan-task.ts";
import { WELL_REWARDS } from "./water-performance.ts";

const base = { started: true, completed: false, canReveal: true, rewards: MURAL_REWARDS };

test("the mural's sheet: two hints, each priced as a lower potential (100 → 85 → 60), then the stuck offer", () => {
  const none = buildHintSheetView({ ...base, hints: MURAL_TASK.hints, stepUsed: 0, totalUsed: 0 });
  assert.equal(none.available, true); assert.equal(none.remaining, 2); assert.equal(none.total, 2);
  assert.deepEqual(none.revealed, []); assert.deepEqual(none.next, { number: 1, fromPoints: 100, toPoints: 85 }); assert.equal(none.offerStuck, false); assert.equal(none.offerAnswer, true);
  const one = buildHintSheetView({ ...base, hints: MURAL_TASK.hints, stepUsed: 1, totalUsed: 1 });
  assert.deepEqual(one.revealed, MURAL_TASK.hints.slice(0, 1)); assert.deepEqual(one.next, { number: 2, fromPoints: 85, toPoints: 60 });
  const all = buildHintSheetView({ ...base, hints: MURAL_TASK.hints, stepUsed: 2, totalUsed: 2 });
  assert.equal(all.remaining, 0); assert.equal(all.next, null); assert.equal(all.offerStuck, true);
  // A phone that may not reveal never sees the offer.
  assert.equal(buildHintSheetView({ ...base, canReveal: false, hints: MURAL_TASK.hints, stepUsed: 2, totalUsed: 2 }).offerStuck, false);
});

test("no help before Start, after completion, or on a challenge with no hints", () => {
  for (const state of [{ started: false, completed: false }, { started: true, completed: true }]) {
    const shown = buildHintSheetView({ ...base, ...state, hints: MURAL_TASK.hints, stepUsed: 0, totalUsed: 0 });
    assert.equal(shown.available, false); assert.equal(shown.next, null); assert.equal(shown.offerStuck, false);
  }
  const levin = buildHintSheetView({ ...base, hints: [], stepUsed: 0, totalUsed: 0 });
  assert.equal(levin.available, false); assert.equal(levin.offerStuck, true);
});

test("follow-up questions number their hints from 1 but price them on the mission's shared total", () => {
  const second = MARZIPAN_TASK.followUps[0].hints;
  const shown = buildHintSheetView({ ...base, rewards: MARZIPAN_REWARDS, hints: second, stepUsed: 0, totalUsed: 2 });
  assert.equal(shown.next?.number, 1);
  assert.equal(shown.next?.fromPoints, 100 - MARZIPAN_REWARDS.hintPenalties[0] - MARZIPAN_REWARDS.hintPenalties[1]);
});

test("a stop still on the old scoring prices hints from its maximum, and says when a hint costs nothing more", () => {
  const hints = [{ title: "a", text: "a" }, { title: "b", text: "b" }];
  const floor = { ...WELL_REWARDS, maxPoints: 50, minimumPoints: 50 };
  assert.deepEqual(buildHintSheetView({ ...base, rewards: floor, hints, stepUsed: 0, totalUsed: 0 }).next, { number: 1, fromPoints: 50, toPoints: 50 });
});

test("the mural's revealed answer is every real item; the well's is the intended 4 L measurement", () => {
  assert.deepEqual(choiceAnswer(MURAL_CHALLENGE), MURAL_CHALLENGE.options.filter(option => option.correct).map(option => option.label));
  const end = WATER_INTENDED_SOLUTION.reduce<WaterCups | null>((cups, move) => cups && applyWaterMove(cups, move), EMPTY_WATER_CUPS);
  assert.ok(end && isWaterPuzzleSolved(end));
  // It measures 4 L first: the jar receives exactly one pour, of 4 L.
  assert.equal(WATER_INTENDED_SOLUTION.filter(move => move.endsWith("into-jar")).length, 1);
  assert.equal(waterAnswer().length, WATER_INTENDED_SOLUTION.length);
  assert.ok(waterAnswer().every(step => step.endsWith(".")));
});
