# The Amazing Shuk — Current Implementation State

## Session commit checkpoint - 25 Oct 2026

Owner requested a commit of all accumulated session changes. The accompanying commit includes implementation/docs/settings and app assets, preserving private runtime state and untracked owner/research originals outside Git. Resolve the current checkpoint with `git log -1`; older uncommitted/HEAD notes below describe earlier checkpoints. Verification remains 137 Shuk / 61 Memory Protocol tests passing, with the existing lint and browser/image limitations. No push/deploy or server/progress changes accompany the commit.

## Food catalogue iteration 1 - 25 Oct 2026

Handoff prepared: the top [Food catalogue checkpoint](agent-handoff.md) contains the next-session prompt, preserved workspace/runtime boundaries and outstanding acceptance steps. Existing regression logs were re-read (137 Shuk / 61 Memory Protocol passes); no suites were rerun or game state changed for this documentation-only preparation.

Food now shows Taste the Market, one real shared-token balance, four provisional entries (Tahini, Rugelach, Bourekas, Etrog Man drink) and concise detail screens. Unknown costs/servings/dietary information remain explicit; no offers are purchasable. Validated detail history and local/session scroll/focus restoration preserve the mission journey and bottom navigation. No spending, ledger, transaction, API or token-system change.

Image limitation: three Commons source/licence records reviewed, but downloads were repeatedly HTTP 429; no images bundled/hotlinked. All four entries currently use the allowed text-only fallback. The optional photo/credit/error-fallback renderer is tested. [Full sources, missing vendor data, files and browser checklist](food-catalogue.md).

Verified **137 Shuk + 61 Memory Protocol tests**, TypeScript, targeted Shuk lint, Food Sass and diff check pass. Full lint retains three existing prototype errors/eleven unrelated warnings. Real browser/mobile review remains pending. Live state was not edited/restored; it changed during the active session and its latest contents were preserved. Unrelated library-asset changes remain untouched. No server interruption, active-output deletion, build, commit, push or deployment.

## Handoff prepared - 25 Oct 2026

The top [Start here handoff](agent-handoff.md) is the next-session entry point. Latest regression logs confirm 129 Shuk / 61 Memory Protocol passes; suites were not rerun for this documentation-only handoff. Live state hash remains identical to the victory-work baseline; diff check passes. Next: owner browser acceptance of shared victories, followed by evidence-backed gateway placement. Preserve all dirty/untracked work and `.local/` progress; do not reset or interrupt the server, remove active `.next/`, commit, push or deploy.

## Shared mission victory experience - 25 Oct 2026

All four server-completed missions now use shared victory/reward/discovery presenters and Explore Next Mission. Active main questions/answers, reset/hints and repeated completion feedback disappear. Persisted rewards are shown once, including zero; missing legacy awards are not fabricated. Gateway uses the requested headline/date conversion; other missions retain existing story/reveal copy and imagery/credits. Historical story remains collapsed; synagogue bonus/appreciation remain optional disclosures. Guide timing is inside Guide controls, completed diagnostics inside Development. No scoring/answer/authentication/GPS/state changes.

A/B/C focused checks passed in order; final **129 Shuk + 61 Memory Protocol tests pass**, TypeScript, targeted Shuk lint, changed Sass and diff check pass. Full lint retains three existing prototype errors/eleven unrelated warnings. Static callback test verifies all four Explore actions preserve map view/completed markers without selecting a destination or mutating server results. Live progress hash unchanged during checks. Browser/mobile/two-profile acceptance remains pending. No server interruption, active-output deletion, production build, commit, push or deployment. [Detailed files, sources and browser checklist](mission-completion.md).

## Story and challenge navigation refinement - 25 Oct 2026

Shared challenge stories/reveals omit visible historical/attribution labels; natural uncertainty, evidence metadata and image credits remain. Synagogue introduction is five continuous short lines without the tavern answer. Existing answer validation, blue-sign reveal, literary Luna bonus and Eshet Chayil appreciation remain. Supplied generated family illustration is shown after accepted completion with the exact reconstruction caption and fictional-subject alt text. No archival source photograph was added to the UI. See [source/rights, modified files and browser checklist](synagogue-story-ux.md).

