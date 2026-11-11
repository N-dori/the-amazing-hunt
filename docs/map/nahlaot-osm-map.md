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

The outline follows the centrelines of these streets. The drawing adds a 60 m margin, where streets and buildings are drawn faded so players never reach a blank edge. The map itself shows no frame line; the preview's dashed line is only for review.

## Files

| File | In git | What it is |
|---|---|---|
| `scripts/map/build-shuk-map.mjs` | yes | The build script, with no dependencies. Its CURATION block at the top is the hand-made half. |
| `scripts/map/label-layout.mjs` | yes | The label layout: measuring text, straight stretches, the overlap test and the placement |
| `scripts/map/plex-widths.json` | yes | The IBM Plex glyph widths that labels are measured with (read once from the fonts, OFL) |
| `media-originals/maps/nahlaot.osm` | no | The OSM download, about 6.5 MB |
| `media-originals/maps/nahlaot-{small,large}-z{-1.5,0.5,2.5}-en.svg`, `…-z2.5-he.svg` | no | The review pictures, one for each zoom level a phone shows |
| `media-originals/fonts/*.woff` | no | IBM Plex, embedded in the previews if present |
| `data/shuk-map-nahlaot-{small,large}.json` | yes | The map data for the game: layers, names, places, neighbourhoods, projection and credit. At most 150 KB each. |
| `data/shuk-map-nahlaot-{small,large}.labels-{en,he}.json` | yes | The labels, one file per frame and game language. At most 150 KB each. |
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

The script stops if a corner is more than 40 m from its streets, if an edge has no path, or if a data file goes over 150 KB.

## Names

The names are OpenStreetMap's, and none has been checked on site yet. The owner checks them against the street signs, never against Google. Corrections go into the script's CURATION block, not into the generated files:
- `NAME_OVERRIDES` takes a corrected Hebrew or English name.
- `CHECKED_ON_SITE` takes a street that has been checked.

Then re-run the script. A wrong name can also be fixed in OSM itself, after walking the street.

## Layers in the data

- **Roads** are grouped by class and by real width in metres (OSM's `width` tag, or the `ROAD_WIDTH_M` default for the class). They are drawn as bands at that width and never widened (owner, 11 Nov 2026). The classes, each split into inside the frame and the margin:
  - `main`: OSM's primary, secondary and tertiary roads, plus any street listed in `EXTRA_MAIN_STREETS`;
  - `street`: residential and service roads;
  - `path`: footpaths, pedestrian lanes and steps.
- **Buildings:** footprints, inside the frame and in the margin.
- **Areas:** `green` (parks, gardens and playgrounds), `square`, `market` (Mahane Yehuda and the Georgian market) and `worship`. Most synagogues are mapped in OSM as points, not outlines, so `worship` holds only a few.
- **Places:** every named park, square, market and synagogue outline in OSM gets a label at its centre. A name the owner adds goes into `PLACE_ALT_NAMES` and shows as a second line. The first one: HaBustan HaSefaradi, which the owner also calls Gan ha'toot (11 Nov 2026).
- **Neighbourhoods and courtyards:**
  - OSM's neighbourhood names (tagged points): Nahlaot, Sha'arei Hesed, Zikhron Moshe, Sha'arei Yerushalayim, Rehavia;
  - the courtyards the owner placed (`COURTYARDS`, 11 Nov 2026): Knesset Yisrael A and B, Batei Broida and Batei Rand. The Hebrew for Batei Rand is a draft. Knesset Yisrael C and Batei Munkatch are pending until they have a position.

## Labels (owner's rules, 11 Nov 2026)

| | Main roads | Alleys and other streets | Places | Neighbourhoods / courtyards |
|---|---|---|---|---|
| Text | both languages side by side on one line: `English · עברית` in the English game, `עברית · English` in the Hebrew game | the game's language only | both side by side; the owner's added name in the game's language on a second line | both side by side |
| Size | 11 px | 9.5 px | 10 px italic | 12 / 10 px, letter-spaced |
| Width | the text (plus 2 px each side) must fit inside the road's real width on screen | may overflow the road | — | — |
| Length | a straight stretch (bending under 20°) at least 1.1 × the text width | at least 0.6 × the text width | — | — |
| Shown | from the zoom where the road is wide enough | as room allows | as room allows | neighbourhoods from the overview to the middle zoom; courtyards from the middle zoom to street level |

**No overlaps.** Each label is a rotated box (text plus a 2 px margin). Placement runs from the farthest zoom to the nearest. Text keeps its pixel size while the map zooms, so a label placed at one zoom never overlaps anything at a closer zoom. Each label therefore carries `minZoom`, the zoom it first appears at, and the game shows the labels whose range contains its zoom.

The order of placement:
1. neighbourhoods and courtyards;
2. places;
3. main roads;
4. other streets.

Inside each group, labels in the frame come before the margin, and longer streets before shorter ones. A place or courtyard that isn't placed yet keeps its spot: a street label may not take it. The same street repeats at most every 250 px on screen.

**Zoom** follows Leaflet's `CRS.Simple`: 2^z pixels per map unit. Levels run from −1.5 (the whole frame on a phone) to 2.5 (street level), in 0.5 steps.

**Effects of these rules:**
- Main-road names appear only from about zoom 0.5 (14 m roads) or 1 (10 m roads), because real roads are narrow on screen until then. Alley names can appear earlier.
- A few names find no room at any zoom. They are listed at the end of `nahlaot-street-names.md` and in each label file's `meta.unplaced`.
- Alleys with no name in the game's language show no label, and are listed in `meta.noNameInLanguage`.

Text is measured with IBM Plex's real glyph widths (`plex-widths.json`). A character missing from the table stops the build rather than being guessed.

Geometry is in artboard units: north up, 1000 units wide, about 1.1 m per unit. Paths use compact relative SVG commands.

## Credit

Data © OpenStreetMap contributors, ODbL 1.0 (https://www.openstreetmap.org/copyright). The credit is in every data file's `meta`, and it must be visible wherever the map is shown.
