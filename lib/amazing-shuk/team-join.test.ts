import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { APPROVED_MS, askToJoin, createJoinLink, exchangeJoin, issueHostInvitation, issueInvitation, joinStatus, PENDING_LIMIT, PENDING_MS,
  redeemInvitation, sessionAction, sessionView, startNewAdventure, TEAM_CAPACITY, TEAM_FULL } from "./participant-store.ts";
import { handleParticipantRequest } from "./participant-http.ts";
import { ASKS_PER_LINK, resetJoinAsks } from "./join-rate-limit.ts";
import { GAN_HATUT_MISSION } from "./mission-arrival.ts";
import { WATER_PUZZLE_REVISION } from "./water-measurement.ts";

// I3b: the team join link with leader approval. Temporary state files only.
const WELL = GAN_HATUT_MISSION.id;
const NOW = Date.now();
const RANDOM_ID = /^p_[A-Za-z0-9_-]{22}$/;
const status = (code: number) => (error: Error & { status?: number }) => error.status === code;
const stored = async (path: string) => JSON.parse(await readFile(path, "utf8"));
async function fixture(run: (path: string) => Promise<void>) {
  await mkdir(".local", { recursive: true });
  const directory = await mkdtemp(join(process.cwd(), ".local", "shuk-join-"));
  try { await run(join(directory, "state.json")); } finally { await rm(directory, { recursive: true, force: true }); }
}
const signIn = async (path: string, seat: string, now = NOW) => redeemInvitation(path, await issueInvitation(path, seat, now), now);
/** A started adventure: player-1 hosts and leads team A, player-4 is the navigator, plus the guide. Two members: three places free. */
async function team(path: string) {
  await startNewAdventure(path, NOW);
  const leader = await redeemInvitation(path, await issueHostInvitation(path, "player-1", NOW), NOW);
  const player = await signIn(path, "player-4");
  const guide = await signIn(path, "guide");
  await sessionAction(path, leader, { type: "set-intended-count", count: 3 }, "join-fixture-count-0001", NOW);
  await sessionAction(path, leader, { type: "start-adventure" }, "join-fixture-start-0001", NOW);
  await sessionAction(path, player, { type: "claim-role", role: "navigator" }, "join-fixture-navigator-1", NOW);
  return { leader, player, guide, link: await createJoinLink(path, leader, false, NOW) };
}
const membership = async (path: string, token: string, now = NOW) => (await sessionView(path, token, now)).membership!;
const requestId = async (path: string, token: string, code: string, now = NOW) => (await membership(path, token, now)).requests.find(request => request.code === code)!.id;
let actions = 0;
const nextId = () => `join-test-action-${String(++actions).padStart(4, "0")}`;
const letIn = (path: string, token: string, id: string, now = NOW, actionId = nextId()) => sessionAction(path, token, { type: "let-in", requestId: id }, actionId, now);
/** Asks, is let in by the leader and exchanges: a new member's session. */
async function joined(path: string, leader: string, link: string, name: string | null = null) {
  const asked = await askToJoin(path, link, name, "", NOW);
  await letIn(path, leader, await requestId(path, leader, asked.code));
  return exchangeJoin(path, asked.secret!, NOW);
}

test("the link alone grants nothing; asking, one approval and one exchange give exactly one new member and session", () => fixture(async path => {
  const { leader, link } = await team(path);
  const before = Object.keys((await stored(path)).participants).length;
  const asked = await askToJoin(path, link, "  Ari   B ", "", NOW);
  assert.equal(asked.status, "pending"); assert.match(asked.code, /^[A-Z0-9]{4}$/); assert.equal(asked.name, "Ari B");
  assert.equal(Object.keys((await stored(path)).participants).length, before, "a request is not a member");
  assert.deepEqual(await joinStatus(path, asked.secret!, NOW), { status: "pending", code: asked.code, name: "Ari B" });
  await assert.rejects(exchangeJoin(path, asked.secret!, NOW), status(409), "not before the leader lets them in");
  const id = await requestId(path, leader, asked.code);
  assert.equal((await letIn(path, leader, id)), "Let in. Their phone will join in a moment.");
  assert.equal((await joinStatus(path, asked.secret!, NOW))!.status, "approved");
  const session = await exchangeJoin(path, asked.secret!, NOW);
  const view = await sessionView(path, session, NOW);
  assert.match(view.session.activeActorId, RANDOM_ID);
  assert.ok(view.participants.some(participant => participant.id === view.session.activeActorId && participant.name === "Ari B"));
  assert.equal(view.membership, undefined, "a joined player sees no membership");
  const db = await stored(path);
  assert.equal(Object.keys(db.participants).length, before + 1);
  assert.equal(db.participants[view.session.activeActorId].seat, undefined, "joined members have no seat");
  // Replay: the request is gone, so a second exchange fails, and the status says so.
  await assert.rejects(exchangeJoin(path, asked.secret!, NOW), status(401));
  assert.equal(await joinStatus(path, asked.secret!, NOW), null);
  assert.equal(Object.keys((await stored(path)).participants).length, before + 1);
  // The secret is stored hashed: it never appears in the file, nor does the link.
  const raw = await readFile(path, "utf8");
  assert.ok(!raw.includes(asked.secret!) && !raw.includes(link));
}));

