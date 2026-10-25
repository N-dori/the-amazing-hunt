import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createRequire } from "node:module";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";
import { BASE_PATH } from "../base-path.ts";
import { FOOD_CATALOGUE, FOOD_COPY, FOOD_TASTING_IDS, type FoodPhoto } from "./food-catalogue.ts";
import { buildFoodTastingViews, parseFoodReturnPosition } from "./food-catalogue-view.ts";

const nativeRequire = createRequire(import.meta.url);

test("stored catalogue position accepts only known entries and finite nonnegative scroll offsets", () => {
  assert.deepEqual(parseFoodReturnPosition({ top: 517, id: "rugelach" }), { top: 517, id: "rugelach" });
  for (const value of [null, { top: -1, id: "rugelach" }, { top: Infinity, id: "rugelach" }, { top: 1, id: "fake" }, { top: "1", id: "tahini" }]) {
    assert.equal(parseFoodReturnPosition(value), null);
  }
});
function load(path: string, reactOverride?: object, overrides: Record<string, unknown> = {}): ComponentType<Record<string, unknown>> {
  const output = ts.transpileModule(readFileSync(resolve(path), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText;
  const exports: { default?: ComponentType<Record<string, unknown>> } = {};
  const localRequire = (id: string): unknown => {
    if (Object.hasOwn(overrides, id)) return overrides[id];
    if (id === "react" && reactOverride) return reactOverride;
    if (id.endsWith(".scss")) return { __esModule: true, default: new Proxy({}, { get: (_, key) => String(key) }) };
    if (id === "@/components/icons") return { Icon: () => null };
    if (id.startsWith("@/lib/")) return nativeRequire(resolve(id.replace("@/", "") + ".ts"));
    if (id.startsWith("@/components/")) return { __esModule: true, default: load(id.replace("@/", "") + ".tsx", reactOverride, overrides) };
    if (id.startsWith("./")) return { __esModule: true, default: load(resolve(dirname(path), id + ".tsx"), reactOverride, overrides) };
    return nativeRequire(id);
  };
  new Function("require", "exports", output)(localRequire, exports);
  assert.ok(exports.default); return exports.default;
}

test("four food candidates have stable IDs and no invented offers, portions, prices or dietary assurances", () => {
  const before = structuredClone(FOOD_CATALOGUE);
  const views = buildFoodTastingViews(FOOD_CATALOGUE);
  assert.deepEqual(views.map(view => view.id), [...FOOD_TASTING_IDS]);
  assert.equal(new Set(views.map(view => view.id)).size, 4);
  for (const item of FOOD_CATALOGUE) {
    assert.equal(item.status, "provisional"); assert.equal(item.tokenCost, null);
    assert.equal(item.portion, null); assert.equal(item.dietaryInformation, null);
    assert.equal(item.vendorConfirmed, false); assert.equal(item.availability, "unconfirmed");
  }
  for (const view of views) {
    assert.equal(view.price, FOOD_COPY.tokenCostPending);
    assert.match(view.notice, /not available to redeem/);
    assert.ok(view.location); assert.ok(view.dietary);
    assert.doesNotMatch(view.price, /0|free/i);
  }
  assert.deepEqual(FOOD_CATALOGUE, before);
});

test("Food catalogue shows actual shared balance including zero, four readable choices, and no checkout", () => {
  const Index = load("components/amazing-shuk/IndexFood.tsx");
  for (const foodTokens of [0, 7, 23]) {
    const html = renderToStaticMarkup(createElement(Index, { foodTokens, selectedId: null, onSelect() {}, onBack() {} }));
    assert.match(html, new RegExp(`<strong>${foodTokens}</strong>`));
    assert.equal((html.match(/Group food tokens/g) ?? []).length, 1);
    assert.equal((html.match(/Token cost: To be confirmed/g) ?? []).length, 4);
    assert.equal((html.match(/View tasting/g) ?? []).length, 4);
    assert.match(html, /Provisional tastings/);
    assert.doesNotMatch(html, /<form|<input|Buy now|Redeem now|checkout|₪|Rachmo/i);
  }
});

test("every tasting detail exposes pending terms, Back to Food and no transaction controls", () => {
  const Index = load("components/amazing-shuk/IndexFood.tsx");
  for (const selectedId of FOOD_TASTING_IDS) {
    const html = renderToStaticMarkup(createElement(Index, { foodTokens: 11, selectedId, onSelect() {}, onBack() {} }));
    assert.match(html, /id="food-tasting-title" tabindex="-1"/);
    assert.match(html, /Back to Food/); assert.match(html, /<strong>11<\/strong>/);
    assert.match(html, /Shared serving/); assert.match(html, /Ingredients &amp; dietary information/);
    assert.match(html, /not yet verified/); assert.match(html, /Availability/);
    assert.match(html, /not available to redeem/);
    assert.doesNotMatch(html, /<form|<input|View tasting|Buy|Checkout|0 food tokens|gluten.free|vegan|kosher/i);
    if (selectedId === "etrog-drink") {
      assert.match(html, /Participation not confirmed/); assert.match(html, /HaEgoz Street/);
      assert.doesNotMatch(html, /HaEgoz (6|10)/);
    }
  }
});

// A licensed image fixture exercises the renderer; no download or served file is required by this test.
const photo: FoodPhoto = {
  src: "/shuk/food/tahini-illustrative.jpg", width: 800, height: 544,
  alt: "Illustrative bowl of tahini; not a confirmed serving.", author: "Chubbychef",
  sourceUrl: "https://commons.wikimedia.org/wiki/File:Tahini.jpg",
  license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  caption: "Illustrative dish photograph — not a confirmed vendor serving.", changes: "Unmodified source image.",
};
test("approved photo presentation carries illustrative wording, source and licence; failure retains text-only access", () => {
  const items = [{ ...FOOD_CATALOGUE[0], photo }];
  const Card = load("components/amazing-shuk/PreviewFoodTastingCard.tsx");
  const Detail = load("components/amazing-shuk/PreviewFoodTasting.tsx");
  const view = buildFoodTastingViews(items)[0];
  for (const Component of [Card, Detail]) {
    const html = renderToStaticMarkup(createElement(Component, { view, actionLabel: FOOD_COPY.view, backLabel: FOOD_COPY.back, onSelect() {}, onBack() {}, onImageError() {} }));
    assert.match(html, /not a confirmed vendor serving/); assert.match(html, /Chubbychef/);
    assert.ok(html.includes(photo.sourceUrl)); assert.ok(html.includes(photo.licenseUrl));
    assert.ok(html.includes(encodeURIComponent(BASE_PATH + photo.src)));
    const fallback = renderToStaticMarkup(createElement(Component, { view: buildFoodTastingViews(items, [view.id])[0], onSelect() {}, onBack() {}, onImageError() {} }));
    assert.match(fallback, /Tahini tasting/); assert.doesNotMatch(fallback, /<img|<figure/);
  }
  assert.equal(items[0].photo, photo);
});

test("catalogue/detail callbacks restore list scroll and focus without a purchase action", () => {
  const globals = globalThis as unknown as Record<string, unknown>;
  const oldWindow = globals.window, oldDocument = globals.document;
  const saved = { current: { top: 0, id: null as string | null } };
  const effects: (() => void)[] = [], scrolls: number[] = [], focus: string[] = [];
  let listProps: { onSelect: (id: string) => void } | undefined;
  let selected: string | null = null;
  const react = { ...nativeRequire("react"), useState: () => [[], () => {}], useRef: () => saved, useEffect: (effect: () => void) => effects.push(effect) };
  const overrides = {
    "./ListFoodTasting": { __esModule: true, default: (props: { onSelect: (id: string) => void }) => { listProps = props; return null; } },
    "./PreviewFoodTasting": { __esModule: true, default: () => null },
  };
  const Index = load("components/amazing-shuk/IndexFood.tsx", react, overrides);
  try {
    globals.window = { scrollY: 583, requestAnimationFrame(callback: () => void) { callback(); return 1; }, cancelAnimationFrame() {}, scrollTo(options: { top: number }) { scrolls.push(options.top); } };
    globals.document = { getElementById(id: string) { return { focus() { focus.push(id); } }; } };
    const render = () => renderToStaticMarkup(createElement(Index, { foodTokens: 9, selectedId: selected, onSelect(id: string) { selected = id; }, onBack() { selected = null; } }));
    render(); effects.pop()?.();
    assert.ok(listProps); listProps.onSelect("bourekas");
    assert.deepEqual(saved.current, { top: 583, id: "bourekas" });
    render(); effects.pop()?.(); assert.equal(focus.at(-1), "food-tasting-title");
    selected = null; render(); effects.pop()?.();
    assert.equal(scrolls.at(-1), 583); assert.equal(focus.at(-1), "food-entry-bourekas");
  } finally {
    if (oldWindow === undefined) delete globals.window; else globals.window = oldWindow;
    if (oldDocument === undefined) delete globals.document; else globals.document = oldDocument;
  }
});
