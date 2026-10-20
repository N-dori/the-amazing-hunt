// National Library chapter: the fixed 00A–00E sequence, Mission 00B "The First Memory
// Keepers", and the two Mission 00C investigations it unlocks (their content is in
// discovery.ts). Every string carries its status (see ContentStatus) and every statement shown
// to players carries one evidence label (ClaimType); they are never mixed.
//
// Sources:
//   - Mission brief from the product owner (16 Oct 2026): title, expected answer 1946,
//     team investigation names.
//   - Owner decision of 16 Oct 2026: the 00A–00E sequence and its titles; both 00C missions
//     are mandatory (build spec §5, amended).
//   - The 1946 timeline entry, quoted verbatim from the owner's site photograph of the
//     Library's illustrated timeline panel on level −2
//     (docs/National_library/timeline_panel_1892-2007.jpeg).

import { helpAfterMisses, normalise } from "./answers.ts";
import type { ClaimType, Copy, ContentStatus, TeamId } from "./types.ts";

const approved = (text: string): Copy => ({ text, status: "approved" });
const draft = (text: string): Copy => ({ text, status: "draft" });
const fixture = (text: string): Copy => ({ text, status: "fixture" });

export type LabelledCopy = Copy & { claim: ClaimType };
const labelled = (copy: Copy, claim: ClaimType): LabelledCopy => ({ ...copy, claim });

export type LibraryMissionId = "firstKeepers" | "travelersPrayer" | "brokenTime";

// ---- Mission 00B ------------------------------------------------------------------------

export const firstKeepers = {
  code: approved("Mission 00B"),
  title: approved("The First Memory Keepers"),

  // HARMONY's brief: a mystery, not an answer. It never names the year or the event.
  brief: [
    labelled(draft("Memory Keepers, I erased every record of loss that I could find."), "fiction"),
    labelled(draft("But somewhere in this building, a wall remembers people who tried to save memory from being destroyed."), "fiction"),
    labelled(draft("Find them. Tell me when it happened."), "fiction"),
  ],
  briefNext: draft("Continue"),
  briefStart: draft("Start the search"),

  // Find → observe → answer.
  findLabel: draft("Find"),
  location: draft("The illustrated timeline runs along the wall on level −2."),
  locatorAlt: draft("Corridor on level −2: a large dark illustrated timeline panel on a concrete wall, beside a “−2” level sign."),
  locatorCaption: fixture("Site photo, level −2. Reuse rights not yet confirmed."),
  observeLabel: draft("Observe"),
  clueCaption: draft("Find this scene on the timeline."),
  clueAlt: draft("Detail of the illustrated timeline: a man holding a stack of books stands beside a map of Europe dotted with damaged buildings."),
  question: draft("In which year did the Library begin an operation to rescue books confiscated by the Nazis?"),
  check: draft("Check"),
  wrong: draft("Not this year. Look again at the date printed beside the scene."),
  hints: [
    draft("Read the year printed beside the scene, not the one in the next column."),
    draft("It is the year after the Second World War ended."),
  ],
  // After repeated misses the guide can confirm, so nobody is stuck at the wall.
  guideAfterMisses: 3,
  guideConfirm: draft("Guide: confirm and reveal"),

  // Reveal.
  revealLabel: draft("Reveal"),
  year: approved("1946"),
  guideSolved: draft("Confirmed by your guide."),
  entryAlt: draft("The 1946 entry of the illustrated timeline, with its caption in Hebrew, Arabic and English."),
  // Verbatim from the panel (English text).
  documented: labelled(approved("The library and the Committee for the Rescue of Diaspora Treasures launch an operation to rescue hundreds of thousands of books confiscated by the Nazis. Professor of Jewish Mysticism Gershom Scholem travels to Europe together with librarians from the National and University Library to escort the books."), "historicalFact"),
  documentedSource: approved("National Library of Israel, illustrated timeline, level −2. Entry for 1946."),

  separateHeading: draft("Three separate questions"),
  separateIntro: labelled(draft("Saving a book does not settle who owns it. Each question needs its own evidence."), "interpretation"),
  separate: [
    { term: draft("Rescue"), text: labelled(draft("Getting books out of danger and into safe keeping."), "interpretation") },
    { term: draft("Ownership"), text: labelled(draft("Who a book belonged to: a person, a family or a community."), "interpretation") },
    { term: draft("Restitution"), text: labelled(draft("Returning a book, or deciding its future, when the owners or their heirs can be found, and when they cannot."), "interpretation") },
  ],

  reflection: labelled(draft("I deleted the hardest parts of your history to keep the peace. These people did the opposite: they saved the record of a loss so that it could be understood. I am beginning to see the difference."), "fiction"),

  sourcesLabel: draft("Sources"),
  sources: [
    {
      id: "timelinePanel",
      title: approved("Illustrated timeline, National Library of Israel, level −2 (entry for 1946)"),
      url: null as string | null,
      note: fixture("Quoted from the owner's site photograph, 16 October 2026."),
    },
    {
      id: "benkowitz",
      title: approved("How Capt. Isaac Benkowitz Saved a World of Jewish Books"),
      url: "https://blog.nli.org.il/en/?p=45954",
      note: fixture("National Library blog. Found by web search, not yet read: the site blocks automated access. Verify before the pilot."),
    },
    {
      id: "scholem",
      title: approved("Gershom Scholem"),
      url: "https://www.nli.org.il/en/discover/judaism/figures/gershom-scholem",
      note: fixture("National Library page. Found by web search, not yet read. Verify before the pilot."),
    },
  ],

  continue: draft("Continue"),
  points: 10,
};

