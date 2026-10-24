import type { ChoiceChallenge } from "./choice-task.ts";
import { MURAL_CHALLENGE, MURAL_MISSION_ID, MURAL_TASK } from "./mural-task.ts";
import { SYNAGOGUE_APPRECIATION, SYNAGOGUE_BONUS, SYNAGOGUE_BONUS_CHALLENGE, SYNAGOGUE_CHALLENGE, SYNAGOGUE_MISSION_ID, SYNAGOGUE_TASK } from "./synagogue-task.ts";

type Statement = Readonly<{ label: string; text: string }>;
/** What a "choose N" mission shows: its story, question and hints, then a reveal once the group's answer is accepted. */
export type ChoiceTaskContent = Readonly<{
  title: string; instruction: string;
  story: Readonly<{ title: string; paragraphs: readonly Statement[]; source: string }>;
  question: string;
  hints: readonly Readonly<{ title: string; text: string }>[];
  // A statement without a label is an instruction to the group, not a claim.
  reveal: Readonly<{
    paragraphs?: readonly Readonly<{ label?: string; text: string }>[];
    image: Readonly<{ src: string; width: number; height: number; alt: string; caption: string }> | null;
  }>;
}>;

/** An optional question after the main answer. Every reveal statement carries its label. */
export type BonusContent = Readonly<{ title: string; intro: string; question: string; reveal: readonly Statement[] }>;
/** An optional, unscored moment after the main answer: an invitation, never a task. */
export type AppreciationContent = Readonly<{ title: string; paragraphs: readonly Statement[]; invitation: string; note: string }>;

type ChoiceMission = Readonly<{ task: ChoiceTaskContent; challenge: ChoiceChallenge; bonus?: Readonly<{ content: BonusContent; challenge: ChoiceChallenge }>; appreciation?: AppreciationContent }>;
const CHOICE_TASKS: Readonly<Record<string, ChoiceMission>> = Object.freeze({
  [MURAL_MISSION_ID]: { task: MURAL_TASK, challenge: MURAL_CHALLENGE },
  [SYNAGOGUE_MISSION_ID]: { task: SYNAGOGUE_TASK, challenge: SYNAGOGUE_CHALLENGE,
    bonus: { content: SYNAGOGUE_BONUS, challenge: SYNAGOGUE_BONUS_CHALLENGE }, appreciation: SYNAGOGUE_APPRECIATION },
});

export function findChoiceTask(missionId: string): ChoiceMission | null {
  return CHOICE_TASKS[missionId] ?? null;
}
