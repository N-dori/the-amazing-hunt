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
- **Sensitive places:** Rabbi Aryeh Levin and Chesed VeRachamim are never competitive. **Superseded (owner, 2 Nov 2026, D4):** both are normal stops; see [Progressive challenges](#progressive-challenges-and-market-surprise-owner-2-nov-2026).
- **Staggered team routes (owner, 29 Oct 2026): Approved direction — Deferred / Not scheduled.** In larger adventures, teams may begin at different eligible stops and move through the same overall route in a staggered sequence, all converging at **Marzipan for a shared finale**. The aims: less crowding in narrow streets and at historical places, a sense of independent exploration, the same historical content and learning for every team, and an exciting shared ending. Not designed, planned or built: the current mission order, navigation, Marzipan's finale rules and the multiplayer plan stay as they are. Revisit only after core multi-team play works and the physical route has been tested.
- **Pilot:** validate distributed parts on the well with real participants before expanding them.
- **I4/I5 direction:** decided on 31 Oct 2026; see the next section.
- **Still open:** the plan's gates O16 (team names are decided; part names and the other onboarding copy remain), O17 and O25 (O6 and O15 were approved on 31 Oct 2026) (how many teams one guide can lead at once) (operational and copy choices; no live data migration without separate authorisation), and O20: the 29 Oct line in the protected `.claude/agents/dori-ux-designer.md` still awaits explicit approval or revert, and that file must not be changed meanwhile.

## Approved: I4/I5 direction (owner, 31 Oct 2026)

The owner's decisions on the [I4/I5 roles and well pilot review](i4-i5-roles-and-well-pilot-review.md) (D1–D9), with the owner's later corrections the same day. **I4a is approved for local development only** (built locally, not committed or deployed); the rest of I4 and all of I5 are not built, and the live well is unchanged (3 L / 5 L / 4 L jar). Details and the puzzle check are in the [multiplayer plan](multiplayer-plan.md) (I4, I5).

**I4: permanent roles only.**
- Only **Navigator** and **Submitter** role management. No new Admin role.
- A Team Leader may assign, reassign and release those two roles within their own team.
- Player self-claim, guide oversight and server-side permissions stay as they are. Leaders still get no guide-only permissions.
- Teams of **1–5** are supported; testing prioritises 2–5. I4's acceptance is teams of 1–5 (it said "2 and 6"; the team cap is 5).
- **I4a** (approved for local development, 31 Oct 2026): the leader's assign, reassign and free, checked on the server against the session-bound leader identity, with simple Change controls in the Group tab. No schema change.
- Leadership recovery (a lost leader) is a separate future task.

**I5: optional responsibilities and the well pilot.**
- Spotter, Reader and a future Language Explorer stay optional, per-mission responsibilities with no permissions. One person may take several.
- Solo play stays available through **Show all**, which is one tap away and carries no penalty.
- Don't add roles only to give every team member something to do. Optional parts never gate progress.
- **Spotter** and **Reader** are the preferred draft labels (still drafts under O16).
- **Language Explorer is deferred** until verified language content is available.
- **The well pilot (corrected by the owner, 31 Oct 2026; final clarification 1 Nov 2026; a future pilot, not a live change):** the objective is to **deliver exactly 4 litres to one family**. The **3 L and 5 L vessels are the only measuring tools**. The third container is the family's container, representing the water delivered to the family: **its maximum capacity is unspecified and never appears in the UI or the puzzle rules**. The visual may show it much larger than the vessels and shows the amount delivered, not a capacity. Success is the **quantity delivered** to the family; the 4 L doesn't have to be held in the 5 L vessel first. Delivering stays available throughout; a wrong delivery gets feedback that doesn't reveal the solution, and time stops at the successful delivery (owner, 1 Nov 2026). Overfilling is allowed: it produces that feedback and a Start over option, with no additional point penalty during the pilot. Only the Answer Submitter confirms the final delivery (owner, 1 Nov 2026). This replaces the earlier proposal of a 6 L jar and a Jar keeper, none of which is to be built. The moves, shortest solution and need for both vessels were verified (plan, I5).
- **During the pilot:** completion time is recorded, and the well awards fixed base points with no speed-based differences (owner, 1 Nov 2026); hints stay available until the puzzle is solved; Start over is always offered; the puzzle locks once exactly 4 L has been delivered.
- **No physical cistern-finding task** is designed until the location is field-checked at Gan HaTut.
- **The historical story stays distinct from the puzzle.** The cistern story remains an attributed tradition; the water-distribution puzzle is labelled fiction.

## Progressive challenges and Market Surprise (owner, 2 Nov 2026)

Full plan: [progressive-challenges-plan.md](progressive-challenges-plan.md). Nothing here is built; each build step needs its own approval.

**Approved direction:**
- **Shape:** every stop has one approachable core challenge and zero or more optional challenges. Optional challenges never block, and may offer higher potential points. There is no requirement of three per stop.
- **Answers and play:** varied answer mechanics (choice, matching, photo, physical discovery, puzzle, voice). No photo, recording or AI is ever required to progress. Play is self-guided by default; the guide is optional (a central Guide screen comes later).
- **Hints:** each challenge has its own number of hints (starting pattern: two plus the fallback). A hint lowers the current challenge's *potential* points and never deducts earned points. Hint use is server-authoritative and synced across the team.
- **Points and the fallback:** teams start at 0; there are no protective starting points. "I'm completely stuck" gives 0 challenge points and still lets the team progress. **This supersedes "no unsolved guide override" for that purpose.**
- **Timing:** navigation and challenge times are recorded silently, separately for optional challenges. No visible clock, no automatic speed penalty. The I5 well keeps its fixed points.
- **Previews:** they show the number of challenges, each one's difficulty and its potential points. **This supersedes "Before play, screens show only the food tokens a mission gives, never a points promise" (24 Oct).**
- **Reward pop-ups:** one compact, dismissible pop-up per award, never stacked or repeated after reconnecting. An optional, mutable sound; reduced motion respected. Hints get a related but distinct cost confirmation.
- **Solo:** solo play is a first-class mode: one player can finish everything without a guide or role administration.
- **Achievements:** personal statistics first. Rankings only in the future, verified, opt-in and in fair categories; nothing is ever invented.
- **Market Surprise:**
  - The umbrella system: Chance, Skill, Discovery, Mishap. Optional; the risk is disclosed first; a loss never blocks progress.
  - **D13:** a voluntary risk may reduce the stop's earned points, and the team is told plainly first. This is a narrow exception to "never deduct earned points".
  - **D14 (pilot configuration only):** "Feeling Lucky" dice: 1–2 double, 3–4 lose 25 %, 5–6 keep; expected value +25 % of the stake. Stake at most 200 challenge points from the stop; gain at most +200, loss at most −50. One roll per team per adventure, at one ordinary market stop, no re-roll. Navigation points, food tokens and achievements are never at stake. Server-side randomness, scored exactly once.
  - **D15:**
    - Offers are preallocated, at most 2 per team per adventure: A, the dice roll (at most 1 risky roll); B, an educational or skill mini-challenge.
    - Stops come from an approved pool of ordinary market stops (never sacred or sensitive), with no reliance on numbered order. Each surprise stays hidden until offered.
    - Declining is allowed. Being faster earns no extra opportunities, and there are no performance triggers in the pilot. A skipped stop's offer moves to an eligible unvisited stop.
  - **D16:** surprise points count in the normal total; each delta is still recorded.
  - **D17:** the Vendor's Call. Players listen for an authentic call (or use one verified example), understand it and repeat it. The phone's own recorder is an optional personal aid. DORI never records, collects, uploads or keeps vendor audio. Players are never told to interrupt vendors, and are encouraged to ask consent before recording anyone. Fixed participation points, no AI judging or accent scoring. **Market Jury** (two consenting teams teach and understand a phrase) is a future experiment with no point values.
- No real money, purchases or paid re-rolls.

**Solo play (owner, 2 Nov 2026):**
- **D6:** players confirm arrival with an explicit "We're here", without GPS or a guide; it earns the stop's navigation points once.
- **D12:** an authenticated team of exactly one automatically has the Navigator and Answer Submitter permissions.
- **Wording and controls:** natural, personal wording (approved lines: "Take a moment to discover this story.", "What do you think?", "Nicely done!", "You've made it!", "Playing solo"); Group simplified to "Playing solo"; every well control available to a solo player.
- **Milestones:** Phase 1 is accepted on solo completion with correct answers; finishing when stuck is Phase 2's milestone.

**Scoring, help and rewards (owner, 2 Nov 2026):**
- **D1:** scoring model B. All of a challenge's hints together can take at most a set share of its maximum, later hints cost more (weights 1 : 2 : 3 …), and a correct solve keeps the rest. Values are still to be approved.
- **D2:** a correct solve always earns a minimum reward (model B's floor). An optional challenge is worth at most 2× its stop's core challenge.
- **D3:** food tokens come only from the core challenge, and a team that reveals the core answer ("I'm completely stuck") still gets them.
- **D5:** "I'm completely stuck" may be pressed by the Submitter, by anyone while the Submitter seat is empty, and by the guide. A solo player holds the Submitter role (D12).
- **D11:** the reward sound is off by default; each device can turn it on.

**Rabbi Levin (owner, 2 Nov 2026, D4):**
- Rabbi Aryeh Levin's stop is a **normal stop**: the same scoring, hints, "I'm completely stuck" and rewards as any other stop, with no free help and no special quiet treatment decided in advance. This replaces the plan's recommendation of free hints and a free reveal there, and the "never competitive" rule for this stop.
- There is more knowledge about Rabbi Levin that the game can use. Explore it through `/experience-design` before deciding his challenges; don't settle his stop's content or treatment early.
- **Chesed VeRachamim (owner, 2 Nov 2026):** also a normal stop.

**Decided (owner, 2 Nov 2026): D7–D10, all as recommended.** D7: timing is for analytics only during the pilot. D8: voice is on-device recording and playback only, no speech recognition or AI scoring. D9: labels are a teaser + Main/Optional + difficulty ("A Hidden Symbol" for the mural riddle). D10: go ahead with research run 08, the field checks and draft copy for the lion riddle and "Say it like Ohel Moshe"; the optional-challenge engine is unblocked.

**Decided (owner, 3 Nov 2026): the lion riddle's reveal stays simple.** Four points: the word *Jew* (*Yehudi*) points back to Judah; the lion was the symbol of the biblical tribe of Judah; it is also the Jerusalem municipality's emblem (since 1949); the mural's artists took their lion from the Lions' Gate. Run 08's other material (*Yehud*, the Greek and Latin forms, Mordecai, Baybars' leopards, the market's name) stays out of the reveal. The wording is still a draft (`TODO(copy)`).

**Decided (owner, 3 Nov 2026): the mural stop's rework direction.**
- **Look first:** the challenge opens with a short "Phones down, look up" screen, **with no countdown** (owner, 3 Nov 2026: a timer would pull their eyes back to the phone). The group looks at the wall, points and argues about what is real. Only then does the list appear.
- **Working together is the goal:** less time on the phone, more solving as a group.
- **The reveal:** fill it from run 07 (the real blinds and railings painted to match, the IEC's thank-you workers). The owner's reading of the mural's purpose: bring people to a low-key, poor corner and help them discover it. That needs a source before it becomes a claim.
- **Research first:** research on the web and import the results into the project before content and build decisions. The "real people in the mural" angle is to be researched again, not treated as blocked.
- **The aha moment (owner, 3 Nov 2026):** why CitéCréation paints: it picks overlooked, poor places to draw people into the street, and (the owner's reading) property values rose where it painted. Run 09 sources the Jerusalem purpose (tourism) and the social-housing approach; **the property-value rise has no source yet**, so it can't be stated as fact.
- **Ideas to explore (owner, 3 Nov 2026):** the name "Trompe-l'œil (trick of the eye)"; "Who painted it?" and "What technique?" as typed answers; "What's real?" checked against CitéCréation's photos; the Israel Post souvenir sheet (₪20, run 09) as a number to find, a spot-the-difference or the key to the next piece.
- **The owner's answers on those ideas (3 Nov 2026):**
  - The ₪20 / 15-stamps mix-up may itself become a question (read the page carefully: which number is the price?).
  - "Trompe-l'œil" (French: "deceive the eye") is the technique. Not a question of its own; it's used inside the "What's real?" challenge.
  - "Who painted it?": the group finds the silver plaque on the wall. The owner proposed a photo read by GPT through the API. **Open:** that conflicts with the rules (answers are checked by deterministic code, never a model; the OpenAI key is never used for scoring; the camera is never the only path). The proposed alternative: the photo is kept for the group only, and the answer is typed or chosen and checked by code. What the plaque says is a field check.
  - The group's **Researcher** goes online; the app gives only the URL (e.g. CitéCréation's Jerusalem page), so no photo rights are needed. There is no Researcher role in the code yet (today: Navigator and Answer Submitter).
- **Rules changed (owner, 3 Nov 2026):**
  - **Ways to answer** vary and should be unexpected; a photo is one form, not for all. **Ways to verify:** the cheapest solution that works, per challenge, possibly an image-analysis API. Written into `content.md`, `coding.md`, `CLAUDE.md` and `AGENTS.md`. This replaces "Never let a model decide" for photo answers. Still to decide when a photo challenge is built: the no-device path rule in `content.md`, and the OpenAI key's "never used for scoring, never in the live container" note in `.env.example`.
  - **Roles:** a new **Researcher** role (goes online from a URL the app gives). The group leader assigns roles during onboarding; a player can hold more than one. A solo player holds them all (as D12).
  - **Mobile data is required.** Web challenges are not filtered out for lack of signal. The offline queue for dropped connections stays.
- **The stamp:** it is real (issue 1171, Sept 2024); its face value is 15 NIS (catalogue), and the souvenir sheet costs ₪20 ([run 09](../../research/results/shuk-places/09_mural_purpose_and_stamp.md)). The owner's 15 was right.
- **Rewards follow difficulty:** the harder the task, the more it rewards. The mural's values are to be set again.
- **Photo answers and image analysis (owner, 3 Nov 2026, after [run 10](../../research/results/app-tech/10_photo_answer_verification.md)):**
  - **Presence is the geolocation's job** (the existing "Check our location"), not the photo check's. The photo check only answers "is this the right thing?"
  - **Fixed, textured objects** (e.g. the market mural): compare with a model trained in-house on our saved reference photos, run on a **separate instance or VPS**, not on the production server. *(4 Nov: the start is a cheap vision API, below; an in-house model is a later option, because it needs more setup.)*
  - **The group chooses** between a typed answer and a photo where both work.
  - **On error, the fallback is a typed answer.**
  - **Creative answers:** e.g. after the Lev Ha'Ir ("heart of the city") answer, a follow-up challenge: frame someone you love inside a heart made with your hands. Solomon Souza's graffiti is another candidate. Idea only; copy is `TODO(copy)`.
  - **Something high up and hard to see** (e.g. a keystone): the photo becomes the way to look at it, and image analysis checks it. Idea to explore.
  - More ideas: [run 11](../../research/results/app-tech/11_image_analysis_challenge_ideas.md), collected with the owner's in the [image-analysis ideas](../../design/inputs/content/challenge-ideas/image-analysis/image-analysis-ideas.md).
  - **Still open:** where the separate instance runs, and whether photos of the group itself (the heart challenge) are sent at all or kept on the phone. The no-device-path rule in `content.md` now reads as "a typed answer is always available".
- **Start photo checks with a cheap vision API (owner, 4 Nov 2026, after [run 10b](../../research/results/app-tech/10b_photo_answer_verification.md)):**
  - The owner approved this at the start: a cheap Claude or GPT model through the API. **Price is not a problem**, and it stays a low price for the end user.
  - **Why an API:** it needs almost no computing power from our small server, which the live sites share. Training and running our own model needs more setup, so it comes later, if at all.
  - Run 10b's figures (4 Nov 2026): **Claude Haiku 5.5** about **$0.14 per 1,000 checks**; GPT-5.6 Terra about $2.90 (its image tokens unmeasured); GPT-4.1 mini and GPT-5 mini are deprecated.
  - **Open:** which checks the model covers (the owner's note "and GPT for…" was cut off); which provider first; the key and service shape (today `.env.example` keeps the OpenAI key for research tools only; the agreed shape is a separate verify service holding the key, with rate limits and a spend cap).
- **Historical-photo souvenir (owner direction, 4 Nov 2026, not approved; [run 10b §10](../../research/results/app-tech/10b_photo_answer_verification.md#10-historical-photo-souvenir-owner-direction-4-nov-2026-not-approved)):** if rights allow commercial use with credit, use and credit the photo; otherwise redraw with AI and say so openly. The value is the souvenir: the family composited into the historical scene, or a ~5-second morph from the old view to today. Run 10b: the Library of Congress Matson photographs are in the public domain (except the colour lantern slides); coverage of the route is unknown.
- **Crops and altered images are a general idea (owner, 4 Nov 2026):** a crop of an artwork, or an altered image such as the mural's "what's missing?", is a design tool to use wherever it works. The right to use the image is a separate question, settled later, as with the deferred photo rights audit. Note which images still need their rights settled.
- **The mural stop's order (owner, 4 Nov 2026):**
  - The parts, in order:
    1. A short intro that gives no detail away but shows the old and the new and the market's character.
    2. "Who painted it?": find the plaque and the artists' name.
    3. Spot the difference: the Researcher gets the URL of the mural's photo on CitéCréation's official site.
    4. The stamp's tricky price question.
    5. The technique question, with "Real or painted?" (trick the eye) as part of it.
    6. The AHA at the end.
  - **Two hints and a difficulty level for every challenge.**
  - The lion riddle isn't in this round.
  - The drafts, answer keys and open choices are in the [mural rework](mural-rework.md). Not approved and not built.
- **The mural review (owner, 4 Nov 2026, after the v1 draft):**
  - **"Who Painted It?"** is the easy, required core, and carries the stop's food tokens (D3).
  - **Then and Now, The Stamp and The Trick of the Eye** are optional; The Trick of the Eye is recommended.
  - **"Why Paint a Market Here?"** is the unscored AHA at the end, in the owner's own wording (kept verbatim in the [mural rework](mural-rework.md), v2).
  - **No scored retail price:** the stamp's discovery stays; the shop price isn't a scored answer.
  - **The Researcher** is an optional responsibility, never a required permission or an obstacle to solo play.
  - **Points** are to be reviewed across the whole adventure before any values are approved.
  - This supersedes plan §7's "No third mural challenge" (2 Nov), and moves "Is It Real or Is It Painted?" from the core into The Trick of the Eye.
- **Real or painted, the owner's correction (4 Nov 2026):**
  - Everything depicted as part of the original painted artwork in CitéCréation's official photograph is **painted**.
  - Don't assume something is real because it looks real or sounds architectural.
  - Ambiguous objects are **FIELD CHECK REQUIRED** and stay out of scored answers until they're verified.
  - The vents, the treble-clef sign, the plaque, and the railings and blinds are FIELD CHECK REQUIRED; the live key in `mural-task.ts` still scores the first three as real.
  - The table is in the [market mural](../knowledge/market-mural-agrippas.md) knowledge file.
- **The mural, v3 answers (owner, 4 Nov 2026):**
  - **Evidence labels are internal only.** "Interpretation (DORI's)" on the AHA's closing line, like every label, stays in the data and is never shown to players (as the 26 Oct "no labels" decision).
  - **Groups choose their route.** Every optional challenge is offered; a group that chooses to spend a long time at one stop to earn every point may do so. There is no per-stop cap on optional points. The required part of a stop stays about 7–8 min.
  - **The painted people are named** (Eli Mizrahi, Benny Dagim, the tea distributor, Moti's son), because the names come from reliable sources (Israel Post, the Yad Ben-Zvi survey). This supersedes v2's "never name the painted people". No figure is pointed at without a source or a field check.
  - **Benny Dagim:** the owner remembers him "on the corner"; a field check confirms whether that's his figure on the mural or his shop.
  - **Removed from the content documents:** run 13's "one stamp per sheet" and the building's 2020 condition. What was recorded before stays unchanged.

**Pending owner approval:** the Market Surprise stop pool (proposed: the Market Mural and Marzipan); all point values and copy.

## Other current owner directions

- Intended access is the owner and seven friends on the existing VPS and host behind Caddy; do not treat the app as private until the actual app and proxy gates are verified.

- **Self-hosted invitation login (approved 24 Oct 2026, latest owner instruction):** implement manually distributed, single-use invitation links, independent authenticated browser sessions, one shared group, local JSON, secure tokens, server-side session validation and backend-enforced roles. No external authentication provider or SMTP. This supersedes the earlier deferred Auth.js/email plan. First demonstrate two identities sharing game progress, then return to playable market challenges. Production deployment still requires explicit approval; the existing development-only boundary remains until a separate protected production app boundary is established.

- Do not permanently store player photos in the app/VPS. Do not send photos to an API until consent, endpoint behavior, provider retention and failure handling are reviewed. `store: false` does not mean zero provider retention.

- Do not display the Rachmo photos in the game; the group can see the place from outside.

- Mural reuse and alteration rights remain unresolved; do not build a mural image task until cleared. *(4 Nov 2026: superseded. Crops and altered images are a general idea; the right to use them is settled later. See "Crops and altered images" above.)*

- **Protected Shuk app (approved 25 Oct 2026):**
  - Address: `https://doriisrael.com/shuk`, with no DNS change.
  - Gate: the app's own single-use invitation links only, with no Caddy password.
  - Its own image (`dori-shuk`), container, data volume and prefix, built from this repo.
  - The owner approved the commit, push, deploy, Caddy route and invitations for three friends (players 4–6).
  - This is the "separate protected app boundary" the earlier rules waited for.

- **Stitch visual direction (approved 25 Oct 2026):**
  - The owner's Stitch mockups (`docs/design/stitch_the_amazing_shuk_ui_ux(4)/`) set the look of the Shuk screens. They are a layout reference only: their copy and features are not approved.
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
    - **The collection:** `docs/design/stitch_the_amazing_shuk_ui_ux(4)/` is a reference collection. A file there may be inspected for context. It doesn't supersede newer designs, isn't approved behaviour, and isn't committed or changed without authorisation.
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

- **Decided (owner, 2 Nov 2026): UX-3 is the first UX item.**
  - Option A: screen-only hiding, on one page.
  - No Ready step: Start is the only gate.
  - Marzipan is left as is until its rework, including the name guess before Start.
  - The plan was approved on 2 Nov 2026.
- **No video support for now (owner, 2 Nov 2026):** nothing in UX-3 or Phase 2 adds video.

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

- **Decided (owner, 2 Nov 2026): UX-4 kept small.**
  - The completion layout stays as it is ("you did well so far, leave it").
  - The points count up **in the reward pop-up only**: once per award, about 0.7 s, none with reduced motion. The card on the page stays still.
  - Marzipan's final action is left for now: it isn't necessarily the last stop.
  - **Both Back buttons at the top of the challenge are removed.** The phone's Back and the Map tab lead away.
  - Chesed VeRachamim (the synagogue) is a normal stop (D4), so it keeps its cheer.

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

*Pilot note (owner, 31 Oct 2026):* the I5 pilot proposes measuring 4 L with the two vessels and delivering it, without a measuring jar, and no speed-based points during the pilot (see the I4/I5 direction above). Until I5 is approved and built, the live well keeps this 4 L jar and the timing below.


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
