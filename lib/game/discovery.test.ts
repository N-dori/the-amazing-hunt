import assert from "node:assert/strict";
import { test } from "node:test";
import { checkDiscoveryAnswer, discoveryHelp, discoveryMissions, discoverySteps, isBrokenTimeReading, isTravelersPrayerDestination } from "./discovery.ts";

const { A: travelersPrayer, B: brokenTime } = discoveryMissions;

test("00C Team A accepts America or the United States, in English or Hebrew, with any punctuation", () => {
  for (const ok of ["America", " america ", "AMERICA!", "the United States", "United States of America", "USA", "U.S.A.", "the US", "to America", "to the United States", "the land of America", "אמריקה", "ארצות הברית", "ארה״ב", "לאמריקה"]) {
    assert.ok(isTravelersPrayerDestination(ok), ok);
  }
  for (const no of ["", "Europe", "Israel", "South America", "the", "New York", "Ellis Island", "Americana"]) {
    assert.ok(!isTravelersPrayerDestination(no), no);
  }
});

test("00C Team B accepts readings about ruptures, divisions and conflict, not one-word guesses", () => {
  for (const ok of [
    "The crack is the rifts in human history",
    "it shows how history breaks apart",
    "a fracture between people, like a war",
    "Divisions between communities over time",
    "the broken tablets at Sinai",
    "people who disagree and split apart",
    "השבר בהיסטוריה האנושית",
    "מחלוקת בין אנשים לאורך הזמן",
  ]) {
    assert.ok(isBrokenTimeReading(ok), ok);
  }
  for (const no of ["", "broken", "a crack", "It is a nice round stone", "time goes in circles", "toward the award"]) {
    assert.ok(!isBrokenTimeReading(no), no);
  }
});

test("each team is checked against its own mission", () => {
  assert.ok(checkDiscoveryAnswer("A", "America"));
  assert.ok(!checkDiscoveryAnswer("B", "America"));
  assert.ok(checkDiscoveryAnswer("B", "the rifts of human history"));
  assert.ok(!checkDiscoveryAnswer("A", "the rifts of human history"));
});

test("both missions are comparable: same points, hint count, guide override and core steps", () => {
  assert.equal(travelersPrayer.points, brokenTime.points);
  assert.equal(travelersPrayer.answer.hints.length, brokenTime.answer.hints.length);
  assert.equal(travelersPrayer.answer.guideAfterMisses, brokenTime.answer.guideAfterMisses);
  const core = ["brief", "clue", "find", "observe", "read", "answer", "reveal"];
  assert.deepEqual(discoverySteps(brokenTime), core);
  assert.deepEqual(discoverySteps(travelersPrayer), [...core, "reflect"], "only Team A has the optional reflection");
});

test("00C help escalates: nothing, two hints, then the guide override", () => {
  for (const mission of [travelersPrayer, brokenTime]) {
    assert.deepEqual(discoveryHelp(mission, 0), { hint: null, guide: false });
    assert.equal(discoveryHelp(mission, 1).hint, mission.answer.hints[0]);
    assert.equal(discoveryHelp(mission, 2).hint, mission.answer.hints[1]);
    assert.equal(discoveryHelp(mission, 3).guide, true);
  }
});

test("nothing before the reveal gives the answer away", () => {
  for (const mission of [travelersPrayer, brokenTime]) {
    const before = [...mission.brief, mission.clue.text, mission.find.where, mission.find.hint, mission.observe.text, mission.read.text, mission.answer.prompt, ...mission.answer.hints];
    for (const copy of before) assert.ok(!/america|united states|tablets/i.test(copy.text), copy.text);
  }
  // Broken Time's full photograph is only shown in the reveal; the clue is a crop.
  assert.notEqual(brokenTime.clue.photo.src, brokenTime.reveal.photo.src);
});

test("every 00C statement shown to players carries one evidence label", () => {
  const claims = ["historicalFact", "interpretation", "attributedTradition", "fiction"];
  for (const mission of [travelersPrayer, brokenTime]) {
    const statements = [...mission.brief, mission.reveal.documented, mission.reveal.harmony, ...(mission.reveal.message ? [mission.reveal.message] : [])];
    for (const s of statements) assert.ok(claims.includes(s.claim), s.text);
    for (const line of mission.brief) assert.equal(line.claim, "fiction");
    assert.equal(mission.reveal.harmony.claim, "fiction");
  }
});

test("the reflection is optional and the Broken Time quote is the guide's own wording", () => {
  assert.match(travelersPrayer.reflect!.note.text, /not scored/);
  assert.equal(brokenTime.reveal.documented.status, "approved");
  assert.equal(brokenTime.reveal.documented.claim, "interpretation", "the guide's reading of an artwork is an interpretation");
});
