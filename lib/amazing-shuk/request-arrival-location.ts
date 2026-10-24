import type { ArrivalReading } from "./mission-arrival.ts";
export const ARRIVAL_LOCATION_OPTIONS: PositionOptions = Object.freeze({ enableHighAccuracy: true, maximumAge: 0, timeout: 15_000 });
export const LOCATION_UNAVAILABLE_MESSAGE = "We couldn't check your location. No problem\u2014use the picture and clues to find the place.";
export function arrivalLocationError(): string {
  return LOCATION_UNAVAILABLE_MESSAGE;
}
/** Called only from the intentional arrival button. One reading, no watcher or storage. */
export function requestArrivalLocation(geolocation: Pick<Geolocation, "getCurrentPosition"> | undefined, secureContext: boolean): Promise<ArrivalReading> {
  if (!secureContext) return Promise.reject(new Error(LOCATION_UNAVAILABLE_MESSAGE));
  if (!geolocation) return Promise.reject(new Error(LOCATION_UNAVAILABLE_MESSAGE));
  return new Promise((resolve, reject) => {
    try {
      geolocation.getCurrentPosition(position => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude,
        accuracy: position.coords.accuracy, timestamp: position.timestamp }), () => reject(new Error(arrivalLocationError())), ARRIVAL_LOCATION_OPTIONS);
    } catch { reject(new Error(LOCATION_UNAVAILABLE_MESSAGE)); }
  });
}
