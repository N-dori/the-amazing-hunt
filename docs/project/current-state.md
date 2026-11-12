# The Amazing Shuk — Current Implementation State

<<<<<<< HEAD
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
=======
**Updated: 6 Nov 2026 (Claude).** **Live since 6 Nov 2026, 00:45 UTC: `5c4e027`** (onboarding and roles, both builds), image `dori-shuk:20261106-004445-5c4e027`. Rollback: `previous` = `8001e8f` (the first onboarding build).
- **Committed, not deployed:** `b4d2298` (the guide no longer counted as a player; clearer emblems) and `bcc3e2c` (the 5 Nov challenge notes; multi-team play, I7a). **Not pushed:** 5 commits, `8001e8f` to `bcc3e2c`.
- **Links:** `host-player-1.txt`, `guide.txt` and `player-2.txt` in `.local/amazing-shuk/live-links/`, issued 6 Nov about 00:46 UTC, valid 24 h. **Join links are off**; multi-team play needs them on (owner's decision).
- **Backup:** `/root/backups/amazing-shuk/live-state-before-deploy-20261106T004444Z.json`, the only one.
- **Safety copies:** 13 in `/data`, kept until the owner decides.
- **Disk:** 77%.
- **The Nahlaot OSM map (11 Nov 2026):** steps 1–2 (data) and step 3a (drawn in Leaflet on the dev page `/memory-protocol/dev/osm-map`) are committed (`b512149`, `96491da`). Later the same day, not committed:
  - the owner's answers: the small frame for the game, new names, Ohel Moshe placed;
  - the owner's icon set V4 (synagogues in a stone arch, toilets, the light rail, benches);
  - an **illustrated look** (warm building tones, shadows, OSM's trees, paper grain, a cartouche).
  Not yet in the game. Step 3b waits for the owner's go-ahead, and for the verdict on the owner's **two-map idea** (the illustrated map to choose, the OSM map to navigate; [live-test plan](live-test-8-nov-plan.md#the-two-map-idea-owner-11-nov-2026-to-verify)). See the map handover at the top of the [handoff](agent-handoff.md), [nahlaot-osm-map.md](../map/nahlaot-osm-map.md) and [research 15](../../research/results/shuk-places/15_nahlaot_synagogues.md). Dev server: `npm run dev:docker` (in tmux).
- **The session's handoff and next steps:** the top entry of the [handoff](agent-handoff.md).
- **Next builds (owner's 8 Nov live test):** [live-test-8-nov-plan.md](live-test-8-nov-plan.md), five builds waiting for the owner; the [role moment](role-moment-treatment.md) treatment awaits decisions. **Live since 8 Nov 2026, 15:40 UTC: `e5f15ff`** (the header above is from 6 Nov).
- **The Memory Protocol is paused (owner, 8 Nov 2026):** it's stale, so it is not deployed for now. `dori-game` keeps running its current image at `/memory-protocol`, untouched; its code stays in the repo. Releases are `/deploy` (the Shuk) only, until the owner resumes it. **Archiving it is planned and deferred (owner, 8 Nov 2026):** tag `archive/memory-protocol`, keep the story and plan as Markdown, move the map's parts of `lib/game` into `lib/map/`, then delete the Memory Protocol's code (about 80 files) from `main`.

## Progressive challenges and Market Surprise: Phase 1 LIVE, phases 2–5 planned (owner, 2 Nov 2026)

The [progressive-challenges plan](progressive-challenges-plan.md) sets out the reusable stop shape: find the place, one core challenge, optional challenges, per-challenge hints and an "I'm completely stuck" fallback. It also covers silent timing, voice answers, reward pop-ups, solo play as a first-class mode, personal achievements and Market Surprise ("Feeling Lucky" dice, the Vendor's Call), with the mural as the pilot.
- **Decided:** D13–D17 (see [product decisions](product-decisions.md#progressive-challenges-and-market-surprise-owner-2-nov-2026)).
- **Decided and live:** D6 ("We're here") and D12 (solo roles), as Phase 1.
- **Open:** D1–D5, D7–D11, the Market Surprise stop pool, and the solo copy drafts marked TODO(copy).
- **Phase 2 approved (owner, 2 Nov 2026) and in progress:** 2a (model B scoring on the mural) and 2b (the server's "I'm completely stuck") are committed (`17a1549`); 2c (the hint sheet and the stuck button on screen) is committed (`6b61124`); 2d (the reward pop-up) is committed (`aa2cc2d`). **UX-3** (the story, then Start, then the challenge; Marzipan unchanged) and **2e** (the silent timing record, analytics only) are committed (`fbd67d0`, `946b531`), and **all are live** (`946b531`). The owner's live review passed checks 1–12. Check 13 (who sees the stuck button) is covered by tests only, because there's no second player. Checks 14–15 (tap sizes and the draft wording) are still open. **UX-4** (the points count up in the reward pop-up; no Back buttons on the challenge) is committed and live (`fe1df94`). See the top of the [handoff](agent-handoff.md).

## The mural stop's content rework: drafts, awaiting the owner (4 Nov 2026)

Content only; nothing is built, and the live mural is unchanged. The [mural rework](mural-rework.md) holds v3 (recommended additions, with the [Answer Formats pack](../../research/content/Answer_Formats_Pack/DORI_AF_00_Index.md)'s proposals applied at the owner's request), v2 and the original v1.
- **Facts from:** the knowledge files [the market mural](../knowledge/market-mural-agrippas.md) (runs 07–09, 12, 13) and [the Ohel Moshe gate](../knowledge/ohel-moshe-gate.md) (run 08).
- **Conflict:** the live answer key (`lib/amazing-shuk/mural-task.ts`) still scores the vents, the plaque and the sign as real; the owner's correction may disagree. The owner decides after the field check.
- **Waiting on the owner:** approval of the drafts, all `TODO(copy)` lines, the field checks and open choices listed in the rework, and the rights to the owner's wall photo for The Stamp.

## Multiplayer onboarding: PAUSED — Ready to Resume (owner, 1 Nov 2026)

The multiplayer onboarding, team setup, invitation and security workstream is paused. Its I1–I3b and I4a work is live inside `87c1877`, with **join links off**. The resume index (what's built, flags, decisions, open tests, the exact next step, I3c/I4/I7a and the Stitch and UX approvals) is the top entry of the [handoff](agent-handoff.md). Older "Next" lines below about I2–I4 are history.
- **The owner's onboarding and roles rules (3 and 5 Nov 2026) are recorded and not built:** the host or guide enters the count and assigns team leaders; the leader assigns Navigator, Submitter, Researcher and Photographer; parts for everyone else; role emblems in the profile panel. See the [multiplayer plan](multiplayer-plan.md) (§4, §5, I4, I7a) and [decisions](product-decisions.md#onboarding-and-roles-owner-5-nov-2026).
>>>>>>> bb4234fb5b66e55047f6343e266fa8ee539f0a27

## Implemented; automated verification passes

- One fixed development roster (`guide`, `player-1` to `player-7`), server-validated browser sessions and one shared JSON group. Single-use invitations (24 h) and sessions (7 days) are hashed. Roles are enforced by the server; navigator and answer-submitter may be the same person. No external sign-in or SMTP. See the [login runbook](local-participant-login.md). Invitations: `npm run shuk:invite -- <participant> http://localhost:3300` inside the dev container.
- JSON writers use a filesystem lock, a synced temporary snapshot and an atomic rename; action receipts prevent duplicate actions and rewards. Browsers queue actions locally and retry.
- Progress, invisible timing, hints and rewards are stored per mission (schema 5, protocol revision 5); `lib/amazing-shuk/missions.ts` is the catalogue. A mission may also have an optional bonus question with its own picks and one-time points.
- **Six playable missions**, all on the standard journey (map → preview → location → optional Check our location → challenge → rewards → map):
  1. **Gan HaTut, the well** — the 3 L / 5 L / 4 L family-jar puzzle. See the [well record](water-task.md).
  2. **The market mural, "Is It Real or Is It Painted?"** — pick 2 of 8, answer key field-checked by the owner, GPS point confirmed.
  3. **Chesed VeRachamim, "What Was This Building Before?"** — pick 1 of 4 (the tavern), then the blue heritage sign and Yitzhak Armoza; an optional bonus on the novel *The Beauty Queen of Jerusalem* (10 points, no food tokens) and an unscored Eshet Chayil moment. Sources and the Luna findings are in the [handoff](agent-handoff.md).
  4. **The Montefiore gate, "Three Languages, One Gate"** — pick 3 of 5 (Hebrew, English, Arabic). No bonus: the hidden-year puzzle (תרמ"ב in בתמר, the Yemenite aliyah) was taken off the gate by the owner and is parked in `montefiore-task.ts`.
  5. **Rabbi Aryeh Levin, "The Father of the Prisoners"** — Feinstein and Barazani, the grenades in oranges, told respectfully; pick 1 of 4; untimed, no hints, completion title "Answer received"; bonus: the Kramer-Rechtman plaque on HaCarmel St (10 points). Photo: the owner's Nachlaot mural of Rabbi Levin (photo #39), as the mission photo and under the story.
  6. **Marzipan Bakery, "The Sweet Secret of Marzipan"** — **the finale**: locked until the other five are done. An unscored name guess, then two scored questions in a row: the syrup goes on while warm, and rugelach means little horns. Optional bonus: flash-frozen and flown to New York, per the bakery (10 points). An unscored babka conversation, and an Explore Food Rewards button that only opens the Food tab. Photo: Benjamin Lipsman's rugelach (CC BY 2.0, credit shown on the location page), not a storefront. GPS off; marker on the base map's own label. The first mission with **follow-up questions** (`followUps`: a step and hints per question, one award at the end).
- Rewards: provisional well values for every mission (100 max / 40 min points, 2 food tokens), awarded once on an authorised submission; optional arrival bonus of 20 points once.
- Player UI, restyled after the owner's Stitch reference (layout only; challenges and Food not yet restyled):
  - a sticky slim header: game name, screen title in Plex Serif, avatar, role pills and the points and tokens chips;
  - the illustrated Leaflet map in a rounded field card;
  - a mission preview that overlaps the map's lower edge, with a "Mission N · status" pill tied to its marker, a thumbnail and a teaser, and View Location in a row that never scrolls; the map keeps the selected pin in view;
  - a "Find this place" location view (30 Oct 2026): the "Look for" card first, with the clue, the photo, the landmarks and the folded "About this place"; then the optional "Check our location" row; then Open Challenge with the food tokens;
  - checkbox-card answers with a sticky submit bar;
  - a profile panel from the avatar;
  - a fixed bottom bar (Map, Mission, Food, Group) with browser history and refresh kept in the tab;
  - the map without pin labels, opening fitted to all six markers;
  - mission pages without evidence labels or sources (both kept in the data), with one "Behind the answer" heading over answer text;
  - a cheer card on completion (a different line per mission, a quiet one for Levin) with "Go to the next stop" and "Back to the map".
- DiceBear Thumbs avatars (CC0) in a round frame, from the participant's immutable ID (core 10.7.0 / styles 10.6.0), coloured with the DORI tokens, with an initials fallback.

## Partial, provisional or unverified

- **Nothing has been checked on a real phone.** The owner has reviewed some screens in a desktop browser by screenshot; layout, safe areas, back navigation and HTTPS GPS on a phone are unverified.
- Marker placements are manual guesses for all six missions (Marzipan's sits on the base map's own label). GPS is on only for the mural (owner-confirmed point); the other five fall back to guide confirmation.
- Photos: Gan HaTut gate and cistern, the mural street view and the synagogue facade are the owner's photographs, connected by the owner's choice. Mural reuse rights are still recorded as unresolved in [decisions](product-decisions.md); the before photo's photographer, date and rights are not recorded, and the owner thinks it may have been altered with GPT (29 Oct 2026). The photo rights audit is deferred by the owner (25 Oct 2026).
- The Stitch slice (header, map, preview, location, avatar) is committed and pushed but not yet reviewed in a browser. The map stage's fit at 320×640, 375×667 and 390×844 is estimated by arithmetic only.
- Much visitor-facing copy is draft (stories, hints, reveals, location text, UI labels); each slice lists its drafts in the handoff. Food offers are not approved; the Food tab shows the token balance and a marked gap.
- Not yet built: onboarding and food redemption.
- The Marzipan lock is enforced in the client only, by the owner's decision (29 Oct 2026); the server accepts its actions.
- Change of course (owner, 29 Oct 2026): the market can also hold challenges. Not built; waiting for the owner.
- Map rule (owner, 29 Oct 2026): markers shrink as the map zooms out, so the gate and well pins stop overlapping. Not built; waiting for the owner.

## Next

- **The owner's phone-and-PC test (5 Nov 2026, live `15cc9db`) and notes:** the waiting screen, the lobby's numbers and stepper, roles in onboarding, and a rethought navigation screen (the hidden address, a riddle route, a real location check, navigation points, the challenge opening for the whole group). Notes only, not approved for build; in the top entry of the [handoff](agent-handoff.md).

- **Multiplayer is paused** (owner, 1 Nov 2026): see the paused section above. (I3a, I3b and I4a have since been built and deployed.)
- **UX is paused for the multiplayer roadmap (owner, 31 Oct 2026).** The deferred UX backlog (UX-1 full-width map, UX-2 spatial Find this place, UX-3 story then Start then the timed activity, UX-4 the completion celebration) is in [decisions](product-decisions.md#deferred-ux-backlog-owner-31-oct-2026-recorded-not-scheduled-not-approved-for-build). Not scheduled; each phase needs its own approval.
- **Next session:** the owner's phone sign-off of the uncommitted compact-preview changes (31 Oct 2026; checklist in the handoff), then the B-lite phone check and the copy drafts. The challenge-photo preview is a separate task, not started; the ordered list is at the top of the [handoff](agent-handoff.md). B-lite steps 6–7 (finding hints), routing and any GPS-policy change are not authorised.
- Done (`6d35b59`, 30 Oct 2026): the compact onboarding (Stitch): the one-step lobby.
- The owner's phone review of the 26 Oct changes and of the Stitch slice (the eight preview checks in the handoff).
- Possibly compact role pills on phones narrower than 22rem.
- Then the challenge screens (C1) and Food (E1) in the Stitch style. The approved challenge rules win over Stitch: no moves counter, contextual controls, no hint penalties on buttons. Re-export the C1 and E1 screenshots first.
- New missions and reworks go through `/experience-design` first (owner's direction, 29 Oct 2026).
- **Admin screen (ideas, 5 Nov 2026; not approved):** [admin screen](admin-screen.md). Today every sign-in problem (a new phone, cleared cookies, an in-app browser) needs the operator's CLI; suggested first: a rescue QR link and "sign out other devices".
- Multiplayer plan approved (29 Oct 2026): [multiplayer plan](multiplayer-plan.md), increments I0–I8, one at a time. I0 and I1 are done, and **I1 is deployed**. The live file becomes schema 6 on its first write after the deploy and keeps an automatic `pre-schema6` copy; see the [handoff](agent-handoff.md). I2 (host invitation and lobby) is the next approved milestone; its implementation isn't authorised yet.
- **I2 (host invitation, lobby, Start Adventure) is deployed (30 Oct 2026, 06:27 UTC, `364a4f5`) for the owner's phone test**; a new live adventure waits in its lobby (schema 6, no host, everyone signed out). Before that, committed as `dccaf95` and `a05c2a7`; the live app is unchanged. The owner corrected the model the same day: one adventure of many teams of about 5 (recommended `ceil(count / 5)`, ceiling 30 participants, provisional). I2 shows that recommendation only: groups of 1–5 start as one team, and groups of 6–30 can't start until multi-team play exists. The corrections after the owner's review are committed too (30 Oct 2026); mobile visual acceptance is still a deployment prerequisite. See the [handoff](agent-handoff.md).

- **I4/I5 direction decided (owner, 31 Oct 2026):** I4 is Navigator and Submitter management by Team Leaders, teams of 1–5. **I4a is live since 1 Nov 2026** (leader Change controls on the Group tab, `522ecd9`). I5 keeps parts optional and pilots the well as "measure 4 L with the 3 L and 5 L vessels, then Deliver" (owner's correction; no jar); not authorised for implementation. See [decisions](product-decisions.md#approved-i4i5-direction-owner-31-oct-2026).

## Waiting on the owner

- The mural rework (4 Nov 2026): approve or change its drafts, then its field checks; see the section above.
- Copy: all the missions' drafts, the UI labels, the alt texts, the cheers, "Behind the answer", the Marzipan lock note and the next-stop lines (listed per slice in the handoff).
- Rewards: every mission's rewards and both bonuses are provisional; no food offers are approved.
- Rights: the mural image (still unresolved in [decisions](product-decisions.md)) and the before photo's source (possibly altered). The photo rights audit is deferred.
- Field checks:
  - every marker placement;
  - GPS points for Gan HaTut, the synagogue, the gate and Levin's home;
  - the gate's Arabic panel and its rosette;
  - whether the Kramer plaque is legible;
  - the gate and the well share the gate photo.
- Luna: no source gives her relationship to Yitzhak Armoza; only the literary version is built.
- The well: the two-move shortcut is answered for the I5 pilot (owner, 31 Oct 2026: measure 4 L with the two vessels and deliver it; the live well keeps the 4 L jar until I5 is built). Still open: story wording (cistern vs. well, the question answered too soon, the title), the new puzzle copy, and the open points in the [plan's I5 section](multiplayer-plan.md#i5-pilot-parts-on-the-well).
- The original photos left untracked in `public/shuk/` (move them to `design/inputs/photos/`).
- The Stitch slice's draft labels ("pts", "tokens", "Mission N · status", "+N food tokens"); whether to restyle the map markers (shared with the Memory Protocol); whether to add the filter chips, map scale, path line or audio button.

## Current verification (clean `node:22-alpine` container)

- `npm run test:shuk`: **173 passed, 0 failed** (in `shuk-dev`, 29 Oct, with the I2 corrections; 158 at `175548f`).
- `npm test`: **61 passed, 0 failed.**
- `npx next typegen && npx tsc --noEmit`: pass. ESLint on `lib/amazing-shuk` and `components/amazing-shuk`: clean; full lint still has the three pre-existing errors in the isolated prototype and eleven warnings in Memory Protocol files. Changed Sass modules compile. `git diff --check`: pass.

## Boundary and how to run

**Live, protected app (25 Oct 2026):**
- `https://doriisrael.com/shuk` runs in container `dori-shuk` (image `dori-shuk:current`, compose `deploy/shuk-compose.yml`, data on volume `dori-shuk_shuk_data` at `/data/state.json`). It is built from this repo with `DORI_APP=shuk`.
- It answers only on Host `doriisrael.com`; `proxy.ts` 404s every Memory Protocol page and API.
- Access is by single-use invitation only: no password, no indexing (`X-Robots-Tag`).
- Deploy: `tmux new -s shuk-deploy 'deploy/deploy.sh shuk'`.
- Invitations: `docker exec dori-shuk node --experimental-strip-types --no-warnings tools/scripts/shuk-invite.ts <guide|player-N> https://doriisrael.com`. Redirect them into `.local/amazing-shuk/live-links/` (mode 600) and never print them. That folder holds only the links still valid for the real game: a new set replaces the old one, and void links are deleted.
- Progress was reset by the owner on 26 Oct 2026 (08:59 UTC): all missions empty; sign-ins, invitations, names and roles kept. Backups are in `/data/state.before-reset-*.json`.
- Back up with `docker exec dori-shuk cat /data/state.json > /root/backups/amazing-shuk/<name>.json` (mode 600, checked with `cmp`). Keep only the latest backup there; delete superseded ones.
- A new web photo under `public/shuk/` needs a `!` line in `.dockerignore`, or it 404s live.

**Local simulation:** the dev page and API stay development-only: `SHUK_DEV_SIMULATION=1`, a loopback Host, 404 otherwise. On this server the dev container `shuk-dev` runs in tmux `shuk-dev-server` with the host network and Next on `127.0.0.1:3300`; it uses the repo's `.next/`, so don't delete that while it runs. The host network matters: with Docker's usual port mapping Next listens on `0.0.0.0`, and the Shuk API's loopback check then returns 404 (`--network host`, `next dev --hostname 127.0.0.1 --port 3300`). Local invitation links: `docker exec -w /w shuk-dev npm run -s shuk:invite -- <player-1|player-2|…|guide> http://localhost:3300`. To repeat a test from a clean point: `shuk:dev-reset` (progress or adventure; preview first, `--confirm` to run), described in [local participant login](local-participant-login.md#development-reset-local-simulation-only). `lib/base-path.ts` is the only source of both prefixes (`/memory-protocol`, and `/shuk` in the Shuk build).
