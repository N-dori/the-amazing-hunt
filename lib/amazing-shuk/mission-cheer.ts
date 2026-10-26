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
// Rabbi Aryeh Levin's stop remembers men who were sentenced to death, so it gets a quiet line instead of a cheer.
// TODO(copy): draft for owner review.
const QUIET: Readonly<Record<string, string>> = Object.freeze({ [LEVIN_MISSION.id]: "Thank you for listening to their story." });

/** A different line for each mission, fixed by its map order so every phone in the group sees the same one. */
export function missionCheer(missionId: string): Readonly<{ text: string; celebrate: boolean }> {
  if (QUIET[missionId]) return { text: QUIET[missionId], celebrate: false };
  const index = Math.max(0, SHUK_MISSIONS.findIndex(mission => mission.id === missionId));
  return { text: CHEERS[index % CHEERS.length], celebrate: true };
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
