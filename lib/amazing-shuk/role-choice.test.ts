import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createRequire } from "node:module";
import { createElement, type ComponentType } from "react";
import ts from "typescript";
import { renderToStaticMarkup } from "react-dom/server";
import { claimGroupRole, releaseGroupRole } from "./roles.ts";
import { buildGroupRoster, buildRoleChoices, roleLabel } from "./participant-identity.ts";
import { parseAction } from "./parse-water-action.ts";
import { issueInvitation, redeemInvitation, sessionAction, sessionView } from "./participant-store.ts";
import { seatIds } from "./seat-fixture.ts";

const nativeRequire = createRequire(import.meta.url);
// Render the actual TSX (the same loader as mural-task-ui.test.ts) and shared button without a browser or CSS loader.
function loadComponent(path: string): ComponentType<Record<string, unknown>> {
  const output = ts.transpileModule(readFileSync(resolve(path), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText;
  const exports: { default?: ComponentType<Record<string, unknown>> } = {};
  const localRequire = (id: string) => {
    if (id.endsWith(".scss")) return { __esModule: true, default: new Proxy({}, { get: (_, key) => String(key) }) };
    if (id === "@/components/ui/ActionButton") return { __esModule: true, default: loadComponent("components/ui/ActionButton.tsx") };
    if (id === "@/components/icons") return { Icon: () => null };
    if (id.startsWith("@/lib/")) return nativeRequire(resolve(id.replace("@/", "") + ".ts"));
    if (id.startsWith("./")) return { __esModule: true, default: loadComponent(resolve(dirname(path), id + ".tsx")) };
    return nativeRequire(id);
  };
  new Function("require", "exports", output)(localRequire, exports);
  assert.ok(exports.default);
  return exports.default;
}
const IDS = ["player-1", "player-2", "player-3"];
const NONE = { navigator: null, answerSubmitter: null };

test("a free role can be taken, your own kept, someone else's never; only the holder steps down", () => {
  const taken = claimGroupRole(IDS, NONE, "navigator", "player-1");
  assert.deepEqual(taken, { navigator: "player-1", answerSubmitter: null });
  assert.deepEqual(claimGroupRole(IDS, taken, "navigator", "player-1"), taken);
  assert.throws(() => claimGroupRole(IDS, taken, "navigator", "player-2"), /already taken/);
  // One person may hold both roles.
  assert.deepEqual(claimGroupRole(IDS, taken, "answerSubmitter", "player-1"), { navigator: "player-1", answerSubmitter: "player-1" });
  assert.throws(() => releaseGroupRole(IDS, taken, "navigator", "player-2"), /only the role holder/);
  assert.deepEqual(releaseGroupRole(IDS, taken, "navigator", "player-1"), NONE);
  assert.throws(() => claimGroupRole(IDS, NONE, "navigator", "stranger"), /current group participant/);
});

test("players see Advisor, never follower; the roster and role choices say who holds what", () => {
  assert.equal(roleLabel("follower"), "Advisor"); assert.equal(roleLabel("navigatorAndAnswerSubmitter"), "Navigator and answer-submitter");
  const people = [{ id: "player-1", name: "Ari" }, { id: "player-2", name: "Bea" }, { id: "guide", name: "Guide" }];
  const roles = { navigator: "player-1", answerSubmitter: null };
  assert.deepEqual(buildGroupRoster(people, roles, "player-2").map(member => member.responsibilities), [["Navigator"], ["Advisor"], ["Guide"]]);
  assert.deepEqual(buildRoleChoices(people, roles, "player-2", false), [
    { role: "navigator", label: "Navigator", holder: "Ari", mine: false, canClaim: false },
    { role: "answerSubmitter", label: "Answer-submitter", holder: null, mine: false, canClaim: true },
  ]);
  assert.equal(buildRoleChoices(people, roles, "player-1", false)[0].mine, true);
  assert.ok(buildRoleChoices(people, roles, "guide", true).every(choice => !choice.canClaim), "the guide uses the guide panel");
  assert.deepEqual(parseAction({ type: "claim-role", role: "navigator" }), { type: "claim-role", role: "navigator" });
  assert.deepEqual(parseAction({ type: "release-role", role: "answerSubmitter" }), { type: "release-role", role: "answerSubmitter" });
  assert.equal(parseAction({ type: "claim-role", role: "guide" }), null);
});

test("the Group tab offers Take this role for a free role, Step down for your own, nothing for someone else's", () => {
  const Choices = loadComponent("components/amazing-shuk/PreviewRoleChoices.tsx");
  const choices = buildRoleChoices([{ id: "player-1", name: "Ari" }, { id: "player-2", name: "Bea" }], { navigator: "player-1", answerSubmitter: null }, "player-1", false);
  const html = renderToStaticMarkup(createElement(Choices, { choices, guide: false, busy: false, onClaim() {}, onRelease() {} }));
  assert.match(html, /Everyone else is an advisor/);
  assert.match(html, /Navigator:<\/strong> you/); assert.match(html, /Step down/);
  assert.match(html, /Answer-submitter:<\/strong> free/); assert.match(html, /Take this role/);
  const other = buildRoleChoices([{ id: "player-1", name: "Ari" }, { id: "player-2", name: "Bea" }], { navigator: "player-1", answerSubmitter: "player-1" }, "player-2", false);
  const otherHtml = renderToStaticMarkup(createElement(Choices, { choices: other, guide: false, busy: false, onClaim() {}, onRelease() {} }));
  assert.doesNotMatch(otherHtml, /<button/); assert.match(otherHtml, /Navigator:<\/strong> Ari/);
});

test("server: players choose roles themselves; advisors can't start; the guide still assigns", async () => {
  await mkdir(".local", { recursive: true });
  const directory = await mkdtemp(join(process.cwd(), ".local", "shuk-roles-"));
  try {
    const path = join(directory, "state.json"), tokens: Record<string, string> = {};
    for (const id of ["player-3", "player-4", "player-5", "guide"]) tokens[id] = await redeemInvitation(path, await issueInvitation(path, id));
    const act = (id: string, action: Parameters<typeof sessionAction>[2], key: string) => sessionAction(path, tokens[id], action, key);
    const ids = await seatIds(path, tokens);
    const mission = "marzipan-rugelach";
    // Both roles start free (schema 7 has no defaults); clearing them again changes nothing.
    await act("guide", { type: "assign-role", role: "navigator", participantId: null }, "roles-guide-clear-nav1");
    await act("guide", { type: "assign-role", role: "answerSubmitter", participantId: null }, "roles-guide-clear-sub1");
    await assert.rejects(act("player-3", { type: "start", missionId: mission }, "roles-advisor-start-01"), /navigator, answer-submitter or guide/);
    assert.match(await act("player-4", { type: "claim-role", role: "navigator" }, "roles-claim-navigator1"), /You're the navigator/);
    await assert.rejects(act("player-3", { type: "claim-role", role: "navigator" }, "roles-steal-navigator1"), /already the navigator/);
    await assert.rejects(act("player-3", { type: "release-role", role: "navigator" }, "roles-foreign-release1"), /aren't the navigator/);
    assert.match(await act("player-5", { type: "claim-role", role: "answerSubmitter" }, "roles-claim-submitter1"), /answer-submitter now/);
    await assert.rejects(act("guide", { type: "claim-role", role: "navigator" }, "roles-guide-claim-0001"), /guide panel/);
    assert.deepEqual((await sessionView(path, tokens["player-3"])).session.roles, { navigator: ids["player-4"], answerSubmitter: ids["player-5"] });
    // The navigator starts; the advisor still can't submit.
    await act("player-4", { type: "start", missionId: mission }, "roles-navigator-start1");
    await assert.rejects(act("player-3", { type: "submit", missionId: mission }, "roles-advisor-submit01"), /answer-submitter/);
    // Stepping down frees the role for someone else; a replayed action changes nothing.
    assert.match(await act("player-4", { type: "release-role", role: "navigator" }, "roles-release-navigat1"), /stepped down/);
    assert.match(await act("player-4", { type: "release-role", role: "navigator" }, "roles-release-navigat1"), /already synced/);
    await act("player-3", { type: "claim-role", role: "navigator" }, "roles-claim-navigator2");
    // The guide can still reassign a held role.
    await act("guide", { type: "assign-role", role: "navigator", participantId: ids["player-4"] }, "roles-guide-assign-nav");
    assert.deepEqual((await sessionView(path, tokens.guide)).session.roles, { navigator: ids["player-4"], answerSubmitter: ids["player-5"] });
  } finally { await rm(directory, { recursive: true, force: true }); }
});
