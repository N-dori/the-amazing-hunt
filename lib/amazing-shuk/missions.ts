import { GAN_HATUT_MISSION, type MissionDefinition } from "./mission-arrival.ts";
import { MURAL_MISSION } from "./mural-task.ts";
import { MONTEFIORE_MISSION } from "./montefiore-task.ts";
import { SYNAGOGUE_MISSION } from "./synagogue-task.ts";
import { MONTEFIORE_MISSION } from "./montefiore-task.ts";
import { LEVIN_MISSION } from "./levin-task.ts";
import { MARZIPAN_MISSION } from "./marzipan-task.ts";

/** Missions the group can choose on the map, in marker order. Each stable ID keys its shared progress. */
<<<<<<< HEAD
export const SHUK_MISSIONS: readonly MissionDefinition[] = Object.freeze([GAN_HATUT_MISSION, MURAL_MISSION, SYNAGOGUE_MISSION, MONTEFIORE_MISSION]);
=======
export const SHUK_MISSIONS: readonly MissionDefinition[] = Object.freeze([MURAL_MISSION, MONTEFIORE_MISSION, GAN_HATUT_MISSION, SYNAGOGUE_MISSION, LEVIN_MISSION, MARZIPAN_MISSION]);
>>>>>>> bb4234fb5b66e55047f6343e266fa8ee539f0a27

export function findMission(id: string): MissionDefinition | undefined {
  return SHUK_MISSIONS.find(mission => mission.id === id);
}
