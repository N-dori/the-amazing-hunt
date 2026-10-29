# The Amazing Shuk — Product Decisions

**Purpose:** Owner-approved decisions that govern implementation. Updated 24 Oct 2026.

## Approved: one shared group

**Decision (24 Oct 2026):** The first playable version contains exactly one group. Everyone moves together with the guide and sees the same progress. Do not implement team-count selection, competing teams, individual scoring, or multiple simultaneous game groups.

- Each participant logs in on their own phone.

- The guide manages participant roles and approves task completions.

- One participant is navigator and one is answer-submitter; the same person may hold both roles; everyone else is a follower.
  - **Updated 25 Oct 2026 (owner):** "let them choose and the rest are advisors".
  - Players take a free role themselves from the Group tab, and can step down to free it. A role someone else holds can't be taken.
  - The guide can still assign or clear any role.
  - Players see "Advisor" for everyone without a role; the code keeps the name `follower`.

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

- **Owner's review of the live game (26 Oct 2026):**
  - **No evidence labels on screen**, in every mission. The data keeps every statement's label and source, and the wording keeps its hedges ("It's told that…", "Sources differ…"). Text after an answer sits under one neutral heading (draft "Behind the answer"). No Source section on mission pages. This overrides "the app shows it" for the Shuk (`.claude/rules/content.md`).
  - **Marzipan is the finale:** it opens only once every other mission is done. The game's closing line is "…go find what the market has to offer you…".
  - **The Montefiore bonus is off the gate:** the year תרמ"ב (בתמר) belongs to the Yemenite aliyah, not to the gate. The puzzle is parked for a possible Yemenite stop.
  - A cheer on every completion (a quiet line for Rabbi Levin's stop), with a clear way to the next stop.
  - The mural's before photo goes with the story, before the challenge.
  - The owner identified the Nachlaot mural (photos #37 and #39) as Rabbi Aryeh Levin; it is his mission's photo.
  - An openly licensed web photo may stand in for a missing one, with its credit shown (Marzipan: CC BY 2.0).

- **Change of course (owner, 29 Oct 2026):**
  - **The market can also be part of the challenges** (Mahane Yehuda itself, not only the closing food reward). Not yet built; wait for the owner's next instruction before planning or building market challenges.
  - **No server-side Marzipan lock:** the finale lock stays in the client only; the server is not to refuse Marzipan actions.
  - **Never write "A guide tells that…"** (or similar guide attributions) in visitor-facing copy. The hedge a tradition needs comes from other wording. First case: Marzipan's follow-up lead (`marzipan-task.ts`, the syrup bucket line); not changed yet.
  - **The synagogue's blue-sign line is a hint** to the place's story ("Now look for the blue heritage sign nearby…", `synagogue-task.ts`), not an instruction placed above or below "Behind the answer". Not changed yet.
  - **The mural's before photo:** the owner has had it a long time and isn't sure of its origin, and thinks it may have been altered with GPT. Its source and rights stay unknown; treat it as possibly edited, not as a documentary photo. No decision yet on keeping or replacing it.
  - **Experience design direction** (after Claude's diagnosis that five of the six missions follow the same pattern: story, multiple choice, reveal). This entry is the one record of it; the skill and the notes link here.
    - The physical world is the centre; technology serves the game, never the reverse.
    - Every stop has its own character, and one connecting line runs through the whole game.
    - The model: knowledge → story → a changing interaction that brings the whole group in (task or challenge) → discovery, a memorable experience, a surprise.
    - Above all, find the experiential potential hidden inside the actual historical stories before deciding which mechanics to use.
    - Kept from Claude's 29 Oct ideas: **split clues across phones** (each role's phone holds a different piece), to give real expression to the multiplayer game; **predict first, then reveal**, but not at every stop; **souvenirs from each stop leading to a final puzzle**, a good progression system, but the owner asks what they would mean: the objects need real meaning (open).
    - Not taken up for now, nor rejected: a map uncovered stop by stop, a voice per stop, a group memory at the end, and Claude's per-mission and market ideas.
    - Carried out by the `/experience-design` skill (`.claude/skills/experience-design/`); the owner's brief for it is kept word for word in [the skill brief](experience-design-skill-brief.md).
  - **Map rule: markers shrink when the map zooms out**, so nearby pins (e.g. the gate and the well, 2 and 3, 67 image px apart) don't overlap. No pin is moved for this. Not yet built; wait for the owner.

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
