import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createRequire } from "node:module";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";
import { buildChoiceDiscovery, MISSION_VICTORY } from "./mission-completion.ts";
import { MURAL_CHALLENGE, MURAL_TASK } from "./mural-task.ts";
import { buildChoiceTaskView } from "./mural-task-view.ts";
import { SYNAGOGUE_APPRECIATION, SYNAGOGUE_BONUS, SYNAGOGUE_BONUS_CHALLENGE, SYNAGOGUE_CHALLENGE, SYNAGOGUE_TASK } from "./synagogue-task.ts";

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
const callbacks = { victory: MISSION_VICTORY, onExplore() {}, onToggle() {}, onStart() {}, onSubmit() {}, onReset() {}, onHint() {} };
const performance = (started: boolean) => ({ started, hintsUsed: 0, canStart: true, reward: null });

test("mural options are pressed buttons; no timer or live score; only an unverified key shows the draft notice", () => {
  const view = buildChoiceTaskView(MURAL_CHALLENGE, ["plaque"], false, "answerSubmitter", false, true);
  const html = renderToStaticMarkup(createElement(Preview, { ...callbacks, view, discovery: buildChoiceDiscovery(MURAL_TASK), question: MURAL_TASK.question, performance: performance(true), hints: [], hasMoreHints: true, feedback: "" }));
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
  assert.match(renderToStaticMarkup(createElement(Preview, { ...callbacks, view: draft, discovery: buildChoiceDiscovery(MURAL_TASK), question: MURAL_TASK.question, performance: performance(true), hints: [], hasMoreHints: true, feedback: "" })), /answer key still needs a field check/);
});

test("followers are invited to discuss; completion shows the shared result once", () => {
  const follower = buildChoiceTaskView(MURAL_CHALLENGE, [], false, "follower", false, false);
  const before = renderToStaticMarkup(createElement(Preview, { ...callbacks, view: follower, discovery: buildChoiceDiscovery(MURAL_TASK), question: MURAL_TASK.question, performance: { ...performance(false), canStart: false }, hints: [], hasMoreHints: false, feedback: "" }));
  assert.doesNotMatch(before, /Submit Our Answer|Start challenge/);
  assert.match(before, /Talk it over/);
  const done = buildChoiceTaskView(MURAL_CHALLENGE, ["air-vents", "plaque"], true, "answerSubmitter", false, true);
  const after = renderToStaticMarkup(createElement(Preview, { ...callbacks, view: done, discovery: buildChoiceDiscovery(MURAL_TASK), question: MURAL_TASK.question,
    performance: { started: true, hintsUsed: 1, canStart: true, reward: { points: 90, foodTokens: 2, hintsUsed: 1 } }, hints: [], hasMoreHints: false, feedback: "" }));
  assert.match(after, /Challenge completed!/); assert.match(after, /<dt>Points earned<\/dt><dd>90<\/dd>/);
  assert.match(after, /mural-before\.jpg/); assert.match(after, /The wall before the mural/);
  // Photograph captions/credits are independent of the removed historical story disclosure.
  assert.ok(after.includes(MURAL_TASK.reveal.image.caption));
  assert.match(after, /<figcaption/);
  assert.doesNotMatch(before, /mural-before/);
  assert.doesNotMatch(after, /Submit Our Answer|field check|1 of 2|2 of 2/);
});

test("the story keeps natural attribution and source metadata without visible evidence labels", () => {
  const Story = loadComponent("components/amazing-shuk/dev/PreviewChoiceStory.tsx");
  const html = renderToStaticMarkup(createElement(Story, { ...MURAL_TASK.story, instruction: MURAL_TASK.instruction, open: true, onToggle() {} }));
  assert.doesNotMatch(html, /Historical fact|Attributed tradition/); assert.match(html, /The story goes/);
  assert.match(MURAL_TASK.story.source, /Machane_Yehuda_Tour_EN\.md/);
  assert.doesNotMatch(html, /Machane_Yehuda_Tour_EN\.md|<summary>Source|<cite/);
  assert.doesNotMatch(html, /mural-before|<img/);
  assert.ok(!/[֐-׿]/.test(html));
});

test("synagogue introduction is five continuous short lines with no answer or archival identity", () => {
  const Story = loadComponent("components/amazing-shuk/dev/PreviewChoiceStory.tsx");
  const html = renderToStaticMarkup(createElement(Story, { ...SYNAGOGUE_TASK.story, instruction: SYNAGOGUE_TASK.instruction, open: true, onToggle() {} }));
  assert.equal(SYNAGOGUE_TASK.story.paragraphs.length, 5);
  assert.match(html, /1925/); assert.match(html, /Kindness and Mercy/);
  assert.match(html, /Ladino-speaking/); assert.match(html, /kindergarten and soup kitchens/);
  assert.match(html, /Mazor, a free clinic staffed by volunteer doctors/);
  assert.doesNotMatch(html, /tavern|pub\b|Historical fact|Attributed tradition|Source|<cite|<img/i);
  assert.match(html, /<details open=""/); assert.match(html, /<summary/);
});

