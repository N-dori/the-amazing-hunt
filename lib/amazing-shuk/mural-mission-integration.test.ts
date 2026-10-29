import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { issueInvitation, redeemInvitation, sessionAction, sessionView } from "./participant-store.ts";
import { handleParticipantRequest } from "./participant-http.ts";
import { MURAL_CHALLENGE, MURAL_MISSION_ID } from "./mural-task.ts";
import { SYNAGOGUE_MISSION_ID } from "./synagogue-task.ts";
import { MONTEFIORE_MISSION_ID } from "./montefiore-task.ts";
import { LEVIN_MISSION_ID } from "./levin-task.ts";
import { MARZIPAN_MISSION_ID } from "./marzipan-task.ts";
import { GAN_HATUT_MISSION } from "./mission-arrival.ts";
import { WATER_PUZZLE_REVISION } from "./water-measurement.ts";
import { storedTeam } from "./legacy-store-fixture.ts";
import type { ChoiceChallenge } from "./choice-task.ts";
const MURAL = MURAL_MISSION_ID, WELL = GAN_HATUT_MISSION.id;
const unverified: ChoiceChallenge = { ...MURAL_CHALLENGE, answerKeyVerified: false };
const env = { NODE_ENV: "development", SHUK_DEV_SIMULATION: "1" } as const;
async function fixture(run: (path: string, tokens: Record<string, string>, now: number) => Promise<void>) {
  await mkdir(".local", { recursive: true });
  const directory = await mkdtemp(join(process.cwd(), ".local", "shuk-mural-"));
  try {
    const path = join(directory, "state.json"), tokens: Record<string, string> = {};
    for (const id of ["player-1", "player-2", "player-3", "guide"]) tokens[id] = await redeemInvitation(path, await issueInvitation(path, id));
    await run(path, tokens, Date.now());
  } finally { await rm(directory, { recursive: true, force: true }); }
}

test("the mural keeps its own shared picks, separate from the well", () => fixture(async (path, tokens, now) => {
  const view = await sessionView(path, tokens["player-3"], now, MURAL);
  assert.equal(view.session.kind, "choice");
  assert.deepEqual("selected" in view.session ? view.session.selected : null, []);
  await assert.rejects(sessionAction(path, tokens["player-3"], { missionId: MURAL, type: "toggle-choice", optionId: "plaque" }, "mural-before-start-01", now));
  await assert.rejects(sessionAction(path, tokens["player-3"], { missionId: MURAL, type: "start" }, "mural-follower-start-1", now));
  await sessionAction(path, tokens["player-1"], { missionId: MURAL, type: "start" }, "mural-navigator-start-1", now);
  // Any participant may change the shared picks; a third pick is refused.
  await sessionAction(path, tokens["player-3"], { missionId: MURAL, type: "toggle-choice", optionId: "plaque" }, "mural-follower-pick-001", now + 1);
  await sessionAction(path, tokens["player-1"], { missionId: MURAL, type: "toggle-choice", optionId: "cardboard-boxes" }, "mural-navigator-pick-01", now + 2);
  await assert.rejects(sessionAction(path, tokens["player-1"], { missionId: MURAL, type: "toggle-choice", optionId: "air-vents" }, "mural-third-pick-0001", now + 3));
  await assert.rejects(sessionAction(path, tokens["player-1"], { missionId: MURAL, type: "move", move: "fill-large" }, "mural-water-move-0001", now + 3));
  await assert.rejects(sessionAction(path, tokens["player-1"], { missionId: WELL, type: "toggle-choice", optionId: "plaque" }, "well-choice-pick-0001", now + 3));
  const shared = await sessionView(path, tokens["player-2"], now + 4, MURAL);
  assert.deepEqual("selected" in shared.session ? shared.session.selected : null, ["plaque", "cardboard-boxes"]);
  const well = await sessionView(path, tokens["player-2"], now + 4, WELL);
  assert.equal(well.session.kind, "water");
  assert.deepEqual("cups" in well.session ? well.session.cups : null, { small: 0, large: 0, jar: 0 });
  assert.equal(well.performance.started, false);
  await sessionAction(path, tokens["player-3"], { missionId: MURAL, type: "reset" }, "mural-clear-picks-0001", now + 5);
  const cleared = await sessionView(path, tokens["player-2"], now + 5, MURAL);
  assert.deepEqual("selected" in cleared.session ? cleared.session.selected : null, []);
}));

test("only the submitter or guide submits; an unverified key scores nothing", () => fixture(async (path, tokens, now) => {
  const act = (id: string, action: Parameters<typeof sessionAction>[2], key: string, offset: number) => sessionAction(path, tokens[id], action, key, now + offset, undefined, undefined, unverified);
  await act("player-1", { missionId: MURAL, type: "start" }, "mural-start-unverified", 0);
  for (const [index, optionId] of ["air-vents", "plaque"].entries()) {
    await act("player-3", { missionId: MURAL, type: "toggle-choice", optionId }, `mural-unverified-pick-${index}`, 1);
  }
  await assert.rejects(act("player-1", { missionId: MURAL, type: "submit" }, "mural-navigator-submit", 2), { status: 403 });
  const message = await act("player-2", { missionId: MURAL, type: "submit" }, "mural-unverified-submit", 2);
  assert.match(message, /field check/);
  const view = await sessionView(path, tokens["player-2"], now + 3, MURAL);
  assert.equal(view.session.completed, false); assert.equal(view.performance.reward, null);
  assert.deepEqual(view.sharedBalance, { points: 0, foodTokens: 0, status: "Provisional local-development rewards" });
}));

