/** Reward pop-ups (Phase 2d, plan §8a): one compact pop-up per new server award, never repeated after reconnecting, never stacked.
 * The server's recorded award is the only trigger; this file decides, purely, which award a fresh view announces. */

export type RewardKind = "core" | "arrival" | "bonus";
export type RewardRecord = Readonly<{ key: string; missionId: string; kind: RewardKind; points: number; foodTokens: number; at: number; revealed: boolean }>;

/** The parts of a server view that carry a mission's awards. */
export type RewardSource = Readonly<{
  mission: Readonly<{ id: string; arrivalPoints: number; arrivalAt?: number }>;
  performance: Readonly<{ reward: Readonly<{ points: number; foodTokens: number }> | null; awardedAt?: number; revealed?: boolean }>;
  session: Readonly<{ bonus?: Readonly<{ completed: boolean; points: number; awardedAt?: number }> }>;
}>;

/** Every recorded award in the view of one mission. Keys are stable: mission, part and the server's own time of the award. */
export function rewardRecords(view: RewardSource): readonly RewardRecord[] {
  const id = view.mission.id;
  const records: RewardRecord[] = [];
  if (view.mission.arrivalAt !== undefined && view.mission.arrivalPoints > 0)
    records.push({ key: `${id}:arrival:${view.mission.arrivalAt}`, missionId: id, kind: "arrival", points: view.mission.arrivalPoints, foodTokens: 0, at: view.mission.arrivalAt, revealed: false });
  const reward = view.performance.reward;
  if (reward && view.performance.awardedAt !== undefined)
    records.push({ key: `${id}:core:${view.performance.awardedAt}`, missionId: id, kind: "core", points: reward.points, foodTokens: reward.foodTokens, at: view.performance.awardedAt, revealed: view.performance.revealed === true });
  const bonus = view.session.bonus;
  if (bonus?.completed && bonus.awardedAt !== undefined)
    records.push({ key: `${id}:bonus:${bonus.awardedAt}`, missionId: id, kind: "bonus", points: bonus.points, foodTokens: 0, at: bonus.awardedAt, revealed: false });
  return records;
}

/** Full: a challenge solved (badge, cheer). Light: navigation only. Quiet: an answer shown after "I'm completely stuck". */
export type RewardWeight = "full" | "light" | "quiet";
export type RewardEvent = Readonly<{ keys: readonly string[]; missionId: string; weight: RewardWeight; points: number; foodTokens: number }>;

/** Older than this, a newly seen award (a phone back from a long time offline) shows only the inline result, never a pop-up. */
export const REWARD_RECENT_MS = 5 * 60_000;

/**
 * The one pop-up a fresh view should show, or null. An award counts only when (a) this phone already knew the mission and the
 * award wasn't in what it knew (`known`: a page load or a newly opened mission announces nothing), (b) this device hasn't shown
 * it before (`seen`), and (c) it is recent. Awards that land together merge into one pop-up with both amounts.
 */
export function pendingRewardEvent(records: readonly RewardRecord[], known: ReadonlySet<string> | null, seen: ReadonlySet<string>, now: number): RewardEvent | null {
  if (!known) return null;
  const fresh = records.filter(record => !known.has(record.key) && !seen.has(record.key) && now - record.at <= REWARD_RECENT_MS && record.at <= now + 60_000);
  if (!fresh.length) return null;
  const weight: RewardWeight = fresh.some(record => record.revealed) ? "quiet"
    : fresh.some(record => record.kind !== "arrival") ? "full" : "light";
  return { keys: fresh.map(record => record.key), missionId: fresh[0].missionId, weight,
    points: fresh.reduce((sum, record) => sum + record.points, 0), foodTokens: fresh.reduce((sum, record) => sum + record.foodTokens, 0) };
}

/** This device's "seen" list: the last 100 keys, newest last. Storage may be missing or blocked; then nothing is remembered. */
const SEEN_KEY = "shuk:rewards-seen:v1";
export function readSeenRewards(storage: Pick<Storage, "getItem"> | null): Set<string> {
  try {
    const parsed: unknown = JSON.parse(storage?.getItem(SEEN_KEY) ?? "[]");
    return new Set(Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : []);
  } catch { return new Set(); }
}
export function rememberSeenRewards(storage: Pick<Storage, "getItem" | "setItem"> | null, keys: readonly string[]): void {
  try {
    const next = [...readSeenRewards(storage), ...keys].filter((key, index, all) => all.lastIndexOf(key) === index).slice(-100);
    storage?.setItem(SEEN_KEY, JSON.stringify(next));
  } catch { /* A device that can't store keys may show an award again; the server still counts it once. */ }
}

/** The reward sound (D11): off by default. No licensed sound is chosen yet, so nothing plays and no toggle is shown (P2-4). */
export const REWARD_SOUND_SRC: string | null = null;
