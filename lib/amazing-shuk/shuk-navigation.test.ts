import test from "node:test";
import assert from "node:assert/strict";
import { activeTab, goToStage, goToTab, initialNavState, parseNavState, previewMission } from "./shuk-navigation.ts";

const isMission = (id: string) => id === "well" || id === "mural";

test("Mission tab before any mission is opened shows the empty state; Map stays the active journey tab", () => {
  const start = initialNavState("well");
  assert.equal(activeTab(start), "map");
  const empty = goToTab(start, "mission");
  assert.equal(empty.area, "noMission"); assert.equal(activeTab(empty), "mission");
  // A preview alone isn't an opened mission.
  assert.equal(goToTab(previewMission(start, "mural"), "mission").area, "noMission");
});

test("Mission tab returns to the last opened mission and screen, even after previewing another marker", () => {
  let state = goToStage(previewMission(initialNavState("well"), "mural"), "location");
  state = goToStage(state, "challenge");
  assert.deepEqual(state.openMission, { id: "mural", screen: "challenge" });
  state = goToTab(state, "map");
  assert.equal(state.stage, "map"); assert.equal(activeTab(state), "map");
  state = previewMission(state, "well");
  const back = goToTab(state, "mission");
  assert.equal(back.missionId, "mural"); assert.equal(back.stage, "challenge"); assert.equal(activeTab(back), "mission");
});

test("Food and Group keep the journey underneath, so Map and Mission come back unchanged", () => {
  const opened = goToStage(previewMission(initialNavState("well"), "well"), "location");
  const group = goToTab(opened, "group");
  assert.equal(activeTab(group), "group"); assert.equal(group.stage, "location");
  const food = goToTab(group, "food");
  assert.equal(activeTab(food), "food");
  assert.deepEqual(goToTab(food, "mission"), { ...opened, area: "journey" });
  assert.equal(goToTab(food, "map").stage, "map");
});

test("history and storage values are validated before use", () => {
  const state = goToStage(previewMission(initialNavState("well"), "mural"), "challenge");
  assert.deepEqual(parseNavState(JSON.parse(JSON.stringify(state)), isMission), state);
  assert.equal(parseNavState(null, isMission), null);
  assert.equal(parseNavState({ ...state, missionId: "gone" }, isMission), null);
  assert.equal(parseNavState({ ...state, area: "admin" }, isMission), null);
  assert.equal(parseNavState({ ...state, openMission: { id: "gone", screen: "challenge" } }, isMission)?.openMission, null);
});
