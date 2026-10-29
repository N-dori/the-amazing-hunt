import { WATER_TASK_ID } from "./water-measurement.ts";

/** English adapted from the full Hebrew section under the owner-approved storytelling workflow. The oral account is not a verified event at a specific well. */
export const WATER_TASK = Object.freeze({
  id: WATER_TASK_ID,
  title: "How many families share the water?",
  instruction: "Choose someone from your group to read this story aloud. Then work together to solve the challenge.",
  story: {
    title: "THE STORY OF THE WELL",
    label: "Attributed tradition",
    paragraphs: [
      "Lowered into a cistern on a rope: punishment or honor?",
      "According to the local account, children longed for the cleaning job.",
      "Before the rains, a boy was lowered through a narrow opening to clean it.",
      "Now measure your family's water.",
    ],
    source: "Hebrew tour transcript, HE_trans.txt, lines 54–66; English tour, Stop 5: Gan HaTut — Mulberry Garden and the Water Cisterns.",
    sourcePaths: ["docs/knowledge/HE_trans.txt", "docs/knowledge/Machane_Yehuda_Tour_EN.md#stop-5-gan-hatut--mulberry-garden-and-the-water-cisterns"],
    originalHebrew: [
      "אנחנו בסמוך לגן התות, יש פה בור מים, בכלל במהלך השכונה יש עוד ועוד, פשוט צריך לחפש אותם. אנחנו ממש ליד בית משפחת אבון, שעוד מעט תראו.",
      "אז כל בור מים הייעוד שלו נקבע לפי מידת הניקיון. כלומר, הבור הענקי ביותר שמשמש לשתייה, בדרגה השנייה של ניקיון לרחצה ולכביסה, ובדרגה שלישית לספונג'ה וניקיונות.",
      "המים שהיו מגיעים לבורות המים היו מגיעים מהמרזבים, מי הגשמים, היו מתנקזים כאן למטה.",
      "הבורות מים היו מנקים קצת לפני עונת הגשמים בצורה הכי פרימיטיבית שיש. פשוט לוקחים מדרגה ויורדים למטה ומנקים אותו לפני שיגיע הגשם, כדי שלא ילך הרבה עם הגשם.",
      "חלק מהפתחים היו מאוד צרים, אך בכל זאת היו יורדים למטה לנקות את בור המים. לוקחים ילד, קושדים אותו בחבל, משלשלים אותו למטה והוא היה מנקה.",
      "עבור אותו ילד, האם מדובר בגאווה או בעונש? מה אתם חושבים? התשובה היא גאווה! כן, ויוסי בנאי, גם כן שצמח בשכונות נחלאות בשוק מחנה יהודה, מספר על השתוקקות של הילדים לזכות בכבוד המפוקפק הזה של להיות מנקה בורות המים.",
      "אז מה שהיום נחשב התעללות בחוסר יאשע, פעם היה כבוד מאוד גדול. הזמנים השתנו. אז תכף נראה את בורות המים של הנחלאות."
    ],
    // TODO(copy/source): the transcript says before the rainy season, not explicitly once a year.
    // The transcript attributes the recollection to Yossi Banai; his original passage is not supplied.
  },
  // Owner-supplied puzzle wording; a game premise, not a claim about historical ration sizes.
  narrative: [
    "Use the 3-liter and 5-liter measuring vessels to collect exactly 4 liters in your family's jar.",
    "Fill from the well, pour between containers, or return water to the well.",
  ],
  narrativeLabel: "Fiction",
  narrativeLabelDetail: "Puzzle scenario",
  rules: "The entire challenge takes place digitally. No physical cups, buckets, water, or props are required.",
  jarRule: "Your family's jar cannot be filled directly from the well or poured back out. Each pour transfers as much as possible without overflowing.",
});
