import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createRequire } from "node:module";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";
import { buildMissionPresentation, GAN_HATUT_MISSION, type MissionState } from "./mission-arrival.ts";
import { SHUK_MISSIONS } from "./missions.ts";
import { MURAL_MISSION } from "./mural-task.ts";
// React escapes ' and " in text; compare against the escaped form.
const escapeText = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&#x27;").replace(/"/g, "&quot;");
import { createDevWaterSession } from "./dev-water-session.ts";
import { LOCATION_UNAVAILABLE_MESSAGE } from "./request-arrival-location.ts";
const nativeRequire = createRequire(import.meta.url);
function load(path: string, reactOverride?: object): ComponentType<Record<string, unknown>> {
  const output = ts.transpileModule(readFileSync(resolve(path), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText;
  const exports: { default?: ComponentType<Record<string, unknown>> } = {};
  const localRequire = (id: string) => {
    if (id === "react" && reactOverride) return reactOverride;
    if (id.endsWith(".scss")) return { __esModule: true, default: new Proxy({}, { get: (_, key) => String(key) }) };
    if (id === "@/components/icons") return { Icon: () => null };
    // Map/browser and identity subtrees are outside this static content/access test.
    if (["@/components/map/LeafletBaseMap", "@/components/amazing-shuk/IndexParticipantMenu", "@/components/amazing-shuk/ListParticipantBadges", "./IndexGuideWaterTask"].includes(id)) return { __esModule: true, default: () => null };
    if (id.startsWith("@/lib/")) return nativeRequire(resolve(id.replace("@/", "") + ".ts"));
    if (id.startsWith("@/components/")) return { __esModule: true, default: load(id.replace("@/", "") + ".tsx", reactOverride) };
    if (id.startsWith("./")) return { __esModule: true, default: load(resolve(dirname(path), id + ".tsx"), reactOverride) };
    return nativeRequire(id);
  };
  new Function("require", "exports", output)(localRequire, exports);
  assert.ok(exports.default); return exports.default;
}
const callbacks = { onArrival() {}, onConfirm() {}, onOpenChallenge() {}, onBack() {} };

test("mission preview uses We're Here? and ordinary GPS uncertainty has no failure screen", () => {
  const Preview = load("components/amazing-shuk/dev/PreviewArrivalMission.tsx");
  for (const state of ["available", "arrived", "completed"] as const) {
    const view = buildMissionPresentation(GAN_HATUT_MISSION, { id: GAN_HATUT_MISSION.id, state, arrivalPoints: state === "available" ? 0 : 20, arrivalMethod: null, gpsEnabled: true }, 1);
    const html = renderToStaticMarkup(createElement(Preview, { view, selected: true, guide: false, busy: false, feedback: LOCATION_UNAVAILABLE_MESSAGE, ...callbacks }));
    assert.match(html, /Here\?/); assert.doesNotMatch(html, /Here!|role="alert"|latitude|longitude|timer|countdown/);
    assert.match(html, /play without checking/);
    assert.match(html, /gan-hatut-gate\.jpg/); assert.match(html, /gan-hatut-cistern\.jpg/); assert.match(html, /Montefiore Testimonial/);
    assert.doesNotMatch(html, /Confirm Group Arrival/);
    assert.match(html, /Open Challenge/); assert.match(html, /Back to map/);
    assert.match(html, /Landmarks/); assert.match(html, /lang="he"/);
  }
});

test("first tap shows a compact preview: title, place, summary, status and View Location, but no story or answers", () => {
  const Card = load("components/amazing-shuk/dev/PreviewMissionCard.tsx");
  for (const [index, definition] of SHUK_MISSIONS.entries()) {
    const view = buildMissionPresentation(definition, { id: definition.id, state: "available", arrivalPoints: 0, arrivalMethod: null, gpsEnabled: false }, index + 1);
    const html = renderToStaticMarkup(createElement(Card, { view, onViewLocation() {}, onClose() {} }));
    assert.ok(html.includes(escapeText(definition.title)) && html.includes(escapeText(definition.name)) && html.includes(escapeText(definition.location.summary)));
    assert.match(html, /View Location/); assert.match(html, /Available/); assert.match(html, /aria-label="Close preview"/);
    // The pill repeats the tapped pin's number and its status in words.
    assert.match(html, new RegExp(`class="pill pillActive">Mission ${index + 1} · Available</p>`));
    assert.doesNotMatch(html, /STORY|Start challenge|spot TWO things|air vents|plaque|treble|Here\?/i);
    // Compact by decision: no Hebrew name, no rewards and no drag notch on the first tap.
    assert.doesNotMatch(html, /lang="he"|food tokens|pts|points|notch/i);
  }
});

test("the preview keeps View Location in its own action row outside the scrolling body, with a thumbnail, inside the map stage", () => {
  const Card = load("components/amazing-shuk/dev/PreviewMissionCard.tsx");
  const view = buildMissionPresentation(GAN_HATUT_MISSION, { id: GAN_HATUT_MISSION.id, state: "available", arrivalPoints: 0, arrivalMethod: null, gpsEnabled: false }, 1);
  const html = renderToStaticMarkup(createElement(Card, { view, onViewLocation() {}, onClose() {} }));
  // Three rows in order: the pill and close button, the body (title, place, teaser), then the action.
  assert.match(html, /<div class="top">.*Close preview.*<\/div><div class="body"><h2 id="mission-preview-title".*<\/div><div class="action"><button[^>]*><span>View Location<\/span>/);
  assert.doesNotMatch(html.slice(html.indexOf('class="body"'), html.indexOf('class="action"')), /View Location/);
  assert.match(html, /class="thumb"/); assert.match(html, /sizes="4.5rem"/);
  // The map and the sheet share one stage, so the sheet can overlap the map's lower edge.
  const List = load("components/amazing-shuk/dev/ListArrivalMission.tsx");
  const missions = SHUK_MISSIONS.map(definition => ({ id: definition.id, state: "available" as const, arrivalPoints: 0, arrivalMethod: null, gpsEnabled: false }));
  const stage = renderToStaticMarkup(createElement(List, { missions, mission: missions[0], stage: "preview", guide: false, busy: false, feedback: "", mapView: null,
    onMapViewChange() {}, onSelect() {}, onDismiss() {}, onClosePreview() {}, onViewLocation() {}, onArrival() {}, onConfirm() {}, onOpenChallenge() {} }));
  assert.match(stage, /^<div class="stage"><section class="sheet " id="mission-preview"/);
});

test("location details: the pin's number without a route order, a look-for card, and food tokens but no points before play", () => {
  const Location = load("components/amazing-shuk/dev/PreviewArrivalMission.tsx");
  for (const [index, definition] of SHUK_MISSIONS.entries()) {
    const view = buildMissionPresentation(definition, { id: definition.id, state: "available", arrivalPoints: 0, arrivalMethod: null, gpsEnabled: false }, index + 1);
    const html = renderToStaticMarkup(createElement(Location, { view, guide: false, busy: false, feedback: "", ...callbacks }));
    assert.match(html, new RegExp(`class="pill">Mission ${index + 1} · Available</p>`));
    assert.doesNotMatch(html, new RegExp(`Mission ${index + 1} of`));
    assert.match(html, /class="lookFor"[^>]*><h3 id="mission-look-for" class="cardTitle"><span>Look for<\/span><\/h3>/);
    assert.ok(html.includes(escapeText(definition.clue)));
    for (const landmark of definition.location.landmarks) assert.ok(html.includes(escapeText(landmark)));
    assert.match(html, new RegExp(`Open Challenge.*\\+${definition.rewards.foodTokens} food tokens`));
    assert.doesNotMatch(html, /pts|Up to|maximum/i);
  }
});

test("an approved photo replaces the gap notice in the preview and location view, under the base path, with its alt text", () => {
  const Card = load("components/amazing-shuk/dev/PreviewMissionCard.tsx");
  const Location = load("components/amazing-shuk/dev/PreviewArrivalMission.tsx");
  // A stand-in path, so the test checks the wiring rather than a particular asset.
  const definition = { ...GAN_HATUT_MISSION, photo: { src: "/shuk/example-location.jpg", alt: "Example location" }, cluePhoto: null };
  const view = buildMissionPresentation(definition, { id: definition.id, state: "available", arrivalPoints: 0, arrivalMethod: null, gpsEnabled: false }, 1);
  for (const html of [renderToStaticMarkup(createElement(Card, { view, onViewLocation() {}, onClose() {} })),
    renderToStaticMarkup(createElement(Location, { view, guide: false, busy: false, feedback: "", ...callbacks }))]) {
    assert.match(html, /alt="Example location"/);
    assert.match(html, /memory-protocol%2Fshuk%2Fexample-location\.jpg/);
    assert.doesNotMatch(html, /Reference photograph not yet available/);
  }
  // Without a photo, both views fall back to the notice.
  const bare = buildMissionPresentation({ ...definition, photo: null }, { id: definition.id, state: "available", arrivalPoints: 0, arrivalMethod: null, gpsEnabled: false }, 1);
  assert.match(renderToStaticMarkup(createElement(Card, { view: bare, onViewLocation() {}, onClose() {} })), /Reference photograph not yet available/);
  assert.match(renderToStaticMarkup(createElement(Location, { view: bare, guide: false, busy: false, feedback: "", ...callbacks })), /Reference photograph not yet available/);
});

test("location details orient without spoilers: the mural view names the confirmed corner but no answers", () => {
  const Location = load("components/amazing-shuk/dev/PreviewArrivalMission.tsx");
  const view = buildMissionPresentation(MURAL_MISSION, { id: MURAL_MISSION.id, state: "available", arrivalPoints: 0, arrivalMethod: null, gpsEnabled: true }, 2);
  const html = renderToStaticMarkup(createElement(Location, { view, guide: false, busy: false, feedback: "", ...callbacks }));
  assert.match(html, /HaRav Shmuel Baruch/); assert.match(html, /Agripas Street/);
  assert.doesNotMatch(html, /air vents|plaque|treble|cardboard|bicycle|laundry|antenna|mural-before/i);
});

test("guide action is shown only for guide; completed state has an explicit label and symbol", () => {
  const Preview = load("components/amazing-shuk/dev/PreviewArrivalMission.tsx");
  const available = buildMissionPresentation(GAN_HATUT_MISSION, { id: GAN_HATUT_MISSION.id, state: "available", arrivalPoints: 0, arrivalMethod: null, gpsEnabled: false }, 1);
  const html = renderToStaticMarkup(createElement(Preview, { view: available, selected: true, guide: true, busy: false, feedback: "", ...callbacks }));
  assert.match(html, /Confirm Group Arrival/); assert.doesNotMatch(html, /disabled/);
  const completed = buildMissionPresentation(GAN_HATUT_MISSION, { id: GAN_HATUT_MISSION.id, state: "completed", arrivalPoints: 0, arrivalMethod: null, gpsEnabled: false }, 1);
  assert.equal(completed.marker.symbol, "\u2713"); assert.match(completed.marker.ariaLabel, /Completed/);
  assert.equal(completed.marker.size, 48);
});

test("actual selected mission renders existing story and playable challenge for every GPS status", () => {
  for (const state of ["available", "arrived", "completed"] as MissionState[]) {
    const mission = { id: GAN_HATUT_MISSION.id, state, arrivalPoints: 0, arrivalMethod: null, gpsEnabled: false };
    const server = { session: createDevWaterSession(), missions: [mission], mission,
      performance: { started: false, hintsUsed: 0, canStart: true, reward: null }, sharedBalance: { points: 0, foodTokens: 0 } };
    // Simulate authenticated, selected UI. Busy booleans also true: even an in-flight GPS check cannot hide content.
    const react = { ...nativeRequire("react"), useState: (initial: unknown) => [initial === null ? server : initial === false ? true : initial, () => {}],
      useEffect() {}, useRef: (value: unknown) => ({ current: value }), useMemo: (factory: () => unknown) => factory(), useCallback: (fn: unknown) => fn };
    // Open the challenge stage directly: the journey's first stage is "map".
    const stateFor = react.useState;
    react.useState = (initial: unknown) => initial && typeof initial === "object" && "stage" in initial ? [{ ...initial, stage: "challenge" }, () => {}] : stateFor(initial);
    const Index = load("components/amazing-shuk/dev/IndexWaterTask.tsx", react);
    const html = renderToStaticMarkup(createElement(Index, { mode: "dev" }));
    assert.match(html, /THE STORY OF THE WELL/); assert.match(html, /Start challenge/);
    assert.match(html, /Local development only/);
    // The protected app plays the same challenge without the development panel.
    const app = renderToStaticMarkup(createElement(Index, { mode: "app" }));
    assert.match(app, /THE STORY OF THE WELL/); assert.doesNotMatch(app, /Local development|local simulation/i);
    assert.match(html, /3 L/); assert.match(html, /5 L/); assert.match(html, /4 L/);
    assert.doesNotMatch(html, /Here!|role="timer"/);
  }
});
