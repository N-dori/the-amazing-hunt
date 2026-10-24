# The Amazing Shuk — Current Implementation State

**Verified:** 24 Oct 2026. This records repository evidence, not plans.

## Implemented and tested

- `lib/amazing-shuk/roles.ts` contains pure single-group role assignment and lookup helpers. Five tests passed with `node --experimental-strip-types --disable-warning=ExperimentalWarning --test lib/amazing-shuk/roles.test.ts`. It does not authenticate callers or persist state.
- `npm test`: 61 tests passed across 10 suites; these test Memory Protocol only.

## Prototype only

- `design/prototypes/amazing-shuk-team-format/` is a local browser experiment with a superseded 1/2/3-team selector and cup-measuring puzzle. It is not integrated into the app or shared state.
- `lib/game/*`, `app/*` and `/api/sessions/*` belong to The Memory Protocol at `/memory-protocol`; do not connect Shuk authentication/data to these endpoints.

## Existing content, not approved game data

- `design/inputs/content/Mission_Task_Ideas.md` contains 35 raw task ideas, a mural opener, food-token brainstorm and Rachmo board transcription. Every idea starts at Idea; none is a verified playable mission or approved copy.
- `design/inputs/content/photo_index_ALL.csv` indexes potential visuals and notes people/consent/rights. `design/inputs/photos/` currently contains only `.gitkeep` and the CSV; source image assets are absent.
- `research/results/06_nahlaot_market_sites_verification.md` is dated research, not owner approval or same-day field verification. `research/results/07_citecreation_market_mural.md` leaves mural image/crop/alteration licensing unresolved.
- No token cost is defined. The old “+3 per stop” brainstorm is not a menu cost. Vendor names and offerings are leads requiring current confirmation.

## Authentication and app boundary

No production Shuk route, participant authentication, email transport, Auth.js/NextAuth dependency, JSON adapter or persistent group state exists. A local development-only Shuk task route/API is described below. `package.json` has no Auth.js dependency. Self-hosted magic-link authentication and local JSON storage on the VPS are approved but deferred until before real participants are invited.

## MVP not implemented

Authentication/guide authorization; persistent group; server role enforcement; market map; approved task content/images; production answer endpoint; shared score/tokens; guide redemption; concurrency-safe persistence; offline sync; photo verification; initial target: six independently verified playable challenges; ten is ideal. No authorization, two-browser, restart or live deployment check has been performed for Shuk.

## Playable task development

- lib/amazing-shuk/water-measurement.ts models the 300 ml and 500 ml vessels and deterministic 400 ml success for source idea #24. lib/amazing-shuk/dev-water-session.ts applies actions to one shared fictional local session, enforces answer-submitter submission and guide approval, and supports role assignment with a dual-role participant.
- app/dev/amazing-shuk/water/page.tsx, app/api/amazing-shuk/dev/route.ts, and components/amazing-shuk/dev/ provide the local development simulation. It requires NODE_ENV=development, SHUK_DEV_SIMULATION=1, and a loopback Host. Production mode is denied even if the flag is set. State is process-memory only.
- The focused domain tests pass. The Next page/API have not been run or built in this checkout. The dependency install is incomplete: npm ci failed with ENOTEMPTY, and the Next/ESLint executables are unavailable. Browser behavior and production HTTP 404 have not been integration-verified. Separate local browser sessions read the same process state by polling; this is not persistent or production multi-device sync.
- The task uses source-bank draft wording and is visibly labeled prototype-only. No #66 image asset is present. Points and food tokens stay at zero because no award values are approved.
- Magic-link authentication and VPS JSON storage are approved but deferred. No email, persistent game state, map, onboarding, real authentication, approved reward values, or production game endpoint exists.
