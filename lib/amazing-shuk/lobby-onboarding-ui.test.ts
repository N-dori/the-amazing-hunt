import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createRequire } from "node:module";
import { createElement, type ComponentType, type ReactNode } from "react";
import ts from "typescript";
import { renderToStaticMarkup } from "react-dom/server";
import { buildLobbyView, groupSummary, requiredRolesMissing, stepperStates, type AdventureView } from "./adventure-lobby.ts";
import { buildLobbyRoleRows, teamPlayers } from "./participant-identity.ts";
import { LOBBY_COPY } from "./welcome-copy.ts";
import { TEAM_NAME_COPY } from "./team-name.ts";

// Onboarding and roles (owner, 5 Nov 2026): the lobby's steps, the casting call, the start warning, the waiting screen and the role card,
// rendered from the actual TSX without a browser (the loader of role-choice.test.ts). The avatar and the sheet are stubbed: they have
// their own tests, and here only what the lobby puts in them matters.
const nativeRequire = createRequire(import.meta.url);
const Avatar = ({ displayName }: { displayName: string }) => createElement("i", null, `avatar:${displayName}`);
const Sheet = ({ open, title, children, footer }: { open: boolean; title: string; children: ReactNode; footer: ReactNode }) =>
  open ? createElement("div", { role: "dialog", "aria-label": title }, children, footer) : null;
