import { isSoloTeam, type AssignableGroupRole, type GroupRoleAssignments } from "./roles.ts";

/** The adventure as the server shows it to one participant (`sessionView().adventure`). */
export type AdventureView = Readonly<{
  status: "lobby" | "active";
  intendedCount: number | null;
  host: boolean;
  leader: boolean;
  canManage: boolean;
}>;

/** Teams aim for this many participants (owner, 29 Oct 2026): one adventure holds as many small teams as its size needs. */
export const TEAM_SIZE = 5;
/** The host's answer to "how many are playing?": a whole number in this range, checked again by the server.
 * 30 is a provisional planning limit (owner, 29 Oct 2026), not proof that 30 devices are supported. */
export const LOBBY_COUNT = { min: 1, max: 30 } as const;

/** The recommended number of teams for `count` participants: never more than five in a team. */
export function recommendedTeamCount(count: number): number {
  return Math.max(1, Math.ceil(count / TEAM_SIZE));
}
/** How `count` participants split across the recommended teams, as evenly as possible, largest first (11 → 4, 4, 3). */
export function recommendedTeamSizes(count: number): readonly number[] {
  const teams = recommendedTeamCount(count);
  return Array.from({ length: teams }, (_, index) => Math.floor(count / teams) + (index < count % teams ? 1 : 0));
}

export type LobbyView = Readonly<{
  canManage: boolean;
  count: number | null;
  canDecrease: boolean;
  canIncrease: boolean;
  /** The recommendation for this count, or null before a count is chosen. Only a recommendation: the app has one team until multiple teams exist (I7a). */
  recommendation: Readonly<{ teams: number; sizes: readonly number[] }> | null;
  /** More than one team is recommended, so this group can't start until teams exist (the server refuses it too). */
  needsTeams: boolean;
  canStart: boolean;
}>;

/** The lobby for one participant. `draftCount` is the count on this phone before it is sent; null until someone picks one. */
export function buildLobbyView(adventure: AdventureView, draftCount: number | null): LobbyView {
  const count = draftCount ?? adventure.intendedCount;
  const recommendation = count === null ? null : { teams: recommendedTeamCount(count), sizes: recommendedTeamSizes(count) };
  return {
    canManage: adventure.canManage,
    count,
    canDecrease: adventure.canManage && count !== null && count > LOBBY_COUNT.min,
    canIncrease: adventure.canManage && (count === null || count < LOBBY_COUNT.max),
    recommendation,
    needsTeams: recommendation !== null && recommendation.teams > 1,
    canStart: adventure.canManage && adventure.status === "lobby" && recommendation !== null && recommendation.teams === 1,
  };
}

/** One tap on − or +, kept inside the bounds. From no count yet, + gives 1 (a group of one is allowed). */
export function stepCount(count: number | null, delta: -1 | 1): number {
  const next = count === null ? LOBBY_COUNT.min : count + delta;
  return Math.min(LOBBY_COUNT.max, Math.max(LOBBY_COUNT.min, next));
}

/** The host's own progress through the lobby on this phone (onboarding and roles, owner, 5 Nov 2026): the count, who's here, the
 * roles, then ready. Kept on the phone; the server holds only what each step decides (the count, the roles). */
export type LobbyStage = "count" | "here" | "roles" | "ready";
export const LOBBY_STAGES: readonly LobbyStage[] = Object.freeze(["count", "here", "roles", "ready"]);

/** One screen at a time in the lobby: the count, then who's here, the roles and Ready to Start for a group of 2–5; straight to Ready
 * for a solo player; the teams note for 6–30, which can't start yet. Players without lobby powers only wait. `stage` is where the
 * host has got to on this phone. */
export type LobbyStep = "waiting" | LobbyStage | "teams";
export function lobbyStep(lobby: LobbyView, stage: LobbyStage): LobbyStep {
  if (!lobby.canManage) return "waiting";
  if (stage === "count" || lobby.count === null) return "count";
  if (lobby.needsTeams) return "teams";
  if (lobby.count === 1) return "ready";
  return stage;
}

/** The stepper's states for one group (Players · Who's here · Roles · Ready) or a solo player (Players · Ready). */
export type StepperState = Readonly<{ stage: LobbyStage; status: "done" | "current" | "todo" }>;
export function stepperStates(current: LobbyStage, solo: boolean): readonly StepperState[] {
  const stages = solo ? LOBBY_STAGES.filter(stage => stage === "count" || stage === "ready") : LOBBY_STAGES;
  const at = Math.max(0, stages.indexOf(current));
  return stages.map((stage, index) => ({ stage, status: index < at ? "done" : index === at ? "current" : "todo" }));
}

/** What the count says about groups (owner's note, 5 Nov 2026): one group needs no group count and no split. A solo player is told
 * so; from 6 up, the number of groups and their sizes. */
export type GroupSummary = Readonly<{ kind: "solo" }> | Readonly<{ kind: "groups"; groups: number; sizes: readonly number[] }> | null;
export function groupSummary(count: number | null): GroupSummary {
  if (count === null) return null;
  if (count === 1) return { kind: "solo" };
  const groups = recommendedTeamCount(count);
  return groups > 1 ? { kind: "groups", groups, sizes: recommendedTeamSizes(count) } : null;
}

/** The roles a group can't start without (owner, 5 Nov 2026): Navigator and Submitter. A solo player holds both, so nothing is missing;
 * with no member yet (the guide starting before anyone has signed in) there is no one to give them to, and the Group tab's fallbacks apply. */
export function requiredRolesMissing(roles: GroupRoleAssignments, memberIds: readonly string[]): readonly AssignableGroupRole[] {
  if (memberIds.length === 0 || isSoloTeam(memberIds)) return [];
  return (["navigator", "answerSubmitter"] as const).filter(role => roles[role] === null);
}

/** What the players' waiting screen says the host is doing, from what the server already holds: no count yet, the roles still being
 * chosen, or ready to go. */
export function waitingStage(adventure: Pick<AdventureView, "intendedCount">, roles: GroupRoleAssignments, memberIds: readonly string[]): LobbyStage {
  if (adventure.intendedCount === null) return "count";
  return requiredRolesMissing(roles, memberIds).length ? "roles" : "ready";
}
