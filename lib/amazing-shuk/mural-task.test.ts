import test from "node:test";
import assert from "node:assert/strict";
import { evaluateChoice, isValidChoiceSelection, toggleChoice, type ChoiceChallenge } from "./choice-task.ts";
import { MURAL_CHALLENGE, MURAL_MISSION, MURAL_TASK } from "./mural-task.ts";
import { buildChoiceTaskView } from "./mural-task-view.ts";
import { findMission, SHUK_MISSIONS } from "./missions.ts";

// Test-only key: the real key is not field-verified. "103" stays unknown, as in the sources.
const verified: ChoiceChallenge = { ...MURAL_CHALLENGE, answerKeyVerified: true };

test("mural options are sourced, unique and the key is not verified", () => {
  const ids = MURAL_CHALLENGE.options.map(option => option.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(MURAL_CHALLENGE.options.every(option => option.label && option.source));
  assert.equal(MURAL_CHALLENGE.required, 2);
  assert.equal(MURAL_CHALLENGE.answerKeyVerified, false);
  assert.equal(MURAL_CHALLENGE.options.find(option => option.id === "tile-103")?.correct, null);
  assert.ok(MURAL_CHALLENGE.options.filter(option => option.correct === true).length >= MURAL_CHALLENGE.required);
});

test("picks keep catalogue order, allow at most two and reject unknown options", () => {
  let selected = toggleChoice(MURAL_CHALLENGE, [], "plaque")!;
  selected = toggleChoice(MURAL_CHALLENGE, selected, "air-vents")!;
  assert.deepEqual(selected, ["air-vents", "plaque"]);
  assert.equal(toggleChoice(MURAL_CHALLENGE, selected, "music-sign"), null);
  assert.deepEqual(toggleChoice(MURAL_CHALLENGE, selected, "plaque"), ["air-vents"]);
  assert.equal(toggleChoice(MURAL_CHALLENGE, [], "unknown"), null);
  assert.equal(isValidChoiceSelection(MURAL_CHALLENGE, ["air-vents", "air-vents"]), false);
  assert.equal(isValidChoiceSelection(MURAL_CHALLENGE, ["air-vents", "plaque", "music-sign"]), false);
});

test("answers are judged only against a verified key; unknown items never count as real", () => {
  assert.equal(evaluateChoice(MURAL_CHALLENGE, ["air-vents"]), "incomplete");
  assert.equal(evaluateChoice(MURAL_CHALLENGE, ["air-vents", "plaque"]), "unverified");
  assert.equal(evaluateChoice(verified, ["air-vents", "plaque"]), "accepted");
  assert.equal(evaluateChoice(verified, ["air-vents", "cardboard-boxes"]), "incorrect");
  assert.equal(evaluateChoice(verified, ["air-vents", "tile-103"]), "incorrect");
});

test("story is short, labels each statement and has no Hebrew; mission has no photo or unverified coordinates", () => {
  const words = MURAL_TASK.story.paragraphs.map(paragraph => paragraph.text).join(" ").split(/\s+/).length;
  assert.ok(words <= 40, `${words} words`);
  assert.deepEqual(MURAL_TASK.story.paragraphs.map(paragraph => paragraph.label), ["Historical fact", "Attributed tradition"]);
  assert.ok(!/[֐-׿]/.test(JSON.stringify(MURAL_TASK)));
  assert.equal(MURAL_TASK.hints.length, 3);
  assert.equal(MURAL_MISSION.photo, null);
  assert.equal(MURAL_MISSION.arrival.destination, null);
  assert.equal(MURAL_MISSION.placement.verified, false);
  assert.equal(findMission(MURAL_MISSION.id), MURAL_MISSION);
  assert.deepEqual(SHUK_MISSIONS.map(mission => mission.challenge.kind), ["water", "choice"]);
});

test("view: followers discuss but can't submit; a full selection locks the other options", () => {
  const idle = buildChoiceTaskView(MURAL_CHALLENGE, [], false, "follower", false, false);
  assert.ok(idle.options.every(option => option.disabled));
  const full = buildChoiceTaskView(MURAL_CHALLENGE, ["air-vents", "plaque"], false, "follower", false, true);
  assert.equal(full.canSubmit, false);
  assert.deepEqual(full.options.filter(option => !option.disabled).map(option => option.id), ["air-vents", "plaque"]);
  const submitter = buildChoiceTaskView(MURAL_CHALLENGE, ["air-vents", "plaque"], false, "answerSubmitter", false, true);
  assert.equal(submitter.canSubmit, true); assert.equal(submitter.submitDisabled, false); assert.equal(submitter.status, "2 of 2 chosen");
  assert.equal(buildChoiceTaskView(MURAL_CHALLENGE, ["air-vents"], false, "answerSubmitter", false, true).submitDisabled, true);
});
