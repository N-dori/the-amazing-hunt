import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { createServer } from "node:http";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { handleParticipantRequest } from "./participant-http.ts";
import { issueInvitation, redeemInvitation, sessionView, sessionAction, logout, transact } from "./participant-store.ts";
import { WATER_PUZZLE_REVISION } from "./water-measurement.ts";
const env = { NODE_ENV: "development", SHUK_DEV_SIMULATION: "1" } as const;
async function fixture(run: (path: string) => Promise<void>) {
  await mkdir(".local", { recursive: true });
  const directory = await mkdtemp(join(process.cwd(), ".local", "shuk-auth-"));
  try { await run(join(directory, "state.json")); } finally { await rm(directory, { recursive: true, force: true }); }
}
test("two isolated cookie jars retain identities and share persistent progress (set SHUK_HTTP_TESTS=1 for sockets)", (t) => fixture(async path => {
  let origin = "http://127.0.0.1:3000";
  const sockets = process.env.SHUK_HTTP_TESTS === "1";
  const server = createServer(async (incoming, outgoing) => {
    try {
      const chunks: Buffer[] = [];
      for await (const chunk of incoming) chunks.push(Buffer.from(chunk));
      const request = new Request(origin + incoming.url, {
        method: incoming.method,
        headers: incoming.headers as Record<string, string>,
        body: incoming.method === "POST" ? Buffer.concat(chunks) : undefined,
      });
      const response = await handleParticipantRequest(request, path, env);
      outgoing.writeHead(response.status, Object.fromEntries(response.headers));
      outgoing.end(await response.text());
    } catch { outgoing.writeHead(500); outgoing.end(); }
  });
  if (sockets) {
    await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
    t.after(() => new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())));
    const address = server.address();
    assert.ok(address && typeof address !== "string");
    origin = "http://127.0.0.1:" + address.port;
  }
  const call = (cookie = "", body?: object, overrides: Record<string, string> = {}) => {
    const init = {
      method: body ? "POST" : "GET", headers: { origin, "content-type": "application/json", cookie, ...overrides },
      body: body ? JSON.stringify({ puzzleRevision: WATER_PUZZLE_REVISION, expectedParticipantId: "player-1", ...body }) : undefined,
    };
    return sockets ? fetch(origin + "/api", init) : handleParticipantRequest(new Request(origin + "/api", { ...init, headers: { host: new URL(origin).host, ...init.headers } }), path, env);
  };
  assert.equal((await call()).status, 401);
  const inviteA = await issueInvitation(path, "player-1");
  const inviteB = await issueInvitation(path, "player-2");
  const loginA = await call("", { type: "login", token: inviteA });
  const loginB = await call("", { type: "login", token: inviteB });
  assert.equal(loginA.status, 200); assert.equal(loginB.status, 200);
  assert.match(loginA.headers.get("set-cookie")!, /HttpOnly; SameSite=Strict/);
  const a = loginA.headers.get("set-cookie")!.split(";")[0];
  const b = loginB.headers.get("set-cookie")!.split(";")[0];
  assert.notEqual(a, b);
  assert.equal((await call("", { type: "login", token: inviteA })).status, 401);
  assert.equal((await call(a, { type: "switch-actor", actorId: "guide", actionId: "switch-actor-test-1" })).status, 403);
  assert.equal((await call(a, { type: "assign-role", role: "navigator", participantId: "player-2", actionId: "assign-role-test-1" })).status, 403);
  assert.equal((await call(a, { type: "start", actionId: "start-challenge-001" })).status, 200);
  assert.equal((await call(a, { type: "reset", actionId: "reset-action-test-1" })).status, 200);
  assert.equal((await call(a, { type: "submit", actionId: "submit-action-test-1" })).status, 403);
  assert.equal((await call(a, { type: "move", move: "fill-large", actionId: "move-action-test-1" }, { origin: "https://attacker.example" })).status, 403);
  assert.equal((await call(a, { type: "move", move: "fill-large", actionId: "move-action-test-1" })).status, 200);
  const stateA = await (await call(a)).json();
  const stateB = await (await call(b)).json();
  assert.equal(stateA.session.activeActorId, "player-1");
  assert.equal(stateB.session.activeActorId, "player-2");
  assert.deepEqual(stateA.session.cups, stateB.session.cups);
  assert.equal(stateB.session.cups.large, 5);
  const solution = ["pour-large-into-small", "empty-small", "pour-large-into-small", "fill-large", "pour-large-into-small", "pour-large-into-jar"];
  for (const [index, move] of solution.entries()) {
    assert.equal((await call(b, { type: "move", move, actionId: "solution-move-000" + index, expectedParticipantId: "player-2" })).status, 200);
  }
  assert.equal((await call(b, { type: "submit", actionId: "solution-submit-001", expectedParticipantId: "player-2" })).status, 200);
  assert.equal((await (await call(a)).json()).session.completed, true);
  assert.equal((await (await call(b)).json()).session.completed, true);
  const solvedState = await (await call(b)).json();
  // New reads reopen the JSON file, independent of process memory.
  assert.equal((await sessionView(path, b.split("=")[1])).session.cups.jar, 4);
  const reopened = await promisify(execFile)(process.execPath, ["--experimental-strip-types", "--disable-warning=ExperimentalWarning", "--input-type=module", "-e",
    'import { sessionView } from "./lib/amazing-shuk/participant-store.ts"; process.stdout.write(JSON.stringify(await sessionView(process.argv[1], process.argv[2])));', path, b.split("=")[1]]);
  assert.equal(JSON.parse(reopened.stdout).session.activeActorId, "player-2");
  assert.deepEqual(JSON.parse(reopened.stdout).performance.reward, solvedState.performance.reward);
  assert.deepEqual(JSON.parse(reopened.stdout).session.cups, solvedState.session.cups);
  const disk = await readFile(path, "utf8");
  assert.ok(!disk.includes(inviteA)); assert.ok(!disk.includes(a.split("=")[1]));
  assert.equal((await call(a, { type: "logout" })).status, 200);
  assert.equal((await call(a)).status, 401);
  assert.equal((await call(b)).status, 200);
  for (const environment of [{ ...env, NODE_ENV: "production" }, { ...env, SHUK_DEV_SIMULATION: "0" }] as const) {
    assert.equal((await handleParticipantRequest(new Request("http://localhost/api", { headers: { host: "localhost" } }), path, environment)).status, 404);
  }
  assert.equal((await call(b, undefined, { host: "public.example" })).status, 404);
}));
test("expiry, invalid credentials, concurrent redemption and lock contention fail closed", () => fixture(async path => {
  const token = await issueInvitation(path, "guide", 100);
  await assert.rejects(redeemInvitation(path, token, 100 + 86_400_000));
  const results = await Promise.allSettled([redeemInvitation(path, token, 101), redeemInvitation(path, token, 101)]);
  assert.equal(results.filter(result => result.status === "fulfilled").length, 1);
  const session = results.find(result => result.status === "fulfilled")!;
  if (session.status !== "fulfilled") throw new Error("No session");
  await assert.rejects(sessionView(path, session.value, 101 + 7 * 86_400_000));
  await assert.rejects(sessionView(path, "forged"));
  await logout(path, session.value);
  await assert.rejects(sessionView(path, session.value, 102));
  await assert.rejects(transact(path, () => { throw new Error("rollback"); }));
  await issueInvitation(path, "player-1");
}));
test("guide assignments and queued retries are authoritative and idempotent", () => fixture(async path => {
  const guide = await redeemInvitation(path, await issueInvitation(path, "guide"));
  const player = await redeemInvitation(path, await issueInvitation(path, "player-1"));
  await sessionAction(path, guide, { type: "start" }, "guide-start-challenge");
  await sessionAction(path, guide, { type: "assign-role", role: "answerSubmitter", participantId: "player-1" }, "guide-assignment-001");
  await sessionAction(path, player, { type: "move", move: "fill-large" }, "player-fill-large-001");
  const pour = { type: "move", move: "pour-large-into-small" } as const;
  await sessionAction(path, player, pour, "player-pour-large-001");
  await sessionAction(path, player, { type: "move", move: "empty-small" }, "player-empty-small-001");
  const before = await sessionView(path, player);
  await sessionAction(path, player, pour, "player-pour-large-001");
  assert.deepEqual(await sessionView(path, player), before);
  await sessionAction(path, player, { type: "move", move: "fill-large" }, "player-refill-large-001");
  await sessionAction(path, player, { type: "move", move: "pour-large-into-jar" }, "player-fill-jar-001");
  await sessionAction(path, guide, { type: "guide-approve" }, "guide-approval-001");
  assert.equal((await sessionView(path, player)).session.completed, true);
}));
test("invitation reissue, session replacement, CLI link and identity mismatch", () => fixture(async path => {
  const old = await issueInvitation(path, "player-1");
  const fresh = await issueInvitation(path, "player-1");
  await assert.rejects(redeemInvitation(path, old));
  const first = await redeemInvitation(path, fresh);
  const second = await redeemInvitation(path, await issueInvitation(path, "player-2"), Date.now(), first);
  await assert.rejects(sessionView(path, first));
  await assert.rejects(sessionAction(path, second, { type: "move", move: "fill-large" }, "identity-mismatch-001", Date.now(), "player-1"), { status: 409 });
  assert.equal((await sessionView(path, second)).session.cups.large, 0);
  const cli = await promisify(execFile)(process.execPath, ["--experimental-strip-types", "--disable-warning=ExperimentalWarning", "scripts/shuk-invite.ts", "guide"], {
    env: { ...process.env, ...env, SHUK_DATA_FILE: path },
  });
  const link = new URL(cli.stdout.trim());
  assert.equal(link.hostname, "127.0.0.1");
  const token = new URLSearchParams(link.hash.slice(1)).get("invite");
  assert.ok(token);
  const guide = await redeemInvitation(path, token);
  assert.equal((await sessionView(path, guide)).session.activeActorId, "guide");
}));

