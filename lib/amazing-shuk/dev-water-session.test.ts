import assert from "node:assert/strict";
import test from "node:test";
import {
  applyDevWaterAction,
  createDevWaterSession,
  DEV_GUIDE_ID,
  getDevWaterActorRole,
  isDevSimulationEnabled,
  isLocalDevelopmentHost,
} from "./dev-water-session.ts";

const solution = ["fill-large", "pour-large-into-small", "empty-small", "pour-large-into-small", "fill-large", "pour-large-into-small"] as const;

test("development simulation requires both development mode and explicit opt-in", () => {
  assert.equal(isDevSimulationEnabled({ NODE_ENV: "development", SHUK_DEV_SIMULATION: "1" }), true);
  assert.equal(isDevSimulationEnabled({ NODE_ENV: "production", SHUK_DEV_SIMULATION: "1" }), false);
  assert.equal(isDevSimulationEnabled({ NODE_ENV: "test", SHUK_DEV_SIMULATION: "1" }), false);
  assert.equal(isDevSimulationEnabled({ NODE_ENV: "development" }), false);
});

test("the single group shares cup state and answer submission is server-validated", () => {
  let session = createDevWaterSession();
  session = applyDevWaterAction(session, { type: "switch-actor", actorId: "player-3" }).session;
  session = applyDevWaterAction(session, { type: "move", move: "fill-large" }).session;
  assert.deepEqual(session.cups, { small: 0, large: 500 });

  assert.throws(() => applyDevWaterAction(session, { type: "submit" }), /answer-submitter/);
  session = applyDevWaterAction(session, { type: "switch-actor", actorId: "player-2" }).session;
  for (const move of solution.slice(1)) session = applyDevWaterAction(session, { type: "move", move }).session;
  assert.deepEqual(session.cups, { small: 300, large: 400 });
  session = applyDevWaterAction(session, { type: "submit" }).session;
  assert.equal(session.completed, true);
});

test("the guide can assign both roles to one person and approve completion", () => {
  let session = applyDevWaterAction(createDevWaterSession(), { type: "switch-actor", actorId: DEV_GUIDE_ID }).session;
  session = applyDevWaterAction(session, { type: "assign-role", role: "answerSubmitter", participantId: "player-1" }).session;
  assert.equal(session.roles.navigator, session.roles.answerSubmitter);
  session = applyDevWaterAction(session, { type: "guide-approve" }).session;
  assert.equal(session.completed, true);
});

test("non-guides cannot assign roles and completed tasks cannot be replayed", () => {
  let session = createDevWaterSession();
  assert.throws(() => applyDevWaterAction(session, { type: "assign-role", role: "navigator", participantId: "player-3" }), /Only the simulated guide/);
  session = applyDevWaterAction(session, { type: "switch-actor", actorId: DEV_GUIDE_ID }).session;
  session = applyDevWaterAction(session, { type: "guide-approve" }).session;
  assert.throws(() => applyDevWaterAction(session, { type: "move", move: "fill-large" }), /already complete/);
});

test("local simulation accepts loopback hosts only", () => {
  assert.equal(isLocalDevelopmentHost("localhost:3000"), true);
  assert.equal(isLocalDevelopmentHost("127.0.0.1:3000"), true);
  assert.equal(isLocalDevelopmentHost("[::1]:3000"), true);
  assert.equal(isLocalDevelopmentHost("192.168.1.20:3000"), false);
  assert.equal(isLocalDevelopmentHost("game.example.test"), false);
  assert.equal(isLocalDevelopmentHost(null), false);
});
