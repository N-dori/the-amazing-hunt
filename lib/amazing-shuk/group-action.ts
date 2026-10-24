import type { ArrivalAction } from "./mission-arrival.ts";
import type { DevWaterAction } from "./dev-water-session.ts";

/** Shared-state actions sent by browsers. Role changes apply to the whole group; every other action names its mission. */
type GroupWideAction = Extract<DevWaterAction, { type: "assign-role" | "switch-actor" }>;
export type MissionAction = Exclude<DevWaterAction, GroupWideAction | ArrivalAction> & Readonly<{ missionId: string }>;
export type GroupAction = GroupWideAction | ArrivalAction | MissionAction;
