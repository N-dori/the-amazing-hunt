# The Amazing Shuk — Product Decisions

**Purpose:** Owner-approved decisions that govern implementation. Updated 24 Oct 2026.

## Approved: one shared group

**Decision (24 Oct 2026):** The first playable version contains exactly one group. Everyone moves together with the guide and sees the same progress. Do not implement team-count selection, competing teams, individual scoring, or multiple simultaneous game groups.

- Each participant logs in on their own phone.

- The guide manages participant roles and approves task completions.

- One participant is navigator and one is answer-submitter; the same person may hold both roles; everyone else is a follower.

- The group chooses its route among available tasks.

- Correct completions earn shared points and food tokens; redemption is guide-controlled at the market.

**Reason:** One coherent family experience with shared progress and guide oversight, rather than parallel competition.

**Supersedes:** Earlier 1/2/3-team brainstorming and the team-count selection behavior in `design/prototypes/amazing-shuk-team-format/`. Preserve that prototype as an isolated experiment; never integrate its selector into the Shuk app.

## Other current owner directions

- Intended access is the owner and seven friends on the existing VPS and host behind Caddy; do not treat the app as private until the actual app and proxy gates are verified.

- **Self-hosted invitation login (approved 24 Oct 2026, latest owner instruction):** implement manually distributed, single-use invitation links, independent authenticated browser sessions, one shared group, local JSON, secure tokens, server-side session validation and backend-enforced roles. No external authentication provider or SMTP. This supersedes the earlier deferred Auth.js/email plan. First demonstrate two identities sharing game progress, then return to playable market challenges. Production deployment still requires explicit approval; the existing development-only boundary remains until a separate protected production app boundary is established.

- Do not permanently store player photos in the app/VPS. Do not send photos to an API until consent, endpoint behavior, provider retention and failure handling are reviewed. `store: false` does not mean zero provider retention.

- Do not display the Rachmo photos in the game; the group can see the place from outside.

- Mural reuse and alteration rights remain unresolved; do not build a mural image task until cleared.

- **Protected Shuk app (approved 25 Oct 2026):**
  - Address: `https://doriisrael.com/shuk`, with no DNS change.
  - Gate: the app's own single-use invitation links only, with no Caddy password.
  - Its own image (`dori-shuk`), container, data volume and prefix, built from this repo.
  - The owner approved the commit, push, deploy, Caddy route and invitations for three friends (players 4–6).
  - This is the "separate protected app boundary" the earlier rules waited for.

- **Stitch visual direction (approved 25 Oct 2026):**
  - The owner's Stitch mockups (`docs/design/stitch-reference/`) set the look of the Shuk screens. They are a layout reference only: their copy and features are not approved.
  - Where they conflict with the decisions in this file, these decisions win.
  - IBM Plex Serif is approved for Shuk headings (`--font-display`), beside the brand's Plex Sans, Sans Hebrew and Mono.
  - The participant avatar is DiceBear Thumbs (CC0) in a round frame, coloured with the DORI tokens.
  - Before play, screens show only the food tokens a mission gives, never a points promise.
  - The photo rights audit is deferred: the owner's photos may be used as they are for now.

## Conflict priority

Follow current owner instructions first, then these approved decisions, then verified implementation constraints, current roadmap/design specs, and finally historical brainstorming. Record conflicts and update outdated plans; do not silently reverse a decision. Propose alternatives, but get owner approval before changing fundamental product direction.

## Current delivery priority / checkpoint (24 Oct 2026)

- **Approved:** gameplay comes first. Preserve the implemented manual invitation/session slice; do not expand authentication before the playable task loop. Six independently verified playable tasks are the initial target; ten ideal.
- **Approved architecture:** self-hosted identities and server-side sessions with local JSON, one shared group, shared progress/points/food tokens. Navigator and answer-submitter may be the same participant.
- **Deferred:** email/SMTP magic links, external providers/Auth.js, general enrollment and further authentication work. Earlier blanket deferral of invitation login was superseded by the explicit manual single-use invitation implementation request; this checkpoint does not remove that working code or claim browser acceptance is complete.
- **Superseded:** immediate login implementation as the next development priority, team-count selection, the 300/500 ml puzzle, zero-reward prototype notes and local-only scored hints. Preserve historical records, but follow the current three-container well/scoring rules below.
- **Protected:** do not modify Claude UX designer files (including `.claude/agents/dori-ux-designer.md`) without explicit owner approval. No production deployment without approval.
- Existing Claude content/research/topic indexes are the starting point for tasks and food content: [content index](../../design/inputs/content/README.md), [Claude discovery](../../design/output/00_discovery.md) and [discovery decisions](../../design/output/01_assumptions.md). Research is not approved final copy, field verification or food pricing.
- Current next slice: finish owner acceptance of the existing well/participant identity UI, then one sourced playable market challenge. The current map-to-mission implementation is approved; GPS assistance/bonus policy below supersedes discovery-only restrictions. No navigation system is authorized.

## Approved MVP content target

