import test from "node:test";
import assert from "node:assert/strict";
import { evaluateChoice, isValidChoiceSelection, toggleChoice, type ChoiceChallenge } from "./choice-task.ts";
import { MURAL_CHALLENGE, MURAL_MISSION, MURAL_TASK } from "./mural-task.ts";
import { buildChoiceTaskView } from "./mural-task-view.ts";
import { findMission, SHUK_MISSIONS } from "./missions.ts";

// An unverified copy, to prove that a key without a field check never scores.
const unverified: ChoiceChallenge = { ...MURAL_CHALLENGE, answerKeyVerified: false };

test("mural options are sourced, unique, and the field-checked key marks every item", () => {
  const ids = MURAL_CHALLENGE.options.map(option => option.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(MURAL_CHALLENGE.options.every(option => option.label && option.source));
  assert.equal(MURAL_CHALLENGE.required, 2);
  assert.equal(MURAL_CHALLENGE.answerKeyVerified, true);
  assert.ok(MURAL_CHALLENGE.options.every(option => typeof option.correct === "boolean"));
  assert.deepEqual(MURAL_CHALLENGE.options.filter(option => option.correct).map(option => option.id), ["air-vents", "plaque", "music-sign"]);
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

test("any two real items are accepted; a painted pick is wrong; an unverified key never scores", () => {
  assert.equal(evaluateChoice(MURAL_CHALLENGE, ["air-vents"]), "incomplete");
  for (const pair of [["air-vents", "plaque"], ["air-vents", "music-sign"], ["plaque", "music-sign"]]) assert.equal(evaluateChoice(MURAL_CHALLENGE, pair), "accepted");
  assert.equal(evaluateChoice(MURAL_CHALLENGE, ["air-vents", "cardboard-boxes"]), "incorrect");
  assert.equal(evaluateChoice(MURAL_CHALLENGE, ["air-vents", "tile-103"]), "incorrect");
  assert.equal(evaluateChoice(unverified, ["air-vents", "plaque"]), "unverified");
  assert.equal(evaluateChoice({ ...MURAL_CHALLENGE, options: MURAL_CHALLENGE.options.map(option => option.id === "plaque" ? { ...option, correct: null } : option) }, ["air-vents", "plaque"]), "incorrect");
});

test("story is short, labels each statement and has no Hebrew; the street photo names no answer, and the GPS point is confirmed", () => {
  const words = MURAL_TASK.story.paragraphs.map(paragraph => paragraph.text).join(" ").split(/\s+/).length;
  assert.ok(words <= 40, `${words} words`);
  assert.deepEqual(MURAL_TASK.story.paragraphs.map(paragraph => paragraph.label), ["Historical fact", "Attributed tradition"]);
  assert.ok(!/[֐-׿]/.test(JSON.stringify(MURAL_TASK)));
  assert.equal(MURAL_TASK.hints.length, 3);
  // The before photo sits with the story (owner's request, 26 Oct 2026), not in the reveal.
  assert.ok(MURAL_TASK.story.image.alt && MURAL_TASK.story.image.caption);
  assert.equal(MURAL_TASK.reveal.image, null);
  // The owner chose a street view of the whole wall (24 Oct 2026); its name and alt text must not point at any option.
  assert.ok(MURAL_MISSION.photo && MURAL_MISSION.photo.src !== MURAL_TASK.story.image.src);
  assert.doesNotMatch(`${MURAL_MISSION.photo.src} ${MURAL_MISSION.photo.alt}`, /vent|plaque|treble|clef|103|box|carton|phone|antenna|bicycle|laundry/i);
  assert.equal(MURAL_MISSION.arrival.destination.verified, true);
  assert.equal(MURAL_MISSION.placement.verified, false);
  assert.equal(findMission(MURAL_MISSION.id), MURAL_MISSION);
  assert.deepEqual(SHUK_MISSIONS.map(mission => mission.challenge.kind), ["choice", "choice", "water", "choice", "choice", "choice"]);
});

test("view: followers discuss but can't submit; a full selection locks the other options", () => {
  const idle = buildChoiceTaskView(MURAL_CHALLENGE, [], false, "follower", false, false);
  assert.ok(idle.options.every(option => option.disabled));
  const full = buildChoiceTaskView(MURAL_CHALLENGE, ["air-vents", "plaque"], false, "follower", false, true);
  assert.equal(full.canSubmit, false);
  assert.deepEqual(full.options.filter(option => !option.disabled).map(option => option.id), ["air-vents", "plaque"]);
  const submitter = buildChoiceTaskView(MURAL_CHALLENGE, ["air-vents", "plaque"], false, "answerSubmitter", false, true);
  assert.equal(submitter.canSubmit, true); assert.equal(submitter.submitDisabled, false); assert.equal(submitter.status, "2 of 2 selected");
  assert.equal(buildChoiceTaskView(MURAL_CHALLENGE, ["air-vents"], false, "answerSubmitter", false, true).submitDisabled, true);
});
