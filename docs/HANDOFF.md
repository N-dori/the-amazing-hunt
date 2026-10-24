# The Memory Protocol: new-session handoff (2026-10-16, updated after Mission 00C)

Read first: `CLAUDE.md` and `.claude/rules/`, then `docs/DORI_Memory_Protocol_Approved_Build_Spec_v1.md` (amended 16 Oct 2026). The story is locked: `docs/scavenger_hunt/The_Memory_Protocol_Story_V1(1).md`. Claude never reviews in a browser; the owner does.

Work happens on branch `main` of this repo, `/root/projects/The-Amazing-Hunt` (since 20 Oct 2026; before that the game was `apps/memory-protocol` on branch `scavenger_hunt` of the DORI platform monorepo).

## The Library chapter (owner decision, 16 Oct 2026)

A fixed, mandatory sequence. It supersedes the spec's older "optional, disabled interior tasks":

| Code | Mission | Status |
|---|---|---|
| 00A | National Library introduction | The opening flow: welcome, team, HARMONY transmission. There is no separate guide-briefing screen |
| 00B | Historical timeline, 1946 (The First Memory Keepers) | Built |
| 00C | Parallel discovery missions: Team A, The Traveler's Prayer; Team B, Broken Time | Built |
| 00D | Armoza archival investigations | Content fixtures and engine only; no UI |
| 00E | Shared evidence reveal and Nahlaot unlock | Not built, and not yet a stage in the engine |

## Built (visual prototype, local state only)

| Area | What | Main files |
|---|---|---|
| Opening flow (00A) | Welcome → Team A/B (mock seats) → HARMONY transmission (Story V1's six sections, then the mission) → investigation map | `components/protocol/`, `components/team/`, `components/transmission/`, `components/mission/` |
| Mission 00B, The First Memory Keepers | Library card → HARMONY brief → find the timeline wall (level −2) → one question (accepts 1946 or תש״ו; hints, then a guide override after 3 misses) → reveal → both 00C investigations open | `components/puzzle/IndexPuzzle.tsx` and its previews, `lib/game/library.ts` (+ test) |
| Mission 00C, parallel discoveries | From the investigations screen, the visitor's team begins its own mission. Both share one flow: HARMONY brief → clue (a cropped photo) → find (optional hint) → observe → read → answer (escalating hints, guide override after 3 misses) → reveal. **Team A, The Traveler's Prayer:** answer America / the United States (English or Hebrew); reveal of the panel photo and the translation's last words; the message that memories and traditions travel with people; then an optional reflection, never scored or saved. **Team B, Broken Time:** the clue is a crop of the crack only; players read the Library's Bloomberg Connects guide via the Library's own QR code (no scanner in the app); the answer is free text, accepted when it is at least three words and names a rupture, division or conflict; then the complete photo, the wall label, the guide's own text and HARMONY's reflection. Done teams are marked, and the screen names Mission 00D as next. Under dev tools, the other team's mission can be previewed from the same phone | `components/puzzle/IndexDiscovery.tsx`, `PreviewDiscoveryStep`, `PreviewDiscoveryAnswer`, `PreviewDiscoveryReveal`, `PreviewDiscoveryReflect`, `PreviewInvestigations`; `lib/game/discovery.ts` (+ test) |
| Player Investigation Map (illustrated) | The illustrated concept map is primary (Leaflet `CRS.Simple`), with the schematic as fallback (also used automatically if the image fails to load). Markers have next, locked, conditional and completed states, from the site records and never from the artwork. The Library is an off-map marker on the west edge. The Library card follows the team's progress: Mission 00B, then the team's 00C, then 00D (`libraryCard()`). The map's position and zoom are kept across a mission round trip. After Mission 00B, the "Memory restored · 1946" layer appears, marked illustrative. A "Concept map — not for navigation" notice is always shown. Dev controls (map style, a simulated synagogue completion) appear only when `MP_DEV_PREVIEW=1` or under `next dev` | `components/mission/` (`ListMission`, `IndexMission`, `DevMapControls`), `components/map/LeafletBaseMap.tsx`, `lib/game/playerMap.ts` (+ test), `lib/game/basemaps.ts` |
| Map integration preview (dev only) | Leaflet `CRS.Simple` over the candidate Nahlaot illustration or the schematic; provisional Hesed VeRahamim marker; destination card with a photo slot and external navigation; history layer after a demo completion | `app/dev/map/`, `components/map/`, `lib/game/basemaps.ts` (+ test) |
| Map audit | Geographic accuracy audit, asset suitability, marker strategy, field-verification list | `docs/map/nahlaot-map-audit.md`, plus two overlay JPEGs |
| Shared UI | `ActionButton`, `StatusTag` (Draft or Fixture label), `EvidenceTag` (the four evidence labels), `ScreenHeader` | `components/ui/`, `components/protocol/ScreenHeader.tsx` |
| Server engine (not wired to the UI) | Sessions, teams, deterministic scoring, guide overrides with an audit log, and SQLite persistence. Team stages: `briefing` (00A) → `timeline` (00B) → `discovery` (00C) → `archive` (00D) → Nahlaot stages. `submitTimeline` and `submitDiscovery` reuse the client's answer checks; the guide can bypass 00B or 00C, logged and unscored. Team A's reflection is never sent | `lib/game/engine.ts`, `store.ts`, `types.ts`, `app/api/sessions/` (+ `game.test.ts`) |

**Copy:** text from Story V1, the spec, the owner's briefs, and words quoted verbatim from legible photos (the timeline's 1946 entry, the Broken Time wall label and its digital-guide entry) is marked `approved`. Everything else is `draft` or `fixture` and is labelled on screen (one note per screen, plus a tag on each fixture). Screen copy lives in `lib/game/screens.ts`, `library.ts`, `discovery.ts` and `basemaps.ts`.

