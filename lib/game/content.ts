// Content for Prototype 01. Every string carries its status (see ContentStatus in types.ts):
//   approved: quoted from Story V1 or the approved build spec without change
//   draft:    written for the prototype from approved facts; wording needs the owner's approval
//   fixture:  a stand-in for something not yet verified (asset, location, answer, clue)
// Sources: docs/scavenger_hunt/The_Memory_Protocol_Story_V1(1).md and
// docs/DORI_Memory_Protocol_Approved_Build_Spec_v1.md (sections in brackets below).

import type { ArchiveSource, ArchiveTrack, Copy, Crisis, Question, Site, SiteId, TeamId } from "./types.ts";

const approved = (text: string): Copy => ({ text, status: "approved" });
const draft = (text: string): Copy => ({ text, status: "draft" });
const fixture = (text: string): Copy => ({ text, status: "fixture" });

// ---- Story transmission (Story V1, verbatim) ------------------------------------------------

export const transmission: { heading: Copy; body: Copy }[] = [
  {
    heading: approved("The Discovery"),
    body: approved("In the near future, a quantum breakthrough allows scientists to observe a parallel Earth, almost identical to ours, where humanity has suffered centuries of wars over land, resources, religion, and identity."),
  },
  {
    heading: approved("The Visitors"),
    body: approved("An advanced extraterrestrial civilization called the Israelianes arrives from a distant galaxy. Having achieved extraordinary harmony on their home planet, they are horrified by humanity's endless conflicts and decide to help."),
  },
  {
    heading: approved("The Great Reset"),
    body: approved("Believing that memories of hatred and conflict are the root cause of war, the Israelianes activate HARMONY, a powerful quantum system aboard their spacecraft. In one worldwide transmission, it rewrites human memory and historical records, replacing wars, violence, injustice, and suffering with a fabricated history in which humanity has always lived in perfect peace."),
  },
  {
    heading: approved("The Illusion"),
    body: approved("At first, the intervention seems successful. People believe that peaceful coexistence has always been natural and effortless. But when new disagreements inevitably arise, humanity has no historical experience of dealing with conflict or learning from past mistakes."),
  },
  {
    heading: approved("The Catastrophe"),
    body: approved("Conflicts escalate into even greater violence. The Israelianes realize their devastating mistake: they removed the memory of conflict, but not the human capacity to create it."),
  },
  {
    heading: approved("The Last Hope"),
    body: approved("Scientists in our universe discover that authentic fragments of the parallel Earth's history can be reconstructed by comparing surviving evidence with records from our own world. Their investigation begins in Jerusalem, at the National Library of Israel, where historical documents connect to real buildings, neighborhoods, people, and traditions."),
  },
];

export const mission: Copy = approved("You are the Memory Keepers. Your mission is to recover authentic historical evidence from the National Library, record its identifying codes, and follow the clues through Jerusalem's neighborhoods and Mahane Yehuda Market. At each location, uncover the real story, verify the evidence, and restore another fragment of humanity's lost memory.");

export const moral: Copy = approved("Peace is not achieved by forgetting our differences or erasing painful history. It is built by understanding one another and learning from the past.");

export const title: Copy = approved("The Memory Protocol");
export const tagline: Copy = approved("They rewrote the past to create peace. Instead, they created chaos.");

// ---- Sites [4, 7, 8, 11] -------------------------------------------------------------------
// No site has a field-verified coordinate yet [16], so geo is null everywhere and arrival can
// only be confirmed by observation or by the guide. mapPoint positions are on the
// development fixture map, not geography.

export const MAP_SIZE = { width: 1600, height: 1100 };

export const sites: Record<SiteId, Site> = {
  library: {
    id: "library",
    name: approved("National Library of Israel"),
    mapPoint: { x: 260, y: 520 },
    geo: null,
    nearMeters: 30,
    uncertainMeters: 80,
    clue: fixture("Briefing point outside the Library. Exact gathering spot not yet set."),
    hints: [],
  },
  pictureInStone: {
    id: "pictureInStone",
    name: approved("Picture in Stone (תמונה באבן)"),
    mapPoint: { x: 900, y: 430 },
    geo: null,
    nearMeters: 30,
    uncertainMeters: 80,
    clue: fixture("Navigation clue not written: the wall and image have not been field-verified."),
    hints: [fixture("Hint not written: target unverified.")],
  },
  synagogue: {
    id: "synagogue",
    name: approved("Hesed VeRahamim synagogue"),
    mapPoint: { x: 1060, y: 610 },
    geo: null,
    nearMeters: 30,
    uncertainMeters: 80,
    clue: fixture("Navigation clue not written: public viewing point and GPS pin still to be verified."),
    hints: [
      fixture("Hint 1 not written: depends on the verified viewing point."),
      fixture("Hint 2 not written: depends on the verified viewing point."),
    ],
  },
  borekas: {
    id: "borekas",
    name: approved("Hakmat HaBorekas MeHaifa (חכמת הבורקס מחיפה)"),
    mapPoint: { x: 1320, y: 360 },
    geo: null,
    nearMeters: 30,
    uncertainMeters: 80,
    clue: fixture("Route not written: vendor address and hours still to be checked."),
    hints: [],
  },
};

