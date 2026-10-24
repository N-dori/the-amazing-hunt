import type { ChoiceChallenge } from "./choice-task.ts";
import type { MissionDefinition } from "./mission-arrival.ts";
import { WELL_REWARDS, type WaterRewardConfig } from "./water-performance.ts";

export const SYNAGOGUE_MISSION_ID = "chesed-verachamim-before";

// The municipal heritage sign on the building, Hebrew and English text, read from the owner's photo #47
// (design/inputs/photos/no-faces/MY_nachlaot_hesed-verahamim-synagogue_heritage-sign-armoza-pub_47.jpg).
const SIGN = "Heritage sign at the synagogue (owner's photo #47): \"Built as a residential building, but turned into the Hessed Ve-Rahamim (Kindness and Mercy) synagogue by a local leader, Izhaq Armoza after it became a pub, against the rules of the neighborhood\"; Hebrew: בית מרזח בניגוד לתקנון השכונה, \"המוכתר\" של הספרדים בשכונה, הקהילה הספרדית - דוברי לאדינו";
// Yad Izhak Ben-Zvi photo archive, Armoza family collection via the Lev Ha'Ir community centre (docs/armoza/Armoza_fam.md).
const ARCHIVE = "Yad Izhak Ben-Zvi, Armoza family collection, catalogue description (docs/armoza/Armoza_fam.md)";
const TILE = "Tiled pediment over the door: founded 5685 (1925) by Sephardi emigrés from the Old City (owner's photo #21)";
const TOUR = "Hebrew and English tours, Stop 7 (docs/scavenger_hunt/Machane_Yehuda_Tour_HE.md, _EN.md)";
const OWNER = "Owner's answer list, 24 Oct 2026";

/** "What was this building before?" One pick from four; the sign and the archive both name a pub. */
export const SYNAGOGUE_CHALLENGE: ChoiceChallenge = Object.freeze({
  kind: "choice", required: 1, answerKeyVerified: true,
  options: Object.freeze([
    { id: "bakery", label: "A bakery", correct: false, source: OWNER },
    { id: "tavern", label: "A tavern (pub)", correct: true, source: `${SIGN}; ${ARCHIVE} ("It was used as a tavern")` },
    { id: "school", label: "A school", correct: false, source: OWNER },
    { id: "tailor", label: "A tailor's workshop", correct: false, source: OWNER },
  ]),
});

// Provisional copy of the well's local-testing values; not approved for this mission.
export const SYNAGOGUE_REWARDS: WaterRewardConfig = WELL_REWARDS;

/**
 * Story, question, hints and reveal. Draft English for owner review, adapted from the Hebrew tour, the sign and the archive.
 * The story must not name the pub: that's the answer.
 */
export const SYNAGOGUE_TASK = Object.freeze({
  id: SYNAGOGUE_MISSION_ID,
  title: "What Was This Building Before?",
  instruction: "Choose someone from your group to read this story aloud. Then work together to solve the challenge.",
  story: {
    title: "THE SYNAGOGUE WITH A SECRET",
    paragraphs: [
      { label: "Historical fact", text: "In 1925, Sephardi families from Jerusalem's Old City founded a society called Chesed VeRachamim, \"Kindness and Mercy\"." },
      { label: "Historical fact", text: "This building became the synagogue of the Ladino-speaking Sephardi community. Around it they ran a kindergarten, soup kitchens and Mazor, a free clinic with volunteer doctors." },
      { label: "Historical fact", text: "But before the prayers began, this building had a very different life." },
    ],
    source: `${TILE}; ${ARCHIVE}; ${SIGN}; ${TOUR}.`,
  },
  // The owner's wording.
  question: "Before this became a synagogue, what surprising business operated here?",
  hints: [
    { title: "Hint 1 — Gentle", text: "Whatever it was, it went against the neighbourhood's rules." },
    { title: "Hint 2 — Almost there", text: "Picture a place for drinks and conversation." },
  ],
  // Shown only after the group's answer is accepted. The lead is the owner's wording; the next statement retells the sign.
  reveal: {
    paragraphs: [
      { text: "Now look for the blue heritage sign nearby. It tells the remarkable story of how this building became a synagogue." },
      { label: "Historical fact", text: "The sign says the house was built as a home and later became a pub, against the neighbourhood's rules. Yitzhak Armoza, the Sephardi community's mukhtar (local leader), had it turned into their synagogue." },
    ],
    image: null,
  },
});

// The novel. Sources read 24 Oct 2026: Hebrew Wikipedia, "מלכת היופי של ירושלים (ספר)" (2013, Modan; the family is ארמוזה:
// Gabriel and Rosa, their daughters Luna, Rachelika and Bekki); Goodreads / publisher copy ("Gabriela, whose mother Luna is the
// titular beauty"; English translation by Anthony Berris spells the family Ermoza); mako interview (the book isn't biographical;
// its characters share traits with the author's own family). No source links the novel to the synagogue's Armoza family, and
// none records a real Luna Armoza beauty title in 1948. The real family portrait (Yad Ben-Zvi ybz.0024.002, Israel Album) names
// a Luna but not her relationship to Yitzhak; his mother isn't named in any project source.
const NOVEL = "Hebrew Wikipedia, מלכת היופי של ירושלים (ספר); Goodreads/publisher description of The Beauty Queen of Jerusalem (tr. Anthony Berris); mako interview with Sarit Yishai-Levi";
// Owner's answer; the three alternatives are invented for the game and are not titles of the novel or its characters.
const INVENTED = "Invented distractor, owner's brief 24 Oct 2026";

