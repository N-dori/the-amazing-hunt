# Run 11: photo challenges where image analysis adds something

| | |
|---|---|
| **Date** | 4 Nov 2026 |
| **Method** | Claude on the web, web search on, run by the owner from [prompt 11](../../prompts/11_image_analysis_challenge_ideas.md) (the report "Photo Challenges Worth Verifying"); cleaned and cut by Claude Code |
| **Status** | Research result, **not approved content** and not a decision ([content.md](../../../.claude/rules/content.md)). Ideas worth keeping are collected in the [image-analysis ideas](../../../design/inputs/content/challenge-ideas/image-analysis/image-analysis-ideas.md) |
| **Labels** | OBSERVED (a cited source says it), INFERRED (the run's reasoning), UNKNOWN |
| **Followed by** | [Run 10b](10b_photo_answer_verification.md), which turned this run's verification part into a check, a fallback and an unsure path per challenge type |

**What was cut:**
- the player prompts quoted for each of the five best ideas, the "Take a great challenge photo" tips (§5) and similar wording: invented copy that can't go into the app ([content.md](../../../.claude/rules/content.md), "Copy");
- the "verification contracts" table and the pilot protocol, now covered in more detail by run 10b §1 and §8;
- repetition between the table and the five best.

**Caveats:** the precedents are products that run photo missions or visual recognition, not proof that the proposed challenge can be judged automatically. App-store claims are not accuracy benchmarks. The ranking is the run's editorial judgment, not a measured result. Nothing was re-checked by Claude Code.

## Summary

1. **The test for a photo challenge** (INFERRED): would replacing the camera with a multiple-choice question lose something important? Use a photo when it gives the freedom to find your own example, a way to inspect a distant detail, a then-and-now image, or a group's creative picture. Otherwise prefer a typed answer or a contextual clue.
2. **Five ideas suit this walk best** (INFERRED): Stone Safari, the Secret Above Your Head, the Jerusalem Time Machine, Market Rainbow and the Mural Comes Alive (§2).
3. **Check eligibility, not quality** (INFERRED): a model can check that a carving, a detail or the required hands are in the picture, never which family's picture is best.
4. **Creative photos aren't auto-marked elsewhere either** (OBSERVED): Actionbound states that creative picture and video missions are not marked correct automatically.
5. **If a photo only replaces "type the name on the plaque"**, so that OCR can read it, the camera adds little (INFERRED).
6. **Suggested first mix** (INFERRED): three visual-discovery tasks, one rephotography task and one free creative task, each with a typed answer always available.

## 1. The twenty ideas, best first

Ranked by the value the photo adds, fit for mixed-age families, how easily examples are found in old streets and market lanes, how objectively it can be checked, and privacy. The run's precedents are OBSERVED; every adaptation and check is INFERRED.

| # | Idea: what players do | Precedent | What a model checks | Main risks · privacy |
|:--:|---|---|---|---|
| 1 | **Stone safari:** photograph *any* carved animal, flower, star or other motif on a public exterior | Goosechase camera missions (13 Aug 2026); Kaptr (13 Sep 2026) | A carved or relief motif on a real wall | Painted motifs look carved; tiny details · Low |
| 2 | **Secret above your head:** zoom in on a small emblem, date or inscription above a doorway, from a safe public spot | Smartify artwork identification; Google Arts & Culture | That detail or inscription; OCR if it has text | Zoom blur, glare, Hebrew lettering · Low |
| 3 | **Jerusalem time machine:** find where a historical street photo was taken and recreate it | re.photos, Rephotograph (repeat-photography apps) | Stable landmarks, framing and viewpoint despite changes | Changed facades, crowds, cars · Medium |
| 4 | **Mural comes alive:** copy a mural figure's pose, or add hands or a shadow to it without touching the wall | Goosechase creative camera missions (4 Aug 2026) | Mural present; approximate pose or hand position | Subjective; occlusion · Medium–High if children's faces show |
| 5 | **Street-art detective:** find any mural or shutter painting of an animal, instrument, face or creature | Goosechase; Kaptr's AI-identified photo collections | Artwork plus subject category, no reference photo needed | Abstract art; graffiti changes · Low–Medium |
| 6 | **Heart frame:** frame a detail with hands in a heart shape | Goosechase creative tasks | Gesture, artwork in the frame | Hands hide the detail · Medium, unless faces are left out |
| 7 | **Market rainbow:** three different objects of one bright colour in one picture | Google Arts & Culture Art Palette; Kaptr | Three distinct objects, one broad colour family | Shadows, white balance · Medium at crowded stalls |
| 8 | **Look up:** a decorative balcony, window trim or other public-facing feature | Google Lens; Smartify | Architectural category and details | Steep angles · Low–Medium; never through windows |
| 9 | **Spot a historical difference:** compare old and new views, photograph one feature that lasted or changed | Repeat-photography apps | Align views, isolate the difference | Weather and angle vs real change · Low–Medium |
| 10 | **Material detective:** two similar elements of different materials (stone and iron) | Visual-search products | Two objects, estimated material | Painted metal looks like wood · Low |
| 11 | **Find a Hebrew letter** on a public inscription or sign | Google Lens text recognition | OCR plus the letter's context | Decorative lettering, glare · Low |
| 12 | **Market geometry:** three circles or two triangles in buildings or stalls | Goosechase category tasks | Shapes and count | Perspective, repeated patterns · Low–Medium |
| 13 | **Shadow storyteller:** a shadow that looks like a letter or animal | Museum Hack photo activities (2015); variant INFERRED | Plausible shape; best left to people | Very subjective; needs sun · Low |
| 14 | **Market still life:** three kinds of produce in one picture, without moving goods | Goosechase; Kaptr | Three produce classes | Similar produce; vendors' consent · Medium |
| 15 | **Visual rhyme:** two unrelated objects with the same shape or colour | Google Art Palette | Two categories, one shared attribute | Ambiguity · Low |
| 16 | **Photo bingo:** a row of different categories (doorway, flower, motif, handwritten sign) | Kaptr photo bingo (13 Sep 2026) | One category per square; no duplicates | Broad categories, repeats · Low–Medium |
| 17 | **Find the larger picture:** from a tiny crop, find the whole object and photograph it from another angle | Goosechase image clues (10 Sep 2025) | Crop matches the scene (feature matching) | Similar walls; changing art · Low |
| 18 | **Meaningful place:** something that makes the neighbourhood feel welcoming, plus one sentence why | Museum Hack; photovoice methods | Topical relevance only; never grade meaning | Unfair rejections · Medium |
| 19 | **Collection cards:** your own photos of stonework, street art, produce and ironwork as a souvenir | Kaptr object collections | Category; no duplicates | Misclassification · Low–Medium |
| 20 | **Old and new:** two public features that look like different eras, and the story they suggest | Photovoice and walking-interview research | Recognise objects; never date them confidently | Guessing history from looks · Medium |

**UNKNOWN:** how often automatic judging succeeds for any of these in Jerusalem's light, crowds and phones. Each needs testing on the route.

## 2. The five best for this walk

| Idea | Where | Why it needs the camera (INFERRED) | Check | Risk · privacy |
|---|---|---|---|---|
| **Stone Safari** | Nahlaot | Many correct answers; players scan their surroundings instead of decoding one answer | A carving and an allowed motif, with enough wall in view. GPS gates the stop but doesn't prove where the photo was taken | Painted or tiny motifs · Low |
| **The Secret Above Your Head** | Nahlaot | The zoom is the way to look: it shows a detail a child can't see unaided | Known-object matching, or OCR for an inscription | Blur, shadow, reflective letters, private windows · Low on public exteriors |
| **Jerusalem Time Machine** | A historical viewpoint that still stands | The past/present pair is the outcome, not just evidence; a before/after slider can be the reward | Positions of stable architectural features, tolerant of change | Changed facades, alignment · Medium |
| **Market Rainbow** | Mahane Yehuda | Players compose something new from a changing place | Three distinct objects and one broad colour family, never an exact colour | Sun, busy backgrounds, stall etiquette · Medium |
| **The Mural Comes Alive** | Market street art | The result is the team's own new picture | The mural and the hands or shadow are visible; never score looks, humour or feeling | Subjective; pose detection · Medium, avoid faces |

| Idea | Discovery | Creativity | Automatic checking | Suggested check |
|---|---|---|---|---|
| Stone Safari | Very high | Medium | Medium | Category-level vision |
| Secret Above Your Head | High | Medium | High if the detail is distinctive | ORB or OCR |
| Time Machine | Very high | High | Medium | Geometric alignment |
| Market Rainbow | High | High | Medium | Object and colour recognition |
| Mural Comes Alive | Medium | Very high | Low–Medium | Eligibility check, optional guide |

All ratings INFERRED, not tested. Run 10b §1 replaces the "suggested check" column for build decisions.

## 3. Ideas to avoid

| Avoid | Why (INFERRED) | Instead |
|---|---|---|
| A stranger in a particular outfit | Photographing people without consent, children included | An object of a particular colour |
| Vendors' or customers' faces | Interruption, consent, privacy | A display, from a suitable public spot |
| Looking through windows or doors | Intrudes on private life | Details on public exteriors |
| The highest or hardest-to-reach detail | Invites climbing, road crossings, unsafe positions | A detail visible from a named safe spot |
| Lookalikes of real people | Profiling by appearance | A teammate's hands, a silhouette, a consenting pose |
| Guessing age or emotion from faces | Unreliable; needless biometric exposure | Non-facial shapes or gestures |
| "Which family looks happiest?" | Unfair, subjective AI judgment of children's faces | Human appreciation or a reward for taking part |
| Counting people in the market | Counts change; privacy | Count fixed motifs, arches or displays |
| Ranking religious or political symbols | Needless cultural sensitivity | Respectful, factual visual-history questions |
| Finding or making fresh graffiti | Could encourage damage or unsafe access | Existing public art only, never altered |

## 4. Capture findings (not copy)

INFERRED: the object should be whole but large in the frame, as straight-on as is safe, steady and free of reflections and passers-by. Plaques need legible text with all four corners in view; murals need the detail plus some of the surrounding painting; archival matches should rely on fixed architecture, not vehicles or people. Run 10 §7 and run 10b §2 add measured OCR limits.

## 5. Remaining gaps

- **UNKNOWN:** no independent accuracy benchmark for AI photo-hunt services on any of these tasks.
- **UNKNOWN:** product listings change; any third-party service's claims about privacy or AI scoring need checking before use.
- **UNKNOWN:** whether each motif, mural, safe viewpoint or market arrangement exists on the route needs checking on site.
- **INFERRED:** a precedent shows an interaction is feasible, not that it suits Jerusalem families or is accurate.

## Source register

| Publisher | Date | Link | Used for | Type |
|---|---|---|---|---|
| Goosechase | 13 Aug 2026 | [Creating your Missions](https://support.goosechase.com/en/articles/4437526-creating-your-missions) | Camera, text and GPS mission types | Primary documentation |
| Goosechase | 4 Aug 2026 | [How to create a Camera Mission](https://support.goosechase.com/en/articles/5803554-how-do-i-create-a-camera-mission) | Creative missions, live capture, feed privacy | Primary documentation |
| Goosechase | 10 Sep 2025 | [Add an image or link to a mission](https://support.goosechase.com/en/articles/12261246-how-do-i-add-an-image-or-link-to-my-mission) | Reference-photo and crop clues | Primary documentation |
| Actionbound | Checked 4 Nov 2026 | [Mission documentation](https://en.actionbound.com/help/article/mission) | Creative missions not marked automatically | Primary documentation |
| Kaptr | 13 Sep 2026 (listing update) | [Kaptr: Daily Photo Challenge](https://play.google.com/store/apps/details?id=app.kaptr.kaptr) | Claimed AI photo scoring, collections, bingo | Primary product claim |
| Pokémon GO / Niantic | 20 Oct 2020 | [AR Mapping tasks](https://pokemongo.com/news/armapping-researchtask?hl=en) | Location-linked camera tasks | Primary announcement |
| Google Arts & Culture | Checked 4 Nov 2026 | [Experiences / Art Palette](https://about.artsandculture.google.com/experience/) | Colour-based visual exploration | Primary product material |
| Smartify | Checked 4 Nov 2026 | [Smartify](https://play.google.com/store/apps/details?id=com.mobgen.smartify) | Artwork identification by camera | Primary product listing |
| Museum Hack | Apr 2015 | [How to Hack Your Museum (PDF)](https://museumhack.com/wp-content/uploads/2015/04/White-Paper-Three-Activities-April-2015.pdf) | Open-ended photo activities | Primary; older |
| re.photos | Checked 4 Nov 2026 | [re.photos](https://apps.apple.com/us/app/re-photos/id6761025778) | Old/new photo recreation | Primary product listing |
| Rephotograph | Checked 4 Nov 2026 | [Rephotograph](https://play.google.com/store/apps/details?id=com.rephotograph.app) | Historical image alignment | Primary product listing |
| *Health & Place* | 2024 | [Photovoice and young people's urban experience](https://doi.org/10.1016/j.healthplace.2024.103361) | How young people engage with places through photography | Primary research; check the design before detailed claims |
| Google Lens | Checked 4 Nov 2026 | [Google Lens](https://lens.google/) | Visual search and text recognition | Primary product documentation |
