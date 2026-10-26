import type { ChoiceChallenge } from "./choice-task.ts";
import type { MissionDefinition, MissionPhoto } from "./mission-arrival.ts";
import { WELL_REWARDS, type WaterRewardConfig } from "./water-performance.ts";

export const LEVIN_MISSION_ID = "aryeh-levin-prisoners";

// Sources read 25 Oct 2026. Hebrew Wikipedia, "מאיר פיינשטיין" and "משה ברזני": Feinstein was born in the Old City and was a
// student of Rabbi Aryeh Levin; Barazani was born in Baghdad to a Kurdish Jewish family; Levin, "אבי האסירים", visited the
// condemned men every Shabbat; two oranges were emptied and filled with explosives; the plan to throw a grenade at the hangmen
// was dropped because the rabbi would be hurt; the explosion was at 23:40, the hanging set for 04:00; they gave their cigarettes
// to Levin for the prisoners and the British guard; Levin attended the burial. English Wikipedia, "Meir Feinstein": Etzel and
// Lehi; 21 April 1947; the embrace with the grenade between them is the romanticised version.
const HEWIKI = "Hebrew Wikipedia, מאיר פיינשטיין and משה ברזני (read 25 Oct 2026)";
const ENWIKI = "English Wikipedia, Meir Feinstein (read 25 Oct 2026), quoting Menachem Begin's 1981 speech: \"the Rabbi insisted that he would come to accompany them\"";
const TOUR = "Hebrew and English tours, Stop 1 (docs/scavenger_hunt/Machane_Yehuda_Tour_HE.md, _EN.md)";
const INVENTED = "Invented distractor; no source says this";

/** "Why did they change their plan?" One pick from four. Every source names a rabbi; they differ only on which one. */
export const LEVIN_CHALLENGE: ChoiceChallenge = Object.freeze({
  kind: "choice", required: 1, answerKeyVerified: true,
  options: Object.freeze([
    { id: "guard-warned", label: "A guard found out and warned the hangmen.", correct: false, source: INVENTED },
    { id: "spare-rabbi", label: "A rabbi would be with them, and they would not risk his life.", correct: true, source: `${HEWIKI}; ${ENWIKI}` },
    { id: "pardon-hope", label: "They still hoped for a pardon.", correct: false, source: INVENTED },
    { id: "families-asked", label: "Their families asked them not to.", correct: false, source: INVENTED },
  ]),
});

// Provisional copy of the well's local-testing values; not approved for this mission. Untimed, so a correct answer earns the maximum.
export const LEVIN_REWARDS: WaterRewardConfig = WELL_REWARDS;

/**
 * Story, question and reveal: draft English for owner review, adapted from the Hebrew sources. Told respectfully: no timing, no
 * hints, a quiet completion title. The story must not say why they changed their plan: that's the answer.
 */
export const LEVIN_TASK = Object.freeze({
  id: LEVIN_MISSION_ID,
  title: "The Father of the Prisoners",
  instruction: "This is a serious story. Ask your guide or an adult to read it aloud, then talk about the question together.",
  story: {
    title: "TWO PRISONERS AND THEIR RABBI",
    paragraphs: [
      { label: "Historical fact", text: "Rabbi Aryeh Levin lived here. Every Shabbat he walked to the British prison to visit Jewish prisoners, so people called him \"the father of the prisoners\"." },
      { label: "Historical fact", text: "In 1947, two young underground fighters there were sentenced to hang. Meir Feinstein was born in the Old City to an Ashkenazi family, and had been Rabbi Levin's student." },
      { label: "Historical fact", text: "Moshe Barazani was born in Baghdad to a Kurdish Jewish family. The two came from different communities and different undergrounds, and shared one cell." },
      { label: "Historical fact", text: "Comrades from the underground smuggled two grenades into their cell, hidden inside hollowed-out oranges. They planned to use them against the hangmen." },
    ],
    source: `${HEWIKI}; ${ENWIKI}; ${TOUR}.`,
    // Owner's photo #39 (design/inputs/photos/no-faces/), chosen for this challenge on 26 Oct 2026; web copy, metadata stripped.
    // The owner identified the bearded man as Rabbi Aryeh Levin, 26 Oct 2026. TODO(copy): the artist and the wall's location.
    image: { src: "/shuk/levin-mural.jpg", width: 1024, height: 1819,
      alt: "A large mural of Rabbi Aryeh Levin on a Nachlaot wall: an old bearded man in a hat and glasses merging into a tree trunk, above a seated figure whose head rises as smoke in the shape of the letter Aleph, in front of a city skyline.",
      caption: "A mural of Rabbi Aryeh Levin in Nachlaot, painted in 2015." },
  },
  question: "They had planned to use the grenades against the hangmen. Why did they change their plan?",
  hints: [],
  completionTitle: "Answer received",
  // Shown only after the group's answer is accepted.
  reveal: {
    paragraphs: [
      { label: "Historical fact", text: "On 21 April 1947, at 23:40, about four hours before the hanging, they set off a grenade in their cell. Both were killed." },
      { label: "Attributed tradition", text: "It's told that they embraced, with the grenade held between them." },
      { label: "Historical fact", text: "Earlier that evening they left their cigarettes to be shared among the other prisoners, and with the British guard who had treated them fairly." },
      { label: "Interpretation", text: "Sources differ on which rabbi they meant to spare: Rabbi Levin, who had said he would be there, or the prison rabbi, Rabbi Yaakov Goldman." },
      { label: "Historical fact", text: "Rabbi Levin was at their burial on the Mount of Olives." },
    ],
    image: null,
  },
});

