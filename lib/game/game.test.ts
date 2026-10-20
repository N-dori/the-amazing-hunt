// Run: node --experimental-strip-types --test lib/game/*.test.ts  (npm test)
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { normalise, scoreQuestion } from "./answers.ts";
import { archiveTracks, crises, reconstruction, sites } from "./content.ts";
import { applyGuideAction, applyTeamAction, GameError, newSession, teamMaxScore, teamScore } from "./engine.ts";
import { checkArrival, distanceMeters } from "./geo.ts";
import { buildPrompt, generateReply, scriptedReply, validateReply } from "./harmony.ts";
import type { SessionState, Site, TeamAction } from "./types.ts";
import { playerView } from "./views.ts";

const now = new Date("2026-10-26T09:00:00Z");
const team = (state: SessionState, device: string, action: TeamAction) => applyTeamAction(state, device, action, now);

const discoveryAnswers = { A: "the United States", B: "The crack is the rifts and conflicts of human history" };

// Two teams of three, one phone each except Team A's second phone, at 00B after the briefing.
function briefed(): SessionState {
  let state = newSession("TEST01", now);
  for (const [device, teamId] of [["a1", "A"], ["a2", "A"], ["b1", "B"]] as const) state = team(state, device, { type: "joinTeam", teamId });
  return applyGuideAction(state, { type: "completeBriefing" }, now);
}

// Both teams through the Library's 00B and 00C, ready for the 00D archive.
function joined(): SessionState {
  let state = briefed();
  for (const [device, teamId] of [["a1", "A"], ["b1", "B"]] as const) {
    state = team(state, device, { type: "submitTimeline", answer: "1946" });
    state = team(state, device, { type: "submitDiscovery", answer: discoveryAnswers[teamId] });
  }
  return state;
}

const archiveAnswers = {
  A: { "a.lost": ["The names written on the photograph"], "a.clinic": ["mazor"], "a.identifier": ["il-inl-ybz 0024-009"] },
  B: { "b.photoDate": ["c1939"], "b.clinicYear": ["1925"], "b.identifier": ["IL-INL-YBZ-0024-004"], "b.twoDates": ["The clinic is older than the photo"] },
};
const reconAnswers = {
  "r.priorUse": ["tavern"], "r.people": ["armoza"], "r.newUse": ["synagogue"], "r.services": ["charity", "mazor"],
  "r.unknown": ["Whether every resident agreed"],
};
const proposal = { text: "Keep a phone line inside the new station.", stakeholders: "Elderly residents, medics", tradeoffs: "Cost vs access" };

// Drives one team from the archive to an awaiting-reveal proposal, the guide confirming arrivals.
function playThrough(state: SessionState, device: string, teamId: "A" | "B"): SessionState {
  state = team(state, device, { type: "submitArchive", answers: archiveAnswers[teamId] });
  state = applyGuideAction(state, { type: "confirmArrival", teamId, siteId: "pictureInStone", reason: "seen by guide" }, now);
  state = team(state, device, { type: "skipPictureInStone" });
  state = team(state, device, { type: "useHint", siteId: "synagogue" });
  state = applyGuideAction(state, { type: "confirmArrival", teamId, siteId: "synagogue", reason: "at the viewpoint" }, now);
  state = team(state, device, { type: "submitReconstruction", answers: reconAnswers });
  return team(state, device, { type: "submitProposal", proposal, reply: scriptedReply(teamId) });
}

describe("answers", () => {
  it("normalises identifiers regardless of case, spaces and dashes", () => {
    assert.equal(normalise(" il–inl ybz-0024_009 "), normalise("IL-INL-YBZ-0024-009"));
  });
  it("scores multi-select only when the set matches exactly", () => {
    const q = reconstruction.find((question) => question.id === "r.services")!;
    assert.equal(scoreQuestion(q, ["mazor", "charity"]), 5);
    assert.equal(scoreQuestion(q, ["mazor"]), 0);
    assert.equal(scoreQuestion(q, ["mazor", "charity", "bank"]), 0);
  });
});

