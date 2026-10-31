# Team avatar set: owner-reviewable catalogue (I7a)

**Purpose:** turn the 8 written concepts in `design/output/team-identity-avatars-2026-10-31.md` (v0.1, section 3) into a set the owner can approve: a stable `avatarId` per avatar, a motif tied to Nahlaot or Mahane Yehuda, an art brief, the small-size and colour-blind rules, and the assignment rule that keeps teams in one adventure apart.
**Version:** 0.2 (builds on v0.1; that file is unchanged and still holds the placement, header and accessibility design) · **Date:** 31 Oct 2026 · **Author:** dori-ux-designer
**Status:** draft for the owner. No artwork, code or data. Applies from I7a. Today's single-team game shows nothing.
**Sources read:** v0.1 (above); `multiplayer-plan.md` "I7a team names" → "Team avatars" (stored `avatarId`, assigned from the team ID, IDs never reused); top of `agent-handoff.md` ("Team names" bullet); `docs/design/dori-brand-to-ui.md`; `app/globals.scss` tokens; `.claude/rules/scss.md` (icons vs illustrations); `design/inputs/content/photo_index_ALL.csv` (descriptions only, rows cited by number); `06_nahlaot_market_sites_verification.md` (row 14, tahini mill); the mission data in `lib/amazing-shuk/` (to keep avatars clear of answers).

## Decisions the owner must make

1. **Approve the 8 subjects** in section 2, or swap in a reserve. The weakest place ties are **A6 Tea Glass** and **A8 Pan Scale** (no field photo of the object itself).
2. **Tile ground: Ink (recommended) or Chalk.** Still open from v0.1. The contrast figures below assume Ink.
3. **Who draws the 8 SVGs, and the licence.** Original work, never AI-generated (plan: no generated artwork). The illustrator needs only this file and the tokens.
4. **Starting point of assignment:** from the team ID only (team A gets the same avatar in every adventure) or from the adventure ID plus the team ID (recommended: it varies per trip, still never clashes within one).
5. **One-team adventures:** show the team identity or not (open from v0.1 and the plan).
6. **Field photos still needed** for A6 and A8 if the owner wants every subject field-backed (listed in section 6).

## 1. What changed since v0.1, and why

