import type { GroupRoleAssignments } from "./roles.ts";
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

/** Everyone in the group, in roster order, each with their responsibilities and whether they are the signed-in participant. */
export function buildGroupRoster(participants: readonly ParticipantIdentity[], roles: GroupRoleAssignments, currentId: string) {
  return participants.map(participant => ({
    participantId: participant.id, displayName: participant.name, customImageSrc: participant.customImageSrc,
    responsibilities: responsibilitiesOf(participant.id, roles),
    current: participant.id === currentId,
  }));
}
