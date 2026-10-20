// Mission 00C, the parallel discovery missions (build spec §5, amended 16 Oct 2026): Team A
// plays The Traveler's Prayer and Team B plays Broken Time. Both follow the same steps
// (clue → find → observe → read → answer → reveal), have the same points, hints and guide
// override, and are mandatory. Every string carries its status (see ContentStatus) and every
// statement shown to players carries one evidence label (ClaimType).
//
// Sources (all in docs/National_library/):
//   - new-world_travelers-prayer-and-forerunners-panels.jpeg: the owner's photo of the
//     "Traveler's Prayer" panel in The New World exhibition. The English translation's last
//     words are legible ("…that they may voyage and reach the land of America."); the rest of
//     the panel text is too small in the photo to quote.
//   - broken-time_wall-label.jpeg: the wall label beside the work, quoted verbatim.
//   - guide-app_rovner-broken-time-and-gemara-text.jpeg: the owner's screenshot of the
//     Library's Bloomberg Connects guide, entry "Broken Time, 2009", quoted verbatim.
//   - broken-time_split-stone_01.jpeg: the owner's photo of the work (clue crop and reveal).

import { helpAfterMisses, normalise } from "./answers.ts";
import { investigationOf, type DiscoveryMissionId, type LabelledCopy } from "./library.ts";
import type { ClaimType, Copy, TeamId } from "./types.ts";

const approved = (text: string): Copy => ({ text, status: "approved" });
const draft = (text: string): Copy => ({ text, status: "draft" });
const fixture = (text: string): Copy => ({ text, status: "fixture" });
const labelled = (copy: Copy, claim: ClaimType): LabelledCopy => ({ ...copy, claim });

// ---- Shape ------------------------------------------------------------------------------------

export type DiscoveryPhoto = { src: string; alt: Copy; caption: Copy };
export type DiscoverySource = { id: string; title: Copy; url: string | null; note: Copy };

export type DiscoveryMission = {
  id: DiscoveryMissionId;
  teamId: TeamId;
  code: Copy;
  title: Copy;
  points: number;
  brief: LabelledCopy[];
  clue: { text: Copy; photo: DiscoveryPhoto; action: Copy };
  find: { where: Copy; whereSource: Copy | null; gap: Copy | null; hint: Copy; action: Copy };
  observe: { text: Copy; action: Copy };
  read: { text: Copy; notes: Copy[]; link: { href: string; label: Copy; note: Copy } | null; action: Copy };
  answer: {
    prompt: Copy;
    // A long answer is a sentence or two (a textarea); a short one is a word or a place name.
    long: boolean;
    wrong: Copy;
    hints: Copy[];
    guideAfterMisses: number;
  };
  reveal: {
    heading: Copy;
    photo: DiscoveryPhoto;
    // The object's own label, when there is one, quoted as it appears.
    record: { lines: Copy[]; claim: ClaimType; source: Copy } | null;
    documented: LabelledCopy;
    documentedSource: Copy;
    documentedNote: Copy | null;
    message: LabelledCopy | null;
    // Shows the team's own answer back to them, under this heading.
    showYourReading: boolean;
    harmony: LabelledCopy;
    sources: DiscoverySource[];
  };
  // An optional, ungraded personal reflection after the reveal. It is never scored or saved.
  reflect: { heading: Copy; prompt: Copy; note: Copy } | null;
};

export type DiscoveryStep = "brief" | "clue" | "find" | "observe" | "read" | "answer" | "reveal" | "reflect";

// A team's accepted answer, kept so a finished mission reopens on its reveal. The guide's
// override records an empty answer.
export type DiscoveryResult = { answer: string; solvedBy: "players" | "guide" };

