/**
 * What a phone does with a queued action after the server answers. "applied": the server took it. "retry": keep it at the head
 * of the queue (offline, server trouble, signed out, or the identity changed), so nothing behind it jumps ahead. "refused": a
 * permanent no (e.g. 404 join links switched off, 403 not allowed): drop it and show why, so it never blocks the actions after it.
 */
export type QueuedActionOutcome = "applied" | "retry" | "refused";
export function queuedActionOutcome(status: number): QueuedActionOutcome {
  if (status >= 200 && status < 300) return "applied";
  if (status >= 500 || status === 401 || status === 409) return "retry";
  return "refused";
}
