export const FOOD_TASTING_IDS = ["tahini", "rugelach", "bourekas", "etrog-drink"] as const;
export type FoodTastingId = typeof FOOD_TASTING_IDS[number];
export function isFoodTastingId(value: unknown): value is FoodTastingId {
  return typeof value === "string" && FOOD_TASTING_IDS.some(id => id === value);
}
export type FoodPhoto = Readonly<{
  src: string; width: number; height: number; alt: string;
  author: string; sourceUrl: string; license: string; licenseUrl: string;
  caption: string; changes: string;
}>;
/** Catalogue proposals only. Null means unknown, never free, available or safe for a diet. */
export type FoodTasting = Readonly<{
  id: FoodTastingId; name: string; description: string;
  status: "provisional"; vendorName: string | null; vendorConfirmed: boolean;
  portion: string | null; tokenCost: number | null; dietaryInformation: string | null;
  location: string | null; availability: "unconfirmed" | "available" | "unavailable";
  photo: FoodPhoto | null; sources: readonly string[];
}>;

// TODO(copy): owner review of concise proposal descriptions and UI labels. Not final vendor offers.
export const FOOD_COPY = {
  title: "Taste the Market",
  intro: "Earn food tokens through challenges and choose market tastings together.",
  notice: "Provisional tastings. Vendors, servings and token costs are still being confirmed. Nothing can be purchased here yet.",
  detailNotice: "Provisional tasting — not available to redeem.",
  tokenCostPending: "To be confirmed", vendorPending: "Vendor to be confirmed",
  vendorUnconfirmed: "Participation not confirmed", portionPending: "Serving to be confirmed",
  dietaryPending: "Ingredients and dietary information not yet verified",
  locationPending: "Meeting point to be confirmed", availabilityPending: "To be confirmed",
  back: "Back to Food", view: "View tasting", empty: "Tastings are being prepared.",
};
const IDEAS = "design/inputs/content/Mission_Task_Ideas.md, idea 32 and tasting-menu notes";
const pending = {
  status: "provisional", vendorConfirmed: false, portion: null, tokenCost: null,
  dietaryInformation: null, availability: "unconfirmed", photo: null,
} as const;
export const FOOD_CATALOGUE: readonly FoodTasting[] = [
  { ...pending, id: "tahini", name: "Tahini tasting", vendorName: null, location: null,
    description: "Explore tahini as a possible shared tasting.", sources: [IDEAS, "photo_index_ALL.csv #76 and #78 (originals unavailable locally)"] },
  { ...pending, id: "rugelach", name: "Rugelach", vendorName: null, location: null,
    description: "A sweet pastry candidate for the group to share.", sources: [IDEAS] },
  { ...pending, id: "bourekas", name: "Bourekas", vendorName: null, location: null,
    description: "A savoury pastry candidate. The filling and serving are still to be confirmed.", sources: [IDEAS] },
  { ...pending, id: "etrog-drink", name: "Etrog Man drink", vendorName: "Etrog Man",
    location: "HaEgoz Street, Mahane Yehuda market. Exact meeting point to be confirmed.",
    description: "Explore a drink tasting from Etrog Man. The recipe and serving are still to be confirmed.",
    sources: [IDEAS, "https://etrogman.com/contact/ (HaEgoz street agreed; conflicting numbers 6 and 10, inspected 25 Oct 2026)"] },
];
