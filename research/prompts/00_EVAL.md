# Evaluation of `prompts/scavenger_hunt_prompt.md` for Perplexity

Checked 2026-10-16 against the Perplexity prompting checklist
(`mentor/docs/constructor/prompts/perplexity-research-prompting.md`).

**Verdict: not ready to send as written.** The content is strong; the shape is wrong for one research run.

| Checklist item | Status | Notes |
|---|---|---|
| Clear instruction | Partly | Clear verbs, but about 12 deliverables (A–L) in one run |
| Context | **Fails** | Written as an addendum to an "existing brief" and "previous requirements" (sections 1–16) that Perplexity has never seen. Self-hosting, team play, the illustrated map and the guide role are assumed, not stated |
| Input | OK | Specific missions, puzzles and constraints |
| Keywords | OK | Precise APIs and libraries (getUserMedia, MediaRecorder, Rive, Structured Outputs) |
| Output format | OK, but oversized | Tables per screen (14 fields × ~33 screens) and per puzzle (13 fields × 7) |
| Timeframe | **Missing** | Browser, PWA, license and API-pricing facts change; nothing bounds them in time |
| Source direction | **Missing** | No push toward MDN, WebKit/Chromium docs, vendor license pages, OpenAI docs, or the National Library of Israel and Hebrew sources |
| Scope narrowed | **Fails** | Seven sections in one prompt, so each gets shallow coverage |
| Counter-arguments | Partly | Options A/B/C for HARMONY, nothing for the rest |
| Verifiable citations | **Missing** | No evidence labels, no source register; the site-asset list needs proof that each place exists and where |
| Mode | Not stated | Needs deep research |
| Research vs design | **Mixed** | The screen inventory (§17), the production plan (§23) and deliverables A, B, G, I, J, L are product design work. A web-search engine cannot research them, so it would invent them |

## What changed

The prompt is split into six self-contained deep-research prompts, each covering only what live web evidence can answer:

1. `01_camera_microphone_pwa.md`: §20 (camera, microphone, PWA limits)
2. `02_puzzle_animation_tech.md`: §18 (animation and puzzle technology per puzzle)
3. `03_media_formats_audio_offline.md`: §19 media formats, audio, file size, offline and state sync
4. `04_harmony_openai_feedback.md`: §21–22 (OpenAI API for HARMONY, voice)
5. `05_library_sources_and_access.md`: the National Library catalog records and current Library rules
6. `06_nahlaot_market_sites_verification.md`: the Nahlaot and Mahane Yehuda stops (fact and rights verification)

**Revision 2 (2026-10-16), aligned with `docs/scavenger_hunt/`:**
- `_context.md` now follows the approved story (`The_Memory_Protocol_Story_V1(1).md`): HARMONY is the Israelianes' quantum system that rewrote history, not "an AI from a parallel Earth".
- It also follows the handoff (`Memory_Protocol_New_Chat_Handoff_v02.md`): one family of six as three pairs, the Library flow and the three-layer scoring.
- **Crisis answers are scored by the guide's rubric.** Prompt 04 now treats AI only as an optional writer of HARMONY's replies, and asks whether it is worth it at this scale.
- Prompt 02 reframes the tomato puzzle as a fictional large buyer, with no real company portrayed.
- Prompts 05 and 06 carry the handoff's real catalog IDs, addresses and known gaps from the market tour, so Perplexity checks specific claims instead of open topics.
- Still missing: `Memory_Protocol_Library_Tasks_v02.md`, which the handoff names as the Library warm-up companion, is not in the repo.

Each prompt now restates the project context, has a timeframe and source priorities, labels every claim OBSERVED, INFERRED or UNKNOWN, asks for contrary evidence, and ends with a source register.

**Kept out of Perplexity:** the screen inventory, interaction catalogue, UX prototype spec, dependency map, acceptance tests and MVP pick (§17, §23, A, B, G, I, J, L). These are better written from the five results together with the repo's design docs.
