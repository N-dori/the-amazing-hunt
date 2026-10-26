import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createRequire } from "node:module";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";
import { MURAL_CHALLENGE, MURAL_TASK } from "./mural-task.ts";
import { buildChoiceTaskView } from "./mural-task-view.ts";
import { SYNAGOGUE_APPRECIATION, SYNAGOGUE_BONUS, SYNAGOGUE_BONUS_CHALLENGE, SYNAGOGUE_CHALLENGE, SYNAGOGUE_TASK } from "./synagogue-task.ts";
import { MONTEFIORE_BONUS, MONTEFIORE_BONUS_CHALLENGE } from "./montefiore-task.ts";
import { LEVIN_CHALLENGE, LEVIN_TASK } from "./levin-task.ts";

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
const Preview = loadComponent("components/amazing-shuk/dev/PreviewChoiceTask.tsx");
const callbacks = { onToggle() {}, onStart() {}, onSubmit() {}, onReset() {}, onHint() {} };
const performance = (started: boolean) => ({ started, hintsUsed: 0, canStart: true, reward: null });

test("mural options are pressed buttons; no timer or live score; only an unverified key shows the draft notice", () => {
  const view = buildChoiceTaskView(MURAL_CHALLENGE, ["plaque"], false, "answerSubmitter", false, true);
  const html = renderToStaticMarkup(createElement(Preview, { ...callbacks, view, reveal: MURAL_TASK.reveal, question: MURAL_TASK.question, performance: performance(true), hints: [], hasMoreHints: true, feedback: "" }));
  assert.match(html, /Can your group spot TWO things that are actually real\?/);
  // Native checkboxes inside label cards: one checked, the rest unchecked, all named by their visible label.
  assert.equal((html.match(/type="checkbox"/g) ?? []).length, MURAL_CHALLENGE.options.length);
  assert.equal((html.match(/checked=""/g) ?? []).length, 1);
  assert.equal((html.match(/<label/g) ?? []).length, MURAL_CHALLENGE.options.length);
  assert.match(html, /<fieldset/); assert.match(html, /<legend class="srOnly">/);
  assert.match(html, /1 of 2 selected/); assert.match(html, /Submit Our Answer/); assert.match(html, /Need a hint\?/);
  assert.doesNotMatch(html, /aria-pressed/);
  assert.doesNotMatch(html, /answer key still needs a field check/);
  assert.doesNotMatch(html, /countdown|role="timer"|Points earned|seconds|elapsed|<img|mural-before/i);
  const draft = buildChoiceTaskView({ ...MURAL_CHALLENGE, answerKeyVerified: false }, [], false, "answerSubmitter", false, true);
  assert.match(renderToStaticMarkup(createElement(Preview, { ...callbacks, view: draft, reveal: MURAL_TASK.reveal, question: MURAL_TASK.question, performance: performance(true), hints: [], hasMoreHints: true, feedback: "" })), /answer key still needs a field check/);
});

test("followers are invited to discuss; completion shows the shared result once", () => {
  const follower = buildChoiceTaskView(MURAL_CHALLENGE, [], false, "follower", false, false);
  const before = renderToStaticMarkup(createElement(Preview, { ...callbacks, view: follower, reveal: MURAL_TASK.reveal, question: MURAL_TASK.question, performance: { ...performance(false), canStart: false }, hints: [], hasMoreHints: false, feedback: "" }));
  assert.doesNotMatch(before, /Submit Our Answer|Start challenge/);
  assert.match(before, /Talk it over/);
  const done = buildChoiceTaskView(MURAL_CHALLENGE, ["air-vents", "plaque"], true, "answerSubmitter", false, true);
  const after = renderToStaticMarkup(createElement(Preview, { ...callbacks, view: done, reveal: MURAL_TASK.reveal, question: MURAL_TASK.question,
    performance: { started: true, hintsUsed: 1, canStart: true, reward: { points: 90, foodTokens: 2, hintsUsed: 1 } }, hints: [], hasMoreHints: false, feedback: "" }));
  assert.match(after, /Challenge completed!/); assert.match(after, /<dt>Points earned<\/dt><dd>90<\/dd>/);
  assert.doesNotMatch(after, /Submit Our Answer|field check|1 of 2|2 of 2/);
});

