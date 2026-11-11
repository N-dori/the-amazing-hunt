# The Amazing Shuk: the role moment (emblem cue), an experience treatment

**8 Nov 2026 (Claude), with `/experience-design`. Revised the same day to the owner's approved direction (below). A design, not built.** Every participant-facing line is a draft (`TODO(copy)`, gate O16); every game device is invented and marked as such. **No web research was done:**
- Keep Talking and Nobody Explodes comes from the skill's [inspiration library](../../.claude/skills/experience-design/references/inspiration-library.md), checked 29 Oct 2026.
- Theatre cue lights are general stagecraft knowledge, not a looked-up source.

It builds on the [onboarding and roles treatment](onboarding-roles-treatment.md) (the casting call, the role cards and the emblems) and reopens none of the owner's role decisions. The mobile design is in [`design/output/role-moment-emblem-cue-2026-11-08.md`](../../design/output/role-moment-emblem-cue-2026-11-08.md). The build is Build 5 of the [8 Nov implementation plan](live-test-8-nov-plan.md).

## The owner's approved direction (8 Nov 2026)

> **The player's existing role emblem is the primary attention signal.** When a role is needed, briefly highlight or animate its emblem on the holder's avatar. Use subtle, non-repeating motion with a reduced-motion alternative. Do not automatically open a modal or interrupt the player. Tapping the emblem opens a contextual role pop-up using existing DORI UI patterns.
>
> The pop-up contains: 1. the role's purpose; 2. the specific task needed now; 3. why the group needs this contribution; 4. optional progressive guidance, revealed one step at a time; 5. a final direct action or source link where appropriate.
>
> **Preserve discovery:** do not reveal research links, search terms or challenge answers before the player requests assistance.
>
> Other teammates should receive a quiet indication of whose role is active and, when appropriate, a complementary observation task. Preserve solo play, Guide independence, empty-role fallback and existing server permissions. Role Moments must not block challenge submission or require a new server-recorded Done action. Pilot with the Researcher at the mural's optional "Something's Missing" challenge. Keep other role moments lightweight until tested.

## 1. Raw material

**Where it started (owner, 8 Nov).** At the mural's live challenge ("The artists fooled almost everyone. Can your group spot TWO things that are actually real?"), nothing told the Researcher that it was their turn to research, or how to begin: here, by finding the artists' own image of the mural on their website.

**The roles today** (`lib/amazing-shuk/roles.ts`, `welcome-copy.ts`):

| Role | What only they can do | Their card's line today (draft) |
|---|---|---|
| Navigator | Go on to the next stop (`mayLead`) | "You lead the way to each stop, and tell the group when you've arrived." |
| Submitter | Choose, move and send answers; "I'm completely stuck" (`mayChangeAnswer`, `mayReveal`) | "You choose and send the group's answers. Listen to everyone first." |
| Researcher | Nothing: a label, no permission (owner, 4 Nov) | "When a challenge needs the web, the app gives you a link. You look it up for the group." |
| Photographer | The photo answer, once one exists | "When a challenge asks for a photo, you take it and send it for the group." |

**Rules that hold:**
- A vacant seat never blocks play: anyone may act. The guide may always act.
- A solo player holds every role.
- The role card arrives once, when a role is given (`newlyHeldRoles`).
- The emblem sits on the avatar, and the header shows the role pills.

**What's missing:** a role is explained once, at the start. Nothing marks **when** it's needed.

