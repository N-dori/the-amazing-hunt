# I4/I5 review: flexible team roles and a water-well pilot

**Status:** planning only (Claude, 31 Oct 2026). Awaiting the owner's decisions D1–D9 below; nothing built. Sources: [multiplayer plan](multiplayer-plan.md) (§5 Roles, §7 R1, I4, I5, I8, §10 gates), [product decisions](product-decisions.md) (29 Oct "Approved: adventure, teams, invitations and roles"), [the well record](water-task.md), the well code (`lib/amazing-shuk/water-measurement.ts`, `water-performance.ts`, `roles.ts`) and the `/experience-design` quality criteria. No web research was done.

## The proposal reviewed (owner, 31 Oct 2026)

- Navigator and Answer Submitter keep their current gameplay permissions.
- Detective/Spotter, Storyteller/Reader and Language Explorer are optional, flexible responsibilities. Photographer stays deferred.
- Team leaders may manage role reassignment in I4. One person may take several responsibilities when a team is small.
- Teams of 2–5 complete the same core adventure. Optional roles are never forced, and a bigger team doesn't automatically get harder play.
- For I5, the well is the pilot for adaptive cooperative clue distribution across team sizes 2–5, with the same learning outcome and at most a small set of variations.

## Verdict

The direction fits the approved design almost entirely. Approved decisions already cover the permanent roles (O7–O10), optional parts that are never required, Photographer deferred, and validating parts on the well first. Three points need the owner before I4/I5 start, and two of them are in the well itself:

1. **The well has a two-move shortcut.** The jar holds exactly 4 L and the target is 4 L (`WATER_CAPACITY = { small: 3, large: 5, jar: 4 }`), so the answer is fill 5 L, then pour into the jar. Whoever holds the 3 L vessel has nothing to do. Split controls can't create meaningful participation until this is resolved. `water-task.md` records it as an accepted rule consequence.
2. **Hidden timing penalises coordination.** The well awards 100/90/80 points by solve time (<2 min, 2–4 min, >4 min). Split controls and talking make every team slower than one person tapping alone. In effect that raises difficulty for anyone who plays cooperatively, which works against "no automatic difficulty increase".
3. **"Roles" or "parts".** The plan defines Spotter, Reader and Language Explorer as per-mission *parts*: dealt automatically, rotating, UI only, and anyone can swap or hand one on. The proposal calls them "responsibilities" and lets leaders reassign them. If that means adventure-long roles assigned by the leader, it conflicts with §5.

## Conflicts with current decisions

| # | Current decision | Proposal | Conflict and recommendation |
|---|---|---|---|
| C-a | Permanent roles are exclusive (one holder each); one person may hold both (`roles.ts`, product decisions) | Same, plus multiple responsibilities per person | **None.** Parts are already non-exclusive: "with fewer people than parts, one person holds several" (§5) |
| C-b | Parts are per-mission, dealt by `dealParts`, rotating; anyone swaps; UI only, no permissions (§5) | Optional "responsibilities"; leader manages reassignment | **Possible conflict.** Recommend keeping parts per-mission and self-service. The leader can also hand a part on, but nobody "owns" one, and parts never gate anything |
| C-c | I4 acceptance: "teams of 2 **and of 6** finish a mission" | Teams of 2–5 | **Outdated plan text.** The team cap is 5 (O6, enforced in I3b). Change the acceptance to 2–5 |
| C-d | Groups of **1–5** can start; Show all lets a solo player finish | Teams of 2–5 | **Decide whether a team of 1 is supported.** Today it is: a host alone can start. Recommend keeping 1 as a supported edge case through Show all, while designing for 2–5 |
| C-e | Part names other than Language Explorer are draft (O16 open) | Detective/Spotter, Storyteller/Reader | **Names are still open.** One name each is needed before any card ships (I5 gate) |
| C-f | Language Explorer needs verified Hebrew and I6; Hebrew story bodies stay out of production | Language Explorer as a flexible role | **No conflict, but not at the well.** The well's Hebrew is the transcript (lines 60–66), a story body, so it's excluded from production. Language parts start in I8 (gate, Chesed VeRachamim), after I6 |
| C-g | The well is timed, with speed-tiered points | No difficulty increase with size | **Effective conflict** (Verdict 2) |
| C-h | "Show all is always available" (§5) | Meaningful participation for everyone | **Tension.** Show all always on lets one person take over. Recommend Show all one tap away, framed for playing alone or for accessibility; the pilot observes how it's used |

## Recommended I4/I5 boundaries

**I4: permanent roles only (no parts).**
- In: Hand to… (`handGroupRole`); leader assign and clear for Navigator and Submitter within their own team; the vacant-seat fallback (claim and start or submit in one transaction); the "Submitter" label; the optional cheer-card prompt to rotate roles.
- Out: any optional part, part names, or a part-assignment UI.
- Acceptance: teams of 2, 3, 4 and 5 (and 1, if D4 keeps it) finish a mission with no guide help on roles. Leaders get no guide-only power (O7).
- Unchanged from the plan otherwise: files, tests, rollback, schema.

**I5: the parts mechanism, piloted on the well only.**
- In: `parts` on `MissionDefinition`; `dealParts(members, parts, missionIndex)` with a stored per-team deal; swap and hand on (anyone, including the leader); Show all; a "Your part" card; the well's vessel parts.
- Out: Spotter, Reader and Language parts on other missions (I8, one mission per release, each through `/experience-design`); Photographer (deferred); any part with permissions or scoring effect.
- Prerequisites: resolve the shortcut (D1) and the timing (D2) before the pilot runs, or the pilot measures the wrong thing.
- Acceptance as planned: a real-phone session with real participants, now covering at least two team sizes, ideally 2 and 4.

