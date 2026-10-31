# Join flow copy deck (O16): the joining phone and the leader's phone

**Purpose:** every visible and spoken string in the I3b team join flow (join link, Ask to join, check code, Let in / Decline, Remove, team full, rate limits, links off), with the current text, a proposed draft, a rationale and a length limit, for the owner's O16 decision.
**Version:** 0.1 · **Date:** 31 Oct 2026 · **Author:** dori-ux-designer
**Status:** **everything here is DRAFT for O16 approval.** Nothing is approved visitor copy until the owner says so. Documentation only: no code, data or test changes.
**Built code read (commit `0ad9200`):** `lib/amazing-shuk/team-membership.ts` (`TEAM_JOIN_COPY`, `TEAM_MEMBERS_COPY`), `components/amazing-shuk/IndexTeamJoin.tsx`, `PreviewTeamJoin.tsx`, `IndexTeamMembers.tsx`, `PreviewJoinRequests.tsx`, `components/amazing-shuk/dev/IndexWaterTask.tsx` (mount points, `#join=`, "already in"), `lib/amazing-shuk/participant-store.ts` and `participant-http.ts` (server strings shown to players), `lib/amazing-shuk/welcome-copy.ts` (welcome and the approved I2 lobby copy), `lib/amazing-shuk/team-membership-ui.test.ts`.
**Plan read:** `docs/project/multiplayer-plan.md`: I3, "I3 implementation plan", "I3b decisions", "I3b implementation", "I7a team names" (approved O16 tone), section 10 (O16 row); top of `docs/project/agent-handoff.md`.

## Open questions for the owner (O16)

1. **The plan's five words.** Keep **Ask to join**, **Let in**, **Waiting for your leader** and **You're already in** (lightly extended, below). Replace **Space: 3 of 5** with **3 of 5 places filled**. Yes or no for each?
2. **Name field: first name only?** The draft asks for "Your first name (optional)", which suits minors and the privacy rule better than "Your name". Approve?
3. **The vanishing link.** The leader's phone forgets the link when it leaves the screen (by design: stored hashed). The draft says so up front: "Share it now. If you leave this screen, you'll need a new link." Approve the warning?
4. **The removed phone.** Today it falls back to the signed-out welcome without explanation. Show a plain line ("You're no longer in this team. Talk to your guide.") or keep it silent? Silent is more neutral; the line is clearer. A line needs a small code change (C3).
5. **Three new string slots** need a code change: a "One moment…" checking state, a members subheading ("In the team") and a separate "still trying" line while the phone collects its session. Approve adding them?
6. **Hebrew column.** The game is English-first (O11). The Hebrew drafts below are for review and future use only, not for the build. Keep them in the deck or drop them?

## 1. Tone and length rules used

Tone comes from the approved copy: the I2 lobby ("You're the host!", "Your host is getting everything ready. You'll be exploring soon!") and the I7a names ("That name's taken. Try another!", "You're {name}!").

- **Plain words for every age**, said the way a guide would say them. Contractions are fine. At most one exclamation mark per screen, kept for good moments (getting in), never for errors.
- **Every problem names the next step**: who to talk to, or what to tap. No blame ("you did it wrong"), no system words (request ID, token, session, 404, server).
- **Who:** "your team leader" for the person who lets people in. The guide can also do it, so errors that need a human say "your team leader or guide".
- **No numbers that come from settings** (10 minutes, 15 minutes, 5 places, 10 asks): they can change without a copy review. The only number shown is the live count ("3 of 5 places filled"), which is computed.
- **Outdoor reading:** one idea per line; the most important words first; nothing a player has to scroll to understand.
- **No historical or place claims** anywhere in this flow.

**Length limits** (IBM Plex Sans at 17 px body / about 8.5 px per character; tested at a 320 px wide screen with a 16 px gutter):

