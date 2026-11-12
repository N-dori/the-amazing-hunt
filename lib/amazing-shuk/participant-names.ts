import { DEV_GUIDE_ID, DEV_PARTICIPANTS } from "./dev-water-session.ts";

/**
 * Display names: the operator's names for the seats (player-1…7, guide), and a member's own name. They are personal data, so they
 * live only in the server's state file (set with scripts/shuk-name.ts), never in git, and they are labels only: they grant nothing.
 * IDs never change, so avatars, roles and progress keep working when a name changes.
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
 * The team as players see it: its members in the order they joined (members carried over from schema 6 joined at 0, so they keep
 * seat order), then the guide. A member's own name, else the operator's name for their seat, else "Player N" for a seat.
 * TODO(copy): "Participant" for a member with neither is a draft (members without a seat arrive with I3b's join link).
 */
export function rosterParticipants(members: readonly Readonly<{ id: string; joinedAt: number; seat?: string; name?: string }>[], seatNames: ParticipantNames): readonly Readonly<{ id: string; name: string }>[] {
  const seatOrder = (seat: string | undefined) => { const index = DEV_PARTICIPANTS.findIndex(participant => participant.id === seat); return index < 0 ? DEV_PARTICIPANTS.length : index; };
  const players = [...members].sort((a, b) => a.joinedAt - b.joinedAt || seatOrder(a.seat) - seatOrder(b.seat) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
    .map(member => ({ id: member.id, name: member.name ?? (member.seat === undefined ? undefined : seatNames[member.seat] ?? DEV_PARTICIPANTS.find(participant => participant.id === member.seat)?.name) ?? "Participant" }));
  return [...players, { id: DEV_GUIDE_ID, name: seatNames[DEV_GUIDE_ID] ?? "Guide" }];
}
