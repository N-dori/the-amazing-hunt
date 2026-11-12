import assert from "node:assert/strict";
import { test } from "node:test";
import { NEW_HINT_MEMORY, shouldShowTwoFingerHint, TWO_FINGER_HINT } from "./two-finger-hint.ts";

const drag = { distance: 40, pageScrolled: false, alreadyShown: false };

test("a one-finger drag that doesn't scroll the page shows the hint; a tap or a page scroll doesn't", () => {
  assert.equal(shouldShowTwoFingerHint(drag, NEW_HINT_MEMORY, 1000), true);
  assert.equal(shouldShowTwoFingerHint({ ...drag, distance: TWO_FINGER_HINT.moveThreshold - 1 }, NEW_HINT_MEMORY, 1000), false);
  assert.equal(shouldShowTwoFingerHint({ ...drag, pageScrolled: true }, NEW_HINT_MEMORY, 1000), false);
});

test("the hint shows once per gesture, rests for the cooldown, and never returns after a two-finger gesture", () => {
  assert.equal(shouldShowTwoFingerHint({ ...drag, alreadyShown: true }, NEW_HINT_MEMORY, 1000), false);
  const shown = { lastShownAt: 1000, learned: false };
  assert.equal(shouldShowTwoFingerHint(drag, shown, 1000 + TWO_FINGER_HINT.cooldown - 1), false);
  assert.equal(shouldShowTwoFingerHint(drag, shown, 1000 + TWO_FINGER_HINT.cooldown), true);
  assert.equal(shouldShowTwoFingerHint(drag, { lastShownAt: null, learned: true }, 1000), false);
});
