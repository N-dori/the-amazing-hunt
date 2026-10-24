import { WATER_TASK_ID } from "./water-measurement.ts";

export type ArrivalReading = Readonly<{ latitude: number; longitude: number; accuracy: number; timestamp: number }>;
export type ArrivalPolicy = Readonly<{
  destination: Readonly<{ latitude: number; longitude: number; verified: boolean }> | null;
  radiusMeters: number; maxAccuracyMeters: number; maxAgeMs: number; futureToleranceMs: number; rewardPoints: number;
}>;
export type MissionArrival = Readonly<{ method: "gps" | "guide"; acceptedAt: number; points: number }>;
export type ArrivalAction = Readonly<{ type: "arrival"; missionId: string; reading: ArrivalReading }> | Readonly<{ type: "confirm-arrival"; missionId: string }>;
export type MissionState = "available" | "arrived" | "completed";
/** A map destination. Its stable ID keys the group's shared progress for that mission. */
export type MissionDefinition = Readonly<{
  id: string; name: string; shortName: string; neighborhood: string; clue: string;
  photo: Readonly<{ src: string; alt: string }> | null;
  placement: Readonly<{ x: number; y: number; verified: boolean }>;
  arrival: ArrivalPolicy;
}>;
export const GAN_HATUT_MISSION = Object.freeze({
  id: WATER_TASK_ID, name: "Gan HaTut (Mulberry Garden)", shortName: "Gan HaTut", neighborhood: "Ohel Moshe, Nahlaot, Jerusalem",
  clue: "Find Gan HaTut, the historic courtyard in the Ohel Moshe neighborhood. Look for the garden and its recognizable surroundings.",
  // No identified current garden photograph exists in the checked-in index/local assets.
  photo: null as Readonly<{ src: string; alt: string }> | null,
  // Manual prototype point only. Not derived from geographic coordinates; owner review required.
  placement: Object.freeze({ x: 600, y: 650, verified: false }),
  arrival: Object.freeze({
    // Candidate from Hebrew Wikipedia/Wikidata, consulted 24 Oct 2026; not field verified.
    // Deliberately fail closed until an accepted arrival point is confirmed.
    destination: Object.freeze({ latitude: 31.7834802, longitude: 35.2128322, verified: false }),
    radiusMeters: 100, maxAccuracyMeters: 50, maxAgeMs: 60_000, futureToleranceMs: 5_000, rewardPoints: 20,
  }) satisfies ArrivalPolicy,
}) satisfies MissionDefinition;
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
  if (!dest?.verified) return "We couldn't check your location. No problem\u2014use the picture and clues to find the place.";
  if (!validArrivalReading({ ...dest, accuracy: 0, timestamp: 0 }) || !Number.isFinite(now)
    || ![policy.radiusMeters, policy.maxAccuracyMeters, policy.maxAgeMs, policy.futureToleranceMs, policy.rewardPoints].every(n => Number.isFinite(n) && n >= 0)) return "Arrival configuration is unavailable. Ask the guide.";
  if (!validArrivalReading(reading)) return "We couldn't check your location. No problem\u2014use the picture and clues to find the place.";
  const age = now - reading.timestamp;
  if (age > policy.maxAgeMs || age < -policy.futureToleranceMs) return "That location reading is out of date. Try again if you'd like.";
  if (reading.accuracy > policy.maxAccuracyMeters) return "Your location isn't precise enough to confirm the area. Try again if you'd like.";
  // Center within the configured radius; accuracy never expands that radius.
  if (distanceMeters(reading, dest) > policy.radiusMeters + 1e-7) return "Looks like you're not quite there yet. Follow the map and look for the courtyard.";
  return null;
}
export function missionState(arrival: MissionArrival | null, completed: boolean): MissionState {
  return completed ? "completed" : arrival ? "arrived" : "available";
}

export type MissionView = Readonly<{ id: string; state: MissionState; arrivalPoints: number; arrivalMethod: MissionArrival["method"] | null; gpsEnabled: boolean }>;
/** `order` is the marker's number on the map (catalogue position), not a required route order. */
export function buildMissionPresentation(definition: MissionDefinition, mission: MissionView, order: number) {
  const status = mission.state === "completed" ? "Completed" : mission.state === "arrived" ? "Arrival confirmed" : "Available";
  return { ...definition, status, arrivedPoints: mission.arrivalPoints,
    state: mission.state, gpsEnabled: mission.gpsEnabled, marker: {
      id: mission.id, label: `${definition.shortName} - ${status}`, order,
      x: definition.placement.x, y: definition.placement.y,
      state: mission.state === "completed" ? "completed" as const : mission.state === "arrived" ? "conditional" as const : "active" as const,
      symbol: mission.state === "completed" ? "\u2713" : mission.state === "arrived" ? "\u25c7" : String(order),
      provisional: !definition.placement.verified, offMap: false, size: 48 as const,
      ariaLabel: `${definition.shortName}: ${status}.${definition.placement.verified ? "" : " Approximate marker placement."}`,
    } };
}
export type MissionPresentation = ReturnType<typeof buildMissionPresentation>;
