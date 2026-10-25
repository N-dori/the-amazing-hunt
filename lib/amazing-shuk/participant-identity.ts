import type { GroupRoleAssignments, ParticipantRole } from "./roles.ts";

/** What players see for a role. Everyone without one is an advisor (owner's word, 25 Oct 2026); the code keeps "follower". */
export function roleLabel(role: ParticipantRole | "guide"): string {
  return { navigator: "Navigator", answerSubmitter: "Answer-submitter", navigatorAndAnswerSubmitter: "Navigator and answer-submitter", follower: "Advisor", guide: "Guide" }[role];
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
 * Players without a role are advisors; the guide is the guide. */
export function buildGroupRoster(participants: readonly ParticipantIdentity[], roles: GroupRoleAssignments, currentId: string, guideId = "guide") {
  return participants.map(participant => ({
    participantId: participant.id, displayName: participant.name, customImageSrc: participant.customImageSrc,
    responsibilities: participant.id === guideId ? ["Guide"] : responsibilitiesOf(participant.id, roles).length ? responsibilitiesOf(participant.id, roles) : ["Advisor"],
    current: participant.id === currentId,
  }));
}

export type RoleChoiceView = Readonly<{ role: "navigator" | "answerSubmitter"; label: string; holder: string | null; mine: boolean; canClaim: boolean }>;
/** The two roles as the signed-in player sees them: who holds each, and whether they can take it or step down. */
export function buildRoleChoices(participants: readonly ParticipantIdentity[], roles: GroupRoleAssignments, currentId: string, guide: boolean): readonly RoleChoiceView[] {
  return (["navigator", "answerSubmitter"] as const).map(role => {
    const holderId = roles[role];
    return { role, label: role === "navigator" ? "Navigator" : "Answer-submitter",
      holder: holderId === null ? null : participants.find(participant => participant.id === holderId)?.name ?? holderId,
      mine: holderId === currentId, canClaim: !guide && holderId === null };
  });
}
