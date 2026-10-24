# 00 Discovery: The Amazing Shuk

| | |
|---|---|
| **Purpose** | A read-only survey of the repo and the design inputs before any design work: what exists, what we can reuse, what conflicts with the brief, and what has to be decided before deliverable 1. |
| **Deliverable** | 0 of 12 (Part 1 of `research/prompts/DORI_UXUI_Designer_Agent_Prompt(1).md`, plus the user's updated brief for this round) |
| **Version** | 0.2, draft for review (replaces 0.1, committed as `730bcc8`) |
| **Date** | 23 Oct 2026 |
| **Author** | `dori-ux-designer` agent |
| **Status** | Waiting for approval. Deliverable 1 has not been started. |
| **Working name** | "The Amazing Shuk" (pending a trademark check). This document calls it **the game** wherever it can, so the name is easy to swap. |

> The user's answers to this report's questions are recorded in [`01_assumptions.md`](01_assumptions.md) §1, "Decisions from discovery".

## What changed in v0.2

1. **The photos are on disk.**
   - `design/inputs/photos/no-faces/` holds 86 photos and `design/inputs/photos/faces/` holds 21; `faces/` is gitignored.
   - I no longer use scratchpad copies, and I have deleted the copies I made in v0.1.
2. **The master photo index** is now `design/inputs/content/photo_index_ALL.csv`. It is byte-identical to the copy in `photos/`.
   - It has two new columns, `archive_item_id` and `credit_rights`.
   - #108 now has a catalogue record and a rights note.
   - This closes C-05 and the old question 6.
3. **Archive rights are clarified.** The archival images are copyrighted; L-05 is updated to say so.
4. **A new, strict rule on identifiable people.** Sections 8 and 11 are rewritten, and identifying descriptions are removed from the rest of the document. The rule:
   - Any photo in which a person can be identified is referred to **by index number only**.
   - That covers everything in `faces/`, the archival #108–#116, and any `no-faces/` photo that shows an identifiable person.
   - No such photo is cropped, copied, resized, embedded, linked or described in identifying detail.
   - Crops are planned only from `no-faces/` photos, and only where the crop contains no identifiable person.
5. **Consequences for three tasks.** "Picture-in-Stone face match", the "Rivka's roses" image and the tasting-menu image can no longer use the photos the ideas file had in mind (section 11; new questions A6 and A7).
6. **Version-control risks**, new in section 2.3: the `.gitignore` rule for `faces/` is uncommitted, and `no-faces/` is untracked.
7. **Everything else from v0.1 still stands**: the conflicts, auth, storage, the brand check and the legal flags, apart from the edits above.

## Open questions (summary)

The full list is in [section 12](#12-questions-for-the-user). These seven block deliverable 1:

1. **Mural address and date.** Agrippas St 103 (ideas file, and the tile in #104) or 70 Agripas St (run 06)? 2001 (run 06, tour file) or the 2007 lead (ideas file)? See C-01 and C-02.
2. **Where the game is served.** This app under `/memory-protocol`, its own path, or its own domain? Today the app sits behind Caddy basic auth (C-07).
3. **Auth provider.** There is no user auth in this repo.
4. **Photo storage.** Where team photos live, for how long, and who deletes them.
5. **Rights.** May we crop the mural, and may we *alter* it for "what's missing"?
6. **Picture-in-Stone face match.** Drop it, or rebuild it around details that show no person (section 11)?
7. **Rachmo images.** The usable photo of the menu board and the portraits (#107) shows identifiable people. Text-only, or a new photo with no people (section 11)?

---

## 1. What I read and how

**Read in full**, in the order `design/inputs/content/README.md` gives:

- `research/prompts/DORI_UXUI_Designer_Agent_Prompt(1).md` (Parts 1 and 2), plus the user's updated brief for this round
- `design/inputs/content/Mission_Task_Ideas.md`
- `design/inputs/content/photo_index_ALL.csv` (the master, #01–#117, re-read for v0.2)
- `Cognitive_Load.md`, `Audience_Engagement_Mechanics.md`, `DORI_Digital_Platform_Research.md`
- The two place files: `machane-yehuda-nachlaot-stories.md` and `06_nahlaot_market_sites_verification.md`
- `DORI_Machane_Yehouda__Guiding_Stories.md` (untracked; the user asked for it)
- `design/inputs/brand/DORI_Final_Brand_Book.pdf`. Its text was extracted with a small script, because `pdftoppm` is not installed. I also inspected the SVG source of `DORI_logo_full_sumac.svg` and viewed `fav.png`.
- `.claude/rules/*`, `CLAUDE.md`, `README.md`, `docs/HANDOFF.md`, `docs/STATUS.md`
- App code: `app/`, `components/`, `lib/game/`, the API routes, `deploy/` and the `Dockerfile`

**Skimmed for this deliverable only:**

- `docs/DORI_Memory_Protocol_Approved_Build_Spec_v1.md` §1–4
- `docs/map/nahlaot-map-audit.md`
- `docs/design/*.md`
- `docs/scavenger_hunt/Machane_Yehuda_Tour_EN.md` (the mural and Rahmo entries)
- The decision paragraphs of research runs `01_camera_microphone_pwa.md` and `03_media_formats_audio_offline.md`

**Not read**, and kept for later as the README says: the content methodology, guiding methods, Freytag, the endowment effect, and research runs 01–04 in `design/inputs/content/`.

**Photos I looked at (v0.1).** I opened, for context only:

- #02, #37, #47, #66, #103–#106, the archival images #108–#116, and both illustrated maps;
- #107, which is in `faces/`, for context only and under the new rule.

Every photo with an identifiable person is referred to below by number only.

**Tools.** ImageMagick is **not installed**. Python 3 with Pillow 12.2 is available, so later crops can be made with Pillow into `design/output/images/` without installing anything. This is still to be confirmed (question E1).

---

## 2. Inventory

**Classes:**

- **Reuse**: as is.
- **Adapt**: the pattern or code, with changes.
- **Not for this game**: Memory Protocol material, or out of scope.
- **Unclear**: needs a decision.

**Dates:** the document's own date where it has one; otherwise the commit date.

### 2.1 Brief, rules and agent setup

| Path | What it is | Date | Class | Note |
|---|---|---|---|---|
| `research/prompts/DORI_UXUI_Designer_Agent_Prompt(1).md` | Agent definition (Part 1) and design brief (Part 2) | v3, 24 Oct 2026 | **Reuse** | Source of truth, together with this round's brief and the user's photo rule |
| `.claude/agents/dori-ux-designer.md` | The installed agent | 23 Oct 2026 | **Reuse** | Already uses "Not for this game" |
| `.claude/rules/content.md` | Evidence labels, copy rules, tag mapping, boundaries | 23 Oct 2026 | **Reuse** | Governs all game copy |
| `.claude/rules/scss.md` | SCSS conventions; 3rem tap targets outdoors; icons | 23 Oct 2026 | **Reuse** | |
| `.claude/rules/coding.md` | `Index → List → Preview`; offline queue rule | 20 Oct 2026 | **Reuse** | Its entity names are the Memory Protocol's (question F1) |
| `.claude/rules/verify.md` | How to check work on this server | 20 Oct 2026 | **Reuse** | No screenshots or headless browser |
| `CLAUDE.md` (modified, uncommitted) | The two-games rule | 23 Oct 2026 | **Reuse** | |
| `research/prompts/scavenger_hunt_prompt_addendum.md` (untracked) | Memory Protocol research addendum (screens, puzzles A–G, HARMONY/OpenAI) | undated | **Not for this game** | Puzzle A (3 L / 5 L jugs) overlaps the cistern task: borrow the logic, not the framing |

### 2.2 Content inputs for the game

| Path | What it is | Date | Class | Note |
|---|---|---|---|---|
| `design/inputs/content/Mission_Task_Ideas.md` | Bank of stops, tasks, the food-token loop and the start sequence; tagged DOC, FIELD, ORAL or FOLK | 23–24 Oct 2026 | **Adapt** | Raw ideas, not approved missions. Its section "App fit: the existing trivia engine" is about another repo: **Not for this game** |
| `design/inputs/content/photo_index_ALL.csv` (untracked) | **Master photo index**, #01–#117, with the new `archive_item_id` and `credit_rights` columns | 23 Oct 2026 | **Reuse** | Identical to `design/inputs/photos/photo_index_ALL.csv` (committed in `8f3a7b2`). If they ever differ, the content copy wins |
| `design/inputs/content/DORI_Machane_Yehouda__Guiding_Stories.md` (untracked) | Five refined guide scripts, with research notes that separate documented, oral, folklore and interpretation | Oct 2026 | **Adapt** | Background for reveals and labels. **Not approved copy.** Its links to `01_…05_Refined.md` point to files that aren't in the repo |
| `design/inputs/content/machane-yehuda-nachlaot-stories.md` | Stories from Nadav's Drive, each with its source file | 15 Oct 2026 | **Adapt** | Candidates; each needs a label and approval |
| `design/inputs/content/06_nahlaot_market_sites_verification.md` | Site verification, rights, and what to drop | 16 Oct 2026 | **Reuse** (evidence) | Research, not approved content |
| `Cognitive_Load.md` | UX talk transcript | undated | **Reuse** | Design guidance only |
| `Audience_Engagement_Mechanics.md` | Survey of engagement mechanics | undated | **Reuse** | "Quick onboarding (no logins needed)" conflicts with the login requirement (C-09) |
| `DORI_Digital_Platform_Research.md` | Restraint rules, teen privacy, push budget | ~27 Sep 2026 | **Reuse** (principles) | Rejects points; the brief decides otherwise (C-08) |
| `README.md` (content) | Reading order | 23 Oct 2026 | **Reuse** | Still points to `../photos/photo_index_ALL.csv`; the master is now the content copy |
| Methodology, guiding methods, Freytag, endowment effect, runs `01_…04_` | Method and research background | Oct 2026 | **Reuse** (consult later) | Not read for this deliverable |
| `docs/scavenger_hunt/Machane_Yehuda_Tour_EN.md` / `_HE.md` | 22-stop culinary tour for teenagers | 10 Oct 2026 | **Adapt** (background) | Mural: Citécréation, Hanukkah 2001, and the "painted boxes" anecdote. Not approved copy |
| `docs/scavenger_hunt/machane-yehuda-nachlaot-stories.md` | Duplicate of the content copy | 15 Oct 2026 | **Reuse** | Use the `design/inputs` copy |

### 2.3 Photos and images

| Path | What it is | Date | Class | Note |
|---|---|---|---|---|
| `design/inputs/photos/no-faces/` (untracked, **not ignored**) | 86 field photos the index marks as having no identifiable faces | 23 Oct 2026 | **Reuse** (crop source) | Some still show identifiable people, inside archival photos or plaques, or as painted portraits (section 8). Version-control risk: the folder is untracked and the mural files are 7–8 MB each, so a careless `git add` would commit about 70 MB+ |
| `design/inputs/photos/faces/` (**gitignored**) | 21 photos with identifiable people | 23 Oct 2026 | **Not for this game** as an image source; context only | **Never crop, copy, embed, link or commit.** The ignore rule is in `.gitignore` line 22, which is a **modified, uncommitted** file. Please commit that rule before anything else touches this folder |
| `design/inputs/photos/photo_index_ALL.csv` | Committed copy of the master index | 23 Oct 2026 | **Reuse** | Same bytes as the content copy |
| `design/inputs/photos/DORI_photos_for_repo.zip` (gitignored, 71 MB) | Original archive of the field photos plus an older CSV (#01–#107) | 23 Oct 2026 | **Not for this game** (superseded) | Now unpacked into `faces/` and `no-faces/` |
| `design/inputs/photos/*.png` (9 files, index #108–#116) | Archival images | — | **Unclear** | **Identifiable people. Index numbers only.** Copyrighted. The NLI shows them under fair use and cannot grant permission, so any use needs a licence from Yad Izhak Ben-Zvi or the family, plus a credit line. #108 has a catalogue record; the others stay TODO until the user picks images for the app |
| `design/inputs/photos/map/Illustrated Nahlaot Jerusalem Map Poster.png` (#117) | Illustrated street map, 1586 × 992 | undated | **Unclear** | The index says "style reference only until labels are corrected". It inherits the audit's problems: traced from a Google Maps screenshot, labels wrong in both languages (C-11) |
| `docs/Nahlaot_Map/*` | Map references | Oct 2026 | **Adapt** (reference only) | Licensing |
| `public/map/nahlaot-illustrated-candidate.jpg` | Web copy of the candidate map | 16 Oct 2026 | **Unclear** | Same licensing risk |
| `public/map/investigation-map-prototype.svg` | Schematic map | Oct 2026 | **Not for this game** | Keep the idea of a schematic fallback |
| `public/library/*`, `docs/National_library/*` | National Library images | Oct 2026 | **Not for this game** | |
| `docs/armoza/*` | Archival image copies (the same images as some of #109–#115) and a Yad Ben-Zvi record text | 16 Oct 2026 | **Unclear** | The same people rule and licence requirement apply |

### 2.4 Brand

| Path | What it is | Date | Class | Note |
|---|---|---|---|---|
| `design/inputs/brand/DORI_Final_Brand_Book.pdf` | Final identity system | Sep 2026 | **Reuse** | Restraint list: "No maps, skyline, olive branch, Star of David or travel pictograms in the master identity" (C-12) |
| `design/inputs/brand/DORI_logo_full_sumac.svg` | Full lockup (SVG; the prompt expected a PDF) | 23 Oct 2026 | **Reuse** | Uses an off-palette grey, `#3B403E`, inside the logo. Fine as an asset; not a UI token |
| `design/inputs/brand/fav.png` | D monogram, master plus small sizes | Sep 2026 | **Reuse** | |
| `design/inputs/brand/dori-gmail-signature-transparent.png` | Email lockup | Sep 2026 | **Not for this game** | |
| `public/DORI_wordmark_only_sumac.svg` | Wordmark only | Oct 2026 | **Reuse** | Confirm it is an approved lockup |
| `docs/design/dori-brand-to-ui.md` | Palette roles and contrast | Oct 2026 | **Reuse** | Amber is 3.0:1 on Chalk. It cites files that are missing from this repo (C-20) |
| `docs/design/israeli-mosaic-ux.md` | Brief for a platform feature | Oct 2026 | **Not for this game** | |

### 2.5 App code: UI

| Path | What it is | Class | Note |
|---|---|---|---|
| `app/globals.scss` | Tokens, reset, `.rtl`, utilities, motion tokens | **Reuse** | Palette matches the brand book. Body text is 16 px (< 17 px) |
| `app/layout.tsx` | Loads Plex Sans, Plex Sans Hebrew and Plex Mono | **Adapt** | `lang="en"` with no `dir` switching; title is "The Memory Protocol"; mono is not in the brand book |
| `app/manifest.ts` | PWA manifest | **Adapt** | Name and scope belong to the Memory Protocol; no icons |
| `components/ui/ActionButton.*` | Primary, quiet and light buttons | **Adapt** | Primary is 3.5rem ✔. Quiet is 2.75rem ✗. The arrow's hover nudge must flip in RTL |
| `components/ui/EvidenceTag.*` | The four labels as a dot and mono caps | **Adapt** | 11 px mono caps is too small; needs the light phrasing |
| `components/ui/StatusTag.*` | Draft or Fixture label | **Reuse** | For prototypes |
| `components/protocol/ScreenHeader.*` | Back button, step counter, right-hand slot | **Adapt** | The back button is 2.75rem ✗; the counter is mono |
| `components/protocol/WelcomeScreen.*`, `IndexProtocol.*`, `components/transmission/*` | Memory Protocol opening and HARMONY | **Not for this game** | |
| `components/team/*` | Team A/B picker | **Adapt** | Needs 1–3 named teams, first names, and moving a player |
| `components/puzzle/IndexPuzzle`, `PreviewPuzzleQuestion`, `PreviewPuzzleReveal` | One question with hints, a guide override and a reveal | **Adapt** | For number and text tasks, and P-10 |
| `components/puzzle/*Discovery*`, `PreviewInvestigations` | Clue crop → find → answer → reveal | **Adapt** | **The closest pattern to P-06** |
| `components/mission/*` | Illustrated map, marker states, destination card | **Adapt** | Matches "unlock one by one" (P-04) |
| `components/map/*` | Leaflet `CRS.Simple` with a schematic fallback | **Adapt** | Controls are 2.75rem ✗ |
| `components/icons/*` | 31 stroke icons | **Adapt** | Remove `transmission`, `dossier` and `catalogId` from this game; add the game's own |
| `app/dev/icons`, `app/dev/map` | Dev galleries | **Reuse** (dev) | |

### 2.6 App code: game logic, data, API and auth

| Path | What it is | Class | Note |
|---|---|---|---|
| `lib/game/types.ts` | Domain types | **Adapt** | Keep `Copy`, `ContentStatus`, `ClaimType` and `AuditEntry`. There are no player, name, photo, token or food types |
| `lib/game/answers.ts` | Deterministic normalising, scoring and `helpAfterMisses` | **Reuse** | Add tests for Hebrew input (niqqud, geresh) |
| `lib/game/engine.ts` | Pure reducer, guide actions, audit log | **Adapt** (pattern) | Its content and stages are the Memory Protocol's |
| `lib/game/store.ts` | SQLite on `game_data`; 6-character code; hashed guide token | **Adapt** | No users, names or photos |
| `lib/game/views.ts` | Player and guide views | **Adapt** | Sends other teams' scores to every phone (C-10) |
| `lib/game/http.ts` | JSON helpers; 32 KB request cap | **Reuse** | Rules out photo upload through these routes |
| `app/api/sessions/**` | Session, actions and guide routes | **Adapt** | Not wired to the UI |
| `lib/game/geo.ts` | GPS arrival check | **Unclear** | Never the only path (question C3) |
| `lib/game/missionMap.ts`, `playerMap.ts`, `basemaps.ts` | Marker view models; geo stored apart from placement | **Adapt** | |
| `lib/game/content.ts`, `screens.ts`, `library.ts`, `discovery.ts`, `harmony.ts` | Memory Protocol content and the HARMONY AI reply | **Not for this game** | |
| `lib/game/*.test.ts` | 61 tests (per the handoff) | **Adapt** | |
| `lib/base-path.ts` | `/memory-protocol` | **Unclear** | C-07 |

### 2.7 Deploy and infrastructure

| Path | What it is | Class | Note |
|---|---|---|---|
| `deploy/compose.yml` | Read-only container, 256 MB, `game_data:/data` | **Unclear** | Photo storage would have to live on this volume or elsewhere |
| `deploy/deploy.sh`, `Dockerfile`, `.claude/skills/game-*` | Build and deploy | **Reuse** | Not a design concern |
| `deploy/.env.example` | OpenAI settings and `GUIDE_CREATE_KEY` | **Adapt** | OpenAI is for the Memory Protocol only |
| README "Routing (Caddy)" | `/memory-protocol*` behind passwords on `trip.`/`app.` | **Unclear** | Puts a password wall before the invite (C-07) |

### 2.8 Memory Protocol material (not for this game)

None of these is to be edited:

- Story V1
- the build spec and its archive
- handoff v02
- the National Library tour and `HE_trans.txt`
- `docs/HANDOFF.md`, `docs/STATUS.md`, `docs/RUN_PREVIEW.md`
- research prompts and results 04 (HARMONY) and 05 (Library)

All are dated 15–20 Oct 2026, except Story V1, which has no date.

### 2.9 Neutral research I may use later

| Path | Class | Use |
|---|---|---|
| `research/results/01_camera_microphone_pwa.md` (16 Oct 2026) | **Adapt** | Native camera picker; no automatic background upload; a typed or guide path always available |
| `research/results/03_media_formats_audio_offline.md` (16 Oct 2026) | **Adapt** | Text-complete and offline-capable; a local outbox plus a server event log; about 100 MB per phone |
| `research/results/02_puzzle_animation_tech.md` (16 Oct 2026) | **Unclear** | Not read |
| `research/perplexity/*` | **Not for this game** | A tool |

---

## 3. Conflict log

The brief wins unless the row says the point is open.

| ID | Conflict | Sources | Resolution or status |
|---|---|---|---|
| C-01 | **Mural address:** "Agrippas St 103 [TO VERIFY]" vs "70 Agripas Street" | Brief, ideas file and #104 (a "103" house tile on the kiosk; the utility box on the right shows "25") / run 06 row 12; the tour file notes that the sources disagree | **Open.** Check on site |
| C-02 | **Mural date:** the 2007 lead (ideas file) vs Hanukkah 2001 (run 06, tour file); both name Citécréation | Ideas file / run 06, tour file | **Open.** The plaque in #104 can't be read at photo resolution. The "date the painting" bonus works with either year; no reveal names a year until it is approved |
| C-03 | **The "Rabbi Aryeh Levin mural" (#37, #39):** the ideas file names the subject and artist; the index says "subject UNIDENTIFIED — verify before naming" | Ideas file / index | **Open.** The mural is a painted portrait that may show a real person (section 8). Only details with no figures can be planned for now |
| C-04 | **Rachmo founding year:** "1952 and 1954" vs "Documented: 1954" | Ideas file / guiding story | **Open.** "Rivka refused to close" is a reported family recollection: **Attributed tradition** |
| C-05 | **Photo index versions** | `photos/` CSV vs the zip CSV | **Closed (v0.2).** `design/inputs/content/photo_index_ALL.csv` is the master |
| C-06 | **Login required** vs the build spec's "no end-user account required for pilot" | Brief / Memory Protocol spec | **Brief wins** |
| C-07 | **Invite link vs Caddy basic auth** | Brief / README | **Open.** Hosting decision needed |
| C-08 | **Hidden team points** vs the platform research rejecting points and scavenger engines | Brief / platform research §16, §30 | **Brief wins.** No badges, streaks, live board or celebration effects |
| C-09 | **Login** vs "no logins needed" for teens | Brief / engagement research | **Brief wins.** This is why the guest code path matters |
| C-10 | **Scores hidden** vs `playerView` exposing other teams' scores | Brief / `lib/game/views.ts` | **Brief wins.** Flag in the handoff |
| C-11 | **Illustrated map:** editorial and hand-drawn (brief) vs the poster, which was traced from Google Maps and has wrong labels | Brief / map audit, index #117 | **Open.** A style reference only; a new map is likely needed |
| C-12 | **Brand book "no maps"** vs the map as a core screen | Brand book §08 / brief | The map is a functional game surface, not identity. Keep it out of the logo, the title art and the frame. **Confirm** |
| C-13 | **Team structure:** 2 × 3 (spec) or three pairs (handoff) vs 1–3 teams of up to about 8 | Memory Protocol docs / brief | **Brief wins** |
| C-14 | **Hint cost:** "Each hint costs a token" (jug puzzle) vs "Hints cost points" | Ideas file / brief | **Brief wins:** points, never food tokens |
| C-15 | **Plex Mono** in the UI vs the brand book listing Plex Sans and Plex Sans Hebrew only | Code / brand book §04 | Proposal: no mono. **Confirm** |
| C-16 | **"Not now"** vs **"Skip"** | Platform research / brief | **Brief wins** on behaviour. The exact word is `TODO(copy)` |
| C-17 | **UK case family** vs American families | Platform research / brief | **Brief wins.** Legal review covers the US, UK, Israel and possibly the EU |
| C-18 | **"Rachmo" vs "Rahmo";** 5 HaEshkol vs a placement near HaShikma | Inputs | **Open.** The address is `[TO VERIFY]` |
| C-19 | **Ohel Moshe founding:** תרמ״ב = 1882 on plaque #02 vs "1882 or 1883" | #02 / run 06 row 3 | The gematria task decodes what the plaque says. A reveal of the founding year needs the nuance |
| C-20 | **Brand-to-UI doc** cites files missing from this repo | `docs/design/dori-brand-to-ui.md` | Use `design/inputs/brand/` |
| C-21 | **The hook line:** the brief's version vs the ideas file's longer version | Brief / ideas file | **Open.** Which is final? |
| C-22 *(new)* | **Tasks that depend on images of people** vs the user's rule on identifiable people. Affected: face match (plaque faces), "Rivka's roses" (#107), the Hesed VeRahamim then-and-now images (#110–#114), "find the doorway today" (#116) | Ideas file and index / the user's rule (23 Oct 2026) | **The user's rule wins** for every output. On-site play can still point at the real wall or plaque; the app shows no image of the person. See section 11 and questions A6 and A7 |

Minor note: some inputs are dated 24 Oct 2026 while the system date is 23 Oct 2026. I assume a time-zone difference.

---

## 4. Existing UI patterns, checked against the brand and the brief

| Pattern | Where | Brand fit | Brief fit (outdoor, all ages) | Verdict |
|---|---|---|---|---|
| Palette tokens | `globals.scss` | ✔ exact | Ink 12.6:1, Sumac 5.6:1, Za'atar 4.6:1 (plain Chalk only), **Amber 3.0:1** | **Reuse.** Food-token numbers go in Ink on an Amber fill, never Amber text on Chalk |
| Typography | `layout.tsx` | ✔ Plex Sans and Hebrew; ✗ Mono | ✗ body 16 px; labels mostly 11–13 px | **Adapt.** Body at least 17 px, no mono |
| Primary button | `ActionButton` | ✔ | ✔ 56 px | **Reuse** |
| Quiet button | `ActionButton.quiet` | ✔ | ✗ 44 px | **Adapt** to 48 px |
| Back control | `ScreenHeader` | ✔ | ✗ 44 px; mono counter | **Adapt** |
| Evidence label | `EvidenceTag` | ✔ | ✗ 11 px mono caps; no light phrasing | **Adapt.** Only "The story goes…" is given; three phrasings are `TODO(copy)` |
| Draft/Fixture tag | `StatusTag` | ✔ | prototypes only | **Reuse** |
| Dark Ink panels | transmission, reveals | ✔ | ⚠ the HARMONY association; glare in sun | **Adapt.** Use sparingly |
| Line icons | `components/icons` | ✔ | The tap area must be 48 px | **Adapt** |
| Map with marker states | `mission`, `map` | ✔ if the art is editorial | ✔ next, locked, complete | **Adapt.** 48 px controls; unlocks come from game events |
| Clue → find → answer → reveal | `puzzle/*Discovery*` | ✔ | ✔ one idea per screen; hints; guide override | **Adapt** (P-05, P-06, P-10) |
| Team picker | `team` | ✔ | ✗ two fixed teams, no names | **Adapt** |
| Bottom tab bar | none | — | Required by the brief | **New** (deliverable 3) |
| RTL | `.rtl`; `html {direction: ltr}` | — | ✗ no `dir="rtl"` mode | **Adapt** |
| Motion | duration tokens with reduced-motion handling | ✔ | ✔ | **Reuse.** No confetti |
| Logo | wordmark on the Memory Protocol welcome | ✔ | — | **Reuse** on P-00 |

---

## 5. Auth and login today

**There is no user authentication.** What exists:

1. **A session code:** 6 characters, from an alphabet with no 0/O or 1/I/L. Creating a session can also require `GUIDE_CREATE_KEY`.
2. **A per-session guide token:** returned once, stored as a SHA-256 hash, and sent in `x-guide-token`.
3. **A self-generated `deviceId`** that joins team A or B. A phone can't switch teams. A new phone, or cleared storage, loses the link to its team.
4. **No names, emails or accounts.** Teams hold device IDs only.
5. **A Caddy basic-auth perimeter**, planned (C-07).
6. **Nothing is wired.** The UI is local state only and resets on refresh.
7. **Supabase and the trivia login** live in another repo and are out of scope.

**What carries over:**

- the unambiguous code alphabet;
- storing secrets only as hashes;
- the audit log;
- server-authoritative state.

**What's missing:**

- player identity, first names and the team roster;
- Google, Apple and magic-link sign-in;
- guest join with a team code;
- team restore and moving a player;
- a privacy flag on teens' answers.

### Login risks to resolve in deliverable 1 (noted, not designed)

- **The password wall:** C-07.
- **In-app browsers.**
  - A WhatsApp or Gmail link opens in a webview, where Google sign-in may be restricted.
  - A magic link can open in a different browser from the one that asked for it.
  - An iPhone Home Screen PWA keeps its storage apart from Safari.
  - `[TO VERIFY]` each of these on the families' likely devices.
- **Email on weak signal:** fine before the day, risky in the street.
- **"First name only" vs sign-in emails:** store the email, use it only for recovery, or drop it.
- **The 4-digit guest code** has 10,000 combinations. Scope it to one session and rate-limit it.
- **Players under 13 and managed Google accounts:** `[TO VERIFY]`.
- **Data roaming:** American visitors may have no local data, which raises the stakes for offline play and for the guide restoring a team.
- **No auth provider exists here.** Installing one needs approval.

---

## 6. Photo upload and storage today

**There is none.**

- No upload endpoint; requests are capped at 32 KB.
- Images are static files in `public/`.
- The container is read-only, with only the `game_data` volume and `/tmp` writable.
- No object storage, thumbnails, EXIF stripping or retention job.
- The engine never stores raw GPS coordinates, which is a good precedent.

**Run 01 recommends** the native camera picker and no automatic background upload; a typed answer or guide confirmation always counts.

**Implications:**

- P-06 and G-03 need a photo path that survives weak signal, for example queue on the phone while the guide confirms by sight.
- Storage, retention, deletion on request, and stripping EXIF and location data all need decisions.
- **New:** player photos can capture strangers. That risk falls under the same people rule as the field photos (L-04).

## 7. Offline and sync today

`coding.md` requires a local queue followed by sync, but **none of it exists**: no service worker, no outbox, no client storage. The per-session `version` in `store.ts` and run 03's outbox-plus-event-log are the starting points. P-13 and G-02 to G-05 depend on this.

---

## 8. Photo audit under the people rule

**The rule (user, 23 Oct 2026).** A photo in which a person can be identified:

- is referred to by **index number only**;
- is never cropped, copied, resized, embedded or linked;
- is never described in identifying detail in any file under `design/output/`.

Crops come only from `no-faces/`, and only where the crop shows no identifiable person. `faces/` is for local context only and is never committed.

### 8.1 Identifiable people: index numbers only, no crops

| Group | Index numbers | Why |
|---|---|---|
| `faces/` folder | #04, #06, #08, #10, #11, #12, #13, #16, #17, #19, #20, #24, #68, #72, #74, #75, #80, #83, #85, #86, #107 | Flagged in the index. #20, #74, #75, #85 and #107 include minors. #12 and #80 are memorials; #68 is a religious act |
| Archival images | #108–#116 | Identifiable people, minors included. Copyrighted, licence needed (L-05) |
| `no-faces/`, with archival photos inside plaques or panels | #01, #03, #22, #23, #26, #27, #32, #50, #51, #57, #60 (and #02's portrait inset) | The index marks them "no (archival)", but each carries a photograph of identifiable people. A crop may take only text, dates, frames or ornament, never the photo area |
| `no-faces/`, other people content | #106 (framed family photos and a portrait on the wall), #79 (portrait poster at a memorial candle house; also excluded as a memorial), #95 and #102 (screenshot or newspaper; may contain portraits, `[TO VERIFY]`) | Treat as identifiable until checked |
| Painted portraits of possibly real people | #15 (painted shutter), #37 and #39 (mural, C-03), #43 (painted face) | Artwork that may depict a real person. Plan only crops that show no face or figure until you decide (question A8) |
| Distant figures ("low" in the index) | #61, #63, #66, #67, #88, #96 | Crops must exclude the figures |

### 8.2 No identifiable person: crops may be planned (later deliverables)

| # | Plan | Watch-outs |
|---|---|---|
| #103, #104, #105 (mural) | Find-the-detail crops of painted objects: laundry, bicycle, garlic strings, stacked pita, watermelons, awning, the real vents, the "103" tile, the treble-clef sign. "What's missing?" base from #105 or #103 | (a) The mural's own image rights (L-05). (b) Whether the painted figures are generic or portraits of real people is `[TO VERIFY]`; until then, plan **object** crops and treat painted faces like #15. (c) In #104 a **death notice** with a personal name is posted on the utility box: every crop excludes it |
| #02 | Gematria: crop the oval label "Ohel Moshe 1882 / אהל משה תרמ״ב" | Exclude the portrait inset in the lower corner |
| #05 | Montefiore gate, inscription panels and rosette | Clean shot per the index |
| #21, #46, #47, #48 | Hesed VeRahamim: the date tile, the heritage sign, the Eshet Hayil door, the 12-tribes door | Leave out the prayer-times boards (L-09) and the sidewalk area |
| #64, #66 | Cistern task: water meters and the vessel-mikveh sign | #66: the meters only, no figure; look from the street. #64: the sign only. Never #68 |
| #59 | The 18-tiles (if that idea comes back into the route) | Private home: tiles only, no address in the app |
| #84, #70 | The sundial (a reserve stop outside the zone) | — |
| #76, #78 | Tahini mill (claim phase) | Reflections on the glass, `[TO VERIFY]` |

---

## 9. Content gaps and [TO VERIFY] items

### Facts and places

| Item | Status |
|---|---|
| Mural street number and corner | `[TO VERIFY]` (C-01) |
| Mural artist and year | `[TO VERIFY]` by reading the plaque on site (C-02) |
| The treble-clef sign on the mural wall | Wording `[TO VERIFY]` |
| Whether the mural's painted figures are generic or real people | `[TO VERIFY]` (new; governs crops) |
| "What day is it?" | ORAL, so **Attributed tradition**. Its DOC source "05a §5.8" is not in the repo |
| The gematria reveal | Its source page was not fully read. The NLI blog on "אעלה בתמר" (22 Feb 2022) is cited in run 06 |
| Batei Goral house number (31?) and founding (1884 or 1885) | `[TO VERIFY]` |
| Hesed VeRahamim | The tile says 1925 and the sign tells the tavern story (#21, #47). Both are FIELD; the tavern episode itself is **Attributed tradition** ("some say", per the #115 catalogue notes in the index) |
| Mural in #37 and #39 | Subject and artist `[TO VERIFY]` |
| Cistern | Reported opposite Gilboa 11 (run 06). Safe sightline `[TO VERIFY]`. The cups version (300 and 500 ml) avoids the cistern entirely |
| Gan HaTut | The same garden as Bustan Sephardi, so **one stop** |
| Rachmo | Spelling, address, the take-away arrangement and prices `[TO VERIFY]` |
| Tasting menu | 6–8 stalls with dishes, one-line stories, **opening hours** and token prices: not supplied beyond Rachmo. Run 06's 2026 listings say "not guaranteed open" |
| Hakmat HaBorekas, Etz Hayim St | Hours and arrangement `[TO VERIFY]` |
| Token and points numbers; per-team shekel cap | Not set |
| Walking times | Not measured |
| Ending quiz questions; the family question | No approved wording |

### Copy gaps

Every screen string for P-00 to P-14 and G-01 to G-05 is missing, along with:

- the slide bodies (beyond "Tap a stop's icon when you arrive.");
- task prompts, hints, wrong-answer messages and reveals, in English and Hebrew;
- the light phrasings for three of the evidence labels;
- the consent, privacy and guest text;
- the offline messages;
- **image credit lines.**

All of these will be `TODO(copy)`.

**Approved wording I can quote:**

- the title, provisionally;
- the premise line;
- the hook (pending C-21);
- "Tap a stop's icon when you arrive.";
- the Rachmo menu translations (to confirm with the restaurant).

---

## 10. Flags for legal review

This is not legal advice.

| ID | Flag | Why |
|---|---|---|
| L-01 | **Minors' personal data:** names, team, answers, photos, possibly voice | COPPA and US state law, UK GDPR and the ICO children's code, Israel's Privacy Protection Law and its 2025 amendment, and the EU GDPR. Which apply, and the consent ages, are `[TO VERIFY]` |
| L-02 | **Teens' answers hidden from parents by default** | Must be reconciled with parental consent for under-13s and with the guide's access |
| L-03 | **Sign-in providers** | The provider becomes a data processor; email vs "first name only"; account age limits; hosting region `[TO VERIFY]` |
| L-04 | **Player photos** | Strangers or other children caught by accident; retention, deletion and EXIF/location stripping; no marketing. **New:** apply the same people rule to what players capture, e.g. guide confirmation without keeping images of bystanders |
| L-05 | **Third-party image rights** | **Archival images (#108–#116, and the photos inside the Picture in Stone plaques):** copyrighted. The NLI shows them under fair use (s.19, Copyright Act 2007) and **cannot grant permission**. Any use needs a **licence from Yad Izhak Ben-Zvi or the family, plus a credit line** (index `credit_rights`). **The mural (#103–#105):** the artists' rights over crops, and especially over a **digitally altered** version, `[TO VERIFY]`. **The map** was traced from Google Maps |
| L-06 | **Images of deceased people and private family photos** (#106, #107) | Not used in outputs under the people rule. Any future use needs family consent |
| L-07 | **Trademark** | "The Amazing Shuk" vs CBS's "The Amazing Race" |
| L-08 | **Food** | Allergens, kashrut, no alcohol for minors (beer is on the Rachmo board), and a token must never read as a voucher |
| L-09 | **Religious and memorial sites** | No tasks at memorials or during prayer. Prayer times and memorial notices stay out of all game imagery |
| L-10 | **Location data** | Minors' precise location, if GPS is used |

---

## 11. Image needs and consequences of the people rule

The full list is deliverable 11 (`image-needs.md`). Here is what discovery already shows.

### Tasks affected by the rule (C-22)

| Task | Image it relied on | Consequence |
|---|---|---|
| Picture-in-Stone face match | Faces cropped from the plaque photos (#01, #03, #22, #23, #26, #27, #32) | **Cannot be built as described.** Options: (a) drop it; (b) rebuild it as "find the plaque" from **non-person** details (the plaque's title line, a date, a frame ornament, a word in Ladino); (c) a licence plus your explicit exception. Question A6 |
| Rivka's roses | #107 | The app shows **no image**. The task points at the real wall (count the roses on site), as a text prompt with guide confirmation. Question A7 |
| Tasting menu and Rachmo board | #107 | No crop of #107. Needs a **new photo of the board with no people**, or a text-only menu |
| Hesed VeRahamim then and now; "two stories" | #110–#114 | Not used. "Two stories" runs from #21 and #47, which show no people |
| "Find the doorway today" | #116 | Not used. Needs a licence and your exception, or drop it |
| Rachmo wall tasks ("Then and now", "Ask one question") | #106 | No image of the wall photos. On-site and text-only |

### New images needed (to supply or approve)

1. **The Rachmo menu board**, with no people in the frame.
2. **The mural plaque** (left of the painted shop in #104), close and legible.
3. **A rights-clean illustrated map** (the direction comes in deliverable 8).
4. **Tasting-stall images with no people**, one per stall, or a decision to keep the menu text-only.
5. **Picture in Stone plaques:** close-ups of the title lines and dates, for option A6(b).
6. **Gan HaTut:** the ground for Samal, empty.
7. **Batei Goral and Abulafia St:** a street-facing view with no people and no house interiors.
8. **Tie-rod anchor plates:** square, spiral, figure-8 and S shapes (idea 25; no photo yet).
9. **The altered "what's missing?" image** of the mural. I can make it myself from #105 or #103 once L-05 is cleared; it carries the label **Fiction**.

---

## 12. Questions for the user

### A. Blocking deliverable 1

1. **Mural (C-01, C-02):** street number, corner and year. Can someone read and photograph the plaque?
2. **Hosting (C-07):** which path or domain, outside the basic-auth wall?
3. **Auth provider,** and whether to store the email. Any install needs your go-ahead.
4. **Photos:** storage, retention, viewers, deletion. Should the people rule also govern photos that players take?
5. **The mural:** may we crop it, and may we alter it for "what's missing"?
6. **Picture-in-Stone face match:** drop it, rebuild it from non-person details, or license with an explicit exception?
7. **Rachmo images:** may I plan a text-only "Rivka's roses" and request a new, person-free photo of the menu board?
8. **Painted portraits** (#15, #37, #39, #43, and any painted figure in the mural): do they fall under the people rule?

### B. Content and evidence

1. **Rachmo:** spelling, address, founding year (C-04, C-18), and the take-away arrangement.
2. **The hook line** (C-21).
3. **The mural in #37 and #39:** who painted it, and whom it shows (C-03).
4. **The tasting stalls:** which ones, and who supplies dishes, stories and prices?
5. **Numbers:** tokens per task, prices, and the per-team cap.
6. **Source "05a":** where is it?
7. **The content README** still points to `../photos/photo_index_ALL.csv`. May it be updated to point to the master copy? I can't edit inputs.

### C. Product

1. A 4-digit team code, the 6-character session code, or both?
2. Scoring when the family plays as one group?
3. GPS, yes or no?
4. Changing language mid-game, or set per player?
5. Teens on their own phones (affects L-02)?

### D. Brand

1. No Plex Mono (C-15)?
2. The map as a game surface (C-12)?
3. Which lockup on P-00?

### E. Tools and repo hygiene

1. May I use the installed Python and Pillow for crops into `design/output/images/`?
2. Please **commit the `.gitignore` rule for `faces/`** (currently uncommitted). Decide whether `no-faces/` should be committed or ignored (about 70 MB+).

### F. Naming (later)

1. May the game use its own entity names (e.g. `IndexStop`, `IndexTask`, `IndexWallet`)?

---

## 13. Stop-point summary

- **Reuse:** the tokens, the primary button, the crop → find → reveal flow, the map markers, the deterministic answer checks and the audit log can all be adapted. The Memory Protocol's story, content, HARMONY and Library material are not for this game.
- **Gaps:** there is no user auth, photo storage, offline sync or Hebrew mode. The app would sit behind a password wall and leaks other teams' scores. Text and controls are too small for outdoor use.
- **People rule:** it removes every image of a person from outputs. Face match, the Rivka's roses image, the Rachmo menu image and the archival then-and-now tasks need your decision or new photos with no people.
- **Mural:** crops are possible, pending the artists' rights, the address and the year.
- **Totals:** 22 conflicts (C-05 closed, C-22 new), 10 legal flags (L-04, L-05 and L-06 updated), 9 image needs. The questions blocking deliverable 1 are A1–A8.