Challenges retain only left-arrow Back to location; persistent Map navigation remains. Existing map/history/shared progress is preserved. Gateway unsubmitted year draft now survives challenge unmounts for back/tab navigation, defers to changed shared answers and clears on successful sign-out. Added control scroll clearance uses the existing measured bottom-nav/safe-area offset.

Verified 127 Shuk and 61 Memory Protocol tests, TypeScript, targeted Shuk lint, both changed Sass modules and diff check. Full lint retains the documented three prototype errors/eleven unrelated warnings. Live state SHA-256 unchanged across the iteration's checks. Browser/mobile/assistive-technology review is pending. Preserved all prior local changes; no restart, production build, commit, push or deployment.

## Focused split acceptance recheck - 25 Oct 2026

Six focused checks pass: four gateway domain/integration tests and two gateway static-render tests. Integration fixtures are isolated temporary files; the sandbox blocked fixture atomic rename, so the four tests were rerun successfully outside it. No full suite or build was run. Read-only HTTP checks return 200 for the existing game page and both destination photographs; listener remains PID 49156 on 127.0.0.1:3000. Live state SHA-256 is unchanged before/after this iteration. Existing local changes preserved.

Map wiring verified in source: `ListArrivalMission` excludes off-map markers from Leaflet and renders the gateway as a selectable entry beside it. Gateway placement and GPS remain null. The map audit supplies no verified gateway illustration point and explicitly rejects automatic geographic fitting; owner-confirmed image placement and visual/two-profile acceptance remain pending. No server interruption, progress reset, commit, push or deployment.

## Separate garden and gateway missions - 25 Oct 2026

Four missions now: existing Well, Mural, Synagogue and new `montefiore-gateway`. Gan HaTut uses only the cistern photo and retains its original ID/state/mechanics/rewards. Gateway reuses the existing owner gateway crop; independent two-stage languages/year challenge, attempts, hints, arrival and one completion award. The photographed תרמ״ג with לפ״ק was verified online; 5643 spans 1882-83 and the question asks for the later Gregorian year, 1883. Sources and rights distinctions are recorded in the latest [handoff](agent-handoff.md).

Gateway map placement is deliberately unset pending owner review; selectable entry beside the map, no invented pin. GPS destination null, guide arrival available; garden GPS unchanged. Gateway copy/rewards are provisional and mobile/two-browser acceptance pending. 123 Shuk and 61 Memory Protocol tests, TypeScript, targeted lint, Sass and diff checks pass. Live state unchanged byte-for-byte; game/photos HTTP 200 and server PID 49156 unchanged. No commit, deployment, server interruption or active-output deletion.


## Local server restored - 25 Oct 2026

Owner reported server down. Read-only OS check confirmed no Next process or port-3000 listener; existing log showed successful compilation but no shutdown cause. Started a hidden detached Next development process with development mode, SHUK_DEV_SIMULATION=1, loopback 127.0.0.1:3000 and explicit existing .local/amazing-shuk/state.json. Next ready; page HTTP 200, unauthenticated API 401, listener PID 49156 (launcher 55940). Participant JSON SHA-256 unchanged across restart and HTTP checks. Kept .next intact; no sign-in, game action or data reset. Logs: ignored .local/shuk-dev.stdout.log and shuk-dev.stderr.log; launcher PID in .local/shuk-dev.pid. No cause of previous exit established.


## Location details and Source disclosure refinement - 25 Oct 2026

Shared location details now show one mission-defined recognition passage. Shared arrival method determines whether GPS is offered or the compact confirmed result is shown, using recorded points; guide confirmation lives in existing guide controls. Open Challenge remains available, with measured navigation clearance and short-screen scrolling fallback. Story Source disclosures removed through reusable presenters; evidence labels, research/metadata/original Hebrew and separate photograph captions retained. See latest [handoff](agent-handoff.md) for exact files and remaining visual checks.

Verified 117 Shuk and 61 Memory Protocol tests, TypeScript, targeted lint, changed Sass and diff checks; 9 additional final story/credit UI tests pass. Real mobile/zoom/safe-area and multi-browser visual acceptance remain pending. Existing photo-rights gaps remain unresolved. No gameplay/auth/role/reward changes, live-data edits, server interruption, build over active output or deployment.


