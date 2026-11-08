import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createRequire } from "node:module";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";
import { buildMissionPresentation, destinationTitle, GAN_HATUT_MISSION, missionStage, missionStageLine, previewDestinationTitle, type MissionState } from "./mission-arrival.ts";
import { SHUK_MISSIONS } from "./missions.ts";
import { MURAL_MISSION } from "./mural-task.ts";
// React escapes ' and " in text; compare against the escaped form.
const escapeText = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&#x27;").replace(/"/g, "&quot;");
import { createDevWaterSession } from "./dev-water-session.ts";
import { LOCATION_UNAVAILABLE_MESSAGE } from "./request-arrival-location.ts";
const nativeRequire = createRequire(import.meta.url);
// `mocks` stands in for chosen imports (by specifier), e.g. a map that prints the markers it was given.
function load(path: string, reactOverride?: object, mocks: Record<string, ComponentType<Record<string, unknown>>> = {}): ComponentType<Record<string, unknown>> {
  const output = ts.transpileModule(readFileSync(resolve(path), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText;
  const exports: { default?: ComponentType<Record<string, unknown>> } = {};
  const localRequire = (id: string) => {
    if (id === "react" && reactOverride) return reactOverride;
    if (id.endsWith(".scss")) return { __esModule: true, default: new Proxy({}, { get: (_, key) => String(key) }) };
    if (id === "@/components/icons") return { Icon: () => null };
    if (mocks[id]) return { __esModule: true, default: mocks[id] };
    // Map/browser and identity subtrees are outside this static content/access test.
    if (["@/components/map/LeafletBaseMap", "@/components/amazing-shuk/IndexParticipantMenu", "@/components/amazing-shuk/ListParticipantBadges", "./IndexGuideWaterTask"].includes(id)) return { __esModule: true, default: () => null };
    // <Picture> (components/media) has its own test (lib/media); here it stands in as what it renders for a path outside the image
    // manifest: a plain <img> under the base path.
    if (id === "@/components/media/Picture") return { __esModule: true, default: ({ src, ...props }: Record<string, unknown>) =>
      nativeRequire("react").createElement("img", { loading: "lazy", ...props, src: nativeRequire(resolve("lib/base-path.ts")).BASE_PATH + String(src) }) };
    if (id.startsWith("@/lib/")) return nativeRequire(resolve(id.replace("@/", "") + ".ts"));
    if (id.startsWith("@/components/")) return { __esModule: true, default: load(id.replace("@/", "") + ".tsx", reactOverride, mocks) };
    if (id.startsWith("./") || id.startsWith("../")) return { __esModule: true, default: load(resolve(dirname(path), id + ".tsx"), reactOverride, mocks) };
    return nativeRequire(id);
  };
  new Function("require", "exports", output)(localRequire, exports);
  assert.ok(exports.default); return exports.default;
}
const callbacks = { stage: "find", onArrival() {}, onConfirm() {}, onOpenChallenge() {} };

test("mission preview uses Check our location and ordinary GPS uncertainty has no failure screen", () => {
  const Preview = load("components/amazing-shuk/dev/PreviewArrivalMission.tsx");
  for (const state of ["available", "arrived", "completed"] as const) {
    const view = buildMissionPresentation(GAN_HATUT_MISSION, { id: GAN_HATUT_MISSION.id, state, arrivalPoints: state === "available" ? 0 : 20, arrivalMethod: null, gpsEnabled: true }, 1);
    const html = renderToStaticMarkup(createElement(Preview, { view, selected: true, guide: false, busy: false, feedback: LOCATION_UNAVAILABLE_MESSAGE, ...callbacks }));
    assert.match(html, /Check our location/); assert.doesNotMatch(html, /We&#x27;re Here|Here!|role="alert"|latitude|longitude|timer|countdown/);
    assert.match(html, /play without checking/);
    assert.match(html, /gan-hatut-gate\.jpg/); assert.match(html, /gan-hatut-cistern\.jpg/); assert.match(html, /Montefiore Testimonial/);
    assert.doesNotMatch(html, /Confirm Group Arrival/);
    // The Map tab and the phone's Back lead to the map; the screen has no Back to map of its own.
    assert.match(html, /Open Challenge/); assert.doesNotMatch(html, /Back to map/);
    assert.match(html, /Finding the place/);
    assert.match(html, /Landmarks/); assert.match(html, /lang="he"/);
  }
});

test("find this place reads in order for every mission: progress, strip, clue, photo, landmarks, about, location check, then Open Challenge", () => {
  const Preview = load("components/amazing-shuk/dev/PreviewArrivalMission.tsx");
  for (const [index, definition] of SHUK_MISSIONS.entries()) {
    const view = buildMissionPresentation(definition, { id: definition.id, state: "available", arrivalPoints: 0, arrivalMethod: null, gpsEnabled: true }, index + 1);
    const html = renderToStaticMarkup(createElement(Preview, { view, guide: false, busy: false, feedback: "", ...callbacks, map: createElement("div", { id: "strip" }) }));
    // The heading stays for screen readers, though the header shows "Find …".
    assert.ok(html.includes(`<h2 id="mission-location-title" class="srOnly">${escapeText(definition.name)}</h2>`), definition.id);
    const at = (text: string) => { const i = html.indexOf(text); assert.ok(i >= 0, `${definition.id}: ${text}`); return i; };
    // Find the photo by its file name.
    const photo = definition.photo ? at(definition.photo.src.split("/").pop()!) : at("Reference photograph not yet available");
    const order = [at("Finding the place"), at('id="strip"'), at("What to look for"), at(escapeText(definition.clue)), photo, at("Landmarks"), at("About this place"), at("Check our location"), at("Open Challenge")];
    assert.deepEqual(order, [...order].sort((a, b) => a - b), `${definition.id} order`);
    // Landmarks (which carry how to behave at the stop) are always visible; only the summary is folded away.
    for (const landmark of definition.location.landmarks) assert.ok(html.includes(`<li>${escapeText(landmark)}</li>`), `${definition.id} landmark`);
    assert.match(html, new RegExp(`<details class="about"><summary class="aboutToggle">About this place</summary><p>${escapeText(definition.location.summary).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}</p></details>`));
  }
});

test("first tap shows the destination as a task: Find … (short form), the challenge's name, summary, one stage line and Find this place, but no story or answers", () => {
  const Card = load("components/amazing-shuk/dev/PreviewMissionCard.tsx");
  for (const [index, definition] of SHUK_MISSIONS.entries()) {
    const view = buildMissionPresentation(definition, { id: definition.id, state: "available", arrivalPoints: 0, arrivalMethod: null, gpsEnabled: false }, index + 1);
    const html = renderToStaticMarkup(createElement(Card, { view, stage: "find", onViewLocation() {}, onClose() {} }));
    assert.ok(html.includes(`>${escapeText(previewDestinationTitle(definition))}</h2>`), definition.id);
    assert.ok(html.includes(escapeText(definition.title)) && html.includes(escapeText(definition.location.summary)));
    assert.match(html, /Find this place/); assert.doesNotMatch(html, /View Location|Available/); assert.match(html, /aria-label="Close preview"/);
    // The pill repeats the tapped pin's number; beside it, only the current stage, in words (the three steps are on the location).
    assert.match(html, new RegExp(`class="pill pillActive">Mission ${index + 1}</p><p class="compact stage"><span class="srOnly">Mission progress: </span>1 of 3 · Finding the place</p>`));
    assert.doesNotMatch(html, /aria-current="step"/);
    assert.doesNotMatch(html, /STORY|Start challenge|spot TWO things|air vents|plaque|treble|Here\?/i);
    // Compact by decision: no Hebrew name, no rewards and no drag notch on the first tap.
    assert.doesNotMatch(html, /lang="he"|food tokens|pts|points|notch/i);
  }
});

test("the preview keeps Find this place in its own action row outside the scrolling body, with a thumbnail, inside the map stage", () => {
  const Card = load("components/amazing-shuk/dev/PreviewMissionCard.tsx");
  const view = buildMissionPresentation(GAN_HATUT_MISSION, { id: GAN_HATUT_MISSION.id, state: "available", arrivalPoints: 0, arrivalMethod: null, gpsEnabled: false }, 1);
  const html = renderToStaticMarkup(createElement(Card, { view, stage: "find", onViewLocation() {}, onClose() {} }));
  // Three rows in order: the pill and close button, the body (title, place, teaser), then the action.
  assert.match(html, /<div class="top">.*Close preview.*<\/div><div class="body"><h2 id="mission-preview-title".*<\/div><div class="action"><button[^>]*><span>Find this place<\/span>/);
  assert.doesNotMatch(html.slice(html.indexOf('class="body"'), html.indexOf('class="action"')), /Find this place/);
  assert.match(html, /class="thumb"/); assert.match(html, /sizes="4rem"/);
  // The map and the sheet share one stage, so the sheet can overlap the map's lower edge.
  const List = load("components/amazing-shuk/dev/ListArrivalMission.tsx");
  const missions = SHUK_MISSIONS.map(definition => ({ id: definition.id, state: "available" as const, arrivalPoints: 0, arrivalMethod: null, gpsEnabled: false }));
  const stage = renderToStaticMarkup(createElement(List, { missions, mission: missions[0], stage: "preview", progress: "find", guide: false, busy: false, feedback: "", mapView: null,
    onMapViewChange() {}, onSelect() {}, onDismiss() {}, onClosePreview() {}, onViewLocation() {}, onArrival() {}, onConfirm() {}, onOpenChallenge() {} }));
  assert.match(stage, /^<div class="stage"><section class="sheet " id="mission-preview"/);
});

test("location details: the pin's number without a route order, a look-for card, and food tokens but no points before play", () => {
  const Location = load("components/amazing-shuk/dev/PreviewArrivalMission.tsx");
  for (const [index, definition] of SHUK_MISSIONS.entries()) {
    const view = buildMissionPresentation(definition, { id: definition.id, state: "available", arrivalPoints: 0, arrivalMethod: null, gpsEnabled: false }, index + 1);
    const html = renderToStaticMarkup(createElement(Location, { view, guide: false, busy: false, feedback: "", ...callbacks }));
    assert.match(html, new RegExp(`class="pill">Mission ${index + 1}</p>`));
    assert.doesNotMatch(html, new RegExp(`Mission ${index + 1} of`));
    assert.match(html, /class="lookFor"[^>]*><h3 id="mission-look-for" class="cardTitle"><span>What to look for<\/span><\/h3>/);
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
  for (const html of [renderToStaticMarkup(createElement(Card, { view, stage: "find", onViewLocation() {}, onClose() {} })),
    renderToStaticMarkup(createElement(Location, { view, guide: false, busy: false, feedback: "", ...callbacks }))]) {
    assert.match(html, /alt="Example location"/);
    // <Picture> (the image pipeline): the path under the base path, never through /_next/image.
    assert.match(html, /src="\/memory-protocol\/shuk\/example-location\.jpg"/);
    assert.doesNotMatch(html, /Reference photograph not yet available/);
  }
  // Without a photo, both views fall back to the notice.
  const bare = buildMissionPresentation({ ...definition, photo: null }, { id: definition.id, state: "available", arrivalPoints: 0, arrivalMethod: null, gpsEnabled: false }, 1);
  assert.match(renderToStaticMarkup(createElement(Card, { view: bare, stage: "find", onViewLocation() {}, onClose() {} })), /Reference photograph not yet available/);
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
    // Open the well's challenge stage directly: the journey starts on the map, at marker 1.
    const stateFor = react.useState;
    react.useState = (initial: unknown) => initial && typeof initial === "object" && "stage" in initial ? [{ ...initial, stage: "challenge", missionId: GAN_HATUT_MISSION.id }, () => {}] : stateFor(initial);
    const Index = load("components/amazing-shuk/dev/IndexWaterTask.tsx", react);
    const html = renderToStaticMarkup(createElement(Index, { mode: "dev" }));
    assert.match(html, /THE STORY OF THE WELL/); assert.match(html, /Start challenge/);
    // UX-4 (owner, 2 Nov 2026): no Back buttons on the challenge; the phone's Back and the Map tab lead away.
    assert.doesNotMatch(html, /Back to location|Back to map/);
    assert.match(html, /Local development only/);
    // The protected app plays the same challenge without the development panel.
    const app = renderToStaticMarkup(createElement(Index, { mode: "app" }));
    assert.match(app, /THE STORY OF THE WELL/); assert.doesNotMatch(app, /Local development|local simulation/i);
    // UX-3: before the accepted Start the story and Start show, not the puzzle or its containers.
    assert.doesNotMatch(html, /3 L \/|5 L \/|Fill your family/);
    assert.doesNotMatch(html, /Here!|role="timer"/);
  }
});

test("mission progress comes from shared state and the challenge screen, never from an arrival", () => {
  for (const state of ["available", "arrived"] as const) {
    assert.equal(missionStage({ state, started: false, onChallenge: false }), "find", `${state} stays on finding the place`);
    assert.equal(missionStage({ state, started: true, onChallenge: false }), "solve");
    assert.equal(missionStage({ state, started: false, onChallenge: true }), "solve");
  }
  assert.equal(missionStage({ state: "completed", started: false, onChallenge: false }), "complete");
  assert.equal(missionStage({ state: "completed", started: true, onChallenge: true }), "complete");
  assert.equal(destinationTitle("The Montefiore Gate"), "Find the Montefiore Gate");
  assert.equal(destinationTitle("Rabbi Aryeh Levin's Home"), "Find Rabbi Aryeh Levin's Home");
  // The card's short form uses the mission's own short name only where it ends the full name; otherwise the full name.
  assert.equal(previewDestinationTitle({ name: "The Mahane Yehuda Market Mural", shortName: "Market Mural" }), "Find the Market Mural");
  assert.equal(previewDestinationTitle({ name: "The Montefiore Gate", shortName: "Montefiore Gate" }), "Find the Montefiore Gate");
  assert.equal(previewDestinationTitle({ name: "Rabbi Aryeh Levin's Home", shortName: "Rabbi Aryeh Levin" }), "Find Rabbi Aryeh Levin's Home");
  assert.equal(previewDestinationTitle({ name: "Marzipan Bakery", shortName: "Marzipan" }), "Find Marzipan Bakery");
  assert.equal(previewDestinationTitle({ name: "Gan HaTut (Mulberry Garden)", shortName: "Gan HaTut" }), "Find Gan HaTut (Mulberry Garden)");
  assert.equal(missionStageLine("find"), "1 of 3 \u00b7 Finding the place");
  assert.equal(missionStageLine("solve"), "2 of 3 \u00b7 Challenge in progress");
  assert.equal(missionStageLine("complete"), "3 of 3 \u00b7 Mission complete");
});

test("the map notice folds behind a named info button on the Shuk maps, and stays a plain notice elsewhere", () => {
  // Leaflet's stylesheet has no loader here; Leaflet itself loads in an effect, which a static render never runs.
  const Map = load("components/map/LeafletBaseMap.tsx", undefined, { "leaflet/dist/leaflet.css": () => null });
  const base = { baseMap: { src: "/m.png", width: 10, height: 10 }, alt: "Map", markers: [], selectedId: null, memoryLayers: [], attribution: null,
    notice: "Approximate markers.", onSelect() {}, onBackground() {} };
  const folding = renderToStaticMarkup(createElement(Map, { ...base, noticeToggleLabel: "About this map" }));
  assert.match(folding, /<button type="button" class="noticeToggle" aria-label="About this map" aria-expanded="true" aria-controls="[^"]+-notice">/);
  assert.match(folding, /<p id="[^"]+-notice" class="noticeText">Approximate markers\.<\/p>/);
  const plain = renderToStaticMarkup(createElement(Map, base));
  assert.match(plain, /<p class="notice">Approximate markers\.<\/p>/); assert.doesNotMatch(plain, /noticeToggle/);
});

test("the progress line marks each step in words and shape, not colour alone", () => {
  const Progress = load("components/amazing-shuk/PreviewMissionProgress.tsx");
  const solve = renderToStaticMarkup(createElement(Progress, { stage: "solve" }));
  assert.match(solve, /aria-label="Mission progress"/);
  assert.match(solve, /Find the Place \(done\)/); assert.match(solve, /aria-current="step"[^>]*>.*Solve the Challenge \(current\)/);
  assert.match(solve, /Mission Complete<\/span>/); assert.match(solve, /Challenge in progress/);
  assert.equal((solve.match(/aria-current/g) ?? []).length, 1);
  const complete = renderToStaticMarkup(createElement(Progress, { stage: "complete" }));
  assert.equal((complete.match(/\(done\)/g) ?? []).length, 3); assert.match(complete, /Mission complete<\/p>/);
  assert.doesNotMatch(solve + complete, /location|GPS|arriv/i);
});

test("find this place shows a strip of the illustrated map with only the selected marker, two-finger mode on", () => {
  const seen: Record<string, unknown>[] = [];
  const map = (props: Record<string, unknown>) => { seen.push(props); return createElement("div", { id: "map" }); };
  const List = load("components/amazing-shuk/dev/ListArrivalMission.tsx", undefined, { "@/components/map/LeafletBaseMap": map });
  const missions = SHUK_MISSIONS.map(definition => ({ id: definition.id, state: "available" as const, arrivalPoints: 0, arrivalMethod: null, gpsEnabled: false }));
  const props = { missions, mission: missions[1], progress: "find", guide: false, busy: false, feedback: "", mapView: null,
    onMapViewChange() {}, onSelect() {}, onDismiss() {}, onClosePreview() {}, onViewLocation() {}, onArrival() {}, onConfirm() {}, onOpenChallenge() {} };
  const html = renderToStaticMarkup(createElement(List, { ...props, stage: "location" }));
  assert.match(html, /id="mission-location"/); assert.match(html, /id="map"/);
  const strip = seen.at(-1)!;
  assert.deepEqual((strip.markers as { id: string }[]).map(marker => marker.id), [missions[1].id]);
  assert.equal(strip.focusId, missions[1].id); assert.equal(strip.twoFingerHint, "Use two fingers to move the map.");
  assert.equal(strip.onViewChange, undefined, "the strip never overwrites the Map tab's saved view");
  // The Map tab still shows every marker.
  renderToStaticMarkup(createElement(List, { ...props, stage: "map" }));
  assert.equal((seen.at(-1)!.markers as unknown[]).length, SHUK_MISSIONS.length);
});

test("the reference photo enlarges in a closed-by-default sheet, and the location screen keeps its free help visible", () => {
  const Location = load("components/amazing-shuk/dev/PreviewArrivalMission.tsx");
  const view = buildMissionPresentation(GAN_HATUT_MISSION, { id: GAN_HATUT_MISSION.id, state: "available", arrivalPoints: 0, arrivalMethod: null, gpsEnabled: true }, 3);
  const html = renderToStaticMarkup(createElement(Location, { view, guide: false, busy: false, feedback: "", ...callbacks }));
  assert.ok(html.includes(`aria-label="Enlarge the photo: ${escapeText(GAN_HATUT_MISSION.photo!.alt)}" aria-haspopup="dialog"`));
  assert.match(html, /<dialog class="sheet" aria-labelledby="[^"]+"><div class="panel">/);
  assert.match(html, /<div class="body"><\/div>/, "nothing loads in the sheet until it opens");
  assert.match(html, /aria-label="Close photo"/);
  assert.match(html, /lang="he"/); assert.match(html, /class="rtl hebrew"/);
  assert.doesNotMatch(html, /points|hint/i);
});

test("guide tools split by place: role assignment with the group, the timing review with the challenge", () => {
  const Guide = load("components/amazing-shuk/dev/IndexGuideWaterTask.tsx");
  const base = { participants: [{ id: "player-1", name: "Ari" }], missionId: GAN_HATUT_MISSION.id, roles: { navigator: null, answerSubmitter: null },
    completed: false, busy: false, onAction() {} };
  const timing = { startedAt: 1, solvedAt: null, stoppedElapsedMs: null, excluded: false, paused: false };
  const roles = renderToStaticMarkup(createElement(Guide, { ...base, part: "roles", timing }));
  assert.match(roles, /Assign navigator/); assert.match(roles, /Assign answer-submitter/); assert.doesNotMatch(roles, /Timing review/);
  const review = renderToStaticMarkup(createElement(Guide, { ...base, part: "timing", timing }));
  assert.match(review, /Timing review/); assert.doesNotMatch(review, /Assign/);
  assert.equal(renderToStaticMarkup(createElement(Guide, { ...base, part: "timing" })), "", "no timing section before a challenge starts");
});

test("the guide sees role selects only on the Group tab and the timing review only on the challenge", () => {
  const mission = { id: GAN_HATUT_MISSION.id, state: "available" as const, arrivalPoints: 0, arrivalMethod: null, gpsEnabled: false };
  const server = { session: { ...createDevWaterSession(), activeActorId: "guide" }, missions: [mission], mission,
    performance: { started: true, hintsUsed: 0, canStart: true, reward: null }, sharedBalance: { points: 0, foodTokens: 0 },
    guideTiming: { startedAt: 1, solvedAt: null, stoppedElapsedMs: null, excluded: false, paused: false } };
  const render = (screen: Record<string, unknown>) => {
    const react = { ...nativeRequire("react"), useState: (initial: unknown) => [initial === null ? server
      : initial && typeof initial === "object" && "stage" in initial ? { ...initial, missionId: GAN_HATUT_MISSION.id, ...screen } : initial, () => {}],
    useEffect() {}, useRef: (value: unknown) => ({ current: value }), useMemo: (factory: () => unknown) => factory(), useCallback: (fn: unknown) => fn };
    const Index = load("components/amazing-shuk/dev/IndexWaterTask.tsx", react, {
      "./IndexGuideWaterTask": (props: Record<string, unknown>) => createElement("p", null, `guide-tools:${String(props.part)}`),
      "./ListArrivalMission": () => null });
    return renderToStaticMarkup(createElement(Index, { mode: "app" }));
  };
  for (const stage of ["map", "preview", "location"]) assert.doesNotMatch(render({ area: "journey", stage }), /guide-tools/, stage);
  assert.doesNotMatch(render({ area: "food", stage: "map" }), /guide-tools/);
  const group = render({ area: "group", stage: "map" });
  assert.match(group, /guide-tools:roles/); assert.doesNotMatch(group, /guide-tools:timing/);
  const challenge = render({ area: "journey", stage: "challenge" });
  assert.match(challenge, /guide-tools:timing/); assert.doesNotMatch(challenge, /guide-tools:roles/);
  // The challenge shows its stage; a started challenge is "in progress" on every phone.
  assert.match(challenge, /Challenge in progress/);
});

test("group button: a count of free roles on the button (no banner row), and a short sheet of real shared state only", () => {
  const props = { participants: [{ id: "a", name: "Ari" }, { id: "b", name: "Bea" }], currentId: "b",
    missions: [{ state: "completed" }, { state: "available" }], balance: { points: 120, foodTokens: 4 }, onOpenGroupTab() {} };
  const Closed = load("components/amazing-shuk/IndexGroupSheet.tsx");
  const free = renderToStaticMarkup(createElement(Closed, { ...props, roles: { navigator: "a", answerSubmitter: null } }));
  assert.match(free, /aria-label="Group status: 1 role needed" aria-haspopup="dialog"><span class="count" aria-hidden="true">1<\/span>/);
  assert.doesNotMatch(free, /Roles needed/, "no banner row under the header");
  const none = renderToStaticMarkup(createElement(Closed, { ...props, roles: { navigator: null, answerSubmitter: null } }));
  assert.match(none, /aria-label="Group status: 2 roles needed"/);
  assert.doesNotMatch(free, /Group points/, "the sheet's content waits until it opens");
  const filled = renderToStaticMarkup(createElement(Closed, { ...props, roles: { navigator: "a", answerSubmitter: "b" } }));
  assert.doesNotMatch(filled, /class="count"/); assert.match(filled, /aria-label="Group status"/);
  // Open: points, tokens and missions from the shared balance, the role chips, the way to the Group tab. Nothing invented.
  const openReact = { ...nativeRequire("react"), useState: (initial: unknown) => [initial === false ? true : initial, () => {}] };
  const Open = load("components/amazing-shuk/IndexGroupSheet.tsx", openReact);
  const html = renderToStaticMarkup(createElement(Open, { ...props, roles: { navigator: "a", answerSubmitter: null } }));
  assert.match(html, /<dt>Points<\/dt><dd>120<\/dd>/); assert.match(html, /<dt>Food tokens<\/dt><dd>4<\/dd>/);
  assert.match(html, /<dt>Missions<\/dt><dd>1 of 2<\/dd>/);
  assert.match(html, /Answer-submitter: free/); assert.match(html, /Anyone can take a free role in the Group tab\./);
  assert.match(html, /Open the Group tab/); assert.match(html, /aria-label="Close group status"/);
  assert.doesNotMatch(html, /Team [A-Z]|deduct|penalt|synced|online|nearby|distance|minutes/i);  // Every role taken: no claim line and no link (the Group tab is in the bottom bar).
  const full = renderToStaticMarkup(createElement(Open, { ...props, roles: { navigator: "a", answerSubmitter: "b" } }));
  assert.doesNotMatch(full, /Anyone can take|Open the Group tab|: free/);
});

test("\"We're here\" (D6): shown only to players who may confirm, with personal wording for a solo player", () => {
  const Location = load("components/amazing-shuk/dev/PreviewArrivalMission.tsx");
  // The same component with every sheet open, to read the confirmation (a closed sheet renders nothing).
  const Opened = load("components/amazing-shuk/dev/PreviewArrivalMission.tsx", { ...nativeRequire("react"), useState: (initial: unknown) => [initial === false ? true : initial, () => {}] });
  const view = (state: MissionState, arrivalPoints: number) => buildMissionPresentation(MURAL_MISSION,
    { id: MURAL_MISSION.id, state, arrivalPoints, arrivalMethod: arrivalPoints ? "self" : null, gpsEnabled: true }, 1);
  const render = (Component: ComponentType<Record<string, unknown>>, props: Record<string, unknown>) => renderToStaticMarkup(createElement(Component,
    { view: view("available", 0), guide: false, busy: false, feedback: "", onSelfArrive() {}, ...callbacks, ...props }));
  // A follower sees only the optional location check.
  assert.doesNotMatch(render(Location, { canSelfArrive: false, solo: false }), />We&#x27;re here<|>I&#x27;m here</);
  // A navigator gets "We're here", which opens a confirmation instead of recording arrival at once.
  assert.match(render(Location, { canSelfArrive: true, solo: false }), /aria-haspopup="dialog"[^>]*>(<span[^>]*><\/span>)?(<span>)?We&#x27;re here/);
  const confirm = render(Opened, { canSelfArrive: true, solo: false });
  assert.ok(confirm.includes(escapeText(`Are you at ${MURAL_MISSION.name}?`)));
  assert.match(confirm, /Yes, we&#x27;re here.*Not yet/);
  // Solo: "I'm here" and "Yes, I'm here"; once arrived, the approved "You've made it!" and no button.
  assert.match(render(Location, { canSelfArrive: true, solo: true }), />I&#x27;m here</);
  assert.match(render(Opened, { canSelfArrive: true, solo: true }), /Yes, I&#x27;m here/);
  const done = render(Location, { view: view("arrived", 20), canSelfArrive: true, solo: true });
  assert.match(done, /You&#x27;ve made it! 20 arrival points earned\./);
  assert.doesNotMatch(done, />I&#x27;m here</);
  assert.match(render(Location, { view: view("arrived", 20), canSelfArrive: true, solo: false }), /Group arrival confirmed! 20 arrival points earned\./);
});

test("group sheet for a solo player: titled \"Playing solo\", balance only, no role section or count", () => {
  const openReact = { ...nativeRequire("react"), useState: (initial: unknown) => [initial === false ? true : initial, () => {}] };
  const Open = load("components/amazing-shuk/IndexGroupSheet.tsx", openReact);
  const html = renderToStaticMarkup(createElement(Open, { participants: [{ id: "a", name: "Ari" }], currentId: "a", solo: true,
    roles: { navigator: "a", answerSubmitter: "a" }, missions: [{ state: "available" }], balance: { points: 20, foodTokens: 0 }, onOpenGroupTab() {} }));
  assert.match(html, /Playing solo/);
  assert.match(html, /<dt>Points<\/dt><dd>20<\/dd>/);
  assert.doesNotMatch(html, /Your group|group-sheet-roles|class="count"|Open the Group tab/);
});
