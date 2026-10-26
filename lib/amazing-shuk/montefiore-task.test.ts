import test from "node:test";
import assert from "node:assert/strict";
import { evaluateChoice } from "./choice-task.ts";
import { findChoiceTask } from "./choice-missions.ts";
import { findMission, SHUK_MISSIONS } from "./missions.ts";
import { MONTEFIORE_BONUS, MONTEFIORE_BONUS_CHALLENGE, MONTEFIORE_CHALLENGE, MONTEFIORE_MISSION, MONTEFIORE_MISSION_ID, MONTEFIORE_TASK } from "./montefiore-task.ts";

const LABELS = new Set(["Historical fact", "Interpretation", "Attributed tradition"]);
const GEMATRIA: Readonly<Record<string, number>> = { "א": 1, "ב": 2, "ה": 5, "ו": 6, "י": 10, "ל": 30, "מ": 40, "ע": 70, "ר": 200, "ת": 400 };
const value = (word: string) => [...word].reduce((sum, letter) => sum + (GEMATRIA[letter] ?? 0), 0);

test("pick three of five: Hebrew, English and Arabic are on the gate; Ladino and Yiddish are not", () => {
  assert.equal(MONTEFIORE_CHALLENGE.required, 3); assert.equal(MONTEFIORE_CHALLENGE.answerKeyVerified, true);
  assert.deepEqual(MONTEFIORE_CHALLENGE.options.filter(option => option.correct).map(option => option.id), ["hebrew", "english", "arabic"]);
  assert.equal(evaluateChoice(MONTEFIORE_CHALLENGE, ["hebrew", "english", "arabic"]), "accepted");
  assert.equal(evaluateChoice(MONTEFIORE_CHALLENGE, ["hebrew", "english", "ladino"]), "incorrect");
  assert.equal(evaluateChoice(MONTEFIORE_CHALLENGE, ["hebrew", "yiddish", "arabic"]), "incorrect");
  assert.equal(evaluateChoice(MONTEFIORE_CHALLENGE, ["hebrew", "english"]), "incomplete");
});

test("the story is short and labelled, and nothing before the answer lists the languages", () => {
  const story = MONTEFIORE_TASK.story.paragraphs;
  assert.ok(story.length <= 5); assert.ok(story.every(paragraph => paragraph.label === "Historical fact"));
  const beforeAnswer = [...story.map(paragraph => paragraph.text), MONTEFIORE_TASK.question, MONTEFIORE_MISSION.clue,
    MONTEFIORE_MISSION.location.summary, ...MONTEFIORE_MISSION.location.landmarks, MONTEFIORE_MISSION.photo.alt];
  for (const text of beforeAnswer) assert.doesNotMatch(text, /Arabic|English|Hebrew|Testimonial|عرب/, text);
  assert.ok(MONTEFIORE_TASK.reveal.paragraphs.every(paragraph => LABELS.has(paragraph.label)));
  // The Arabic panel's wording waits for a field check: no visitor copy claims it yet.
  assert.doesNotMatch(JSON.stringify(MONTEFIORE_TASK.reveal), /TODO|Arabic panel (says|reads)/);
});

test("parked bonus: the plaque's year תרמ\"ב hides in בתמר, the same four letters, so no arithmetic is needed", () => {
  assert.equal(MONTEFIORE_BONUS_CHALLENGE.required, 1);
  assert.deepEqual(MONTEFIORE_BONUS_CHALLENGE.options.filter(option => option.correct).map(option => option.label), ["בתמר"]);
  assert.ok(MONTEFIORE_BONUS_CHALLENGE.options.every(option => option.lang === "he"));
  const sorted = (word: string) => [...word].sort().join("");
  assert.equal(sorted("בתמר"), sorted("תרמב")); assert.deepEqual([...MONTEFIORE_BONUS.letters].sort(), [..."תרמב"].sort());
  // Every option is a word of the verse; only the answer is an anagram of the year.
  const verseWords = MONTEFIORE_BONUS.verse.replace(/[֑-ׇ]/g, "").split(" ");
  assert.deepEqual(MONTEFIORE_BONUS_CHALLENGE.options.map(option => option.label), verseWords);
  assert.deepEqual(MONTEFIORE_BONUS_CHALLENGE.options.filter(option => sorted(option.label) === sorted("תרמב")).map(option => option.id), ["betamar"]);
  // The optional gematria line holds: 400 + 200 + 40 + 2 = 642 both ways, and the full phrase is not 642.
  assert.equal(value("תרמב"), 642); assert.equal(value("בתמר"), 642); assert.notEqual(value("אעלהבתמר"), 642);
  assert.ok(MONTEFIORE_BONUS.reveal.every(paragraph => LABELS.has(paragraph.label)));
  assert.doesNotMatch(JSON.stringify(MONTEFIORE_BONUS), /\b1[0-9]{2}\b|\b200\b/, "no disputed count of immigrants");
});

test("the gate: provisional marker, GPS off, and no bonus (the Yemenite year isn't about this gate)", () => {
  assert.equal(SHUK_MISSIONS[1], MONTEFIORE_MISSION); assert.equal(findMission(MONTEFIORE_MISSION_ID), MONTEFIORE_MISSION);
  assert.ok(!("bonus" in MONTEFIORE_MISSION)); assert.equal(findChoiceTask(MONTEFIORE_MISSION_ID)?.bonus, undefined);
  assert.equal(MONTEFIORE_MISSION.placement.verified, false); assert.equal(MONTEFIORE_MISSION.arrival.destination.verified, false);
  assert.equal(MONTEFIORE_MISSION.hintCount, 2);
});
