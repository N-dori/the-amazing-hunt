import { createHash } from "node:crypto";

/** O6 (owner, 31 Oct 2026): asks to join per link, and overall, in any minute. Counted in memory, so a restart resets them. */
export const ASKS_PER_LINK = 10;
export const ASKS_OVERALL = 30;
const WINDOW_MS = 60_000;
type Asks = { overall: number[]; perLink: Map<string, number[]> };
// On globalThis so that every copy of this module in one server process shares one count (as the store's write line does).
const holder = globalThis as typeof globalThis & { shukJoinAsks?: Asks };
const asks: Asks = holder.shukJoinAsks ??= { overall: [], perLink: new Map<string, number[]>() };

/**
 * Whether an ask may go ahead; if so, it is counted. Runs before the store is touched, so a flood of asks is refused without
 * reading or locking the state file (S0-B: it can't fill the write line). Links are counted by hash, never kept in memory.
 * At most ASKS_OVERALL asks are held per minute, so the per-link map stays as small.
 */
export function allowJoinAsk(link: string, now = Date.now()): boolean {
  const since = now - WINDOW_MS;
  asks.overall = asks.overall.filter(time => time > since);
  for (const [key, times] of asks.perLink) {
    const recent = times.filter(time => time > since);
    if (recent.length) asks.perLink.set(key, recent); else asks.perLink.delete(key);
  }
  const key = createHash("sha256").update(link).digest("hex");
  const mine = asks.perLink.get(key) ?? [];
  if (asks.overall.length >= ASKS_OVERALL || mine.length >= ASKS_PER_LINK) return false;
  asks.overall.push(now);
  asks.perLink.set(key, [...mine, now]);
  return true;
}
/** Tests only: forget every ask. */
export function resetJoinAsks() { asks.overall = []; asks.perLink.clear(); }
