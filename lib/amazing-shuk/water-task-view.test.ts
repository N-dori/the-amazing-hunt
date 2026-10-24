import assert from "node:assert/strict";
import test from "node:test";
import { buildWaterTaskView } from "./water-task-view.ts";
import { EMPTY_WATER_CUPS } from "./water-measurement.ts";
import { nextWaterHintCount, visibleWaterHints } from "./water-hints.ts";

const selectedLarge = { selected: "large", pouring: false } as const;
test("contextual controls show only available actions for the selected vessel", () => {
  const initial = buildWaterTaskView(EMPTY_WATER_CUPS, false, "follower", false);
  assert.equal(initial.canSubmit, false);
  assert.deepEqual(initial.actions, []);
  assert.match(initial.prompt, /Tap a measuring vessel/);
  const empty = buildWaterTaskView(EMPTY_WATER_CUPS, false, "follower", false, selectedLarge);
  assert.deepEqual(empty.actions.map(action => action.id), ["fill-large"]);
  const full = buildWaterTaskView({ small: 0, large: 5, jar: 0 }, false, "follower", false, selectedLarge);
  assert.deepEqual(full.actions.map(action => action.id), ["pour", "empty-large"]);
  assert.equal(full.actions[1].label, "Return water to the well");
  const partial = buildWaterTaskView({ small: 3, large: 2, jar: 0 }, false, "follower", false, selectedLarge);
  assert.deepEqual(partial.actions.map(action => action.id), ["fill-large", "pour", "empty-large"]);
  const jar = buildWaterTaskView({ small: 3, large: 0, jar: 2 }, false, "follower", false, { selected: "jar", pouring: false });
  assert.deepEqual(jar.actions, []);
  assert.match(jar.prompt, /collects the water/);
});

test("pouring enables eligible destinations and reconciles shared updates", () => {
  const pouring = { ...selectedLarge, pouring: true };
  const view = buildWaterTaskView({ small: 0, large: 5, jar: 0 }, false, "answerSubmitter", false, pouring);
  assert.equal(view.pouring, true);
  assert.deepEqual(view.actions, []);
  assert.equal(view.containers.find(container => container.id === "large")!.disabled, true);
  assert.equal(view.containers.find(container => container.id === "small")!.destinationMove, "pour-large-into-small");
  assert.equal(view.containers.find(container => container.id === "jar")!.destinationMove, "pour-large-into-jar");
  const changed = buildWaterTaskView({ small: 3, large: 2, jar: 2 }, false, "answerSubmitter", false, pouring);
  assert.equal(changed.containers.find(container => container.id === "small")!.disabled, true);
  assert.equal(changed.containers.find(container => container.id === "jar")!.disabled, false);
  const emptiedBySomeoneElse = buildWaterTaskView({ small: 3, large: 0, jar: 2 }, false, "answerSubmitter", false, pouring);
  assert.equal(emptiedBySomeoneElse.pouring, false);
  assert.deepEqual(emptiedBySomeoneElse.actions.map(action => action.id), ["fill-large"]);
});

test("ready, busy and finalized states preserve the official role-based submission", () => {
  const measured = buildWaterTaskView({ small: 3, large: 4, jar: 0 }, false, "answerSubmitter", false);
  assert.equal(measured.submitDisabled, true);
  const filled = buildWaterTaskView({ small: 3, large: 0, jar: 4 }, false, "guide", false, selectedLarge);
  assert.equal(filled.submitDisabled, false);
  assert.equal(filled.canSubmit, true);
  assert.deepEqual(filled.actions, []);
  assert.match(filled.status, /Solved!/);
  const busy = buildWaterTaskView({ small: 0, large: 5, jar: 0 }, false, "follower", true, selectedLarge);
  assert.deepEqual(busy.actions, []);
  assert.ok(busy.containers.every(container => container.disabled));
  const completed = buildWaterTaskView({ small: 3, large: 0, jar: 4 }, true, "answerSubmitter", false, selectedLarge);
  assert.equal(completed.canReset, false);
  assert.deepEqual(completed.actions, []);
  assert.equal(completed.submitDisabled, true);
  assert.match(completed.status, /accepted/);
});

test("optional hints reveal progressively without exceeding three or mutating puzzle progress", () => {
  const cups = Object.freeze({ small: 3, large: 0, jar: 2 });
  let count = 0;
  assert.deepEqual(visibleWaterHints(count), []);
  for (let expected = 1; expected <= 3; expected++) {
    count = nextWaterHintCount(count);
    assert.equal(visibleWaterHints(count).length, expected);
  }
  assert.match(visibleWaterHints(1)[0].text, /difference/);
  assert.match(visibleWaterHints(2)[1].text, /5-liter vessel/);
  assert.match(visibleWaterHints(3)[2].text, /twice/);
  assert.equal(nextWaterHintCount(count), 3);
  assert.equal(visibleWaterHints(Number.NaN).length, 0);
  assert.equal(visibleWaterHints(-5).length, 0);
  assert.equal(visibleWaterHints(99).length, 3);
  assert.deepEqual(cups, { small: 3, large: 0, jar: 2 });
});
