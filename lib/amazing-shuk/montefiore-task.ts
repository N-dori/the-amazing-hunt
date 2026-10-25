import type { ChoiceChallenge } from "./choice-task.ts";
import type { MissionDefinition } from "./mission-arrival.ts";
import { WELL_REWARDS } from "./water-performance.ts";
export const MONTEFIORE_MISSION_ID = "montefiore-gateway";
export const GATEWAY_SOURCE = "Owner photograph #05; https://www.nli.org.il/en/archives/nnl_archive_al997009628340605171/NLI; https://jerudesign.org/item/memorial-plaques/ (roundel photograph 247A.jpg, inspected 25 Oct 2026); docs/scavenger_hunt/HE_trans.txt (synagogue passage kept distinct)";
export const GATEWAY_LANGUAGES: ChoiceChallenge = {
  kind: "choice", required: 3, answerKeyVerified: true,
  options: [
    { id: "hebrew", label: "Hebrew", correct: true, source: GATEWAY_SOURCE },
    { id: "english", label: "English", correct: true, source: GATEWAY_SOURCE },
    { id: "arabic", label: "Arabic", correct: true, source: GATEWAY_SOURCE },
    { id: "ladino", label: "Ladino", correct: false, source: GATEWAY_SOURCE },
    { id: "french", label: "French", correct: false, source: GATEWAY_SOURCE },
  ],
};
export type GatewayChallenge = Readonly<{ kind: "gateway" }>;
// Date group from the roundel, not the synagogue inscription or the separate 1882 plaque.
export const GATEWAY_YEAR = { inscription: "\u05ea\u05e8\u05de\u05f4\u05d2", abbreviation: "\u05dc\u05e4\u05f4\u05e7", hebrewYear: 5643, gregorianYear: "1883" } as const;
// TODO(copy): owner review of adapted introduction, hints, feedback and labels. No Gregorian answer before completion.
export const MONTEFIORE_TASK = {
  title: "The Montefiore Gateway",
  instruction: "Choose someone from your group to read this story aloud. Then work together to solve the challenge.",
  story: { title: "A NAME IN STONE", paragraphs: [
    { label: "Historical fact", text: "This gateway honours Sir Moses Montefiore, whose memorial fund helped build Ohel Moshe." },
    { label: "Interpretation", text: "Look up before you walk through. The stone panels tell their story in more than one language." },
  ], source: GATEWAY_SOURCE },
  languageQuestion: "Which three languages are displayed on the monument?",
  yearQuestion: "Decipher the Hebrew founding year on the roundel. What is the later Gregorian year it spans?",
  hints: [
    { title: "Hint 1", text: "Hebrew letters can stand for numbers. Read the date group, not the other abbreviations." },
    { title: "Hint 2", notation: "\u05ea=400, \u05e8=200, \u05de=40, \u05d2=3", text: "The date letters have these values: 400, 200, 40 and 3. Add them together." },
    { title: "Hint 3", notation: GATEWAY_YEAR.abbreviation, text: "This abbreviation means the thousands are omitted: add 5000. It is not part of the date sum. For the later Gregorian year, subtract 3760." },
  ],
  reveal: "The date group totals 643. With the omitted thousands, it is Hebrew year 5643, spanning 1882-83. The gateway is recorded as dating to 1883.",
};
// Provisional local-testing economy matches the existing mission configuration; one award for both stages.
export const MONTEFIORE_REWARDS = { ...WELL_REWARDS };
export const MONTEFIORE_MISSION: MissionDefinition = {
  id: MONTEFIORE_MISSION_ID, title: MONTEFIORE_TASK.title, name: "The Montefiore Gateway", shortName: "Montefiore Gateway",
  neighborhood: "Ohel Moshe entrance, Agripas Street, Jerusalem",
  location: { hebrewName: "\u05e9\u05e2\u05e8 \u05d0\u05d5\u05d4\u05dc \u05de\u05e9\u05d4", summary: "The historic stone entrance to Ohel Moshe from Agripas Street.",
    whatToLookFor: "Find the monumental stone arch at the Ohel Moshe entrance from Agripas Street. Look for the Sir Moses Montefiore inscription panels and the roundel above them.",
    landmarks: ["Ohel Moshe entrance at Agripas Street and Hermon Street (site research run 06, row 3)."] },
  clue: "Find the stone arch with Sir Moses Montefiore inscription panels.",
  // Existing owner's face-free web crop of index #05. Legacy filename retained; never use for Gan HaTut.
  photo: { src: "/shuk/gan-hatut-gate.jpg", alt: 'The Ohel Moshe gateway, with a roundel above panels honouring Sir Moses Montefiore.' }, cluePhoto: null,
  // No invented pixel position. Catalogue entry is accessible beside the illustrated map pending owner placement.
  placement: null,
  arrival: { destination: null, radiusMeters: 100, maxAccuracyMeters: 50, maxAgeMs: 60000, futureToleranceMs: 5000, rewardPoints: 20 },
  challenge: { kind: "gateway" }, rewards: MONTEFIORE_REWARDS, hintCount: 3,
};
