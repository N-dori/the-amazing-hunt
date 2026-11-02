import test from "node:test";
import assert from "node:assert/strict";
import { challengePhase, storyDefaultOpen, storyKey } from "./challenge-phase.ts";
import { SHUK_MISSIONS } from "./missions.ts";
import { MARZIPAN_MISSION } from "./marzipan-task.ts";

test("UX-3: the story until the server's accepted start, then play, then done", () => {
  assert.equal(challengePhase(false, false, true), "story");
  assert.equal(challengePhase(true, false, true), "play");
  assert.equal(challengePhase(true, true, true), "done");
  // A revealed or guide-approved challenge is done, started or not.
  assert.equal(challengePhase(false, true, true), "done");
  // Marzipan keeps the old screen: never a story-only phase.
  assert.equal(challengePhase(false, false, false), "play");
});

test("the story is open before Start, folded after; a mission without the gate stays open as before", () => {
  assert.equal(storyDefaultOpen("story", true), true);
  assert.equal(storyDefaultOpen("play", true), false);
  assert.equal(storyDefaultOpen("done", true), false);
  for (const phase of ["story", "play", "done"] as const) assert.equal(storyDefaultOpen(phase, false), true);
  assert.notEqual(storyKey("mural", "play"), storyKey("synagogue", "play"));
  assert.notEqual(storyKey("mural", "story"), storyKey("mural", "play"));
});

test("every mission is story-first except Marzipan (owner, 2 Nov 2026)", () => {
  const exempt = SHUK_MISSIONS.filter(mission => mission.storyFirst === false).map(mission => mission.id);
  assert.deepEqual(exempt, [MARZIPAN_MISSION.id]);
});
