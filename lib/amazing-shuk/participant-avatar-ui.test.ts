import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createRequire } from "node:module";
import { createElement, type ComponentType, type ReactElement } from "react";
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
    if (id.startsWith("./")) return { __esModule: true, default: loadComponent(resolve(dirname(path), id + ".tsx"), reactOverride) };
    return nativeRequire(id);
  };
  new Function("require", "exports", output)(localRequire, exports);
  assert.ok(exports.default);
  return exports.default;
}

test("actual avatar component uses local data URI, accessible label, size and custom precedence", () => {
  const Avatar = loadComponent("components/amazing-shuk/ParticipantAvatar.tsx");
  const props = { participantId: "player-1", displayName: "Ari", size: 32 };
  const normal = renderToStaticMarkup(createElement(Avatar, props));
  assert.match(normal, /src="data:image\/svg\+xml/);
  assert.match(normal, /alt="Avatar for Ari"/);
  assert.match(normal, /--participant-avatar-size:32px/);
  assert.doesNotMatch(normal, /api\.dicebear\.com|src="https?:|_next\/image|<script|<svg/);
  const custom = renderToStaticMarkup(createElement(Avatar, { ...props, customImageSrc: "https://example.com/photo.jpg" }));
  assert.match(custom, /src="https:\/\/example.com\/photo.jpg"/);
  assert.doesNotMatch(custom, /data:image\/svg/);
});

test("image error handlers recover from custom failure to generated avatar then initials", () => {
  let failed: readonly string[] = [];
  const fakeReact = {
    ...nativeRequire("react"), useMemo: (factory: () => unknown) => factory(),
    useState: () => [failed, (update: (current: readonly string[]) => readonly string[]) => { failed = update(failed); }],
  };
  const Avatar = loadComponent("components/amazing-shuk/ParticipantAvatar.tsx", fakeReact) as (props: Record<string, unknown>) => ReactElement<{ children: ReactElement<{ src?: string; onError?: () => void }> }>;
  const props = { participantId: "player-1", displayName: "Ari Brown", customImageSrc: "https://example.com/photo.jpg" };
  const first = Avatar(props).props.children;
  assert.equal(first.props.src, props.customImageSrc);
  first.props.onError!();
  const second = Avatar(props).props.children;
  assert.ok(second.props.src!.startsWith("data:image/svg+xml"));
  second.props.onError!();
  const fallback = renderToStaticMarkup(Avatar(props));
  assert.match(fallback, /role="img" aria-label="Avatar for Ari Brown">AB/);
  assert.doesNotMatch(fallback, /<img/);
});

test("current and role identity rendering shows names and one row for a dual-role participant", () => {
  const List = loadComponent("components/amazing-shuk/ListParticipantIdentity.tsx");
  const html = renderToStaticMarkup(createElement(List, {
    participants: [{ id: "a", name: "Ari" }, { id: "b", name: "Bea" }],
    currentId: "b", currentRole: "follower", roles: { navigator: "a", answerSubmitter: "a" },
  }));
  assert.match(html, /Signed in as/);
  assert.match(html, /<strong>Bea<\/strong>/);
  assert.match(html, /<strong>Ari<\/strong>/);
  assert.match(html, /Navigator \/ Answer-submitter/);
  assert.equal((html.match(/<li>/g) ?? []).length, 1);
  assert.equal((html.match(/src="data:image\/svg/g) ?? []).length, 2);
});
