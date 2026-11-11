# Nahlaot navigation map from OpenStreetMap

This is the Type B map in [the map-types spec](../design/map-types-spec.md): accurate street geometry from OpenStreetMap, every alley, and names that are checked on site. It replaces the illustrated prototype described in [the audit](nahlaot-map-audit.md). Started 11 Nov 2026. Steps 1–2 produce the data only; the game doesn't draw it yet (step 3).

## Two frames (the owner's decision, 11 Nov 2026)

The frames are a game decision, not a historical boundary of Nahlaot.

| | North | East | West | South |
|---|---|---|---|---|
| **Small** | Jaffa Road | King George | Ben Zvi | Bezalel |
| **Large** (more room for missions) | Jaffa Road | King George | Ben Zvi | Ramban |

Where two edge streets don't meet, the owner chose how to close the corner:
- **North-west:** HaRav Shmuel Baruch, then Sha'arei Tzedek, up to Jaffa Road. Zalman Shazar meets Jaffa Road only about 745 m to the west, so it isn't used.
- **Small frame, south-east:** Ben Yehuda, from the end of Bezalel to King George.
- **Large frame, south-west:** Ruppin, from the end of Ramban to the southern end of Ben Zvi.

The outline follows the centrelines of these streets. The drawing adds a 60 m margin, where streets and buildings are drawn faded so players never reach a blank edge. The map itself shows no frame line. The game uses the **small** frame (owner, 11 Nov 2026); the large one stays built, to switch to later.

## Files

| File | In git | What it is |
|---|---|---|
| `scripts/map/build-shuk-map.mjs` | yes | The build script, with no dependencies. Its CURATION block at the top is the hand-made half. |
| `scripts/map/label-layout.mjs` | yes | The label layout: measuring text, straight stretches, the overlap test and the placement |
| `scripts/map/plex-widths.json` | yes | The IBM Plex glyph widths that labels are measured with (read once from the fonts, OFL) |
| `media-originals/maps/nahlaot.osm` | no | The OSM download, about 6.5 MB |
| `media-originals/icons/dori-v4/`, `media-originals/icons/osmic/` | no | The originals of the map icons: the owner's set V4 (7 icons and the sheet) and OSMIC's synagogue star (CC0). The code's versions are in `components/icons/iconPaths.tsx`. |
| `media-originals/fonts/*.woff` | no | IBM Plex. Unused since the review previews were retired on 11 Nov 2026 (the dev page `/dev/osm-map` draws the map itself). |
| `data/shuk-map-nahlaot-{small,large}.json` | yes | The map data for the game: layers, buildings by tone, trees, names, places, neighbourhoods, map layers, projection and credit. At most 256 KB each (the large one is about 165 KB, 59 KB gzipped). |
| `data/shuk-map-nahlaot-{small,large}.labels-{en,he}.json` | yes | The labels, one file per frame and game language. At most 256 KB each. |
| `public/map/paper-grain.svg` | yes | The illustrated look's paper grain (generated noise) |
| `docs/map/nahlaot-street-names.md` | yes | The generated list of street and place names for checking on site |
| `lib/map/osm-projection.ts` | yes | GPS ↔ map conversion, used by the game |

## How to rebuild

1. Download the extract once. Use a generic client name and no personal details:
   ```sh
   curl -A "DORI-map-build/0.1" -o media-originals/maps/nahlaot.osm \
     "https://api.openstreetmap.org/api/0.6/map?bbox=35.2060,31.7735,35.2190,31.7890"
   ```
2. Run `npm run map:build`, or `node scripts/map/build-shuk-map.mjs --frame small|large|both`. It runs on the host in a few seconds.
3. Read its report: each frame's edges (with any gaps of up to 25 m bridged inside an edge street), the scale, the layer sizes, and the named streets that are missing a name.

The script stops if a corner is more than 40 m from its streets, if an edge has no path, or if a data file goes over 256 KB.

## Names

The names are OpenStreetMap's, and none has been checked on site yet. The owner checks them against the street signs, never against Google. Corrections go into the script's CURATION block, not into the generated files:
- `NAME_OVERRIDES` takes a corrected Hebrew or English name.
- `CHECKED_ON_SITE` takes a street that has been checked.

Then re-run the script. A wrong name can also be fixed in OSM itself, after walking the street.

## Layers in the data

- **Roads** are grouped by class and by real width in metres (OSM's `width` tag, or the `ROAD_WIDTH_M` default for the class). Streets and paths are drawn as bands at that width; main roads are drawn 1.5 times wider (`MAIN_ROAD_SCALE`, owner, 11 Nov 2026, replacing the same day's "never widened"). The data keeps both: `widthM` (real) and `drawM` (drawn). The classes, each split into inside the frame and the margin:
  - `main`: OSM's primary, secondary and tertiary roads, plus any street listed in `EXTRA_MAIN_STREETS`;
  - `street`: residential and service roads;
  - `path`: footpaths, pedestrian lanes and steps.
