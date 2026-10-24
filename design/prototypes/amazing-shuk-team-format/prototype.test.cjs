"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const { FORMATS, EMPTY_STATE, TARGET_ML, applyMove, isSolved, labelForFormat } = require("./prototype.js");

test("offers one group and two- or three-team formats", () => {
  assert.deepEqual(FORMATS.map((format) => format.id), ["group", "two-teams", "three-teams"]);
});

test("returns the selected format label and rejects unknown formats", () => {
  assert.equal(labelForFormat("two-teams"), "Two teams");
  assert.equal(labelForFormat("four-teams"), null);
});

test("requires legal fill, empty and pour moves within cup capacities", () => {
  assert.deepEqual(applyMove(EMPTY_STATE, "fill-500"), { 300: 0, 500: 500 });
  assert.deepEqual(applyMove({ 300: 0, 500: 500 }, "pour-500-300"), { 300: 300, 500: 200 });
  assert.equal(applyMove(EMPTY_STATE, "unknown"), null);
  assert.equal(applyMove({ 300: 301, 500: 0 }, "empty-300"), null);
});

test("the published cup sizes can measure 400 ml and detect completion", () => {
  assert.equal(TARGET_ML, 400);
  let state = { 300: 0, 500: 0 };
  for (const move of ["fill-500", "pour-500-300", "empty-300", "pour-500-300", "fill-500", "pour-500-300"]) {
    state = applyMove(state, move);
    assert.ok(state, "each solution move must be legal");
  }
  assert.deepEqual(state, { 300: 300, 500: 400 });
  assert.equal(isSolved(state), true);
  assert.equal(isSolved(EMPTY_STATE), false);
  assert.equal(isSolved({ 300: 400, 500: 0 }), false);
});
