import type { ChoiceChallenge } from "./choice-task.ts";
import type { MissionDefinition, MissionPhoto } from "./mission-arrival.ts";
import { WELL_REWARDS, type WaterRewardConfig } from "./water-performance.ts";

export const MARZIPAN_MISSION_ID = "marzipan-rugelach";

// Sources read 25 Oct 2026. Only what each one says is used.
// Time Out Tel Aviv, "רוגלעך מרציפן תל אביב" (22 May 2023): Marzipan in Mahane Yehuda opened about 40 years ago; Yosef Ozerko
// opened it with his wife Shoshana; their sons now run the business. The rugelach are its best-known pastry.
const TIMEOUT = "Time Out Tel Aviv, \"רוגלעך מרציפן\" (22 May 2023)";
// Maariv, Pascal Perez-Rubin, "מחנה קיץ: מתכונים בהשראת סיור קולינרי בשוק מחנה יהודה" (3 Jul 2020): "כשהרוגלך יוצאים מהתנור,
// בעודם חמים, מברישים אותם במברשת ענקית בכמות מכובדת של סירופ סוכר"; "לרוגלך צורה ישרה והם לחים, דביקים וספוגים בסירופ סוכר".
const MAARIV = "Maariv, Pascal Perez-Rubin, culinary tour of Mahane Yehuda (3 Jul 2020): brushed with syrup \"as they come out of the oven, while still warm\"; \"a straight shape… moist, sticky and soaked in sugar syrup\"";
// Guide's recorded tour (docs/knowledge/HE_trans.txt, "מאפיית מרציפן והרוגלך"): at first the shop sold marzipan sweets by
// weight from a small window; the next generation built the rugelach; syrup brushed on one by one from a bucket, now from a hose.
// One guide's account, not corroborated: Attributed tradition. The English tour (Stop 22) says the same.
const GUIDE = "Guide's recorded tour, \"מאפיית מרציפן והרוגלך\" (docs/knowledge/HE_trans.txt); English tour, Stop 22";
// Marzipan Bakery, "Our Story" (marzipanbakery.com/our-story, read 25 Oct 2026, undated): "We witnessed thousands of American
// customers filling their empty suitcases full of our rugelach before returning home." "So after baking our rugelach, we flash
// freeze them and fly them directly to our New York facility." The business's own account.
const BAKERY = "Marzipan Bakery, \"Our Story\", marzipanbakery.com (read 25 Oct 2026; the bakery's own account)";
// English Wikipedia, "Rugelach" (read 25 Oct 2026): from Polish rogaliki; róg means horn; traditional rugelach are rolled from a
// triangle of dough into a crescent (citing Joan Nathan, Jewish Holiday Cookbook, 2004).
const RUGELACH = "English Wikipedia, \"Rugelach\" (read 25 Oct 2026), citing Joan Nathan's Jewish Holiday Cookbook";
// English Wikipedia, "Babka (cake)" (read 25 Oct 2026), citing Gil Marks, Encyclopedia of Jewish Food: developed by the Jewish
// communities of Poland; extra challah dough rolled up with jam or cinnamon and baked beside the challah; chocolate likely a
// mid-20th-century American development; émigrés brought it to New York. Used by MARZIPAN_APPRECIATION below.
const INVENTED = "Invented distractor; no source says this";

/** Question 1, "When does the syrup go on?" One pick from three. */
export const MARZIPAN_CHALLENGE: ChoiceChallenge = Object.freeze({
  kind: "choice", required: 1, answerKeyVerified: true,
  options: Object.freeze([
    { id: "before-oven", label: "Before the pastries go into the oven.", correct: false, source: INVENTED },
    { id: "still-warm", label: "While the pastries are still warm.", correct: true, source: `${MAARIV}; ${GUIDE}` },
    { id: "fully-cooled", label: "Only after the pastries have completely cooled.", correct: false, source: INVENTED },
  ]),
});

/** Question 2, "What does the name rugelach refer to?" One pick from four. */
export const MARZIPAN_HORNS_CHALLENGE: ChoiceChallenge = Object.freeze({
  kind: "choice", required: 1, answerKeyVerified: true,
  options: Object.freeze([
    { id: "crowns", label: "Little crowns", correct: false, source: INVENTED },
    { id: "horns", label: "Little horns", correct: true, source: RUGELACH },
    { id: "boats", label: "Little boats", correct: false, source: INVENTED },
    { id: "bells", label: "Little bells", correct: false, source: INVENTED },
  ]),
});

