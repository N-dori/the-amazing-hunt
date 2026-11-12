import test from "node:test";
import assert from "node:assert/strict";
import { createLeaveGuard, LEAVE_GUARD_KEY } from "./leave-guard.ts";

// A browser history as a stack: Back moves down one entry (the test then reports the popstate itself, as the browser would).
function fakeHistory(initial: unknown = null) {
  const entries: unknown[] = [initial];
  let at = 0;
  return {
    entries: () => entries.slice(0, at + 1), backs: 0,
    get state() { return entries[at]; },
    pushState(data: unknown) { entries.splice(at + 1); entries.push(data); at += 1; },
    replaceState(data: unknown) { entries[at] = data; },
    back() { this.backs += 1; at = Math.max(0, at - 1); },
  };
}
const memory = () => { const map = new Map<string, string>(); return { getItem: (key: string) => map.get(key) ?? null, setItem: (key: string, value: string) => void map.set(key, value) }; };

test("Back from the first screen asks before leaving; Stay keeps the screen; Leave steps back past the guard (owner, 5 Nov 2026)", () => {
  const history = fakeHistory(null);
  const guard = createLeaveGuard(history, memory());
  guard.install();
  assert.deepEqual(history.entries(), [{ shukGuard: true }, {}]);
  // The game's own screens stack above; Back between them is never intercepted.
  history.pushState({ shukNav: { stage: "map" } });
  history.back();
  assert.equal(guard.popped(history.state, { shukNav: { stage: "map" } }), "none");
  // Back from the first screen lands on the guard: the screen goes back on top and the game asks.
  history.back();
  assert.equal(guard.popped(history.state, { shukNav: { stage: "map" } }), "ask");
  assert.deepEqual(history.state, { shukNav: { stage: "map" } });
  // Leave: back onto the guard, which steps back once more, out of the game.
  const before = history.backs;
  guard.leave();
  assert.equal(guard.popped(history.state, {}), "left");
  assert.equal(history.backs - before, 2);
});

test("the guard goes in once per tab: a reload doesn't stack a second one", () => {
  const storage = memory();
  const history = fakeHistory({ shukNav: { stage: "map" } });
  createLeaveGuard(history, storage).install();
  assert.equal(storage.getItem(LEAVE_GUARD_KEY), "1");
  assert.deepEqual(history.entries(), [{ shukGuard: true }, { shukNav: { stage: "map" } }]);
  createLeaveGuard(history, storage).install();
  assert.equal(history.entries().length, 2);
  // Without storage (a private window), the guard still installs for this load.
  const bare = fakeHistory(null);
  createLeaveGuard(bare, null).install();
  assert.deepEqual(bare.entries(), [{ shukGuard: true }, {}]);
});
