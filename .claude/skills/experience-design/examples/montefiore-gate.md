# Worked example: the Montefiore gate

**An illustration of the process, written 29 Oct 2026. Not an approved redesign: the mission in `lib/amazing-shuk/montefiore-task.ts` is unchanged. All proposed lines are drafts; the facts below come from the mission data and the content files, and the ones marked "to check" need field work or a source.** Depth: medium. No external research was done for this example.

## 1. The raw material

- **Now:** read a three-line story (1882 agreement, the Montefiore fund gave the land, Mazkeret Moshe next door for Ashkenazi families, a gate in his honour), then pick 3 of 5 languages. The stop works, but it's the same read-then-choose pattern as four other stops, and the answer can be guessed from the story's hint without looking closely.
- **Physically there:** a stone arch at Agripas and Hermon streets with three panels: English "SIR MOSES MONTEFIORE TESTIMONIAL", an Arabic-script panel, a Hebrew dedication beginning "אבני זכרון" ("stones of remembrance"). A round stone on top. Nearby, the "Picture in Stone" plaque about Ohel Moshe. (Mission data, owner's photos #05 and #02; on site, to check.)
- **Around it:** "Picture in Stone" plaques with family photographs on former family houses throughout Ohel Moshe, a 2004 community project (site verification run 06, verified). A second Montefiore-related entrance at Mazkeret Moshe, Agripas 85 (run 06; to check). Ohel Moshe was Sephardi, Mazkeret Moshe Ashkenazi, from one fund. Yemenite families also lived in Ohel Moshe (the plaque). Neighbourhood oven tales, pots exchanged, prayers hurried by the smell (attributed folklore, run 06).
- **Unknowns:** what the Arabic panel says exactly (TODO in data); why Arabic was chosen (no source, so any reason is interpretation and must stay out of the facts); the founding date is given variously as 1882 or 1883.

**What it's really about:** not "a gate with three languages", but *a threshold that tells you who it speaks to*, and *a community that chose to remember in stone*: the gate's own first words, "stones of remembrance", are what the neighbourhood later did with family photos on its walls.

## 2. Experiential opportunities

- Three scripts that most of the group can't all read, so no one person can read the whole gate.
- The words "stones of remembrance" over the entrance, and actual remembrance stones (family photos) a few steps inside: a hidden link the group can discover rather than be told. (The link is an interpretation; it needs the owner's approval.)
- Two neighbourhoods from one gift, side by side: a comparison people can walk.
- Stepping *through* a gate is a physical moment in itself.

## 3. Three concepts

- **A. Three readers.** Each phone gets a key to one script (letter shapes for the youngest, an alphabet card for the Arabic panel, the Hebrew for whoever reads it). Each person reads part of their panel off the stone; only together do they put the gate's message back together. *Principle:* split knowledge makes people need each other.
- **B. Twin gates.** Visit both entrances, Ohel Moshe and Mazkeret Moshe, and find what's the same and what's different. *Principle:* comparison makes people look. Costs a walk and depends on the second gate's field check.
- **C. Stones of remembrance.** Read the gate's first words, then step through and find a "Picture in Stone" plaque: who lived behind this gate? *Principle:* an ordinary street hides a layer of meaning; the reveal is that the gate's words described what you'd find inside.

## 4. Recommendation: A, then C

At the gate, the group reads it together (A), and the Hebrew reader's piece, "stones of remembrance", becomes the clue that sends everyone through the gate to find a family's photo in stone (C). B is the runner-up for a longer route.

Why: it uses the place twice (the panels, then the plaques), gives every age a real job, keeps the phone to a key and a prompt, and ends on a discovery the group makes rather than a fact they're handed. It also gives the gate a character none of the other stops has: *reading* the place. Gives up: the simple 3-of-5 check, and it needs more field work.

## 5. Journey (draft)

1. At the arch. One line sets it up: who gave this land, and the gate says thank you in three ways. Each phone shows a different script key. Phones down; everyone looks up.
2. Each reader finds their panel and calls out what they can: a name in English, letter shapes matched in Arabic, the Hebrew opening. The group pieces it together; the submitter enters the three languages, now *found*, not guessed.
3. The Hebrew reader's words, "stones of remembrance", come back as the next prompt: *the gate promises stones of remembrance. Can you find one inside?*
4. Through the gate, the group finds a "Picture in Stone" plaque and looks at the family on it (looking only; no photographing faces for the game).
5. Reveal: the 2004 project, and that this neighbourhood still remembers its families in stone. Bridge to the well, a few steps away in Gan HaTut.

## 6. Group and place

The youngest match letter shapes; teens tackle the alphabet card; a grandparent or the guide reads Hebrew; the navigator leads through the gate. The place supplies the answers (the panels) and the payoff (the plaques). Fallbacks: the guide reads a panel aloud; text-only keys.

## 7. The memorable moment

Turning from the gate's words to a family's face on a wall and realising the gate described it 140 years ago.

## 8. Educational payoff

People understand that Ohel Moshe was a gift to a community and a place that chose to remember; they notice scripts and plaques they'd have walked past; they leave with a question worth asking anywhere: *who is this sign speaking to?*

## 9. Feasibility, dependencies, risks

- Field checks: the Arabic panel's text and legibility; which plaque is nearest and readable; walking time through the gate; the second gate (for B).
- Source and copy: the "stones of remembrance" link is an interpretation for the owner to approve; all lines need the owner's wording; no claim about why Arabic.
- Build: a per-role "key" per phone extends the existing roles and shared state; answers stay deterministic.
- Overlap: the gate and the well already share the gate photo, and the well sits next door; the route order matters.
- Risk: too much reading at the arch; keep each key to one glance.

## 10. If asked to implement

Carry forward: the answer must come from the stone, not the screen; each phone shows something different; the "stones of remembrance" reveal waits until after the group has read the gate.
