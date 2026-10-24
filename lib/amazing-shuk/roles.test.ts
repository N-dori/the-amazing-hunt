import assert from "node:assert/strict";
import test from "node:test";
import { roleForParticipant, setGroupRole, type GroupRoleAssignments } from "./roles.ts";

const participants = ["p1", "p2", "p3"] as const;
const empty: GroupRoleAssignments = { navigator: null, answerSubmitter: null };

test("assigns active roles and treats remaining group members as followers", () => {
  const navigator = setGroupRole(participants, empty, "navigator", "p1");
  const roles = setGroupRole(participants, navigator, "answerSubmitter", "p2");
  assert.equal(roleForParticipant("p1", roles), "navigator");
  assert.equal(roleForParticipant("p2", roles), "answerSubmitter");
  assert.equal(roleForParticipant("p3", roles), "follower");
});

test("allows one participant to hold both navigator and answer-submitter roles", () => {
  const navigator = setGroupRole(participants, empty, "navigator", "p1");
  const roles = setGroupRole(participants, navigator, "answerSubmitter", "p1");
  assert.equal(roleForParticipant("p1", roles), "navigatorAndAnswerSubmitter");
});

test("allows role reassignment and clearing", () => {
  const assigned = setGroupRole(participants, empty, "navigator", "p1");
  const reassigned = setGroupRole(participants, assigned, "navigator", "p3");
  const cleared = setGroupRole(participants, reassigned, "navigator", null);
  assert.equal(roleForParticipant("p1", reassigned), "follower");
  assert.equal(reassigned.navigator, "p3");
  assert.equal(cleared.navigator, null);
});

test("rejects assigning roles outside the group", () => {
  assert.throws(() => setGroupRole(participants, empty, "navigator", "outsider"), /current group participant/);
});

test("does not mutate prior role state", () => {
  const assigned = setGroupRole(participants, empty, "navigator", "p1");
  assert.deepEqual(empty, { navigator: null, answerSubmitter: null });
  assert.notEqual(assigned, empty);
});