test("ten simultaneous approvals against the cap fill exactly the free places; replays change nothing", () => fixture(async path => {
  const { leader, guide, link } = await team(path);
  const asked = await Promise.all(Array.from({ length: PENDING_LIMIT }, () => askToJoin(path, link, null, "", NOW)));
  const ids = await Promise.all(asked.map(request => requestId(path, leader, request.code)));
  const sent = ids.flatMap(id => [{ token: leader, id, actionId: nextId() }, { token: guide, id, actionId: nextId() }]);
  const results = await Promise.allSettled(sent.map(item => letIn(path, item.token, item.id, NOW, item.actionId)));
  const free = TEAM_CAPACITY - 2;
  const view = await membership(path, leader);
  assert.equal(view.requests.filter(request => request.status === "approved").length, free);
  assert.equal(view.taken, TEAM_CAPACITY);
  assert.ok(results.filter(result => result.status === "rejected").every(result => (result as PromiseRejectedResult).reason.message === TEAM_FULL));
  // Every approval replayed with its own action ID: receipts answer, nothing changes.
  const before = await readFile(path, "utf8");
  for (const [index, item] of sent.entries()) if (results[index].status === "fulfilled") assert.equal(await letIn(path, item.token, item.id, NOW, item.actionId), "Action already synced.");
  assert.equal((await membership(path, leader)).requests.filter(request => request.status === "approved").length, free);
  assert.deepEqual(JSON.parse(await readFile(path, "utf8")).teams, JSON.parse(before).teams);
  // The approved devices collect; the team is full, and a new ask is refused.
  const approved = new Set(view.requests.filter(request => request.status === "approved").map(request => request.code));
  const sessions = await Promise.all(asked.filter(request => approved.has(request.code)).map(request => exchangeJoin(path, request.secret!, NOW)));
  assert.equal(new Set(sessions).size, free);
  assert.equal(Object.keys((await stored(path)).participants).length, TEAM_CAPACITY);
  await assert.rejects(askToJoin(path, link, null, "", NOW), status(409));
}));

test("asking again from the same device returns its request; a declined device can't ask again; the pending cap holds", () => fixture(async path => {
  const { leader, link } = await team(path);
  const first = await askToJoin(path, link, null, "", NOW);
  const again = await askToJoin(path, link, "Other", first.secret!, NOW);
  assert.equal(again.code, first.code); assert.equal(again.secret, undefined, "no new secret: nothing was made");
  assert.equal((await membership(path, leader)).requests.length, 1);
  await sessionAction(path, leader, { type: "decline", requestId: await requestId(path, leader, first.code) }, nextId(), NOW);
  assert.equal((await askToJoin(path, link, null, first.secret!, NOW)).status, "declined");
  assert.equal((await membership(path, leader)).requests.length, 0, "a declined request isn't shown and isn't remade");
  await assert.rejects(exchangeJoin(path, first.secret!, NOW), status(409));
  for (let i = 0; i < PENDING_LIMIT; i++) await askToJoin(path, link, null, "", NOW);
  await assert.rejects(askToJoin(path, link, null, "", NOW), status(429));
}));

test("expired requests can't be let in or exchanged, and their places free up", () => fixture(async path => {
  const { leader, link } = await team(path);
  const late = await askToJoin(path, link, null, "", NOW);
  const lateId = await requestId(path, leader, late.code);
  await assert.rejects(letIn(path, leader, lateId, NOW + PENDING_MS), /expired/);
  assert.equal(await joinStatus(path, late.secret!, NOW + PENDING_MS), null);
  const slow = await askToJoin(path, link, null, "", NOW);
  await letIn(path, leader, await requestId(path, leader, slow.code), NOW);
  assert.equal((await membership(path, leader)).taken, 3);
  await assert.rejects(exchangeJoin(path, slow.secret!, NOW + APPROVED_MS), status(401));
  assert.equal((await membership(path, leader, NOW + APPROVED_MS)).taken, 2, "the uncollected place is free again");
}));

