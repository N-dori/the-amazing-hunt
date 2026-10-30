# Amazing Shuk ? Shared Claude/Codex Handoff

## Latest handoff - "Find this place" location screen (option B): implemented, uncommitted, 30 Oct 2026

**Owner-approved plan (30 Oct 2026); uncommitted, not deployed.** Presentation only: no mission data, GPS policy, scoring or permission change.
- `PreviewArrivalMission.tsx` is now an outdoor recognition task: *What are we looking for?* (the Look for card first: clue, the photo right under it capped at 32svh, the water mission's second image, the landmarks always visible because they carry how to behave at each stop, then a folded *About this place* with the summary) · *Have we found it?* (a light row, no card: **Check our location** + the Optional note, the guide's Confirm Group Arrival, feedback) · *What next?* (Open Challenge, unchanged). The mission name stays as a screen-reader `h2` (`.srOnly`), since the header shows it; the area and Hebrew name share one small line. No sticky bar.
- **Owner decisions:** "We're Here?" renamed **Check our location** (product decisions updated); the summary folded behind **"About this place"**, a `TODO(copy)` draft.
- **Honest viewport:** at 375 × 667, with the header and the bottom nav, the clue and photo fit the first view and both actions follow after one short scroll (before: 2–3 screens). A strict no-scroll screen would mean hiding the landmarks.
- **Verified:** `test:shuk` 175/175 (a new order check for all six missions); `npm test` 63/63; `tsc` passes; lint at its baseline; `/game-verify shuk` healthy, 8/8 routes, 47 MiB; `git diff --check` clean on these files. **No browser or phone check.** `dori-shuk:test` is left from the verify (prune when disk climbs; 79% now).
- **Phone checklist** (dev page, about 375 × 667, then 320 px and 200% text): every mission shows the clue and photo without scrolling; the landmarks always visible; *About this place* opens and closes (3rem target); *Check our location* is clearly secondary and its feedback appears under it; Open Challenge one short scroll down; Back to map and the bottom nav work; the screen reader starts at the mission name; no horizontal scroll at 320 px.

## Earlier handoff - compact onboarding, two-finger map, I7a leader-invitation design: deployed, 30 Oct 2026

**Deployed 30 Oct 2026, 11:08 UTC (owner-authorised): `dori-shuk:20261030-110821-eeab22b`**, healthy, 0 restarts, 7/7 smoke checks. Rollback `dori-shuk:previous` = `364a4f5` (I2, same schema 6; tag it `:current` and `docker compose -f deploy/shuk-compose.yml up -d shuk`). Before: disk already clean (72%, no build cache); backup `/root/backups/amazing-shuk/live-state-before-compact-onboarding-deploy-20261030T110809Z.json` (mode 600, byte-identical to live: schema 6, active, count 5); `docs/RUN_PREVIEW.md` kept in `.local/amazing-shuk/RUN_PREVIEW.md.kept-during-compact-onboarding-deploy` (+ `.patch`) and restored identically. The live file is unchanged by the deploy. The live adventure is **active**, so players see the map change now; the new lobby shows only after a new adventure (separate approval). The keep-3 rule removed `f54f6da`. Disk 76% after.
- **Found, not caused by this deploy:** the read-only container can't write Next's image cache (`ENOENT: mkdir '/app/.next/cache'` in the log when the welcome map is requested). The image is still served (200, webp); it is just re-optimised on every request. Since `d1d507a`. Fix for later (needs approval): a `tmpfs` for `/app/.next/cache` in `deploy/shuk-compose.yml`.

### Work in this deploy - compact onboarding, two-finger map, I7a leader-invitation design, 30 Oct 2026

**Authorised by the owner (30 Oct 2026):** implement A (compact I2 onboarding) and B (map touch gestures), design only C (named Team Leader invitations). **Committed at the owner's request as A `6d35b59` (onboarding) and B `19c5a8e` (map, revertable alone), pushed by the owner; this docs entry and C follow in a docs commit. Not deployed; no live-state change.** No server action, permission or schema changed.