export const ROUTE: SiteId[] = ["library", "pictureInStone", "synagogue", "borekas"];

// ---- Scoring [12] --------------------------------------------------------------------------
// Configurable. Both teams have the same maximum.

export const SCORING = {
  navigation: { independent: 20, hint: 15, external: 10 },
  // Navigation bonus is earned once per scored site.
  navigationSites: ["pictureInStone", "synagogue"] as SiteId[],
  rubricMaxPerCriterion: 5,
};

// ---- Archive [6] ---------------------------------------------------------------------------

export const archiveSources: Record<string, ArchiveSource> = {
  withoutInscription: {
    id: "withoutInscription",
    referenceCode: "IL-INL-YBZ-0024-004",
    systemId: "997009637209805171",
    url: "https://www.nli.org.il/he/archives/nnl_archive_al997009637209805171/NLI",
    title: draft("Photograph without inscription (Armoza family collection, Yad Yitzhak Ben-Zvi)"),
    rightsCleared: false,
    datedAs: approved("circa 1939–1945"),
  },
  withInscription: {
    id: "withInscription",
    referenceCode: "IL-INL-YBZ-0024-009",
    systemId: "997009637209005171",
    url: "https://www.nli.org.il/he/archives/NNL_ARCHIVE_AL997009637209005171/NLI",
    title: draft("Photograph with inscription (Armoza family collection, Yad Yitzhak Ben-Zvi)"),
    rightsCleared: false,
    datedAs: approved("circa 1939–1945"),
  },
};

const archiveA: Question[] = [
  {
    kind: "text",
    id: "a.lost",
    prompt: draft("Compare the two versions of the same scene. What information does the inscribed version carry that the plain photograph does not?"),
    accepted: [],
    points: 0,
  },
  {
    kind: "choice",
    id: "a.clinic",
    prompt: draft("Using the catalog caption: which organisation's clinic is associated with the doorway on the left?"),
    options: [
      { id: "mazor", label: approved("Mazor") },
      { id: "hadassah", label: draft("Hadassah") },
      { id: "bikurHolim", label: draft("Bikur Holim") },
    ],
    correct: ["mazor"],
    multiple: false,
    points: 15,
  },
  {
    kind: "text",
    id: "a.identifier",
    prompt: draft("Cite your evidence: type the reference code of the catalog record you used."),
    accepted: ["IL-INL-YBZ-0024-009", "IL-INL-YBZ-0024-004"],
    points: 15,
  },
];

// Team B's own portrait isn't verified [6, 16], so it gets the spec's flagged alternate: a
// catalog-metadata investigation on the same records, with the same maximum score.
const archiveB: Question[] = [
  {
    kind: "choice",
    id: "b.photoDate",
    prompt: draft("How does the catalog date the photograph itself?"),
    options: [
      { id: "c1925", label: draft("circa 1925") },
      { id: "c1939", label: approved("circa 1939–1945") },
      { id: "c1960", label: draft("circa 1960s") },
    ],
    correct: ["c1939"],
    multiple: false,
    points: 10,
  },
  {
    kind: "text",
    id: "b.clinicYear",
    prompt: draft("Which year does the catalog give for the establishment of the clinic?"),
    accepted: ["1925"],
    points: 10,
  },
  {
    kind: "text",
    id: "b.identifier",
    prompt: draft("Cite your evidence: type the reference code of the catalog record you used."),
    accepted: ["IL-INL-YBZ-0024-004", "IL-INL-YBZ-0024-009"],
    points: 10,
  },
  {
    kind: "text",
    id: "b.twoDates",
    prompt: draft("The clinic's date and the photograph's date are different. Why does it matter not to merge them?"),
    accepted: [],
    points: 0,
  },
];

export const archiveTracks: Record<TeamId, ArchiveTrack> = {
  A: {
    teamId: "A",
    title: draft("Two versions of one scene"),
    intro: draft("Two catalog records show the same scene: one plain, one with an inscription. Open both records, compare them, and identify the clinic."),
    alternateReason: null,
    sourceIds: ["withoutInscription", "withInscription"],
    questions: archiveA,
  },
  B: {
    teamId: "B",
    title: draft("Reading the catalog record"),
    intro: draft("Catalog records carry dates and descriptions that a photograph alone cannot. Open the record and read its metadata."),
    alternateReason: fixture("Alternate track: a separate verified Armoza portrait for Team B has not been authorised yet, so this track uses catalog metadata instead."),
    sourceIds: ["withoutInscription"],
    questions: archiveB,
  },
};