test("the story renders its text and the before photo, without labels, a source or Hebrew (owner, 26 Oct 2026)", () => {
  const Story = loadComponent("components/amazing-shuk/dev/PreviewChoiceStory.tsx");
  const html = renderToStaticMarkup(createElement(Story, { ...MURAL_TASK.story, instruction: MURAL_TASK.instruction, open: true, onToggle() {} }));
  assert.doesNotMatch(html, /Historical fact|Attributed tradition|Interpretation|Fiction ·/); assert.match(html, /This wall was once bare/);
  assert.doesNotMatch(html, /Machane_Yehuda_Tour_EN\.md|Source/);
  assert.match(html, /mural-before\.jpg/); assert.match(html, /The wall before the mural/);
  assert.ok(!/[֐-׿]/.test(html));
});

test("a wrong answer shows its reply beside the submit button and keeps the picks; followers never get the submit button", () => {
  const view = buildChoiceTaskView(MURAL_CHALLENGE, ["plaque", "tile-103"], false, "answerSubmitter", false, true);
  const props = { ...callbacks, reveal: MURAL_TASK.reveal, question: MURAL_TASK.question, performance: performance(true), hints: [], hasMoreHints: true };
  const html = renderToStaticMarkup(createElement(Preview, { ...props, view, feedback: "Not quite. Look again and talk it over." }));
  assert.match(html, /Not quite\. Look again and talk it over\./); assert.match(html, /2 of 2 selected/);
  assert.equal((html.match(/checked=""/g) ?? []).length, 2);
  assert.doesNotMatch(html, /Challenge completed|mural-before/);
  // With two picked, the other six are disabled until one is unpicked.
  assert.equal((html.match(/disabled=""/g) ?? []).length, MURAL_CHALLENGE.options.length - 2);
  const follower = buildChoiceTaskView(MURAL_CHALLENGE, ["plaque"], false, "follower", false, true);
  const followerHtml = renderToStaticMarkup(createElement(Preview, { ...props, view: follower, feedback: "" }));
  assert.doesNotMatch(followerHtml, /Submit Our Answer/); assert.match(followerHtml, /Talk it over/);
  assert.match(followerHtml, /type="checkbox"/); assert.doesNotMatch(followerHtml, /disabled=""/);
});

test("synagogue: the reveal (blue sign, Armoza) appears only after the accepted answer, one neutral heading, no labels, no image", () => {
  const props = { ...callbacks, reveal: SYNAGOGUE_TASK.reveal, question: SYNAGOGUE_TASK.question, hints: [], hasMoreHints: false, feedback: "" };
  const playing = buildChoiceTaskView(SYNAGOGUE_CHALLENGE, ["tavern"], false, "answerSubmitter", false, true);
  const before = renderToStaticMarkup(createElement(Preview, { ...props, view: playing, performance: performance(true) }));
  assert.match(before, /what surprising business operated here\?/); assert.match(before, /1 of 1 selected/);
  assert.equal((before.match(/type="checkbox"/g) ?? []).length, 4);
  assert.doesNotMatch(before, /heritage sign|Armoza/);
  const done = buildChoiceTaskView(SYNAGOGUE_CHALLENGE, ["tavern"], true, "answerSubmitter", false, true);
  const after = renderToStaticMarkup(createElement(Preview, { ...props, view: done,
    performance: { started: true, hintsUsed: 0, canStart: true, reward: { points: 100, foodTokens: 2, hintsUsed: 0 } } }));
  assert.match(after, /Challenge completed!/); assert.match(after, /blue heritage sign nearby/); assert.match(after, /Yitzhak Armoza/);
  assert.match(after, /Behind the answer/); assert.doesNotMatch(after, /Historical fact|Attributed tradition|Interpretation|Fiction ·/); assert.doesNotMatch(after, /<img|<figure/);
});

