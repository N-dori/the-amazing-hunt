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
import { MONTEFIORE_TASK, GATEWAY_YEAR, MONTEFIORE_MISSION_ID } from "./montefiore-task.ts";
import { GATEWAY_DISCOVERY, GATEWAY_VICTORY } from "./mission-completion.ts";
import { buildGatewayView } from "./gateway-view.ts";
import { emptyGatewayProgress } from "./gateway-progress.ts";
import { SYNAGOGUE_TASK } from "./synagogue-task.ts";
import { MURAL_TASK, MURAL_MISSION } from "./mural-task.ts";
// React escapes ' and " in text; compare against the escaped form.
const escapeText = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&#x27;").replace(/"/g, "&quot;");
import { createDevWaterSession } from "./dev-water-session.ts";
import { LOCATION_UNAVAILABLE_MESSAGE } from "./request-arrival-location.ts";
const nativeRequire = createRequire(import.meta.url);
function load(path: string, reactOverride?: object, overrides: Record<string, unknown> = {}): ComponentType<Record<string, unknown>> {
  const output = ts.transpileModule(readFileSync(resolve(path), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText;
  const exports: { default?: ComponentType<Record<string, unknown>> } = {};
  const localRequire = (id: string) => {
    if (Object.hasOwn(overrides, id)) return overrides[id];
    if (id === "react" && reactOverride) return reactOverride;
    if (id.endsWith(".scss")) return { __esModule: true, default: new Proxy({}, { get: (_, key) => String(key) }) };
    if (id === "@/components/icons") return { Icon: () => null };
    // Map/browser and identity subtrees are outside this static content/access test.
    if (["@/components/map/LeafletBaseMap", "@/components/amazing-shuk/IndexParticipantMenu", "@/components/amazing-shuk/ListParticipantBadges", "./IndexGuideWaterTask"].includes(id)) return { __esModule: true, default: () => null };
    if (id.startsWith("@/lib/")) return nativeRequire(resolve(id.replace("@/", "") + ".ts"));
    if (id.startsWith("@/components/")) return { __esModule: true, default: load(id.replace("@/", "") + ".tsx", reactOverride, overrides) };
    if (id.startsWith("./")) return { __esModule: true, default: load(resolve(dirname(path), id + ".tsx"), reactOverride, overrides) };
    return nativeRequire(id);
  };
  new Function("require", "exports", output)(localRequire, exports);
  assert.ok(exports.default); return exports.default;
}
const callbacks = { onArrival() {}, onConfirm() {}, onOpenChallenge() {}, onBack() {} };

test("mission preview uses We're Here? and ordinary GPS uncertainty has no failure screen", () => {
  const Preview = load("components/amazing-shuk/dev/PreviewArrivalMission.tsx");
  for (const state of ["available", "arrived", "completed"] as const) {
    const view = buildMissionPresentation(GAN_HATUT_MISSION, { id: GAN_HATUT_MISSION.id, state, arrivalPoints: state === "available" ? 0 : 20, arrivalMethod: state === "available" ? null : "gps", gpsEnabled: true }, 1);
    const html = renderToStaticMarkup(createElement(Preview, { view, selected: true, guide: false, busy: false, feedback: LOCATION_UNAVAILABLE_MESSAGE, ...callbacks }));
    if (state === "available") { assert.match(html, /Here\?/); assert.match(html, /play without checking|couldn&#x27;t check/); }
    else { assert.doesNotMatch(html, /Here\?|play without checking|couldn&#x27;t check/); assert.match(html, /Group arrival confirmed/); }
    assert.doesNotMatch(html, /Here!|role="alert"|latitude|longitude|timer|countdown/);
    assert.match(html, /gan-hatut-cistern\.jpg/); assert.doesNotMatch(html, /gan-hatut-gate|Montefiore Testimonial/);
    assert.doesNotMatch(html, /Confirm Group Arrival/);
    assert.match(html, /Open Challenge/); assert.match(html, /Back to map/);
    assert.match(html, /What to look for/); assert.doesNotMatch(html, /<h3>Landmarks|<h3>Look for/); assert.match(html, /lang="he"/);
  }
});

test("first tap shows a compact preview: title, place, summary, status and View Location, but no story or answers", () => {
  const Card = load("components/amazing-shuk/dev/PreviewMissionCard.tsx");
  for (const [index, definition] of SHUK_MISSIONS.entries()) {
    const view = buildMissionPresentation(definition, { id: definition.id, state: "available", arrivalPoints: 0, arrivalMethod: null, gpsEnabled: false }, index + 1);
    const html = renderToStaticMarkup(createElement(Card, { view, onViewLocation() {}, onClose() {} }));
    assert.ok(html.includes(escapeText(definition.title)) && html.includes(escapeText(definition.name)) && html.includes(escapeText(definition.location.summary)));
    assert.match(html, /View Location/); assert.match(html, /Available/); assert.match(html, /aria-label="Close preview"/);
    // The badge repeats the tapped pin's number, hidden from assistive tech (the status says it in words).
    assert.match(html, new RegExp(`aria-hidden="true">${index + 1}</span>`));
    assert.doesNotMatch(html, /STORY|Start challenge|spot TWO things|air vents|plaque|treble|Here\?/i);
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
  assert.doesNotMatch(html, /Confirm Group Arrival/);
  const Guide = load("components/amazing-shuk/dev/IndexGuideWaterTask.tsx");
  const guideProps = { missionId: available.id, completed: false, busy: false, onAction() {} };
  assert.match(renderToStaticMarkup(createElement(Guide, { ...guideProps, canConfirmArrival: true })), /Confirm Group Arrival/);
  assert.equal(renderToStaticMarkup(createElement(Guide, { ...guideProps, canConfirmArrival: false })), "");
  const completed = buildMissionPresentation(GAN_HATUT_MISSION, { id: GAN_HATUT_MISSION.id, state: "completed", arrivalPoints: 0, arrivalMethod: null, gpsEnabled: false }, 1);
  assert.equal(completed.marker.symbol, "\u2713"); assert.match(completed.marker.ariaLabel, /Completed/);
  assert.equal(completed.marker.size, 48);
});

test("actual selected mission renders existing story and playable challenge for every GPS status", () => {
  for (const state of ["available", "arrived", "completed"] as MissionState[]) {
    const mission = { id: GAN_HATUT_MISSION.id, state, arrivalPoints: 0, arrivalMethod: null, gpsEnabled: false };
    const server = { session: {...createDevWaterSession(),kind:"water"}, missions: [mission], mission,
      performance: { started: false, hintsUsed: 0, canStart: true, reward: null }, sharedBalance: { points: 0, foodTokens: 0 } };
    // Simulate authenticated, selected UI. Busy booleans also true: even an in-flight GPS check cannot hide content.
    const react = { ...nativeRequire("react"), useState: (initial: unknown) => [initial === null ? server : initial === false ? true : initial, () => {}],
      useEffect() {}, useRef: (value: unknown) => ({ current: value }), useMemo: (factory: () => unknown) => factory(), useCallback: (fn: unknown) => fn };
    // Open the challenge stage directly: the journey's first stage is "map".
    const stateFor = react.useState;
    react.useState = (initial: unknown) => initial && typeof initial === "object" && "stage" in initial ? [{ ...initial, stage: "challenge" }, () => {}] : stateFor(initial);
    const Index = load("components/amazing-shuk/dev/IndexWaterTask.tsx", react);
    const html = renderToStaticMarkup(createElement(Index));
    assert.match(html, /THE STORY OF THE WELL/); assert.match(html, /Start challenge/);
    assert.match(html, /3 L/); assert.match(html, /5 L/); assert.match(html, /4 L/);
    assert.doesNotMatch(html, /Here!|role="timer"/);
  }
});

test("all location definitions render a single consolidated passage without changing preview data", () => {
  const Location = load("components/amazing-shuk/dev/PreviewArrivalMission.tsx");
  for (const definition of SHUK_MISSIONS) {
    const view = buildMissionPresentation(definition, {id:definition.id,state:"available",arrivalPoints:0,arrivalMethod:null,gpsEnabled:false},1);
    const html = renderToStaticMarkup(createElement(Location,{view,busy:false,feedback:"",...callbacks}));
    assert.equal((html.match(/What to look for/g) ?? []).length,1);
    assert.ok(html.includes(escapeText(definition.location.whatToLookFor)));
    assert.doesNotMatch(html,/<h3>Landmarks|<h3>Look for/);
    assert.ok(definition.location.landmarks.length > 0);
    assert.match(html,/Open Challenge/);
  }
});
test("arrival result uses shared method including zero-point and completed arrivals; stale GPS feedback disappears", () => {
  const Location = load("components/amazing-shuk/dev/PreviewArrivalMission.tsx");
  for (const definition of SHUK_MISSIONS) for (const method of ["gps","guide"] as const) for (const points of [0,37]) for (const state of ["arrived","completed"] as const) {
    const view = buildMissionPresentation(definition,{id:definition.id,state,arrivalPoints:points,arrivalMethod:method,gpsEnabled:true},1);
    const html=renderToStaticMarkup(createElement(Location,{view,busy:true,feedback:"Old unavailable feedback",...callbacks}));
    assert.match(html,/Group arrival confirmed/); assert.ok(html.replace(/<!-- -->/g,"").includes(`+${points} arrival points earned`));
    assert.doesNotMatch(html,/Here\?|Confirm Group Arrival|Old unavailable|check if/i);
    assert.match(html,/>Open Challenge</); assert.doesNotMatch(html,/<button[^>]*disabled/);
  }
});
test("unverified coordinates and GPS uncertainty remain calm and never disable Open Challenge", () => {
  const Location=load("components/amazing-shuk/dev/PreviewArrivalMission.tsx");
  for (const gpsEnabled of [true,false]) for (const feedback of ["",LOCATION_UNAVAILABLE_MESSAGE,"Your location isn't precise enough to confirm the area. Try again if you'd like."]) {
    const view=buildMissionPresentation(GAN_HATUT_MISSION,{id:GAN_HATUT_MISSION.id,state:"available",arrivalPoints:0,arrivalMethod:null,gpsEnabled},1);
    const html=renderToStaticMarkup(createElement(Location,{view,busy:true,feedback,...callbacks}));
    assert.equal(html.includes("Here?"),gpsEnabled);
    assert.doesNotMatch(html,/role="alert"|Group arrival confirmed/);
    assert.match(html,/<button(?![^>]*disabled)[^>]*><span>Open Challenge<\/span>/);
  }
});

test("choice mission stories retain evidence metadata without player labels or Source disclosures", () => {
  const Story = load("components/amazing-shuk/dev/PreviewChoiceStory.tsx");
  for (const task of [MURAL_TASK,SYNAGOGUE_TASK]) {
    const html=renderToStaticMarkup(createElement(Story,{...task.story,instruction:task.instruction,open:true,onToggle(){}}));
    for (const paragraph of task.story.paragraphs) { assert.ok(paragraph.label); assert.ok(html.includes(escapeText(paragraph.text))); }
    assert.doesNotMatch(html, /Historical fact|Attributed tradition|Interpretation/);
    assert.ok(task.story.source.length > 0);
    assert.doesNotMatch(html,/<summary>Source|<cite/);
  }
});

test("gateway year UI hides Gregorian answer until completion, preserves roles and has no Source disclosure", () => {
  const Preview=load("components/amazing-shuk/dev/PreviewGatewayTask.tsx");
  const base={...emptyGatewayProgress(),stage:"year" as const};
  for(const role of ["follower","answerSubmitter","guide"] as const){
    const html=renderToStaticMarkup(createElement(Preview,{victory:GATEWAY_VICTORY,view:buildGatewayView(base,role,false),year:"",inscription:GATEWAY_YEAR.inscription,question:MONTEFIORE_TASK.yearQuestion,discovery:GATEWAY_DISCOVERY,hints:[],hasMoreHints:true,reward:null,feedback:"",onChange(){},onSubmit(){},onReset(){},onHint(){}}));
    assert.doesNotMatch(html,/1883|1882|5643|<summary>Source|<cite/);
    assert.match(html,/lang="he"/);assert.equal(html.includes("Submit Our Answer"),role!=="follower");
  }
  const html=renderToStaticMarkup(createElement(Preview,{victory:GATEWAY_VICTORY,view:buildGatewayView({...base,stage:"completed",yearAnswer:"1883"},"follower",false),year:"1883",inscription:GATEWAY_YEAR.inscription,question:MONTEFIORE_TASK.yearQuestion,discovery:GATEWAY_DISCOVERY,hints:[],hasMoreHints:false,reward:{points:100,foodTokens:2,hintsUsed:0},feedback:"",onChange(){},onSubmit(){},onReset(){},onHint(){}}));
  assert.match(html,/1883/);assert.match(html,/Points earned/);assert.doesNotMatch(html,/<input|Submit Our Answer/);
  assert.match(html, /You cracked the code!/);
  assert.match(html, /The secret revealed/); assert.match(html, /Year conversion/);
  assert.match(html, /5643/); assert.match(html, /1882-83/);
  assert.equal((html.match(/Explore Next Mission/g) ?? []).length, 1);
  assert.doesNotMatch(html, /Decipher the Hebrew|Gregorian year<\/label>|Clear answer|Need a hint/);
});

test("shared victory shows actual results once, including zero, and never invents legacy rewards", () => {
  const Victory = load("components/amazing-shuk/dev/PreviewMissionVictory.tsx");
  for (const reward of [{ points: 73, foodTokens: 5, hintsUsed: 2 }, { points: 0, foodTokens: 0, hintsUsed: 0 }, null]) {
    const html = renderToStaticMarkup(createElement(Victory, { ...GATEWAY_VICTORY, reward }));
    assert.equal((html.match(/Points earned/g) ?? []).length, 1);
    assert.equal((html.match(/<dt>/g) ?? []).length, 3);
    for (const value of reward ? Object.values(reward) : []) assert.ok(html.includes(`<dd>${value}</dd>`));
    assert.equal((html.match(/aria-label="Not recorded"/g) ?? []).length, reward ? 0 : 3);
    assert.match(html, /id="mission-victory-title" tabindex="-1"/);
  }
});

test("Food composition reads the actual shared balance once and keeps persistent navigation on catalogue and details", () => {
  const mission = { id: GAN_HATUT_MISSION.id, state: "available", arrivalPoints: 0, arrivalMethod: null, gpsEnabled: false };
  const server = { session: { ...createDevWaterSession(), kind: "water" }, missions: [mission], mission,
    performance: { started: false, hintsUsed: 0, canStart: true, reward: null }, sharedBalance: { points: 450, foodTokens: 21 } };
  for (const foodId of [undefined, "rugelach"]) {
    const react = { ...nativeRequire("react"), useState: (initial: unknown) => [initial === null ? server : initial && typeof initial === "object" && "stage" in initial ? { ...initial, area: "food", foodId } : initial, () => {}],
      useEffect() {}, useRef: (value: unknown) => ({ current: value }), useMemo: (factory: () => unknown) => factory(), useCallback: (fn: unknown) => fn };
    const Index = load("components/amazing-shuk/dev/IndexWaterTask.tsx", react);
    const html = renderToStaticMarkup(createElement(Index));
    assert.match(html, /<h1>Taste the Market<\/h1>/);
    assert.equal((html.match(/Group food tokens/g) ?? []).length, 1);
    assert.match(html, /<strong>21<\/strong>/);
    assert.doesNotMatch(html, /Shared group rewards|Group points|<form|<input/);
    assert.match(html, /aria-label="Game"/);
    if (foodId) assert.match(html, /Back to Food/); else assert.match(html, /Provisional tastings/);
  }
});
test("gateway challenge stage renders its own story and choices, never the well puzzle", () => {
  const mission={id:MONTEFIORE_MISSION_ID,state:"available",arrivalPoints:0,arrivalMethod:null,gpsEnabled:false};
  const server={session:{...createDevWaterSession(),kind:"gateway",gateway:emptyGatewayProgress()},missions:[mission],mission,performance:{started:false,hintsUsed:0,canStart:true,reward:null},sharedBalance:{points:0,foodTokens:0}};
  const react={...nativeRequire("react"),useState:(initial:unknown)=>[initial===null?server:initial&&typeof initial==="object"&&"stage"in initial?{...initial,missionId:MONTEFIORE_MISSION_ID,stage:"challenge"}:initial,()=>{}],useEffect(){},useRef:(value:unknown)=>({current:value}),useMemo:(factory:()=>unknown)=>factory(),useCallback:(fn:unknown)=>fn};
  const Index=load("components/amazing-shuk/dev/IndexWaterTask.tsx",react);
  const html=renderToStaticMarkup(createElement(Index));assert.match(html,/A NAME IN STONE/);assert.match(html,/Which three languages/);assert.doesNotMatch(html,/THE STORY OF THE WELL|family jar|1883|Gregorian year/);
});

test("all four challenge screens have one contextual back action and persistent Map navigation", () => {
  for (const definition of SHUK_MISSIONS) {
    const mission = { id: definition.id, state: "available", arrivalPoints: 0, arrivalMethod: null, gpsEnabled: false };
    const kind = definition.challenge.kind === "gateway" ? "gateway" : definition.challenge.kind === "choice" ? "choice" : "water";
    const server = { session: { ...createDevWaterSession(), kind, gateway: emptyGatewayProgress(), selected: [] }, missions: [mission], mission,
      performance: { started: false, hintsUsed: 0, canStart: true, reward: null }, sharedBalance: { points: 0, foodTokens: 0 } };
    const react = { ...nativeRequire("react"), useState: (initial: unknown) => [initial === null ? server : initial && typeof initial === "object" && "stage" in initial ? { ...initial, missionId: definition.id, stage: "challenge" } : initial, () => {}],
      useEffect() {}, useRef: (value: unknown) => ({ current: value }), useMemo: (factory: () => unknown) => factory(), useCallback: (fn: unknown) => fn };
    const Index = load("components/amazing-shuk/dev/IndexWaterTask.tsx", react);
    const html = renderToStaticMarkup(createElement(Index));
    assert.equal((html.match(/Back to location/g) ?? []).length, 1, definition.id);
    assert.doesNotMatch(html, /Back to map|Historical fact|Attributed tradition|<summary>Source|Explore Next Mission/);
    assert.match(html, /aria-label="Game"/); assert.match(html, /<span>Map<\/span>/);
  }
});

test("gateway year input renders the retained draft and defers to changed shared answers", () => {
  const react = { ...nativeRequire("react"), useState: (initial: unknown) => [initial, () => {}] };
  const Index = load("components/amazing-shuk/dev/IndexGatewayTask.tsx", react);
  const props = { progress: { ...emptyGatewayProgress(), stage: "year", yearAnswer: "" }, performance: { started: true, hintsUsed: 0, reward: null },
    activeRole: "answerSubmitter", busy: false, feedback: "", draft: { base: "", value: "188" }, onDraftChange() {}, onAction() {} };
  assert.match(renderToStaticMarkup(createElement(Index, props)), /value="188"/);
  assert.match(renderToStaticMarkup(createElement(Index, { ...props, progress: { ...props.progress, yearAnswer: "1882" } })), /value="1882"/);
});


test("every completed mission replaces its question and Explore returns to the unchanged map view", () => {
  const globals = globalThis as unknown as Record<string, unknown>;
  const originalWindow = globals.window, originalStorage = globals.sessionStorage;
  const mapView = { center: [410, 620], zoom: 1.5 };
  try {
    const navigationWindow = { location: { href: "http://127.0.0.1:3000/" }, history: { pushState() {} }, requestAnimationFrame(callback: () => void) { callback(); }, scrollTo() {} };
    globals.sessionStorage = { setItem() {} };
    for (const definition of SHUK_MISSIONS) {
      const mission = { id: definition.id, state: "completed", arrivalPoints: 20, arrivalMethod: "guide", gpsEnabled: false };
      const kind = definition.challenge.kind === "gateway" ? "gateway" : definition.challenge.kind === "choice" ? "choice" : "water";
      const server = { session: { ...createDevWaterSession(), completed: true, kind, cups: { small: 0, large: 1, jar: 4 }, selected: [], gateway: { ...emptyGatewayProgress(), stage: "completed", yearAnswer: "1883" }, bonus: { selected: [], completed: false, points: 0 } },
        missions: [mission], mission, performance: { started: true, hintsUsed: 2, canStart: false, reward: { points: 73, foodTokens: 5, hintsUsed: 2 } }, sharedBalance: { points: 151, foodTokens: 9 } };
      const before = structuredClone(server);
      let navigation = { area: "journey", stage: "challenge", missionId: definition.id, openMission: { id: definition.id, screen: "challenge" } };
      let explore: (() => void) | undefined;
      let mapProps: Record<string, unknown> | undefined;
      let nullState = 0;
      const react = { ...nativeRequire("react"), useState(initial: unknown) {
        if (initial === null) return [++nullState === 1 ? server : nullState === 2 ? mapView : null, () => {}];
        if (initial && typeof initial === "object" && "stage" in initial) return [navigation, (next: typeof navigation) => { navigation = next; }];
        return [initial, () => {}];
      }, useEffect() {}, useRef: (value: unknown) => ({ current: value }), useMemo: (factory: () => unknown) => factory(), useCallback: (fn: unknown) => fn };
      const overrides = {
        "@/components/ui/ActionButton": { __esModule: true, default: (props: { children: string; onClick: () => void }) => {
          if (props.children === "Explore Next Mission") explore = props.onClick;
          return createElement("button", null, props.children);
        } },
        "@/components/map/LeafletBaseMap": { __esModule: true, default: (props: Record<string, unknown>) => { mapProps = props; return null; } },
      };
      const Index = load("components/amazing-shuk/dev/IndexWaterTask.tsx", react, overrides);
      const html = renderToStaticMarkup(createElement(Index));
      assert.equal((html.match(/id="mission-victory-title"/g) ?? []).length, 1, definition.id);
      assert.equal((html.match(/Points earned/g) ?? []).length, 1);
      assert.match(html, /<dd>73<\/dd>/); assert.match(html, /<dd>5<\/dd>/); assert.match(html, /<dd>2<\/dd>/);
      assert.doesNotMatch(html, /id="water-task-title"|id="mural-task-title"|id="gateway-year-title"|Reset puzzle|Clear answer|Need a hint/);
      if (kind !== "choice" || !definition.bonus) assert.doesNotMatch(html, /<input|<form|Submit Our Answer|Submit Group Answer/);
      assert.ok(explore, definition.id);
      globals.window = navigationWindow;
      explore();
      if (originalWindow === undefined) delete globals.window; else globals.window = originalWindow;
      assert.equal(navigation.stage, "map"); assert.equal(navigation.missionId, definition.id);
      assert.deepEqual(navigation.openMission, { id: definition.id, screen: "challenge" });
      assert.deepEqual(server, before);
      nullState = 0;
      renderToStaticMarkup(createElement(Index));
      assert.ok(mapProps); assert.equal(mapProps.initialView, mapView);
      for (const marker of mapProps.markers as { state: string }[]) assert.equal(marker.state, "completed");
    }
  } finally {
    if (originalWindow === undefined) delete globals.window; else globals.window = originalWindow;
    if (originalStorage === undefined) delete globals.sessionStorage; else globals.sessionStorage = originalStorage;
  }
});
