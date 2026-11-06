/** The two roles that carry permissions: the Navigator starts, the Submitter submits. */
export type PermissionRole = "navigator" | "answerSubmitter";
/** The four main roles a team's leader gives (owner, 5 Nov 2026). The Researcher carries no permission (4 Nov); the Photographer will
 * submit photo answers once a photo challenge exists. A player may hold several. */
export type AssignableGroupRole = PermissionRole | "researcher" | "photographer";
export const MAIN_ROLES: readonly AssignableGroupRole[] = Object.freeze(["navigator", "answerSubmitter", "researcher", "photographer"]);
export type ParticipantRole = PermissionRole | "navigatorAndAnswerSubmitter" | "follower";
/** Stored per team. Researcher and Photographer are optional, so a file written before them (and the rollback image, which keeps
 * unknown keys when it spreads the roles) reads unchanged; absent means nobody holds them. */
export type GroupRoleAssignments = Readonly<{ navigator: string | null; answerSubmitter: string | null; researcher?: string | null; photographer?: string | null }>;
/** Who holds `role`, with an absent optional role read as nobody. */
export const holderOf = (roles: GroupRoleAssignments, role: AssignableGroupRole): string | null => roles[role] ?? null;

function assertValidRoster(participantIds: readonly string[], roles: GroupRoleAssignments): void {
  if (participantIds.some((id) => typeof id !== "string" || id.trim().length === 0)) throw new Error("participant IDs must be non-empty strings");
  if (new Set(participantIds).size !== participantIds.length) throw new Error("participant IDs must be unique");
  for (const id of MAIN_ROLES.map(role => holderOf(roles, role))) {
    if (id !== null && !participantIds.includes(id)) throw new Error("role assignments must reference a current group participant");
  }
}

/** Pure role assignment for the single shared group. Callers must authorize guide actions server-side. */
export function setGroupRole(participantIds: readonly string[], current: GroupRoleAssignments, role: AssignableGroupRole, participantId: string | null): GroupRoleAssignments {
  assertValidRoster(participantIds, current);
  if (!MAIN_ROLES.includes(role)) throw new Error("unknown assignable group role");
  if (participantId !== null && !participantIds.includes(participantId)) throw new Error("role target must be a current group participant");
  return Object.freeze({ ...current, [role]: participantId });
}

/** A player takes a role only while it is free (or already theirs); a role someone else holds can't be taken. */
export function claimGroupRole(participantIds: readonly string[], current: GroupRoleAssignments, role: AssignableGroupRole, participantId: string): GroupRoleAssignments {
  const holder = holderOf(current, role);
  if (holder !== null && holder !== participantId) throw new Error("role is already taken");
  return setGroupRole(participantIds, current, role, participantId);
}

/** Only the player holding a role can step down from it; the role becomes free for anyone to take. */
export function releaseGroupRole(participantIds: readonly string[], current: GroupRoleAssignments, role: AssignableGroupRole, participantId: string): GroupRoleAssignments {
  if (holderOf(current, role) !== participantId) throw new Error("only the role holder can step down");
  return setGroupRole(participantIds, current, role, null);
}

export function roleForParticipant(participantId: string, roles: GroupRoleAssignments): ParticipantRole {
  const isNavigator = roles.navigator === participantId;
  const isAnswerSubmitter = roles.answerSubmitter === participantId;
  if (isNavigator && isAnswerSubmitter) return "navigatorAndAnswerSubmitter";
  if (isNavigator) return "navigator";
  if (isAnswerSubmitter) return "answerSubmitter";
  return "follower";
}

/** A team of exactly one member (the guide is never a member) plays solo (owner, D12, 2 Nov 2026). */
export function isSoloTeam(memberIds: readonly string[]): boolean {
  return memberIds.length === 1;
}

/**
 * The roles that decide what each member may do. A solo player holds both, so they never claim roles; any other team uses its
 * stored roles unchanged. Computed on every read, never stored: when a second member joins, the stored roles apply again.
 */
export function effectiveRoles(memberIds: readonly string[], stored: GroupRoleAssignments): GroupRoleAssignments {
  if (!isSoloTeam(memberIds)) return stored;
  const [only] = memberIds;
  return Object.freeze({ navigator: only, answerSubmitter: only });
}

/** Who may press "I'm completely stuck" (owner, D5, 2 Nov 2026): the guide, the Submitter (a solo player holds it, D12), or anyone
 * while the team's Submitter seat is empty, so a missing Submitter never strands the team. Submitting itself keeps its own rule. */
export function mayReveal(participantId: string, roles: GroupRoleAssignments, guide: boolean): boolean {
  return guide || roles.answerSubmitter === null || roles.answerSubmitter === participantId;
}

/** The roles `participantId` holds in `next` but didn't in `previous`: what their phone announces with a role card (owner, 5 Nov 2026).
 * Nothing on the first read (`previous` null), so a reload or a phone signing in doesn't announce roles already held. */
export function newlyHeldRoles(previous: GroupRoleAssignments | null | undefined, next: GroupRoleAssignments, participantId: string): readonly AssignableGroupRole[] {
  if (!previous) return [];
  return MAIN_ROLES.filter(role => holderOf(next, role) === participantId && holderOf(previous, role) !== participantId);
}

/** The main roles one participant holds, in order. A solo player holds every role (owner, 5 Nov 2026), whatever is stored. */
export function heldRoles(roles: GroupRoleAssignments, participantId: string, solo = false): readonly AssignableGroupRole[] {
  return solo ? MAIN_ROLES : MAIN_ROLES.filter(role => holderOf(roles, role) === participantId);
}

/** Who may change the group's answer while a challenge runs (owner, 5 Nov 2026: only the Submitter picks or moves; the others watch):
 * the Submitter, the guide, or anyone while the Submitter seat is empty, so a missing Submitter never strands the team. */
export function mayChangeAnswer(participantId: string, roles: GroupRoleAssignments, guide: boolean): boolean {
  return mayReveal(participantId, roles, guide);
}

/** Who may take the group on to the next stop (owner, 5 Nov 2026): the Navigator, the guide, a solo player, or anyone while the Navigator
 * seat is empty. Everyone else sees the button disabled, with a short note. Moving on is a screen change on this phone, not a server action. */
export function mayLead(participantId: string, roles: GroupRoleAssignments, guide: boolean, solo: boolean): boolean {
  return guide || solo || roles.navigator === null || roles.navigator === participantId;
}
