# The Amazing Shuk: onboarding and roles, an experience treatment

**5 Nov 2026 (Claude), with `/experience-design`, at the owner's request. A proposal for the owner: nothing here is approved or built.** Every participant-facing line is a draft (`TODO(copy)`, gate O16). No web research was done for this treatment; it draws only on the project's own documents.

It works inside the owner's decisions, which it doesn't reopen: [onboarding and roles (5 Nov)](product-decisions.md#onboarding-and-roles-owner-5-nov-2026), [adventure, teams, invitations and roles (29 Oct)](product-decisions.md#approved-adventure-teams-invitations-and-roles-owner-29-oct-2026-future-design), the [I4/I5 direction (31 Oct)](product-decisions.md#approved-i4i5-direction-owner-31-oct-2026) and the [multiplayer plan](multiplayer-plan.md) §4, §5 and I4. Scope: **one team of 1–5** (what can start today) and solo. Several teams (I7a) only where the design must leave room for them.

## 1. Raw material

**Decided (owner):**
- The host **or the guide** enters how many are playing. One team: the host is the leader. Over 5: the host or guide assigns team leaders (I7a).
- The leader assigns the four main roles **during onboarding, before Start**: Navigator, Submitter, Researcher, Photographer. A player can hold several. A solo player holds them all. Advisor is gone.
- Everyone else gets mission parts (Spotter, Reader), **dealt per stop and rotated**; not part of onboarding.
- A player sees their main roles in the profile panel and **a role emblem on their own avatar**; the header pills stay.
- A vacant role never blocks play; the Change controls still work during play.
- Only the Submitter picks or moves; the others watch read-only (5 Nov, from the live test).

**The owner's notes from the live test (5 Nov):**
- The lobby should be **a series of states shown with a stepper**.
- The number of groups appears **only when there's more than one group, or a solo player**; "Recommended teams: 1" and "Suggested split: 5" confuse a single group.
- The waiting screen should be **game-branded, with an animated loader**.
- Roles started empty and showed "Advisor"; they belong in onboarding.

**What exists:** the I2 lobby (count, Start), the waiting card, I4a's leader `assign-role` action and the Group tab's Change controls, live sync between phones (S0-B), avatars, personal invitation links (join links are off).

**The emotional material:** a family or group standing together at the meeting point, about to set off; some unsure of the tech, a child eager to hold something real, a grandparent who'd rather be asked than handed a phone. Onboarding is the moment the group becomes a crew.

## 2. Central insight

**Onboarding isn't setup; it's the first thing the group does together.** If the roles are chosen by talking, each person starts the walk knowing what the others are counting on them for. If they're filled in by one person on a form, the rest learn their role later, by surprise.

## 3. The human hook

"Who's the best at finding the way?" Everyone in a family has an answer to that, and usually an argument. The roles are questions the group already knows how to answer about itself.

## 4. Three concepts

**A. The setup wizard.** The host goes through a stepper: how many → who's here → roles (tap a person for each role) → ready → Start. The players' phones show a branded waiting screen that follows the steps. Clean and quick. *Feels:* efficient. *Risk:* one person on a form while the others wait; a role arrives as a label, unexplained.

**B. The casting call (recommended).** The same stepper, but the roles step asks the group four short questions, one per role: "Who'll find the way?", "Who'll send our answers?", "Who'll look things up?", "Who'll take the photos?". The leader reads them aloud; the group decides by talking; the leader taps the faces. Each choice lands on that person's phone as **a role card**: the emblem, the role's name and one line on what they do, with a small arrival animation. *Feels:* being chosen; a shared laugh. *Reveal:* each person's card, on their own phone, in front of the others.

**C. Roles at the first stop.** No roles before Start: the first stop deals them as part of its opening, so the group learns them by doing. *Feels:* light, in the place. *Gives up:* the owner's rule that roles are assigned before Start, and the first stop loses time. **Rejected** for that reason; its good part (learning a role by using it) moves into B as the card's one line and the first-stop prompt.

Self-claim with the leader's confirmation was considered and set aside: it contradicts "the leader assigns", and in families the loudest child claims everything.

## 5. Recommendation: B, the casting call

- **It fits the material:** the roles are permissions, but to a family they are jobs, and a job is best given by asking who's good at it.
- **It fits the audience:** the leader reads; a grandparent can be chosen without touching anything; a child gets a real job with real power (Navigator, Photographer).
- **It costs almost nothing over A:** the data and actions are the same (`assign-role`); only the framing and the card differ.
- **Runner-up: A.** If B's questions feel slow in testing, the same screen without the questions is A.
- **What it gives up:** about a minute more than a plain form. Kept under two minutes in total (§6).

## 6. The journey, moment by moment

The stepper shows **four states** on the leader's phone and the same states, read-only, on the players' waiting screen: **Players · Who's here · Roles · Ready**. Solo skips Who's here and Roles.

**1. Players (host or guide).** "How many are playing?" with − and +.
- 1: a **Solo** note: "You'll hold every role." (draft). Next goes straight to Ready.
- 2–5: **no group count, no split**: one group needs neither (owner's note).
- 6–30: "Groups: N" and the split, with the existing limit note (Start disabled until I7a). The heading says **Groups**, not "Recommended teams" (owner's note).

**2. Who's here.** Avatars appear as people sign in ("3 of 5 here", draft). The leader can go on before everyone has arrived; late arrivals join later and can be given roles from the Group tab. When join links are on, the QR and Share sit here.

**3. Roles, the casting call.** One screen, four rows, in this order: Navigator, Submitter, Researcher, Photographer.
- Each row: the emblem, the role, its question (draft: "Who'll find the way?"), and the present players' avatars as chips. Tap one to give it; tap another to move it. A player can hold several.
- A line under the heading (draft): "Read these out and decide together. You can change roles at any stop."
- An empty row never blocks Next; see the fallback in §10.
- **On each player's phone, the moment their role is given: the role card.** The emblem settles onto their avatar with a short animation; "You're the Navigator" and one line on the job (drafts, e.g. "You lead the way and tell the group when you've arrived"). It stays until they tap OK, or until the next role arrives.

**4. Ready.** The crew: each person's avatar with their emblems; anyone without a main role shows "Ready for today's parts" (draft; the parts are dealt per stop). **Start Adventure**.
- On every phone: the branded transition to the map (§8).

**The players' waiting screen** (owner's note): the game's illustration and brand, an animated loader, and the current state from the stepper ("Your host is choosing roles…", draft). It's never blank: what's happening and what's next are always visible.

## 7. Group dynamics

- **The leader reads, the group decides, the phones confirm.** Talking happens before any tap.
- **Every role is visible to everyone** (cards, emblems), so the group knows whom to ask: "Photographer, this one's yours."
- **Mixed ages:** the questions are answerable by a seven-year-old ("Who's best at finding the way?"). The card's job line uses simple words.
- **Role load:** with 2 players, each holds two roles; with 5, one each and one spare, who gets the stop's parts. No artificial roles (owner, 31 Oct).
- **Only the Submitter picks or moves** in a challenge (5 Nov). The Submitter's card says so, so nobody is surprised at the first stop.

## 8. The memorable moment

**The role card landing on a child's phone while the family watches**: "You're the Navigator." It's earned because the family chose them, out loud, a moment before. The transition at Start (every phone switching to the map at once) is the second, smaller beat.

## 9. What it teaches

Onboarding has no history to teach, and shouldn't pretend to. Its payoff is social: each person knows their job and the others', so the first stop starts with talk, not with "who presses what?". It also shows the game's register: warm, simple, together. This is in line with the restraint rules: two screens of real decisions, no slides.

## 10. Feasibility, dependencies and risks

- **Server:** `assign-role` must accept changes **in the lobby, before Start**, and for the two new roles. I4a was built for play; whether the lobby state accepts it is to be checked in code. Researcher: a label only, no permission (4 Nov). Photographer: the photo-answer permission (5 Nov).
- **Fallback for an empty role at Start (open, owner's call):** proposed: **an empty Navigator or Submitter goes to the leader at Start**, so a group never reaches a stop with nobody able to act; the Researcher and Photographer may stay empty (the typed answer goes through the Submitter). The plan's vacant-seat fallback still applies during play.
- **Photographer with no photo challenge on the route:** proposed: show the row only when the route has a photo challenge, so the role is never empty of meaning. Today no live challenge takes a photo. Owner's call.
- **Sync:** the role card and the stepper's state on the players' phones need the existing polling (S0-B), with no new transport. A card that arrives while a phone is offline shows on reconnect.
- **Art:** the four emblems and the waiting screen's illustration are new artwork (subjects, illustrator, licence), alongside the team avatar set. Until then, the icon set's stroke icons stand in.
- **Motion:** the loader, the emblem's arrival and the Start transition each get a `prefers-reduced-motion` version (a fade or nothing).
- **Accessibility:** 3rem targets (outdoor screens); the chips carry names, not only faces; the role card is announced once (`aria-live`).
- **Time:** Players 15 s, Who's here as long as arrivals take, Roles about 60 s, Ready 10 s.
- **Several teams (I7a), later:** the same four states run per team on each leader's phone; the host's own stepper gets a Leaders state before Who's here. Not designed further here.
- **Not affected:** the Group tab's Change controls during play, the parts (dealt per stop), the header's role pills.

## 11. For the owner to decide

**Decided (owner, 5 Nov 2026):** 1, B, the casting call. 2, Start is blocked while the Navigator or the Submitter is empty, with a warning offering "Set the roles" or "Give them to me" (the leader); this replaces the proposal below that they fall to the leader silently. 3, the Photographer is always shown. First build: the lobby, Navigator and Submitter. Still open: 4 (copy) and 5 (artwork).

1. **B (the casting call) or A (the plain wizard).**
2. The **empty-role rule at Start**: Navigator and Submitter fall to the leader?
3. **Photographer shown only when the route has a photo challenge?**
4. The four questions, the cards' job lines, the stepper's state names, the waiting screen's lines: all copy (O16).
5. The emblems' and waiting screen's artwork: who draws them.

**After approval (step 10):** the `dori-ux-designer` agent draws the flow and the screens in `design/output/`; then the build in small steps (the lobby states and stepper; roles in the lobby; the role card; the waiting screen), each with tests. The intent to carry through: **the group decides by talking before anyone taps; each person's role arrives on their own phone, in front of the others; nobody waits at a blank screen.**
