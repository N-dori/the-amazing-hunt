/** UX-4 (owner, 2 Nov 2026): the reward pop-up's points count up once, quickly; the card on the page never animates.
 * With reduced motion the final number shows at once. The value is always the server's award; this only paces the digits. */
export const COUNT_UP_MS = 700;

/** The number to show `elapsedMs` into the count-up: eased out, a whole number, never past the target. */
export function countUpValue(target: number, elapsedMs: number, durationMs = COUNT_UP_MS): number {
  if (!Number.isFinite(target) || target <= 0) return Math.max(0, Math.round(target) || 0);
  if (!(elapsedMs < durationMs)) return target;
  const progress = Math.max(0, elapsedMs) / durationMs;
  const eased = 1 - (1 - progress) ** 3;
  return Math.min(target, Math.floor(target * eased));
}