function loadComponent(path: string): ComponentType<Record<string, unknown>> {
  const output = ts.transpileModule(readFileSync(resolve(path), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText;
  const exports: { default?: ComponentType<Record<string, unknown>> } = {};
  const localRequire = (id: string) => {
    if (id.endsWith(".scss")) return { __esModule: true, default: new Proxy({}, { get: (_, key) => String(key) }) };
    if (id === "@/components/ui/ActionButton") return { __esModule: true, default: loadComponent("components/ui/ActionButton.tsx") };
    if (id === "@/components/icons") return { Icon: () => null };
    if (id === "./ParticipantAvatar") return { __esModule: true, default: Avatar };
    if (id === "./PreviewBottomSheet") return { __esModule: true, default: Sheet };
    if (id.startsWith("@/lib/")) return nativeRequire(resolve(id.replace("@/", "") + ".ts"));
    if (id.startsWith("./")) return { __esModule: true, default: loadComponent(resolve(dirname(path), id + ".tsx")) };
    return nativeRequire(id);
  };
  new Function("require", "exports", output)(localRequire, exports);
  assert.ok(exports.default);
  return exports.default;
}
const html = (component: string, props: Record<string, unknown>) =>
  renderToStaticMarkup(createElement(loadComponent(component), props)).replace(/<!-- -->/g, "");
const PEOPLE = [{ id: "player-1", name: "Ari" }, { id: "player-2", name: "Bea" }];
const HOST: AdventureView = { status: "lobby", intendedCount: 2, host: true, leader: true, canManage: true };
const noop = () => {};
const lobbyProps = (step: string, count: number, roles = { navigator: "player-2", answerSubmitter: "player-1" }) => ({
  copy: LOBBY_COPY, lobby: buildLobbyView(HOST, count), step, stepper: stepperStates(step as "count", count === 1 ? "solo" : count > 5 ? "multi" : "group"),
  summary: groupSummary(count), lead: LOBBY_COPY.hostLead, busy: false, message: "", headingRef: null,
  members: [{ id: "player-1", name: "Ari", roles: ["Submitter"] }, { id: "player-2", name: "Bea", roles: ["Navigator"] }],
  roleRows: buildLobbyRoleRows(PEOPLE, roles, "player-1"),
  onStep: noop, onContinue: noop, onNext: noop, onBack: noop, onGive: noop, onStart: noop,
});

test("the casting call: a question per role, a chip per player, the holder pressed, No one yet for an empty role", () => {
  const out = html("components/amazing-shuk/PreviewLobbyRoles.tsx", { copy: LOBBY_COPY, busy: false, onGive: noop,
    rows: buildLobbyRoleRows([...PEOPLE, { id: "guide", name: "Guide" }], { navigator: "player-2", answerSubmitter: null }, "player-1") });
  assert.match(out, /Who&#x27;ll find the way\?/); assert.match(out, /Who&#x27;ll send our answers\?/);
  assert.match(out, /aria-pressed="true" aria-label="Bea as Navigator"/);
  assert.match(out, /aria-pressed="false" aria-label="Ari as Submitter"/);
  // Four rows (owner, 5 Nov 2026: the Photographer always shown); Submitter, Researcher and Photographer are free here.
  assert.match(out, /Who&#x27;ll look things up online\?/); assert.match(out, /Who&#x27;ll take the photos\?/);
  assert.equal((out.match(/<fieldset/g) ?? []).length, 4);
  assert.equal((out.match(/No one yet/g) ?? []).length, 3);
  // Never the guide, and never the old name.
  assert.doesNotMatch(out, /Guide|Answer-submitter|Advisor/);
});

test("the lobby's steps: a stepper on top; Ready lists the crew with their roles and no group count for one group", () => {
  const ready = html("components/amazing-shuk/PreviewAdventureLobby.tsx", lobbyProps("ready", 2));
  assert.match(ready, /aria-label="Getting ready"/); assert.match(ready, /aria-current="step"/);
  for (const stage of ["Players", "Who&#x27;s here", "Roles", "Ready"]) assert.match(ready, new RegExp(stage));
  assert.match(ready, /<strong>Bea<\/strong><span[^>]*> Navigator/); assert.match(ready, /Start Adventure/);
  assert.doesNotMatch(ready, /Groups|Recommended|split|Players per group/);
  const here = html("components/amazing-shuk/PreviewAdventureLobby.tsx", lobbyProps("here", 3));
  assert.match(here, /Who&#x27;s here\?/); assert.match(here, /2 of 3 here/); assert.match(here, /avatar:Ari/);
  const roles = html("components/amazing-shuk/PreviewAdventureLobby.tsx", lobbyProps("roles", 2));
  assert.match(roles, /Who does what\?/); assert.match(roles, /Read these out and decide together/);
});

test("solo says so with only two steps; 6 and more get the teams step, with no Start on it", () => {
  const solo = html("components/amazing-shuk/PreviewAdventureLobby.tsx", lobbyProps("ready", 1));
  assert.match(solo, /Playing solo: you&#x27;ll hold every role\./);
  assert.equal((solo.match(/<li/g) ?? []).length, 2, "Players and Ready only");
  const teams = html("components/amazing-shuk/PreviewAdventureLobby.tsx", { ...lobbyProps("teams", 11), teams: "TEAMS-SLOT", backLabel: LOBBY_COPY.changeCount });
  assert.match(teams, /Your teams/); assert.match(teams, /TEAMS-SLOT/); assert.match(teams, /Change the number/);
  assert.doesNotMatch(teams, /Start Adventure/);
});

test("Start with a role missing: the warning names it; Give them to me only for the team's leader", () => {
  const props = { copy: LOBBY_COPY, open: true, missing: ["Submitter"], busy: false, onSetRoles: noop, onGiveToMe: noop, onClose: noop };
  const leader = html("components/amazing-shuk/PreviewStartBlocked.tsx", { ...props, canGiveToMe: true });
  assert.match(leader, /aria-label="Roles still needed"/); assert.match(leader, /No one is the Submitter yet/);
  assert.match(leader, /Set the roles/); assert.match(leader, /Give them to me/);
  const guide = html("components/amazing-shuk/PreviewStartBlocked.tsx", { ...props, canGiveToMe: false });
  assert.match(guide, /Set the roles/); assert.doesNotMatch(guide, /Give them to me/);
  assert.equal(html("components/amazing-shuk/PreviewStartBlocked.tsx", { ...props, open: false, canGiveToMe: true }), "");
});

test("the waiting screen: the game's name, a loader, the approved words, where the host is, and the player's own roles", () => {
  const out = html("components/amazing-shuk/PreviewLobbyWaiting.tsx", { copy: LOBBY_COPY, brand: "The Amazing Shuk", states: stepperStates("roles", "group"),
    stageLine: LOBBY_COPY.waitingStages.roles, yourRoles: LOBBY_COPY.yourRoles(["Navigator"]), message: "", headingRef: null });
  assert.match(out, /The Amazing Shuk/); assert.match(out, /Waiting for the adventure to begin/);
  assert.match(out, /role="status">Your leader is choosing roles…/); assert.match(out, /You&#x27;re the Navigator\./);
  assert.match(out, /aria-hidden="true"><span><\/span><span><\/span><span><\/span>/, "the loader is decorative");
  assert.match(out, /aria-current="step"/);
});

test("the role card: the role's title and its one line on the job; the Submitter's says they choose and send", () => {
  for (const role of ["navigator", "answerSubmitter"] as const) {
    const card = LOBBY_COPY.roleCards[role];
    const out = html("components/amazing-shuk/PreviewRoleCard.tsx", { open: true, role, title: card.title, text: card.text, ok: LOBBY_COPY.roleCardOk, onClose: noop });
    assert.match(out, new RegExp(`aria-label="${card.title.replace("'", "&#x27;")}"`)); assert.match(out, /Got it/);
  }
  assert.match(LOBBY_COPY.roleCards.answerSubmitter.text, /choose and send the group/);
});

test("the guide is never one of the lobby's players: not counted, not listed, no roles asked of a solo player (live test, 6 Nov 2026)", () => {
  const signedIn = [{ id: "player-1", name: "Ari" }, { id: "guide", name: "Guide" }, { id: "player-2", name: "Bea" }];
  assert.deepEqual(teamPlayers(signedIn).map(person => person.id), ["player-1", "player-2"]);
  // A solo player with the guide signed in is still solo: nothing is required to start.
  const solo = teamPlayers([{ id: "player-1", name: "Ari" }, { id: "guide", name: "Guide" }]).map(person => person.id);
  assert.deepEqual(requiredRolesMissing({ navigator: null, answerSubmitter: null }, solo), []);
  const here = html("components/amazing-shuk/PreviewAdventureLobby.tsx", { ...lobbyProps("here", 3),
    members: teamPlayers(signedIn).map(person => ({ ...person, roles: [] })) });
  assert.match(here, /2 of 3 here/); assert.doesNotMatch(here, /avatar:Guide/);
});

test("the host's teams (I7a): Create the teams first; then one row per team with its leader's status, players, readiness and invite", () => {
  const before = html("components/amazing-shuk/PreviewLobbyTeams.tsx", { copy: LOBBY_COPY, summary: groupSummary(11), teams: [], created: false, busy: false,
    linkBusy: null, notice: "", onCreate: noop, onShare: noop });
  assert.match(before, /Groups: 3/); assert.match(before, /Players per group: 4 \+ 4 \+ 3/); assert.match(before, /Create the teams/);
  const rows = [
    { id: "A", name: "Falafel Fugitives", avatarId: null, initials: "FF", leader: "accepted", host: true, members: 4, named: true, rolesMissing: 0, ready: true },
    { id: "B", name: null, avatarId: "shuk-02", initials: "B", leader: "none", host: false, members: 0, named: false, rolesMissing: 0, ready: false },
    { id: "C", name: "Olive Squad Goals", avatarId: "shuk-03", initials: "OS", leader: "accepted", host: false, members: 3, named: true, rolesMissing: 1, ready: false },
  ];
  const after = html("components/amazing-shuk/PreviewLobbyTeams.tsx", { copy: LOBBY_COPY, summary: groupSummary(11), teams: rows, created: true, busy: false,
    linkBusy: null, notice: "", onCreate: noop, onShare: noop });
  assert.match(after, /Falafel Fugitives/); assert.match(after, /You lead this team · 4 players/);
  assert.match(after, /Team B/); assert.match(after, /Invite not sent · 0 players/); assert.match(after, /aria-label="Share invite: Team B"/);
  assert.match(after, /Leader is in · 3 players/); assert.match(after, /aria-label="Make a new invite: Olive Squad Goals"/);
  assert.equal((after.match(/aria-label="(Share invite|Make a new invite)/g) ?? []).length, 2, "no invite for the host's own team");
  assert.doesNotMatch(after, /#invite=/, "the invitation itself is never on screen");
});

test("Name your team: the approved copy, the suggestions, the field's error, and the name shown only once saved", () => {
  const props = { copy: TEAM_NAME_COPY, value: "Falafel", error: "", saved: null, saving: false, suggestions: ["Falafel Fugitives", "Sabich Side Quest"], maxLength: 20,
    onChange: noop, onPick: noop, onConfirm: noop };
  const out = html("components/amazing-shuk/PreviewTeamName.tsx", props);
  assert.match(out, /Make up a name or pick a Shuk favorite!/); assert.match(out, /Need inspiration\?/); assert.match(out, /Confirm name/);
  assert.doesNotMatch(out, /You&#x27;re/);
  const saving = html("components/amazing-shuk/PreviewTeamName.tsx", { ...props, saving: true, saved: "Falafel Fugitives" });
  assert.match(saving, /Saving your team name…/); assert.doesNotMatch(saving, /You&#x27;re Falafel Fugitives/);
  const saved = html("components/amazing-shuk/PreviewTeamName.tsx", { ...props, saved: "Falafel Fugitives" });
  assert.match(saved, /You&#x27;re Falafel Fugitives!/);
  const error = html("components/amazing-shuk/PreviewTeamName.tsx", { ...props, error: "That name's taken. Try another!" });
  assert.match(error, /role="alert">That name&#x27;s taken/); assert.match(error, /aria-invalid="true"/);
});
