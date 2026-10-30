import { WATER_TASK_ID } from "./water-measurement.ts";
import { WELL_REWARDS, type WaterRewardConfig } from "./water-performance.ts";
import { WATER_HINTS } from "./water-hints.ts";
import type { ChoiceChallenge } from "./choice-task.ts";
import { WATER_TASK } from "./water-task.ts";

export type ArrivalReading = Readonly<{ latitude: number; longitude: number; accuracy: number; timestamp: number }>;
export type ArrivalPolicy = Readonly<{
  destination: Readonly<{ latitude: number; longitude: number; verified: boolean }> | null;
  radiusMeters: number; maxAccuracyMeters: number; maxAgeMs: number; futureToleranceMs: number; rewardPoints: number;
}>;
export type MissionArrival = Readonly<{ method: "gps" | "guide"; acceptedAt: number; points: number }>;
export type ArrivalAction = Readonly<{ type: "arrival"; missionId: string; reading: ArrivalReading }> | Readonly<{ type: "confirm-arrival"; missionId: string }>;
export type MissionState = "available" | "arrived" | "completed";
/** `src` is a path under `public/`, without the base path. `credit` is the attribution an openly licensed photo requires. */
export type MissionPhoto = Readonly<{ src: string; alt: string; credit?: string }>;
/** A map destination. Its stable ID keys the group's shared progress for that mission. */
export type MissionDefinition = Readonly<{
  // `title` names the challenge; `name` names the place.
  id: string; title: string; name: string; shortName: string; neighborhood: string; clue: string;
  // What players need to recognise the place: shown in the preview (summary) and location details.
  location: Readonly<{ hebrewName: string | null; summary: string; landmarks: readonly string[] }>;
  // `photo` shows the place (preview and location details); `cluePhoto` shows the thing to look for, under "Look for".
  photo: MissionPhoto | null; cluePhoto: MissionPhoto | null;
  placement: Readonly<{ x: number; y: number; verified: boolean }>;
  arrival: ArrivalPolicy;
  // The challenge decides the shape of the mission's shared progress.
  challenge: Readonly<{ kind: "water" }> | ChoiceChallenge;
  rewards: WaterRewardConfig; hintCount: number;
  // `false` for a story that shouldn't run against a clock: the start records the timing as excluded, so the award is untimed.
  timed?: false;
  // An optional second question, open only after the main answer is accepted; its points never include food tokens.
  bonus?: Readonly<{ challenge: ChoiceChallenge; points: number }>;
  // Further scored questions after a "choose N" challenge, in order, each with its own hints. The mission completes, and earns
  // its one award, when the last is accepted. Hints count towards one shared total, so all steps' hints fit the penalty list.
  followUps?: readonly Readonly<{ challenge: ChoiceChallenge; hintCount: number }>[];
  // The last stop: locked until the group has completed every other mission (Marzipan, the owner's request, 26 Oct 2026).
  finale?: true;
}>;
/** The question a "choose N" mission is on: step 0 is its challenge, then its follow-ups. Null past the last step. */
export function choiceStep(definition: MissionDefinition, step: number): Readonly<{ challenge: ChoiceChallenge; hintCount: number }> | null {
  if (definition.challenge.kind !== "choice" || !Number.isInteger(step) || step < 0) return null;
  return step === 0 ? { challenge: definition.challenge, hintCount: definition.hintCount } : definition.followUps?.[step - 1] ?? null;
}
export const GAN_HATUT_MISSION = Object.freeze({
  id: WATER_TASK_ID, title: WATER_TASK.title, name: "Gan HaTut (Mulberry Garden)", shortName: "Gan HaTut", neighborhood: "Ohel Moshe, Nahlaot, Jerusalem",
  // Hebrew tour, stop 5; landmarks from site research run 06, row 5 (marked verified).
  location: Object.freeze({
    hebrewName: "גן התות",
    summary: "A public garden in the Ohel Moshe neighborhood.",
    landmarks: Object.freeze([
      "Inside Ohel Moshe, between Hermon, Carmel and Gilboa lanes.",
      "The Yossi Banai \"Picture in Stone\" plaque at 3 Gilboa Street.",
    ]),
  }),
  clue: "Find Gan HaTut, the historic courtyard in the Ohel Moshe neighborhood. Look for the garden and its recognizable surroundings.",
  // Owner's photographs, chosen 24 Oct 2026: the Montefiore Testimonial gate as the way in (cropped to leave out passers-by,
  // originals in public/shuk/ and photo index #05) and the cistern as the thing to find. Web copies, metadata stripped.
  photo: Object.freeze({ src: "/shuk/gan-hatut-gate.jpg", alt: "A stone archway in Ohel Moshe, under carved panels reading \"Sir Moses Montefiore Testimonial\"." }) as MissionPhoto | null,
  cluePhoto: Object.freeze({ src: "/shuk/gan-hatut-cistern.jpg", alt: "A round cistern opening under a glass cover, set on a stone block." }) as MissionPhoto | null,
  // Manual prototype point only. Not derived from geographic coordinates; owner review required.
  placement: Object.freeze({ x: 600, y: 650, verified: false }),
  arrival: Object.freeze({
    // Candidate from Hebrew Wikipedia/Wikidata, consulted 24 Oct 2026; not field verified.
    // Deliberately fail closed until an accepted arrival point is confirmed.
    destination: Object.freeze({ latitude: 31.7834802, longitude: 35.2128322, verified: false }),
    radiusMeters: 100, maxAccuracyMeters: 50, maxAgeMs: 60_000, futureToleranceMs: 5_000, rewardPoints: 20,
  }) satisfies ArrivalPolicy,
  challenge: Object.freeze({ kind: "water" as const }),
  rewards: WELL_REWARDS, hintCount: WATER_HINTS.length,
}) satisfies MissionDefinition;
// Owner-approved feedback for the optional location check ("Check our location", renamed from "We're Here?" on 30 Oct 2026), 24 Oct 2026.
export const ARRIVAL_NEARBY = "You're very close! Look around for the destination.";
export const ARRIVAL_NOT_NEARBY = "Not quite there yet. Use the picture and landmarks to find your way.";
export const ARRIVAL_UNAVAILABLE = "We couldn't check your location. No problem\u2014you can continue.";
const radians = (degrees: number) => degrees * Math.PI / 180;
export function distanceMeters(a: Pick<ArrivalReading, "latitude" | "longitude">, b: Pick<ArrivalReading, "latitude" | "longitude">): number {
  const dLat = radians(b.latitude - a.latitude), dLon = radians(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(radians(a.latitude)) * Math.cos(radians(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 6_371_000 * 2 * Math.asin(Math.sqrt(Math.min(1, Math.max(0, h))));
}
export function validArrivalReading(value: unknown): value is ArrivalReading {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const r = value as Record<string, unknown>;
  return [r.latitude, r.longitude, r.accuracy, r.timestamp].every(n => typeof n === "number" && Number.isFinite(n))
    && Math.abs(r.latitude as number) <= 90 && Math.abs(r.longitude as number) <= 180
    && (r.accuracy as number) >= 0 && (r.timestamp as number) >= 0;
}
/** Client-provided evidence, not proof of physical presence. Never persist the reading. */
export function checkMissionArrival(reading: unknown, policy: ArrivalPolicy, now: number): string | null {
  const dest = policy.destination;
  if (!dest?.verified) return ARRIVAL_UNAVAILABLE;
  if (!validArrivalReading({ ...dest, accuracy: 0, timestamp: 0 }) || !Number.isFinite(now)
    || ![policy.radiusMeters, policy.maxAccuracyMeters, policy.maxAgeMs, policy.futureToleranceMs, policy.rewardPoints].every(n => Number.isFinite(n) && n >= 0)) return "Arrival configuration is unavailable. Ask the guide.";
  if (!validArrivalReading(reading)) return ARRIVAL_UNAVAILABLE;
  const age = now - reading.timestamp;
  if (age > policy.maxAgeMs || age < -policy.futureToleranceMs) return "That location reading is out of date. Try again if you'd like.";
  if (reading.accuracy > policy.maxAccuracyMeters) return "Your location isn't precise enough to confirm the area. Try again if you'd like.";
  // Center within the configured radius; accuracy never expands that radius.
  if (distanceMeters(reading, dest) > policy.radiusMeters + 1e-7) return ARRIVAL_NOT_NEARBY;
  return null;
}
export function missionState(arrival: MissionArrival | null, completed: boolean): MissionState {
  return completed ? "completed" : arrival ? "arrived" : "available";
}

export type MissionView = Readonly<{ id: string; state: MissionState; arrivalPoints: number; arrivalMethod: MissionArrival["method"] | null; gpsEnabled: boolean }>;
/** A finale stays locked while any other mission in the group's list is unfinished. `alsoDone` counts one as done early
 * (a mission whose answer was just accepted, before the next refresh). */
export function finaleLocked(definition: Pick<MissionDefinition, "id" | "finale">, missions: readonly Pick<MissionView, "id" | "state">[], alsoDone?: string): boolean {
  return definition.finale === true && missions.some(mission => mission.id !== definition.id && mission.id !== alsoDone && mission.state !== "completed");
}
/** `order` is the marker's number on the map (catalogue position), not a required route order. */
export function buildMissionPresentation(definition: MissionDefinition, mission: MissionView, order: number, locked = false) {
  const status = locked ? "Locked" : mission.state === "completed" ? "Completed" : mission.state === "arrived" ? "Arrival confirmed" : "Available";
  return { ...definition, status, locked, arrivedPoints: mission.arrivalPoints,
    state: mission.state, gpsEnabled: mission.gpsEnabled, marker: {
      id: mission.id, label: `${definition.shortName} - ${status}`, order,
      x: definition.placement.x, y: definition.placement.y,
      state: locked ? "locked" as const : mission.state === "completed" ? "completed" as const : mission.state === "arrived" ? "conditional" as const : "active" as const,
      symbol: mission.state === "completed" ? "\u2713" : mission.state === "arrived" ? "\u25c7" : String(order),
      provisional: !definition.placement.verified, offMap: false, size: 48 as const,
      ariaLabel: `${definition.shortName}: ${status}.${definition.placement.verified ? "" : " Approximate marker placement."}`,
    } };
}
export type MissionPresentation = ReturnType<typeof buildMissionPresentation>;
