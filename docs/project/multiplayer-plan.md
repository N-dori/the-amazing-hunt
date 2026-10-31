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
- Before going live: finish S0-A. The harness is fixed and was run on 31 Oct 2026; results and the next step are in "S0-A results and S0-B plan" below.
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

#### I3b decisions (owner, 31 Oct 2026): approved design; built and committed, not deployed (see "I3b implementation" below)

**Approved defaults:**
- **Team size:** 5 members per team, including the leader. The guide doesn't count.
- **Pending requests:** at most 5 per team.
- **Expiry:**
  - A pending request expires after 10 minutes.
  - An approved request that isn't collected expires after 15 minutes. Until then it holds a place in the team.
- **Join link:** reusable, until a new adventure or until it's explicitly replaced.
- **Names:** optional, cleaned with `cleanDisplayName`. A name is a label, never an identity.
- **Check code:** shown on both phones, only to match the right phone. It is not authentication.
- **Secrets:** the link, the request secret and sessions are all stored hashed.
- **O15:** Share and Copy only. QR comes in I3c.

**Owner's refinements:**
1. **No automatic link replacement.**
   - Opening **Invite players** never invalidates anything.
   - Replacing the link (which cancels its pending requests; approved ones stand) needs an explicit confirmation by the leader or guide.
   - Since the link is stored hashed, the server can't show it again. The leader's phone keeps it in memory only while the screen is open. If it's lost, it is replaced explicitly.
2. **Remove is in I3b.**
   - The team's leader (a leader session) or the guide can remove a member.
   - Removing deletes the member from the registry, which ends every one of their sessions at once (`identity()`), frees their roles and drops their receipts.
   - The leader can't be removed until leadership can be transferred (I4).
3. **The team cap is enforced.**
   - No join-link approval can exceed it. The check runs inside the lock and counts members plus approved requests not yet collected.
   - Operator invitations no longer bypass it silently: a seat invitation that would exceed the cap is refused, unless the operator issues it with an explicit override flag on the command line (`shuk-invite.ts`). The override is recorded on the invitation.

**Schema:**
- `teams[id].joinLink` and `joinRequests` are optional additions under schema 7, with no migration.
- I3a's `isValidRegistry` already accepts members without a seat and passes unknown fields through, so the I3a image stays a rollback target. A test proves it.
- The planned `source` field is dropped: whether `seat` is present already says how the member joined.

**Joining:**
- Joining works in the lobby and during the adventure, while there is space.
- A device that is already signed in gets "You're already in" (draft) and creates nothing. There is no self-service team switching.
- A declined device can't ask again with the same `shuk_join` cookie until the request would have expired. The rate limit covers the rest.
- Kill switch: with `SHUK_JOIN_LINKS` off, the ask, status and exchange calls return 404 and the UI hides **Invite players**. Command-line invitations always work.

**Security review (current code; I3b must keep these):**
- **CSRF:** every POST needs `Origin` equal to the configured public origin (never forwarded headers) and `Content-Type: application/json`. Cookies are `SameSite=Strict`. GET has no side effects. The new ask, status and exchange calls use the same rules: the ask is a POST, and status is a read that takes no lock.
- **Cookies:**
  - `shuk_session`: HttpOnly, SameSite=Strict, `Secure` on https, path `BASE_PATH/`, 7 days.
  - `shuk_join`: the same flags, path `BASE_PATH/`, and it lives no longer than its request.
  - No secret appears in a URL. `#join=` and `#invite=` sit in the fragment and are cleared from the address bar.
- **Replay:**
  - Leader actions (let in, decline, remove, replace link) go through the action queue with action IDs and receipts.
  - The exchange deletes the request, so a second exchange fails. An exchange needs the cookie of the device that asked.
  - Asking again with the same cookie returns the same request.
- **Concurrent approvals:**
  - Every capacity check and state change happens inside `transact`, so ten simultaneous approvals against the cap admit exactly the free places.
  - S0-B's write queue keeps this serialization: a queue changes the order, not the checks.