// Provisional copy of the well's local-testing values; not approved for this mission. Two hints, then one: three in all,
// the length of the shared penalty list.
export const MARZIPAN_REWARDS: WaterRewardConfig = WELL_REWARDS;

/**
 * Story, questions, hints and reveals: draft English for owner review. The story must not say when the syrup goes on or
 * what the name means: those are the answers. The name's origin is one guide's story, so it is an unscored guess.
 */
export const MARZIPAN_TASK = Object.freeze({
  id: MARZIPAN_MISSION_ID,
  title: "The Sweet Secret of Marzipan",
  instruction: "Choose someone from your group to read this story aloud. Then work together to solve the challenge.",
  story: {
    title: "A BAKERY ON AGRIPAS STREET",
    paragraphs: [
      { label: "Historical fact", text: "About 40 years ago, Yosef Ozerko and his wife Shoshana opened a bakery here, on the edge of the market." },
      { label: "Historical fact", text: "Their sons run it today, and its best-known pastry is a small chocolate rugelach." },
      { label: "Historical fact", text: "Marzipan's rugelach are moist and sticky, soaked in sugar syrup." },
    ],
    source: `${TIMEOUT}; ${MAARIV}.`,
  },
  prediction: {
    title: "Before you start: a name mystery",
    question: "Why is a bakery famous for chocolate rugelach called Marzipan?",
    invitation: "Make a guess together, then open the answer. There's no score for this one.",
    // The owner removed "A Jerusalem guide tells it this way:", 26 Oct 2026. Still a guide's account in the data (GUIDE).
    reveal: [
      { label: "Attributed tradition", text: "At first the shop sold marzipan sweets in many flavours, weighed out at a small window. The next generation turned it into a rugelach bakery. The bakery hasn't published its own account." },
    ],
  },
  question: "When do you think the sweet syrup goes onto Marzipan's rugelach?",
  hints: [
    { title: "Hint 1 — Gentle", text: "Look at the trays. Is the syrup sitting on top, or has it soaked in?" },
    { title: "Hint 2 — Almost there", text: "The bakery wants the syrup to soak right in, not sit on top." },
  ],
  followUps: [
    {
      lead: [
        { label: "Historical fact", text: "Right. As the rugelach come out of the oven, still warm, they're brushed with plenty of sugar syrup. They soak it up, and that's what keeps them soft and sticky." },
        { label: "Attributed tradition", text: "A guide tells that the syrup was once brushed on one by one from a bucket. Now it pours from a hose." },
      ],
      question: "What does the name rugelach refer to?",
      hints: [
        { title: "Hint 1 — Gentle", text: "Think of the curved shape of a traditional rugelach. What on an animal curves like that?" },
      ],
    },
  ],
  foodAction: "Explore Food Rewards",
  // Shown only after the second answer is accepted. A statement without a label is an instruction to the group.
  reveal: {
    paragraphs: [
      { label: "Historical fact", text: "The word came into Yiddish from Slavic words for horn: in Polish, róg." },
      { label: "Interpretation", text: "Language sources explain the details differently, so \"little horns\" is the usual reading, not a word-for-word translation." },
      { label: "Historical fact", text: "Traditional rugelach are rolled from a triangle of dough into a curved crescent. Marzipan's are straight." },
      { text: "Look at the trays: do you see any horns?" },
    ],
    image: null,
  },
});

/** Optional bonus: how the rugelach got to New York, in the bakery's own account. */
export const MARZIPAN_BONUS_CHALLENGE: ChoiceChallenge = Object.freeze({
  kind: "choice", required: 1, answerKeyVerified: true,
  options: Object.freeze([
    { id: "cargo-ships", label: "By shipping sealed boxes on cargo ships.", correct: false, source: INVENTED },
    { id: "frozen-flown", label: "By flash-freezing them and flying them to New York.", correct: true, source: BAKERY },
    { id: "preservatives", label: "By using special preservatives.", correct: false, source: INVENTED },
    { id: "baked-in-new-york", label: "By baking every batch in New York instead.", correct: false, source: INVENTED },
  ]),
});
// Modest and provisional: points only, never food tokens, and never needed to complete the mission.
export const MARZIPAN_BONUS_POINTS = 10;

