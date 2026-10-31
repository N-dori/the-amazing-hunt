# The Amazing Shuk — Current Implementation State

**Updated: 31 Oct 2026 (Claude).** **Live since 30 Oct 2026, 23:55 UTC: `0c03a61`** (B-lite mission discovery: destination-first location screen, group-status sheet, mission progress), image `dori-shuk:20261030-235512-0c03a61`; before that `b84ce27` ("Find this place", 30 Oct 16:20 UTC) and `364a4f5` (I2, host invitation and lobby, 30 Oct 06:27 UTC); before that **`175548f`** from 29 Oct 21:36 UTC (I1, the Adventure and Team model, schema 6), image `dori-shuk:20261029-213559-175548f`; before that `f54f6da` from 26 Oct (live game reset that day). Server checkout `/root/projects/The-Amazing-Hunt`, branch `main`. This summary supersedes older counts and environment notes in the [handoff history](agent-handoff.md).

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

- **Next session:** the owner's phone sign-off of the uncommitted compact-preview changes (31 Oct 2026; checklist in the handoff), then the B-lite phone check and the copy drafts. The challenge-photo preview is a separate task, not started; the ordered list is at the top of the [handoff](agent-handoff.md). B-lite steps 6–7 (finding hints), routing and any GPS-policy change are not authorised.
- Done (`6d35b59`, 30 Oct 2026): the compact onboarding (Stitch): the one-step lobby.
- The owner's phone review of the 26 Oct changes and of the Stitch slice (the eight preview checks in the handoff).
- Possibly compact role pills on phones narrower than 22rem.
- Then the challenge screens (C1) and Food (E1) in the Stitch style. The approved challenge rules win over Stitch: no moves counter, contextual controls, no hint penalties on buttons. Re-export the C1 and E1 screenshots first.
- New missions and reworks go through `/experience-design` first (owner's direction, 29 Oct 2026).
- Multiplayer plan approved (29 Oct 2026): [multiplayer plan](multiplayer-plan.md), increments I0–I8, one at a time. I0 and I1 are done, and **I1 is deployed**. The live file becomes schema 6 on its first write after the deploy and keeps an automatic `pre-schema6` copy; see the [handoff](agent-handoff.md). I2 (host invitation and lobby) is the next approved milestone; its implementation isn't authorised yet.
- **I2 (host invitation, lobby, Start Adventure) is deployed (30 Oct 2026, 06:27 UTC, `364a4f5`) for the owner's phone test**; a new live adventure waits in its lobby (schema 6, no host, everyone signed out). Before that, committed as `dccaf95` and `a05c2a7`; the live app is unchanged. The owner corrected the model the same day: one adventure of many teams of about 5 (recommended `ceil(count / 5)`, ceiling 30 participants, provisional). I2 shows that recommendation only: groups of 1–5 start as one team, and groups of 6–30 can't start until multi-team play exists. The corrections after the owner's review are committed too (30 Oct 2026); mobile visual acceptance is still a deployment prerequisite. See the [handoff](agent-handoff.md).

## Waiting on the owner

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
- The well: keep the two-move solution? Story wording (cistern vs. well, the question answered too soon, the title)?
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
- Invitations: `docker exec dori-shuk node --experimental-strip-types --no-warnings tools/scripts/shuk-invite.ts <guide|player-N> https://doriisrael.com`. Redirect them into `.local/` and never print them.
- Progress was reset by the owner on 26 Oct 2026 (08:59 UTC): all missions empty; sign-ins, invitations, names and roles kept. Backups are in `.local/amazing-shuk/backups/` and `/data/state.before-reset-*.json`.
- Back up with `docker exec dori-shuk cat /data/state.json > .local/amazing-shuk/backups/<name>.json`.
- A new web photo under `public/shuk/` needs a `!` line in `.dockerignore`, or it 404s live.

**Local simulation:** the dev page and API stay development-only: `SHUK_DEV_SIMULATION=1`, a loopback Host, 404 otherwise. On this server the dev container `shuk-dev` runs in tmux `shuk-dev-server` with the host network and Next on `127.0.0.1:3300`; it uses the repo's `.next/`, so don't delete that while it runs. The host network matters: with Docker's usual port mapping Next listens on `0.0.0.0`, and the Shuk API's loopback check then returns 404 (`--network host`, `next dev --hostname 127.0.0.1 --port 3300`). Local invitation links: `docker exec -w /w shuk-dev npm run -s shuk:invite -- <player-1|player-2|…|guide> http://localhost:3300`. `lib/base-path.ts` is the only source of both prefixes (`/memory-protocol`, and `/shuk` in the Shuk build).
