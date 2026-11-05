# Amazing Shuk — Progressive challenges, hints, timing, voice, rewards, solo play and Market Surprise (plan)

**Status: plan approved for the record by the owner, 2 Nov 2026. Planning and documentation only.** Nothing here is built. No code, schema, runtime configuration or live data has changed. Every point value and every line of visitor wording is a **draft pending owner approval** (`TODO(copy)`) unless it is marked **[Owner]** or *Decided*. Each build step needs its own approval. The multiplayer onboarding and security workstream stays paused.


v2 adds the owner's directions of 1–2 Nov 2026: voice answers, silent navigation and challenge timing, per-challenge hint counts, hint pricing, the hint sheet, and short challenge labels. It keeps v1's findings and replaces the parts the owner changed (optional challenges **may** be worth more than the core; there are no starting points).

## Context

Every stop follows one reusable shape: **find the place** → **one approachable core challenge** that every team can get past → **optional challenges** with higher potential points that never block → next stop. Play is **self-guided by default**; a guide supervises only if one is present (a central Guide screen comes later). Answers can take many forms (choosing, matching, photographs, physical discovery, puzzles, voice), but no photo, recording or AI is ever required to progress.

### What the code does today (read 1–2 Nov 2026)

| Area | Today | Where |
|---|---|---|
| Navigation | 20 points once, from a usable GPS reading or the guide's confirmation. **No "set out" event**: which mission is open is only per-phone screen state | `mission-arrival.ts`, `shuk-navigation.ts`, store `arrival` branch |
| Challenge time | Server clock from an accepted Start (`startedAt`, `clockStartedAt`, `solvedAt`, guide-only pause/reset/exclude) | `water-performance.ts` |
| Core points | **Every** mission uses `WELL_REWARDS`: 100 / 90 / 80 **by speed**, minus 10, +15, +20 per hint, floor 40, 2 food tokens | `water-performance.ts` (`calculateWaterReward`) |
| Hints | A fixed list per mission or step (mural 3, Montefiore 2), one shared count per team, revealed in order; the penalty list must be at least as long as the hint list or scoring throws | `mural-task.ts`, store `hint` branch |
| Optional | One `bonus`: opens after the core, retries free, 10 points, **no hints, no timing, no food** | store bonus branch |
| Fallback | **None**: guide approval still checks the key; the well decision says "no unsolved guide override" | store `submit` branch |
| Offline | Queued actions apply in order with receipts (`db.applied`), but the **server stamps them when they arrive**, not when they happened | `action-sync.ts`, `participant-http.ts` (`Date.now()`) |
| Map markers | Numbered by catalogue position (`symbol: String(order)`) | `buildMissionPresentation` |

**Biggest gap:** without a fallback, one unsolved core blocks its mission forever, and Marzipan (the finale) opens only when every other mission is complete.

---

## 1. Reusable challenge structure (unchanged from v1, adjusted)

- A stop has **one core challenge** (required; solve it or use the fallback) and **0–n optional challenges** (skippable, never blocking, open after the core). No stop needs three.
- **Difficulty is a per-challenge attribute** (`easy | medium | hard`), independent of its position. Challenge 2 can be easy.
- Reuse what exists: the core = today's `challenge` (+ `followUps` where a core truly needs steps); optional = today's `bonus`, extended with hints, a reveal and its own timing. Make it a list (`extras`) only when a stop gets a second optional challenge.
- **Every challenge fills its "I'm completely stuck" answer** (owner, 5 Nov 2026): the content the "Here's the answer" pop-up shows is part of creating a challenge, never left for later. A challenge isn't complete without it (`TODO(copy)` until approved).
- **Answer mechanic** is a per-challenge field: `choice` (today), `water` (today), later `match`, `photo`, `voice`, `find` (physical). Each mechanic that uses the camera, microphone or location has an **equivalent no-device path**.

## 2. Voice answers, with a Montefiore pilot concept

### Concept: "Say it like Ohel Moshe" (optional challenge at the Montefiore Gate; drafts)

The gate's Hebrew panel begins **אבני זכרון** (*avnei zikaron*, "stones of remembrance"). This was read from the owner's photo #05 and is still to be checked on site. Players hear a short, verified recording of a native speaker saying it, try it themselves, then learn what it means and why a gate would say it.

- **Hear:** a 2–3 s clip (the owner or a consenting Hebrew speaker, recorded for the app and kept in `public/` as an app asset, with its text and transliteration).
- **Say it together:** the group says it aloud, as a chorus, not one person alone. Optional: **Record** (≤ 10 s) → **Stop** → **Listen back** → **Try again** → **We said it!**
- **Equivalent path, never second-class:** "We said it together" without recording, or match the phrase to its meaning (choice). The same points either way.
- **Reveal:** what *avnei zikaron* means and where the phrase comes from. The phrase "stones of remembrance" echoes Exodus 28:12 (the stones on the high priest's ephod), confirmed by run 08 (Ex. 28:12 and 39:7; the gate's next words quote Ps. 112:6); that the gate means the ephod is an interpretation.
- **Tone:** celebrate trying ("Jerusalem has heard every accent there is", TODO(copy)); never score, rate or compare voices. Playful framings: "Grandparents first?" or "Say it like a market seller" (TODO(copy)).

**Screen states** (with `dori-ux-designer`):
1. **Idle:**
   - **Hear it** (`audioOn` icon), which can be replayed without limit, beside the word and its transliteration.
   - Two equal choices: **Record yourself** (`microphone`) or **Say it out loud together**.
2. **Before the permission prompt** (only after tapping Record): a short card, "Your recording stays on this phone. Nobody else hears it unless you play it." Then the browser's own prompt. Never ask on page load.
3. **Recording:**
   - A large stop button with a static "Recording" label and a text status in a live region.
   - No waveform and no visible timer; a silent cap of about 10 s.
   - No pulsing under reduced motion.
4. **Recorded:** Play back, Try again (unlimited), **We're happy with it**.
5. **Done:** the usual completion, with a warm line about the word, never about how it was said. Teammates' phones see only "done", never the audio.

- **Denied or unsupported:** "No problem, say it out loud together instead", with no error styling.
- **Offline:** preload the reference clip when the mission opens. If it's missing, show the transliteration and "Ask someone nearby to say it". The completion is queued as usual.

### Should the app judge pronunciation?

| Option | Educational value | Problems | Verdict |
|---|---|---|---|
| **Record and play back on the phone only** | High: hearing yourself next to a native speaker is the lesson | Small: permission prompt; older browsers | **Recommended for the pilot** |
| Browser speech recognition (Web Speech API) | Low: it checks words, not pronunciation | Not on every browser; audio goes to Google or Apple servers; unreliable for short Hebrew phrases and accents; needs a network connection | No |
| AI pronunciation scoring (a cloud service) | Doubtful: accent scores aren't fair or reliable for learners and children, and they turn play into a test | Per-call cost, voice data sent to a third party, consent from parents for children, not available offline | No; revisit only with evidence |

Completion is the team's own "We said it!", which the server scores like any self-confirmed step. No audio is judged.

### Technical, privacy and consent dependencies

- **Browser:** `getUserMedia` + `MediaRecorder` work over HTTPS in current Safari on iOS (it records `audio/mp4`) and in Chrome on Android (`webm/opus`). Ask only on the first tap of Record, never on page load. Denied or unsupported → the equivalent path appears; nothing breaks.
- **Limits:** about 10 s, mono; about 100–200 KB in memory; discarded when the challenge closes.
- **Privacy:** a voice is personal data, and players include children. Pilot rule: **never upload, never store, never send to an API**, so no retention, no cost, no consent records, and it works offline. Storing or sharing recordings (e.g. a family memory book) is a separate decision with explicit opt-in, parental consent for minors, a retention limit and deletion. This fits the existing rule that the family-memory recording is opt-in and never published automatically.
- **Offline:** recording and playback work offline. Only the "We said it!" action syncs, through the normal queue.
- **The native-speaker clip:** needs a recording and the speaker's consent. Confirm audio may go in `public/` (the git rules cover photos and images; app assets in `public/` are allowed).

## 3. Silent timing: navigation and challenge

Nothing is ever shown as a running clock or countdown, and nothing is penalised automatically. The I5 well pilot keeps its approved fixed points.

