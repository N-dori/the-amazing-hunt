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

/** One screen at a time in the lobby (compact onboarding, 30 Oct 2026): the count, then either Ready to Start (one team) or the teams
 * recommendation (6–30, which can't start yet). Players without lobby powers only wait. `counted` is the host's Continue on this phone. */
export type LobbyStep = "waiting" | "count" | "ready" | "teams";
export function lobbyStep(lobby: LobbyView, counted: boolean): LobbyStep {
  if (!lobby.canManage) return "waiting";
  if (!counted || lobby.recommendation === null) return "count";
  return lobby.needsTeams ? "teams" : "ready";
}
