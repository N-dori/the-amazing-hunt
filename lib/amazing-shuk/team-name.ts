/**
 * Team names (I7a, owner, 31 Oct 2026). The same steps run on the phone, for instant feedback, and on the server, whose answer is final:
 * clean, empty, length, characters, content, unique. See the multiplayer plan's "I7a team names".
 */

export const TEAM_NAME_MAX = 20;

/** The approved copy (O16, owner, 31 Oct 2026). "Saving…", "Change team name" and the after-Start line were approved earlier. */
export const TEAM_NAME_COPY = Object.freeze({
  heading: "Name your team",
  description: "Make up a name or pick a Shuk favorite!",
  field: "Team name",
  suggestions: "Need inspiration?",
  confirm: "Confirm name",
  empty: "Enter a team name.",
  tooLong: "Keep it under 20 characters.",
  unavailable: "That name's taken. Try another!",
  notAllowed: "Choose a different name.",
  success: (name: string) => `You're ${name}!`,
  saving: "Saving your team name…",
  change: "Change team name",
  afterStart: "Ask your guide to change your team name.",
});

export type TeamNameError = "empty" | "tooLong" | "notAllowed" | "unavailable";
export type TeamNameResult = Readonly<{ ok: true; name: string; key: string }> | Readonly<{ ok: false; error: TeamNameError }>;

/** Step 1: Unicode NFC, trimmed, every run of whitespace one space. */
export function cleanTeamName(raw: string): string {
  return raw.normalize("NFC").trim().replace(/\s+/gu, " ");
}

/** The comparison key: decomposed, accents removed, lower-cased without locale rules, ’ read as '. "Café Crew" = "cafe  crew". */
export function teamNameKey(name: string): string {
  return cleanTeamName(name).normalize("NFKD").replace(/\p{M}/gu, "").replace(/’/gu, "'").toLowerCase();
}

const graphemes = (text: string) => {
  try { return [...new Intl.Segmenter("en", { granularity: "grapheme" }).segment(text)].length; } catch { return [...text].length; }
};

// Latin letters (accents included), digits, spaces and ' ’ - & . ! only, with at least one letter. Nothing else: no emoji, no other script.
const ALLOWED = /^[\p{Script=Latin}\p{M}0-9 '’\-&.!]+$/u;
const LETTER = /\p{Script=Latin}/u;

/** A small blocklist, matched as whole words on the comparison key. Not promised complete: the guide's rename is the backstop. */
const BLOCKED: readonly string[] = Object.freeze(["fuck", "fucking", "shit", "bitch", "cunt", "dick", "cock", "pussy", "asshole", "bastard",
  "nazi", "nazis", "hitler", "slut", "whore", "rape", "nigger", "nigga", "fag", "faggot", "retard", "kike", "terrorist"]);
const blocked = (key: string) => key.split(/[^a-z0-9']+/u).some(word => BLOCKED.includes(word) || BLOCKED.includes(word.replace(/'/gu, "")));

/** Steps 1–6. `takenKeys` holds the other teams' keys in this adventure (never the team's own). */
export function validateTeamName(raw: string, takenKeys: ReadonlySet<string> = new Set()): TeamNameResult {
  const name = cleanTeamName(raw);
  if (!name) return { ok: false, error: "empty" };
  if (graphemes(name) > TEAM_NAME_MAX) return { ok: false, error: "tooLong" };
  if (!ALLOWED.test(name) || !LETTER.test(name)) return { ok: false, error: "notAllowed" };
  const key = teamNameKey(name);
  if (blocked(key)) return { ok: false, error: "notAllowed" };
  if (takenKeys.has(key)) return { ok: false, error: "unavailable" };
  return { ok: true, name, key };
}

export const teamNameMessage = (error: TeamNameError) => TEAM_NAME_COPY[error];

/**
 * The suggestions, from the owner's name bank (design/inputs/content/Amazing_Shuk_Team_Name_Bank_Contemporary_English.md, the 12
 * featured names, copied deliberately). Foods whose route claims aren't checked (kada, mufleta) are left out. Falafel Fugitives always
 * comes first while it's free; a name another team holds isn't offered.
 */
export const TEAM_NAME_SUGGESTIONS: readonly string[] = Object.freeze(["Falafel Fugitives", "Sabich Side Quest", "Rugelach on the Run",
  "Bourekas Boss Mode", "Tahini Vibe Check", "Kubbeh Chaos Crew", "Halva Main Character", "Knafeh Unfiltered", "Pickle Plot Twist",
  "Olive Squad Goals", "Pomegranate Glow Up", "Baklava No Cap"]);
export function teamNameSuggestions(takenKeys: ReadonlySet<string>, count = 5): readonly string[] {
  return TEAM_NAME_SUGGESTIONS.filter(name => !takenKeys.has(teamNameKey(name))).slice(0, count);
}

/** The team's initials for its avatar's stand-in (owner, 6 Nov 2026: initials until the artwork exists): two letters at most. */
export function teamInitials(name: string | null, teamId: string): string {
  const words = (name ?? "").split(" ").filter(word => /\p{L}/u.test(word));
  if (!words.length) return teamId.slice(0, 2).toUpperCase();
  return words.slice(0, 2).map(word => [...word.normalize("NFC")][0]).join("").toUpperCase();
}
