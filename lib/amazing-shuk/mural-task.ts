import type { ChoiceChallenge } from "./choice-task.ts";
import type { MissionDefinition } from "./mission-arrival.ts";
import { WELL_REWARDS, type WaterRewardConfig } from "./water-performance.ts";

export const MURAL_MISSION_ID = "mural-real-or-painted";

const IDEAS = "Owner's field notes from photos #103-105, design/inputs/content/Mission_Task_Ideas.md, \"Opening task: the painted market\"";
const POST = "Israel Post stamp flyer, issue 1171 (S1 in research/results/07_citecreation_market_mural.md)";
const TOUR = "English tour, Stop 8 (docs/scavenger_hunt/Machane_Yehuda_Tour_EN.md)";
const FIELD = "Owner's field check, 24 Oct 2026";

/** "Find 2 things that are real." Every item's real/painted status was field-checked by the owner on 24 Oct 2026. */
export const MURAL_CHALLENGE: ChoiceChallenge = Object.freeze({
  kind: "choice", required: 2, answerKeyVerified: true,
  options: Object.freeze([
    { id: "air-vents", label: "The air vents in the awning and the shop", correct: true, source: `${FIELD}; ${IDEAS}` },
    { id: "plaque", label: "The small plaque left of the painted shop", correct: true, source: `${FIELD}; ${IDEAS}` },
    { id: "music-sign", label: "The blue sign with a treble clef", correct: true, source: `${FIELD}; ${IDEAS}` },
    // Painted, as S1's "103 call centre" says; the ideas file had read it as a real house-number tile.
    { id: "tile-103", label: "The \"103\" tile", correct: false, source: `${FIELD}; ${POST}` },
    { id: "cardboard-boxes", label: "The cardboard boxes", correct: false, source: `${FIELD}; ${POST} ("a painted carton"); ${TOUR}` },
    { id: "antenna-phone", label: "The vendor's phone with an antenna", correct: false, source: `${FIELD}; ${TOUR}; ${IDEAS}` },
    { id: "balcony-bicycle", label: "The bicycle on the balcony", correct: false, source: `${FIELD}; ${POST}; ${IDEAS}` },
    { id: "balcony-laundry", label: "The laundry on the balcony", correct: false, source: `${FIELD}; ${IDEAS}` },
  ]),
});

// Provisional copy of the well's local-testing values; mural rewards are not approved yet.
export const MURAL_REWARDS: WaterRewardConfig = WELL_REWARDS;

/** Story and question text: source-backed, for owner review. Each paragraph carries its own evidence label. */
export const MURAL_TASK = Object.freeze({
  id: MURAL_MISSION_ID,
  title: "Is It Real or Is It Painted?",
  instruction: "Choose someone from your group to read this story aloud. Then work together to solve the challenge.",
  story: {
    title: "THE PAINTED MARKET",
    // The owner's photo of the bare wall before the mural; it shows the wall, not the answers.
    image: { src: "/shuk/mural-before.jpg", width: 1023, height: 1537,
      alt: "Black-and-white photo of the same corner before the mural: a tall, bare, blank building wall above low sheds, a lamp post and a telegraph pole.",
      caption: "The wall before the mural. Photographer and date not yet recorded." },
    paragraphs: [
      { label: "Historical fact", text: "This wall was once bare. In 2001, artists from CitéCréation in Lyon painted Jerusalem's market onto it." },
      { label: "Attributed tradition", text: "The story goes that after the unveiling, people complained about cardboard boxes left near the painting. They were painted." },
    ],
    source: `${TOUR}; ${POST} ("a bare concrete wall"); before photo supplied by the owner, 24 Oct 2026.`,
  },
  question: "Find 2 things on this wall that are real, not painted.",
  // The tour's own questions for this stop, in order.
  hints: [
    { title: "Hint 1 — Gentle", text: "Which lines belong to actual architecture?" },
    { title: "Hint 2 — More specific", text: "Which stalls or objects are flat paint?" },
    { title: "Hint 3 — Almost there", text: "Where did the artists use shadows to fool your eye?" },
  ],
});

export const MURAL_MISSION = Object.freeze({
  id: MURAL_MISSION_ID, name: "The Mahane Yehuda Market Mural", shortName: "Market Mural",
  // Location confirmed by the owner, 24 Oct 2026: the corner of HaRav Shmuel Baruch St and Sha'arei Tzedek St.
  neighborhood: "HaRav Shmuel Baruch St, corner of Sha'arei Tzedek St, Mahane Yehuda, Jerusalem",
  clue: "Corner of HaRav Shmuel Baruch St and Sha'arei Tzedek St, by Agripas St. Look for a market that isn't there.",
  // No photo: the mural's image rights are unresolved, and a photo would show the answers.
  photo: null,
  // Manual prototype point on Agripas St at the market's south-west edge; not field-checked.
  placement: Object.freeze({ x: 480, y: 478, verified: false }),
  arrival: Object.freeze({
    // The two streets' shared junction node in OpenStreetMap (© OpenStreetMap contributors, ODbL), looked up 24 Oct 2026.
    // Confirmed by the owner as the mural's location on a map, 24 Oct 2026.
    destination: Object.freeze({ latitude: 31.7857892, longitude: 35.2087861, verified: true }),
    radiusMeters: 100, maxAccuracyMeters: 50, maxAgeMs: 60_000, futureToleranceMs: 5_000, rewardPoints: 20,
  }),
  challenge: MURAL_CHALLENGE,
  rewards: MURAL_REWARDS, hintCount: MURAL_TASK.hints.length,
}) satisfies MissionDefinition;