| Type | Limit | Why |
|---|---|---|
| Button, full width | ≤ 22 characters | One line at 320 px with icon |
| Button, two side by side | ≤ 12 characters each | Two 48 px buttons in one row at 320 px; longer wraps to a taller button |
| Screen heading (h1) | ≤ 28 characters | One or two lines in the display size |
| Section heading (h2/h3) | ≤ 24 characters | One line |
| Lead or help line | ≤ 20 words | Under the 40-word reading block; one glance |
| Status or error | ≤ 16 words, one or two short sentences | Read in sun while walking |
| Tag (You, Leader) | ≤ 8 characters | Sits beside a name in a 48 px row |
| Spoken label (`aria-label`) | ≤ 12 words | Screen readers, not seen |

All lines must also survive 200% text size by wrapping, never by truncation.

## 2. Joining phone (opens the team's join link)

Screen IDs: **P-J1** checking, **P-J2** Ask to join, **P-J3** waiting with the code, **P-J4** declined, **P-J5** expired, plus messages that land on other screens.

Key: **Current** = text in `0ad9200` (all are `TODO(copy)` drafts already); *(none)* = no string today; **new slot** = needs a code change to show.

### P-J1 Checking (before the phone knows if it already asked)

| ID | Location | Current | Proposed (EN) | Hebrew draft (review only) | Rationale | Limit |
|---|---|---|---|---|---|---|
| J1.1 | `PreviewTeamJoin` stage `checking`: only the eyebrow shows | *(none: the screen is blank under the eyebrow)* | One moment… **(new slot)** | רגע אחד… | A blank screen on weak signal looks broken; one calm line says the phone is working | ≤ 16 chars |

### P-J2 Ask to join

| ID | Location | Current | Proposed (EN) | Hebrew draft | Rationale | Limit |
|---|---|---|---|---|---|---|
| J2.1 | Eyebrow (every join stage) | The Amazing Shuk | The Amazing Shuk *(keep)* | {Hebrew game title [TO VERIFY]: no approved Hebrew name exists} | This is the newcomer's first screen and the only place the game's name appears; the lobby's "Nahlaot · Mahane Yehuda" comes later | ≤ 28 chars |
| J2.2 | h1 | Join your team | Join your team *(keep)* | הצטרפו לקבוצה | Short, says the one job | ≤ 28 chars |
| J2.3 | Lead | Ask to join, and your team leader will let you in. | Add your name if you like, then ask. Your team leader lets you in. | אפשר להוסיף שם, ואז לבקש. ראש הקבוצה יכניס אתכם. | Puts the two steps in order and tells the player who decides, so the wait that follows isn't a surprise | ≤ 20 words |
| J2.4 | Field label | Your name (optional) | Your first name (optional) | השם הפרטי שלך (לא חובה) | First name only is enough to recognise each other and suits minors (privacy rule); "optional" stays as approved (O5) | ≤ 28 chars |
| J2.5 | Field help (`aria-describedby`) | Your team sees it next to your picture. | Your team sees it next to your picture. *(keep)* | הקבוצה תראה אותו ליד התמונה שלך. | Says exactly who sees it, nothing more | ≤ 12 words |
| J2.6 | Primary button | Ask to join | Ask to join *(keep: plan word)* | בקשה להצטרף | Plain verb phrase; it asks, it doesn't join yet, which is honest | ≤ 22 chars |
| J2.7 | Button while sending | Asking… | Asking… *(keep)* | שולחים בקשה… | Shows the tap was heard | ≤ 22 chars |

