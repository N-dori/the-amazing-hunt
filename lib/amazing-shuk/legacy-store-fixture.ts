import { WATER_TASK_ID } from "./water-measurement.ts";
import { DEV_PARTICIPANTS } from "./dev-water-session.ts";

type MissionRecordShape = { cups: unknown; completed: unknown; arrival: unknown; performance: unknown };
type TeamShape = { roles: unknown; missions: Record<string, MissionRecordShape> };
type Schema6Shape = { [key: string]: unknown; teams: Record<string, TeamShape> };
type Schema5Shape = { [key: string]: unknown; version: number; roles: unknown; missions: Record<string, MissionRecordShape> };
type Schema4Shape = { [key: string]: unknown; version: number; arrival?: unknown; performance?: unknown; group: { roles: unknown; cups: unknown; completed: unknown } };
const SCHEMA6_ONLY = ["adventure", "teams", "participants"];

/** Parsed JSON, as loosely typed as `JSON.parse` returns it: the tests read stored files this way. */
type ParsedJson = ReturnType<typeof JSON.parse>;
/** Test fixture: one team's record in a stored (schema 6) snapshot; team A, the single group's team, unless named. */
export const storedTeam = (db: ParsedJson, teamId = "A"): ParsedJson => db.teams[teamId];

/**
 * Test fixture: rewrites a current (schema 7) snapshot as the schema 6 file it would have been. Schema 6 named members by seat,
 * listed every seat in team A, keyed names by seat and had no leader sessions; sessions, roles, the host, the leader, receipts and
 * invitations all named the seat. A schema 6 snapshot is returned unchanged.
 */
export function schema6Snapshot(db: ParsedJson): ParsedJson {
  if (db.version !== 7) return db;
  const seatOf = (id: string | null) => id === null ? null : db.participants[id]?.seat ?? id;
  const teamOf = (seat: string) => Object.values(db.participants as Record<string, { seat?: string; teamId: string }>).find(member => member.seat === seat)?.teamId ?? "A";
  const { seatNames, ...rest } = db;
  return { ...rest, version: 6,
    adventure: { ...db.adventure, hostId: seatOf(db.adventure.hostId) },
    teams: Object.fromEntries(Object.entries(db.teams as Record<string, ParsedJson>).map(([id, team]) => [id, { ...team, leaderId: seatOf(team.leaderId),
      roles: { navigator: seatOf(team.roles.navigator), answerSubmitter: seatOf(team.roles.answerSubmitter) } }])),
    participants: Object.fromEntries(DEV_PARTICIPANTS.map(participant => [participant.id, { teamId: teamOf(participant.id) }])),
    sessions: Object.fromEntries(Object.entries(db.sessions as Record<string, ParsedJson>).map(([key, session]) => [key,
      { participantId: seatOf(session.participantId), expiresAt: session.expiresAt, ...(session.host ? { host: true } : {}) }])),
    invitations: Object.fromEntries(Object.entries(db.invitations as Record<string, ParsedJson>).map(([key, { seat, ...invitation }]) => [key, { ...invitation, participantId: seat }])),
    applied: Object.fromEntries(Object.entries(db.applied as Record<string, string[]>).map(([id, receipts]) => [seatOf(id), receipts])),
    ...(seatNames ? { names: seatNames } : {}) };
}

/** Test fixture: rewrites a current snapshot as the schema 5 single-group file, for migration tests. */
export function schema5Snapshot(current: Schema6Shape): Schema5Shape {
  const db = schema6Snapshot(current) as Schema6Shape;
  const rest = Object.fromEntries(Object.entries(db).filter(([key]) => !SCHEMA6_ONLY.includes(key)));
  return { ...rest, version: 5, roles: db.teams.A.roles, missions: db.teams.A.missions };
}

/** Test fixture: rewrites a current (schema 6) snapshot as the schema 4 single-mission file, for migration tests. */
export function schema4Snapshot(db: Schema6Shape): Schema4Shape {
  const { missions, roles, ...rest } = schema5Snapshot(db);
  const well = missions[WATER_TASK_ID];
  return { ...rest, version: 4, arrival: well.arrival, performance: well.performance, group: { roles, cups: well.cups, completed: well.completed } };
}
