import { FOOD_COPY, isFoodTastingId, type FoodPhoto, type FoodTasting, type FoodTastingId } from "./food-catalogue.ts";

export const FOOD_RETURN_STORAGE_KEY = "shuk:food-catalogue-return";
export type FoodReturnPosition = Readonly<{ top: number; id: FoodTastingId }>;
export function parseFoodReturnPosition(value: unknown): FoodReturnPosition | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  return typeof item.top === "number" && Number.isFinite(item.top) && item.top >= 0 && isFoodTastingId(item.id)
    ? { top: item.top, id: item.id } : null;
}

export type FoodTastingView = Readonly<{
  id: string; name: string; description: string; vendor: string; vendorStatus: string | null;
  price: string; portion: string; dietary: string; location: string; availability: string;
  notice: string; photo: FoodPhoto | null;
}>;
/** Pure read-only projection. This iteration exposes no purchase/redeem capability. */
export function buildFoodTastingViews(items: readonly FoodTasting[], failedImageIds: readonly string[] = []): readonly FoodTastingView[] {
  return items.map(item => ({
    id: item.id, name: item.name, description: item.description,
    vendor: item.vendorName ?? FOOD_COPY.vendorPending,
    vendorStatus: item.vendorName && !item.vendorConfirmed ? FOOD_COPY.vendorUnconfirmed : null,
    price: item.tokenCost === null ? FOOD_COPY.tokenCostPending : `${item.tokenCost} food tokens`,
    portion: item.portion ?? FOOD_COPY.portionPending,
    dietary: item.dietaryInformation ?? FOOD_COPY.dietaryPending,
    location: item.location ?? FOOD_COPY.locationPending,
    availability: item.availability === "unconfirmed" ? FOOD_COPY.availabilityPending : item.availability,
    notice: FOOD_COPY.detailNotice,
    photo: failedImageIds.includes(item.id) ? null : item.photo,
  }));
}
