import test from "node:test";
import assert from "node:assert/strict";
import { createSheetHistory } from "./sheet-history.ts";

/** A browser history in miniature: entries, an index, and `back`/`forward` that fire popstate later, as browsers do. */
function fakeHistory(initial: unknown) {
  const entries: unknown[] = [initial];
  let index = 0;
  const pending: (() => void)[] = [];
  const listeners: ((state: unknown) => void)[] = [];
  const move = (by: number) => pending.push(() => {
    if (!entries[index + by] && entries[index + by] !== null) return;
    index += by;
    for (const listener of listeners) listener(entries[index]);
  });
  return {
    get state() { return entries[index]; },
    pushState(data: unknown) { entries.splice(index + 1); entries.push(data); index += 1; },
    replaceState(data: unknown) { entries[index] = data; },
    back() { move(-1); }, forward() { move(1); },
    /** Runs the queued navigations, as the event loop would. */
    settle() { while (pending.length) pending.shift()!(); },
    onPop(listener: (state: unknown) => void) { listeners.push(listener); },
    get length() { return entries.length; }, get index() { return index; },
  };
}
const screen = { shukNav: { area: "journey", stage: "location", missionId: "mural", openMission: null } };
function setup() {
  const history = fakeHistory(screen);
  const sheets = createSheetHistory(history);
  history.onPop(state => sheets.popped(state));
  return { history, sheets };
}

test("opening a sheet pushes one marker that keeps the screen's own navigation state", () => {
  const { history, sheets } = setup();
  sheets.open(() => {});
  assert.equal(history.length, 2);
  assert.deepEqual((history.state as typeof screen).shukNav, screen.shukNav);
  assert.match(String((history.state as { shukSheet: string }).shukSheet), /^sheet-/);
});

test("Back closes the sheet and stays on the same screen", () => {
  const { history, sheets } = setup();
  let closed = 0;
  sheets.open(() => { closed += 1; });
  history.back(); history.settle();
  assert.equal(closed, 1);
  assert.equal(history.index, 0); assert.deepEqual(history.state, screen);
});

test("Close, Escape, the backdrop and a swipe step back over the marker, leaving no dead entry", () => {
  const { history, sheets } = setup();
  let backs = 0;
  const token = sheets.open(() => { backs += 1; });
  sheets.close(token); history.settle();
  assert.equal(backs, 0, "closing by hand never runs the Back callback");
  assert.equal(history.index, 0); assert.deepEqual(history.state, screen);
  // A second close of the same sheet does nothing.
  sheets.close(token); history.settle();
  assert.equal(history.index, 0);
});

test("Forward onto an old marker shows the same screen and opens nothing; a sheet opened there reuses that entry", () => {
  const { history, sheets } = setup();
  let backs = 0;
  sheets.open(() => { backs += 1; });
  history.back(); history.settle();
  history.forward(); history.settle();
  assert.equal(backs, 1);
  assert.deepEqual((history.state as typeof screen).shukNav, screen.shukNav);
  let second = 0;
  sheets.open(() => { second += 1; });
  assert.equal(history.length, 2, "no second marker stacked on the stale one");
  history.back(); history.settle();
  assert.equal(second, 1); assert.equal(history.index, 0); assert.deepEqual(history.state, screen);
});

test("reopening before the step back lands waits, then pushes its own marker", () => {
  const { history, sheets } = setup();
  const first = sheets.open(() => {});
  sheets.close(first);
  let backs = 0;
  sheets.open(() => { backs += 1; });
  assert.equal(history.length, 2, "nothing pushed while the step back is pending");
  history.settle();
  assert.equal(history.index, 1); assert.match(String((history.state as { shukSheet: string }).shukSheet), /^sheet-/);
  history.back(); history.settle();
  assert.equal(backs, 1); assert.equal(history.index, 0);
});

test("opening and closing again before the step back lands leaves no marker", () => {
  const { history, sheets } = setup();
  sheets.close(sheets.open(() => {}));
  sheets.close(sheets.open(() => {}));
  history.settle();
  assert.equal(history.index, 0); assert.deepEqual(history.state, screen);
});

test("an action after closing (a tab change) runs only once history is back on the screen's entry", () => {
  const { history, sheets } = setup();
  const token = sheets.open(() => {});
  let ranAt = -1;
  sheets.close(token, () => { ranAt = history.index; history.pushState({ shukNav: { ...screen.shukNav, area: "group" } }); });
  assert.equal(ranAt, -1);
  history.settle();
  assert.equal(ranAt, 0);
  assert.equal(history.length, 2); assert.equal((history.state as typeof screen).shukNav.area, "group");
});

test("a marker that is no longer on top (the sheet unmounted after other navigation) is left alone", () => {
  const { history, sheets } = setup();
  const token = sheets.open(() => {});
  history.pushState({ shukNav: screen.shukNav });
  let ran = false;
  sheets.close(token, () => { ran = true; });
  history.settle();
  assert.ok(ran); assert.equal(history.index, 2);
});

test("ordinary game navigation with no sheet open is untouched", () => {
  const { history, sheets } = setup();
  history.pushState({ shukNav: { ...screen.shukNav, stage: "challenge" } });
  history.back(); history.settle();
  assert.equal(history.index, 0);
  assert.equal(sheets.popped(history.state), false);
});
