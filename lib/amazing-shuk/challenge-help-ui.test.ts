import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createRequire } from "node:module";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";
import { buildHintSheetView, choiceAnswer, waterAnswer } from "./challenge-help.ts";
import { MURAL_CHALLENGE, MURAL_REWARDS, MURAL_TASK } from "./mural-task.ts";
import { buildChoiceTaskView } from "./mural-task-view.ts";
import { buildWaterTaskView } from "./water-task-view.ts";
import { missionCheer } from "./mission-cheer.ts";
import { MURAL_MISSION_ID } from "./mural-task.ts";

const nativeRequire = createRequire(import.meta.url);
// Render the actual TSX (the same loader as mural-task-ui.test.ts, plus the parent folder's sheet) without a browser or CSS loader.
function loadComponent(path: string): ComponentType<Record<string, unknown>> {
  const output = ts.transpileModule(readFileSync(resolve(path), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText;
  const exports: { default?: ComponentType<Record<string, unknown>> } = {};
  const localRequire = (id: string) => {
    if (id.endsWith(".scss")) return { __esModule: true, default: new Proxy({}, { get: (_, key) => String(key) }) };
    if (id === "@/components/ui/ActionButton") return { __esModule: true, default: loadComponent("components/ui/ActionButton.tsx") };
    if (id === "@/components/icons") return { Icon: () => null };
    if (id === "next/image") return { __esModule: true, default: () => null };
    if (id.startsWith("@/lib/")) return nativeRequire(resolve(id.replace("@/", "") + ".ts"));
    if (id.startsWith("./") || id.startsWith("../")) return { __esModule: true, default: loadComponent(resolve(dirname(path), id + ".tsx")) };
    return nativeRequire(id);
  };
  new Function("require", "exports", output)(localRequire, exports);
  assert.ok(exports.default);
  return exports.default;
}
const HintSheet = loadComponent("components/amazing-shuk/dev/PreviewHintSheet.tsx");
const Stuck = loadComponent("components/amazing-shuk/dev/PreviewStuckConfirm.tsx");
const Choice = loadComponent("components/amazing-shuk/dev/PreviewChoiceTask.tsx");
const Water = loadComponent("components/amazing-shuk/dev/PreviewWaterTask.tsx");
const noop = () => {};
const sheetProps = { pending: false, offline: false, busy: false, onOpen: noop, onClose: noop, onShowHint: noop, onStuck: noop, afterClose: { current: null } };
const view = (stepUsed: number) => buildHintSheetView({ hints: MURAL_TASK.hints, stepUsed, totalUsed: stepUsed, started: true, completed: false, canReveal: true, rewards: MURAL_REWARDS });

test("the hint icon names what's left; the sheet shows the hints so far and the next one's cost, never a minus", () => {
  const closed = renderToStaticMarkup(createElement(HintSheet, { ...sheetProps, view: view(1), open: false }));
  assert.match(closed, /aria-label="Hints, 1 of 2 left"/); assert.doesNotMatch(closed, /Gentle/);
  const open = renderToStaticMarkup(createElement(HintSheet, { ...sheetProps, view: view(1), open: true }));
  assert.match(open, /Hint 1 — Gentle/); assert.doesNotMatch(open, /Hint 2 — More specific/);
  assert.match(open, /from 85 to 60 points/); assert.match(open, /Show hint 2/); assert.doesNotMatch(open, /−\d|-\d+ points/);
  const all = renderToStaticMarkup(createElement(HintSheet, { ...sheetProps, view: view(2), open: true }));
  assert.match(all, /aria-label="Hints, all used"/); assert.match(all, /I&#x27;m completely stuck/); assert.doesNotMatch(all, /Show hint/);
  const waiting = renderToStaticMarkup(createElement(HintSheet, { ...sheetProps, view: view(0), open: true, pending: true, offline: true }));
  assert.match(waiting, /Opening hint…/); assert.match(waiting, /back online/);
  assert.equal(renderToStaticMarkup(createElement(HintSheet, { ...sheetProps, view: { ...view(0), available: false }, open: false })), "");
});

test("the stuck confirmation: 0 points, food tokens kept, Keep trying first; nothing for a phone that may not reveal", () => {
  const props = { open: true, busy: false, foodTokens: 2, onOpen: noop, onKeepTrying: noop, onReveal: noop };
  const html = renderToStaticMarkup(createElement(Stuck, { ...props, canReveal: true }));
  assert.match(html, /Show the answer\?/); assert.match(html, /0 points/); assert.match(html, /2 food tokens/);
  assert.ok(html.indexOf("Keep trying") < html.indexOf("Show the answer</span>"));
  assert.equal(renderToStaticMarkup(createElement(Stuck, { ...props, canReveal: false })), "");
});

test("a revealed mural shows the answer under a quiet title, with 0 points; the cheer is the quiet line", () => {
  const completed = buildChoiceTaskView(MURAL_CHALLENGE, [], true, "answerSubmitter", false, true);
  const html = renderToStaticMarkup(createElement(Choice, { view: completed, reveal: MURAL_TASK.reveal, question: MURAL_TASK.question, feedback: "",
    onToggle: noop, onStart: noop, onSubmit: noop, onReset: noop, answer: choiceAnswer(MURAL_CHALLENGE),
    performance: { started: true, hintsUsed: 1, canStart: true, reward: { points: 0, foodTokens: 2, hintsUsed: 1 }, revealed: true } }));
  assert.match(html, /<h3>Here&#x27;s the answer<\/h3>/); assert.doesNotMatch(html, /Challenge completed!/);
  for (const label of choiceAnswer(MURAL_CHALLENGE)) assert.ok(html.includes(label.replace(/"/g, "&quot;")), label);
  assert.match(html, /<dt>Points earned<\/dt><dd>0<\/dd>/);
  assert.deepEqual(missionCheer(MURAL_MISSION_ID, false, true), { text: "Here's the answer. You can carry on.", celebrate: false });
});

test("a revealed well lists the intended steps in order", () => {
  const html = renderToStaticMarkup(createElement(Water, { view: buildWaterTaskView({ small: 0, large: 0, jar: 0 }, true, "answerSubmitter", false), narrative: [],
    onSelect: noop, onAction: noop, onCancelPour: noop, onStart: noop, onSubmit: noop, onReset: noop, answer: waterAnswer(),
    performance: { started: true, hintsUsed: 0, canStart: true, reward: { points: 0, foodTokens: 2, hintsUsed: 0 }, revealed: true } }));
  assert.match(html, /Here&#x27;s the answer/); assert.match(html, /<ol>/);
  assert.equal((html.match(/<li>/g) ?? []).length, waterAnswer().length);
});

const Reward = loadComponent("components/amazing-shuk/dev/PreviewRewardDialog.tsx");
const Toast = loadComponent("components/amazing-shuk/dev/PreviewRewardToast.tsx");

test("the reward pop-up: the headline, the amounts as text, the badge only when celebrating, and Continue", () => {
  const full = renderToStaticMarkup(createElement(Reward, { open: true, title: "Woo-hoo! You rock!", celebrate: true, weight: "full", amounts: ["+85 points", "+2 food tokens"], onContinue: noop }));
  assert.match(full, /Woo-hoo! You rock!/); assert.match(full, /\+85 points/); assert.match(full, /\+2 food tokens/);
  assert.match(full, /class="badge"/); assert.match(full, /Continue/);
  const quiet = renderToStaticMarkup(createElement(Reward, { open: true, title: "Here's the answer. You can carry on.", celebrate: false, weight: "quiet", amounts: ["+2 food tokens"], onContinue: noop }));
  assert.doesNotMatch(quiet, /class="badge"/); assert.doesNotMatch(quiet, /points/);
  const toast = renderToStaticMarkup(createElement(Toast, { text: "Your team earned 100 points at Market Mural.", onDismiss: noop }));
  assert.match(toast, /role="status"/); assert.match(toast, /Dismiss/);
});

// UX-3 (owner, 2 Nov 2026): the story, then Start, then the challenge; screen-only hiding on one page.
const choiceProps = { reveal: MURAL_TASK.reveal, question: MURAL_TASK.question, feedback: "", onToggle: noop, onStart: noop, onSubmit: noop, onReset: noop };
const notStarted = { started: false, hintsUsed: 0, canStart: true, reward: null };

test("UX-3: before the accepted Start a choice challenge shows only Start; the question and options come after", () => {
  const before = renderToStaticMarkup(createElement(Choice, { ...choiceProps, view: buildChoiceTaskView(MURAL_CHALLENGE, [], false, "answerSubmitter", false, false), performance: notStarted }));
  assert.match(before, /Start challenge/);
  assert.doesNotMatch(before, new RegExp(MURAL_TASK.question.replace(/[?]/g, "\\?")));
  assert.doesNotMatch(before, /type="checkbox"|<fieldset|Submit Our Answer|field check|Talk it over/);
  for (const option of MURAL_CHALLENGE.options) assert.ok(!before.includes(`>${option.label}<`), option.label);
  // A phone that can't start sees why and, where a role is free, the way to take it, still without the question.
  const blocked = renderToStaticMarkup(createElement(Choice, { ...choiceProps, onOpenRoles: noop, view: buildChoiceTaskView(MURAL_CHALLENGE, [], false, "follower", false, false), performance: { ...notStarted, canStart: false } }));
  assert.match(blocked, /can start after the story/); assert.match(blocked, /Open the Group tab/); assert.doesNotMatch(blocked, /type="checkbox"/);
  const after = renderToStaticMarkup(createElement(Choice, { ...choiceProps, view: buildChoiceTaskView(MURAL_CHALLENGE, [], false, "answerSubmitter", false, true), performance: { ...notStarted, started: true } }));
  assert.match(after, /id="mural-task-title" tabindex="-1"/); assert.equal((after.match(/type="checkbox"/g) ?? []).length, MURAL_CHALLENGE.options.length);
  assert.doesNotMatch(after, /Start challenge/);
  // Without the gate (Marzipan, until its rework) the old screen stays: the question and options before Start.
  const old = renderToStaticMarkup(createElement(Choice, { ...choiceProps, storyFirst: false, view: buildChoiceTaskView(MURAL_CHALLENGE, [], false, "answerSubmitter", false, false), performance: notStarted }));
  assert.match(old, /Start challenge/); assert.match(old, /type="checkbox"/);
});

test("UX-3: before the accepted Start the well shows only Start, not the puzzle statement or the containers", () => {
  const props = { narrative: ["Use the 3-liter and 5-liter measuring vessels."], onSelect: noop, onAction: noop, onCancelPour: noop, onStart: noop, onSubmit: noop, onReset: noop };
  const before = renderToStaticMarkup(createElement(Water, { ...props, view: buildWaterTaskView({ small: 0, large: 0, jar: 0 }, false, "answerSubmitter", false, undefined, false), performance: notStarted }));
  assert.match(before, /Start challenge/);
  assert.doesNotMatch(before, /Fill your family|measuring vessels|L \/ |<meter|Reset puzzle/);
  const after = renderToStaticMarkup(createElement(Water, { ...props, view: buildWaterTaskView({ small: 0, large: 0, jar: 0 }, false, "answerSubmitter", false, undefined, true), performance: { ...notStarted, started: true } }));
  assert.match(after, /id="water-task-title" tabindex="-1"/); assert.match(after, /measuring vessels/); assert.match(after, /5 L/);
  assert.doesNotMatch(after, /Start challenge/);
  // A completed challenge shows its result whether or not this phone saw the start.
  const done = renderToStaticMarkup(createElement(Water, { ...props, view: buildWaterTaskView({ small: 0, large: 0, jar: 4 }, true, "answerSubmitter", false), performance: { ...notStarted, reward: { points: 75, foodTokens: 2, hintsUsed: 0 } } }));
  assert.match(done, /Challenge completed!/);
});

test("UX-3: before Start the story is open with no fold; after, one tap reopens it", () => {
  const Story = loadComponent("components/amazing-shuk/dev/PreviewChoiceStory.tsx");
  const open = renderToStaticMarkup(createElement(Story, { ...MURAL_TASK.story, instruction: MURAL_TASK.instruction, open: true, onToggle: noop, collapsible: false }));
  assert.doesNotMatch(open, /<details|<summary|Hide story|Read story/); assert.match(open, /This wall was once bare/); assert.match(open, /<h3/);
  const folded = renderToStaticMarkup(createElement(Story, { ...MURAL_TASK.story, instruction: MURAL_TASK.instruction, open: false, onToggle: noop }));
  assert.match(folded, /<details/); assert.match(folded, /Read story/);
});
