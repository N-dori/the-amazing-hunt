# 16 Map icons in Armenian-ceramic colours: the owner's ChatGPT result

11 Nov 2026 · the owner ran [prompt 16](../../prompts/16_map_icons_armenian_ceramics.md) in ChatGPT and brought back an approved spec and an icon set (V4). Recorded here by Claude Code. The files are outside git: `media-originals/icons/dori-v4/` (7 icons and the sheet).

## The approved spec, as the owner pasted it

> Approved — DORI Nahlaot Map Icon Design, V1
> - Style: Jerusalem stone-arch frame (Treatment C), inspired by your illustrated Nahlaot map.
> - Synagogues: One identical cobalt-blue Star of David marker for every synagogue, including Ades.
> - Restrooms: One combined male-and-female symbol, with the female figure's legs centred beneath the skirt.
> - Other icons: Light rail, bench/rest stop, tree/shade, mission marker, and GPS location.
> - Removed: Drinking water, market, viewpoint, public artwork, courtyard, separate restroom categories, and landmark-synagogue variant.
> - Total: Seven marker types plus one reusable arched frame.
> The final production check should confirm readability at 14–16 px, following Mapbox's small-icon guidance, and at least 3:1 contrast for meaningful graphic elements.
> Design status: Approved direction. SVG export and testing on the actual illustrated map remain outstanding.

The sheet V4 then put the stone arch on the synagogue only ("filled tree · stone arch for synagogue only · all other map symbols bare").

## The V4 colours (from its SVGs)

| Use | V4 hex | Token (app/globals.scss, not yet confirmed against the brand book) |
|---|---|---|
| Synagogue star | `#24418B` | `--cobalt` |
| Toilets | `#226774` | `--teal` |
| Bench, tree | `#41634B` | `--ceramic-green` |
| Arch line | `#A69070`, about 2.5:1 on the map's ground | `--stone` `#8f7a5b`, darkened to about 3.4:1 |
| Arch ground | `#F7F0DF` | `--stone-ground` |
| Light rail | `#24418B` (the same cobalt) | ink instead, so cobalt means synagogues only |
| Mission flag | `#934A3A` | `--sumac` (already a brand colour) |
| "You are here" | `#252B2A` | `--ink` (already a brand colour) |

**Not delivered:** the palette sources (photos and references) and the per-icon reference list the prompt asked for. The colours are therefore ChatGPT's choice, not checked against sources.

## Checks made when the icons entered the code (Claude Code, 11 Nov 2026)

- **Readability at 14–22 px:**
  - V4's synagogue star is a 2.8-unit outline on a 64 grid, about 0.7 px at 16 px, so it disappears. Replaced by OSMIC's filled star (CC0), the owner's earlier choice, inside V4's arch.
  - The line widths of the tram, flag and crosshair were raised (from 2.6–3.2 to 3.5–4 on the 64 grid).
- **Contrast:**
  - the arch line was darkened to reach 3:1;
  - cobalt, teal, ceramic green, sumac and ink are all well above 3:1 on the map's chalk ground.
- **Meaning:** the light rail moved from cobalt to ink.
- **The bench** read as a table or stool, so we redrew it (our own drawing, a front view with a backrest).
- **Copying:** the V4 shapes are simple geometric drawings made for the owner. No source paths were listed, so their originality wasn't checked against the open sets.
