import test from "node:test";
import assert from "node:assert/strict";
import { calculateWaterReward, WELL_REWARDS, createWaterPerformance, measuredWaterTime, adjustWaterTiming, awardWaterPerformance, type WaterPerformance } from "./water-performance.ts";

test("well score boundaries, cumulative hints and completion floor", () => {
  for (const [elapsed, expected] of [[0, 100], [119999, 100], [120000, 90], [120001, 90], [239999, 90], [240000, 90], [240001, 80], [99999999, 80]]) {
    assert.equal(calculateWaterReward(elapsed, 0).points, expected);
    assert.equal(calculateWaterReward(elapsed, 3).foodTokens, 2);
  }
  assert.deepEqual([0, 1, 2, 3].map(hints => calculateWaterReward(1000, hints).points), [100, 90, 75, 55]);
  assert.deepEqual([0, 1, 2, 3].map(hints => calculateWaterReward(300000, hints).points), [80, 70, 55, 40]);
  assert.equal(calculateWaterReward(null, 2).points, 75);
  const alternate = { ...WELL_REWARDS, maxPoints: 70, minimumPoints: 20, foodTokens: 5, fastUnderMs: 5000, standardThroughMs: 10000, standardPoints: 60, slowPoints: 50, hintPenalties: [2, 3, 4] };
  assert.deepEqual(calculateWaterReward(10001, 3, alternate), { points: 41, foodTokens: 5, hintsUsed: 3 });
  assert.throws(() => calculateWaterReward(-1, 0));
  assert.throws(() => calculateWaterReward(1, 4));
});

test("server timing excludes pauses, stops at solution and resets only its clock", () => {
  let timing: WaterPerformance = { ...createWaterPerformance(), startedAt: 1000, clockStartedAt: 1000, hintsUsed: 2 };
  timing = adjustWaterTiming(timing, "pause", 21000, "guide");
  assert.equal(measuredWaterTime(timing, 121000), 20000);
  timing = adjustWaterTiming(timing, "resume", 121000, "guide");
  timing = { ...timing, solvedAt: 131000 };
  assert.equal(measuredWaterTime(timing, 999999), 30000);
  const awarded = awardWaterPerformance(timing, 999999);
  assert.deepEqual(awarded.award, { points: 75, foodTokens: 2, hintsUsed: 2, awardedAt: 999999, elapsedMs: 30000 });
  assert.deepEqual(awardWaterPerformance(awarded, 1999999), awarded);
  assert.throws(() => adjustWaterTiming(awarded, "exclude", 1999999, "guide"));
  const reset = adjustWaterTiming({ ...timing, solvedAt: null }, "reset", 200000, "guide");
  assert.equal(reset.startedAt, 1000);
  assert.equal(reset.clockStartedAt, 200000);
  assert.equal(reset.hintsUsed, 2);
  assert.equal(measuredWaterTime(reset, 201000), 1000);
});

test("solving while paused and timing exclusion remain valid", () => {
  const timing = { ...createWaterPerformance(), startedAt: 1000, clockStartedAt: 1000, pausedAt: 21000, solvedAt: 121000 };
  assert.equal(measuredWaterTime(timing, 999999), 20000);
  const excluded = adjustWaterTiming(timing, "exclude", 130000, "guide");
  assert.equal(awardWaterPerformance(excluded, 999999).award!.elapsedMs, null);
  assert.equal(awardWaterPerformance(excluded, 999999).award!.points, 100);
  assert.throws(() => adjustWaterTiming(timing, "reset", 130000, "guide"));
});
