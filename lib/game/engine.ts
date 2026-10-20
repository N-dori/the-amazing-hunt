// The server-authoritative game engine [spec 2]. Pure: (state, action, now) → new state. Route
// handlers load state, call these functions inside a transaction, and persist the result; the
// browser only proposes actions. Errors are GameError, which routes turn into 4xx responses.

import { isAnswered, normalise, scoreQuestion } from "./answers.ts";
import { archiveTracks, pictureInStone, reconstruction, SCORING, sites } from "./content.ts";
import { checkDiscoveryAnswer, discoveryMissions } from "./discovery.ts";
import { checkArrival } from "./geo.ts";
import { firstKeepers, isFirstKeepersYear } from "./library.ts";
import type {
  Arrival, ArrivalMethod, GuideAction, NavMode, Question, SessionState, SiteId, Stage, TeamAction, TeamId, TeamState,
} from "./types.ts";

export class GameError extends Error {
  readonly status: number;
  constructor(message: string, status = 409) {
    super(message);
    this.status = status;
  }
}

const TEXT_LIMIT = 2000;

// Scored item ids for the Library missions, in TeamState.answers and .points.
const TIMELINE_ID = "library.timeline";
const DISCOVERY_ID = "library.discovery";

export function newTeam(id: TeamId): TeamState {
  return {
    id, devices: [], stage: "briefing", hintsUsed: {}, externalNavUsed: {}, pendingObservation: {}, arrivals: [],
    answers: {}, points: {}, pictureInStone: null, proposal: null, harmony: null, rubric: null, rewardRedeemed: false,
  };
}

export function newSession(code: string, now: Date): SessionState {
  return {
    code, createdAt: now.toISOString(), briefingComplete: false, revealed: false,
    teams: { A: newTeam("A"), B: newTeam("B") }, dossier: [], audit: [],
  };
}

export function teamOfDevice(state: SessionState, deviceId: string): TeamId | null {
  for (const team of Object.values(state.teams)) if (team.devices.includes(deviceId)) return team.id;
  return null;
}

// The site a navigation stage leads to.
export function destinationOf(stage: Stage): SiteId | null {
  if (stage === "toPictureInStone") return "pictureInStone";
  if (stage === "toSynagogue") return "synagogue";
  return null;
}

const NEXT_AFTER_ARRIVAL: Partial<Record<Stage, Stage>> = { toPictureInStone: "pictureInStone", toSynagogue: "reconstruction" };

function navMode(team: TeamState, siteId: SiteId): NavMode {
  if (team.externalNavUsed[siteId]) return "external";
  if ((team.hintsUsed[siteId] ?? 0) > 0) return "hint";
  return "independent";
}

function clean(text: unknown, field: string, required = true): string {
  if (typeof text !== "string") throw new GameError(`${field} must be text`, 400);
  const value = text.trim();
  if (required && !value) throw new GameError(`${field} is required`, 400);
  if (value.length > TEXT_LIMIT) throw new GameError(`${field} is too long`, 400);
  return value;
}

function requireStage(team: TeamState, ...stages: Stage[]) {
  if (!stages.includes(team.stage)) throw new GameError(`team ${team.id} is at ${team.stage}, not ${stages.join(" or ")}`);
}

// Score a set of answers: every question answered, bounded ones scored, all stored.
function recordAnswers(team: TeamState, questions: Question[], answers: Record<string, string[]>): TeamState {
  if (!answers || typeof answers !== "object") throw new GameError("answers are required", 400);
  for (const question of questions) {
    const given = answers[question.id];
    if (given !== undefined && !Array.isArray(given)) throw new GameError(`answer ${question.id} is missing or invalid`, 400);
  }
  const nextAnswers = { ...team.answers };
  const nextPoints = { ...team.points };
  for (const question of questions) {
    const answer = answers[question.id]?.map((value) => clean(value, question.id));
    if (!isAnswered(question, answer)) throw new GameError(`answer ${question.id} is missing or invalid`, 400);
    nextAnswers[question.id] = answer!;
    nextPoints[question.id] = scoreQuestion(question, answer!);
  }
  return { ...team, answers: nextAnswers, points: nextPoints };
}

