# 00 Discovery: The Amazing Shuk

| | |
|---|---|
| **Purpose** | A read-only survey of the repo and the design inputs before any design work: what exists, what we can reuse, what conflicts with the brief, and what has to be decided before deliverable 1. |
| **Deliverable** | 0 of 12 (Part 1 of `research/prompts/DORI_UXUI_Designer_Agent_Prompt(1).md`, plus the user's updated brief for this round) |
| **Version** | 0.1, draft for review |
| **Date** | 23 Oct 2026 |
| **Author** | `dori-ux-designer` agent |
| **Status** | Waiting for approval. Deliverable 1 has not been started. |
| **Working name** | "The Amazing Shuk" (pending a trademark check). This document calls it **the game** wherever it can, so the name is easy to swap. |

## Open questions (summary)

The full list, with context, is in [section 12](#12-questions-for-the-user). These five block deliverable 1:

1. **Mural address and date.** Which is right: Agrippas St 103 (the ideas file and the tile in photo #104) or 70 Agripas St (run 06)? And 2001 (run 06 and the tour file) or 2007 (the ideas file's lead)? See C-01 and C-02.
2. **Where the game is served.** Does it live in this Next app under `/memory-protocol`, at its own path, or on its own domain? Today the whole app sits behind Caddy basic auth, so a family invite link would hit a password prompt (C-07).
3. **Auth provider.** There is no user auth in this repo. Which provider for Google, Apple and email magic link? Installing anything needs your approval.
4. **Photo storage.** Where will team photos live, for how long, and who deletes them? Today nothing can store an upload (section 6).
5. **Rights.** May we crop and *alter* the mural, use the Picture in Stone plaque photos, and use the Rachmo and Rivka portraits? See the legal flags in section 10.

---

## 1. What I read and how

**Read in full**, in the order `design/inputs/content/README.md` gives:

- `research/prompts/DORI_UXUI_Designer_Agent_Prompt(1).md` (Parts 1 and 2), plus the user's updated brief for this round
- `design/inputs/content/Mission_Task_Ideas.md`
- `design/inputs/photos/photo_index_ALL.csv`, and the newer copy inside `DORI_photos_for_repo.zip` (see C-05)
- `Cognitive_Load.md`, `Audience_Engagement_Mechanics.md`, `DORI_Digital_Platform_Research.md`
- The two place files: `machane-yehuda-nachlaot-stories.md` and `06_nahlaot_market_sites_verification.md`
- `DORI_Machane_Yehouda__Guiding_Stories.md` (new and untracked; the user asked for it)
- `design/inputs/brand/DORI_Final_Brand_Book.pdf`. Its text was extracted with a small script, because `pdftoppm` is not installed, so I could not see its pages as images. I also inspected the SVG source of `DORI_logo_full_sumac.svg`, and viewed `fav.png`.
- `.claude/rules/*`, `CLAUDE.md`, `README.md`, `docs/HANDOFF.md`, `docs/STATUS.md`
- App code: `app/`, `components/`, `lib/game/`, the API routes, `deploy/` and the `Dockerfile`

**Skimmed for this deliverable only**:

- `docs/DORI_Memory_Protocol_Approved_Build_Spec_v1.md`, §1–4, for its auth and session rules
- `docs/map/nahlaot-map-audit.md`
- `docs/design/*.md`
- `docs/scavenger_hunt/Machane_Yehuda_Tour_EN.md`, for the mural and Rachmo entries
- The decision paragraphs of research runs `01_camera_microphone_pwa.md` and `03_media_formats_audio_offline.md`

**Not read**, and kept for later deliverables as the README says: the content methodology, guiding methods, Freytag, endowment effect, and runs 01–04 in `design/inputs/content/`.

**Photos I looked at.** Every photo I cite below I opened first. That means #02, #37, #47, #66, #103–#107, the 9 archival PNGs in `design/inputs/photos/`, and both illustrated map images. #103–#107 exist only inside `DORI_photos_for_repo.zip`. I extracted them to a scratch folder to look at them; nothing was written to `design/inputs/`.

**Index changed during this run.** `design/inputs/photos/photo_index_ALL.csv` was updated on disk at 23:01 UTC on 23 Oct 2026, while this survey was in progress (not by me; the change is uncommitted). It now covers #103–#117: the mural, Rachmo, the 9 archival PNGs (#108–#116) and the map poster (#117). I re-read the new rows, and the tables below reflect them.

**Tools:** ImageMagick is **not installed**. Python 3 with Pillow 12.2 is available, so later crops can be made with Pillow into `design/output/images/` without installing anything. Please confirm that's acceptable.

---

## 2. Inventory

Classes:

- **Reuse:** use as is.
- **Adapt:** use the pattern or code with changes.
- **Not for this game:** Memory Protocol material, or out of scope.
- **Unclear:** needs a decision.

Dates are the document's own date where it gives one; otherwise the commit date.

### 2.1 Brief, rules and agent setup

| Path | What it is | Date | Class | Note |
|---|---|---|---|---|
| `research/prompts/DORI_UXUI_Designer_Agent_Prompt(1).md` | Agent definition (Part 1) and design brief (Part 2) | v3, 24 Oct 2026 | **Reuse** | Source of truth, together with this round's brief |
| `.claude/agents/dori-ux-designer.md` | Installed agent definition | 23 Oct 2026 | **Reuse** | Already uses "Not for this game"; the rename the prompt calls pending is done |
| `.claude/rules/content.md` | Evidence labels, copy rules, tag mapping, boundaries for both games | 23 Oct 2026 | **Reuse** | Governs all game copy |
| `.claude/rules/scss.md` | SCSS conventions, 3rem outdoor tap targets, icon rules | 23 Oct 2026 | **Reuse** | The handoff spec must cite it |
| `.claude/rules/coding.md` | `Index → List → Preview`, offline queue rule | 20 Oct 2026 | **Reuse** | The entity names are Memory Protocol ones (`IndexEvidence`, dossier); the game will need its own (see 12.F) |
| `.claude/rules/verify.md` | How to check work on this server | 20 Oct 2026 | **Reuse** | No screenshots and no headless browser |
| `CLAUDE.md` (modified, uncommitted) | Two-games rule | 23 Oct 2026 | **Reuse** | |
| `research/prompts/scavenger_hunt_prompt_addendum.md` (untracked) | Memory Protocol research addendum: screen inventory, puzzles A–G, the HARMONY/OpenAI layer | undated | **Not for this game** | Puzzle A (3 L / 5 L jugs) overlaps with the cistern task. Borrow the logic only, not the framing |

### 2.2 Content inputs for the game

| Path | What it is | Date | Class | Note |
|---|---|---|---|---|
| `design/inputs/content/Mission_Task_Ideas.md` | Bank of stops, tasks, the food-token loop and the start sequence; tagged DOC, FIELD, ORAL or FOLK | 23–24 Oct 2026 | **Adapt** | Raw ideas, not approved missions. Its section "App fit: the existing trivia engine" refers to another repo and is **Not for this game** |
| `design/inputs/content/DORI_Machane_Yehouda__Guiding_Stories.md` (untracked) | Five refined guide scripts: Rachmo, the market, Raphael, the blue roof, Nachlaot. Each has research notes that separate documented, oral, folklore and interpretation | Oct 2026 | **Adapt** | Background for reveals and for evidence labels. **Not approved game copy.** Its links to `01_…05_Refined.md` point to files that are not in the repo |
| `design/inputs/content/machane-yehuda-nachlaot-stories.md` | Stories extracted from Nadav's Drive, each with its source file | 15 Oct 2026 | **Adapt** | Candidate stories. Each needs a label and approval |
| `design/inputs/content/06_nahlaot_market_sites_verification.md` (= `research/results/06_…`) | Perplexity site verification: addresses, visibility, rights, what to drop | 16 Oct 2026 | **Reuse** (as evidence) | Written for the Memory Protocol, but the place facts transfer. Research, not approved content |
| `design/inputs/content/Cognitive_Load.md` | UX talk transcript | undated | **Reuse** | Design guidance only |
| `design/inputs/content/Audience_Engagement_Mechanics.md` | Survey of mechanics; teen section | undated | **Reuse** | Its line "Quick onboarding (no logins needed)" conflicts with the login requirement (C-09) |
| `design/inputs/content/DORI_Digital_Platform_Research.md` | Restraint rules, privacy for teens, push budget | ~27 Sep 2026 | **Reuse** (principles) | It rejects points and scavenger engines; the brief decides otherwise (C-08) |
| `design/inputs/content/README.md` | Reading order and index | 23 Oct 2026 | **Reuse** | Does not mention the zip or the newer CSV inside it (C-05) |
| `design/inputs/content/DORI Content Methodology.md`, `guiding_methods.md`, `Freytag’s Pyramid.md`, `Endowment_Effect_Creatively.md`, `01_…04_*.md` | Method and research background | Oct 2026 | **Reuse** (consult later) | Not read in this deliverable |
| `docs/scavenger_hunt/Machane_Yehuda_Tour_EN.md` / `_HE.md` | A 22-stop culinary tour written for 7 teenagers | 10 Oct 2026 | **Adapt** (background) | Has the mural story (Citécréation, Hanukkah 2001, the "painted boxes" anecdote) and Rahmo. Its own author marks it as needing verification; not approved copy |
| `docs/scavenger_hunt/machane-yehuda-nachlaot-stories.md` | Same text as the content copy | 15 Oct 2026 | **Reuse** | A duplicate; use the `design/inputs` copy |

### 2.3 Photos and images

| Path | What it is | Date | Class | Note |
|---|---|---|---|---|
| `design/inputs/photos/photo_index_ALL.csv` (modified, uncommitted) | Index of #01–#117 plus duplicates: description, mission link, faces and consent | 23 Oct 2026, 23:01 UTC | **Reuse** | Updated during this run (C-05). The archival rows #108–#116 say "no (archival photo)" under faces and consent, although they show identifiable people (section 8) |
| `design/inputs/photos/DORI_photos_for_repo.zip` (gitignored, 71 MB) | 107 renamed photos in `faces/` and `no-faces/`, plus its own CSV (#01–#107) | 23 Oct 2026 | **Reuse** (source) | The field photos, including the mural (#103–#105) and Rachmo (#106, #107), exist **only** inside this zip. Each of #103–#107 is 4000 × 2252 px, about 7–8 MB |
| `design/inputs/photos/*.png` (9 files, now indexed #108–#116) | Archival images: Hesed VeRahamim founders (#109–#113, one a screenshot), men at the ark (#114), the Armuza family studio portrait (#115), a family portrait ("…and Flor", #108), and Hakham Rabbi Haim Albuher at his door in Ohel Moshe (#116) | The index says "phone photo or Yad Ben-Zvi open archive (original at the NLI); which one is to be checked per image" | **Unclear** | Rights are unresolved per item (run 06 §2). Identifiable people. Captions are marked TODO. Armoza family consent is a precondition in the ideas file |
| `design/inputs/photos/map/Illustrated Nahlaot Jerusalem Map Poster.png` (#117) | Illustrated street map, 1586 × 992 | undated | **Unclear** | The index calls it "style reference only until labels are corrected" and notes that many stops are not marked. Nearly identical to the audited candidate; the files differ in bytes. It inherits the audit's problems: **traced from a Google Maps screenshot**, garbled Hebrew and English labels, a freehand street network (C-11) |
| `docs/Nahlaot_Map/*` (3 PNG and a 13 MB zip) | Map references | Oct 2026 | **Adapt** (reference only) | Not for direct use (licensing) |
| `public/map/nahlaot-illustrated-candidate.jpg` | Web copy of the candidate map | 16 Oct 2026 | **Unclear** | Same licensing risk |
| `public/map/investigation-map-prototype.svg` | Schematic "investigation map" | Oct 2026 | **Not for this game** | Its framing is Memory Protocol. The schematic *fallback idea* is worth keeping |
| `public/library/*` (8 JPGs) | National Library crops | Oct 2026 | **Not for this game** | |
| `docs/National_library/*` (54 photos) | Library source photos | Oct 2026 | **Not for this game** | |
| `docs/armoza/*` | Armoza archive copies and `Armoza_fam.md` (Yad Ben-Zvi record text) | 16 Oct 2026 | **Unclear** | Supports the Hesed VeRahamim "two stories" task, but rights and consent are open |

### 2.4 Brand

| Path | What it is | Date | Class | Note |
|---|---|---|---|---|
| `design/inputs/brand/DORI_Final_Brand_Book.pdf` | Final identity system: palette, Plex type, monogram micro test, restraint list | Sep 2026 | **Reuse** | Its restraint list says "No maps, skyline, olive branch, Star of David or travel pictograms in the master identity" (C-12) |
| `design/inputs/brand/DORI_logo_full_sumac.svg` | Full lockup (SVG; the prompt expected a PDF) | 23 Oct 2026 | **Reuse** | Uses `#3B403E` for 20 paths, a grey that is not in the palette. That's fine for a supplied logo asset, but don't take it as a UI token |
| `design/inputs/brand/fav.png` | D monogram, master plus two circular small sizes | Sep 2026 | **Reuse** | Shows the approved micro behaviour |
| `design/inputs/brand/dori-gmail-signature-transparent.png` | Email lockup, 240 × 96 | Sep 2026 | **Not for this game** | Email only |
| `public/DORI_wordmark_only_sumac.svg` | Wordmark only; used on the Memory Protocol welcome screen | Oct 2026 | **Reuse** | Check it is one of the approved lockups. The brand book lists a "Primary wordmark" |
| `docs/design/dori-brand-to-ui.md` | Palette roles and WCAG contrast numbers on Chalk | Oct 2026 | **Reuse** | Says Amber is 3.0:1 on Chalk, so not for small text. That matters for food tokens (section 4). It cites `docs/GPT_DORI_UI_Designer_Brand_to_Screen_Prompt(1).md` and `docs/design/Dori_Brand/`, **which are not in this repo** |
| `docs/design/israeli-mosaic-ux.md` | Platform feature brief (the mosaic lens screen) | Oct 2026 | **Not for this game** | |

### 2.5 App code: UI

| Path | What it is | Class | Note |
|---|---|---|---|
| `app/globals.scss` | DORI tokens, reset, `.rtl`, `.stack`, `.cluster`, `.srOnly`, motion tokens with reduced-motion zeroing | **Reuse** | The palette matches the brand book exactly. Body text is 16 px, below the brief's 17 px (section 4) |
| `app/layout.tsx` | Loads Plex Sans (300–600), Plex Sans Hebrew (400, 500), Plex Mono | **Adapt** | `<html lang="en">` is hard-coded with no `dir` switching. The title is "The Memory Protocol". Plex Mono is not in the brand book |
| `app/manifest.ts` | PWA manifest | **Adapt** | Name, scope and icons belong to the Memory Protocol. No icons yet |
| `components/ui/ActionButton.*` | Primary (Sumac), quiet (underlined text), light (on Ink) | **Adapt** | Primary is 3.5rem ✔. Quiet is 2.75rem ✗ (needs 3rem outdoors). The hover nudge on the arrow must flip in RTL |
| `components/ui/EvidenceTag.*` | The four evidence labels, a coloured dot plus mono caps | **Adapt** | The labels match the repo rule. At 11 px mono caps it is too small for sun, and the brief wants the light phrasing ("The story goes…") (section 4) |
| `components/ui/StatusTag.*` | "Draft" or "Fixture" label on unapproved copy | **Reuse** | Useful for prototype builds so placeholder copy can't pass as final |
| `components/protocol/ScreenHeader.*` | Back, step counter "01 / 04" in mono, right-hand slot | **Adapt** | The back target is 2.75rem ✗. Needs standard back behaviour and no mono |
| `components/protocol/WelcomeScreen.*`, `IndexProtocol.*` | Memory Protocol opening flow | **Not for this game** | Layout ideas only |
| `components/transmission/*` | HARMONY transmission beats | **Not for this game** | |
| `components/team/IndexTeam`, `ListTeam`, `PreviewTeam` | Team A/B picker with mock seats | **Adapt** | The `Index → List → Preview` split carries over. The game needs 1–3 named teams, first names, and moving a player |
| `components/puzzle/IndexPuzzle`, `PreviewPuzzleQuestion`, `PreviewPuzzleReveal` | One-question flow with escalating hints, a guide override after 3 misses, and a reveal | **Adapt** | Close to the number/text task and P-10 Reveal. Copy is HARMONY's |
| `components/puzzle/IndexDiscovery`, `PreviewDiscoveryStep`, `…Answer`, `…Reveal`, `…Reflect`, `PreviewInvestigations` | Clue crop → find → observe → answer → reveal | **Adapt** | **The closest existing pattern to "find the detail" (P-06).** The step rhythm transfers; the content and framing do not |
| `components/mission/IndexMission`, `ListMission`, `MissionMap`, `PreviewMission`, `DevMapControls` | Illustrated map with marker states (next, locked, conditional, complete) and a destination card | **Adapt** | Matches "stops unlock one by one" (P-04). The Library card, the "memory restored" layer and the "Investigation" naming are Memory Protocol |
| `components/map/LeafletBaseMap`, `IndexMapPreview`, `PreviewMapDestination` | Leaflet `CRS.Simple` over an illustration; schematic fallback | **Adapt** | A sound technical base for the illustrated map. Zoom and controls are 2.75rem ✗ |
| `components/icons/*` | 31 stroke icons, 24 px grid, 1.75 stroke | **Adapt** | The set suits the brand. `transmission`, `dossier` and `catalogId` are Memory Protocol. The game will need new entries (food token, menu, vote, order, offline sync); list them in deliverable 6 |
| `app/dev/icons`, `app/dev/map` | Dev-only galleries | **Reuse** (dev) | |

### 2.6 App code: game logic, data, API and auth

| Path | What it is | Class | Note |
|---|---|---|---|
| `lib/game/types.ts` | Domain types: `Copy` with status, `ClaimType`, session, team and audit types | **Adapt** | Keep `Copy`/`ContentStatus`, `ClaimType` and the `AuditEntry` shape. `TeamId = "A" \| "B"`, the stages, crises and HARMONY types are Memory Protocol. There are **no player, name, photo, token or food types** |
| `lib/game/answers.ts` | Deterministic answer normalisation, scoring, `helpAfterMisses` | **Reuse** | Exactly what number/text/choice tasks need. Hebrew input (gematria) needs tests for niqqud and geresh normalisation |
| `lib/game/engine.ts` | Pure reducer `(state, action, now) → state`, guide actions, audit log | **Adapt** (pattern) | Right architecture for confirm and override. All content and stages are Memory Protocol |
| `lib/game/store.ts` | SQLite (`node:sqlite`) on the `game_data` volume; 6-character session code from an unambiguous alphabet; guide token stored as a SHA-256 hash | **Adapt** | No users, no player names, no photo blobs. `version` per session could support sync |
| `lib/game/views.ts` | What players and the guide see | **Adapt** | `playerView` **exposes the other team's score**, which conflicts with "scores hidden until the end" (C-10) |
| `lib/game/http.ts` | JSON helpers; **32 KB request cap** | **Reuse** | The cap rules out photo upload through these routes |
| `app/api/sessions/**` | Create a session, read the view, team actions, guide actions | **Adapt** | Not wired to any UI |
| `lib/game/geo.ts` | GPS arrival check ("I'm here", thresholds) | **Unclear** | The brief says "Tap a stop's icon when you arrive." Decide whether GPS appears at all; it must never be the only path |
| `lib/game/missionMap.ts`, `playerMap.ts`, `basemaps.ts` | Marker view models; geo stored apart from map placement | **Adapt** | Keep the split "real-world position vs drawn position" |
| `lib/game/content.ts`, `screens.ts`, `library.ts`, `discovery.ts`, `harmony.ts` | Memory Protocol content, copy, the OpenAI HARMONY reply | **Not for this game** | No AI chatbot in this game |
| `lib/game/*.test.ts` | 61 passing tests (per the handoff) | **Adapt** | Test style to copy |
| `lib/base-path.ts` | `/memory-protocol` | **Unclear** | See C-07 |

### 2.7 Deploy and infrastructure

| Path | What it is | Class | Note |
|---|---|---|---|
| `deploy/compose.yml` | One read-only container, 256 MB, `game_data:/data`, on `dori_net` | **Unclear** | Photo storage would have to live on this volume or elsewhere. 256 MB and a shared production host are tight for image processing |
| `deploy/deploy.sh`, `Dockerfile`, `.claude/skills/game-*` | Build, deploy, verify | **Reuse** (not a design concern) | |
| `deploy/.env.example` | `OPENAI_*`, `GUIDE_CREATE_KEY` | **Adapt** | OpenAI is Memory Protocol only |
| README "Routing (Caddy)" | `/memory-protocol*` inside the shared `(dori_platform)` snippet, **behind existing passwords** on `trip.` and `app.` | **Unclear** | A password wall before the invite (C-07). Not applied yet |

### 2.8 Memory Protocol material (not for this game)

| Path | What it is | Date |
|---|---|---|
| `docs/scavenger_hunt/The_Memory_Protocol_Story_V1(1).md` | The locked story | v1 |
| `docs/DORI_Memory_Protocol_Approved_Build_Spec_v1.md`, `docs/archive/…` | Build spec | 16 Oct 2026 |
| `docs/scavenger_hunt/Memory_Protocol_New_Chat_Handoff_v02.md` | Handoff | 15 Oct 2026 |
| `docs/scavenger_hunt/National_Library_of_Israel_Formatted_Tour.md`, `HE_trans.txt` | Library tour | Oct 2026 |
| `docs/HANDOFF.md`, `docs/STATUS.md`, `docs/RUN_PREVIEW.md` | Memory Protocol status and preview | 16–20 Oct 2026 |
| `research/prompts/04_harmony_openai_feedback.md`, `05_library_*`, and their results | HARMONY and Library research | 16 Oct 2026 |

All of these are **Not for this game**. They are not to be edited.

### 2.9 Neutral research I may use later

| Path | Class | Use |
|---|---|---|
| `research/results/01_camera_microphone_pwa.md` (16 Oct 2026) | **Adapt** | Recommends the native camera picker, foreground-only capture, no auto background upload, and a typed or guide path always available. Fits P-06 and G-03 |
| `research/results/03_media_formats_audio_offline.md` (16 Oct 2026) | **Adapt** | "Text-complete, offline-capable", a local outbox plus a server event log, about 100 MB per phone. Fits P-13 |
| `research/results/02_puzzle_animation_tech.md` (16 Oct 2026) | **Unclear** | Not read; may help with P-08 (order) and the jug puzzle |
| `research/perplexity/*` | **Not for this game** | A tool, not a design input |

---

## 3. Conflict log

The brief wins unless a row says the decision is open.

| ID | Conflict | Sources | Resolution or status |
|---|---|---|---|
| C-01 | **Mural address:** "Agrippas St 103 [TO VERIFY], by HaRav Shmuel Baruch St" vs "70 Agripas Street" | Brief and ideas file; photo #104 shows a **"103"** house tile on the kiosk, and the electrical box on the right carries a painted **"25"** / run 06 row 12 (citing the Israeli philatelic sheet); the tour file says "Sources disagree on the mural's Agripas Street number" | **Open.** Keep `[TO VERIFY]` and check on site, along with the corner name |
| C-02 | **Mural date and artist:** the ideas file says a 2007 Citécréation lead, "don't state it until the plaque confirms" vs Citécréation, unveiled **Hanukkah 2001** | Ideas file / run 06 (philatelic sheet) and `Machane_Yehuda_Tour_EN.md` | **Open.** The plaque left of the painted shop (#104) is not legible at photo resolution and must be read on site. The bonus "Date the painting… before smartphones" works with either year. The reveal must not name a year until you approve one |
| C-03 | **"Rabbi Aryeh Levin mural" subject:** the ideas file (#35) says Solomon Souza's mural of Rabbi Aryeh Levin vs the CSV for #37/#39: "subject UNIDENTIFIED — verify before naming" | Ideas file / photo index | **Open.** Photo #37 shows a bearded elder in hat and glasses merging into a tree, a seated figure with smoke forming א, and a "2015" mark. Neither the artist nor the subject is confirmed in the inputs. The detail hunt works without naming them; the reveal does not |
| C-04 | **Rachmo founding:** idea #11 says "two sources say 1952 and 1954" vs the guiding story: "Documented: 1954 founding" | Ideas file / Guiding Stories | **Open.** The guiding story cites ynet and Makor Rishon. Choose the year for any reveal. "Rivka refused to let Rachmo close" is a **reported family recollection**, so the label is **Attributed tradition**, not Historical fact |
| C-05 | **Photo index versions:** when this run started, the folder CSV listed only #01–#102 and the zip's CSV had #103–#107. During the run the folder CSV was updated to #01–#117 (uncommitted) | `design/inputs/photos/` | **Resolved in practice:** I use the updated folder CSV. Still open: (a) the zip's CSV is now older than the folder copy; (b) the faces flag "no (archival photo)" on #108–#116 understates identifiable people. I did not edit inputs |
| C-06 | **Login is required** vs the build spec's "no end-user account required for pilot" | Brief / Memory Protocol build spec §2 | **Brief wins.** The spec is Memory Protocol only |
| C-07 | **Invite link vs password wall:** families open one link, but the README routes the app behind Caddy basic auth on `trip.`/`app.` | Brief / `README.md` Routing | **Open.** A browser password prompt before "join in two taps" breaks the flow. Needs a hosting decision |
| C-08 | **Points:** team points, hidden until the end, hints cost points vs the platform research's "Rejected: points, badges, streaks, leaderboards" and "DO NOT BUILD YET… trivia/scavenger engines" | Brief / `DORI_Digital_Platform_Research.md` §16, §30 | **Brief wins** (decided game loop). Keep the restraint: no badges, streaks, live board or celebration effects |
| C-09 | **Login vs "quick onboarding (no logins needed)"** for teens | Brief / `Audience_Engagement_Mechanics.md` | **Brief wins.** It is the reason the guest path with a team code matters |
| C-10 | **Scores hidden** vs `playerView` sending every other team's live score to every phone | Brief / `lib/game/views.ts` | **Brief wins.** Flag for the handoff: the server must not send other teams' scores before the end |
| C-11 | **Illustrated map asset:** the brief wants an editorial, hand-drawn map that is not generic vs the supplied poster | Brief / map audit: traced from Google Maps, wrong labels in both languages | **Open.** Usable only as a mood reference. Deliverable 8 sets the direction; a new rights-clean drawing is likely needed |
| C-12 | **Brand book "No maps… in the master identity"** vs an illustrated map as a core game screen | Brand book §08 / brief | Not a real conflict: the map is a **functional game surface**, not identity decoration. Keep it out of logos, title art and the frame. Please confirm |
| C-13 | **Team structure:** exactly six players in two teams of three (spec) or three pairs (handoff v02) vs **1–3 teams, up to about 8 people** | Memory Protocol docs / brief | **Brief wins** |
| C-14 | **Hint cost:** the ideas file's jug puzzle says "Each hint costs a token" vs "Hints cost points" | Ideas file / brief | **Brief wins:** hints cost **points**, never food tokens |
| C-15 | **Typeface:** Plex Mono is used in labels, step counters and evidence tags vs the brand book specifying Plex Sans and Plex Sans Hebrew only | `app/layout.tsx`, modules / brand book §04 | Proposal: no mono in this game. Please confirm |
| C-16 | **Platform principle "Invitation… Not now"** vs the brief's **"Skip"** for bonuses | Platform research / brief | **Brief wins** on behaviour ("skipping costs nothing except points"). The exact button word is `TODO(copy)` |
| C-17 | **Audience:** the platform research's case family is from the UK (Maya, Cameron) vs "mostly American families" | Platform research / brief | Brief wins on audience. The legal review must cover US, UK and Israeli law (and the EU if relevant) |
| C-18 | **Rachmo spelling and address:** "Rachmo" (ideas file, guiding story) vs "Rahmo, 5 HaEshkol" (run 06) vs the tour file placing a stall "5 HaShikma Street, near Rahmo" | Inputs | **Open.** You choose the spelling; the address is `[TO VERIFY]` |
| C-19 | **Ohel Moshe founding:** תרמ״ב = 1882 (plaque #02 shows "Ohel Moshe 1882 / אהל משה תרמ״ב") vs "1882 or 1883" (run 06) | Photo #02 / run 06 row 3 | The gematria task stays sound, because it decodes **what the plaque says**. A reveal that claims the founding year must carry the nuance or cite the plaque |
| C-20 | **The brand-to-UI doc** points to files that aren't in this repo | `docs/design/dori-brand-to-ui.md` | Use the brand book in `design/inputs/brand/` |

Minor note: some inputs are dated 24 Oct 2026 (the brief v3, and the decisions in the ideas file) while the system date is 23 Oct 2026. I assume this is a time-zone difference, so it changes nothing.

---

## 4. Existing UI patterns, checked against the brand and the brief

| Pattern | Where | Brand fit | Brief fit (outdoor, all ages) | Verdict |
|---|---|---|---|---|
| Palette tokens | `globals.scss` | ✔ The 5 brand colours match exactly. The derived neutrals are marked unconfirmed | Contrast on Chalk: Ink 12.6:1, Sumac 5.6:1, Za'atar 4.6:1 (plain Chalk only), **Amber 3.0:1** | **Reuse.** Because Amber is the food-token colour, token numbers and labels must be Ink on an Amber fill or chip, never Amber text on Chalk |
| Typography | `layout.tsx` | ✔ Plex Sans and Plex Sans Hebrew. ✗ Plex Mono is not in the brand book | ✗ Body 16 px (the brief asks for at least 17 px). Most frequent module sizes are 12 px (35 uses), 11 px (15) and 13 px (14) | **Adapt.** Raise the body to at least 17 px, retire 11–13 px for anything players must read, drop mono |
| Primary button | `ActionButton` | ✔ Sumac, 4 px radius, editorial | ✔ 56 px tall, full width on phones | **Reuse** |
| Quiet button | `ActionButton.quiet` | ✔ | ✗ 44 px (3rem required) | **Adapt** |
| Back control | `ScreenHeader` | ✔ | ✗ 44 px; step counter in mono | **Adapt.** 48 px; standard back behaviour |
| Evidence label | `EvidenceTag` | ✔ restrained dot plus text | ✗ 11 px uppercase mono; no light phrasing | **Adapt.** Show it lightly in reveals, as the brief asks. Only one light phrasing is given ("The story goes…" for Attributed tradition); the other three are `TODO(copy)` |
| Draft/Fixture tag | `StatusTag` | ✔ | ✔ dev and prototype only | **Reuse** |
| Dark Ink panels | transmission, reveal, map preview modules | ✔ allowed | ⚠ Their feel here comes from HARMONY. In sun, Chalk text on Ink is high-contrast but shows glare and fingerprints. Use sparingly | **Adapt** |
| Line icons | `components/icons` | ✔ stroke-only, no generic Israel icons | ✔ but sized 20–24 px. The icon itself can be small if its tap area is 48 px | **Adapt.** Add the game's icons, remove Memory Protocol ones from its build |
| Map with marker states | `components/mission`, `components/map` | ✔ if the art is editorial | ✔ next, locked, complete; a "Concept map — not for navigation" notice | **Adapt.** Controls to 48 px; a stop unlocks from a game event, not GPS |
| Clue crop → find → answer → reveal | `components/puzzle/*Discovery*` | ✔ | ✔ one idea per screen; hints escalate; guide override after 3 misses | **Adapt.** The core of P-05, P-06 and P-10 |
| Team picker | `components/team` | ✔ | ✗ only two fixed teams, mock seats, no names | **Adapt** |
| Bottom tab bar | none | — | The brief asks for one (common mobile convention) | **New**, in deliverable 3 |
| RTL | `.rtl` utility; `html {direction: ltr}` hard-coded | — | ✗ no Hebrew UI mode, no `dir="rtl"` page switching | **Adapt.** Hebrew screens must set `dir="rtl"`; use logical properties (already the rule) |
| Motion | duration tokens plus reduced-motion zeroing | ✔ calm | ✔ | **Reuse.** No confetti |
| Logo use | wordmark on the Memory Protocol welcome only | ✔ approved file | — | **Reuse** on P-00, as one approved lockup. Never set text in the logo letterform |

---

## 5. Auth and login today

**There is no user authentication in this repo.** What exists:

1. **Session code.** A guide creates a session (`POST /api/sessions`) and gets a 6-character code from an alphabet with no 0/O or 1/I/L. Creating a session can also need `GUIDE_CREATE_KEY` if that environment variable is set.
2. **Guide token.** It is returned once, stored only as a SHA-256 hash, and sent in the `x-guide-token` header. It is the only "login" there is, and it is per session.
3. **Device ID.** Each phone sends a self-generated `deviceId`, and `joinTeam` adds it to team A or B. A phone cannot switch teams. A cleared browser or a new phone gets a new ID, which loses the team link.
4. **No names, no emails, no accounts.** `TeamState` has no player list, only device IDs.
5. **Perimeter.** Per the README, the app is meant to sit behind Caddy basic auth (C-07).
6. **Not wired.** The UI does not call the API at all. Everything is local state and resets on refresh (handoff open item 7).
7. **Elsewhere.** Supabase, and login for the trivia games, live in another repo and are out of scope (brief).

**What carries over:** the unambiguous code alphabet; storing secrets only as hashes; the guide audit log; server-authoritative state. **What's missing for the new requirement:** player identity, first names, a team roster, Google/Apple/magic-link sign-in, guest join with a team code, team restore, moving a player, and a teen-privacy flag on answers.

### Login risks to resolve in deliverable 1 (noted, not designed)

- **Password wall:** see C-07.
- **In-app browsers.** Invites shared on WhatsApp or opened in Gmail often open inside an in-app webview. Google sign-in has restricted embedded webviews, and a magic link may open in a *different* browser from the one that asked for it. On iPhone, a Home Screen PWA keeps its storage apart from Safari. Each of these can strand a player halfway through login. `[TO VERIFY]` current behaviour on the families' likely devices.
- **Email on weak signal.** A magic link needs mail delivery and a second app switch. That's acceptable before the day; it is risky in the street.
- **"First name only" vs sign-in data.** Google and Apple sign-in, and magic links, all involve an email address. Decide whether the game stores it, uses it only to recover a session, or drops it.
- **Guest 4-digit team code.** There are only 10,000 combinations. Scope it to one session (the code plus the session's invite) and rate-limit it. The existing 6-character session code could be the outer key.
- **Under-13 players.** Google accounts for children are managed accounts; a family may include a child under 13 even though the brief says "teenagers". `[TO VERIFY]`
- **Data roaming.** "One phone per team required": American visitors may lack a local data plan or eSIM. That raises the stakes for offline-first play and for the guide restoring a team.
- **Auth provider.** No provider exists here, and anything new needs your approval before install.

---

## 6. Photo upload and storage today

**None.**

- There is no upload endpoint, and requests are capped at 32 KB (`lib/game/http.ts`).
- Images are static files in `public/`, served read-only from the image.
- The container is read-only. Its only writable storage is the `game_data` volume, which holds the SQLite file, plus a `/tmp` tmpfs.
- There is no object storage, thumbnailing, EXIF stripping or retention job.
- The engine's own comment says raw GPS coordinates are never stored, which is a good precedent.

**Run 01 recommends** the native camera picker and no automatic background upload. A typed answer or guide confirmation must always count.

**Implications for the game:**

- P-06 and G-03 need a photo path that survives weak signal. One option is to queue the image on the phone and let the guide confirm by sight, so the upload is not on the critical path.
- Storage, retention ("deleted on request") and EXIF/location stripping all need decisions.
- The 256 MB container limit on a shared production host argues against image processing on the server.

## 7. Offline and sync today

`coding.md` requires every shared-state action to be queued locally and synced, but **none of it exists yet**: no service worker, no outbox and no client storage. The server keeps a version number per session (`store.ts`), which a sync design can build on. Run 03's "local outbox plus server event log" is the documented direction. P-13 and the guide-override screens (G-02 to G-05) depend on this.

---

## 8. Photo audit: faces, sensitivities and crop plans

Only photos I opened are listed. "Faces" uses the CSV's flag, corrected where the zip's `faces/` folder or my own viewing disagrees.

| # | Photo | For | Issue found | Plan (to confirm) |
|---|---|---|---|---|
| 103 | Mural: market scene and painted shop | Opening: find the detail, real or painted | Artwork, no real faces. **Image rights belong to the artists** (run 06 §2; ideas file) | Crops for the find-the-detail task only after rights are cleared (L-05) |
| 104 | Mural: ground-floor painted shop | Find the detail; real or painted | Shows the real "103" tile, a plaque, a triangular warning sign, a parking sign, a blue treble-clef sign and a utility box. The box has a **death notice** (a funeral announcement) posted on it | Any crop must **exclude the death notice**. The parking and warning signs are real, so they may count as extra "real" answers. Tell the guide |
| 105 | Mural: balconies and arch | What day is it? / What's missing? | Painted figures only | The base for the altered "what's missing" image, which is Fiction and needs rights (L-05) |
| 106 | Rachmo side wall | Wall tasks | CSV says "archival photos". It has identifiable people in old family photos, a young woman's portrait, and a press clipping | Family consent before use. Identifications are guesses (ideas file) |
| 107 | Rachmo menu and portraits | Tasting menu; Rivka's roses | **Customers' faces, including children** (one boy faces the camera). Portraits of **Rachmo and Rivka, both deceased** | Crop to the board and the portraits only, with no customers. Use the portraits **only with the family's consent** (L-06). The ideas file says the memorial notices and soldiers' photos by the counter are off-limits |
| 02 | Picture in Stone: Ohel Moshe 1882 / Montefiore | Gematria (find תרמ״ב) | No faces except a historic Montefiore portrait | Good. "תרמ״ב · 1882" is legible in the oval label |
| 37 | Mural: elder in hat, tree, א | "Aryeh Levin" detail hunt | Artwork; subject unconfirmed (C-03) | Crops possible once the artist and subject are confirmed |
| 47 | Hesed VeRahamim heritage sign | "Two stories, one wall" | No people; prayer-times board visible | Good. Avoid prayer times (L-09) |
| 66 | Courtyard water-meter wall | Cistern task | A distant figure on the left ("low" in CSV); private courtyard | Crop to the meters only. Look from the street (ideas file: no entering courtyards) |
| 108–116 | 9 archival PNGs (an unknown family, the synagogue founders, the Armuza family, Rabbi Haim Albuher) | Hesed VeRahamim; face match; "find the doorway today" | Indexed with faces flag "no (archival photo)", **but every one shows identifiable people**, children included in #108 and #115. Source and rights are "to be checked per image". #111 carries an archive watermark | Use none of them in the app until the source and rights are confirmed per image. #112 vs #113 is suggested as a "what's missing?" pair; that compares the archive's own versions, so it is not a Fiction device |

**Already flagged in the CSV and excluded:**

- Children visible: #20 (child), #74 (minors), #75 and #85 (child).
- Memorial or sacred: #12 (the zip files it under `faces/`, though the CSV says no faces), #79, #80.
- Religious act: #68.
- Private homes: #36, #59, #62.

**Picture-in-Stone face match.** The task crops *faces from family photos* displayed on plaques (#01, #03, #22, #23, #26, #27, #32). These are historic, identifiable people, and a photo displayed on a plaque is "not itself a reuse licence" (run 06 §2). This needs a rights and consent decision (L-05).

---

## 9. Content gaps and [TO VERIFY] items

### Facts and places

| Item | Status |
|---|---|
| Mural street number and corner | `[TO VERIFY]` (C-01) |
| Mural artist and year | `[TO VERIFY]` by reading the plaque on site (C-02) |
| The blue treble-clef sign on the mural wall: a "שיר בשוק" poem sign? | `[TO VERIFY]`. Its wording was not legible to me |
| "What day is it?": Wednesday cleaning and Thursday shopping | ORAL, so **Attributed tradition**. The Thursday–Friday shopping peak is cited as DOC ("05a §5.8"), but **05a is not in this repo**. `[TO VERIFY]` the source |
| Gematria reveal: Yemenite Jews read בתמר as 5642 | DOC per the ideas file. Its Hamichlol source page was not fully read ("check the details before writing the reveal"). Run 06 cites the NLI blog on "אעלה בתמר" (22 Feb 2022) |
| Batei Goral house number (Abulafia St 31?) and founding (1884 or 1885) | `[TO VERIFY]`. Small and residential; keep it quiet |
| Hesed VeRahamim: tile "founded 5685 (1925)" vs the heritage sign's tavern story | Both are FIELD (#21, #47), so Historical fact *that each says so*. The tavern episode itself is an **Attributed tradition** (run 06 row 7) |
| Rabbi Aryeh Levin mural: artist and subject | `[TO VERIFY]` (C-03) |
| Cistern task location | Run 06: a reported opening opposite Gilboa 11, not inside Gan HaTut. `[TO VERIFY]` a safe sightline. The physical cups version (300 and 500 ml) avoids any real cistern |
| Gan HaTut = Bustan Sephardi | The same garden (run 06): **one stop, not two** |
| Rachmo: spelling, address, take-away-only arrangement, hummus price (₪40 on the board, "confirm with the restaurant") | `[TO VERIFY]` (C-18) |
| Tasting menu: 6–8 stalls near Agrippas St, dishes, one-line stories, **opening hours**, token prices | **Not yet supplied** apart from Rachmo. Hours and prices are `[TO VERIFY]` the week of play. Run 06 lists Marzipan (44 Agripas), Azura (4 HaEshkol), Tahina HaMelekh (33 Etz Haim), Hayazdi (12 HaAfarsek) and Johnny & Kubaneh (78 Agripas) as listed in 2026, "not guaranteed open" |
| Hakmat HaBorekas on Etz Hayim St | Hours and arrangement `[TO VERIFY]` (ideas file) |
| Token economy numbers: tokens per task, prices, per-team shekel cap | Not set. The ideas file says "4–5 tastes" per team that solves every base task |
| Walking times between the zones | Not measured (ideas file) |
| The ending's "optional short quiz round" | No questions exist |
| The family question | No approved wording |

### Copy gaps

**All visitor-facing copy below is missing.** The design will mark each one `TODO(copy)` and will not invent text:

- the screen copy for P-00 to P-14 and G-01 to G-05;
- the onboarding slide bodies, beyond the brief's one line "Tap a stop's icon when you arrive.";
- task prompts, hints, wrong-answer messages and reveals, in English and Hebrew;
- the light phrasing for three evidence labels (Historical fact, Interpretation, Fiction);
- the consent, privacy and guest text;
- the offline and reconnect messages.

**Approved wording I can quote:**

- the title "The Amazing Shuk" (provisional);
- the premise line;
- the hook "Some of what you'll see today is real, some is painted over." (the brief's version; the ideas file has a longer variant, C-21 below);
- "Tap a stop's icon when you arrive.";
- the Rachmo menu items as translated in the ideas file (marked "confirm with the restaurant").

**C-21 (minor):** the brief's hook "Some of what you'll see today is real, some is painted over." vs the ideas file's "Some of what you'll see today is real and some is painted over. Your job is to tell which is which." **Ask** which is final.

---

## 10. Flags for legal review

None of this is legal advice. Each item needs a qualified reviewer.

| ID | Flag | Why |
|---|---|---|
| L-01 | **Minors' personal data.** First names, team membership, free-text answers, photos, and possibly voice from the family question | US (COPPA for under-13s; state privacy laws), UK GDPR and the ICO Age Appropriate Design Code, the Israeli Privacy Protection Law and its 2025 amendment, and the EU GDPR for EU families may all apply. `[TO VERIFY]` which, and the age thresholds for parental consent |
| L-02 | **Teen answers private from parents by default** | Must be squared with parental-consent rules for under-13s, and with the guide's access. Who can see what, and when |
| L-03 | **Sign-in providers** (Google, Apple, email) | The provider becomes a data processor. Email collection conflicts with "first name only". Age limits on accounts. Where the data is stored, given hosting on a shared production server `[TO VERIFY]` region |
| L-04 | **Photos taken by players** | They may capture strangers, vendors or other children by accident (the content rules forbid people without consent). Retention, deletion on request, a no-marketing promise, EXIF and location stripping, and who can download |
| L-05 | **Third-party image rights** | The Citécréation mural: cropping, and **digitally altering** it for "what's missing" may raise artists' moral-rights questions `[TO VERIFY]` under Israeli law. Picture in Stone plaque photos (families, Lev Ha-Ir, Yad Ben-Zvi). Armoza and Yad Ben-Zvi/NLI archival images (rights unresolved per run 06). Map art traced from Google Maps (audit) |
| L-06 | **Portraits of the deceased** (Rachmo and Rivka) and the Rachmo wall photos | Family consent; respectful tribute framing |
| L-07 | **Trademark** | "The Amazing Shuk" next to CBS's "The Amazing Race" (ideas file) |
| L-08 | **Food** | Allergens and kashrut. Alcohol appears on the Rachmo board: no alcohol for minors, and none in the tasting menu unless decided. A token is a guide promise, not a voucher (the ideas file says so); make sure nothing reads as a voucher or prize |
| L-09 | **Religious and memorial sites** | No tasks at memorials or during prayer (brief). Prayer times and memorial notices appear in several photos; the app must not show them as game content |
| L-10 | **Location data** | If any GPS is used, minors' precise location is sensitive in several jurisdictions. Today's code stores only distance, never raw coordinates |

---

## 11. Restraint check on the decided loop

Nothing here is a design; these are things to watch in later deliverables.

- **Points stay hidden until the end.** The server must not send other teams' scores (C-10).
- **Food never depends on winning.** Every team earns at least one turn to choose the food (brief; the ideas file warns against punishing the losing side).
- **Skip on every bonus,** costing only points.
- **One photo per stop at most.** Never of people. Never during a story or a ritual (platform research §16).
- **No confetti, badges, streaks, push during tasks, social sharing or chatbot.**
- **The family question** is opt-in, private and never published.

---

## 12. Questions for the user

### A. Blocking deliverable 1

1. **Mural (C-01, C-02):** the street number, the corner, and the year to use. Can you read and photograph the plaque?
2. **Hosting (C-07):** this app under `/memory-protocol`, its own path, or its own domain? Can the game's routes sit outside the basic-auth wall?
3. **Auth:** which provider for Google, Apple and magic link? Store the email or not? Any install needs your go-ahead.
4. **Photos:** where they are stored, how long they are kept, who may see them, and how a deletion request is handled.
5. **Rights (L-05, L-06):**
   - May we crop the mural, and may we *alter* it for "what's missing"?
   - May we use the Picture in Stone faces?
   - May we use the Rachmo and Rivka portraits?

### B. Content and evidence

6. **Photo index (C-05):** may I treat the updated folder CSV (#01–#117) as authoritative over the zip's copy? Should the faces flag for #108–#116 say they show identifiable people?
7. **Rachmo:** the spelling, the address, the founding year (C-04, C-18), and confirmation that the take-away arrangement is agreed with the family.
8. **The hook line (C-21):** which version is final?
9. **The "Aryeh Levin" mural (C-03):** who painted it and whom does it show?
10. **The tasting menu:** which 6–8 stalls? Who supplies the dishes, one-line stories and token prices?
11. **The token numbers:** tokens per task, the price range, and the per-team shekel cap.
12. **Source "05a":** the ideas file cites "05a §…" several times. Where is it? It is not in this repo.

### C. Product

13. **Code format:** a 4-digit guest **team** code (brief) or the existing 6-character **session** code, or both?
14. **One-group mode:** with one group, is there still a points total, or only "par" scoring as the ideas file suggests?
15. **GPS:** use it at all? The brief's map says "Tap a stop's icon when you arrive."
16. **Language:** may one phone switch between English and Hebrew mid-game, or is the language chosen per player at join?
17. **Phones:** may a teen play on their own phone in a team whose required phone belongs to an adult? (This affects L-02.)

### D. Brand

18. **Mono type (C-15):** confirm no Plex Mono in this game.
19. **Map as a game surface (C-12):** confirm it is acceptable under the brand book's "no maps" restraint, provided it stays out of the identity frame.
20. **Lockup:** which approved lockup goes on P-00? The full sumac lockup or the wordmark?

### E. Tools

21. **Image tools:** ImageMagick is not installed. May I use the installed Python and Pillow for crops into `design/output/images/`?

### F. Naming (for the handoff, later)

22. **Entity names:** `coding.md` lists Memory Protocol entities (`IndexEvidence`, dossier). May the game use its own (e.g. `IndexStop`, `IndexTask`, `IndexWallet`, `IndexTeam`, `IndexGuide…`)?

---

## 13. Stop-point summary

- The repo is a Memory Protocol prototype. Its tokens, buttons, the clue-crop → find → reveal flow, the illustrated-map markers, the deterministic answer checks and the guide audit log can be **adapted**. Its story, content, HARMONY/OpenAI and Library assets are **not for this game**.
- There is **no user auth, no photo upload or storage, no offline sync, and no Hebrew UI mode**. Today the app would sit behind a basic-auth password wall, and its API leaks other teams' scores.
- Outdoor fit is short: body text is 16 px, labels 11–13 px, and the back, quiet-button and map controls are 44 px.
- 21 conflicts are logged. The key open ones are the mural's address and date, the hosting wall, the subject of the "Aryeh Levin" mural, and the Rachmo details. The photo index was updated to #117 during this run.
- 10 legal flags, chiefly minors' data, photos, mural alteration, plaque and portrait rights, and the trademark. The questions blocking deliverable 1 are A1–A5 above.
