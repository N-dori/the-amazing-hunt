import { DEV_GUIDE_ID, DEV_PARTICIPANTS } from "./dev-water-session.ts";
import type { GroupRoleAssignments } from "./roles.ts";

/**
 * Display names for the fixed participant IDs. They are personal data, so they live only in the server's state file (set with
 * scripts/shuk-name.ts), never in git. IDs never change, so avatars, roles and progress keep working when a name changes.
 */
export const MAX_DISPLAY_NAME = 40;
export type ParticipantNames = Readonly<Record<string, string>>;
const KNOWN_IDS: readonly string[] = [...DEV_PARTICIPANTS.map(participant => participant.id), DEV_GUIDE_ID];

/** A trimmed name of 1–40 characters with no control characters, or null. */
export function cleanDisplayName(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const name = value.trim().replace(/\s+/g, " ");
  return name.length >= 1 && name.length <= MAX_DISPLAY_NAME && !/[\u0000-\u001f\u007f]/.test(name) ? name : null;
}

export function isValidNames(value: unknown): value is ParticipantNames {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    && Object.entries(value).every(([id, name]) => KNOWN_IDS.includes(id) && cleanDisplayName(name) === name);
}

/** Sets or clears one participant's name, returning a new map. Throws for an unknown participant or an invalid name. */
export function setDisplayName(names: ParticipantNames, participantId: string, name: string | null): ParticipantNames {
  if (!KNOWN_IDS.includes(participantId)) throw new Error("Unknown participant");
  if (name === null) return Object.fromEntries(Object.entries(names).filter(([id]) => id !== participantId));
  const clean = cleanDisplayName(name);
  if (!clean) throw new Error(`A name needs 1–${MAX_DISPLAY_NAME} characters`);
  return { ...names, [participantId]: clean };
}

/**
 * The group as players see it, in roster order, then the guide. With no names set (the local simulation) everyone is listed as
 * "Player N". Once names are set, only named players and anyone holding a role are listed, so unused slots don't show.
 */
export function groupParticipants(names: ParticipantNames, roles: GroupRoleAssignments): readonly Readonly<{ id: string; name: string }>[] {
  const named = DEV_PARTICIPANTS.some(participant => names[participant.id]);
  const players = DEV_PARTICIPANTS
    .filter(participant => !named || names[participant.id] || roles.navigator === participant.id || roles.answerSubmitter === participant.id)
    .map(participant => ({ id: participant.id, name: names[participant.id] ?? participant.name }));
  return [...players, { id: DEV_GUIDE_ID, name: names[DEV_GUIDE_ID] ?? "Guide" }];
}
