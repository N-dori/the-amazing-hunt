# 16 Map icons and an Armenian-ceramics palette (prompt for a web-browsing model)

11 Nov 2026 · written by Claude Code for the owner to run in ChatGPT (with web search). The results go to
`research/results/shuk-places/16_map_icons_armenian_ceramics.md` first. They are research, not approved design.

Owner's direction (11 Nov 2026): the map icons should use **Armenian ceramic colours**, and the icon set should be
completed: "add all the SVG icons we'll need, but tell it to merge, never to copy". Then: "treat all synagogue SVGs
the same", so the prompt asked for one synagogue icon, with no landmark variant. Later the same day the owner chose
OSMIC's "jewish" icon (CC0) for synagogues, with no badge around it ("I did not like its suggestions"), so the prompt
no longer asks for one.

**Result:** the owner's run came back the same day as an approved spec and the icon set V4. See
[results 16](../results/shuk-places/16_map_icons_armenian_ceramics.md).

---

## The prompt

```text
You are helping design the map icons for a family walking game in Jerusalem's Nahlaot neighbourhood and the Mahane
Yehuda market. Search the web and look at real sources; cite every source you used.

PART 1 — An Armenian-ceramics palette
Jerusalem's Armenian painted ceramics (the tradition brought to Jerusalem in 1919 from Kütahya; workshops such as
Balian, Karakashian and Sandrouni; the ceramic street-name signs of the Old City) have a recognisable palette.
1. Find 6–8 colours typical of that palette (e.g. the cobalt blue, the turquoise, the green, the yellow-ochre, the
   manganese brown/aubergine, the tomato red, the white ground). For each: a name, a hex value you derive yourself from
   photos you cite (say which photo), and what it is used for in the tradition (outline, ground, accent).
2. Check contrast: each colour as an icon line on our map's ground #eee9df and #f3efe6 (WCAG contrast ratio; we need
   at least 3:1 for a graphic object). Suggest a darker variant where one fails.
3. Say how these colours sit next to our existing brand colours, without replacing them: ink #252b2a, chalk #f3efe6,
   zaatar #667054, sumac #934a3a, amber #c07a2e. Propose which ceramic colour each map layer should take.
4. Describe 2–3 simple border or frame motifs typical of the tiles (e.g. a thin double line, a bead row, a
   scalloped edge), in words and as geometry, simple enough to draw as a 1–2 px frame around a 14–28 px badge.
   Do NOT reproduce any specific artist's pattern or tile design.

PART 2 — The icon set
Draw the icons as SVG. Rules for every icon:
- a 24 × 24 viewBox; strokes only for the icon itself: stroke="currentColor", stroke-width 1.75, round caps and
  joins, no fill; a dot is a zero-length path ("M12 12h.01");
- plus, separately, an optional "tint": one or more filled shapes on the same grid, drawn under the strokes at 30%
  opacity (a duotone fill). The icon must read without the tint;
- readable at 14 px; at most ~6 path elements; no text, no letters, no logos;
- original geometry. MERGE, NEVER COPY: you may study open icon sets for ideas (Phosphor — MIT; Maki and Temaki — CC0;
  Tabler and Lucide — MIT; OSM Carto — CC0), and combine the ideas of several into a new drawing, but never copy or
  lightly edit any set's path data. Do not imitate the Jerusalem Light Rail's (CityPass) logo or signs, or any
  company's brand. For each icon, list the references you looked at (with URLs and licences) and say what you took
  as an idea.

The icons we need:
 1. synagogue: ALREADY CHOSEN, do not draw (OSMIC's filled "jewish" icon, CC0). Only check that the palette colour
    you propose for synagogues reads on it
 2. arched-window frame: the outline of an arched doorway, to frame other icons (Nahlaot's stone doorways)
 3. toilets (men and women)
 4. toilets, men only
 5. toilets, women only
 6. drinking water (a tap or a fountain, not a bottle)
 7. light rail / tram, seen from the front
 8. market (a stall with an awning)
 9. viewpoint
10. public artwork / mural
11. courtyard (a gate into an inner courtyard)
12. bench / rest stop
13. tree / shade
14. mission marker (a numbered pin is drawn separately; this is a simple flag or compass rose)
15. "you are here" (GPS position)

OUTPUT
1. A JSON object, one entry per icon:
   { "name": "starOfDavid", "paths": ["<d>", "<d>"], "circles": [{"cx":..,"cy":..,"r":..}], "tint": ["<d>"],
     "references": [{"url": "...", "licence": "...", "idea": "..."}] }
   (circles use the same stroke rules; omit what you don't use.)
2. One SVG sheet showing all 15 icons in a 4 × 4 grid at 48 px, each with its tint, for a visual check.
3. The palette table from Part 1, with sources.
4. A short list of anything you were unsure about.
```

---

## What happens with the answer

- The answer goes to `research/results/shuk-places/16_map_icons_armenian_ceramics.md`.
- Each icon is checked against our rules: the 24 grid, strokes only, the tint separate. Its references are checked too: no path may be the same as a source set's.
- The icons are then redrawn into `components/icons/iconPaths.tsx` and `iconTints.tsx`.
- Palette colours become tokens in `app/globals.scss` only with the owner's approval. They are marked "not yet confirmed against the brand book", as `scss.md` requires.