## Role selection C - 25 Oct 2026

Completed the focused A/B/C slice on `main` at `83b4451` (GitHub main matched during inspection). Group shows current holders with existing avatar/name; Choose Roles offers the owner's volunteering actions. Guide's separate Change Roles disclosure confirms candidates in one action or assigns directly. Participants can withdraw or step down from only their own requested responsibility. No implicit reassignment on logout; guide can reassign absent holders. Existing identities, backend roles, mission content, scoring, tokens, GPS and invitation architecture remain. No new dependency, agent, skill or documentation hierarchy.

Storage: additive validated `roleCandidates` in the existing schema-5 file, defaulted on read for older data. Existing confirmed roles remain authoritative; candidates confer no privileges. Selected candidate is removed on confirmation; other volunteers remain. Existing lock/atomic rename/receipts and participant-scoped offline queue apply. Concurrent confirmations use last successfully committed write, with same-ID retry after 503 contention. Live participant JSON is SHA-256 identical to the existing pre-sync private backup; tests use isolated fixtures only. A normal future player action persists the existing schema migration plus candidate data.

Role changes update the existing header and challenge through shared polling (1.5 seconds while connected); server submission checks latest role under lock immediately. A local generation guard prevents an older in-flight polling response from overwriting a successful action response. Network delays/offline devices cannot show instant remote changes; no push transport added. Unassigned navigator does not gate map/mission reads; unassigned submitter leaves official submission to authenticated guide. Changing roles preserves progress, timing, rewards and other sessions.

Exact implementation files across A/B/C: `lib/amazing-shuk/roles.ts`, `group-action.ts`, `parse-water-action.ts`, `participant-store.ts`; `components/amazing-shuk/ListGroupRoles.tsx`, `PreviewGroupRole.tsx`, `ListGroupRoles.module.scss`, `dev/IndexGuideGroupRoles.tsx`, `dev/IndexGuideWaterTask.tsx`, `dev/IndexWaterTask.tsx`. Tests: `lib/amazing-shuk/role-selection.test.ts`, `role-selection-ui.test.ts`. Documentation: existing product decisions, current state and this handoff. Pre-existing edits to AGENTS/settings and untracked Gan_ha_Tot photos preserved.

Verification: **113/113 Shuk tests**, **61/61 Memory Protocol tests**, TypeScript `--noEmit --incremental false`, targeted Shuk/API lint, new Sass module compilation and `git diff --check` pass. Role tests cover no assignments, both roles, multiple volunteers, retries, direct guide assignment, unauthorized/forged actions, concurrent confirmations, withdrawal/self-only step-down, logout, active-mission revocation/stale HTTP submissions, distinct session views, legacy JSON defaults and fresh-process persistence. Actual TSX rendering covers names/local avatars, role statuses/controls and guide-only confirmation. First regression run exposed the static loader's unsupported relative parent import; corrected to app alias and all 113 then passed. Full lint retains exactly the documented three prototype require-import errors and eleven unrelated Memory Protocol warnings.

Read-only elevated OS check confirms original Next server PID 51480 still listening at 127.0.0.1:3000; no restart, termination, deletion of .next or build over active output. No route/asset/deployment change, so no production build was needed. No commit/push/deploy. No actual mobile, keyboard/screen-reader or two-browser acceptance performed. New status/control wording is visibly marked draft with TODO(copy); responsibilities and volunteer buttons use owner wording. Guide labels/new confirmation feedback need owner copy acceptance.

Next smallest step: refresh existing player/guide profiles, open Group, volunteer from two profiles, confirm/change/step down as guide/player and observe header plus active challenge permissions. Check narrow-phone layout, focus and reconnect. Preserve completed missions and rewards. Role selection takes priority over Montefiore until this acceptance is complete.


## Role selection B - 25 Oct 2026

