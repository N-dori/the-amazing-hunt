# Content rules (game)

## The knowledge folder (top-level rule, owner, 3 Nov 2026)

`docs/knowledge/` is where the games get their useful facts from. **A piece of knowledge belongs there because it can serve a purpose for a challenge**: a story to tell, a detail to find, a question to ask or a reveal to give.
- **Write it, then lock it.** Once a piece is in `docs/knowledge/`, don't rewrite or delete it without the owner's explicit approval; add to it instead.
- **Research feeds it.** Web research goes to `research/results/` first. The parts that can serve a challenge are imported into `docs/knowledge/` with their source and their evidence label, so a challenge never has to dig them out of a research run.
- **Being there doesn't make it a fact.** Every piece keeps its evidence label (below): a guide's story stays an attributed tradition, and a claim marked "verification required" stays unverified.
- Challenges draw their content from `docs/knowledge/` first.

## Ways to answer and ways to verify (top-level rule, owner, 3 Nov 2026)

- **Ways to answer:** the way a group answers should be unexpected, never always the same. Choosing, typing, matching, finding, saying aloud, and **taking a photo** are all forms. A photo is one form among many, not for every challenge.
- **Ways to verify:** pick the **cheapest solution that works** for each challenge: code checking a typed or chosen answer, the group's own confirmation, the guide, or an image-analysis API for a photo. The method is decided per challenge with the owner. Points and unlocks are still computed by code from the verification's result.
- This opens the door to more answer ideas; propose them.

## Sources of truth

The repo holds two separate games, each with its own sources.

**The Memory Protocol**
- **Story:** `docs/knowledge/The_Memory_Protocol_Story_V1(1).md` is locked for the Memory Protocol game. Never rewrite it, rename the Israelianes or HARMONY, or change the premise without the user's explicit approval.
- **Working plan:** `docs/knowledge/Memory_Protocol_New_Chat_Handoff_v02.md`: gameplay, scoring proposal, evidence boundaries and open questions.

**The Amazing Shuk** (Nahlaot and Mahane Yehuda)
- **Brief:** Part 2 of `research/prompts/DORI_UXUI_Designer_Agent_Prompt(1).md`, plus the mission and task ideas and photo index in `design/inputs/content/`. The Memory Protocol story is not a source for this game: no HARMONY, Israelianes, parallel Earth, library act or crisis layer.
- The ideas file tags content DOC, FIELD, ORAL or FOLK. Map them to the labels below: DOC and FIELD (seen on site) → Historical fact; ORAL and FOLK → Attributed tradition.

**Both games**
- **Research:** `research/results/`. These are dated web research results, not approved content. A claim moves into the game only after the user approves it.
- **Method:** `docs/content/methodology.md`. Keep treatment, interaction, question, source, guide move and renderer separate.
- **Experience design:** to turn content into a mission, an interaction or the game-wide arc, use `/experience-design` (`.claude/skills/experience-design/`). It works inside these rules.

## Copy

- Do not invent or paraphrase visitor-facing copy. If approved wording is missing, leave a clearly marked content gap (e.g. `TODO(copy): …` in data, never shown as if final) and report it.
- English first. Hebrew, Ladino or Arabic words appear with the `.rtl` class where needed, and with transliteration where players need it.

## Evidence labels

Every piece of content carries one label, and the app shows it:
- **Historical fact**: supported by a cited source.
- **Interpretation**: a reasoned reading of sources.
- **Attributed tradition**: a guide's or community's story that hasn't been corroborated.
- **Fiction**: in the Memory Protocol, HARMONY, the Israelianes, the parallel Earth and the contemporary crisis scenarios. The Amazing Shuk has no fictional frame; use Fiction there only for an invented game device (e.g. an altered "what's missing" image).

**The Amazing Shuk shows no labels** (owner's decision, 26 Oct 2026). The data still gives every statement its label, and the text itself carries the hedge a tradition or interpretation needs ("It's told that…", "Sources differ…"). The app shows the text only, with one neutral heading over the text after an answer ("Behind the answer", draft).

Never mix them in one statement. A novel (e.g. *The Beauty Queen of Jerusalem*) is evidence of how its author portrays something, not of what happened.

## Specific boundaries from the handoff

- Do not attribute specific contracts or market-wide price effects to Rami Levy without a source.
- A catalog identifier alone does not prove a book was read; pair it with a passage-dependent answer.
- Confirm what an archival photo actually shows before building a visual task on it.
- No photographs or recordings of bystanders or vendors without consent. The family-memory recording is opt-in and never published automatically.
- Camera, microphone or location is never the only way to complete a task; there is always a text or guide-confirmation path.
- No timed or competitive play at the hostage remembrance exhibit.
