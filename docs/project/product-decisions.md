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

**Superseded for the future design (owner, 29 Oct 2026):** see "Approved: adventure, teams, invitations and roles" below. Until those increments ship, the live app keeps this one-group behaviour. The prototype's selector still stays out of the app: teams come from the recommended count, not from a format choice.

## Approved: adventure, teams, invitations and roles (owner, 29 Oct 2026; future design)

Approved as the target design, built in increments I0–I8, each implemented, verified and approved before the next. **Only I1's internal model is live:** players still see the one-group game above. The increments, their checks, which one is authorised and the open gates are in the [multiplayer plan](multiplayer-plan.md).

- **One adventure of many small teams (owner's correction, 29 Oct 2026; supersedes the earlier "1–6 Together; 7+ Play Together or Two Teams; no other format").** Adventure size and team size are separate:
  - Teams aim for **5 participants**. The recommended number of teams is `ceil(count / 5)`, with participants split as evenly as possible: 5 → one team of 5; 6 → 3 + 3; 7 → 4 + 3; 11 → 4 + 4 + 3; 30 → six teams of 5. Five is the planned maximum per team.
  - The host enters the expected total; the app recommends the teams. No team-format selection screen, and the host never assigns every player by hand.
  - **30 participants is a provisional ceiling**, a planning limit and not proof of readiness. Before any real 30-person run: test simultaneous polling and actions, server resources and concurrency, guide oversight and crowd management, and onboarding at that scale. Don't advertise 30-person readiness until then.
  - Until multiple teams can be created (I7a), the recommendation is only advice and the app never implies the teams exist. **Groups of 1–5 can start; groups of 6–30 see the recommended teams but can't start until multi-team play exists**, with no one-team stand-in; the server enforces it (owner's review of I2, 29 Oct 2026).
  - An explicit **Start Adventure** (host or guide) begins play.
- **Host, Team Leader and Guide are distinct permissions.** The host initially leads team A; later, team leadership can be transferred without changing who the host is or what the host may do.
- **Host overview (for I7a, not before):** each team's name, leader, participant count and readiness only; no mission answers, hidden clues or unnecessary personal information from other teams.
- **One guide** for now, with the existing guide-only permissions; no multiple guide identities and no wider leader permissions. Whether larger groups need staggered starts or team-led play is a future operational design question.
- **Invitations:** the host opens the original invitation. Each team has a reusable join link (QR or ordinary link) that only lets a device *ask* to join; the team leader approves, and each player gets an individual authenticated session. Each other team's leader gets a single-use invitation from the host. Player names are optional.
- **Roles:**
  - Navigator and **Submitter** stay the two permanent gameplay roles; everyone else is an Advisor. "Submitter" is the approved new name for answer-submitter; the app still shows the old one.
  - Team leaders may manage roles in their own team, but get **no guide-only permissions**.
  - A vacant role must never block play: each gets a fallback.
  - Optional mission parts can be swapped and combined; every mission must stay playable with roles unassigned. Part names other than Language Explorer (draft: Spotter, Reader) are not yet approved.
  - Photographer is deferred: no photo capture or storage.