Guide confirmation reuses existing `assign-role`, confirmed role IDs, lock and receipts. New separate `dev/IndexGuideGroupRoles.tsx` shows avatar/name candidates and one-tap confirmation, plus direct assignment/unassignment. Role controls moved from the always-visible guide timing feature into Group; timing behavior unchanged. Current holders remain compactly visible above Choose Roles. Confirmation removes only the selected participant's candidacy for that role; other volunteers remain available. One participant can hold both roles. Concurrent assignments serialize; last successfully committed assignment wins, with existing 503/same-ID retry on contention.

Additional files changed: `components/amazing-shuk/dev/{IndexGuideGroupRoles.tsx,IndexGuideWaterTask.tsx}` plus A's role UI, store, tests and IndexWaterTask. Verification: all 5 focused role tests passed, TypeScript passed; no browser/mobile claims. No live JSON edits, commit, push or deployment. Next: withdraw/step down, stale submission regression, UI tests and full regression checks.


## Role selection A - 25 Oct 2026

Implemented additive `roleCandidates` in existing schema-5 JSON; absent candidates default in memory without disk writes. Volunteer actions use authenticated identity, existing lock/atomic rename, receipts and browser queue. Confirmed roles/progress remain unchanged. Group disclosure shows candidates with existing DiceBear identities to players and guide. New status wording is visibly draft pending owner approval; owner action wording reused.

Files: `lib/amazing-shuk/{roles.ts,group-action.ts,parse-water-action.ts,participant-store.ts,role-selection.test.ts}`; `components/amazing-shuk/{ListGroupRoles.tsx,PreviewGroupRole.tsx,ListGroupRoles.module.scss,dev/IndexWaterTask.tsx}`.

Verification: 3 focused tests passed outside sandbox after sandbox denied fixture atomic rename; TypeScript no-emit/nonincremental passed. No browser verification. GitHub main checked read-only and matched local `83b4451`, including Claude's committed mission/UI work. Existing dirty files/photos preserved. Consulted both existing designer documents and extracted actual Brand Book sections (Sumac/Ink/Chalk, IBM Plex, restraint); no designer files changed. No dependencies, production action, commit or deployment.

Next smallest step: candidate confirmation through existing authenticated guide assignment, preserving direct assignment and shared permissions.


## Windows checkout synchronization, 25 Oct 2026

The intended Windows checkout is `D:\D_DEV\The Amazing Shuk\the-amazing-hunt`, branch `main`, fast-forwarded from `ca9cf1e` to fetched `origin/main` at `83b4451`. The parent directory is a separate repository and was not synchronized or modified. Use the nested checkout for future work; the server-specific paths and port 3300 below describe Claude's earlier environment.

Before synchronization, a private, ACL-restricted backup was created at `D:\D_DEV\Shuk-private-backups\sync-20261025-010924`: 285 project files verified by SHA-256 and a verified full-history Git bundle. Reproducible `node_modules` and `.next` were excluded. The modified `AGENTS.md`, all 14 untracked `public/Gan_ha_Tot/` files, and `.local/` data remain byte-identical to backup. The parent's two modified files were also backed up without changing them. No secret values are recorded here.

Windows verification: 103 Shuk tests and 61 Memory Protocol tests pass; TypeScript (`--noEmit --incremental false`) and targeted Shuk ESLint pass. Full lint retains the known three isolated-prototype errors and eleven Memory Protocol warnings. A read-only check of the actual schema-4 JSON through the updated loader confirmed in-memory schema-5 compatibility, all three missions, and preservation of credentials, roles, receipts, well progress, timing, arrival and rewards; the disk JSON was not changed. A future normal write persists the application's existing migration. Refresh all browser profiles for protocol revision 5.

An isolated production build (`npm run build -- --webpack`) passed in the private backup directory, using an archive of `83b4451` and the existing installed dependencies. It did not copy live game data or use the active server's build output.

The existing nested-checkout Next server remains on `127.0.0.1:3000`, PID 51480, without an agent restart. Both `/memory-protocol/dev/amazing-shuk/water` and the new synagogue facade asset return HTTP 200. The active `.next/` was not deleted or used for a production build. No controlled restart was indicated by these checks. Browser identity, navigation, reconnect and real-phone acceptance remain pending. No commit, push or deployment.

**Updated: 24 Oct 2026 (Claude), after the map UX, navigation and mission 3 work.** Server checkout `/root/projects/The-Amazing-Hunt`, branch `main`. This summary supersedes older counts and environment notes in the [handoff history](agent-handoff.md).