test("origin validation uses loopback Host when Next normalizes request URL", () => fixture(async path => {
  const token = await issueInvitation(path, "player-2");
  const request = (origin: string, host = "127.0.0.1:3000") => new Request("http://localhost:3000/api/amazing-shuk/dev", {
    method: "POST", headers: { host, origin, "content-type": "application/json" }, body: JSON.stringify({ type: "login", token }),
  });
  for (const origin of ["http://localhost:3000", "http://127.0.0.1:3001", "https://127.0.0.1:3000", "https://attacker.example", "null"]) {
    assert.equal((await handleParticipantRequest(request(origin), path, env)).status, 403);
  }
  assert.equal((await handleParticipantRequest(request("http://public.example", "public.example"), path, env)).status, 404);
  const response = await handleParticipantRequest(request("http://127.0.0.1:3000"), path, env);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("set-cookie")!, /HttpOnly; SameSite=Strict/);
}));

test("legacy cup state migrates without losing login or roles; stale queued actions are rejected", () => fixture(async path => {
  const token = await redeemInvitation(path, await issueInvitation(path, "player-2"));
  const old = JSON.parse(await readFile(path, "utf8"));
  old.version = 1;
  old.group.cups = { small: 300, large: 400 };
  old.group.completed = true;
  await writeFile(path, JSON.stringify(old));
  const view = await sessionView(path, token);
  assert.equal(view.puzzleRevision, WATER_PUZZLE_REVISION);
  assert.equal(view.session.activeActorId, "player-2");
  assert.deepEqual(view.session.roles, old.group.roles);
  assert.deepEqual(view.session.cups, { small: 0, large: 0, jar: 0 });
  assert.equal(view.session.completed, false);
  const request = new Request("http://127.0.0.1:3000/api", {
    method: "POST", headers: { host: "127.0.0.1:3000", origin: "http://127.0.0.1:3000", "content-type": "application/json", cookie: `shuk_session=${token}` },
    body: JSON.stringify({ type: "move", move: "fill-large", actionId: "stale-water-move-001", expectedParticipantId: "player-2", puzzleRevision: 1 }),
  });
  assert.equal((await handleParticipantRequest(request, path, env)).status, 422);
  assert.deepEqual((await sessionView(path, token)).session.cups, view.session.cups);
}));

