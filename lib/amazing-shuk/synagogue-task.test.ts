import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { issueInvitation, redeemInvitation, sessionAction, sessionView } from "./participant-store.ts";
import { evaluateChoice, toggleChoice } from "./choice-task.ts";
import { findChoiceTask } from "./choice-missions.ts";
import { findMission, SHUK_MISSIONS } from "./missions.ts";
import { MURAL_MISSION_ID } from "./mural-task.ts";
import { SYNAGOGUE_APPRECIATION, SYNAGOGUE_BONUS, SYNAGOGUE_BONUS_CHALLENGE, SYNAGOGUE_CHALLENGE, SYNAGOGUE_MISSION, SYNAGOGUE_MISSION_ID, SYNAGOGUE_TASK } from "./synagogue-task.ts";
import { parseAction } from "./parse-water-action.ts";

const SYN = SYNAGOGUE_MISSION_ID;
// Anything that names the answer. The story, preview and location details must not.
const SPOILER = /tavern|pub\b|bar\b|drink|alcohol|wine|arak|מרזח|מסבאה/i;

test("one pick from the owner's four options; only the tavern is right, and the key is backed by the sign and the archive", () => {
  assert.deepEqual(SYNAGOGUE_CHALLENGE.options.map(option => option.label), ["A bakery", "A tavern (pub)", "A school", "A tailor's workshop"]);
  assert.equal(SYNAGOGUE_CHALLENGE.required, 1); assert.equal(SYNAGOGUE_CHALLENGE.answerKeyVerified, true);
  assert.deepEqual(SYNAGOGUE_CHALLENGE.options.filter(option => option.correct).map(option => option.id), ["tavern"]);
  assert.match(SYNAGOGUE_CHALLENGE.options[1].source, /Heritage sign/); assert.match(SYNAGOGUE_CHALLENGE.options[1].source, /Ben-Zvi/);
  assert.equal(evaluateChoice(SYNAGOGUE_CHALLENGE, ["tavern"]), "accepted");
  for (const wrong of ["bakery", "school", "tailor"]) assert.equal(evaluateChoice(SYNAGOGUE_CHALLENGE, [wrong]), "incorrect");
  assert.equal(evaluateChoice(SYNAGOGUE_CHALLENGE, []), "incomplete");
  // A second pick is refused until the first is taken back: changing your mind is untick, then tick.
  assert.equal(toggleChoice(SYNAGOGUE_CHALLENGE, ["bakery"], "tavern"), null);
  assert.deepEqual(toggleChoice(SYNAGOGUE_CHALLENGE, toggleChoice(SYNAGOGUE_CHALLENGE, ["bakery"], "bakery")!, "tavern"), ["tavern"]);
});

test("the story is short and labelled, and nothing before the answer names the pub", () => {
  const story = SYNAGOGUE_TASK.story.paragraphs;
  assert.ok(story.length <= 5); assert.ok(story.every(paragraph => paragraph.label === "Historical fact"));
  assert.ok(story.map(paragraph => paragraph.text).join(" ").split(/\s+/).length <= 60);
  const beforeAnswer = [...story.map(paragraph => paragraph.text), SYNAGOGUE_TASK.question, SYNAGOGUE_TASK.instruction, SYNAGOGUE_MISSION.name,
    SYNAGOGUE_MISSION.clue, SYNAGOGUE_MISSION.location.summary, ...SYNAGOGUE_MISSION.location.landmarks, SYNAGOGUE_MISSION.photo.alt, SYNAGOGUE_MISSION.photo.src];
  for (const text of beforeAnswer) assert.doesNotMatch(text, SPOILER, text);
  assert.doesNotMatch(SYNAGOGUE_TASK.question, SPOILER);
  // The reveal sends the group to the real sign and names who made the change.
  const reveal = SYNAGOGUE_TASK.reveal.paragraphs.map(paragraph => paragraph.text).join(" ");
  assert.match(reveal, /blue heritage sign/); assert.match(reveal, /Yitzhak Armoza/); assert.match(reveal, /pub/);
  assert.ok(SYNAGOGUE_TASK.reveal.paragraphs.filter(paragraph => "label" in paragraph).every(paragraph => paragraph.label === "Historical fact"));
});