| v0.1 | v0.2 | Reason |
|---|---|---|
| Field name `avatarKey` | `avatarId` | The plan (I7a "Team avatars") and the handoff use `avatarId`; the plan wins |
| Generic market subjects (chili, watermelon, crate, coffee pot, trolley) | Subjects tied to things seen in Nahlaot and Mahane Yehuda, each with a photo-index row where one exists | The owner asked for a Nahlaot / Mahane Yehuda tie |
| Chili Pepper | **Carob Pod** | HaHaruv (Carob) Street sign is field-photographed (#14); the pod keeps the diagonal hook silhouette |
| Watermelon, Produce Crate, Coffee Pot, Shopping Trolley | **Nut Scoop, Shop Shutter, Tahini Millstone, Old Mailbox** | Field-photographed in the market or the lanes (#18, #71, #78, #41) |
| (not considered) | **Laundry Line** and **Courtyard Arch** rejected or held back | Laundry on the balcony is an option in the mural's real-or-painted challenge; the Montefiore gate's clue is "a stone arch… a round stone on top". An avatar must never echo a challenge |
| Hash of adventure ID + team ID | Same, made explicit with a catalogue order that alternates silhouette families | Neighbouring teams get the most different shapes |

## 2. The catalogue (8 active, 2 reserve)

**Rules for every subject:**
- An everyday object you can see from the street. No people, faces, vendors, logos, shop names or artworks.
- No religious objects or look-alikes (challah, citron, pomegranate, lamps, hamsa, Star of David), no olive branch (brand ban), no kada or mufleta (unverified route claims), no innuendo.
- **Never an object a challenge asks about**: the well and cistern, the Ohel Moshe gate and its inscription, the mural's details (laundry, bicycle, boxes, phone, tile 103), the Rama Street "18" tiles, the sundial, marzipan.
- The avatar makes no claim about the route, a shop, or history. Its tie to the place is for the design brief only and is never shown to players.

| Order | `avatarId` | Working name | Motif and tie to the place | Evidence | Silhouette family | 24 px silhouette | From 40 px adds | Accent (on Ink) |
|---|---|---|---|---|---|---|---|---|
| 1 | `spice-mound` | Spice Mound | A cone of ground spice on a tray, as on the market's spice trays | Field photo #19 (spice trays, Mahane Yehuda); #18 | Triangle | Solid upward cone on a flat tray line | A scoop mark near the peak, 3 grains at the foot | Sumac fill |
| 2 | `shop-shutter` | Shop Shutter | A plain rolled-down metal shop shutter, as the market looks after closing | Field photo #71 (a closed shutter on Jaffa Road). Draw it **blank**: never the painted shutters (artwork rights) and never the hamsa sign in that photo | Wide rectangle, ribbed | Wide low box with a roll-box top and 4 horizontal ribs | A small handle at the bottom edge, a dark gap under a half-raised edge | Amber roll box |
| 3 | `carob-pod` | Carob Pod | A single carob pod, after HaHaruv (Carob) Street | Field photo #14 (trilingual HaHaruv street sign). The wider "fruit street names" pattern is **[TO VERIFY]** and isn't claimed | Diagonal hook | A long curved pod from upper right to lower left | Bead bumps along the pod, a short stem | Za'atar stem, Amber pod edge |
| 4 | `tahini-millstone` | Tahini Millstone | A stone millstone grinding sesame | Field photo #78 (millstone behind glass); `06_…verification.md` row 14 reports a working stone mill in the market (operating on the day **unknown**) | Disc in a frame | An upright stone wheel standing in a low trough, with an axle bar | Grinding lines on the wheel, a few sesame dots in the trough | Amber trough |
| 5 | `nut-scoop` | Nut Scoop | The metal scoop of the bulk nut and seed bins | Field photo #18 (bulk nut bins). No vendor logo | Horizontal ladle | A deep bowl at one end, a straight handle to the other | Three nuts in the bowl, a rim line | Amber nuts |
| 6 | `tea-glass` | Tea Glass | A small glass of tea with a mint sprig, the offer of tea in a Nahlaot home | Weak tie: an illustrated street-exhibition panel tells a visitor being invited in for tea (#38). The panel is artwork and is **not copied**. No field photo of a glass | Tall, wide at the top | A tall glass, wider at the rim, with a leafy tuft above | Tea level line, two leaves | Amber tea, Za'atar leaves |
| 7 | `old-mailbox` | Old Mailbox | A small old wall mailbox, as on a Nahlaot stone parapet | Field photo #41 (rusted vintage mailbox, Nahlaot) | Compact box, sloped top | A squarish box with a slanted lid and a letter slot | A tiny knob, two rivets | Sumac box |
| 8 | `pan-scale` | Pan Scale | A hanging two-pan market scale | No field photo: a generic market object. Owner choice (keep, swap for a reserve, or photograph one) | "T" with cups | A horizontal beam on a short post, a shallow bowl at each end | Chains, a small weight in one pan | Amber pans |
| R1 | `produce-crate` | Produce Crate | A wooden crate heaped with round fruit | No field photo in the index; generic market | Wide low, bumpy top | Low box with three round bumps on top | Slat lines | Amber wood |
| R2 | `courtyard-arch` | Courtyard Arch | A stone arch with a keystone, as over Nahlaot courtyards | Field photos #63, #67. **Held back:** too close to the Montefiore gate's location clue | Tall, round top | A tall round-topped opening | Keystone, stone joints | Za'atar inner ground |
| (none) | (rejected) | Laundry Line | | It's one of the mural challenge's options | | | | |

**Order matters:** the list alternates silhouette families (triangle, wide, diagonal, disc, horizontal, tall, compact, T) so the first-free walk in section 4 tends to give neighbouring teams the most different shapes.

**Hard pairs to check before approval** (greyscale, 24 px):
- `shop-shutter` vs `old-mailbox`: both boxes. Keep the shutter wide and ribbed, the mailbox compact with a slanted lid.
- `tea-glass` vs `tahini-millstone` at 24 px if the trough is drawn tall. Keep the trough low.
- `nut-scoop` vs `pan-scale`: both horizontal. The scoop is one solid bowl at one end; the scale is symmetric with two bowls.
- Redraw the weaker of a pair if it blurs. Don't fix a pair with colour.

## 3. Art brief (for the illustrator)

**Frame and canvas**
- Square artboard, `viewBox="0 0 64 64"`, rounded-square tile with corner radius 14 (about 22% of the side). Team tiles are never circles; personal avatars (DiceBear Thumbs) are round.
- Safe area: keep the drawing inside an 8-unit margin (48 × 48 live area), so it stays clear of the corners at 24 px.
- One SVG per avatar, `public/shuk/team-avatars/{avatarId}.svg`. No text, no letters, no embedded raster, no external references, no gradients, filters, shadows or transparency effects. Static.

**Colour (tokens only, literal values in the SVG, checked by a test against `globals.scss`):**

| Role | Token | Hex |
|---|---|---|
| Tile ground (recommended) | Ink | `#252B2A` |
| Drawing line | Warm Chalk | `#F3EFE6` |
| One accent fill per avatar | Sumac, Amber or Za'atar | `#934A3A`, `#C07A2E`, `#667054` |

Measured contrast on the Ink tile: Chalk line **12.6:1**, Amber **4.2:1**, Za'atar **2.8:1**, Sumac **2.3:1**. So every edge that defines the shape is drawn in **Chalk**; accents sit inside a Chalk outline and are never the only edge. Tile on a Chalk page: 12.6:1, so the tile reads as a solid block in sun.

**Colour-blind distinctness:** Sumac and Za'atar are almost the same lightness (**1.2:1**); for red-green colour-blind players they look alike. So the accent is decoration and identity rests on silhouette. The accents are still spread across the set (Sumac 2, Amber 6 as main or secondary, Za'atar 2 as secondary) so a full-colour line-up looks balanced, never as a code.

**Line and style**
- Stroke in Chalk at **4.5 units** on the 64 grid (scaled from the icon set's 1.75 on 24, so it holds at 24 px, where it renders at about 1.7 px), round caps and joins, as `iconPaths.tsx` does.
- Flat, editorial, drawn with a steady line, not a ruler-perfect one; no sketchy texture (it turns to noise at small sizes). One drawing serves every size.
- 24 px shows only the silhouette. Interior detail (grains, ribs, beads) must be optional: if it disappears, the avatar still reads.
- A drawing fills about 70% of the live area, so the 8 tiles look the same weight in a row.
- Within the brand: restrained, warm, no cute faces, no tourism clichés, nothing decorative beyond the one object. The brand book is silent on illustrated marks; this stays inside the tokens and the icon stroke logic (v0.1, conflict C6).

**Sizes in use** (from v0.1 section 3): 24 px (role chips, guide switcher), 32 px (host rows), 40 px (header button), 64 and 96 px (naming and "You're {name}!"). Deliver the SVG once; test every size.

**Approval tests (owner on a real phone, plus the illustrator's own checks)**
1. All 8 in a row at 24 px, greyscale: every one nameable without colour.
2. The same with a deuteranopia and a protanopia simulation.
3. Blur test: 24 px tiles at arm's length, or squinting; the hard pairs stay apart.
4. Outdoors in direct sun at full and low brightness, on a Chalk page.
5. Forced colours (high contrast mode): the tile gets a `CanvasText` border and the drawing falls back to `CanvasText` (v0.1 section 5).
6. Next to a personal Thumbs avatar in the header: square object vs round face, never confused.

**Fallback:** an unknown, retired or failed `avatarId` shows the same tile with the team's initials in Chalk (or the team letter before naming). Never a broken image, never a circle.

## 4. Assignment: no clashes in one adventure

Follows the plan's technical recommendation (stored, not computed each time):

1. **When a team is created** (I7a, inside `transact`, under the same lock as every other write), the server takes the catalogue's **active** IDs in the order of section 2.
2. It starts at `offset = hash(adventureId + ":" + teamId) mod N` (recommended; or `hash(teamId)`, owner decision 4) and walks forward, wrapping round, to the **first ID no other team in this adventure holds**. It stores it as `teams[id].avatarId`.
3. **Inputs are never the team name** or anything personal. Renaming, reconnecting, restarting and new sessions don't change it.
4. **No clashes:** the adventure cap is 30 players in teams of 5, so at most 6 teams; 8 active IDs always leave each team its own avatar, with 2 to spare. Because every claim runs inside the lock, two teams created at the same moment can't take the same ID. If the active list were ever shorter than the number of teams (it can't be at 8 vs 6), the server would reuse the ID held by the fewest teams and log it, never fail team creation.
5. **Catalogue changes:** IDs are permanent and never reused. Adding an avatar changes no team. Retiring one marks it `retired` (new teams skip it); a team already holding it shows the initials fallback until the next adventure. Reserves (R1, R2) can be activated by adding them to the active list.
6. **Today's team A** has no `avatarId`, and nothing shows until I7a writes one. The field is optional under schema 7, so there is no migration (plan).

Suggested catalogue shape for Codex (data, not copy): `{ id, file, family, retired? }` in `lib/amazing-shuk/`, ordered as section 2, with a test that every ID is unique, every file exists (and has its `!` line in `.dockerignore`, project memory), and every colour in the SVG is one of the five tokens.

## 5. Spoken and visible text

The avatar is decorative wherever the team name is beside it (`alt=""`), which is everywhere planned. Its subject is never announced (v0.1 section 5). The working names above ("Spice Mound" etc.) are internal and never shown. The only related strings are v0.1's `TODO(copy)` drafts (for example "{name}: team status"), still waiting for O16.

## 6. Image needs (for `image-needs.md` when the owner wants them)

- **A6 Tea Glass:** a field photo of tea served in a small glass in Nahlaot or the market, no faces. Only needed if the owner wants every subject field-backed.
- **A8 Pan Scale:** a field photo of a hanging pan scale in use in Mahane Yehuda, if one exists, no faces or vendor names. If none exists, swap A8 for R1 or keep it as a generic market object.
- **A2 Shop Shutter:** a reference photo of a **plain, unpainted** shutter, so the drawing can't drift towards a protected artwork or the hamsa sign in #71.

## 7. Conflicts

| # | Sources | Conflict | Resolution here |
|---|---|---|---|
| C1 | v0.1 (`avatarKey`) vs plan and handoff (`avatarId`) | Field name | `avatarId` (plan wins) |
| C2 | v0.1 subjects vs owner's request for place ties | Generic subjects | Replaced with field-backed motifs where possible; two weak ties flagged |
| C3 | A laundry-line motif vs the mural challenge (`mural-task.ts`, option "The laundry on the balcony") | An avatar would echo a challenge option | Rejected |
| C4 | A courtyard-arch motif vs the Montefiore mission's location clue ("a stone arch… a round stone on top") | Could confuse "is this the place?" | Held as reserve R2; owner may still choose it |
| C5 | Brand book silent on illustrated team marks | No rule to follow | Stay in tokens and icon stroke logic; owner's visual review |
| C6 | v0.1 C1 ("one default team avatar" in `product-decisions.md` and the plan) | Older wording | Resolved: checked 31 Oct 2026, `product-decisions.md` no longer has that line and the plan's "Team avatars" section records the owner's direction. Nothing left to edit |
