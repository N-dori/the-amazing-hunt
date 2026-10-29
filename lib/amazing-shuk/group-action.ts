import type { ArrivalAction } from "./mission-arrival.ts";
import type { DevWaterAction } from "./dev-water-session.ts";

import type { AssignableGroupRole } from "./roles.ts";

/** A player takes a free role, or steps down from their own. Everyone without a role is an advisor. */
export type RoleChoiceAction = Readonly<{ type: "claim-role"; role: AssignableGroupRole }> | Readonly<{ type: "release-role"; role: AssignableGroupRole }>;
/** The lobby, before the adventure starts: the host or guide says how many are playing, then starts.
 * `asOneTeam` confirms a one-team start when the count recommends more teams than the app can create yet. */
export type AdventureAction = Readonly<{ type: "set-intended-count"; count: number }> | Readonly<{ type: "start-adventure"; asOneTeam?: boolean }>;
/** Shared-state actions sent by browsers. Role changes apply to the whole group, lobby actions to the adventure; every other action names its mission. */
type GroupWideAction = Extract<DevWaterAction, { type: "assign-role" | "switch-actor" }> | RoleChoiceAction | AdventureAction;
/** Adds or removes one option in a "choose N" challenge's shared selection. */
export type ChoiceAction = Readonly<{ type: "toggle-choice"; optionId: string }>;
// `part: "bonus"` aims a toggle, reset or submit at the mission's optional bonus question instead of its main challenge.
export type MissionAction = (Exclude<DevWaterAction, GroupWideAction | ArrivalAction> | ChoiceAction) & Readonly<{ missionId: string; part?: "bonus" }>;
export type GroupAction = GroupWideAction | ArrivalAction | MissionAction;