function arrive(team: TeamState, siteId: SiteId, method: ArrivalMethod, now: Date, gps?: { distance: number; accuracy: number }): TeamState {
  const mode = navMode(team, siteId);
  const scored = SCORING.navigationSites.includes(siteId);
  const points = scored ? SCORING.navigation[mode] : 0;
  const arrival: Arrival = {
    siteId, method, navMode: mode, points, at: now.toISOString(),
    ...(gps ? { distanceMeters: gps.distance, accuracyMeters: gps.accuracy } : {}),
  };
  const pending = { ...team.pendingObservation };
  delete pending[siteId];
  return {
    ...team,
    arrivals: [...team.arrivals, arrival],
    points: { ...team.points, [`nav.${siteId}`]: points },
    pendingObservation: pending,
    stage: NEXT_AFTER_ARRIVAL[team.stage] ?? team.stage,
  };
}

function withTeam(state: SessionState, team: TeamState): SessionState {
  return { ...state, teams: { ...state.teams, [team.id]: team } };
}

// ---- Team actions ---------------------------------------------------------------------------

export function applyTeamAction(state: SessionState, deviceId: string, action: TeamAction, now: Date): SessionState {
  if (!deviceId || deviceId.length > 100) throw new GameError("a device id is required", 400);

  if (action.type === "joinTeam") {
    if (action.teamId !== "A" && action.teamId !== "B") throw new GameError("unknown team", 400);
    const current = teamOfDevice(state, deviceId);
    if (current === action.teamId) return state;
    if (current) throw new GameError(`this phone has already joined team ${current}`);
    const team = state.teams[action.teamId];
    return withTeam(state, { ...team, devices: [...team.devices, deviceId] });
  }

  const teamId = teamOfDevice(state, deviceId);
  if (!teamId) throw new GameError("join a team first", 403);
  let team = state.teams[teamId];

  switch (action.type) {
    // 00B and 00C: a wrong answer changes nothing (hints live on the phone); the guide can
    // move a stuck team on with a logged bypass instead.
    case "submitTimeline": {
      requireStage(team, "timeline");
      const answer = clean(action.answer, "answer");
      if (!isFirstKeepersYear(answer)) throw new GameError("not the year on the timeline", 422);
      team = { ...team, answers: { ...team.answers, [TIMELINE_ID]: [answer] }, points: { ...team.points, [TIMELINE_ID]: firstKeepers.points }, stage: "discovery" };
      return withTeam(state, team);
    }

    case "submitDiscovery": {
      requireStage(team, "discovery");
      const answer = clean(action.answer, "answer");
      if (!checkDiscoveryAnswer(teamId, answer)) throw new GameError("answer not accepted yet", 422);
      const points = discoveryMissions[teamId].points;
      team = { ...team, answers: { ...team.answers, [DISCOVERY_ID]: [answer] }, points: { ...team.points, [DISCOVERY_ID]: points }, stage: "archive" };
      return withTeam(state, team);
    }

    case "submitArchive": {
      requireStage(team, "archive");
      const track = archiveTracks[teamId];
      team = recordAnswers(team, track.questions, action.answers);
      team = { ...team, stage: "toPictureInStone" };
      const dossier = track.sourceIds.map((sourceId) => ({
        id: `${teamId}.archive.${sourceId}`, teamId, sourceId,
        evidenceType: "catalogRecord" as const, claimType: "historicalFact" as const,
        summary: track.title.text, at: now.toISOString(),
      }));
      return { ...withTeam(state, team), dossier: [...state.dossier.filter((entry) => !entry.id.startsWith(`${teamId}.archive.`)), ...dossier] };
    }

    case "useHint": {
      const siteId = destinationOf(team.stage);
      if (siteId !== action.siteId) throw new GameError("no hint for this stage");
      const used = team.hintsUsed[siteId] ?? 0;
      if (used >= sites[siteId].hints.length) throw new GameError("no more hints");
      return withTeam(state, { ...team, hintsUsed: { ...team.hintsUsed, [siteId]: used + 1 } });
    }

    case "useExternalNav": {
      const siteId = destinationOf(team.stage);
      if (siteId !== action.siteId) throw new GameError("not navigating to that site");
      return withTeam(state, { ...team, externalNavUsed: { ...team.externalNavUsed, [siteId]: true } });
    }

    case "verifyGps": {
      const siteId = destinationOf(team.stage);
      if (siteId !== action.siteId) throw new GameError("not navigating to that site");
      const check = checkArrival(sites[siteId], action.reading, now.getTime());
      if (check.result !== "arrived") {
        // Not an error: the client offers the observation / guide fallback.
        const detail = "distance" in check ? `${check.result}, ${check.distance} m` : check.result;
        return { ...state, audit: [...state.audit, { at: now.toISOString(), actor: "system", action: "gpsNotConfirmed", teamId, detail }] };
      }
      return withTeam(state, arrive(team, siteId, "gps", now, { distance: check.distance, accuracy: Math.round(action.reading.accuracy) }));
    }

    case "submitObservation": {
      const siteId = destinationOf(team.stage);
      if (siteId !== action.siteId) throw new GameError("not navigating to that site");
      const text = clean(action.text, "observation");
      return withTeam(state, { ...team, pendingObservation: { ...team.pendingObservation, [siteId]: text } });
    }

    case "skipPictureInStone": {
      requireStage(team, "pictureInStone");
      if (pictureInStone.targetVerified) throw new GameError("this stop is verified and cannot be skipped");
      return withTeam(state, { ...team, pictureInStone: "skipped", stage: "toSynagogue" });
    }

    case "submitPictureInStone": {
      requireStage(team, "pictureInStone");
      if (!pictureInStone.targetVerified || pictureInStone.answer === null) {
        throw new GameError("this stop is not verified yet; skip it or ask the guide");
      }
      const answer = clean(action.answer, "answer");
      const correct = normalise(answer) === normalise(pictureInStone.answer);
      return withTeam(state, {
        ...team, pictureInStone: "completed", stage: "toSynagogue",
        answers: { ...team.answers, "p.inscription": [answer] },
        points: { ...team.points, "p.inscription": correct ? pictureInStone.points : 0 },
      });
    }

    case "submitReconstruction": {
      requireStage(team, "reconstruction");
      team = recordAnswers(team, reconstruction, action.answers);
      const entry = {
        id: `${teamId}.site.synagogue`, teamId, sourceId: null, evidenceType: "siteObservation" as const,
        claimType: "interpretation" as const, summary: team.answers["r.unknown"]?.[0] ?? "", at: now.toISOString(),
      };
      return { ...withTeam(state, { ...team, stage: "crisis" }), dossier: [...state.dossier.filter((e) => e.id !== entry.id), entry] };
    }

    case "submitProposal": {
      requireStage(team, "crisis");
      const proposal = {
        text: clean(action.proposal.text, "proposal"),
        stakeholders: clean(action.proposal.stakeholders, "stakeholders"),
        tradeoffs: clean(action.proposal.tradeoffs, "trade-offs"),
        at: now.toISOString(),
      };
      const reply = action.reply;
      if (reply.source !== "ai" && reply.source !== "scripted") throw new GameError("invalid reply source", 400);
      // The reply never touches points or stage beyond the fixed "proposal in" step.
      const harmony = {
        addressed: clean(reply.addressed, "reply"), overlooked: clean(reply.overlooked, "reply"),
        reflection: clean(reply.reflection, "reply"), source: reply.source, hiddenByGuide: false, at: now.toISOString(),
      };
      return withTeam(state, { ...team, proposal, harmony, stage: "awaitingReveal" });
    }

    default:
      throw new GameError("unknown action", 400);
  }
}

