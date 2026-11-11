# The owner's 8 Nov live test: implementation plan

**8 Nov 2026 (Claude), at the owner's request ("put my recent notes on implementation plan"). The direction for every build is approved (owner, 9 Nov 2026); each build still starts only when the owner says so. Build 1 is in progress (local only).** The notes were taken on the live release `e5f15ff` (phone and PC), and the raw list is in the top entry of the [handoff](agent-handoff.md). Every participant-facing line below is a draft (`TODO(copy)`, gate O16).

**Every build ends the same way:**
1. `npm run test:shuk` and `npm test`;
2. lint and `tsc` in a throwaway container;
3. `/game-verify shuk`;
4. the owner's commit, then `/deploy`.

The Memory Protocol is paused, so `/game-deploy` isn't used. Nothing is checked in a browser by Claude; the owner tests live.

**Passed in the test (item 3):** the lobby stepper, roles updating on both devices, and the role shown by the avatar after Start.

## Build 1: quick fixes (no decision needed)

**Approved refinements (owner, 9 Nov):**
- The 30-second map notice may dismiss itself **only if it holds nonessential guidance**. **Confirmed (owner, 11 Nov 2026):** today's `MAP_NOTICE` counts as nonessential, since the illustrated map is a prototype nowhere near operational use; it keeps the auto-fold as built.
- The hint and stuck icons have **clear accessible labels and stay discoverable**.

**Already in place before Build 1 (found in the repo, 9 Nov):**
- The hints were already an icon with a count.
- Story-first challenges already hide their choices before Start. Only Marzipan (`storyFirst: false`) showed them.

| # | The owner's note | Where it lands | Notes |
|---|---|---|---|
| 7 | The stepper at the top, and sticky | `components/amazing-shuk/PreviewMissionProgress.tsx`, rendered by `dev/PreviewMissionCard.tsx` and `dev/PreviewArrivalMission.tsx` | Sticks under `PreviewShukHeader` (`top: var(--shuk-header-height)`); check the wrap at 360 px |
| 4 | The map notice ("Illustrated prototype: approximate marker and unverified street labels. Follow the clue and guide.") closes after 30 s; the circle gently animated | The text is `MAP_NOTICE` in `dev/ListArrivalMission.tsx`; the notice and its toggle are in `components/map/LeafletBaseMap.tsx`; the marker's styles are beside it | It stays reopenable through its toggle. Reduced motion: no pulse; the notice closes without a fade |
| 5 | "Find the place": the picture is too small; the pop-up's text isn't in place | `dev/PreviewArrivalMission.tsx` and `dev/PreviewMissionCard.tsx`, with their `.module.scss` | The photo cap is 32svh today. Fix the text's alignment in the pop-up (`PreviewBottomSheet`) |
| 10 | Hide the answer choices until the challenge starts | `dev/PreviewChoiceTask.tsx`, `dev/PreviewChoiceOptions.tsx` (the mural uses the same choice components) | The question shows; the options appear on Start. A test checks that no option is rendered before Start |
| 9 | Hints and "I'm completely stuck" as an icon with a small number; the stuck one a lifebuoy | `dev/IndexChallengeHelp.tsx`, `dev/PreviewHintSheet.tsx`, `dev/PreviewStuckConfirm.tsx`; a new `lifebuoy` icon in `components/icons/iconPaths.tsx` (24 × 24, stroke only) | Each icon button keeps its text as `aria-label`; the targets are 3rem; the count is the hints left. It keeps the 5 Nov placement (above the title), with the icon instead of the strong button |

## Build 2: copy

