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
   - **Until I7a** the recommendation is advice only: everyone plays as team A, and a count that recommends several teams starts only through an explicit "start as one team".
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
  - **Start Adventure** by the host or guide; when more than one team is recommended the server requires an explicit one-team start (`asOneTeam`).
  - Invitation kinds `host` and `leader` (reserved; a `leader` invitation is refused until I7a).
  - A "new adventure" CLI archives the old state (the 26 Oct reset-with-backup pattern); development and testing only, not shipped in the app image.
- **Files:** `scripts/shuk-invite.ts`, `scripts/shuk-new-adventure.ts`, `participant-store.ts`, `group-action.ts`, `parse-water-action.ts`, new `adventure-lobby.ts`, new `IndexAdventureLobby` / `PreviewAdventureLobby` with module, `IndexWaterTask.tsx`, `welcome-copy.ts`.
- **Tests:** redeem as host → Team A's leader; a second redeem fails; a non-host can't set the count or start; the counts 1, 5, 6, 7, 11, 17 and 30; a multi-team count can't start without the one-team confirmation; the host gets no guide-only permission; the lobby refuses journey actions; the I1 code reads every I2 file.
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
| O16 | Team names, part names (Spotter, Reader) and all onboarding copy | **Open** |
| O17 | Live data migration: rehearse on a backup first; no live migration without separate authorisation | **Open** |
| O18, O19 | Team points compared only at the end (any competition optional and friendly); food tokens pooled across all teams | **Approved** |
| O20 | The 29 Oct line in `.claude/agents/dori-ux-designer.md` (`7635f56`): explicit approval or revert | **Open**; the file must not be changed |
| O21 | Change the skill description only if tests support it | **Resolved:** the tests didn't, so no change |
| O22 | Add the verified game-design precedents to the inspiration library | **Approved and done** (I0) |
| O23 | Rabbi Levin and Chesed VeRachamim never competitive | **Approved** |
| O24 | All teams share the same content and approved route with the guide; no independent routes | **Approved** |
| O25 | How many teams one guide can lead at once: staggered starts or team-led play for larger groups (operational design, not built). One guide for now | **Open** |
| O26 | Host overview: team name, leader, count and readiness only (I7a) | **Approved** |
| — | Deploy, push or live-data changes for any increment | Separate approval each time |

## 11. Risks

- **Security:** the join link is a new way in, mitigated by approval, expiry, limits and regeneration. Leaders can admit people, but see everyone they admit.
- **Migration:** a v6 state isn't readable by the v5 image; backup and rehearsal come first.
- **Accessibility:** a part must be readable at a glance; outdoor targets of at least 3 rem; nothing relies on colour or sound alone.
- **Scoring:** competition plus hidden timing rewards speed, so the comparison comes at the end only and the sensitive missions are excluded.
- **Operations:** one guide for up to six teams (approvals, crowding at narrow stops); staggered starts or team-led play are open (O25); one adventure per data file.
- **Scale:** 30 participants is a planning limit, not proven: 30 phones polling every 1.5 s, all writes through one file lock, on a 4 GB production server shared with other sites. Test before any real 30-person run, and don't advertise it until then.
- **Design:** split clues can become the new monotony; parts must be justified mission by mission.
