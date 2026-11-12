# The role moment (emblem cue): mobile treatment

**Purpose:** the final mobile design of the role moment, for the later Build 5. It follows the owner's approved direction and treatment (`docs/project/role-moment-treatment.md`, 8 Nov 2026) and does not redesign them.
**Version:** 1.0 · **Date:** 8 Nov 2026 · **Author:** `dori-ux-designer` (Claude) · **Status:** a design, not built. Every participant-facing line is a `TODO(copy)` draft (gate O16).

**Read for this:** the role-moment treatment; `onboarding-roles-treatment.md`; `mural-rework.md` (v3 "Something's Missing", "Real or painted"); `live-test-8-nov-plan.md`; `product-decisions.md`; `dori-brand-to-ui.md`; `.claude/rules/scss.md`; `PreviewShukHeader`, `IndexParticipantMenu` (where the emblem lives today), `ParticipantAvatar`, `PreviewBottomSheet` (+ `.module.scss`), `PreviewRoleCard`, `dev/PreviewChoiceTask`, `iconPaths.tsx`, `role-emblems.ts`, `roles.ts`, `welcome-copy.ts`; `docs/knowledge/market-mural-agrippas.md` (M3, M19). No web research.

**Open questions (short form; full list in §8):**
1. Does "Just show me" cost points? (treatment §12.1)
2. The gallery page or the image's own URL? (§12.2)
3. The header has no role pill in today's code. Is the emblem button enough, or should a text pill come back? (C1)
4. The "Meanwhile" task is hint 1, which costs points through the hint sheet. Free for teammates? (C3)
5. Is the moment active from **Start** (this design) or from opening the challenge?

---

## 1. Summary and flow

**The idea, in one line:** a cue light, not a prompter. The holder's emblem lights once and stays ringed; a tap opens help; help comes one step at a time; Submit never waits for it.

**What the design adds to the treatment:**
- **Where the tap goes.** Today the emblems are an `aria-hidden` decoration *inside* the profile button. A button can't sit inside a button. So while a moment is active, **the active emblem steps out of the avatar's stack into its own 3rem button**, touching the avatar's edge (§2, P-70). When the moment ends it goes back into the stack.
- **When "active" starts.** From the accepted **Start** (the question is on screen) until the challenge is **answered**, not from the moment the challenge opens. The story is read first, so the cue never competes with the read-aloud (treatment §5: "a player reading the story isn't pulled away"). This is an interpretation; see open question 5.
- **Where the motion plays.** Only on the holder's own phone, in the header. Everywhere else (the group list on any phone, teammates' lines) the ring is static.

### The flow, per audience (Something's Missing, the pilot)

```text
Challenge opens (story, Start area) ── no cue anywhere
        │
   Start accepted (any phone that may start)
        │
        ├─ HOLDER (Researcher)      header emblem steps out → one highlight → static ring
        │                           one polite announcement
        │                           [tap emblem] → P-71 role pop-up (closed guidance)
        │                              ├─ [Need a start?] ×1 → P-72 step 1
        │                              ├─ [Need a start?] ×2 → P-73 step 2 (copy chips)
        │                              ├─ [Need a start?] ×3 → P-74 step 3
        │                              ├─ [Show me the page] / [Just show me] → P-75 link
        │                              └─ [Got it] / Back / swipe → back to P-70, focus on emblem
        │
        ├─ TEAMMATES                P-76 quiet line "Tali is on research" + "Meanwhile: …"
        │                           (no pop-up, no motion)
        │
        ├─ GUIDE                    G-70 same quiet line, tappable → the same pop-up (guide's device state)
        │
        ├─ SOLO                     P-78 = holder flow; no teammates' line, no "Meanwhile"
        │
        └─ EMPTY SEAT (no Researcher) P-77 "Anyone can look this up", tappable → the same pop-up for whoever taps
        │
   Submitter (or guide) submits, as always ── never gated by the moment
        │
   Challenge answered → ring clears, lines go, any open pop-up closes; success scales up (Build 3)
```

---

## 2. Wireframes (360 px, 16 px gutters)

