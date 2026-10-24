# Content inputs (The Amazing Shuk)

Inputs for the `dori-ux-designer` agent and anyone designing The Amazing Shuk, the Nahlaot and Mahane Yehuda walking game. The brief is Part 2 of [the designer prompt](../../../research/prompts/DORI_UXUI_Designer_Agent_Prompt%281%29.md). The repo-wide content rules are in [content.md](../../../.claude/rules/content.md), and the short summary of the authoring method is [content methodology](../../../docs/content/methodology.md).

Most of the background files here were copied from the platform's creative-treatments folder. They describe methods and are not specific to this game.

## Reading order

**Read in full before designing:**

1. [Mission and task ideas](Mission_Task_Ideas.md): the working bank of stops, tasks, the food-token loop and the start sequence.
2. [Photo index](photo_index_ALL.csv): the master index. What each photo shows, its mission link, whether it has faces and consent, and archive IDs and rights.
3. [Cognitive load](Cognitive_Load.md), [Audience engagement mechanics](Audience_Engagement_Mechanics.md) and [DORI digital platform research](DORI_Digital_Platform_Research.md): the UX and platform research the brief cites.
4. [Machane Yehuda and Nachlaot stories](machane-yehuda-nachlaot-stories.md) and [Run 06: Nahlaot and market site verification](06_nahlaot_market_sites_verification.md): the place content and what has been checked about it.

**Also read:** the brand book and logo in `../brand/`, and each photo in `../photos/no-faces/` before you cite it or plan a crop from it. Photos in `../photos/faces/`, and any photo showing an identifiable person, are for context only: never crop, copy or reproduce them, and refer to them by index number. Photos are kept on disk only, never in git.

**Consult only when a deliverable needs it:** the guiding stories, the authoring system, the guiding methods, research runs 01–04 and the endowment-effect transcript below. Don't read them up front; name the ones you used.

## Rules that still apply

- Visitor-facing wording is approved wording only. Don't paraphrase or invent screen copy from these sources. Where approved wording is missing, mark a `TODO(copy): …` gap ([content.md](../../../.claude/rules/content.md)).
- Factual claims need a source. Dated web research is in [research/results/](../../../research/results/); it is not approved content until the user approves it. The files in this folder are evidence about methods, not about content, except the two place files under item 4 above.
- The runs use their own labels for how well a *method* is supported (direct evidence, review/framework, professional practice, transfer, speculation). Keep them when citing a method, and don't present a method as proven when a run labels it plausible or speculative. Game *content* uses the repo's four evidence labels: Historical fact, Interpretation, Attributed tradition, Fiction.

## Documents

### Game content

| Document | What it is | Use it for |
|---|---|---|
| [Mission and task ideas](Mission_Task_Ideas.md) | Nadav's working bank of ideas (23–24 Oct 2026), tagged DOC, FIELD, ORAL or FOLK. Raw material, not approved missions | The stops, tasks, bonus rounds and food-token loop |
| [Photo index](photo_index_ALL.csv) | Master index of 117 photos (23 Oct 2026): 107 field photos in `../photos/no-faces/` and `../photos/faces/`, plus archival images and the map. Original and new file names, description, mission link, faces and consent, archive item ID, credit and rights. A copy is kept in `../photos/` | Choosing photos and crops; checking for faces |
| [Machane Yehuda and Nachlaot stories](machane-yehuda-nachlaot-stories.md) | Stories, anecdotes and facts extracted from Nadav's Google Drive (15 Oct 2026), each tagged with its source file | Story candidates for stops and reveals; each needs its source and an evidence label |
| [Run 06: site verification](06_nahlaot_market_sites_verification.md) | Perplexity research run (16 Oct 2026) checking which Nahlaot and market sites are publicly visible and documented. Same file as `research/results/06_nahlaot_market_sites_verification.md` | Which stops can carry evidence, and which claims to avoid |

### General knowledge

| Document | What it is | Use it for |
|---|---|---|
| [Guiding stories](DORI_Machane_Yehouda__Guiding_Stories.md) | Five refined guiding scripts (Oct 2026): Rachmo, the market, Raphael the butcher, the blue roof and Nachlaot. Each has a spoken story plus research notes that sort documented, oral, folklore and interpretation, with sources | Background on the stories the guide tells, and the oral sources behind ideas such as *Why blue?*, Rivka's roses and the abaday vote. Not approved game copy. Its links to `01_Rachmo_Refined.md` … `05_Nachlaot_Refined.md` point to separate files that aren't in this repo; the scripts are all inside this one file |

