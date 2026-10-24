import type { GroupRoleAssignments } from "./roles.ts";
export type ParticipantIdentity = Readonly<{ id: string; name: string; customImageSrc?: string | null }>;
export type ParticipantIdentityView = Readonly<{ participantId: string; displayName: string; customImageSrc?: string | null; responsibilities: readonly string[] }>;
export function buildParticipantIdentities(participants: readonly ParticipantIdentity[], roles: GroupRoleAssignments, currentId: string) {
  const toView = (participant: ParticipantIdentity): ParticipantIdentityView => ({
    participantId: participant.id, displayName: participant.name, customImageSrc: participant.customImageSrc,
    responsibilities: [roles.navigator === participant.id ? "Navigator" : null, roles.answerSubmitter === participant.id ? "Answer-submitter" : null].filter((role): role is string => role !== null),
  });
  const current = participants.find(participant => participant.id === currentId);
  return {
    current: current ? toView(current) : null,
    assignments: participants.filter(participant => participant.id === roles.navigator || participant.id === roles.answerSubmitter).map(toView),
    unassigned: [roles.navigator === null ? "Navigator" : null, roles.answerSubmitter === null ? "Answer-submitter" : null].filter((role): role is string => role !== null),
  };
}