// Labels shared by both missions.
export const discoveryLabels = {
  steps: {
    clue: draft("Clue"),
    find: draft("Find"),
    observe: draft("Observe"),
    read: draft("Read"),
    answer: draft("Answer"),
    reveal: draft("Reveal"),
    reflect: draft("Reflect"),
  } satisfies Record<Exclude<DiscoveryStep, "brief">, Copy>,
  briefNext: draft("Continue"),
  briefStart: draft("Start the search"),
  hint: draft("Need a hint?"),
  check: draft("Check"),
  guideConfirm: draft("Guide: confirm and reveal"),
  guideSolved: draft("Confirmed by your guide."),
  yourReading: draft("Your reading"),
  sources: draft("Sources"),
  continue: draft("Continue"),
  reflectFinish: draft("Finish"),
  reflectSkip: draft("Skip"),
  finish: draft("Finish the investigation"),
};

const GUIDE_AFTER_MISSES = 3;
const POINTS = 10;

// ---- Team A: The Traveler's Prayer -------------------------------------------------------------

const travelersPrayer: DiscoveryMission = {
  id: "travelersPrayer",
  teamId: "A",
  code: approved("Mission 00C"),
  title: investigationOf("A").title,
  points: POINTS,
  brief: [
    labelled(draft("Memory Keepers, I found a prayer written by hand for a journey across the ocean."), "fiction"),
    labelled(draft("I erased where the travellers were going, and why they had to leave."), "fiction"),
    labelled(draft("Find the prayer. Tell me where they hoped to arrive."), "fiction"),
  ],
  clue: {
    text: draft("These lines of handwriting belong to the prayer. Find the panel that displays them."),
    photo: {
      src: "/library/travelers-prayer-clue.jpg",
      alt: draft("Lines of Hebrew handwriting in blue ink, enlarged from a manuscript page."),
      caption: fixture("Detail of the owner's photo of the exhibition panel. Reuse rights not yet confirmed."),
    },
    action: draft("Start looking"),
  },
  find: {
    where: draft("The New World exhibition. Look for the panel titled “Traveler's Prayer”."),
    whereSource: null,
    gap: fixture("TODO(copy): the exhibition's level and the route from the timeline wall are not yet recorded."),
    hint: draft("The panel's title is in Hebrew, Arabic and English, above a handwritten page."),
    action: draft("We found it"),
  },
  observe: {
    text: draft("Match the clue to the panel: find the same lines of handwriting. Then read the panel's title."),
    action: draft("We matched it"),
  },
  read: {
    text: draft("Read the English translation of the prayer printed on the panel, all the way to its last words."),
    notes: [],
    link: null,
    action: draft("We've read it"),
  },
  answer: {
    prompt: draft("Where were the travellers in this prayer hoping to arrive?"),
    long: false,
    wrong: draft("Not this place. Read the last words of the prayer's translation again."),
    hints: [
      draft("Look at the small heading at the top of the panel."),
      draft("The prayer ends by naming the land the ship should reach."),
    ],
    guideAfterMisses: GUIDE_AFTER_MISSES,
  },
  reveal: {
    heading: draft("America"),
    photo: {
      src: "/library/travelers-prayer-panel.jpg",
      alt: draft("The exhibition panel “Traveler's Prayer”, headed “Jewish Immigration to the United States”, with a handwritten page, two pictures and an enlarged reproduction of the handwriting."),
      caption: fixture("Owner's photo of the panel, October 2026. Reuse rights not yet confirmed."),
    },
    record: null,
    documented: labelled(draft("“…that they may voyage and reach the land of America.”"), "historicalFact"),
    documentedSource: draft("The last words of the prayer's English translation, on the “Traveler's Prayer” panel, The New World exhibition, National Library of Israel."),
    documentedNote: fixture("Transcribed from a low-resolution photo of the panel. Check the wording against the panel before the pilot."),
    message: labelled(draft("Memories and traditions can travel with people. A prayer for the journey crossed the ocean with them."), "interpretation"),
    showYourReading: false,
    harmony: labelled(draft("I thought a memory belonged to a place, and that erasing the place would erase the memory. But people carry their memories with them."), "fiction"),
    sources: [
      {
        id: "travelersPrayerPanel",
        title: approved("“Traveler's Prayer” panel, The New World exhibition, National Library of Israel"),
        url: null,
        note: fixture("Read from the owner's site photo, October 2026. The item's catalogue details on the panel are not legible in the photo."),
      },
    ],
  },
  reflect: {
    heading: draft("A memory to carry"),
    prompt: draft("If your family had to pack for a long journey, which one object would you carry to keep its memory?"),
    note: draft("Optional and not scored. It stays on this phone and is not saved."),
  },
};