## Water-well pilot concept

**The learning outcome stays the same for every size.** The read-aloud story is unchanged. It's an attributed tradition: cleaning the cistern before the rains, a child lowered through a narrow opening, and children wanting the honour. The puzzle remains a marked game device ("Fiction · Puzzle scenario"), never presented as history. After the solve, the reveal returns to the story. What should stick: water was precious and measured carefully, and caring for the cistern was an honour.

**The core idea: the Jar keeper.** Water can't leave the family jar. That irreversibility is the puzzle's emotional core: a mistake can't be undone, like spilling a precious ration.
- Each measuring vessel's controls (fill, return to the well, pour into the other vessel) sit on its keeper's phone.
- **Only the Jar keeper can let water into the jar** ("Take from 5 L" or "Take from 3 L").
- Everyone sees all three levels. The keepers must convince the Jar keeper before anything goes in, so talking is the mechanic.
- This is a refinement of R1, where the source vessel pours. It is still UI only: the server keeps accepting every valid move.
- The Jar keeper has no arithmetic to do, only a judgement call. That suits a child or a grandparent, while the vessel keepers do the measuring.

**Deal by team size.** The puzzle and target are the same for every size, and there are never extra steps for bigger teams.

| Team | Parts |
|---|---|
| 1 | Show all (all controls on one phone) |
| 2 | A: both measuring vessels. B: Jar keeper (and story reader, if willing) |
| 3 | One each: 3 L keeper, 5 L keeper, Jar keeper |
| 4 | As for 3, plus the 5 L vessel shared by two (one pours, one tracks the litres aloud) |
| 5 | As for 4, plus the 3 L vessel shared by two |

Reader stays what it is today: a voluntary read-aloud with a guide fallback, not a dealt part.

**Physical discovery: honest status.** The well puzzle is digital and fails the hotel-room test on its own. The place's contribution today is the story told at Gan HaTut. One addition would make it physical: a Spotter part for teams of 4–5 that finds the cistern's opening, or the narrowness the story describes, in the garden. This is **gated on a field check**: `water-task.md` says the garden and cistern identity and public access are unverified, and no garden photo exists. Don't build it until the owner confirms what is actually visible.

**Variations: one at most.** The only candidate is the jar-capacity fix in D1, and it applies to everyone. The pilot doesn't propose a challenge bank or size-based variants. Several teams in parallel (I7a) don't need different answers either, because play is cooperative, compared only at the end, and the guide gives one shared reveal. Revisit only if playtesting shows copying or boredom.

**What the pilot observes** (a real-phone session, team sizes 2 and 4 at least):
- Does every person speak and act?
- Who sits idle?
- How often is Show all used, and by whom?
- How many irreversible jar mistakes happen, and do they spark talk or frustration?
- Total time.
- Afterwards, one dinner-test question: "Why did children want to clean the cistern?"

**Against the quality criteria:**
- **Collaboration:** strong once D1 is resolved, weak until then.
- **Mixed ages:** good. The Jar keeper's call needs no arithmetic.
- **Phone administration:** minimal. The deal is automatic, there's one card, and swapping is optional.
- **Historical authenticity:** preserved by keeping the tradition and the game device separate.
- **Physical discovery:** weak. This is the trade-off: the pilot tests collaboration, not place, unless the Spotter field check succeeds.

## Owner decisions needed

1. **D1, the well shortcut.** Either keep the 4 L jar, accepting that the 3 L keeper may have nothing to do, or make the jar larger than the ration, for example a 6 L jar with a 4 L ration line. With the larger jar every solution needs both vessels (2 + 2, or 1 + 3), and pouring the 5 L straight in overshoots irreversibly. The larger jar changes the owner-supplied question wording and the puzzle data. **Recommended: the larger jar.**
2. **D2, timing during the pilot.** Keep the speed-tiered points, give completion points only when parts are on, or measure the time but exclude it from points (the guide's existing exclude). **Recommended: measure but exclude it for the pilot.**
3. **D3, parts versus roles (C-b).** Confirm that Spotter, Reader and Language Explorer stay per-mission, self-service parts with no permissions, which the leader may also hand on. **Recommended: yes.**
4. **D4, team of 1 (C-d).** Keep solo play as a supported edge case through Show all, or require 2+. **Recommended: keep it.**
5. **D5, the Jar keeper rule.** Approve "only the Jar keeper lets water in", replacing R1's "source pours". **Recommended: yes.**
6. **D6, Show all placement (C-h).** One tap away rather than always on. **Recommended: yes.**
7. **D7, part names (O16).** One name each: Spotter or Detective; Reader or Storyteller; plus names for the vessel parts (draft: "3-litre keeper", "5-litre keeper", "Jar keeper").
8. **D8, the Spotter field check at Gan HaTut** before any physical part is designed.
9. **D9, plan housekeeping.** Change I4's acceptance from "2 and 6" to 2–5 (with 1 if D4 is kept). Record D1–D8 in the multiplayer plan and product decisions once decided.

## When implementation is later approved

I4 and I5 keep their planned tests (concurrent claims, fallback refused while the seat is held, a deterministic deal for 1–8 members, a refresh keeps the deal, Show all solo). Add these:
- With D1: tests that no solution exists without both vessels.
- With D5: a UI-only test that only the jar part shows the into-jar actions, while the server still accepts every valid move.
- The pilot acceptance stays a real-phone session with real participants.
