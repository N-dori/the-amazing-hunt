// Arrival checks for the explicit "I'm Here" control [spec 4]. Pure functions: the server
// classifies a reading; the browser only ever asks for one position on a user tap.

import type { GpsReading, Site } from "./types.ts";

const EARTH_RADIUS_M = 6_371_000;

// Great-circle distance in metres (haversine).
export function distanceMeters(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

export type ArrivalCheck =
  | { result: "arrived"; distance: number }
  | { result: "uncertain"; distance: number } // close, or accuracy too poor to be sure
  | { result: "far"; distance: number }
  | { result: "unverifiedSite" }               // no verified coordinate: observation or guide only
  | { result: "invalidReading" };

// A reading counts as arrival only when the whole accuracy circle is inside the near threshold.
// Anything else falls back to an observation or the guide. Client GPS is not tamperproof, so this
// guards against honest error, not cheating.
export function checkArrival(site: Site, reading: GpsReading, now: number, maxAgeMs = 2 * 60_000): ArrivalCheck {
  if (!site.geo) return { result: "unverifiedSite" };
  const valid = Number.isFinite(reading.lat) && Number.isFinite(reading.lon)
    && Math.abs(reading.lat) <= 90 && Math.abs(reading.lon) <= 180
    && Number.isFinite(reading.accuracy) && reading.accuracy >= 0
    && Number.isFinite(reading.timestamp) && now - reading.timestamp <= maxAgeMs && reading.timestamp - now <= 60_000;
  if (!valid) return { result: "invalidReading" };

  const distance = Math.round(distanceMeters(site.geo, reading));
  if (distance + reading.accuracy <= site.nearMeters) return { result: "arrived", distance };
  if (distance - reading.accuracy <= site.uncertainMeters) return { result: "uncertain", distance };
  return { result: "far", distance };
}
