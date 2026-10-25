import type { ChoiceChallenge } from "./choice-task.ts";
import type { MissionDefinition } from "./mission-arrival.ts";
import { WELL_REWARDS, type WaterRewardConfig } from "./water-performance.ts";

export const MONTEFIORE_MISSION_ID = "montefiore-testimonial-gate";

// The gate itself, owner's photo #05 (design/inputs/photos, public/shuk/MY_ohel-moshe_gate_montefiore-testimonial-inscription_05.jpg),
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

/** Optional bonus: the year on the plaque hides in a word of the verse. A letter shuffle, no arithmetic needed. */
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
  bonus: Object.freeze({ challenge: MONTEFIORE_BONUS_CHALLENGE, points: MONTEFIORE_BONUS_POINTS }),
}) satisfies MissionDefinition;
