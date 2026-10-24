import type { ChoiceChallenge } from "./choice-task.ts";
import type { MissionDefinition } from "./mission-arrival.ts";
import { WELL_REWARDS, type WaterRewardConfig } from "./water-performance.ts";

export const MURAL_MISSION_ID = "mural-real-or-painted";

const IDEAS = "Owner's field notes from photos #103-105, design/inputs/content/Mission_Task_Ideas.md, \"Opening task: the painted market\"";
const POST = "Israel Post stamp flyer, issue 1171 (S1 in research/results/07_citecreation_market_mural.md)";
const TOUR = "English tour, Stop 8 (docs/scavenger_hunt/Machane_Yehuda_Tour_EN.md)";

/** "Find 2 things that are real." The key is not field-verified, so the server does not judge answers yet. */
export const MURAL_CHALLENGE: ChoiceChallenge = Object.freeze({
  kind: "choice", required: 2, answerKeyVerified: false,
  options: Object.freeze([
    { id: "air-vents", label: "The air vents in the awning and the shop", correct: true, source: IDEAS },
    { id: "plaque", label: "The small plaque left of the painted shop", correct: true, source: IDEAS },
    { id: "music-sign", label: "The blue sign with a treble clef", correct: true, source: IDEAS },
    // Sources disagree: the ideas file reads it as a real house-number tile; S1 lists the
    // "103 call centre" among the painted details (run 07). Check on site.
    { id: "tile-103", label: "The \"103\" tile", correct: null, source: `${IDEAS}; ${POST}` },
    { id: "cardboard-boxes", label: "The cardboard boxes", correct: false, source: `${POST} ("a painted carton"); ${TOUR}` },
    { id: "antenna-phone", label: "The vendor's phone with an antenna", correct: false, source: `${TOUR}; ${IDEAS}` },
    { id: "balcony-bicycle", label: "The bicycle on the balcony", correct: false, source: `${POST}; ${IDEAS}` },
    { id: "balcony-laundry", label: "The laundry on the balcony", correct: false, source: IDEAS },
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
    paragraphs: [
      { label: "Historical fact", text: "In 2001, artists from CitéCréation in Lyon painted Jerusalem's market life onto this wall." },
      { label: "Attributed tradition", text: "The story goes that after the unveiling, people complained about ugly cardboard boxes left near the painting. The boxes were painted." },
    ],
    source: `${TOUR}; ${POST}.`,
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
  neighborhood: "Agripas Street, Mahane Yehuda, Jerusalem",
  clue: "Agripas Street, near the market's southwestern edge. Look for a market that isn't there.",
  // No photo: the mural's image rights are unresolved, and a photo would show the answers.
  photo: null,
  // Manual prototype point on Agripas St at the market's south-west edge; not field-checked.
  placement: Object.freeze({ x: 480, y: 478, verified: false }),
  arrival: Object.freeze({
    // Sources give house numbers 70, 84 or 88; no confirmed coordinate, so GPS checks stay off.
    destination: null,
    radiusMeters: 100, maxAccuracyMeters: 50, maxAgeMs: 60_000, futureToleranceMs: 5_000, rewardPoints: 20,
  }),
  challenge: MURAL_CHALLENGE,
  rewards: MURAL_REWARDS, hintCount: MURAL_TASK.hints.length,
}) satisfies MissionDefinition;