- **Abuse:**
  - An in-memory rate limit (10 asks a minute per link, 30 overall) refuses before `transact`, so a flood can't fill the write queue or touch the file.
  - Pending requests are capped. Request bodies are already limited to 4 KB.
  - Names never appear in logs or error messages.

**Unresolved implementation dependencies:**
- **S0-B result (Option A):** the size of the write queue and how it interacts with unauthenticated asks. Build I3b on top of whichever locking S0-B lands with.
- **O16 copy:** every word in the join flow is a draft (`TODO(copy)`). Live use needs O16.
- **I4:** a lost or removed leader. Until I4, the guide can still let people in, and the leader can't be removed.
- **Lobby count:** the lobby's count ("how many are playing?") is separate from the real roster. Keep the start rule as it is; decide in I7a whether the roster should replace it.
- **Live schema 7:** I3b adds only optional fields to schema 7 (no new migration). Before any I3b deploy, the live file must already be schema 7 with its pre-schema7 copy. On 31 Oct 2026 it was still schema 6 (see the handoff).
- **Implementation approval:** after the S0-B report. Then a security review before any deploy request.

**Acceptance tests (temporary state files only):**
- The link alone gives no session. Ask, one approval and an exchange give exactly one session.
- Ten simultaneous approvals against the cap: exactly the free places are filled, and replays change nothing.
- A second exchange fails, an exchange from another device fails, and asking again returns the same request.
- An expired pending or uncollected request can't be approved or exchanged, and its place frees up.
- A player, the navigator, a second session of the leader's seat and a removed member all fail to let in, decline, remove or replace. The guide succeeds.
- Replacing the link needs the explicit action, cancels pending requests and keeps approved ones. Opening **Invite players** changes nothing.
- An operator invitation over the cap is refused unless it has the override.
- Removing a member ends their sessions, and their queued actions are refused.
- The pending cap holds, and a rate-limited ask writes nothing.
- A signed-in device creates nothing. With the kill switch off, the calls return 404.
- An I3b file is read by the I3a code.
- The full suite, lint and `tsc`, and `/game-verify shuk`.

#### I3b implementation (Claude, 31 Oct 2026): built and committed, not deployed

**Built:**
- **Store:**
  - `createJoinLink` (leader session or guide; replacing needs `replace`), `askToJoin`, `joinStatus` (a read with no lock) and `exchangeJoin`.
  - The membership actions `let-in`, `decline` and `remove-member`, through the action queue and receipts.
  - The cap on operator invitations (`shuk-invite.ts --over-cap`, recorded as `overCap` on the invitation).
  - `teams[id].joinLink` and `joinRequests` are optional under schema 7 and checked on load, so a malformed file fails closed.
- **HTTP:**
  - The `join-ask`, `join-exchange` and `join-link` POSTs (same-origin JSON), and `GET ?join=status`.
  - The `shuk_join` cookie: HttpOnly, SameSite=Strict, Secure on https, 25 minutes.
  - The in-memory rate limit (`join-rate-limit.ts`) runs before the store is read or locked.
  - The `SHUK_JOIN_LINKS=1` kill switch: off by default, so a deploy changes nothing until it's set.
- **Phones:**
  - `IndexTeamJoin` / `PreviewTeamJoin` for the joining phone: `#join=`, an optional name, Ask to join, the wait with the code, then the game. A reload finds its request again.
  - `IndexTeamMembers` / `PreviewJoinRequests` for the leader and guide, in the Group tab and under the lobby: space, Invite players with Share and Copy, the link kept in memory only, a confirmed replace, requests with codes, Let in / Decline, and Remove with a confirmation.
  - All words are drafts (`TODO(copy)` in `team-membership.ts`, O16).
- **Tests:**
  - `team-join.test.ts` (12) and `team-membership-ui.test.ts` (3) cover every acceptance test above, plus the CSRF and cookie rules, Secure on https, and the kill switch.

