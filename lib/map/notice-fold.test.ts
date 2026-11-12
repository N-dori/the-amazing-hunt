import assert from "node:assert/strict";
import { test } from "node:test";
import { NOTICE_AUTO_FOLD_MS, shouldAutoFoldNotice } from "./notice-fold.ts";

test("an open notice of nonessential guidance folds on its own after the caller's delay; the Shuk's waits 30 s", () => {
  assert.equal(NOTICE_AUTO_FOLD_MS, 30_000);
  assert.equal(shouldAutoFoldNotice({ autoFoldMs: NOTICE_AUTO_FOLD_MS, open: true, touched: false }), true);
});

test("a notice without a delay (essential, or not opted in) never folds on its own", () => {
  assert.equal(shouldAutoFoldNotice({ autoFoldMs: undefined, open: true, touched: false }), false);
  assert.equal(shouldAutoFoldNotice({ autoFoldMs: 0, open: true, touched: false }), false);
});

test("nothing to fold when it's already folded, and the player's own choice stands once they've used the (i) button", () => {
  assert.equal(shouldAutoFoldNotice({ autoFoldMs: NOTICE_AUTO_FOLD_MS, open: false, touched: false }), false);
  assert.equal(shouldAutoFoldNotice({ autoFoldMs: NOTICE_AUTO_FOLD_MS, open: true, touched: true }), false);
});