test("guide cannot bypass the jar goal; reset and repeated completion preserve the shared result", () => fixture(async path => {
  const guide = await redeemInvitation(path, await issueInvitation(path, "guide"));
  const player = await redeemInvitation(path, await issueInvitation(path, "player-2"));
  await sessionAction(path, guide, { type: "start" }, "guide-start-challenge");
  await sessionAction(path, guide, { type: "guide-approve" }, "guide-empty-approve-001");
  assert.equal((await sessionView(path, player)).session.completed, false);
  await sessionAction(path, player, { type: "move", move: "fill-large" }, "player-reset-fill-001");
  await sessionAction(path, player, { type: "reset" }, "player-reset-task-001");
  assert.deepEqual((await sessionView(path, guide)).session.cups, { small: 0, large: 0, jar: 0 });
  await sessionAction(path, player, { type: "move", move: "fill-large" }, "player-final-fill-001");
  await sessionAction(path, player, { type: "move", move: "pour-large-into-jar" }, "player-final-pour-001");
  await sessionAction(path, guide, { type: "submit" }, "guide-final-submit-001");
  const final = await sessionView(path, player);
  await sessionAction(path, player, { type: "submit" }, "player-repeat-submit-001");
  assert.deepEqual((await sessionView(path, guide)).session, { ...final.session, activeActorId: "guide" });
  assert.deepEqual(final.sharedBalance, { points: 100, foodTokens: 2, status: "Provisional local-development rewards" });
  await assert.rejects(sessionAction(path, player, { type: "reset" }, "player-repeat-reset-001"));
}));


