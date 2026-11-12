import test from "node:test";
import assert from "node:assert/strict";
import { queuedActionOutcome } from "./action-sync.ts";

test("a queued action: applied on success, retried while offline or signed out, dropped on a permanent refusal (N1)", () => {
  assert.equal(queuedActionOutcome(200), "applied");
  for (const status of [500, 502, 503, 401, 409]) assert.equal(queuedActionOutcome(status), "retry", String(status));
  // 404 is what a Let in, Decline or Remove gets once join links are switched off: it must not block the actions behind it.
  for (const status of [400, 403, 404, 413, 422, 429]) assert.equal(queuedActionOutcome(status), "refused", String(status));
});
