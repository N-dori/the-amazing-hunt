# DORI — The Memory Protocol
## Approved Build Specification v1.0 · 16 October 2026

**Status:** Authoritative product scope for Prototype 01. Supersedes older handoffs where they conflict. Approved historical story (`The_Memory_Protocol_Story_V1.md`) remains authoritative for the narrative; do not rewrite it. This document settles implementation and gameplay decisions, not unverified historical claims.

# 1. Engineering instruction

Continue working in `/root/projects/Tour-Tech/memory-protocol`, branch `scavenger_hunt`, app `apps/memory-protocol`. The existing stack is Next.js 16 / React 19, existing game Docker image and deploy script, and shared external Caddy (`revivo-caddy-1`). Preserve existing dori-site, dori-platform, revivo services, certificates, networks and volumes. Do not create a second proxy, migrate other apps, remove data, or modify the public Caddy configuration before the owner approves a staged cutover. Do not assume any deployment is already live.

Before building: examine Next.js `basePath`, links, `_next` assets, PWA manifest and application routing against the proposed `/memory-protocol` Caddy handler. `handle_path` strips the prefix; use a coherent routing design with tests, not an unexamined snippet. Check disk safety: reported 83% used, deployment scripts stop at 85%. Do not build large images on the server without checking free disk and cleanup strategy. First test with isolation and staging; only then request approval to alter Caddy or promote the image.

Use the existing brand book, DORI screen rules and story if accessible. If unavailable, list exactly which files need to be supplied; don't make up brand tokens or historical passages.

# 2. Participants and game session

Exactly SIX players, two teams of THREE (not three pairs). English-language visitor UI; Hebrew/Ladino sources displayed with correct script direction. Guide creates a session and shares short join code or QR; no end-user account required for pilot. Team members may use one or multiple phones. Guide can inspect progress, confirm physical arrival, bypass blocked tasks with logged reason, and trigger shared reveal. Team state and scoring must survive reload and synchronize across phones when a persistent store is introduced. Prefer a lightweight SQLite DB on its own persistent named volume if compatible with existing deployment; do not add PostgreSQL solely for this small pilot. Use server-authoritative game state.

# 3. Experience arc

**00A National Library exterior** → **00B/C optional interior warm-ups (not yet selected)** → **00D Armoza archival evidence** → **Picture in Stone physical search (conditional on field verification)** → **navigate to Hesed VeRahamim** → **reconstruct historical story** → **two different parallel-world crises** → **free-text answer and AI response** → **shared reflection + restored historical map layer** → **novel recommendation and culinary reward** → **visit Hakmat HaBorekas MeHaifa**.

HARMONY is a fictional system that altered humanity's remembered history to eliminate records of conflict. Real historical evidence inspires—not dictates—contemporary solutions. Keep source claims, oral stories, literary fiction, and hypothetical crises visibly distinct.

# 4. Map and navigation

Primary map is STATIC ILLUSTRATED, pan/zoom, markers, destination photos, written navigation clues, hint levels, and separate historical illustration/photo overlays unlocked by game state. Use a simple image-coordinate map (Leaflet CRS.Simple or an equivalent compatible implementation) and store independently the destination's verified geographic lat/lon. Do not swap in Google Maps as the primary view. External walking navigation remains an optional fallback.

Implement an explicit “I'm Here” control using browser `navigator.geolocation.getCurrentPosition()` on user action only (HTTPS, permission required). Read position, accuracy, timestamp; compare against per-site configurable threshold. Proposed test thresholds 30 m near / 80 m uncertain—not guaranteed accuracy; field-test before relying on them. If low accuracy, denied permission or out-of-coverage, offer a site observation challenge or guide approval. No constant tracking; never forward raw coordinates to GPT. Do not give location-dependent points until arrival is reasonably verified. Client GPS coordinates are not tamperproof.

# 5. Library exterior and interior

Outside: short guide-led briefing about the National Library and the fiction of HARMONY; investigator identity unlocked. The TWO inside-building tasks are NOT FINALIZED. Implement configurable, optional, disabled-by-default mission slots; potential source material: Letters of Light, Broken Time, the library timeline, or architecture. Do not invent exact labels, access permissions, questions or directions. No physical item ordering or request waiting mechanics in Prototype 01. Use the online archive investigation instead.

# 6. Historical archive — two team tracks