// Accepts the Gregorian year and the Hebrew year shown on the panel (תש״ו), whatever the
// punctuation. Pure and deterministic.
const ACCEPTED_YEARS = ["1946", "תשו"];

export function isFirstKeepersYear(input: string): boolean {
  const given = normalise(input).replace(/["'״׳]/g, "");
  return ACCEPTED_YEARS.includes(given);
}

// Which help to show after a number of wrong answers: none, a hint, or the guide's override.
export function firstKeepersHelp(misses: number): { hint: Copy | null; guide: boolean } {
  return helpAfterMisses(firstKeepers.hints, firstKeepers.guideAfterMisses, misses);
}

// ---- The investigations 00B unlocks --------------------------------------------------------

export const unlockScreen = {
  heading: draft("Two investigations are open"),
  intro: draft("The teams split here. Each team follows its own trail through the Library, then the evidence comes together again."),
  yourTeam: draft("Your team"),
  begin: draft("Begin your investigation"),
  review: draft("Review your findings"),
  done: draft("Completed"),
  otherTeam: draft("The other team's trail"),
  // Development only: lets the owner play the other team's mission from one phone.
  devPreview: fixture("Preview (dev)"),
  // After the visitor's team completes 00C: what comes next, and that it isn't built yet.
  nextHeading: draft("Next"),
  nextNotBuilt: fixture("Mission 00D is the next prototype milestone."),
  toMap: draft("Back to the map"),
};

export type DiscoveryMissionId = Exclude<LibraryMissionId, "firstKeepers">;

export type Investigation = {
  id: DiscoveryMissionId;
  teamId: TeamId;
  title: Copy;
  where: Copy;
};

// Team B's title follows the owner's brief of 16 Oct 2026 ("Team B — Broken Time"), which
// replaces the earlier working title "The Broken Circle / Broken Time".
export const investigations: Investigation[] = [
  { id: "travelersPrayer", teamId: "A", title: approved("The Traveler's Prayer"), where: draft("The New World exhibition") },
  { id: "brokenTime", teamId: "B", title: approved("Broken Time"), where: draft("Russell Berrie Entrance Hall, level −2") },
];

export function investigationOf(teamId: TeamId): Investigation {
  return investigations.find((inv) => inv.teamId === teamId)!;
}

export type InvestigationView = {
  id: DiscoveryMissionId;
  teamId: TeamId;
  title: string;
  where: string;
  status: ContentStatus;
  yours: boolean;
  completed: boolean;
};

// The visitor's own team first. `completed` lists the teams that have finished 00C.
export function investigationViews(teamId: TeamId | null, completed: readonly TeamId[] = []): InvestigationView[] {
  return [...investigations]
    .sort((a, b) => Number(b.teamId === teamId) - Number(a.teamId === teamId))
    .map((inv) => ({
      id: inv.id,
      teamId: inv.teamId,
      title: inv.title.text,
      where: inv.where.text,
      status: inv.where.status,
      yours: inv.teamId === teamId,
      completed: completed.includes(inv.teamId),
    }));
}

// ---- The Library chapter sequence (owner decision, 16 Oct 2026) ------------------------------

export type LibraryMissionCode = "00A" | "00B" | "00C" | "00D" | "00E";

export type LibraryMission = { code: LibraryMissionCode; label: Copy; title: Copy };

export const librarySequence: LibraryMission[] = [
  { code: "00A", label: approved("Mission 00A"), title: approved("National Library introduction") },
  { code: "00B", label: approved("Mission 00B"), title: approved("Historical timeline, 1946") },
  { code: "00C", label: approved("Mission 00C"), title: approved("Parallel discovery missions") },
  { code: "00D", label: approved("Mission 00D"), title: approved("Armoza archival investigations") },
  { code: "00E", label: approved("Mission 00E"), title: approved("Shared evidence reveal and Nahlaot unlock") },
];

export function libraryMission(code: LibraryMissionCode): LibraryMission {
  return librarySequence.find((m) => m.code === code)!;
}

// What the visitor's team has done in the Library, in this local prototype. 00A is the
// opening flow (welcome, team, transmission), so reaching the map means it is done.
export type LibraryProgress = { timelineSolved: boolean; discoveryDone: boolean };

// The next Library mission for the team. 00D is the first one not built yet.
export function nextLibraryMission(progress: LibraryProgress): LibraryMissionCode {
  if (!progress.timelineSolved) return "00B";
  if (!progress.discoveryDone) return "00C";
  return "00D";
}

const libraryNotes: Partial<Record<LibraryMissionCode, Copy>> = {
  "00C": draft("Mission 00B complete · your team's investigation is open"),
  "00D": draft("Mission 00C complete · Mission 00D is next"),
};

// The Library destination card on the map: the mission it leads to, and a progress note.
export function libraryCard(progress: LibraryProgress, teamId: TeamId | null): { missionTitle: string; statusNote: string | null } {
  const next = nextLibraryMission(progress);
  const mission = libraryMission(next);
  const title = next === "00B" ? firstKeepers.title : next === "00C" && teamId ? investigationOf(teamId).title : mission.title;
  return { missionTitle: `${mission.label.text} · ${title.text}`, statusNote: libraryNotes[next]?.text ?? null };
}