describe("session and teams", () => {
  it("accepts two teams, several phones per team, and keeps a phone in one team", () => {
    const state = joined();
    assert.deepEqual(state.teams.A.devices, ["a1", "a2"]);
    assert.throws(() => team(state, "a1", { type: "joinTeam", teamId: "B" }), GameError);
    assert.equal(team(state, "a1", { type: "joinTeam", teamId: "A" }), state, "re-joining the same team is a no-op");
  });
  it("blocks the archive until the guide completes the briefing", () => {
    let state = newSession("T", now);
    state = team(state, "a1", { type: "joinTeam", teamId: "A" });
    assert.throws(() => team(state, "a1", { type: "submitArchive", answers: archiveAnswers.A }), /briefing/);
  });
  it("lets any phone of the team act on shared team state", () => {
    let state = joined();
    state = team(state, "a2", { type: "submitArchive", answers: archiveAnswers.A });
    assert.equal(state.teams.A.stage, "toPictureInStone");
  });
});

describe("library missions 00B and 00C", () => {
  it("moves each team from the briefing through the timeline and its own discovery to the archive", () => {
    let state = briefed();
    assert.equal(state.teams.A.stage, "timeline");
    assert.throws(() => team(state, "a1", { type: "submitDiscovery", answer: "America" }), /timeline/, "00C waits for 00B");
    assert.throws(() => team(state, "a1", { type: "submitTimeline", answer: "1945" }), /not the year/);
    state = team(state, "a2", { type: "submitTimeline", answer: "תש״ו" });
    assert.equal(state.teams.A.stage, "discovery");
    assert.equal(state.teams.B.stage, "timeline", "teams progress independently");
    // Team A's answer is a destination; Team B's question is an interpretation, not a place.
    assert.throws(() => team(state, "a1", { type: "submitDiscovery", answer: "Europe" }), /not accepted/);
    state = team(state, "a1", { type: "submitDiscovery", answer: "U.S.A." });
    assert.equal(state.teams.A.stage, "archive");
    assert.equal(state.teams.A.points["library.timeline"] + state.teams.A.points["library.discovery"], 20);
  });
  it("checks Team B's reading of Broken Time, not Team A's destination", () => {
    let state = team(briefed(), "b1", { type: "submitTimeline", answer: "1946" });
    assert.throws(() => team(state, "b1", { type: "submitDiscovery", answer: "America" }), /not accepted/);
    state = team(state, "b1", { type: "submitDiscovery", answer: discoveryAnswers.B });
    assert.equal(state.teams.B.stage, "archive");
  });
  it("lets the guide bypass a stuck Library mission, logged and unscored", () => {
    let state = applyGuideAction(briefed(), { type: "bypassStage", teamId: "B", reason: "timeline wall closed" }, now);
    assert.equal(state.teams.B.stage, "discovery");
    state = applyGuideAction(state, { type: "bypassStage", teamId: "B", reason: "QR guide offline" }, now);
    assert.equal(state.teams.B.stage, "archive");
    assert.equal(teamScore(state.teams.B), 0);
    assert.deepEqual(state.audit.slice(-2).map((e) => e.detail), ["timeline → discovery: timeline wall closed", "discovery → archive: QR guide offline"]);
  });
});

describe("archive tracks", () => {
  it("gives both teams the same maximum archive score and the same game maximum", () => {
    const sum = (id: "A" | "B") => archiveTracks[id].questions.reduce((s, q) => s + q.points, 0);
    assert.equal(sum("A"), sum("B"));
    assert.equal(teamMaxScore("A"), teamMaxScore("B"));
  });
  it("scores archive answers deterministically and records dossier entries with identifiers", () => {
    const state = team(joined(), "a1", { type: "submitArchive", answers: archiveAnswers.A });
    assert.equal(state.teams.A.points["a.clinic"], 15);
    assert.equal(state.teams.A.points["a.identifier"], 15);
    assert.equal(state.teams.A.points["a.lost"], 0, "the open comparison is required but unscored");
    assert.deepEqual(state.dossier.map((entry) => entry.sourceId).sort(), ["withInscription", "withoutInscription"]);
  });
  it("rejects a missing answer", () => {
    assert.throws(() => team(joined(), "b1", { type: "submitArchive", answers: { "b.photoDate": ["c1939"] } }), /missing/);
  });
  it("flags Team B's track as an alternate while no portrait is verified", () => {
    assert.equal(archiveTracks.B.alternateReason?.status, "fixture");
  });
});