/** Optional bonus after the main answer: the literary Luna, clearly labelled as fiction in the reveal. */
export const SYNAGOGUE_BONUS_CHALLENGE: ChoiceChallenge = Object.freeze({
  kind: "choice", required: 1, answerKeyVerified: true,
  options: Object.freeze([
    { id: "rose-old-city", label: "The Rose of the Old City", correct: false, source: INVENTED },
    { id: "beauty-queen", label: "The Beauty Queen of Jerusalem", correct: true, source: NOVEL },
    { id: "nightingale-nahlaot", label: "The Nightingale of Nahlaot", correct: false, source: INVENTED },
    { id: "pearl-mahane-yehuda", label: "The Pearl of Mahane Yehuda", correct: false, source: INVENTED },
  ]),
});
// Modest and provisional: points only, never food tokens, and never needed to complete the mission.
export const SYNAGOGUE_BONUS_POINTS = 10;

/** Draft copy for owner review, except the question (the owner's wording). */
export const SYNAGOGUE_BONUS = Object.freeze({
  title: "Bonus: a famous name",
  intro: "Optional. The Armoza name also belongs to one of Israel's best-loved novels.",
  // The owner's wording.
  question: "What was Luna Armoza known as in the famous novel about a Jerusalem family?",
  reveal: [
    { label: "Historical fact", text: "The Beauty Queen of Jerusalem is a 2013 novel by Sarit Yishai-Levi, later a Netflix series. It follows several generations of a Sephardi family in Jerusalem, and Luna is the beauty of its title." },
    { label: "Historical fact", text: "It's historical fiction: its Armoza family (Ermoza in the English translation) is invented. It shares a surname with the family who founded this synagogue, but no source we know of connects the two." },
  ],
});

/**
 * Eshet Chayil: an optional moment, never scored, never stored. The invitation is the owner's wording; the rest is draft.
 * The sign records the "Eshet Hayil" verses on the women's-section door.
 */
export const SYNAGOGUE_APPRECIATION = Object.freeze({
  title: "A moment of appreciation",
  paragraphs: [
    { label: "Historical fact", text: "The door to the women's section carries the verses of Eshet Chayil, \"a woman of valour\"." },
    { label: "Interpretation", text: "The verses praise a person's strength, kindness and care for others." },
  ],
  invitation: "Think of someone who deserves appreciation today. What is one thing you'd like to thank them for?",
  note: "Say it aloud if you like, or keep it to yourself. Nothing is recorded or scored.",
});

export const SYNAGOGUE_MISSION = Object.freeze({
  id: SYNAGOGUE_MISSION_ID, title: SYNAGOGUE_TASK.title, name: "Chesed VeRachamim Synagogue", shortName: "Chesed VeRachamim",
  // Address from both tours, Stop 7, and the archive ("at the entrance to the Mazkeret Moshe neighborhood from Agripas Street").
  // Not yet field-checked. The tours correct the neighbourhood: Mazkeret Moshe, not Ohel Moshe.
  neighborhood: "18 HaCarmel St, Mazkeret Moshe, Nahlaot, Jerusalem",
  location: Object.freeze({
    hebrewName: "בית הכנסת חסד ורחמים",
    summary: "A small Sephardi synagogue at the entrance to Mazkeret Moshe, close to Agripas Street.",
    landmarks: Object.freeze([
      "18 HaCarmel Street, Mazkeret Moshe.",
      "At the entrance to Mazkeret Moshe from Agripas Street.",
      "Look from the street. Go inside only if you're invited, and don't disturb anyone praying.",
    ]),
  }),
  // The sign describes the door ("decorated with symbols of the twelve biblical tribes"); the tiles are in photos #21 and #48.
  clue: "Look for a tiled panel with Hebrew lettering over the entrance, and a colourful door decorated with the symbols of the twelve tribes.",
  // Owner's daylight photo (public/shuk/Hesed_va_Rahamim.jpg, added 24 Oct 2026): no people, and the heritage sign is out of frame,
  // so it can't give the answer away. Web copy, metadata stripped.
  photo: Object.freeze({ src: "/shuk/synagogue-facade.jpg", alt: "The synagogue's entrance: a tiled panel with Hebrew lettering above a colourful door covered in raised pictures, beside a hammered metal door." }),
  cluePhoto: null,
  // Map audit, section 4 (docs/map/nahlaot-map-audit.md): provisional, first block south of Agripas, west of the Kiach junction.
  placement: Object.freeze({ x: 712, y: 560, verified: false }),
  arrival: Object.freeze({
    // OSM "Hessed Ve-Rahamim" (© OpenStreetMap contributors, ODbL), from the map audit; not field-verified, so GPS stays off.
    destination: Object.freeze({ latitude: 31.78357, longitude: 35.21364, verified: false }),
    radiusMeters: 100, maxAccuracyMeters: 50, maxAgeMs: 60_000, futureToleranceMs: 5_000, rewardPoints: 20,
  }),
  challenge: SYNAGOGUE_CHALLENGE,
  rewards: SYNAGOGUE_REWARDS, hintCount: SYNAGOGUE_TASK.hints.length,
  bonus: Object.freeze({ challenge: SYNAGOGUE_BONUS_CHALLENGE, points: SYNAGOGUE_BONUS_POINTS }),
}) satisfies MissionDefinition;
