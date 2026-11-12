import type { ChoiceChallenge } from "./choice-task.ts";
import type { MissionDefinition } from "./mission-arrival.ts";
<<<<<<< HEAD
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
=======
import { WELL_REWARDS, type WaterRewardConfig } from "./water-performance.ts";

export const MONTEFIORE_MISSION_ID = "montefiore-testimonial-gate";

// The gate itself, owner's photo #05 (design/inputs/photos, media-originals/reference/shuk/MY_ohel-moshe_gate_montefiore-testimonial-inscription_05.jpg),
// read at 4x zoom on 25 Oct 2026: an English panel, an Arabic-script panel and a Hebrew dedication. Not yet checked on site.
const GATE = "Ohel Moshe gate, owner's photo #05: English panel \"SIR MOSES MONTEFIORE TESTIMONIAL\"; Arabic-script panel; Hebrew dedication \"אבני זכרון מזכרת לכבוד ולתפארת לזכר עולם…\"";
// The "Photograph in Stone" plaque beside the gate, owner's photo #02 (Avraham H. Elhanani, In the Light of Jerusalem; This is Jerusalem, vol. 2).
const PLAQUE = "\"Photograph in Stone\" plaque, Ohel Moshe, owner's photo #02: badge \"אוהל משה תרמ\"ב · Ohel Moshe 1882\"; June 1882 agreement; the Moses and Judith Montefiore Testimonial Fund placed 11 dunams; Sephardi counterpart to Ashkenazi Mazkeret Moshe; Hebrew text names Yemenite families in Ohel Moshe";
const INVENTED = "Invented distractor: not on the gate";

/** "Which three languages?" Pick three of five; the gate carries English, Arabic and Hebrew. */
export const MONTEFIORE_CHALLENGE: ChoiceChallenge = Object.freeze({
  kind: "choice", required: 3, answerKeyVerified: true,
  options: Object.freeze([
    { id: "hebrew", label: "Hebrew", correct: true, source: GATE },
    { id: "english", label: "English", correct: true, source: GATE },
    { id: "ladino", label: "Ladino", correct: false, source: INVENTED },
    { id: "arabic", label: "Arabic", correct: true, source: GATE },
    { id: "yiddish", label: "Yiddish", correct: false, source: INVENTED },
  ]),
});

// Provisional copy of the well's local-testing values; not approved for this mission.
export const MONTEFIORE_REWARDS: WaterRewardConfig = WELL_REWARDS;

/** Story, question, hints and reveal. Draft English for owner review, from the plaque (#02) and the gate (#05). */
export const MONTEFIORE_TASK = Object.freeze({
  id: MONTEFIORE_MISSION_ID,
  title: "Three Languages, One Gate",
  instruction: "Choose someone from your group to read this story aloud. Then work together to solve the challenge.",
  // Approved solo wording (owner, 2 Nov 2026).
  instructionSolo: "Take a moment to discover this story.",
  story: {
    title: "A GATE FOR SIR MOSES",
    paragraphs: [
      { label: "Historical fact", text: "In June 1882, leaders of Jerusalem's Sephardi community signed the agreement that founded Ohel Moshe." },
      { label: "Historical fact", text: "A fund named for Sir Moses Montefiore gave the land. Next door, Mazkeret Moshe was built for Ashkenazi families." },
      { label: "Historical fact", text: "Over the way in, the founders put up a gate in his honour." },
    ],
    source: `${PLAQUE}; ${GATE}.`,
  },
  question: "This gate speaks three languages. Which three?",
  hints: [
    { title: "Hint 1 — Gentle", text: "Look at the two small panels at the top, then the big one below." },
    { title: "Hint 2 — Almost there", text: "One panel is read from right to left, in letters that aren't Hebrew." },
  ],
  // Shown only after the group's answer is accepted.
  reveal: {
    paragraphs: [
      { label: "Historical fact", text: "The English panel reads \"Sir Moses Montefiore Testimonial\"." },
      { label: "Historical fact", text: "The Hebrew panel begins \"אבני זכרון\": \"stones of remembrance\", for his honour and glory." },
      // TODO(copy): what the Arabic panel says. Read from the photo as naming Ohel Moshe and Moses Montefiore; check on site first.
    ],
    image: null,
  },
});

// Hamichlol, "עליית אעלה בתמר" (read through search 25 Oct 2026): Yemenite Jews from Sana'a came in 5641–5642 and linked their
// aliyah to "אמרתי אעלה בתמר" (Song of Songs 7:9); בתמר is תרמ"ב with its letters reordered. The number of immigrants differs
// between sources (Hamichlol about 150, NLI about 200), so no number is given.
const ALIYAH = "Hamichlol, עליית אעלה בתמר; Song of Songs 7:9";
const VERSE_WORD = "Another word of the same verse";