**Notes:**
- **A lost reply to the exchange** can't be retried: the request is gone, as approved. That leaves a member without a session, so the leader removes it and the phone asks again. Tested.
- **A lost reply to the ask** sets no cookie, so asking again makes a second request with a new code. It is capped by the pending limit and expires in 10 minutes.
- **Rollback:** an I3b file was checked against the I3a code (69b4077). I3a reads it, serves the leader and a joined member, and keeps the join fields when it writes. I3b then reads it back. Without I3b, the cap on operator invitations is lost, and pending requests sit unused until a new adventure.
- **Before any deploy:**
  - The live file must already be schema 7, with its pre-schema-7 copy.
  - S0-B Option A deployed first.
  - A security review.

**I3c (not built):** QR (O15), rate-limit tuning, leadership transfer for a lost leader (I4).

#### S0-A results and S0-B plan (Claude, 31 Oct 2026): S0-B steps 1–3 approved by the owner on 31 Oct 2026

**Harness fixed (31 Oct 2026, uncommitted, `scripts/shuk-sync-bench.{sh,mjs}`):**
- A fresh data file holds an adventure that has already started, so the host invitation was refused (409). The script hid the error and passed on an empty token. It now opens a lobby first, shows the invite command's errors and stops on an empty token.
- Since schema 7, a seat's member has a random ID. The bench now reads it from the view after sign-in and sends it as `expectedParticipantId`.

