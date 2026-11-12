import type { ArrivalAction } from "./mission-arrival.ts";
import type { DevWaterAction } from "./dev-water-session.ts";
import type { GatewayStage } from "./gateway-progress.ts";
import type { AssignableGroupRole } from "./roles.ts";

import type { AssignableGroupRole } from "./roles.ts";

/** A player takes a free role, or steps down from their own. Everyone without a role helps at each stop (Advisor was removed, owner, 5 Nov 2026). */
export type RoleChoiceAction = Readonly<{ type: "claim-role"; role: AssignableGroupRole }> | Readonly<{ type: "release-role"; role: AssignableGroupRole }>;
/** The lobby, before the adventure starts: the host or guide says how many are playing, then starts. */
export type AdventureAction = Readonly<{ type: "set-intended-count"; count: number }> | Readonly<{ type: "start-adventure" }>
  | Readonly<{ type: "set-teams" }>;
/** I7a: a team's leader names the team before Start; the guide may correct it. */
export type TeamNameAction = Readonly<{ type: "name-team"; name: string }>;
/** The team's leader or the guide decides on a join request (by its public ID), or removes a member (I3b). */
export type MembershipAction = Readonly<{ type: "let-in"; requestId: string }> | Readonly<{ type: "decline"; requestId: string }>
  | Readonly<{ type: "remove-member"; participantId: string }>;
/** Shared-state actions sent by browsers. Role changes and membership apply to the whole group, lobby actions to the adventure; every other action names its mission. */
type GroupWideAction = Extract<DevWaterAction, { type: "assign-role" | "switch-actor" }> | RoleChoiceAction | AdventureAction | MembershipAction | TeamNameAction;
/** Adds or removes one option in a "choose N" challenge's shared selection. */
export type ChoiceAction = Readonly<{ type: "toggle-choice"; optionId: string }> | Readonly<{ type: "set-gateway-year"; answer: string }>;
// `part: "bonus"` aims a toggle, reset or submit at the mission's optional bonus question instead of its main challenge.
export type MissionAction = (Exclude<DevWaterAction, GroupWideAction | ArrivalAction> | ChoiceAction) & Readonly<{ missionId: string; part?: "bonus"; stage?: GatewayStage }>;
export type RoleVolunteerAction = { [T in "volunteer-role" | "withdraw-role" | "step-down-role"]: Readonly<{ type: T; role: AssignableGroupRole }> }["volunteer-role" | "withdraw-role" | "step-down-role"];
export type GroupAction = GroupWideAction | RoleVolunteerAction | ArrivalAction | MissionAction;