// Parked, not played: the owner took this bonus off the gate on 26 Oct 2026. The year תרמ"ב is the Yemenite aliyah's, which has
// nothing to do with this gate. Kept for a future stop about the Yemenite community; it is not attached to any mission.
/** Optional bonus: the year hides in a word of the verse. A letter shuffle, no arithmetic needed. */
export const MONTEFIORE_BONUS_CHALLENGE: ChoiceChallenge = Object.freeze({
  kind: "choice", required: 1, answerKeyVerified: true,
  options: Object.freeze([
    // Has ת, ר and מ, but no ב: the near miss.
    { id: "amarti", label: "אמרתי", lang: "he" as const, correct: false, source: VERSE_WORD },
    { id: "eeleh", label: "אעלה", lang: "he" as const, correct: false, source: VERSE_WORD },
    { id: "betamar", label: "בתמר", lang: "he" as const, correct: true, source: `${ALIYAH}; ${PLAQUE}` },
  ]),
});
// Modest and provisional: points only, never food tokens, and never needed to complete the mission.
export const MONTEFIORE_BONUS_POINTS = 10;

/** Draft copy for owner review. */
export const MONTEFIORE_BONUS = Object.freeze({
  title: "Bonus: the year hidden in a word",
  intro: "Optional. On the \"Photograph in Stone\" plaque by the gate, find the Hebrew year next to 1882. Its four letters are below.",
  verse: "אָמַרְתִּי אֶעֱלֶה בְּתָמָר",
  letters: Object.freeze(["ת", "ר", "מ", "ב"]),
  question: "Which word in this verse uses exactly the same four letters?",
  reveal: [
    { label: "Historical fact", text: "Yemenite Jews who came to Jerusalem in 1881–82 named their aliyah after this verse from the Song of Songs: \"I said, I will climb the palm tree\"." },
    { label: "Interpretation", text: "Read it as a riddle: אעלה, I will go up. When? בתמר, the year תרמ\"ב, 1882, the same year as this gate's neighbourhood." },
    { label: "Historical fact", text: "The plaque by the gate says Yemenite families lived in Ohel Moshe too." },
  ],
});

export const MONTEFIORE_MISSION = Object.freeze({
  id: MONTEFIORE_MISSION_ID, title: MONTEFIORE_TASK.title, name: "The Montefiore Gate", shortName: "Montefiore Gate",
  neighborhood: "Ohel Moshe, Nahlaot, Jerusalem",
  location: Object.freeze({
    hebrewName: "שער אהל משה",
    // Site research run 06, row 3: the Ohel Moshe entrance at Agripas and Hermon streets carries the Montefiore inscription.
    summary: "The stone gateway into Ohel Moshe from Agripas Street.",
    landmarks: Object.freeze([
      "The Ohel Moshe entrance, at Agripas Street and Hermon Street.",
      "A stone arch with carved panels and a round stone on top.",
      "A \"Photograph in Stone\" plaque about Ohel Moshe nearby.",
    ]),
  }),
  clue: "Look for a stone arch with carved panels above it and a round stone on top.",
  // The owner's photo of this gate (#05), also Gan HaTut's way in. Its alt names the English panel, which is one answer of three.
  photo: Object.freeze({ src: "/shuk/gan-hatut-gate.jpg", alt: "A stone archway in Ohel Moshe, under carved panels and a round stone." }),
  cluePhoto: null,
  // Manual guess: Agripas side of Ohel Moshe, north of Gan HaTut's marker. Owner review required.
  placement: Object.freeze({ x: 615, y: 585, verified: false }),
  arrival: Object.freeze({
    // Placeholder: Gan HaTut's unverified candidate point inside Ohel Moshe. GPS stays off until the gate's point is checked.
    destination: Object.freeze({ latitude: 31.7834802, longitude: 35.2128322, verified: false }),
    radiusMeters: 100, maxAccuracyMeters: 50, maxAgeMs: 60_000, futureToleranceMs: 5_000, rewardPoints: 20,
  }),
  challenge: MONTEFIORE_CHALLENGE,
  rewards: MONTEFIORE_REWARDS, hintCount: MONTEFIORE_TASK.hints.length,
}) satisfies MissionDefinition;
>>>>>>> bb4234fb5b66e55047f6343e266fa8ee539f0a27
