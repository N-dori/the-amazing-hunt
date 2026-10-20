import assert from "node:assert/strict";
import { test } from "node:test";
import { firstKeepers, firstKeepersHelp, investigationViews, isFirstKeepersYear, libraryCard, librarySequence, nextLibraryMission } from "./library.ts";

test("00B accepts 1946 and the Hebrew year, with any spacing or punctuation", () => {
  for (const ok of ["1946", " 1946 ", "תש״ו", "תש\"ו", "תשו"]) assert.ok(isFirstKeepersYear(ok), ok);
  for (const no of ["1945", "1947", "1947-48", "", "19 46x"]) assert.ok(!isFirstKeepersYear(no), no);
});

test("00B help escalates: nothing, two hints, then the guide override", () => {
  assert.deepEqual(firstKeepersHelp(0), { hint: null, guide: false });
  assert.equal(firstKeepersHelp(1).hint, firstKeepers.hints[0]);
  assert.equal(firstKeepersHelp(2).hint, firstKeepers.hints[1]);
  assert.equal(firstKeepersHelp(3).guide, true);
  assert.equal(firstKeepersHelp(9).hint, firstKeepers.hints[1]);
});

test("HARMONY's brief never gives the year away", () => {
  for (const line of firstKeepers.brief) assert.ok(!/1946|תש/.test(line.text));
  assert.ok(!/1946/.test(firstKeepers.question.text));
});

test("every 00B statement shown to players carries one evidence label", () => {
  const statements = [...firstKeepers.brief, firstKeepers.documented, firstKeepers.separateIntro, ...firstKeepers.separate.map((s) => s.text), firstKeepers.reflection];
  for (const s of statements) assert.ok(["historicalFact", "interpretation", "attributedTradition", "fiction"].includes(s.claim));
});

test("both investigations unlock, the visitor's own team first", () => {
  assert.deepEqual(investigationViews("B").map((v) => [v.teamId, v.yours]), [["B", true], ["A", false]]);
  assert.deepEqual(investigationViews(null).map((v) => v.yours), [false, false]);
  assert.deepEqual(investigationViews("A", ["A"]).map((v) => [v.teamId, v.completed]), [["A", true], ["B", false]]);
});

test("the Library chapter runs 00A to 00E, and the map card follows the team's progress", () => {
  assert.deepEqual(librarySequence.map((m) => m.code), ["00A", "00B", "00C", "00D", "00E"]);
  assert.equal(nextLibraryMission({ timelineSolved: false, discoveryDone: false }), "00B");
  assert.equal(nextLibraryMission({ timelineSolved: true, discoveryDone: false }), "00C");
  assert.equal(nextLibraryMission({ timelineSolved: true, discoveryDone: true }), "00D");

  assert.deepEqual(libraryCard({ timelineSolved: false, discoveryDone: false }, "A"), { missionTitle: "Mission 00B · The First Memory Keepers", statusNote: null });
  assert.equal(libraryCard({ timelineSolved: true, discoveryDone: false }, "A").missionTitle, "Mission 00C · The Traveler's Prayer");
  assert.equal(libraryCard({ timelineSolved: true, discoveryDone: false }, "B").missionTitle, "Mission 00C · Broken Time");
  assert.equal(libraryCard({ timelineSolved: true, discoveryDone: true }, "B").missionTitle, "Mission 00D · Armoza archival investigations");
});
