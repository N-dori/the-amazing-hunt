import test from "node:test";
import assert from "node:assert/strict";
import { COUNT_UP_MS, countUpValue } from "./count-up.ts";
import { rewardAmountItems, rewardAmounts } from "./mission-cheer.ts";

test("UX-4: the count-up starts at 0, rises without passing the award, and ends exactly on it", () => {
  assert.equal(countUpValue(85, 0), 0);
  let previous = 0;
  for (let time = 0; time <= COUNT_UP_MS; time += 35) {
    const value = countUpValue(85, time);
    assert.ok(Number.isInteger(value) && value >= previous && value <= 85, `${time}: ${value}`);
    previous = value;
  }
  assert.equal(countUpValue(85, COUNT_UP_MS), 85);
  assert.equal(countUpValue(85, Infinity), 85);
  assert.equal(countUpValue(85, Number.NaN), 85);
  assert.equal(countUpValue(0, 100), 0);
  assert.equal(countUpValue(85, -50), 0);
});

test("UX-4: only the points count up; each amount keeps its final line for screen readers", () => {
  assert.deepEqual(rewardAmountItems(85, 2), [
    { key: "points", value: 85, unit: "points", label: "+85 points", countUp: true },
    { key: "foodTokens", value: 2, unit: "food tokens", label: "+2 food tokens", countUp: false },
  ]);
  assert.deepEqual(rewardAmountItems(1, 0).map(amount => amount.label), ["+1 point"]);
  assert.deepEqual(rewardAmounts(0, 1), ["+1 food token"]);
});
