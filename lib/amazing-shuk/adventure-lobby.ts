import { isSoloTeam, type GroupRoleAssignments, type PermissionRole } from "./roles.ts";

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
    // With several teams (I7a) the phone also waits for every team to be ready (IndexAdventureLobby); the server checks both.
    canStart: adventure.canManage && adventure.status === "lobby" && recommendation !== null,
  };
}

/** One tap on − or +, kept inside the bounds. From no count yet, + gives 1 (a group of one is allowed). */
export function stepCount(count: number | null, delta: -1 | 1): number {
  const next = count === null ? LOBBY_COUNT.min : count + delta;
  return Math.min(LOBBY_COUNT.max, Math.max(LOBBY_COUNT.min, next));
}

/** Where this phone has got to in the lobby (onboarding and roles, owner, 5 Nov 2026; teams, I7a). Kept on the phone; the server holds
 * only what each step decides (the count, the teams, the name, the roles). */
export type LobbyStage = "count" | "teams" | "name" | "here" | "roles" | "ready";
/** Which steps this phone goes through:
 * - `solo`: the host of a group of one, Players then Ready;
 * - `group`: the host of one group of 2–5, Players, Who's here, Roles, Ready;
 * - `multi`: the host (or guide) of 6–30, who also creates the teams and names team A;
 * - `leader`: another team's leader, who names their team, lets their players in and gives the roles; the host starts. */
export type LobbyFlow = "solo" | "group" | "multi" | "leader";
const FLOWS: Readonly<Record<LobbyFlow, readonly LobbyStage[]>> = Object.freeze({
  solo: ["count", "ready"], group: ["count", "here", "roles", "ready"],
  multi: ["count", "teams", "name", "here", "roles", "ready"], leader: ["name", "here", "roles", "ready"],
});
export const flowStages = (flow: LobbyFlow): readonly LobbyStage[] => FLOWS[flow];
/** The flow for this phone: a team's leader who isn't the host has their own; otherwise it follows the count. */
export function lobbyFlow(lobby: LobbyView, leaderOnly: boolean): LobbyFlow {
  if (leaderOnly) return "leader";
  if (lobby.count === 1) return "solo";
  return lobby.needsTeams ? "multi" : "group";
}
/** The step to show. Players without lobby powers (and not leading a team) only wait. Without a count the host stays on the count; a
 * stage this flow doesn't have moves to the nearest one it does (a changed count can turn a group into teams and back). */
export type LobbyStep = "waiting" | LobbyStage;
export function lobbyStep(lobby: LobbyView, stage: LobbyStage, leaderOnly = false): LobbyStep {
  if (!lobby.canManage && !leaderOnly) return "waiting";
  const flow = lobbyFlow(lobby, leaderOnly);
  if (flow !== "leader" && (stage === "count" || lobby.count === null)) return "count";
  const stages = FLOWS[flow];
  if (stages.includes(stage)) return stage;
  const order = FLOWS.multi;
  return stages.find(candidate => order.indexOf(candidate) >= order.indexOf(stage)) ?? stages[stages.length - 1];
}
/** The next and previous steps in a flow, for Continue and Back. */
export const nextStage = (flow: LobbyFlow, stage: LobbyStage): LobbyStage => { const stages = FLOWS[flow]; return stages[Math.min(stages.length - 1, stages.indexOf(stage) + 1)]; };
export const previousStage = (flow: LobbyFlow, stage: LobbyStage): LobbyStage => { const stages = FLOWS[flow]; return stages[Math.max(0, stages.indexOf(stage) - 1)]; };

/** The stepper's states: done, current, to come, for this flow. */
export type StepperState = Readonly<{ stage: LobbyStage; status: "done" | "current" | "todo" }>;
export function stepperStates(current: LobbyStage, flow: LobbyFlow): readonly StepperState[] {
  const stages = FLOWS[flow];
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
export function requiredRolesMissing(roles: GroupRoleAssignments, memberIds: readonly string[]): readonly PermissionRole[] {
  if (memberIds.length === 0 || isSoloTeam(memberIds)) return [];
  return (["navigator", "answerSubmitter"] as const).filter(role => roles[role] === null);
}

/** What the players' waiting screen says the host is doing, from what the server already holds: no count yet, the roles still being
 * chosen, or ready to go. */
export function waitingStage(adventure: Pick<AdventureView, "intendedCount">, roles: GroupRoleAssignments, memberIds: readonly string[], team?: Pick<TeamView, "count" | "name">): LobbyStage {
  if (adventure.intendedCount === null) return "count";
  // With several teams (I7a), each team first names itself.
  if (team && team.count > 1 && team.name === null) return "name";
  return requiredRolesMissing(roles, memberIds).length ? "roles" : "ready";
}

/** This phone's own team as the server shows it (I7a): its name (null until confirmed), avatar, initials, how many teams the adventure
 * has, and, in the lobby, the other teams' name keys. */
export type TeamView = Readonly<{ id: string; name: string | null; avatarId: string | null; initials: string; count: number; taken: readonly string[] }>;
/** One row of the host's overview of the teams (I7a): no answers and no players' details. */
export type TeamOverviewView = Readonly<{ id: string; name: string | null; avatarId: string | null; initials: string;
  leader: "none" | "waiting" | "expired" | "accepted"; host: boolean; members: number; named: boolean; rolesMissing: number; ready: boolean }>;
/** How many players this team expects, from the count's even split (I7a): team A gets the first size, B the next, and so on. */
export function expectedTeamSize(count: number | null, teamId: string): number | null {
  if (count === null) return null;
  const sizes = recommendedTeamSizes(count);
  const index = "ABCDEF".indexOf(teamId);
  return sizes[index] ?? sizes[sizes.length - 1];
}
/** The teams the host is still waiting for before Start, by their names (or "Team B"). */
export const teamsNotReady = (teams: readonly TeamOverviewView[]) => teams.filter(team => !team.ready).map(team => team.name ?? `Team ${team.id}`);