### Authoring system and practice

| Document | What it is | Use it for |
|---|---|---|
| [DORI Content Methodology](DORI%20Content%20Methodology.md) | Research turned into an authoring system (Oct 2026): nine layers, authoring terms, experience block, treatment pattern library | Choosing and specifying a treatment |
| [Guiding methods](guiding_methods.md) | Nadav's guiding philosophy after the interpretation research, plus the AI Content Advisor manual | Tone, priorities and the advisor's working order |
| [Freytag’s Pyramid](Freytag’s%20Pyramid.md) | Explainer on Freytag's five-part dramatic structure (1863) and how modern plot structures differ; copied unchanged from `TourTech/DOCS/content advisor/creative_treatments/` | Shaping a personal story arc. A reference, not a formula: it is built for tragedy, so DORI keeps the introduction, rising movement and the climax as the moment of "fullest energy", and drops the foreshadowing and the catastrophe (as in the platform's Gaza Envelope Chapter 01 framework, which is not in this repo) |

### Research runs (01–04)

Each run file holds the prompt, its input packet and the answer. They were made for the platform's tours (run 01 starts from the Oct 7 tour inventory), so check that a finding transfers to an outdoor family game before using it.

| Document | What it is | Use it for |
|---|---|---|
| [Run 01: Gap discovery](01_gap_discovery_creative_treatments.md) | Gap analysis of the Creative Treatments Inventory (DORI Oct 7 tour) with new treatments, atoms and combination recipes | Finding treatment options beyond the usual ones |
| [Run 02: Embedded questions](02_embedded_questions_deep_dive.md) | Taxonomy of question atoms, placement, questions inside content forms, branching | Writing questions that change what happens next |
| [Run 03: Evidence validation](03_evidence_validation_and_constraints.md) | Evidence table, validated family cards, constraint matrix, transferability audit | Checking how well a treatment is supported and where it breaks |
| [Run 04: Synthesis](04_synthesis_for_content_methodology.md) | Normalized research packet: canonical families, atom libraries, combination grammar, confidence labels, what must not become a rule | The canonical vocabulary behind the methodology |

### Background and UX notes

| Document | What it is | Use it for |
|---|---|---|
| [Audience engagement mechanics](Audience_Engagement_Mechanics.md) | Landscape survey: museums, theme parks, tours, games; 16 examples, a mechanic taxonomy and families; teen engagement. Same text as `docs/scavenger_hunt/audience_engagement_and_interactive_digital_experiences..md` | Ideas for interaction mechanics |
| [DORI digital platform research](DORI_Digital_Platform_Research.md) | Research on DORI's digital platform; copied from `docs/scavenger_hunt/Cluade-Dori-digital-platform.md` | The restraint rules the brief cites (no badges, chatbots or social sharing) |
| [Cognitive load](Cognitive_Load.md) | Edited transcript of a UX talk: intrinsic vs extraneous load; avoid clutter, build on mental models, offload tasks | Keeping screens and steps light |
| [Endowment effect](Endowment_Effect_Creatively.md) | Edited transcript of a UX talk (partial recording): customization, interactive previews, personal investment, breaking attachment | Building player ownership, e.g. choices the player makes and keeps |

The two UX transcripts have no recorded speaker or source; treat them as general design guidance, not evidence.
## Game task, food and implementation discovery

