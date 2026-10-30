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
    if (id === "@/components/icons") return { Icon: () => null };
    if (id === "@/components/ui/StatusTag") return { __esModule: true, default: ({ status }: { status: string }) => createElement("span", null, status === "draft" ? "Draft" : "") };
    if (id === "@/components/ui/ActionButton") return { __esModule: true, default: loadComponent("components/ui/ActionButton.tsx", reactOverride) };
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

// React separates adjacent text with empty comments; drop them so assertions read like the visible text.
const text = (element: ReactElement) => renderToStaticMarkup(element).replace(/<!-- -->/g, "");

test("role badges stay visible in one compact list: a dual-role participant once, an empty role as free", () => {
  const Badges = loadComponent("components/amazing-shuk/ListParticipantBadges.tsx");
  const participants = [{ id: "a", name: "Ari" }, { id: "b", name: "Bea" }];
  const both = text(createElement(Badges, { participants, currentId: "b", roles: { navigator: "a", answerSubmitter: "a" } }));
  assert.match(both, /aria-label="Group roles"/);
  assert.match(both, /<strong>Ari<\/strong> Navigator \/ Answer-submitter/);
  assert.equal((both.match(/<li/g) ?? []).length, 1);
  assert.doesNotMatch(both, /<strong>Bea<|Sign out/);
  const empty = text(createElement(Badges, { participants, currentId: "b", roles: { navigator: null, answerSubmitter: "b" } }));
  assert.match(empty, /Navigator: free/); assert.match(empty, /<strong>Bea<\/strong> Answer-submitter/);
});

test("profile menu shows only the avatar until opened; the open panel holds identity, roles and Sign out", () => {
  const props = { participants: [{ id: "a", name: "Ari" }, { id: "b", name: "Bea" }], roles: { navigator: "a", answerSubmitter: null }, currentId: "b", currentRole: "follower", busy: false, onSignOut() {} };
  const Closed = loadComponent("components/amazing-shuk/IndexParticipantMenu.tsx");
  const closed = text(createElement(Closed, props));
  assert.match(closed, /aria-label="Profile: Bea"/); assert.match(closed, /aria-expanded="false"/);
  assert.doesNotMatch(closed, /Sign out|Signed in as/);
  const openReact = { ...nativeRequire("react"), useState: (initial: unknown) => [initial === false ? true : initial, () => {}] };
  const Open = loadComponent("components/amazing-shuk/IndexParticipantMenu.tsx", openReact);
  const open = text(createElement(Open, props));
  assert.match(open, /aria-expanded="true"/); assert.match(open, /aria-label="Close profile"/);
  assert.match(open, /Signed in as/); assert.match(open, /Your role: Advisor/); assert.doesNotMatch(open, /follower/); assert.match(open, /Sign out/);
  assert.match(open, /Answer-submitter: free \(anyone can take it in the Group tab\)/);
});

test("slim header: title, then the group slot and the profile slot; roles and the balance live in the group sheet", () => {
  const Header = loadComponent("components/amazing-shuk/PreviewShukHeader.tsx");
  const html = renderToStaticMarkup(createElement(Header, { title: "Explore the market",
    group: createElement("button", null, "group"), menu: createElement("button", null, "avatar") }));
  assert.match(html, /<header[^>]*>.*The Amazing Shuk.*<h1[^>]*>Explore the market<\/h1>.*group.*avatar/);
  assert.doesNotMatch(html, /pts|tokens|<strong>|<section/);
});

test("bottom bar: four labelled buttons, one marked as the current page, and no game actions", () => {
  const Nav = loadComponent("components/amazing-shuk/PreviewShukNav.tsx");
  const html = text(createElement(Nav, { active: "mission", onSelect() {} }));
  assert.match(html, /<nav[^>]*aria-label="Game"/);
  assert.deepEqual([...html.matchAll(/<span>([^<]+)<\/span>/g)].map(match => match[1]), ["Map", "Mission", "Food", "Group"]);
  assert.equal((html.match(/aria-current="page"/g) ?? []).length, 1);
  assert.match(html, /aria-current="page"><span>Mission<\/span>/);
  assert.doesNotMatch(html, /Submit|We're Here|Assign|Sign out/);
});

test("Group tab lists everyone with roles and marks you; progress and balance come from shared state", () => {
  const Group = loadComponent("components/amazing-shuk/ListGroupOverview.tsx");
  const html = text(createElement(Group, {
    participants: [{ id: "a", name: "Ari" }, { id: "b", name: "Bea" }, { id: "c", name: "Cal" }], roles: { navigator: "a", answerSubmitter: "a" }, currentId: "b",
    missions: [{ state: "completed" }, { state: "available" }], balance: { points: 120, foodTokens: 4 }, guide: false, busy: false, onClaim() {}, onRelease() {},
  }));
  assert.match(html, /<dd>1 of 2<\/dd>/); assert.match(html, /<dd>120<\/dd>/); assert.match(html, /<dd>4<\/dd>/);
  assert.match(html, /<strong>Ari<\/strong><span>Navigator \/ Answer-submitter<\/span>/);
  assert.match(html, /You<\/span><strong>Bea<\/strong>/);
  // Three people in the roster (after the two roles); players without a role are advisors.
  const roster = html.slice(html.indexOf('aria-label="Participants"'));
  assert.equal((roster.match(/<li/g) ?? []).length, 3);
  assert.match(roster, /<strong>Cal<\/strong><span>Advisor<\/span>/);
  assert.doesNotMatch(html, /Sign out|<select/);
});

test("Food tab shows the shared token balance and a marked draft gap, never invented offers", () => {
  const Food = loadComponent("components/amazing-shuk/PreviewFoodRewards.tsx");
  const html = text(createElement(Food, { foodTokens: 3 }));
  assert.match(html, /<strong>3<\/strong>/); assert.match(html, /aren't confirmed yet|aren&#x27;t confirmed yet/); assert.match(html, /Draft/);
  assert.doesNotMatch(html, /₪|shekel|falafel|hummus|redeem now/i);
});
