# Nahlaot and Mahane Yehuda illustrated map: audit (16 Oct 2026)

Candidate base map: `docs/Nahlaot_Map/Nahlaot and Mahane Yehuda Map.png` (1586 × 992 px, RGB, 3.9 MB). A web copy for the dev preview is `public/map/nahlaot-illustrated-candidate.jpg`.

## Method

- **Reference geography:** OpenStreetMap, fetched from the Overpass API on 16 Oct 2026 for the bounding box 31.7780–31.7885 N, 35.2040–35.2225 E. This covered named streets, squares, places of worship and named landmarks. OSM data is © OpenStreetMap contributors, ODbL.
- **Second reference:** `map_of_nahlaot.png`, a Google Maps screenshot in the same folder. The illustration was clearly traced from it: the extent, aspect ratio and every label position match.
- **Overlays:**
  - `audit-reference-overlay.jpg`: the screenshot's road network, in red, over the illustration.
  - `audit-osm-overlay.jpg`: OSM streets, in blue, georeferenced onto the illustration from three landmarks (Davidka Square, Zion Square and Beit Tavor).
- **What is verified:** names are checked against OSM, and Hebrew labels were read at 2× zoom. Nothing here is field-verified.

**Scale:** about 0.69 m per pixel, so the image spans roughly 1.1 km. That is from the three-point fit; it has not been surveyed.

**How well the fit works:** the three-point fit is **not** accurate enough to place markers automatically. It puts Agripas Street about 85 px (around 60 m) north of where the illustration draws it at the synagogue. The illustration is a freehand redraw, not a uniform projection.

## 1. Issue list

### Wrong or garbled street names (high)

| On the illustration | Reference (OSM) | Problem |
|---|---|---|
| Kovazin St / כובזין | Korazin / כורזין | Wrong in both languages |
| Netaner Paz St / נתנר פז | Nehar Prat / נהר פרת | Wrong in both languages |
| Amorai St / אמוראי | Arnon / ארנון | Wrong street name |
| Rabbi Yovel St / רבי יובל | No such street in OSM here. The screenshot's label is cut off ("Rabbi Yos…"). The nearest OSM candidate is HaRav Yosef Kapach / הרב יוסף קאפח | Unverified, probably wrong |
| Khayel Adam St / רח' חיל אדם | Hayyei Adam / חיי אדם | Wrong in both languages |
| Mesilat Yechaim St / Hebrew is not real text | Mesilat Yesharim / מסילת ישרים | Wrong English; Hebrew is invented text |
| Mordechai Alishai St / Hebrew is not real text | Mordechai Eliash / מרדכי עליאש | Wrong English; Hebrew is invented text |
| Natia Strauss St | Natan Strauss / שטראוס | English misspelled; Hebrew looks right |
| Yishayahn St (no Hebrew) | Yeshayahu / ישעיהו | Misspelled |
| Yetudit St / Hebrew is not real text | Yehudit / יהודית | Misspelled; Hebrew is invented text |
| Shilo St / טילה | Shilo / שילה | Hebrew misspelled |
| Ezra Refa'el St / Hebrew is not real text | Ezra Rephael / עזרא רפאל | Hebrew is invented text |
| Nisim Bacha/St / נניים בכר, plus a stray "פילה" | Nisim Bachar / נסים בכר | Typo in the English, misspelled Hebrew, stray Hebrew text |
| Even Sapir St / אבן ספייר, plus a stray "כיכר" | Even Sapir / אבן ספיר | Hebrew misspelled; the stray "כיכר" ("square") suggests a square that isn't there |
| King George St / מלן ג'ורג' | המלך ג'ורג' | Hebrew misspelled |
| Ki'ah St / כיאח | Kiach / כי"ח | The Hebrew lacks the abbreviation mark (gershayim) |
| HaaRav Kuk St | HaRav Kook / הרב קוק | English spelling |

### Misplaced or duplicated labels (high)

