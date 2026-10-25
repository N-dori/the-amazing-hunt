# The Amazing Shuk ? Development Roadmap

**25 Oct 2026 gateway checkpoint:** The separate Montefiore gateway two-stage mission is implemented; Gan HaTut now uses the cistern image exclusively. Four missions total. Next is owner map placement/GPS and mobile/two-browser acceptance, not another mission. Gateway has a labelled entry beside the illustrated map until a pin is verified. See latest [handoff](../docs/project/agent-handoff.md) for sources, implementation and 123 Shuk / 61 Memory Protocol tests. Older counts below are historical checkpoints.


**Checkpoint: 24 Oct 2026.** Shuk only; keep the existing Memory Protocol app separate. Follow [approved decisions](../docs/project/product-decisions.md), [current state](../docs/project/current-state.md) and [shared handoff](../docs/project/agent-handoff.md).

**25 Oct 2026 completion checkpoint:** All four missions share the victory → historical discovery → Explore Next Mission presentation. A/B/C focused checks and final 129 Shuk / 61 Memory Protocol regressions pass. Scoring/progress/GPS/authentication unchanged. Browser/device acceptance remains next, alongside the existing gateway placement/field checks; no new mission. See [completion record](../docs/project/mission-completion.md).

**25 Oct 2026 Food iteration 1:** Four provisional catalogue/detail entries and the real shared balance are implemented; no spending/redemption. 137 Shuk / 61 Memory Protocol tests pass. Photos remain text-only because reviewed downloads were rate-limited; see [Food record](../docs/project/food-catalogue.md). Next is owner UI/content review and confirming one tasting before a guide-redemption slice. This latest owner request takes priority over older “next task” notes below.

## Now

1. Finish acceptance of the existing playable well/participant identity slice. Manual invitation sessions, JSON/shared progress, contextual three-container puzzle, quiet timing/shared hints/idempotent rewards and deterministic avatars are implemented. 64 Shuk and 61 Memory Protocol tests pass; exact verification limits are in the handoff.
2. Owner checks two browser profiles: stable independent identity/avatar, common puzzle/hints/roles, one authorized submission, identical shared achievements after refresh/relogin. Check mobile layout, keyboard/fallback and reconnect. Preserve existing completed records; no fabricated retroactive rewards.
3. Resume gameplay rather than expanding authentication. Use the existing [content index](inputs/content/README.md), Claude research and source verification to select one next task; no new broad planning/research batch.

## Next small deliveries

- One additional sourced, deterministic playable market challenge, with approved copy/answer/reward settings and a tested full solution. Target six independently verified playable tasks; ten ideal.
- Current map-to-mission slice is implemented: Gan HaTut selection opens the same well story/puzzle without GPS. Optional **We're Here?** may award20 group points once; guide confirmation works without GPS. Next: owner confirms the garden photograph, approximate illustrated pin and actual arrival coordinate, then checks mobile/HTTPS behavior. No location dot, georeferencing, routing or GPS gate. See [well/map record](../docs/project/water-task.md).
- Add shared multi-task progress and guide-controlled food redemption only with approved offers/token costs, preserving existing atomic completion receipts and backend roles.
- Four-screen onboarding using approved concise copy and the one-group model.

## Deferred / approval needed

- Email magic links/SMTP, external providers/Auth.js, expanded enrollment/authentication; retain implemented manual invitations. Gameplay has priority.
- Protected Shuk production app boundary, VPS permissions/backups/durability, deployment and public phone access. Deployment requires explicit approval; retain the opt-in loopback development gates.
  - **Own app and address (owner decision, 24 Oct 2026: split the Shuk into its own app; not now).** The Shuk still runs inside the Memory Protocol app, so its dev page is `/memory-protocol/dev/amazing-shuk/water` (prefix from `lib/base-path.ts`; the page name dates from the well-only prototype). The owner chose a separate app with its own prefix, image and access gate, not a change to the shared prefix (which would also move the Memory Protocol's image, `deploy/deploy.sh` health checks and Caddy route). Plan it first; do it before real-phone testing.
- Food/vendor availability, costs, allergens, current offers, content access and image rights require verification; provisional well rewards are not final market-economy settings.
- Proposed 3-5 available tasks/reveal rules are not approved unlock policy. GPS never gates story/challenge access; optional proximity assistance/bonus supersedes the earlier no-GPS policy. No participant tracking infrastructure or turn-by-turn routing planned.

## Superseded

Team-count/competition prototype, 300/500 ml water task, zero-reward and local-only scored-hint notes, and missing-dependency blockers are historical. `design/prototypes/amazing-shuk-team-format/` remains isolated. Never modify Claude UX designer files without explicit owner approval.