**Legend:** `[ ]` a button (≥ 3rem); `(S)` the Researcher emblem (stand-in icon `search`); `((S))` the emblem with its ring; `(TA)` an avatar; `[?2]` the hint icon button with hints left; `[LB]` the lifebuoy icon button ("I'm completely stuck"); `~~~` the dimmed page behind a sheet; `[ext]` the `externalLink` icon. Screen IDs are new (P-70 to P-78, G-70); the numbers are provisional.

### P-70a Holder: the challenge screen, during the one-time highlight

```text
┌──────────────────────────────────────────┐
│ THE AMAZING SHUK                          │  ← existing PreviewShukHeader (sticky)
│ The market mural      [Grp] ((S))*(TA)    │  ← * the emblem button, 3rem, its disc
│                                           │    touching the avatar's lower edge;
│                                           │    glow + one scale 1.0→1.12→1.0
├──────────────────────────────────────────┤
│ ● ● ◐ ○   Story · Find · Challenge · Done │  ← sticky stepper (Build 1, item 7)
├──────────────────────────────────────────┤
│                              [?2]  [LB]   │  ← help bar (Build 1, item 9)
│                                           │
│ Researcher: open the artists' photo of    │  ← the question (v3 prompt, draft)
│ their finished wall. Something stood at   │
│ the corner then that isn't there now.     │
│ What was it?                              │
│                                           │
│ ┌───────────────────────────────────────┐ │
│ │ ○  A drinks fridge                    │ │  ← choose 1 of 3 (only the
│ └───────────────────────────────────────┘ │    Submitter can pick)
│ ┌───────────────────────────────────────┐ │
│ │ ○  A falafel stand                    │ │
│ └───────────────────────────────────────┘ │
│ ┌───────────────────────────────────────┐ │
│ │ ○  A street lamp                      │ │
│ └───────────────────────────────────────┘ │
├──────────────────────────────────────────┤
│ Talk it over. Your answer-submitter or    │  ← sticky submit bar, unchanged
│ guide submits the group's answer.         │
└──────────────────────────────────────────┘
```

- Header row, in order (inline start → end): titles (flex) · group button (3rem) · **emblem button** (3rem) · profile avatar (3rem). Titles keep about 184 px at 360 px; the title truncates with an ellipsis before anything wraps.
- The emblem's disc grows from today's 1.375rem to **2rem** while the moment is active, inside its 3rem target. The two targets sit side by side and never overlap.
- If the holder holds several roles, the other emblems stay in the avatar's small stack; only the active one steps out.
- Nothing else on the page changes. No banner, no line for the holder (one idea per screen: the cue is the emblem).

### P-70b Holder: after the highlight (the resting ring)

```text
┌──────────────────────────────────────────┐
│ THE AMAZING SHUK                          │
│ The market mural      [Grp] ((S)) (TA)    │  ← static ring, stays until answered
├──────────────────────────────────────────┤
│ … the rest of the screen exactly as P-70a │
```

- The ring: a 3px Amber stroke with a 2px Chalk gap around the Ink disc. Shape cue: a **double outline** (disc edge + ring), and the disc is larger than the resting emblems. Never colour alone.
- No repetition: no pulse, no reminder, no badge count.

### P-71 The role pop-up, opened (guidance closed)

```text
┌──────────────────────────────────────────┐
│~~~~~~~~~~~ (dimmed challenge) ~~~~~~~~~~~~│
│~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~│
├──────────────────────────────────────────┤
│                 ────                      │  ← handle (swipe down closes)
│ Researcher                          [X]   │  ← sheet title = role name; X = "Got it"
│                                           │
│ (S)  You're the group's eyes on the web.  │  1 purpose (= role card "what it means")
│                                           │
│ NOW                                       │  ← small mono label, Ink
│ Find the artists' own photo of this wall, │  2 the task now
│ from 2001.                                │
│                                           │
│ WHY                                       │
│ Something stood at this corner then that  │  3 why the group needs it
│ isn't here now. Only the photo can show   │
│ it.                                       │
│                                           │
│ [ Need a start? ]                         │  4 quiet ActionButton
│                                           │
│ [LB] Just show me                         │  5 quiet text link, lifebuoy icon
├──────────────────────────────────────────┤
│ [              Got it                  ]  │  ← sticky footer, primary, block
└──────────────────────────────────────────┘
```