// ---- Team B: Broken Time -------------------------------------------------------------------------

const BLOOMBERG_GUIDE = "https://guides.bloombergconnects.org/en-US/guide/nationalLibraryisrael";

const brokenTime: DiscoveryMission = {
  id: "brokenTime",
  teamId: "B",
  code: approved("Mission 00C"),
  title: investigationOf("B").title,
  points: POINTS,
  brief: [
    labelled(draft("Memory Keepers, I smoothed every crack out of your history."), "fiction"),
    labelled(draft("One object in this building will not be smoothed. It has been split in two."), "fiction"),
    labelled(draft("Find it, and tell me what its fracture means."), "fiction"),
  ],
  clue: {
    text: draft("A detail of an artwork in this building. Find the whole of it."),
    photo: {
      src: "/library/broken-time-clue.jpg",
      alt: draft("Close-up of pale stone incised with rings of small marks, divided by a dark crack."),
      caption: fixture("Detail of the owner's photo of the work. Reuse rights not yet confirmed."),
    },
    action: draft("Start looking"),
  },
  find: {
    // Verbatim from the Library's digital guide.
    where: approved("This work can be found in the Russell Berrie Entrance Hall on level -2."),
    whereSource: approved("National Library of Israel digital guide (Bloomberg Connects)"),
    gap: null,
    hint: draft("Look down: the work rests on the floor."),
    action: draft("We found it"),
  },
  observe: {
    text: draft("Walk around the stone. Look at the rings carved into its surface, and at where it breaks."),
    action: draft("We've looked closely"),
  },
  read: {
    text: draft("Scan the Library's QR code for its free digital guide, Bloomberg Connects, and read the entry for Broken Time. Then come back here."),
    notes: [
      fixture("Whether a QR code stands beside the work has not been confirmed. The owner's photos show the Library's QR code on its Bloomberg Connects sign."),
      draft("No signal or no camera? Ask your guide to read the entry with you."),
    ],
    link: {
      href: BLOOMBERG_GUIDE,
      label: draft("Open the Library's digital guide"),
      note: fixture("Link from the project's research notes; not yet opened. Players should use the Library's own QR code."),
    },
    action: draft("We've read it"),
  },
  answer: {
    prompt: draft("What does the fracture in the stone evoke?"),
    long: true,
    wrong: draft("Keep going: say in a sentence what the break in the stone stands for."),
    hints: [
      draft("Think of the circle as time. What happens when it breaks?"),
      draft("The guide links the crack to a broken object from the Sinai story, and to rifts in human history."),
    ],
    guideAfterMisses: GUIDE_AFTER_MISSES,
  },
  reveal: {
    heading: approved("Broken Time, 2009"),
    photo: {
      src: "/library/broken-time-full.jpg",
      alt: draft("A round, pale stone basin, incised with rings of marks and split into two halves, resting on a wooden floor."),
      caption: fixture("Owner's photo of the work, October 2026. Reuse rights not yet confirmed."),
    },
    record: {
      lines: [
        approved("Michal Rovner, Israeli, born 1957"),
        approved("Broken Time, 2009"),
        approved("Ancient stone with video projection"),
        approved("On extended loan from the artist"),
      ],
      claim: "historicalFact",
      source: approved("Wall label beside the work"),
    },
    documented: labelled(
      approved("The round stone represents time as a whole, the eternity of the world, the annual seasons, and the cycle of nature. The crack at its center echoes the breaking of the tablets of the covenant at Sinai, representing the essential rifts and gaps the human race has dealt with throughout history – down to our very day."),
      "interpretation",
    ),
    documentedSource: approved("National Library of Israel digital guide (Bloomberg Connects), entry “Broken Time, 2009”."),
    documentedNote: null,
    message: null,
    showYourReading: true,
    harmony: labelled(draft("I treated every fracture as damage, and erased it. But a fracture you can see is one you can study, and learn to live beside. Understanding a break is how you keep from repeating it."), "fiction"),
    sources: [
      {
        id: "brokenTimeGuide",
        title: approved("National Library of Israel digital guide (Bloomberg Connects): Broken Time, 2009"),
        url: BLOOMBERG_GUIDE,
        note: fixture("Quoted from the owner's screenshot of the guide, October 2026. The link is the guide's home, not the entry, and has not been opened."),
      },
      {
        id: "brokenTimeLabel",
        title: approved("Wall label, Broken Time, Russell Berrie Entrance Hall, level −2"),
        url: null,
        note: fixture("Quoted from the owner's site photo, October 2026."),
      },
    ],
  },
  reflect: null,
};

