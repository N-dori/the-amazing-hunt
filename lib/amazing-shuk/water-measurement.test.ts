import assert from "node:assert/strict";
import test from "node:test";
import { applyWaterMove, EMPTY_WATER_CUPS, evaluateWaterSubmission, isWaterPuzzleSolved, WATER_TARGET_ML } from "./water-measurement.ts";

const solution = ["fill-large", "pour-large-into-small", "empty-small", "pour-large-into-small", "fill-large", "pour-large-into-small"] as const;

function play() {
  return solution.reduce((cups, move) => {
    const next = applyWaterMove(cups, move);
    assert.ok(next, "each documented solution move must be legal");
    return next;
  }, EMPTY_WATER_CUPS);
}

test("jug moves preserve capacities and transfer only the available space", () => {
  assert.deepEqual(applyWaterMove(EMPTY_WATER_CUPS, "fill-large"), { small: 0, large: 500 });
  assert.deepEqual(applyWaterMove({ small: 0, large: 500 }, "pour-large-into-small"), { small: 300, large: 200 });
  assert.equal(applyWaterMove({ small: 301, large: 0 }, "empty-small"), null);
  assert.equal(applyWaterMove(EMPTY_WATER_CUPS, "invalid" as never), null);
});

test("the published jug sequence leaves exactly 400 ml", () => {
  const cups = play();
  assert.equal(WATER_TARGET_ML, 400);
  assert.deepEqual(cups, { small: 300, large: 400 });
  assert.equal(isWaterPuzzleSolved(cups), true);
  assert.equal(isWaterPuzzleSolved(EMPTY_WATER_CUPS), false);
});

test("submissions require the answer-submitter or a guide approval", () => {
  const solved = play();
  assert.equal(evaluateWaterSubmission("answerSubmitter", solved), "accepted");
  assert.equal(evaluateWaterSubmission("navigatorAndAnswerSubmitter", solved), "accepted");
  assert.equal(evaluateWaterSubmission("follower", solved), "unauthorized");
  assert.equal(evaluateWaterSubmission("navigator", solved), "unauthorized");
  assert.equal(evaluateWaterSubmission("guide", solved), "incorrect");
  assert.equal(evaluateWaterSubmission("guide", EMPTY_WATER_CUPS, true), "accepted");
  assert.equal(evaluateWaterSubmission("answerSubmitter", EMPTY_WATER_CUPS), "incorrect");
});
