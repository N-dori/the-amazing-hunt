# The Amazing Shuk ? Current Implementation State

**Updated: 24 Oct 2026, optional GPS map iteration.** Local Windows checkout `the-amazing-hunt`, branch `main`. This summary supersedes older implementation counts/environment notes in the [handoff history](agent-handoff.md). No commit, push, revert or deployment during this checkpoint.

## Implemented; automated verification passes

- One fixed development roster (`guide`, `player-1` through `player-7`), independent server-validated browser sessions and one shared JSON group. Manual single-use invitations/session secrets are hashed; invitations expire in 24 hours, sessions in seven days. Roles are backend-enforced; navigator and submitter may coincide. No external authentication provider/SMTP.
- JSON writers use a filesystem lock, synced temporary snapshot and atomic rename; action receipts prevent duplicate actions/rewards. Queued browser actions retry using participant/revision-specific local storage. A stale lock requires stopping all writers before manual recovery. See [login runbook](local-participant-login.md).
- One playable local well task: 3 L and 5 L measuring vessels, distinct 4 L family jar, contextual selection/pouring/return-to-well, reset and optional progressive hints. Jar cannot fill directly or pour out. Maximal pours retain the documented shortcut; repeated 2 L solution is also tested. Only jar=4 and authorized official submission finalize completion.
- Hebrew-first sourced English story, attributed tradition, read-aloud invitation and collapsed references. Original Hebrew is development-only. Brand Book/tokens/ActionButton reused; no unrelated visual system. See [task/source/brand record](water-task.md).
- Invisible shared server timing starts explicitly after story and stops on the solving move. Shared hint accounting; guide-only pause/resume/reset/exclude. No participant timer, countdown, live score, automatic timeout or leaderboard. Configurable provisional well rewards: 100 maximum/40 minimum points, two food tokens; atomically awarded once on authorized submission. Schema/action revision 4 adds optional arrival metadata and preserves identities/progress and does not fabricate retroactive rewards/times.
- Schema/action revision 5 (Claude, 24 Oct 2026, committed locally, not pushed): progress, timing and rewards are stored per mission ID with group-wide roles; the catalogue is `lib/amazing-shuk/missions.ts`; polling reads take no lock. Refresh browsers after upgrading. Details in the [handoff](agent-handoff.md).
- DiceBear local SVG avatars integrated into current identity and assigned-role displays. Pinned core10.7.0/styles10.6.0; Line Face CC0, core MIT. Immutable ID seed, nickname-independent, no stored avatar files or remote default requests. Custom-image precedence and initials fallback supported by component; no existing profile-image storage/enrollment flow was added. See exact files and tests in [handoff](agent-handoff.md).

## Partial / prototype / unverified

- Owner reported Next starts, water page HTTP200 and working puzzle mechanics. Independent browser identities, reconnection, rendered avatars, phone/accessibility acceptance and production HTTP404 remain unverified end-to-end. Handler cookie-jar tests are not real-browser proof.
- Existing Leaflet renderer now also serves a Shuk Gan HaTut marker/preview on the same gated water route. Selection reveals the existing story/puzzle immediately, independent of arrival status. Shared JSON projects Available/Arrival confirmed/Completed labels and distinct marker symbols. No GPS dot, second map, routing or georeferencing. Shared renderer consumes neutral image geometry (`lib/map/image-map.ts`), not Memory Protocol domain/content.
- Optional **We're Here?** uses a one-shot fresh browser reading and server validation; a separate20-point group bonus is idempotent and guide-confirmable. Current destination coordinates are unverified, so live GPS bonus checks stay disabled; the button gives friendly fallback without requesting an unnecessary reading. Actual confirmed-coordinate path is tested with injected/mock evidence only. Candidate pin is manual(600,650), flagged approximate; no documented Gan HaTut placement was found.
- No identified garden photograph exists in the checked-in/local photo set; preview honestly reports its absence rather than substituting an unrelated image. HTTPS real-phone GPS/mobile/screen-reader/Next end-to-end acceptance remains pending. Current image's label/provenance concerns remain in the [map audit](../map/nahlaot-map-audit.md).
- No six-task set yet: one local playable challenge is not six field-verified tasks. Shared task catalogue/map adapter, onboarding, approved food offers/prices/redemption, rights/access verification and production boundary remain open.

## Current verification

- `npm.cmd run test:shuk`: **64 passed, 0 failed** (including15 new arrival/map tests, eight avatar/identity tests, login/persistence/authorization, gameplay, scoring, shared actions and actual TSX static rendering).
- `npm.cmd test`: **61 passed, 0 failed**, including14 map-helper tests.
- `npx.cmd tsc --noEmit`: pass. Targeted ESLint for changed map/arrival/integration files: pass; Both changed Sass files compile. Full lint fails on three pre-existing require-import errors in the isolated prototype and eleven existing warnings.
- `git diff --check`: pass after documentation edits; all94 local documentation file links resolve. No build over the owner's development output, browser review, screenshot, deployment or live VPS test performed.
- Dependencies are installed and Next16.3.8/React19.2.8 declared. Earlier missing-executable/network reports are historical; do not infer Next is absent from `next.cmd` errors. Node emits a non-failing MODULE_TYPELESS_PACKAGE_JSON warning; no broad module-type change was made to suppress it.

## Boundary, preservation and next step

Shuk page and API remain development-only, explicit `SHUK_DEV_SIMULATION=1`, loopback Host, 404 otherwise. Production isolation, durable VPS storage/backups and real enrollment are unverified. `lib/base-path.ts` remains the deployment-prefix source; repository name differs from the existing app prefix.

Owner committed the earlier checkpoint as `5d6d595`; this map/optional-GPS iteration remains uncommitted. Preserve its dirty files. No dependency changes or commit/push were performed in this iteration. See [handoff](agent-handoff.md) for exact file inventory, blockers and acceptance criteria; [roadmap](../../design/amazing-shuk-roadmap.md) for priority; [decisions](product-decisions.md) for approved/deferred/superseded directions.