- Built on `PreviewBottomSheet` exactly as `PreviewRoleCard` uses it: `title`, `closeLabel`, `footer`, `initialFocus`.
- **Nothing of parts 4 and 5 beyond these two controls is in the DOM:** no step text, no chip, no URL.
- Three short blocks + two controls; about 35 words before any help. Body text 17 px minimum.

### P-72 Guidance step 1 revealed

```text
│ … parts 1–3 as P-71 …                     │
│                                           │
│ A START                                   │
│ 1  You already know who painted it.       │  ← new, receives focus
│                                           │
│ [ Need a start? · next ]                  │  ← same button, now offers step 2
│                                           │
│ [LB] Just show me                         │
├──────────────────────────────────────────┤
│ [              Got it                  ]  │
```

### P-73 Guidance step 2 revealed (the copy chips)

```text
│ A START                                   │
│ 1  You already know who painted it.       │
│ 2  Words to search:                       │  ← receives focus
│    ┌────────────────────────────┐         │
│    │ CitéCréation Jérusalem  [⧉]│         │  ← chip = 3rem button, copies on tap
│    └────────────────────────────┘         │
│    ┌──────────────────────────────┐       │
│    │ CitéCréation Mahane Yehuda [⧉]│      │
│    └──────────────────────────────┘       │
│    Their site is in French; the photos    │  ← [TO VERIFY], see C6
│    speak for themselves.                  │
│                                           │
│ [ Need a start? · next ]                  │
│ [LB] Just show me                         │
```

After a tap, the chip reads `Copied ✓` (the `check` icon + the word) until another chip is tapped or the sheet closes. No timer.

```text
│    ┌────────────────────────────┐         │
│    │ Copied              [✓]    │         │
│    └────────────────────────────┘         │
```

### P-74 Guidance step 3 revealed

```text
│ A START                                   │
│ 1  You already know who painted it.       │
│ 2  Words to search: [chip] [chip]         │
│    Their site is in French; …             │
│ 3  Look for their Jerusalem page; the     │  ← receives focus
│    wall is in their gallery.              │
│                                           │
│ [ Show me the page ]                      │  ← the steps are used up: the button now
│                                           │    offers the link (part 5)
├──────────────────────────────────────────┤
│ [              Got it                  ]  │
```

Once step 3 is shown, **"Just show me" is removed** and only `[Show me the page]` remains, so there are never two controls for one action.

### P-75 "Just show me" revealed (the link)

Reached from P-71, P-72 or P-73 by "Just show me", or from P-74 by "Show me the page". Steps not yet revealed **stay absent**.

```text
│ … parts 1–3 …                             │
│ … any steps already revealed …            │
│                                           │
│ THE PAGE                                  │  ← receives focus
│ ┌───────────────────────────────────────┐ │
│ │ CitéCréation: their Jerusalem   [ext] │ │  ← a link, styled as a 3rem row;
│ │ page                                  │ │    opens in a new tab
│ └───────────────────────────────────────┘ │
│ Page not loading? Your guide can show     │  ← always under the link (§5)
│ you the photo.                            │
├──────────────────────────────────────────┤
│ [              Got it                  ]  │
```

- No more "Need a start?" or "Just show me": the pop-up is complete.
- If the owner rules that the link costs points (open question 1): "Just show me" first opens the existing **cost confirmation** pattern of the hint sheet (a related but distinct confirmation, per the reward decisions), then P-75. Free in this design until decided.

### P-76 A teammate's challenge screen (the quiet line and "Meanwhile")

```text
┌──────────────────────────────────────────┐
│ THE AMAZING SHUK                          │
│ The market mural          [Grp]  (DN)     │  ← own avatar, own emblems; no ring
├──────────────────────────────────────────┤
│ ● ● ◐ ○   stepper                         │
├──────────────────────────────────────────┤
│ (TA)((S)) Tali is on research.            │  ← quiet line: holder's avatar 2rem
│           Meanwhile: look closely at the  │    with the ringed emblem; Ink text;
│           grey cabinets at the corner.    │    not a button
│                              [?2]  [LB]   │
│                                           │
│ Researcher: open the artists' photo …     │  ← question as P-70
│ … options (read-only) …                   │
├──────────────────────────────────────────┤
│ Talk it over. Your answer-submitter or    │
│ guide submits the group's answer.         │
└──────────────────────────────────────────┘
```

