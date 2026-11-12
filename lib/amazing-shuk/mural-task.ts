import type { ChoiceChallenge } from "./choice-task.ts";
import type { MissionDefinition } from "./mission-arrival.ts";
import type { WaterRewardConfig } from "./water-performance.ts";
import { budgetRewards, type BudgetScoring } from "./challenge-scoring.ts";

export const MURAL_MISSION_ID = "mural-real-or-painted";

const IDEAS = "Owner's field notes from photos #103-105, design/inputs/content/challenge-ideas/Mission_Task_Ideas.md, \"Opening task: the painted market\"";
const POST = "Israel Post stamp flyer, issue 1171 (S1 in research/results/shuk-places/07_citecreation_market_mural.md)";
const TOUR = "English tour, Stop 8 (docs/knowledge/Machane_Yehuda_Tour_EN.md)";
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

// Model B (owner, D1, 2 Nov 2026); speed never changes the points. TODO(values): max 100, a 40 % hint budget and 2 food tokens are proposals pending the
// owner's approval. With two hints: 100, then 85, then 60 (the floor).
export const MURAL_SCORING: BudgetScoring = Object.freeze({ maxPoints: 100, budgetShare: 0.4, foodTokens: 2 });

/** Story and question text: source-backed, for owner review. Each paragraph carries its own evidence label. */
export const MURAL_TASK = Object.freeze({
  id: MURAL_MISSION_ID,
  title: "Is It Real or Is It Painted?",
  instruction: "Choose someone from your group to read this story aloud. Then work together to solve the challenge.",
  // Approved solo wording (owner, 2 Nov 2026).
  instructionSolo: "Take a moment to discover this story.",
  story: {
    title: "THE PAINTED MARKET",
    paragraphs: [
      { label: "Historical fact", text: "This wall was once bare. In 2001, artists from CitéCréation in Lyon painted Jerusalem's market onto it." },
      { label: "Attributed tradition", text: "The story goes that after the unveiling, people complained about cardboard boxes left near the painting. They were painted." },
    ],
    source: `${TOUR}; ${POST} ("a bare concrete wall"); before photo supplied by the owner, 24 Oct 2026.`,
    // Moved from the reveal into the story at the owner's request, 26 Oct 2026: it shows the bare wall the story describes.
    image: { src: "/shuk/mural-before.jpg", width: 1023, height: 1537,
      alt: "Black-and-white photo of the same corner before the mural: a tall, bare, blank building wall above low sheds, a lamp post and a telegraph pole.",
      caption: "The wall before the mural. Photographer and date not yet recorded." },
  },
  // The owner's wording, 24 Oct 2026 (replaces "Find 2 things on this wall that are real, not painted.").
  question: "The artists fooled almost everyone. Can your group spot TWO things that are actually real?",
  // TODO(copy): draft solo wording for owner review (2 Nov 2026).
  questionSolo: "The artists fooled almost everyone. Can you spot TWO things that are actually real?",
  reveal: { paragraphs: [], image: null },
  // Two hints, each more helpful than the last (plan §4, 2 Nov 2026). They replace the tour's three open questions.
  // TODO(copy): both are drafts for the owner's approval.
  hints: [
    { title: "Hint 1 — Gentle", text: "Look closely at the shop on the ground floor and its awning." },
    { title: "Hint 2 — More specific", text: "One real thing helps the building breathe." },
  ],
});

export const MURAL_REWARDS: WaterRewardConfig = budgetRewards(MURAL_SCORING, MURAL_TASK.hints.length);

export const MURAL_MISSION = Object.freeze({
  id: MURAL_MISSION_ID, title: MURAL_TASK.title, name: "The Mahane Yehuda Market Mural", shortName: "Market Mural",
  // Hebrew tour, stop 8; landmarks from the English tour (stop 8), the owner's confirmed corner and research run 06 (row 12).
  location: Object.freeze({
    hebrewName: "ציור הקיר של שוק מחנה יהודה",
    summary: "A large outward-facing wall painting at the edge of the market.",
    // Owner-provided consolidated location wording, 25 Oct 2026.
    whatToLookFor: "Find the large painted market scene near Agripas Street, at the corner of HaRav Shmuel Baruch and Sha'arei Tzedek Streets. View it safely from the pavement.",
    detailsArea: "Mahane Yehuda, Jerusalem",
    landmarks: Object.freeze([
      "Agripas Street, near the market's southwestern edge.",
      "The corner of HaRav Shmuel Baruch St and Sha'arei Tzedek St.",
      "View it from the pavement; choose a safe place to stand without blocking traffic.",
    ]),
  }),
  // Location confirmed by the owner, 24 Oct 2026: the corner of HaRav Shmuel Baruch St and Sha'arei Tzedek St.
  neighborhood: "HaRav Shmuel Baruch St, corner of Sha'arei Tzedek St, Mahane Yehuda, Jerusalem",
  clue: "Corner of HaRav Shmuel Baruch St and Sha'arei Tzedek St, by Agripas St. Look for a market that isn't there.",
  // Owner's photograph #103, chosen 24 Oct 2026 as the street view of the corner (web copy, rotated, metadata stripped).
  // It shows the whole wall, as players will see it on arrival; it doesn't say which details are real.
  photo: Object.freeze({ src: "/shuk/mural-street.jpg", alt: "The corner building: a large painted market scene high on the wall, and a low painted shopfront beneath it, beside a tree and grey utility cabinets." }),
  cluePhoto: null,
  // Manual prototype point on Agripas St at the market's south-west edge; not field-checked.
  placement: Object.freeze({ x: 480, y: 478, verified: false }),
  arrival: Object.freeze({
    // The two streets' shared junction node in OpenStreetMap (© OpenStreetMap contributors, ODbL), looked up 24 Oct 2026.
    // Confirmed by the owner as the mural's location on a map, 24 Oct 2026.
    destination: Object.freeze({ latitude: 31.7857892, longitude: 35.2087861, verified: true }),
    radiusMeters: 100, maxAccuracyMeters: 50, maxAgeMs: 60_000, futureToleranceMs: 5_000, rewardPoints: 20,
  }),
  challenge: MURAL_CHALLENGE,
  // Not `timed: false`: the time is still measured silently (analytics only); model B's rewards never score speed.
  rewards: MURAL_REWARDS, hintCount: MURAL_TASK.hints.length,
}) satisfies MissionDefinition;
