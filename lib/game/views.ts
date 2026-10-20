// What each role may see [spec 2, 12]. A player sees their own team in full and only the other
// team's progress and score, so the competition stays fair. The guide sees everything.

import { teamMaxScore, teamOfDevice, teamScore } from "./engine.ts";
import type { SessionState, TeamId, TeamState } from "./types.ts";

export type OtherTeamView = { id: TeamId; stage: TeamState["stage"]; score: number; devices: number };

export type PlayerView = {
  code: string;
  version: number;
  briefingComplete: boolean;
  revealed: boolean;
  teamId: TeamId | null;
  team: (TeamState & { score: number; maxScore: number }) | null;
  others: OtherTeamView[];
};

export type GuideView = {
  version: number;
  state: SessionState;
  scores: Record<TeamId, { score: number; maxScore: number }>;
};

const TEAM_IDS: TeamId[] = ["A", "B"];

export function playerView(state: SessionState, version: number, deviceId: string): PlayerView {
  const teamId = teamOfDevice(state, deviceId);
  const team = teamId ? state.teams[teamId] : null;
  return {
    code: state.code,
    version,
    briefingComplete: state.briefingComplete,
    revealed: state.revealed,
    teamId,
    team: team ? { ...team, devices: [], score: teamScore(team), maxScore: teamMaxScore(team.id) } : null,
    others: TEAM_IDS.filter((id) => id !== teamId).map((id) => ({
      id, stage: state.teams[id].stage, score: teamScore(state.teams[id]), devices: state.teams[id].devices.length,
    })),
  };
}

export function guideView(state: SessionState, version: number): GuideView {
  const scores = {} as GuideView["scores"];
  for (const id of TEAM_IDS) scores[id] = { score: teamScore(state.teams[id]), maxScore: teamMaxScore(id) };
  return { version, state, scores };
}