- **Language:** English-first. "Language Explorer" is the optional player-facing part. Translation help never costs a hint penalty. Verified Hebrew only; Hebrew story bodies stay out of production; other languages need approved translations.
- **Teams:** each team has its own leader, members, roles, mission progress and points. Any competition between teams is optional and friendly, and points are compared only at the end; food tokens may be earned per team but are pooled for the whole adventure. All teams share the same content and approved route with the guide; no independent routes.
- **Team names (owner, 31 Oct 2026, decided):** in the multi-team adventure (I7a), a team types its own name or picks one of 4–6 suggestions (Falafel Fugitives always among them). Names are at most 20 characters, in Latin script, with no emoji, and unique within one adventure, checked atomically by the server. Each team gets one of about 8 original Shuk-themed avatars automatically, kept by team ID through renames (owner direction, 31 Oct 2026; artwork pending, see the plan). The guide can correct an inappropriate name. This replaces the earlier fixed-bank and per-name emoji decisions. Copy, validation and normalization are in the [multiplayer plan](multiplayer-plan.md#i7a-team-names-owner-31-oct-2026-decided-not-built). The single-team game and I3b don't depend on naming.
- **Sensitive places:** Rabbi Aryeh Levin and Chesed VeRachamim are never competitive.
- **Staggered team routes (owner, 29 Oct 2026): Approved direction — Deferred / Not scheduled.** In larger adventures, teams may begin at different eligible stops and move through the same overall route in a staggered sequence, all converging at **Marzipan for a shared finale**. The aims: less crowding in narrow streets and at historical places, a sense of independent exploration, the same historical content and learning for every team, and an exciting shared ending. Not designed, planned or built: the current mission order, navigation, Marzipan's finale rules and the multiplayer plan stay as they are. Revisit only after core multi-team play works and the physical route has been tested.
- **Pilot:** validate distributed parts on the well with real participants before expanding them.
- **Still open:** the plan's gates O16 (team names are decided; part names and the other onboarding copy remain), O17 and O25 (O6 and O15 were approved on 31 Oct 2026) (how many teams one guide can lead at once) (operational and copy choices; no live data migration without separate authorisation), and O20: the 29 Oct line in the protected `.claude/agents/dori-ux-designer.md` still awaits explicit approval or revert, and that file must not be changed meanwhile.

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
  - **Stitch reference policy (owner, 30 Oct 2026).** This covers every Stitch material, now and later: screenshots, exported HTML, CSS and JavaScript, tokens, interactions and sample text. Stitch shows how a screen might look and feel. Product decisions define what it must do, and the existing app architecture decides how it is built.
    - **Priority:**
      1. Owner-approved decisions and instructions.
      2. Verified app behaviour, security rules and technical constraints.
      3. Existing Shuk components, tokens and patterns.
      4. Approved UX specs and accessibility requirements.
      5. Stitch.

      Where Stitch conflicts with a higher level, adapt the design; never change the behaviour.
    - **Colours are always the brand's, never the mockup's** (owner, 30 Oct 2026): only the DORI tokens in `app/globals.scss` (from `docs/design/dori-brand-to-ui.md`). Never copy a hex, Tailwind colour or palette from a Stitch export, even where it looks close; map it to the nearest brand token instead.
    - **Learn from it:** hierarchy and composition, relative type emphasis, how colours are related (which roles they play, not their values), card layout and spacing, how controls are presented, information density, mobile patterns. Keep the established Shuk identity.
    - **Don't copy:**
      - HTML or component structure, the Tailwind config, event handlers, calculations or state;
      - invitation codes, QR data or names;
      - scores, rewards or mission counts;
      - historical claims;
      - GPS behaviour;
      - authentication or permission assumptions;
      - accessibility settings;
      - prototype navigation;
      - unapproved copy;
      - external asset URLs (check licence and the asset policy first).

      Reimplement in the app's own components and styles; if a needed pattern is missing, explain the gap and propose the smallest compatible addition.
    - **Known export errors**, as examples:
      - `Math.round(count / 5)`: use the app's `ceil`, balanced split;
      - "Confirm Squad Setup" and "Squads Dispatched!": there is no multi-team creation in I2;
      - "All Devices Synced": no sync, readiness, attendance or connection claim without real state;
      - "GPS mode engages automatically upon launch": GPS stays optional and tap-triggered;
      - `min-height: max(884px, 100dvh)` and `user-scalable=no`: compact screens that normally fit one viewport, but zoom, text scaling and scrolling stay possible.
    - **Failed exports:** a `screen.png` that holds only `<FIFE Image failed to fetch>` is not an image. Don't treat it as visual evidence; the HTML can still serve as a reference under these rules. Don't block work on missing screenshots when the code and other references suffice.
    - **The collection:** `docs/design/stitch-reference/` is a reference collection. A file there, such as the untracked `3_main_screens.html`, may be inspected for context. It doesn't supersede newer designs, isn't approved behaviour, and isn't committed or changed without authorisation.
    - **In UI work:**
      1. Inspect the existing screens and components, then the Stitch reference.
      2. Pick the reusable visual patterns.
      3. Check every interaction against these decisions.
      4. Build with the existing component and state architecture, keeping accessibility, authentication and security.
      5. Verify at suitable screen sizes, and report significant differences from the mockup.

      No pixel-perfect reproduction where it hurts usability or the project's constraints.
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

## Deferred UX backlog (owner, 31 Oct 2026): recorded, not scheduled, not approved for build

The owner paused UX/UI work for the multiplayer engineering roadmap (S0, then I3). These are **owner-requested design directions**, not specifications. Every word below is exploratory wording, not approved visitor copy (O16). Nothing here changes code, map behaviour, coordinates, GPS, scoring, timing or permissions until the owner approves a phase. Shared principles:
- mobile first, with the existing tokens and components;
- touch targets of at least 3rem even where icons look smaller;
- progressive disclosure and less reading while walking;
- browser zoom and scrolling keep working;
- Hebrew RTL done properly;
- no duplicated navigation;
- the security, multiplayer, GPS and scoring decisions hold.

Stitch stays a visual reference only.

**UX-1. Main map, full width** (a later presentation phase; measure on real phones first).
- **Direction:**
  - The map goes edge to edge, with no card margins or side padding, while keeping the bottom bar, safe areas and the required overlays.
  - Smaller zoom buttons and markers, with their hit areas still 3rem.
  - A better first zoom and framing on a phone.
- **Needs approval:** the first zoom and framing, chosen from device measurements. How it relates to the pending "markers shrink when the map zooms out" rule (above).
- **Dependencies:** `LeafletBaseMap` is shared with the Memory Protocol, so changes go through Shuk-only props. The 16 px gutter rule in `.claude/rules/scss.md` needs a stated full-bleed exception.
- **Keep:** two-finger gestures, the gesture hint, accessible controls, the approximate-marker notice and its "About this map" control, coordinates and placements.
- **Accept when** at 375 × 667 and 320 px the map fills the width with no horizontal scroll, every marker and control has a hit area of at least 3rem, and gestures, the hint and the notice are unchanged.

**UX-2. Find this place, spatial rather than article-like.**
- **Direction:**
  - The destination map takes most of the screen instead of a strip, with the selected marker kept and no routing.
  - **What to look for** becomes a compact panel, collapsed at first, that opens on demand.
  - Swipeable images that can be enlarged, instead of a long vertical article.
  - A friendlier label than "Landmarks" ("Things to spot" and "Nearby clues" are candidates).
  - The location details fold away.
  - Player-facing labels might say "Challenge 1, 2…" instead of "Mission 1, 2…".
- **Conflicts with approved decisions:**
  - The landmarks were kept **always visible** on 30 Oct 2026 because they carry how to behave at each stop. Anything about safety, behaviour and identification must stay visible when the panel is collapsed. Only the extras may fold away.
  - Free finding information must stay clearly separate from any future paid hints. B-lite steps 6–7 (finding hints, costs) are still unapproved.
- **Needs approval:**
  - The terms Adventure, Destination, Challenge and challenge stage. Internal names stay as they are. "Mission N" and the three stage names are already drafts.
  - Which information is "essential and free".
  - The new labels.
- **Dependencies:** photo content (only Gan HaTut has a second, "look for" photo today). Image enlargement already exists (`PreviewBottomSheet`). A swipeable gallery would be built in-house, with no new dependency. The no-routing and optional-GPS rules hold.
- **Accept when:**
  - The destination, its photo, the safety and behaviour lines and **Open Challenge** are reachable at 375 × 667 without long scrolling.
  - Collapsed panels and the gallery work by keyboard and screen reader.
  - Swipe never fights the map's gestures.

**UX-3. Challenge: the story, then Start, then the timed activity.** This is the most important of the four.
- **Direction:**
  - Story or context first, compact and engaging.
  - A clear **Start Challenge**.
  - No question, options or puzzle before an accepted, authorised Start.
  - Then the activity appears.
  - An optional "Need some context?" that never gives answers away.
  - The story never starts the clock.
- **Already consistent with:** the invisible-timing decision (24 Oct 2026): the clock starts on an explicit authorised start after the story, is never shown as a running timer, and never fails anyone. It stays invisible. "The mural's before photo goes with the story" (26 Oct 2026).
- **Conflicts and gaps:**
  - The brief speaks of "the game's three existing languages". The approved rule is English first: Hebrew story bodies stay out of production, and other languages need approved translations. So production has one language today; I6 (language foundations) is the dependency.
  - Today the question and options (the choose-N missions) and the containers (the well) are shown before Start.
- **Technical dependency (fairness):** the challenge content (questions, options, hints) is part of the app's JavaScript (`choice-missions.ts`, `water-task.ts`).
  - Hiding it until Start would be a presentation change only. A determined player could still read it.
  - True "no peeking" needs the server to send challenge content only after the start is accepted. That's a content and API change, so it belongs with the multiplayer and security work and needs its own approval.
  - The start rules (navigator, submitter or guide; I4's vacant-seat fallback) and the per-team clock stay as they are.
- **Needs approval:** presentation-only hiding, or content served by the server. The copy for "Ready", "Start Challenge" and "Need some context?".
- **Accept when:**
  - Before Start, no answer material shows on screen.
  - The timer starts only on the server's accepted start.
  - A refresh or a second phone stays on the same side of Start.
  - The story never changes the timing.

**UX-4. Completion: celebrate, then a user-chosen next step.**
- **Direction:**
  - After the server accepts the answer: a clear success state, "Challenge completed" or similar, and points counting up.
  - Subtle motion with the existing icons, then the approved explanation.
  - One action, "Continue to the next stop" (draft).
  - No automatic move on a timer.
  - Drop a separate "Back to map" where the next-step action and the Map tab already cover it.
- **Already consistent with:**
  - "Challenge completed!" with the points, food tokens and hints used (24 Oct 2026).
  - A cheer on every completion with a clear way to the next stop, and a quiet line at Rabbi Levin's stop (26 Oct 2026).
  - Before play, no points promise.
  - Rabbi Levin and Chesed VeRachamim are never competitive (O23), so no score fanfare there.
- **Rules:**
  - Only the server's actual award and completed state, shown after confirmation.
  - Reduced motion removes the count-up animation.
  - The challenge screen's two Back buttons stay until this is approved.
- **Accept when:**
  - No success appears before the server confirms it.
  - The numbers match the server's award.
  - With reduced motion there is no animation.
  - The next step is one tap, and the Map tab still works.

**Suggested order, after S0 and I3:**
1. UX-3: decide hiding versus server-served content first, because it may touch the API.
2. UX-4.
3. UX-1 and UX-2: device measurements first.

Each is its own approval, plan and phone check.

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

The optional button is **Check our location** (owner, 30 Oct 2026; it replaced **We're Here?**, whose question mark read as ambiguous outdoors). Request one fresh getCurrentPosition reading only on tap. Use friendly, non-technical feedback and guide fallback; never a failure screen or automatic task denial. Real phone testing requires HTTPS and an approved access boundary; retain existing local-development gates until then.

Local Gan HaTut prototype: configurable100m radius and20-point group arrival bonus, awarded once on a usable nearby reading or authenticated guide confirmation. Challenge points/food tokens remain independent; completing without GPS earns all normal configured rewards. Guide confirmation may also add the bonus after challenge completion. Store only confirmation method, server timestamp and awarded points; never persist the submitted reading or offline-queue GPS evidence. GPS readings are client-provided evidence, not cryptographic proof.

Provisional engineering limits:50m maximum accuracy,60-second maximum age,5-second future-clock tolerance; center must be inside radius, uncertainty never expands it. These require field tuning and are not validated market GPS performance. Reject unconfirmed destination coordinates for GPS bonuses without affecting gameplay; guide confirmation remains available.

Gan HaTut/Ohel Moshe clue is owner-provided. Current-location photo and illustrated pin need owner verification; published geographic candidate is not field-confirmed. No substitute/generic image or invented coordinate is approved.3-5 task availability/reveal rules remain proposals; no new locked state is needed for this slice.