- **Buildings:** footprints, inside the frame and in the margin. Inside the frame they're split into `BUILDING_TONES` (5) groups, by a hash of each building's OSM id, so each building keeps its tone between builds.
- **Trees (the illustrated look):** canopies of three circles, **only where OSM has trees** (owner, 11 Nov 2026: "not every courtyard has trees"):
  - at each single tree (`natural=tree`);
  - on a loose grid inside parks, gardens and woods within the frame (`TREE`, `TREE_AREAS`).
  In the margin, only single trees are drawn. On 11 Nov: 21 trees inside the small frame, 108 inside the large one.
- **Areas:** `green` (parks, gardens and playgrounds), `square`, `market` (Mahane Yehuda and the Georgian market) and `worship`. Most synagogues are mapped in OSM as points, not outlines, so `worship` holds only a few.
- **Places:** every named park, square, market and synagogue outline in OSM gets a label at its centre. A name the owner adds goes into `PLACE_ALT_NAMES` and shows below the names: HaBustan HaSefaradi is also Gan HaTut (Mulberry Garden) / גן התות (owner, 11 Nov 2026). A place OSM doesn't have goes into `OWNER_PLACES`, at the owner's position: the Iraqi Market / השוק העיראקי, at 31.785401, 35.212146 (owner, 11 Nov 2026); it shows from zoom 1.
- **Map layers (owner, 11 Nov 2026), drawn as icons:** synagogues, toilets, light-rail stations and benches. Drinking water was dropped the same day. `POI_KINDS` in the script sets each one's OSM tags, how near duplicates merge, and the zoom its icon and name first show at:
  - **synagogues** are OSM's `place_of_worship` with `religion=jewish` (or no religion, but not a grave named "קבר …"):
    - outlines and points both count, and a point inside its outline merges into it;
    - the outline stays drawn as a worship area, and the synagogue's name comes from this layer;
    - the owner's own positions go into `OWNER_SYNAGOGUES`: **Ohel Moshe**, 31.782575, 35.21320. An OSM synagogue within 12 m would win;
  - **toilets:** one icon for all. The men-only and women-only data stays (OSM's tags, and the owner's corrections in `TOILET_SEX_OVERRIDES`: the one nearest Agripas is men only, the one on HaShazif women only), unused for now;
  - **stations:** each is mapped as one stop per direction, merged by name into one icon;
  - **benches:** from zoom 2 only. A bench may give way where street level is full.
  On 11 Nov the large frame's drawing held 49 synagogues (43 inside the frame), 10 toilets, 21 benches and 3 stations (Mahane Yehuda inside the frame). OSM misses many of Nahlaot's synagogues: see [research 15](../../research/results/shuk-places/15_nahlaot_synagogues.md).
