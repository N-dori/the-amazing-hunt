import assert from "node:assert/strict";
import test from "node:test";
import { applyWaterMove, EMPTY_WATER_CUPS, evaluateWaterSubmission, isWaterPuzzleSolved, WATER_TARGET_LITERS, WATER_MOVES, type WaterCups, type WaterMove } from "./water-measurement.ts";

const solution = ["fill-large", "pour-large-into-small", "empty-small", "pour-large-into-small", "fill-large", "pour-large-into-small", "pour-large-into-jar"] as const;
function play(moves: readonly WaterMove[] = solution) {
  return moves.reduce((cups, move) => {
    const next = applyWaterMove(cups, move);
    assert.ok(next);
    return next;
  }, EMPTY_WATER_CUPS);
}
test("three-container moves conserve water while pouring and respect capacities", () => {
  assert.deepEqual(EMPTY_WATER_CUPS, { small: 0, large: 0, jar: 0 });
  assert.deepEqual(applyWaterMove(EMPTY_WATER_CUPS, "fill-large"), { small: 0, large: 5, jar: 0 });
  assert.deepEqual(applyWaterMove({ small: 0, large: 5, jar: 0 }, "pour-large-into-small"), { small: 3, large: 2, jar: 0 });
  assert.deepEqual(applyWaterMove({ small: 3, large: 5, jar: 3 }, "pour-large-into-jar"), { small: 3, large: 4, jar: 4 });
  assert.deepEqual(applyWaterMove({ small: 3, large: 5, jar: 3 }, "pour-small-into-jar"), { small: 2, large: 5, jar: 4 });
  for (let small = 0; small <= 3; small++) for (let large = 0; large <= 5; large++) for (let jar = 0; jar <= 4; jar++) {
    const before = { small, large, jar };
    for (const move of WATER_MOVES.filter(move => move.startsWith("pour"))) {
      const after = applyWaterMove(before, move)!;
      assert.equal(after.small + after.large + after.jar, small + large + jar);
      assert.ok(after.small >= 0 && after.small <= 3 && after.large >= 0 && after.large <= 5 && after.jar >= jar && after.jar <= 4);
    }
  }
});
test("only permitted operations exist and invalid states are rejected without mutation", () => {
  for (const move of ["fill-jar", "empty-jar", "pour-jar-into-small", "pour-jar-into-large", "invalid"]) {
    assert.equal(applyWaterMove(EMPTY_WATER_CUPS, move as WaterMove), null);
  }
  for (const cups of [{ small: 4, large: 0, jar: 0 }, { small: 0, large: 6, jar: 0 }, { small: 0, large: 0, jar: 5 }, { small: -1, large: 0, jar: 0 }, { small: 0, large: 0, jar: 0.5 }, { small: 0, large: 0 }]) {
    assert.equal(applyWaterMove(cups as WaterCups, "empty-small"), null);
    assert.equal(isWaterPuzzleSolved(cups as WaterCups), false);
  }
  const cups = Object.freeze({ small: 0, large: 5, jar: 0 });
  applyWaterMove(cups, "pour-large-into-jar");
  assert.deepEqual(cups, { small: 0, large: 5, jar: 0 });
});
test("classic measuring sequence fills the family jar, and maximal pouring also permits a two-move solution", () => {
  assert.equal(WATER_TARGET_LITERS, 4);
  assert.deepEqual(play(), { small: 3, large: 0, jar: 4 });
  assert.deepEqual(play(["fill-large", "pour-large-into-jar"]), { small: 0, large: 1, jar: 4 });
  assert.equal(isWaterPuzzleSolved(play()), true);
  assert.equal(isWaterPuzzleSolved({ small: 3, large: 4, jar: 0 }), false);
});
test("submitter and guide must have exactly four liters in the family jar", () => {
  for (const role of ["answerSubmitter", "navigatorAndAnswerSubmitter", "guide"] as const) {
    assert.equal(evaluateWaterSubmission(role, play()), "accepted");
    assert.equal(evaluateWaterSubmission(role, EMPTY_WATER_CUPS), "incorrect");
    assert.equal(evaluateWaterSubmission(role, { small: 3, large: 4, jar: 0 }), "incorrect");
  }
  for (const role of ["follower", "navigator"] as const) assert.equal(evaluateWaterSubmission(role, play()), "unauthorized");
});


test("measure two liters twice, returning the three liters to the well between rounds", () => {
  const steps = [
    ["fill-large", { small: 0, large: 5, jar: 0 }],
    ["pour-large-into-small", { small: 3, large: 2, jar: 0 }],
    ["pour-large-into-jar", { small: 3, large: 0, jar: 2 }],
    ["empty-small", { small: 0, large: 0, jar: 2 }],
    ["fill-large", { small: 0, large: 5, jar: 2 }],
    ["pour-large-into-small", { small: 3, large: 2, jar: 2 }],
    ["pour-large-into-jar", { small: 3, large: 0, jar: 4 }],
  ] as const;
  let cups: WaterCups = EMPTY_WATER_CUPS;
  for (const [move, expected] of steps) {
    cups = applyWaterMove(cups, move)!;
    assert.deepEqual(cups, expected);
  }
  assert.equal(isWaterPuzzleSolved(cups), true);
  assert.equal(evaluateWaterSubmission("answerSubmitter", cups), "accepted");
});

test("returning either measuring vessel sends only its water to the well", () => {
  const cups = Object.freeze({ small: 3, large: 2, jar: 2 });
  assert.deepEqual(applyWaterMove(cups, "empty-small"), { small: 0, large: 2, jar: 2 });
  assert.deepEqual(applyWaterMove(cups, "empty-large"), { small: 3, large: 0, jar: 2 });
  assert.deepEqual(cups, { small: 3, large: 2, jar: 2 });
});
