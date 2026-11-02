import { finaleLocked, type MissionView } from "./mission-arrival.ts";
import { LEVIN_MISSION } from "./levin-task.ts";
import { SHUK_MISSIONS } from "./missions.ts";

// TODO(copy): draft cheers for owner review (owner's request, 26 Oct 2026: "like you rock, each time something a bit different").
const CHEERS: readonly string[] = Object.freeze([
  "Woo-hoo! You rock!",
  "Nailed it! What a team!",
  "Yes! Sharp eyes, all of you!",
  "Brilliant! The market has no secrets from you!",
  "Amazing work! High fives all round!",
  "You did it! Sweet success!",
]);
// The same cheers for a solo player (owner, 2 Nov 2026: personal, never implying anyone is missing). "Nicely done!" is approved;
// TODO(copy): the rest are drafts for owner review.
const CHEERS_SOLO: readonly string[] = Object.freeze([
  "Woo-hoo! You rock!",
  "Nailed it! Nicely done!",
  "Yes! Sharp eyes!",
  "Brilliant! The market has no secrets from you!",
  "Amazing work! High five!",
  "You did it! Sweet success!",
]);
// Rabbi Aryeh Levin's stop remembers men who were sentenced to death, so it gets a quiet line instead of a cheer.
// TODO(copy): draft for owner review.
const QUIET: Readonly<Record<string, string>> = Object.freeze({ [LEVIN_MISSION.id]: "Thank you for listening to their story." });

// After "I'm completely stuck": never a cheer or "Well done" (plan §8a). TODO(copy): draft for owner review (Phase 2c).
export const REVEALED_LINE = "Here's the answer. You can carry on.";

/** A different line for each mission, fixed by its map order so every phone in the group sees the same one. A revealed answer gets
 * the quiet line instead, with no celebration. */
export function missionCheer(missionId: string, solo = false, revealed = false): Readonly<{ text: string; celebrate: boolean }> {
  if (revealed) return { text: REVEALED_LINE, celebrate: false };
  if (QUIET[missionId]) return { text: QUIET[missionId], celebrate: false };
  const index = Math.max(0, SHUK_MISSIONS.findIndex(mission => mission.id === missionId));
  const cheers = solo ? CHEERS_SOLO : CHEERS;
  return { text: cheers[index % cheers.length], celebrate: true };
}

/** The next open mission on the map after this one that the group hasn't completed, wrapping round; null when all are done. */
export function nextMission(missions: readonly Pick<MissionView, "id" | "state">[], currentId: string): Readonly<{ id: string; order: number; name: string }> | null {
  const start = SHUK_MISSIONS.findIndex(mission => mission.id === currentId);
  for (let offset = 1; offset <= SHUK_MISSIONS.length; offset += 1) {
    const index = (start + offset) % SHUK_MISSIONS.length;
    const definition = SHUK_MISSIONS[index];
    // The finale counts the mission just finished as done, so the last other mission leads straight to it.
    if (definition.id === currentId || finaleLocked(definition, missions, currentId)) continue;
    const state = missions.find(mission => mission.id === definition.id)?.state;
    if (state && state !== "completed") return { id: definition.id, order: index + 1, name: definition.shortName };
  }
  return null;
}

// The owner's own line for navigation (plan §8a, 2 Nov 2026).
export const NAVIGATION_LINE = "Amazing navigation! You rock!";

/** The reward pop-up's headline: the mission's cheer for a solve (Rabbi Levin's stays quiet), the owner's navigation line, or the
 * quiet line after "I'm completely stuck". `celebrate` decides the badge. */
export function rewardHeadline(weight: "full" | "light" | "quiet", missionId: string, solo = false): Readonly<{ text: string; celebrate: boolean }> {
  if (weight === "quiet") return { text: REVEALED_LINE, celebrate: false };
  if (weight === "light") return { text: NAVIGATION_LINE, celebrate: false };
  return missionCheer(missionId, solo);
}

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;
/** One amount in the pop-up: its number, its unit for that number, and the whole line ("+85 points"). Only points count up (UX-4).
 * TODO(copy): drafts ("+N points", "+N food tokens"). */
export type RewardAmount = Readonly<{ key: "points" | "foodTokens"; value: number; unit: string; label: string; countUp: boolean }>;
export function rewardAmountItems(points: number, foodTokens: number): readonly RewardAmount[] {
  const item = (key: RewardAmount["key"], value: number, one: string, many: string, countUp: boolean): RewardAmount =>
    ({ key, value, unit: value === 1 ? one : many, label: `+${plural(value, one, many)}`, countUp });
  return [...(points > 0 ? [item("points", points, "point", "points", true)] : []), ...(foodTokens > 0 ? [item("foodTokens", foodTokens, "food token", "food tokens", false)] : [])];
}
/** The pop-up's amounts as text. */
export function rewardAmounts(points: number, foodTokens: number): readonly string[] {
  return rewardAmountItems(points, foodTokens).map(amount => amount.label);
}

/** A small note instead of the pop-up when this phone is elsewhere (another screen or stop), so it never interrupts reading.
 * TODO(copy): draft. */
export function rewardToastText(points: number, foodTokens: number, place: string, solo = false): string {
  const what = points > 0 ? plural(points, "point", "points") : plural(foodTokens, "food token", "food tokens");
  return `${solo ? "You" : "Your team"} earned ${what} at ${place}.`;
}
