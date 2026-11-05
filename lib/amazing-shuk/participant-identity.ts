import type { AssignableGroupRole, GroupRoleAssignments, ParticipantRole } from "./roles.ts";

/** What players see for a role, or null for a player with no main role: Advisor was removed (owner, 5 Nov 2026); those players get
 * the stop's parts instead. The code keeps "follower". */
export function roleLabel(role: ParticipantRole | "guide"): string | null {
  return { navigator: "Navigator", answerSubmitter: "Answer-submitter", navigatorAndAnswerSubmitter: "Navigator and answer-submitter", follower: null, guide: "Guide" }[role];
}
export type ParticipantIdentity = Readonly<{ id: string; name: string; customImageSrc?: string | null }>;
export type ParticipantIdentityView = Readonly<{ participantId: string; displayName: string; customImageSrc?: string | null; responsibilities: readonly string[] }>;
const responsibilitiesOf = (id: string, roles: GroupRoleAssignments) =>
  [roles.navigator === id ? "Navigator" : null, roles.answerSubmitter === id ? "Answer-submitter" : null].filter((role): role is string => role !== null);
export function buildParticipantIdentities(participants: readonly ParticipantIdentity[], roles: GroupRoleAssignments, currentId: string) {
  const toView = (participant: ParticipantIdentity): ParticipantIdentityView => ({
    participantId: participant.id, displayName: participant.name, customImageSrc: participant.customImageSrc,
    responsibilities: responsibilitiesOf(participant.id, roles),
  });
  const current = participants.find(participant => participant.id === currentId);
  return {
    current: current ? toView(current) : null,
    assignments: participants.filter(participant => participant.id === roles.navigator || participant.id === roles.answerSubmitter).map(toView),
    unassigned: [roles.navigator === null ? "Navigator" : null, roles.answerSubmitter === null ? "Answer-submitter" : null].filter((role): role is string => role !== null),
  };
}

/** Everyone in the group, in roster order, each with their responsibilities and whether they are the signed-in participant.
 * Players without a main role show none (Advisor was removed, owner, 5 Nov 2026); the guide is the guide. */
export function buildGroupRoster(participants: readonly ParticipantIdentity[], roles: GroupRoleAssignments, currentId: string, guideId = "guide") {
  return participants.map(participant => ({
    participantId: participant.id, displayName: participant.name, customImageSrc: participant.customImageSrc,
    responsibilities: participant.id === guideId ? ["Guide"] : responsibilitiesOf(participant.id, roles),
    current: participant.id === currentId,
  }));
}

export type RoleChoiceView = Readonly<{ role: "navigator" | "answerSubmitter"; label: string; holderId: string | null; holder: string | null; mine: boolean; canClaim: boolean }>;
/** The two roles as the signed-in player sees them: who holds each, and whether they can take it or step down. */
export function buildRoleChoices(participants: readonly ParticipantIdentity[], roles: GroupRoleAssignments, currentId: string, guide: boolean): readonly RoleChoiceView[] {
  return (["navigator", "answerSubmitter"] as const).map(role => {
    const holderId = roles[role];
    return { role, label: role === "navigator" ? "Navigator" : "Answer-submitter", holderId,
      holder: holderId === null ? null : participants.find(participant => participant.id === holderId)?.name ?? holderId,
      mine: holderId === currentId, canClaim: !guide && holderId === null };
  });
}

export type RoleAssigneeView = Readonly<{ id: string; name: string; you: boolean }>;
/** Who a team's leader can give a role to (I4a): the team's own members, in roster order, never the guide. */
export function buildRoleAssignees(participants: readonly ParticipantIdentity[], currentId: string, guideId = "guide"): readonly RoleAssigneeView[] {
  return participants.filter(participant => participant.id !== guideId).map(participant => ({ id: participant.id, name: participant.name, you: participant.id === currentId }));
}

export type LobbyRoleChipView = Readonly<{ id: string; name: string; you: boolean; selected: boolean }>;
export type LobbyRoleRowView = Readonly<{ role: AssignableGroupRole; holderId: string | null; chips: readonly LobbyRoleChipView[] }>;
/** The roles step of the lobby, the casting call (owner, 5 Nov 2026): one row per required role, in order, each with a chip for every
 * member of the team (never the guide), the holder selected. One player may hold both roles. */
export function buildLobbyRoleRows(participants: readonly ParticipantIdentity[], roles: GroupRoleAssignments, currentId: string, guideId = "guide"): readonly LobbyRoleRowView[] {
  const assignees = buildRoleAssignees(participants, currentId, guideId);
  return (["navigator", "answerSubmitter"] as const).map(role => ({ role, holderId: roles[role],
    chips: assignees.map(person => ({ ...person, selected: person.id === roles[role] })) }));
}

/** The main roles one participant holds, in the lobby's order: what the waiting screen and the Ready step say about them. */
export function heldRoles(roles: GroupRoleAssignments, participantId: string): readonly AssignableGroupRole[] {
  return (["navigator", "answerSubmitter"] as const).filter(role => roles[role] === participantId);
}