**Measured** (an isolated test container at production's limits, 256 MB and 1 CPU; `dori-shuk:current` = `69b4077`; results in `.local/shuk-bench/`):

| | 8 clients | 30 clients |
|---|---|---|
| Requests/s | 6.9 | 32.4 |
| GET p50 / p95 / p99 | 4 / 7 / 11 ms | 4 / 12 / 47 ms |
| POST p50 / p95 / p99 | 9 / 19 / 24 ms | 25 / 99 / 127 ms |
| Tap to done, p50 / p95 / max | 0.015 / 16 / 37 s | 12 / 106 / 154 s |
| "Storage busy" (503) share of POSTs | 37% | 72% |
| Applied twice | 0 | 0 |
| Server CPU avg / max; memory | 4.9 / 13.9%; 47 MiB | 13.8 / 36.2%; 55 MiB |

One transaction on the 30-client state (21 KB) takes 1.9 ms at p50 and 6 ms at p95 (the bench's `parse` step).

**Root cause: timing, not capacity.**
- `acquireLock` tries the `mkdir` lock once and answers 503 if it is held. There is no in-process queue. The lock is held across the transaction's awaits, so any POST that arrives during another write fails.
- The bench and the app (`IndexWaterTask`) retry on a fixed 2 s interval, with no backoff or jitter. One 503 stops a phone's whole queue until the next tick.
- In the bench every phone's flush timer starts at the same moment, and each duplicate's two copies collide with each other.
- The server could serialize about 40 writes a second against about 6 needed. Even so, each phone's queue grew faster than it emptied.

**Accounting:**
- All 356 rejections are 403 business rules from the workload: 56 lost role claims, most of the rest "Choose up to 2.". There were 0 server, network, 401 or 409 errors.
- The 31 queued actions were abandoned when the bench's 60 s drain cap ran out (`drainMs` 60 089). The server didn't lose them.
- The bench records an action only when it is first posted, so actions waiting behind a stuck queue head were never counted. That likely accounts for the 2 missing from 722 (inference).
- Exactly-once held: every applied ID has a receipt in the file.

**Not yet proven:**
- A container restart was not tested.
- The 60 s drain cap hides the tail after sleep and reconnect.
- `db.applied` is never pruned. At 3,000 receipts per member, a read costs 5 / 32 ms (p50 / p95) and a write 12 / 43 ms; at 10,000, a read costs 35 / 73 ms and a write 53 / 80 ms. This needs a schema decision later, not now.

**Validity:**
- The 30-client run is a stress test, not a model of visitors: one team of 8 members (about 4 phones per seat), about 6 actions/s on one mural, timers in step, and 10% duplicates.
- Neither workload stands for six real teams until I7a exists.

**S0-B, approved by the owner (31 Oct 2026) under three conditions:**
- **A valid baseline comes before any change to the locking.**
- **The cross-process file lock stays.** The operator scripts write through it.
- **Client retry behaviour is not changed.** Option B (backoff with jitter) is deferred until after the measurements.

Steps:
1. **Bench only.** Two workloads:
   - **Realistic cooperative, a one-team stand-in:** 30 phones, polling and flushing at random phases, about one team action every 10–20 s, role claims by 2–3 contenders, a burst of 3–5 phones at each submission, a reconnect burst at start, 2% lost replies.
   - **Stress:** today's rate with duplicates and the full role race, a burst where all phones wake together, a restart of the test container, and a drain with no cap (up to 5 minutes).

   Both workloads track every created action to its end, with reasons for each rejection.
2. **Baseline** the current image on both workloads.
3. **Option A:** an in-process write queue in `transact` (one at a time per file, kept on `globalThis`), in front of the unchanged `mkdir` lock. If another process holds the lock, wait briefly with jitter, within a fixed limit, before 503. Tests:
   - concurrent actions apply exactly once;
   - the operator scripts' lock is still respected;
   - a stale lock is still recovered;
   - the migration and backup tests are unchanged.

   Local and uncommitted.
4. Re-run both workloads on Option A and compare: done, see "S0-B results" below. Option B is still deferred.

Out of scope without separate approval: SSE, WebSockets, new storage, schema changes, group commit.

**Proposed acceptance thresholds:**

| Measure | Realistic | Stress |
|---|---|---|
| Tap to confirmed, p95 / p99 / max | ≤ 1 s / ≤ 3 s / ≤ 10 s | ≤ 3 s / ≤ 10 s / ≤ 30 s |
| "Storage busy" share of POSTs | ≤ 1% | ≤ 5% |
| Queue drain after taps stop | ≤ 5 s, 0 left | ≤ 15 s; ≤ 30 s after the server is healthy again following a restart |
| Applied twice; lost or pending forever | 0; 0 | 0; 0 |
| Operational errors (500, network, unexpected 401/409) | 0 | 0 outside the restart window |
| Recovery | All phones converge; a lock left by a kill clears within 10 s | Same |
| Authorization | Every 403 matches an expected rule; host and leader rules unchanged; the full test suite passes | Same |
| Server CPU p95; memory | < 50% of one core; < 128 MiB | Same |

**S0-B results (Claude, 31 Oct 2026): Option A built locally, uncommitted; waiting for owner review.** 30 clients, the same bench and workloads, the baseline `dori-shuk:current` (69b4077) against `dori-shuk:test` (Option A). Results are in `.local/shuk-bench/`.

- **Option A:** `transact` waits its turn in a per-file line in the process (at most 64 writes, 10 s per turn), then takes the unchanged `mkdir` lock, waiting up to 1.5 s in jittered steps when another process holds it. Five new tests cover the line, overflow, the cross-process lock and failed writes. All 205 Shuk tests pass and tsc is clean.
- **Realistic:** all checks pass. Tap to confirmed p50/p95/p99 is 6.8 ms / 16 ms / 1.6 s (baseline: 7.3 ms / 14 ms / 0.9 s), with 0 busy before and after. The 3 "socket hang up" errors in the baseline were the bench reusing a keep-alive socket the server had closed. The bench now resends those once, as browsers do, and counts each resend.
- **Stress:**
  - Busy share: 0% (baseline 42–44%).
  - Tap to confirmed p50: 28 ms (baseline 1.1 s).
  - Restart backlog cleared in 0.8 s (baseline 6–11 s).
  - Applied twice, pending and unaccounted: 0. Operational errors: one connection refused, inside the restart window.
  - Tap-to-confirmed p95/p99/max still fail (9.4 s / 27.7 s / 30.2 s). The scenario keeps a quarter of the phones asleep for 30 s and every phone offline for 10 s, so those numbers measure offline time.
  - A diagnostic that starts the clock when the phone is back online gives 28 ms / 1.0 s / 2.5 s / 4.4 s for p50/p95/p99/max (baseline 1.0 s / 5.6 s / 17 s / 18.6 s). The thresholds themselves are unchanged.
- **Open for the owner:**
  - Whether the stress latency thresholds should be measured from back-online.
  - Whether Option B (client backoff) is still needed.
  - Commit and deploy.

### I4. Roles per team

- **Review (31 Oct 2026, awaiting owner decisions):** [I4/I5 roles and well pilot review](i4-i5-roles-and-well-pilot-review.md) recommends I4 for the permanent roles only and flags the "2 and 6" acceptance below (the team cap is 5).
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

- **Review (31 Oct 2026, awaiting owner decisions):** [I4/I5 roles and well pilot review](i4-i5-roles-and-well-pilot-review.md): the well's two-move shortcut and its speed-tiered timing need decisions (D1, D2) before the pilot runs; the proposed Jar keeper rule is D5.
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
  - Mandatory team names, unique per adventure, typed or picked from the suggestions ([below](#i7a-team-names-owner-31-oct-2026-decided-not-built)).
- **Tests:** 30 sessions in 6 teams; cross-team writes rejected; concurrent submissions in every team; the host overview shows no other team's progress.
- **Acceptance:** a multi-team test on real phones, and the 30-participant checks below before any real 30-person run.
- **Rollback:** the previous image plus the pre-schema-7 copy.

#### I7a team names (owner, 31 Oct 2026): decided; not built

**Superseded:** two earlier versions from the same day are replaced: the fixed 24-name bank (mandatory choice, featured order, an emoji for each name) and the avatar options (a reusable icon set, generated artwork). They survive only in git history (`62ae58f` and the commits around it). No GPT or other image API and no generated artwork is needed.

**Owner decisions:**
- A team **types its own name** or **picks a suggestion**. Within one adventure every name is unique, and the server confirms it atomically.
- **Names:** at most 20 user-perceived characters, in English/Latin script, with no emoji in the name.
- **Content:** a basic content check. The guide can correct an inappropriate name with the existing rename rights.
- **Suggestions:** 4–6 short ones, always including Falafel Fugitives, taken from the [name bank](../../design/inputs/content/Amazing_Shuk_Team_Name_Bank_Contemporary_English.md), which is now an optional suggestion library. Suggestions avoid foods whose route claims haven't been checked (kada, mufleta). A suggestion another team holds isn't shown.
- **Avatar:** superseded on 31 Oct 2026 by the owner's team-avatar direction: about 8 original Shuk-themed avatars, assigned automatically, with no selection step (see "Team avatars" below).
- **Who names, and when (kept from earlier):**
  - The team leader names the team, and the guide can do it as a fallback.
  - The leader may rename before Start. After Start, only the guide may.
  - A released name is free for other teams at once.
  - A team can't become ready until its name is confirmed.
  - The confirmed name is shown the same way on every screen.
- **Scope:** I7a onboarding only. Naming doesn't block today's single-team game or I3b.

**Screen (one phone screen):**
- A heading and a description.
- The team-name field, with the suggestions under it. Tapping a suggestion fills the field.
- The confirm button.
- While the claim is being saved, the name is never shown as secured.
- When a name is taken, the field keeps what the player typed and the suggestions refresh.

**Approved copy (O16, owner, 31 Oct 2026):**

| Where | Text |
|---|---|
| Heading | Name your team |
| Description | Make up a name or pick a Shuk favorite! |
| Field label | Team name |
| Suggestions label | Need inspiration? |
| Button | Confirm name |
| Empty | Enter a team name. |
| Too long | Keep it under 20 characters. |
| Unavailable | That name's taken. Try another! |
| Not allowed | Choose a different name. |
| Success | You're {name}! |

The limit is **20 characters inclusive**; the "Too long" message keeps its approved wording. These also still apply from the earlier approval: "Saving your team name…" while saving, "Change team name" for the leader before Start, and "Ask your guide to change your team name." after Start.

**Validation and normalization:** the same steps on the phone, for instant feedback, and on the server, whose answer is final.

| Step | Rule | If it fails |
|---|---|---|
| 1. Clean | Unicode NFC, trim, collapse every run of whitespace to one space | (none) |
| 2. Empty | At least one character after cleaning | Empty |
| 3. Length | At most 20 grapheme clusters (`Intl.Segmenter`, granularity grapheme) | Too long |
| 4. Characters | Latin-script letters (accents included), digits 0–9, spaces, and `' ’ - & . !` only. At least one letter. No emoji, no other script, no control characters | Not allowed |
| 5. Content | Words checked against a small blocklist in code, matched on the comparison key. Not promised complete: the guide's rename is the backstop | Not allowed |
| 6. Unique | The comparison key isn't held by another team in this adventure | Unavailable |

- **Comparison key:** the cleaned name decomposed (NFKD), with accents removed, lower-cased without locale rules, and with ’ treated as '. So "Café Crew", "cafe  crew" and "CAFE CREW" are one name.
- **Stored:** the cleaned display name and its key. Every screen shows the display name.
- **Server:**
  - A claim or rename is a group action. It is authorized as today: the team's leader session before Start, the guide at any time.
  - It runs inside `transact`. A rename frees the old key and claims the new one in the same write.
  - The guide's corrections pass through the same checks.
- **Retries:**
  - Each claim carries an action ID and goes through the existing exactly-once receipts.
  - Repeating a claim for the name the team already holds succeeds and changes nothing.
  - A replayed old claim can't take back a name the team has since given up.
- **Other adventures:** they can reuse any name. A new adventure starts with none held.

**Team avatars (owner direction, 31 Oct 2026; design by Dori; artwork and build pending):**
- **Owner direction:**
  - About 8 original Shuk-themed team avatars, assigned automatically from the stable team ID, never the name.
  - Teams in one adventure get different avatars where possible. The avatar stays the same through renames, reconnects and restarts.
  - No selection step, no emoji per name, no runtime AI or new external API.
  - Personal avatars stay in Profile, and the team name and avatar are the main identity in play.
- **Design:** [Dori's recommendation](../../design/output/team-identity-avatars-2026-10-31.md):
  - The header's group button shows the team avatar, and the small line above the title shows the team name.
  - The personal avatar stays on Profile, with Sign out.
  - Eight concepts share one frame.
- **Assignment (technical recommendation): a stored avatar ID**, not one computed each time.
  - When a team is created (I7a, inside `transact`), the server stores `teams[id].avatarId`: the first catalogue ID no other team in the adventure holds, starting from a point derived from the team ID.
  - Stored is simpler than computed. A computed avatar can't guarantee different avatars, and it would change for every team whenever the catalogue changed. A stored ID keeps an existing team's avatar whatever happens to the catalogue, and the field is optional under schema 7, so there is no migration.
  - **Catalogue changes:** avatar IDs are stable and never reused. Adding avatars changes no existing team. A retired ID is shown with the frame and the team's initials until the next adventure.
  - Today's team A has no `avatarId`, and nothing shows until I7a.
- **Pending:**
  - The owner's approval of the set and the subjects.
  - Ink or Chalk tile.
  - Who draws the 8 SVGs, and under what licence.
  - Whether a one-team adventure shows the team identity.
  - The draft copy (O16).
  - Each new `public/shuk/` file needs a `!` line in `.dockerignore`.

**Deferred, not open for I7a:** Hebrew and other scripts, emoji in names, generated avatars, avatar choice.

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
| O6 | Join-link limits: 5 per team including the leader (enforced; an operator override must be explicit); 5 pending; 10 and 15 min expiry; reusable link replaced only with explicit confirmation; in-memory rate limit ([I3b decisions](#i3b-decisions-owner-31-oct-2026-approved-design-not-built-implementation-not-yet-approved)) | **Approved** 31 Oct 2026 |
| O7–O10, O14 | Leader role management without guide-only powers; vacant-role fallbacks; optional parts; "Submitter"; no penalty for translation help | **Approved** |
| O11–O13 | English-first; "Language Explorer"; Hebrew story bodies stay out of production; other languages need approved translations | **Approved** |
| O15 | Share and Copy only in I3b; QR approach chosen in I3c | **Approved** 31 Oct 2026 (QR itself still open for I3c) |
| O16 | Team names, part names (Spotter, Reader) and all onboarding copy. Team names: **decided** on 31 Oct 2026, with copy approved ([I7a team names](#i7a-team-names-owner-31-oct-2026-decided-not-built)) | **Open**; the I2 lobby copy was approved with refinements on 29 Oct 2026 (the list and the remaining drafts are in the [handoff](agent-handoff.md)) |
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
