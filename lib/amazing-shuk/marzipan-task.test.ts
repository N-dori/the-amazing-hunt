import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { issueInvitation, redeemInvitation, sessionAction, sessionView } from "./participant-store.ts";
import { evaluateChoice } from "./choice-task.ts";
import { findChoiceTask } from "./choice-missions.ts";
import { choiceStep } from "./mission-arrival.ts";
import { findMission, SHUK_MISSIONS } from "./missions.ts";
import { parseAction } from "./parse-water-action.ts";
import { MARZIPAN_APPRECIATION, MARZIPAN_BONUS, MARZIPAN_BONUS_CHALLENGE, MARZIPAN_CHALLENGE, MARZIPAN_HORNS_CHALLENGE, MARZIPAN_MISSION, MARZIPAN_MISSION_ID, MARZIPAN_TASK } from "./marzipan-task.ts";

const MARZIPAN = MARZIPAN_MISSION_ID;
const LABELS = new Set(["Historical fact", "Interpretation", "Attributed tradition"]);
// The question a choice mission's view is on, and its picks.
const choiceSession = (view: Awaited<ReturnType<typeof sessionView>>) => {
  assert.equal(view.session.kind, "choice");
  return view.session as Extract<typeof view.session, { kind: "choice" }>;
};
const correct = (challenge: typeof MARZIPAN_CHALLENGE) => challenge.options.filter(option => option.correct).map(option => option.id);

test("question 1: the syrup goes on while the pastries are still warm, from a cited source", () => {
  assert.equal(MARZIPAN_CHALLENGE.required, 1); assert.equal(MARZIPAN_CHALLENGE.answerKeyVerified, true);
  assert.deepEqual(correct(MARZIPAN_CHALLENGE), ["still-warm"]);
  assert.match(MARZIPAN_CHALLENGE.options[1].source, /Maariv/);
  assert.equal(evaluateChoice(MARZIPAN_CHALLENGE, ["still-warm"]), "accepted");
  for (const wrong of ["before-oven", "fully-cooled"]) assert.equal(evaluateChoice(MARZIPAN_CHALLENGE, [wrong]), "incorrect");
});

test("question 2: rugelach means little horns; three invented distractors", () => {
  assert.equal(MARZIPAN_HORNS_CHALLENGE.options.length, 4);
  assert.deepEqual(correct(MARZIPAN_HORNS_CHALLENGE), ["horns"]);
  assert.match(MARZIPAN_HORNS_CHALLENGE.options.find(option => option.correct)!.source, /Rugelach/);
  assert.ok(MARZIPAN_HORNS_CHALLENGE.options.filter(option => !option.correct).every(option => /Invented/.test(option.source)));
});

test("short, labelled story; nothing before an answer gives it away", () => {
  const story = MARZIPAN_TASK.story.paragraphs;
  assert.ok(story.length <= 5); assert.ok(story.every(paragraph => LABELS.has(paragraph.label)));
  const beforeFirst = [...story.map(paragraph => paragraph.text), MARZIPAN_TASK.question, ...MARZIPAN_TASK.hints.map(hint => hint.text),
    MARZIPAN_MISSION.clue, MARZIPAN_MISSION.location.summary, ...MARZIPAN_MISSION.location.landmarks, MARZIPAN_TASK.prediction.question, MARZIPAN_TASK.prediction.invitation];
  for (const text of beforeFirst) assert.doesNotMatch(text, /\bwarm\b|oven|horn|crescent|curved/i, text);
  const second = MARZIPAN_TASK.followUps[0];
  for (const text of [second.question, ...second.lead.map(paragraph => paragraph.text)]) assert.doesNotMatch(text, /horn|róg/i, text);
  // The lead answers question 1; the follow-up's hint points at the shape without naming it.
  assert.match(second.lead[0].text, /still warm/);
  assert.ok(second.lead.every(paragraph => LABELS.has(paragraph.label)));
  // The final reveal: labelled claims plus one unlabelled instruction to look at the trays.
  const reveal = MARZIPAN_TASK.reveal.paragraphs;
  assert.ok(reveal.filter(paragraph => paragraph.label !== undefined).every(paragraph => LABELS.has(paragraph.label!)));
  assert.deepEqual(reveal.filter(paragraph => paragraph.label === undefined).map(paragraph => paragraph.text), ["Look at the trays: do you see any horns?"]);
  assert.match(reveal.map(paragraph => paragraph.text).join(" "), /crescent.*straight/);
});