- Start with [Mission and task ideas](Mission_Task_Ideas.md), the 35-entry working bank plus the opening mural, token loop and Rachmo board transcription. The file labels these as ideas; it is not approved player content. Its old team competition and team-earned points/tokens are superseded by the one-shared-group decision in [product decisions](../../../docs/project/product-decisions.md).
- The strongest low-cost candidates to investigate first are idea #24 (portable measuring puzzle; only the cup prototype exists), #13 (count the synagogue's twelve-tribes door), #15 (transcribe the Montefiore gate inscription), #27 (decode the Beit El panel), #1 (read the sundial), and #31 (gematria). These are shortlist recommendations, not approved or field-verified tasks. Confirm sites, exact answers, access and copy before implementation.
- [Photo index](photo_index_ALL.csv) is the visual-reference register, not a photo asset folder. In this checkout the photos directory contains only .gitkeep and the index CSV; indexed photos are unavailable. The index flags identifiable people, minors, private homes and archive rights. Mural crop/alteration rights remain unresolved; see [mural research](../../../research/results/07_citecreation_market_mural.md).
- Food candidates are in idea #32 and the menu/route sections of the ideas file: kubbeh (Rachmo), etrog drink (Etrog Man), rugelach (Marzipan), tahini tasting (mill), and malawach (Jahnun Bar). The culinary route adds Rahmo, Hachapuria, Cookie Cream, Hayazdi, Chochmat HaBurekas MeHaifa, Mizrahi Nuts and conditional/story-only stops; see [English tour draft](../../../docs/scavenger_hunt/Machane_Yehuda_Tour_EN.md) and [site research](06_nahlaot_market_sites_verification.md). These are leads, not confirmed live offers or group tastings.
- Rachmo's board and shekel amounts are a transcription from an owner's photo, explicitly awaiting restaurant confirmation. No food-token menu costs are set: +3 per stop is a brainstormed task reward, not a vendor price. Token costs and redemption terms remain pending owner decision and vendor agreement.
- The site research is dated 16 Oct 2026; the task/photo bank is dated 23–24 Oct 2026. Neither date means a claim or offer is approved. Check the source files for evidence labels, caveats and citations before use.

### Current playable-task slice

The [local water task](../../../app/dev/amazing-shuk/water/page.tsx) now uses a [story-backed task definition](../../../lib/amazing-shuk/water-task.ts), [three-container rules](../../../lib/amazing-shuk/water-measurement.ts) and authenticated shared JSON progress. Owner-approved iteration: 3 L / 5 L well vessels fill a separate 4 L family jar, all digitally. The physical cup variant above is historical brainstorming, superseded for this task.

Story discovery: [original Hebrew transcript](../../../docs/scavenger_hunt/HE_trans.txt), lines 54-66, and [English tour](../../../docs/scavenger_hunt/Machane_Yehuda_Tour_EN.md), Stop 5. The story is **Attributed tradition**; the transcript names Yossi Banai as the attributed recollection but does not explicitly state once a year. English is now adapted from the full Hebrew cistern section; original Hebrew is available only in development source details and is not rendered in production. The invented family-ration puzzle is labeled separately.

See the [task/source/brand verification record](../../../docs/project/water-task.md), [current state](../../../docs/project/current-state.md) and [shared handoff](../../../docs/project/agent-handoff.md). Source photo #66 is not used; no physical well interaction or player-facing timer was added. Provisional local rewards are now configured in the task record. Brand reference: [DORI Final Brand Book](../brand/DORI_Final_Brand_Book.pdf).


The water task now demonstrates the reusable process in the [existing Codex designer guidance](../../../docs/design/codex-amazing-shuk-partner.md): short owner-approved story, contextual vessel controls, return-to-well actions and three optional local hints. The [task record](../../../docs/project/water-task.md) contains the intended two-round solution and latest verification; preserve its existing provenance and boundary notes.


Latest well iteration: the [same designer guidance](../../../docs/design/codex-amazing-shuk-partner.md) now includes Hebrew-first adaptation and invisible timing/rewards. Read full HE_trans.txt 54-66 before adapting: current brief preserves the oral story's honor/punishment contrast in 40 English words; production omits Hebrew body. [Task record](../../../docs/project/water-task.md) documents hidden server timing, shared scored hints, provisional local rewards and schema3 migration. No new research/source file or instruction framework was created.


Current Gan HaTut map slice: the [existing well/map record](../../../docs/project/water-task.md#current-gan-hatut-map--optional-gps-slice-24-oct-2026) documents the same playable task, optional **We're Here?**, a separate one-time arrival bonus, provisional illustrated pin and unresolved garden photograph/coordinate confirmation. GPS never gates story/puzzle access. Use this record and [shared decisions](../../../docs/project/product-decisions.md) rather than earlier GPS-unlock/no-GPS proposals. No additional task or photo source is approved by this integration.
