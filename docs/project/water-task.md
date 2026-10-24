# Water task #24 — family jar revision

## Current scope and task definition

Owner instruction, 24 Oct 2026: story first; digital-only 3 L / 5 L well measuring vessels and a separate 4 L family jar; liters throughout. Implemented in `lib/amazing-shuk/water-task.ts`, `water-measurement.ts` and `water-task-view.ts`, at the existing gated local water route. This supersedes the physical 300/500 ml variant in the original idea bank. No real well, props, camera, location, timer or competing teams are involved.

| Layer | Definition |
| --- | --- |
| Treatment | Shared read-aloud story followed by collaborative digital water allocation |
| Interaction | Fill/return water to the well; maximal pours between them or into the family jar; reset before final submission |
| Question | Owner-supplied three-paragraph family-jar question, preserved in task data |
| Story source | `docs/scavenger_hunt/HE_trans.txt`, lines 60–66, and existing English wording in `Machane_Yehuda_Tour_EN.md`, Stop 5 |
| Evidence label | **Attributed tradition** for the cistern-cleaner story; separate **Fiction · Puzzle scenario** label for the invented 4 L ration/game premise |
| Guide move | Choose a group reader using the owner's exact instruction; guide or authorized submitter finalizes a solved jar |
| Renderer | Collapsible source-backed story, CSS vessel illustrations, numeric volumes and accessible native meters |

## Story provenance and limits

The Hebrew transcript describes cleaning before the rainy season, a boy lowered on a rope through a narrow opening, and children's eagerness for the honor, attributed by the speaker to Yossi Banai. It does **not** explicitly say once per year or identify a particular boy. Banai's underlying original passage is not present. No annual date, identity, universal practice or specific-well event has been invented.

The UI now uses the owner-supplied three-paragraph introduction (38 words), with the original Hebrew lines 62 and 64 and citations available in expandable source details. The earlier English retelling remains a source reference. The original transcript's spelling is preserved. No source file or research narrative was rewritten. The content index links this task and its sources. The read-aloud instruction is preserved; the challenge is now two concise sentences under the owner-requested reusable design process. Collapse preference stays local to each browser and persists on revisit.

## Deterministic rules and shared state

- Capacities and integer amounts are stored in liters: `{ small: 0, large: 0, jar: 0 }` initially.
- Only the two measuring vessels can be filled directly or return water to the well. Water cannot leave the family jar.
- Every pour transfers `min(source, destination remaining capacity)`.
- Only `jar === 4` solves the task. The jar is explicitly the goal, with rounded ceramic body and narrow neck; the two straight-sided vessels share a visual family and differ in size.
- Reaching the goal shows readiness; it does not finalize automatically. **Submit Group Answer** belongs to the answer-submitter (including dual-role participant) and guide. Guide approval is no longer an unsolved-state override.
- Participants and guide can operate/reset an unfinished puzzle. Reset preserves identity, roles and action receipts. Finalized completion cannot be reset or replayed. Rewards remain zero because no reward amounts are approved; no new reward system was introduced.
- Separate authenticated sessions read the same persisted state. Existing cookie/session, origin, host/opt-in/development gates and duplicate-action receipts remain.
- Storage schema 1 migrates to 2 under the existing lock. It retains credentials, roster role assignments and receipts, and starts the revised task empty/uncompleted. No existing login is revoked. Revision-1/missing-revision HTTP actions are rejected; new browser queues use a revision-2 key, avoiding old cup actions being reinterpreted.

**Rule consequence:** a valid solution is fill 5 L, then pour into the 4 L jar, leaving 1 L in the vessel. This follows the owner's required maximal-pour rules. The classic longer sequence is also tested: fill 5 ? pour into 3 ? empty 3 ? pour remainder into 3 ? refill 5 ? top up 3 ? pour the remaining 4 into the family jar. Making the jar unable to measure by capacity would require a different rule, not an unannounced implementation restriction.

## Brand and accessibility review

Source: `design/inputs/brand/DORI_Final_Brand_Book.pdf` (identity, colour system, supporting typography and identity restraint), located via `design/inputs/content/README.md` and Claude's existing read-only brand guidance. Also read `docs/design/dori-brand-to-ui.md`, `.claude/rules/scss.md`, existing `app/globals.scss`, `app/layout.tsx` and `components/ui/ActionButton.*`. The PDF's text sections were extracted/read locally; no new brand palette was inferred.

Reused: `--ink`, `--chalk`, `--zaatar`, `--sumac`; inherited IBM Plex Sans / IBM Plex Sans Hebrew via existing font tokens; `ActionButton` primary/quiet variants, focus and reduced-motion behavior. Existing account/role surface uses the same palette. Amber remains available in the shared button focus indicator. The new modules contain no hex/rgb/hsl colors. Sumac defines the ceramic body and goal emphasis; Za'atar fills water; Ink/Chalk define structure/background. Shape, labels, numeric liters and semantic meters carry meaning independently of color.

