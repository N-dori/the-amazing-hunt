import { WATER_TASK_ID } from "./water-measurement.ts";

type MissionRecordShape = { cups: unknown; completed: unknown; arrival: unknown; performance: unknown };
type Schema4Shape = { [key: string]: unknown; version: number; arrival?: unknown; performance?: unknown; group: { roles: unknown; cups: unknown; completed: unknown } };

/** Test fixture: rewrites a current (schema 5) snapshot as the schema 4 single-mission file, for migration tests. */
export function schema4Snapshot(db: { [key: string]: unknown; roles: unknown; missions: Record<string, MissionRecordShape> }): Schema4Shape {
  const { missions, roles, ...rest } = db;
  const well = missions[WATER_TASK_ID];
  return { ...rest, version: 4, arrival: well.arrival, performance: well.performance, group: { roles, cups: well.cups, completed: well.completed } };
}