Source catalog: Yad Yitzhak Ben-Zvi, Armoza family collection, National Library catalog.

- Photograph WITHOUT inscription: `IL-INL-YBZ-0024-004`, system ID `997009637209805171`, URL `https://www.nli.org.il/he/archives/nnl_archive_al997009637209805171/NLI`.
- Photograph WITH inscription: `IL-INL-YBZ-0024-009`, system ID `997009637209005171`, URL `https://www.nli.org.il/he/archives/NNL_ARCHIVE_AL997009637209005171/NLI`.

Caption describes Armoza family members, founders, Mazor medical organization and doorway at left associated with its clinic. Catalog cites 1925 for establishment of clinic, whereas photo itself is cataloged circa 1939–1945. Do not merge those dates. Respect reuse rights of actual archival photos; provided files may be used only when rights permit. For development, show labeled placeholders when unlicensed.

**Team A** investigates same-scene photos with/without inscription; compares and notes the information lost, then identifies the Mazor clinic from the catalog, with identifier citation. It is NOT a fake image difference task. **Team B** investigates a SEPARATE verified Armoza portrait/family image and uses its caption to identify the people and connection. If no second photo is authorized and catalog-verified, use a clearly flagged alternate catalog-metadata investigation; do not invent photographic content or identities. Both tracks award equivalent maximum score and converge on a common evidence dossier.

# 7. Picture in Stone

"תמונה באבן" is a public-street heritage/photo interpretation project in Nahlaot. The specific Armoza-related image, exact wall and answer have **NOT** been field verified. Do not claim that an Armoza image is on a nearby wall. Build a location- and source-configurable task with photo comparison, inscription entry or guide confirmation. If its target remains unverified, it must be SKIPPABLE with an alternative guide-led heritage observation and no penalty. Avoid private-property access.

# 8. Hesed VeRahamim

Target: Hesed VeRahamim synagogue in Nahlaot; verify navigation coordinate and public viewing point. Use archival family narrative about transformation from tavern/drinking establishment to synagogue and local charitable institutions, including connection to Mazor. Source dates/accounts may conflict; state uncertainty rather than silently reconcile. Do not claim every resident agreed. Players observe site and reconstruct: prior use, people associated, new use, connected services, what sources leave unknown. Then teams receive different contemporary dilemmas.

# 9. Contemporary crises (APPROVED)

**Team A — The Last Phone Booth.** Fictional village converts traditional public phone to defibrillator station; some residents still rely on phone due to unreliable mobile reception; limited resources. Balance medical response, communication, minority needs, budget and alternatives. Inspired by real British phone box conversions but specific conflict is game fiction.

**Team B — The Monument's Second Life.** Fictional controversial historical monument removed from a public space. Debate whether to remelt into a new artwork, preserve and contextualize as history, or other solution; weigh memory, public harm, public authority, evidence and reinterpretation. Inspired by documented public monument disputes; avoid presenting contested interpretations as unquestioned fact.

Thematically both relate to use, transformation, community interest and what might be lost. Do not replace Team B with the abandoned railway or a generic building allocation scenario.

# 10. Response and HARMONY AI

Each team submits an ORIGINAL free-text proposal with basic stakeholder and trade-off analysis. Model returns a short thoughtful character response: one aspect addressed, one potentially overlooked perspective, one constructive reflection/question. The model does NOT determine the single correct moral answer, invent historical facts, edit scores, or unlock rewards. Use only approved factual context. All API calls server-side, with structured output and validated schema; no browser-exposed key. Implement deterministic scripted fallback when no API key, timeout or failed response; game remains completable. Avoid storing sensitive prompts unnecessarily. Guide may review. In game fiction, HARMONY thanks players for helping the two communities work toward agreement; don't promise real problems solved just because someone submitted text.

# 11. Shared ending and tasting

Only after both teams submit and shared guide reveal: restore the historical-map layer of Hesed VeRahamim. Offer two rewards:

