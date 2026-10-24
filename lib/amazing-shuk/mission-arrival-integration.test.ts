import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";
import { execFile } from "node:child_process";
import { sessionAction, sessionView, issueInvitation, redeemInvitation } from "./participant-store.ts";
import { GAN_HATUT_MISSION, type ArrivalPolicy } from "./mission-arrival.ts";
import { handleParticipantRequest } from "./participant-http.ts";
import { WATER_PUZZLE_REVISION } from "./water-measurement.ts";
const verified: ArrivalPolicy = { ...GAN_HATUT_MISSION.arrival, destination: { latitude: 0, longitude: 0, verified: true } };
async function fixture(run: (path: string, tokens: Record<string, string>, now: number) => Promise<void>) {
  await mkdir(".local", { recursive: true });
  const directory = await mkdtemp(join(process.cwd(), ".local", "shuk-arrival-"));
  try {
    const path = join(directory, "state.json"), tokens: Record<string, string> = {};
    for (const id of ["player-1", "player-2", "guide"]) tokens[id] = await redeemInvitation(path, await issueInvitation(path, id));
    await run(path, tokens, Date.now());
  } finally { await rm(directory, { recursive: true, force: true }); }
}
const gps = (timestamp: number, latitude = 0, accuracy = 20) => ({ type: "arrival", missionId: GAN_HATUT_MISSION.id, reading: { latitude, longitude: 0, accuracy, timestamp } }) as const;
const guideArrival = { type: "confirm-arrival", missionId: GAN_HATUT_MISSION.id } as const;

test("no GPS, failed checks and no bonus never prevent start, solve or official rewards", () => fixture(async (path, tokens, now) => {
  assert.equal((await sessionView(path, tokens["player-1"], now)).mission.state, "available");
  for (const [i, action] of [gps(now, .01), gps(now - 60_001), gps(now, 0, 500)].entries()) {
    await assert.rejects(sessionAction(path, tokens["player-1"], action, `failed-optional-check-${i}`, now, undefined, verified));
    assert.equal((await sessionView(path, tokens["player-2"], now)).performance.canStart, true);
  }
  await sessionAction(path, tokens["player-1"], { type: "start" }, "start-without-arrival-001", now);
  await sessionAction(path, tokens["player-2"], { type: "move", move: "fill-large" }, "fill-without-arrival-001", now + 1);
  await sessionAction(path, tokens["player-2"], { type: "move", move: "pour-large-into-jar" }, "solve-without-arrival-001", now + 2);
  await sessionAction(path, tokens["player-2"], { type: "submit" }, "submit-without-arrival-001", now + 3);
  const view = await sessionView(path, tokens["player-1"], now + 4);
  assert.equal(view.mission.state, "completed");
  assert.deepEqual(view.sharedBalance, { points: 100, foodTokens: 2, status: "Provisional local-development rewards" });
  assert.equal(view.mission.arrivalPoints, 0);
  // The optional bonus can still be confirmed after challenge completion, independently.
  await sessionAction(path, tokens.guide, guideArrival, "arrival-after-solution-001", now + 5);
  assert.equal((await sessionView(path, tokens["player-2"], now + 6)).sharedBalance.points, 120);
}));

test("fresh mocked GPS awards once across sessions, retries, guide override and restart without storing coordinates", () => fixture(async (path, tokens, now) => {
  await sessionAction(path, tokens["player-1"], gps(now), "gps-first-arrival-001", now, undefined, verified);
  const first = await sessionView(path, tokens["player-1"], now);
  assert.equal(first.mission.state, "arrived"); assert.equal(first.mission.arrivalPoints, 20);
  assert.deepEqual(first.sharedBalance, { points: 20, foodTokens: 0, status: "Provisional local-development rewards" });
  await sessionAction(path, tokens["player-1"], gps(now), "gps-first-arrival-001", now, undefined, verified);
  await sessionAction(path, tokens["player-2"], gps(now), "gps-second-arrival-001", now, undefined, verified);
  await sessionAction(path, tokens.guide, guideArrival, "guide-after-gps-arrival", now);
  await assert.rejects(sessionAction(path, tokens["player-2"], gps(now, .01), "outside-after-bonus-001", now, undefined, verified));
  const second = await sessionView(path, tokens["player-2"], now);
  assert.deepEqual(second.mission, first.mission); assert.deepEqual(second.sharedBalance, first.sharedBalance);
  const disk = await readFile(path, "utf8"), db = JSON.parse(disk);
  assert.deepEqual(db.arrival, { method: "gps", acceptedAt: now, points: 20 });
  assert.doesNotMatch(disk, /latitude|longitude|accuracy|reading/);
  const restarted = await promisify(execFile)(process.execPath, ["--experimental-strip-types", "--input-type=module", "-e",
    'import { sessionView } from "./lib/amazing-shuk/participant-store.ts"; process.stdout.write(JSON.stringify(await sessionView(process.argv[1], process.argv[2])));', path, tokens["player-2"]]);
  assert.deepEqual(JSON.parse(restarted.stdout).sharedBalance, first.sharedBalance);
}));

