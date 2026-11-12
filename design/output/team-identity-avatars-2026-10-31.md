# Team identity and avatars: recommendation

**Purpose:** simplify personal and team identity for The Amazing Shuk: one prominent team identity (name + avatar) during cooperative play, personal identity and Sign Out in Profile, and about 8 auto-assigned Shuk-themed team avatars.
**Version:** 0.1 (draft for owner review) · **Date:** 31 Oct 2026 · **Author:** dori-ux-designer
**Scope:** documentation only. No code, no artwork, no data changes. Applies from **I7a**; today's single-team game stays as it is.
**Status of words:** every visible string here is a draft `TODO(copy)` unless marked *approved (O16)*.

Sources read: `product-decisions.md`; `multiplayer-plan.md` (I2, I3, I3b decisions, I7a, I7a team names, I7a design proposal, gates); top of `agent-handoff.md`; `participant-avatar.ts`, `ParticipantAvatar.tsx`, `IndexParticipantMenu.tsx`, `PreviewShukHeader.tsx` (+ module), `IndexGroupSheet.tsx` (+ module), `ListGroupOverview.tsx`, `ListParticipantBadges.tsx`, `ListParticipantIdentity.tsx`, `PreviewAdventureLobby.tsx`; `dori-brand-to-ui.md`, `israeli-mosaic-ux.md`, `.claude/rules/scss.md`; the team name bank (food themes only).

## Open for the owner (short)

1. Approve the auto-assigned set of 8 team avatars (replaces "one default team avatar", see Conflicts C1).
2. Tile ground: **Ink tile** (recommended) or Chalk tile (section 3).
3. Who draws the 8 SVGs (illustrator or owner) and under what licence; the assets are original, never AI-generated.
4. Does a one-team I7a adventure (1–5 players) also get a name and avatar, or does it stay exactly like today?
5. May the host overview (O26: name, leader, count, readiness) also show the team avatar? It adds no personal data.
6. The 8 subjects (section 3), especially Coffee Pot and Shopping Trolley.
7. All `TODO(copy)` strings below.

## 1. Review of today's identity UI

| Surface | What it is today | Works | Competes for attention / gap |
|---|---|---|---|
| Personal avatar (`participant-avatar.ts`) | DiceBear Thumbs, CC0, local, seeded only by participant ID, sumac/za'atar/amber shape on chalk, ink/chalk face; initials fallback; custom image overrides | Stable across devices; no network; brand tokens only; names never enter SVG; a palette test | Three shape colours for many people: recognition rests on face + name, which is fine for people. Round + face is the personal "grammar"; team avatars must not reuse it |
| Header (`PreviewShukHeader`) | Eyebrow "The Amazing Shuk", screen title, group button, profile avatar | One row; map keeps the screen | With teams there is no place for the team's name; the eyebrow repeats the game name on every screen |
| Group button (`IndexGroupSheet`) | 48 px round button, neutral `team` icon, sumac count badge for free roles | Clear purpose; badge has shape + label; forced-colours rule | Neutral icon says "a group", not "*your* team" |
| Profile (`IndexParticipantMenu`) | Personal avatar toggle (40 px image, 48 px hit), panel: Signed in as, role, Sign out | Small, anchored, Escape and outside-tap close, focus returns | Fine. Must stay findable when a second picture sits beside it |
| Group Status sheet | Title "Your group", points/tokens/missions, role chips with 24 px avatars, link to Group tab when a role is free | One glance, no second page | Title is generic; with teams it should name the team |
| Group tab (`ListGroupOverview`) | Progress, role choices, roster with avatars | Complete | Heading "Group" duplicates the sheet; acceptable |
| Lobby (`PreviewAdventureLobby`) | Count stepper, recommendation, waiting state with `team` icon badge | One purpose per screen | The waiting badge is a generic icon; a natural place for the team avatar once teams exist |

Verdict: the personal layer is sound and should not change. What's missing is a single team signal, and it should replace generic elements (eyebrow, group icon, sheet title) rather than add new rows.

## 2. Header group button: three options

| | A. Team avatar | B. Personal avatar | C. Neutral group icon |
|---|---|---|---|
| Meaning when tapped | "My team" → team status sheet: direct mapping | "Me" → opens team status: wrong mapping; duplicates Profile | "Group": correct but anonymous |
| Team identity on every screen | Yes (with name in eyebrow) | No | Only if the name is shown elsewhere |
| Header count | Unchanged (2 buttons) | Would merge Profile into it (1 button) and bury Sign Out | Unchanged |
| Risk | Two pictures side by side → needs a different shape and ground from personal avatars | Sign Out harder to find; personal face dominates a cooperative game | Teams in a multi-team adventure look identical |
| New asset | 8 SVG tiles | None | None |