1. Literary recommendation: Sarit Yishai-Levi's *The Beauty Queen of Jerusalem* (מלכת היופי של ירושלים), Luna Armoza, Sephardic Jerusalem, Ladino, and its TV adaptation. Literary characters and narrative are not proof of specific archival events. Optionally the guide may read from a legally obtained book, but no assumed quotation or page 9 claim until edition and rights checked.
2. Culinary reward: route to "חכמת הבורקס מחיפה" (Hakmat HaBorekas MeHaifa), Mahane Yehuda. Explain borekitas as part of Sephardic culinary memory, without claiming that the vendor's bourekas is exactly the same pastry. Vendor opening hours, exact address, item availability and participation/reward agreement must be checked before promises. The anecdote about Efi/Bakhar is attributed tour storytelling, not independently established fact. Tasting reward is guide-activated/redemption tracked, with no payments.

Suggested short character beat: "You've helped two communities find a way forward. You deserve two rewards: a story worth reading, and a memory you can taste." Do not fabricate copyrighted source quotations.

# 12. Scoring and verification

Navigation bonus is granted when arrival confirmed (suggested independent 20 / hint 15 / external navigation 10, configurable). Archive identification and bounded observation answers can be automatically scored. Open moral dilemmas: no ideological or moral correctness score from GPT. If quality scoring is desired, guide uses a transparent rubric (stakeholders, consequences, practicality and source connection). Team tasks need comparable maximum points; don't reward only speed on thoughtful decisions. Teams compete while the game shares a common memory-restoration milestone.

# 13. UX design

Implement: welcome, join team, story transmission, illustrated map, destination card, evidence comparison and metadata lookup, Picture in Stone conditional stop, site arrival, history reveal, two crisis cards, free-text input, model/fallback feedback, shared restoration, novel card, tasting redemption. Progressive disclosure: one main idea, prompt and action per screen. Clear back/map buttons and resume. Large taps, sunlight readability, support Hebrew RTL, reduced motion and text alternatives to audio/camera. Camera/microphone are optional and never block completion. An evidence dossier tracks source identifier, evidence type, and claim status.

# 14. Engineering milestones

1. Audit existing app, Next.js basePath, PWA URLs, Caddy rules and disk space; report safe plan. Do not deploy live.
2. Add content fixtures, session/team state, guide override, basic persistence, mission engine and UI shell.
3. Implement map, markers and historical overlays, GPS verification and test fallback.
4. Implement archive comparison, two-team task assignment and conditional Picture in Stone.
5. Implement synagogue reconstruction, two dilemmas, typed proposals and scripted responses.
6. Integrate OpenAI Responses API behind server only; preserve fallback.
7. Implement joint unlock, map restoration, book and food reward.
8. Run automated tests and two-team browser simulations, build isolated container; report screenshots and known blockers.
9. Request explicit authorization before changing public Caddy routing, starting live service, or promoting deploy.

# 15. Acceptance checks

- Existing public site, platform and revivo continue unchanged.
- Two groups of three join one session; each group may use more than one phone.
- Archive tasks have accurate identifiers; no invented metadata or photo contents.
- Unverified physical Picture in Stone location is optional and clearly labeled.
- Progress persists on refresh and syncs across devices once storage is active.
- Map pans/zooms, markers unlock, historic overlays appear upon shared completion.
- Geolocation asks permission on direct user action; fallback works without permission.
- Team A sees phone booth, Team B sees monument; no railway crisis.
- Typed answers and scripted AI fallback permit completion with no API key.
- No AI-based moral correctness score or uncontrolled advancement.
- Reading reward and tasting destination unlock only after joint milestone.
- Guide may approve arrival and redeem reward; event audited.
- Docker image builds and tests without restarting existing live services.
- Proposed Caddy `/memory-protocol` setup is compatible with Next.js 16 basePath and assets.

# 16. Unresolved before live pilot

- Two precise interior National Library tasks and route.
- Rights for Armoza archival photographs.
- Separate Team B family portrait/caption.
- Exact, accessible Picture in Stone wall/photo location.
- Synagogue public arrival viewpoint / GPS pin and observable proof.
- Final illustrated map and historical layer design.
- Edition/page/reading rights for novel excerpt.
- Vendor address, working hours, pastry availability and reward arrangement.
- GPT feedback rubric and response QA with real examples.

Use clearly marked fixtures or disable dependent optional features until verified. Never invent missing physical evidence.

**Instruction to Claude Code:** This approved spec is now the single source of truth for Prototype 01 product behavior. It supersedes the old three-pair handoff. Read it in full, inspect current code and assets, report any true blockers, and begin a non-destructive, isolated implementation. Do not modify production routing without owner approval.