// ---- Picture in Stone [7] ------------------------------------------------------------------

export const pictureInStone = {
  targetVerified: false,
  // Set when the wall, image and answer are field-verified; until then the stop is skippable.
  answer: null as string | null,
  // Equal for both teams. While unverified, no team can earn it, so skipping costs nothing.
  points: 0,
  unverifiedNotice: fixture("This stop's wall and image have not been field-verified. Skip it: the guide will lead a short heritage observation instead. No points are lost."),
};

// ---- Hesed VeRahamim reconstruction [8] ------------------------------------------------------

export const reconstructionIntro: Copy = draft("Observe the building from the public street. Then reconstruct its story from the sources: what it was, who was involved, what it became, and what the sources leave unknown.");

export const reconstructionUncertainty: Copy = draft("Sources give different dates and accounts of this change. Where they disagree, the game shows the uncertainty rather than choosing one version.");

export const reconstruction: Question[] = [
  {
    kind: "choice",
    id: "r.priorUse",
    prompt: draft("According to the family's archival narrative, what was the building used as before it became a synagogue?"),
    options: [
      { id: "tavern", label: draft("A tavern / drinking establishment") },
      { id: "school", label: draft("A school") },
      { id: "bakery", label: draft("A bakery") },
    ],
    correct: ["tavern"],
    multiple: false,
    points: 5,
  },
  {
    kind: "choice",
    id: "r.people",
    prompt: draft("Which family is associated with the change, in the archival narrative?"),
    options: [
      { id: "armoza", label: approved("The Armoza family") },
      { id: "navon", label: draft("The Navon family") },
      { id: "valero", label: draft("The Valero family") },
    ],
    correct: ["armoza"],
    multiple: false,
    points: 5,
  },
  {
    kind: "choice",
    id: "r.newUse",
    prompt: draft("What did the building become?"),
    options: [
      { id: "synagogue", label: draft("A synagogue") },
      { id: "market", label: draft("A market hall") },
      { id: "library", label: draft("A library") },
    ],
    correct: ["synagogue"],
    multiple: false,
    points: 5,
  },
  {
    kind: "choice",
    id: "r.services",
    prompt: draft("Which connected services do the sources link to it? Choose all that apply."),
    options: [
      { id: "mazor", label: approved("The Mazor medical organisation's clinic") },
      { id: "charity", label: draft("Local charitable institutions") },
      { id: "bank", label: draft("A savings bank") },
    ],
    correct: ["mazor", "charity"],
    multiple: true,
    points: 5,
  },
  {
    kind: "text",
    id: "r.unknown",
    prompt: draft("What do the sources leave unknown?"),
    accepted: [],
    points: 0,
  },
];

// ---- Crises [9] (approved scenarios; card wording is draft) --------------------------------

export const crises: Record<TeamId, Crisis> = {
  A: {
    teamId: "A",
    title: approved("The Last Phone Booth"),
    scenario: draft("In a village of the parallel world, the last traditional public phone is to be converted into a defibrillator station. Some residents still rely on that phone because mobile reception there is unreliable. Resources are limited. What should the village do?"),
    inspiration: draft("Inspired by real conversions of British phone boxes. This specific conflict is game fiction."),
    considerations: [
      draft("Medical response"),
      draft("Communication"),
      draft("Residents with fewer alternatives"),
      draft("Budget"),
      draft("Alternatives"),
    ],
  },
  B: {
    teamId: "B",
    title: approved("The Monument's Second Life"),
    scenario: draft("In a city of the parallel world, a controversial historical monument has been removed from a public space. Should it be remelted into a new artwork, preserved and given context as history, or something else?"),
    inspiration: draft("Inspired by documented disputes over public monuments. This monument and city are game fiction, and interpretations of real cases are contested."),
    considerations: [
      draft("Memory"),
      draft("Public harm"),
      draft("Public authority"),
      draft("Evidence"),
      draft("Reinterpretation"),
    ],
  },
};

// ---- Rewards [11] --------------------------------------------------------------------------

export const rewardBeat: Copy = draft("You've helped two communities find a way forward. You deserve two rewards: a story worth reading, and a memory you can taste.");

export const novel = {
  title: approved("The Beauty Queen of Jerusalem"),
  hebrewTitle: approved("מלכת היופי של ירושלים"),
  author: approved("Sarit Yishai-Levi"),
  note: draft("A novel featuring Luna Armoza, Sephardic Jerusalem and Ladino, later adapted for television. Its characters and events are literature, not proof of the archival events you investigated."),
};

export const tasting = {
  intro: draft("Borekitas belong to Sephardic culinary memory. The vendor's bourekas are a taste of that tradition, not necessarily the same pastry."),
  vendorNotice: fixture("Vendor address, hours, availability and the reward arrangement have not been confirmed. The guide activates the tasting."),
};

export const harmonyThanks: Copy = draft("HARMONY thanks you for helping the two communities work toward agreement.");
