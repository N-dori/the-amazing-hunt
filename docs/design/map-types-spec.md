<!-- Copied from the DORI platform repo (Tour-Tech/TourTechToolBox, docs/design/map-types-spec.md, commit ddf0b38) on 11 Nov 2026,
unchanged apart from two links written out as platform paths and "the owner" for the name. The platform repo holds the original; the game keeps this copy for reference. -->

> **For the game (11 Nov 2026):** the spec's own consequence is that the Amazing Shuk map is **Type B**. Today's illustrated map is a prototype, not in operational use (owner, 11 Nov 2026), so this is the target for when the map moves toward real use, not a current blocker. The audit of today's map is in [docs/map/nahlaot-map-audit.md](../map/nahlaot-map-audit.md); the platform's OSM-generated Old City map, a working example of the method, is summarised in the [handoff](../project/agent-handoff.md) entry of 11 Nov 2026.

# DORI Maps: Two Types (spec)

2026-11-10 · Decision by the owner · Applies to every map in the DORI platform and the game repo

## The first question for any new map

> **Is this map for the challenges game, or for illustration and explanation?**

The answer decides the type. A map is never both. If a screen needs both, it shows two maps, or the explanation goes on top of the navigation map as a layer.

## Type A — Illustration map (explains)

**Purpose:** help people understand an idea: where the quarters lie, where the 1949 line ran, what Constantine's church covered, where the Cardo went. It's read for a few seconds at a stop, with the guide present.

| Aspect | Rule |
|---|---|
| Accuracy | **Schematic.** Right relationships (this is north of that, the line runs outside the wall), not right distances |
| Source | A **reference picture**: a historical map, an archaeological plan, an old photo. The owner supplies it or it's found online. It's redrawn as a simplified SVG in DORI style. Candidates and rights: `historical-maps-README.md` (platform repo, `docs/sites/JLM_old_city/knowledge/old_city_map/`); quarter-boundary reference: row 24 (Survey of Palestine Old City 1:2,500, NLI) |
| Detail | Only what the story needs. No full street network; a few streets at most, for orientation |
| Labels | Places and ideas, not street names. English + Hebrew (Arabic where the place is named that way) |
| Zoom | Not needed; it fits one phone screen. Optional tap for full screen |
| Uncertainty | Shown on the drawing: soft edges, a wide band, a caption ("approximate", "after [source]") |
| Examples | Old City quarters · the 1949 line at Jaffa Gate · Herod's Temple Mount · the Byzantine Cardo · the Madaba Map's Jerusalem |
| Where it lives | Inside a stop, as a card (diagram / map card) |