Start with six independently verified, playable tasks; ten is the ideal target if verified content, route time and group play support it. Claude's existing research and topic indexes are the discovery starting point. Ideas and dated research are not approved task copy or field verification.

## Approved water revision (24 Oct 2026)

Story-first digital-only water task: 3 L / 5 L well measuring vessels fill a visually distinctive 4 L family jar using maximal pours; jar cannot be filled from well or emptied. Only exactly 4 L in the family jar solves it. Explicit submission belongs to guide/answer-submitter; no unsolved guide override. Use documented story/source limits, owner narrative/read-aloud instruction and existing Brand Book/tokens. No props, invented history or production deployment. Reward settings follow the later provisional scoring decision below. Supersedes the 300/500 ml task variant.


## Approved invisible timing and provisional well rewards (24 Oct 2026)

Measure quietly, motivate gently, celebrate visibly. Timing is optional per task, never shown as a running timer/countdown or time-pressure warning, and never causes automatic failure. Start one persisted server-owned shared challenge clock on an explicit authorized start after the story; stop on server-verified solution rather than delayed official submission. Refresh/device changes must not reset it. Guide alone can pause/resume, reset or exclude timing. Optional guide review can expose timing; participants see no live performance score or leaderboard.

Points measure performance; food tokens reward completion. For the local well prototype only, configurable maximum 100, floor 40, completion reward 2 food tokens. Base score: elapsed <120000 ms =100; 120000 through 240000 ms inclusive =90; >240000 ms =80. Cumulative hint penalties 10, then 15 additional, then 20 additional; final=max(40,base-penalties). Count each hint once per shared group, irrespective of device/retries. These are provisional testing values, not final market-economy prices or universal task thresholds.

Keep explicit authorized group submission. Freeze solution time on the solving move; issue points/tokens exactly once on authorized finalization. Then show Challenge completed!, points earned, food tokens earned and hints used. No invented previous-group results. Preserve existing sessions, JSON/shared progress, puzzle mechanics and development-only boundary. No deployment authorized.


## Hebrew-first storytelling and interruption handling (24 Oct 2026)

Owner authorizes source-faithful adaptation from the original Hebrew when available: read the full relevant section, preserve its memorable detail and uncertainty, then write natural English in 4-5 short authored lines for roughly 20-30 seconds aloud. Check every historical claim against the original; no invented names, dates, annual frequency, quotes or practices. Keep source citations collapsed and original Hebrew development-only; production rendering must omit the Hebrew body. Retain evidence labels, story-card tokens/type and read-aloud invitation. This supplements the no-unapproved-paraphrase rule only for the explicitly requested adaptation workflow.

For this local timing MVP, excluded timing is treated as untimed: maximum configured base points minus the existing shared hint penalties, still floored. Timing resets restart only the measured interval, preserving initial start, puzzle and hint usage; pause/resume/reset/exclude are guide-only and adjustments are recorded. Rewards become immutable at authorized finalization. Existing completed prototype records remain completed without retroactive timestamps/rewards; migrated unfinished work is retained and excluded from time scoring on explicit start because earlier effort cannot be measured reliably.

## Approved optional GPS assistance and arrival bonus (24 Oct 2026)

Latest owner decision supersedes both the earlier no-GPS policy and the subsequently proposed GPS-unlock requirement. **GPS never gates participation.** Selecting an available mission reveals the story and challenge regardless of location, permission, accuracy, connectivity or arrival bonus. No arbitrary prerequisites.

Reuse the existing illustrated Leaflet map for mission selection. No location dot, geographic-map replacement, georeferencing, routing, watchPosition or continuous location storage/sharing. The image-coordinate fit is irrelevant to proximity validation: use separately confirmed real geographic destination coordinates, never image-derived coordinates.

The optional button is **We're Here?** (question mark intentional). Request one fresh getCurrentPosition reading only on tap. Use friendly, non-technical feedback and guide fallback; never a failure screen or automatic task denial. Real phone testing requires HTTPS and an approved access boundary; retain existing local-development gates until then.

Local Gan HaTut prototype: configurable100m radius and20-point group arrival bonus, awarded once on a usable nearby reading or authenticated guide confirmation. Challenge points/food tokens remain independent; completing without GPS earns all normal configured rewards. Guide confirmation may also add the bonus after challenge completion. Store only confirmation method, server timestamp and awarded points; never persist the submitted reading or offline-queue GPS evidence. GPS readings are client-provided evidence, not cryptographic proof.

Provisional engineering limits:50m maximum accuracy,60-second maximum age,5-second future-clock tolerance; center must be inside radius, uncertainty never expands it. These require field tuning and are not validated market GPS performance. Reject unconfirmed destination coordinates for GPS bonuses without affecting gameplay; guide confirmation remains available.

Gan HaTut/Ohel Moshe clue is owner-provided. Current-location photo and illustrated pin need owner verification; published geographic candidate is not field-confirmed. No substitute/generic image or invented coordinate is approved.3-5 task availability/reveal rules remain proposals; no new locked state is needed for this slice.