/** Draft copy for owner review. A business story, not a promise of what is sold in New York today. */
export const MARZIPAN_BONUS = Object.freeze({
  title: "Bonus: the suitcase mystery",
  intro: "Optional. The bakery says thousands of American visitors filled their empty suitcases with its rugelach before flying home.",
  question: "How did Marzipan get its Jerusalem-made rugelach all the way to New York?",
  reveal: [
    { label: "Historical fact", text: "In the bakery's own words, after baking, the rugelach are flash-frozen and flown to its New York facility." },
    { label: "Interpretation", text: "That's the bakery's story of how it reached New York, not a list of what New York shops sell today." },
  ],
});

/** Unscored: a conversation after the challenge. Nothing is typed, sent or stored. Makes no claim about Marzipan and babka. */
export const MARZIPAN_APPRECIATION = Object.freeze({
  title: "Talk it over: babka for Shabbat",
  paragraphs: [
    { label: "Historical fact", text: "Babka comes from the Jewish bakers of Poland and Eastern Europe: spare challah dough, rolled up with jam or cinnamon and baked beside the challah." },
    { label: "Historical fact", text: "Jewish bakers brought it to New York. Chocolate babka came later, most likely in mid-20th-century America." },
  ],
  invitation: "Chocolate or cinnamon babka: which would you bring to a Shabbat dinner?",
  note: "Just talk it over. Nothing is recorded or scored.",
});

export const MARZIPAN_MISSION = Object.freeze({
  id: MARZIPAN_MISSION_ID, title: MARZIPAN_TASK.title, name: "Marzipan Bakery", shortName: "Marzipan",
  neighborhood: "Agripas Street, Mahane Yehuda, Jerusalem",
  location: Object.freeze({
    hebrewName: "מרציפן",
    // Address: site research run 06, row 14 (verified listing); English tour, Stop 22. Opening on the day is not guaranteed.
    summary: "A small bakery at 44 Agripas Street, known for its chocolate rugelach.",
    landmarks: Object.freeze([
      "44 Agripas Street, on the edge of the Mahane Yehuda market.",
      "A shop that may be busy: stand to one side so the queue can move.",
    ]),
  }),
  // TODO(field): the entrance is not field-checked. The queue is from 13tv/Yummies (29 Aug 2023), "the reason for the big line near the market".
  clue: "Find number 44 on Agripas Street, at the edge of the market. Look for a queue and trays of small chocolate rugelach.",
  // Chosen at the owner's request, 26 Oct 2026: Benjamin Lipsman (blipsman), Jerusalem, 28 Aug 2013, CC BY 2.0, via Wikimedia
  // Commons (File:9674765093 August 2013 in Jerusalem.jpg; Flickr 9674765093). Resized to 1280 px, metadata stripped.
  // The photo doesn't say which bakery it shows, so the alt doesn't claim it is Marzipan. Still no storefront photo.
  photo: Object.freeze({ src: "/shuk/marzipan-rugelach.jpg",
    alt: "Rows of small chocolate rugelach on metal trays in a bakery display, with more pastries behind.",
    credit: "Photo: Benjamin Lipsman, CC BY 2.0, via Wikimedia Commons" }) as MissionPhoto | null,
  cluePhoto: null,
  // The base map's own "Marzipan Bakery" label sits here (copied from a Google Maps screenshot, per docs/map/nahlaot-map-audit.md).
  // That is the illustration's position for the shop, not a field check. Owner review required.
  placement: Object.freeze({ x: 628, y: 472, verified: false }),
  arrival: Object.freeze({
    // No confirmed geographic point, so GPS stays off and the guide can confirm arrival.
    destination: null,
    radiusMeters: 100, maxAccuracyMeters: 50, maxAgeMs: 60_000, futureToleranceMs: 5_000, rewardPoints: 20,
  }),
  // The last stop: it opens once the other five missions are done.
  finale: true,
  challenge: MARZIPAN_CHALLENGE,
  rewards: MARZIPAN_REWARDS, hintCount: MARZIPAN_TASK.hints.length,
  followUps: Object.freeze([{ challenge: MARZIPAN_HORNS_CHALLENGE, hintCount: MARZIPAN_TASK.followUps[0].hints.length }]),
  bonus: Object.freeze({ challenge: MARZIPAN_BONUS_CHALLENGE, points: MARZIPAN_BONUS_POINTS }),
}) satisfies MissionDefinition;
