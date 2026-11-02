import test from "node:test";
import assert from "node:assert/strict";
import { pendingRewardEvent, readSeenRewards, rememberSeenRewards, REWARD_RECENT_MS, rewardRecords, REWARD_SOUND_SRC, type RewardSource } from "./reward-events.ts";
import { NAVIGATION_LINE, REVEALED_LINE, rewardAmounts, rewardHeadline, rewardToastText } from "./mission-cheer.ts";
import { MURAL_MISSION_ID } from "./mural-task.ts";
import { LEVIN_MISSION } from "./levin-task.ts";

const NOW = Date.UTC(2026, 10, 2, 12, 0, 0);
const view = (parts: { arrivalAt?: number; awardedAt?: number; revealed?: boolean; bonusAt?: number } = {}): RewardSource => ({
  mission: { id: MURAL_MISSION_ID, arrivalPoints: parts.arrivalAt === undefined ? 0 : 20, ...(parts.arrivalAt === undefined ? {} : { arrivalAt: parts.arrivalAt }) },
  performance: { reward: parts.awardedAt === undefined ? null : { points: parts.revealed ? 0 : 85, foodTokens: 2 },
    ...(parts.awardedAt === undefined ? {} : { awardedAt: parts.awardedAt }), revealed: parts.revealed === true },
  session: parts.bonusAt === undefined ? {} : { bonus: { completed: true, points: 10, awardedAt: parts.bonusAt } },
});
const keysOf = (source: RewardSource) => new Set(rewardRecords(source).map(record => record.key));
class MemoryStorage { items = new Map<string, string>(); getItem(key: string) { return this.items.get(key) ?? null; } setItem(key: string, value: string) { this.items.set(key, value); } }

test("a page load or a newly opened mission announces nothing, even a recent award", () => {
  assert.equal(pendingRewardEvent(rewardRecords(view({ awardedAt: NOW - 1000 })), null, new Set(), NOW), null);
});

test("a new solve is one full pop-up; arrival alone is light; a reveal is quiet; awards together merge", () => {
  const before = keysOf(view());
  assert.deepEqual(pendingRewardEvent(rewardRecords(view({ awardedAt: NOW })), before, new Set(), NOW),
    { keys: [`${MURAL_MISSION_ID}:core:${NOW}`], missionId: MURAL_MISSION_ID, weight: "full", points: 85, foodTokens: 2 });
  assert.equal(pendingRewardEvent(rewardRecords(view({ arrivalAt: NOW })), before, new Set(), NOW)?.weight, "light");
  assert.equal(pendingRewardEvent(rewardRecords(view({ awardedAt: NOW, revealed: true })), before, new Set(), NOW)?.weight, "quiet");
  const both = pendingRewardEvent(rewardRecords(view({ arrivalAt: NOW, awardedAt: NOW })), before, new Set(), NOW);
  assert.equal(both?.weight, "full"); assert.equal(both?.points, 105); assert.equal(both?.keys.length, 2);
  assert.equal(pendingRewardEvent(rewardRecords(view({ arrivalAt: NOW - 5000, bonusAt: NOW })), keysOf(view({ arrivalAt: NOW - 5000 })), new Set(), NOW)?.points, 10);
});

test("never twice: known, seen on this device, or too old after reconnecting", () => {
  const solved = view({ awardedAt: NOW });
  assert.equal(pendingRewardEvent(rewardRecords(solved), keysOf(solved), new Set(), NOW), null);
  assert.equal(pendingRewardEvent(rewardRecords(solved), keysOf(view()), keysOf(solved), NOW), null);
  assert.equal(pendingRewardEvent(rewardRecords(view({ awardedAt: NOW - REWARD_RECENT_MS - 1 })), keysOf(view()), new Set(), NOW), null);
});

test("the seen list survives in storage, is capped, and fails safe when storage is missing or broken", () => {
  const storage = new MemoryStorage();
  rememberSeenRewards(storage, ["a", "b"]); rememberSeenRewards(storage, ["b", "c"]);
  assert.deepEqual([...readSeenRewards(storage)], ["a", "b", "c"]);
  rememberSeenRewards(storage, Array.from({ length: 150 }, (_, index) => `k${index}`));
  assert.equal(readSeenRewards(storage).size, 100);
  storage.setItem("shuk:rewards-seen:v1", "{not json");
  assert.equal(readSeenRewards(storage).size, 0);
  assert.equal(readSeenRewards(null).size, 0);
  const throwing = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); } };
  assert.equal(readSeenRewards(throwing).size, 0);
  assert.doesNotThrow(() => rememberSeenRewards(throwing, ["x"]));
});

test("headlines: the cheer for a solve, the owner's navigation line, the quiet line after a reveal; Rabbi Levin stays quiet", () => {
  assert.equal(rewardHeadline("full", MURAL_MISSION_ID).celebrate, true);
  assert.deepEqual(rewardHeadline("light", MURAL_MISSION_ID), { text: NAVIGATION_LINE, celebrate: false });
  assert.equal(NAVIGATION_LINE, "Amazing navigation! You rock!");
  assert.deepEqual(rewardHeadline("quiet", MURAL_MISSION_ID), { text: REVEALED_LINE, celebrate: false });
  assert.equal(rewardHeadline("full", LEVIN_MISSION.id).celebrate, false);
  assert.doesNotMatch(REVEALED_LINE, /well done/i);
});

test("amounts and the toast are plain text; no sound is configured (D11 off)", () => {
  assert.deepEqual(rewardAmounts(85, 2), ["+85 points", "+2 food tokens"]);
  assert.deepEqual(rewardAmounts(0, 1), ["+1 food token"]);
  assert.equal(rewardToastText(100, 2, "Market Mural"), "Your team earned 100 points at Market Mural.");
  assert.equal(rewardToastText(0, 2, "Market Mural", true), "You earned 2 food tokens at Market Mural.");
  assert.equal(REWARD_SOUND_SRC, null);
});