test("two participants measure two liters twice and finalize the same shared jar", () => fixture(async path => {
  const first = await redeemInvitation(path, await issueInvitation(path, "player-1"));
  const submitter = await redeemInvitation(path, await issueInvitation(path, "player-2"));
  await sessionAction(path, first, { type: "start" }, "first-start-challenge");
  const sequence = ["fill-large", "pour-large-into-small", "pour-large-into-jar", "empty-small", "fill-large", "pour-large-into-small", "pour-large-into-jar"] as const;
  for (const [index, move] of sequence.entries()) {
    await sessionAction(path, index % 2 ? submitter : first, { type: "move", move }, `two-rounds-move-${index}`);
    assert.deepEqual((await sessionView(path, first)).session.cups, (await sessionView(path, submitter)).session.cups);
  }
  assert.deepEqual((await sessionView(path, first)).session.cups, { small: 3, large: 0, jar: 4 });
  await assert.rejects(sessionAction(path, first, { type: "submit" }, "two-rounds-wrong-submit"));
  await sessionAction(path, submitter, { type: "submit" }, "two-rounds-final-submit");
  await sessionAction(path, submitter, { type: "submit" }, "two-rounds-final-submit");
  assert.equal((await sessionView(path, first)).session.completed, true);
}));

test("concurrent queued actions retry lock contention without overwriting shared progress", () => fixture(async path => {
  const first = await redeemInvitation(path, await issueInvitation(path, "player-1"));
  const second = await redeemInvitation(path, await issueInvitation(path, "player-2"));
  await sessionAction(path, first, { type: "start" }, "concurrent-start-challenge");
  const actions = [
    { token: first, action: { type: "move", move: "fill-small" } as const, id: "concurrent-fill-small" },
    { token: second, action: { type: "move", move: "fill-large" } as const, id: "concurrent-fill-large" },
  ];
  const results = await Promise.allSettled(actions.map(item => sessionAction(path, item.token, item.action, item.id)));
  for (const [index, result] of results.entries()) {
    if (result.status === "rejected") {
      assert.equal(result.reason.status, 503);
      const item = actions[index];
      await sessionAction(path, item.token, item.action, item.id);
    }
  }
  assert.deepEqual((await sessionView(path, first)).session.cups, { small: 3, large: 5, jar: 0 });
  await sessionAction(path, first, { type: "move", move: "empty-small" }, "concurrent-return-small");
  // A delayed duplicate fill must not put returned water back into the small vessel.
  await sessionAction(path, first, actions[0].action, actions[0].id);
  assert.deepEqual((await sessionView(path, second)).session.cups, { small: 0, large: 5, jar: 0 });
}));

test("polling reads take no lock, never rewrite storage and cannot block group actions", () => fixture(async path => {
  const player = await redeemInvitation(path, await issueInvitation(path, "player-1"));
  await sessionAction(path, player, { type: "start" }, "poll-start-challenge-001");
  const legacy = JSON.parse(await readFile(path, "utf8"));
  legacy.version = 3; delete legacy.arrival;
  await writeFile(path, JSON.stringify(legacy));
  const bytes = await readFile(path, "utf8");
  // A held writer lock does not block reads, and a read does not persist its in-memory migration.
  await mkdir(path + ".lock");
  assert.equal((await sessionView(path, player)).mission.arrivalPoints, 0);
  await rm(path + ".lock", { recursive: true });
  assert.equal(await readFile(path, "utf8"), bytes);
  const polls = Array.from({ length: 24 }, () => sessionView(path, player));
  const move = sessionAction(path, player, { type: "move", move: "fill-large" }, "poll-fill-large-001");
  const results = await Promise.allSettled([...polls, move]);
  assert.deepEqual(results.filter(result => result.status === "rejected"), []);
  assert.deepEqual((await sessionView(path, player)).session.cups, { small: 0, large: 5, jar: 0 });
  assert.equal(JSON.parse(await readFile(path, "utf8")).version, 4);
}));