test("guide confirmation requires guide identity; concurrent confirmations award once", () => fixture(async (path, tokens, now) => {
  await assert.rejects(sessionAction(path, tokens["player-1"], guideArrival, "ordinary-override-001", now), { status: 403 });
  await assert.rejects(sessionAction(path, "forged", guideArrival, "forged-override-001", now), { status: 401 });
  await assert.rejects(sessionAction(path, tokens.guide, { ...guideArrival, missionId: "wrong" }, "wrong-mission-001", now));
  const results = await Promise.allSettled(["guide-race-arrival-001", "guide-race-arrival-002"].map(id => sessionAction(path, tokens.guide, guideArrival, id, now)));
  for (const [i, result] of results.entries()) if (result.status === "rejected") {
    assert.equal(result.reason.status, 503);
    await sessionAction(path, tokens.guide, guideArrival, `guide-race-arrival-00${i + 1}`, now);
  }
  const view = await sessionView(path, tokens["player-1"], now);
  assert.equal(view.sharedBalance.points, 20); assert.equal(view.mission.arrivalMethod, "guide");
  assert.deepEqual(JSON.parse(await readFile(path, "utf8")).arrival, { method: "guide", acceptedAt: now, points: 20 });
}));

test("HTTP keeps CSRF/authentication and rejects unchecked destination evidence without blocking gameplay", () => fixture(async (path, tokens, now) => {
  const origin = "http://127.0.0.1:3000";
  const call = (action: object, token = tokens["player-1"]) => handleParticipantRequest(new Request(origin + "/api", {
    method: "POST", headers: { host: "127.0.0.1:3000", origin, "content-type": "application/json", cookie: `shuk_session=${token}` },
    body: JSON.stringify({ ...action, puzzleRevision: WATER_PUZZLE_REVISION, expectedParticipantId: token === tokens.guide ? "guide" : "player-1", actionId: "http-optional-arrival-001" }),
  }), path, { NODE_ENV: "development", SHUK_DEV_SIMULATION: "1" });
  assert.equal((await call(gps(now))).status, 403); // destination is deliberately not verified
  assert.equal((await call(guideArrival)).status, 403);
  assert.equal((await call({ type: "start" })).status, 200);
  assert.equal((await call(guideArrival, tokens.guide)).status, 200);
  assert.equal((await sessionView(path, tokens["player-2"], now)).sharedBalance.points, 20);
}));

test("schema3 migration preserves completed challenge reward without inventing an arrival bonus", () => fixture(async (path, tokens, now) => {
  await sessionAction(path, tokens["player-1"], { type: "start" }, "migration-start-001", now);
  await sessionAction(path, tokens["player-1"], { type: "move", move: "fill-large" }, "migration-fill-001", now + 1);
  await sessionAction(path, tokens["player-2"], { type: "move", move: "pour-large-into-jar" }, "migration-pour-001", now + 2);
  await sessionAction(path, tokens["player-2"], { type: "submit" }, "migration-submit-001", now + 3);
  const old = JSON.parse(await readFile(path, "utf8")); old.version = 3; delete old.arrival;
  await writeFile(path, JSON.stringify(old));
  const migrated = await sessionView(path, tokens["player-1"], now + 4);
  assert.equal(migrated.session.completed, true); assert.equal(migrated.mission.arrivalPoints, 0);
  assert.equal(migrated.sharedBalance.points, 100); assert.equal(migrated.sharedBalance.foodTokens, 2);
}));


test("concurrent bonus and official challenge completion preserve both rewards exactly once", () => fixture(async (path, tokens, now) => {
  await sessionAction(path, tokens["player-1"], { type: "start" }, "race-start-challenge-001", now);
  await sessionAction(path, tokens["player-1"], { type: "move", move: "fill-large" }, "race-fill-challenge-001", now + 1);
  await sessionAction(path, tokens["player-2"], { type: "move", move: "pour-large-into-jar" }, "race-solve-challenge-001", now + 2);
  const operations = [
    () => sessionAction(path, tokens["player-1"], gps(now), "race-optional-arrival-001", now + 3, undefined, verified),
    () => sessionAction(path, tokens["player-2"], { type: "submit" }, "race-official-submit-001", now + 3),
  ];
  const results = await Promise.allSettled(operations.map(run => run()));
  for (const [index, result] of results.entries()) if (result.status === "rejected") {
    assert.equal(result.reason.status, 503); await operations[index]();
  }
  for (const run of operations) await run();
  const view = await sessionView(path, tokens["player-2"], now + 4);
  assert.equal(view.mission.state, "completed");
  assert.equal(view.mission.arrivalPoints, 20);
  assert.equal(view.performance.reward!.points, 100);
  assert.deepEqual(view.sharedBalance, { points: 120, foodTokens: 2, status: "Provisional local-development rewards" });
}));
