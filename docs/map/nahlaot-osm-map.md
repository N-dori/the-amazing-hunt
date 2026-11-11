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
| `media-originals/maps/nahlaot-{small,large}-z{-1.5,0.5}-en.svg`; `…-phone-z{zoom}-en.svg` (every zoom), `…-phone-z{0.5,2.5}-he.svg` | no | The review pictures: the whole map at two zooms, and a phone screen (390 × 844) at 1:1 at each zoom |
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

- **Roads** are grouped by class and by real width in metres (OSM's `width` tag, or the `ROAD_WIDTH_M` default for the class). Streets and paths are drawn as bands at that width; main roads are drawn 1.5 times wider (`MAIN_ROAD_SCALE`, owner, 11 Nov 2026, replacing the same day's "never widened"). The data keeps both: `widthM` (real) and `drawM` (drawn). The classes, each split into inside the frame and the margin:
  - `main`: OSM's primary, secondary and tertiary roads, plus any street listed in `EXTRA_MAIN_STREETS`;
  - `street`: residential and service roads;
  - `path`: footpaths, pedestrian lanes and steps.
- **Buildings:** footprints, inside the frame and in the margin.
- **Areas:** `green` (parks, gardens and playgrounds), `square`, `market` (Mahane Yehuda and the Georgian market) and `worship`. Most synagogues are mapped in OSM as points, not outlines, so `worship` holds only a few.
- **Places:** every named park, square, market and synagogue outline in OSM gets a label at its centre. A name the owner adds goes into `PLACE_ALT_NAMES` and shows as a second line. The first one: HaBustan HaSefaradi, which the owner also calls Gan ha'toot (11 Nov 2026).
- **Map layers (owner, 11 Nov 2026), drawn as icons** from the game's icon set: synagogues (a Star of David), toilets, drinking water and light-rail stations (a tram). `POI_KINDS` in the script sets each one's OSM tags, how near duplicates merge, and the zoom its icon and name first show at:
  - synagogues are OSM's `place_of_worship` with `religion=jewish` (or no religion). Outlines and points both count, and a point inside its outline merges into it. The outline stays drawn as a worship area, and the synagogue's name now comes from this layer instead of a place label;
  - a station is mapped as one stop per direction, merged by name into one icon.
  On 11 Nov the large frame's drawing held 48 synagogues (42 inside the frame; three graves OSM tags as places of worship are left out), 10 toilets, 14 drinking-water points and 3 stations (Mahane Yehuda inside the frame). OSM misses many of Nahlaot's synagogues: see [research 15](../../research/results/shuk-places/15_nahlaot_synagogues.md).
- **Neighbourhoods and courtyards:**
  - OSM's neighbourhood names (tagged points): Nahlaot, Sha'arei Hesed, Zikhron Moshe, Sha'arei Yerushalayim, Rehavia;
  - the courtyards the owner placed (`COURTYARDS`, 11 Nov 2026): Knesset Yisrael A and B, Batei Broida and Batei Rand. The Hebrew for Batei Rand is a draft. Knesset Yisrael C and Batei Munkatch are pending until they have a position.

## Labels (owner's rules, 11 Nov 2026)

| | Main roads | Main roads, zoomed out (`mainBrief`) | Alleys and other streets | Places | Neighbourhoods / courtyards |
|---|---|---|---|---|---|
| Text | both languages side by side on one line: `English · עברית` in the English game, `עברית · English` in the Hebrew game | the game's language only | the game's language only | both side by side; the owner's added name in the game's language on a second line | both side by side |
| Size | 11 px | 11 px | 9.5 px | 10 px italic | 12 / 10 px, letter-spaced |
| Width | inside the road once its drawn width on screen is at least 11 px (the font size; the halo may spill a pixel or two past the edges) | inside the road where it is 11 px wide, otherwise beside it, 2 px clear of its edge | may overflow the road | — | — |
| Length | a straight stretch (bending under 20°) at least 1.1 × the text width | the same | at least 0.6 × the text width | — | — |
| Shown | from the zoom where the road is wide enough | placed afresh at each zoom and shown at that zoom only (`minZoom` = `maxZoom`), on stretches the full label doesn't use | as room allows | as room allows | neighbourhoods from the overview to the middle zoom; courtyards from the middle zoom to street level |

The zoomed-out labels, the slight overflow and the wider main roads are the owner's choice of 11 Nov 2026 (after the first zoom previews), so main roads are named at every zoom.

**Map-layer icons** are 18 px discs, placed like the point labels: from their kind's first zoom, wherever they don't overlap. An icon also keeps clear of a place's name that is still waiting for room, except at street level, so every icon shows by then. The names of synagogues (from zoom 1.5) and stations (from 0) are 10 px and are placed afresh at each zoom: below the icon, else to its right, its left or above it.

**Street level reads larger** (owner, 11 Nov 2026: "for zoom 2.5 the font can be a bit larger, 13 or 14 px"; zooms 0 to 2 "very good"). At zoom 2.5 every text size is multiplied by 13/11, so main roads are 13 px; icons keep their size. Street level has a layout of its own (`STREET_LEVEL`), so the labels up to zoom 2 stop there (`maxZoom` 2). The label files carry `meta.streetLevel`. With this second set the large frame's files are about 200 KB raw and 30 KB gzipped, and the size cap is 256 KB.

**No overlaps.** Each label is a rotated box (text plus a 2 px margin). Placement runs from the farthest zoom to the nearest. Text keeps its pixel size while the map zooms, so a label placed at one zoom never overlaps anything at a closer zoom. Each label therefore carries `minZoom`, the zoom it first appears at, and the game shows the labels whose range contains its zoom.

The order of placement:
1. neighbourhoods and courtyards;
2. places, then the station icons;
3. synagogue, toilet and drinking-water icons;
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
