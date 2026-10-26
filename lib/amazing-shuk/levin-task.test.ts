import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { issueInvitation, redeemInvitation, sessionAction, sessionView } from "./participant-store.ts";
import { evaluateChoice } from "./choice-task.ts";
import { findChoiceTask } from "./choice-missions.ts";
import { findMission, SHUK_MISSIONS } from "./missions.ts";
import { LEVIN_BONUS, LEVIN_BONUS_CHALLENGE, LEVIN_CHALLENGE, LEVIN_MISSION, LEVIN_MISSION_ID, LEVIN_TASK } from "./levin-task.ts";

const LEVIN = LEVIN_MISSION_ID;
const LABELS = new Set(["Historical fact", "Interpretation", "Attributed tradition"]);

test("one pick from four; only sparing the rabbi is right, and the key names both sources", () => {
  assert.equal(LEVIN_CHALLENGE.required, 1); assert.equal(LEVIN_CHALLENGE.answerKeyVerified, true);
  assert.deepEqual(LEVIN_CHALLENGE.options.filter(option => option.correct).map(option => option.id), ["spare-rabbi"]);
  assert.match(LEVIN_CHALLENGE.options[1].source, /Hebrew Wikipedia/); assert.match(LEVIN_CHALLENGE.options[1].source, /Begin/);
  assert.equal(evaluateChoice(LEVIN_CHALLENGE, ["spare-rabbi"]), "accepted");
  for (const wrong of ["guard-warned", "pardon-hope", "families-asked"]) assert.equal(evaluateChoice(LEVIN_CHALLENGE, [wrong]), "incorrect");
});

test("told respectfully: labelled statements, no hints, a quiet completion title, and the story keeps the answer back", () => {
  const story = LEVIN_TASK.story.paragraphs;
  assert.ok(story.length <= 5); assert.ok(story.every(paragraph => paragraph.label === "Historical fact"));
  for (const text of [...story.map(paragraph => paragraph.text), LEVIN_TASK.question, LEVIN_MISSION.clue, ...LEVIN_MISSION.location.landmarks]) {
    assert.doesNotMatch(text, /spare|risk his life|wouldn't hurt|would not hurt/i, text);
  }
  assert.ok(LEVIN_TASK.reveal.paragraphs.every(paragraph => LABELS.has(paragraph.label)));
  // The romanticised embrace is a tradition, and the disagreement over which rabbi is stated, not settled.
  assert.equal(LEVIN_TASK.reveal.paragraphs.find(paragraph => /embraced/.test(paragraph.text))?.label, "Attributed tradition");
  assert.match(LEVIN_TASK.reveal.paragraphs.map(paragraph => paragraph.text).join(" "), /Sources differ.*Goldman/);
  assert.equal(LEVIN_TASK.hints.length, 0); assert.equal(LEVIN_MISSION.hintCount, 0);
  assert.equal(LEVIN_TASK.completionTitle, "Answer received");
  assert.doesNotMatch(JSON.stringify([LEVIN_TASK, LEVIN_BONUS]), /terroris|hero|martyr|completed!|congratulations|well done/i);
});

test("bonus: the Kramer-Rechtman plaque names Rachel", () => {
  assert.deepEqual(LEVIN_BONUS_CHALLENGE.options.filter(option => option.correct).map(option => option.label), ["Rachel"]);
  assert.match(LEVIN_BONUS_CHALLENGE.options.find(option => option.correct)!.source, /Kramer-Rechtman House plaque/);
  assert.match(LEVIN_BONUS.intro, /HaCarmel Street/);
  assert.ok(LEVIN_BONUS.reveal.every(paragraph => LABELS.has(paragraph.label)));
});

test("fifth mission: untimed, provisional marker, GPS off, the mural as its photo", () => {
  assert.equal(SHUK_MISSIONS[4], LEVIN_MISSION); assert.equal(findMission(LEVIN), LEVIN_MISSION);
  assert.equal(findChoiceTask(LEVIN)?.task, LEVIN_TASK);
  assert.equal(LEVIN_MISSION.timed, false); assert.equal(LEVIN_MISSION.photo?.src, "/shuk/levin-mural.jpg");
  assert.equal(LEVIN_MISSION.placement.verified, false); assert.equal(LEVIN_MISSION.arrival.destination.verified, false);
});

async function fixture(run: (path: string, tokens: Record<string, string>, now: number) => Promise<void>) {
  await mkdir(".local", { recursive: true });
  const directory = await mkdtemp(join(process.cwd(), ".local", "shuk-levin-"));
  try {
    const path = join(directory, "state.json"), tokens: Record<string, string> = {};
    for (const id of ["player-1", "player-2", "player-3", "guide"]) tokens[id] = await redeemInvitation(path, await issueInvitation(path, id));
    await run(path, tokens, Date.now());
  } finally { await rm(directory, { recursive: true, force: true }); }
}

test("server: no clock runs, so a slow answer still earns the full points, and hints are refused", () => fixture(async (path, tokens, now) => {
  const act = (id: string, action: Parameters<typeof sessionAction>[2], key: string, offset: number) => sessionAction(path, tokens[id], action, key, now + offset);
  await act("player-1", { missionId: LEVIN, type: "start" }, "levin-navigator-start-1", 0);
  const started = JSON.parse(await readFile(path, "utf8"));
  assert.equal(started.missions[LEVIN].performance.excluded, true);
  await assert.rejects(act("player-3", { missionId: LEVIN, type: "hint", hint: 1 }, "levin-follower-hint-001", 1), /Invalid hint/);
  await act("player-3", { missionId: LEVIN, type: "toggle-choice", optionId: "spare-rabbi" }, "levin-follower-pick-001", 2);
  // Twenty minutes of talking it over: well past every timed threshold.
  assert.match(await act("player-2", { missionId: LEVIN, type: "submit" }, "levin-submitter-submit1", 1_200_000), /correct/);
  const done = await sessionView(path, tokens.guide, now + 1_200_001, LEVIN);
  assert.equal(done.session.completed, true);
  assert.deepEqual(done.performance.reward, { points: LEVIN_MISSION.rewards.maxPoints, foodTokens: LEVIN_MISSION.rewards.foodTokens, hintsUsed: 0 });
  assert.equal(done.guideTiming?.excluded, true);
}));

test("a timed mission still measures time: the mural's start is not excluded", () => fixture(async (path, tokens, now) => {
  const mural = SHUK_MISSIONS[0].id;
  await sessionAction(path, tokens["player-1"], { missionId: mural, type: "start" }, "mural-navigator-start-1", now);
  const disk = JSON.parse(await readFile(path, "utf8"));
  assert.equal(disk.missions[mural].performance.excluded, false);
}));

test("the challenge story shows the owner's mural of Rabbi Levin (identified by the owner, 26 Oct 2026)", () => {
  const image = LEVIN_TASK.story.image;
  assert.equal(image.src, "/shuk/levin-mural.jpg"); assert.ok(image.alt && image.caption);
  assert.match(image.alt, /Rabbi Aryeh Levin/); assert.match(image.caption, /Rabbi Aryeh Levin/);
});
