import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createRequire } from "node:module";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";
import { MARZIPAN_CHALLENGE, MARZIPAN_HORNS_CHALLENGE, MARZIPAN_TASK } from "./marzipan-task.ts";

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
const List = loadComponent("components/amazing-shuk/dev/ListChoiceTask.tsx");
const Prediction = loadComponent("components/amazing-shuk/dev/PreviewChoicePrediction.tsx");
const callbacks = { onToggle() {}, onStart() {}, onSubmit() {}, onReset() {}, onHint() {} };
const base = { ...callbacks, task: MARZIPAN_TASK, challenge: MARZIPAN_CHALLENGE, followUps: [MARZIPAN_HORNS_CHALLENGE], selected: [], completed: false, feedback: "", activeRole: "answerSubmitter", busy: false };

test("question 1 shows the syrup choices and its own first hint, with no answer to a previous question", () => {
  const html = renderToStaticMarkup(createElement(List, { ...base, step: 0, performance: { started: true, hintsUsed: 1, stepHintsUsed: 1, canStart: true, reward: null } }));
  assert.match(html, /When do you think the sweet syrup goes onto Marzipan&#x27;s rugelach\?/);
  assert.match(html, /While the pastries are still warm\./); assert.doesNotMatch(html, /Little horns/);
  assert.match(html, /Hint 1 — Gentle/); assert.match(html, /Another hint\?/);
  assert.doesNotMatch(html, /still warm, they&#x27;re brushed/);
});

test("question 2 opens under the answer to question 1, with its own hints counted from 1", () => {
  // Two hints were used on question 1; none yet on question 2.
  const html = renderToStaticMarkup(createElement(List, { ...base, step: 1, performance: { started: true, hintsUsed: 2, stepHintsUsed: 0, canStart: true, reward: null } }));
  assert.ok(html.indexOf("still warm, they&#x27;re brushed") < html.indexOf("What does the name rugelach refer to?"));
  assert.match(html, /Behind the answer/); assert.doesNotMatch(html, /Historical fact|Attributed tradition|Interpretation|Fiction ·/); assert.match(html, /Little horns/);
  assert.doesNotMatch(html, /While the pastries are still warm\./);
  assert.doesNotMatch(html, /<li>/); assert.match(html, /Need a hint\?/);
  assert.doesNotMatch(html, /Look at the trays\. Is the syrup/);
});

test("completion shows the reward and the horns reveal, and no longer the lead", () => {
  const html = renderToStaticMarkup(createElement(List, { ...base, step: 1, completed: true, performance: { started: true, hintsUsed: 0, stepHintsUsed: 0, canStart: true, reward: { points: 100, foodTokens: 2, hintsUsed: 0 } } }));
  assert.match(html, /Food tokens earned/); assert.match(html, /Polish, róg/); assert.match(html, /do you see any horns\?/);
  assert.doesNotMatch(html, /still warm, they&#x27;re brushed/);
});

test("the name mystery is a guess with a closed answer: no form, no submit, the tradition told in its own words", () => {
  const html = renderToStaticMarkup(createElement(Prediction, MARZIPAN_TASK.prediction));
  assert.match(html, /<details/); assert.doesNotMatch(html, /<details[^>]* open/);
  assert.match(html, /Show the answer/); assert.match(html, /At first the shop sold marzipan sweets/); assert.doesNotMatch(html, /Jerusalem guide/); assert.doesNotMatch(html, /Historical fact|Attributed tradition|Interpretation|Fiction ·/);
  assert.doesNotMatch(html, /<input|<textarea|<form|<button/);
});
