// S0-A benchmark for the Shuk's HTTP polling and action queue (test data only; never point it at the live app).
// It drives an isolated container the way phones do: a GET of the team view every 1.5 s, actions through a local queue that
// flushes at once and retries every 2 s (as IndexWaterTask does), with the same Host, Origin and cookie rules as production.
// Run with: node --experimental-strip-types --disable-warning=ExperimentalWarning scripts/shuk-sync-bench.mjs <command> …
//   login <target> <tokens.txt> <sessions.jsonl>   redeem "seat token" lines through POST login, one session each
//   start <target> <sessions.jsonl>                the host session sets the count (5) and starts the adventure
//   run <target> <sessions.jsonl> <realistic|stress> <clients> <seconds> <restartAt> <out.json>   a workload (below), then a summary
//       as JSON with the S0-B thresholds checked; restartAt (seconds, 0 for none) is when the shell kills and restarts the server
//   parse <state.json> <sessions.jsonl> <out.json> the cost of reading the state file as `db.applied` grows (store functions)
import http from "node:http";
import { readFileSync, writeFileSync, appendFileSync, mkdtempSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

const HOST = "doriisrael.com", ORIGIN = "https://doriisrael.com", API = "/shuk/api/amazing-shuk/dev";
const POLL_MS = 1500, FLUSH_MS = 2000;
const { MURAL_MISSION_ID, MURAL_CHALLENGE } = await import("../lib/amazing-shuk/mural-task.ts");
const OPTIONS = MURAL_CHALLENGE.options.map(option => option.id);
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const pct = (values, p) => { if (!values.length) return null; const s = [...values].sort((a, b) => a - b); return +s[Math.min(s.length - 1, Math.ceil(p / 100 * s.length) - 1)].toFixed(1); };
const summary = values => ({ n: values.length, p50: pct(values, 50), p95: pct(values, 95), p99: pct(values, 99), max: pct(values, 100) });

// A kept-alive socket the server closed as idle just as it was reused fails with "socket hang up"; browsers resend such a request
// on a new connection, and so does this bench (once, as Node's docs advise). Each resend is counted.
const resent = { count: 0 };
async function request(target, agent, method, path, cookie, body) {
  const res = await requestOnce(target, agent, method, path, cookie, body);
  if (!res.reusedSocketReset) return res;
  resent.count++;
  return requestOnce(target, agent, method, path, cookie, body);
}

function requestOnce(target, agent, method, path, cookie, body) {
  const url = new URL(target);
  const payload = body === undefined ? null : JSON.stringify(body);
  const headers = { Host: HOST, ...(cookie ? { Cookie: cookie } : {}), ...(payload ? { Origin: ORIGIN, "Content-Type": "application/json", "Content-Length": Buffer.byteLength(payload) } : {}) };
  const started = performance.now();
  return new Promise(resolve => {
    const req = http.request({ host: url.hostname, port: url.port, method, path, headers, agent }, res => {
      const chunks = [];
      res.on("data", chunk => chunks.push(chunk));
      res.on("end", () => {
        const raw = Buffer.concat(chunks);
        let json = null; try { json = JSON.parse(raw.toString("utf8")); } catch { /* Empty or not JSON. */ }
        // Bytes on the wire without TLS or HTTP/2 framing (Caddy adds those): status line, headers and body.
        const bytesIn = raw.length + res.rawHeaders.reduce((sum, item) => sum + item.length + 2, 0) + 17;
        const bytesOut = (payload ? Buffer.byteLength(payload) : 0) + Object.entries(headers).reduce((sum, [k, v]) => sum + k.length + String(v).length + 4, 0) + method.length + path.length + 12;
        resolve({ status: res.statusCode, json, ms: performance.now() - started, bytesIn, bytesOut, setCookie: res.headers["set-cookie"] });
      });
    });
    req.on("error", error => resolve({ status: 0, json: { error: error.message }, ms: performance.now() - started, bytesIn: 0, bytesOut: 0,
      reusedSocketReset: req.reusedSocket && error.code === "ECONNRESET" }));
    req.setTimeout(15_000, () => req.destroy(new Error("timeout")));
    if (payload) req.write(payload);
    req.end();
  });
}

async function login(target, tokensFile, out) {
  const agent = new http.Agent({ keepAlive: false });
  for (const line of readFileSync(tokensFile, "utf8").split("\n").filter(Boolean)) {
    const [seat, token] = line.trim().split(/\s+/);
    const res = await request(target, agent, "POST", API, "", { type: "login", token });
    const cookie = String(res.setCookie?.[0] ?? "").split(";")[0];
    if (res.status !== 200 || !cookie.startsWith("shuk_session=")) throw new Error(`login failed for ${seat}: ${res.status}`);
    // Since schema 7 a seat's member has a random ID; actions must name it, so take it from the session's own view.
    const participantId = (await request(target, agent, "GET", API, cookie)).json?.session?.activeActorId;
    if (typeof participantId !== "string") throw new Error(`no participant ID in the view for ${seat}`);
    appendFileSync(out, JSON.stringify({ seat, participantId, cookie }) + "\n");
  }
}

const readSessions = file => readFileSync(file, "utf8").split("\n").filter(Boolean).map(line => JSON.parse(line));

async function start(target, sessionsFile) {
  const agent = new http.Agent({ keepAlive: false });
  const host = readSessions(sessionsFile)[0];
  for (const body of [{ type: "set-intended-count", count: 5 }, { type: "start-adventure" }]) {
    const view = (await request(target, agent, "GET", API, host.cookie)).json;
    const res = await request(target, agent, "POST", API, host.cookie, { ...body, actionId: randomUUID(), expectedParticipantId: host.participantId, puzzleRevision: view.puzzleRevision });
    console.log(body.type, res.status, res.json?.message ?? res.json?.error);
  }
}

// One simulated phone: a 1.5 s poll that never waits for the last one, and the persistent queue's flush (at once, then every 2 s).
// Both timers start at a random phase, as phones that opened the page at different moments; a shared wake brings them together.
class Phone {
  constructor(index, session, target, stats) {
    Object.assign(this, { index, ...session, target, stats, queue: [], flushing: false, asleep: false, view: null, revision: null, bytesIn: 0, bytesOut: 0, timers: [] });
    this.agent = new http.Agent({ keepAlive: true, maxSockets: 4 });
  }
  async send(method, body) {
    const res = await request(this.target, this.agent, method, API + "?mission=" + MURAL_MISSION_ID, this.cookie, body);
    this.bytesIn += res.bytesIn; this.bytesOut += res.bytesOut;
    this.stats.observe(res);
    return res;
  }
  async poll() {
    if (this.asleep) return;
    const res = await this.send("GET");
    this.stats.get.push(res.ms); this.stats.status[res.status] = (this.stats.status[res.status] ?? 0) + 1;
    if (res.status === 200) { this.view = res.json; this.revision = res.json.puzzleRevision; }
  }
  begin() {
    this.timers.push(setTimeout(() => { void this.poll(); this.timers.push(setInterval(() => void this.poll(), POLL_MS)); }, Math.random() * POLL_MS));
    this.timers.push(setTimeout(() => { void this.flush(); this.timers.push(setInterval(() => void this.flush(), FLUSH_MS)); }, Math.random() * FLUSH_MS));
  }
  // Back online: an action tapped while asleep or offline starts its online-to-done time now.
  wake() {
    this.asleep = false;
    const now = Date.now();
    for (const item of this.queue) { const record = this.stats.byAction.get(item.actionId); if (record.onlineAt === null) record.onlineAt = now; }
    void this.poll(); void this.flush();
  }
  stop() { for (const timer of this.timers) { clearTimeout(timer); clearInterval(timer); } this.agent.destroy(); }
  // Every action is recorded when it is created, so one that never reaches the server is still accounted for.
  // `loseReply`: the server answers but the phone never hears it (a drop mid-request), so the same action stays queued and replays.
  act(action, { duplicate = false, loseReply = false } = {}) {
    const item = { ...action, actionId: randomUUID(), queuedAt: performance.now(), loseReply };
    this.stats.byAction.set(item.actionId, { type: action.type, applied: 0, synced: 0, rejected: 0, busy: 0, createdAt: Date.now(), onlineAt: this.asleep ? null : Date.now(), doneAt: null, reasons: [] });
    this.queue.push(item);
    if (duplicate) this.stats.duplicates.push(item.actionId);
    void this.flush();
    // A second copy at the same moment, as from a second tab or a retry racing the first.
    if (duplicate) void this.post(item, true);
  }
  async post(item, extra = false) {
    const res = await this.send("POST", { ...item, queuedAt: undefined, loseReply: undefined, expectedParticipantId: this.participantId, puzzleRevision: this.revision });
    this.stats.post.push(res.ms);
    this.stats.status[res.status] = (this.stats.status[res.status] ?? 0) + 1;
    if (res.status === 503) this.stats.busy += 1;
    const message = res.json?.message ?? "";
    const record = this.stats.byAction.get(item.actionId);
    if (res.status === 200 && message === "Action already synced.") record.synced += 1;
    else if (res.status === 200) record.applied += 1;
    else if (res.status === 503) record.busy += 1;
    else if (res.status >= 400 && res.status !== 401 && res.status !== 409 && res.status < 500) { record.rejected += 1; record.reasons.push(`${res.status} ${reasonOf(res)}`); }
    if (extra) this.stats.extraReplies.push(res.status + ":" + (message || res.json?.error || ""));
    return res;
  }
  async flush() {
    if (this.asleep || this.flushing || !this.queue.length) return;
    this.flushing = true;
    try {
      while (this.queue.length && !this.asleep) {
        const item = this.queue[0];
        const res = await this.post(item);
        // As the app: a server error, a lost session or a changed identity keeps the action for the next flush.
        if (res.status >= 500 || res.status === 401 || res.status === 409 || res.status === 0) return;
        if (item.loseReply) { item.loseReply = false; this.stats.lostReplies += 1; return; }
        this.queue.shift();
        this.stats.byAction.get(item.actionId).doneAt = Date.now();
        this.stats.endToEnd.push(performance.now() - item.queuedAt);
        if (res.status === 200) { this.view = res.json; }
      }
    } finally { this.flushing = false; }
  }
}

// A rejection's reason without the numbers and role names that vary between runs.
const reasonOf = res => String(res.json?.error ?? res.json?.message ?? "").replace(/\d+ of \d+|navigator|answer-submitter/gi, "…");

// What every member must agree on once the queues are empty: the team's roles and the mural's shared state.
const shared = view => JSON.stringify({ roles: view?.session?.roles, selected: [...(view?.session?.selected ?? [])].sort(), completed: view?.session?.completed,
  started: view?.performance?.started, hintsUsed: view?.performance?.hintsUsed, missions: view?.missions?.map(m => m.id + ":" + m.state) });

// The proposed S0-B acceptance thresholds (multiplayer plan, 31 Oct 2026). Every workload also needs 0 applied twice,
// 0 pending or unaccounted actions, 0 operational errors outside a restart, and one final state.
const THRESHOLDS = {
  realistic: { p95: 1000, p99: 3000, max: 10_000, busyShare: 0.01, drainMs: 5000 },
  stress: { p95: 3000, p99: 10_000, max: 30_000, busyShare: 0.05, drainMs: 15_000, restartBacklogMs: 30_000 },
};
const DRAIN_MAX_MS = 300_000;
// The realistic group picks among one real item and the painted ones, so a submission is always "Not quite" and the mural stays open.
const REALISTIC_OPTIONS = MURAL_CHALLENGE.options.filter(option => !option.correct || option.id === OPTIONS[0]).map(option => option.id);

/** The realistic stand-in for one cooperative team: a group action every ~15 s, a decision burst every minute, few contenders. */
async function realisticScenario({ guide, players, at, t0, seconds, events, pick }) {
  const toggle = phone => {
    const selected = phone.view?.session?.selected ?? [];
    const optionId = selected.length >= 2 ? pick(selected) : pick(REALISTIC_OPTIONS.filter(id => !selected.includes(id)));
    phone.act({ type: "toggle-choice", missionId: MURAL_MISSION_ID, optionId }, { loseReply: Math.random() < 0.02 });
  };
  await at(10);
  const contenders = [...players].sort(() => Math.random() - 0.5);
  contenders.slice(0, 3).forEach(phone => setTimeout(() => phone.act({ type: "claim-role", role: "navigator" }), Math.random() * 1000));
  contenders.slice(3, 5).forEach(phone => setTimeout(() => phone.act({ type: "claim-role", role: "answerSubmitter" }), Math.random() * 1000));
  events.push("role claims: 3 and 2 contenders");
  await at(20);
  (guide ?? players[0]).act({ type: "start", missionId: MURAL_MISSION_ID });
  events.push("mural started");
  const playUntil = seconds * 0.85;
  let nextBurst = 45;
  while (performance.now() - t0 < playUntil * 1000) {
    const now = (performance.now() - t0) / 1000;
    if (now >= nextBurst) {
      // A decision: 3–5 phones change the picks within a second, then the answer-submitter's phone submits.
      const burst = [...players].sort(() => Math.random() - 0.5).slice(0, 3 + Math.floor(Math.random() * 3));
      burst.forEach(phone => setTimeout(() => toggle(phone), Math.random() * 1000));
      setTimeout(() => {
        const submitterId = (guide ?? players[0]).view?.session?.roles?.answerSubmitter ?? null;
        const submitter = players.find(phone => phone.participantId === submitterId);
        if (submitter && (submitter.view?.session?.selected ?? []).length === 2) submitter.act({ type: "submit", missionId: MURAL_MISSION_ID }, { loseReply: Math.random() < 0.02 });
      }, 1500);
      nextBurst += 60;
    } else if (Math.random() < 0.5 / 15) {
      const phone = pick(players);
      if (Math.random() < 0.03) phone.act({ type: "hint", hint: Math.min(3, (phone.view?.performance?.hintsUsed ?? 0) + 1), step: 0, missionId: MURAL_MISSION_ID });
      else toggle(phone);
    }
    await sleep(500);
  }
}

/** The S0-A stress scenario, unchanged in rate, plus every phone waking at once and a killed server (the shell kills it at `restartAt`). */
async function stressScenario({ phones, guide, players, at, t0, seconds, events, pick }) {
  // 0–20 s: polling only. 20 s: every player races for each role (exactly one seat may win each).
  await at(Math.min(20, seconds * 0.12));
  for (const role of ["navigator", "answerSubmitter"]) for (const phone of players) phone.act({ type: "claim-role", role });
  events.push("role race");
  await at(Math.min(30, seconds * 0.18));
  (guide ?? players[0]).act({ type: "start", missionId: MURAL_MISSION_ID });
  events.push("mural started");
  // Gameplay: each phone taps about every 5 s (picks, the odd hint), 10% sent twice at once, 5% losing the reply.
  const playUntil = seconds * 0.8, sleepAt = seconds * 0.35, wakeAt = sleepAt + 30, allSleepAt = seconds * 0.55, allWakeAt = allSleepAt + 10;
  const sleepers = phones.filter((_, index) => index % 4 === 3);
  let stage = 0;
  while (performance.now() - t0 < playUntil * 1000) {
    const now = (performance.now() - t0) / 1000;
    if (stage === 0 && now >= sleepAt) { for (const phone of sleepers) phone.asleep = true; stage = 1; events.push(`${sleepers.length} phones asleep 30 s`); }
    if (stage === 1 && now >= wakeAt) { for (const phone of sleepers) phone.wake(); stage = 2; events.push("phones awake"); }
    if (stage === 2 && now >= allSleepAt) { for (const phone of phones) phone.asleep = true; stage = 3; events.push("every phone offline 10 s"); }
    if (stage === 3 && now >= allWakeAt) { for (const phone of phones) phone.wake(); stage = 4; events.push("every phone back at once"); }
    for (const phone of phones) {
      if (Math.random() > 0.2 * 0.5) continue; // ~1 tap per 5 s per phone at a 500 ms tick.
      const selected = phone.view?.session?.selected ?? [];
      const roll = Math.random();
      const action = roll < 0.03 ? { type: "hint", hint: Math.min(3, (phone.view?.performance?.hintsUsed ?? 0) + 1), step: 0, missionId: MURAL_MISSION_ID }
        : { type: "toggle-choice", missionId: MURAL_MISSION_ID, optionId: selected.length >= 2 && Math.random() < 0.7 ? pick(selected) : pick(OPTIONS) };
      phone.act(action, { duplicate: Math.random() < 0.1, loseReply: Math.random() < 0.05 });
    }
    await sleep(500);
  }
  // A run too short for the sleeps to end still drains every phone.
  if (phones.some(phone => phone.asleep)) { for (const phone of phones) phone.wake(); events.push("remaining sleepers woken"); }
}

async function run(target, sessionsFile, workload, clients, seconds, restartAt, out) {
  if (!THRESHOLDS[workload]) throw new Error("workload must be realistic or stress");
  const sessions = readSessions(sessionsFile).slice(0, clients);
  if (sessions.length < clients) throw new Error(`only ${sessions.length} sessions for ${clients} clients`);
  const t0 = performance.now(), at = s => sleep(Math.max(0, t0 + s * 1000 - performance.now()));
  // Operational errors: no answer, a server error other than "busy", a lost session or a changed identity. Each is kept with its
  // time, and after the run they are split by the restart window the shell recorded (kill to healthy again) in restart.json.
  const failures = [];
  const stats = { get: [], post: [], endToEnd: [], status: {}, busy: 0, duplicates: [], extraReplies: [], lostReplies: 0, byAction: new Map(),
    observe(res) {
      if (res.status === 0 || (res.status >= 500 && res.status !== 503) || res.status === 401 || res.status === 409) {
        failures.push({ at: Date.now(), key: `${res.status} ${reasonOf(res)}`.trim() });
      }
    } };
  const phones = sessions.map((session, index) => new Phone(index, session, target, stats));
  const guide = phones.find(phone => phone.seat === "guide");
  const players = phones.filter(phone => phone.seat !== "guide");
  const pick = list => list[Math.floor(Math.random() * list.length)];
  const events = [];
  for (const phone of phones) phone.begin();
  await (workload === "realistic" ? realisticScenario : stressScenario)({ phones, guide, players, at, t0, seconds, events, pick });

  events.push("taps stop; queues drain");
  // Drain: wait for every queue to empty (retries included), up to DRAIN_MAX_MS, then one last read by every phone.
  const drainStart = performance.now();
  while (phones.some(phone => phone.queue.length) && performance.now() - drainStart < DRAIN_MAX_MS) await sleep(100);
  const drainMs = performance.now() - drainStart;
  const pendingIds = new Set(phones.flatMap(phone => phone.queue.map(item => item.actionId)));
  await at(seconds);
  for (const phone of phones) phone.stop();
  const finals = await Promise.all(phones.map(async phone => { const agent = new http.Agent(); const res = await request(target, agent, "GET", API + "?mission=" + MURAL_MISSION_ID, phone.cookie); agent.destroy(); return res.json; }));
  const elapsed = (performance.now() - t0) / 1000;

  // Every created action ends in exactly one of these: applied (a reply said so), applied with the reply lost (only "already synced"
  // came back), rejected with a reason, or still pending. Anything else is unaccounted.
  const entries = [...stats.byAction.entries()];
  const appliedIds = entries.filter(([, r]) => r.applied > 0).map(([id]) => id);
  const outcome = { created: entries.length, applied: 0, syncedOnly: 0, rejected: 0, pending: 0, unaccounted: 0 };
  const reasons = {};
  for (const [id, r] of entries) {
    if (r.applied > 0) outcome.applied += 1;
    else if (r.synced > 0) outcome.syncedOnly += 1;
    else if (pendingIds.has(id)) outcome.pending += 1;
    else if (r.rejected > 0) { outcome.rejected += 1; const key = `${r.type}: ${r.reasons[0]}`; reasons[key] = (reasons[key] ?? 0) + 1; }
    else outcome.unaccounted += 1;
  }
  // The restart: actions created before the server was healthy again and not yet done then are its backlog; the backlog is cleared
  // when the last of them is done.
  let window = null;
  if (restartAt > 0) {
    try { window = JSON.parse(readFileSync(join(dirname(out), "restart.json"), "utf8")); } catch { window = { error: "restart.json missing: the restart did not complete" }; }
  }
  const inWindow = at => window?.killedAt !== undefined && at >= window.killedAt && at <= window.healthyAt;
  const operational = { inWindow: {}, outside: {} };
  for (const failure of failures) { const bucket = inWindow(failure.at) ? operational.inWindow : operational.outside; bucket[failure.key] = (bucket[failure.key] ?? 0) + 1; }
  const backlog = window?.healthyAt === undefined ? [] : entries.filter(([, r]) => r.createdAt <= window.healthyAt && (r.doneAt === null || r.doneAt > window.healthyAt)).map(([, r]) => r);
  const restartBacklogMs = window?.healthyAt === undefined ? null : backlog.some(r => r.doneAt === null) ? "not cleared"
    : Math.max(0, ...backlog.map(r => r.doneAt - window.healthyAt));
  const records = entries.map(([, r]) => r);
  // queuedToDone includes the time a phone was asleep or offline by design; onlineToDone starts when the phone is back online
  // (diagnostic only: the thresholds below are unchanged and still use queuedToDone).
  const onlineToDone = summary(entries.map(([, r]) => r).filter(r => r.doneAt !== null && r.onlineAt !== null).map(r => Math.max(0, r.doneAt - r.onlineAt)));
  const latency = { get: summary(stats.get), post: summary(stats.post), queuedToDone: summary(stats.endToEnd), onlineToDone };
  const busyShare = +(stats.busy / Math.max(1, stats.post.length)).toFixed(4);
  const finalStates = new Set(finals.map(shared)).size;

  const limit = THRESHOLDS[workload];
  const checks = {
    [`queuedToDone p95 ≤ ${limit.p95} ms`]: (latency.queuedToDone.p95 ?? 0) <= limit.p95,
    [`queuedToDone p99 ≤ ${limit.p99} ms`]: (latency.queuedToDone.p99 ?? 0) <= limit.p99,
    [`queuedToDone max ≤ ${limit.max} ms`]: (latency.queuedToDone.max ?? 0) <= limit.max,
    [`busy share ≤ ${limit.busyShare}`]: busyShare <= limit.busyShare,
    [`drain ≤ ${limit.drainMs} ms with 0 left`]: drainMs <= limit.drainMs && pendingIds.size === 0,
    ...(limit.restartBacklogMs && restartAt > 0 ? { [`restart backlog cleared ≤ ${limit.restartBacklogMs} ms after recovery`]: typeof restartBacklogMs === "number" && restartBacklogMs <= limit.restartBacklogMs } : {}),
    "applied twice = 0": records.filter(r => r.applied > 1).length === 0,
    "pending and unaccounted = 0": outcome.pending === 0 && outcome.unaccounted === 0,
    "operational errors outside a restart = 0": Object.keys(operational.outside).length === 0,
    "one final state": finalStates === 1,
  };
  const result = {
    workload, clients, seconds: +elapsed.toFixed(1), events,
    requests: { total: stats.get.length + stats.post.length, perSecond: +((stats.get.length + stats.post.length) / elapsed).toFixed(1), get: stats.get.length, post: stats.post.length, status: stats.status },
    latencyMs: latency,
    lock: { busyReplies: stats.busy, busyShare, actionsThatHitBusy: records.filter(r => r.busy).length },
    actions: { ...outcome, appliedTwice: records.filter(r => r.applied > 1).length, duplicatesSent: stats.duplicates.length, lostReplies: stats.lostReplies,
      rejectionReasons: Object.entries(reasons).sort((a, b) => b[1] - a[1]),
      extraReplyKinds: Object.entries(stats.extraReplies.reduce((acc, s) => { const k = s.replace(/\d+ of \d+|navigator|answer-submitter/gi, "…"); acc[k] = (acc[k] ?? 0) + 1; return acc; }, {})) },
    operational,
    resentAfterReusedSocketReset: resent.count,
    restart: window && { ...window, downMs: window.healthyAt - window.killedAt, backlogAtHealthy: backlog.length, backlogClearedMs: restartBacklogMs },
    transferPerClient: { bytesInPerMin: Math.round(phones.reduce((s, p) => s + p.bytesIn, 0) / phones.length / (elapsed / 60)), bytesOutPerMin: Math.round(phones.reduce((s, p) => s + p.bytesOut, 0) / phones.length / (elapsed / 60)) },
    viewBytes: finals[0] ? Buffer.byteLength(JSON.stringify(finals[0])) : null,
    recovery: { drainMs: Math.round(drainMs), drainTimedOut: pendingIds.size > 0, queuesLeft: pendingIds.size,
      converged: finalStates === 1, distinctFinalStates: finalStates, roles: finals[0]?.session?.roles ?? null },
    thresholds: { passed: Object.values(checks).every(Boolean), checks },
    appliedIds,
  };
  writeFileSync(out, JSON.stringify(result, null, 2));
  const printable = { ...result }; delete printable.appliedIds;
  console.log(JSON.stringify(printable, null, 2));
}

// Reading cost as the receipt history grows: the store's own sessionView (read + parse + migrate + view) and one action's
// transaction (lock, read, parse, write, fsync, rename), on a copy of the benchmark's state with synthetic receipts added.
async function parse(stateFile, sessionsFile, out) {
  const store = await import("../lib/amazing-shuk/participant-store.ts");
  const session = readSessions(sessionsFile).find(s => s.seat !== "guide");
  const token = session.cookie.split("=")[1];
  const base = JSON.parse(readFileSync(stateFile, "utf8"));
  const dir = mkdtempSync(join(tmpdir(), "shuk-parse-"));
  const rows = [];
  for (const perParticipant of [0, 100, 500, 1000, 3000, 10000]) {
    const db = structuredClone(base);
    for (const id of Object.keys(db.applied)) db.applied[id] = [...db.applied[id], ...Array.from({ length: perParticipant }, () => randomUUID())];
    const path = join(dir, `state-${perParticipant}.json`);
    writeFileSync(path, JSON.stringify(db));
    const bytes = readFileSync(path).length;
    const reads = [];
    for (let i = 0; i < 60; i++) { const t = performance.now(); await store.sessionView(path, token, Date.now(), MURAL_MISSION_ID); reads.push(performance.now() - t); }
    const writes = [];
    for (let i = 0; i < 20; i++) {
      const t = performance.now();
      await store.sessionAction(path, token, { type: "toggle-choice", missionId: MURAL_MISSION_ID, optionId: OPTIONS[i % 2] }, randomUUID(), Date.now(), session.participantId).catch(() => {});
      writes.push(performance.now() - t);
    }
    rows.push({ receiptsPerParticipant: perParticipant, participants: Object.keys(db.applied).length, fileKB: +(bytes / 1024).toFixed(1), readMs: summary(reads), actionMs: summary(writes) });
  }
  writeFileSync(out, JSON.stringify(rows, null, 2));
  console.table(rows.map(r => ({ receipts: r.receiptsPerParticipant, participants: r.participants, fileKB: r.fileKB, readP50: r.readMs.p50, readP95: r.readMs.p95, actionP50: r.actionMs.p50, actionP95: r.actionMs.p95 })));
}

const [command, ...args] = process.argv.slice(2);
if (command === "login") await login(args[0], args[1], args[2]);
else if (command === "start") await start(args[0], args[1]);
else if (command === "run") await run(args[0], args[1], args[2], Number(args[3]), Number(args[4]), Number(args[5] ?? 0), args[6]);
else if (command === "parse") await parse(args[0], args[1], args[2]);
else { console.error("Usage: login | start | run | parse (see the header)"); process.exit(2); }