## Implemented; automated verification passes

- One fixed development roster (`guide`, `player-1` to `player-7`), server-validated browser sessions and one shared JSON group. Single-use invitations (24 h) and sessions (7 days) are hashed. Roles are enforced by the server; navigator and answer-submitter may be the same person. No external sign-in or SMTP. See the [login runbook](local-participant-login.md). Invitations: `npm run shuk:invite -- <participant> http://localhost:3300` inside the dev container.
- JSON writers use a filesystem lock, a synced temporary snapshot and an atomic rename; action receipts prevent duplicate actions and rewards. Browsers queue actions locally and retry.
- Progress, invisible timing, hints and rewards are stored per mission (schema 5, protocol revision 5); `lib/amazing-shuk/missions.ts` is the catalogue. A mission may also have an optional bonus question with its own picks and one-time points.
- **Three playable missions**, all on the standard journey (map → preview → location → optional We're Here? → challenge → rewards → map):
  1. **Gan HaTut, the well** — the 3 L / 5 L / 4 L family-jar puzzle. See the [well record](water-task.md).
  2. **The market mural, "Is It Real or Is It Painted?"** — pick 2 of 8, answer key field-checked by the owner, GPS point confirmed.
  3. **Chesed VeRachamim, "What Was This Building Before?"** — pick 1 of 4 (the tavern), then the blue heritage sign and Yitzhak Armoza; an optional bonus on the novel *The Beauty Queen of Jerusalem* (10 points, no food tokens) and an unscored Eshet Chayil moment. Sources and the Luna findings are in the [handoff](agent-handoff.md).
- Rewards: provisional well values for every mission (100 max / 40 min points, 2 food tokens), awarded once on an authorised submission; optional arrival bonus of 20 points once.
- Player UI: illustrated Leaflet map; a bottom-sheet mission preview tied to its marker; a location view with photo, names, landmarks and clue; checkbox-card answers with a sticky submit bar; a profile panel from the header avatar and compact role badges; a fixed bottom bar (Map, Mission, Food, Group) with browser history and refresh kept in the tab.
- DiceBear Line Face avatars from the participant's immutable ID (core 10.7.0 / styles 10.6.0), with initials fallback.

## Partial, provisional or unverified

- **Nothing has been checked on a real phone.** The owner has reviewed some screens in a desktop browser by screenshot; layout, safe areas, back navigation and HTTPS GPS on a phone are unverified.
- Marker placements are manual guesses for all three missions. GPS is on only for the mural (owner-confirmed point); Gan HaTut and the synagogue fall back to guide confirmation.
- Photos: Gan HaTut gate and cistern, the mural street view and the synagogue facade are the owner's photographs, connected by the owner's choice. Mural reuse rights are still recorded as unresolved in [decisions](product-decisions.md); the before photo's photographer, date and rights are not recorded.
- Much visitor-facing copy is draft (stories, hints, reveals, location text, UI labels); each slice lists its drafts in the handoff. Food offers are not approved; the Food tab shows the token balance and a marked gap.
- Not yet built: mission 4 (Montefiore, three languages and the Hebrew year), onboarding, food redemption, the separate Shuk app boundary (planned before real-phone testing), production deployment.

## Current verification (clean `node:22-alpine` container)

- `npm run test:shuk`: **103 passed, 0 failed.**
- `npm test`: **61 passed, 0 failed.**
- `npx next typegen && npx tsc --noEmit`: pass. ESLint on `lib/amazing-shuk` and `components/amazing-shuk`: clean; full lint still has the three pre-existing errors in the isolated prototype and eleven warnings in Memory Protocol files. Changed Sass modules compile. `git diff --check`: pass.

## Boundary and how to run

The Shuk page and API are development-only: `SHUK_DEV_SIMULATION=1`, a loopback Host, 404 otherwise. On this server the dev container `shuk-dev` runs in tmux `shuk-dev-server` with the host network and Next on `127.0.0.1:3300`; it uses the repo's `.next/`, so don't delete that while it runs. `lib/base-path.ts` remains the only source of the `/memory-protocol` prefix.