**Redrawing from a reference picture: what's allowed**
- **Public-domain references** can be followed closely: the 1936 Survey of Palestine Old City sheet, Wilson's 1864–65 survey, the Madaba Map, Matson photographs.
- **Copyrighted references** (a modern guide map, a published reconstruction such as Ritmeyer's, an orthophoto map) can only be used to learn the facts: where things are, what existed. The drawing must be DORI's own simplification. Don't copy their layout, style, labels or artwork, and don't trace them.
- Credit the reference in SOURCES & METHOD ("After [source], simplified").

### Method: quarter boundaries follow real streets (owner, 10 Nov 2026)

Quarter lines aren't invented shapes. They follow the streets that the reference maps use as dividers:

1. **Read** which street each reference map uses as the line between two quarters. The owner supplies the reference picture, or it's found online; the street names have to be legible.
2. **Find** that street in OpenStreetMap by name. Search `name`, `name:he`, `name:ar` and `name:en`, because transliterations vary (e.g. Bab al-Silsila / Chain Street / Rehov HaShalshelet).
3. **Use the street's centreline** as the boundary. Each quarter is then the area enclosed by the walls and those centrelines.
4. **Record** for each boundary segment the street, its OSM way id(s), and which reference map uses it.
5. **Where references disagree, say so.** Pick one, note the other in SOURCES & METHOD, and keep the soft-hatch drawing and the caption *"Boundaries are approximate and communities overlap."*

**Starting list, to confirm against the reference map:**

| Boundary | Street used by the convention | Status |
|---|---|---|
| North (Christian + Muslim) vs south (Armenian + Jewish) | **David Street → Chain Street (Bab al-Silsila)**, from Jaffa Gate to the Temple Mount / Haram al-Sharif. Wikipedia describes the Christian Quarter's southern edge as "the Jaffa Gate – Western Wall route" | Supported by [WIKI-CQ]; George Williams described this street as one of two quarter dividers in 1849 [ARAMCO] |
| Christian vs Muslim | The street from Damascus Gate south (**Souq Khan al-Zeit**) | **CONTESTED:** some maps use it as the line; most put the whole street in the Muslim Quarter [ARAMCO]. Pick one and say so |
| Armenian vs Jewish | Not established | Read off the reference map |
| Jewish vs Muslim | Not established. Misgav Ladakh meets Bab al-Silsila at a corner where the quarters labelled Jewish and Muslim meet [ARAMCO] | Read off the reference map |

Recorded in `data/places-old-city-quarter-boundaries.json` (to be created), read off row 24 of `historical-maps-phase2.csv` (platform repo, same folder).

**The result is honest, not invented:** the lines are real streets with a stated source, while the drawing stays schematic (soft hatching, a caption).

**Reading street names from a photo** works only if the photo is sharp. The framed orthophoto map photographed on 2026-11-10 is too low-resolution to read street names. Use a straight-on, glare-free close-up of each section, or a high-resolution scan.

Sources: [WIKI-CQ] Wikipedia, *Christian Quarter* (mirror): https://kaweah.freedombox.rocks/kiwix/wikipedia_en_all_maxi_2023-10/Christian_Quarter · [ARAMCO] AramcoWorld, *Quartering Jerusalem* (2022): https://www.aramcoworld.com/articles/2022/quartering-jerusalem

## Type B — Navigation map (the game)

**Purpose:** players find their own way between missions, through small alleys, without a guide. Accuracy is the point.

| Aspect | Rule |
|---|---|
| Accuracy | **Accurate geometry.** Every alley the route uses, in the right place and shape |
| Source | **OpenStreetMap** (ODbL; "OpenStreetMap" credit visible on the map). Gaps are fixed by walking the street and editing OSM, never by tracing Google or copyrighted maps |
| Detail | **The full street network**, including small alleys and market lanes, plus the landmarks players look for |
| Labels | **Street and alley names, accurate and checked on site.** English + Hebrew, spelled as on the street signs. Names appear as players zoom in |
| Zoom | **Required.** Vector or tiled, sharp at street level; pinch-zoom; markers and hit areas stay usable at every zoom |
| Position | Real lat/lng for every mission point, pinned in uMap or geojson.io and confirmed on site |
| GPS | Follows the game's own decisions (optional, never gates play, used for the arrival bonus); in covered alleys it's weak |
| Style | Same DORI look as Type A (hand-drawn lines, palette), but restraint is limited by legibility: no wobble that moves a street off its real line |
| Where it lives | The game's main map (Leaflet), full screen |
| Examples | The Amazing Shuk (Mahane Yehuda + Nahlaot) · any future Old City challenge game |

## Side by side

| | Type A — Illustration | Type B — Navigation |
|---|---|---|
| First question answer | Illustration / explanation | Challenges game |
| Accuracy | Schematic | Accurate |
| Base | Reference picture → redrawn | OpenStreetMap |
| Alleys | No | All of them |
| Street names | No (place names only) | Yes, checked on site |
| Zoom | No | Yes, to street level |
| Read for | Seconds, with the guide | Minutes, walking alone |
| Main risk | Copying a copyrighted reference too closely | A wrong alley or a misspelled name sends a team the wrong way |

## Shared between both
- One DORI style: palette, IBM Plex, hand-drawn lines baked in at build time, no runtime SVG filters.
- Layers as separate `<g>` groups.
- Credits on the map, not behind a tap.

## Consequences for current work
- **The Old City tour map is Type A.** The quarters are schematic and the 1949 line is a wide band. A "My places" pin is approximate; directions go out through "Open in Google Maps", not this map.
- **The Amazing Shuk map is Type B.** The current illustrated image fails Type B on three counts: it blurs when zoomed, it has wrong names and geometry, and it was traced from Google. It needs the OSM redraw, with every alley name on the route checked on site.
- **If an Old City challenge game is built later,** it gets its own Type B map, not the tour's Type A map.