- **"Jaffa St / יפו" next to Tabor House** is on the wrong street. Beit Tavor stands on HaNevi'im (OSM puts the building beside the HaNevi'im way). The illustration labels HaNevi'im as Jaffa. The second "Jaffa St" label, heading to Zion Square, is on the right street.
- **"David Yellin St" appears twice.** The lower label, east of Yehudit, sits on a street south of the real David Yellin, which OSM traces along the top of the image. Probably misplaced; the street's real name is unconfirmed.
- **"Shamai St" appears twice.** OSM records Shammai as a short residential street. Two labels on two different roads can't both be right.
- **Spelling of the market area:** "MAHANE YEHUDA" and "Mahaneh Yehudah Market" use different spellings for the same place.

### Geometry (medium)

- The street network is a freehand redraw. The reference overlay shows alleys inside the market and lanes in western Nahlaot that are simplified, shifted, or connected differently from the real network. Examples: the alleys between the market and Nisim Bachar, the lanes around Tavor Street, and the junctions of the Agripas–Kiach–Mazkeret Moshe block.
- Major roads (Jaffa, Agripas, Bezalel, King George, Strauss, Nisim Bachar) are roughly in the right place and direction. Their exact positions and curvature are not reliable for directions.
- Many small Nahlaot courtyards and footpaths that OSM records are missing, including HaCarmel, Einayim LeMishpat, Shirizli and Ohel Moshe paths. The illustrated buildings are decorative, not real footprints.

### Places and businesses

| Label | Status |
|---|---|
| Valero Square / כיכר ולרו | Verified in OSM ("Valero Square") |
| Davidka Square / כיכר דוידקה | Verified in OSM |
| Zion Square / כיכר ציון | Verified in OSM |
| Tabor House / בית טבור | Verified in OSM ("Beit Tavor"), but next to the mislabelled HaNevi'im |
| Mahane Yehuda Market | Verified in OSM (marketplace) |
| Khakham Sh. Avidani Square; Kehilat Zakho Square; Rabi Yitskhak Khamoz ha-Cohen Square | **Not in OSM.** Copied from the Google screenshot. Plausible municipal square names, unverified |
| Marzipan Bakery and Pastry / מאפיית מרציפן | **A business.** Copied from the screenshot; per the brief, remove it |

### Missing for the game

- **Neighbourhood names inside Nahlaot:** Mazkeret Moshe and Ohel Moshe are where Hesed VeRahamim stands; Zikhron Yosef, Sukkat Shalom and others appear in the line drawing in the same folder. The illustration only says "Nahlaot" and "Mahane Yehuda".
- **The street the synagogue is on:** Mazkeret Moshe Street and the HaCarmel / Einayim LeMishpat footpaths aren't labelled or clearly drawn.
- **Market alleys:** the market's inner alleys (HaShazif, HaAfarsek, HaTut, Etz Haim and others) are needed to direct players to Hakmat HaBorekas MeHaifa, and none are labelled.

## 2. Asset suitability

| Aspect | Assessment |
|---|---|
| Visual character | Strong. Warm paper texture, hand-drawn buildings and courtyards, restrained greens. It fits the DORI palette and the brand's restraint better than the schematic stand-in |
| Licensing | **High risk.** The layout is traced from a Google Maps screenshot, and Google's terms don't allow derivative maps. The final artwork should be drawn from an openly licensed or owned source, for example OSM (with ODbL attribution) or municipal GIS data |
| Labels | Baked into the image, and many are wrong (§1). They can't be removed cleanly without repainting the buildings behind them |
| Resolution | 1586 × 992 is enough for a phone at 1×, and blurs beyond about 1.5× zoom. Pinch-zoom into Nahlaot's alleys needs a master of at least 4000 px wide, ideally tiled |
| File size | 3.9 MB PNG; the JPEG at quality 84 is 0.56 MB. Fine for the prototype |
| Gameplay contamination | No markers are baked in. The Marzipan bakery label is the only business; it must go |

