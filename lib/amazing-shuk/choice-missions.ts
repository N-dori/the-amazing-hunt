import type { ChoiceChallenge } from "./choice-task.ts";
import { MURAL_CHALLENGE, MURAL_MISSION_ID, MURAL_TASK } from "./mural-task.ts";
import { SYNAGOGUE_APPRECIATION, SYNAGOGUE_BONUS, SYNAGOGUE_BONUS_CHALLENGE, SYNAGOGUE_CHALLENGE, SYNAGOGUE_MISSION_ID, SYNAGOGUE_TASK } from "./synagogue-task.ts";
import { MONTEFIORE_BONUS, MONTEFIORE_BONUS_CHALLENGE, MONTEFIORE_CHALLENGE, MONTEFIORE_MISSION_ID, MONTEFIORE_TASK } from "./montefiore-task.ts";
import { LEVIN_BONUS, LEVIN_BONUS_CHALLENGE, LEVIN_CHALLENGE, LEVIN_MISSION_ID, LEVIN_TASK } from "./levin-task.ts";
import { MARZIPAN_APPRECIATION, MARZIPAN_BONUS, MARZIPAN_BONUS_CHALLENGE, MARZIPAN_CHALLENGE, MARZIPAN_HORNS_CHALLENGE, MARZIPAN_MISSION_ID, MARZIPAN_TASK } from "./marzipan-task.ts";

type Statement = Readonly<{ label: string; text: string }>;
/** What a "choose N" mission shows: its story, question and hints, then a reveal once the group's answer is accepted. */
export type ChoiceTaskContent = Readonly<{
  title: string; instruction: string;
  story: Readonly<{ title: string; paragraphs: readonly Statement[]; source: string }>;
  question: string;
  hints: readonly Readonly<{ title: string; text: string }>[];
  // Replaces "Challenge completed!" where a celebration would jar (a serious story).
  completionTitle?: string;
  // An unscored guess before the challenge starts: the group talks, then opens the answer. Nothing is sent or stored.
  prediction?: PredictionContent;
  // Further questions, in the order of the mission's `followUps`. `lead` answers the question before, so the group learns
  // why it was right as the next one opens.
  followUps?: readonly Readonly<{ lead: readonly Statement[]; question: string; hints: readonly Readonly<{ title: string; text: string }>[] }>[];
  // After completion, a button to the Food tab. It opens the tab only: it never redeems or orders anything.
  foodAction?: string;
  // A statement without a label is an instruction to the group, not a claim.
  reveal: Readonly<{
    paragraphs?: readonly Readonly<{ label?: string; text: string }>[];
    image: Readonly<{ src: string; width: number; height: number; alt: string; caption: string }> | null;
  }>;
}>;

/** An optional question after the main answer. Every reveal statement carries its label.
 * A Hebrew `verse` and `letters` (shown as tiles) give a word puzzle something to look at; the picks still use the cards. */
export type BonusContent = Readonly<{ title: string; intro: string; question: string; reveal: readonly Statement[]; verse?: string; letters?: readonly string[] }>;
/** An unscored "what do you think?" with a hidden answer the group opens when ready. */
export type PredictionContent = Readonly<{ title: string; question: string; invitation: string; reveal: readonly Statement[] }>;
/** An optional, unscored moment after the main answer: an invitation, never a task. */
export type AppreciationContent = Readonly<{ title: string; paragraphs: readonly Statement[]; invitation: string; note: string }>;

// `followUps` are the same challenge objects as the mission definition's, in order.
type ChoiceMission = Readonly<{ task: ChoiceTaskContent; challenge: ChoiceChallenge; followUps?: readonly ChoiceChallenge[]; bonus?: Readonly<{ content: BonusContent; challenge: ChoiceChallenge }>; appreciation?: AppreciationContent }>;
const CHOICE_TASKS: Readonly<Record<string, ChoiceMission>> = Object.freeze({
  [MURAL_MISSION_ID]: { task: MURAL_TASK, challenge: MURAL_CHALLENGE },
  [SYNAGOGUE_MISSION_ID]: { task: SYNAGOGUE_TASK, challenge: SYNAGOGUE_CHALLENGE,
    bonus: { content: SYNAGOGUE_BONUS, challenge: SYNAGOGUE_BONUS_CHALLENGE }, appreciation: SYNAGOGUE_APPRECIATION },
  [MONTEFIORE_MISSION_ID]: { task: MONTEFIORE_TASK, challenge: MONTEFIORE_CHALLENGE, bonus: { content: MONTEFIORE_BONUS, challenge: MONTEFIORE_BONUS_CHALLENGE } },
  [LEVIN_MISSION_ID]: { task: LEVIN_TASK, challenge: LEVIN_CHALLENGE, bonus: { content: LEVIN_BONUS, challenge: LEVIN_BONUS_CHALLENGE } },
  [MARZIPAN_MISSION_ID]: { task: MARZIPAN_TASK, challenge: MARZIPAN_CHALLENGE, followUps: [MARZIPAN_HORNS_CHALLENGE],
    bonus: { content: MARZIPAN_BONUS, challenge: MARZIPAN_BONUS_CHALLENGE }, appreciation: MARZIPAN_APPRECIATION },
});

export function findChoiceTask(missionId: string): ChoiceMission | null {
  return CHOICE_TASKS[missionId] ?? null;
}
