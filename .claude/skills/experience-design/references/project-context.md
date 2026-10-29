# The Amazing Shuk: project context

Read this before applying the process to Shuk work. It points to the project's own sources rather than repeating them; when they change, they win.

## The game

A real-world walking game in Nahlaot and Mahane Yehuda, Jerusalem. One cooperative group (often three generations of an American family, or friends) plays together with a human guide; everyone signs in on their own phone and shares one progress. Roles exist already: a navigator and an answer-submitter, everyone else an advisor. No teams, no competition between players. Played outdoors, in sun, on the move, with weak signal. No sci-fi frame: never mix in Memory Protocol content (HARMONY, the Israelianes, the crisis layer).

What is built and what is next: [current state](../../../../docs/project/current-state.md), the top of the [handoff](../../../../docs/project/agent-handoff.md) and the [roadmap](../../../../design/amazing-shuk-roadmap.md). The missions' data is in `lib/amazing-shuk/*-task.ts`.

## The owner's direction (29 Oct 2026)

Recorded in [product decisions](../../../../docs/project/product-decisions.md) and the [skill brief](../../../../docs/project/experience-design-skill-brief.md):

- The physical world is the centre; technology serves the game, not the reverse.
- Every stop has its own character; one connecting line runs through the whole game.
- Knowledge → story → an interaction that changes from stop to stop and brings the whole group in → discovery, a memorable moment, a surprise.
- Find the experiential potential inside the actual historical stories before choosing mechanics.
- Ideas kept for later: **split clues across phones** (real multiplayer), **predict first** at some stops (not all), **souvenirs from each stop leading to a final puzzle**, with the open question of what those objects *mean*.
- The market itself can also hold challenges (not only the closing food reward).

## Rules this skill does not override

- **Copy:** never invent or paraphrase visitor-facing copy as final; proposed lines are drafts for the owner, marked `TODO(copy)` in data ([content rules](../../../rules/content.md)).
- **Evidence:** facts need sources; research in `research/results/` is not approved content. The data labels every statement (Historical fact, Interpretation, Attributed tradition, Fiction); the Shuk shows no labels on screen, so the wording carries the hedges. Never write "A guide tells that…".
- **Consent and access:** no photos or recordings of bystanders or vendors without consent; camera, microphone or GPS is never the only way through; GPS never gates a story or challenge.
- **Sensitive places:** no timed or competitive play at grief, memorial or sacred places. Rabbi Aryeh Levin's stop is untimed, has no hints, and gets a quiet cheer.
- **Reading load:** one idea per screen; a reading block of at most 40 words, a reveal of at most 60 ([designer agent](../../../agents/dori-ux-designer.md)); a read-aloud introduction of 4 to 5 short lines.
- **Scoring:** points, food tokens, unlocks and answer checks are deterministic code with tests, and reward values are provisional until the owner approves them.
- **Restraint:** the platform research rejects points, badges, streaks, leaderboards and "share to social" for guided tours ([DORI digital platform research](../../../../design/inputs/content/DORI_Digital_Platform_Research.md), sections on restraint). The Shuk keeps points and food tokens by the owner's choice; anything new in that direction (collectibles, progress systems) must have real meaning, not just count.

## Existing method this skill builds on

Use these instead of rewriting them:

