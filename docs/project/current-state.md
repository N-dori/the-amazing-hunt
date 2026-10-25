# The Amazing Shuk — Current Implementation State

**Updated: 25 Oct 2026 (Claude), after missions 4 and 5.** Server checkout `/root/projects/The-Amazing-Hunt`, branch `main`. This summary supersedes older counts and environment notes in the [handoff history](agent-handoff.md).

## Implemented; automated verification passes

- One fixed development roster (`guide`, `player-1` to `player-7`), server-validated browser sessions and one shared JSON group. Single-use invitations (24 h) and sessions (7 days) are hashed. Roles are enforced by the server; navigator and answer-submitter may be the same person. No external sign-in or SMTP. See the [login runbook](local-participant-login.md). Invitations: `npm run shuk:invite -- <participant> http://localhost:3300` inside the dev container.
- JSON writers use a filesystem lock, a synced temporary snapshot and an atomic rename; action receipts prevent duplicate actions and rewards. Browsers queue actions locally and retry.
- Progress, invisible timing, hints and rewards are stored per mission (schema 5, protocol revision 5); `lib/amazing-shuk/missions.ts` is the catalogue. A mission may also have an optional bonus question with its own picks and one-time points.
- **Five playable missions**, all on the standard journey (map → preview → location → optional We're Here? → challenge → rewards → map):
  1. **Gan HaTut, the well** — the 3 L / 5 L / 4 L family-jar puzzle. See the [well record](water-task.md).
  2. **The market mural, "Is It Real or Is It Painted?"** — pick 2 of 8, answer key field-checked by the owner, GPS point confirmed.
  3. **Chesed VeRachamim, "What Was This Building Before?"** — pick 1 of 4 (the tavern), then the blue heritage sign and Yitzhak Armoza; an optional bonus on the novel *The Beauty Queen of Jerusalem* (10 points, no food tokens) and an unscored Eshet Chayil moment. Sources and the Luna findings are in the [handoff](agent-handoff.md).
  4. **The Montefiore gate, "Three Languages, One Gate"** — pick 3 of 5 (Hebrew, English, Arabic); an optional bonus hides the plaque's year תרמ"ב in the word בתמר (Yemenite aliyah of 1881–82), a letter shuffle with no arithmetic (10 points).
  5. **Rabbi Aryeh Levin, "The Father of the Prisoners"** — Feinstein and Barazani, the grenades in oranges, told respectfully; pick 1 of 4; untimed, no hints, completion title "Answer received"; bonus: the Kramer-Rechtman plaque on HaCarmel St (10 points).
- Rewards: provisional well values for every mission (100 max / 40 min points, 2 food tokens), awarded once on an authorised submission; optional arrival bonus of 20 points once.
- Player UI: illustrated Leaflet map; a bottom-sheet mission preview tied to its marker; a location view with photo, names, landmarks and clue; checkbox-card answers with a sticky submit bar; a profile panel from the header avatar and compact role badges; a fixed bottom bar (Map, Mission, Food, Group) with browser history and refresh kept in the tab.
- DiceBear Line Face avatars from the participant's immutable ID (core 10.7.0 / styles 10.6.0), with initials fallback.

## Partial, provisional or unverified

- **Nothing has been checked on a real phone.** The owner has reviewed some screens in a desktop browser by screenshot; layout, safe areas, back navigation and HTTPS GPS on a phone are unverified.
- Marker placements are manual guesses for all five missions. GPS is on only for the mural (owner-confirmed point); the other four fall back to guide confirmation.
- Photos: Gan HaTut gate and cistern, the mural street view and the synagogue facade are the owner's photographs, connected by the owner's choice. Mural reuse rights are still recorded as unresolved in [decisions](product-decisions.md); the before photo's photographer, date and rights are not recorded.
- Much visitor-facing copy is draft (stories, hints, reveals, location text, UI labels); each slice lists its drafts in the handoff. Food offers are not approved; the Food tab shows the token balance and a marked gap.
- Not yet built: onboarding, food redemption, the separate Shuk app boundary (planned before real-phone testing), production deployment.

## Current verification (clean `node:22-alpine` container)

- `npm run test:shuk`: **115 passed, 0 failed.**
- `npm test`: **61 passed, 0 failed.**
- `npx next typegen && npx tsc --noEmit`: pass. ESLint on `lib/amazing-shuk` and `components/amazing-shuk`: clean; full lint still has the three pre-existing errors in the isolated prototype and eleven warnings in Memory Protocol files. Changed Sass modules compile. `git diff --check`: pass.

## Boundary and how to run

The Shuk page and API are development-only: `SHUK_DEV_SIMULATION=1`, a loopback Host, 404 otherwise. On this server the dev container `shuk-dev` runs in tmux `shuk-dev-server` with the host network and Next on `127.0.0.1:3300`; it uses the repo's `.next/`, so don't delete that while it runs. `lib/base-path.ts` remains the only source of the `/memory-protocol` prefix.
