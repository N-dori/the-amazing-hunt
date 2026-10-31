import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createRequire } from "node:module";
import { createElement, type ComponentType } from "react";
import ts from "typescript";
import { renderToStaticMarkup } from "react-dom/server";
import { buildMemberRows, joinStage, joinUrl, orderRequests, TEAM_JOIN_COPY, TEAM_MEMBERS_COPY, type MembershipView } from "./team-membership.ts";

const nativeRequire = createRequire(import.meta.url);
// The same loader as role-choice.test.ts: the real TSX and button, without a browser or a CSS loader.
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
    return nativeRequire(id);
  };
  new Function("require", "exports", output)(localRequire, exports);
  assert.ok(exports.default);
  return exports.default;
}
const noop = () => {};
const MEMBERSHIP: MembershipView = { capacity: 5, taken: 3, leaderId: "p_leader", hasLink: true, requests: [
  { id: "r_later", code: "KX7P", name: null, status: "approved", expiresAt: 2 },
  { id: "r_first", code: "ACDE", name: "Bea", status: "pending", expiresAt: 5 },
] };
const PARTICIPANTS = [{ id: "p_leader", name: "Ari" }, { id: "p_member", name: "Cal" }, { id: "guide", name: "Guide" }];

test("members: the leader, the guide and yourself can't be removed; waiting requests come first; the link goes in the fragment", () => {
  assert.deepEqual(buildMemberRows(PARTICIPANTS, MEMBERSHIP, "p_leader", "guide"), [
    { id: "p_leader", name: "Ari", you: true, removable: false }, { id: "p_member", name: "Cal", you: false, removable: true }]);
  assert.deepEqual(buildMemberRows(PARTICIPANTS, MEMBERSHIP, "guide", "guide").map(row => row.removable), [false, true]);
  assert.deepEqual(orderRequests(MEMBERSHIP.requests).map(request => request.id), ["r_first", "r_later"]);
  assert.equal(joinUrl("https://doriisrael.com", "/shuk/amazing-shuk", "abc"), "https://doriisrael.com/shuk/amazing-shuk#join=abc");
});

test("the leader's panel shows the space, the codes, Let in and Decline only for waiting requests, and Remove only where allowed", () => {
  const Panel = loadComponent("components/amazing-shuk/PreviewJoinRequests.tsx");
  const props = { copy: TEAM_MEMBERS_COPY, membership: MEMBERSHIP, requests: orderRequests(MEMBERSHIP.requests),
    members: buildMemberRows(PARTICIPANTS, MEMBERSHIP, "p_leader", "guide"), holdsLink: false, confirmingReplace: false, confirmingRemove: null,
    busy: false, linkBusy: false, notice: "", onInvite: noop, onAskReplace: noop, onReplace: noop, onCancelReplace: noop, onShare: noop, onCopy: noop,
    onLetIn: noop, onDecline: noop, onAskRemove: noop, onCancelRemove: noop, onRemove: noop };
  const html = renderToStaticMarkup(createElement(Panel, props));
  assert.match(html, /Space: 3 of 5/);
  assert.match(html, /ACDE/); assert.match(html, /KX7P/); assert.match(html, /Bea/); assert.match(html, /No name given/);
  assert.equal(html.match(/>Let in</g)?.length, 1, "only the waiting request");
  assert.equal(html.match(/>Remove</g)?.length, 1, "only the member who isn't the leader");
  assert.match(html, /Get a new link/); assert.doesNotMatch(html, /Share link/, "this phone doesn't hold the link");
  // A full team can't let anyone else in.
  const full = renderToStaticMarkup(createElement(Panel, { ...props, membership: { ...MEMBERSHIP, taken: 5 } }));
  assert.match(full, /Your team is full/); assert.match(full, /disabled=""[^>]*><span>Let in/);
  const holding = renderToStaticMarkup(createElement(Panel, { ...props, holdsLink: true }));
  assert.match(holding, /Share link/); assert.match(holding, /Copy link/);
  assert.doesNotMatch(renderToStaticMarkup(createElement(Panel, { ...props, membership: { ...MEMBERSHIP, hasLink: false } })), /Get a new link/);
});

test("the joining phone: an optional name and Ask to join, then the wait with the check code", () => {
  const Join = loadComponent("components/amazing-shuk/PreviewTeamJoin.tsx");
  const base = { copy: TEAM_JOIN_COPY, name: "", code: null, approved: false, busy: false, message: "", onName: noop, onAsk: noop };
  const ask = renderToStaticMarkup(createElement(Join, { ...base, stage: "ask" }));
  assert.match(ask, /Ask to join/); assert.match(ask, /maxLength="40"/); assert.match(ask, /for="join-name"/);
  const waiting = renderToStaticMarkup(createElement(Join, { ...base, stage: "waiting", code: "ACDE" }));
  assert.match(waiting, /Waiting for your leader/); assert.match(waiting, /ACDE/); assert.match(waiting, /aria-label="A C D E"/);
  assert.match(renderToStaticMarkup(createElement(Join, { ...base, stage: "waiting", code: "ACDE", approved: true })), /Joining/);
  assert.match(renderToStaticMarkup(createElement(Join, { ...base, stage: "declined" })), /didn&#x27;t let this phone in/);
});

test("which joining screen: links off hide the form; a request that ended after a reload says so; otherwise the welcome (C1, C2)", () => {
  const pending = { status: "pending", code: "ACDE", name: null } as const;
  assert.equal(joinStage(null, "link", true), "unavailable", "links off, with a link: one line, no form");
  assert.equal(joinStage(pending, null, true), "unavailable", "switched off mid-wait, after a reload: still told why");
  assert.equal(joinStage({ status: "gone" }, null, true), null, "links off, no link, no request: nothing join-related at all");
  assert.equal(joinStage(null, "link", false), "checking");
  assert.equal(joinStage(pending, null, false), "waiting");
  assert.equal(joinStage({ ...pending, status: "approved" }, null, false), "waiting");
  assert.equal(joinStage({ ...pending, status: "declined" }, "link", false), "declined");
  assert.equal(joinStage({ status: "gone" }, "link", false), "ask");
  assert.equal(joinStage({ status: "gone", ended: true }, "link", false), "ask", "the link is still here: ask again");
  assert.equal(joinStage({ status: "gone", ended: true }, null, false), "ended");
  assert.equal(joinStage({ status: "gone" }, null, false), null, "never asked: the signed-out welcome");
});

test("the joining phone: an ended request and switched-off links show one line and no form", () => {
  const Join = loadComponent("components/amazing-shuk/PreviewTeamJoin.tsx");
  const base = { copy: TEAM_JOIN_COPY, name: "", code: null, approved: false, busy: false, message: "", onName: noop, onAsk: noop };
  const ended = renderToStaticMarkup(createElement(Join, { ...base, stage: "ended" }));
  assert.match(ended, /Open the join link again/); assert.doesNotMatch(ended, /<form/);
  const off = renderToStaticMarkup(createElement(Join, { ...base, stage: "unavailable" }));
  assert.match(off, /doesn&#x27;t work/); assert.doesNotMatch(off, /<form/); assert.doesNotMatch(off, /Ask to join/);
});