| Source | What it gives this process |
|---|---|
| [Guiding methods](../../../../design/inputs/content/guiding_methods.md), especially "AI Content Advisor — Practical Operating Manual" | The owner's philosophy: place first → guide → digital; "what can the visitor encounter here?"; topic vs meaning; the question toolbox (observation, evidence, comparison, prediction, perspective, family conversation, reflection); joint attention; the hotel-room test; multi-generational design |
| [DORI Content Methodology](../../../../design/inputs/content/DORI%20Content%20Methodology.md) and its [short summary](../../../../docs/content/methodology.md) | The authoring vocabulary: BIG IDEA, OUTCOME, AHA, ANCHOR, TREATMENT, ASK, SHOW, DO, NOTICE, REVEAL, BRANCH, BRIDGE, WAIT; the 11 treatment families; keeping treatment, interaction, question, source and renderer separate |
| [DORI digital platform research](../../../../design/inputs/content/DORI_Digital_Platform_Research.md) (same text in `docs/project/Cluade-Dori-digital-platform.md`) | The restraint rules: every screen must justify itself against the real experience it displaces |
| [Audience engagement mechanics](../../../../docs/content/audience_engagement_and_interactive_digital_experiences..md) (same text as `design/inputs/content/Audience_Engagement_Mechanics.md`) | 16 real examples, a taxonomy of 30 mechanics, mechanic families, educational principles, teen notes, surprising cross-domain ideas. Consult it in step 3 *after* sketching concepts, to name, refine or stretch them, never as the starting menu |
| [Research runs 01–04](../../../../design/inputs/content/) | Creative treatment gaps, embedded question atoms, evidence for treatments, the canonical synthesis |
| [Cognitive load](../../../../design/inputs/content/Cognitive_Load.md), [Endowment effect](../../../../design/inputs/content/Endowment_Effect_Creatively.md), [Freytag's Pyramid](../../../../design/inputs/content/Freytag’s%20Pyramid.md) | Keeping steps light; ownership through choices players keep; shaping a story arc |
| [The Shuk brief](../../../../research/prompts/DORI_UXUI_Designer_Agent_Prompt%281%29.md), Part 2 | What the game is meant to be: start sequence, game loop, content, key screens, constraints |
| [Codex's game design partner](../../../../docs/design/codex-amazing-shuk-partner.md) | The build loop after a treatment is approved, Hebrew-first storytelling, invisible timing and rewards, optional location assistance |
| [The well record](../../../../docs/project/water-task.md) | The one fully worked task so far, from source to tested build: a model for step 10 |
| [Designer deliverables](../../../../design/output/) (`00_discovery.md`, `01_assumptions.md`) | The `dori-ux-designer` agent's survey of inputs and its open assumptions |
| [Brand to UI](../../../../docs/design/dori-brand-to-ui.md) | The look the experience will be rendered in; restrained, warm, editorial |

## Raw material for step 1

Content sources, not approved copy. Check each claim's evidence status before using it.

| Source | What it holds |
|---|---|
| [Mission and task ideas](../../../../design/inputs/content/Mission_Task_Ideas.md) | The owner's bank of 35 stop and task ideas tagged DOC, FIELD, ORAL or FOLK, the food-token loop, a mechanics menu and the parking lot |
| [Guide's recorded tour, Hebrew](../../../../docs/knowledge/HE_trans.txt) | The owner's spoken tour, the original of several stories (the well, Marzipan). Read the full section before adapting |
| [Culinary tour, English](../../../../docs/knowledge/Machane_Yehuda_Tour_EN.md) and [Hebrew](../../../../docs/knowledge/Machane_Yehuda_Tour_HE.md) | The 22-stop Nahlaot and market tour (10 Oct 2026) the missions draw on |
| [Place stories](../../../../design/inputs/content/machane-yehuda-nachlaot-stories.md) (same text in `docs/knowledge/`) | Stories and anecdotes from the owner's Drive, each tagged with its source file |
| [Guiding stories](../../../../design/inputs/content/DORI_Machane_Yehouda__Guiding_Stories.md) and [Five stories review](../../../../design/inputs/content/DORI_Five_Stories_Editorial_Research_Review.md) | Five refined guiding scripts with research notes; the review's rule: keep the oral telling intact, and keep transcript, researched notes and performance script apart |
| [Site verification, run 06](../../../../design/inputs/content/06_nahlaot_market_sites_verification.md) | Which places are visible and documented, and which claims to avoid |
| [Mural research, run 07](../../../../research/results/07_citecreation_market_mural.md) | The market mural's artists and year |
| [The Armoza family](../../../../docs/armoza/Armoza_fam.md) | Background for Chesed VeRachamim (family consent first) |
| [Photo index](../../../../design/inputs/content/photo_index_ALL.csv) | What each owner photo shows, faces and consent, rights; photos stay on disk |
| [Map audit](../../../../docs/map/nahlaot-map-audit.md) | How the illustrated map lines up with the real streets |

## Feasibility references for step 9

Written for the Memory Protocol on 16 Oct 2026; the technical findings transfer, the story parts don't.

- [Camera and microphone](../../../../research/results/01_camera_microphone_pwa.md): optional photos and short audio, with a typed account or guide confirmation always an equal path.
- [Media, audio and offline](../../../../research/results/03_media_formats_audio_offline.md): text-complete and offline-capable first; short, optional human-recorded audio.
- [Puzzle rendering](../../../../research/results/02_puzzle_animation_tech.md): ordinary DOM controls, small SVGs and CSS transitions, no game engine.

## Not sources for the Shuk

The Memory Protocol's [story](../../../../docs/knowledge/The_Memory_Protocol_Story_V1%281%29.md), [working plan](../../../../docs/knowledge/Memory_Protocol_New_Chat_Handoff_v02.md), [library tour](../../../../docs/knowledge/National_Library_of_Israel_Formatted_Tour.md) and the HARMONY research (`research/results/04_*`, `05_*`) belong to the other game. Use the skill's process for the Memory Protocol too, with those as its sources, but never mix the two games' content.

## Where the output goes

This skill works upstream of design and code. A recommended treatment goes to the owner first. After approval:

- the `dori-ux-designer` agent turns it into flows, wireframes and specs (writing only under `design/output/`);
- the build follows the [reusable task design process](../../../../docs/design/codex-amazing-shuk-partner.md#reusable-task-design-process) (smallest playable version, full tests, mobile review, one improvement at a time) and the project's coding and verify rules;
- decisions go into product decisions, the handoff and current state.

Carry the creative intent into those steps (step 10): what must stay physical, what must be withheld, what the memorable moment must feel like.
