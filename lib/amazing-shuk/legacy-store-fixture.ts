import { WATER_TASK_ID } from "./water-measurement.ts";

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

/** Test fixture: rewrites a current (schema 6) snapshot as the schema 5 single-group file, for migration tests. */
export function schema5Snapshot(db: Schema6Shape): Schema5Shape {
  const rest = Object.fromEntries(Object.entries(db).filter(([key]) => !SCHEMA6_ONLY.includes(key)));
  return { ...rest, version: 5, roles: db.teams.A.roles, missions: db.teams.A.missions };
}

/** Test fixture: rewrites a current (schema 6) snapshot as the schema 4 single-mission file, for migration tests. */
export function schema4Snapshot(db: Schema6Shape): Schema4Shape {
  const { missions, roles, ...rest } = schema5Snapshot(db);
  const well = missions[WATER_TASK_ID];
  return { ...rest, version: 4, arrival: well.arrival, performance: well.performance, group: { roles, cups: well.cups, completed: well.completed } };
}