- **A, onboarding:** the lobby is now one step at a time (`lobbyStep` in `lib/amazing-shuk/adventure-lobby.ts`): *count* (host lead + stepper + Continue) → *ready* (1–5: count, "Recommended teams: 1", Start Adventure, Change the number) or *teams* (6–30: the split and the approved multiple-teams note, **no Start at all**, Change the number). Players see only the approved waiting words. The count still stays on the phone until Start; focus moves to the heading on each step. The lobby fills the phone with its action at the foot (no bottom-bar padding, no double gutter); the welcome's hero follows the screen height and its highlights became wrapping pills. New drafts: `next` "Continue", `changeCount` "Change the number" (`TODO(copy)`, O16).
- **B, map:** root cause: Leaflet's one-finger drag handler sets `touch-action: none` on the map and pans on one finger, so a swipe over the full-screen map never scrolls the page. Fix, opt-in `twoFingerHint` on `LeafletBaseMap` (Shuk only; Memory Protocol maps unchanged): Leaflet's drag is disabled for touch and re-enabled for a mouse or pen; CSS keeps `pan-x pan-y`; Leaflet's own two-finger handler pans and pinches. The hint "Use two fingers to move the map." shows after a one-finger drag that didn't scroll the page, for 3 s, at most every 30 s, never after a two-finger gesture (`lib/map/two-finger-hint.ts`, tested; `npm test` now includes `lib/map/`).
- **C:** the proposal and gate **O27** are in the [multiplayer plan](multiplayer-plan.md) under I7a. Nothing built.
- **Verified:** `test:shuk` 174/174; `npm test` 63/63; `tsc` passes; lint at its baseline; `/game-verify shuk` healthy, 8/8 routes, 47 MiB; `git diff --check` clean on these files. **No browser or device check**: the owner's phone checklist is still required.
- **Leaflet.GestureHandling evaluated and rejected (owner asked for a check against a GPT brief, 30 Oct 2026; no file changed).** `leaflet-gesture-handling` 1.2.2 (last published May 2022, no declared Leaflet range; works through 1.x's global `L`). Against our map: its marker check looks only at the touched element's own class, so a tap on our pin `<span>` flashes the warning; the touch warning shows on every one-finger touch until the finger lifts (`duration` only times the desktop wheel warning), with no cooldown; a full-map 50% black overlay above the markers; on desktop it needs Ctrl/Cmd + wheel to zoom and turns dragging off on mouse-out, with no option to keep only the touch part; and it re-enables dragging on two fingers, so the first one-finger swipe after a pinch can't scroll the page. Our CSS `touch-action` fixes that last one for good. Leaflet 2.0 is alpha only (`2.0.0-alpha.1`); revisit the gesture code if we ever upgrade. Extra phone check: pinch, then at once swipe with one finger: the page should scroll.
- **Disk (owner-approved, 30 Oct 2026):** `dori-shuk:test` removed and the whole build cache pruned (4.67 GB): 84% → 72%, 11 GB free. Live containers untouched; `dori-shuk:current` (`364a4f5`) and `:previous` (`175548f`) kept. The next build runs without cache, so it is slower.

**Phone checklist** (`shuk-dev`, about 375 × 667, then 320 px and 200% text; set-up commands in the I2 entry below):
1. Host: the count step at "Not set yet"; Continue disabled until +; − disabled at 1, + at 30.
2. 1 and 5: Continue → Ready, "Recommended teams: 1" → Start Adventure → "Starting…" → the map; the player's phone leaves the waiting screen.
3. 6, 11, 30: 3 + 3, 4 + 4 + 3, six of 5; the multiple-teams note; no Start; Change the number goes back.
4. Player: only the waiting screen. Guide: the guide lead and the same steps.
5. No horizontal scroll at 320 px; the action reachable at 200% text; landscape scrolls.
6. Map: one finger scrolls the page where it can; a one-finger drag shows the hint once, gone in about 3 s, none again within 30 s; two fingers pan and pinch and dismiss the hint; marker taps open the preview; zoom buttons work; a desktop mouse drags with no hint; pinch then one-finger swipe scrolls.

**Next session, in order** (each step needs the owner's approval): the phone checklist above (iOS Safari especially); approve or reword the two draft lines; then deploy with `tmux new -s shuk-deploy 'deploy/deploy.sh shuk'` after a fresh backup of `/data/state.json`. Decide O27 before any I7a work.

**Untracked or the owner's, keep out of commits:** `docs/RUN_PREVIEW.md` (it also has trailing whitespace on line 1, the only `git diff --check` hit), `docs/project/trip-doriisrael-paths.md`, `docs/design/stitch-reference/`, the photos in `public/shuk/`.

## Earlier handoff - next session: compact onboarding (Stitch) review, plan only, 30 Oct 2026

**Start here.** The owner reviewed a four-screen Stitch export of the onboarding (Host Welcome, Participant Count, Team Recommendation, Ready to Start) and wrote the review and brief: [`docs/design/stitch-reference/stitch_the_amazing_shuk_ui_ux/amazing-shuk-stitch-onboarding-handoff.md`](../design/stitch-reference/stitch_the_amazing_shuk_ui_ux/amazing-shuk-stitch-onboarding-handoff.md) (the owner's file, in the untracked Stitch folder; read it in full). **Visual direction approved with required corrections; plan and report only, no file changes until the owner approves.**

**What the brief asks for:**
- A **mapping** of the four Stitch screens to the existing I2 components, a concise **UI diff plan**, proposed **final copy**, and a **mobile acceptance checklist**, with *current I2* kept apart from *future multi-team* elements.
- **Compact onboarding:** one purpose and one primary action per screen, fitting a normal phone viewport, but no hard no-scroll rule (320 px, zoom, larger text, keyboard, short viewports must still work; never `user-scalable=no`).
- **Stitch is a visual reference only, last in priority** (the owner's Stitch reference policy, 30 Oct 2026, in [product decisions](product-decisions.md); it supersedes the brief's "visual authority" wording). Keep the existing tokens, Plex Serif/Sans, cards and pills; no Tailwind CDN, external photos or mockup JavaScript.
- Export mistakes to correct, not copy: `Math.round(n/5)` (use the existing `recommendedTeamCount`/`recommendedTeamSizes` in `lib/amazing-shuk/adventure-lobby.ts`); Confirm Squad Setup / Customize Roster / Re-balance / "Squads Dispatched!" (don't exist; 6–30 stay informational with no usable Start); "GPS engages automatically" (GPS stays optional and tap-triggered); "All Devices Synced", member portraits and names, a share code, mission and token counts (not live facts); `min-height: max(884px, 100dvh)`; jargon ("algorithmic split", "alleyway pacing", "guild", "radios & satchels").

**The four-screen export is in `docs/design/stitch-reference/` (saved by the owner, 30 Oct 2026, untracked):** `1._host_welcome_compact/`, `2._participant_count_compact/`, `3._team_recommendation_compact/` and `4._ready_to_start_compact/`, each with a `code.html`, plus `jerusalem_shuk_field_guide/DESIGN.md` (identical to the copy in `stitch_the_amazing_shuk_ui_ux/`). **The `screen.png` files are not images:** each is 28 bytes of text, `<FIFE Image failed to fetch>`. So the visual reference is the HTML only; ask the owner to re-export the screenshots if a picture is needed. A quick grep confirms the brief's findings in the HTML: `Math.round(count / 5)` (screen 2), Confirm Squad Setup and Squads Dispatched (3), All Devices Synced and "GPS mode engages automatically upon launch" (4), and `min-height: max(884px, 100dvh)` on all four. **All four also set `user-scalable=no`**, which the brief forbids; don't carry it over.

**Starting points in the code** (I2, live):
- `components/amazing-shuk/PreviewShukWelcome.tsx` (+ `.module.scss`): the invitation welcome, before the lobby → Stitch *Host Welcome*.
- `components/amazing-shuk/IndexAdventureLobby.tsx` → `PreviewAdventureLobby.tsx` (+ `.module.scss`): today **one screen** that holds the count stepper, the recommendation card, the multiple-teams note, Start Adventure and the players' waiting card → Stitch *Participant Count*, *Team Recommendation* and *Ready to Start*. Splitting it into steps is the main UI decision; the server actions (`set-intended-count`, `start-adventure`) and their checks don't need to change.
- `lib/amazing-shuk/adventure-lobby.ts` (`buildLobbyView`, `canStart`, `needsTeams`), `lib/amazing-shuk/welcome-copy.ts` (`LOBBY_COPY`: approved lines and the `TODO(copy)` drafts listed in the I2 entry below).
- Rendered from `components/amazing-shuk/dev/IndexWaterTask.tsx` while `adventure.status === "lobby"`.

**Live, read 30 Oct 2026, 10:30 UTC (counts only):** `dori-shuk:current` = `364a4f5`, healthy. The owner's phone test used the guide link (`guide-0633.txt`, which replaced the first guide link): the adventure is now **active**, count 5, no host (the guide started it), one guide session, mission records opened but none completed. The `host-player-1.txt` and `player-2.txt` invitations are unused (about 20 h left), but **the host link can no longer work**, because a host invitation is redeemable only in the lobby. Testing the host and waiting screens on a phone needs another live new adventure (separate approval) or the `shuk-dev` checklist in the I2 entry below.

**Repo:** `main` is one commit ahead of `origin/main` (`364a4f5`, unpushed; the owner pushes from VS Code). This entry, the deploy record, the Stitch reference policy and its pointer in `.claude/rules/scss.md` are committed with it; `docs/RUN_PREVIEW.md` (the owner's, local links) stays out of commits, as do the untracked files listed below.

**Not authorised by the brief:** implementation, commits, push, deploy, live-state reset, I3 or I7 work, multi-team flows, bypassing server gates, or claiming mobile acceptance.

**Next-session prompt (the owner's):**
> Review the attached Compact Onboarding Stitch Handoff and the original Amazing Shuk Stitch reference screens. Inspect our current I2 components and product decisions. Propose the smallest visual changes needed to adopt the compact, single-viewport onboarding design while retaining the established styling and enforcing real I2 behavior (1–5 Start, 6–30 informational only). Explicitly address the known export mismatches and show a screen-to-component mapping with final copy and mobile acceptance checklist. **Plan and report only; do not modify files until I approve implementation.**

## Earlier handoff - I2 complete: corrections after the owner's review committed, 29–30 Oct 2026

**Deployed 30 Oct 2026, 06:27 UTC (owner-authorised, for the owner's phone test): `dori-shuk:20261030-062727-364a4f5`**, commit `364a4f5` (ships `shuk-new-adventure.ts` in the image; local, not yet pushed). Rollback image `dori-shuk:previous` = `175548f` (I1, reads schema 6).
- **Before:** disk cleanup (the `dori-shuk:test` image and unused build cache; 77% → 75%); a fresh backup `/root/backups/amazing-shuk/live-state-before-i2-deploy-20261030T062705Z.json` (mode 600, byte-identical to live: schema 5, 2 unexpired sessions, 7 names, 0 mission records, 10 receipts); `docs/RUN_PREVIEW.md` kept in `.local/amazing-shuk/RUN_PREVIEW.md.kept-during-i2-deploy` (+ `.patch`), reset for the deploy and restored identically.
- **Deploy:** `deploy/deploy.sh shuk` in tmux: healthy, 0 restarts, 7/7 smoke checks; the dev page 404 and the API without a cookie 401; no error lines in the log; the live file unchanged by the deploy.
- **Live new adventure (owner-approved):** `shuk-new-adventure.ts --confirm` in the container. The file is now **schema 6, status lobby, no host**, team A with all 7 seats, 0 sessions (everyone signed out), names kept. `/data` gained `state.json.pre-schema6-<hash>` and `state.json.before-new-adventure-<UTC>`, both mode 600 and byte-identical to the deploy backup.
- **Links for the phone test** (never printed): `.local/amazing-shuk/links-i2-phone-test/` (mode 700; files 600): `host-player-1.txt` (host invitation, seat player-1), `player-2.txt`, `guide-0633.txt` (re-issued 06:33 UTC; it replaced the first guide link); each single-use, 24 h.
- **Rollback, if needed:** tag `dori-shuk:previous` as `:current` and `docker compose -f deploy/shuk-compose.yml up -d shuk`. I1 reads the v6 lobby file but has no lobby gate. To return to the pre-deploy state, restore the deploy backup with the restore command in the I1 entry below (it is schema 5, so it also works with `f54f6da`).

**Status at a glance (30 Oct 2026):**

| | |
|---|---|
| I2 implementation | `dccaf95` (29 Oct): host invitation, lobby, Start Adventure, new-adventure CLI (dev only). On `origin/main`. |
| I2 corrections | `a05c2a7` (30 Oct): host rights bound to the host session; 6–30 can't start; the approved lobby copy. Pushed with `9f80338`; `364a4f5` is not pushed yet (the owner pushes from VS Code). |
| Production | **I2 deployed 30 Oct 2026** (`364a4f5`, see above), for the owner's phone test; mobile visual acceptance still pending. The live file is schema 6, a new adventure in its lobby. |
| Verification | `test:shuk` 173/173; `npm test` 61/61; `tsc` passes; lint at its baseline (3 prototype errors, 11 Memory Protocol warnings), none new; `/game-verify shuk` healthy, 8/8 routes, 48 MiB; I1 rollback rehearsed on copies; `git diff --check` clean. Details below. |
| Mobile visual acceptance | **Not done.** Required before I2 counts as accepted (deployed early, at the owner's request, for the phone test). Claude can't review in a browser on this server; the owner runs the phone checklist below. |
| I1 rollback limitation | I1 reads and writes every I2 file, but **has no lobby gate**: after a rollback, an adventure still in its lobby simply plays (no count, no Start). The host fields survive. |
| Host security model | **Session-bound:** only the session that redeemed the host invitation (`host: true`) holds the host rights, and only while its seat is `adventure.hostId`. Other sessions of the seat get none; a new host link for the same seat moves the rights; one host session at a time. Host rights grant lobby powers only, never guide-only ones. |
| Leader permissions (deferred to I3) | The view's `leader` flag still follows the **seat**, not the session. Harmless in I2 (leaders have no powers yet), but I3 must bind leader rights to sessions the way I2 binds the host's, before leaders can let players in. |
| Fixed seats | The roster is still the fixed `guide` + `player-1…7`, so an adventure holds at most 7 players whatever count the host enters, until I3 brings dynamic participants. |
| Multi-team (deferred to I7a) | Teams of about 5 are only a recommendation (`ceil(count / 5)`, split evenly). Groups of 6–30 can't start until I7a builds team creation, leader invitations, the host overview and the guide's team switcher (schema 7). |

The corrections below were asked for in the owner's review of `dccaf95` and committed at the owner's request as `a05c2a7`. No live-data change.

**Corrections:**
1. **No misleading multi-team starts.** Groups of 1–5 can start as one team. Groups of 6–30 see the balanced recommendation but **can't start**; the server refuses Start for any count that needs more than one team (an `asOneTeam` flag is dropped by the parser and was removed from the action type). The lobby disables Start and explains why. No team creation.
2. **Host rights belong to the host invitation's session, not the seat.** Redeeming a host invitation marks that session `host: true`; host rights need that flag *and* the seat still being `adventure.hostId`. An earlier, later or replacing ordinary session of the seat gets none. A host who loses their phone gets a new host link for the same seat (operator CLI, lobby only); redeeming it moves the rights to the new session, and there is only ever one host session. Another seat can't become host while one is set. The view's `leader` flag still follows the seat; leaders have no powers in I2 (decide the binding in I3).
3. **One friendly message for every failed invitation** (`INVITATION_UNUSABLE`), whatever the reason.

**Tests:** `adventure-lobby.test.ts` now has 15 (173 in `test:shuk`): sessions of the host seat from before, after and in replacement of the host's; host redemption and the lost-phone re-issue; one host session at a time; unauthorised lobby actions; replayed, expired and after-start host invitations; counts 6, 7, 11, 17 and 30 refused (with or without the flag), 1 and 5 allowed; the friendly invitation message.

**Lobby copy (O16), approved by the owner with refinements (29 Oct 2026)** and in `LOBBY_COPY`:

| Where | Text | Status |
|---|---|---|
| Host welcome | You're the host! Tell us how many people are playing. When everyone is ready, start the adventure. | Approved |
| Waiting (players) | **Waiting for the adventure to begin** · Your host is getting everything ready. You'll be exploring soon! | Approved |
| Count | How many are playing? · Include yourself in the total. | Approved |
| Recommendation | Recommended teams: 3 · Suggested split: 4 + 4 + 3 (both filled from the actual count) | Approved |
| Start | Start Adventure | Approved |
| Multiple-team limitation | **Your adventure needs multiple teams.** We recommend splitting into teams of up to five. Multi-team adventures are coming soon. For now, adventures can start with up to five players. | Approved |
| Server refusal of a 6+ start | Your adventure needs multiple teams. For now, adventures can start with up to five players. | Aligned with the approved wording |
| Messages kept by the owner | Starting… · First, tell us how many are playing. · Got it. Player count saved. · The adventure has started! · The adventure has already started. · Only the host or the guide can set up the adventure. · Choose a number from 1 to 30. · The adventure hasn't started yet. Your host will start it soon. · This invitation link has expired or has already been used. Ask your guide for a new one. | Kept |
| Still draft (`TODO(copy)`) | Before you set off (title) · You can set up the adventure here, or leave it to the host. (guide) · Not set yet · One fewer player / One more player (spoken button labels) | Draft |

**Browser check: not done; mobile visual acceptance is a deployment prerequisite** (owner, 29 Oct 2026). The project rules exclude browser review on this server (the owner reviews). The lobby reuses the welcome screen's patterns (eyebrow, Plex Serif title, raised cards, the pill-shaped primary button) within the Stitch direction; no new visual direction. Manual checklist for a phone-sized browser (about 375 × 667), on the dev page in `shuk-dev`:
- Set up (signs everyone out of the dev state and keeps a copy): `docker exec -w /w shuk-dev npm run -s shuk:new-adventure -- --confirm`, then `docker exec -w /w shuk-dev npm run -s shuk:invite -- host player-1 http://localhost:3300 > .local/host-link.txt` and an ordinary link for `player-2` and `guide` the same way. Open each in its own browser profile.
- Host: the welcome, then the lobby with the host welcome; − is disabled at "Not set yet"; + goes 1, 2…; 30 disables +; each button is easy to hit (3.5 rem).
- 1–5: "Recommended teams: 1" and "Suggested split: N"; Start Adventure is enabled; tap it → "Starting…", then the map. The player's phone leaves the waiting screen within a couple of seconds.
- 6 (3 + 3), 7 (4 + 3), 11 (4 + 4 + 3), 30 (six of 5): the numbers match the count; the tinted "Your adventure needs multiple teams." note; Start disabled (and a forced request is refused by the server); going back to 5 enables it.
- Player (`player-2`): only the title and the "Waiting for the adventure to begin" card, no controls.
- Guide: the guide lead and the same controls as the host.
- Errors: reopen a used host link → the friendly invitation message on the welcome screen.
- Readability in sunlight: contrast of the note and the disabled button; text at 200% zoom; no horizontal scroll at 320 px.

**Verified (29 Oct 2026, after the approved copy):**
- `test:shuk` 173/173 in `shuk-dev`; `npm test` 61/61; `tsc` passes; lint at its baseline (3 prototype errors, 11 Memory Protocol warnings), none new; `git diff --check` clean on these changes.
- I1 rollback rehearsed on isolated copies: I1 reads and writes a lobby of 11 and an active adventure of 4, keeps the host session's flag and `hostId`, and I2 reads the result with the host intact. A rolled-back I1 has no lobby gate.
- `/game-verify shuk` (isolated `dori-shuk:test`): healthy, 8/8 route checks, an invitation link of the right shape (not printed), a host invitation refused on a fresh (active) state, the image ships only `shuk-invite.ts` and `shuk-name.ts`, 48 MiB.
- Disk: the owner-approved `docker builder prune -a` (build cache only; images, containers and volumes checked unchanged, `dori-shuk:current` and `:previous` kept) took the disk from 84% (6.0 GB free) to 72%; 76% after the rebuild. The next builds and deploy run without cache, so they are slower.
- Live, read-only: `dori-shuk` running `:current` (`175548f`), 0 restarts; the file still schema 5; `/data` holds only `state.json` and the 26 Oct reset copy.
- The uncommitted diff holds only I2 files (no links, tokens or participants' names); `docs/RUN_PREVIEW.md` and the untracked owner files are untouched.

**Next session, in order** (each step needs the owner's separate approval):
1. **Phone review of the lobby** with the checklist above. Mobile visual acceptance is a deployment prerequisite. Claude can't do it on this server.
2. **Push** (the owner pushes from VS Code; a push from Claude's shell hangs on the git login), then **deploy** with `tmux new -s shuk-deploy 'deploy/deploy.sh shuk'`, after a fresh manual backup of `/data/state.json`. The first build runs without cache (pruned on 29 Oct), so it is slower. Deploying I2 alone changes nothing players see: the live adventure is active with no host.
3. **A live new adventure** needs its own approval, and the CLI isn't in the app image yet (add `scripts/shuk-new-adventure.ts` to the Dockerfile's tools copy, and lift the app-build refusal, only then).
4. **I3** (team join link with leader approval, dynamic participants) after the owner's go-ahead. Before it: decide O6 (join-link limits, with a seat ceiling of 5 per team) and O15 (QR approach), and bind leader rights to sessions the way I2 binds the host's.

**Untracked, keep out of commits:** `docs/RUN_PREVIEW.md` (local invite links; modified), `docs/project/trip-doriisrael-paths.md`, `docs/design/stitch-reference/`, the photos in `public/shuk/`.

## Earlier handoff - I2 implemented and committed (`dccaf95`): host invitation, lobby, Start Adventure; many-teams correction, 29 Oct 2026

**Authorised by the owner (29 Oct 2026); committed at the owner's request as `dccaf95`.** No deploy, push or live-data change; the live app is still `175548f` and its file still schema 5. `.claude/agents/dori-ux-designer.md` untouched (O20).

**Owner's correction, the same day:** an adventure holds **many teams of about 5**, not one or two. Recorded in [product decisions](product-decisions.md) (the one record) and carried through the [multiplayer plan](multiplayer-plan.md) (I7 became I7a, multiple teams, and I7b, the optional comparison; new gates O25 and O26), `AGENTS.md` and `design/amazing-shuk-roadmap.md`.

**What I2 does:**
- **Host invitation:** `npm run shuk:invite -- host <player seat> <origin>` (inside the app container: `tools/scripts/shuk-invite.ts host player-N https://doriisrael.com`). Single-use, 24 h, hashed, a player seat in team A, only while the adventure waits in its lobby with no host; it replaces that seat's other invitations and any other host invitation. Redeeming sets `adventure.hostId` and team A's `leaderId`; a replay, an expired link, or a lobby that already has a host or has started → 401.
- **Invitation kinds:** `host`, and `leader` reserved for I7a. Nothing issues a `leader` invitation, and redeeming any kind other than `host` is refused (fail closed).
- **Lobby** (`adventure.status === "lobby"`, the whole screen): the host or guide answers "How many are playing?" (1–30). The app shows the **recommended teams** (`recommendedTeamCount = ceil(n / 5)`, `recommendedTeamSizes` split evenly: 6 → 3 + 3, 11 → 4 + 4 + 3, 30 → six of 5) as a recommendation only. No team beyond A is created; the stored `format` stays `"together"`.
- **Start Adventure** (host or guide only). It needs a count. *(Corrected after the owner's review, see above: 6–30 can't start at all; the "Start as one team" stand-in is gone.)* A second Start changes nothing.
- **Lobby gate:** every journey action (start, picks, hints, submit, arrival, timing, approve) is refused for everyone, guide included, until Start; roles may be claimed or assigned meanwhile.
- **Host and leader get no guide-only permission:** tested for confirm-arrival, timing, guide-approve and assign-role; without a role the host can't start a challenge or submit either.
- **New adventure (development and testing only):** `npm run shuk:new-adventure -- --confirm` in `shuk-dev`. It keeps the old file's exact bytes as `state.json.before-new-adventure-<UTC>`, mode 600, then opens an empty lobby: every seat in team A, no host, sessions, invitations, roles and progress cleared; names and action receipts kept. If the copy can't be kept, nothing changes (503). It refuses in the app build and isn't shipped in the image (Dockerfile unchanged); shipping it needs the owner's approval.
- **Unchanged:** the migrated live adventure is `active` with no host, so deploying I2 alone shows players nothing new.

**Files:** `lib/amazing-shuk/adventure-lobby.ts` (new: the recommendation and the lobby view model), `participant-store.ts`, `group-action.ts`, `parse-water-action.ts`, `welcome-copy.ts` (`LOBBY_COPY`), `scripts/shuk-invite.ts`, `scripts/shuk-new-adventure.ts` (new), `package.json` (script), `components/amazing-shuk/IndexAdventureLobby.tsx`, `PreviewAdventureLobby.tsx` and `.module.scss` (new), `components/amazing-shuk/dev/IndexWaterTask.tsx`, `components/icons/iconPaths.tsx` (`minus`, `plus`). Tests: `lib/amazing-shuk/adventure-lobby.test.ts` (new, 13).

**Copy (gate O16):** superseded by the proposed final copy in the entry above.

**Verified (29 Oct 2026):**
- `test:shuk` 171/171 in `shuk-dev` (158 before); `npm test` 61/61.
- `tsc` passes; lint at its baseline (3 prototype errors, 11 Memory Protocol warnings), none new.
- The counts 1, 5, 6, 7, 11, 17 and 30, plus an even split ≤ 5 for every count 1–30.
- **Rollback to I1** (rehearsed with a temporary `175548f` worktree on isolated copies, deleted afterwards): I1 reads every file I2 writes (a lobby with a pending host invitation, a hosted lobby of 30, an active one-team start of 30), acts on them, and keeps the host, leader and count; an unredeemed host invitation redeems in I1 as a plain session. I1 has no lobby gate, so a rolled-back lobby simply plays.
- CLI smoke on a throwaway file: new-adventure refuses without `--confirm` and in the app build; a host invitation is refused outside the lobby and for the guide; the link's shape (pattern only, never printed).
- `/game-verify shuk` (isolated `dori-shuk:test`, nothing live): healthy, 8/8 route checks, an invitation link of the right shape (not printed), a host invitation refused on a fresh (active) state, the image ships only `shuk-invite.ts` and `shuk-name.ts`, 47 MiB. `git diff --check` clean on these changes (`docs/RUN_PREVIEW.md`, the owner's, still has its own trailing whitespace).
- Self code and security review of the diff: no secret in a URL, log or output beyond the operator's link; server-side bounds on the count; lobby powers only for the host or guide; unknown invitation kinds refused.
- **Not checked:** anything in a browser or on a phone (layout, the stepper, the one-team wording on screen).

**Risks and notes:**
- Host rights belong to the seat, so any session of the host's seat has them, including one from a plain invitation the operator issued for that seat before the host redeemed. Only the operator can cause that; the new adventure signs everyone out first.
- The fixed seven seats still cap the adventure at 7 people until I3's dynamic participants, whatever count the host enters.
- 30 is a planning limit only: one JSON file, one lock, every phone polling every 1.5 s, on the shared 4 GB server. Load-test before any real 30-person run (plan, section 9).
- `format` stays the two-value field I1 reads until schema 7 in I7a.
- The guide still acts on team A only (switcher in I7a). One guide for many teams is open (O25).

**Next:** the owner reviews the uncommitted I2 and its draft copy, then decides on commit, push and deploy (each separately). Running a new adventure on live data needs its own approval (and shipping the CLI in the image). Then I3.

## Earlier handoff - I1 deployed: Adventure and Team model (schema 6), 29 Oct 2026

**Deployed 29 Oct 2026, 21:36 UTC (owner-authorised): `dori-shuk:20261029-213559-175548f`, commit `175548f`; all commits pushed.** Rollback image `dori-shuk:previous` = `20261026-084821-f54f6da` (schema 5).

- **The live file is still schema 5 on disk** until the first write after the deploy (any sign-in, invitation or game action). That write migrates it to v6 and creates the automatic copy `/data/state.json.pre-schema6-<hash>`.
- **To confirm after that write** (read-only): `docker exec dori-shuk node -e` printing only `version`, and `docker exec dori-shuk ls -l /data` showing the copy at mode 600.
- **Commits:** I0 `7548d08`, I1 `8ed2970`, safeguard `175548f`.

- **Schema 6** (`lib/amazing-shuk/participant-store.ts`):
  - `adventure { status, format, hostId, intendedCount }`, `teams { A: { leaderId, roles, missions } }` and `participants { [id]: { teamId } }`. Invitations, sessions, receipts and names are unchanged.
  - A v5 file becomes an active Play Together adventure with team A holding the old roles and missions; the seven seats are its members and the host is unset. A read migrates only in memory; the first write persists v6.
- **Team scoping:** views and actions use only the actor's team, and members see only their own team's list. The guide acts on team A until I7. A session outside every team gets 403; a member of a missing team or an unknown future schema is refused.
- **Moved to I2:** the invitations' optional `kind` and `teamId`.
- **Automatic pre-schema-6 copy** (owner-approved safeguard, its own commit):
  - Before the first successful write that turns an older file into schema 6, the store keeps the file's exact bytes as `state.json.pre-schema6-<first 12 hex of their SHA-256>`, beside the state file (live: in `/data`).
  - It is mode 600, written whole to a temporary file, then linked into place, so it's never overwritten and never partial. The directory is synced before the state file is replaced.
  - Reads and rejected actions make no copy. An identical existing copy is reused.
  - Fail closed: if the copy can't be kept (disk full, permissions, a different file under its name), the write is refused with a 503, the old file stays as it is, queued actions retry, and the server logs only the reason (`Shuk storage: the pre-schema-6 backup could not be kept: <code>`). The operator clears the cause.
  - The manual pre-deploy backup is still required; the automatic copy is a second line of defence.
- **Tests:**
  - 3 new: v5 → v6 with identical views, two teams kept apart, refusals.
  - Existing tests changed only how they read the raw file (`storedTeam`, `schema5Snapshot` in `legacy-store-fixture.ts`).
- **Verified:**
  - `test:shuk` 154/154; `npm test` 61/61 (re-run before the commit).
  - `tsc` passes. Lint is at its known baseline (3 prototype errors, 11 Memory Protocol warnings), none new.
  - `/game-verify shuk`: healthy, 8/8 route checks, a fresh state written as v6, 48 MiB. `git diff --check` clean.
- **Fresh live backup (owner-authorised, read-only), 29 Oct 2026 21:21:56 UTC:**
  - Location: `/root/backups/amazing-shuk/live-state-before-i1-20261029T212156Z.json`, outside the repo; folder mode 700, file mode 600.
  - Verified: schema 5, valid JSON, SHA-256 identical to the live file at the time.
  - Contents: 2 unexpired sessions, 6 expired invitations, 7 names, both roles held, 0 mission records (the game was reset on 26 Oct), 10 receipts, no duplicates.
  - Earlier backups in `.local/amazing-shuk/backups/` are kept.
- **Rehearsal** (`.local/amazing-shuk/rehearse-i1b.ts`; isolated copies in `shuk-dev`, deleted afterwards; aggregates only). On the fresh backup and on the 26 Oct pre-reset backup:
  - The v5 code (`7548d08`, temporary worktree) accepts the backup.
  - I1 migrates it. Roles, sessions, invitations, receipts and names are kept; missions match what v5 would hold; points, tokens and award records are equal (0/0/0 fresh; 200/4/2 pre-reset); no duplicate receipts.
  - The v5 code refuses a v6 file.
  - A temp-file-and-rename restore is byte-identical to the backup and is read by v5 again.
  - The restored file re-migrates identically.
- **Restore source:** the manual backup in `/root/backups/amazing-shuk/`, or the automatic copy inside the volume (`docker exec dori-shuk ls -l /data`; restore it with the same command, reading it via `docker exec dori-shuk cat /data/state.json.pre-schema6-<hash>`).
- **The operator restore command,** tested on an isolated container of the live v5 image (`--network none`, its own `/data`): the v5 app fails on a v6 file, and after the restore the file matches the backup and v5 reads and writes it.

  `docker exec -i dori-shuk sh -c 'cat > /data/state.json.restore && mv /data/state.json.restore /data/state.json' < /root/backups/amazing-shuk/<backup>.json`

**Deploy record (29 Oct 2026):**
- **Before:**
  - `docs/RUN_PREVIEW.md` was kept in `.local/amazing-shuk/RUN_PREVIEW.md.kept-during-i1-deploy` (with a `.patch`), reset for the deploy, and restored identically afterwards.
  - Fresh backup `/root/backups/amazing-shuk/live-state-before-i1-deploy-20261029T213546Z.json` (mode 600): schema 5, byte-identical to live; 2 unexpired sessions, 7 names, both roles, 0 mission records, 10 receipts, no duplicates.
- **Deploy:** `deploy/deploy.sh shuk` in tmux. The container was recreated, healthy, 0 restarts; all 7 smoke checks passed, plus the dev page (404) and the API without a cookie (401). No error lines in the live log.
- **After** (read-only for live data): the deployed code ran on a `/tmp` copy of the live file inside the container. It migrated to v6 (team A, 7 members, active, together); sessions, names, invitations, roles and receipts were kept; 6 missions, 0 points, no duplicate receipts; exactly one automatic copy, byte-exact, mode 600. The live file was still byte-identical to the backup afterwards.
- **Rollback, if needed:**
  1. Tag `dori-shuk:previous` as `:current` and run `docker compose -f deploy/shuk-compose.yml up -d shuk` (as `rollback()` in `deploy.sh`).
  2. If a v6 write has happened, run the restore command above at once, with the deploy backup or the automatic copy.
  3. Actions made since that backup are lost, so report the recovery options to the owner before restoring.

**Next: I2, host invitation, lobby and Start Adventure** (approved milestone; **implementation not yet authorised**). Spec: [multiplayer plan](multiplayer-plan.md), I2.
- **Depends on:** I1, deployed 29 Oct 2026.
- **Scope:** invitations gain optional `kind` and `teamId`; `shuk:invite -- host`; redeeming makes the host Team A's leader and opens a lobby; the intended count (1–6 Together; 7+ the choice, with Two Teams hidden until I7); Start Adventure by the host or guide; a "new adventure" CLI that archives the old state.
- **Open decisions:** O16 (lobby, team and onboarding copy; draft only, marked `TODO(copy)`). O6 and O15 are for I3, not I2. O20 still open; don't touch `.claude/agents/dori-ux-designer.md`.
- **Security:**
  - The host invitation is single-use (24 h) and hashed like the others, and host rights come only from it.
  - Only the host or guide can set the format or start.
  - Leaders get no guide-only permissions.
  - Never print invitation links or tokens.
  - Starting a new adventure keeps a backup.

**Disk:** 70% after the owner-approved cleanups (build cache, unused images, npm cache). Every `:current` and `:previous` image is kept.

## Earlier handoff - I0: skill and docs stabilised, multiplayer plan approved, 29 Oct 2026

**Committed at the owner's request; not pushed.** No game code, deploy or production data touched.

- **Owner approved the multiplayer plan** (adventure, one or two teams, join links with leader approval, roles and parts, Language Explorer). The plan, increments, checks and open gates are in [multiplayer-plan.md](multiplayer-plan.md); the approved decisions are summarised in [product decisions](product-decisions.md). I0 is accepted; **I1 may be prepared, not implemented**.
- **Journey-wide variety** (owner, after the skill test): the skill has a new principle, "judge a mechanic across the journey, not only at its stop"; step 9 now weighs "this point in the journey"; and the criteria gain the anti-pattern "one mechanic everywhere".
- **Fixed:**
  - `AGENTS.md` no longer says "one visible label".
  - The skill's `project-context.md` no longer claims SKILL.md doesn't restate the direction; it says SKILL.md summarises it and product decisions win.
  - The skill brief's stale "URLs not opened" note is marked done.
  - The inspiration library gains *Spaceteam*, *Captain Sonar*, *Hanabi* and *Pandemic* (read on Wikipedia on 29 Oct, as secondary sources) and principle 8: a role is an ability, not a title, and roles must merge for small groups.
- **Verified:** 79 links in the touched and skill files resolve; `claude plugin validate .claude/skills` passes; `git diff --check` is clean on the changed files (`docs/RUN_PREVIEW.md`, untracked owner notes, has trailing whitespace; not touched).
- **Automatic activation**, tested in fresh headless sessions (`claude -p`, stream-json, write tools disabled), one run per prompt unless noted:
  - triggered for "design a new stop (Yemenite aliyah)" and for "the Marzipan stop feels like a quiz, how could it become more of an experience?";
  - not triggered when the same Marzipan prompt adds "give me a short answer" (2 of 2 runs), which matches the skill's "small request" depth;
  - not triggered for two unrelated questions (`roles.ts` exports, the test script).
  - So the description stays as it is (O21: the tests don't support a change).
- **Explicit `/experience-design`** on Marzipan, Chesed VeRachamim and the Montefiore gate (fresh sessions, medium depth, no web research): all three read the mission data and sources first, gave three different concepts, moved the answer into the place, and kept facts and unknowns apart. The gate run departed from the worked example with a reason.
  - The drafts are not in the repo. Ideas worth bringing back to the owner: Marzipan "spot the change" at the tray; the synagogue's scored answer moved to the heritage sign; questioning the Beauty Queen bonus.
  - Total test cost $2.69.
- **Governance:** `.claude/agents/dori-ux-designer.md` is unchanged. The one line added on 29 Oct (`7635f56`) still waits for the owner's explicit approval or revert (O20).
- **Known debt, not fixed:**
  - Run 06 is stored twice (`design/inputs/content/` and `research/results/`).
  - `AGENTS.md` repeats the coding and content rules.
  - `scss.md` and `coding.md` have no `paths:`.
  - `docs/content/methodology.md` has drifted from the platform copy.

**Next:** the owner reviews and commits I0, then authorises I1 (the Adventure and Team model with one team and identical behaviour; migration rehearsed on a backup copy only).

## Earlier handoff - experience design skill, docs reorganised, 29 Oct 2026

**Committed (`1616e74`, `42c8ae5`, `7635f56`, `32857ca`); the owner pushes from VS Code** (git asks for the login through VS Code's password prompt, so a push from Claude's shell hangs). No game behaviour changed and nothing was deployed: the live Shuk is still `f54f6da`.

- **New skill `/experience-design`** (`.claude/skills/experience-design/`): the owner's ten-step thinking process from raw material to a recommended treatment, with quality criteria and anti-patterns, a treatment outline, an external research method, an inspiration library (six starting sources and eight precedents, read on 29 Oct through a subagent's page fetches; the Play Disney Parks page couldn't be read), the Shuk context, and a worked example on the Montefiore gate (the mission is unchanged). Claude can invoke it automatically, or the owner types `/experience-design`. The owner's brief is kept word for word in [experience-design-skill-brief.md](experience-design-skill-brief.md); the direction itself is only in [product decisions](product-decisions.md).
- **Order of processes:** the owner's [guiding methods](../../design/inputs/content/guiding_methods.md) → the skill (up to an approved treatment) → the [Codex build loop](../design/codex-amazing-shuk-partner.md#reusable-task-design-process). Written in the skill's `references/project-context.md`.
- **Pointers to the skill:** `CLAUDE.md`, `AGENTS.md` (for Codex; Claude doesn't load it while `CLAUDE.md` exists), `.claude/rules/content.md`, `.claude/agents/dori-ux-designer.md`, `docs/content/methodology.md`, `design/inputs/content/README.md`.
- **Docs move (the owner's):** `docs/scavenger_hunt/` is gone; story and tour texts are in `docs/knowledge/`. Every live reference uses the new paths, including the source strings in `lib/amazing-shuk/*-task.ts` and `lib/game/content.ts` (tests 151/151 and 61/61). Left on purpose: `design/output/00_discovery.md` (the designer agent's file) and `research/prompts/00_EVAL.md` (historical).
- **One copy per document:** the mechanics survey, the platform research and the place stories live in `design/inputs/content/`; their copies in `docs/content/`, `docs/project/` and `docs/knowledge/` are now pointers. The owner may prefer the mechanics survey's copy in `docs/content/`; swapping is small.
- **`CLAUDE.md` is 48 lines:** the dated status section became a short "Shuk state" pointer; the next and waiting lists moved to [current state](current-state.md).
- **Verified:** `claude plugin validate .claude/skills` passes; 0 broken links in the 30 touched markdown files; `git diff --check` clean. **Not verified:** automatic triggering and `/experience-design` in a fresh session.

**Next:**
- The owner pushes the four commits; check GitHub's `main` matches.
- Test the skill in a fresh session: one prompt that should trigger it, one that shouldn't.
- Then use it: a first candidate is Marzipan (two scored questions in a row; smell-first and watching the syrup go on are the concepts the audit found).
- The owner's phone review and the Stitch C1/E1 screens are still open ([current state](current-state.md)).

**Optional, from the audit:** lead the skill's description with its use case; add a "when not to use it" line; scope `scss.md` and `coding.md` with `paths:`; fix the "must have one visible label" wording in `AGENTS.md`; archive the skill brief once the skill settles.

**Untracked, keep out of commits:** `docs/RUN_PREVIEW.md` (local invite links), `docs/project/trip-doriisrael-paths.md` (the owner hasn't decided), `docs/design/stitch-reference/`, the photos in `public/shuk/`.

## Earlier note - change of course, 29 Oct 2026

**Owner's decisions, recorded only; nothing built.**
- **The market can also be part of the challenges** from now on (Mahane Yehuda itself, not only the closing reward). Wait for the owner before planning or building anything for it; open question for then: does Marzipan stay the locked finale?
- **No server-side Marzipan lock.** The client-only lock stays as it is (answers the open question below).
- **Never write "A guide tells that…"** in visitor-facing copy. Marzipan's syrup-bucket lead (`marzipan-task.ts:90`) still has it; reword only with the owner's copy. Answers the open question below.
- **The synagogue's blue-sign line is a hint** to the place's story (`synagogue-task.ts:56`), not an instruction to position around "Behind the answer". Not changed yet. Answers the open question below.
- **The mural's before photo:** the owner has had it for a long time, doesn't know its source, and thinks it may have been changed with GPT. Treat it as possibly AI-edited (content rule: confirm what an archival photo shows before building on it). Keep, label or replace: owner's call later.
- **Experience design direction** (owner, 29 Oct): recorded in [product decisions](product-decisions.md), the one record. **Skill built and committed** (`42c8ae5`): `.claude/skills/experience-design/`, with the owner's brief in [experience-design-skill-brief.md](experience-design-skill-brief.md). The UX designer agent points to it (`7635f56`).
- **Map rule: markers get smaller whenever the map zooms out**, to keep close pins (gate 2 and well 3) from overlapping. This replaces moving a pin. Not built; wait for the owner. Note for then: `LeafletBaseMap` is shared with the Memory Protocol, so scope it to the Shuk unless the owner says otherwise.

## Earlier handoff - owner's review fixes, deployed, live game reset, 26 Oct 2026

**Committed, pushed and live.** `3958bd3` (the changes below) and `f54f6da` (the two new photos added to the `.dockerignore` allowlist; the first deploy served them as 404). Live image `dori-shuk:20261026-084821-f54f6da`, healthy; both photos return 200 at `https://doriisrael.com/shuk/shuk/<file>`. The welcome screen and marker order (`d1d507a`, next entry) went live with it.

**Live game reset (owner, 26 Oct, 08:59 UTC):** every mission's progress was cleared (`missions: {}`; the store rebuilds empty records on load). Points, food tokens, arrivals, answers, hints and bonuses are at zero. Sign-ins, unused invitations, the seven display names and the navigator and answer-submitter roles were kept. Backups: `.local/amazing-shuk/backups/live-state-before-reset-20261026T085946Z.json` and `/data/state.before-reset-20261026T085946Z.json` in the container. Before the reset the mural and the gate were complete.

**Other work this session:**
- A fresh guide link went to `.local/amazing-shuk/public-invite-links.md`, and fresh local links (guide, players 1–3) to `.local/amazing-shuk/invite-links.md`.
- At the owner's request, these were stopped:
  - `dori-game-preview` (3200);
  - `dori-caddytest` (18080/18081; it was `--rm`, so it is gone);
  - the TourTech dev server (3002);
  - `mentor.service` (7373; still enabled, so it returns on reboot).
- New `docs/project/trip-doriisrael-paths.md`: every path on `trip.doriisrael.com` (the DORI platform), read from the Caddy file and the platform source, not checked live.
- `docs/RUN_PREVIEW.md` has uncommitted local invite links pasted at the top. Keep it out of commits; stash it for a deploy, which needs a clean tree.

**Next:**
- The owner's phone review of the deployed changes.
- Disk is at 85%; suggest `docker builder prune -f` before the next build.

**Waiting on the owner:**
- Copy: the cheers, "Behind the answer", the Marzipan lock note and the next-stop lines (all `TODO(copy)`).
- Levin mural: the artist, the wall's location, and whether it is at the home.
- A Marzipan storefront photo.

The owner's requests, in order:

1. **No names under the map pins** in the Shuk (`LeafletBaseMap` `showLabels={false}`; the Memory Protocol keeps them).
2. **Wider map:** the Shuk map opens fitted to all six markers (`openOnMarkers`, a pin's margin round them), and `zoomOutBy={1}` allows pinching one level below "contain". A first try opened one level out from "cover"; the gate's pin then hid the well's (the owner: "the water challenge is gone from the map"). Pins 2 and 3 are only 67 image px apart, so zooming far out still stacks them.
3. **No Source on mission pages:** both story components no longer show the source. `source` stays in the data as the evidence trail. The well's original Hebrew still shows in development only, as "Original Hebrew".
4. **The preview card's summary** is clamped at five lines (was three).
5. **The mural's before photo** moved from the post-answer reveal into the story, under its two paragraphs.
6. **Completion cheer and next stop:** `PreviewMissionCheer` appears under the accepted answer, above any bonus. It shows a different cheer per mission (`lib/amazing-shuk/mission-cheer.ts`, fixed by map order so every phone matches), "Next stop: mission N, <name>", a **Go to the next stop** button (opens that marker's preview on the map) and **Back to the map**. Rabbi Levin's stop gets a quiet line instead of a cheer. With every mission done, it says so and offers the map. All wording is draft (`TODO(copy)`).

7. **Montefiore bonus removed** (owner, 26 Oct): the hidden year תרמ"ב in בתמר is the Yemenite aliyah's year and unrelated to the gate. `MONTEFIORE_BONUS` stays in `montefiore-task.ts`, attached to no mission, for a possible Yemenite stop. Bonus points a group already earned there still count.

8. **No evidence labels on screen** (owner, 26 Oct; the owner chose one neutral heading, for every mission): stories, reveals, leads, bonuses, predictions, appreciation moments and the well's "Fiction · Puzzle scenario" line show no labels. Text after an answer sits under one heading, "Behind the answer" (draft). The data still labels every statement, and the wording keeps its hedges. Recorded in `.claude/rules/content.md`.

9. **Levin mural photo** (owner, 26 Oct): photo #39 (web copy `public/shuk/levin-mural.jpg`, 1024 px wide, metadata stripped) sits under the Levin challenge's story. The owner confirmed it shows Rabbi Aryeh Levin; caption "A mural of Rabbi Aryeh Levin in Nachlaot, painted in 2015." (photo index updated). It is also the mission's photo (map preview and location details), though it shows the mural, not the house. Open: the artist, the wall's location and whether it is at the home. Asset to commit with the code.

10. **Marzipan photo** (owner asked for one from the web, 26 Oct): Benjamin Lipsman's chocolate rugelach on trays (Jerusalem, 28 Aug 2013, CC BY 2.0, Wikimedia Commons `File:9674765093 August 2013 in Jerusalem.jpg`), web copy `public/shuk/marzipan-rugelach.jpg`. Nothing says which bakery it shows, so the alt doesn't claim Marzipan. CC BY needs credit: `MissionPhoto` has a new optional `credit`, shown under the photo on the location page (not on the small preview thumbnail). Open: a real storefront photo.

11. **Marzipan is the finale** (owner, 26 Oct): `finale: true` on the mission and `finaleLocked` in `mission-arrival.ts`. While any other mission is unfinished, its marker shows as locked, and its preview says "To earn the best chocolate in the market, first complete all the other missions. This stop opens last." (draft) in place of View Location. A saved screen or the Mission tab falls back to that preview. The next-stop button skips it until it's the only one left. The very last cheer ends "That was the last one! Now go find what the market has to offer you…" (the owner's line). The lock is in the client only: the server would still accept Marzipan actions. The name-mystery answer no longer starts "A Jerusalem guide tells it this way:" (owner); the follow-up lead's "A guide tells that…" is unchanged.

- **Verified:**
  - `test:shuk` 151/151 (new `mission-cheer.test.ts`), with tsc and ESLint clean, run inside `shuk-dev`.
  - Deploy health and smoke checks passed.
  - Not checked in a browser or on a phone.

## Earlier handoff - welcome screen and new marker order, 26 Oct 2026

**Committed in `d1d507a`; live since the 26 Oct deploy above.**

- **Welcome screen** (owner's request): `PreviewShukWelcome` replaces the bare sign-in line. It shows the illustrated map in a card, the title, three highlights and a "Start the game" button, plus a note that the link is personal. A signed-out visitor sees the same screen with a "use your invitation link" card in place of the button. All wording is draft (`lib/amazing-shuk/welcome-copy.ts`, `TODO(copy)`).
- **Marker order** (owner's request): 1 the mural, 2 the Montefiore gate, 3 the well, 4 Chesed VeRachamim, 5 Aryeh Levin, 6 Marzipan (`SHUK_MISSIONS`). Progress is keyed by mission ID, so live progress is unaffected. The map opens on marker 1. A request that names no mission still means the well (older clients). Mission numbers in older notes refer to the old order.
- **Verified:** `test:shuk` 147/147, tsc and ESLint clean, the welcome Sass compiles. Not checked in a browser.

## Earlier handoff - security review fixes: stale lock recovery and security headers, 25 Oct 2026

A manual security review of the live Shuk app (the `/security-review` skill failed: no `origin/HEAD`) found no way in for outsiders. Two findings were fixed at the owner's request.

1. **A stale write lock froze the game.**
   - Reproduced on an isolated copy with a real volume: after a lock was left behind and the container restarted, every sign-in and action returned 503.
   - Fix: `participant-store.ts` `acquireLock`. A lock older than `STALE_LOCK_MS` (10 s; real writes take milliseconds) is renamed aside atomically and the write proceeds. A younger lock still reports busy.
   - Test in `participant-store.test.ts`.
2. **Missing security headers.**
   - `next.config.ts` sets `poweredByHeader: false`.
   - The Caddy `@shuk` handle adds HSTS (1 year, no subdomains), `frame-ancestors 'none'` plus `X-Frame-Options DENY`, `nosniff`, and a default `Referrer-Policy` (`?`, so the API's `no-referrer` is kept). It also strips `X-Powered-By`.
   - Caddy backup: `dori.caddy.bak-20261025-headers`.

Not fixed, recorded as low:
- The Shuk shares the `doriisrael.com` origin with the static placeholder.
- The state file only grows (action receipts, expired sessions).
- No dependency audit or rate limiting was checked.

## Earlier handoff - real display names, kept out of git, 25 Oct 2026

The owner asked for players' real names in place of "Player 4/5/6".

- **Storage:** `lib/amazing-shuk/participant-names.ts` and an optional `names` map in the state file, validated on load (known IDs; trimmed, 1–40 characters, no control characters). Names never go in git.
- **Setting names:** `scripts/shuk-name.ts <id> "<Name>"` (or `--clear`). It is copied into the Shuk image's `tools/`. Run it with `docker exec dori-shuk node --experimental-strip-types --no-warnings tools/scripts/shuk-name.ts player-4 "<Name>"`.
- **Who sees them:** `sessionView` returns `participants`, so only signed-in members see names.
  - With no names set, every slot shows as "Player N" (the local simulation is unchanged).
  - Once names are set, only named players and role holders are listed, then the guide.
- **UI:** the header badges, the profile, the Group tab and the guide's role dropdowns use the server's list. Avatars still come from the fixed IDs.
- **Privacy correction:** commit `103e3ec` (and earlier note commits) put the invited friends' first names, and one surname, in tests and notes. The GitHub repo is public. The owner chose to scrub going forward: tests use sample names (Ari, Bea, Cal, Dana) and notes refer to players 4–6. The older commits still contain the names. The owner's own research files (`DORI_Digital_Platform_Research.md` and its copy) predate this work and were left alone.
- **Verified:** `test:shuk` 146/146 (new `participant-names.test.ts`). `npm test` 61/61; tsc and ESLint are clean.

## Earlier handoff - players choose their own roles; everyone else is an advisor, 25 Oct 2026

The owner asked: "let them choose and the rest are advisors". **Not committed or deployed yet**; the live app still has the old behaviour. Live roles were set by hand earlier: player-4 is navigator and player-5 is answer-submitter.

- **Roles:**
  - `roles.ts`: `claimGroupRole` (only a free role, or one you already hold) and `releaseGroupRole` (only the holder).
  - New player actions `claim-role` and `release-role` (`group-action.ts`, `parse-water-action.ts`), applied in `participant-store.ts`. The guide is refused there and keeps `assign-role` in the guide panel.
  - Advisors still can't start or submit, as before.
- **UI:**
  - The Group tab has a new `PreviewRoleChoices`: each role shows its holder, "you" or "free", with Take this role or Step down (3rem buttons).
  - `roleLabel` shows "Advisor" for `follower`. The roster lists advisors and the guide.
  - The profile panel says "Your role: Advisor". Empty roles read "free".
  - All new wording is a draft (`TODO(copy)`).
- **Verified:** `test:shuk` 142/142. New `role-choice.test.ts` covers the pure rules, labels, the Group tab buttons, and a server run: an advisor refused at start, a claim, a steal refused, a foreign step-down refused, the guide refused as a claimer, step down and replay, and the guide reassigning. `npm test` 61/61; tsc, ESLint and Sass are clean.
- **Not checked in a browser.**

## Earlier handoff - the protected Shuk app is live at doriisrael.com/shuk, 25 Oct 2026

The owner approved the plan (`/root/.claude/plans/tingly-snacking-tower.md`), then the commit and push (`fbd9fad`, Marzipan included), the deploy, the Caddy route and the invitations.

- **How it works:**
  - One codebase builds two images. `NEXT_PUBLIC_DORI_APP=shuk` (`--build-arg DORI_APP=shuk`) sets the base path to `/shuk` (`lib/base-path.ts`, `basePathFor`, `IS_SHUK_APP`).
  - `proxy.ts` and `lib/amazing-shuk/shuk-routes.ts` 404 everything but the game, its API, health, the manifest, `_next`, `shuk/` and `map/`.
  - `app/page.tsx` also redirects to the game in the Shuk build. The first test build served the Memory Protocol at `/shuk`, because the proxy matcher missed the bare root; it is now fixed in both places and smoke-tested.
- **Gate:**
  - `lib/amazing-shuk/shuk-access.ts`: "app" needs the Shuk build, production, `SHUK_APP=1` and Host equal to `SHUK_PUBLIC_ORIGIN`'s host.
  - In app mode, `participant-http.ts` checks Origin against the configured origin and sets the cookie `Secure; HttpOnly; SameSite=Strict; Path=/shuk/`.
  - New page `app/amazing-shuk/page.tsx`. `IndexWaterTask` takes `mode`; app mode hides the development panel and uses draft player wording (`TODO(copy)`).
  - `scripts/shuk-invite.ts` has an app mode: https public origin only.
- **Image and deploy:**
  - The Dockerfile takes `DORI_APP`, adds `/data` owned by `node`, and copies the invite script and the store sources to `/app/tools` (Shuk build only).
  - New `deploy/shuk-compose.yml`, with the same hardening as the game.
  - `deploy.sh shuk` smoke-checks with Host headers, including a loopback 404 and "the root isn't the Memory Protocol".
  - `/game-verify` accepts `shuk`.
- **Caddy:**
  - The `doriisrael.com` block now has `@shuk path /shuk /shuk/*` → `dori-shuk:3000`, with noindex; everything else still goes to `dori-site`.
  - Backup: `/root/projects/Tour-Tech/caddy/dori.caddy.bak-20261025`. It was validated in a throwaway container and in `revivo-caddy-1`, then applied with `caddy reload`.
  - `Tour-Tech/caddy/` is untracked in its own repo.
  - **Rollback:** copy the backup over `dori.caddy` and reload.
- **Verified live:**
  - `/` returns 200 (placeholder unchanged); `/shuk` and `/shuk/amazing-shuk` return 200 (title "The Amazing Shuk", `x-robots-tag` noindex).
  - The API without a session returns 401; `/shuk/dev/map` and `/shuk/api/sessions` return 404.
  - `trip.` and `app.` still return 401.
  - `dori-game` is untouched; its image was rebuilt as `dori-game:test` and smoke-tested (the Shuk returns 404 there).
- **Tests:** `test:shuk` 138/138 (new `shuk-app.test.ts`: prefixes, the gate, the route allowlist, app-mode HTTP and cookies, the invite script). `npm test` 61/61. tsc and ESLint are clean.
- **Invitations:** the guide and the three invited friends (players 4–6), in `.local/amazing-shuk/public-invite-links.md` (chmod 600, git-ignored). The owner sends them through Workspace.
- **Housekeeping:**
  - Disk reached 85% during a build. With the owner's OK I removed the pre-fix `dori-shuk:test`, the oldest `dori-game` release image and all build cache. Disk was 79–80% afterwards.
  - The owner's `docs/RUN_PREVIEW.md` edit was stashed for the deploy and restored.
- **Open:**
  - The roles in the new store are the defaults (player-1 and player-2, not invited): the guide must reassign them.
  - No backups.
  - No display names.
  - Nothing tested on a real phone.
  - `/security-review` is still recommended.
  - The API route is still named `/api/amazing-shuk/dev`.
  - These doc updates are not yet committed.

## Earlier handoff - mission 6, Marzipan Bakery, "The Sweet Secret of Marzipan", 25 Oct 2026

**Not committed** (owner asked for no commit, push or deploy). The owner's brief: a 3–5 minute bakery stop at 44 Agripas Street on rugelach, the syrup, the name, the New York shipping and babka.

- **Mission 6, `lib/amazing-shuk/marzipan-task.ts`** (`marzipan-rugelach`, marker 6):
  - Story: three labelled lines (opened about 40 years ago by Yosef and Shoshana Ozerko; their sons run it; moist, sticky, soaked in syrup).
  - **Name mystery, unscored:** "Why is a bakery famous for chocolate rugelach called Marzipan?" A closed `<details>` answer, labelled Attributed tradition: only the guide's recorded tour says it first sold marzipan sweets. No published bakery account was found, so nothing is scored and nothing is stored.
  - **Question 1, scored:** when does the syrup go on? Before the oven / **while still warm** / after cooling. Two hints.
  - **Question 2, scored:** what does rugelach refer to? **Little horns** / crowns / boats / bells (distractors invented). One hint. It opens under the answer to question 1 (the syrup and texture, plus the bucket-and-hose story as Attributed tradition).
  - Final reveal: Polish róg; an Interpretation that "little horns" is the usual reading, not word for word; traditional crescents vs Marzipan's straight ones; "Look at the trays".
  - **Bonus, the suitcase mystery** (10 points, no food tokens): flash-frozen and flown to New York, given as the bakery's own account. The reveal says it is not a list of what New York shops sell today.
  - **Babka:** an unscored conversation (the existing appreciation panel). "Chocolate or cinnamon babka: which would you bring to a Shabbat dinner?" It makes no claim about Marzipan.
  - **Explore Food Rewards** after completion: it only opens the Food tab. No redemption, prices, portions or offers.
  - Rewards: the provisional well values (2 food tokens, 100/40 points, 3 hint penalties shared over both questions); timed invisibly.
- **New shared mechanism: follow-up questions** (`MissionDefinition.followUps`, `choiceStep` in `mission-arrival.ts`):
  - A "choose N" mission may have further scored questions. The store keeps `step` and `stepHintsStart` on the choice record; both are absent for the other missions, so their records are unchanged.
  - An accepted answer opens the next question with no picks. Only the last answer completes the mission, stops the clock and issues the one award.
  - Hints are numbered within a question but count towards one shared total. A hint action may carry `step`; a late hint from an earlier question is a no-op ("The group has moved on…").
  - A stored step that doesn't exist is refused on load.
  - UI: `ListChoiceTask` takes `step` and `followUps`; `PreviewChoiceTask` shows a `lead`. New `PreviewChoicePrediction` (3rem summary target). `IndexWaterTask` sends the step with hints and shows the Food button.
- **Sources** (read 25 Oct 2026):
  - Maariv, Pascal Perez-Rubin, 3 Jul 2020: brushed with syrup "as they come out of the oven, while still warm"; Marzipan's rugelach have "a straight shape" and are "moist, sticky, soaked in sugar syrup".
  - Time Out Tel Aviv, 22 May 2023: about 40 years ago; Yosef Ozerko and his wife Shoshana; their sons run the business. (Mako names the sons Itzik and Gilad; Time Out, Itzik and Shlomi. The copy names neither.)
  - marzipanbakery.com "Our Story" (undated, © 2026): the suitcases quote and "we flash freeze them and fly them directly to our New York facility". The Jerusalem Post (Niv Elis, 5 Jun 2016) headline: four Gourmet Glatt stores in New York and New Jersey (only the headline and caption were readable).
  - English Wikipedia, "Rugelach" (Polish rogaliki, róg = horn; crescent, citing Joan Nathan) and "Babka (cake)" (citing Gil Marks: Polish Jewish communities; spare challah dough with jam or cinnamon; chocolate likely mid-20th-century American).
  - Guide's recorded tour, `docs/knowledge/HE_trans.txt` ("מאפיית מרציפן והרוגלך"): the name story and the bucket and hose.
  - Could not open (HTTP 403): the Yiddish Book Center, Tablet, Forward and Jamie Geller pages.
- **Provisional or unverified:**
  - **Every story, question, hint, reveal, bonus and location line is draft copy for owner review.** The question wording and the bonus answers are the owner's.
  - The name's origin: oral only.
  - Babka and Shabbat: Wikipedia ties babka to challah dough but says nothing about Shabbat tables. The copy keeps Shabbat to the conversation question.
  - Whether the New York shipping still runs today.
- **Location and map:**
  - Hebrew name "מרציפן", per the brief; the sign is not checked.
  - The clue mentions the queue (13tv/Yummies, 29 Aug 2023) and trays of rugelach. The entrance is not field-checked (`TODO(field)`).
  - **No photo:** there is no owner, bakery or licensed image, so the location shows the camera fallback.
  - The marker (628, 472) is where the base map's own "Marzipan Bakery" label sits. That label was traced from a Google Maps screenshot (map audit), so `verified: false`.
  - GPS is off: `destination: null`; the guide can confirm arrival.
  - Opening hours, kosher status, allergens and any tasting are not arranged. The address listing is the only business check (site research run 06, row 14), and the English tour notes a directory flagged possible closure: **check the shop is open before a pilot.**
- **Verified** (25 Oct 2026):
  - In `shuk-dev`: `test:shuk` 133/133. New tests:
    - `marzipan-task.test.ts`: keys and sources, labels, no spoilers, the name as tradition, the bonus, babka, the catalogue, the hint step parse, the full server run, and persistence with a bad step refused. The server run covers a wrong answer, a follower refused, question 2, a late hint, the step's own hints, a stale pick, the early bonus refused, 75 points for two hints, no second award on repeat submit, guide approval and replay, and the bonus once.
    - `marzipan-task-ui.test.ts`: each question's choices and hints, the lead, the completion reveal, and a prediction with no form.
    - Three catalogue lists updated.
  - On the host: `npm test` 61/61.
  - In `shuk-dev`: `tsc --noEmit` passes (without a fresh `next typegen`); ESLint on `lib/amazing-shuk` and `components/amazing-shuk` is clean; both changed Sass modules compile, with no hex values. The dev page serves HTTP 200. `git diff --check`: only the owner's `docs/RUN_PREVIEW.md` trailing space.
  - `/game-verify` (the image build) was **not** run.
- **Not checked in a browser or on a phone:**
  - question 2 replacing question 1 for every device at once;
  - the lead panel;
  - the prediction's open and closed states;
  - the Food button;
  - the marker over the base map's label;
  - the no-photo location view.
- **Open decisions for the owner:**
  - Approve or rewrite the copy.
  - Keep the name mystery as a tradition, or ask the bakery.
  - A storefront photo (own, bakery-approved or licensed).
  - A field point for GPS and the marker.
  - Whether to remove the base map's baked-in Marzipan label (the audit said it must go; it now marks a real stop).
  - Rewards and bonus values.
  - Any tasting offer: guide-approved only.

## Earlier handoff - mission preview overlaps the map; View Location never scrolls away, 25 Oct 2026

Committed and pushed on `main` (`9d9b9c5`). The owner approved the Stitch direction and asked for two connected preview refinements: the preview overlaps the map, and View Location is visible without scrolling.

- **Map stage** (`ListArrivalMission` and its `.module.scss`):
  - One flex column holds the map and the sheet. It fills the screen between the sticky header and the bottom bar: `100dvh` (fallback `100svh`) minus `--shuk-header-height` minus `--shuk-nav-offset`.
  - `IndexWaterTask` measures the header with a ResizeObserver, because the badges wrap and text can be enlarged.
  - The map card shrinks when the sheet opens, but never below 8rem.
  - The sheet overlaps the map's lower edge by 1.5rem (24px), with rounded top corners and a soft upward shadow.
  - Stacking is plain DOM order with `z-index: 1`; the old sticky sheet and its `z-index: 1000` are gone.
- **`LeafletBaseMap`:**
  - A ResizeObserver calls `invalidateSize`; Leaflet only re-measures on window resize. This applies to every caller and is a no-op when the size doesn't change.
  - The new opt-in `keepSelectedVisible={{ bottomInset }}` pans just enough (`panInside`, not animated under reduced motion) to keep the selected pin and its label above the overlap. It runs when the selection or the frame size changes.
  - Only the Shuk passes it; the Memory Protocol is unchanged.
- **`PreviewMissionCard`:** three rows.
  - The pill and the × button.
  - A body with the title, place, a 4.5rem thumbnail and a summary teaser clamped to three lines. The full summary and the large photo are on the location view. The body scrolls on its own only when needed, with `overscroll-behavior: contain`.
  - An action row with View Location that never scrolls.
  - The sheet is capped at 75% of the stage.
  - Focus on the title, Escape, × and tapping the map to close are unchanged.
  - The no-photo fallback is now a camera tile with screen-reader text.
- **Marker tap:** now scrolls to the top (the normal `navigate`), in place of `scrollIntoView`, so the whole stage is in view. The nav offset is 4rem + 1.5px, to match the bar's new top rule.
- **Estimated by arithmetic, not measured** (preview open, no browser toolbar, Gan HaTut):
  - **390×844:** about 325px of map, and the sheet fits.
  - **375×667:** the header is about 150px; about 148px of map, and the sheet fits without scrolling.
  - **320×640:** the role pills wrap to three lines, so the header is about 190px. The map is at its 8rem minimum, and the body scrolls about 45px.
  - At every size, View Location is above the bottom bar.
- **Verified:**
  - In `shuk-dev`: `test:shuk` 119/119. The new test covers the three rows in order, View Location outside the scrolling body, the thumbnail, and the sheet inside the stage.
  - On the host: `npm test` 61/61.
  - In a one-shot container: ESLint, `next typegen`, `tsc` and every changed Sass module pass.
- **Not checked in a browser or on a phone:** all eight of the owner's acceptance points, including the overlap's look, the marker staying visible, the toolbar resizing and the map position after returning.
- **Possible next step:** on narrow phones the role pills take three lines of the header. Showing only avatars and role icons below 22rem would give the map about 60px more.

## Earlier handoff - Stitch design, first slice (header, map, preview, location) and the Thumbs avatar, 25 Oct 2026

Committed and pushed on `main` (`9d9b9c5`). The owner asked to implement the Stitch reference (`docs/design/stitch-reference/`, the owner's, untracked). Plan: `/root/.claude/plans/no-so-plan-new-majestic-blum.md`.

**Owner choices:**
- Plex Serif for headings.
- Scope: the shell plus screens B1–B3; challenges and Food later.
- Stitch is a layout reference only.
- Avatar: DiceBear Thumbs.
- Before play, show only the food tokens.
- The photo rights audit is deferred: the photos may be used as they are.

These are recorded in `product-decisions.md`.

- **Built:**
  - **Tokens:** `--font-display` (IBM Plex Serif 600/700 in `app/layout.tsx`). Stitch surfaces as derived tokens, marked unconfirmed: `--surface-raised`, `--surface-recessed`, `--line-stone`, `--ink-subdued`, `--shadow-float`.
  - **Avatar:**
    - `participant-avatar.ts` uses Thumbs (CC0 1.0, per the package's LICENSE.md).
    - Its shape colour is sumac, za'atar or amber by ID, and the face is ink or chalk for contrast.
    - It sits in a round frame with a `--line-stone` ring; the avatar toggle is round too.
    - The Dori agent's identity line now says Thumbs (owner request).
  - **Header:** new `PreviewShukHeader`, sticky.
    - The eyebrow, the Serif title and the avatar on one row; the role pills (with `compass` and `textAnswer` icons) and two chips below.
    - The points chip: sumac fill, "N pts". The tokens chip: amber edge, ink text, "N tokens". Accessible names "Group points: N" and "Food tokens: N".
    - The old balance card is gone.
  - **Bottom bar:** raised surface with a stone top rule.
  - **Map:** `LeafletBaseMap` gets an opt-in `frameClassName`. Its height and border now read `--map-height` and `--map-border`, defaulting to the old values, so the Memory Protocol is unchanged. The Shuk passes a rounded field card that fills the screen between the header and the nav.
  - **Preview sheet:**
    - A pill "Mission N · status" in the pin's state colour replaces the separate badge and status line.
    - Serif title, rounded photo, summary in a box, round × button, raised sheet with rounded top corners.
    - No Hebrew name, rewards or drag notch, per the Dori agent's preview list.
  - **Location view:**
    - A sumac "Back to map" link and a "Mission N · status" pill (no "of M": missions are played in any order).
    - A framed photo, the Serif title, the Hebrew name in sumac at the end side, the area line with a pin.
    - A recessed "Look for" card with a sumac start edge and the new `search` icon; it holds the clue, the clue photo and the landmarks.
    - A recessed "We're Here?" card; the existing button now has a `compass` icon.
    - Open Challenge in a card, with "+N food tokens" under it from `rewards.foodTokens`.
- **Changes from the plan:**
  - The token chip is not amber-filled: ink on amber is 4.2:1, below 4.5:1.
  - The photo caption badge on the location view was dropped. It repeated the area line, and the only "verified" flag is the marker placement, not the place.
- **Stitch conflicts left out by decision:**
  - points promises before play;
  - "Mission 2 of 4";
  - the Hebrew name and rewards on the preview;
  - Material icons;
  - the filter chips, map scale, path line, audio button and "Built 1882";
  - the scrim behind the sheet.
- **Recorded for the challenge slice (C1):**
  - Stitch's moves counter and "optimal", its permanent Fill/Pour/Empty grid and the "-15 pts" on hint buttons conflict with the approved patterns: contextual controls, invisible timing and progressive hints.
  - Its C1-refined and E1 screenshots failed to download; re-export them.
- **Draft labels:** "pts", "tokens", "Mission N · status", "+N food tokens".
- **Open questions:**
  - Restyle the map markers as Stitch does? That changes the map the Memory Protocol shares.
  - Filter chips, map scale, path line?
  - A read-aloud audio button?
- **Verified:**
  - In `shuk-dev`: `test:shuk` 118/118. The new tests cover the header chips, the preview's pill with no rewards, the location's pill, the Look-for card and food tokens with no points, and the Thumbs licence and token colours.
  - On the host: `npm test` 61/61.
  - In a one-shot container: ESLint (Shuk, map, layout), `next typegen` and `tsc` all pass. Every changed Sass module compiles, and none contains a hex value.
- **Not checked in a browser or on a phone:**
  - avatars at 24 and 40px;
  - the sticky header height and wrapping at 360px;
  - the chips in sunlight;
  - the map card's height;
  - the sheet over the map;
  - the location cards;
  - the Memory Protocol map.
- **Don't commit `docs/RUN_PREVIEW.md`** (the owner's invitation links). `docs/design/stitch-reference/` stays the owner's.

## Earlier handoff - missions 4 (Montefiore gate) and 5 (Rabbi Aryeh Levin), 25 Oct 2026

Committed and pushed on `main`. Owner approved (25 Oct 2026): Montefiore's three languages as the main challenge and the year as an optional bonus, made easier; a Rabbi Aryeh Levin mission at his home, with the Kramer-Rechtman plaque as its bonus; the Olei HaGardom story told respectfully.

- **Mission 4, `lib/amazing-shuk/montefiore-task.ts`** (`montefiore-testimonial-gate`):
  - Pick 3 of 5: Hebrew, English and Arabic are right; Ladino and Yiddish are invented distractors.
  - Bonus: find תרמ"ב beside "1882" on the Photograph in Stone plaque (#02), then pick the word in "אָמַרְתִּי אֶעֱלֶה בְּתָמָר" with the same four letters (בתמר; אמרתי is the near miss). It is a letter shuffle, so no arithmetic is needed (Hamichlol explains the name as reordered letters). 10 points, no food tokens.
- **Mission 5, `lib/amazing-shuk/levin-task.ts`** (`aryeh-levin-prisoners`):
  - Story: Levin, Feinstein (Ashkenazi, Old City, his student) and Barazani (born in Baghdad, Kurdish family), and the grenades in oranges.
  - Pick 1 of 4: "A rabbi would be with them, and they would not risk his life." Three invented distractors.
  - Untimed, no hints; completion title "Answer received".
  - Bonus: name Feinstein's fiancée from the Kramer-Rechtman plaque on HaCarmel St (#25): Rachel.
- **Shared changes:**
  - `ChoiceOption.lang: "he"` renders a card with `.rtl` and `lang="he"`.
  - `BonusContent.verse` and `letters` render a verse and letter tiles of at least 3rem.
  - `ChoiceTaskContent.completionTitle`.
  - `MissionDefinition.timed: false`: the start records the timing as excluded, so the award is untimed by the approved rule.
  - Both missions are in `SHUK_MISSIONS` (markers 4 and 5) and `CHOICE_TASKS`.
- **Sources** (read 25 Oct 2026):
  - Owner's photos #05 (gate panels, read at 4x zoom), #02 (plaque badge "אוהל משה תרמ"ב 1882", June 1882, the Montefiore fund, Yemenite families) and #25 (Kramer-Rechtman plaque).
  - Hamichlol, "עליית אעלה בתמר".
  - Hebrew Wikipedia, "מאיר פיינשטיין" and "משה ברזני"; English Wikipedia, "Meir Feinstein" (quotes Begin's 1981 speech).
  - Site research run 06, rows 1 and 3.
- **Conflicts recorded, not resolved:**
  - Which rabbi they meant to spare. Levin declared he would attend; Hebrew Wikipedia ties the change of plan to Rabbi Yaakov Goldman; Begin says only "the Rabbi". The question doesn't name him; the reveal says sources differ.
  - The embrace with the grenade between them is labelled Attributed tradition; English Wikipedia calls it romanticized.
  - The number of Yemenite immigrants: Hamichlol about 150, NLI about 200. The copy gives no number.
- **Draft copy for owner review:** every story, question, hint, reveal, bonus and location line in both files, except quotes from plaques. The Arabic panel's wording is a `TODO(copy)` in the code and is not shown.
- **Field checks:**
  - The Arabic panel's text. My reading: "أوهل موسى … موسى مونتفيوري رحمه الله". "رحمه الله" would be odd in 1882, while Montefiore was alive, so the panel may be later.
  - The rosette on the gate ("במספר … לפ"ק" wording, possibly a year written as a phrase).
  - The gate is the Ohel Moshe entrance at Agripas and Hermon streets.
  - Levin's house marking.
  - Whether the Kramer plaque is legible.
  - Both markers are manual guesses. GPS is off for both: the gate reuses Gan HaTut's candidate point, and Levin's is a provisional point between the Nominatim centroids of the two streets.
  - Missions 1 and 4 share the gate photo.
- **Verified** in a clean `node:22-alpine` container (25 Oct 2026):
  - `test:shuk` 115/115. New tests: both missions' keys, labels and spoiler checks; the anagram and the 642 sum; the untimed award after 20 minutes; Hebrew cards with `rtl` and `lang`; letter tiles; the quiet title.
  - `npm test` 61/61. `next typegen` + `tsc` pass. ESLint on `lib/amazing-shuk` and `components/amazing-shuk` is clean. Changed Sass modules compile.
  - `shuk-dev` serves the page (HTTP 200).
  - `git diff --check` is clean for these changes. The only hit is a trailing space in the owner's own `docs/RUN_PREVIEW.md` edit.
- **Not checked** in a browser or on a phone: tile size and RTL layout, the Levin story's tone on screen, and the new markers' positions on the map.
- **Don't commit `docs/RUN_PREVIEW.md` as it stands.** The owner's uncommitted edit added live invitation links. `docs/design/stitch-reference/` is the owner's, untracked and not part of this work.
- **Next:** owner review of the draft copy and the field checks above; then the slim header; then the earlier photo rights audit (entry below).

## Latest handoff - historical photo rights audit (started), 24 Oct 2026

Owner: Israel Revealed to the Eye (Yad Izhak Ben-Zvi) "Open Use" photos may be used commercially with attribution; Fair Use and protected images must not ship without permission. Uncommitted; no code or assets changed yet.

- **How to read rights:** item pages (israelalbum.org.il/image-page/?type=objects&id=…) load data from the public GraphQL API `https://api.eshmor.org.il/graphql`, query `getItemByID(appID: "924c217a-d119-42d3-91af-72ade1e9b2e2", index: "objects", id: …)` with fields `permissions { nameHE nameEN }`, `photographer`, `proPhotographer`, `creator`, `collectionNameHE/EN`, `createdDate`, `notes`, `titleHE`, `imageOriginal`. Classifications seen in the site's code: Fair Use (שימוש הוגן), "Copyright Free - Public Usage", Protected Copyright (מוגן בזכויות יוצרים).
- **ybz.0024.002** (Armoza family portrait with Luna, photo index #108): https://israelalbum.org.il/image-page/?type=objects&id=ybz.0024.002. Collection: "Armoza Family, via the "Lev Ha-Ir" Community Center, Jerusalem" (YBZ.0024). Date 1935–1940, studio photograph; photographer/creator not recorded. **Permission: Fair Use** — not cleared for the app. Not used anywhere; keep out of production.
- **Still to do:** query the other archival candidates (#111–#116, Armoza collection YBZ.0024 and the Hesed VeRahamim founders/interior photos; IDs still TODO in the photo index); find the catalogue entry of `public/shuk/mural-before.jpg` (owner-supplied; source, photographer and rights unknown) and, if it isn't Open Use, exclude it from the production build until cleared (a decision on gameplay, since it is the mural's completion reveal); add a small credit line to the image component; record all of this in `design/inputs/photos/photo_index_ALL.csv` (`credit_rights`).

## Earlier handoff - Chesed VeRachamim bonus (literary Luna) and Eshet Chayil, 24 Oct 2026

Uncommitted. The owner revised iteration B: a Luna bonus tied to the novel, then the Eshet Chayil moment.

- **History check:** Yitzhak Armoza's mother is not named in any project or external source checked. The real Luna appears only in the Yad Ben-Zvi portrait caption (ybz.0024.002, Israel Album): "עומדים: לונה (מימין) ומורנו, יושבים: יצחק ופלור, הילדים: יצחק (זאכי) ופלורה" — no relationship, no date. No evidence of a 1948 (or any) Jerusalem beauty title for a real Luna Armoza. The novel *מלכת היופי של ירושלים* (Sarit Yishai-Levi, 2013, Modan; tr. Anthony Berris, family spelt Ermoza) is historical fiction; its Luna is the daughter of Gabriel and Rosa Armoza and the beauty of the title; the author says it isn't biographical, though characters share traits with her own family. No source links it to the synagogue's Armoza family. Sources: he.wikipedia "מלכת היופי של ירושלים (ספר)", Goodreads/publisher copy, mako interview, israelalbum.org.il. NLI record 997009637210105171 returned 403.
- **Built (literary version):** optional bonus after the accepted main answer. `MissionDefinition.bonus` (`challenge`, `points`); mission records gain `bonus: { selected, award }` (older synagogue records gain an empty one on load). Actions `toggle-choice` / `reset` / `submit` with `part: "bonus"` (parser refuses `part` on anything else). Server: opens only after main completion, shared picks, submitter or guide only, retries, `SYNAGOGUE_BONUS_POINTS` = 10 once, never food tokens, never affects main completion; balance includes it. UI: `ListChoiceBonus` → `PreviewChoiceBonus` (cards extracted into `PreviewChoiceOptions`, shared with the main challenge), then `PreviewAppreciation` (static, unscored, nothing stored, no inputs).
- **Player-facing text:** question (owner): "What was Luna Armoza known as in the famous novel about a Jerusalem family?" Options: The Rose of the Old City / The Beauty Queen of Jerusalem (correct) / The Nightingale of Nahlaot / The Pearl of Mahane Yehuda (three invented). Drafts: title "Bonus: a famous name"; intro "Optional. The Armoza name also belongs to one of Israel's best-loved novels."; reveal (Historical fact ×2) "The Beauty Queen of Jerusalem is a 2013 novel by Sarit Yishai-Levi, later a Netflix series. It follows several generations of a Sephardi family in Jerusalem, and Luna is the beauty of its title." / "It's historical fiction: its Armoza family (Ermoza in the English translation) is invented. It shares a surname with the family who founded this synagogue, but no source we know of connects the two."; wrong-answer "Not quite. Talk it over and try again."; "That's right! Bonus complete."; "Bonus points earned: N". Eshet Chayil: "A moment of appreciation"; Historical fact "The door to the women's section carries the verses of Eshet Chayil, "a woman of valour"." (sign); Interpretation "The verses praise a person's strength, kindness and care for others."; invitation (owner); note "Say it aloud if you like, or keep it to yourself. Nothing is recorded or scored."
- **Verified:** `test:shuk` 103/103 (new: bonus content/claims, parser, server bonus flow, legacy record, bonus and appreciation UI), `npm test` 61/61, `tsc`, lint, Sass. Not checked in a browser.

## Earlier handoff - mission 3, Chesed VeRachamim (iteration A), 24 Oct 2026

Uncommitted. Owner approved the concepts for missions 3 (synagogue) and 4 (Montefiore); this is iteration A only.

- **Built:** `lib/amazing-shuk/synagogue-task.ts` (mission `chesed-verachamim-before`, third in `SHUK_MISSIONS`). One pick from the owner's four options (bakery, tavern (pub), school, tailor's workshop); `required: 1` on the existing "choose N" challenge, so server validation, roles, hints, invisible timing, idempotent rewards and per-mission progress are reused unchanged. Rewards are a provisional copy of the well's.
- **Generalised, not rewritten:** the mural's screen components are now `ListChoiceTask` / `PreviewChoiceTask` / `PreviewChoiceStory` (renamed from `*Mural*`), fed by `findChoiceTask(missionId)` in `lib/amazing-shuk/choice-missions.ts`. The reveal can now hold labelled statements as well as an image.
- **Sources (exact):**
  - Blue municipal heritage sign at the building, owner's photo #47 (read at 3× zoom). Hebrew: "נבנה כבית מגורים, ולאחר שהפך לבית מרזח בניגוד לתקנון השכונה, פעל "המוכתר" של הספרדים בשכונה, יצחק ארמוזה להפיכת המבנה לבית הכנסת של הקהילה הספרדית - דוברי לאדינו". English: "Built as a residential building, but turned into the Hessed Ve-Rahamim (Kindness and Mercy) synagogue by a local leader, Izhaq Armoza after it became a pub, against the rules of the neighborhood." It also names the "Eshet Hayil" verses on the women's-section door and the twelve-tribes front door.
  - Yad Izhak Ben-Zvi, Armoza family collection, catalogue description (`docs/armoza/Armoza_fam.md`): 1925, building owned by the Cheshin family, "used as a tavern", Yitzchak Armoza evicted the occupants and made it the Sephardi synagogue; the society founded the same year by Old City Sephardi families; kindergarten, soup kitchens, Mazor clinic.
  - Tiled pediment: founded 5685 (1925), Old City emigrés (photo #21). Hebrew and English tours, Stop 7 (address 18 HaCarmel St, Mazkeret Moshe; NLI archival entry 997009637209605171).
- **Conflict recorded, not resolved:** the ideas file (task 12, "Two stories, one wall") notes the tile's 1925 founding was read as supporting a butchers' version; the photo index calls the sign "the TAVERN version". Both the sign and the archive name a pub, so the key uses it; the catalogue's "some say he put 10 liras on the table" detail is Attributed tradition and is not used.
- **Copy (drafts for owner review):** story (3 labelled statements, no mention of the pub), hints ("Whatever it was, it went against the neighbourhood's rules." / "Picture a place for drinks and conversation."), reveal statement retelling the sign, location summary, landmarks, clue and photo alt. Owner's own wording: the question and the blue-sign line.
- **Location:** 18 HaCarmel St (both tours; not field-checked). Marker at the map audit's provisional (712, 560). GPS point is the audit's unverified OSM point, so We're Here? falls back and the guide confirms. Photo: the owner's daylight `public/shuk/Hesed_va_Rahamim.jpg` as `public/shuk/synagogue-facade.jpg` (no people; the blue sign is out of frame). The Armoza portraits the owner added to `public/shuk/` (#108, #115) are copyrighted per the photo index and are not used. The sign photo is not shown, so the group reads the real sign.
- **Luna (iteration B), finding before building:** no project source says Luna was Yitzhak Armoza's mother. The only archival mention is the Yad Ben-Zvi portrait (#108): "standing Luna (right) and Moreno; seated Yitzhak and Flor; the children Yitzhak (Zaki) and Flora". Yitzhak's wife was Flor Mimran; his mother isn't named anywhere in the project. Luna Armoza is also the heroine of the novel *The Beauty Queen of Jerusalem*, which is not evidence. The ideas file's task 14 ("Luna = Levana") rests on a finial inscription in an archival image that hasn't been located. Luna content stays unpublished until the owner supplies a source. Owner then pointed to the Israel Album page for the portrait (https://israelalbum.org.il/image-page/?type=objects&id=ybz.0024.002, read 24 Oct 2026): its only text is the caption "משפחת ארמוזה עומדים: לונה (מימין) ומורנו, יושבים: יצחק ופלור, הילדים: יצחק (זאכי) ופלורה, ירושלים". It confirms the spelling לונה and that she belongs to the family, but states no relationship, no date and nothing about the synagogue. The NLI record returned 403. Reading the caption (Interpretation, not fact): Luna stands beside Moreno, Yitzhak and Flor's son, and the children are named Yitzhak and Flora after the seated couple, so Luna was most likely Moreno's wife, Yitzhak's daughter-in-law, not his mother.

## Earlier handoff - map UX slices and mission photographs, 24 Oct 2026

Uncommitted. Owner-reviewed in the browser by screenshot; not checked on a real phone.

- **Mission preview sheet** (`PreviewMissionCard`): sumac top rule (za'atar when completed), a badge repeating the tapped pin's number and state colour, mono status line, larger title, place with pin icon, full-width photo when present or a one-line camera notice, summary, one full-width **View Location**. Focus moves to the title on open; Escape or × closes and returns focus to the map (`onClosePreview`). Owner approved the result.
- **Participant identity** (owner-approved piece 1): new `IndexParticipantMenu` (avatar in the header opening a profile panel with `ListParticipantIdentity` and Sign out; closes on ×, Escape, avatar or outside tap) and `ListParticipantBadges` (one wrapping line of navigator and answer-submitter badges under the title). The old participant card is gone; the dev warning and "Refresh shared state" sit in a collapsed "Development" disclosure. Guide controls unchanged. Draft labels: "Profile", "Profile: [name]", "Close profile", "Group roles", "Development".
- **Mission photographs, connected (owner's choice, 24 Oct 2026):** the placeholder had shown because both definitions set `photo: null`; the image path itself worked. The owner then picked photos and put the originals in `public/shuk/`. The app uses small web copies (≤1600 px, JPEG, metadata stripped; no GPS was embedded):
  - Gan HaTut `photo`: `gan-hatut-gate.jpg`, the Montefiore Testimonial gate into Ohel Moshe (photo index #05), cropped to leave out the passers-by at the bottom. New field `cluePhoto` (shown under "Look for" in the location view only): `gan-hatut-cistern.jpg`, the cistern under its glass cover (owner's `cistren_gan_ha_tot.png`).
  - Mural `photo`: `mural-street.jpg`, from #103 (rotated). It shows the whole wall, so it includes the real vents and the painted details, but says nothing about which are real. This overrides the earlier "no mural photo" rule; mural reuse rights in `product-decisions.md` are still recorded as unresolved, so the owner should confirm and update that decision before anything is published.
  - Alt texts are drafts for owner review. Card photos crop to 4:3; the location view shows the whole photo, capped at 60svh.
  - Originals (7.7 MB, 7.7 MB, 12 MB, 0.3 MB) are untracked in `public/shuk/`; move them out (e.g. to `design/inputs/photos/`) before committing so they aren't versioned or served.
  - The before photo stays in the completion reveal; its photographer, date and rights are still not recorded.
- **Mural challenge UX:** objective is now the owner's wording, "The artists fooled almost everyone. Can your group spot TWO things that are actually real?" (`MURAL_TASK.question`). The eight options are native checkboxes in full-card labels inside a fieldset (two columns from 22rem; tinted when unpicked, Sumac edge and filled check when picked; the other six disable at two picks, as before). A sticky bar under the cards holds two progress pips, "N of 2 selected", Clear choices, the reply to the last action (e.g. "Not quite. Look again and talk it over.", no answers shown, picks kept) and **Submit Our Answer** (owner's wording) for the answer-submitter or guide only; followers see "Talk it over…". The mural story text is a size larger for reading aloud, with mono evidence labels. Answer key, validation, scoring, rewards, roles and the reveal are unchanged; the server messages are unchanged.
- **Bottom navigation (Map, Mission, Food, Group):** `PreviewShukNav` is fixed to the foot of the screen (4rem + safe area; `--shuk-nav-offset` on the page lifts the mission sheet and the mural submit bar above it). State lives in one `ShukNavState` (`lib/amazing-shuk/shuk-navigation.ts`, tested): Map returns to the overview (Leaflet view kept), Mission returns to the last opened mission screen or shows "No mission open yet" with a Go to the map button, Food (`PreviewFoodRewards`) shows the shared token balance and a Draft-tagged gap (no offers approved), Group (`ListGroupOverview`) shows missions completed, points, tokens and everyone with avatar and roles. Each screen change is a history entry (phone Back steps back) and is kept in `sessionStorage` for refresh. Shared progress and picks stay on the server; the well's local pour selection survives tab switches. New icons `map` and `food`. Draft labels: "Map", "Mission", "Food", "Group", "No mission open yet", "Choose a mission on the map, then open its location.", "Go to the map", "Missions completed", "You", and the food gap line.
- **Verified** in a clean container: `test:shuk` 93/93, `npm test` 61/61, `tsc` pass, Shuk lint clean, changed Sass compiles; all three photos return 200 on the dev server, directly and through the image optimiser. The dev server's `.next/` must not be deleted while `shuk-dev` runs; the check container mounts its own.

## Earlier handoff - standard mission journey, 24 Oct 2026

Owner asked for one journey for every mission: Map → Preview → Location details → optional We're Here? → Open Challenge → rewards → Map. Implemented for both missions; each challenge's own interaction is unchanged.

- **Data:** `MissionDefinition` (`lib/amazing-shuk/mission-arrival.ts`) adds `title` (the challenge title) and `location` (`hebrewName`, `summary`, `landmarks`). Gan HaTut: Hebrew tour stop 5, plus landmarks from research run 06, row 5 (marked verified): between Hermon, Carmel and Gilboa lanes, and the Yossi Banai "Picture in Stone" plaque at 3 Gilboa St. Mural: Hebrew tour stop 8, plus landmarks from the English tour stop 8, the owner-confirmed corner and run 06, row 12 (view from the pavement). The summary lines are drafts for owner review.
- **UI:** `IndexWaterTask` keeps `stage` (`map | preview | location | challenge`) and the map's last view (`initialView`/`onViewChange`), so Back to map returns to the same position. New `PreviewMissionCard` is the compact first-tap bottom sheet (sticky, closeable), with no story, question or answers. `PreviewArrivalMission` is now the location view: photo or gap notice, English and Hebrew names, area, summary, "Look for" (the existing clue), landmarks, We're Here?, guide confirmation, **Open Challenge** and **Back to map**. The challenge view adds Back to location and Back to map.
- **Arrival copy** is the owner's wording: "You're very close! Look around for the destination." / "Not quite there yet. Use the picture and landmarks to find your way." / "We couldn't check your location. No problem—you can continue." (constants in `mission-arrival.ts`).
- **Mural before photo** moved from the brief to the completion reveal, so it can't hint before the answer. Its photographer and rights are still not recorded.
- **Gaps:** neither mission has an approved location photograph; both show "Reference photograph not yet available." The mural needs one that doesn't show the painted details. Gan HaTut's GPS point is still unverified, so its We're Here? shows the friendly fallback. No locked missions exist, so no locked state was added. New UI labels ("Look for", "Landmarks", "Back to map", "Back to location", "Close preview") are drafts.
- **Dori:** `.claude/agents/dori-ux-designer.md` "Maps and location" now starts with the owner's journey principle and the stage rules.
- **Verified** in a clean container: `test:shuk` 82/82 (new tests: the compact card for both missions without story or answers; the mural location view names the corner without answers; the reveal appears only after completion), `npm test` 61/61, `tsc` pass, all changed Sass modules compile, lint unchanged. The running dev server (`127.0.0.1:3300`) reloaded and serves the page (HTTP 200). **Not checked in a browser or on a phone:** layout of the bottom sheet over the map, scrolling, the map's returned position, and back navigation are for the owner to check.

## Earlier handoff - mural challenge, first slice, 24 Oct 2026

Owner chose the mural, "Is It Real or Is It Painted?", as mission 2 (the twelve-tribes door is postponed). Claude built a first slice on the per-mission state (`7fa1eea`, committed locally, not pushed). This slice is committed locally too (not pushed).

**Built**
- Generic "choose N" challenge, `lib/amazing-shuk/choice-task.ts`: shared picks, toggle with catalogue order and an N limit, and deterministic `evaluateChoice` (`accepted`, `incorrect`, `incomplete`, `unverified`).
- Mural content and mission, `lib/amazing-shuk/mural-task.ts`; catalogue order is now well, then mural.
  - Story: two lines, 35 words, from the English tour, Stop 8. "In 2001, CitéCréation in Lyon…" is labelled Historical fact; the cardboard-box anecdote is labelled Attributed tradition.
  - Question: the owner's own wording, "Find 2 things on this wall that are real, not painted."
  - Hints: the tour's three questions, verbatim.
  - Eight sourced options, each recording its source and whether it's real.
- Store: mission records carry `kind` (`water` with `cups`, `choice` with `selected`). Schema-5 records without `kind` load as the well.
  - New mission action `toggle-choice` (needs `missionId`). Followers may change the shared picks; only the answer-submitter or guide submits, and guide approval can't bypass the key.
  - Timing is invisible, as for the well: the clock starts on an authorized Start and stops on the accepted submission.
  - Rewards and the hint limit now come from each mission definition (`rewards`, `hintCount`); `awardWaterPerformance` takes the config.
- UI: `IndexWaterTask` now tracks the previewed mission (`missionId`), polls `?mission=`, and opens the well or the mural by the record's `kind`. New `ListMuralTask`, `PreviewMuralTask` and `PreviewMuralStory`; the styles `@forward` the well's modules. Options are `aria-pressed` buttons with a check mark (not colour alone), and there's a "Clear choices" reset. The map now shows marker 2.
- Verified in a clean container: `test:shuk` 79/79 (13 new across `mural-task`, `mural-mission-integration` and `mural-task-ui`), `npm test` 61/61, `tsc` pass, both new Sass modules compile, lint unchanged. Not checked in a browser or on a phone.

**Gaps, all deliberate**
- **Answer key field-checked by the owner, 24 Oct 2026: `answerKeyVerified: true`.** Real: the air vents, the plaque left of the shop, the blue treble-clef sign. Painted: the "103" tile (as Israel Post's "103 call centre" says; the ideas file was wrong), the antenna phone, the cardboard boxes, the bicycle, the laundry. Any two of the three real items are accepted; any painted pick is wrong. The server now scores submissions (provisional well rewards). The unverified-key path stays, tested with an override, for future missions. Not in the list, as ambiguous: the real blinds and railings repainted to match (S1) and the balconies (Rafi Kfir: painted balconies blend with real ones).
- **Before photo in the brief (owner's request, 24 Oct 2026):** the owner's black-and-white photo of the bare wall at the corner, before the mural, is shown at the top of the story. The original is `design/inputs/photos/no-faces/HaRav Shmuel Baruch and Sha'arei Tzedek._before _mural.png`; the app serves a 270 KB greyscale JPEG copy, `public/shuk/mural-before.jpg`. It shows no part of the mural, so the mural-rights rule doesn't apply, but the photographer, date and reuse rights are not recorded; the owner committed it locally; confirm them before pushing, since `public/` is versioned. The first story line now reads "This wall was once bare. In 2001, artists from CitéCréation in Lyon painted Jerusalem's market onto it." (Historical fact: S1, "a bare concrete wall", and the photo). The story is now 36 words.
- **No mural image anywhere**, preview included: rights are unresolved (`product-decisions.md`), and a photo would show the answers.
- **Location confirmed by the owner (24 Oct 2026): the corner of HaRav Shmuel Baruch St and Sha'arei Tzedek St.** Neighbourhood and clue text now say so. The GPS destination is OpenStreetMap's junction node for the two streets, 31.7857892, 35.2087861, which the owner confirmed on a map the same day: `verified: true`, so "We're Here?" now checks the reading (100 m radius, provisional limits) and can award the provisional 20-point arrival bonus once. Never a gate; guide confirmation still works. Not yet tested on a real phone over HTTPS. The illustrated-map marker is unchanged: neither street is labelled on the candidate map.
- **The marker is a manual guess** (480, 478) on Agripas St, flagged unverified.
- **Rewards are a provisional copy** of the well's values (`MURAL_REWARDS`), including the 20-point arrival bonus. Owner approval needed.
- **Draft copy for owner review:** the two story lines, the option labels, the marker name "Market Mural", and the UI lines "Talk it over…", "Clear choices", "Choices cleared.", "Not quite. Look again and talk it over." and the draft-key notice.
- **New source, not yet in the research files:** [Rafi Kfir, "ציור הקיר ברחוב אגריפס"](https://www.nahlaot.co.il/%D7%A6%D7%99%D7%95%D7%A8-%D7%94%D7%A7%D7%99%D7%A8-%D7%91%D7%A8%D7%97%D7%95%D7%91-%D7%90%D7%92%D7%A8%D7%99%D7%A4%D7%A1.html), read 24 Oct 2026. It adds: painted on canvas glued to the wall; a Lyon group active since 1978 with 11 members (run 07 says 12 artists, founded 1983); initiated by the municipality and the Ministry of Tourism. CitéCréation's project page adds nothing on real vs painted.
- `IndexWaterTask` now hosts both missions; renaming it (e.g. to `IndexShukGame`) is a later clean-up.

## Earlier handoff - Dori UX designer updated, 24 Oct 2026

With the owner's explicit approval, Claude updated `.claude/agents/dori-ux-designer.md` in place (same name, frontmatter and tools; still writes only to `design/output/`).

- **Kept:** role, the eight design principles, brand table and don'ts, the Memory Protocol separation, working rules, deliverables 0-12 and output rules. Each was extended rather than replaced.
- **Added:** a "Sources of truth" section that defers to `product-decisions.md`; the one-group game model and roles; the challenge design loop (Discover → Understand → Tell → Play → Validate → Reward → Refine); Hebrew-first storytelling; "Measure quietly, motivate gently, celebrate visibly"; map, preview and **We're Here?** rules; avatar and role display; observation-challenge rules (field-verify answers, no answer in the preview, rights before showing artwork); a "real or painted?" and a manipulation-puzzle component type.
- **Changed to match decisions:** "scores stay hidden until the end" now means no live score, timer or comparison during play, with one calm completion display; the "team setup" flow is now group roles; map stops are selectable instead of unlocking one by one.
- **Split with Codex:** Dori owns story, interaction clarity, mobile usability and accessibility; `docs/design/codex-amazing-shuk-partner.md` owns mechanics, feasibility, implementation and tests. Both defer to `product-decisions.md`.
- **Open conflicts for the owner** (not resolved here):
  - The Codex partner doc still says "keep scores hidden until the end", and the well screen shows a running "Group points / Food tokens" bar during play.
  - There are no nicknames yet: the roster is fixed ("Player 1-7", "Guide"), so avatars show display names.
  - Resolved: the mural challenge shows no image of the mural; its brief shows the owner's photo of the bare wall from before the mural.
  - Resolved by the owner's field check: the "103" tile is painted (Israel Post was right, the ideas file was wrong).
  - `docs/design/dori-brand-to-ui.md` points to two paths that don't exist in this repo (`docs/design/Dori_Brand/`, `docs/GPT_DORI_UI_Designer_Brand_to_Screen_Prompt(1).md`); the brand book is at `design/inputs/brand/DORI_Final_Brand_Book.pdf`.

## Earlier handoff - Claude review of Codex work, 24 Oct 2026

Claude (Claude Code, on the VPS checkout `/root/projects/The-Amazing-Hunt`) reviewed everything from `969ae8d` (Claude's last commit) to `ca9cf1e`, read-only, then fast-forwarded the VPS checkout to `ca9cf1e` at the owner's request. No code, decision, roadmap or designer file was changed; this section is the only edit. The owner's uncommitted Memory Protocol edits on the VPS (`docs/HANDOFF.md`, `docs/RUN_PREVIEW.md`) are unrelated to Shuk; leave them.

### Verified on the VPS (throwaway `node:22-alpine` container, clean `npm ci`)

- `npm run test:shuk`: 64/64 pass. `npm test`: 61/61 pass. `npx tsc --noEmit`: pass.
- `npm run lint`: 3 errors, all in `design/prototypes/amazing-shuk-team-format/prototype.test.cjs` (`no-require-imports`), plus 11 older `<img>` warnings in Memory Protocol components. Matches your report.
- Not checked: browsers, phones, screen readers, the Line Face CC0 entry in the DiceBear styles `LICENSE.md` (still only your record).

### Findings for Codex, in priority order

1. **Every poll rewrites the state file.** `sessionView` (`lib/amazing-shuk/participant-store.ts:86`) runs inside `transact`: it takes the exclusive lock and rewrites `state.json`. `IndexWaterTask` polls every 1.5 s per browser, so eight players plus the guide is about six full writes a second. Concurrent moves will get 503 "Storage busy" and polls will show "unavailable"; a crash during any poll leaves the stale lock that blocks everyone. Current tests use one or two identities, so they don't show it.
2. **Two-move solution.** Because the jar holds exactly 4 L, "fill 5 L, pour into jar" solves it (`water-measurement.test.ts:43` asserts it). The hints describe the 2 L + 2 L route. Owner decision pending; don't change the rule without it.
3. **Well story wording** (facts are faithful, nothing invented): the source (`HE_trans.txt` 54-66) is a rainwater cistern fed from gutters (בור מים), but the UI says "well"; line 2 answers line 1's "punishment or honor?" at once, losing the guide's "מה אתם חושבים?" pause; "dubious honor" (כבוד מפוקפק) and the Yossi Banai attribution appear only in collapsed source notes; the title "How many families share the water?" doesn't match the challenge; the three tiers of water use (drinking, washing, floors) are unused. Owner decision pending; not a rewrite request.
4. **No phone can reach the game.** The loopback gate reads the Host header, so it is safe only while `next dev` is bound with `--hostname 127.0.0.1` (the default binds all interfaces). Production stays closed via `NODE_ENV=production` in the Dockerfile. GPS/mobile acceptance waits on an approved boundary.
5. **One mission is hard-wired.** The store holds single `group.cups`, `performance` and `arrival` records, with no per-mission keys, so a second mission can't be added as is.
6. **Smaller items:** `ListParticipantIdentity` shows raw role IDs to players ("Your role: navigatorAndAnswerSubmitter"); expired sessions and the `applied` receipts are never pruned; the running "Group points / Food tokens" bar conflicts with "scores stay hidden until the end" in both designer files.

### Documentation conflicts noticed (not edited)

- `current-state.md` still calls the GPS slice uncommitted; `ca9cf1e` committed it.
- `AGENTS.md` says `npm test` runs the tests but leaves out `npm run test:shuk`, and copies content/coding rules that also live in `.claude/rules/` (drift risk). Scoring values are repeated in four documents.
- Encoding damage from Windows: `?` instead of a dash in several headings (this file, `current-state.md`, the roadmap) and `â€œ`/`â€` in `AGENTS.md`.
- `design/output/01_assumptions.md` §1.7 still names NextAuth/Auth.js, superseded by the invitation-link decision.
- `.claude/agents/dori-ux-designer.md` (protected; owner approval needed to edit) still lists a "team setup" flow and "stops that unlock one by one", both superseded by the one-group, no-prerequisite decisions. Until the owner approves an edit, brief that designer on the decisions explicitly.
- `.claude/rules/content.md` doesn't mention the owner's Hebrew-first adaptation exception recorded in `product-decisions.md`.

### Claude's planned next changes (proposed; waiting for the owner's go-ahead)

1. **Read-only session view: done, pushed as `61996f8`.** `participant-store.ts` now has one `load()` (read plus in-memory migration) shared by `transact` and `sessionView`; `sessionView` takes no lock and never writes. Readers rely on the existing atomic rename. A legacy file read by a poll stays on disk until the next write migrates it. New test "polling reads take no lock…" in `participant-store.test.ts`: a held lock doesn't block reads, a read leaves the file byte-identical, and 24 polls alongside a move all succeed. It fails on the old code with "Storage busy". Verified in a clean container: `test:shuk` 65/65, `npm test` 61/61, `tsc` pass, lint unchanged (the 3 prototype errors). Pruning of expired sessions was dropped from this change: tests use synthetic clocks, so pruning by wall-clock time inside `transact` would delete their credentials; it needs its own small change. Not checked on Windows, where a rename over a file that is open for reading could behave differently; please run `npm.cmd run test:shuk` there. No auth, cookie or protocol change.
2. **Per-mission state: done, committed locally (not pushed).**
   - Schema 5 in `participant-store.ts`: group-wide `roles`, plus `missions[id] = { cups, completed, arrival, performance }`. Schema 1-4 files migrate in `load()`; the well's record goes under `water-measurement-family-jar` unchanged (tested byte-for-byte against the record before conversion). As with item 1, reads migrate in memory and the next write persists the result.
   - Catalogue: `lib/amazing-shuk/missions.ts` (`SHUK_MISSIONS`, `findMission`). A newly listed mission gets an empty record. A record whose mission is no longer listed is kept, can't be acted on, and its rewards still count in `sharedBalance`, which now sums every record.
   - Actions: `lib/amazing-shuk/group-action.ts`. `assign-role` (and the rejected `switch-actor`) are group-wide; move, start, hint, timing, submit, guide-approve and reset must carry `missionId`. `parseAction` returns `null` without it (HTTP 400). An unlisted mission is rejected (403). Protocol revision `WATER_PUZZLE_REVISION` is now 5: **refresh every browser profile**, because old queued actions are rejected (422) as with earlier bumps.
   - View: `sessionView(path, token, now, missionId)` and GET `?mission=` return `missions` (one summary per catalogue entry) plus the selected mission's `mission`, `session`, `performance` and `guideTiming`, in the same shapes as before. POST responses return the acted-on mission.
   - Map: `MissionDefinition` (adds `shortName`) and `buildMissionPresentation(definition, view, order)`. `ListArrivalMission` draws one marker per catalogue mission, so its marker labels and copy are unchanged for Gan HaTut. `IndexWaterTask` still plays only the well (`WELL_MISSION_ID`) and ignores taps on other markers until a second mission has its own challenge UI.
   - Records stay water-shaped (`cups`). Mission 2 must add its own progress shape as a tagged union in `MissionRecord`, rather than reusing `cups`.
   - Tests: new `legacy-store-fixture.ts` rebuilds schema-4 files for the migration tests; two new store tests cover migration, unknown/missing mission IDs and isolation of other records. Verified in a clean container: `test:shuk` 67/67, `npm test` 61/61, `tsc` pass, lint unchanged. Not checked in a browser or on Windows.
3. **Mission 2: the mural challenge**, "Is It Real or Is It Painted?" (owner decision, 24 Oct 2026; the twelve-tribes door is postponed). Its own progress shape on the per-mission state; only a verified answer and approved copy; gaps marked `TODO(copy)`.

Codex: if you start any of these first, record it here so we don't overlap. Claude won't touch `docs/design/codex-amazing-shuk-partner.md` and won't commit, push or deploy without the owner.

## Earlier handoff - optional GPS map slice, 24 Oct 2026

**Current owner rule supersedes earlier GPS-unlock and no-GPS plans:** location assistance encourages exploration and never gates participation. Button is **We're Here?** (question mark intentional). Story/puzzle are available immediately after mission selection; all normal challenge rewards work without location or bonus. Read [decisions](product-decisions.md), [current state](current-state.md), [well/map record](water-task.md) and [roadmap](../../design/amazing-shuk-roadmap.md); older checkpoint below is historical.

### Implemented

- Reused illustrated Leaflet renderer at the existing opt-in loopback-only water page. One Gan HaTut mission uses existing water task ID and story/puzzle, no duplicate challenge. Marker/list selection, destination/clue preview, shared Available/Arrival confirmed/Completed labels and1/diamond/check symbols;48px Shuk targets. Missing photograph explicitly reported, no unrelated substitute.
- One-shot optional getCurrentPosition request, fresh reading, friendly feedback, no watcher/dot/georeferencing/routing. Server validates authenticated session, mission ID, finite coordinates/accuracy/timestamp, freshness and Haversine center distance. Configurable100m radius/50m max accuracy/60s age/5s future tolerance, all provisional. GPS reading never persisted or offline-queued.
- Separate configurable20-point group bonus under existing JSON lock, once across participants/retries/concurrent guide confirmation. Guide-only Confirm Group Arrival; no food tokens on arrival. Normal challenge reward remains separate and can happen first. Shared score is arrival plus challenge points; challenge food tokens unchanged.
- Schema/action revision4 adds optional `{method,acceptedAt,points}`; prior sessions/cups/performance/rewards preserved with no fabricated arrival reward. Refresh browsers to drop stale protocol actions; old local queue keys remain isolated. No auth rewrite, new dependency, production gate change or deployment.

### Important limitations / next smallest acceptance

**Real GPS approval remains disabled:** published candidate31.7834802,35.2128322 is not field-confirmed. Source, investigation and explicit `verified:false` are in the well/map record. Button currently gives friendly fallback without GPS prompt. Owner must confirm actual destination coordinate/usable50m accuracy before enabling bonuses from real readings. Guide confirmation already works and gameplay is unaffected.

No documented illustrated Gan HaTut placement was found: manual point(600,650) is provisional and marked approximate. No identified current garden photograph exists in available index/local photo assets; supply/approve the correct photo and review the pin. Existing illustration's wrong labels/provenance remain documented. Do not substitute a different courtyard or treat map pixels as GPS.

Next: owner checks selecting marker/text preview, immediate story/puzzle without location, guide-only confirmation, shared20-point bonus, authorized solve and combined rewards across two browser profiles. Confirm missing photo/pin/real coordinate, then test optional location on a real phone over HTTPS behind an approved boundary. Preserve loopback-only development gates; no VPS deployment. Afterwards select one next researched task; no additional task implemented during this focused slice.

### Verification actually run

- `npm.cmd run test:shuk`: **64 passed,0 failed** (15 new arrival/map tests).
- `npm.cmd test`: **61 passed,0 failed**, including existing map geometry/state helpers.
- `npx.cmd tsc --noEmit`, targeted ESLint for changed code/tests, and compilation of both changed Sass files: **pass**. `git diff --check`: pass;94 relative documentation file links resolve. Existing unrelated full-lint prototype errors are not addressed; full lint not rerun for this slice.
- New tests cover100m boundary/outside/invalid/stale/future/inaccurate readings, mocked permission denial/unavailable/timeout, no-GPS challenge completion, guide authorization, duplicate and concurrent reward requests, shared balances, separate bonus/challenge awards, fresh-process persistence without stored coordinates, schema3 migration, actual static story/puzzle rendering independent of GPS state, and question-mark button copy.
- These are unit/mocked browser/handler/static rendering checks, **not actual phone GPS, two live browsers or visual/accessibility acceptance**. No build over active development output, screenshots, commit/push or deployment.

### Exact changed files and preservation

- UI: `components/amazing-shuk/dev/IndexWaterTask.tsx`, new `ListArrivalMission.tsx`, `PreviewArrivalMission.tsx`, `PreviewArrivalMission.module.scss`.
- Shared renderer: `components/map/LeafletBaseMap.tsx`, `LeafletBaseMap.module.scss`; neutral image geometry new `lib/map/image-map.ts`; `lib/game/basemaps.ts` re-exports identical geometry so Memory Protocol API/default styling stays compatible.
- Domain/store: new `lib/amazing-shuk/mission-arrival.ts`, `request-arrival-location.ts`; changed `participant-store.ts`, `parse-water-action.ts`, `dev-water-session.ts`, `water-measurement.ts`.
- Tests: new `mission-arrival.test.ts`, `mission-arrival-integration.test.ts`, `mission-arrival-ui.test.ts`; existing `participant-store.test.ts` now uses current revision constant. Existing gameplay tests still run with no arrival prerequisite. `water-performance-integration.test.ts` may show a line-ending-only modification; its behavior is unchanged.
- Docs: this handoff, decisions, current-state, roadmap, existing Codex designer guidance, water-task record and existing content index. Claude UX designer file untouched. No package/lockfile or map asset changes.
- Owner committed previous checkpoint as `5d6d595`. Working tree was clean at start of this slice; current changes are uncommitted. Latest request is handoff plus a commit message only; no stage/commit/push performed.



## Resume here ? verified checkpoint, 24 Oct 2026

Read [decisions](product-decisions.md), [current state](current-state.md), [roadmap](../../design/amazing-shuk-roadmap.md), then relevant [content/topic index](../../design/inputs/content/README.md). Claude discovery/index: [00_discovery](../../design/output/00_discovery.md), [01_assumptions](../../design/output/01_assumptions.md). Do not reread broad research unnecessarily. Older entries below are history; this checkpoint supersedes stale environment/count/priority notes.

### Milestone and decisions

One local playable well challenge with self-hosted manual invitation sessions, one persisted shared group, contextual3/5/4L gameplay, Hebrew-first story, invisible timing, shared hints and one-time provisional rewards. Current identity and navigator/submitter displays now use local deterministic avatars. Not a deployed Shuk game or six verified tasks.

Gameplay is next priority; six independently verified playable tasks initially, ten ideal. Everyone shares progress/points/food tokens; navigator and submitter may coincide. Email magic links/SMTP and further authentication are deferred, not a rollback of implemented manual single-use invitations. No UX-designer file edits without explicit approval; no deployment authorized. Approved/deferred/superseded distinctions are canonical in decisions.

### Latest implementation and exact avatar files

- `lib/amazing-shuk/participant-avatar.ts`, `participant-identity.ts`, `participant-avatar.test.ts`, `participant-avatar-ui.test.ts`.
- `components/amazing-shuk/ParticipantAvatar.tsx`, `ParticipantAvatar.module.scss`, `PreviewParticipantIdentity.tsx`, `PreviewParticipantIdentity.module.scss`, `ListParticipantIdentity.tsx`, `ListParticipantIdentity.module.scss`.
- Integration: `components/amazing-shuk/dev/IndexWaterTask.tsx`. Dependencies: `package.json`, `package-lock.json`. Guidance: `docs/design/codex-amazing-shuk-partner.md` now carries the requested concise identity principle.
- Owner installed pinned DiceBear core10.7.0 (MIT) and styles10.6.0; selected Line Face (CC0 per installed styles LICENSE.md). SVG generated locally as data URI from immutable ID, stable across nickname/session changes; custom-image then generated then initials fallback. No generated-image files, JSON migration or remote default calls. Existing roster has no full profile/gallery; integration covers current identity and assigned roles, merging dual-role rows.
- Brand: `design/inputs/brand/DORI_Final_Brand_Book.pdf`, `docs/design/dori-brand-to-ui.md`, existing CSS tokens/fonts. SVG color API requires three exact approved hex values in one tested adapter; component styling uses CSS variables. Avatar shape/style choice and rendered phone readability await owner visual review.

### Actual checkpoint verification

- `npm.cmd run test:shuk`:49/49 pass, including eight avatar/identity cases; authenticated cookie jars, JSON reopen, guide roles, water solution/reset/max transfers, synchronized/retried actions, invisible timing, hint races, score boundaries and duplicate-reward protection remain covered.
- `npm.cmd test`:61/61 pass, including14 basemap/missionMap/playerMap tests. No browser/field map verification implied.
- `npx.cmd tsc --noEmit`: pass. Targeted ESLint over avatar utility/view models/tests/components and IndexWaterTask: pass. `npm.cmd run lint` still fails on three existing `no-require-imports` errors in `design/prototypes/amazing-shuk-team-format/prototype.test.cjs`, with eleven existing warnings elsewhere; no new avatar errors. Node's non-failing MODULE_TYPELESS_PACKAGE_JSON warning remains.
- Final documentation checks: all five shared files exist;38 local links resolve; `git diff --check` passes. SHA-256 preservation comparison confirms only the five intended documentation files changed during checkpoint; no dirty implementation file, dependency file, editorial research or Claude UX-agent bytes changed. Documentation write/delete probe succeeded.
- Owner previously reported Next16.3.8 Ready, water HTTP200 and working puzzle mechanics. Separate real browser identity/refresh/relogin, queued reconnect, avatars, mobile/screen-reader acceptance and production HTTP404 are still unverified end-to-end. No build over active development output, browser/screenshots, live VPS, commit/push/revert or deployment during checkpoint.

### Map discovery ? no implementation approval

Leaflet1.9.4 renderer `components/map/LeafletBaseMap.tsx` uses CRS.Simple/image pixels; `app/dev/map/page.tsx`/IndexMapPreview and mission components belong to Memory Protocol. Placements/geo/external OSM/Google links live in `lib/game/basemaps.ts`; only two image placements, only synagogue geographic coordinates (unverified). No browser geolocation/current-position marker/recenter or geographic-to-image transform. Map completion is local prototype state, not Shuk JSON. Do not reuse Memory Protocol narrative/unlock policy.

Existing [map audit](../map/nahlaot-map-audit.md) documents approximately60m geographic fit error. Recommended prerequisite is independent geographic registration validation before Find My Location. Optional navigator GPS should remain device-local, requested on tap, with accuracy/error/manual fallback; no server tracking, GPS completion/unlock or all-participant permission requirement.3-5 available task/reveal UX is proposed, not approved policy. Real-phone testing must preserve loopback gates (e.g. Android USB forwarding) or use a separately approved secure boundary. No map code/dependency changes during discovery.

### Preserve unfinished work / blockers

Everything below is cumulative uncommitted work; most predates this checkpoint and cannot safely be attributed from Git alone. Do not reset/clean/overwrite it. Preserve owner package-lock metadata changes and `design/inputs/content/DORI_Five_Stories_Editorial_Research_Review.md` (unrelated editorial work, not reviewed or edited here). `roles.ts`/test may appear modified without semantic diff due to line endings.

Previous avatar dependency commit attempt was blocked by read-only Git index permissions; no commit exists. This checkpoint authorizes no commit. An ignored `.local/avatar-dependencies.patch` may remain as a preparation artifact; `.local/` also holds private runtime credentials/progress and must never enter Git. Do not read .env files or expose invitation/session tokens.

JSON stale-lock recovery, production isolation/HTTP acceptance, VPS backups/power-loss durability, real enrollment, field coordinates/image provenance, food pricing/vendor verification and full mobile acceptance remain open. No new auth system, scoring framework or GPS infrastructure needed.

### Next smallest iteration and acceptance

First close owner acceptance of the current well/identity slice: two browser profiles use distinct single-use invitations, retain distinct identity/avatars after nickname-independent relogin/refresh, see common roles/puzzle/hints, and receive identical points/tokens once after authorized completion. Test dual-role display, fallback, narrow-screen wrapping, keyboard, return-water sequence and queued reconnect. Do not reset existing finalized records casually.

Then select one next sourced playable task from the existing index; record missing approved copy/answer/reward rather than inventing it. Test one full deterministic solution and backend roles/shared rewards. Navigation changes require owner approval first; recommended first navigation work remains geographic registration feasibility, not a misleading GPS dot.

### Exact cumulative dirty-file inventory at checkpoint

This inventory records the whole working tree, not files edited solely during this checkpoint. M=tracked modification; ??=untracked. All must survive a new session.

```text
 M .gitignore
 M app/api/amazing-shuk/dev/route.ts
 M components/amazing-shuk/dev/IndexWaterTask.module.scss
 M components/amazing-shuk/dev/IndexWaterTask.tsx
 M components/amazing-shuk/dev/PreviewWaterTask.tsx
 M design/amazing-shuk-roadmap.md
 M design/inputs/content/README.md
 M docs/design/codex-amazing-shuk-partner.md
 M docs/project/agent-handoff.md
 M docs/project/current-state.md
 M docs/project/product-decisions.md
 M lib/amazing-shuk/dev-water-session.test.ts
 M lib/amazing-shuk/dev-water-session.ts
 M lib/amazing-shuk/roles.test.ts
 M lib/amazing-shuk/roles.ts
 M lib/amazing-shuk/water-measurement.test.ts
 M lib/amazing-shuk/water-measurement.ts
 M next.config.ts
 M package-lock.json
 M package.json
?? components/amazing-shuk/ListParticipantIdentity.module.scss
?? components/amazing-shuk/ListParticipantIdentity.tsx
?? components/amazing-shuk/ParticipantAvatar.module.scss
?? components/amazing-shuk/ParticipantAvatar.tsx
?? components/amazing-shuk/PreviewParticipantIdentity.module.scss
?? components/amazing-shuk/PreviewParticipantIdentity.tsx
?? components/amazing-shuk/dev/IndexGuideWaterTask.module.scss
?? components/amazing-shuk/dev/IndexGuideWaterTask.tsx
?? components/amazing-shuk/dev/ListWaterTask.tsx
?? components/amazing-shuk/dev/PreviewWaterTask.module.scss
?? components/amazing-shuk/dev/PreviewWellStory.module.scss
?? components/amazing-shuk/dev/PreviewWellStory.tsx
?? design/inputs/content/DORI_Five_Stories_Editorial_Research_Review.md
?? docs/project/local-participant-login.md
?? docs/project/water-task.md
?? lib/amazing-shuk/parse-water-action.ts
?? lib/amazing-shuk/participant-avatar-ui.test.ts
?? lib/amazing-shuk/participant-avatar.test.ts
?? lib/amazing-shuk/participant-avatar.ts
?? lib/amazing-shuk/participant-http.ts
?? lib/amazing-shuk/participant-identity.ts
?? lib/amazing-shuk/participant-store.test.ts
?? lib/amazing-shuk/participant-store.ts
?? lib/amazing-shuk/water-hints.ts
?? lib/amazing-shuk/water-participant-ui.test.ts
?? lib/amazing-shuk/water-performance-integration.test.ts
?? lib/amazing-shuk/water-performance.test.ts
?? lib/amazing-shuk/water-performance.ts
?? lib/amazing-shuk/water-task-view.test.ts
?? lib/amazing-shuk/water-task-view.ts
?? lib/amazing-shuk/water-task.ts
?? scripts/shuk-invite.ts
```

## Earlier session history (superseded where noted above)

# Amazing Shuk — Shared Claude/Codex Handoff

**Last contributor:** Codex · **Session date:** 24 Oct 2026

## Latest owner priority

Implement minimal self-hosted, manually distributed single-use invitation login: separate browser sessions, one shared group, local JSON, backend roles, no external auth provider/SMTP, no production deployment. This supersedes deferred Auth.js/email planning. Prove identities share progress, then resume playable market challenges. Do not repeat content research/planning.

## Work completed this iteration

- Confirmed repository path, `main`, clean starting Git status and actual workspace write/read/delete access. Read CLAUDE.md, Claude rules, approved decisions, roadmap, current state, shared handoff, content discovery index and installed Next route/cookie documentation. No separate Shuk Claude topic-memory index was found in available paths. Claude agent files remain untouched.
- Added local JSON auth/group storage, 256-bit hashed tokens, 24-hour one-use invitations, seven-day sessions, logout and atomic browser-session replacement. CLI is the only invitation issuer. Fixed guide/seven-player development roster remains; no real names or external delivery service.
- Replaced process-global shared actor and unauthenticated writes with session-bound reads/actions. Roles are backend-enforced. Persona switching fails; guide alone assigns roles/approves/resets; answer-submitter alone submits. Shared identity is never persisted as group state.
- Kept existing page/API development+opt-in+loopback gates. No production access, proxy change, deploy, commit or push.
- Connected water challenge #24 to persistent authenticated shared progress; separate guide feature; client queue/retry with server idempotency and expected-identity checks. No new claims or rewards.

## Files

- `lib/amazing-shuk/participant-store.ts`, `participant-http.ts`, `parse-water-action.ts`, `participant-store.test.ts`
- `scripts/shuk-invite.ts`; `package.json` adds `shuk:invite` and `test:shuk` (no dependency changes)
- `app/api/amazing-shuk/dev/route.ts` delegates to the authenticated handler
- `components/amazing-shuk/dev/IndexWaterTask.tsx`, `IndexGuideWaterTask.tsx`, `PreviewWaterTask.tsx`
- `.gitignore` excludes `.local/`; private JSON defaults to `.local/amazing-shuk/state.json`
- Shared current state, product decisions, roadmap and [local login runbook](local-participant-login.md)

## Actually verified

- **17 Shuk tests passed**, including two independent cookie jars retaining different participant identities while reading/mutating the same cups and completing exactly 400 ml. New Node process reopens and reads the same persisted identity/progress.
- Tested single-use and reissued invitations; expiration; forged sessions; logout/replacement; guide authorization; forbidden persona switching; submitter authorization; concurrent redemption (one success, others fail closed); duplicate-action suppression; identity mismatch; CLI invitation creation; production/opt-out/nonlocal handler 404s.
- **61 Memory Protocol tests passed** (`npm.cmd test`).
- Tests use Web Request/Response handlers by default, not two real browsers. Optional isolated HTTP adapter exists via `SHUK_HTTP_TESTS=1`; it is not the Next server.

## Environment blockers / unverified

- Next 16.3.8 is declared and its package/docs were present, but this checkout's dependency install was incomplete. Do not infer a missing Next dependency from missing next.cmd. `npm.cmd ci` failed with npm internal “Exit handler never called”; offline ci failed ENOTCACHED. No versions/lockfile changed.
- Lint/build were attempted; failed because ESLint/Next executable files are unavailable. No type-check or running Next acceptance completed.
- This sandbox blocks localhost connections (`EACCES connect`); the socket test could not run successfully. Actual two-browser page behavior, cookies through Next, reconnect queue, page/API production HTTP 404 and visual review remain unverified. Do not call the browser milestone complete.
- JSON lock/rename and subprocess persistence pass locally. VPS permissions, backup/restore and power-loss durability are not verified. If a crash leaves a lock, stop every writer before manual inspection/recovery; never steal a live lock.
- Login/task copy remains development draft; real roster, market copy/location/answers/assets and reward amounts are not approved by this work.

## Exact next iteration

Restore dependencies in an environment with permitted package access, run lint/type-check/build, start the loopback-only development Next server and use the runbook to invite player-1, player-2 and guide into separate browser profiles. Confirm each identity stays separate while both see the same cup progress and completion; restart and check persistence; test queued reconnect once; verify production routes 404. Do not deploy.

Then return to playable market challenges using the existing content index: task-to-map flow and six verified task candidates, without inventing approved copy, site coordinates, answer values, photo rights or token costs. Water rewards stay zero. No extensive new planning/research is needed.

## Browser-check follow-up (24 Oct 2026)

The owner reports Next 16.3.8 starts successfully and the water page returns HTTP 200. This supersedes the earlier missing-executable blocker for the owner's current runtime, but does not establish successful login/two-browser behavior. Added `allowedDevOrigins: ["127.0.0.1"]` per the installed Next documentation to fix the reported localhost/127.0.0.1 HMR-origin warning. Restart with `npm.cmd run dev -- --hostname 127.0.0.1` and use the generated 127.0.0.1 invitation URLs consistently.

With dependencies now available, TypeScript exposed narrow roster/environment types and ESLint exposed synchronous invitation state initialization in an effect. Corrected these; invitation capture runs in a cancellable browser callback (safe under Strict Mode). Type-check passed and all 17 Shuk tests passed again. Targeted lint passed for the modified auth/UI/config files; full-repository lint still reports pre-existing CommonJS require-import errors in `design/prototypes/amazing-shuk-team-format/prototype.test.cjs` and existing warnings. The owner's package-lock changes were preserved. No production build was run during the owner's active dev-server review; no deployment or browser milestone completion is claimed.

## Sign-in 403 follow-up (24 Oct 2026)

Owner reported repeated GET 401 and POST 403 during second-browser sign-in. The login handler's 403 guard compared Origin with request.url; installed Next code can derive request.url from the server listening hostname rather than the incoming Host. Changed CSRF comparison to the actual loopback-gated Host with the request scheme, keeping exact origin/port comparison and ignoring forwarded hosts. Added a regression test for normalized localhost URL with 127.0.0.1 Host/Origin, plus rejection of different hosts, schemes, ports and public Host. All 18 Shuk tests pass. Browser confirmation is still pending; invite redemption rejected at the origin guard does not consume the invitation. Reopen a full invitation URL (or generate a new one) to restore the sign-in screen after its fragment was removed from the address bar.

Targeted lint and TypeScript no-emit check also passed after the origin fix. No production build/deployment was performed during the owner's running dev-server check.

## Latest iteration: story-driven family jar (24 Oct 2026)

Owner requested one focused water revision plus explicit Brand Book adherence. Completed this slice, not new market tasks. Preserved existing dirty changes, including package-lock and earlier auth work. Claude's UX designer agent was read for its brand index and not changed.

- Original story found: docs/knowledge/HE_trans.txt lines 60-66; existing English retelling at Machane_Yehuda_Tour_EN.md Stop 5. English wording reused; expandable original Hebrew copied directly from lines 62/64. Read-aloud instruction and question use owner wording. Story labeled Attributed tradition. Once-per-year detail is absent and not invented; transcript's Yossi Banai attribution is not independent verification. Fiction/Puzzle scenario label separates the invented 4-liter ration premise.
- State now liters {small, large, jar}, capacities 3/5/4. Jar cannot be filled from well or poured out. Maximal pours include both vessels to jar. Only jar===4 solves it. Explicit Submit Group Answer is backend-authorized for guide/submitter. Guide cannot override an unsolved jar. Authenticated unfinished reset empties containers and keeps roles/identity/receipts; finalized task cannot reset/re-award. Rewards stay zero.
- Schema migration 1 to 2 preserves credentials, roles and receipts, starts revised puzzle empty. New HTTP actions require puzzleRevision 2; queues use revision-specific keys. Both two-move and classic longer solutions are allowed and tested. Filling 5 then pouring into the 4 L jar is valid under the owner's rules; do not silently impose extra restrictions.
- Index/List/Preview boundary now prepares pure view models. Story opens before puzzle and remembers collapse locally. CSS straight-sided vessels differ in size; Sumac ceramic jar has round body and narrow neck. Shared ActionButton, liters/meters, ready/accepted feedback, disabled reasons and reset; guide role assignment remains a separate feature.
- Brand source read: design/inputs/brand/DORI_Final_Brand_Book.pdf, plus docs/design/dori-brand-to-ui.md, tokens/fonts and shared button. Reused approved Ink/Chalk/Sumac/Za'atar and IBM Plex. No new hardcoded palette or images. Jar/water geometry and layout spacing are implementation interpretations; book does not specify vessel illustrations. See [water task/source/brand record](water-task.md), now indexed from design/inputs/content/README.md.
- Verified 23 Shuk tests, 61 Memory Protocol tests, targeted lint, TypeScript and Sass compilation. Full lint still fails on three pre-existing CommonJS require imports in the isolated prototype, with eleven unrelated warnings. Static responsive/accessibility review only; no browser/screen-reader/screenshot claims. Owner caught an intermediate WATER_TARGET_ML import during live edits; current source has no such import and type-check passes. Refresh/restart if cached error persists.
- Saved revised source/docs as UTF-8; original Hebrew pulled from transcript, not transliterated or rewritten. No production build over the owner's active dev output, no deployment, commit/push or UX-agent edit.

Next: owner browser/mobile acceptance of story collapse, container shapes/volumes, reset, authorized submit and two sessions sharing progress. Existing sessions should survive migration. Then resume documented market task/map work. Do not repeat story research: annual frequency and original Banai passage remain recorded source limits.


## Latest: contextual well UX and existing designer improvement (24 Oct 2026)

Owner reports three-container mechanics work in browser and requests lower cognitive load, then explicitly requests improving docs/design/codex-amazing-shuk-partner.md rather than creating a skill/agent/framework. Read existing guidance, Claude UX principles/content index/Cognitive_Load, approved decisions and the actual Brand Book color/type/restraint sections. Extended existing guidance with one linked seven-step reusable process; preserved mission, responsibilities and boundaries. Corrected its outdated physical-prop preference and Shuk crisis-rubric reference to match approved decisions. Claude UX agent is unchanged; no skill or new agent was created.

Well implementation: native container selection; only contextual Fill / Pour into... / Return water to the well actions; highlighted eligible destination buttons; no permanent grid or invalid-action explanations. Brief uses owner's exact three paragraphs (38 words); challenge is two sentences. Source/original Hebrew remain expandable; historical label unchanged. Hints are optional, progressive (max three), local and retained across reset/revisit. Goal reached feedback and official role-based Submit Group Answer remain. Selection/destination state derives from latest group progress and keyboard focus is restored after changing controls. Brand tokens/IBM Plex/ActionButton retained; no new palette. Phone layout fits three containers from 24rem, stacks below, with responsive illustration sizes and at least 48 px controls.

No auth, synchronization, rewards or storage logic was rewritten. Internal empty-* IDs mean return to well and remain compatible with queued actions. Revision stays 2, no state reset/migration. Existing maximal-pour shortcut remains permitted. Full intended two-round path (seven atomic moves across the six conceptual steps) is tested. File changes: water-task.ts, water-task-view.ts, new water-hints.ts, Index/List/PreviewWaterTask, PreviewWellStory, puzzle styles and associated tests; existing designer/task/index/shared docs updated.

Verified: 30 Shuk tests and 61 Memory Protocol tests pass; targeted lint, TypeScript and Sass/token scan pass. Added backend tests for shared two-round solve and concurrent lock contention/retry that preserves both writes and suppresses a delayed duplicate. Full-lint baseline still has known unrelated prototype import errors; no unrelated files were changed for them. Current mobile/keyboard/screen-reader rendering is not agent-verified. Owner browser acceptance is next. No production build over active dev output, deployment, commit/push or Claude agent edit.


## Latest: invisible timing/rewards plus Hebrew-first well adaptation (24 Oct 2026)

Latest owner steering adds Hebrew-first storytelling while the approved scoring slice was underway; both are implemented. Existing designer guidance was extended, not replaced, with quiet timing/reward rules and the original-to-English adaptation workflow. Product decisions updated first. No new skill, agent, design system or Claude UX-agent edit. Existing dirty package/source work preserved.

- Current story: reread the full HE_trans.txt cistern section, 54-66. Four English paragraphs /40 words capture the distinctive punishment-or-honor question, children's eagerness, rope, narrow opening and cleaning before rains. No annual frequency, named boy or invented quote. Attributed tradition remains; source notes underlying Banai passage absent. Last line invites current gameplay. Collapsed source details retain citations/full original Hebrew in development; production-rendered story uses Source and omits Hebrew body. The actual Shuk production page/API still return 404.
- Current task now requires an explicit Start challenge by navigator/submitter/dual-role participant or guide after the story. Server captures one group start, ignores repeated starts, and freezes solution time on the server-validated jar===4 move. It does not wait for Submit Group Answer. No browser clock, timer/countdown, live points, timeout/failure or leaderboard. Guide-only collapsed timing review shows duration only once stopped, with pause/resume/reset/exclude actions and audit records. Reset timing only retains puzzle/hints/original start. Excluded timing uses maximum base minus hints; scores are immutable after finalization.
- Added water-performance.ts: well-specific configurable provisional 100/90/80 thresholds (<2, 2-4 inclusive, >4 minutes), penalties10/15/20 cumulative, floor40, completion2 food tokens. Not final market pricing or a generic scoring framework. Shared hint events count each of three once across devices/UUID retries; local-only scored hint storage removed. Keep contextual containers/returns/puzzle reset unchanged. Game reset retains clock/hints; guide clock reset is separate.
- One award is committed atomically with authorized finalization under the existing JSON lock. Public performance data contains only started/canStart/hints/reward; raw timing is guide-only. Completion displays Challenge completed!, points/tokens/hints; no live performance score. Receipt retries and repeated final submissions cannot re-award. No new authentication/provider: existing sessions and server role helpers remain.
- Schema/action revision3: schema2 preserves cups/roles/sessions/receipts/completion and adds metadata; no fabricated historical times or retroactive awards. Preexisting unfinished progress starts excluded from timing because earlier effort is unknown. Preexisting completed attempts stay completed without new rewards. Old browser protocols rejected: refresh both profiles. Legacy local hint counts are ignored (no trustworthy shared count). Future attempts use shared server count. Queued start/hint/timing actions use the existing sync machinery; offline measurement reflects server receipt time, so guides can exclude interrupted attempts.
- Verified **41 Shuk tests**, **61 Memory Protocol tests**, targeted lint, TypeScript and Sass/token scan. Checks cover boundary scores, configurable values, pauses/reset/exclusion, solution freeze versus delayed submit, roles, hint races, one-time awards across sessions and fresh process reopen, input filtering/migration, real TSX static rendering without timers/live scores, and Hebrew absent in production rendering. Static UI test uses existing TypeScript/React dependencies, no added package. Known unrelated full-lint prototype errors remain. Browser/mobile/screen-reader and live Next integration remain owner acceptance; no build over active dev output/deploy/commit/push.

Files: water-performance.ts and tests; participant-store.ts action projection/persistence; parse-water-action.ts and action union; water-measurement.ts revision; Index/List/PreviewWaterTask and guide controls; PreviewWellStory; story data; related tests and the existing guidance/decision/task/index/handoff documents. Source/economy/migration policies and limitations are consolidated in docs/project/water-task.md.

Next: owner refreshes an unfinished local group, reads/adapts story, starts explicitly, requests hints from two profiles, solves then delays authorized submission; verify same achievements everywhere. Existing completed records are intentionally not reset/retro-awarded. No live VPS access or production Shuk boundary was added. Host wall-clock changes, offline receipt delays, power-loss durability and rendered mobile acceptance remain documented limits.
