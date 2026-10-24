import type { ArrivalAction } from "./mission-arrival.ts";
import type { DevWaterAction } from "./dev-water-session.ts";

/** Shared-state actions sent by browsers. Role changes apply to the whole group; every other action names its mission. */
type GroupWideAction = Extract<DevWaterAction, { type: "assign-role" | "switch-actor" }>;
/** Adds or removes one option in a "choose N" challenge's shared selection. */
export type ChoiceAction = Readonly<{ type: "toggle-choice"; optionId: string }>;
export type MissionAction = (Exclude<DevWaterAction, GroupWideAction | ArrivalAction> | ChoiceAction) & Readonly<{ missionId: string }>;
export type GroupAction = GroupWideAction | ArrivalAction | MissionAction;