- Placement: directly under the stepper, above the help bar, so it's read before the question. A plain block with a 3px Za'atar inline-start rule (as an evidence note, not a card or a banner). Ink text (Za'atar text fails on tints).
- No motion, no button, no close. It goes when the challenge is answered.
- On the Submitter's own phone it looks the same (the Submitter is a teammate here); Submit stays in the submit bar.
- In the **Group sheet** (any phone), the holder's row shows the static ring on their emblem.

### P-77 The empty seat (no Researcher in the group)

```text
├──────────────────────────────────────────┤
│ ┌───────────────────────────────────────┐ │
│ │ (S)  Anyone can look this up.   [›]   │ │  ← one 3rem button, full width;
│ └───────────────────────────────────────┘ │    the emblem in a dashed ring
│ Meanwhile: look closely at the grey       │  ← shown to all, as P-76
│ cabinets at the corner.                   │
│                              [?2]  [LB]   │
```

- The dashed ring is the "seat free" shape (distinct from the holder's solid ring). The same block shows on every player's phone and the guide's.
- A tap opens P-71 for whoever taps, with that phone's own device state. No highlight anywhere: there is no avatar to light.

### P-78 Solo

```text
┌──────────────────────────────────────────┐
│ THE AMAZING SHUK                          │
│ The market mural          [Grp] ((S)) (ME)│  ← as P-70: one highlight, then the ring
├──────────────────────────────────────────┤
│ stepper                                   │
├──────────────────────────────────────────┤
│                              [?2]  [LB]   │  ← no quiet line, no "Meanwhile"
│ Researcher: open the artists' photo …     │
│ … options (selectable: solo holds Submit) │
├──────────────────────────────────────────┤
│ [          Submit Our Answer           ]  │
└──────────────────────────────────────────┘
```

A solo player holds every role, so the avatar's stack has four emblems; only the Researcher's steps out.

### G-70 The guide's view

```text
├──────────────────────────────────────────┤
│ ┌───────────────────────────────────────┐ │
│ │ (TA)((S)) Tali is on research.  [›]   │ │  ← the same line as P-76, as a 3rem
│ └───────────────────────────────────────┘ │    button: opens the Researcher pop-up
│ Meanwhile: look closely at the grey       │
│ cabinets at the corner.                   │
│                              [?2]  [LB]   │
│ … question, options, Submit (the guide    │
│   may always act) …                       │
```

- The guide has no emblem and no highlight. The pop-up is identical (P-71 to P-75); the guide's revealed steps are the guide's device state only. Nothing syncs to the Researcher's phone, so the guide can read ahead without spoiling their search.
- With an empty seat, the guide sees P-77.

---

## 3. Motion

All on the existing tokens: `--dur-fast` 180 ms, `--dur-base` 420 ms, `--dur-slow` 900 ms, `--ease-out`. **Nothing loops; every animation has `iteration-count: 1`.**

| Element | When | Motion | Reduced motion |
|---|---|---|---|
| Emblem steps out | moment becomes active | the 2rem disc fades in beside the avatar, `--dur-fast`; the small one leaves the stack in the same frame | appears at once |
| **The one-time highlight** | after a `--dur-base` delay (the options have settled) | one `--dur-slow` keyframe on `--ease-out`: scale 1.0 → **1.12** at 40% → 1.0; an Amber glow (a soft outer ring, `color-mix(in srgb, var(--amber) 35%, transparent)`, 0 → 0.5rem at 40% → 0); the static ring **draws in** over the same 0–40% and stays | **no scale, no glow**: the static ring is there from the first frame |
| What persists | until answered | the static ring and the 2rem disc; no motion | the same |
| Moment ends | challenge answered | ring and disc fade out, `--dur-fast`; the emblem returns to the stack | instant |
| Pop-up entrance | tap | `PreviewBottomSheet`'s existing `sheetUp` over `--dur-base`; nothing added | the tokens go to 0 ms under `prefers-reduced-motion` (`globals.scss`) |
| A step / the link appears | tap | fade in, `--dur-fast`; no slide, no height animation | instant |
| Copy chip | tap | label swap to "Copied" + check; no motion | the same |
| Teammates' line, empty seat, guide line | — | none | none |

**Total cue:** about 1.3 s (420 ms wait + 900 ms highlight), once.

**Once per device per moment:**
- Key: `shuk.roleMoment.seen.<adventureId>.<teamId>.<challengeId>.<role>` in `localStorage`, read and written in `try/catch`.
- Written when the highlight **starts** (not when it ends), so a reload mid-animation doesn't replay it.
- If storage can't be read or written: **show the static ring, no animation.** The rule "never repeats" wins over "always plays once".
- A different device of the same player plays it once there too (the key is per device, by design).
- If a sheet is open (e.g. the role card, the hint sheet) when the moment becomes active, the highlight waits until no sheet is open, so it is seen.

**Implementation notes:** the highlight is a class added once (`.cueHighlight`) and removed on `animationend`; the ring is a separate class (`.cueActive`). Both with an explicit `@media (prefers-reduced-motion: reduce)` override in the module, per `scss.md`, on top of the zeroed tokens.

---

## 4. Accessibility

**The emblem button (holder):**
- A real `<button type="button">`, 3rem × 3rem, `aria-haspopup="dialog"`, labelled from the role name: "Researcher: your turn. Open role help" (draft). The icon inside is decorative.
- Focus ring: the existing `2px solid var(--amber)` outline with 2px offset (as `IndexParticipantMenu`).
- Tab order in the header: group button → emblem button → profile. Logical properties only, so RTL mirrors it.

**One polite announcement:**
- A single visually hidden `aria-live="polite"` region in the header, filled **once** with "Your Researcher moment: tap your emblem" (draft) when the highlight would play (also under reduced motion, also when storage blocked the animation, but still only once per page load). Cleared after it's read; never refilled on re-render.
- Teammates get no announcement: their line is ordinary content in reading order, before the question.

**Focus:**
- On open, `initialFocus` goes to the purpose block (`tabIndex={-1}`), as `PreviewRoleCard` does; the dialog is labelled by its title ("Researcher").
- Each newly revealed step, and the link block, takes focus (`tabIndex={-1}`); the next control follows it in tab order. No second live region.
- On close (Got it, X, Escape, Back, swipe, backdrop), the sheet returns focus to its opener (the emblem button, or the quiet line for the guide or empty seat).
- **If the opener is gone** (the moment ended, or the role moved): focus goes to the challenge heading (`#mural-task-title`, already `tabIndex={-1}`), or to the result when answered.

**Screen-reader text for each part:**

| Part | Rendered as | Heard |
|---|---|---|
| Title | `h2` | "Researcher, dialog" |
| 1 Purpose | `p` after the decorative emblem | "You're the group's eyes on the web." |
| 2 Now | `h3` "Now" (visually small) + `p` | "Now, heading. Find the artists' own photo…" |
| 3 Why | `h3` "Why" + `p` | "Why, heading. Something stood…" |
| 4 Need a start? | `button`, `aria-describedby` a hidden "Step 1 of 3" | "Need a start? Step 1 of 3, button" → then "Step 2 of 3", "Step 3 of 3" |
| Steps | `ol` with `h3` "A start" | "list, 1 item. You already know who painted it." |
| Chip | `button` | "Copy: CitéCréation Jérusalem, button" → after tap its name becomes "Copied: CitéCréation Jérusalem" (the button's own text changes; no live region needed) |
| 5 Just show me | `button`, icon decorative | "Just show me the page, button" (the visible text "Just show me"; the label adds "the page" so it can't be mistaken for the answer, see C4) |
| The link | `a` with `target="_blank" rel="noopener noreferrer"` | "CitéCréation: their Jerusalem page, opens in a new tab, link" |
| Footer | `button` | "Got it, button" |

**Colour is never the only signal:** the active emblem is larger (2rem vs 1.375rem), has a second outline (the ring), and sits apart from the avatar's stack; the empty seat uses a dashed ring; the teammates' line is words. Amber is used only for strokes and the glow, never text.

**Sun and age:** all text Ink on Chalk or the sheet's raised surface (12.6:1); body ≥ 17 px; chips and rows ≥ 3rem; one-handed: the pop-up's controls sit in the lower half, the footer is sticky.

---

## 5. States and edge cases

| Case | Behaviour |
|---|---|
| **Reload / reconnect** | "Active" is re-derived from the challenge view. The seen key exists → static ring, no animation, no announcement. Revealed steps and "link shown" are restored from device state (`shuk.roleMoment.reveal.<…>` = `{ steps: n, link: bool }`, try/catch; on failure, start closed). |
| **Offline** | Nothing to queue: the moment has no action. The pop-up opens offline (content ships with the task data). Under the link, when `navigator.onLine` is false, add: "You're offline. The page will open when you're back online" (draft). The chips still copy. |
| **Role reassigned mid-challenge** | New holder: the role card arrives first (existing `newlyHeldRoles`); after it closes, the emblem steps out and highlights once on that device (its own key). Old holder: ring and step-out go (`--dur-fast` fade); if their pop-up is open it **closes**, focus to the challenge heading. They become a teammate and see P-76. Revealed steps on the old device are kept but no longer reachable; harmless. |
| **Seat emptied mid-challenge** | Everyone switches to P-77; any open pop-up on the old holder's phone stays open (the content is still valid for "anyone"). |
| **Challenge answered while the pop-up is open** | The pop-up **closes** (the page behind is inert, so the result would otherwise be hidden). Focus goes to the result (`role="status"`), whose existing announcement reads it. The success scale-up (Build 3) plays behind as the sheet leaves. |
| **Answered without anyone opening the pop-up** | Normal: the moment ends, nothing is recorded, no penalty. |
| **The guide opens the pop-up** | G-70 → P-71. Guide's device state only; no effect on the Researcher's phone or ring. |
| **Another sheet is open** (hints, stuck, group) | Only one sheet at a time (existing rule). The emblem button stays tappable only when no sheet is open (the page is inert anyway). |
| **External link fails** (moved page, 404, blocked) | The app can't detect a cross-origin failure, so the line "Page not loading? Your guide can show you the photo" (draft) is **always** under the link. Release check: open the link before each deploy (treatment §11). |
| **Copy fails** (no clipboard permission) | The chip reads "Hold the words to copy" (draft) and its text becomes selectable; no error styling. |
| **French site** | The guidance says the photos are enough. M3's address is `citecreation.fr/en/…`, which suggests an English version of the page exists: verify before keeping the "in French" line (C6). Never translate the page in the app. |
| **Several teams (I7a)** | One moment per team; each team's holder and lines are their own. The seen key includes the team. |
| **Holder signs in on a second phone** | Plays once there too (per device); the steps start closed there. |
| **Not a pilot challenge** | No `roleMoment` in the task data → nothing renders. Other roles stay lightweight (treatment §7): later, the highlight only, no pop-up content until written. |

---

## 6. Copy list (all `TODO(copy)`)

English drafts come from the treatment (§6, §8) unless marked **new here**. Hebrew: `TODO(copy-he)` for every line, to be written after the English is approved (the Shuk plays in English today; no Hebrew is invented here).

| ID | Where | Draft (English) | Source |
|---|---|---|---|
| RM-01 | Sheet title | Researcher | existing `roleNames` |
| RM-02 | Part 1, purpose | You're the group's eyes on the web. | treatment §8 (= the role card's "what it means", Build 2 item 1) |
| RM-03 | Part 2 label | Now | **new here** |
| RM-04 | Part 2 | Find the artists' own photo of this wall, from 2001. | treatment §8 |
| RM-05 | Part 3 label | Why | **new here** |
| RM-06 | Part 3 | Something stood at this corner then that isn't here now. Only the photo can show it. | treatment §8 |
| RM-07 | Guidance button | Need a start? | treatment §6 |
| RM-08 | Guidance button, after step 1 | Need a start? (with "next" or "another step"; wording open) | **new here** |
| RM-09 | Steps heading | A start | **new here** |
| RM-10 | Step 1 | You already know who painted it. | treatment §8 |
| RM-11 | Step 2 | Words to search: | **new here** (lead-in) |
| RM-12 | Step 2 chips | `CitéCréation Jérusalem` · `CitéCréation Mahane Yehuda` | treatment §8 (search terms, not copy) |
| RM-13 | Step 2 note | Their site is in French; the photos speak for themselves. | treatment §8, **[TO VERIFY]** (C6) |
| RM-14 | Step 3 | Look for their Jerusalem page; the wall is in their gallery. | treatment §8 |
| RM-15 | After step 3 | Show me the page | **new here** |
| RM-16 | Part 5 | Just show me | treatment §6 |
| RM-17 | Link heading | The page | **new here** |
| RM-18 | Link text | CitéCréation: their Jerusalem page | **new here** (depends on open question 2) |
| RM-19 | Under link | Page not loading? Your guide can show you the photo. | **new here** |
| RM-20 | Offline, under link | You're offline. The page will open when you're back online. | **new here** |
| RM-21 | Chip after tap | Copied | treatment §11 |
| RM-22 | Chip, copy failed | Hold the words to copy | **new here** |
| RM-23 | Footer / close | Got it | treatment §6 |
| RM-24 | Emblem button label (SR) | Researcher: your turn. Open role help | **new here** |
| RM-25 | Live announcement | Your Researcher moment: tap your emblem | treatment §6 |
| RM-26 | Teammates' line | {Name} is on research. | treatment §6 |
| RM-27 | Teammates' task | Meanwhile: look closely at the grey cabinets at the corner. | treatment §8 (= hint 1, see C3) |
| RM-28 | Empty seat | Anyone can look this up. | treatment §6 |
| RM-29 | Step counter (SR) | Step {n} of {total} | **new here** |
| RM-30 | Link cost confirm (only if it costs) | reuse the hint sheet's cost-confirm pattern; wording open | open question 1 |

Facts used: CitéCréation as the painters, 2001, their page and gallery (M1, M2, M3, knowledge file). The "2001" in RM-04 assumes the gallery's finished-wall photo dates from the painting; the knowledge file says the photo shows the finished wall, not its date. Mark RM-04 `[TO VERIFY]` or drop "from 2001".

---

## 7. Handoff checklist (for Build 5; no server change)

**Data (task definition, e.g. the mural's choice-mission entry):**
- `roleMoment?: { id; role: AssignableGroupRole; taskNow; why; steps: { text; chips?: string[] }[]; link?: { href; text }; meanwhile?: string }`. All strings `TODO(copy)`; stable `id`.
- Part 1 is **not** duplicated: it reads the role's "what it means" line from `LOBBY_COPY.roleCards` (Build 2 item 1).
- Each statement keeps its evidence label in data (not shown, per the 26 Oct decision).

**Pure functions in `lib/amazing-shuk/role-moment.ts`, with tests:**
- `roleMomentActive(view, moment)`: true only when started and not completed.
- `roleMomentAudience(participantId, roles, { guide, solo, memberIds })` → `"holder" | "teammate" | "guide" | "vacant"` (uses `effectiveRoles`, `holderOf`).
- `nextReveal(state, total, action: "step" | "showMe")` → `{ steps, link }`; never mutates; "showMe" sets `link` without adding steps; steps never exceed `total`; after `total`, "step" sets `link`.
- `revealControls(state, total)` → which of "Need a start?", "Show me the page", "Just show me" exist (never two for one action).
- `roleMomentKeys(adventureId, teamId, challengeId, role)` → the seen and reveal keys.
- A small adapter for `localStorage` with try/catch (side effects outside the pure functions).

**Tests that matter:**
- No step text, chip or URL is in the rendered output before it's requested (render-to-string, like the existing `*-ui.test.ts`).
- Submit renders and works identically with the moment active, opened, or never opened.
- Solo → holder; guide → guide; vacant seat → vacant for everyone; teammate otherwise.
- The highlight class is applied at most once per key; blocked storage → no highlight, ring shown.
- Reassignment flips holder/teammate; answered → inactive.
- No new server action and no change to `parse-water-action.ts` or the action queue.

**Components (Index → List → Preview):**
- `IndexRoleMoment` (new): owns device state (seen, reveal, which sheet), focus fallback, the announcement.
- `ListRoleMoment` (new): maps the task data + audience into view models.
- `PreviewRoleCue` (new): the stepped-out emblem button with ring and highlight.
- `PreviewRoleMomentSheet` (new): on `PreviewBottomSheet`, the five parts.
- `PreviewRoleMomentLine` (new): teammates', guide's and empty-seat lines.
- Touched: `IndexParticipantMenu` (omit the active emblem from the stack while it's stepped out), `PreviewShukHeader` (a slot for the cue between group and menu), `dev/PreviewChoiceTask` (a slot for the line above the help bar), `ListGroupOverview` (the static ring on the holder's row).
- Icons: `lifebuoy` (Build 1 item 9), existing `search`, `externalLink`, `check`. Emblem artwork later.
- SCSS: module files only; tokens only; logical properties; `prefers-reduced-motion` overrides.

**Order (treatment §12):** data and pure functions → cue and pop-up → teammates' line and task → pilot content. The pilot waits for v3's approval and its field check (which cabinet).

---

## 8. Conflicts and open questions

**Conflicts found:**
- **C1. The header's role pill.** `product-decisions.md` (5 Nov) says "the header's role pills stay", and the treatment has the pill open the pop-up. But today's `PreviewShukHeader` has no pills (its comment: the roles live in the Group sheet). This design uses the stepped-out emblem as the only header entry and adds no pill (one target, less clutter at 360 px). Owner: restore a pill, or accept the emblem alone?
- **C2. Nested interactive.** The emblem today is `aria-hidden` inside the profile `<button>`. It can't become a button there. Resolved by stepping it out while active (§2). This changes where the emblem sits for the moment's duration; owner to confirm it still reads as "on the avatar".
- **C3. "Meanwhile" = hint 1.** The teammates' task is the challenge's paid hint 1, given free and unasked to everyone but the holder. That bypasses the hint cost and may reveal more than the group asked for. Options: a different observation line (needs the field check), or accept that the hint is free at this challenge (then drop it from the hint list).
- **C4. One icon, two meanings.** The lifebuoy is "I'm completely stuck" (reveals the answer, Build 1 item 9) and also "Just show me" (reveals the link). Both appear on the holder's phone. Mitigated by the label "Just show me the page" for screen readers and placement inside the pop-up only; the owner may prefer `externalLink` for this one.
- **C5. The v3 prompt names the Researcher** ("Researcher: open the artists' photo…") and says what to open, before any help is requested. That's within "preserve discovery" (no link, terms or answer), but it doubles the pop-up's "Now" line and reads oddly for an empty seat or solo. Suggest a role-neutral prompt; copy decision.
- **C6. "Their site is in French."** The knowledge file's M3 address is the site's `/en/` path, which suggests an English page exists. The line is `[TO VERIFY]`; if the page is English, drop it.
- **C7. The knowledge file is internally inconsistent** on the fridge (run 12's row says "a real drinks fridge"; the later correction says painted on a cabinet door, and "this section governs"). No copy here depends on it; the reveal follows the correction.
- **C8. Brief vs approved decisions, logged:** the agent brief says roles are navigator/answer-submitter/followers; the approved decisions (3–5 Nov) add Researcher and Photographer. The decisions win.

**The owner's open items (treatment §12):**
1. Does "Just show me" (the link) cost points?
2. The gallery page or the image's own URL?
3. The copy: every draft above and the "what it means" lines.
4. The emblem artwork.
5. Something's Missing itself: v3 awaits approval and its field check (which cabinet).

**Raised here:**
6. Active from **Start** (this design) or from opening the challenge?
7. RM-04's "from 2001": keep with a source for the photo's date, or drop.
8. Should the highlight also play on teammates' group lists? This design says no (static only), reading "highlights once" as the holder's own phone.

**Not checked visually:** no browser or screenshots on this server; the 360 px fit of the header row (titles + three 3rem targets) is computed, not seen.
