import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createRequire } from "node:module";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";
import { MURAL_CHALLENGE, MURAL_TASK } from "./mural-task.ts";
import { buildChoiceTaskView } from "./mural-task-view.ts";

const nativeRequire = createRequire(import.meta.url);
// Render the actual TSX and shared button without a browser or CSS loader.
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
    return nativeRequire(id);
  };
  new Function("require", "exports", output)(localRequire, exports);
  assert.ok(exports.default);
  return exports.default;
}
const Preview = loadComponent("components/amazing-shuk/dev/PreviewMuralTask.tsx");
const callbacks = { onToggle() {}, onStart() {}, onSubmit() {}, onReset() {}, onHint() {} };
const performance = (started: boolean) => ({ started, hintsUsed: 0, canStart: true, reward: null });

test("mural options are pressed buttons; no timer or live score; only an unverified key shows the draft notice", () => {
  const view = buildChoiceTaskView(MURAL_CHALLENGE, ["plaque"], false, "answerSubmitter", false, true);
  const html = renderToStaticMarkup(createElement(Preview, { ...callbacks, view, question: MURAL_TASK.question, performance: performance(true), hints: [], hasMoreHints: true }));
  assert.match(html, /Find 2 things on this wall that are real, not painted\./);
  assert.equal((html.match(/aria-pressed="true"/g) ?? []).length, 1);
  assert.equal((html.match(/aria-pressed="false"/g) ?? []).length, MURAL_CHALLENGE.options.length - 1);
  assert.match(html, /1 of 2 chosen/); assert.match(html, /Submit Group Answer/); assert.match(html, /Need a hint\?/);
  assert.doesNotMatch(html, /answer key still needs a field check/);
  assert.doesNotMatch(html, /countdown|role="timer"|Points earned|seconds|elapsed|<img/i);
  const draft = buildChoiceTaskView({ ...MURAL_CHALLENGE, answerKeyVerified: false }, [], false, "answerSubmitter", false, true);
  assert.match(renderToStaticMarkup(createElement(Preview, { ...callbacks, view: draft, question: MURAL_TASK.question, performance: performance(true), hints: [], hasMoreHints: true })), /answer key still needs a field check/);
});

test("followers are invited to discuss; completion shows the shared result once", () => {
  const follower = buildChoiceTaskView(MURAL_CHALLENGE, [], false, "follower", false, false);
  const before = renderToStaticMarkup(createElement(Preview, { ...callbacks, view: follower, question: MURAL_TASK.question, performance: { ...performance(false), canStart: false }, hints: [], hasMoreHints: false }));
  assert.doesNotMatch(before, /Submit Group Answer|Start challenge/);
  assert.match(before, /Talk it over/);
  const done = buildChoiceTaskView(MURAL_CHALLENGE, ["air-vents", "plaque"], true, "answerSubmitter", false, true);
  const after = renderToStaticMarkup(createElement(Preview, { ...callbacks, view: done, question: MURAL_TASK.question,
    performance: { started: true, hintsUsed: 1, canStart: true, reward: { points: 90, foodTokens: 2, hintsUsed: 1 } }, hints: [], hasMoreHints: false }));
  assert.match(after, /Challenge completed!/); assert.match(after, /<dt>Points earned<\/dt><dd>90<\/dd>/);
  assert.doesNotMatch(after, /Submit Group Answer|field check/);
});

test("the story renders each statement with its own label and a source, without Hebrew", () => {
  const Story = loadComponent("components/amazing-shuk/dev/PreviewMuralStory.tsx");
  const html = renderToStaticMarkup(createElement(Story, { ...MURAL_TASK.story, instruction: MURAL_TASK.instruction, open: true, onToggle() {} }));
  assert.match(html, /Historical fact/); assert.match(html, /Attributed tradition/);
  assert.match(html, /Machane_Yehuda_Tour_EN\.md/);
  assert.match(html, /mural-before\.jpg/); assert.match(html, /The wall before the mural/);
  assert.match(html, /alt="Black-and-white photo of the same corner before the mural/);
  assert.ok(!/[֐-׿]/.test(html));
});
