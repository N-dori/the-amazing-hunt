import { GAN_HATUT_MISSION, type MissionDefinition } from "./mission-arrival.ts";
import { MURAL_MISSION } from "./mural-task.ts";
import { SYNAGOGUE_MISSION } from "./synagogue-task.ts";
import { MONTEFIORE_MISSION } from "./montefiore-task.ts";
import { LEVIN_MISSION } from "./levin-task.ts";

/** Missions the group can choose on the map, in marker order. Each stable ID keys its shared progress. */
export const SHUK_MISSIONS: readonly MissionDefinition[] = Object.freeze([GAN_HATUT_MISSION, MURAL_MISSION, SYNAGOGUE_MISSION, MONTEFIORE_MISSION, LEVIN_MISSION]);

export function findMission(id: string): MissionDefinition | undefined {
  return SHUK_MISSIONS.find(mission => mission.id === id);
}