test("only the team's leader session or the guide can invite, let in, decline or remove", () => fixture(async path => {
  const { leader, player, guide, link } = await team(path);
  const member = await joined(path, leader, link);
  const leaderSeatAgain = await signIn(path, "player-1");
  const asked = await askToJoin(path, link, null, "", NOW);
  const id = await requestId(path, leader, asked.code);
  const joinedId = (await sessionView(path, member, NOW)).session.activeActorId;
  for (const token of [player, member, leaderSeatAgain]) {
    await assert.rejects(createJoinLink(path, token, true, NOW), status(403));
    await assert.rejects(letIn(path, token, id), status(403));
    await assert.rejects(sessionAction(path, token, { type: "decline", requestId: id }, nextId(), NOW), status(403));
    await assert.rejects(sessionAction(path, token, { type: "remove-member", participantId: joinedId }, nextId(), NOW), status(403));
    assert.equal((await sessionView(path, token, NOW)).membership, undefined);
  }
  await assert.rejects(createJoinLink(path, "forged", true, NOW), status(401));
  assert.equal(await letIn(path, guide, id), "Let in. Their phone will join in a moment.");
  assert.ok((await membership(path, guide)).requests.length === 1);
}));

test("Invite players never replaces a link by itself; replacing cancels waiting requests and keeps approved ones", () => fixture(async path => {
  const { leader, link } = await team(path);
  await assert.rejects(createJoinLink(path, leader, false, NOW), status(409));
  const approved = await askToJoin(path, link, null, "", NOW);
  await letIn(path, leader, await requestId(path, leader, approved.code));
  const waiting = await askToJoin(path, link, null, "", NOW);
  const fresh = await createJoinLink(path, leader, true, NOW);
  assert.notEqual(fresh, link);
  assert.deepEqual((await membership(path, leader)).requests.map(request => request.code), [approved.code]);
  assert.equal(await joinStatus(path, waiting.secret!, NOW), null);
  await assert.rejects(askToJoin(path, link, null, "", NOW), status(404), "the old link is dead");
  assert.ok(await exchangeJoin(path, approved.secret!, NOW));
  assert.equal((await askToJoin(path, fresh, null, "", NOW)).status, "pending");
}));

