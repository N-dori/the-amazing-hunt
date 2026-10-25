export type AssignableGroupRole = "navigator" | "answerSubmitter";
export type ParticipantRole = AssignableGroupRole | "navigatorAndAnswerSubmitter" | "follower";
export type GroupRoleAssignments = Readonly<{ navigator: string | null; answerSubmitter: string | null }>;

function assertValidRoster(participantIds: readonly string[], roles: GroupRoleAssignments): void {
  if (participantIds.some((id) => typeof id !== "string" || id.trim().length === 0)) throw new Error("participant IDs must be non-empty strings");
  if (new Set(participantIds).size !== participantIds.length) throw new Error("participant IDs must be unique");
  for (const id of [roles.navigator, roles.answerSubmitter]) {
    if (id !== null && !participantIds.includes(id)) throw new Error("role assignments must reference a current group participant");
  }
}

/** Pure role assignment for the single shared group. Callers must authorize guide actions server-side. */
export function setGroupRole(participantIds: readonly string[], current: GroupRoleAssignments, role: AssignableGroupRole, participantId: string | null): GroupRoleAssignments {
  assertValidRoster(participantIds, current);
  if (role !== "navigator" && role !== "answerSubmitter") throw new Error("unknown assignable group role");
  if (participantId !== null && !participantIds.includes(participantId)) throw new Error("role target must be a current group participant");
  return Object.freeze({ ...current, [role]: participantId });
}

/** A player takes a role only while it is free (or already theirs); a role someone else holds can't be taken. */
export function claimGroupRole(participantIds: readonly string[], current: GroupRoleAssignments, role: AssignableGroupRole, participantId: string): GroupRoleAssignments {
  const holder = current[role];
  if (holder !== null && holder !== participantId) throw new Error("role is already taken");
  return setGroupRole(participantIds, current, role, participantId);
}

/** Only the player holding a role can step down from it; the role becomes free for anyone to take. */
export function releaseGroupRole(participantIds: readonly string[], current: GroupRoleAssignments, role: AssignableGroupRole, participantId: string): GroupRoleAssignments {
  if (current[role] !== participantId) throw new Error("only the role holder can step down");
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
