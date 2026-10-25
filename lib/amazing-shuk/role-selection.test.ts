import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { issueInvitation, redeemInvitation, sessionView, sessionAction, logout } from "./participant-store.ts";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { handleParticipantRequest } from "./participant-http.ts";
import { WATER_TASK_ID, WATER_PUZZLE_REVISION } from "./water-measurement.ts";
import { parseAction } from "./parse-water-action.ts";
async function fixture(run: (path: string, tokens: Record<string, string>) => Promise<void>) {
  const dir = await mkdtemp(join(tmpdir(), "shuk-roles-"));
  const path = join(dir, "state.json");
  try {
    const tokens: Record<string, string> = {};
    for (const id of ["guide", "player-1", "player-2", "player-3"]) tokens[id] = await redeemInvitation(path, await issueInvitation(path, id));
    await run(path, tokens);
  } finally { await rm(dir, { recursive: true, force: true }); }
}
test("A: volunteers share existing identities, preserve confirmed roles, and persist without duplicate candidates", () => fixture(async (path, tokens) => {
  const before = await sessionView(path, tokens.guide);
  const id = randomUUID();
  for (const [player, role] of [["player-1", "navigator"], ["player-1", "answerSubmitter"], ["player-2", "navigator"]] as const) {
    await sessionAction(path, tokens[player], { type: "volunteer-role", role }, player === "player-1" && role === "navigator" ? id : randomUUID());
  }
  await sessionAction(path, tokens["player-1"], { type: "volunteer-role", role: "navigator" }, id);
  await sessionAction(path, tokens["player-1"], { type: "volunteer-role", role: "navigator" }, randomUUID());
  const after = await sessionView(path, tokens.guide);
  assert.deepEqual(after.roleCandidates, { navigator: ["player-1", "player-2"], answerSubmitter: ["player-1"] });
  assert.deepEqual(after.session.roles, before.session.roles);
  assert.deepEqual(after.sharedBalance, before.sharedBalance);
  assert.deepEqual((await sessionView(path, tokens["player-2"])).roleCandidates, after.roleCandidates);
  assert.deepEqual(JSON.parse(await readFile(path, "utf8")).roleCandidates, after.roleCandidates);
  await assert.rejects(sessionAction(path, tokens.guide, { type: "volunteer-role", role: "navigator" }, randomUUID()), /Only participants/);
  await assert.rejects(sessionAction(path, "forged", { type: "volunteer-role", role: "navigator" }, randomUUID()), /login required/);
}));
test("A: older JSON defaults candidates in memory without changing disk or progress", () => fixture(async (path, tokens) => {
  const db = JSON.parse(await readFile(path, "utf8")); delete db.roleCandidates;
  await writeFile(path, JSON.stringify(db));
  const before = await readFile(path, "utf8");
  assert.deepEqual((await sessionView(path, tokens.guide)).roleCandidates, { navigator: [], answerSubmitter: [] });
  assert.equal(await readFile(path, "utf8"), before);
}));
test("A: parser accepts only the two participant responsibilities, with identity supplied by session", () => {
  assert.deepEqual(parseAction({ type: "volunteer-role", role: "navigator", participantId: "guide" }), { type: "volunteer-role", role: "navigator" });
  assert.equal(parseAction({ type: "volunteer-role", role: "guide" }), null);
  assert.equal(parseAction({ type: "volunteer-role", role: "navigator", part: "bonus" }), null);
});

test("B: only guide confirms or assigns directly; dual responsibilities preserve shared progress", () => fixture(async (path, tokens) => {
  await sessionAction(path, tokens["player-3"], { type: "volunteer-role", role: "navigator" }, randomUUID());
  const before = JSON.parse(await readFile(path, "utf8"));
  await assert.rejects(sessionAction(path, tokens["player-3"], { type: "assign-role", role: "navigator", participantId: "player-3" }, randomUUID()), /Only the guide/);
  for (const role of ["navigator", "answerSubmitter"] as const) await sessionAction(path, tokens.guide, { type: "assign-role", role, participantId: "player-3" }, randomUUID());
  const view = await sessionView(path, tokens["player-2"]);
  assert.deepEqual(view.session.roles, { navigator: "player-3", answerSubmitter: "player-3" });
  assert.deepEqual(view.roleCandidates.navigator, []);
  const after = JSON.parse(await readFile(path, "utf8"));
  for (const key of ["missions", "sessions", "invitations"]) assert.deepEqual(after[key], before[key]);
  await assert.rejects(sessionAction(path, tokens.guide, { type: "assign-role", role: "navigator", participantId: "guide" }, randomUUID()), /current group participant/);
}));
test("B: concurrent guide assignments serialize, with safe same-ID retry on lock contention", () => fixture(async (path, tokens) => {
  const actions = ["player-2", "player-3"].map(participantId => ({ action: { type: "assign-role" as const, role: "navigator" as const, participantId }, id: randomUUID() }));
  const results = await Promise.allSettled(actions.map(({action, id}) => sessionAction(path, tokens.guide, action, id)));
  for (const [i, result] of results.entries()) if (result.status === "rejected") {
    assert.equal(result.reason.status, 503);
    await sessionAction(path, tokens.guide, actions[i].action, actions[i].id);
  }
  const db = JSON.parse(await readFile(path, "utf8"));
  assert.ok(["player-2", "player-3"].includes(db.roles.navigator));
  assert.equal(actions.every(a => db.applied.guide.includes(a.id)), true);
  assert.deepEqual((await sessionView(path, tokens["player-1"])).session.roles, (await sessionView(path, tokens["player-2"])).session.roles);
}));