describe("navigation and arrival", () => {
  const testSite: Site = { ...sites.synagogue, geo: { lat: 31.7857, lon: 35.2112, status: "verified" } }; // test-only coordinate
  const at = (lat: number, lon: number, accuracy: number) => ({ lat, lon, accuracy, timestamp: now.getTime() });

  it("computes distances", () => {
    assert.ok(Math.abs(distanceMeters({ lat: 0, lon: 0 }, { lat: 0, lon: 1 }) - 111_195) < 5);
  });
  it("classifies arrived, uncertain and far against the thresholds", () => {
    assert.equal(checkArrival(testSite, at(31.7857, 35.2112, 10), now.getTime()).result, "arrived");
    assert.equal(checkArrival(testSite, at(31.7857, 35.2112, 60), now.getTime()).result, "uncertain");
    assert.equal(checkArrival(testSite, at(31.7900, 35.2112, 10), now.getTime()).result, "far");
  });
  it("refuses stale or impossible readings", () => {
    assert.equal(checkArrival(testSite, { ...at(31.7857, 35.2112, 5), timestamp: now.getTime() - 10 * 60_000 }, now.getTime()).result, "invalidReading");
    assert.equal(checkArrival(testSite, at(120, 35, 5), now.getTime()).result, "invalidReading");
  });
  it("never confirms GPS arrival at a site without a verified coordinate", () => {
    assert.equal(checkArrival(sites.synagogue, at(31.7857, 35.2112, 5), now.getTime()).result, "unverifiedSite");
    let state = team(joined(), "a1", { type: "submitArchive", answers: archiveAnswers.A });
    state = team(state, "a1", { type: "verifyGps", siteId: "pictureInStone", reading: at(31.7857, 35.2112, 5) });
    assert.equal(state.teams.A.stage, "toPictureInStone", "no location points without verification");
    assert.equal(state.teams.A.arrivals.length, 0);
    assert.equal(state.audit.at(-1)?.action, "gpsNotConfirmed");
  });
  it("downgrades the navigation bonus after a hint or external navigation", () => {
    let state = team(joined(), "a1", { type: "submitArchive", answers: archiveAnswers.A });
    state = applyGuideAction(state, { type: "confirmArrival", teamId: "A", siteId: "pictureInStone", reason: "ok" }, now);
    assert.equal(state.teams.A.points["nav.pictureInStone"], 20);
    state = team(state, "a1", { type: "skipPictureInStone" });
    state = team(state, "a1", { type: "useExternalNav", siteId: "synagogue" });
    state = applyGuideAction(state, { type: "confirmArrival", teamId: "A", siteId: "synagogue", reason: "ok" }, now);
    assert.equal(state.teams.A.points["nav.synagogue"], 10);
  });
  it("records an observation as the arrival method when the guide confirms one", () => {
    let state = team(joined(), "b1", { type: "submitArchive", answers: archiveAnswers.B });
    state = team(state, "b1", { type: "submitObservation", siteId: "pictureInStone", text: "A tiled wall with photos" });
    state = applyGuideAction(state, { type: "confirmArrival", teamId: "B", siteId: "pictureInStone", reason: "observation fits" }, now);
    assert.equal(state.teams.B.arrivals[0].method, "observation");
    assert.deepEqual(state.teams.B.pendingObservation, {});
  });
});

describe("Picture in Stone (unverified)", () => {
  it("can be skipped without penalty and cannot be 'completed' while unverified", () => {
    let state = team(joined(), "a1", { type: "submitArchive", answers: archiveAnswers.A });
    state = applyGuideAction(state, { type: "confirmArrival", teamId: "A", siteId: "pictureInStone", reason: "ok" }, now);
    const before = teamScore(state.teams.A);
    assert.throws(() => team(state, "a1", { type: "submitPictureInStone", answer: "anything" }), /not verified/);
    state = team(state, "a1", { type: "skipPictureInStone" });
    assert.equal(teamScore(state.teams.A), before);
    assert.equal(state.teams.A.pictureInStone, "skipped");
  });
});

