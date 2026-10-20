import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, describe, it } from "node:test";
import { applyTeamAction } from "./engine.ts";
import { createSession, isGuide, loadSession, normaliseCode, resetForTests, updateSession } from "./store.ts";

const dir = mkdtempSync(path.join(tmpdir(), "mp-store-"));
process.env.GAME_DB_PATH = path.join(dir, "game.sqlite");
after(() => { resetForTests(); rmSync(dir, { recursive: true, force: true }); });

describe("store", () => {
  it("creates a session with an unambiguous code and a guide token stored only as a hash", () => {
    const { code, guideToken } = createSession();
    assert.match(code, /^[A-HJKMNP-Z2-9]{6}$/);
    assert.ok(isGuide(code, guideToken));
    assert.ok(!isGuide(code, "wrong"));
    assert.ok(!isGuide(code, null));
  });
  it("persists across a reopen, as after a container restart", () => {
    const { code } = createSession();
    updateSession(code, (s) => applyTeamAction(s, "phone-1", { type: "joinTeam", teamId: "B" }, new Date()));
    resetForTests();
    const loaded = loadSession(code.toLowerCase());
    assert.deepEqual(loaded?.state.teams.B.devices, ["phone-1"]);
    assert.equal(loaded?.version, 2);
  });
  it("writes nothing when the change throws", () => {
    const { code } = createSession();
    assert.throws(() => updateSession(code, () => { throw new Error("rejected"); }), /rejected/);
    assert.equal(loadSession(code)?.version, 1);
  });
  it("does not bump the version for a no-op", () => {
    const { code } = createSession();
    const result = updateSession(code, (s) => s);
    assert.equal(result.version, 1);
  });
  it("normalises codes typed by people", () => {
    assert.equal(normaliseCode(" ab-c 23 "), "ABC23");
  });
});
