import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createRequire } from "node:module";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";
import { buildWaterTaskView, INITIAL_WATER_INTERACTION } from "./water-task-view.ts";
import { MISSION_VICTORY, WELL_DISCOVERY } from "./mission-completion.ts";
import { WATER_TASK } from "./water-task.ts";
import { EMPTY_WATER_CUPS } from "./water-measurement.ts";

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
    if (id.startsWith("./")) return { __esModule: true, default: loadComponent(resolve(dirname(path), id + ".tsx")) };
    return nativeRequire(id);
  };
  new Function("require", "exports", output)(localRequire, exports);
  assert.ok(exports.default);
  return exports.default;
}
const Preview = loadComponent("components/amazing-shuk/dev/PreviewWaterTask.tsx");
<<<<<<< HEAD
const callbacks = { victory: MISSION_VICTORY, discovery: WELL_DISCOVERY, onExplore() {}, onSelect() {}, onAction() {}, onCancelPour() {}, onStart() {}, onSubmit() {}, onReset() {}, onHint() {} };
=======
const callbacks = { onSelect() {}, onAction() {}, onCancelPour() {}, onStart() {}, onSubmit() {}, onReset() {} };
>>>>>>> bb4234fb5b66e55047f6343e266fa8ee539f0a27

test("participant rendering has explicit start but no timer/countdown or live score", () => {
  for (const started of [false, true]) {
    const view = buildWaterTaskView(EMPTY_WATER_CUPS, false, "answerSubmitter", false, INITIAL_WATER_INTERACTION, started);
    const html = renderToStaticMarkup(createElement(Preview, { ...callbacks, view, performance: { started, hintsUsed: 0, canStart: true, reward: null }, narrative: ["Fill the family jar."], help: started ? createElement("p", null, "help-slot") : undefined }));
    assert.doesNotMatch(html, /countdown|role="timer"|Points earned|Recorded duration|seconds|elapsed/i);
    assert.equal(html.includes("Start challenge"), !started);
    assert.equal(html.includes("help-slot"), started);
  }
});

test("participant sees earned achievements only after official completion", () => {
  const cups = { small: 3, large: 0, jar: 4 };
  const reward = { points: 75, foodTokens: 2, hintsUsed: 2 };
  const html = renderToStaticMarkup(createElement(Preview, { ...callbacks, view: buildWaterTaskView(cups, true, "answerSubmitter", false), performance: { started: true, hintsUsed: 2, canStart: true, reward }, narrative: [] }));
  assert.match(html, /Challenge completed!/);
  assert.match(html, /Explore Next Mission/);
  assert.doesNotMatch(html, /Fill your family|Reset puzzle|Submit Group Answer|Need a hint|<meter|aria-pressed/);
  assert.match(html, /<dt>Points earned<\/dt><dd>75<\/dd>/);
  assert.match(html, /<dt>Food tokens earned<\/dt><dd>2<\/dd>/);
  assert.match(html, /<dt>Hints used<\/dt><dd>2<\/dd>/);
  assert.doesNotMatch(html, /countdown|role="timer"|Recorded duration|seconds|elapsed/i);
});


test("Hebrew-first brief retains natural attribution and evidence metadata without player labels", () => {
  const Story = loadComponent("components/amazing-shuk/dev/PreviewWellStory.tsx");
  assert.equal(WATER_TASK.story.paragraphs.length, 4);
  assert.ok(WATER_TASK.story.originalHebrew.length > 0);
  assert.ok(WATER_TASK.story.paragraphs.join(" ").split(/\s+/).length <= 40);
  for (const showOriginalHebrew of [false, true]) {
    const html = renderToStaticMarkup(createElement(Story, { ...WATER_TASK.story, instruction: WATER_TASK.instruction, open: true, onToggle() {}, showOriginalHebrew }));
    assert.match(html, /punishment or honor/);
    assert.match(html, /children longed for the cleaning job/);
<<<<<<< HEAD
    assert.doesNotMatch(html, /Attributed tradition/); assert.match(html, /According to the local account/);
    assert.match(WATER_TASK.story.source, /HE_trans.txt/);
    assert.doesNotMatch(html, /HE_trans.txt|<cite|Source/);
    assert.equal(html.includes('lang="he"'), false);
    assert.equal(html.includes("Source and original Hebrew"), false);
    assert.equal(/[\u0590-\u05ff]/.test(html), false);
=======
    assert.doesNotMatch(html, /Historical fact|Attributed tradition|Interpretation|Fiction ·/);
    // Sources stay in the data for review; players never see them (owner's request, 26 Oct 2026).
    assert.doesNotMatch(html, /HE_trans.txt|Source/);
    assert.equal(html.includes('lang="he"'), showOriginalHebrew);
    assert.equal(html.includes("Original Hebrew"), showOriginalHebrew);
    assert.equal(/[\u0590-\u05ff]/.test(html), showOriginalHebrew);
>>>>>>> bb4234fb5b66e55047f6343e266fa8ee539f0a27
  }
});