**Recommendation: A from I7a, C until then.**
- Same button, same sheet, same free-role badge; only the icon is replaced by the team tile. Nothing else in the header grows.
- The eyebrow line ("The Amazing Shuk") shows the team name instead, so name + avatar sit together on every screen.
- **The personal avatar stays where it is: the Profile toggle at the header's inline end**, round, slightly smaller in visual weight (32 px image in the 48 px hit area; today 40 px). Profile keeps "Signed in as", role and Sign out, unchanged.
- Order (DOM and visual, LTR): eyebrow/team name → screen title → team tile button → profile. RTL mirrors through logical properties.

## 3. Team avatar set (8 concepts, written only)

**Shared style (one frame holds the set together):**
- **Frame:** a rounded square tile (corner radius about 22% of the side). Personal avatars are circles; team avatars are never circles.
- **Ground (recommended):** solid Ink tile, drawing in Chalk line (stroke scaled from the icon grid's 1.75/24 so it reads at 24 px), one accent fill per design. Chalk on Ink is 12.6:1, so the silhouette survives glare. Alternative for the owner: a Chalk tile with an Ink 1.5 px border and Ink drawing. It's lighter, but closer to the personal avatars.
- **No faces, eyes or mouths.** That's the Thumbs grammar, and keeping it out of the team set is the main personal/team distinction.
- **Identity rests on silhouette, not colour:** only three accent tokens exist for 8 designs, so the accent fill is decoration. Each subject has a different outline family (triangle, beam, hook, half-disc, tall, wide, bell + handle, wheeled).
- **No text or letters inside the tile**, except the fallback (below). Static: no animation.
- **Content limits:** generic market subjects; no real vendors, stalls or people; no religious objects or look-alikes (citron/etrog, pomegranate as Torah ornament, challah, palm, Star of David); no olive branch (brand ban); no kada or mufleta; no subject with innuendo (no eggplant, no peach). An avatar makes no claim about the route.

| # | Concept (working name) | Subject | 24 px silhouette | 48 px adds | Tokens (on Ink tile) | Why distinct from Thumbs |
|---|---|---|---|---|---|---|
| 1 | Spice Mound | A conical heap of ground spice | Solid upward triangle with a flat base | A scoop line across the peak, a few grains at the base | Sumac fill, Chalk outline | Angular cone, no face, square tile |
| 2 | Pan Scale | A hanging two-pan market scale | Horizontal beam on a short post, two shallow bowls: a "T" with cups | Chain lines, a small weight in one pan | Amber pans, Chalk beam | Line-drawn object; Thumbs are filled blobs |
| 3 | Chili Pepper | One curved hot pepper | Diagonal hook from top-right to bottom-left | Stem cap and one highlight line | Sumac body, Za'atar stem | Asymmetric diagonal; no round body |
| 4 | Watermelon Slice | A half-moon slice | Half-disc, flat edge up | Rind band, 3–5 seed dots (`h.01` style) | Sumac flesh, Za'atar rind, Ink seeds on Chalk inner line | Flat edge and dots, no eyes |
| 5 | Mint Tea Glass | A small tapered glass with a mint sprig | Tall narrow trapezoid with a leafy tuft above | Liquid line, two leaves | Amber tea, Za'atar leaves, Chalk glass | Tall and narrow; Thumbs are wide |
| 6 | Produce Crate | A wooden crate heaped with round fruit | Wide low rectangle with a bumpy top edge | Two slat lines, three fruit circles | Amber wood, Chalk fruit outlines | Rectilinear; reads as a box |
| 7 | Coffee Pot | A long-handled small coffee pot | Bell body with a long horizontal handle to one side | Spout lip, a steam line (static) | Amber body, Chalk handle | Strongly asymmetric "pan" silhouette |
| 8 | Shopping Trolley | A two-wheeled shopping cart with a bag and tall handle | Tall bag on two wheel dots, handle curving up | Bag weave lines, a leek or greens poking out | Za'atar bag, Chalk frame and wheels | Wheels and handle; unmistakably an object |

Hard pairs to test on real phones in sun: 1 vs 4 (both pointed or flat at small sizes: triangle up vs half-disc flat-up) and 5 vs 8 (both tall). Test at 24 px with colour removed (greyscale) before approval.

**Sizes:** 24 px (role chips, guide switcher, host rows on compact screens), 32 px (host rows), 40 px (header button), 64–96 px (naming and confirmation). At 24 px the silhouette only; interior detail starts at 40 px.

**Assets:** illustrations, not icons: SVG files under `public/shuk/team-avatars/` (not `iconPaths.tsx`). Each new public file needs its `!` line in `.dockerignore` or it 404s live (project memory). Colours must be literal token values in the SVG (as `AVATAR_COLORS` does), with a test against `globals.scss`.

**Assignment (no choice step, no name input):**
- On team creation (inside `transact`), the server picks `avatarKey` = the first key not used by another team in this adventure, walking the fixed list of 8 from an offset derived from a hash of the stable adventure ID + team ID. **The team name is never an input.**
- Persist `avatarKey` on the team record. A rename, reconnect, new session or server restart never changes it. Changing the set later never reshuffles existing teams.
- The maximum is 6 teams (30 ÷ 5), so 8 keys always give each team a different avatar, with 2 spare to retire one design.
- **Fallback:** an unknown key or a failed image becomes the same tile with the team's initials in Chalk (e.g. "FF"), or the team letter before naming. Never a broken image, never a circle.
- A suggestion name and an avatar may "disagree" (Falafel Fugitives with a Coffee Pot). That's acceptable: the tile is the team's stall sign, not a picture of its name. The subjects deliberately avoid the bank's headline dishes to keep such clashes mild.

## 4. Where name and avatar appear

Long-name test strings: `Pistachio Plot Armor` (20) and `WWWWWWWWWWWWWWWWWWWW` (20, widest). Names are Latin-only and are always wrapped in `<bdi>` / `dir="auto"` so they render correctly inside Hebrew UI.

| Surface | Today (single team): change? | I7a (several teams) |
|---|---|---|
| **Naming screen** (leader; guide fallback) | None | Team tile 64 px above the approved heading "Name your team" *(approved O16)*, decorative (`alt=""`), with no "change" control. Field, suggestions and "Confirm name" *(approved)* as decided. The tile shows the avatar is already the team's and is not part of naming |
| **Naming confirmation** | None | Tile 96 px, then "You're {name}!" *(approved)* in the display font; the full name always wraps, never truncated; one calm moment, no animation; continue to the lobby. While saving: "Saving your team name…" *(approved)*; the name is never shown as secured early |
| **Joining player's waiting screen** (I3 lobby) | None (keeps `team` icon badge) | The tile replaces the `team` icon badge; heading line "{name}" once confirmed, else the team letter, with "Your leader is naming the team." `TODO(copy)` |
| **Header** | None: eyebrow "The Amazing Shuk", neutral group icon | Eyebrow = team name (one line; ellipsis only if it can't fit at 320 px, and the full name stays in the button's label and the sheet). Group button = 40 px tile + free-role badge. Profile = personal avatar, unchanged |
| **Group Status sheet** | None: title "Your group" | Title row: tile 48 px + team name as the sheet title (wraps to 2 lines). Points, tokens, missions and role chips unchanged. Personal avatars stay round in the chips; the tile appears only once, at the top |
| **Group tab** | None | Heading "Group" becomes the team name with the 32 px tile; roster unchanged |
| **Profile** | None | Unchanged: personal avatar, "Signed in as", "Your role", "Sign out". No team tile (keeps "me" and "my team" apart) |
| **Guide: header and team switcher** | None | The group button shows the *selected* team's tile. The switcher (bottom sheet) has one 48 px row per team: tile 32 px + name (wraps) + a check icon and "Selected" `TODO(copy)` text on the current one; never colour alone |
| **Host overview** (host and guide; O26) | Not built | One row per team: tile 32 px, name (wraps to 2 lines, never truncated), leader, participant count, readiness (word + icon). Unnamed team: tile + "Team B" + "Name not set" `TODO(copy)`. No answers, clues or other teams' personal data |
| **I7b end comparison** (optional) | Not built | Tile 32 px + name per team; same row pattern; no ranking emphasis beyond what I7b approves |

The single-team game today changes **nothing** until I7a ships. Team A gets its `avatarKey` only when I7a's schema writes it.

## 5. Accessibility and discoverability risks

| Risk | Mitigation |
|---|---|
| Alt text: the tile repeats the name and screen readers say it twice | Tile is decorative (`alt=""`) wherever the name is beside it. The group button's label carries the name: "{name}: team status" `TODO(copy)`, plus the role count as today ("…: 1 role needed"). Where a tile stands alone (none planned), use "Team badge for {name}" `TODO(copy)` |
| Avatar subject never announced | Intentional: identity is the name; announcing "Coffee Pot" adds noise. Owner may opt in (Open 6) |
| Contrast on Chalk, glare in sun | Ink tile on Chalk 12.6:1 and Chalk line on Ink 12.6:1. Accent fills are inside Chalk outlines, so edges never rely on Sumac or Za'atar on Ink (low contrast). Amber never as small text |
| Colour-blind distinction | 8 distinct silhouettes; accent colour is decoration only. Approval test in greyscale at 24 px; redraw the hard pairs (1/4, 5/8) if they blur |
| Two pictures in the header: "which one is me?" | Different shape (square vs round), ground (Ink vs Chalk), content (object vs face) and position (Profile always at the inline end). Profile label stays "Profile: {person}" |
| Sign Out hidden behind the team-forward header | Profile toggle unchanged in place and hit size (48 px); focus order reaches it last in the header; the Group tab roster's "You" row could link to Profile `TODO(copy)` "Profile and sign out" (owner choice) |
| Screen-reader order | Header: team name (eyebrow) → screen title (h1) → team status button → Profile button. Sheet: title (team name) → balance → roles → link. Do not put the team name inside the h1 |
| Long names break layout | Eyebrow single line with ellipsis only below fit; full name in label and sheet; all other surfaces wrap (`overflow-wrap: anywhere`), tested with both 20-character strings at 320 px and 200% text |
| Latin name inside Hebrew UI flips punctuation | `<bdi>` / `dir="auto"` around every team name |
| Image fails on weak signal | Tiles are tiny static SVGs cached with the app; initials-in-tile fallback; never a broken-image icon |
| Motion | None on tiles; the confirmation appears without bounce; any sheet motion keeps its `prefers-reduced-motion` override |
| Forced colours / high contrast | Tile gets a `CanvasText` border; drawing falls back to `CanvasText`; badge keeps its existing forced-colours rule |
| Touch targets | Group button and Profile stay 48 px; switcher and host rows 48 px minimum |

## 6. Draft copy (all `TODO(copy)` unless marked)

| Key | English draft | Hebrew draft (for review) |
|---|---|---|
| Group button label | {name}: team status | {name}: מצב הקבוצה |
| …with free role | {name}: team status, 1 role needed | {name}: מצב הקבוצה, חסר תפקיד אחד |
| Standalone tile alt | Team badge for {name} | הסמל של {name} |
| Waiting for name | Your leader is naming the team. | המוביל/ה בוחר/ת שם לקבוצה. |
| Host row, unnamed | Name not set | עדיין אין שם |
| Switcher current | Selected | נבחרה |
| Optional roster link | Profile and sign out | פרופיל ויציאה |

Approved and unchanged (O16): Name your team · Make up a name or pick a Shuk favorite! · Team name · Need inspiration? · Confirm name · You're {name}! · Saving your team name… · Change team name · Ask your guide to change your team name.

## 7. Conflicts

| # | Sources | Conflict | Resolution here |
|---|---|---|---|
| C1 | `product-decisions.md` (Team names: "one default team avatar"); `multiplayer-plan.md` I7a team names ("Avatar: one default team avatar"; "Deferred, not open for I7a: … illustrated or generated avatars, avatar choice") | The owner's direction for this task asks for ~8 original illustrated avatars, auto-assigned | Follows the owner's newer direction; avatar *choice* stays excluded, and nothing is generated. Both documents need an owner-approved edit before build |
| C2 | `.claude/agents/dori-ux-designer.md` ("no teams") vs `product-decisions.md` (multi-team I7a planned) | Agent file is older | Decisions win; today's single-team behaviour unchanged (and O20 still forbids editing the agent file) |
| C3 | Name bank: per-name emoji and avatar cues | Superseded by I7a team names | Not used; bank used for food themes only, and its dishes are avoided as avatar subjects |
| C4 | O26 host overview "name, leader, count and readiness only" | Adds a team avatar | Avatar is non-personal team data; listed as Open 5 |
| C5 | `dori-brand-to-ui.md` ("avoid … decorative symbols") | A set of illustrated tiles could drift decorative | One frame, one stroke, no text, no motion, shown only where it replaces a generic element |
| C6 | Brand book | Silent on illustrated team marks | Kept within tokens and the icon stroke logic; flagged for the owner's visual review |
