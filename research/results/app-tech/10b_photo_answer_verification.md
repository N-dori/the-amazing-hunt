# Run 10b: verifying a photo answer — full re-run (prompt 10 v2)

| | |
|---|---|
| **Date** | 4 Nov 2026. Two passes on the same day: pass 1 fixed Run 10's weak spots; pass 2 ran prompt 10 v2 (Appendix A) and closed most open items |
| **Method** | Claude, agentic session, web search on. Every claim was read from a live page on 4 Nov 2026 unless dated otherwise |
| **Builds on** | [Run 10](10_photo_answer_verification.md) (3 Nov 2026); the *Photo Challenges Worth Verifying* report (4 Nov 2026), filed as [run 11](11_image_analysis_challenge_ideas.md) |
| **Status** | Research result. **Not approved content and not a decision.** The verify method is chosen per challenge with the owner. No player-facing copy |
| **Labels** | OBSERVED (a cited source says it) · INFERRED (this run's reasoning) · UNKNOWN · **CHANGED** (differs from Run 10) |

## Summary

1. **Run 10's core design stands** (INFERRED):
   - ORB feature matching with a RANSAC homography for fixed textured details.
   - Google Cloud Vision OCR for plaques with text.
   - At most two automatic attempts before another path opens.
2. **Self-guided default** (INFERRED, CHANGED). The default fallback is a **self-confirm plus a typed question about the object**. A guide is an optional extra, never assumed.
3. **Hebrew OCR differs by provider** (OBSERVED, CHANGED):
   - Google Vision: supported (`iw`), no Hebrew handwriting.
   - AWS Textract: Hebrew listed, but sync API coverage unclear.
   - Azure Read: **Hebrew not listed** for printed or handwritten text.
   - Tesseract: `heb` model exists.
   - So the shortlist is Google first and AWS second.
4. **Several models in Run 10 are deprecated or retiring** (OBSERVED, CHANGED):
   - **GPT-4.1 mini and GPT-5 mini** are both deprecated. OpenAI now points to **GPT-5.6 Terra** ($2 / $12 per M tokens).
   - **Gemini 2.5 Flash-Lite** retired on **Vertex AI on 20 Oct 2026**. The Gemini API showed "no shutdown date announced" as of 18 Oct 2026. Vertex replacement: **Gemini 3.1 Flash-Lite** ($0.25 / $1.50).
   - **Claude Haiku 4.5** is active, with retirement not before 15 Oct 2026. **Claude Haiku 5.5** is active until at least 7 Oct 2027, at $0.10 / $0.50.
5. **Cost does not decide anything** (INFERRED from OBSERVED rates). Every candidate except GPT-5.6 Terra costs **$0–1.50 per 1,000 checks** (§3, with arithmetic). Choose on unsure rate, false accepts, latency, privacy and how failure feels.
6. **Open-category, composition and creative challenges need different checks** (INFERRED). ORB can't verify "any carved motif". §1 gives each of the seven challenge types a check, a fallback and an unsure path. Creative and souvenir photos are never scored.
7. **Privacy is stricter than Run 10 implied** (OBSERVED, CHANGED). Under Amendment 13, "Especially Sensitive Data" includes **location data and biometric identifiers**. GPS gating plus team photos is in scope (§4).
8. **Photo tasks affect memory** (OBSERVED):
   - Photographing whole objects lowered recognition of them; zooming in on a detail did not (Henkel 2013).
   - Carrying a camera with intent to shoot raised visual memory and lowered memory of what was heard (Barasch et al. 2017).
   - Design rule (INFERRED): prefer detail-zoom tasks, and don't overlap photo tasks with narrated video or audio.
9. **Archive rights are mostly settled** (OBSERVED). The Library of Congress states the Matson photographs "are in the public domain", except the colour lantern slides. Route coverage is UNKNOWN.

## 1. Check, fallback and unsure path by challenge type

All rows INFERRED unless marked. "Self-confirm" = the team taps "we found it", then answers one typed question that needs the object, such as a name, a number or a colour.

| Challenge type | Example | Check | Fallback | Unsure path |
|---|---|---|---|---|
| **Fixed detail** | Mural detail; carved emblem; "find the larger picture" | ORB + RANSAC against 3–10 of our own reference photos, thresholds per stop (Run 10 §2) | Self-confirm | Retry once with no penalty; on the second unsure, open the fallback automatically |
| **Fixed text (Hebrew)** | Plaque naming artists | Google Vision OCR (`iw`), matching 2+ distinctive expected words after normalisation (Run 10 §2). AWS Textract as second choice after a sync-API Hebrew test | Typed answer of one word from the plaque | Same; a higher-resolution crop on the retry |
| **Zoom detail** | Emblem or date above a doorway | ORB on the zoomed frame (reference set must include zoomed shots); OCR if it has text | Typed clue answer | Same |
| **Open category** | "Any carved animal, flower or star" | Test two: (a) **zero-shot embedding**: Vertex multimodal embedding of the photo vs text prompts ("carved stone relief" vs near-miss prompts such as "painted mural", "sign"), accepting only above an absolute score *and* a margin; (b) **LLM restricted to `yes` / `no` / `unsure`** (Claude Haiku 5.5 or Gemini 3.1 Flash-Lite), with the photo treated as untrusted input | Self-confirm | Unsure on the first try → self-confirm offered at once (many valid answers; no reference set) |
| **Composition** | "Three different objects, one colour" | Same as open category; broad colour family, no exact colour match | Self-confirm | Same |
| **Creative** | Hands or shadow joining a mural | **No automated scoring.** Points for taking part. Precedent: Actionbound states creative picture or video missions aren't automatically marked correct ([Actionbound, read 4 Nov 2026](https://en.actionbound.com/help/article/mission), OBSERVED via the photo-challenge report, not re-read) | — | — |
| **Rephotography souvenir** | Archival view, recreated with the family | The photo is the *product*. Presence is verified by a typed question about the place, not by scoring the photo. Optional on-screen alignment overlay | Souvenir without faces (hands, backs) | — |

**Rules for every automated check** (INFERRED):
- The server alone awards points, once per team and stop.
- A timeout returns `unsure`, never `no`.
- Show a specific failure reason only when it was measured, such as blur.
- Never more than two automatic attempts.

## 2. Hebrew OCR support by provider (read from each language table, 4 Nov 2026)

| Provider | Hebrew printed | Hebrew handwriting | Source | Label |
|---|---|---|---|---|
| Google Cloud Vision | **Supported**, `languageHints` code `iw` (not `he`), script `Hebr` | Not listed | [Vision OCR languages](https://docs.cloud.google.com/vision/docs/languages) | OBSERVED |
| AWS Textract | **Listed** among "more than 40 languages". The page says the async text-detection and AnalyzeDocument APIs "support all languages"; it doesn't name sync `DetectDocumentText` | Not stated | [Textract quotas](https://docs.aws.amazon.com/textract/latest/dg/limits-document.html); announcement repost [3 Nov 2026](https://mwpro.co.uk/blog/2026/11/03/announcing-an-updated-text-detection-model-for-amazon-textract/) | OBSERVED; sync API UNKNOWN |
| Azure AI Vision (Read) | **Not listed** in the printed-text OCR table | Not listed | [Azure Vision language support](https://learn.microsoft.com/EN-US/AZURE/ai-services/computer-vision/language-support) (footer 26 Sep 2025; metadata 19 Oct 2026) | OBSERVED, CHANGED from Run 10 |
| Azure (other features) | `he` appears only for image-analysis tags and multimodal embeddings (2023-04-15 model) | — | Same | OBSERVED |
| Tesseract | `heb` language data and a `Hebrew` script model in tessdata | No | [tessdoc Data Files](https://github.com/tesseract-ocr/tessdoc/blob/master/Data-Files.md); [tessdata_fast wiki (archived)](https://github.com/tesseract-ocr/tesseract/wiki/Data-Files-in-tessdata_fast/c4de8b2cc59dac5ea794335a84c3c3754b46a447) | OBSERVED; licence of data files UNKNOWN from these pages |
| Browser TextDetector | Not checked | — | — | UNKNOWN |

**Conflict log:**
- **Textract:** Run 10 saw "6 European languages" on the limits page vs a Hebrew announcement. Today the limits page itself lists Hebrew. Both the old and current states are reported; the current page wins.
- **Azure:** Run 10 said Hebrew printed text is supported; the current table doesn't list it.

**Capture constraint** (OBSERVED): OCR wants "at least 16x16 pixels" per character, with "generally no accuracy benefit" above 24 × 24 ([Google ML Kit](https://developers.google.com/ml-kit/vision/text-recognition/ios)). Engraved, reflective Hebrew at 1024 px remains UNKNOWN.

## 3. Cost per 1,000 checks (rates read 4 Nov 2026)

**Assumptions** (INFERRED): one 1024 × 768 image, a 150-token prompt and 50 output tokens per check. Image tokens are counted as follows:
- **Claude:** ⌈w/28⌉ × ⌈h/28⌉ = 37 × 28 = 1,036 tokens ([Claude vision](https://platform.claude.com/docs/en/build-with-claude/vision#evaluate-image-size)).
- **Gemini:** images above 384 px are tiled into 768 × 768 tiles at 258 tokens each, so 2 tiles = 516. Billing for a partial tile is UNKNOWN ([Gemini tokens](https://ai.google.dev/gemini-api/docs/tokens)).
- **OpenAI:** the image formula for GPT-5.6 Terra wasn't checked, so 1,000 tokens is assumed.

| Method | Rate (OBSERVED, 4 Nov 2026) | Arithmetic | Per 1,000 checks |
|---|---|---|---|
| ORB on our worker or the phone | $0 API | — | **$0** + unmeasured CPU and engineering |
| Google Vision OCR | First 1,000 units/month free; then $1.50 per 1,000 ([pricing](https://cloud.google.com/vision/pricing?hl=hu)) | 1,000 × $0 | **$0** for the first 1,000/month; $1.50 per further 1,000 |
| Vertex multimodal embeddings | $0.0001 per image; text $0.0002 per 1,000 ([Vertex pricing](https://cloud.google.com/vertex-ai/generative-ai/pricing?hl=hu)) | 1,000 × $0.0001 | **$0.10** |
| Gemini 2.5 Flash-Lite (Gemini API only) | $0.10 / $0.40 per M | (516+150)×0.10/M + 50×0.40/M = $0.000087 | **$0.09** |
| Gemini 3.1 Flash-Lite | $0.25 / $1.50 per M (Standard, Global) | (516+150)×0.25/M + 50×1.50/M = $0.000242 | **$0.24** |
| Gemini 3.5 Flash-Lite | $0.30 / $2.50 per M | (516+150)×0.30/M + 50×2.50/M = $0.000325 | **$0.33** |
| Claude Haiku 5.5 | $0.10 / $0.50 per M (prompts ≤100k tokens) ([Claude pricing](https://platform.claude.com/docs/en/about-claude/pricing)) | (1,036+150)×0.10/M + 50×0.50/M = $0.000144 | **$0.14** |
| Claude Haiku 4.5 | $1 / $5 per M | (1,036+150)×1/M + 50×5/M = $0.001436 | **$1.44** |
| GPT-5.6 Terra | $2 / $12 per M ([OpenAI](https://developers.openai.com/api/docs/models/gpt-5.6-terra)) | (1,000 assumed + 150)×2/M + 50×12/M = $0.0029 | **~$2.90** (image tokens and any reasoning tokens UNKNOWN) |

**Takeaway** (INFERRED): at 1,000 checks a month, every option except GPT-5.6 Terra costs under $1.50. Engineering time, reference photography and support cost more than the API.

## 4. Deprecated models and successors (as read 4 Nov 2026)

| Model | Status | Successor or alternative | Source | Label |
|---|---|---|---|---|
| GPT-4.1 mini | Deprecated | GPT-5 mini was recommended, but is itself deprecated | [OpenAI GPT-4.1 mini](https://developers.openai.com/api/docs/models/gpt-4.1-mini) | OBSERVED |
| GPT-5 mini ($0.25 / $2.00) | Deprecated | **GPT-5.6 Terra** recommended "for most new low-latency, high-volume workloads". GPT-5.4 mini ($0.75 / $4.50) is listed with no deprecation notice | [GPT-5 mini](https://developers.openai.com/api/docs/models/gpt-5-mini); [GPT-5.4 mini](https://developers.openai.com/api/docs/models/gpt-5.4-mini) | OBSERVED |
| Gemini 2.5 Flash-Lite | **Retired on Vertex AI 20 Oct 2026.** Gemini API: "No shutdown date announced" (as of 18 Oct 2026) | Google names Gemini 3.1 Flash-Lite, Gemini 3.8 Flash or Gemma 4 | [DevelopersDigest, 18 Oct 2026](https://www.developersdigest.tech/blog/vertex-ai-shutdowns-october-2026); [Google forum thread, 11 Aug 2026](https://discuss.ai.google.dev/t/gemini-2-5-flash-lite-retirement-date-different-for-gemini-api-vs-vertex-ai/177897) | OBSERVED (secondary; the primary Gemini deprecations page blocked fetching) |
| Claude Haiku 4.5 (`claude-haiku-4-5-20251001`) | Active; retirement "not sooner than October 15, 2026" | Claude Haiku 5.5 (`claude-haiku-5-5`), active, not before 7 Oct 2027 | [Anthropic model deprecations](https://platform.claude.com/docs/en/about-claude/model-deprecations) | OBSERVED |
| Vertex `multimodalembedding@001` | Priced and listed | — | [Vertex pricing](https://cloud.google.com/vertex-ai/generative-ai/pricing?hl=hu) | OBSERVED; lifecycle UNKNOWN |

**Rule** (INFERRED): pin exact model versions in the per-stop config, and re-check this table before launch and every quarter.

## 5. Privacy

**Israeli law** (OBSERVED unless marked):
- **Amendment 13** entered into force on 14 Aug 2025. Enforcement of the DPO duty had a grace period to 31 Oct 2025 ([Pearl Cohen, 3 Sep 2025](https://www.pearlcohen.com/israel-significant-amendment-to-the-privacy-law-takes-effect/)).
- **"Especially Sensitive Data"** includes **location data** and **biometric identifiers** ([DLA Piper, page last modified Dec 2024](https://www.dlapiperdataprotection.com/?c=IL)).
- **Notice at collection** must cover:
  - whether giving the data is legally required;
  - the purpose and the recipients;
  - the consequences of refusing;
  - the controller's identity;
  - access and correction rights (same source).
- **Database registration** now applies mainly to data brokers holding 10,000+ subjects and to public bodies (same source).
- **INFERRED:** a small game operator is probably not a registrable database. But GPS gating plus photos of identifiable families is location data plus images. Face *detection* for blurring is not face *recognition*, but whether it counts as biometric processing needs a legal answer.

**GDPR scope** (OBSERVED):
- Art. 3(2) applies to data subjects "who are in the Union", "not limited by citizenship, residence or other type of legal status".
- Targeting factors include naming EU countries, language, top-level domain, currency and paid search aimed at the EU.
- Mere accessibility of a website is "insufficient" ([PrivacyWorld on EDPB Guidelines 3/2018, 15 Dec 2019](https://www.privacyworld.blog/?p=2497)).
- **INFERRED:** play happens in Jerusalem, so Art. 3(2) turns on whether marketing or booking targets people while they are in the EU, for example EU-currency checkout or EU-directed ads. Get a legal review.

**Provider data handling** (OBSERVED):
- **Google Vision:** online requests are "processed in memory and not persisted to disk"; some request metadata is logged temporarily; content is not used for training ([Vision data usage](https://docs.cloud.google.com/vision/docs/data-usage?authuser=1)).
- **Others:** Run 10's notes on OpenAI and Gemini retention were not re-read in this pass.

**Design** (INFERRED; Run 10 §4 stands):
- On the phone: resize, strip metadata, blur faces.
- Keep only the outcome; delete uploads immediately.
- A non-camera path at every stop.
- **Souvenir photos are a separate flow:** opt-in, built on the device where possible, never sent to a verifier, no server copy unless the family asks.

## 6. Cheating limits

| Signal | Shows | Doesn't prove | Label |
|---|---|---|---|
| ORB or embedding match | The photo resembles the references or prompt | Physical presence | INFERRED |
| OCR | The expected words are visible | They're on the real plaque | INFERRED |
| GPS | Reported position | That the photo came from this phone; GPS can be spoofed | INFERRED |
| `capture` attribute on file input | A *hint* to use a camera | Live capture. MDN marks it "Limited availability"; the OS may still offer existing files ([MDN](https://developer.mozilla.org/docs/Web/HTML/Attributes/capture)) | OBSERVED |
| Live camera (`getUserMedia`) | Frames came from an active camera | That it faced the object, not a screen | INFERRED |
| Screen-recapture detection | Some recaptures | Most replays. Best published equal error rate is 16.78% (vs 26.82% baseline) on 10,000+ recaptured *office documents*, not murals ([Chen et al., CVPR 2024](https://openaccess.thecvf.com/content/CVPR2024/html/Chen_CMA_A_Chromaticity_Map_Adapter_for_Robust_Detection_of_Screen-Recapture_CVPR_2024_paper.html)) | OBSERVED |

**INFERRED: for a family game, use friction, not forensics.**
- live camera with no gallery by default;
- a short-lived server nonce tied to the stop;
- GPS with its reported accuracy;
- flag identical image hashes across teams;
- low competitive weight on photo points.

## 7. Memory and attention effects of photographing

| Finding | Source | Label | Design implication (INFERRED) |
|---|---|---|---|
| Visitors who photographed museum objects recognised them less well and recalled fewer visual details than visitors who only observed them. Zooming in on a detail "seemed to preserve memory for the object" | Henkel 2013, *Psychological Science* ([APS release, 9 Dec 2013](https://www.psychologicalscience.org/news/releases/no-pictures-please-taking-photos-may-impede-memory-of-museum-tour.html)) | OBSERVED | Prefer zoom or detail tasks to "photograph the whole building" |
| On a real museum tour with an audio guide (294 participants), people with cameras recognised more visual items but remembered less of the audio. The effect held with mere intent to photograph | Barasch, Diehl, Silverman, Zauberman 2017, *Psychological Science* ([APS release](https://www.psychologicalscience.org/news/releases/taking-photos-of-experiences-boosts-visual-memory-impairs-auditory-memory.html)) | OBSERVED | Keep photo tasks before or after narrated video or audio reveals, never during |
| Each failed automatic check adds screen time at the moment players have succeeded | — | INFERRED | Two-attempt cap; fast unsure → fallback |

## 8. Field test (Run 10 §6 stands; additions below)

**Per fixed object** (one plaque, one mural detail), 30 photos:
- 6 normal daylight at several distances;
- 5 strong sun or reflections;
- 5 shade;
- 5 oblique;
- 3 partly occluded;
- 3 on another phone's screen;
- 3 printed.
- Plus 3–10 separate reference photos, never scored.
- Two phones (an iPhone and a mid-range Android), two photographers, more than one visit.

**Near-miss negatives** (required, INFERRED):

| Challenge type | Near misses to collect (30+ each) |
|---|---|
| Fixed detail | Neighbouring murals and emblems; the same motif on another building |
| Fixed text | Nearby plaques and signs; the same plaque with a different name |
| Open category (carved motif) | Painted motifs, stickers, iron grilles, plain stone |
| Composition (one colour) | Two matching objects only; similar but different colours; one object photographed three times |
| Rephotography | Not scored, so no negatives; time each alignment instead |

**Metrics** (proposed pilot targets, not standards; INFERRED):
- legitimate acceptance ≥ 90% on clear photos;
- 0 observed false accepts;
- unsure rate < ~15%;
- median / P95 response < 3 s / < 6 s, broken down by step;
- 1, 3 and 5 concurrent teams on the shared VPS.
- Set thresholds on a validation split and confirm them on a holdout set.
- 0 false accepts in 30 negatives still allows up to ~9.5% (95% upper bound); below 1% needs ~299 negatives (Run 10).

**Experiments:**
1. **Zoom vs whole-object** at the same stop: next-day detail recall, 10 families per arm.
2. **Photo task timing:** before, during or after a narrated video; recall of the video's facts.
3. **Open-category methods:** embedding vs LLM-enum on the same near-miss set, comparing false accepts and unsure rate.
4. **Framing guidance vs none** (Run 10).

## 9. The case against automated verification

INFERRED; Run 10 §9 stands, with three additions:
- **Self-guided makes failure worse.** With no guide, a false `no` at the moment of success has no human to overrule it. That is why self-confirm is the default fallback.
- **The rules change fast.** Within ~2 months, three of Run 10's candidate models were deprecated or retired on one platform. Every automated path adds a maintenance duty.
- **The legal surface grows.** Location data and possible biometric processing are "Especially Sensitive Data" under Amendment 13.

**Prefer typed, self-confirmed or optional-guide answers when:**
- the object changes or can't be photographed safely;
- the stop is crowded with children or bystanders;
- phones are old or the connection is poor;
- the score has little competitive weight.

If the pilot shows photo checks frustrate more families than they help, keep the photo-taking and drop the automated scoring.

## 10. Historical-photo souvenir: owner direction (4 Nov 2026, not approved)

**Owner:**
- If rights allow commercial use with credit, use and credit the photo.
- Otherwise, redraw with AI and say so openly.
- The value is the souvenir: a composite of the family in the historical scene, or a ~5-second morph from the old view to today.

| Point | Finding | Label |
|---|---|---|
| Matson rights | "Photographs in the G. Eric and Edith Matson Photograph Collection are in the public domain", except colour lantern slides (donor restrictions); "privacy and publicity rights may also apply" ([LoC research aid, rev. 9 Jun 2003, archived](https://webarchive.library.unt.edu/web/20121205131212/http:/www.loc.gov/rr/print/res/258_mats.html)). Item record: "No known restrictions on publication" ([LoC item](https://www.loc.gov/pictures/item/2019704939/)) | OBSERVED |
| Collection | 23,000+ items, mostly 1898–1946, including Jerusalem ([LoC](https://www.loc.gov/collections/g-eric-and-edith-matson-photographs/about-this-collection/)) | OBSERVED |
| Route coverage | Whether Mahane Yehuda or Nachlaot views exist | UNKNOWN |
| AI redraw of a protected photo | A close redraw may still be a derivative work. Redraw from public-domain material or the scene itself; label it as an illustration; legal check | INFERRED (not legal advice) |
| Disclosure | Credit line on every image ("Library of Congress, Matson Collection, [year]" or "Illustration based on …"), in line with DORI's evidence vs interpretation principle | INFERRED |
| Value | Rephotography is used in citizen-heritage work ([Univ. of Melbourne](https://msd.unimelb.edu.au/events/re-photography-as-a-tool-for-citizen-heritage); [re.photos paper](https://arxiv.org/html/2501.02017v1)). No evidence found on family willingness to pay | OBSERVED / UNKNOWN |

**Validation** (INFERRED):
1. Matson coverage search per candidate stop.
2. Preference test with 10 families: still composite vs 5-second morph vs none; willingness to pay and sharing intent.
3. Time to produce one souvenir on a mid-range phone, on device vs server.

## 11. Still unknown

| Unknown | What would settle it |
|---|---|
| Sync `DetectDocumentText` Hebrew | One API call with a Hebrew image |
| Gemini partial-tile billing; Gemini 3.x image tokens | `count_tokens` on a 1024 × 768 image |
| GPT-5.6 Terra image tokens and reasoning overhead | One API call with usage output |
| Gemini API shutdown date for 2.5 Flash-Lite | Primary deprecations page (fetch was blocked) |
| Engraved, reflective Hebrew OCR | Google vs Textract vs Tesseract, side by side, at 1024 px and on a crop |
| Open-category false-accept rate | §8 experiment 3 |
| ORB under local glare; VPS load | Run 10 §6 field set and load test |
| Biometric status of on-device face detection under Amendment 13 | Legal review |
| GDPR targeting given the booking flow | Legal review |
| Matson route coverage; souvenir value | §10 validation |
| Tesseract data-file licence | The tessdata repositories' licence files |

## Appendix A — Prompt 10 v2 (as run)

> **Role:** research for DORI's photo-challenge verification. Research only, no approved content, no player-facing copy.
> **Context:** a mobile-web family walking game in Nahlaot and Mahane Yehuda; GPS gating; self-guided by default with an optional guide; Next.js on a shared 2 vCPU / 4 GB VPS.
> **Cover every challenge type:** fixed detail, fixed text (Hebrew), zoom detail, open category, composition, creative, and rephotography souvenir. For each: a check, a fallback, and an unsure path.
> **Evidence rules:**
> - Put the URL next to every claim.
> - Date every price on the day you read it.
> - Label each claim OBSERVED / INFERRED / UNKNOWN.
> - When sources conflict, read the vendor's current primary page and report both.
> - List deprecated models and current successors.
> **Must include:**
> - Hebrew OCR support per provider, read from each language table.
> - The cost per 1,000 checks, with the arithmetic.
> - Privacy, under Israeli Amendment 13 and GDPR scope.
> - Cheating limits.
> - Memory and attention effects of photographing (Henkel 2013; Barasch et al. 2017).
> - A field-test design including near-miss negatives.
> - The case against automated verification.
> **Don't:** invent player copy; treat vendor claims as accuracy; assume a guide is present.
> **Output:** Markdown in the Run 10 format with a source register (publisher, date, URL, type).

## Source register

"Read" = read on 4 Nov 2026.

| Publisher | Date | Source | Used for | Type |
|---|---|---|---|---|
| Google Cloud | Read | [Cloud Vision pricing](https://cloud.google.com/vision/pricing?hl=hu) | OCR prices; units | Primary |
| Google Cloud | Read | [Vision OCR languages](https://docs.cloud.google.com/vision/docs/languages) | Hebrew `iw`; no handwriting | Primary |
| Google Cloud | Read | [Vision data usage](https://docs.cloud.google.com/vision/docs/data-usage?authuser=1) | Retention; training | Primary |
| Google Cloud | Read | [Vertex AI generative pricing](https://cloud.google.com/vertex-ai/generative-ai/pricing?hl=hu) | Embeddings; Flash-Lite prices | Primary |
| Google AI for Developers | Read | [Gemini token counting](https://ai.google.dev/gemini-api/docs/tokens) | 258-token tiles | Primary |
| DevelopersDigest | 18 Oct 2026 | [Vertex AI shutdowns, Oct 2026](https://www.developersdigest.tech/blog/vertex-ai-shutdowns-october-2026) | 2.5 Flash-Lite retirement; replacements | Secondary |
| Google AI Developers Forum | 11 Aug 2026 | [Flash-Lite retirement thread](https://discuss.ai.google.dev/t/gemini-2-5-flash-lite-retirement-date-different-for-gemini-api-vs-vertex-ai/177897) | API vs Vertex dates | Secondary |
| AWS | Read | [Textract quotas and languages](https://docs.aws.amazon.com/textract/latest/dg/limits-document.html) | Hebrew listed; API scope | Primary |
| mwpro.co.uk | 3 Nov 2026 | [Textract updated text model (repost)](https://mwpro.co.uk/blog/2026/11/03/announcing-an-updated-text-detection-model-for-amazon-textract/) | Announcement; language list | Secondary |
| Microsoft | Read (footer 26 Sep 2025) | [Azure AI Vision language support](https://learn.microsoft.com/EN-US/AZURE/ai-services/computer-vision/language-support) | Hebrew not in OCR tables | Primary |
| Tesseract OCR | Read | [tessdoc Data Files](https://github.com/tesseract-ocr/tessdoc/blob/master/Data-Files.md); [tessdata_fast wiki](https://github.com/tesseract-ocr/tesseract/wiki/Data-Files-in-tessdata_fast/c4de8b2cc59dac5ea794335a84c3c3754b46a447) | `heb` data | Primary (docs, partly archived) |
| OpenAI | Read | [GPT-4.1 mini](https://developers.openai.com/api/docs/models/gpt-4.1-mini); [GPT-5 mini](https://developers.openai.com/api/docs/models/gpt-5-mini); [GPT-5.4 mini](https://developers.openai.com/api/docs/models/gpt-5.4-mini); [GPT-5.6 Terra](https://developers.openai.com/api/docs/models/gpt-5.6-terra) | Prices; deprecations | Primary |
| Anthropic | Read | [Pricing](https://platform.claude.com/docs/en/about-claude/pricing); [Vision](https://platform.claude.com/docs/en/build-with-claude/vision#evaluate-image-size); [Model deprecations](https://platform.claude.com/docs/en/about-claude/model-deprecations) | Prices; image tokens; lifecycle | Primary |
| Chen et al. (CVPR) | Jun 2024 | [CMA screen-recapture detection](https://openaccess.thecvf.com/content/CVPR2024/html/Chen_CMA_A_Chromaticity_Map_Adapter_for_Robust_Detection_of_Screen-Recapture_CVPR_2024_paper.html) | Equal error rates; documents only | Primary |
| MDN | Read | [HTML `capture` attribute](https://developer.mozilla.org/docs/Web/HTML/Attributes/capture) | Capture is limited and not enforced | Primary docs |
| Google ML Kit | Read | [Text recognition guidelines](https://developers.google.com/ml-kit/vision/text-recognition/ios) | 16–24 px per character | Primary |
| Pearl Cohen | 3 Sep 2025 | [Amendment 13 takes effect](https://www.pearlcohen.com/israel-significant-amendment-to-the-privacy-law-takes-effect/) | In-force date; DPO grace period | Secondary (law firm) |
| DLA Piper | Last modified Dec 2024 | [Data Protection Laws: Israel](https://www.dlapiperdataprotection.com/?c=IL) | Especially Sensitive Data; notice; registration; DPO | Secondary (law firm) |
| PrivacyWorld (Squire Patton Boggs) | 15 Dec 2019 | [EDPB final guidelines on Art. 3(2)](https://www.privacyworld.blog/?p=2497) | GDPR targeting criterion | Secondary (law firm) |
| OpenCV Q&A | 22 Feb 2019 | [OpenCV.js smaller package](https://answers.opencv.org/question/209264/opencvjs-smaller-package) | Bundle ~8.4 MB → ~4.2 MB | Secondary, old |
| Library of Congress | Rev. 9 Jun 2003 (archived) | [Matson research aid](https://webarchive.library.unt.edu/web/20121205131212/http:/www.loc.gov/rr/print/res/258_mats.html) | Public-domain statement | Primary (archived) |
| Library of Congress | Read | [Matson item record](https://www.loc.gov/pictures/item/2019704939/); [collection page](https://www.loc.gov/collections/g-eric-and-edith-matson-photographs/about-this-collection/) | Rights advisory; scope | Primary |
| Association for Psychological Science | 9 Dec 2013 | [Henkel release](https://www.psychologicalscience.org/news/releases/no-pictures-please-taking-photos-may-impede-memory-of-museum-tour.html) | Photo-taking impairment; zoom | Primary (release of a study) |
| Association for Psychological Science | 2017 | [Barasch et al. release](https://www.psychologicalscience.org/news/releases/taking-photos-of-experiences-boosts-visual-memory-impairs-auditory-memory.html) | Visual up, auditory down | Primary (release of a study) |
| Actionbound | Not re-read | [Mission documentation](https://en.actionbound.com/help/article/mission) | Creative missions not auto-marked | Primary (via the photo-challenge report) |
| University of Melbourne; arXiv | — ; Jan 2025 | [Re-photography seminar](https://msd.unimelb.edu.au/events/re-photography-as-a-tool-for-citizen-heritage); [re.photos paper](https://arxiv.org/html/2501.02017v1) | Rephotography in heritage | Primary |
| Run 10 | 3 Nov 2026 | Run 10 file | ORB settings, statistics, architecture (not re-verified here) | Prior run |