test("the name's origin is one guide's story: an unscored guess labelled as a tradition, never an answer key", () => {
  const { prediction } = MARZIPAN_TASK;
  assert.equal(prediction.question, "Why is a bakery famous for chocolate rugelach called Marzipan?");
  assert.deepEqual(prediction.reveal.map(paragraph => paragraph.label), ["Attributed tradition"]);
  assert.match(prediction.invitation, /no score/);
  // No challenge in the mission asks about the name.
  for (const challenge of [MARZIPAN_CHALLENGE, MARZIPAN_HORNS_CHALLENGE, MARZIPAN_BONUS_CHALLENGE]) {
    assert.doesNotMatch(JSON.stringify(challenge.options.map(option => option.label)), /marzipan sweet|almond/i);
  }
});

test("bonus: flash-frozen and flown, in the bakery's own words; a business story, not today's stock", () => {
  assert.deepEqual(correct(MARZIPAN_BONUS_CHALLENGE), ["frozen-flown"]);
  assert.match(MARZIPAN_BONUS_CHALLENGE.options.find(option => option.correct)!.source, /bakery's own account/);
  assert.ok(MARZIPAN_BONUS.reveal.every(paragraph => LABELS.has(paragraph.label)));
  assert.match(MARZIPAN_BONUS.reveal.map(paragraph => paragraph.text).join(" "), /bakery's own words.*not a list of what New York shops sell/);
  assert.ok(MARZIPAN_MISSION.bonus.points > 0 && MARZIPAN_MISSION.bonus.points <= 20);
});

test("babka: an unscored conversation that claims nothing about Marzipan", () => {
  assert.ok(MARZIPAN_APPRECIATION.paragraphs.every(paragraph => LABELS.has(paragraph.label)));
  assert.equal(MARZIPAN_APPRECIATION.invitation, "Chocolate or cinnamon babka: which would you bring to a Shabbat dinner?");
  assert.doesNotMatch(JSON.stringify(MARZIPAN_APPRECIATION.paragraphs), /Marzipan/);
  assert.match(MARZIPAN_APPRECIATION.note, /Nothing is recorded or scored/);
});

test("sixth mission: two scored questions, three hints in all, provisional marker, GPS off, no photo yet", () => {
  assert.equal(SHUK_MISSIONS[5], MARZIPAN_MISSION); assert.equal(findMission(MARZIPAN), MARZIPAN_MISSION);
  const content = findChoiceTask(MARZIPAN)!;
  assert.equal(content.task, MARZIPAN_TASK); assert.deepEqual(content.followUps, [MARZIPAN_HORNS_CHALLENGE]);
  assert.equal(choiceStep(MARZIPAN_MISSION, 0)?.challenge, MARZIPAN_CHALLENGE);
  assert.equal(choiceStep(MARZIPAN_MISSION, 1)?.challenge, MARZIPAN_HORNS_CHALLENGE);
  assert.equal(choiceStep(MARZIPAN_MISSION, 2), null);
  assert.equal(MARZIPAN_MISSION.hintCount + MARZIPAN_MISSION.followUps[0].hintCount, MARZIPAN_MISSION.rewards.hintPenalties.length);
  assert.equal(MARZIPAN_MISSION.photo, null); assert.equal(MARZIPAN_MISSION.placement.verified, false);
  assert.equal(MARZIPAN_MISSION.arrival.destination, null);
  assert.equal(MARZIPAN_MISSION.rewards.foodTokens > 0, true);
  assert.equal(MARZIPAN_TASK.foodAction, "Explore Food Rewards");
});

test("a hint may name its step; a bad step is rejected", () => {
  assert.deepEqual(parseAction({ type: "hint", hint: 1, step: 1, missionId: MARZIPAN }), { type: "hint", hint: 1, step: 1, missionId: MARZIPAN });
  assert.equal(parseAction({ type: "hint", hint: 1, step: -1, missionId: MARZIPAN }), null);
  assert.equal(parseAction({ type: "hint", hint: 1, step: "1", missionId: MARZIPAN }), null);
});

async function fixture(run: (path: string, tokens: Record<string, string>, now: number) => Promise<void>) {
  await mkdir(".local", { recursive: true });
  const directory = await mkdtemp(join(process.cwd(), ".local", "shuk-marzipan-"));
  try {
    const path = join(directory, "state.json"), tokens: Record<string, string> = {};
    for (const id of ["player-1", "player-2", "player-3", "guide"]) tokens[id] = await redeemInvitation(path, await issueInvitation(path, id));
    await run(path, tokens, Date.now());
  } finally { await rm(directory, { recursive: true, force: true }); }
}

test("server: two questions in order, hints per question, one award at the end, then the bonus", () => fixture(async (path, tokens, now) => {
  const act = (id: string, action: Parameters<typeof sessionAction>[2], key: string, offset = 0) => sessionAction(path, tokens[id], action, key, now + offset);
  // player-1 navigates, player-2 submits, player-3 follows.
  await act("player-1", { missionId: MARZIPAN, type: "start" }, "marzipan-start-000001");
  await act("player-3", { missionId: MARZIPAN, type: "hint", hint: 1, step: 0 }, "marzipan-hint-q1-0001", 1);
  // A wrong answer keeps the group on question 1.
  await act("player-3", { missionId: MARZIPAN, type: "toggle-choice", optionId: "fully-cooled" }, "marzipan-pick-wrong-01", 2);
  assert.match(await act("player-2", { missionId: MARZIPAN, type: "submit" }, "marzipan-submit-wrong1", 3), /Not quite/);
  assert.equal(choiceSession(await sessionView(path, tokens["player-3"], now + 4, MARZIPAN)).step, 0);
  // A follower can pick but not submit.
  await act("player-3", { missionId: MARZIPAN, type: "reset" }, "marzipan-reset-000001", 5);
  await act("player-3", { missionId: MARZIPAN, type: "toggle-choice", optionId: "still-warm" }, "marzipan-pick-warm-001", 6);
  await assert.rejects(act("player-3", { missionId: MARZIPAN, type: "submit" }, "marzipan-follower-sub1", 7), /answer-submitter/);
  assert.match(await act("player-2", { missionId: MARZIPAN, type: "submit" }, "marzipan-submit-q1-001", 8), /next question/);

  const second = await sessionView(path, tokens["player-3"], now + 9, MARZIPAN);
  assert.equal(choiceSession(second).step, 1); assert.deepEqual(choiceSession(second).selected, []); assert.equal(second.session.completed, false);
  assert.equal(second.performance.reward, null); assert.equal(second.performance.hintsUsed, 1); assert.equal(second.performance.stepHintsUsed, 0);
  // A hint queued on question 1 and synced late changes nothing; question 2's own first hint counts once.
  assert.match(await act("player-3", { missionId: MARZIPAN, type: "hint", hint: 1, step: 0 }, "marzipan-hint-late-001", 10), /moved on/);
  await act("player-3", { missionId: MARZIPAN, type: "hint", hint: 1, step: 1 }, "marzipan-hint-q2-0001", 11);
  await act("player-1", { missionId: MARZIPAN, type: "hint", hint: 1, step: 1 }, "marzipan-hint-q2-0002", 12);
  await assert.rejects(act("player-3", { missionId: MARZIPAN, type: "hint", hint: 2, step: 1 }, "marzipan-hint-q2-0003", 13), /Invalid hint/);
  // Question 1's options don't exist on question 2.
  await assert.rejects(act("player-3", { missionId: MARZIPAN, type: "toggle-choice", optionId: "still-warm" }, "marzipan-stale-pick-01", 14), /Choose up to/);
  // The bonus waits for the whole mission.
  await assert.rejects(act("player-3", { missionId: MARZIPAN, type: "toggle-choice", optionId: "frozen-flown", part: "bonus" }, "marzipan-early-bonus01", 15), /after the main challenge/);
  await act("player-3", { missionId: MARZIPAN, type: "toggle-choice", optionId: "horns" }, "marzipan-pick-horns-01", 16);
  assert.match(await act("player-2", { missionId: MARZIPAN, type: "submit" }, "marzipan-submit-q2-001", 60_000), /Task complete/);
  // Under two minutes with two hints: 100 - 10 - 15.
  const done = await sessionView(path, tokens.guide, now + 60_001, MARZIPAN);
  assert.equal(done.session.completed, true);
  assert.deepEqual(done.performance.reward, { points: 75, foodTokens: 2, hintsUsed: 2 });
  assert.equal(done.sharedBalance.foodTokens, 2);

  // No second award: a repeat submit, a guide approval and a replayed action all leave the balance alone.
  assert.match(await act("player-2", { missionId: MARZIPAN, type: "submit" }, "marzipan-submit-again1", 60_002), /already complete/);
  assert.match(await act("guide", { missionId: MARZIPAN, type: "guide-approve" }, "marzipan-guide-approve", 60_003), /already complete/);
  assert.match(await act("player-2", { missionId: MARZIPAN, type: "submit" }, "marzipan-submit-q2-001", 60_004), /already synced/);
  const after = await sessionView(path, tokens.guide, now + 60_005, MARZIPAN);
  assert.deepEqual(after.performance.reward, done.performance.reward); assert.equal(after.sharedBalance.points, done.sharedBalance.points);

  // Bonus: wrong, then right; points once, no food tokens.
  await act("player-3", { missionId: MARZIPAN, type: "toggle-choice", optionId: "cargo-ships", part: "bonus" }, "marzipan-bonus-wrong01", 60_006);
  assert.match(await act("player-2", { missionId: MARZIPAN, type: "submit", part: "bonus" }, "marzipan-bonus-subm01", 60_007), /Not quite/);
  await act("player-3", { missionId: MARZIPAN, type: "reset", part: "bonus" }, "marzipan-bonus-reset1", 60_008);
  await act("player-3", { missionId: MARZIPAN, type: "toggle-choice", optionId: "frozen-flown", part: "bonus" }, "marzipan-bonus-right01", 60_009);
  assert.match(await act("player-2", { missionId: MARZIPAN, type: "submit", part: "bonus" }, "marzipan-bonus-subm02", 60_010), /Bonus complete/);
  assert.match(await act("player-2", { missionId: MARZIPAN, type: "submit", part: "bonus" }, "marzipan-bonus-subm03", 60_011), /already complete/);
  const final = await sessionView(path, tokens.guide, now + 60_012, MARZIPAN);
  assert.equal(final.sharedBalance.points, done.sharedBalance.points + MARZIPAN_MISSION.bonus.points);
  assert.equal(final.sharedBalance.foodTokens, 2);
}));

test("server: progress survives a reload from disk, and a record on a missing step is refused", () => fixture(async (path, tokens, now) => {
  const act = (id: string, action: Parameters<typeof sessionAction>[2], key: string, offset = 0) => sessionAction(path, tokens[id], action, key, now + offset);
  await act("player-1", { missionId: MARZIPAN, type: "start" }, "marzipan-start-reload1");
  await act("player-1", { missionId: MARZIPAN, type: "toggle-choice", optionId: "still-warm" }, "marzipan-pick-reload01", 1);
  await act("guide", { missionId: MARZIPAN, type: "submit" }, "marzipan-guide-submit1", 2);
  const disk = JSON.parse(await readFile(path, "utf8"));
  assert.equal(disk.missions[MARZIPAN].step, 1); assert.equal(disk.missions[MARZIPAN].stepHintsStart, 0);
  assert.equal(choiceSession(await sessionView(path, tokens["player-2"], now + 3, MARZIPAN)).step, 1);
  // Single-question missions keep their old shape: no step written.
  assert.equal("step" in disk.missions[SHUK_MISSIONS[0].id], false);
  await writeFile(path, JSON.stringify({ ...disk, missions: { ...disk.missions, [MARZIPAN]: { ...disk.missions[MARZIPAN], step: 5 } } }));
  await assert.rejects(sessionView(path, tokens["player-2"], now + 4, MARZIPAN), /Unsupported Shuk storage state/);
}));