## Verify and preview

- **Tests:** `npm test` (that is, `node --experimental-strip-types --test lib/game/*.test.ts`) gives 61 passing. The host has Node 22 but no `node_modules`.
- **Type-check and build:** `/game-verify`, or `docker build -t dori-game:test` in tmux. Check `free -h && df -h /` first.
- **Local preview** (not live): container `dori-game-preview` on `127.0.0.1:3200` (how to run it: `docs/RUN_PREVIEW.md`), started with `-e MP_DEV_PREVIEW=1`, so `/memory-protocol/dev/map` and the dev controls work there. It runs whichever `dori-game:test` image it was started from, so it must be recreated to show new work. Remove it with `docker rm -f dori-game-preview`.
- **Live state:** the `dori-game` container runs commit `859055c` (before 00C), but Caddy has no `/memory-protocol` handler, so it can't be reached from outside. Caddy and production routing are untouched.

## Assets and rights

- `public/library/`: all of these are the owner's photos of the Library's own displays and artworks, and **reuse rights are not confirmed** for any of them:
  - three timeline crops (00B);
  - `library-entrance.jpg`;
  - 00C: `travelers-prayer-clue.jpg` (handwriting detail) and `travelers-prayer-panel.jpg` (the whole panel, reveal only);
  - 00C: `broken-time-clue.jpg` (a crop of the crack) and `broken-time-full.jpg` (the whole work, reveal only).
- `public/map/nahlaot-illustrated-candidate.jpg`: the candidate map. It was traced from a Google Maps screenshot, which is a licensing risk; see the audit.
- The source photos:
  - `docs/National_library/`: 54 photos, renamed by content, with three `-dup` copies;
  - `docs/Nahlaot_Map/`: map references, including a 13 MB zip.
- `interior_cafe-busy_identifiable-people.jpeg`, and two other photos with passers-by, must stay reference-only (no bystanders without consent).

## Open items

1. The owner reviews 00B, 00C (both teams) and the map in the browser: copy, pacing, the 390 px layout, the source links. None of the external links has been opened, because the National Library site blocks automated access.
2. Owner approval for the draft wording, team names and HARMONY's lines. For 00C this includes:
   - every HARMONY line, the clue and find texts, the hints and the Traveler's Prayer message;
   - the transcription "…that they may voyage and reach the land of America.", which was read from a low-resolution photo;
   - Team B's accepted-reading word list (`lib/game/discovery.ts`).
3. **00C field gaps:**
   - the New World exhibition's level and route from the timeline wall;
   - whether a QR code stands beside *Broken Time*: the photos only show one on the Library's Bloomberg Connects sign;
   - the direct guide link for the *Broken Time* entry: the app links to the guide's home page, which has not been opened.
4. A label-free, at least 4000 px illustrated map drawn over OpenStreetMap geometry. Then re-place markers by hand and add verified labels as an HTML layer.
5. Field checks: the Hesed VeRahamim position, its public viewing point and a photo; the Picture in Stone wall; the borekas stall position and hours; the three squares that only appear in the Google screenshot; the "Rabbi Yovel" label; walking routes.
6. Next: Mission 00D (Armoza archive, both team tracks plus the evidence dossier), then 00E.
7. Not built yet: persistence or resume (state resets on refresh), connection to the sessions API and game engine, and scoring in the UI.
8. The robotic storage system: no photos yet.
