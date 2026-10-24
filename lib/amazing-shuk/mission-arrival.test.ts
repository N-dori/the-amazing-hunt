import test from "node:test";
import assert from "node:assert/strict";
import { checkMissionArrival, distanceMeters, GAN_HATUT_MISSION, validArrivalReading, type ArrivalPolicy } from "./mission-arrival.ts";
import { requestArrivalLocation, ARRIVAL_LOCATION_OPTIONS, LOCATION_UNAVAILABLE_MESSAGE } from "./request-arrival-location.ts";
import { parseAction } from "./parse-water-action.ts";
const now = 1_000_000;
const policy: ArrivalPolicy = { ...GAN_HATUT_MISSION.arrival, destination: { latitude: 0, longitude: 0, verified: true } };
const reading = { latitude: 0, longitude: 0, accuracy: 20, timestamp: now };

test("proximity uses center distance, including exactly100m, without expanding by accuracy", () => {
  assert.equal(distanceMeters(reading, reading), 0);
  assert.equal(checkMissionArrival(reading, policy, now), null);
  const atBoundary = { ...reading, latitude: 100 / 6_371_000 * 180 / Math.PI };
  assert.ok(Math.abs(distanceMeters(reading, atBoundary) - 100) < 1e-7);
  assert.equal(checkMissionArrival(atBoundary, policy, now), null);
  assert.match(checkMissionArrival({ ...atBoundary, latitude: atBoundary.latitude * 1.001 }, policy, now)!, /Not quite there yet/);
  assert.match(checkMissionArrival({ ...reading, latitude: .002 }, policy, now)!, /Not quite there yet/);
});

test("invalid, stale, future and inaccurate evidence is rejected; limits are inclusive", () => {
  for (const value of [null, [], {}, { ...reading, latitude: 91 }, { ...reading, longitude: -181 }, { ...reading, latitude: NaN }, { ...reading, accuracy: Infinity }, { ...reading, accuracy: -1 }, { ...reading, timestamp: -1 }, { ...reading, accuracy: "20" }]) {
    assert.equal(validArrivalReading(value), false);
    assert.notEqual(checkMissionArrival(value, policy, now), null);
  }
  assert.equal(checkMissionArrival({ ...reading, accuracy: 50, timestamp: now - 60_000 }, policy, now), null);
  assert.match(checkMissionArrival({ ...reading, accuracy: 50.01 }, policy, now)!, /isn't precise enough/);
  assert.match(checkMissionArrival({ ...reading, timestamp: now - 60_001 }, policy, now)!, /out of date/);
  assert.match(checkMissionArrival({ ...reading, timestamp: now + 5_001 }, policy, now)!, /out of date/);
  assert.equal(checkMissionArrival({ ...reading, timestamp: now + 5_000 }, policy, now), null);
});

test("unverified coordinates fail closed for bonus only; policies remain configurable", () => {
  assert.notEqual(checkMissionArrival(reading, GAN_HATUT_MISSION.arrival, now), null);
  assert.notEqual(checkMissionArrival(reading, { ...policy, destination: null }, now), null);
  assert.notEqual(checkMissionArrival(reading, { ...policy, maxAccuracyMeters: -1 }, now), null);
  assert.equal(checkMissionArrival({ ...reading, latitude: .001 }, { ...policy, radiusMeters: 200 }, now), null);
});

test("one-shot browser request is intentional, fresh and bounded; no watch is required", async () => {
  let calls = 0;
  const geolocation: Pick<Geolocation, "getCurrentPosition"> = {
    getCurrentPosition(success, _error, options) {
      calls++; assert.deepEqual(options, ARRIVAL_LOCATION_OPTIONS);
      success({ coords: { latitude: 1, longitude: 2, accuracy: 30 }, timestamp: now } as GeolocationPosition);
    },
  };
  assert.equal(calls, 0);
  assert.deepEqual(await requestArrivalLocation(geolocation, true), { latitude: 1, longitude: 2, accuracy: 30, timestamp: now });
  assert.equal(calls, 1);
  assert.equal(ARRIVAL_LOCATION_OPTIONS.maximumAge, 0);
  assert.equal(ARRIVAL_LOCATION_OPTIONS.timeout, 15000);
});

test("permission denied, unavailable, timeout, unsupported and insecure browsers have friendly fallback", async () => {
  for (const code of [1, 2, 3]) {
    const geolocation: Pick<Geolocation, "getCurrentPosition"> = { getCurrentPosition(_success, error) { error!({ code } as GeolocationPositionError); } };
    await assert.rejects(requestArrivalLocation(geolocation, true), { message: LOCATION_UNAVAILABLE_MESSAGE });
  }
  await assert.rejects(requestArrivalLocation(undefined, true), { message: LOCATION_UNAVAILABLE_MESSAGE });
  await assert.rejects(requestArrivalLocation(undefined, false), { message: LOCATION_UNAVAILABLE_MESSAGE });
});

test("request parser strips forged bonus/method and unrelated fields", () => {
  assert.deepEqual(parseAction({ type: "arrival", missionId: GAN_HATUT_MISSION.id, reading: { ...reading, extra: 1 }, points: 500, method: "guide" }),
    { type: "arrival", missionId: GAN_HATUT_MISSION.id, reading });
  assert.equal(parseAction({ type: "arrival", missionId: GAN_HATUT_MISSION.id, reading: { ...reading, latitude: "0" } }), null);
  assert.deepEqual(parseAction({ type: "confirm-arrival", missionId: GAN_HATUT_MISSION.id, points: 900 }), { type: "confirm-arrival", missionId: GAN_HATUT_MISSION.id });
});