test("third mission on the map: provisional marker, GPS off until the point is field-checked, content found by ID", () => {
  assert.equal(SHUK_MISSIONS[3], SYNAGOGUE_MISSION); assert.equal(findMission(SYN), SYNAGOGUE_MISSION);
  assert.equal(findChoiceTask(SYN)?.challenge, SYNAGOGUE_CHALLENGE); assert.equal(findChoiceTask("unknown"), null);
  assert.equal(SYNAGOGUE_MISSION.placement.verified, false); assert.equal(SYNAGOGUE_MISSION.arrival.destination.verified, false);
  assert.equal(SYNAGOGUE_MISSION.location.hebrewName, "בית הכנסת חסד ורחמים");
  assert.equal(SYNAGOGUE_MISSION.hintCount, 2);
});

async function fixture(run: (path: string, tokens: Record<string, string>, now: number) => Promise<void>) {
  await mkdir(".local", { recursive: true });
  const directory = await mkdtemp(join(process.cwd(), ".local", "shuk-synagogue-"));
  try {
    const path = join(directory, "state.json"), tokens: Record<string, string> = {};
    for (const id of ["player-1", "player-2", "player-3", "guide"]) tokens[id] = await redeemInvitation(path, await issueInvitation(path, id));
    await run(path, tokens, Date.now());
  } finally { await rm(directory, { recursive: true, force: true }); }
}

test("server: a wrong guess can be revised; the tavern completes the mission once, with its own progress and rewards", () => fixture(async (path, tokens, now) => {
  const act = (id: string, action: Parameters<typeof sessionAction>[2], key: string, offset: number) => sessionAction(path, tokens[id], action, key, now + offset);
  const fresh = await sessionView(path, tokens["player-3"], now, SYN);
  assert.equal(fresh.session.kind, "choice"); assert.equal(fresh.mission.gpsEnabled, false);
  await act("player-1", { missionId: SYN, type: "start" }, "syn-navigator-start-01", 0);
  await act("player-3", { missionId: SYN, type: "hint", hint: 1 }, "syn-follower-hint-0001", 1);
  await assert.rejects(act("player-3", { missionId: SYN, type: "hint", hint: 3 }, "syn-hint-past-the-end", 1));
  await act("player-3", { missionId: SYN, type: "toggle-choice", optionId: "bakery" }, "syn-follower-pick-0001", 2);
  await assert.rejects(act("player-3", { missionId: SYN, type: "toggle-choice", optionId: "tavern" }, "syn-second-pick-00001", 3));
  // Followers pick together but can't submit; the answer-submitter can.
  await assert.rejects(act("player-3", { missionId: SYN, type: "submit" }, "syn-follower-submit-01", 4), { status: 403 });
  assert.match(await act("player-2", { missionId: SYN, type: "submit" }, "syn-wrong-submit-0001", 5), /Not quite/);
  const wrong = await sessionView(path, tokens.guide, now + 6, SYN);
  assert.equal(wrong.session.completed, false); assert.equal(wrong.performance.reward, null);
  assert.deepEqual("selected" in wrong.session ? wrong.session.selected : null, ["bakery"]);
  await act("player-3", { missionId: SYN, type: "toggle-choice", optionId: "bakery" }, "syn-unpick-bakery-001", 7);
  await act("player-3", { missionId: SYN, type: "toggle-choice", optionId: "tavern" }, "syn-pick-tavern-00001", 8);
  assert.match(await act("player-2", { missionId: SYN, type: "submit" }, "syn-right-submit-0001", 60_000), /correct/);
  const done = await sessionView(path, tokens["player-1"], now + 70_000, SYN);
  assert.equal(done.session.completed, true); assert.equal(done.mission.state, "completed");
  assert.deepEqual(done.performance.reward, { points: 90, foodTokens: 2, hintsUsed: 1 });
  // Repeats and guide approval don't pay twice.
  await act("player-2", { missionId: SYN, type: "submit" }, "syn-repeat-submit-001", 80_000);
  await act("guide", { missionId: SYN, type: "guide-approve" }, "syn-guide-approve-001", 80_000);
  await assert.rejects(act("player-3", { missionId: SYN, type: "toggle-choice", optionId: "tavern" }, "syn-pick-after-done-1", 80_000));
  const after = await sessionView(path, tokens["player-3"], now + 90_000, SYN);
  assert.deepEqual(after.sharedBalance, { points: 90, foodTokens: 2, status: "Provisional local-development rewards" });
  // The mural is untouched.
  const mural = await sessionView(path, tokens["player-3"], now + 90_000, MURAL_MISSION_ID);
  assert.equal(mural.session.completed, false); assert.equal(mural.performance.started, false);
  const disk = JSON.parse(await readFile(path, "utf8"));
  assert.equal(disk.missions[SYN].kind, "choice"); assert.equal(disk.missions[SYN].performance.award.points, 90);
}));

