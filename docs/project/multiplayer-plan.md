# The Amazing Shuk: multiplayer plan (adventure, teams, invitations, roles, languages)

**Status, 29 Oct 2026:**
- Approved by the owner as the target design and roadmap.
- **I0 and I1 are done; I1 is deployed (29 Oct 2026, `175548f`). I2 is implemented and verified locally, uncommitted, awaiting the owner's review** (authorised 29 Oct 2026; no deploy or push). Every later increment needs the owner's go-ahead at its boundary.
- **Corrected 29 Oct 2026 (owner): one adventure of many small teams of about 5**, not one or two teams. This file follows the correction; the approved rules are in [product decisions](product-decisions.md).
- Only I1's internal model is live: players still see the single group described in [current state](current-state.md), with no visible multiplayer features yet.
- The approved decisions are summarised in [product decisions](product-decisions.md). This file holds the increments, their checks and the open gates.

Made with `/experience-design`, after reading the repository and the official Claude Code guidance on [skills](https://code.claude.com/docs/en/skills), [memory](https://code.claude.com/docs/en/memory) and [best practices](https://code.claude.com/docs/en/best-practices). Build each increment in a fresh session with this file as the spec.

## 1. Approach

- **An Adventure holds as many Teams as its size needs, each of about 5** (recommended teams `ceil(count / 5)`, split evenly; provisional ceiling 30 participants, so at most 6 teams). A team owns what the single group owns today: roles, mission records, points and food tokens. The current game becomes "an adventure with one team". Adventure size and team size are separate settings.
- **Permissions and roles are separate.**
  - Host, Team Leader and Guide are permissions, enforced by the server.
  - The permanent gameplay roles stay the two that already carry server permissions: **Navigator** (opens a challenge) and **Submitter** (submits). Everyone else is an **Advisor**.
  - Spotting, reading aloud and language work become **mission parts**: cards dealt per mission across whoever is present. They can be swapped and combined, carry no permissions and never block play.
- **Individual sessions always.**
  - The host's and the other team leaders' invitations are single-use.
  - Players use a reusable team join link (QR or ordinary link, fit for a family group chat). The link is **not a credential**: it only lets a device ask to join. The leader approves, and the server then gives that device its own session.
- **Language access is infrastructure; the Language Explorer is an optional part.** Everything essential is complete in English.
- **Bounded competition:**
  - Team points are compared only at the end.
  - Food is pooled for everyone.
  - Rabbi Levin and Chesed VeRachamim are never competitive.
  - All teams share the same content and approved route with the guide; how many teams one guide can lead at once is open (O25).

**Why the well pilot (I5) comes before multiple teams (I7a):** parts don't depend on teams. Multiple teams is the most expensive increment and the one that reverses the earlier one-group decision. Proving inside one team that parts create real participation de-risks it, and the owner asked for the pilot to be validated with real players before parts spread further.

## 2. What exists and what changes

| Area | Today | In this plan |
|---|---|---|
| Roster | Fixed `guide` + `player-1…7` (`lib/amazing-shuk/dev-water-session.ts`) | Dynamic participants with random IDs; `guide` stays |
| Invitations | Single-use, hashed, 24 h, per participant, CLI only (`scripts/shuk-invite.ts` → `issueInvitation`; `redeemInvitation` can replace a session) | Reused for host, guide and leader invitations, with a kind and a team |
| Sessions | Hashed, 7 days, cookie `shuk_session` | Unchanged |
| Storage | One JSON `Database`, schema 5: `roles`, `missions`, `names`, receipts; lock, stale-lock recovery, atomic rename (`participant-store.ts`) | Schema 6 adds `adventure`, `teams`, `participants`, `joinRequests`; same lock and migration pattern |
| Roles | `navigator`, `answerSubmitter` (exclusive, may be one person), others `follower` shown as "Advisor" (`roles.ts`, `participant-identity.ts`, `PreviewRoleChoices.tsx`) | The same pure functions, per team; hand-over, leader assign, vacant-seat fallback |
| Server gates | `start`: navigator, submitter or guide. `submit`: submitter or guide. Guide only: arrival confirm, timing, approve, assign. Anyone: picks and hints (`sessionAction`) | Kept, scoped to the actor's team |
| Scoring | Per mission: hidden timing, shared hints, points, food tokens, arrival and bonus awards, once, with receipts | Moved under each team unchanged |
| Missions | `missions.ts`; `MissionDefinition` in `mission-arrival.ts`; follow-up steps; Hebrew via `lang: "he"` + `.rtl` | Optional `parts` per step; no i18n layer yet |

## 3. Data and permission model

```text
Adventure ── status: lobby | active ── hostId ── intendedCount (1–30) ── format (stored "together" for the I1 app; a team count replaces it in I7a, schema 7)
 ├── Team A ── leaderId (the host at first) ── roles {navigator, submitter} ── missions {progress, timing, hints, awards} ── joinLink
 └── Team B, C, … (I7a; as many as the recommendation) ── same shape
Participant ── id (random) ── teamId ── name? ── language? ── readsHebrew? (opt-in)
Guide ── the fixed "guide" seat, CLI invitation, sees and acts on every team
Parts ── per team, per mission: { partId → participantId[] } (UI only)
```

| Action | Host | Guide | Leader (own team) | Navigator | Submitter | Player | Server-enforced |
|---|---|---|---|---|---|---|---|
| Set the intended count; start the adventure (lobby only) | ✓ | ✓ | – | – | – | – | yes |
| Create the recommended teams; invite each other team's leader (I7a) | ✓ | ✓ | – | – | – | – | yes |
| Let players in, remove, regenerate the join link | ✓ (A) | ✓ (all) | ✓ | – | – | – | yes |
| Transfer leadership | ✓ | ✓ | ✓ | – | – | – | yes |
| Assign or clear roles | – | ✓ (all) | ✓ | – | – | – | yes |
| Claim, step down, hand on own role | ✓ | – | ✓ | ✓ | ✓ | ✓ | yes (exclusive) |
| Start a challenge | as role | ✓ | as role | ✓ | ✓ | vacant-seat fallback | yes |
| Picks, hints, swap parts | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | team scope only |
| Submit | as role | ✓ | as role | – | ✓ | vacant-seat fallback | yes |
| Arrival confirm, timing, approve | – | ✓ | – | – | – | – | yes |
| See every team's overview: name, leader, count, ready (I7a) | ✓ | ✓ | – | – | – | – | yes (view filter) |
| See another team's progress, answers or clues | – | ✓ | – | – | – | – | yes (view filter) |

**Leaders never get guide-only permissions** (owner). Leadership grants membership powers only; gameplay powers come from holding a role. Host, Team Leader and Guide stay distinct: the host leads team A at first, and transferring that leadership never changes who the host is or what the host may do.

## 4. Invitation and onboarding flow

1. The operator issues one host link (CLI), as today.
2. **Host:** "How many are playing?" (1–30). The app recommends the teams, `ceil(count / 5)`, split evenly (11 → 4 + 4 + 3; 30 → six of 5). No format screen, and the host never assigns every player.
   - **Until I7a** the recommendation is advice only: groups of 1–5 start as team A; groups of 6–30 see the recommendation but can't start (enforced by the server), with no one-team stand-in.
3. **One team:** the host is Team A's leader. **Invite players** shows a QR, *Share link* and *Copy* (I3).
4. **Several teams (I7a):** the host accepts the recommendation, which creates the teams, then sends each other team's leader a single-use invitation. Each leader then has their own team's link and QR. The host sees each team's name, leader, count and readiness.
5. **Player:** opens the team link → "Join Team …" → optional first name → **Ask to join** → waits → the leader taps **Let in** → the map.
6. **Roles come in context:** a free role is shown on the Group tab; the vacant-seat fallback sits on the submit bar. An optional "swap roles?" appears on the cheer card. Nothing is chosen at join.
7. **Leader's Group tab:** requests, and members with avatar, name, role and "active now / last seen". Readiness comes from activity, with no extra tap.
8. **Start Adventure** (host or guide). Late arrivals use the same link.

**Edge cases:**
- **Late arrival:** same link, leader approval.
- **Leader loses their phone:** the host or guide transfers leadership; the seat can be re-issued as a single-use invitation.
- **Lost session:** remove or re-invite the seat; progress belongs to the team.
- **Wrong team link:** the leader declines; after approval, only the guide moves a player, and only before that team's first challenge.
- **Count changes:** the format can change until Start.
- **Link shared with outsiders:** decline and regenerate.
- **Incomplete team:** roles are optional, parts merge, and vacant seats have fallbacks.
- **Can't scan:** Share or Copy, or the guide's CLI link.

## 5. Roles

| Role | Kind | Backend | Notes |
|---|---|---|---|
| Host, Team Leader, Guide | Permissions | yes | The host is Team A's leader |
| **Navigator** | Permanent | yes (start) | Can combine with Submitter, as today |
| **Submitter** | Permanent | yes (submit) | New name for "answer-submitter" (approved); the UI still says the old name |
| Advisor | Everyone's default | no | Gets parts |
| Detective / Spotter | Mission part | no | Observation stops only |
| Storyteller / Reader | Mission part, always voluntary | no | The guide or on-screen text covers it |
| Language Explorer | Mission part + opt-in "I can read some Hebrew" flag | no | Language stops only; never required |
| Photographer | **Deferred** | — | No photo capture or storage |

Part names other than Language Explorer are draft copy (gate O16).

**How parts work:**
- A mission may declare parts per step.
- A pure `dealParts(members, parts, missionIndex)` deals them across the team's active members, rotating by mission order. The deal is stored per team per mission, so every phone agrees.
- With fewer people than parts, one person holds several; with more people, parts are shared.
- Anyone can swap or hand on a part. **Show all parts** is always available, so a solo player can finish.
- Parts are UI only: no permissions and no effect on scoring.
- Parts go only where the material already splits (vessels, items, scripts), and not on every mission. See the skill's principle "judge a mechanic across the journey".

## 6. Languages

- English-first: every instruction, safety line, story, hint and reveal is complete in English.
- A per-participant language preference stores English only until the owner approves another language and its translations.
- `lang` and `dir` on every non-English span; transliteration where needed.
- **Hebrew story bodies stay out of production** (24 Oct). Verified inscriptions may be puzzle material.
- **Language Explorer** is the player-facing name. **Help us translate** on every language part never costs a hint penalty.
- Never invent inscriptions or translations.

**Draft language examples** (not approved treatments; field checks first):
- **The Montefiore gate:** the Explorer matches the shapes of **אבני זכרון** ("stones of remembrance", verified in the mission data) on the stone. The Arabic panel stays out until its text is confirmed.
- **Chesed VeRachamim:** the Explorer finds **אשת חיל** ("a woman of valour", verified) on the women's-section door, if the lettering is legible from the street; otherwise the society's name on the heritage sign.

## 7. Draft role-based missions (concepts, not approved treatments)

Each needs its own `/experience-design` treatment and the owner's approval before it's built. Each must still work with roles unassigned.

- **R1, the well (pilot, I5).**
  - Each vessel's controls go on a different phone (3 L, 5 L, the family jar), and everyone sees all the levels. Only talking moves water between phones (the *Spaceteam* principle, without the timer).
  - Small teams hold several vessels; Show all works solo.
  - Several teams: each team solves in parallel, and the guide gives the reveal to all of them together.
- **R2, the market mural.** An unscored prediction ("how many of the 8 are real?"); each Spotter holds 2–3 different items to judge against the wall; the Submitter enters the group's two. Several teams: parallel, and the end reveal compares the predictions, not speed. No mural image (rights unresolved).
- **R3, Rabbi Levin.** Two voluntary reader parts, Meir's background and Moshe's background; if nobody takes them, the guide reads. The question stays a quiet discussion; untimed, no hints. **Never competitive:** all teams gather for one joint reading.

The I0 skill test showed that treatments for three other missions all reached for split clues. So parts beyond the well pilot must earn their place mission by mission.

## 8. Increments

Each increment ends with section 9's checks. No deploy, push or live-data change without the owner's separate approval.

### I0. Stabilise the skill and docs: done (29 Oct 2026)

Doc conflicts fixed, library precedents added, skill tests run (see [handoff](agent-handoff.md)), plus the journey-wide-variety principle.

### I1. Adventure and Team model, one team, identical behaviour: deployed 29 Oct 2026 (`175548f`)

- **Depends on:** I0.
- **Scope:**
  - Schema 6: `adventure { status, format, hostId, intendedCount }`, `teams { A: { leaderId, roles, missions } }`, `participants { [id]: { teamId } }`. (The invitations' optional `kind` and `teamId` moved to I2, where they're first used; adding them needs no migration.)
  - `sessionAction` and `sessionView` resolve participant → team and read and write `db.teams[teamId]`.
- **Migration v5 → v6:** `roles` and `missions` go to team A; the seven seats become its members; status `active`, format `together`, host unset.
- **Files:** `participant-store.ts`, `participant-identity.ts`, `participant-names.ts`, `dev-water-session.ts`, `legacy-store-fixture.ts` and their tests. `roles.ts` keeps its API.
- **Security:** the gates stay identical; a new test checks that a participant can only touch their own team's records.
- **UX:** none.
- **Tests:**
  - Migration of a synthetic v5 fixture (no real names).
  - A rehearsal on a copy of the latest live backup, kept in `.local/` and never committed.
  - All existing tests pass unchanged.
- **Acceptance:** identical behaviour; the rehearsal migrates the copy and every session and mission record survives.
- **Rollback:** the v5 image can't read v6 files. Before any deploy, back up `/data/state.json`; rollback = the previous image plus the restored backup. The store also keeps an automatic copy of the older file's exact bytes (`state.json.pre-schema6-<hash>`, mode 600) before its first schema-6 write, and refuses to write if it can't.
- **Gate:** O17 (no live migration without separate authorisation).

### I2. Host invitation, lobby and Start Adventure

- **Depends on:** I1.
- **Scope:**
  - Invitations gain optional `kind` and `teamId`. `shuk:invite -- host` issues a single-use host invitation; redeeming makes the host Team A's leader and opens the lobby.
  - Intended count 1–30 and the recommended teams (`recommendedTeamCount`, `recommendedTeamSizes`), shown as a recommendation only. The stored `format` stays `"together"`, and no team beyond A is created.
  - **Start Adventure** by the host or guide, for 1–5 participants only; 6–30 can't start until I7a (server-enforced).
  - **Host rights belong to the session** made by redeeming the host invitation, not to the seat: other sessions of the seat get none. A lost phone gets a new host link for the same seat, which moves the rights to the new session.
  - Invitation kinds `host` and `leader` (reserved; a `leader` invitation is refused until I7a).
  - A "new adventure" CLI archives the old state (the 26 Oct reset-with-backup pattern); development and testing only, not shipped in the app image.
- **Files:** `scripts/shuk-invite.ts`, `scripts/shuk-new-adventure.ts`, `participant-store.ts`, `group-action.ts`, `parse-water-action.ts`, new `adventure-lobby.ts`, new `IndexAdventureLobby` / `PreviewAdventureLobby` with module, `IndexWaterTask.tsx`, `welcome-copy.ts`.
- **Tests:** redeem as host → Team A's leader; a second redeem fails; a non-host can't set the count or start; the counts 1, 5, 6, 7, 11, 17 and 30; 6–30 can't start, with or without a one-team flag; earlier, later and replaced sessions of the host seat get no host rights; the host gets no guide-only permission; the lobby refuses journey actions; the I1 code reads every I2 file.
- **Acceptance:** a fresh adventure starts from one host link.
- **Rollback:** the previous image, plus the I1 backup note.
- **Gate:** O16 (copy).

### I3. Team join link with leader approval

- **Depends on:** I2.
- **Scope:**
  - A team join link: random, stored hashed, valid until the adventure ends or is regenerated.
  - **Ask to join** creates `joinRequest { teamId, name, secretHash, expiresAt }`; the request secret sits in an HttpOnly cookie.
  - The leader or guide lets the request in; the device then exchanges its secret, once, for its own session.
  - Remove deletes the member's sessions. Individual single-use invitations remain as a fallback.
- **Files:** `participant-store.ts`, `participant-http.ts`, `app/api/amazing-shuk/dev/route.ts`, new `IndexTeamJoin` / `PreviewTeamJoin`, `ListGroupOverview.tsx`, QR rendering.
- **Security:**
  - The link alone grants nothing; requests expire; pending requests and seats are capped; the link is rate-limited.
  - No secret ever appears in a URL.
  - No self-service team switching; a leader can only act on their own team.
- **Tests:** link without approval → no session; one approval → one session; replay, decline, expiry and removal all fail; a player can't approve.
- **Acceptance:** four devices join through one link, each with its own session.
- **Rollback:** a config flag disables join links; CLI invitations still work.
- **Gates:** O6, O15, O16.

#### I3 implementation plan (Claude, 31 Oct 2026): approved by the owner on 31 Oct 2026; I3a is next; nothing built yet

The smallest secure path from the fixed seats to individually authenticated participants: one adventure, one team, HTTP actions and polling (no SSE or WebSockets). Built in three steps, each approved separately.

**Data (schema 7):**
- **`participants[id]`** = `{ teamId, joinedAt, source: "seat" | "join", name? }` is the only roster.
  - New IDs are random (`p_` plus 16 random bytes), never derived from a name.
  - The seats `player-1…7` stay valid only for the operator's command-line fallback. A seat becomes a member when it's redeemed, not before.
- **`names`** is checked against `participants`, not the fixed `KNOWN_IDS`. A name is a display label, never proof of identity.
- **`teams.A.joinLink`** = `{ tokenHash, createdAt, version }`: 32 random bytes, stored hashed. It lasts until a new adventure or until it's regenerated.
- **`joinRequests[publicId]`** = `{ teamId, name?, code, secretHash, createdAt, expiresAt, status: pending | approved, participantId? }`.
  - `publicId` is what the leader's screen refers to, never the secret.
  - `code` is a short check code shown on both phones.
- **Sessions** gain `leaderTeamId?` beside `host?`.
- `memberIds`, `groupParticipants` and the client's identities come from `participants`. `DEV_PARTICIPANTS` is used only by the local simulation.

**Join link and requests:**
1. The device opens `…#join=<token>`. The fragment never reaches server logs, and the address bar is cleared afterwards.
2. **Ask to join:** the server checks the link, the team's space and the pending cap. It creates a **pending** request and sets the HttpOnly cookie `shuk_join` (SameSite=Strict, Secure, path `/shuk/`).
3. **Let in** (the leader or the guide): inside the lock, the server checks the space again, so concurrent approvals can't overfill the team. The request becomes **approved** and holds a seat briefly.
4. The device polls its status, then exchanges its secret **once** for a participant and a `shuk_session`. The server deletes the request and the cookie.

**Failures and edge cases:**
- Declined, expired (pending, or approved but never collected), a replayed exchange, or an exchange from another device: all fail.
- Regenerating the link cancels its pending requests. Approved ones stand.
- The same device asking again gets its own request back.
- A device that's already signed in sees "You're already in" (draft).
- The link alone grants nothing.

**Permissions:**
- **Leader rights belong to one session:** `session.leaderTeamId === team` and that participant is still `team.leaderId`.
  - Redeeming the host invitation sets `host: true` and `leaderTeamId: "A"`.
  - Other sessions of the seat, a typed name, a join cookie or an unrelated invitation grant nothing.
- **Who can act:** let in, decline, regenerate (I3c) and remove (I3c) are for the leader of their own team and the guide. Players, the navigator and the submitter can't. Everything is checked on the server inside `transact`.
- **Removal** deletes all of the member's sessions, frees their roles, and drops their records of applied actions (they can never act again).
- **A lost phone:**
  - A player rejoins through the link with a new ID. Progress belongs to the team, and the old record can be removed.
  - For a lost leader, the guide can still let people in. Transferring leadership is I4.
- **Dropped connections:** leader actions go through the existing action queue with its action IDs, so replays are safe. The joining device retries its status check and exchange, which are safe to repeat.

**Steps:**
- **I3a, roster foundation** (players see no change): schema 7 with an exact pre-schema-7 copy on first write, `participants` as the roster, `leaderTeamId` on the host's session, and the fixed roster confined to the development simulation.
- **I3b, join flow:**
  - The server side of the link, ask, approve, decline and exchange.
  - The joining device's screens: optional name, **Ask to join**, waiting with the code, then the map.
  - The leader's Group tab: **Requests**, **Members** and **Space: N of 5**.
  - **Invite players** with Share and Copy only.
  - A config flag can turn join links off; command-line invitations keep working.
- **I3c:** Remove, Regenerate link, rate-limit tuning, and the QR code (after O15).
- **After I3b:** a security review.

**Files:**
- `participant-store.ts`, `participant-http.ts` (the `shuk_join` cookie, the unauthenticated ask, status and exchange calls, same-origin JSON).
- `parse-water-action.ts`, `group-action.ts`, `participant-names.ts`, `participant-identity.ts`, `dev-water-session.ts`.
- `scripts/shuk-new-adventure.ts`, `shuk-invite.ts`, `shuk-name.ts`.
- `IndexWaterTask.tsx` (`#join=`, names from the view), `PreviewShukWelcome.tsx`, `ListGroupOverview.tsx`, `IndexAdventureLobby.tsx`.
- New `IndexTeamJoin`, `PreviewTeamJoin`, `PreviewJoinRequests`.
- Tests and docs.
- No new dependencies in I3a or I3b.

**Migration (O17):**
- The v6 code rejects names that aren't on its fixed list, so schema 7 is required.
- Migration keeps seats with a live session, a role or a name, and drops the rest. It starts with empty `joinRequests` and no link.
- Rehearse on a copy of a live backup in the test container. Back up before deploying. Starting a new adventure afterwards is the clean path.
- **Rollback:** the previous image, plus the pre-schema-7 copy once v7 has been written. Joins made since are lost.

**Tests** (temporary state files and the isolated test container only; never live state):
- Invitation creation and redemption.
- The link alone gives no session; one approval gives one session.
- Decline, expiry, a replayed exchange, an exchange from another device, and a regenerated link.
- A player, the navigator, a non-leader session of the leader's seat, and a removed leader all fail to approve.
- Asking twice from the same device; joining when already signed in.
- No stale privileges after removal or a leadership change.
- Ten simultaneous asks and approvals against a cap of 5 give exactly 5 members; replayed approvals do nothing.
- The pending cap; dropped connections and queue retries.
- Migration from the v5 fixture and a v6 sample, the backup copy, and a failed migration writing nothing.
- The whole existing suite, including missions, scoring and I2's host rules.
- **Capacity:** generated IDs remove the seven-seat limit. The team cap (5) is tested fully. The adventure cap (30) can only be exercised in I7a, so it gets a unit test with an injected small cap.

**S0:**
- Not a blocker for building I3a and I3b: I3 load is at most 5 players plus the guide and a few pending requests.
- Before going live: finish S0-A (its harness sign-in bug is still open).
- Join requests write to the file without a session, so the per-link rate limit has to stop floods before they reach the file lock. It runs in memory and resets on restart.

**Decisions needed from the owner:**
1. **O6, recommended:**
   - 5 per team including the leader; the guide doesn't count.
   - At most 5 pending requests per team.
   - Pending requests expire after 10 minutes; approved but uncollected ones after 15.
   - The link lasts until a new adventure or until it's regenerated.
   - At most 10 asks a minute per link and 30 a minute overall, counted in memory.
2. **O15, recommended:** Share and Copy only in I3b. Then either a small, reviewed open-source encoder copied into the repo that draws the code on the phone, or the `qrcode` npm package. Never a third-party QR website.
3. **Showing the link again:** it's stored hashed, so the server can't show it twice. Recommended: show it when created, keep it on the leader's phone, and regenerate if that's lost. Storing it readably would change "stored hashed".
4. **A check code** on each request: recommended.
5. **Names** stay optional (approved) but are encouraged.
6. **Seats** stay only as the command-line fallback: recommended.
7. **O16:** the wording for "Ask to join", "Let in", "Waiting for your leader", "You're already in" and Space.
8. **O17:** rehearsing the live migration.

**Recommended first step:** I3a, with S0-A fixed and run alongside it.

**Owner approval (31 Oct 2026):** the owner approved this plan. I3a may be built next, as a local, uncommitted change that is verified and then reported. The recommendations for O6, O15, showing the link again and the check code are part of the approved plan; confirm them explicitly before I3b starts, since the decision table still lists O6 and O15 as open. Deploying, pushing and any live migration (O17) each still need their own approval.

### I4. Roles per team

- **Depends on:** I1 (I3 for leaders).
- **Scope:**
  - **Hand to…** (a pure `handGroupRole`).
  - Leader assign and clear within the team.
  - A **vacant-seat fallback** that claims and submits (or starts) in one transaction, only while the seat is free.
  - The optional cheer-card prompt to swap roles.
  - The "Submitter" label.
- **Files:** `roles.ts`, `participant-store.ts`, `group-action.ts`, `participant-identity.ts`, `PreviewRoleChoices.tsx`.
- **Tests:** concurrent claims (the second is refused); hand-over to a non-member is rejected; the fallback is rejected while the seat is occupied; a leader without the role can't submit.
- **Acceptance:** teams of 2 and of 6 finish a mission without the guide's help with roles.
- **Rollback:** the previous image (schema unchanged).

### I5. Pilot: parts on the well

- **Depends on:** I1.
- **Scope:** `parts` on `MissionDefinition`; `dealParts` with a stored deal; swap, hand on and Show all; a "Your part" card; vessel controls per part (UI only, so the server still accepts every valid move).
- **Files:** `mission-arrival.ts`, `water-task.ts`, `water-task-view.ts`, `participant-store.ts`, `components/amazing-shuk/dev/IndexWaterTask.tsx`.
- **Tests:** a deterministic deal for 1–8 members; rotation; a refresh keeps the deal; a late joiner gets a part at the next mission; Show all works for a solo player.
- **Acceptance:** **a real-phone session with real participants** passes section 9's experience and educational checks before I8 begins.
- **Rollback:** a mission flag turns parts off.
- **Gate:** the copy for every card.

### I6. Language foundations

- **Depends on:** I1.
- **Scope:** a participant language preference (English only); UI chrome strings in one catalogue (`lib/amazing-shuk/strings.ts`); an audit of `lang` and `dir`; a language-discovery content type (verified original, transliteration, meaning, source, **Help us translate** with no penalty).
- **Tests:** every Hebrew span has `lang="he"` and `.rtl`; no essential line is Hebrew-only; language parts can be completed through Help us translate.
- **Acceptance:** a group with no Hebrew reader can complete every mission.
- **Rollback:** the previous image.

### I7a. Multiple teams

- **Depends on:** I2–I4 (I3 brings dynamic participants, which lift the fixed seven seats), and the I5 pilot result.
- **Scope:**
  - Schema 7: a team count replaces `format`, with the same automatic pre-migration copy as I1.
  - The host accepts the recommended teams (`ceil(count / 5)`, split evenly), which creates teams B, C, … No format screen and no manual assignment of players.
  - A single-use leader invitation per team, from the host, regenerable and revocable; team leadership transferable without changing the host.
  - The host overview: each team's name, leader, participant count and readiness; nothing of other teams' answers, clues or unnecessary personal details.
  - Team-scoped points; food tokens pooled; a guide team switcher; the Marzipan lock per team.
  - Seat enforcement per team (O6), with 5 as the planned maximum.
- **Tests:** 30 sessions in 6 teams; cross-team writes rejected; concurrent submissions in every team; the host overview shows no other team's progress.
- **Acceptance:** a multi-team test on real phones, and the 30-participant checks below before any real 30-person run.
- **Rollback:** the previous image plus the pre-schema-7 copy.

#### I7a design proposal: named Team Leader invitations (draft, 30 Oct 2026; not approved, nothing built)

A compact way for the host to hand each recommended team to a person before sharing that team's leader invitation. **For the owner's decision (O27); design only.** It adds nothing to I2 or I3.

**The host's screen** (after accepting the recommendation, e.g. 20 → four teams of 5): one row per team, nothing else.

```text
Team A   You (host)                         Leading
Team B   Ari               [Share invite]   Waiting to be accepted
Team C   Bea               [Share invite]   Accepted ✓
Team D   + Add a name      [Share invite]   Not sent
```

1. **Name (optional).** Tapping the name opens a one-line field for the intended leader's first name, for the host's own reference. The host may skip it ("Team D" stays unnamed) and may edit it any time before the invitation is accepted. The host never names or assigns the other players.
2. **Share invite.** Opens a small sheet for that team only: its QR, *Share link* and *Copy* (the same pattern as I3's join link, O15). The sheet says whose team it is ("Invite for Team B · Ari") so the host scans or sends the right one; a link is shown only on this sheet, never in the list.
3. **Status** per row, from the server: *Not sent* · *Waiting to be accepted* · *Accepted* (with the leader's own chosen name, if any) · *Expired* · *Replaced*. Plain words with an icon, never colour alone.
4. **Replace.** On a row that is waiting, expired or (after a lost phone) accepted, *Make a new invite* revokes the old link at once and shows the new one. Replacing an accepted leader asks for confirmation and moves leadership to whoever redeems the new link; the team's progress stays with the team.
5. **After acceptance** the leader's phone shows their own team and their team's join link (I3): the leader, not the host, lets their players in.

**Security and data** (none of this exists yet; it follows the I2 host model):
- **The typed name is a label, not an identity.** It grants nothing, proves nothing, and isn't checked against the name the leader chooses. Shown only to the host and the guide.
- **Authority comes from redemption only.** Redeeming a team's single-use `leader` invitation marks *that session* as the team's leader (as `host: true` marks the host's session in I2), and the server checks the session flag together with `team.leaderId`. A seat alone never grants leader rights; I3 already has to bind leader rights to sessions before leaders can let players in.
- **Secrets:** the invitation is hashed at rest, single-use, 24 h, scoped to one team, refused once the team has a leader; replacing it revokes the old hash; the plain link appears only on the share sheet, never in logs or in the host's list; issuing and replacing are host- or guide-only and rate-limited (O6).
- **Minimal data per team** (schema 7): `leaderLabel?` (the host's typed first name, at most ~30 characters, deleted with the adventure), and on the invitation record `{ teamId, kind: "leader", hash, expiresAt, status: pending | accepted | expired | revoked }`. The host's view gets only each team's label, status and member count (O26), never another team's answers or players' details.
- **Edge cases:** the host forwards the wrong link → *Make a new invite* revokes it; two people try the same link → the first redemption wins, the second sees the friendly invitation message; the named person can't come → anyone can redeem it and the host may rename the row afterwards.

**Open questions for the owner:** is the name field wanted at all, or is "Team B" enough (it adds personal data, however small)? Should the guide see the typed names? Can a leader decline, handing the team back to the host?

### I7b. End-of-game comparison (optional)

- **Depends on:** I7a.
- **Scope:** the end-only comparison across the teams, with Levin and Chesed VeRachamim excluded (`competitive: false`); friendly, and possible to switch off.
- **Tests:** the comparison appears only at the end and excludes the sensitive missions.
- **Rollback:** a config flag hides it; no data change.

### I8. Expand parts

- **Depends on:** I5 validated, I6, field checks.
- **Scope:** one mission per release (the mural, Levin readers, the Language Explorer at the gate and Chesed VeRachamim), each through `/experience-design` first.

## 9. Verification

**Technical.** Tests first for pure functions; integration through `sessionAction`; `npm run test:shuk` in `shuk-dev`; `npm test`; lint and `tsc` in the one-shot container (`.claude/rules/verify.md`); `/game-verify shuk`; `git diff --check`. A `/code-review` of each diff, plus a security review for I2, I3 and I7a. The tests cover:
- invitation and join-link security (single-use, expiry, hashing, replay, revocation, limits);
- session independence;
- team isolation;
- role exclusivity under concurrency;
- progress after refresh and reconnection;
- scoring awarded once, per team;
- backward compatibility (the v5 fixture and the backup rehearsal);
- 8 simulated devices against the lock, then 30 (polling and actions at once) before any real 30-person run.

**Experience** (the owner's real phones; Claude does no browser review and claims no field results):
- 3 people in one team; 8 as two teams; a larger group in several teams;
- before a real 30-person run (the provisional ceiling): server resources and concurrency, guide oversight and crowd management, and onboarding at that scale;
- a group with no Hebrew reader;
- fewer players than parts;
- a player joining late;
- a role changing hands mid-game.

**Educational** (the guide's observation sheet):
- Are heads up or down?
- Who talks to whom?
- Did each part matter?
- "What will you tell someone tonight?"
- Did the stops feel different from each other?
- Did competition add fun without crowding out the story?

## 10. Decision gates

| # | Decision | Status |
|---|---|---|
| O1–O3 | ~~Format rule (1–6 Together; 7+ Together or Two Teams)~~ superseded 29 Oct 2026 by teams of about 5: recommended `ceil(count / 5)`, split evenly, 5 the planned maximum, ceiling 30 participants (provisional); Start Adventure; one-group-only superseded for the future design | **Approved** |
| O4, O5 | Team join links with leader approval; optional names | **Approved** |
| O6 | Join-link limits (seat cap, pending requests, link lifetime, rate limit): recommend and justify before I3 | **Open** |
| O7–O10, O14 | Leader role management without guide-only powers; vacant-role fallbacks; optional parts; "Submitter"; no penalty for translation help | **Approved** |
| O11–O13 | English-first; "Language Explorer"; Hebrew story bodies stay out of production; other languages need approved translations | **Approved** |
| O15 | QR approach: the smallest secure option given the repo's dependencies, chosen before I3 | **Open** |
| O16 | Team names, part names (Spotter, Reader) and all onboarding copy | **Open**; the I2 lobby copy was approved with refinements on 29 Oct 2026 (the list and the remaining drafts are in the [handoff](agent-handoff.md)) |
| O17 | Live data migration: rehearse on a backup first; no live migration without separate authorisation | **Open** |
| O18, O19 | Team points compared only at the end (any competition optional and friendly); food tokens pooled across all teams | **Approved** |
| O20 | The 29 Oct line in `.claude/agents/dori-ux-designer.md` (`7635f56`): explicit approval or revert | **Open**; the file must not be changed |
| O21 | Change the skill description only if tests support it | **Resolved:** the tests didn't, so no change |
| O22 | Add the verified game-design precedents to the inspiration library | **Approved and done** (I0) |
| O23 | Rabbi Levin and Chesed VeRachamim never competitive | **Approved** |
| O24 | All teams share the same content and approved route with the guide; no independent routes | **Approved** |
| O25 | How many teams one guide can lead at once: staggered starts or team-led play for larger groups (operational design, not built). One guide for now | **Open** |
| O26 | Host overview: team name, leader, count and readiness only (I7a) | **Approved** |
| O27 | Named Team Leader invitations: the host's optional leader label per team, per-team single-use invitations with status and replace ([I7a design proposal](#i7a-design-proposal-named-team-leader-invitations-draft-30-oct-2026-not-approved-nothing-built)) | **Open**: design only, not built |
| — | Deploy, push or live-data changes for any increment | Separate approval each time |

## 11. Risks

- **Security:** the join link is a new way in, mitigated by approval, expiry, limits and regeneration. Leaders can admit people, but see everyone they admit.
- **Migration:** a v6 state isn't readable by the v5 image; backup and rehearsal come first.
- **Accessibility:** a part must be readable at a glance; outdoor targets of at least 3 rem; nothing relies on colour or sound alone.
- **Scoring:** competition plus hidden timing rewards speed, so the comparison comes at the end only and the sensitive missions are excluded.
- **Operations:** one guide for up to six teams (approvals, crowding at narrow stops); staggered starts or team-led play are open (O25); one adventure per data file.
- **Scale:** 30 participants is a planning limit, not proven: 30 phones polling every 1.5 s, all writes through one file lock, on a 4 GB production server shared with other sites. Test before any real 30-person run, and don't advertise it until then.
- **Design:** split clues can become the new monotony; parts must be justified mission by mission.