// ---- Guide actions --------------------------------------------------------------------------

function audit(state: SessionState, now: Date, action: string, detail: string, teamId?: TeamId): SessionState {
  return { ...state, audit: [...state.audit, { at: now.toISOString(), actor: "guide", action, teamId, detail }] };
}

const BYPASS_NEXT: Partial<Record<Stage, Stage>> = {
  timeline: "discovery", discovery: "archive", archive: "toPictureInStone", pictureInStone: "toSynagogue", reconstruction: "crisis",
};

export function applyGuideAction(state: SessionState, action: GuideAction, now: Date): SessionState {
  switch (action.type) {
    case "completeBriefing": {
      if (state.briefingComplete) return state;
      const teams = { ...state.teams };
      for (const id of ["A", "B"] as TeamId[]) teams[id] = { ...teams[id], stage: teams[id].stage === "briefing" ? "timeline" : teams[id].stage };
      return audit({ ...state, briefingComplete: true, teams }, now, "completeBriefing", "Library briefing complete");
    }

    case "confirmArrival": {
      const team = state.teams[action.teamId];
      if (!team) throw new GameError("unknown team", 400);
      const siteId = destinationOf(team.stage);
      if (siteId !== action.siteId) throw new GameError(`team ${team.id} is not navigating to ${action.siteId}`);
      const reason = clean(action.reason, "reason");
      const method: ArrivalMethod = team.pendingObservation[siteId] ? "observation" : "guide";
      return audit(withTeam(state, arrive(team, siteId, method, now)), now, "confirmArrival", `${siteId} (${method}): ${reason}`, team.id);
    }

    case "bypassStage": {
      const team = state.teams[action.teamId];
      if (!team) throw new GameError("unknown team", 400);
      const next = BYPASS_NEXT[team.stage];
      if (!next) throw new GameError(`stage ${team.stage} cannot be bypassed; confirm arrival or wait for the proposal instead`);
      const reason = clean(action.reason, "reason");
      const updated: TeamState = { ...team, stage: next, ...(team.stage === "pictureInStone" ? { pictureInStone: "skipped" as const } : {}) };
      return audit(withTeam(state, updated), now, "bypassStage", `${team.stage} → ${next}: ${reason}`, team.id);
    }

    case "scoreRubric": {
      const team = state.teams[action.teamId];
      if (!team) throw new GameError("unknown team", 400);
      if (!team.proposal) throw new GameError("no proposal to score yet");
      const max = SCORING.rubricMaxPerCriterion;
      const marks = action.marks;
      for (const value of Object.values(marks)) {
        if (!Number.isInteger(value) || value < 0 || value > max) throw new GameError(`rubric marks are whole numbers 0–${max}`, 400);
      }
      const total = marks.stakeholders + marks.consequences + marks.practicality + marks.sourceConnection;
      const updated = { ...team, rubric: { ...marks }, points: { ...team.points, "crisis.rubric": total } };
      return audit(withTeam(state, updated), now, "scoreRubric", JSON.stringify(marks), team.id);
    }

    case "hideHarmonyReply": {
      const team = state.teams[action.teamId];
      if (!team?.harmony) throw new GameError("no reply to hide");
      const reason = clean(action.reason, "reason");
      return audit(withTeam(state, { ...team, harmony: { ...team.harmony, hiddenByGuide: true } }), now, "hideHarmonyReply", reason, team.id);
    }

    case "triggerReveal": {
      if (state.revealed) return state;
      const waiting = (["A", "B"] as TeamId[]).filter((id) => state.teams[id].stage !== "awaitingReveal");
      if (waiting.length) throw new GameError(`both teams must submit their proposals first (waiting for ${waiting.join(", ")})`);
      const teams = { A: { ...state.teams.A, stage: "rewards" as const }, B: { ...state.teams.B, stage: "rewards" as const } };
      return audit({ ...state, revealed: true, teams }, now, "triggerReveal", "Shared reveal: historical layer restored");
    }

    case "redeemReward": {
      const team = state.teams[action.teamId];
      if (!team) throw new GameError("unknown team", 400);
      if (!state.revealed) throw new GameError("rewards unlock only after the shared reveal");
      if (team.rewardRedeemed) throw new GameError(`team ${team.id} has already redeemed the tasting`);
      return audit(withTeam(state, { ...team, rewardRedeemed: true }), now, "redeemReward", "Tasting redeemed", team.id);
    }

    default:
      throw new GameError("unknown guide action", 400);
  }
}

// ---- Scores ---------------------------------------------------------------------------------

export function teamScore(team: TeamState): number {
  return Object.values(team.points).reduce((sum, value) => sum + value, 0);
}

// The maximum each team can reach, so the guide view can show the two are equal.
export function teamMaxScore(teamId: TeamId): number {
  const archive = archiveTracks[teamId].questions.reduce((sum, q) => sum + q.points, 0);
  const recon = reconstruction.reduce((sum, q) => sum + q.points, 0);
  const nav = SCORING.navigationSites.length * SCORING.navigation.independent;
  const library = firstKeepers.points + discoveryMissions[teamId].points;
  return library + archive + recon + nav + pictureInStone.points + 4 * SCORING.rubricMaxPerCriterion;
}