export const discoveryMissions: Record<TeamId, DiscoveryMission> = { A: travelersPrayer, B: brokenTime };

// ---- Steps and help ------------------------------------------------------------------------------

const ALL_STEPS: DiscoveryStep[] = ["brief", "clue", "find", "observe", "read", "answer", "reveal", "reflect"];

// The steps a mission plays, in order. Only a mission with a reflection has that step.
export function discoverySteps(mission: DiscoveryMission): DiscoveryStep[] {
  return ALL_STEPS.filter((step) => step !== "reflect" || mission.reflect !== null);
}

export function discoveryHelp(mission: DiscoveryMission, misses: number): { hint: Copy | null; guide: boolean } {
  return helpAfterMisses(mission.answer.hints, mission.answer.guideAfterMisses, misses);
}

// ---- Answer checks (pure and deterministic; no model) -------------------------------------------

// Team A: the journey's destination. English or Hebrew, with or without "the" / "to", any
// punctuation or spacing ("U.S.A.", "the United States", "ארה״ב").
const DESTINATIONS = [
  "America", "North America", "Amerika", "the land of America", "United States", "United States of America",
  "USA", "US", "אמריקה", "אמריקא", "לאמריקה", "לאמריקא", "ארצות הברית", "לארצות הברית", "ארהב", "לארהב",
].map((d) => normaliseDestination(d));

// Longest prefix first, so "to the United States" loses both words.
function normaliseDestination(input: string): string {
  return normalise(input.replace(/[.,!?'"״׳“”‘’]/g, "")).replace(/^(TOTHE|THE|TO)(?=.)/, "");
}

export function isTravelersPrayerDestination(input: string): boolean {
  const given = normaliseDestination(input);
  return given.length > 0 && DESTINATIONS.includes(given);
}

// Team B: an interpretation, not a fixed answer. Accept any reading of at least three words
// that names a rupture, division or conflict (the owner's brief), in English or Hebrew.
// Anything else gets a hint, and the guide can always confirm a reading the list misses.
const RUPTURE_STEMS = [
  "rupt", "rift", "break", "broke", "crack", "fractur", "split", "divid", "divis", "separat", "conflict",
  "fight", "quarrel", "disagree", "dispute", "schism", "tablet", "sinai", "destr", "shatter", "violen",
  "trauma", "polari", "exile", "disrupt", "partition",
];
const RUPTURE_WORDS = ["war", "wars", "gap", "gaps", "torn", "tear", "tears"];
const RUPTURE_HEBREW = ["שבר", "סדק", "קרע", "פיצול", "פילוג", "מחלוקת", "סכסוך", "מלחמ", "לוחות", "שסע", "פער"];
const MIN_WORDS = 3;

export function isBrokenTimeReading(input: string): boolean {
  const text = input.normalize("NFKC").toLowerCase();
  const words = text.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  if (words.length < MIN_WORDS) return false;
  if (RUPTURE_HEBREW.some((stem) => text.includes(stem))) return true;
  return words.some((word) => RUPTURE_WORDS.includes(word) || RUPTURE_STEMS.some((stem) => word.startsWith(stem)));
}

export function checkDiscoveryAnswer(teamId: TeamId, input: string): boolean {
  return teamId === "A" ? isTravelersPrayerDestination(input) : isBrokenTimeReading(input);
}
