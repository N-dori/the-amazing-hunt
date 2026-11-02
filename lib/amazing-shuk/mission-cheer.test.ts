import test from "node:test";
import assert from "node:assert/strict";
import { missionCheer, nextMission } from "./mission-cheer.ts";
import { SHUK_MISSIONS } from "./missions.ts";
import { LEVIN_MISSION } from "./levin-task.ts";

const states = (completed: readonly string[]) => SHUK_MISSIONS.map(mission => ({ id: mission.id, state: completed.includes(mission.id) ? "completed" as const : "available" as const }));

test("each celebrated mission gets its own cheer; Rabbi Levin's stop gets a quiet line", () => {
  const celebrated = SHUK_MISSIONS.filter(mission => mission.id !== LEVIN_MISSION.id).map(mission => missionCheer(mission.id));
  assert.ok(celebrated.every(cheer => cheer.celebrate));
  assert.equal(new Set(celebrated.map(cheer => cheer.text)).size, celebrated.length);
  const quiet = missionCheer(LEVIN_MISSION.id);
  assert.equal(quiet.celebrate, false); assert.doesNotMatch(quiet.text, /rock|woo|!/i);
});

test("the next stop is the next unfinished marker, wrapping round, and null when all are done", () => {
  const [first, second, third] = SHUK_MISSIONS;
  assert.deepEqual(nextMission(states([first.id]), first.id), { id: second.id, order: 2, name: second.shortName });
  assert.equal(nextMission(states([first.id, second.id]), first.id)?.id, third.id);
  const last = SHUK_MISSIONS.at(-1)!;
  assert.equal(nextMission(states([last.id]), last.id)?.id, first.id);
  assert.equal(nextMission(states(SHUK_MISSIONS.map(mission => mission.id)), first.id), null);
  // The mission just finished is never offered, even before the server reports it completed.
  assert.equal(nextMission(states([]), first.id)?.id, second.id);
});

test("Marzipan is the finale: locked until every other mission is done, and the last other mission leads to it", async () => {
  const { finaleLocked } = await import("./mission-arrival.ts");
  const { MARZIPAN_MISSION } = await import("./marzipan-task.ts");
  const others = SHUK_MISSIONS.filter(mission => mission.id !== MARZIPAN_MISSION.id).map(mission => mission.id);
  assert.equal(finaleLocked(MARZIPAN_MISSION, states(others.slice(1))), true);
  assert.equal(finaleLocked(MARZIPAN_MISSION, states(others)), false);
  assert.equal(finaleLocked(SHUK_MISSIONS[0], states([])), false, "only the finale locks");
  // Four done and the fifth just accepted: the cheer sends the group to Marzipan before the next refresh.
  assert.equal(nextMission(states(others.slice(0, -1)), others.at(-1)!)?.id, MARZIPAN_MISSION.id);
  // With other missions left, the next stop is never the locked finale.
  assert.notEqual(nextMission(states([others[3]]), others[3])?.id, MARZIPAN_MISSION.id);
});

test("a solo player gets personal cheers; Rabbi Levin's stop keeps its quiet line either way", async () => {
  const { soloLine } = await import("./solo-copy.ts");
  const group = SHUK_MISSIONS.map(mission => missionCheer(mission.id).text);
  const solo = SHUK_MISSIONS.map(mission => missionCheer(mission.id, true).text);
  assert.equal(solo.length, group.length);
  for (const line of solo) assert.doesNotMatch(line, /team|all of you|all round|group/i);
  assert.ok(solo.includes("Nailed it! Nicely done!"), "the approved \"Nicely done!\"");
  const levin = SHUK_MISSIONS.findIndex(mission => !missionCheer(mission.id).celebrate);
  assert.equal(solo[levin], group[levin]);
  assert.equal(missionCheer(SHUK_MISSIONS[levin].id, true).celebrate, false);
  // Server and status lines: only a solo player sees the personal version; anything unknown passes through.
  assert.equal(soloLine("The group's answer is correct. Task complete.", true), "That's right. Challenge complete.");
  assert.equal(soloLine("The group's answer is correct. Task complete.", false), "The group's answer is correct. Task complete.");
  assert.equal(soloLine("Choose 2 before submitting.", true), "Choose 2 before submitting.");
});