test("synagogue bonus: cards and submit until it's right, then points and the fiction reveal under one heading; appreciation has nothing to submit", () => {
  const Bonus = loadComponent("components/amazing-shuk/dev/PreviewChoiceBonus.tsx");
  const open = buildChoiceTaskView(SYNAGOGUE_BONUS_CHALLENGE, ["rose-old-city"], false, "answerSubmitter", false, true);
  const before = renderToStaticMarkup(createElement(Bonus, { content: SYNAGOGUE_BONUS, view: open, points: 0, feedback: "Not quite. Talk it over and try again.", onToggle() {}, onSubmit() {}, onReset() {} }));
  assert.match(before, /known as in the famous novel/); assert.equal((before.match(/type="checkbox"/g) ?? []).length, 4);
  assert.match(before, /Submit Our Answer/); assert.match(before, /Not quite\. Talk it over/);
  assert.doesNotMatch(before, /historical fiction|Sarit Yishai-Levi|Bonus points earned/);
  const right = buildChoiceTaskView(SYNAGOGUE_BONUS_CHALLENGE, ["beauty-queen"], true, "follower", false, true);
  const after = renderToStaticMarkup(createElement(Bonus, { content: SYNAGOGUE_BONUS, view: right, points: 10, feedback: "", onToggle() {}, onSubmit() {}, onReset() {} }));
  assert.match(after, /Bonus points earned: <strong>10<\/strong>/); assert.match(after, /historical fiction/); assert.match(after, /Behind the answer/); assert.doesNotMatch(after, /Historical fact|Attributed tradition|Interpretation|Fiction ·/);
  assert.doesNotMatch(after, /type="checkbox"|Submit Our Answer/);
  const Appreciation = loadComponent("components/amazing-shuk/dev/PreviewAppreciation.tsx");
  const moment = renderToStaticMarkup(createElement(Appreciation, SYNAGOGUE_APPRECIATION));
  assert.match(moment, /Think of someone who deserves appreciation today/); assert.match(moment, /Nothing is recorded or scored/);
  assert.doesNotMatch(moment, /<input|<textarea|<button|<form/);
});

test("Montefiore bonus: the letters and verse read right to left, and the Hebrew answer cards carry rtl and lang", () => {
  const Bonus = loadComponent("components/amazing-shuk/dev/PreviewChoiceBonus.tsx");
  const open = buildChoiceTaskView(MONTEFIORE_BONUS_CHALLENGE, [], false, "answerSubmitter", false, true);
  const html = renderToStaticMarkup(createElement(Bonus, { content: MONTEFIORE_BONUS, view: open, points: 0, feedback: "", onToggle() {}, onSubmit() {}, onReset() {} }));
  assert.match(html, /class="letters rtl" lang="he"><span class="letter">ת<\/span><span class="letter">ר<\/span><span class="letter">מ<\/span><span class="letter">ב<\/span><\/p>/);
  assert.match(html, /class="verse rtl" lang="he">אָמַרְתִּי/);
  assert.equal((html.match(/class="optionLabel rtl" lang="he"/g) ?? []).length, 3);
  assert.doesNotMatch(html, /Yemenite/);
  // An English bonus has neither tiles nor a verse, and its cards stay left to right.
  const english = renderToStaticMarkup(createElement(Bonus, { content: SYNAGOGUE_BONUS, view: buildChoiceTaskView(SYNAGOGUE_BONUS_CHALLENGE, [], false, "answerSubmitter", false, true), points: 0, feedback: "", onToggle() {}, onSubmit() {}, onReset() {} }));
  assert.doesNotMatch(english, /letters|verse|rtl|lang="he"/);
});

test("Levin: no hint button, and the accepted answer gets a quiet title instead of a celebration", () => {
  const view = buildChoiceTaskView(LEVIN_CHALLENGE, ["spare-rabbi"], true, "answerSubmitter", false, true);
  const html = renderToStaticMarkup(createElement(Preview, { ...callbacks, view, reveal: LEVIN_TASK.reveal, question: LEVIN_TASK.question, completionTitle: LEVIN_TASK.completionTitle,
    performance: { started: true, hintsUsed: 0, canStart: true, reward: { points: 100, foodTokens: 2, hintsUsed: 0 } }, hints: [], hasMoreHints: false, feedback: "" }));
  assert.match(html, /<h3>Answer received<\/h3>/); assert.doesNotMatch(html, /Challenge completed!|Need a hint\?/);
  assert.match(html, /It&#x27;s told that they embraced/); assert.match(html, /Sources differ/); assert.doesNotMatch(html, /Historical fact|Attributed tradition|Interpretation|Fiction ·/);
});