test("bonus content: the literary Luna, four options, one right, and a reveal that calls the novel fiction without inventing history", () => {
  assert.equal(SYNAGOGUE_BONUS.question, "What was Luna Armoza known as in the famous novel about a Jerusalem family?");
  assert.equal(SYNAGOGUE_BONUS_CHALLENGE.required, 1); assert.equal(SYNAGOGUE_BONUS_CHALLENGE.options.length, 4);
  assert.deepEqual(SYNAGOGUE_BONUS_CHALLENGE.options.filter(option => option.correct).map(option => option.label), ["The Beauty Queen of Jerusalem"]);
  const reveal = SYNAGOGUE_BONUS.reveal.map(paragraph => paragraph.text).join(" ");
  assert.match(reveal, /historical fiction/); assert.match(reveal, /Sarit Yishai-Levi/); assert.match(reveal, /invented/);
  // No unsupported claims: no 1948 title, no real beauty contest, no family relationship for Luna.
  const everything = JSON.stringify([SYNAGOGUE_BONUS, SYNAGOGUE_APPRECIATION, SYNAGOGUE_TASK]);
  assert.doesNotMatch(everything, /1948|contest|crowned|mother of|his mother|Luna's mother|daughter-in-law/i);
  assert.ok(SYNAGOGUE_MISSION.bonus.points > 0 && SYNAGOGUE_MISSION.bonus.points <= 20);
  assert.equal(SYNAGOGUE_APPRECIATION.invitation, "Think of someone who deserves appreciation today. What is one thing you'd like to thank them for?");
});

test("only toggle, reset and submit may aim at the bonus", () => {
  assert.deepEqual(parseAction({ type: "toggle-choice", optionId: "beauty-queen", missionId: SYN, part: "bonus" }), { type: "toggle-choice", optionId: "beauty-queen", missionId: SYN, part: "bonus" });
  assert.deepEqual(parseAction({ type: "submit", missionId: SYN, part: "bonus" }), { type: "submit", missionId: SYN, part: "bonus" });
  assert.deepEqual(parseAction({ type: "reset", missionId: SYN, part: "bonus" }), { type: "reset", missionId: SYN, part: "bonus" });
  for (const type of ["start", "hint", "guide-approve", "timing", "move"]) assert.equal(parseAction({ type, hint: 1, operation: "pause", move: "fill-large", missionId: SYN, part: "bonus" }), null);
  assert.equal(parseAction({ type: "submit", missionId: SYN, part: "main" }), null);
  assert.equal(parseAction({ type: "submit", part: "bonus" }), null);
});

test("server: the bonus opens after the main answer, allows retries, adds its points once and never food tokens", () => fixture(async (path, tokens, now) => {
  const act = (id: string, action: Parameters<typeof sessionAction>[2], key: string, offset: number) => sessionAction(path, tokens[id], action, key, now + offset);
  const bonus = (type: "toggle-choice" | "submit" | "reset", optionId = "") => ({ type, missionId: SYN, part: "bonus", ...(optionId ? { optionId } : {}) }) as Parameters<typeof sessionAction>[2];
  await act("player-1", { missionId: SYN, type: "start" }, "bonus-main-start-0001", 0);
  await assert.rejects(act("player-3", bonus("toggle-choice", "beauty-queen"), "bonus-too-early-00001", 1), /after the main challenge/);
  await act("player-3", { missionId: SYN, type: "toggle-choice", optionId: "tavern" }, "bonus-main-pick-00001", 2);
  await act("player-2", { missionId: SYN, type: "submit" }, "bonus-main-submit-001", 60_000);
  const main = await sessionView(path, tokens["player-3"], now + 60_001, SYN);
  assert.deepEqual(main.sharedBalance, { points: 100, foodTokens: 2, status: "Provisional local-development rewards" });
  assert.deepEqual("bonus" in main.session ? main.session.bonus : null, { selected: [], completed: false, points: 0 });
  await act("player-3", bonus("toggle-choice", "pearl-mahane-yehuda"), "bonus-wrong-pick-0001", 60_002);
  await assert.rejects(act("player-3", bonus("submit"), "bonus-follower-submit", 60_003), { status: 403 });
  assert.match(await act("player-2", bonus("submit"), "bonus-wrong-submit-01", 60_004), /Not quite/);
  await act("player-3", bonus("reset"), "bonus-clear-picks-001", 60_005);
  await act("player-3", bonus("toggle-choice", "beauty-queen"), "bonus-right-pick-0001", 60_006);
  assert.match(await act("player-2", bonus("submit"), "bonus-right-submit-01", 60_007), /Bonus complete/);
  assert.match(await act("player-2", bonus("submit"), "bonus-repeat-submit-1", 60_008), /already complete/);
  await assert.rejects(act("player-3", bonus("toggle-choice", "beauty-queen"), "bonus-pick-after-0001", 60_009));
  const done = await sessionView(path, tokens.guide, now + 60_010, SYN);
  assert.deepEqual("bonus" in done.session ? done.session.bonus : null, { selected: ["beauty-queen"], completed: true, points: SYNAGOGUE_MISSION.bonus.points });
  assert.deepEqual(done.sharedBalance, { points: 100 + SYNAGOGUE_MISSION.bonus.points, foodTokens: 2, status: "Provisional local-development rewards" });
  assert.deepEqual(done.performance.reward, main.performance.reward);
  // A mission without a bonus refuses bonus actions.
  await assert.rejects(act("player-3", { type: "reset", missionId: MURAL_MISSION_ID, part: "bonus" }, "bonus-on-the-mural-01", 60_011), /no bonus/);
}));

test("an existing synagogue record from before the bonus keeps its progress and gains an empty bonus", () => fixture(async (path, tokens, now) => {
  await sessionAction(path, tokens["player-1"], { missionId: SYN, type: "start" }, "legacy-bonus-start-01", now);
  const db = JSON.parse(await readFile(path, "utf8"));
  const { bonus: _dropped, ...withoutBonus } = db.missions[SYN];
  void _dropped;
  await writeFile(path, JSON.stringify({ ...db, missions: { ...db.missions, [SYN]: withoutBonus } }));
  const view = await sessionView(path, tokens["player-3"], now + 1, SYN);
  assert.equal(view.performance.started, true);
  assert.deepEqual("bonus" in view.session ? view.session.bonus : null, { selected: [], completed: false, points: 0 });
}));
