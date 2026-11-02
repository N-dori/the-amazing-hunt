/**
 * Server messages for a solo player (owner, 2 Nov 2026: natural, personal wording rather than team instructions).
 * TODO(copy): drafts for owner review, except where noted. Group play keeps the original line.
 */
const SOLO_LINES: Readonly<Record<string, string>> = Object.freeze({
  "The group's answer is correct. Task complete.": "That's right. Challenge complete.",
  "Not quite. Look again and talk it over.": "Not quite. Have another look.",
  "Not quite. Talk it over and try again.": "Not quite. Have another look and try again.",
  "Water updated for the shared group.": "Water updated.",
  "Arrival confirmed. You've made it!": "You've made it!",
  "Group answer accepted.": "Answer accepted.",
  "Solved! Your family's jar holds exactly 4 liters. Submit your group answer.": "Solved! Your family's jar holds exactly 4 liters. Submit your answer.",
});

/** The solo version of a group-worded message, or the message itself. */
export function soloLine(message: string, solo: boolean): string {
  return solo ? SOLO_LINES[message] ?? message : message;
}