test("the field-checked key: wrong picks don't complete; the right pair completes once with hints counted", () => fixture(async (path, tokens, now) => {
  const act = (id: string, action: Parameters<typeof sessionAction>[2], key: string, offset: number) => sessionAction(path, tokens[id], action, key, now + offset);
  await act("player-2", { missionId: MURAL, type: "start" }, "verified-mural-start-1", 0);
  await act("player-3", { missionId: MURAL, type: "hint", hint: 1 }, "verified-mural-hint-01", 1);
  await assert.rejects(act("player-3", { missionId: MURAL, type: "hint", hint: 4 }, "verified-mural-hint-04", 1));
  await act("player-3", { missionId: MURAL, type: "toggle-choice", optionId: "air-vents" }, "verified-pick-vents-01", 2);
  await act("player-3", { missionId: MURAL, type: "toggle-choice", optionId: "tile-103" }, "verified-pick-tile-001", 3);
  assert.match(await act("player-2", { missionId: MURAL, type: "submit" }, "verified-wrong-submit1", 4), /Not quite/);
  assert.equal((await sessionView(path, tokens.guide, now + 5, MURAL)).session.completed, false);
  await act("player-3", { missionId: MURAL, type: "toggle-choice", optionId: "tile-103" }, "verified-unpick-tile01", 6);
  await act("player-3", { missionId: MURAL, type: "toggle-choice", optionId: "music-sign" }, "verified-pick-sign-001", 7);
  assert.match(await act("player-2", { missionId: MURAL, type: "submit" }, "verified-right-submit1", 60_000), /correct/);
  const done = await sessionView(path, tokens["player-1"], now + 70_000, MURAL);
  assert.equal(done.session.completed, true); assert.equal(done.mission.state, "completed");
  assert.deepEqual(done.performance.reward, { points: 90, foodTokens: 2, hintsUsed: 1 });
  await act("player-2", { missionId: MURAL, type: "submit" }, "verified-repeat-submit", 80_000);
  await act("guide", { missionId: MURAL, type: "guide-approve" }, "verified-guide-approve", 80_000);
  await assert.rejects(act("player-3", { missionId: MURAL, type: "reset" }, "verified-reset-after-1", 80_000));
  await assert.rejects(act("player-3", { missionId: MURAL, type: "toggle-choice", optionId: "plaque" }, "verified-pick-after-01", 80_000));
  const disk = storedTeam(JSON.parse(await readFile(path, "utf8")));
  assert.equal(disk.missions[MURAL].performance.award.points, 90);
  assert.equal(disk.missions[WELL].kind, "water"); assert.equal(disk.missions[WELL].completed, false);
  assert.deepEqual((await sessionView(path, tokens["player-1"], now + 90_000, WELL)).sharedBalance, done.sharedBalance);
  assert.deepEqual(done.sharedBalance, { points: 90, foodTokens: 2, status: "Provisional local-development rewards" });
}));

test("browsers send toggle-choice over HTTP with the mission ID; the GET returns the mural's picks", () => fixture(async (path, tokens) => {
  const headers = { host: "127.0.0.1:3000", origin: "http://127.0.0.1:3000", "content-type": "application/json", cookie: `shuk_session=${tokens["player-1"]}` };
  const post = (body: object) => handleParticipantRequest(new Request("http://127.0.0.1:3000/api", { method: "POST", headers,
    body: JSON.stringify({ expectedParticipantId: "player-1", puzzleRevision: WATER_PUZZLE_REVISION, ...body }) }), path, env);
  assert.equal((await post({ type: "start", missionId: MURAL, actionId: "http-mural-start-0001" })).status, 200);
  assert.equal((await post({ type: "toggle-choice", optionId: "plaque", actionId: "http-mural-no-mission" })).status, 400);
  const picked = await post({ type: "toggle-choice", optionId: "plaque", missionId: MURAL, actionId: "http-mural-pick-00001" });
  assert.equal(picked.status, 200);
  assert.deepEqual((await picked.json()).session.selected, ["plaque"]);
  const read = await handleParticipantRequest(new Request(`http://127.0.0.1:3000/api?mission=${MURAL}`, { headers }), path, env);
  const body = await read.json();
  assert.equal(body.mission.id, MURAL); assert.deepEqual(body.session.selected, ["plaque"]);
  assert.deepEqual(body.missions.map((mission: { id: string }) => mission.id), [MURAL, MONTEFIORE_MISSION_ID, WELL, SYNAGOGUE_MISSION_ID, LEVIN_MISSION_ID, MARZIPAN_MISSION_ID]);
}));

test("We're Here? uses the mural's confirmed corner: near earns the bonus once, far never blocks play", () => fixture(async (path, tokens, now) => {
  const reading = (latitude: number) => ({ type: "arrival", missionId: MURAL, reading: { latitude, longitude: 35.2087861, accuracy: 20, timestamp: now } }) as const;
  // About 220 m north of the corner: friendly refusal, no bonus, and the challenge still starts.
  await assert.rejects(sessionAction(path, tokens["player-1"], reading(31.7877892), "mural-far-arrival-0001", now));
  await sessionAction(path, tokens["player-1"], { missionId: MURAL, type: "start" }, "mural-start-before-gps", now);
  await sessionAction(path, tokens["player-1"], reading(31.7858892), "mural-near-arrival-001", now);
  await sessionAction(path, tokens["player-2"], reading(31.7857892), "mural-second-arrival-1", now);
  const view = await sessionView(path, tokens["player-3"], now, MURAL);
  assert.equal(view.mission.gpsEnabled, true); assert.equal(view.mission.arrivalPoints, 20); assert.equal(view.mission.arrivalMethod, "gps");
  assert.equal((await sessionView(path, tokens["player-3"], now, WELL)).mission.arrivalPoints, 0);
  assert.doesNotMatch(await readFile(path, "utf8"), /latitude|longitude|accuracy/);
}));