// Owner's photo #25: the Kramer-Rechtman House plaque on HaCarmel St (design/inputs/photos/no-faces/MY_shuk_street-sign_hacarmel_kramer-rechtman-house-plaque_25.jpg).
const PLAQUE = "Kramer-Rechtman House plaque, HaCarmel St, owner's photo #25: \"Alexander and Chaya Kramer lived in this house… Rachel was engaged to Meir Feinstein, an ETZEL freedom-fighter and one of the 'OLE-HA-GARDOM'\"";

/** Optional bonus: the plaque on HaCarmel Street names the woman Meir Feinstein was engaged to. */
export const LEVIN_BONUS_CHALLENGE: ChoiceChallenge = Object.freeze({
  kind: "choice", required: 1, answerKeyVerified: true,
  options: Object.freeze([
    { id: "chaya", label: "Chaya", correct: false, source: `${PLAQUE} (her mother)` },
    { id: "rachel", label: "Rachel", correct: true, source: PLAQUE },
    { id: "bela", label: "Bela", correct: false, source: `${HEWIKI} (Feinstein's mother)` },
    { id: "miriam", label: "Miriam", correct: false, source: INVENTED },
  ]),
});
// Modest and provisional: points only, never food tokens, and never needed to complete the mission.
export const LEVIN_BONUS_POINTS = 10;

/** Draft copy for owner review. */
export const LEVIN_BONUS = Object.freeze({
  title: "Bonus: a name on HaCarmel Street",
  intro: "Optional, for later in the walk. On HaCarmel Street in the market, a plaque marks the Kramer family's house. Find it and read it together.",
  question: "What was the first name of the woman Meir Feinstein was engaged to?",
  reveal: [
    { label: "Historical fact", text: "The plaque says Rachel Kramer, an underground fighter herself, was engaged to Meir Feinstein. She later married in this house." },
  ],
});

export const LEVIN_MISSION = Object.freeze({
  id: LEVIN_MISSION_ID, title: LEVIN_TASK.title, name: "Rabbi Aryeh Levin's Home", shortName: "Rabbi Aryeh Levin",
  neighborhood: "Mishkenot Yisrael, Nahlaot, Jerusalem",
  location: Object.freeze({
    hebrewName: "בית הרב אריה לוין",
    // Site research run 06, row 1 (verified): the home is at the corner of Rabbi Aryeh Levin and Rabbi Haim Abulafia streets.
    summary: "The modest home of Rabbi Aryeh Levin, on the street now named after him.",
    landmarks: Object.freeze([
      "The corner of Rabbi Aryeh Levin Street and Rabbi Haim Abulafia Street.",
      "This is a private home. Look from the street and keep your voices low.",
    ]),
  }),
  clue: "Find the corner of Rabbi Aryeh Levin Street and Rabbi Haim Abulafia Street, and look for a small house with a memorial marking.",
  // The owner's mural of Rabbi Levin (photo #39), chosen for the preview and location details on 26 Oct 2026. It shows the
  // mural, not the house; whether the mural is at or near the home isn't recorded yet.
  photo: Object.freeze({ src: "/shuk/levin-mural.jpg", alt: "A large mural of Rabbi Aryeh Levin in a hat and glasses, merging into a tree trunk, on a Nachlaot wall." }) as MissionPhoto | null,
  cluePhoto: null,
  // Manual guess: south-east of the synagogue's marker, towards Mishkenot Yisrael. Owner review required.
  placement: Object.freeze({ x: 800, y: 690, verified: false }),
  arrival: Object.freeze({
    // Nominatim centroids of Rabbi Aryeh St (31.78262, 35.21408) and Abulafia St (31.78270, 35.21454), 25 Oct 2026 (© OpenStreetMap
    // contributors, ODbL); a provisional point between them. Not the corner itself and not field-verified, so GPS stays off.
    destination: Object.freeze({ latitude: 31.7827, longitude: 35.2143, verified: false }),
    radiusMeters: 100, maxAccuracyMeters: 50, maxAgeMs: 60_000, futureToleranceMs: 5_000, rewardPoints: 20,
  }),
  challenge: LEVIN_CHALLENGE,
  // A serious story: no clock and no hints.
  timed: false,
  rewards: LEVIN_REWARDS, hintCount: 0,
  bonus: Object.freeze({ challenge: LEVIN_BONUS_CHALLENGE, points: LEVIN_BONUS_POINTS }),
}) satisfies MissionDefinition;
