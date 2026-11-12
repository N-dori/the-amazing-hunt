import assert from "node:assert/strict";
import test from "node:test";
import { effectiveRoles, heldRoles, isSoloTeam, mayChangeAnswer, mayLead, newlyHeldRoles, roleForParticipant, setGroupRole, type GroupRoleAssignments } from "./roles.ts";

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

test("a team of exactly one holds both roles; other teams keep their stored roles (D12)", () => {
  const stored: GroupRoleAssignments = Object.freeze({ navigator: null, answerSubmitter: null });
  const solo = effectiveRoles(["p1"], stored);
  assert.equal(roleForParticipant("p1", solo), "navigatorAndAnswerSubmitter");
  assert.deepEqual(stored, { navigator: null, answerSubmitter: null }, "the stored roles are never changed");
  assert.equal(effectiveRoles([], stored), stored);
  const pair = setGroupRole(["p1", "p2"], stored, "navigator", "p2");
  assert.equal(effectiveRoles(["p1", "p2"], pair), pair);
  assert.equal(roleForParticipant("p1", effectiveRoles(["p1", "p2"], pair)), "follower");
  assert.equal(effectiveRoles(["p1", "p2", "p3", "p4", "p5"], stored), stored);
  // A solo player's own stored half-role doesn't matter: they hold both.
  assert.equal(roleForParticipant("p1", effectiveRoles(["p1"], { navigator: "p1", answerSubmitter: null })), "navigatorAndAnswerSubmitter");
  assert.deepEqual([isSoloTeam([]), isSoloTeam(["p1"]), isSoloTeam(["p1", "p2"])], [false, true, false]);
});

test("the role card announces only roles newly given to this player, never on the first read", () => {
  const none = { navigator: null, answerSubmitter: null };
  assert.deepEqual(newlyHeldRoles(null, { navigator: "player-1", answerSubmitter: "player-1" }, "player-1"), []);
  assert.deepEqual(newlyHeldRoles(none, { navigator: "player-1", answerSubmitter: null }, "player-1"), ["navigator"]);
  assert.deepEqual(newlyHeldRoles(none, { navigator: "player-1", answerSubmitter: "player-1" }, "player-1"), ["navigator", "answerSubmitter"]);
  // Someone else's new role, a role already held, or a role taken away: nothing to announce.
  assert.deepEqual(newlyHeldRoles(none, { navigator: "player-2", answerSubmitter: null }, "player-1"), []);
  assert.deepEqual(newlyHeldRoles({ navigator: "player-1", answerSubmitter: null }, { navigator: "player-1", answerSubmitter: null }, "player-1"), []);
  assert.deepEqual(newlyHeldRoles({ navigator: "player-1", answerSubmitter: null }, none, "player-1"), []);
  assert.deepEqual(newlyHeldRoles({ navigator: "player-2", answerSubmitter: null }, { navigator: "player-1", answerSubmitter: null }, "player-1"), ["navigator"]);
});

test("four main roles (owner, 5 Nov 2026): Researcher and Photographer are given like the others, one player may hold several", () => {
  const ids = ["p1", "p2"];
  const none = { navigator: null, answerSubmitter: null };
  const given = setGroupRole(ids, setGroupRole(ids, none, "researcher", "p2"), "photographer", "p2");
  assert.deepEqual(given, { navigator: null, answerSubmitter: null, researcher: "p2", photographer: "p2" });
  assert.deepEqual(heldRoles(given, "p2"), ["researcher", "photographer"]);
  assert.deepEqual(heldRoles(none, "p1", true), ["navigator", "answerSubmitter", "researcher", "photographer"], "a solo player holds every role");
  assert.deepEqual(newlyHeldRoles(none, given, "p2"), ["researcher", "photographer"]);
  assert.throws(() => setGroupRole(ids, none, "photographer", "stranger"), /current group participant/);
  // Neither carries a permission: they never make a player the navigator or the Submitter.
  assert.equal(roleForParticipant("p2", given), "follower");
});

test("only the Submitter changes the answer; the guide may; anyone may while the Submitter seat is empty", () => {
  const roles = { navigator: "p1", answerSubmitter: "p2" };
  assert.deepEqual(["p1", "p2", "p3"].map(id => mayChangeAnswer(id, roles, false)), [false, true, false]);
  assert.equal(mayChangeAnswer("guide", roles, true), true);
  assert.equal(mayChangeAnswer("p3", { navigator: "p1", answerSubmitter: null }, false), true);
});

test("only the Navigator takes the group to the next stop; the guide, a solo player, or anyone while the seat is empty may too", () => {
  const roles = { navigator: "p1", answerSubmitter: "p2" };
  assert.deepEqual(["p1", "p2", "p3"].map(id => mayLead(id, roles, false, false)), [true, false, false]);
  assert.equal(mayLead("guide", roles, true, false), true);
  assert.equal(mayLead("p1", { navigator: null, answerSubmitter: null }, false, true), true);
  assert.equal(mayLead("p3", { navigator: null, answerSubmitter: "p2" }, false, false), true);
});
