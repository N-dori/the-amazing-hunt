import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { readLinkFragment } from "./link-fragment.ts";

test("a sign-in link is read from the page fragment, with or without its #", () => {
  assert.deepEqual(readLinkFragment("#invite=abc_DEF-123"), { kind: "invite", value: "abc_DEF-123" });
  assert.deepEqual(readLinkFragment("invite=abc"), { kind: "invite", value: "abc" });
  assert.deepEqual(readLinkFragment("#join=xyz"), { kind: "join", value: "xyz" });
});

test("an invitation wins over a join link in the same fragment", () => {
  assert.deepEqual(readLinkFragment("#join=xyz&invite=abc"), { kind: "invite", value: "abc" });
});

test("no fragment, an empty value or anything else is no link", () => {
  for (const hash of ["", "#", "#invite=", "#join=", "#invite=&join=", "#top", "#map=1"]) assert.equal(readLinkFragment(hash), null, hash);
});

test("the page reads a link pasted into an open tab too, not only when it first opens", () => {
  const source = readFileSync("components/amazing-shuk/dev/IndexWaterTask.tsx", "utf8");
  assert.match(source, /readLinkFragment\(window\.location\.hash\)/);
  assert.match(source, /addEventListener\("hashchange", take\)/);
  assert.match(source, /removeEventListener\("hashchange", take\)/);
  assert.doesNotMatch(source, /new URLSearchParams\(window\.location\.hash/);
});
