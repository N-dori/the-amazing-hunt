import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createRequire } from "node:module";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";
import { buildMissionPresentation, GAN_HATUT_MISSION, type MissionState } from "./mission-arrival.ts";
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
    if (["@/components/map/LeafletBaseMap", "@/components/amazing-shuk/ListParticipantIdentity", "./IndexGuideWaterTask"].includes(id)) return { __esModule: true, default: () => null };
    if (id.startsWith("@/lib/")) return nativeRequire(resolve(id.replace("@/", "") + ".ts"));
    if (id.startsWith("@/components/")) return { __esModule: true, default: load(id.replace("@/", "") + ".tsx", reactOverride) };
    if (id.startsWith("./")) return { __esModule: true, default: load(resolve(dirname(path), id + ".tsx"), reactOverride) };
    return nativeRequire(id);
  };
  new Function("require", "exports", output)(localRequire, exports);
  assert.ok(exports.default); return exports.default;
}
const callbacks = { onSelect() {}, onArrival() {}, onConfirm() {} };

test("mission preview uses We're Here? and ordinary GPS uncertainty has no failure screen", () => {
  const Preview = load("components/amazing-shuk/dev/PreviewArrivalMission.tsx");
  for (const state of ["available", "arrived", "completed"] as const) {
    const view = buildMissionPresentation({ id: GAN_HATUT_MISSION.id, state, arrivalPoints: state === "available" ? 0 : 20, arrivalMethod: null, gpsEnabled: true });
    const html = renderToStaticMarkup(createElement(Preview, { view, selected: true, guide: false, busy: false, feedback: LOCATION_UNAVAILABLE_MESSAGE, ...callbacks }));
    assert.match(html, /Here\?/); assert.doesNotMatch(html, /Here!|role="alert"|latitude|longitude|timer|countdown/);
    assert.match(html, /play without checking/); assert.match(html, /Reference photograph not yet available/);
    assert.doesNotMatch(html, /Confirm Group Arrival/);
  }
});

test("guide action is shown only for guide; completed state has an explicit label and symbol", () => {
  const Preview = load("components/amazing-shuk/dev/PreviewArrivalMission.tsx");
  const available = buildMissionPresentation({ id: GAN_HATUT_MISSION.id, state: "available", arrivalPoints: 0, arrivalMethod: null, gpsEnabled: false });
  const html = renderToStaticMarkup(createElement(Preview, { view: available, selected: true, guide: true, busy: false, feedback: "", ...callbacks }));
  assert.match(html, /Confirm Group Arrival/); assert.doesNotMatch(html, /disabled/);
  const completed = buildMissionPresentation({ id: GAN_HATUT_MISSION.id, state: "completed", arrivalPoints: 0, arrivalMethod: null, gpsEnabled: false });
  assert.equal(completed.marker.symbol, "\u2713"); assert.match(completed.marker.ariaLabel, /Completed/);
  assert.equal(completed.marker.size, 48);
});

test("actual selected mission renders existing story and playable challenge for every GPS status", () => {
  for (const state of ["available", "arrived", "completed"] as MissionState[]) {
    const server = { session: createDevWaterSession(), mission: { id: GAN_HATUT_MISSION.id, state, arrivalPoints: 0, arrivalMethod: null, gpsEnabled: false },
      performance: { started: false, hintsUsed: 0, canStart: true, reward: null }, sharedBalance: { points: 0, foodTokens: 0 } };
    // Simulate authenticated, selected UI. Busy booleans also true: even an in-flight GPS check cannot hide content.
    const react = { ...nativeRequire("react"), useState: (initial: unknown) => [initial === null ? server : initial === false ? true : initial, () => {}],
      useEffect() {}, useRef: (value: unknown) => ({ current: value }), useMemo: (factory: () => unknown) => factory(), useCallback: (fn: unknown) => fn };
    const Index = load("components/amazing-shuk/dev/IndexWaterTask.tsx", react);
    const html = renderToStaticMarkup(createElement(Index));
    assert.match(html, /THE STORY OF THE WELL/); assert.match(html, /Start challenge/);
    assert.match(html, /3 L/); assert.match(html, /5 L/); assert.match(html, /4 L/);
    assert.doesNotMatch(html, /Here!|role="timer"/);
  }
});