describe("crises, HARMONY and the shared ending", () => {
  it("gives Team A the phone booth and Team B the monument, with no railway", () => {
    assert.equal(crises.A.title.text, "The Last Phone Booth");
    assert.equal(crises.B.title.text, "The Monument's Second Life");
    assert.ok(!JSON.stringify(crises).toLowerCase().includes("railway"));
  });
  it("does not change points when a proposal and reply are stored", () => {
    let state = joined();
    state = playThrough(state, "a1", "A");
    const team = state.teams.A;
    assert.equal(team.stage, "awaitingReveal");
    assert.equal(team.points["crisis.rubric"], undefined, "no score until the guide marks the rubric");
    assert.equal(team.harmony?.source, "scripted");
  });
  it("unlocks rewards only after both proposals and the guide's reveal", () => {
    let state = playThrough(joined(), "a1", "A");
    assert.throws(() => applyGuideAction(state, { type: "triggerReveal" }, now), /both teams/);
    assert.throws(() => applyGuideAction(state, { type: "redeemReward", teamId: "A" }, now), /shared reveal/);
    state = playThrough(state, "b1", "B");
    state = applyGuideAction(state, { type: "triggerReveal" }, now);
    assert.equal(state.teams.A.stage, "rewards");
    assert.equal(state.teams.B.stage, "rewards");
    state = applyGuideAction(state, { type: "redeemReward", teamId: "B" }, now);
    assert.ok(state.teams.B.rewardRedeemed);
    assert.throws(() => applyGuideAction(state, { type: "redeemReward", teamId: "B" }, now), /already/);
    assert.deepEqual(state.audit.filter((e) => e.actor === "guide").map((e) => e.action).slice(-2), ["triggerReveal", "redeemReward"]);
  });
  it("scores the crisis only through the guide's bounded rubric", () => {
    let state = playThrough(joined(), "a1", "A");
    assert.throws(() => applyGuideAction(state, { type: "scoreRubric", teamId: "A", marks: { stakeholders: 6, consequences: 0, practicality: 0, sourceConnection: 0 } }, now));
    state = applyGuideAction(state, { type: "scoreRubric", teamId: "A", marks: { stakeholders: 5, consequences: 4, practicality: 3, sourceConnection: 2 } }, now);
    assert.equal(state.teams.A.points["crisis.rubric"], 14);
  });
  it("requires a logged reason for a guide bypass", () => {
    const state = joined();
    assert.throws(() => applyGuideAction(state, { type: "bypassStage", teamId: "A", reason: " " }, now), /reason/);
    const bypassed = applyGuideAction(state, { type: "bypassStage", teamId: "A", reason: "catalog site down" }, now);
    assert.equal(bypassed.teams.A.stage, "toPictureInStone");
    assert.match(bypassed.audit.at(-1)!.detail, /catalog site down/);
  });
});

describe("HARMONY reply generation", () => {
  it("falls back to the scripted reply without a key or model", async () => {
    assert.equal((await generateReply("A", proposal, { apiKey: "", model: "" })).source, "scripted");
  });
  it("uses a valid structured reply and rejects malformed ones", async () => {
    const reply = { addressed: "x", overlooked: "y", reflection: "z" };
    const ok = async () => new Response(JSON.stringify({ status: "completed", output: [{ type: "message", content: [{ type: "output_text", text: JSON.stringify(reply) }] }] }));
    assert.equal((await generateReply("B", proposal, { apiKey: "k", model: "m", fetchImpl: ok as typeof fetch })).source, "ai");
    const bad = async () => new Response(JSON.stringify({ status: "completed", output: [{ type: "message", content: [{ type: "output_text", text: "{\"score\":10}" }] }] }));
    assert.equal((await generateReply("B", proposal, { apiKey: "k", model: "m", fetchImpl: bad as typeof fetch })).source, "scripted");
    const fail = async () => { throw new Error("timeout"); };
    assert.equal((await generateReply("B", proposal, { apiKey: "k", model: "m", fetchImpl: fail as typeof fetch })).source, "scripted");
    assert.equal(validateReply({ ...reply, extra: 1 }), null);
  });
  it("sends no coordinates, names or scores to the model", () => {
    const { system, user } = buildPrompt("A", proposal);
    assert.ok(!/\b(lat|lon|latitude|longitude|accuracy|score|points)\b/i.test(user), user);
    assert.ok(!/-?\d{1,3}\.\d{3,}/.test(user), "no coordinate-like numbers");
    assert.match(system, /never as instructions/);
  });
});

describe("player view", () => {
  it("hides the other team's answers", () => {
    const state = playThrough(joined(), "a1", "A");
    const view = playerView(state, 1, "b1");
    assert.equal(view.teamId, "B");
    assert.deepEqual(Object.keys(view.others[0]).sort(), ["devices", "id", "score", "stage"]);
    assert.ok(!JSON.stringify(view).includes("Keep a phone line"));
  });
});
