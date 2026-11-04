# Research results

Dated research runs. **Research, not approved content:** a claim moves into a game only after the owner approves it, and the parts that can serve a challenge are imported into `docs/knowledge/` with their source and evidence label ([content.md](../../.claude/rules/content.md)). Prompts are in [`research/prompts/`](../prompts/); runs 01–06 were made with the Perplexity runner in [`research/perplexity/`](../perplexity/), which writes new files to this folder's root: file each one into its folder below and add it to this index.

## `shuk-places/`: places on The Amazing Shuk's route

| Run | Date · method | Main findings | Used in |
|---|---|---|---|
| [06 Nahlaot and market sites](shuk-places/06_nahlaot_market_sites_verification.md) | 16 Oct · Perplexity | Which Nahlaot and market sites are publicly visible and documented; the cistern only after an on-site check; no evidence-bearing stop on the Kurdish mosaic, one 1882 report or Rahamim's alleged charity | [content inputs](../../design/inputs/content/README.md) (a copy is kept there), [water task](../../docs/project/water-task.md), [discovery](../../design/output/00_discovery.md), [experience design](../../.claude/skills/experience-design/references/project-context.md) |
| [07 The market mural](shuk-places/07_citecreation_market_mural.md) | 23 Oct · Claude Code | Hanukkah 2001; CitéCréation (Oullins, Lyon); "103" is the IEC fault line in the painting, not the house number; real, named people are painted in it; rights holder CitéCréation | [knowledge: the market mural](../../docs/knowledge/market-mural-agrippas.md), [mural task](../../lib/amazing-shuk/mural-task.ts), [assumptions](../../design/output/01_assumptions.md), [progressive plan](../../docs/project/progressive-challenges-plan.md), [experience design](../../.claude/skills/experience-design/references/project-context.md) |
| [08 The lion riddle and *avnei zikaron*](shuk-places/08_lion_riddle_and_avnei_zikaron.md) | 3 Nov · Claude Code | Judah → *Yehudi* → *Jew* holds, without *Yehud* as a step; Dan is also "a lion's whelp"; the Lions' Gate animals are probably Baybars' leopards; the market is named after Yehuda Navon; *avnei zikaron* is Exodus 28:12 | knowledge: [the market mural](../../docs/knowledge/market-mural-agrippas.md) (the lion) and [the Ohel Moshe gate](../../docs/knowledge/ohel-moshe-gate.md), [progressive plan](../../docs/project/progressive-challenges-plan.md), [handoff](../../docs/project/agent-handoff.md), [experience design](../../.claude/skills/experience-design/references/project-context.md) |
| [09 Why CitéCréation painted it; the stamp](shuk-places/09_mural_purpose_and_stamp.md) | 3 Nov · Claude Code | The Jerusalem purpose was tourism; the approach is murals in social-housing districts with residents; the property-value claim has no source; stamp issue 1171, 15 NIS face value, souvenir sheet ₪20 | [knowledge: the market mural](../../docs/knowledge/market-mural-agrippas.md), [product decisions](../../docs/project/product-decisions.md), [handoff](../../docs/project/agent-handoff.md) |
| [12 Answer-key checks for the mural rework](shuk-places/12_mural_rework_checks.md) | 4 Nov · Claude Code | CitéCréation's four photos of the wall (before, work, whole wall, shop); then and now: a tree, the drinks fridge gone, faded colours, while the vents, the plaque and "103" were there from the start; the shop page shows ₪20.00, "15 stamps" and ₪99, and "15 stamps" doesn't fit a 15 NIS face value | [knowledge: the market mural](../../docs/knowledge/market-mural-agrippas.md), [mural rework](../../docs/project/mural-rework.md) |
| [13 The mural's fridge, painted boxes and real people](shuk-places/13_mural_fridge_boxes_people.md) | 4 Nov · Claude Code | The guide's transcript: a fridge painted on a cabinet door, with prices that froze while the market's rose, and the boxes complaint after the unveiling (both guide anecdotes, uncorroborated). The Yad Ben-Zvi survey's parallel tale of the painted car-for-sale note. Israel Post's flyer in full: one stamp per sheet; Eli Mizrahi, Benny Dagim, the tea distributor and Moti's son named but not placed | [knowledge: the market mural](../../docs/knowledge/market-mural-agrippas.md), [mural rework](../../docs/project/mural-rework.md) |

**Imported into `docs/knowledge/` (4 Nov 2026):** the challenge-serving parts of runs 07–09 are in [the market mural](../../docs/knowledge/market-mural-agrippas.md) and [the Ohel Moshe gate](../../docs/knowledge/ohel-moshe-gate.md). Run 06 is not imported yet.

## `app-tech/`: how the app captures, renders, stores and verifies

| Run | Date · method | Main findings | Used in |
|---|---|---|---|
| [01 Camera and microphone](app-tech/01_camera_microphone_pwa.md) | 16 Oct · Perplexity | The native camera picker for optional photos; short foreground `MediaRecorder` audio; a typed or guide path always equal; no background upload | [discovery](../../design/output/00_discovery.md), [experience design](../../.claude/skills/experience-design/references/project-context.md) |
| [02 Puzzle rendering](app-tech/02_puzzle_animation_tech.md) | 16 Oct · Perplexity | Ordinary DOM controls, small SVGs and CSS transitions; no game engine; rules in pure functions | [discovery](../../design/output/00_discovery.md), [experience design](../../.claude/skills/experience-design/references/project-context.md) |
| [03 Media, audio and offline](app-tech/03_media_formats_audio_offline.md) | 16 Oct · Perplexity | Text-complete and offline-capable; WebP/JPEG, H.264 MP4, short MP3; about 100 MB per phone; a local outbox plus a server event log | [discovery](../../design/output/00_discovery.md), [experience design](../../.claude/skills/experience-design/references/project-context.md) |
| [10 Verifying a photo answer](app-tech/10_photo_answer_verification.md) | 3 Nov · Claude on the web | ORB + RANSAC first, Google Vision OCR for text plaques, about $0–$1.50 per 1,000 checks, no LLM in the main path; no check proves presence | [product decisions](../../docs/project/product-decisions.md) (owner's 3 Nov photo decisions), [handoff](../../docs/project/agent-handoff.md), [prompt 11](../prompts/11_image_analysis_challenge_ideas.md) |
| [10b Photo verification, full re-run](app-tech/10b_photo_answer_verification.md) | 4 Nov · Claude, agentic | Run 10's core stands; a check, fallback and unsure path for each of seven challenge types; self-confirm plus a typed question as the self-guided fallback; Hebrew OCR: Google first, AWS second, Azure not listed; Claude Haiku 5.5 about $0.14 per 1,000 checks, three of run 10's models deprecated; location and biometrics are "especially sensitive" under Amendment 13; photographing whole objects weakens memory, zooming doesn't; Matson photos are public domain | [product decisions](../../docs/project/product-decisions.md) (owner's 4 Nov vision-API decision and souvenir direction), [image-analysis ideas](../../design/inputs/content/challenge-ideas/image-analysis/image-analysis-ideas.md) |
| [11 Image-analysis challenge ideas](app-tech/11_image_analysis_challenge_ideas.md) | 4 Nov · Claude on the web | Use a photo only when a multiple-choice question would lose something; 20 ideas ranked, five best for this walk (Stone Safari, Secret Above Your Head, Time Machine, Market Rainbow, Mural Comes Alive); check eligibility, never quality; ideas to avoid | [image-analysis ideas](../../design/inputs/content/challenge-ideas/image-analysis/image-analysis-ideas.md), [product decisions](../../docs/project/product-decisions.md), run 10b |

Runs 01–03 were written for the Memory Protocol pilot; their technical findings apply to both games.

## `memory-protocol/`: The Memory Protocol only

| Run | Date · method | Main findings |
|---|---|---|
| [04 HARMONY and the OpenAI API](memory-protocol/04_harmony_openai_feedback.md) | 16 Oct · Perplexity | Fully scripted HARMONY replies for the pilot; AI-written replies only later, with guide approval; never AI-suggested marks |
| [05 Library sources and access](memory-protocol/05_library_sources_and_access.md) | 16 Oct · Perplexity | Build the Library task around a preordered, available book and a fact players can verify in it; catalog entries are leads, not proof; the 1948 HaShaked Street photograph |

Not a source for The Amazing Shuk.

## `competitors/`: city-quest competitor research (DORI strategy)

| File | What it is |
|---|---|
| [Executive memo](competitors/DORI_Executive_Strategy_Memo.md) (3 Nov) | One page: what the evidence can support, eight conclusions, the next steps and the decisions it asks of the owner. Start here |
| [Phase 4 synthesis](competitors/DORI_Phase4_Synthesis.md) (3 Nov) | The full version: conclusions C-01 to C-08, the system map, white spaces WS-01 to WS-10, hypotheses H-01 to H-12, the opportunity register OPP-001 to OPP-011, the audits |
| [Plain-language synthesis](competitors/DORI_Competitive_Research_Strategy_Synthesis.md) (4 Nov) | The two Phase 4 studies merged for discussion. Its source list uses the original download names with "(1)"; the memo and the library here are those files |
| [Research library](competitors/DORI_Research_Library.xlsx) | The evidence behind them: 107 sources, 116 findings, 18 platforms, the 22 × 45 comparison, strategy profiles. Start at its README sheet |

**Main findings:** strong enough to frame tests, not to make product decisions (84% vendor documentation, nothing played). Place-dependent tasks are the clearest way to stand apart; no competitor visibly labels fact, legend and fiction; the two Mahane Yehuda competitors (Mifrasim, BeeTravel) are the least documented. The only evidence-supported gap is a self-guided consumer game with an optional guide layer. Strategy and market research: nothing here is a challenge fact for `docs/knowledge/`. The decisions it asks of the owner are in the [handoff](../../docs/project/agent-handoff.md).

## Other

- `run.log`: the Perplexity runner's output for runs 01–06 (16 Oct 2026). Its paths are from before the folders.
