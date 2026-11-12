import test from "node:test";
import assert from "node:assert/strict";
import { cleanTeamName, TEAM_NAME_COPY, teamInitials, teamNameKey, teamNameMessage, teamNameSuggestions, validateTeamName } from "./team-name.ts";

test("team names: cleaned, 20 characters at most, Latin letters with a few marks, a content check, unique by key (owner, 31 Oct 2026)", () => {
  assert.equal(cleanTeamName("  Falafel   Fugitives "), "Falafel Fugitives");
  assert.deepEqual(validateTeamName("  Falafel   Fugitives "), { ok: true, name: "Falafel Fugitives", key: "falafel fugitives" });
  assert.deepEqual(validateTeamName("   "), { ok: false, error: "empty" });
  assert.deepEqual(validateTeamName("Halva Main Character"), { ok: true, name: "Halva Main Character", key: "halva main character" }, "20 is allowed");
  assert.deepEqual(validateTeamName("Halva Main Characters"), { ok: false, error: "tooLong" });
  for (const bad of ["🧆 Crew", "חבורה", "123", "Crew<script>", "Tab\tCrew\u0007"]) assert.equal(validateTeamName(bad).ok, false, bad);
  assert.equal(validateTeamName("Rock & Roll Crew!").ok, true);
  assert.deepEqual(validateTeamName("Shit Squad"), { ok: false, error: "notAllowed" });
  // One name, however it's spelled: accents, case, spaces and the curly apostrophe.
  assert.equal(teamNameKey("Café  Crew"), teamNameKey("CAFE crew"));
  assert.equal(teamNameKey("Za’atar Squad"), teamNameKey("Za'atar Squad"));
  assert.deepEqual(validateTeamName("cafe crew", new Set([teamNameKey("Café Crew")])), { ok: false, error: "unavailable" });
  assert.equal(teamNameMessage("unavailable"), "That name's taken. Try another!");
  assert.equal(TEAM_NAME_COPY.success("Falafel Fugitives"), "You're Falafel Fugitives!");
});

test("suggestions: Falafel Fugitives first while free, never one another team holds; initials stand in for the avatar", () => {
  assert.equal(teamNameSuggestions(new Set())[0], "Falafel Fugitives");
  assert.equal(teamNameSuggestions(new Set()).length, 5);
  const taken = new Set([teamNameKey("Falafel Fugitives")]);
  assert.ok(!teamNameSuggestions(taken).includes("Falafel Fugitives"));
  assert.ok(teamNameSuggestions(new Set()).every(name => validateTeamName(name).ok && !/kada|mufleta/i.test(name)));
  assert.deepEqual([teamInitials("Falafel Fugitives", "B"), teamInitials(null, "C"), teamInitials("Café", "D")], ["FF", "C", "C"]);
});