**Recommendation:** keep the illustration's style as the art direction, but don't use this file as the final base map. Ask for a regenerated, **label-free** version (buildings, courtyards, trees, street surfaces only), at 4000 px or more, drawn over OSM geometry. All labels then become a separate, verified HTML layer that can be corrected without redrawing anything. I haven't edited the artwork: covering labels by hand over the building texture would be guesswork, and the brief asks to document rather than guess.

**The clean map should have:**
1. no text at all in the image;
2. street geometry matching OSM for Agripas, Kiach, Mazkeret Moshe, Shomron, Ezra Rephael, Tavor, Nisim Bachar, Bezalel, Jaffa, HaNevi'im, David Yellin and the market alleys;
3. the Mazkeret Moshe and Ohel Moshe courtyards drawn readably, since the synagogue is there;
4. no businesses and no destinations in the art;
5. the same paper texture and palette (chalk ground, za'atar greens, sumac roofs, ink lines).

The verified labels to add as an HTML layer: Nahlaot, Mahane Yehuda Market, Agripas, Jaffa, HaNevi'im, Bezalel, King George, Davidka Square, Valero Square, Zion Square, Mazkeret Moshe, Ohel Moshe.

## 3. Integration (built: dev preview)

- **Map library:** Leaflet 1.9.4 with `CRS.Simple` and an `ImageOverlay`. The image is a static base layer; one image pixel is one map unit, so `[height − y, x]` in Leaflet.
- **Separate layers:** mission markers; a destination card with a photograph slot; locked, active and completed states; and a historical memory layer that appears after a mission is completed.
- **Coordinates are stored apart from any image** (`lib/game/basemaps.ts`). Each place carries:
  - `geo`: real-world lat/lon, with its source (`osm` or `field`) and whether it is field-verified;
  - `placements`: a per-base-map pixel point, with the method (`manual` or `derived`) and whether that placement has been verified.

  Swapping or regenerating the artwork only means re-placing points on the new image; the real-world records don't change.
- **Placement method:** points are placed by hand, relative to the streets around them, and flagged `verified: false`. The three-point fit is kept in the audit only; it is too inaccurate to place points automatically.
- **External navigation:** OpenStreetMap and Google Maps links are built from `geo`, never from image pixels. Links built from an unverified point say so.

## 4. Initial marker records

| Place | Real-world position | On the illustration | Shown on the map |
|---|---|---|---|
| Hesed VeRahamim synagogue | OSM "Hessed Ve-Rahamim" (בית הכנסת חסד ורחמים), 31.78357, 35.21364. Unverified | Provisional (712, 560): first block south of Agripas, west of the Kiach junction | Yes, as a **provisional** marker |
| Picture in Stone (תמונה באבן) | None: wall and image not field-verified | Not placed | No. Listed as pending |
| Hakmat HaBorekas MeHaifa | None: not in OSM; stall position, address and hours unconfirmed | Not placed | No. Listed as pending |
| Future Nahlaot missions | None | Not placed | No. Disabled records |

## 5. Unresolved field-verification items

1. Hesed VeRahamim: confirm the OSM point, the public viewing spot, the entrance side, and a GPS reading with its accuracy; take a destination photo from the public street.
2. Picture in Stone: find the exact wall, the image, whether it is public, and its coordinates. Until then it stays optional and off the map.
3. Hakmat HaBorekas MeHaifa: the stall's position inside the market, its address, hours and the reward arrangement.
4. The three squares that are only in the Google screenshot (Avidani, Kehilat Zakho, Khamoz ha-Cohen): check signage or municipal data before labelling them.
5. Rabbi Yovel / HaRav Yosef Kapach: confirm which street the illustrated label means.
6. The second "David Yellin" and "Shamai" labels: confirm the actual street names on the ground.
7. Walking routes between the stops: check by walking them. The illustration must never be the only source of directions.
8. The licence for the final artwork's source geometry.
