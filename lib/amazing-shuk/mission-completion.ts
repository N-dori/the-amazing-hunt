import type { ChoiceTaskContent } from "./choice-missions.ts";
import { GATEWAY_YEAR, MONTEFIORE_TASK } from "./montefiore-task.ts";
import { WATER_TASK } from "./water-task.ts";

/** Presentation copy only. Rewards always come from the persisted server result. */
export type MissionVictoryCopy = Readonly<{ title: string; summary?: string }>;
export const MISSION_VICTORY: MissionVictoryCopy = { title: "Challenge completed!" };
export const GATEWAY_VICTORY: MissionVictoryCopy = {
  title: "You cracked the code!",
  summary: "The mystery of the Montefiore Gateway is solved.",
};
export type MissionDiscovery = Readonly<{
  title: string;
  paragraphs: readonly Readonly<{ text: string }>[];
  image?: Readonly<{ src: string; width: number; height: number; alt: string; caption: string }> | null;
  sequence?: Readonly<{ inscription: string; hebrewYear: number; gregorianYear: string }>;
  story?: Readonly<{ title: string; paragraphs: readonly Readonly<{ text: string }>[] }>;
}>;
export const GATEWAY_DISCOVERY: MissionDiscovery = {
  title: "The secret revealed",
  paragraphs: [{ text: MONTEFIORE_TASK.reveal }],
  sequence: { inscription: GATEWAY_YEAR.inscription, hebrewYear: GATEWAY_YEAR.hebrewYear, gregorianYear: GATEWAY_YEAR.gregorianYear },
  story: MONTEFIORE_TASK.story,
};
/** Reuse approved story/reveal copy; do not author historical claims in presenters. */
export function buildChoiceDiscovery(task: ChoiceTaskContent): MissionDiscovery {
  return {
    title: "The secret revealed",
    paragraphs: task.reveal.paragraphs?.length ? task.reveal.paragraphs : task.story.paragraphs.slice(0, 1),
    image: task.reveal.image,
    story: task.story,
  };
}
export const WELL_DISCOVERY: MissionDiscovery = {
  title: "The story of the well",
  // This is the existing attributed account, not a new historical claim about this exact cistern.
  paragraphs: WATER_TASK.story.paragraphs.slice(1, 3).map(text => ({ text })),
  story: { title: WATER_TASK.story.title, paragraphs: WATER_TASK.story.paragraphs.slice(0, 3).map(text => ({ text })) },
};