The brand book does not prescribe a vessel illustration, jar profile, water pigment, responsive breakpoint or puzzle spacing. The restrained CSS silhouettes and layout are implementation decisions for owner visual review, using approved tokens only. No new color variant or global token was introduced. No logo was redrawn.

Code review: 48 px minimum puzzle/reset/summary touch targets; 56 px shared primary buttons; explicit focus indicators; contextual actions with impossible moves hidden; status live region; named meter with current/max liters; Hebrew `lang="he"` and `.rtl`; no new animation; forced-colors fallback. Three columns are used from 24rem, with two vessels above the goal jar on narrower screens, `minmax(0, 1fr)` tracks and wrapping labels to avoid overflow at larger text sizes.

Actual browser/mobile, keyboard/screen-reader and screenshot checks remain with the owner per repository instructions. The CSS/accessibility review is not a claim of rendered mobile acceptance.

## Verification

- `npm.cmd run test:shuk`: **23 passed**, including all three-container states/pour conservation, prohibited jar operations, both complete solutions, exact jar objective, reset, guide/submitter authorization, repeated finalization and shared/reopened progress, storage migration and stale revision rejection.
- `npm.cmd test`: **61 passed**, Memory Protocol regressions.
- Targeted ESLint and TypeScript no-emit check passed.
- New story/puzzle/account Sass modules compile; scanned compiled CSS for hardcoded hex colors and source for hex/rgb/hsl values: none introduced.
- Full `npm.cmd run lint`: three existing CommonJS require-import errors in the isolated team-format prototype, plus eleven existing warnings elsewhere. These unrelated files were preserved.
- No production build was run over the owner's active development output. No deployment, commit, browser review, screenshot or UX-agent change occurred.


## Focused contextual UX iteration (24 Oct 2026)

The owner confirmed the mechanics work in the browser and identified cognitive load as the priority. Replaced the permanent action grid with tap/select vessel, contextual actions and tap a highlighted eligible destination. An empty selected vessel offers Fill from well; a full one offers Pour into... and Return water to the well; partial vessels offer at most three actions. Jar has no source actions. Impossible actions and repeated explanations are hidden. Selection/pour mode reconcile with current shared progress; keyboard focus is managed when controls change. Solved jar displays Goal reached and keeps the official authorized submission. Reset remains available before finalization.

Three hints use the owner's exact wording, reveal one at a time, and persist only as a bounded local hint count. No initial hint is shown on a new browser. Reset does not clear hints. No hint action is sent to the backend. Story uses the owner's supplied well introduction; source and original Hebrew remain available but collapsed to reduce reading load. The task question is two sentences, following the updated [existing designer guidance](../design/codex-amazing-shuk-partner.md).

Intended complete path: fill 5 L; pour into 3 L; pour the remaining 2 L into the family jar; return the 3 L to the well; repeat fill/pour; add the second 2 L to the jar. This is seven atomic moves implementing the owner's six conceptual steps. Final state: {small: 3, large: 0, jar: 4}. Both measuring vessels can return water. Internal empty-small/empty-large action IDs are retained solely for queue compatibility; the UI always calls this returning water to the well. Existing maximal-pour alternatives remain valid; no unrequested restriction was added.

Verification: 30 Shuk tests and 61 Memory Protocol regression tests pass. Coverage now includes the intended repeated solution through two authenticated identities, returning either vessel, no overflow/pour conservation, contextual destinations, shared updates while selecting, progressive hints, official submit and real filesystem-lock contention/retry without overwriting progress. Targeted lint, TypeScript and token-only Sass compilation pass. New container selection uses native keyboard buttons with pressed state, names/current liters, destination highlighting and focus recovery; touch targets are at least 48 px. At typical phone widths all three containers share a row, with responsive sizes and wrapping labels. Rendered mobile/keyboard/screen-reader acceptance still belongs to owner review; no screenshot or browser automation was performed.

No authentication, reward, storage, migration, server action parser or synchronization logic was rewritten. Schema/puzzle revision stays 2; current progress, sessions and queued actions remain compatible. No production build was run over the owner's active development output, and no deployment occurred. The earlier verification section records the previous iteration's checks; the counts above are current.


## Invisible timing, completion rewards and Hebrew-first brief (latest, 24 Oct 2026)

Designer guidance/product decisions now contain both reusable principles: measure quietly, motivate gently, celebrate visibly; and read the original, preserve its character, adapt naturally into 4-5 English lines. No new skill, agent, instruction framework or auth system was created. Claude's UX agent remains unchanged.