test("a wrong answer shows its reply beside the submit button and keeps the picks; followers never get the submit button", () => {
  const view = buildChoiceTaskView(MURAL_CHALLENGE, ["plaque", "tile-103"], false, "answerSubmitter", false, true);
  const props = { ...callbacks, discovery: buildChoiceDiscovery(MURAL_TASK), question: MURAL_TASK.question, performance: performance(true), hints: [], hasMoreHints: true };
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

test("synagogue: the reveal (blue sign, Armoza) appears only after the accepted answer, with clearly captioned fictional atmosphere", () => {
  const props = { ...callbacks, discovery: buildChoiceDiscovery(SYNAGOGUE_TASK), question: SYNAGOGUE_TASK.question, hints: [], hasMoreHints: false, feedback: "" };
  const playing = buildChoiceTaskView(SYNAGOGUE_CHALLENGE, ["tavern"], false, "answerSubmitter", false, true);
  const before = renderToStaticMarkup(createElement(Preview, { ...props, view: playing, performance: performance(true) }));
  assert.match(before, /what surprising business operated here\?/); assert.match(before, /1 of 1 selected/);
  assert.equal((before.match(/type="checkbox"/g) ?? []).length, 4);
  assert.doesNotMatch(before, /heritage sign|Armoza|family_illustration|<figure/);
  const done = buildChoiceTaskView(SYNAGOGUE_CHALLENGE, ["tavern"], true, "answerSubmitter", false, true);
  const after = renderToStaticMarkup(createElement(Preview, { ...props, view: done,
    performance: { started: true, hintsUsed: 0, canStart: true, reward: { points: 100, foodTokens: 2, hintsUsed: 0 } } }));
  assert.match(after, /Challenge completed!/); assert.match(after, /blue heritage sign nearby/); assert.match(after, /Yitzhak Armoza/);
  assert.doesNotMatch(after, /Historical fact/); assert.match(after, /<figure/);
  assert.ok(after.includes(SYNAGOGUE_TASK.reveal.image.caption));
  assert.match(after, /fictional family/); assert.doesNotMatch(after, /Studio portrait|and Flor/);
});

test("synagogue bonus: cards and submit until it's right, then points and the labelled fiction reveal; appreciation has nothing to submit", () => {
  const Bonus = loadComponent("components/amazing-shuk/dev/PreviewChoiceBonus.tsx");
  const open = buildChoiceTaskView(SYNAGOGUE_BONUS_CHALLENGE, ["rose-old-city"], false, "answerSubmitter", false, true);
  const before = renderToStaticMarkup(createElement(Bonus, { content: SYNAGOGUE_BONUS, view: open, points: 0, feedback: "Not quite. Talk it over and try again.", onToggle() {}, onSubmit() {}, onReset() {} }));
  assert.match(before, /known as in the famous novel/); assert.equal((before.match(/type="checkbox"/g) ?? []).length, 4);
  assert.match(before, /Submit Our Answer/); assert.match(before, /Not quite\. Talk it over/);
  assert.doesNotMatch(before, /historical fiction|Sarit Yishai-Levi|Bonus points earned/);
  const right = buildChoiceTaskView(SYNAGOGUE_BONUS_CHALLENGE, ["beauty-queen"], true, "follower", false, true);
  const after = renderToStaticMarkup(createElement(Bonus, { content: SYNAGOGUE_BONUS, view: right, points: 10, feedback: "", onToggle() {}, onSubmit() {}, onReset() {} }));
  assert.match(after, /Bonus points earned: <strong>10<\/strong>/); assert.match(after, /historical fiction/); assert.doesNotMatch(after, /Historical fact/);
  assert.doesNotMatch(after, /type="checkbox"|Submit Our Answer/);
  const Appreciation = loadComponent("components/amazing-shuk/dev/PreviewAppreciation.tsx");
  const moment = renderToStaticMarkup(createElement(Appreciation, SYNAGOGUE_APPRECIATION));
  assert.match(moment, /Think of someone who deserves appreciation today/); assert.match(moment, /Nothing is recorded or scored/);
  assert.doesNotMatch(moment, /Historical fact|Interpretation|<input|<textarea|<button|<form/);
});