- **Neighbourhoods and courtyards:**
  - OSM's neighbourhood names (tagged points): Nahlaot, Sha'arei Hesed, Zikhron Moshe, Sha'arei Yerushalayim, Rehavia;
  - the courtyards the owner placed (`COURTYARDS`, 11 Nov 2026): Knesset Yisrael A and B, Batei Broida, Batei Rand (בתי ראנד, the owner's Hebrew), and Batei Munkatch (it shows from zoom 2). Knesset Yisrael C is pending until it has a position, which must be inside its own neighbourhood.
  - OSM's Hebrew for Sha'arei Yerushalayim, "אבו בסל (שערי ירושלים)", is overridden to שערי ירושלים (`NEIGHBOURHOOD_OVERRIDES`, owner, 11 Nov 2026).

## Labels (owner's rules, 11 Nov 2026)

| | Main roads | Main roads, zoomed out (`mainBrief`) | Alleys and other streets | Places | Neighbourhoods / courtyards |
|---|---|---|---|---|---|
| Text | both languages side by side on one line: `English · עברית` in the English game, `עברית · English` in the Hebrew game | the game's language only | the game's language only | both, stacked: the game's language on top (owner, 11 Nov 2026); the owner's added name in the game's language below them | both side by side |
| Size | 11 px | 11 px | 9.5 px | 10 px italic | 12 / 10 px, letter-spaced |
| Width | inside the road once its drawn width on screen is at least 11 px (the font size; the halo may spill a pixel or two past the edges) | inside the road where it is 11 px wide, otherwise beside it, 2 px clear of its edge | may overflow the road | — | — |
| Length | a straight stretch (bending under 20°) at least 1.1 × the text width | the same | at least 0.6 × the text width | — | — |
| Shown | from the zoom where the road is wide enough | placed afresh at each zoom and shown at that zoom only (`minZoom` = `maxZoom`), on stretches the full label doesn't use | as room allows | as room allows | neighbourhoods from the overview to the middle zoom; courtyards from the middle zoom to street level |

The zoomed-out labels, the slight overflow and the wider main roads are the owner's choice of 11 Nov 2026 (after the first zoom previews), so main roads are named at every zoom.

**Map-layer icons** are bare icons in their own box (18 px; toilets 22 px; the synagogue's arch 22 px), placed like the point labels: from their kind's first zoom, wherever they don't overlap. An icon also keeps clear of a place's name that is still waiting for room, except at street level, so every icon shows by then. The names of synagogues (from zoom 1.5) and stations (from 0) are 10 px and are placed afresh at each zoom: below the icon, else to its right, its left or above it. A synagogue's two names stack, the game's language on top; a station's sit on one line (owner, 11 Nov 2026).

**The icons are the owner's set V4** (11 Nov 2026, drawn by ChatGPT for the owner; originals in `media-originals/icons/dori-v4/`). Their colours come from Jerusalem's Armenian ceramics: new tokens, not yet confirmed against the brand book.
- **Synagogue:** V4's stone arch, the only framed icon, with OSMIC's filled star (CC0) in cobalt. V4's own outline star disappears at map size. Every synagogue looks the same (`LANDMARK_SYNAGOGUES` stays empty).
- **Toilets:** V4's M + F figures, in teal.
- **Tram:** in ink, so cobalt means synagogues only.
- **Bench:** in ceramic green. Our own drawing, a front view with a backrest, because V4's read as a table.
- The set also holds V4's **tree**, **mission flag** and **"show our location"** crosshair, for later.
Each icon has a chalk halo, so it reads over streets.

**The two looks** (the dev page's switch):
- **Plain:** the look the map started with.
- **Illustrated** (owner, 11 Nov 2026, chosen from the illustrated map's techniques):
  - warm building tones;
  - a soft shadow to the south-east;
  - OSM's trees;
  - paper grain and a vignette;
  - a title cartouche ("Nahlaot / נחלאות, Jerusalem / ירושלים");
  - stacked English/Hebrew place names;
  - a warm street casing.
  Not done: tile roofs, ridge lines, landmark tones, and baking the base into per-zoom images (phase 2).

**Street level reads larger** (owner, 11 Nov 2026: "for zoom 2.5 the font can be a bit larger, 13 or 14 px"; zooms 0 to 2 "very good"). At zoom 2.5 every text size is multiplied by 15/11, so main roads are 15 px; icons keep their size. (13 px at first; then "larger font on 2.5 zoom", the same day. In the large frame, two short alleys no longer fit: R. Yaakov Bei Rav and Eliyahu Banai.) Street level has a layout of its own (`STREET_LEVEL`), so the labels up to zoom 2 stop there (`maxZoom` 2). The label files carry `meta.streetLevel`. With this second set the large frame's files are about 200 KB raw and 30 KB gzipped, and the size cap is 256 KB.

**No overlaps.** Each label is a rotated box (text plus a 2 px margin). Placement runs from the farthest zoom to the nearest. Text keeps its pixel size while the map zooms, so a label placed at one zoom never overlaps anything at a closer zoom. Each label therefore carries `minZoom`, the zoom it first appears at, and the game shows the labels whose range contains its zoom.

The order of placement:
1. neighbourhoods and courtyards;
2. places, then the station icons;
3. synagogue, toilet and bench icons;
4. main roads (full labels);
5. main roads' zoomed-out labels;
6. station names, then synagogue names;
7. other streets.

Inside each group, labels in the frame come before the margin, and longer streets before shorter ones. A place or courtyard that isn't placed yet keeps its spot: a street label may not take it. The same street repeats at most every 250 px on screen.

**Zoom** follows Leaflet's `CRS.Simple`: 2^z pixels per map unit. Levels run from −1.5 (the whole frame on a phone) to 2.5 (street level), in 0.5 steps.

**Effects of these rules:**
- Full main-road labels (both languages, inside) appear from about zoom −0.5 (14 m roads) or 0 (10 m roads), at the drawn width. Before that, the zoomed-out label names the road in the game's language, beside it.
- A few names find no room at any zoom. They are listed at the end of `nahlaot-street-names.md` and in each label file's `meta.unplaced`.
- Alleys with no name in the game's language show no label, and are listed in `meta.noNameInLanguage`.

Text is measured with IBM Plex's real glyph widths (`plex-widths.json`). A character missing from the table stops the build rather than being guessed.

Geometry is in artboard units: north up, 1000 units wide, about 1.1 m per unit. Paths use compact relative SVG commands.

## Drawing it (step 3a, 11 Nov 2026)

`components/map/LeafletOsmMap.tsx` draws a frame's data in Leaflet `CRS.Simple`, without rescaling it:
- **Base layer:** one `L.svgOverlay` in map units. The paint order and stroke widths come from `lib/map/osm-svg.ts`. Road bands keep their drawn width in map units; only the casing's 1.2 px hairline and the 1.5 px narrowest band are fixed on screen, recalculated after each zoom.
- **Names:** HTML text in its own pane, at the label file's pixel sizes, redrawn at each label step (`zoomSnap` 0.5, `lib/map/osm-label-view.ts`) and hidden while a zoom animates.
- **Zoom:** from the whole frame (never below −1.5) to 2.5.
- **Credit:** in Leaflet's attribution control, always visible.

The dev page `/memory-protocol/dev/osm-map` (`components/map/IndexOsmMap.tsx`) shows it alone, with the frame and language switches, in `next dev` only.

## Credit

Data © OpenStreetMap contributors, ODbL 1.0 (https://www.openstreetmap.org/copyright). The credit is in every data file's `meta`, and it must be visible wherever the map is shown.
