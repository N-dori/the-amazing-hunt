# 01 Assumptions and questions: The Amazing Shuk

| | |
|---|---|
| **Purpose** | Record the decisions from discovery. State the assumptions the design will rest on, each with a way to check it. Challenge the recommended login flow, as the brief asks. Propose an auth approach without installing anything. List what must be answered before deliverable 2. |
| **Deliverable** | 1 of 12 |
| **Version** | 0.1, draft for review |
| **Date** | 23 Oct 2026 |
| **Author** | `dori-ux-designer` agent |
| **Builds on** | [`00_discovery.md`](00_discovery.md) v0.2, and the user's answers to it (relayed 23 Oct 2026) |
| **Status** | Waiting for approval. Deliverable 2 has not been started. |

## Open questions (summary)

The full list is in [section 7](#7-questions-before-deliverable-2). These four matter most before deliverable 2:

1. **Email recovery:** keep it in v1 at all? I recommend dropping it (CH-01).
2. **Family question:** spoken only, or typed on the teen's own device? This decides whether L-02 survives (CH-04).
3. **Who is in the family:** the youngest and oldest players' ages, and whether anyone has a mobility, vision or hearing need. This shapes the user profiles in deliverable 2.
4. **The guide's device:** phone or tablet? Is the guide always one person per game?

---

## 1. Decisions from discovery

The user answered `00_discovery.md` v0.2 on 23 Oct 2026. These are now fixed inputs. They override the brief where they differ, and they are logged as conflicts in section 4.

### 1.1 Blocking questions (A)

| ID | Decision | Consequence for design |
|---|---|---|
| A1 | The mural's address and year stay `[TO VERIFY]`; this doesn't block. The user will photograph the plaque on site | Every mural reveal that would name an address or year is `TODO(copy)` until the plaque is read. **Update 23 Oct 2026:** [run 07](../../research/results/07_citecreation_market_mural.md) (not yet approved) finds Hanukkah **2001** and CitéCréation (Lyon) from the 2024 Israel Post stamp flyer. "103" is probably the painted IEC fault line, not the house number. The house number is still `[TO VERIFY]` |
| A2 | The game is served at **`/amazing-shuk`**, outside the basic-auth wall. The Memory Protocol stays where it is | Guide functions need their own protection (A-T05). C-07 is closed |
| A3 | **No Google or Apple sign-in in v1.** To join: scan the guide's QR code → the session opens → pick a team → type a first name. An email magic link is **optional, for recovery only**; the email is stored only for that and deleted after the trip. The guide can restore any team or move a player. No provider is installed yet; deliverable 1 proposes one | P-01 becomes "Join", with no sign-in. The proposal is in section 3; I challenge the email recovery in CH-01 |
| A4 | **v1 stores no photos.** The player takes the photo and shows it to the guide on the phone; the guide confirms. The photo stays on the device and is never uploaded. The people rule applies to player photos too | Removes storage and retention, and most of L-04. I challenge one part of this in CH-03 |
| A5 | Mural crops and the altered "what's missing?" image are allowed **in the internal prototype**, labelled Fiction. Public release waits for the artists' permission | Open rights item **R-01** (section 5) |
| A6 | **Picture in Stone becomes "find the plaque"** from details with no person in them: a title line, a date, an ornament, a Ladino word. Face match is dropped | C-22 resolved for this task |
| A7 | **"Rivka's roses" is text-only**, with guide confirmation. The user will supply a new photo of the menu board with no people; until then the menu is text-only | P-11 is text-first, with an image slot reserved |
| A8 | **Painted portraits:** for now, crop only objects and details, never painted faces. The user will revisit after the rights check (Rabbi Aryeh Levin is a public figure and the mural is public art) | Open rights item **R-02** |

### 1.2 Content (B)

| ID | Decision | Consequence |
|---|---|---|
| B1 | Spelling **"Rachmo"**; founded **1954**; **take-away hummus only**; address: corner of **HaArmonim and HaShikma** Sts (user, 23 Oct 2026; source: the page on Rachmo by City of Creation, a French group). Replaces the "5 HaEshkol" lead | C-04 and C-18 closed |
| B2 | Hook: **use the brief's short version**, "Some of what you'll see today is real, some is painted over." | C-21 closed. This line is approved copy |
| B3 | #37/#39 is **Solomon Souza's Rabbi Aryeh Levin mural**, at the corner of Rabbi Aryeh Levin St and Mishkenot Yisrael St. Source: 05a §7.4 | C-03 closed by the user's decision. **`05a_Nachlaot_Research_Enrichment.md` is not on disk yet (checked 23 Oct 2026)**, so the source citation stays `[TO VERIFY]` until it arrives |
| B4/B5 | The user will supply the stalls and the numbers. **Use placeholders** | Placeholder rules are in section 6 |
| B6 | 05a is being added | As B3 |
| B7 | The content README points to the master index | Done by the coordinator |

### 1.3 Product (C)

| ID | Decision | Consequence |
|---|---|---|
| C1 | **Session code via QR only**; teams are picked from a list. No separate 4-digit code | The guest-code path in the brief is dropped. I challenge one part of this in CH-02 |
| C2 | **One group plays against a par per task** ("you beat 6 of 8") | The ending (P-14) has two variants: teams and one group |
| C3 | **No GPS.** Arriving means tapping "I'm here"; the guide can override | `lib/game/geo.ts` is **Not for this game**. No location permission is ever asked |
| C4 | **Language is set per phone and can be switched at any time** | Every screen in English and Hebrew; the switch is always reachable |
| C5 | **Plan for one phone per team**; extra phones are optional | The design assumes one phone; sync between phones of the same team is a bonus |

### 1.4 Brand, tools and naming (D–F)

| ID | Decision |
|---|---|
| D1 | No Plex Mono |
| D2 | The map is a game surface, not identity. C-12 closed |
| D3 | The **primary lockup** on P-00 |
| E1 | **Python and Pillow** for crops: only from `no-faces/`, only with no person in the frame, written only under `design/output/` |
| E2 | Done: photos are out of git, including history. `design/inputs/photos/` is ignored except the CSV |
| F1 | The game uses its own entity names |

### 1.5 Rules that stay in force

- **The people rule** (as before): a photo with an identifiable person is referred to by index number only and is never cropped, copied, embedded, linked or described. It now applies to **player photos** too, by A4.
- **Restraint:** points hidden until the end; no badges, confetti, streaks, social sharing or chatbot; Skip on every bonus.
- **Copy:** no invented visitor copy. Every gap is `TODO(copy)`.

### 1.6 Brief items these decisions replace

| Brief said | Now |
|---|---|
| Google or Apple sign-in, or an email magic link, to join | QR → team → first name. Email only for optional recovery (A3) |
| A guest option with a 4-digit team code | Dropped (C1) |
| The invite sent by DORI before the day | Not part of the v1 join. Joining happens on the day from the guide's QR. See CH-02 for a light pre-day option |
| Store photos | No photo storage (A4) |
| "Tap a stop's icon when you arrive" | Kept. The tap is the "I'm here" (C3) |

---

## 2. Assumptions

**Confidence:**

- **H**: very likely.
- **M**: plausible.
- **L**: a guess that needs checking soon.

Each assumption says how to check it, and what changes if it's wrong.

### 2.1 Players and family

| ID | Assumption | Conf. | How to check | If wrong |
|---|---|---|---|---|
| A-P01 | A family is 4–8 people across three generations. The youngest player is about 12 and the oldest is under 85 | M | Ask DORI for the next 3 bookings | Under 12: simpler tasks, parental consent questions (L-01). Over 85 or with limited mobility: shorter route, seating |
| A-P02 | Most players are American, read English comfortably, and read little or no Hebrew. A minority, perhaps the guide's family contacts, prefer Hebrew | M | Booking data | Hebrew-first families flip the default language, not the design |
| A-P03 | Teens have their own smartphones; at least one grandparent may not use a smartphone confidently | H | Ask at booking | If no teen has a phone, the team phone is an adult's (affects CH-04) |
| A-P04 | At least one phone per team has working mobile data, through roaming, an eSIM or a local SIM | **L** | Ask at booking; pre-trip checklist | If not, the guide's phone hotspot becomes part of the setup (A-T03) |
| A-P05 | Players will tolerate about 3 minutes of setup on the day (join plus 4 slides) | M | Time it in the paper test | Shorten the slides, or let the guide narrate them instead |
| A-P06 | Players accept not seeing scores until the end | M | Paper test; watch teens | A "you're on track" signal without numbers (still no leaderboard) |

### 2.2 Place and timing

| ID | Assumption | Conf. | How to check | If wrong |
|---|---|---|---|---|
| A-L01 | The game runs on a **weekday, in daylight**, not Friday afternoon or Shabbat, and not at night (the ideas file rules out night tasks) | H | DORI scheduling | Friday: stalls close early and crowds peak, so the menu and route change |
| A-L02 | 90 minutes covers the opener, about 4–6 tasks in Ohel Moshe, Mazkeret Moshe and Batei Goral, 2–4 tastings, and the ending | M | Walking times not measured. **Paper and field test** | Fewer tasks; the guide marks tasks optional |
| A-L03 | Signal is weak or absent in some courtyards and lanes, and usually present on Agrippas St and in the market | M | Field-test a phone on the route | Bigger offline cache and more guide override |
| A-L04 | Direct sun on screens for most of the route | H | — | — |
| A-L05 | The stops are publicly visible from the street, with no entry into courtyards or synagogues | H for the mural, signs and plaques; M for the cistern | Run 06 checklist; the user's site visit | Swap the stop or make it text-only |

### 2.3 Guide

| ID | Assumption | Conf. | How to check | If wrong |
|---|---|---|---|---|
| A-G01 | **One guide per game**, walking with the family, using a **phone** for the guide app | M | Ask (question Q4) | A tablet or a second guide changes the G-screen layouts |
| A-G02 | The guide can glance at a team's phone to confirm a find within about 30 seconds of the team asking | M | Paper test with 3 teams | Confirmations queue up (CH-03) |
| A-G03 | The guide pays vendors on the spot and records each spend in the app within a minute | M | Field test | A "record later" queue on G-04 |
| A-G04 | The guide is comfortable overriding scores and tokens, and knows overrides are logged | H | — | — |

### 2.4 Technology

| ID | Assumption | Conf. | How to check | If wrong |
|---|---|---|---|---|
| A-T01 | Players open the QR code with the phone's **native camera**, which opens the default browser (Safari or Chrome), **not** an in-app webview | H for iOS and Android cameras | Test on 4 phones | Show the session code under the QR as a typed fallback (CH-02) |
| A-T02 | The game is a normal web page. No install to the Home Screen is required; installing is optional | H | — | If installed on iPhone, a Home Screen app keeps its storage apart from Safari: the join must happen in the same place the game is played. Simplest: don't ask anyone to install |
| A-T03 | When there's no signal, the team phone keeps playing from a local cache and syncs later. The guide's phone can be a hotspot of last resort | M | Offline field test | — |
| A-T04 | The server is the existing Next app pattern on the same host, with its own path `/amazing-shuk` and its own SQLite data | M | Developer decision (deliverable 12) | One Next app can only have one `basePath`, so serving both games from one app means a second build or a routing change. This is a build question, not a design question |
| A-T05 | Without basic auth in front, guide actions are protected by the guide token (as today), and **creating a session needs a guide key** (`GUIDE_CREATE_KEY` or similar) | H | — | Anyone could create sessions on a public path |
| A-T06 | A team phone can keep its own photos in browser storage for the length of the game, enough for the guide to see them | M | Test on iOS Safari (storage can be evicted) | The guide confirms from the camera roll, or without a photo (the find counts on sight) |

### 2.5 Content

| ID | Assumption | Conf. | Note |
|---|---|---|---|
| A-C01 | The user supplies all stall data, prices and token numbers before the field test | H (decided) | Placeholders until then (section 6) |
| A-C02 | Each task has one evidence label, set from the ideas file's tag (DOC or FIELD → Historical fact; ORAL or FOLK → Attributed tradition) unless the user rules otherwise | H | Fiction only for game devices (the altered mural) |
| A-C03 | Everything that depends on 05a is `[TO VERIFY]` until the file is on disk | H | Affects: the Aryeh Levin mural source, the Thursday/Friday shopping peak ("05a §5.8"), the Batei Goral details (05a §7.3), the tie-rod route (05a §7.4) |

---

## 3. Login, challenged and simplified

The brief asked me to challenge the recommended flow. The user's A3 and C1 already simplify it a lot. This section checks the simplified version, proposes how to build it with **no new auth provider**, and raises what still needs a decision.

### 3.1 What "login" has to achieve (from the brief)

| Need | Met by v1 (A3, C1) |
|---|---|
| Keep each team's progress, points and tokens through drops in signal and phone switches | Team state lives on the server, with a local queue on the phone. A new phone rejoins by scanning the QR and **choosing its existing name** in the team |
| Know who is on which team | The team roster: first names per team |
| Store photos | **No longer needed** (A4) |
| Keep the family-question answers private | Only partly met. See CH-04 |

### 3.2 The proposed join, step by step

Screen IDs follow the brief. Copy is `TODO(copy)`.

1. **G-01 (guide):** before the walk, the guide creates the game (family name, date, 1–3 teams) and gets a **QR code** for the session.
2. **P-00 → P-01 (player):** the player scans the QR with the phone camera. The game opens straight on its title, with the session already filled in. There is nothing to type.
3. **P-02:** pick a team from a list (or the single group).
4. **P-02:** type a first name, or tap your name if the guide has entered the family already (optional, see Q6).
5. The phone gets a **device token**. It is random, stored on the phone, and kept on the server only as a hash, the same pattern as today's guide token. That token *is* the login.
6. **Rejoin:** scan the QR again → the team list shows names → tap your name. The new phone takes over that player. Nothing to remember.
7. **The guide restores (G-05):** the guide can move a player, re-issue a team's QR, or reset a phone.

This needs **no Google, Apple or email provider and no password**, and nothing new installed. The session code is already in the repo (`lib/game/store.ts`); the device token is a small extension of the guide-token pattern.

### 3.3 Challenges

| ID | Challenge | Why | Recommendation |
|---|---|---|---|
| **CH-01** | **Drop email recovery from v1.** | (1) Every recovery case is already covered: the QR rejoin covers a new phone; the guide covers a lost QR; another team phone covers a dead battery. (2) Email brings a mail service (a new data processor), an inbox switch on weak signal, the in-app-browser problem, and the deletion promise (L-03). (3) Recovery only matters during a 90-minute walk with the guide standing there | **Remove it from v1.** If kept, make it guide-side: the guide enters one family email at setup for post-trip contact. It is not a player login |
| **CH-02** | **QR-only join needs a typed fallback.** | Sun glare on the guide's screen, a phone with a broken camera, or a grandparent who can't aim a phone camera reliably | Keep **QR as the main path** (C1 stands). Show the existing 6-character session code in small print under the QR as a fallback. It is the **session code, not a team code**, so no separate 4-digit code is introduced. **Please confirm this doesn't contradict C1** |
| **CH-03** | **Photos confirmed only in person turn the guide into a bottleneck** when 2–3 teams race in different lanes. | A4 means the guide must see each phone. In a Race, two teams may finish a find at the same moment, apart from each other | Allow **"pending confirmation"**: the team marks the find done and keeps playing. The photo stays on its phone, and the guide confirms at the next meeting point. Points count only after confirmation. This doesn't store or upload anything |
| **CH-04** | **The family question's privacy depends on whose phone is used.** | With one phone per team (C5), a teen may be typing on a parent's phone. "Not shown to parents by default" can't hold on a shared device | Make the family question **spoken, not typed** in v1: the phone shows only the prompt. Optionally, a teen who has their own phone can type a private note **on their own device**, never uploaded. Nothing is stored on the server. **Needs your answer (Q2)** |
| **CH-05** | **A public path needs gentle anti-abuse.** | `/amazing-shuk` is outside basic auth (A2) | Guide key to create sessions; sessions expire after the trip day; the code alphabet and rate limits already exist. No design impact beyond an "expired game" state on P-01 |
| **CH-06** | **The pre-day invite has gone.** | The brief had DORI send the invite before the day, but QR-on-the-day replaces it | Optional: DORI's pre-trip message can include a **"what to expect" link** with no join, so phones and data plans get checked before the day. **Q5** |

### 3.4 Auth proposal (nothing installed)

| Option | What | For | Against | Verdict |
|---|---|---|---|---|
| **1. No provider; own tokens (recommended)** | Session code (existing), a per-device token hashed in SQLite, guide token (existing). No email in v1 (CH-01) | No new dependency or data processor; matches existing code; works offline after the first load | We own the security review of a small token scheme | **Recommend** |
| 2. Option 1 + email magic link via a transactional mail API | As 1, plus one email per family for recovery | Covers the "all phones lost" case | A mail vendor is a new processor (L-03); weak-signal inbox switch; deletion duty | Only if CH-01 is rejected. Pick the vendor with the developer; **needs approval before any install or sign-up** |
| 3. An auth library (e.g. Auth.js or Better Auth) with email magic link | A full library | Standard sessions | A heavy dependency for a 90-minute game; still needs a mail vendor | Not recommended for v1 |
| 4. Supabase Auth | Managed auth | Already used by the other DORI repo | Out of scope by brief; a new processor | Not for this game |

---

## 4. Conflict log update

New and changed entries since `00_discovery.md`. Closed items stay closed.

| ID | Status | Note |
|---|---|---|
| C-01, C-02 | **Open, non-blocking** (A1) | Read the plaque on site |
| C-03 | **Closed by decision** (B3) | Source 05a pending (A-C03) |
| C-04 | **Closed** (B1): 1954 | |
| C-07 | **Closed** (A2): `/amazing-shuk`, outside basic auth | |
| C-12 | **Closed** (D2) | |
| C-15 | **Closed** (D1): no mono | |
| C-18 | **Closed** (B1): "Rachmo"; corner of HaArmonim and HaShikma Sts (source: City of Creation, French group) | |
| C-21 | **Closed** (B2): the brief's short hook | |
| C-22 | **Closed** (A6, A7) | |
| C-23 *(new)* | **The brief vs A3/C1:** Google/Apple sign-in, the guest 4-digit code and the pre-day invite are dropped | **The user's decision wins**; logged in section 1.6 |
| C-24 *(new)* | **The brief's "store photos" vs A4: no photo storage** | **The user's decision wins** |
| C-25 *(new)* | **The ideas file's "find the detail… photograph it; the guide confirms"** vs the guide's capacity with parallel teams | Proposed fix: CH-03 |
| C-26 *(new)* | **The brief's "the family-question answers private"** vs one shared phone per team (C5) | Proposed fix: CH-04 |

---

## 5. Open rights items

| ID | Item | Prototype | Public release |
|---|---|---|---|
| R-01 | Mural crops (#103–#105) and the altered "what's missing?" image | Allowed, labelled Fiction where altered (A5) | Waits for the artists' permission |
| R-02 | Painted portraits: #37/#39 (Aryeh Levin mural), #15, #43, painted faces in the mural | Objects and details only, no faces (A8) | The user revisits after the rights check |
| R-03 | Archival images #108–#116 and the photos inside plaques | Not used (people rule) | Licence from Yad Izhak Ben-Zvi or the family, plus a credit line |
| R-04 | The illustrated map (#117 and the docs map) | Style reference only | A new, rights-clean drawing (deliverable 8) |
| R-05 | "The Amazing Shuk" name | Working name | Trademark check |

## 6. Placeholders (B4/B5)

Until the user supplies the real values, every one of these appears in mockups and specs as a **visible placeholder**, never as a plausible number:

| Data | Placeholder form | Shown as |
|---|---|---|
| Stall name, dish, one-line story | `TODO(data): stall 1 name` … | A grey "Draft" tag (`StatusTag`) |
| Opening hours | `[TO VERIFY] hours` | — |
| Token price per dish | `[PRICE]` | — |
| Points and tokens per task, hint cost | `[PTS]`, `[TOK]`, `[HINT]` | — |
| Par per task (one-group mode, C2) | `[PAR]` | — |
| Per-team shekel cap (guide only) | `[CAP ₪]` | — |
| Walking times | `[MIN]` | — |

The only real menu data is Rachmo's board, as translated in the ideas file. Even that is "confirm with the restaurant" and take-away hummus only (B1).

---

## 7. Questions before deliverable 2

Deliverable 2 is users and jobs: teen, adult, grandparent, guide.

1. **CH-01:** drop email recovery from v1? (Recommended: yes.)
2. **CH-04:** should the family question be spoken only, or may a teen type a private note on their own phone, kept only on that device?
3. **Family make-up:** youngest and oldest ages to design for, and any known mobility, vision or hearing needs (A-P01).
4. **The guide's device:** a phone or a tablet? Always one guide per game (A-G01)?
5. **CH-06:** may DORI send a "what to expect" link before the day? It wouldn't join anyone; it would only check phones and data.
6. **Names at setup:** should the guide be able to enter the family's first names at setup, so players tap their name instead of typing it?
7. **CH-02:** may I show the session code under the QR as a typed fallback?
8. **CH-03:** may a find wait for guide confirmation while the team plays on, with points counting only once confirmed?

Not blocking, but needed before deliverable 7: the new photo of the menu board with no people (A7), and the mural plaque photo (A1).

---

## 8. Stop-point summary

- **Decisions recorded:** the A–F answers are logged, and C-03, C-04, C-07, C-12, C-15, C-21 and C-22 are closed. 05a isn't on disk yet, so its citations stay `[TO VERIFY]`.
- **Login:** QR → team → first name with a device token. No provider needed; option 1 recommended.
- **Challenges:** drop email recovery (CH-01); keep the session code under the QR as a typed fallback (CH-02); "pending confirmation" so the guide doesn't become a bottleneck (CH-03); a spoken-only family question (CH-04).
- **Assumptions to check soonest:** players' mobile data (A-P04), whether the guide can keep up with confirmations (A-G02), and the 90-minute timing (A-L02).
- **Waiting for answers to section 7**; deliverable 2 has not been started.
