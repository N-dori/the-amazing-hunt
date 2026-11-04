# Run 12: answer-key checks for the mural rework (4 Nov 2026)

**Method:** Claude Code, 4 Nov 2026. Read CitéCréation's Jerusalem page and the Israel Post shop page, downloaded CitéCréation's four photos of the Agripas mural, and compared them by eye with the owner's photos of the wall today (#103 and #104, 24 Oct 2026, in `public/shuk/`, local only).

This is research, not approved content. A comparison of photos is **not a field check**: every difference below must be confirmed by the owner at the wall before it goes into an answer key.

## 1. CitéCréation's photos of this mural

The page is https://citecreation.fr/en/realisation/painted-mural-circuit-jerusalem/ (read 4 Nov 2026). Its gallery has 16 photos of the Jerusalem circuit, none with alt text. Every photo has the same caption: "Contracting owner: East Jerusalem Development Ltd. / Place: Jérusalem / Israël." Four of them are this mural, by their file names ("Agripas – Le Marché"). Base URL: `https://citecreation.fr/wp-content/uploads/2017/08/`.

| Gallery # | File | What it shows | Saved locally as |
|---|---|---|---|
| 5 | `Israël-parcours-de-murs-peints-Agripas-22Le-Marché22-avant-04.jpg` | **Before:** the bare wall in black and white, with a hanging banner, a pole and low sheds | `cc_agripas_le-marche_before_avant-04.jpg` |
| 6 | `…Agripas-22Le-Marché22-chantier-03.jpg` | Work in progress | `cc_agripas_le-marche_work-in-progress_chantier-03.jpg` |
| 7 | `…Agripas-22Le-Marché2237.jpg` | **The whole finished wall**, top to bottom, under a blue sky (512 × 1024) | `cc_agripas_le-marche_full-wall_2237.jpg` |
| 8 | `…Agripas-22Le-Marché2242.jpg` | A close-up of the painted shop, with a real man in a cap pointing at it | `cc_agripas_le-marche_shop-detail_2242.jpg` |

The local copies are in `design/inputs/photos/citecreation-agripas/`, which git ignores. They are for building the answer key only: CitéCréation owns them, so the app links to them and never copies them.

**For the "spot the difference" challenge, use #7.** It is the only one that shows the whole wall. The photo's date isn't given; it is from before the page went up (uploads folder 2017/08).

**The before photo:** CitéCréation's #5 is a different photo from the game's `mural-before.jpg`. They show the same wall from a similar angle, but #5 has a banner and other poles and sheds. The game's photo has no known source, and the owner thinks it may be altered (29 Oct). CitéCréation's #5 is the artists' own, verifiable before photo.

## 2. Then and now: what looks different (to confirm on site)

The comparison is between CitéCréation #7 (with #8 for the shop) and the owner's #103 and #104 (24 Oct 2026).

| Item | CitéCréation #7 | Today (#103, #104) | Reading |
|---|---|---|---|
| A tree in front of the wall | None | A large tree covers the right of the painted market and the ledge | **Changed** |
| Beside the painted shop, on the right | A real drinks fridge on the pavement | Grey utility cabinets with posters, and a mesh fence behind | **Changed** (the fridge is gone) |
| Colours | Bright: a red awning, strong blues | Faded and washed out; patches have come off the lower tiled part | **Changed** (weathering) |
| The "103" tile, top left of the shop | There | There | Same |
| The yellow warning triangle and the plaque below it, left of the shop | There | There | Same: **the plaque already appears in the 2001-era photo** |
| The blue sign with a treble clef, right of the shop | There, large and bright | A small blue sign with a yellow treble clef, top right of the shop | Probably the same; check on site |
| The air vents in the awning (2) and in the shop (in the display case, and one painted as a chair back in the café) | There | There | Same: **the vents were there from the start, and the artists painted around them** |
| The man on the phone, the two boys, the pita and the garlic | There | There | Same |
| The painted carton on the ledge above the awning | There | There (under the tree) | Same |
| The shutters on the painted balconies | Green-teal | Look blue-grey | Unclear (fading or the photo's colour); **don't use** |

**A lasting risk:** the tree grows and the cabinets may be replaced. The changes need re-checking before each season (competitor research C-06: place-based clues decay).

**A consequence for the lion riddle:** in #7, the fish shop's arch and its keystone sit on the right of the upper scene. Today that area is behind the tree. Whether the keystone lion can be seen from the pavement is already a pending field check; the tree makes it more doubtful.

## 3. The Israel Post shop page

Page: https://shop.israelpost.co.il/אומנות-קיר-השוק-ירושלים/ (fetched 4 Nov 2026; quoted as on the page):

- Title: "גיליונית מזכרת -אומנות קיר השוק, ירושלים" (souvenir sheet: Market wall art, Jerusalem)
- Price: "₪20.00"; "זמינות: קיים במלאי" (in stock)
- "• כמות בגיליון: 15 בולים" (quantity on the sheet: 15 stamps)
- The description:
  - "ציור הקיר "שוק מחנה יהודה", שנחנך בשנת 2001 ברחוב אגריפס בירושלים"
  - "קבוצת האמנים הצרפתית CitéCréation"
  - "צוירה בטכניקת "אחיזת עיניים""
  - "דימוי האריה משער האריות"
- Elsewhere on the page: "ברכישה מעל 99 ₪, המשלוח חינם" (free shipping over ₪99): a third number.

**What this means for a question:**
- The page has three numbers a player could take for the answer: ₪20.00 (the price), 15 (stamps on the sheet) and 99 (free shipping). Only ₪20 is the sheet's price. This is the "which number is the price?" reading question (owner, 3 Nov).
- **"15 stamps on the sheet" and "face value 15 NIS" (Stampworld, run 09) don't fit together:** a ₪20 souvenir sheet can't hold 15 stamps worth 15 NIS each. One of the two is wrong or means something else. **Neither 15 goes into an answer key or a reveal as a fact** until Israel Post's own issue page (issue 1171) is read. Not found in this run.
- **The page gives answers away:** CitéCréation, 2001, "אחיזת עיניים" and the lion of the Lions' Gate. In the stop's order, the stamp comes after "Who painted it?" and before the technique question. So either the technique question comes before the stamp, or the stamp page is accepted as a way to the technique. See the rework document.
- The price can change. Check it before each deploy.

## Sources

- CitéCréation, "Painted mural circuit JERUSALEM" (M3 in `docs/knowledge/market-mural-agrippas.md`), its gallery photos #5–8. Read 4 Nov 2026.
- Israel Post shop, "גיליונית מזכרת -אומנות קיר השוק, ירושלים" (M10). Fetched 4 Nov 2026.
- The owner's photos #103 and #104 (24 Oct 2026), `public/shuk/MY_agrippas_mural_*` (local, not in git).
