import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createRequire } from "node:module";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";
import * as avatars from "./participant-avatar.ts";
import * as identities from "./participant-identity.ts";
const nativeRequire = createRequire(import.meta.url);
function loadComponent(path: string, reactOverride?: object): ComponentType<Record<string, unknown>> {
  const output = ts.transpileModule(readFileSync(resolve(path), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText;
  const exports: { default?: ComponentType<Record<string, unknown>> } = {};
  const localRequire = (id: string) => {
    if (id === "react" && reactOverride) return reactOverride;
    if (id.endsWith(".scss")) return { __esModule: true, default: new Proxy({}, { get: (_, key) => String(key) }) };
    if (id === "@/lib/amazing-shuk/participant-avatar") return avatars;
    if (id === "@/lib/amazing-shuk/participant-identity") return identities;
    if (id === "@/components/icons") return { Icon: () => null };
    if (id === "@/components/ui/StatusTag") return { __esModule: true, default: ({ status }: { status: string }) => createElement("span", null, status === "draft" ? "Draft" : "") };
    if (id === "@/components/ui/ActionButton") return { __esModule: true, default: loadComponent("components/ui/ActionButton.tsx", reactOverride) };
    if (id.startsWith("@/components/amazing-shuk/")) return { __esModule: true, default: loadComponent(id.replace("@/", "") + ".tsx", reactOverride) };
    if (id.startsWith("./") || id.startsWith("../")) return { __esModule: true, default: loadComponent(resolve(dirname(path), id + ".tsx"), reactOverride) };
    return nativeRequire(id);
  };
  new Function("require", "exports", output)(localRequire, exports);
  assert.ok(exports.default);
  return exports.default;
}

const noop = () => {};
test("role UI: unassigned, candidates, volunteering, withdrawal and active responsibility remain distinct", () => {
  const Role = loadComponent("components/amazing-shuk/PreviewGroupRole.tsx");
  const base = { title: "Navigator", holder: null, candidates: [{participantId: "a", displayName: "Ari", responsibilities: []}],
    volunteerLabel: "I'll Navigate", active: false, volunteered: false, guide: false, busy: false, onVolunteer: noop, onWithdraw: noop, onStepDown: noop };
  const render = (extra: object) => renderToStaticMarkup(createElement(Role, {...base, ...extra})).replace(/<!-- -->/g, "");
  assert.match(render({}), /Unassigned/);
  assert.match(render({}), /Ari/);
  assert.match(render({}), /src="data:image/);
  assert.match(render({volunteered:true}), /Withdraw volunteer/);
  assert.match(render({active:true}), /Step down/);
  assert.doesNotMatch(render({guide:true}), /<button/);
  assert.match(render({busy:true}), /disabled/);
});
test("guide UI: named candidate confirmation and direct assignment; no participant volunteering", () => {
  const Guide = loadComponent("components/amazing-shuk/dev/IndexGuideGroupRoles.tsx");
  const html = renderToStaticMarkup(createElement(Guide, {participants:[{id:"a",name:"Ari"},{id:"b",name:"Bea"},{id:"guide",name:"Guide"}],
    roles:{navigator:null,answerSubmitter:"b"}, candidates:{navigator:["a","b"],answerSubmitter:["a"]}, busy:false,onAction:noop})).replace(/<!-- -->/g, "");
  assert.match(html,/Confirm Ari/); assert.match(html,/Confirm Bea/);
  assert.match(html,/Assign navigator/); assert.match(html,/Assign answer-submitter/);
  assert.doesNotMatch(html,/I'll Navigate|value="guide"/);
});
