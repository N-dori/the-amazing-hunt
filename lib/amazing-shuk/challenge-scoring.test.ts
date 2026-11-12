import test from "node:test";
import assert from "node:assert/strict";
import { budgetRewards, hintBudget, hintLadder, withinOptionalCap } from "./challenge-scoring.ts";
import { calculateWaterReward } from "./water-performance.ts";
import { MURAL_MISSION, MURAL_REWARDS, MURAL_SCORING, MURAL_TASK } from "./mural-task.ts";
import { SHUK_MISSIONS } from "./missions.ts";
import type { MissionDefinition } from "./mission-arrival.ts";

test("the ladder spends exactly the budget, never falls, and keeps the floor, for any hint count", () => {
  for (const maxPoints of [10, 20, 50, 100, 150, 200]) for (const share of [0, 0.2, 0.4, 0.5]) for (let count = 0; count <= 6; count++) {
    const costs = hintLadder(maxPoints, count, share);
    const budget = hintBudget(maxPoints, share);
    assert.equal(costs.length, count);
    if (count > 0) assert.equal(costs.reduce((sum, cost) => sum + cost, 0), budget, `${maxPoints} ${share} ${count}`);
    assert.ok(costs.every((cost, index) => cost >= 0 && cost % 5 === 0 && (index === 0 || cost >= costs[index - 1])), `${maxPoints} ${share} ${count}: ${costs}`);
    const rewards = budgetRewards({ maxPoints, budgetShare: share, foodTokens: 1 }, count);
    // Every hint used: exactly the floor; never below it.
    assert.equal(calculateWaterReward(null, count, rewards).points, count > 0 ? maxPoints - budget : maxPoints);
  }
});

test("the proposed 40 % budget on 100 points: the worked examples in the plan", () => {
  assert.deepEqual(hintLadder(100, 2, 0.4), [15, 25]);
  assert.deepEqual(hintLadder(100, 3, 0.4), [5, 15, 20]);
  assert.deepEqual(hintLadder(100, 4, 0.4), [5, 10, 10, 15]);
});

test("invalid scoring input throws", () => {
  assert.throws(() => hintLadder(0, 2, 0.4));
  assert.throws(() => hintLadder(100, -1, 0.4));
  assert.throws(() => hintLadder(100, 1.5, 0.4));
  assert.throws(() => hintLadder(100, 2, 1.5));
  assert.throws(() => hintLadder(100, 2, Number.NaN));
  assert.throws(() => budgetRewards({ maxPoints: 100, budgetShare: 0.4, foodTokens: -1 }, 2));
});

test("model B never scores speed: a slow solve earns the same as a fast one", () => {
  for (const elapsed of [null, 0, 60_000, 3_600_000]) assert.equal(calculateWaterReward(elapsed, 0, MURAL_REWARDS).points, 100);
});

test("the mural: time measured but never scored, two hints, 100 → 85 → 60, and 2 food tokens", () => {
  assert.equal((MURAL_MISSION as MissionDefinition).timed, undefined);
  assert.equal(MURAL_MISSION.hintCount, 2); assert.equal(MURAL_TASK.hints.length, 2);
  assert.deepEqual([0, 1, 2].map(hints => calculateWaterReward(null, hints, MURAL_REWARDS)), [
    { points: 100, foodTokens: 2, hintsUsed: 0 }, { points: 85, foodTokens: 2, hintsUsed: 1 }, { points: 60, foodTokens: 2, hintsUsed: 2 }]);
  assert.equal(MURAL_REWARDS.minimumPoints, MURAL_SCORING.maxPoints - hintBudget(MURAL_SCORING.maxPoints, MURAL_SCORING.budgetShare));
});

test("catalogue: every challenge's hints fit its scoring, and optional points stay within twice the core (D2)", () => {
  for (const mission of SHUK_MISSIONS) {
    const hints = mission.hintCount + (mission.followUps ?? []).reduce((sum, step) => sum + step.hintCount, 0);
    assert.ok(hints <= mission.rewards.hintPenalties.length, `${mission.id}: ${hints} hints, ${mission.rewards.hintPenalties.length} costs`);
    if (mission.bonus) assert.ok(withinOptionalCap(mission.rewards.maxPoints, mission.bonus.points), mission.id);
  }
  assert.equal(withinOptionalCap(100, 200), true); assert.equal(withinOptionalCap(100, 205), false);
});