**Approved (owner, 9 Nov):** use the four approved role descriptions (the [role moment, §12](role-moment-treatment.md#12-for-the-owner)) and the approved player-count summaries. The lines already recorded are "Playing solo: you'll hold every role." for 1, no group count or split for 2–5, and "Groups: N" from 6 (handoff, 5 Nov). Anything beyond those, such as "You will be 2…", is confirmed with the owner before release.

| # | The owner's note | Where it lands | Waiting on |
|---|---|---|---|
| 1 | The role pop-up: a line on what it means to be a ___ | The role card `PreviewRoleCard.tsx`; its text is `LOBBY_COPY.roleCards` in `lib/amazing-shuk/welcome-copy.ts` (today: a title and one job line) | **Approved wording (owner, 8 Nov):** see the [role moment, §12](role-moment-treatment.md#12-for-the-owner). The same line is the role moment's part 1 |
| 2 | In place of "How many are playing?", a summary: "You will be 2…" | `LOBBY_COPY.countQuestion` and the count and Ready steps of `PreviewAdventureLobby.tsx` | The wording for 1 (solo), 2–5 (one group) and 6–30 (groups) |

## Build 3: a different animation for each result (item 8)

The direction is in [the plan, §8a](progressive-challenges-plan.md#8a-reward-celebrations-owner-direction-2-nov-2026).

**Approved (owner, 9 Nov):**
- success scales up from the centre;
- **gentle** feedback for a wrong answer;
- a hint **unfolds**;
- a **quiet** fallback (the "I'm completely stuck" reveal);
- **subtle** navigation animation;
- **sound off by default**;
- reduced motion supported throughout.

- **First:** success scales up from the centre. "Group arrival confirmed! 20 arrival points earned." is an inline line in `dev/PreviewArrivalMission.tsx` today; it becomes the light `PreviewRewardDialog`, which has no entrance of its own yet.
- **Then, with the owner:** the motion for each other result: a light award, the quiet "Here's the answer", a hint's cost, a wrong answer or "not yet", and the toast (`PreviewRewardToast`).
- Built on the motion tokens `--dur-base`, `--dur-slow` and `--ease-out`, each with a `prefers-reduced-motion` version.
- The "exactly once per device" rule stays as it is.
- **Waiting on:** nothing beyond the approved direction above.

## Build 4: the navigation screen rework (item 6 and the 5 Nov notes): design first

The 5 Nov notes are in the [handoff](agent-handoff.md), in the entry "Deployed `15cc9db`…". Together they ask for:
- **A focus on finding the place.** Remove the Hebrew title and the small map; the Map button shows it full screen.
- **"Mission" becomes "challenge"** in the stepper and the titles.
- **A title saying what to look for, with the pictures** of what they're looking for.
- **The address hidden behind its icon. Revealing it costs points.**
- A riddle-style route in place of the landmarks; "About this place" kept.
- **The location check:** a real check within 100 m, "Confirming your location" with a loader, then the arrival success (Build 3's scale-up), the points on the group avatar, and Open Challenge locked until arrival (a tap explains why), then opening on every phone of the group.

**Approved (owner, 9 Nov):**
- **Navigation is worth 20 points, reduced to 15 if the group voluntarily reveals the exact destination.**
- **Safety and accessibility directions are free:** they never cost points.
- **Design before coding.**

**Waiting on:**
- **A short design pass** (`/experience-design`, then the `dori-ux-designer` agent) before code.
- The copy.

### The two-map idea (owner, 11 Nov 2026): to verify

The owner's idea, "to be verified, not a decision yet":
1. The **illustrated map** is the game's cover and is used for **picking a challenge**.
2. For **real navigation**, the OSM map (the dev page `/dev/osm-map`) is shown full screen, or nearly.
3. The **Navigator** can tap "we are here", and "show our location". Showing the location **costs points** and lasts **one minute** each time.

**Claude's assessment (11 Nov 2026):**
- **For it:**
  - Each map does what it's good at. The illustration is the game's face, and choosing a challenge doesn't need an exact pin.
  - The OSM map is exact, which is what walking there needs.
  - It also settles Build 4's "the Map button shows it full screen".
- **Risks, and how to meet them:**
  - **Two maps can confuse.** Make it one clear step, "choose" (illustrated) then "go" (OSM). Give a challenge the same number and colour on both maps, and a plain way back to choosing.
  - **The illustrated map's pins stay approximate** ([map audit](../map/nahlaot-map-audit.md)). That's fine for choosing; never use it to walk.
  - **A full-screen map hides the bottom bar and the challenge card.** Keep a slim "back" control, and the challenge's title in sight.
- **"We are here"** already exists: the `self-arrival` action (D6) for the Navigator or the guide. It records arrival once, with GPS where a stop has it switched on, otherwise trusting the group or the guide. Never GPS only (content rules).
- **"Show our location":**
  - It fits the approved rule that revealing the address costs points (20 → 15). Code computes the cost and queues it offline, so a dropped connection doesn't lose it.
  - The position stays on the Navigator's phone; it is never stored or sent.
  - GPS is watched only during the minute (battery).
  - In Nahlaot's narrow alleys GPS is off by 10–30 m, so show the dot with its accuracy ring, and expect "it says we're in the wall".
  - Safety and accessibility directions stay free (9 Nov).
- **Questions for the owner:**
  - the cost per use;
  - whether the first use is free;
  - whether the rest of the group sees the Navigator's dot;
  - whether the minute can be cut short.
- **Next, if approved:** a short design pass (`/experience-design`, then `dori-ux-designer`) together with Build 4, before any code.

## Build 5: the role moment

The general pattern for when a challenge needs one role to act. **Approved direction (owner, 8 Nov 2026, confirmed 9 Nov): the emblem cue.** A subtle animated emblem replaces the original automatic card; a tap opens the role's information and optional, progressive coaching.
- The holder's emblem highlights once.
- A tap opens the role pop-up, with guidance and the link only on request.
- The teammates get a quiet line and an observation task.
- **No new permissions, no mandatory acknowledgements, no progression locks and no server-side Done** (owner, 9 Nov). Nothing blocks Submit.

**Pilot:** the Researcher at the mural's optional Something's Missing; the other roles stay lightweight. Treatment: [role-moment-treatment.md](role-moment-treatment.md). Mobile design: [`design/output/role-moment-emblem-cue-2026-11-08.md`](../../design/output/role-moment-emblem-cue-2026-11-08.md). The build waits for the open items in the treatment's §12 (the link's cost, the link itself, the copy, and Something's Missing's own approval and field check).

## For the owner, in one list

**Answered on 9 Nov:** the direction for Builds 2–5, the address cost (20 → 15), the result animations, and starting Build 1.

**Still open:**
1. Any player-count wording beyond the lines already recorded (Build 2).
2. The role moment's open items (in its treatment, §12): how many points the link costs, the gallery or image URL, the remaining copy, the artwork, and Something's Missing's approval.
3. The review of Build 1 before it's committed.