### Current story fidelity

Read the full cistern section in docs/scavenger_hunt/HE_trans.txt, lines 54-66, located via the existing content index. Four English paragraphs / 40 words replace the generic brief. The first asks punishment or honor; line 64 supports the surprising eagerness for the cleaning job, attributed by the transcript to Yossi Banai. The rope/narrow opening/boy are in line 62; before the rainy season is in line 60. The last English line is a present-day gameplay invitation, not a historical claim. No annual frequency, particular boy's identity or quotation was invented; the underlying Banai passage remains unavailable. Story remains Attributed tradition, separate from the invented ration premise.

The complete Hebrew section is retained in task data, read-aloud invitation unchanged, sources remain in collapsed details. Development can render Source and original Hebrew with .rtl/lang=he; the production variant renders Source and citations with no Hebrew body. The protected Shuk production route still returns 404. No unrelated UI redesign or new colors. The English is conversational rather than a mechanical sentence-for-sentence translation. Count/markup are tested; actual phone layout and read-aloud duration require owner review.

### Start, clock, hints and finalization

- Navigator, answer-submitter (including dual role) or guide explicitly selects Start challenge after the story. Followers cannot start but may operate an already started puzzle and request shared hints. Moves cannot begin before server start. Every device sees the same started state. A repeated start cannot restart the clock.
- One JSON performance record holds server epoch timestamps startedAt/clockStartedAt/solvedAt, pause accounting, exclusions and an adjustment audit. Only the server Date.now value enters from HTTP handling; client clock/reward fields are discarded by action validation. Server-verified jar===4 on a move captures solvedAt exactly once for that attempt. No fallback to client/submission time is needed. Delayed submission does not reduce the frozen score.
- Guide-only Timing review is collapsed. Pause/resume, reset timing only and exclude are server-authorized. Reset keeps the original challenge start and puzzle/hints but changes the measurement origin. No running elapsed display exists, including in the guide panel: duration is shown there only after solution. No timeout/auto-failure/leaderboard/live score is introduced.
- Scored hints now use shared server count, not the old localStorage count. Requesting an already revealed hint is idempotent across devices and different action IDs. New hints must be sequential and stop after solution; puzzle reset does not clear hints or restart time.
- Authorized Submit Group Answer still finalizes. In the same locked atomic JSON write, it stores one immutable award with points, foodTokens, hintsUsed, award time and measured duration (null if excluded). Receipt retries or distinct repeated submissions cannot award twice. Participant API projection omits all timing fields; after finalization the UI shows Challenge completed!, earned points/tokens and hints used.

### Provisional configuration

lib/amazing-shuk/water-performance.ts owns WELL_REWARDS and pure configurable calculation: max100/min40, completion2 tokens, <120000ms100, 120000..240000ms90, >240000ms80; cumulative hint deductions10/15/20, floored40. Exclusion uses max base minus hints. These are local-testing settings, not final market-economy prices or universal future-task defaults. Other task types may omit timing/hint scoring.

Schema and browser action revision are now 3. Schema2 migration retains cups, role assignments, sessions, receipts and completion, adding empty performance metadata. It invents no prior timestamps or rewards. Existing unfinished cups are excluded from timing when explicitly started; prior completed tasks stay completed without a retroactive award. Legacy schema1 cup migration still starts the revised jar puzzle empty. Old browser protocols are rejected; refresh both profiles. New v3 action queues cover start/hint/guide timing events as well as moves, preserving offline intent and idempotent synchronization. Delayed offline actions are timed when received/validated by the server, not when tapped offline; guide exclusion handles interruptions. Wall-clock behavior after host clock changes and power-loss/VPS persistence remain unverified.

### Actual verification

41 Shuk tests and 61 Memory Protocol regressions pass. New checks include threshold boundaries, cumulative penalties/floor, alternate per-task configuration, pause/resume/reset/exclusion, solution-time freeze before delayed submit, shared hint races, backend guide authorization, one-time awards across devices and a fresh Node process, clock/reward input filtering, legacy migration and actual participant TSX/static rendering without timers/live scores. Story rendering verifies English/citations and Hebrew only under the development flag. Targeted lint, TypeScript and Sass/token scan pass. UI rendering tests transpile actual TSX using the existing TypeScript dependency and render React markup; they do not constitute browser or screen-reader acceptance. Known unrelated full-lint prototype errors remain outside this slice.

No deployment, production route enablement, auth replacement or Claude UX-agent modification. Build/browser HTTP review was not run over the owner's active dev server; static rendering and source checks do not replace that review. Next: refresh an unfinished local group, read the story, explicitly start, reveal hints from two profiles, solve, delay submission and verify the same achievements in both. Prior completed groups are intentionally not reopened or retroactively awarded.