### Challenge time
- **Starts** when the server accepts Start Challenge (today's `startedAt`).
- **Ends** on success or on "I'm completely stuck" (new `endedAt` and `outcome: solved | revealed`; today's `solvedAt` stays for the well).
- **Optional challenges** get their own record, with the same fields.
- Every phone reads the same server record, so all devices agree.

### Navigation time (new)
- **Starts** with a new `set-out` action ("Let's go here", sent when the team chooses a destination; the Navigator or the guide, or anyone if the team has no Navigator). The first accepted one starts it.
- **Ends** at the first of: an accepted GPS arrival, the guide's confirmation, the team's own "We're here" (new, for self-guided teams with poor GPS), or the challenge's accepted Start (inferred arrival).
- **Switching destination** closes the current segment as `left`. Coming back opens a new segment; the navigation time is the sum of its segments. Leaving the map, closing the app or a bad GPS fix changes nothing (the server's clock doesn't depend on the screen).
- **Revisits** after arrival are not navigation and aren't timed.

### Elapsed vs active time
- **Elapsed** = server end − server start (minus guide pauses, when a guide is present). This is what we can store safely now.
- **Active engagement** (time actually spent on the task, without coffee or bathroom breaks) needs an append-only, timestamped event log and idle-gap rules. Not in the pilot; record only enough to add it later (a count of actions and the first and last action times per challenge).

### Offline safety
- Store only **server timestamps**. A phone may send how long an action waited in its queue (`queuedMs`, never trusted for scoring).
- If a start or end action waited longer than a set threshold (e.g. 30 s), mark that duration **`uncertain`**: it's kept for the record but left out of analytics and any future scoring experiment.
- Receipts (`db.applied`) already stop a replayed action from restarting or re-ending a clock.

### What timing is for
1. **Analytics and balancing** (pilot): which hints people use, which stops take too long, where routes get lost.
2. **Optional summaries** (later, owner decision): an end-of-day "your journey" card, never a ranking during play.
3. **Scoring experiments** (only with explicit approval, never default).

## 4. Hints: per-challenge counts and pricing

### Count guidelines (editorial, not rules)
- Easy ≈ 1–2, medium ≈ 2–3, hard ≈ 3–4; more only for a truly complex challenge. **Two hints plus the fallback** is the starting pattern.
- Each hint gives a little more help and still leaves something to discover. Every challenge has a final fallback, even one with no hints.
- **Mural core** (easy): today's 3 hints are the tour's open questions, and they don't get more helpful in sequence. Suggest 2 (H1 the ground-floor shop and the awning; H2 "One real thing helps the building breathe"), drafts.
- **Mural optional, the lion riddle** (medium, two steps): 2 hints for the find step, 1 for the letter step, plus a reveal for each. This shows counts differing by challenge.

### Pricing rules (owner directions)
- A hint lowers the **potential** points of the current challenge only; points already earned are never touched. Navigation points are separate.
- **Teams start at 0**; no starting points as protection. The fallback gives 0 challenge points and still lets the team progress.
- Hint use is recorded once per team on the server, so two phones tapping at the same time reveal one hint.

### Scoring models for owner comparison (no values locked)

| Model | How it works | Fair across different hint counts? | Simplicity | Notes |
|---|---|---|---|---|
| **A. Flat step** | Each hint takes the same share of the challenge's maximum (e.g. 20 %) | No: a 4-hint challenge can lose more than a 2-hint one | Highest | What players most easily understand |
| **B. Capped budget, rising cost** (recommended) | All of a challenge's hints together can take at most a set share of its maximum (e.g. 40 %). Later hints cost more (weights 1 : 2 : 3), and a correct solve always earns at least the remaining floor | **Yes**: using every hint costs the same share whatever the count | Medium | Hints feel like help; the floor is a real reward for solving, not starting points |
| **C. By difficulty** | Hard challenges' hints cost a smaller share than easy ones' | Partly | Medium | Rewards trying hard things; more to explain |

- **Minimum reward for solving:** recommended (model B's floor), so a team that solves with every hint still clearly beats a team that reveals (0).
- **Optional challenges worth more than the core** (owner direction): balanced by (1) food tokens only for the core, so the shorter route loses no food; (2) points compared only at the end, as approved; and (3) a cap on how much more an optional challenge can be worth (e.g. ≤ 2 × the core), to be set with the values.
- ~~Sensitive stops~~ **Rabbi Levin and Chesed VeRachamim are normal stops (owner, D4, 2 Nov 2026).**
- **Implementation fit:** model B maps onto the existing `hintPenalties` list (one entry per hint, computed from the budget) and `minimumPoints`, so `calculateWaterReward` needs no new logic. Setting `timed: false` removes the speed bands.

## 5. Hint sheet (mobile)

With `dori-ux-designer`'s recommendations (2 Nov 2026). All copy is TODO(copy).

- **Reuse `PreviewBottomSheet`.** It is a native modal `<dialog>`: Escape, a backdrop tap, a swipe down and the phone's Back button (through `sheet-history`) close it, and focus goes back to whatever opened it. Two small changes:
  - a sticky footer, so the confirm button stays visible;
  - a swipe-to-close that starts only on the handle, so scrolling never closes the sheet.
- **Trigger:**
  - The existing `hint` icon with a number badge, in a 3rem hit area, shown only after Start (UX-3).
  - Screen-reader label: "Hints, 2 of 3 left" / "Hints, all used".
- **"I'm completely stuck":** a separate, quiet text button at the foot of the challenge, away from the hint icon so it isn't tapped by mistake. It also appears in the sheet once every hint is used.
- **Inside the sheet:**
  - The revealed hints, numbered, in the existing `.hintList` style.
  - The next hint, locked, with its cost said as a lower potential ("Hint 3 lowers this challenge's points from 30 to 20"), never as "−10".
  - One button, "Show hint 3". The cost is visible, so pressing it *is* the confirmation; there's no second "Are you sure?".
- **Sync:**
  - The hint text appears only once the server accepts it (a busy state until then). The new hint goes into an `aria-live="polite"` region, focus moves to its heading, and the sheet stays open.
  - On teammates' phones no sheet opens. The badge count drops, one quiet line says who opened it (with their avatar), and the potential points update with no animation.
- **Offline (correction to the designer's note):** queue the hint request like any other action. The server already makes it idempotent (`hint` must equal used + 1; a replay of the same number does nothing), so it's never charged twice. The text shows once the server accepts it ("Your hint will appear when you're back online"). This keeps the rule that every shared action survives a dropped connection.
- **Stuck confirmation** (a second sheet or a step in the same one):
  - "Show the answer?"
  - "You'll see the answer and can carry on. This challenge will give 0 points." plus the food-token line per D3.
  - Two equal 3rem buttons; **"Keep trying" gets first focus**.
  - Who can press it: the Submitter, or anyone while that seat is empty (the I4 vacant-seat fallback), or the guide (D5).
- **Sensitive stops (O23):** "Hint 2 of 2" with no cost line and no points anywhere.
- **Language help** (Language Explorer) is never a costed hint.
- **Keyboard order:** close, the revealed hints, the next-hint button, then stuck. Hebrew uses `.rtl` on the sheet body and logical properties.

## 6. Challenge labels and what previews reveal

With `dori-ux-designer`'s recommendations. All copy is TODO(copy).

| Option | Verdict |
|---|---|
| "Challenge 1 / 2 / 3" | Clear but flat; suggests a fixed order and difficulty ladder |
| A teaser title only | Intriguing, but players can't tell which one is required |
| **A teaser + "Main / Optional" + a difficulty word with 1–3 filled dots** | **Recommended.** "Main · Easy", "Optional · Tricky"; the word is always there, never colour alone |

- **"The Lion on the Wall" gives too much away**: finding the lion *is* the puzzle. Alternatives:
  - "Who Guards the Arch?"
  - "A Name Carved in Stone" (points to the payoff, not the object; recommended)
  - "Look Up, Then Look Closer"
  - "Painted, or Carved?" (echoes the mural's real-or-painted line)

  "Arch" and "Look up" say where to look, not what to find; the owner decides if that's acceptable.
- **The map preview:**
  - Shows one row per challenge (teaser, Main/Optional, difficulty), the stop's food tokens, and "Skip anytime" on optional challenges.
  - Shows no questions, no answer-revealing images and no hint counts.
- **Points in previews (owner direction, 2 Nov 2026):** previews show the number of challenges, each one's difficulty and its potential points. This **supersedes** the 24 Oct rule "Before play, screens show only the food tokens a mission gives, never a points promise" (restated in UX-4); record it in `product-decisions.md`. Show the points as "up to N", never as a promise. Sensitive stops (O23) show none.
- Your suggestion **"A Hidden Symbol"** fits as well: it says nothing about lions, Judah or the arch. Recommended, together with "A Name Carved in Stone".
- **Non-numbered map markers** become an option (today they show the catalogue number); numbered challenges inside a stop give the order met, never difficulty.

## 7. Mural pilot content (from v1, unchanged unless noted)

- **Core: "Is It Real or Is It Painted?"** Keep it: accessible, physical and field-checked. Make it untimed, use 2 hints, and fill the empty reveal from research run 07: the building's real blinds and railings were repainted to suit the mural, and the IEC got painted workers as a thank-you for its wall.
- **Optional: the lion riddle.** Step 1 finds the lion on the keystone above the painted fish shop's arch (run 07 S1 states it; a field check is needed). Step 2 changes יהודה (*Yehuda*) into יהודי (*Yehudi*), using a word on a real sign nearby. **The reveal, kept simple (owner, 3 Nov 2026), four points only:** the word *Jew* (*Yehudi*) points back to Judah; the lion was the symbol of the biblical tribe of Judah (Gen. 49:9); it is also the emblem of the Jerusalem municipality, since 1949 (run 08 S6); the artists took the lion from the one on the Lions' Gate (run 07 S1). Left out of the reveal: *Yehud*, *Ioudaios* and the other forms, Mordecai, Baybars' leopards and the market's name. Dan is never an option (Deut. 33:22), and never a claim about anyone's ancestry. **Gate:** research run 08 (done 3 Nov 2026: [run 08](../../research/results/shuk-places/08_lion_riddle_and_avnei_zikaron.md)) and the field check, before any build.
- **Rework direction (owner, 3 Nov 2026):** look first (a short "Phones down, look up", no countdown, then the list), the aha of why CitéCréation paints (run 09), working together over screen time, the reveal from run 07, research before decisions, rewards that follow difficulty. See `product-decisions.md`.
- **No third mural challenge** (the real-people angle is blocked by the people rule; the IEC story belongs in the core reveal; the antenna-phone dating repeats the core's observation).
- **Variety across stops:** the lion's letter step and the parked Montefiore letter shuffle are the same mechanic, so keep only one. Montefiore's voice challenge adds a new mechanic to the journey (hear and say).

## 8. Player flow

Map → preview → **Let's go here** (`set-out`) → find the place ("Check our location" or "We're here") → story → **Start** → core.
- Solved → "Challenge completed!" → Behind the answer.
- Stuck → confirmation → the answer + Behind the answer.

Then two actions, the next challenge's teaser title and "Continue to the next stop". No difficulty menu. Optional challenges can be resumed later from the stop's preview; once done or revealed, they're never re-scored.

**"Leave the game?" (owner, 5 Nov 2026; approved for the plan, not built).** The live test found that Back on the game's first screen takes players out of the game with no warning. Browsers allow no custom text on their own leave prompt, and phones often skip it on Back, so the game catches Back on its first screen itself and shows its own pop-up:
- "Leave the game?" with **Stay** (focused first) and **Leave**, both 3rem targets (`TODO(copy)` for the body line and the labels).
- **Stay** keeps the player where they were; **Leave** goes back out of the game. Progress is safe either way: it is on the server, and the sign-in stays on the device.
- Only Back from the first in-game screen triggers it; Back between the game's own screens is unchanged. A reload or closing the tab is not intercepted.

## 8a. Reward celebrations (owner direction, 2 Nov 2026)

**Approved direction:**
- Every meaningful points or food-token award gets one compact, dismissible pop-up, with an obvious Continue.
- No stacking; no repeats after reconnecting; it never interrupts reading.
- An optional, mutable short sound; reduced motion respected.
- Server-authoritative and exactly once.
- One interaction pattern across the platform, styled per adventure.
- Hints use a related but distinct confirmation showing the cost.

**What exists to reuse:**
- `components/amazing-shuk/dev/PreviewMissionCheer.tsx` + `.module.scss`: the Za'atar card, the pop-in check badge (`badgePop`), the entrance (`cheerIn`), reduced-motion and forced-colours overrides, and the rotating cheers and quiet line for Rabbi Levin in `lib/amazing-shuk/mission-cheer.ts`.
- The completion details (points, food tokens, hints used) in `PreviewChoiceTask.tsx` and `PreviewWaterTask.tsx`.
- The modal shell: `PreviewBottomSheet` (`<dialog>`, focus return, Back button through `sheet-history`).
- The motion tokens `--dur-base`, `--dur-slow` and `--ease-out`.
- **No sound exists anywhere in the app.** It needs a new short asset (≤ 1 s, CC0 or commissioned, in `public/`).

Today the cheer is an inline card that shows whenever a mission reads as complete. That is why it never repeats wrongly, and it should stay as the permanent record under the pop-up.

**Recommended pattern: one `RewardDialog` with three weights** (all copy TODO(copy), except the owner's own line):

| Event | Weight | What shows |
|---|---|---|
| Core or optional challenge solved | **Full** | Badge pop, the cheer, "+N points", "+N food tokens" (core only), short sound, Continue |
| Navigation accepted | **Light** | Smaller dialog: the owner's line "Amazing navigation! You rock!" + "+20 points", a softer sound or none, Continue |
| A follow-up step accepted (Marzipan) | **Toast** | A non-modal line ("On to the next question"), no sound; the full pop-up comes at the end |
| "I'm completely stuck" reveal | **Quiet** | "Here's the answer. You can carry on." + food tokens if D3 says so; no sound, no badge, never "Well done" |
| Sensitive stops (O23) | **Quiet** | The quiet line, no points fanfare, no sound |

- **Exactly once per device:** the server's award is the only trigger. A phone shows the pop-up only when (a) a fresh server view contains an award its previous view didn't, (b) the award key (`missionId:part:awardedAt`) isn't in this device's "seen" list (`localStorage`, wrapped in try/catch), and (c) the award is recent (e.g. ≤ 5 min). An old award found after reconnecting shows only the inline card. No server change is needed: `awardedAt` and `arrival.acceptedAt` already exist.
- **One at a time:** if two awards land together (arrival and a solve), show the bigger one with both amounts, never two dialogs.
- **Not interrupting reading:**
  - The phone that caused the award shows it at once (the player just acted).
  - Teammates' phones show it only if they're on that challenge; elsewhere, a small toast ("Your team earned 100 points at the Mural").
- **Sound:**
  - It plays only after a user gesture (iOS needs one; the Start tap unlocks it).
  - A mute toggle in the participant menu, remembered per device. Default: D11.
  - It's never the only signal; it's off under reduced motion only if the owner wants (sound isn't motion).
- **Accessibility:** focus goes to the dialog's heading, the amounts are read as text, there's no count-up under reduced motion, the 3rem Continue button gets focus last, and Escape and Back close it.
- **The hint confirmation:** the same dialog shell with neutral styling, no sound and no badge: it shows the cost as a lower potential score and has "Show hint N" / "Not now" (the hint sheet of §5 *is* this confirmation).
- **Platform reuse:** the dialog logic and the "seen" rule belong to a shared component; colours and the badge come from each adventure's tokens. The Memory Protocol keeps its own look (`PreviewPuzzleReveal`'s `stamp`), so no content is shared between the games.

## 8b. Solo play (owner direction: a first-class mode)

**Approved direction:** a solo player navigates, holds every permission they need, completes every required challenge, uses hints and the fallback, and finishes the adventure without a guide or other players. They get the same core learning, with no role switching or team administration.

**Gaps today:**

| # | Gap | Where | Proposed solo path |
|---|---|---|---|
| S1 | A lone player is a **follower** until they claim both roles, and followers can't Start or submit | `roles.ts` (`roleForParticipant`), store `start`/`submit` checks | **A team of one holds both roles implicitly** (computed on the server, never stored), so there's no claiming. This is the same rule I4's vacant-seat fallback needs |
| S2 | **Navigation points need GPS or a guide**; Gan HaTut's GPS point is unverified, so it fails closed | `mission-arrival.ts`, store `arrival` | The team's own "We're here" (D6); verify the remaining coordinates |
| S3 | **Guide-only actions**: arrival confirmation, timing pause/reset, guide approval | store | None needed solo: "stuck" replaces guide approval, timing doesn't score |
| S4 | **Group copy everywhere**: "Choose someone from your group to read this story aloud"; cheers "What a team!", "all of you", "High fives all round" | each `*-task.ts` `instruction`, `mission-cheer.ts` | A solo variant per line (e.g. "Read the story, then take on the challenge"), chosen by team size; TODO(copy) |
| S5 | **The well's parts** (I5 Spotter/Reader) | multiplayer plan | **Show all parts** is already planned and works solo; make it the default for a team of one |
| S6 | **Voice "say it together"** | §2 | "Say it out loud" with the same points |
| S7 | **The Group tab and join link** shown to a team of one | `IndexGroupSheet` | Collapse to "Playing solo · Invite someone" (optional) |
| S8 | **Starting**: a host invitation → lobby → count 1 → Start works today (I2); there's no self-serve sign-up | lobby | Fine for the pilot; self-serve is a separate decision |
| S9 | **Group dynamics in the treatments** (one searches high, another reads Hebrew) | §4, §7 | Each challenge must be completable by one person; group roles are an enrichment, never a requirement. Add this as a check in `/experience-design` reviews |

## 8c. Personal achievements, and rankings later

**Approved direction (first priority):** personal statistics: points, challenges solved, personal bests where truly comparable, completion highlights. **Future only:** verified rankings or percentiles once a large comparable dataset exists, in fair categories. Never invent counts, ranks or achievements. No leaderboard, analytics back end or new personal data now.

**Recommendation, phase 1 (derived only from what the team's state already holds):**
- **The end-of-adventure summary** ("Your Amazing Shuk"): points, food tokens, challenges solved (core and optional), challenges done without hints, stops found, the stop with the most points. TODO(copy).
- **Highlights**, achievements earned only from real records, defined before they can be earned: "Found every stop", "Solved 3 challenges without a hint", "Took on every optional challenge". No vague "Superstar" badges.
- **Times** are shown only as the player's own durations ("You found the Mural in 12 minutes"), never compared, and never if `uncertain` (§3).
- **Personal bests** only across replays of the *same* challenge with the *same* scoring config version and the same assistance (no hints vs hints). Otherwise they aren't comparable, so they aren't shown.

**Future rankings (not now):**
- Rankings only within a category: the same challenge set, the same scoring config version, solo or team, unassisted or assisted (hints or reveal).
- Show a rank or percentile only above a minimum sample (e.g. ≥ 50 comparable completions), stating the sample ("Among 214 solo players since March").
- **Privacy:**
  - Opt-in only.
  - A chosen display name (never the real name the operator stored), anonymous by default.
  - No children under the age threshold without parental consent.
  - A retention limit and deletion on request; opting out removes the entry.
- **Needs first:** storing results beyond one adventure. Today `startNewAdventure` clears progress, so there's no history. That's a new data store and a privacy review, and a separate approval.

## 8d. Market Surprise (owner direction, 2 Nov 2026)

No earlier "luck mechanics" plan exists in the repo or in the saved plans, so this section starts from the 2 Nov brief. `dori-ux-designer` wasn't consulted for it; the offer and dialog UX reuses its earlier pop-up and sheet notes (§5, §8a). Experience-design was applied at medium depth, with existing references and no web research.

Each item below is marked as one of three kinds:
- **[Owner]**: the owner's direction.
- **[Rec]**: my recommendation.
- **[Value]**: a proposed number, pending approval.

### Categories (one architecture, many types)
- **[Owner]** Market Surprise is the umbrella; dice are one event among others. The four types: **Chance** (a die: double the eligible points or lose 25 %), **Skill** (a vendor's Hebrew phrase: learn it, say it, recording optional), **Discovery** (an extra short physical or learning challenge for bonus points), **Mishap** (a playful, fictional setback with its risk disclosed, and maybe a recovery task).
- **[Rec]** Every event is data, not code: `{ type, eligibility, stake: none | pool, body: challenge | chance-table | mishap-story, reward }`.
  - A Skill or Discovery event's body is an ordinary challenge (any mechanic, its own hints and reveal), so it reuses §1–§4.
  - Chance and Mishap carry an **outcome table** the server draws from.
  - A new type needs only new content plus, at most, a new mechanic, never a new flow.
- **[Rec]** A mishap is an invented game device (label **Fiction** in data; Shuk rules allow Fiction only for invented devices), always playful ("A pigeon stole your map!", TODO(copy)), never about real vendors, real people or real hardship.

### When events appear
*For the pilot this table is superseded by D15 (offer distribution, below): no random appearance, no pull card, no performance trigger.*

| Trigger | Self-guided? | Verdict |
|---|---|---|
| 1. After completing a challenge, occasionally | Yes | **[Rec] Yes, but as a fixed quota, not pure luck:** at adventure start the server chooses which eligible stops will carry an offer for each team, so every team, solo player and route gets the same number |
| 2. "Spare time" | Yes | **[Rec] Pull, not push:** after a team has finished everything at a stop, a quiet "Got time for a Market Surprise?" card appears in the stop's completion area. The team decides it has time. Elapsed time alone never triggers anything (speed isn't boredom) |
| 3. From the future Guide dashboard | Guide only | **[Rec] Yes:** the guide sends an offer to a team through the same event record; it counts against the same quota |

**Eligibility [Rec]:**
- Ordinary market stops only: never Rabbi Levin, Chesed VeRachamim, the hostage remembrance exhibit, or any stop marked sensitive.
- The stop's core challenge is done; the team isn't mid-story or mid-challenge.
- No other offer is open; none has appeared at this stop.
- The team's quota isn't used up.
- **[Value]** 2 offers per team per adventure; 1 per stop. Unused quota is offered once before the finale ("One last surprise before Marzipan?").

### Player choice and risk
- **[Owner]** Optional: accept, decline, or carry on.
  - Any risk is disclosed before committing: the exact eligible pool and every possible outcome.
  - Completed challenges, navigation achievements and food tokens are never touched.
  - A loss never blocks progress; nothing is deducted because an offer appeared.
- **[Rec] The eligible pool** = the challenge points earned *at this stop* (core + optional), fixed when the offer opens and shown as a number ("Your 140 points here"). Navigation points and food tokens are outside the pool.
- **[Rec] Conflict to note:** the losing outcome goes against the 1 Nov rule "do not deduct points already earned". The owner's new direction allows it only for a **voluntary** risk the team accepts knowingly. Record it as a narrow exception.

### Vendor's Call (Offer B, owner direction D17, 2 Nov 2026)
**[Owner]**
- Players **listen for an authentic market call** on the spot. If none can be heard, they use a **verified example** in the app.
- They try to understand what it means, then **repeat it**.
- Players may use their **phone's own voice recorder** as a personal learning aid. That's a suggestion, not part of the app.
- **DORI never records, collects, uploads or keeps vendor audio.** Recording is never needed to complete the pilot.
- Never tell players to interrupt vendors or ask them to perform. Encourage asking consent before deliberately recording another person.
- Completion earns **fixed participation points**. No AI judging, no accent-based scoring.

**[Rec]**
- **Journey:**
  1. "Listen: can you hear a vendor calling out?"
  2. "What do you think it means?" (the team guesses aloud).
  3. The meaning and its story (from the verified example's data).
  4. "Say it yourselves."
  5. **We did it** → the `RewardDialog`.

  If nothing is audible, step 1 becomes "Hear an example" (the in-app clip, with its text and transliteration).
- **The verified example** is still needed as the fallback: one call, chosen and recorded by the owner (or a consenting speaker), with its meaning sourced (e.g. the Academy of the Hebrew Language, a published slang dictionary). It is the only audio DORI ships.
- **Fallback:** "Show me the meaning", then "We did it". Points are the same for every path.
- **Copy:** "Using your phone's recorder is a great way to practise. Please ask before recording anyone" (TODO(copy)). No in-app recorder is needed for this offer, which keeps the pilot free of microphone permissions.
- **[Value]** fixed participation points: to be set with the scoring model (D1); proposed 30, not at risk.

### Market Jury (future experimental mechanic, not in the pilot)
**[Owner]**
- An optional meeting between **two consenting teams**: one performs a learned phrase, the other tries to understand its meaning and gives friendly feedback.
- It's educational, not a pronunciation contest. Peer ratings never affect progress or main challenge rewards.
- No compulsory sharing of audio or personal details; it never depends on another team being present; solo play stays fully supported.
- Small fixed participation rewards may be explored; **no point values approved**.

**[Rec] Open design questions for later:**
- **How two teams find each other:** an in-app "Another team is nearby; want to meet?" means sharing locations between teams (privacy). A guide or host introduction is simpler.
- **Consent:** both teams opt in on their own phones.
- **The listener team** answers "What does it mean?" (a choice), so the learning, not the accent, is what's checked.
- **Feedback** is from a fixed set of friendly reactions only (no free text, no star ratings).
- **Solo equivalent:** "Teach it to someone in your group or a friend later", or the solo player plays the listener against the in-app example.
- **Dependencies:** I7a (multiple teams). Separate approval before any design work.

### Dice: "Feeling Lucky" (owner-approved pilot configuration, 2 Nov 2026)
**[Owner]** This is pilot configuration only, not a platform-wide default. Nothing is built until its gameplay phase is approved.

| Roll | Outcome | Probability |
|---|---|---|
| 1–2 | **Double** the eligible points (+100 % of the stake) | 1/3 |
| 3–4 | **Lose 25 %** of the eligible points | 1/3 |
| 5–6 | **Keep** the eligible points (no change) | 1/3 |

- **Stake:** the challenge points earned at the selected stop, **at most 200**. Navigation points, food tokens and completed achievements are never at stake.
- **Caps:** gain at most **+200**, loss at most **−50**. Both follow from the 200 stake (2 × 200 − 200 = +200; 25 % × 200 = 50), so the caps only bind if the stake rule changes.
- **Expected value:** (1/3)(+100 %) + (1/3)(−25 %) + (1/3)(0) = **+25 % of the stake**: +50 points on a 200 stake, +25 on 100.
- **Spread:** on a 200 stake the outcomes are +200, −50 or 0. One roll can move a team by up to 250 points against another team that rolled differently; that's accepted for the pilot (D16).
- **Limits:**
  - one roll per team per adventure, at one ordinary market stop;
  - optional, with clear risk disclosure before confirming;
  - no re-roll, including after a refresh or reconnect.
- **[Owner D13]** A loss **may reduce the stop's earned points**, but the team must be told plainly beforehand. The disclosure names the stake and all three outcomes in numbers ("Your 140 points here: 1–2 → 280 · 3–4 → 105 · 5–6 → 140", TODO(copy)), and the result screen says what changed. This is a narrow exception to "never deduct earned points", for a risk the team chose.
- **[Rec]** The server rolls once (crypto random) inside the store's lock and records the stake, roll, outcome and delta. A replayed accept returns the recorded result. The dice animation only presents the server's roll (static under reduced motion).

### Mishap (example, Fiction)
- "A pigeon stole your map!" **[Rec]**: the risk is "−10 % of the pool unless you complete a recovery task" (a quick find: "spot three spice colours"). Disclose it before accepting, and keep it fully optional: declining costs nothing.

### Scoring and fairness [Rec]
| Event | Effort | Proposed reward | Fair? |
|---|---|---|---|
| Chance (a quick random result) | Seconds | The table above, capped | Pure luck: keep it out of rankings |
| Skill (Vendor's Call) | 3–5 min | **[Value]** 30, no risk | Effort-based |
| Discovery (a short challenge) | 5 min | **[Value]** 30–60 with the hint ladder | Effort-based |
| Recovery after a voluntary risk | 2–3 min | Cancels the loss only, no extra gain | Neutral |

- **[Owner D16] No separate score component:** Market Surprise points count in the team's normal total. The event record still stores each delta, so a future summary or ranking can show or explain it. Consequence, noted: with one dice roll per team, luck can move a final total by up to 250 points (+200 / −50); rankings that want to exclude luck would need a later decision.
- **Records:** every offer and its outcome is stored immutably (offer, accept or decline, the roll, the delta, the time), exactly once.
- **No real money**, no purchases, no paid re-rolls.

### Offer distribution (owner-approved pilot configuration, 2 Nov 2026)
**[Owner D15]** Offers are preallocated and controlled, never purely random and never performance-triggered.
- **At most 2 offers per team per adventure:**
  - **Offer A:** one optional "Feeling Lucky" dice roll (the only risky event; at most 1 per team).
  - **Offer B:** one optional educational or skill mini-challenge (e.g. the Vendor's Call).
- Eligible stops come from an **explicitly configured, approved pool** of ordinary market stops: never sacred or sensitive (Rabbi Levin, Chesed VeRachamim, the hostage remembrance exhibit).
- **No reliance on numbered stop order.** Offers are assigned fairly across teams whatever their route.
- The specific surprise stays **hidden until offered**. Declining is allowed and never blocks anything.
- **Being faster earns no extra opportunities.** The "spare time" pull card and every elapsed-time trigger are **dropped for the pilot**.

**[Rec] Assignment rule (order-free, so it suits open exploration):**
1. When a team completes the core challenge at its **first** pool stop, the server offers **A** there.
2. At the **next, different** pool stop the team completes, it offers **B**.
3. **Reassignment:** an offer is never tied to one fixed stop, so a skipped stop loses nothing. If the team reaches its last unvisited pool stop with an offer still unmade, both remaining offers appear there, one after the other. If the finale completes with an offer unmade, it is offered once on the finale's completion screen.
4. Each assignment is recorded in the store's lock when the core completes, exactly once; a declined offer is spent and never repeats.

- **Pilot pool [Value, owner to confirm]:** the **Market Mural** and **Marzipan**, the two stops inside the market; all others are excluded. If Marzipan (the finale) shouldn't carry an offer, the pilot gives both offers at the mural, one after the other.
- **Solo players:** the same quota and rule; they decide alone.
- **Teams:** the same quota per team. The Submitter accepts (or anyone while that seat is empty); the others see "[name] is rolling…" and the result.
- **Open exploration:** the "first pool stop completed" rule works in any order.
- **Pacing:** at most one open offer at a time; none during a story or a challenge.
- **Flow:** a compact offer card → the mini-challenge or the roll → the established `RewardDialog` (§8a): Quiet for a loss, Light for a gain, Full for a completed Skill.

### UX: accept, decline, complete [Rec, copy TODO]
- **The offer card** (inline in the stop's completion area, not a modal, so it never interrupts reading):
  - "Market Surprise!";
  - one line about the event;
  - for a risk event, the pool and the full outcome table in plain words ("1: lose 35 of your 140 · 2–5: win 35 · 6: win 100");
  - two equal 3rem buttons: **Take the chance** / **Not now**. "Not now" is never styled as a failure.
- **Accept:** a short dice roll (no sound when muted; static under reduced motion) → the result in words and a number → the `RewardDialog`.
- **Solo:** the same; a team of one decides alone. Teams: the Submitter (or anyone while that seat is empty) accepts; everyone else sees "[name] is rolling…" and the result.

### Self-guided vs Guide
- **[Owner]** Self-guided play gets triggers 1 and 2 without a guide; the guide is optional.
- **[Rec]** The guide dashboard (future) can send an offer, pause offers for a team (e.g. a tired group), and see outcomes. It never applies a loss for the team.

### Technical implications [Rec]
- **Storage:** per team, a `surprises` record: `{ quota, plannedStops, offers: { [offerId]: { type, missionId, trigger, poolSnapshot, status: offered | accepted | declined | done, outcome, delta, at } } }`. This is a schema addition, so it needs its own approval and load validation.
- **Actions:** `surprise-accept`, `surprise-decline`, `surprise-complete` (Skill and Discovery reuse the challenge actions), `surprise-request` (the pull) and `surprise-offer` (guide). All have receipts. The roll happens once inside the store's lock, so a replayed accept returns the same outcome.
- **Balance:** `balanceOf` adds `surpriseDelta` with a floor of 0 on the total.
- **Timing:** silent, per event, as in §3.
- **Content:** the event tables and the Vendor's Call live in data. The voice parts reuse §2: on-device only, no upload, works offline.
- **Fairness of randomness:** server only. The client never decides, and the roll can't be retried by reloading.

### Pilot
- **[Owner]** One ordinary market stop for the dice; the Balanced table and caps above; one roll per team; no guide needed. Not built until its gameplay phase is approved.
- **[Rec]** Offer A (dice) and Offer B (the Vendor's Call) by the assignment rule over the pool {Mural, Marzipan}; no guide trigger, no rankings, no Market Jury.
- **Order:** after solo support, progressive challenges, and the hint and reward pop-ups. It depends on all three (the challenge actions, `RewardDialog`, a team of one acting alone).

## 9. Conflicts with the current implementation

1. **Every mission scores by speed** (`WELL_REWARDS` bands), against "no automatic speed penalties". The fix: `timed: false` and per-challenge configs.
2. **One penalty list for all missions** (`[10, 15, 20]`). A challenge with 4 hints would make scoring throw; costs must be per challenge.
3. **No fallback**, and the "no unsolved guide override" decision (the well).
4. **The bonus has no hints, timing or reveal**, and is worth a flat 10.
5. **No navigation start event**; navigation points need GPS or a guide, which doesn't suit self-guided play with poor GPS.
6. **Guide-only timing controls** (pause, reset, exclude) assume a guide; without one, elapsed time includes breaks. That's acceptable only because timing doesn't score.
7. **Offline actions are timed on arrival.** They need `queuedMs` and the `uncertain` flag.
8. **The "no points promise before play" rule** vs showing potential points in previews.
9. **Numbered map markers** vs the non-numbered option.
10. **Followed-up questions share one hint count** (Marzipan), which is fine for scoring but not for a per-step sheet showing "2 left".
11. **The store file is shared with the paused multiplayer work.** Changes stay in the mission branch only.
12. **The cheer is inline and has no sound**; there's no sound asset or mute setting.
13. **A solo player starts as a follower** and must claim roles before Start or submit.
14. **Group-only copy** in every story instruction and in the cheers.
15. **No history across adventures**: a new adventure clears progress, so personal bests and rankings have nothing to compare.

## 10. Smallest practical implementation sequence (after approval, each step separately approved)

0. **Solo first (smallest sensible phase):** a team of one holds both roles implicitly (S1), "Show all" by default (S5), and the solo copy variants (S4, once the copy is approved). No schema change; it unblocks solo play today.
1. **Data only:** per-challenge reward configs (model B values), `timed: false`, mural hints → 2. No schema change.
2. **`reveal` action** (core and optional) + optional hints and points ladder; optional new fields `outcome` and `endedAt`; idempotent through the existing immutable award and receipts.
3. **Hint sheet, stuck confirmation and `RewardDialog`** (three weights, the device "seen" rule, mute; the sound asset once chosen). Client only.
4. **Challenge timing record** (`endedAt`, `queuedMs`, `uncertain`), with an optional challenge's own record.
5. **Navigation timing** (`set-out`, segments, "We're here").
6. **Labels and preview disclosure**, after the points-promise decision.
7. **Mural lion riddle**, after research run 08 and the field check.
8. **Montefiore voice challenge**: on-device record and playback only, with the equivalent path, after the native-speaker clip and the on-site reading of אבני זכרון.
9. **The end-of-adventure summary and highlights**, derived from existing state. Rankings stay future work behind their own data, privacy and consent approval.
10. **Market Surprise pilot at the mural** (§8d), after steps 0–3: one offer, dice or Vendor's Call; its own schema approval.

Each step: `npm test` and `test:shuk` with new cases (reveal exactly once; submit/reveal races; replayed queue actions; who may reveal; the hint budget and floor; the finale unlocking after a reveal; old state files loading; segment sums; `uncertain` marking), lint and type-check in the one-shot container, `/game-verify shuk`, `git diff --check`, the owner's browser review on the dev page and a field walk.

## Implementation roadmap (owner's order, 2 Nov 2026)

This replaces the numbered build sequence above as the order of work. Each phase is planned in detail and approved before it's built, and each ships to dev first (`/memory-protocol/dev/amazing-shuk/water`), then live only with the owner's OK. The mobile-first rules of phase 5 apply inside every phase; phase 5 is the consistency pass at the end.

### Phase 1: solo-first, self-guided play (detailed plan, 2 Nov 2026; awaiting approval to build)
**Status (2 Nov 2026): built and verified in the working tree, not committed** (see the handoff). The anchor keeps its original name.

**Approved (owner, 2 Nov 2026):**
- **D6:** players confirm arrival with "We're here", without GPS or a guide. It's an explicit confirmation; nothing is inferred from a missing or poor GPS reading.
- **D12:** an authenticated team of exactly one automatically has the Navigator and Answer Submitter permissions.
- **Solo wording:** natural, personal language.
- **Group:** simplified to "Playing solo".
- **The well:** all its controls are available to a solo player.

**Goal:** one player, with no guide, can complete every existing challenge with correct answers. (A stuck solo player finishing is phase 2's milestone, with "I'm completely stuck".)

**What the code does today (inspected):**
- A lone member is a `follower` unless they claim roles. `start`, `submit` and the client's permissions all derive from `team.roles` (`participant-store.ts` `sessionView`, `sessionAction`; the client reads `view.session.roles`).
- `confirm-arrival` is guide-only. GPS arrival fails closed at unverified destinations (Gan HaTut).
- The well's `move` has no role check, and submit needs the Submitter. The I5 parts aren't built, so there's no "Show all" to add.
- The saved arrival's `method` (`"gps" | "guide"`) isn't validated on load.

**Design:**
1. **Solo roles, computed, never stored:**
   - A pure `effectiveRoles(memberIds, stored)` in `roles.ts`: exactly one member (the guide never counts) → both roles are that member's; otherwise the stored roles, unchanged.
   - The store uses it everywhere roles decide something: the start/submit checks, `canStart`, and the `session.roles` sent to phones. The view adds `solo: boolean`.
   - Nothing is migrated or written, so multiplayer rules don't change. When a second member actually joins (collects their session), the team uses its stored roles again, and the leader and claim flows apply as today. A pending or approved-but-uncollected request doesn't change anything.
2. **"We're here":**
   - A new action, `self-arrival` (kept separate, so `confirm-arrival` stays guide-only).
   - Allowed for the Navigator (including a solo player) and the guide; followers are refused as today. The vacant-seat fallback stays paused with I4.
   - It records `arrival = { method: "self", acceptedAt: now, points: rewardPoints }` only if there's no arrival yet, so it's exactly once with GPS and guide arrivals, and receipts stop replays.
   - Refused in the lobby. Uses no coordinates, so it works at unverified stops.
   - Load validation gains a check that `method` is one of `gps | guide | self`.
   - **UI:** a "We're here" button (3rem) beside "Check our location" opens a short confirmation ("Are you at [place]?", Yes / Not yet). Success: "You've made it!" (approved).
3. **Solo wording:**
   - The approved lines:
     - the story instruction becomes "Take a moment to discover this story.";
     - "What a team!" becomes "Nicely done!";
     - the group's arrival message becomes "You've made it!";
     - "Team members" becomes "Playing solo";
     - the sheet title "Your group" becomes "Playing solo".
   - A solo variant sits next to each group line in data (e.g. `instructionSolo`, `CHEERS_SOLO`) and is chosen by the server's `solo` flag. Group play keeps today's wording.
4. **Group UI:** for a solo player, the header button and the Group tab show "Playing solo" with their avatar and balance; no role section, no "roles needed" badge. A leader keeps the optional invite entry, so a solo player can still become a team.
5. **The well:** no change; a test confirms a team of one can move, reset and submit.

**Files:**
- `lib/amazing-shuk/roles.ts` (`effectiveRoles`, `isSoloTeam`)
- `lib/amazing-shuk/participant-store.ts` (effective roles, the `solo` flag, the `self-arrival` branch, the arrival method validation)
- `mission-arrival.ts` (the `"self"` method)
- `group-action.ts` and `parse-water-action.ts` (the new action)
- `mission-cheer.ts`
- the six `*-task.ts` files (solo instruction and question variants)
- `water-task-view.ts`, `team-membership.ts`
- the components `PreviewArrivalMission.tsx`, `IndexWaterTask.tsx`, `IndexGroupSheet.tsx`, the Group tab overview and `PreviewMissionCheer.tsx`

**Security and regression tests:**
- **Solo detection is server-only.** A follower in a team of 2–5 still can't start, submit or self-arrive. The guide never counts as a member. Cross-team isolation holds.
- **Membership changes:** a pending or approved-but-uncollected join request leaves solo status alone. The second member collecting a session ends it (stored roles apply). Removing that member makes the team solo again. A start and a join racing inside the lock behave consistently.
- **A solo player gains no guide-only powers** (timing, guide approval, `confirm-arrival`) and no other team's access.
- **`self-arrival`:**
  - recorded once across two phones and a replayed action ID;
  - never re-awarded after a GPS or guide arrival, or the reverse;
  - refused in the lobby and for followers;
  - works at Gan HaTut (unverified);
  - points equal the stop's `rewardPoints`.
- **Loading:** files with `method: "self"` load; an unknown method is refused; old files load unchanged.
- **Regression:** the existing `leader-roles`, `role-choice`, `team-join`, `participant-store`, `mission-arrival` and UI tests pass unchanged. A new integration test: a team of one completes all six missions with correct answers (the well included), and the Marzipan finale unlocks.
- **UI tests:** solo wording appears only for `solo: true`; "Playing solo" replaces the role section; the "We're here" confirmation is reachable by keyboard and screen reader.
- Then lint and type-check in the one-shot container, `/game-verify shuk`, `git diff --check`, and the owner's review on the dev page.

**Accept when:** in dev, a team of one starts the adventure, confirms arrival with "We're here" at every stop (Gan HaTut included), and completes every existing challenge with correct answers, with no role claiming and no guide action. Group play is unchanged.

**Copy still to approve:** solo versions of the lines the approved table doesn't cover. TODO(copy) drafts:
- "Yes! Sharp eyes, all of you!" → "Yes! Sharp eyes!"
- "Amazing work! High fives all round!" → "Amazing work! High five!"
- The mural's "Can your group spot TWO things…" → "Can you spot TWO things…"
- "Submit your group answer." → "Submit your answer."
- "The group's answer is correct. Task complete." → "That's right. Challenge complete."
- The "We're here" confirmation: "Are you at [place]?" / "Yes, I'm here" / "Not yet".

**Out of scope:** the "stuck" fallback and scoring changes (phase 2); verifying GPS coordinates (no longer needed for solo); the I4 vacant-seat fallback (paused); self-serve sign-up.

### Phase 2: progressive challenges, flexible hints, scoring and rewards
- **Goal:** the reusable stop shape, working on the mural.
- **Build:**
  1. per-challenge reward configs (the D1 model, the D2 minimum and cap), `timed: false`, the hint count per challenge;
  2. the `reveal` action ("I'm completely stuck") for the core and optional challenges, with food tokens per D3, permission per D5 and free help at sensitive stops per D4;
  3. optional hints and a points ladder, and the silent challenge timing record (`endedAt`, `outcome`, `queuedMs`, `uncertain`);
  4. the hint sheet (`PreviewBottomSheet`) and the shared `RewardDialog` (three weights, the device "seen" rule, mute and the D11 sound default, and a new sound asset);
  5. the mural pilot: 2 hints, the reveal from run 07, then the lion riddle once research run 08 and the field check pass.
- **Needs:** D1–D5, D11, the mural copy, a licensed sound.
- **Accept when:**
  - Each award is counted exactly once across two phones and a replayed queue.
  - A reveal unlocks the finale.
  - The hint budget and minimum hold for any hint count.
  - Old state files load.
  - No pop-up repeats after reconnecting.

### Phase 2 detailed plan (Claude, 2 Nov 2026; **approved by the owner, 2 Nov 2026**)

Built on D1 (model B), D2 (minimum, optional ≤ 2× core), D3 (core food tokens, also after a reveal), D4 (Rabbi Levin and Chesed VeRachamim are normal stops), D5 (Submitter, anyone while that seat is empty, guide) and D11 (sound off by default). **Planning only; nothing below is built.** Every number is a proposal and every visitor line is `TODO(copy)` unless marked [Owner].

**Milestone (from the Phase 1 decisions):** a solo player can finish every stop even when stuck, and the mural shows the full stop shape: 2 hints with a points ladder, "I'm completely stuck", a reward pop-up.

#### 2a. Scoring engine (pure code, tests; no visible change except the mural's numbers)
- New pure helper in `lib/amazing-shuk/challenge-scoring.ts`: `hintLadder(maxPoints, hintCount, budgetShare)` → the per-hint costs. Budget = `maxPoints × budgetShare`, rounded to 5; weights 1 : 2 : 3 …; each cost rounded to 5, the last absorbing the remainder, so the costs always add up to the budget and never fall. Floor (D2) = `maxPoints − budget`.
  - Example, max 100, budget 40 % (proposed): floor 60. 2 hints: 15, 25. 3 hints: 5, 15, 20. 4 hints: 5, 10, 10, 15.
- A challenge declares `scoring: { model: "budget", maxPoints, budgetShare, foodTokens }`; a helper turns it into the existing `WaterRewardConfig` (`hintPenalties` from the ladder, `minimumPoints` = floor, the speed bands neutral). `calculateWaterReward` is unchanged. Missions without `scoring` keep today's values.
- The mural gets `timed: false`, `scoring` (proposed: max 100, budget 40 %, 2 food tokens) and 2 hints instead of 3.
- A catalogue test enforces D2: every optional challenge's max ≤ 2 × its stop's core max; every challenge's hint count fits its ladder.
- **Other stops:** they keep their current scoring in Phase 2, including Rabbi Levin's untimed, no-hint setup and quiet completion (P2-1).

#### 2b. "I'm completely stuck" (server action, every core challenge except Marzipan)
- New action `{ type: "reveal", missionId, part: "core" }`, idempotent like the others (action receipts; a second reveal or a reveal after the award does nothing).
- Allowed only after Start and before the award. Who (D5): the guide; the Submitter (a solo player holds it, D12); **anyone while the team's Submitter seat is empty**. That seat fallback is new: today only the Submitter may submit, and the I4 vacant-seat fallback isn't built. It applies to reveal only, not to submit (P2-2, default taken).
- Effect: the mission completes with an award of **0 challenge points**, the stop's core **food tokens** (D3), the hints used, and new optional fields `outcome: "revealed"` and `endedAt`. Navigation points are untouched. A completed mission counts towards the Marzipan finale, so a reveal unlocks it.
- Race: submit and reveal go through the same store lock. Whichever lands first writes the immutable award; the other becomes a no-op with a plain message.
- What "the answer" shows:
  - choice challenges: the correct options, from the data that already exists, then "Behind the answer";
  - the well: the move sequence, generated from the puzzle data (labels `TODO(copy)`); the I5 rework later replaces it;
  - Marzipan: **no reveal in Phase 2** (owner, P2-3); its stuck rule is set when Marzipan is reworked.
- **The owner's notes after the live test (5 Nov 2026; not approved for build):**
  - The flow works on the Submitter's phone: the stuck button, the confirmation with its two buttons, then "Show answer" opens the "Here's the answer" pop-up.
  - The Navigator (not the Submitter) doesn't see "I'm completely stuck": check 13 **passed** live.
  - **The button's place and look change** (supersedes "a quiet text button at the foot of the challenge, away from the hint icon" in §5 and §2c): a real button in a strong colour, **together with the hint, just above the challenge title**. The "Keep trying" confirmation still guards against a mis-tap.
  - **Shared picks (decided, owner, 5 Nov 2026; not built):** the live test found that a non-Submitter could change the Submitter's picks (not submit them). Only the Submitter picks; the others see the picks live and read-only. **Later:** a small chat-like section with group members' suggestions.
  - **The hint pop-up's flow (owner's note):** first the hint's implications (its cost); a tap shows the hint; then, still in the pop-up, an option to give the answer with its explanation; then close. Hint counts sync to every device (passed live: 3 → 2 on both).
  - **The well (found live):** the Submitter's moves reach the other players, but a non-Submitter's moves don't reach the Submitter. Fix with the shared-picks rule: only the Submitter moves; the others watch read-only. To be done in the well's I5 rework.
  - **"Here's the answer. You can carry on."** should instruct the **Navigator** to tap **"Go to the next stop"**. For everyone else that button is disabled; a tap shows a small hint that only the Navigator can do it (all `TODO(copy)`).
- **Data:** no schema bump. `outcome` and `endedAt` are optional; absent means solved. The store validator doesn't check award keys, so the rollback image (`522ecd9`) still loads a file with a reveal (it shows a completed mission with 0 points). To be confirmed by a test that loads such a file with the old validator rules.

#### 2c. Hint sheet (client)
- `PreviewBottomSheet` gets a sticky footer and handle-only swipe-to-close (§5).
- A new `PreviewHintSheet` (under `components/amazing-shuk/dev/`): the hint icon with its count badge after Start; revealed hints numbered; the next one locked with its cost stated as a lower potential ("lowers this challenge's points from 100 to 85"); one "Show hint N" button; busy until the server accepts; an `aria-live` region; offline queued.
- Teammates: the badge drops and one quiet line names who opened it; no sheet opens on their phones.
- "I'm completely stuck": a quiet text button at the foot of the challenge, and in the sheet once every hint is used. Its confirmation has two equal 3rem buttons, with "Keep trying" focused first.
- The choice task and the well both use it; today's inline hint list goes.

#### 2d. Reward pop-up (client)
- A shared `RewardDialog` on the `<dialog>` shell with three weights (full, light, quiet) plus a toast, as §8a. The trigger is only a new server award, with the device "seen" list (`localStorage`, try/catch) and the 5-minute recency rule. One dialog at a time; arrival and solve together merge into one.
- The navigation line is the owner's [Owner]: "Amazing navigation! You rock!". The rest are drafts.
- **Sound (D11 off):** Phase 2 ships **without a sound asset**. The code reads a per-device preference that defaults to off, and the menu toggle appears only once a licensed sound is chosen (P2-4, default taken). That means no asset blocks Phase 2.
- The inline cheer card stays as the permanent record under the pop-up.

#### 2e. Silent challenge timing record
- On every award: `endedAt` and `outcome`. Queued actions carry the phone's `queuedAt`; the server stores `queuedMs = now − queuedAt` (clamped at 0) and marks `uncertain` when it exceeds 60 s or the phone's clock is implausible. It is analytics only and never touches points (D7's recommendation, already implied by "timing is silent and never penalises").
- Guide timing controls stay as they are.

#### Not in Phase 2
- The optional-challenge engine (waits for D10, owner P2-5) and the Marzipan reveal (P2-3).
- Navigation timing and the `set-out` event (step 5 of §10), labels and preview points (D9), voice, Market Surprise, the I5 well rework, Rabbi Levin's new content (through `/experience-design` first), and the challenge-screen restyle.

#### Tests (new `*.test.ts` cases)
- The ladder: sum equals the budget, costs never fall, the floor holds, for 0–6 hints and several maxima; invalid input throws.
- The catalogue: D2's 2× cap; hint counts match each challenge's hints.
- Reveal: who may press it (Submitter, empty seat, guide, solo; a follower refused while the seat is held); exactly once across two phones and a replayed queue; submit/reveal races; 0 points with core food tokens; the finale unlocks after a reveal; Marzipan's per-step rule.
- Old state files (schema 7 without the new fields) load; a file with a reveal loads under the old rules.
- The pop-up "seen" rule: a pure function deciding what to show from the previous view, the new view, the seen list and the time.
- Timing: `queuedMs` and `uncertain`.

#### Order, verification and deploy
1. 2a → 2b → 2c → 2d → 2e, one at a time, each with `npm test`, `test:shuk`, lint and type-check in the one-shot container, `git diff --check`.
2. `/game-verify shuk` after 2d, then the owner's review on the dev page (`/memory-protocol/dev/amazing-shuk/water`), solo and two phones.
3. Commit and deploy only when the owner asks (`/deploy`: backup, fresh adventure, fresh links with the owner's OK).

#### Copy and values needed from the owner (drafts will be marked `TODO(copy)`)
- The mural's two hints (drafts in §4) and its reveal text from research run 07 (S1: the real blinds and railings painted to match; the IEC's thank-you workers). These are research claims and need the owner's approval.
- The hint sheet, the stuck confirmation, the quiet reveal line, the pop-up lines and the toast.
- The values: the mural's max points, the budget share (40 % proposed) and its food tokens (2).

#### Decisions for this plan (answered, 2 Nov 2026)
- **P2-1** The stuck button on every core challenge; model B and two hints on the mural only. Other stops keep their scoring.
- **P2-2** (default) The empty-seat fallback is for reveal only.
- **P2-3** Marzipan: no reveal now; set when Marzipan is reworked.
- **P2-4** (default) No sound file in Phase 2; the preference defaults to off.
- **P2-5** The optional-challenge engine waits for D10.
- **D4** Chesed VeRachamim is a normal stop.

### Phase 3: open exploration and varied answer mechanics
- **Goal:** any route, any order, and more ways to answer than "choose N".
- **Build:**
  - non-numbered map markers as an option;
  - challenge labels (a teaser + Main/Optional + difficulty) and previews with potential points (D9);
  - navigation timing (`set-out`, segments) (D7);
  - the mechanic field on challenges, then `find` (physical), `match`, `photo` (with a no-camera path) and on-device `voice` (D8; Montefiore's "Say it like Ohel Moshe", after the native-speaker clip and the on-site reading);
  - the end-of-adventure summary and highlights.
- **Needs:** D7–D10, copy, the clip.
- **Accept when:** a team can play the stops in any order; every camera, microphone or location step has an equal no-device path; nothing in a preview gives an answer away.

### Phase 4: Market Surprise
- **Goal:** the pilot as decided (D13–D17).
- **Build:**
  - the per-team `surprises` record (a schema addition with load validation);
  - the order-free assignment and reassignment rule over the approved pool;
  - the server-side "Feeling Lucky" roll (the Balanced table, stake ≤ 200, +200 / −50, one per team, no re-roll);
  - the Vendor's Call (listen, understand, repeat; the verified example clip; fixed participation points);
  - the offer card → the mini-challenge or roll → `RewardDialog`.
- **Needs:** confirmation of the stop pool, the verified example call and its sourced meaning, copy.
- **Accept when:**
  - The roll is the same after a refresh, a reconnect and a replay.
  - The disclosure shows the exact stake and outcomes before confirming.
  - No more than 2 offers per team, and no offer at a sensitive stop.
  - A skipped stop's offer is reassigned.
  - Navigation points and food tokens are untouched.

### Phase 5: mobile-first UX and existing DORI design patterns
- **Goal:** one consistent, outdoor-ready experience.
- **Check:**
  - 375 × 667 and 320 px with no horizontal scroll; 3rem touch targets; sunlight contrast;
  - reduced motion, screen reader and keyboard, the Back button and focus return;
  - `.rtl` and logical properties; brand tokens only;
  - reuse of `PreviewBottomSheet`, `ActionButton` and the cheer card's motion;
  - the `RewardDialog` and hint sheet extracted as shared platform patterns, styled per adventure.
- **Review:** `dori-ux-designer`; the owner reviews in the browser and on the walk (Claude doesn't review in a browser).

**Every phase:**
- `npm test` and `test:shuk` with the new cases;
- lint and type-check in the one-shot container; `/game-verify shuk`; `git diff --check`;
- a handoff entry; a commit only when asked; a deploy with `deploy/deploy.sh shuk` in tmux only with the owner's OK.

## Owner decisions needed

Already decided by the owner's brief (recorded, not asked): the fallback gives 0 challenge points and lets the team progress, which supersedes "no unsolved guide override" for this purpose; teams start at 0; optional challenges may offer more potential points; previews show potential points; timing is silent and never penalises.

- ~~D1~~ **Decided (owner, 2 Nov): model B**, a capped hint budget with rising cost. Values come after the choice.
- ~~D2~~ **Decided (owner, 2 Nov):** yes, a minimum reward for a correct solve; an optional challenge is worth at most **2×** the core.
- ~~D3~~ **Decided (owner, 2 Nov):** food tokens only for the core, including after a reveal.
- **D4** ~~Free hints and a free reveal at Rabbi Levin and Chesed VeRachamim?~~ **Decided (owner, 2 Nov): Rabbi Levin and Chesed VeRachamim are normal stops**, with no special treatment decided in advance; there is more knowledge about Rabbi Levin to use, explored through `/experience-design` first.
- ~~D5~~ **Decided (owner, 2 Nov):** the Submitter, anyone while that seat is empty, and the guide (a solo player holds the Submitter role, D12).
- ~~D6~~ **Decided (owner, 2 Nov):** "We're here" is an explicit arrival confirmation without GPS or a guide; it earns the stop's navigation points once and ends navigation timing.
- ~~D7~~ **Decided (owner, 2 Nov):** timing is for analytics only during the pilot.
- ~~D8~~ **Decided (owner, 2 Nov):** voice is on-device recording and playback only, with no speech recognition or AI scoring.
- ~~D9~~ **Decided (owner, 2 Nov):** labels are a teaser + Main/Optional + difficulty, with "A Hidden Symbol" for the mural riddle.
- ~~D10~~ **Decided (owner, 2 Nov):** go ahead with research run 08, the field checks and draft copy for the lion riddle and "Say it like Ohel Moshe". This also unblocks the optional-challenge engine (P2-5).
- ~~D11~~ **Decided (owner, 2 Nov):** the reward sound is **off** by default.
- ~~D12~~ **Decided (owner, 2 Nov):** an authenticated team of exactly one automatically has the Navigator and Answer Submitter permissions; solo wording is personal; Group shows "Playing solo"; the well's controls are all available to a solo player.
- ~~D13~~ **Decided (owner, 2 Nov):** a voluntary risk may reduce the stop's earned points; the team is told plainly first.
- ~~D14~~ **Decided:** the Balanced table (1–2 double, 3–4 −25 %, 5–6 keep), stake ≤ 200, +200 / −50, one roll per team, pilot only.
- ~~D15~~ **Decided:** preallocated offers, at most 2 per team (A dice, B skill), an approved pool, no performance triggers.
- ~~D16~~ **Decided:** no separate component; surprise points count in the normal total.
- ~~D17~~ **Decided:** the Vendor's Call is listen, understand, repeat; the phone's own recorder is an optional aid; DORI never handles vendor audio; fixed participation points, no AI judging. Market Jury is recorded as a future experiment.

## On approval (documentation only)

Save this plan as `docs/project/progressive-challenges-plan.md`; add a short entry at the top of `docs/project/agent-handoff.md` and a line in `docs/project/current-state.md` pointing to it; add D1–D10 as pending and the brief's decided directions as approved in `docs/project/product-decisions.md`. No code. Commit only when asked.
