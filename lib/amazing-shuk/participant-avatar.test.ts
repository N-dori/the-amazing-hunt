import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { createParticipantAvatar, AVATAR_COLORS, customParticipantImage, participantInitials, availableAvatarSource } from "./participant-avatar.ts";
import { buildParticipantIdentities } from "./participant-identity.ts";
import { issueInvitation, redeemInvitation, logout, sessionView } from "./participant-store.ts";
import { BASE_PATH } from "../base-path.ts";

test("stable IDs give distinct deterministic local SVGs, independent of nickname", () => {
  const ids = ["guide", ...Array.from({ length: 7 }, (_, index) => `player-${index + 1}`)];
  const sources = ids.map(createParticipantAvatar);
  assert.equal(new Set(sources).size, ids.length);
  const geometry = sources.map(source => decodeURIComponent(source!).replace(/-[0-9a-f]{8}/g, ""));
  assert.equal(new Set(geometry).size, ids.length);
  for (const [index, id] of ids.entries()) {
    const source = createParticipantAvatar(id);
    assert.equal(source, sources[index]);
    assert.ok(source?.startsWith("data:image/svg+xml;"));
    const svg = decodeURIComponent(source!.split(",").slice(1).join(","));
    assert.doesNotMatch(svg, /<script|<foreignObject|<image|(?:href|xlink:href)="(?!#)/i);
    for (const [, color] of svg.matchAll(/(?:fill|stroke)="(#[0-9a-f]{6})"/gi)) assert.ok(Object.values(AVATAR_COLORS).some(expected => expected === color.toLowerCase()));
  }
  const before = { id: "player-1", name: "Old nickname" };
  const after = { ...before, name: "New nickname" };
  assert.equal(createParticipantAvatar(before.id), createParticipantAvatar(after.id));
  assert.equal(createParticipantAvatar(""), null);
  assert.equal(createParticipantAvatar("  "), null);
  const untrusted = createParticipantAvatar('<script>alert("nickname")</script>')!;
  assert.doesNotMatch(decodeURIComponent(untrusted), /<script|alert/);
});

test("the SVG adapter uses exact existing CSS brand tokens", async () => {
  const css = await readFile("app/globals.scss", "utf8");
  for (const [name, hex] of Object.entries(AVATAR_COLORS)) assert.match(css, new RegExp(`--${name}:\\s*${hex}\\s*;`, "i"));
});

test("custom photo precedence and failures fall through to local avatar then initials", () => {
  const generated = createParticipantAvatar("player-1");
  const custom = customParticipantImage("/profiles/existing.jpg");
  assert.equal(custom, BASE_PATH + "/profiles/existing.jpg");
  assert.equal(customParticipantImage(custom!), custom);
  assert.equal(customParticipantImage("https://example.com/profile.jpg"), "https://example.com/profile.jpg");
  for (const source of ["javascript:alert(1)", "//external.example/image.png", "http://external.example/image.png", "data:text/html,<script/>"]) assert.equal(customParticipantImage(source), null);
  assert.equal(availableAvatarSource(custom, generated, []), custom);
  assert.equal(availableAvatarSource(custom, generated, [custom!]), generated);
  assert.equal(availableAvatarSource(custom, generated, [custom!, generated!]), null);
  assert.equal(participantInitials(" Alice Brown "), "AB");
  assert.equal(participantInitials(""), "?");
});

test("role assignments resolve correct identities and combine dual responsibility", () => {
  const roster = [{ id: "a", name: "Ari" }, { id: "b", name: "Bea" }];
  const separate = buildParticipantIdentities(roster, { navigator: "a", answerSubmitter: "b" }, "b");
  assert.equal(separate.current!.displayName, "Bea");
  assert.deepEqual(separate.assignments.map(person => [person.participantId, person.responsibilities]), [["a", ["Navigator"]], ["b", ["Answer-submitter"]]]);
  const both = buildParticipantIdentities(roster, { navigator: "a", answerSubmitter: "a" }, "a");
  assert.equal(both.assignments.length, 1);
  assert.deepEqual(both.assignments[0].responsibilities, ["Navigator", "Answer-submitter"]);
  assert.equal(createParticipantAvatar(both.current!.participantId), createParticipantAvatar(both.assignments[0].participantId));
  assert.equal(both.current!.customImageSrc, undefined);
});

test("returning invitation login retains avatar without any JSON avatar fields", async () => {
  await mkdir(".local", { recursive: true });
  const directory = await mkdtemp(join(process.cwd(), ".local", "shuk-avatar-"));
  const path = join(directory, "state.json");
  try {
    const first = await redeemInvitation(path, await issueInvitation(path, "player-1"));
    const firstId = (await sessionView(path, first)).session.activeActorId;
    await logout(path, first);
    const second = await redeemInvitation(path, await issueInvitation(path, "player-1"));
    const secondId = (await sessionView(path, second)).session.activeActorId;
    assert.equal(firstId, secondId);
    assert.equal(createParticipantAvatar(firstId), createParticipantAvatar(secondId));
    assert.doesNotMatch(await readFile(path, "utf8"), /avatar|imageSrc|<svg/i);
  } finally { await rm(directory, { recursive: true, force: true }); }
});