test("C: withdrawal and stepping down affect only the authenticated participant and requested responsibility", () => fixture(async (path, tokens) => {
  for (const role of ["navigator", "answerSubmitter"] as const) {
    await sessionAction(path, tokens.guide, { type: "assign-role", role, participantId: "player-1" }, randomUUID());
    await sessionAction(path, tokens["player-2"], { type: "volunteer-role", role }, randomUUID());
  }
  await sessionAction(path, tokens["player-2"], { type: "withdraw-role", role: "navigator" }, randomUUID());
  await sessionAction(path, tokens["player-2"], { type: "step-down-role", role: "navigator" }, randomUUID());
  assert.equal((await sessionView(path, tokens.guide)).session.roles.navigator, "player-1");
  await sessionAction(path, tokens["player-1"], { type: "step-down-role", role: "navigator" }, randomUUID());
  const view = await sessionView(path, tokens.guide);
  assert.deepEqual(view.session.roles, { navigator: null, answerSubmitter: "player-1" });
  assert.deepEqual(view.roleCandidates, { navigator: [], answerSubmitter: ["player-2"] });
  await logout(path, tokens["player-1"]);
  assert.equal((await sessionView(path, tokens.guide)).session.roles.answerSubmitter, "player-1");
  await assert.rejects(sessionView(path, tokens["player-1"]), /login required/);
}));
test("C: active-mission role revocation blocks stale HTTP submissions; unassigned answers remain guide-only", () => fixture(async (path, tokens) => {
  const action = (who: string, body: object) => handleParticipantRequest(new Request("http://127.0.0.1:3000/api", {
    method: "POST", headers: { host: "127.0.0.1:3000", origin: "http://127.0.0.1:3000", "content-type": "application/json", cookie: `shuk_session=${tokens[who]}` },
    body: JSON.stringify({ ...body, actionId: randomUUID(), expectedParticipantId: who, puzzleRevision: WATER_PUZZLE_REVISION }),
  }), path, { NODE_ENV: "development", SHUK_DEV_SIMULATION: "1" });
  assert.equal((await action("player-1", { type: "start", missionId: WATER_TASK_ID })).status, 200);
  for (const move of ["fill-large", "pour-large-into-jar"]) assert.equal((await action("player-1", { type: "move", move, missionId: WATER_TASK_ID })).status, 200);
  const before = await sessionView(path, tokens.guide);
  assert.equal((await action("guide", { type: "assign-role", role: "answerSubmitter", participantId: "player-3" })).status, 200);
  assert.equal((await action("player-2", { type: "submit", missionId: WATER_TASK_ID })).status, 403);
  assert.equal((await action("player-3", { type: "step-down-role", role: "answerSubmitter" })).status, 200);
  assert.equal((await action("guide", { type: "assign-role", role: "navigator", participantId: null })).status, 200);
  for (const player of ["player-1", "player-2", "player-3"]) assert.equal((await action(player, { type: "submit", missionId: WATER_TASK_ID })).status, 403);
  const after = await sessionView(path, tokens["player-3"]);
  assert.deepEqual(after.missions, before.missions);
  assert.deepEqual(after.sharedBalance, before.sharedBalance);
  assert.equal(after.session.kind, "water"); assert.equal(before.session.kind, "water");
  if (after.session.kind === "water" && before.session.kind === "water") assert.deepEqual(after.session.cups, before.session.cups);
  assert.equal(after.session.roles.navigator, null);
  assert.equal((await action("guide", { type: "submit", missionId: WATER_TASK_ID })).status, 200);
  assert.equal((await sessionView(path, tokens["player-1"])).session.completed, true);
}));
test("C: fresh server process reopens candidates and confirmed roles", () => fixture(async (path, tokens) => {
  await sessionAction(path, tokens["player-3"], { type: "volunteer-role", role: "navigator" }, randomUUID());
  await sessionAction(path, tokens.guide, { type: "assign-role", role: "answerSubmitter", participantId: "player-3" }, randomUUID());
  const reopened = await promisify(execFile)(process.execPath, ["--experimental-strip-types", "--disable-warning=ExperimentalWarning", "--input-type=module", "-e",
    'import {sessionView} from "./lib/amazing-shuk/participant-store.ts"; const v=await sessionView(process.argv[1],process.argv[2]); process.stdout.write(JSON.stringify({roles:v.session.roles,candidates:v.roleCandidates}));', path, tokens.guide]);
  const view = await sessionView(path, tokens["player-1"]);
  assert.deepEqual(JSON.parse(reopened.stdout), { roles: view.session.roles, candidates: view.roleCandidates });
}));