test("removing a member ends their sessions, frees their roles and refuses their queued actions; the leader stays", () => fixture(async path => {
  const { leader, player, guide, link } = await team(path);
  const playerId = (await sessionView(path, player, NOW)).session.activeActorId;
  const second = await signIn(path, "player-4");
  assert.equal(await sessionAction(path, leader, { type: "remove-member", participantId: playerId }, nextId(), NOW), "Removed from the team.");
  for (const token of [player, second]) {
    await assert.rejects(sessionView(path, token, NOW), status(401));
    await assert.rejects(sessionAction(path, token, { missionId: WELL, type: "start" }, nextId(), NOW), status(401));
  }
  const db = await stored(path);
  assert.equal(db.teams.A.roles.navigator, null);
  assert.equal(db.applied[playerId], undefined);
  assert.ok(!Object.values(db.sessions as Record<string, { participantId: string }>).some(session => session.participantId === playerId));
  const leaderId = (await sessionView(path, leader, NOW)).session.activeActorId;
  await assert.rejects(sessionAction(path, guide, { type: "remove-member", participantId: leaderId }, nextId(), NOW), /leader can't be removed/);
  await assert.rejects(sessionAction(path, leader, { type: "remove-member", participantId: "guide" }, nextId(), NOW), status(403));
  // A device whose exchange reply was lost can't exchange again; its leader removes the member it left, and the place is free.
  const lost = await askToJoin(path, link, null, "", NOW);
  await letIn(path, leader, await requestId(path, leader, lost.code));
  await exchangeJoin(path, lost.secret!, NOW);
  await assert.rejects(exchangeJoin(path, lost.secret!, NOW), status(401));
  const orphan = Object.keys((await stored(path)).participants).find(id => id !== leaderId)!;
  await sessionAction(path, leader, { type: "remove-member", participantId: orphan }, nextId(), NOW);
  assert.equal((await membership(path, leader)).taken, 1);
}));

test("operator invitations can't overfill a team without --over-cap; a seat's member signing in again always can", () => fixture(async path => {
  const { leader, link } = await team(path);
  for (let i = 0; i < TEAM_CAPACITY - 2; i++) await joined(path, leader, link);
  await assert.rejects(issueInvitation(path, "player-6", NOW), status(409));
  await assert.rejects(issueHostInvitation(path, "player-6", NOW), status(409), "the adventure has started too, but the cap is checked");
  assert.ok(await signIn(path, "player-4"), "an existing member's seat still signs in");
  assert.ok(await signIn(path, "guide"), "the guide is in no team");
  // An invitation issued while there was space is refused if the team filled up since.
  await startNewAdventure(path, NOW);
  const early = await issueInvitation(path, "player-7", NOW);
  for (const seat of ["player-1", "player-2", "player-3", "player-4", "player-5"]) await signIn(path, seat);
  await assert.rejects(redeemInvitation(path, early, NOW), status(409));
  const override = await issueInvitation(path, "player-6", NOW, true);
  assert.equal(Object.values((await stored(path)).invitations as Record<string, { seat: string; overCap?: true }>).find(invitation => invitation.seat === "player-6")!.overCap, true);
  assert.ok(await redeemInvitation(path, override, NOW));
  assert.equal(Object.keys((await stored(path)).participants).length, TEAM_CAPACITY + 1);
}));

test("a malformed join field in the file fails closed", () => fixture(async path => {
  const { leader } = await team(path);
  const db = await stored(path);
  db.teams.A.joinRequests = { r_AAAAAAAAAAAAAAAA: { code: "AAAA", secretHash: "not-a-hash", createdAt: NOW, expiresAt: NOW + 1, status: "approved" } };
  await writeFile(path, JSON.stringify(db));
  await assert.rejects(sessionView(path, leader, NOW), /Unsupported Shuk storage state/);
}));

// HTTP: same-origin JSON, cookies, the already-signed-in rule, the rate limit and the kill switch.
const ORIGIN = "http://127.0.0.1:3000";
const DEV = { NODE_ENV: "development", SHUK_DEV_SIMULATION: "1", SHUK_JOIN_LINKS: "1" };
type Call = { cookie?: string; environment?: Readonly<Record<string, string>>; origin?: string; host?: string; type?: string; query?: string };
function call(path: string, body: object | null, { cookie = "", environment = DEV, origin = ORIGIN, host = "127.0.0.1:3000", type = "application/json", query = "" }: Call = {}) {
  const headers: Record<string, string> = { host, origin, cookie };
  if (body) headers["content-type"] = type;
  return handleParticipantRequest(new Request(`${host.startsWith("127.") ? "http" : "https"}://${host}/api${query}`, { method: body ? "POST" : "GET", headers, ...(body ? { body: JSON.stringify(body) } : {}) }), path, environment as unknown as NodeJS.ProcessEnv);
}
const setCookies = (response: Response) => response.headers.getSetCookie();
const valueOf = (cookies: string[], name: string) => cookies.find(item => item.startsWith(name + "="))!.split(";")[0].slice(name.length + 1);

test("HTTP: ask, poll and exchange with HttpOnly SameSite=Strict cookies; CSRF rules hold; a signed-in device makes nothing", () => fixture(async path => {
  resetJoinAsks();
  const { leader, link } = await team(path);
  assert.equal((await call(path, { type: "join-ask", link }, { origin: "http://evil.example" })).status, 403);
  assert.equal((await call(path, { type: "join-ask", link }, { type: "text/plain" })).status, 403);
  assert.equal((await call(path, { type: "join-ask", link }, { cookie: `shuk_session=${leader}` })).status, 409, "already in");
  assert.equal((await membership(path, leader)).requests.length, 0);
  const asked = await call(path, { type: "join-ask", link, name: "Bea" });
  assert.equal(asked.status, 200);
  const cookies = setCookies(asked);
  const joinCookie = cookies.find(item => item.startsWith("shuk_join="))!;
  assert.match(joinCookie, /HttpOnly/); assert.match(joinCookie, /SameSite=Strict/); assert.match(joinCookie, /Max-Age=1500/); assert.match(joinCookie, /Path=/);
  assert.doesNotMatch(joinCookie, /Secure/, "loopback HTTP");
  const secret = valueOf(cookies, "shuk_join");
  const body = await asked.json() as { code: string; status: string };
  assert.ok(!JSON.stringify(body).includes(secret), "the secret travels only in the cookie");
  const poll = await call(path, null, { cookie: `shuk_join=${secret}`, query: "?join=status" });
  assert.deepEqual(await poll.json(), { status: "pending", code: body.code, name: "Bea" });
  await letIn(path, leader, await requestId(path, leader, body.code));
  const exchanged = await call(path, { type: "join-exchange" }, { cookie: `shuk_join=${secret}` });
  assert.equal(exchanged.status, 200);
  const after = setCookies(exchanged);
  assert.match(after.find(item => item.startsWith("shuk_join="))!, /Max-Age=0/);
  const session = valueOf(after, "shuk_session");
  const view = await call(path, null, { cookie: `shuk_session=${session}` });
  assert.equal(view.status, 200);
  assert.equal((await call(path, { type: "join-exchange" }, { cookie: `shuk_join=${secret}` })).status, 401, "no second exchange");
  const gone = await call(path, null, { cookie: `shuk_join=${secret}`, query: "?join=status" });
  assert.deepEqual(await gone.json(), { status: "gone" }); assert.match(setCookies(gone)[0], /^shuk_join=; .*Max-Age=0/);
  // The leader's view carries membership; the link call is for the leader session only.
  const leaderView = await (await call(path, null, { cookie: `shuk_session=${leader}` })).json() as { membership?: { taken: number } };
  assert.equal(leaderView.membership!.taken, 3, "the leader, the navigator and the new member; the guide counts for nothing");
  assert.equal((await call(path, { type: "join-link" }, { cookie: `shuk_session=${session}` })).status, 403);
  const replaced = await call(path, { type: "join-link", replace: true }, { cookie: `shuk_session=${leader}` });
  assert.match((await replaced.json() as { link: string }).link, /^[A-Za-z0-9_-]{43}$/);
}));

test("HTTP: the join cookie is Secure on the https app; the rate limit refuses before the file is touched", () => fixture(async path => {
  resetJoinAsks();
  const { link } = await team(path);
  const app = { NEXT_PUBLIC_DORI_APP: "shuk", NODE_ENV: "production", SHUK_APP: "1", SHUK_PUBLIC_ORIGIN: "https://doriisrael.com", SHUK_JOIN_LINKS: "1" };
  const secure = await call(path, { type: "join-ask", link }, { environment: app, origin: "https://doriisrael.com", host: "doriisrael.com" });
  assert.equal(secure.status, 200); assert.match(setCookies(secure)[0], /; Secure/);
  for (let i = 1; i < ASKS_PER_LINK; i++) await call(path, { type: "join-ask", link: "x".repeat(43) });
  for (let i = 1; i < ASKS_PER_LINK; i++) await call(path, { type: "join-ask", link }, { cookie: "shuk_join=" + "y".repeat(43) });
  const before = await readFile(path);
  const refused = await call(path, { type: "join-ask", link });
  assert.equal(refused.status, 429);
  assert.ok((await readFile(path)).equals(before), "a rate-limited ask writes nothing");
}));

test("HTTP: with join links off, ask, status, exchange and link answer 404 and the view has no membership", () => fixture(async path => {
  const { leader, link } = await team(path);
  const off = { NODE_ENV: "development", SHUK_DEV_SIMULATION: "1" };
  for (const body of [{ type: "join-ask", link }, { type: "join-exchange" }, { type: "join-link" }]) {
    assert.equal((await call(path, body, { environment: off, cookie: `shuk_session=${leader}` })).status, 404);
  }
  assert.equal((await call(path, null, { environment: off, query: "?join=status" })).status, 404);
  const view = await (await call(path, null, { environment: off, cookie: `shuk_session=${leader}` })).json() as { membership?: unknown };
  assert.equal(view.membership, undefined);
  // Actions still answer with the view, without membership.
  const leaderId = (await sessionView(path, leader, NOW)).session.activeActorId;
  const acted = await call(path, { type: "claim-role", role: "answerSubmitter", actionId: nextId(), expectedParticipantId: leaderId, puzzleRevision: WATER_PUZZLE_REVISION },
    { environment: off, cookie: `shuk_session=${leader}` });
  assert.equal(acted.status, 200); assert.equal((await acted.json() as { membership?: unknown }).membership, undefined);
}));