**The mural's material** (`docs/knowledge/market-mural-agrippas.md`; [mural rework v3](mural-rework.md)):
- CitéCréation painted it in 2001 (Historical fact, M1, M2).
- Their own site shows four photos: before, work in progress, the whole wall and the shop close up (M3, gallery #5–8). It names no individual artists (M3). The page cited is on its English path (`/en/`), so the site may not be French-only.
- **The photo shows what stood there in 2001; it can't show whether something is painted or real.** The vents, the sign and the plaque are "field check required".

## 2. Central insight

**A role means something only at the moment the group needs it.** The game should quietly show whose moment it is, and help only when asked: like a stage manager's cue light, not a prompter shouting lines.

## 3. The human hook

A small light comes on next to your name, and only you know what it means: "you're on". Being cued, not ordered, is what makes it feel like a part rather than an instruction.

## 4. Concepts considered

- **The emblem cue (approved).** The holder's own emblem lights up briefly; a tap opens the role's pop-up. *Precedents:*
  - **theatre cue lights:** a quiet light tells one performer it's their turn, and nobody else is interrupted;
  - **Keep Talking and Nobody Explodes:** each player holds complementary information, and the answer comes from talking;
  - **DORI's progressive disclosure:** ASK, NOTICE and REVEAL, with WAIT (`docs/content/methodology.md`): help in steps, the answer last.
- **Set aside (first version, 8 Nov):**
  - a cue banner on every phone: it interrupts;
  - a card that opened by itself on the holder's phone: a modal the player didn't ask for;
  - a server-recorded "Found it!": a new action, and a gate the challenge doesn't need.
  - Their good part, a coach that shows how to begin, lives on as the pop-up's optional guidance.
- **A baton** passed between phones was rejected earlier: it contradicts the vacant-seat and guide rules, and makes others wait.

## 5. Recommendation: the emblem cue

- **It uses what players already know.** The emblem was given to them in the casting call, in front of the group; lighting it says "this is that".
- **It interrupts nobody.** No modal, and no repeat. A player reading the story isn't pulled away.
- **Help is earned, one step at a time.** The pop-up gives the purpose and the task; the guidance and the link come only when asked. Discovery stays with the player.
- **No server change.** It's derived from the challenge's state, and never touches Submit.
- **What it gives up:** a player who never looks at their avatar may miss the cue. The teammates' quiet line covers this: the group can say "{name}, that's you".

## 6. The anatomy of a role moment

**Declared in data** (an invented game device): a challenge may name one role moment, with:
- the role;
- the task now (one line);
- why the group needs it (one line);
- the guidance steps (zero or more);
- an optional final action or link;
- an optional complementary task for the others.

**Active** while that challenge is open and not yet answered. This is decided by pure functions from the existing challenge view. Nothing new is stored on the server and no action is added.

1. **The cue (the holder's phone, and wherever their avatar shows):**
   - The emblem on the holder's avatar (the header avatar, and the group list) highlights **once**: a soft glow ring and one gentle scale (about 1.0 → 1.12 → 1.0) over `--dur-slow` with `--ease-out`.
   - It then **stays marked** (a static ring) while the moment is active. It never repeats.
   - **Reduced motion:** the static ring only, no scale or glow.
   - **Once per device per moment:** recorded in `localStorage` (try/catch), so a reload or reconnect shows the static ring, not the animation.
   - A screen reader hears one polite line: "Your Researcher moment: tap your emblem" (draft).
2. **The role pop-up (opened only by a tap):**
   - The emblem becomes a button (3rem target, labelled with its role). The header's role pill opens the same pop-up.
   - It uses the existing `PreviewBottomSheet` (`<dialog>`, focus return, Back closes it).
   - The five parts, in order:
     1. **The role's purpose:** one line. This is the same line as the role card's "what it means" (implementation plan item 1).
     2. **The task now:** one line.
     3. **Why the group needs it:** one line.
     4. **Guidance, optional:** a "Need a start?" button. Each tap reveals one more step. **No step is rendered before it's asked for** (not hidden with CSS: absent).
     5. **The direct action or link, last:** offered only after the guidance steps, or by a clearly marked "Just show me" with the lifebuoy icon. It renders only when requested.
   - It closes with "Got it" (draft). Reopening shows the steps already revealed on this phone (device state only).
3. **The teammates (their challenge screen, no pop-up):**
   - The holder's emblem is marked on their avatar in the group view.
   - One quiet line with the holder's avatar: "{name} is on research" (draft).
   - When the challenge has one, a **complementary observation task** under it: "Meanwhile: …" (draft), something to look at in the place that the holder's find will need.
4. **The ending:** when the challenge is answered (by the Submitter, as always), the moment ends and the ring clears. **The moment never gates Submit**: the group may answer without the holder ever opening the pop-up.
5. **The rules:**
   - **Solo:** your own emblem highlights; the pop-up is the same; no teammates' line.
   - **The guide:** sees the quiet line with whose role is active, and can open any role's pop-up from it (the guide acts independently, as today).
   - **An empty seat:** no avatar to mark. The quiet line becomes "Anyone can look this up" (draft), and a tap on it opens the same pop-up for whoever taps. This is the existing vacant-seat rule.
   - **Offline:** nothing to queue (no new action).
   - **Permissions:** unchanged. The Researcher still has none; Submit stays the Submitter's.

## 7. Each role: pilot first, the rest lightweight

| Role | Moment | Depth until the pilot is tested |
|---|---|---|
| **Researcher** | A challenge needs the web | **The pilot:** the full pop-up, at Something's Missing |
| Navigator | Setting off; moving on after a reveal | The emblem highlight only, or nothing; the existing "Go to the next stop" rule stays |
| Submitter | Before the answer | The emblem highlight only, or nothing; Submit unchanged |
| Photographer | A photo challenge (none yet) | Nothing until one exists |

## 8. The pilot: the Researcher at Something's Missing

**Where:** v3's optional **Something's Missing** (the drinks fridge, painted out), where the artists' photo really finds the answer. It comes after **Who Painted It?**, whose answer is the search key.

- **The cue:** The Researcher's emblem glows once on their avatar and stays ringed. Their teammates see "{name} is on research" (draft).
- **The pop-up** (the Researcher taps their emblem):
  1. *Purpose:* "You're the group's eyes on the web" (draft).
  2. *Task now:* "Find the artists' own photo of this wall, as they finished it" (draft). *No "from 2001": the mural was unveiled at Hanukkah 2001 (M1), but no source dates the photo.*
  3. *Why:* "Something stood at this corner then that isn't here now. Only the photo can show it" (draft).
  4. *Need a start?* One step per tap:
     1. "You already know who painted it" (draft). The group's own answer is the key.
     2. Words to search, as chips that copy on tap: `CitéCréation Jérusalem`, `CitéCréation Mahane Yehuda`. "The photos speak for themselves" (draft). *Not "their site is in French": M3 is read on its English path.*
     3. "Look for their Jerusalem page; the wall is in their gallery" (draft).
  5. *Just show me* (lifebuoy): the link to CitéCréation's page (the gallery page or the image's own URL, the owner's choice).
- **The teammates' complementary task:** "Meanwhile: …" (draft; **open**). It must **not** be the challenge's hint 1 ("Look at the grey cabinets at the corner"): giving a paid hint free and unasked would bypass its cost (the designer's C3). It should hold the "now" in general (e.g. "Take in the whole corner: everything that stands there today", draft), so the group can compare when the Researcher returns. This is Keep Talking's split: one has the photo, the others have the wall.
- **Then:** the Researcher describes the photo, the others check the wall, and the Submitter answers (choose 1 of 3). The reveal tells the fridge story.
- **Kept:** the photo is evidence for "was it there?", never "is it real?". The live "spot TWO real things" challenge is not the pilot.

## 9. Group dynamics

- **Whose turn it is is visible**, but quietly: on the holder's own emblem, and as one line for the others.
- **Everyone has a part:** the holder searches; the others hold the place; the Submitter answers after hearing both.
- **Mixed ages:** the cue is a picture (the emblem), not text; a child can notice it on a parent's avatar.

## 10. The memorable moment, and what it teaches

**The memorable moment:** the Researcher's emblem lights up; they find the artists' own photo themselves; the group crowds round one phone in front of the wall and spots what's gone.

**What it teaches:** how to find a primary source. Who made this? Find their own record, and compare it with what's in front of you. In general, the roles become parts that each person plays for the others.

## 11. Feasibility, dependencies and risks

- **No server change:**
  - the moment is declared in the task data;
  - "active" is derived by pure functions with tests;
  - the seen highlight and the revealed steps are device state (`localStorage`, try/catch).
- **The external site:** CitéCréation's pages can move; check the link before each release. The guide can always show the photo.
- **Language:** the site has an English path (M3); the guidance still says the photos are enough.
- **Screen time:** one phone searches, and the others hold the wall.
- **Missed cue:** covered by the teammates' line and the guide.
- **Motion:** one highlight, never repeated, with a static ring under reduced motion.
- **Accessibility:**
  - the emblem button is 3rem with a label;
  - one `aria-live="polite"` announcement;
  - the copy chips have text and a "Copied" confirmation;
  - focus goes to the pop-up's heading and returns to the emblem.
- **Art:** the role emblems (still to be drawn; icon stand-ins until then) and the `lifebuoy` icon (implementation plan item 9).

## 12. For the owner

**Answered (8 Nov):**
- the concept (the emblem cue);
- the pilot (the Researcher at Something's Missing);
- no server-recorded Done, and no gate on Submit;
- the other roles lightweight.

**Answered (owner, 8 Nov, second round):**
- **The link costs points:** "Just show me" must cost more than 0 points. The amount is still to be set.
- **Discovery confirmed:** the guidance steps, search words and link don't exist on the page until asked for.
- **The header changes** so that it gives a visual way to tell the roles apart. The header's design comes with the build, and the owner sees it before release.
- **When the moment starts:** the challenge's Start and its story come first, then the role moment (the cue, and what the others do meanwhile).
- **The roles' lines (approved wording, owner, 8 Nov):**
  - Navigator: "You're the pathfinder. Lead your group to the next place, and decide when it's time to move on."
  - Answer Submitter: "You're the final voice. Listen to everyone's ideas, then choose and submit the group's answer."
  - Researcher: "You're the detective. Find clues and reliable information that help your group solve the mystery."
  - Photographer: "You're the group's eyes. Capture the details that prove what you've discovered."

  These are the pop-up's part 1 (the role's purpose) and the role card's line (implementation plan item 1).

**Confirmed (owner, 9 Nov):**
- A subtle animated emblem **replaces** the original automatic Role Moment card, and a tap opens the role's information and optional, progressive coaching.
- Role Moments introduce **no new permissions, no mandatory acknowledgements, no progression locks and no server-side Done actions.**
- The Researcher's first Role Moment stays at the mural's optional Something's Missing, **pending content approval.**

**Still open:**
1. How many points the link costs.
2. The gallery page or the image's own URL (v3's open choice).
3. The rest of the copy: the task, the "why" and the guidance lines, and the teammates' "Meanwhile" task (§8).
4. The emblem artwork.
5. Something's Missing itself: v3 is still a draft awaiting approval and its field check (which cabinet).
6. The lifebuoy: the same icon for "show the answer" (stuck) and "show the link", or a different one?

**After approval:** a build in small steps:
1. the data and pure functions, with tests;
2. the emblem cue and the pop-up;
3. the teammates' line and task;
4. the pilot content.

The intent to carry through: **cue, don't interrupt; help only when asked, one step at a time; the answer stays the group's to find.**