**Messages under the button on P-J2** (the client shows the server's `error` text verbatim, so these live in `participant-store.ts` / `participant-http.ts`):

| ID | When | Current | Proposed (EN) | Hebrew draft | Rationale | Limit |
|---|---|---|---|---|---|---|
| J2.8 | The link is unknown, replaced, or join links are off (all 404) | This join link isn't valid anymore. Ask your team leader for a new one. | This join link doesn't work. Ask your team leader or guide for a new one. | הקישור הזה לא עובד. בקשו קישור חדש מראש הקבוצה או מהמדריך. | The same 404 also means "links switched off", when the leader can't make a new link: adding "or guide" keeps the advice true in both cases (C1). "Doesn't work" avoids guessing why | ≤ 16 words |
| J2.9 | Rate limit: too many asks on this link or overall (429) | Too many people are asking right now. Try again in a minute. | Lots of people are asking right now. Try again in a minute. | הרבה אנשים מבקשים עכשיו. נסו שוב בעוד דקה. | Friendlier than "too many"; "a minute" matches the real window without quoting a setting | ≤ 16 words |
| J2.10 | Five requests already waiting for this team (429) | Too many people are waiting to join. Try again in a few minutes. | A few people are already waiting to join. Try again in a few minutes. | כמה אנשים כבר מחכים להצטרף. נסו שוב בעוד כמה דקות. | Explains the wait without blaming the player | ≤ 16 words |
| J2.11 | The team is full when asking (409, `TEAM_FULL`) | This team is full. Ask your guide. | This team is full. Talk to your guide. | הקבוצה מלאה. דברו עם המדריך. | Correct for the joining phone: only the guide's operator path can go over the cap. **But the same server string reaches the leader and the guide** (C5); see L3.9 | ≤ 12 words |
| J2.12 | Name with only control characters (400; rare, the field allows 40) | A name needs 1–40 characters. | Try a shorter name, or leave it empty. | נסו שם קצר יותר, או השאירו ריק. | Tells the player what to do; "1–40 characters" is a system rule | ≤ 12 words |
| J2.13 | No connection (fetch failed) | Could not reach the game. Check your connection and try again. | Can't reach the game right now. Check your signal and try again. | אין חיבור למשחק כרגע. בדקו קליטה ונסו שוב. | "Signal" is the outdoor word every age knows | ≤ 16 words |
| J2.14 | Phone is already signed in (409, `ALREADY_IN`); the client then opens the game | You're already in. | You're already in the game on this phone. | הטלפון הזה כבר במשחק. | Plan word kept and extended so it doesn't sound like a mistake. **Must stay identical in `ALREADY_IN` and `TEAM_JOIN_COPY.alreadyIn`**: the client compares the strings (C4) | ≤ 12 words |

### P-J3 Waiting with the check code

| ID | Location | Current | Proposed (EN) | Hebrew draft | Rationale | Limit |
|---|---|---|---|---|---|---|
| J3.1 | h1 (pending) | Waiting for your leader | Waiting for your leader *(keep: plan word)* | מחכים לראש הקבוצה | Says who to look at, on the street, not the screen | ≤ 28 chars |
| J3.2 | Code intro | Your leader will see this code. Check it matches: | Your leader sees this code too. Check it's the same: | אותו קוד מופיע אצל ראש הקבוצה. בדקו שהוא זהה: | Turns it into a 2-second in-person check; doesn't imply the code is a password (it isn't, per I3b) | ≤ 14 words |
| J3.3 | The code (4 characters, from `ACDEFHJKMNPRTUVWXY3479`) | e.g. KX7P | *(no change)* | *(no change, Latin letters in both)* | The alphabet already avoids look-alikes; keep it in IBM Plex Mono, large, Ink on Chalk | 4 chars |
| J3.4 | Code spoken label | letters spaced: "K X 7 P" | Check code: K X 7 P | קוד בדיקה: K X 7 P | A label before the letters tells a screen-reader user what they are hearing | ≤ 8 words |
| J3.5 | Phone-down hint under the code | *(none)* | You can put your phone away. It joins by itself. **(new slot, optional)** | אפשר להכניס את הטלפון לכיס. הוא יצטרף לבד. | The phone polls; the player doesn't need to watch it. Owner choice: helpful or one line too many | ≤ 12 words |
| J3.6 | h1 after Let in, while collecting the session | You're in! Joining… | You're in! Opening the game… | נכנסתם! פותחים את המשחק… | The one good moment in this flow earns the exclamation mark; "opening the game" says what comes next | ≤ 28 chars |
| J3.7 | Collecting the session fails on weak signal (auto-retries every 2 s) | Could not reach the game. Check your connection and try again. (same as J2.13) | Weak signal. Still trying… **(new slot)** | קליטה חלשה. ממשיכים לנסות… | The phone retries by itself, so "try again" tells the player to do something they can't (C9) | ≤ 8 words |

### P-J4 Declined

| ID | Location | Current | Proposed (EN) | Hebrew draft | Rationale | Limit |
|---|---|---|---|---|---|---|
| J4.1 | h1 | Your leader didn't let this phone in. Talk to them or your guide. | This phone wasn't let in | הטלפון הזה לא הוכנס | Today the whole sentence is the heading (over the 28-character limit). Neutral wording: the phone, not the person; no "rejected" | ≤ 28 chars |
| J4.2 | Body **(new slot: a line under the h1)** | *(part of the h1)* | Talk to your team leader or your guide. | דברו עם ראש הקבוצה או עם המדריך. | The only real next step; asking again from this phone is blocked until the request expires, so the copy doesn't offer it | ≤ 12 words |

### P-J5 Expired

| ID | Location | Current | Proposed (EN) | Hebrew draft | Rationale | Limit |
|---|---|---|---|---|---|---|
| J5.1 | Message while the link is still on the screen (stage returns to Ask) | This request has expired. Ask to join again. | Your request expired. Tap Ask to join to try again. | הבקשה פגה. הקישו על "בקשה להצטרף" כדי לנסות שוב. | Names the button that is right there | ≤ 12 words |
| J5.2 | Same, after a reload (the link was cleared from the address bar; today the phone falls back to the welcome screen and the message is lost) | *(lost: the welcome's signed-out line shows instead)* | Your request expired. Open the join link again, or ask your team leader to send it. **(needs C2 fix)** | הבקשה פגה. פתחו שוב את קישור ההצטרפות, או בקשו מראש הקבוצה לשלוח אותו. | Without the link there is no button, so the copy points back to the message where the link came from | ≤ 18 words |
| J5.3 | Exchange refused because the approved request ran out (rare) | This request has expired. Ask to join again. | Same as J5.1 / J5.2 | | One message for one situation | |

### Messages that land on other screens

| ID | Location | Current | Proposed (EN) | Hebrew draft | Rationale | Limit |
|---|---|---|---|---|---|---|
| J6.1 | Signed-in phone opens a join link: status line on the map (`IndexWaterTask` `setMessage`) | You're already in. | You're already in the game on this phone. (= J2.14) | הטלפון הזה כבר במשחק. | One string for one fact | ≤ 12 words |
| J6.2 | Signed-out welcome (`WELCOME_COPY.signedOut`, a draft): also seen by a removed member and by a phone whose join request expired after a reload | Open your personal invitation link to join the game, or ask your guide for a new one. | Open your invitation or join link to play, or ask your guide for a new one. | פתחו את קישור ההזמנה או ההצטרפות כדי לשחק, או בקשו קישור חדש מהמדריך. | Players who joined by the team link never had a "personal invitation" (C3); this one line now fits both ways in | ≤ 18 words |
| J6.3 | Removed member's phone **(new slot, owner choice, open question 4)** | *(none: lands on J6.2)* | You're no longer in this team. Talk to your guide. | את/ה כבר לא בקבוצה הזאת. דברו עם המדריך. | Plain and not accusatory; points to the adult in charge. Needs the server to tell "removed" from "signed out" | ≤ 12 words |
| J6.4 | Share sheet title (`navigator.share`), seen in the recipient's messaging app preview | Join our team in The Amazing Shuk | Join our team in The Amazing Shuk *(keep)* | הצטרפו לקבוצה שלנו ב{Hebrew game title [TO VERIFY]} | Warm, says what it is; no personal data in the title | ≤ 40 chars |

## 3. Leader's phone (and the guide's): Group tab and under the lobby

Screen ID: **G-T1** team members panel (`PreviewJoinRequests`). The guide sees the same panel, so wording uses "the team" where "your team" would be wrong for the guide.

### G-T1 heading and space

| ID | Location | Current | Proposed (EN) | Hebrew draft | Rationale | Limit |
|---|---|---|---|---|---|---|
| L1.1 | h2 | Team members | Team members *(keep)* | חברי הקבוצה | Clear for leader and guide | ≤ 24 chars |
| L1.2 | Count under h2 | Space: 3 of 5 | 3 of 5 places filled | 3 מתוך 5 מקומות תפוסים | "Space" is a plan word that reads oddly aloud; "places filled" counts people let in and on the way (matches `placesTaken`) | ≤ 24 chars |
| L1.3 | Full line | Your team is full. | The team is full. | הקבוצה מלאה. | Works for leader and guide (C12) | ≤ 24 chars |

### G-T1 join link card

| ID | Location | Current | Proposed (EN) | Hebrew draft | Rationale | Limit |
|---|---|---|---|---|---|---|
| L2.1 | Button when the team has no link | Invite players | Invite players *(keep)* | הזמנת שחקנים | Says the goal, not the mechanism | ≤ 22 chars |
| L2.2 | Help once this phone holds the link | Anyone with this link can ask to join. You decide who gets in. | Anyone with this link can ask to join. You decide who gets in. *(keep)* | כל מי שיש לו את הקישור יכול לבקש להצטרף. אתם מחליטים מי נכנס. | Explains safety in two short sentences | ≤ 20 words |
| L2.3 | Second help line **(new slot)** | *(none)* | Share it now. If you leave this screen, you'll need a new link. | שתפו עכשיו. אם תצאו מהמסך הזה, תצטרכו קישור חדש. | The link lives in memory only (owner refinement 1); without this, a leader shares later and finds it gone, then replacing cancels people already waiting | ≤ 14 words |
| L2.4 | Button | Share link | Share link *(keep)* | שיתוף | Two-up row | ≤ 12 chars |
| L2.5 | Button | Copy link | Copy link *(keep)* | העתקה | Two-up row | ≤ 12 chars |
| L2.6 | After copy | Link copied. | Link copied. *(keep)* | הקישור הועתק. | | ≤ 16 chars |
| L2.7 | Copy failed (clipboard refused) | Could not get a join link. Try again. (reuses `linkFailed`) | Couldn't copy the link. Try Share link instead. **(new slot)** | לא הצלחנו להעתיק. נסו "שיתוף". | The current line wrongly says the link wasn't made (C8). Where Share isn't available it falls back to Copy, see C8 | ≤ 12 words |
| L2.8 | Making the link failed | Could not get a join link. Try again. | Couldn't make a link. Check your signal and try again. | לא הצלחנו ליצור קישור. בדקו קליטה ונסו שוב. | Names the likely cause outdoors | ≤ 12 words |
| L2.9 | The team has a link this phone doesn't hold | Your team already has a join link, but this phone doesn't hold it. A new link stops the old one and cancels requests still waiting. (26 words) | The team's link isn't on this screen anymore. | הקישור של הקבוצה כבר לא מופיע במסך הזה. | Split in two: first the situation (here), the consequence only when it matters (L2.11) | ≤ 12 words |
| L2.10 | Button | Get a new link | Make a new link | יצירת קישור חדש | "Make" matches L2.8; full width | ≤ 22 chars |
| L2.11 | Confirm text **(today the same L2.9 text shows again)** | (L2.9 repeated) | A new link stops the old one. Anyone still waiting will need to ask again. | קישור חדש מבטל את הישן. מי שמחכה יצטרך לבקש שוב. | Says the cost in people's terms; approved requests stand, so "still waiting" is exact | ≤ 16 words |
| L2.12 | Confirm button | Yes, replace the link (21 chars, wraps in a two-up row) | Replace link | החלפת קישור | Fits the two-up row; the sentence above carries the warning | ≤ 12 chars |
| L2.13 | Cancel | Cancel | Cancel *(keep)* | ביטול | | ≤ 12 chars |
| L2.14 | Server: not the leader session (rare: the panel only reaches leader and guide) | Only your team's leader or the guide can invite players. | Only your team leader or guide can invite players. | רק ראש הקבוצה או המדריך יכולים להזמין שחקנים. | Shown if leadership moved while the screen was open | ≤ 12 words |
| L2.15 | Server: a link exists and `replace` wasn't sent (race between two phones) | Your team already has a join link. Replace it to get a new one. | The team already has a link. Tap Make a new link to replace it. | לקבוצה כבר יש קישור. הקישו על "יצירת קישור חדש" כדי להחליף אותו. | Names the real button | ≤ 14 words |

### G-T1 requests

| ID | Location | Current | Proposed (EN) | Hebrew draft | Rationale | Limit |
|---|---|---|---|---|---|---|
| L3.1 | h3 | Asking to join | Asking to join *(keep)* | מבקשים להצטרף | Mirrors the joiner's button | ≤ 24 chars |
| L3.2 | Empty | No one is waiting to join. | No one is asking right now. | אין בקשות כרגע. | Shorter; "right now" hints that it updates by itself | ≤ 8 words |
| L3.3 | Row without a name | No name given | No name given *(keep)* | בלי שם | Recognition then rests on the code, which is the point | ≤ 16 chars |
| L3.4 | Code label | Code | Code *(keep)* | קוד | Short; the joiner sees "this code" | ≤ 8 chars |
| L3.5 | Button | Let in | Let in *(keep: plan word)* | הכנסה | Warmer and plainer than "Accept/Approve"; two-up row | ≤ 12 chars |
| L3.6 | Button | Decline | Decline *(keep)* | דחייה | Neutral; two-up row | ≤ 12 chars |
| L3.7 | Spoken labels for L3.5 / L3.6 **(new: today every row says only "Let in")** | *(none)* | Let in {name or "no name"}, code {code} · Decline {name or "no name"}, code {code} | הכנסת {name}, קוד {code} · דחיית {name}, קוד {code} | With several rows a screen reader hears identical buttons (C7) | ≤ 12 words |
| L3.8 | Row after Let in, until the phone collects | Let in, joining… | Let in. Joining now… | הוכנס. מצטרף/ת עכשיו… | Two short ideas, read at a glance | ≤ 22 chars |
| L3.9 | Help beside a disabled Let in when the team is full **(new slot)** | *(none: the button greys out, the reason is far above)* | The team is full. | הקבוצה מלאה. | A greyed button needs its reason beside it; one short line, not repeated per row (show once above the list) | ≤ 24 chars |
| L3.10 | Help for an approved request that never collects **(new slot, optional)** | *(none)* | If their phone doesn't join, the place frees up by itself. | אם הטלפון לא מצטרף, המקום יתפנה מעצמו. | An approved request holds a place for a while and can't be declined; this stops a leader worrying without quoting the 15 minutes | ≤ 12 words |

### G-T1 members

| ID | Location | Current | Proposed (EN) | Hebrew draft | Rationale | Limit |
|---|---|---|---|---|---|---|
| L4.1 | Subheading over the members list **(new slot)** | *(none: `aria-label` "Team members" repeats the h2)* | In the team | בקבוצה | Without it the members look like more requests under "Asking to join" (C6) | ≤ 24 chars |
| L4.2 | Tag | You | You *(keep)* | את/ה | | ≤ 8 chars |
| L4.3 | Tag | Leader | Team leader | ראש הקבוצה | Same words as the joining phone ("your team leader") | ≤ 12 chars |
| L4.4 | Button | Remove | Remove *(keep)* | הסרה | | ≤ 12 chars |
| L4.5 | Confirm sentence **(new slot: today the buttons swap with no sentence)** | *(none)* | Remove {name}? Their phone leaves the game. The team keeps its points. | להסיר את {name}? הטלפון שלו/ה ייצא מהמשחק. הנקודות נשארות לקבוצה. | Says the effect on the person and reassures that progress is safe (progress belongs to the team) | ≤ 16 words |
| L4.6 | Confirm button | Yes, remove | Yes, remove *(keep)* | כן, להסיר | Two-up row | ≤ 12 chars |
| L4.7 | Cancel | Cancel | Cancel *(keep)* | ביטול | | ≤ 12 chars |
| L4.8 | Spoken label for Remove **(new)** | *(none)* | Remove {name} | הסרת {name} | Identical buttons per row otherwise (C7) | ≤ 6 words |

### Action results (server `message` / `error`, shown in the status line)

| ID | When | Current | Proposed (EN) | Hebrew draft | Rationale | Limit |
|---|---|---|---|---|---|---|
| L5.1 | Let in succeeded | Let in. Their phone will join in a moment. | Let in. Their phone joins in a moment. | הוכנס. הטלפון יצטרף בעוד רגע. | Present tense, shorter | ≤ 10 words |
| L5.2 | Decline succeeded | Request declined. | Request declined. *(keep)* | הבקשה נדחתה. | | ≤ 6 words |
| L5.3 | Remove succeeded | Removed from the team. | {name} left the team. *(or keep the current line if the name isn't available to the message)* | {name} יצא/ה מהקבוצה. | Names who; neutral verb | ≤ 8 words |
| L5.4 | Let in twice (replay or two phones) | They're already let in. | Already let in. | כבר הוכנס. | Not an error for the leader; shortest form | ≤ 6 words |
| L5.5 | Let in a declined request | This request was declined. | This request was declined. *(keep)* | הבקשה הזאת נדחתה. | | ≤ 8 words |
| L5.6 | Decline after Let in | They're already let in. | Already let in. You can remove them once they've joined. | כבר הוכנס. אפשר להסיר אחרי שיצטרף. | Gives the real path | ≤ 12 words |
| L5.7 | Request expired before the decision | This request has expired. Ask to join again. (`JOIN_REQUEST_GONE`, written for the joiner) | This request expired. | הבקשה פגה. | The leader can't "ask to join again"; the joiner's wording reaches the leader today (C5) | ≤ 6 words |
| L5.8 | Let in when full | This team is full. Ask your guide. (`TEAM_FULL`) | The team is full. | הקבוצה מלאה. | "Ask your guide" is wrong for the guide and unhelpful for the leader (C5) | ≤ 6 words |
| L5.9 | Not the leader session / not this team | Only your team's leader or the guide can do that. | Only your team leader or guide can do that. | רק ראש הקבוצה או המדריך יכולים לעשות את זה. | Consistent with L2.14 | ≤ 10 words |
| L5.10 | Remove someone not in the team (stale screen) | That person isn't in your team. | They're not in the team anymore. | הם כבר לא בקבוצה. | The usual cause is a stale screen, not a mistake | ≤ 8 words |
| L5.11 | Remove the leader (blocked; the button is hidden, server backstop) | The team leader can't be removed. | The team leader can't be removed. *(keep)* | אי אפשר להסיר את ראש הקבוצה. | Rarely seen | ≤ 8 words |

## 4. Implementation notes for Codex (copy only; no code written here)

- **Duplicated strings that are compared:** `ALREADY_IN`, `JOIN_LINK_UNUSABLE` and `JOIN_REQUEST_GONE` live in `participant-store.ts` and again in `TEAM_JOIN_COPY`, and `IndexTeamJoin` compares `error === TEAM_JOIN_COPY.alreadyIn`. Approving new wording means changing both, or better, deciding by HTTP status/an error code and keeping visible copy only in `team-membership.ts`.
- **Audience-specific server strings:** `TEAM_FULL` and `JOIN_REQUEST_GONE` are written for the joining phone but also come back to the leader's and guide's let-in actions (L5.7, L5.8). Either separate strings per action, or map by status in the client.
- **Tests assert copy:** `team-membership-ui.test.ts` matches "Space: 3 of 5", "Your team is full", "Get a new link", "Let in", "Remove", "Share link", "Copy link", "No name given". They change with the approved wording.
- **Names:** every `{name}` is the participant's cleaned display name (1–40 characters, any script); wrap in `<bdi>` so a Hebrew name inside English copy (or the reverse) keeps its order.

## 5. Conflicts found between the built I3b flow and the plan or the rules

| # | Built (0ad9200) | Plan or rule | Effect | Suggested fix (owner/Codex) |
|---|---|---|---|---|
| C1 | With `SHUK_JOIN_LINKS` off, a phone opening a `#join=` link still sees the Ask form (status 404 is read as "gone", the link is present), then gets "isn't valid anymore. Ask your team leader for a new one." | Plan: the kill switch hides the join UI ("the UI hides Invite players"); only the leader side is hidden | A player is sent to a leader who can't make a link | Treat a 404 on the status read as "links off" and show J2.8 without the form; J2.8 wording already says "or guide" |
| C2 | After a reload the `#join=` fragment is gone; an expired request then falls back to the signed-out welcome, and "Ask to join again" is lost | Plan: a reload finds its request again (true while it lives) | The player is told to use a personal invitation they never had | Show J5.2 when the cookie's request has gone and no link is held (needs the client to know a request existed) |
| C3 | A removed member's phone lands on the welcome's "Open your personal invitation link…" | Plan: removal ends every session at once (done) | Wrong instructions for anyone who joined by link | J6.2 now; J6.3 if the owner wants an explicit line |
| C4 | Visible copy duplicated in server and client and compared by equality | `coding.md`: copy lives with the feature, Preview never invents copy | An O16 edit in one place silently breaks "already in" | See section 4 |
| C5 | `TEAM_FULL` ("Ask your guide") and `JOIN_REQUEST_GONE` ("Ask to join again") reach the leader and the guide | Brief: feedback is clear and right for the person reading it | The guide is told to ask the guide | L5.7, L5.8 |
| C6 | The members list has no visible heading; its `aria-label` repeats the h2 | One idea per block; screen-reader structure | Members read as part of "Asking to join" | L4.1 |
| C7 | Repeated "Let in", "Decline" and "Remove" buttons without a per-row accessible name | Brief: screen-reader labels are part of every component | Screen-reader users can't tell rows apart | L3.7, L4.8 |
| C8 | A clipboard failure shows "Could not get a join link"; when `navigator.share` is missing, Share falls back to Copy, and the link is never shown as text | Plan: Share and Copy only (O15) | If the clipboard is refused there is no way to pass the link on | L2.7; consider showing the link as selectable text on the leader's phone (not a secret to its holder). Owner/Codex decision |
| C9 | The session collection retries every 2 s but shows "Check your connection and try again" | Brief: offline states are understandable | The player taps nothing and waits, confused | J3.7 |
| C10 | The checking stage shows only the eyebrow | Brief: every screen defines its loading/offline state | Looks frozen on weak signal | J1.1 |
| C11 | "Space: N of 5" | Plan names "Space" as an O16 word | Not a conflict; flagged as an O16 choice | L1.2 |
| C12 | "Your team" lines appear on the guide's phone | Guide isn't a member | Minor wording error for the guide | L1.3, L2.9, L2.15 |
| C13 | The joiner's name field says "Your name"; minors may type full names | Privacy and minors rules; names are labels only | More personal data than needed | J2.4 (first name) |
| C14 | An approved request that never collects shows "Let in, joining…" for up to 15 minutes, with no action (decline is refused) | Plan: approved uncollected requests expire after 15 min and hold a place | Leader can't tell why a place is taken | L3.10 |

Nothing in this deck adds a historical claim, a place fact or a new permission. It doesn't touch the Memory Protocol.
