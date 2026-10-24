export const WATER_HINTS = Object.freeze([
  { title: "Hint 1 — Gentle", text: "Try using the difference between the two measuring vessels." },
  { title: "Hint 2 — More specific", text: "What happens if you fill the 5-liter vessel and pour water into the 3-liter vessel?" },
  { title: "Hint 3 — Almost there", text: "That leaves 2 liters. Can you collect that amount twice in your family's jar?" },
]);
export function visibleWaterHints(count: number) {
  return WATER_HINTS.slice(0, Number.isFinite(count) ? Math.max(0, Math.min(WATER_HINTS.length, Math.floor(count))) : 0);
}
export function nextWaterHintCount(count: number): number {
  return Math.min(WATER_HINTS.length, visibleWaterHints(count).length + 1);
}
