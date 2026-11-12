# Run 10: verifying a photo answer, cheapest first

| | |
|---|---|
| **Date** | 3 Nov 2026 |
| **Method** | Claude on the web, web search on, run by the owner from [prompt 10](../../prompts/10_photo_answer_verification.md); cleaned and cut by Claude Code |
| **Status** | Research result, **not approved content** and not a decision ([content.md](../../../.claude/rules/content.md)). The verify method is chosen per challenge with the owner |
| **Labels** | OBSERVED (a cited source says it), INFERRED (the run's reasoning), UNKNOWN |

**What was cut:** web-page leftovers (citation chips, an interactive checklist, a broken diagram), repetition, and the run's player-facing text (photo tips, error messages, a 📸 screen). That text was invented copy and can't go into the app ([content.md](../../../.claude/rules/content.md), "Copy"). What it found about framing is kept as findings in §7.

**Caveats on the run itself:**
- The pasted answer lost most source URLs. The register (§9) gives publishers and dates only; nothing below was re-checked by Claude Code.
- Prices are snapshots of undated live pages, read 3 Nov 2026.
- One section says its sources were "checked 4 November 2026", a day after the run. Treat those dates as 3 Nov.
- The AWS Textract Hebrew claim rests on an announcement dated 2 Nov 2026, and AWS's own limits page still contradicts it.

## Summary

1. **Primary check: OpenCV ORB feature matching with a RANSAC homography** (INFERRED). Each photo is compared with 3–10 reference photos of our own, and the check passes when enough geometrically consistent points match. It costs nothing per check and has no model weights. It runs as a small isolated worker, never inside Next.js. It suits murals and textured, mostly flat surfaces; it is weak on smooth shiny metal, strong glare and blur.
2. **Fallback for text-bearing plaques: Google Cloud Vision OCR** (OBSERVED prices). The first 1,000 text-detection units a month are free, then $1.50 per 1,000. Hebrew (`iw`) is supported. The check matches distinctive expected words (the artists' names), not a full transcription.
3. **Cost at 1,000 checks a month: about $0–$1.50** in API fees (INFERRED). Neither engineering time nor the shared server's load has been measured.
4. **No LLM in the main path, and no self-hosted CLIP or DINOv2 on this server** (INFERRED). LLMs are cheap (Gemini 2.5 Flash-Lite is about $0.15 per 1,000 checks). The objections are a yes/no that isn't calibrated, prompt injection from text in the photo, latency and privacy. Self-hosted models put the live sites' RAM at risk. If ORB fails at a stop, the next thing to test is **Vertex AI multimodal embeddings** (about $0.10 per 1,000 images).
5. **Nothing here proves the team stood at the object** (INFERRED, with a CVPR 2024 source). A photo of the object on another phone's screen keeps its geometry and text, so it can pass ORB and OCR. GPS, a fresh camera frame and a server nonce only add friction against casual cheating.
6. **The run's strongest design point:** make the object matter to the puzzle, not the photo (INFERRED). Example: photograph the plaque, then answer "which two artists are named?" The photo is the fun; the typed answer is the verification. For a noncompetitive family game, "We found it" plus a small question about the object may beat automated photo scoring.
7. **Decide per stop.** ORB for a textured mural detail, OCR for a plaque with readable text, a typed or group-confirmed answer where neither works. Never more than two automatic attempts before another path opens.

## 1. Comparison of approaches

Cost is per submitted image; reference images are processed once and cached. Latencies are INFERRED estimates, not measurements.

| Approach | Cost per check / per 1,000 | Latency, offline | Fit for our case | Verdict |
|---|---|---|---|---|
| ORB + RANSAC (OpenCV) | $0 / $0 API | ~0.2–2 s plus upload; offline in the browser once code is cached | Good on textured flat surfaces and moderate angles; weak on glossy featureless metal, glare, blur | **Primary** |
| AKAZE / SIFT + homography | $0 / $0 | Usually more CPU than ORB | May recover details ORB misses; HPatches shows no clear SIFT win (below) | Test only where ORB fails |
| Vertex AI multimodal embeddings | $0.0001 / $0.10; no free tier found | ~1–4 s, online | Tolerates lighting and scene change; may confuse two similar plaques | **Second test** if ORB is weak |
| Other hosted embeddings (AWS Titan, Cohere, Jina, HF, Replicate) | No comparable fixed rate; Replicate CLIP $0.000975 per second | ~1–6 s, cold starts | Model-dependent | Experiments only |
| Self-hosted CLIP / SigLIP / DINOv2 on CPU | $0 API | ~0.3–5+ s, worse under load | Fine technically | **No** on the shared 4 GB VPS |
| In-browser embeddings (MediaPipe, transformers.js, TF.js) | $0 | ~0.1–3 s warm, slow first download | Device-dependent | Privacy-friendly experiment |
| Browser OCR (Tesseract.js, TextDetector) | $0 | ~0.5–5 s; language data download | Shiny engraved Hebrew is hard; TextDetector availability UNKNOWN | Only for clear, high-contrast plaques |
| Cloud OCR (Google Vision, AWS Textract, Azure Read) | Google $0–$1.50 per 1,000; Textract $1.50 after free tier; Azure region-dependent | ~1–4 s, online | Printed Hebrew supported by all three; engraved metal unproven | **Fallback** for text plaques |
| Cloud labels / landmarks / objects | $0–$1.50 per 1,000; object localisation $2.25 | ~1–4 s | Says "plaque" or "mural", not *this* one | No |
| Multimodal LLMs | ~$0.20–$2.00 per 1,000 (table below) | ~1–8 s, variable | Reads text and reasons; no calibrated yes/no; injectable | Hard cases or evaluation only |
| GPS + capture time + live camera | $0 | Instant to a few seconds for a GPS fix | Says nothing about the object | Supporting signal only |
| Group, guide or typed answer | $0 in API fees | Instant | Works everywhere; weaker against deliberate cheating | **Always available as the fallback** |

**LLM prices** (OBSERVED rates; INFERRED cost per check, for one ~1024 px image, a short prompt and ~50 output tokens):

| Model | Rate, 3 Nov 2026 | ~Cost per check |
|---|---|---|
| Gemini 2.5 Flash-Lite | $0.10 / M in, $0.40 / M out | ~$0.00015 |
| OpenAI GPT-4.1 mini | $0.40 / M in, $1.60 / M out | ~$0.00075 |
| Claude Haiku 4.5 | $1 / M in, $5 / M out | ~$0.0015–0.002 |

If an LLM is ever used: the image is untrusted input, the model returns only a fixed enum (`yes` / `no` / `unsure`), and the server alone decides on points (INFERRED).

## 2. Findings by method

### Feature matching (ORB)

- OBSERVED: OpenCV's documented known-object workflow matches keypoints, then fits a homography with RANSAC and counts geometric inliers.
- OBSERVED (secondary, the SOTA2 leaderboard): on HPatches at 5 px, ORB scores 50.85 % against SIFT's 49.08 % on illumination changes, and 53.55 % against 53.57 % on viewpoint changes. These are benchmark scores, not plaque acceptance rates.
- **Starting settings** (all INFERRED, to be calibrated in the field):

| Setting | Start at |
|---|---|
| Input | Greyscale, 1024 px long edge |
| References | 3–10, keypoints and descriptors precomputed |
| Features | 750–1,000 ORB per image |
| Matching | Hamming KNN, ratio test 0.75–0.80 |
| Geometry | RANSAC homography, 3–5 px reprojection |
| Accept | ~12–20 inliers and an inlier ratio above ~0.4, spread across the target (not one small patch), with plausible transformed corners |
| Unsure | In-between counts, blur, or references that disagree |

- An inlier count alone isn't enough: 15 matches on repeated brickwork mean less than 15 spread across distinctive artwork.
- References should include 2–3 wider views as well as close-ups. A single reference taken in perfect afternoon light is not enough.

### Embeddings (if ORB fails at a stop)

- UNKNOWN: there is no universal cosine threshold for CLIP, SigLIP or DINOv2 on our objects. 0.65–0.95 is only a range to explore.
- Use a **margin** as well as the score: the target's best similarity minus the best similarity to a nearby wrong object. A score of 0.86 for the target and 0.85 for the neighbouring mural is not a match.
- DINOv2 is the first local model worth trying (visual features, no text needed); SigLIP and CLIP are comparisons. None is guaranteed to tell apart two similar plaques with different text.

### OCR, especially Hebrew

| System | Hebrew | Note |
|---|---|---|
| Google Cloud Vision | `iw`, supported | Strongest candidate |
| Azure Read | `he`, printed text | Alternative |
| AWS Textract | Added 2 Nov 2026 per the announcement; the older limits page lists six European languages | Sources conflict; test before relying on it |
| Tesseract | `heb` trained data, Apache 2.0 | Local candidate |
| Browser TextDetector | UNKNOWN | Don't depend on it |

- Normalise Unicode, punctuation, Hebrew final letters and spaces, then compare the expected words by edit distance. Require distinctive words: "artists" or "Jerusalem" alone must not pass (INFERRED).
- UNKNOWN: whether small engraved letters in reflected sun are readable at 1024 px. If not, send a higher-resolution crop of the plaque to OCR.
- OBSERVED (Google ML Kit guidance): OCR wants about 16 × 16 px per character. A small plaque shot from a few metres can look fine on screen and still be unreadable.

## 3. Cheating

| Signal | Shows | Doesn't prove |
|---|---|---|
| ORB or embedding match | The photo looks like the references | That the object was physically there |
| OCR | The expected words are visible | That they're on the real plaque |
| GPS near the stop | Reported position | That the photo came from this camera; GPS can be spoofed |
| Server timestamp | When it arrived | When it was taken |
| EXIF | Sometimes time and place | Anything: often absent in browser captures, editable |
| Live camera (`getUserMedia`) | Frames came from an active camera | That the camera faced the object, not a screen |
| Screen-recapture detection | Some moiré and print artefacts | Every replay. OBSERVED: CVPR 2024 (Chen et al.) reports a 16.78 % equal-error rate, on documents, not murals |
| Guide | Human judgement | Perfect fraud prevention |

INFERRED: don't build a screen-recapture detector for a family game. Layer cheap friction instead:
1. a fresh camera frame, with no gallery upload offered by default;
2. a short-lived server nonce tied to the stop;
3. GPS, if granted, with its reported accuracy;
4. a framing that includes surroundings;
5. ORB and/or OCR;
6. flagging identical image hashes across teams;
7. an alternative path when the checks disagree.

## 4. Privacy

- **Before upload** (INFERRED): resize, strip metadata by re-encoding through a canvas, and blur faces on the device (MediaPipe Face Detector, OBSERVED as available in the browser). Face *detection* for blurring is not face *recognition*. Don't crop so tightly that ORB loses context.
- **Keep:** the outcome, the stop ID, a pseudonymous team ID and minimal diagnostics. Delete temporary uploads immediately, errors included; keep diagnostics for a short documented period (seven days suggested, not a legal default).

| Path | Data handling (OBSERVED unless marked) |
|---|---|
| On-device only | No provider sees the image |
| Our ORB worker | We control storage and logs; disable raw-image retention |
| Google Cloud Vision | Online request images are processed in memory and not persisted; not used for training. Request metadata may be logged |
| OpenAI API | Not used for training by default; ~30-day abuse-monitoring retention; Zero Data Retention only for approved organisations, with image exceptions |
| Gemini API | Paid tier: not used to improve products. Free tier differs, so use a billed project |
| AWS, Azure, Cohere, Jina, HF, Replicate | UNKNOWN for our setup; review each DPA, region and retention before use |

- **Israeli law** (OBSERVED): Privacy Protection Law Amendment 13 took effect on 14 Aug 2025. A photo of an identifiable bystander, tied to a place and a team, can be personal information.
- **GDPR** (OBSERVED: Article 3, EDPB Guidelines 3/2018): it applies by establishment or by targeting or monitoring people *in* the EU, not by a visitor's nationality. INFERRED: a Jerusalem-only operator is likely outside it, but EU-facing marketing or booking could change that. Needs legal review.
- **Children:** minimise images of them, inform parents, and always keep a non-camera path (INFERRED).

## 5. Architecture

```text
Phone (Next.js)
  live camera · optional GPS · resize ≤1024 px · face blur · strip EXIF · stop nonce
        │ HTTPS
        ▼
Verify gateway (server; holds every API key, none in the browser)
  auth team + stop · nonce · size and format limits · rate limits · own monthly spend counter
        │
        ├─ primary:  isolated OpenCV worker (ORB/RANSAC, precomputed references)
        └─ fallback: Google Vision OCR (expected words), only when the stop's config allows
        ▼
Decision: yes | no | unsure  →  game code awards points once (idempotent, per team and stop)
```

- **Isolation** (INFERRED): a separate worker process or container with a memory ceiling, a CPU quota, one active job, a queue, a deadline and a health check. Never PyTorch or ONNX in the Next.js process. If contention shows on the live sites, move ORB to the phone or to a separate small instance.
- **Deadline:** 5–8 s to start with; a timeout returns `unsure`, never `no`.
- **Spend cap:** the gateway counts calls itself and refuses cloud calls past the cap ($5 a month covers 1,000 checks). A provider billing alert alone doesn't stop spending.
- **Result contract** (sketch): `{ "status": "unsure", "reason": "insufficient_features", "retryAllowed": true, "nextAction": "reframe_or_typed_answer" }`. The client never awards points because it received a `yes`.
- **Per-stop config** (values illustrative): `{ "stopId", "verificationMode": "orb" | "ocr", "referenceVersion", "minInliers": 15, "minInlierRatio": 0.4, "expectedWords": […], "gpsRadiusMeters": 75, "fallback": "guide_or_typed", "maxAutomaticAttempts": 2 }`. A 75 m radius takes in neighbouring streets: it is a coarse check.

**On failure:**

| Result | Game behaviour |
|---|---|
| yes | Points, once |
| no | No points yet; point the team back at the detail |
| unsure (image quality) | Retry, no penalty |
| unsure (timeout, no connection) | Typed answer, the group or the guide; no penalty |
| Two unsure in a row | The alternative path opens automatically |
| GPS refused | Not excluded; fallback offered |

Give a specific reason ("blurry", "too far") only when it was actually measured (e.g. a blur estimate). A low ORB score can't tell glare from the wrong object.

## 6. Field test

**Per object** (one plaque, one mural detail), 30 photos:
- 6 in normal daylight at several distances;
- 5 in strong sun or with reflections;
- 5 in shade;
- 5 at oblique angles;
- 3 partly occluded;
- 3 of the object on another phone's screen;
- 3 of a printed photo.

**Also:**
- at least 30 **wrong-object negatives**: nearby plaques, murals and signs. Without them, the false-accept rate can't be estimated;
- 3–10 **separate reference photos**, never scored as submissions;
- two phones (an iPhone and a mid-range Android), two photographers, more than one visit.

**Measure** (the targets are the run's proposals, not standards):

| Metric | Pilot target |
|---|---|
| True acceptance (legitimate photos) | ≥ 90 % on clear photos |
| False acceptance (wrong objects) | 0 observed |
| Screen or print attacks accepted | 0 observed (6 attacks only exposes obvious failures) |
| Unsure rate | < ~15 % |
| Median / P95 response | < 3 s / < 6 s, broken down into resize, 4G upload, CPU, provider |
| Load | 1, 3 and 5 teams at once, watching the live sites' RAM and CPU |

**Thresholds:**
- Set them on a validation split and confirm them on a holdout set, never on the same negatives.
- Use three outcomes: yes (strong, plausible geometry), no (clearly the wrong object), unsure (everything between).
- Among the thresholds with zero false accepts, pick the one that accepts the most legitimate photos.
- **Statistics:** 0 false accepts in 30 independent negatives still allows a true rate up to ~9.5 % (95 % upper bound, 1 − 0.05^(1/n)). Below 1 % takes ~299 negatives.

**Second experiment:** 30 photos taken without framing guidance against 30 taken with it, on the same objects and scoring.

## 7. Framing and capture (findings, not copy)

- OBSERVED (Google ML Kit, Apple, Google Pixel docs): OCR needs a large, sharp subject; tapping the preview focuses.
- INFERRED: what matters most for all three methods is the whole object in frame, fairly close and roughly straight on. For metal plaques, add one point about glare; for murals, include some of the surrounding painting.
- INFERRED: a frame overlay in the camera view (a tight rectangle for a plaque, a looser frame for a mural detail) helps more than written instructions. Show the long guidance at the first photo challenge only.
- The player-facing wording is a content gap: `TODO(copy)` when a photo challenge is built.

## 8. What remains unknown

| Unknown | What would settle it |
|---|---|
| ORB acceptance in local glare and shadow | The field dataset, split by condition |
| Load on the shared 2 vCPU VPS | A concurrent load test (CPU, RAM, P95) |
| OpenCV.js and MediaPipe on real iPhones and Androids | Device tests, including a first load |
| False accepts on similar nearby plaques | 100–300 wrong-object attempts |
| Screen and print replay | A separate attack campaign with displays of varying quality |
| OCR on shiny engraved Hebrew | Google Vision, Azure and Tesseract side by side, at 1024 px and on a higher-resolution crop |
| Embeddings vs ORB on feature-poor objects | The same holdout set scored with DINOv2, SigLIP, CLIP and Vertex |
| Real 4G latency | P50 and P95 telemetry on the route |
| GPS accuracy in Nahlaot's narrow streets | Reported accuracy at each stop |
| Model licences and provider retention | Record exact versions; read each licence, DPA and retention term |
| GDPR duties | Legal review of booking, marketing and data flows |
| Total cost | Hours spent on implementation, reference photography and guide help |

**Licences** (from the run): OpenCV ≥ 4.5 Apache 2.0; Tesseract engine Apache 2.0 (check the wrapper and trained-data terms); DINOv2 code and weights Apache 2.0; SigLIP big_vision Apache 2.0, subject to each checkpoint; CLIP checkpoint-dependent; transformers.js Apache 2.0 (model licences separate); MediaPipe: check the package and model terms.

## 9. The case against photo verification

INFERRED: the strongest objection isn't cost, it's experience. A child finds the plaque, the sun covers the inscription, the check rejects it, people walk through the frame, the camera permission drops, and the guide has to step in. The system fails at the exact moment the players succeeded. It also brings images of bystanders and children onto a server, a provider dependency, device inequality, and arguments over whether a pass was fair.

A typed answer, the group's own confirmation or the guide is better when:
- the object changes, gets covered, or can't be photographed safely;
- the stop is crowded or full of identifiable children and bystanders;
- phones are old or the connection is poor;
- the score has little competitive weight;
- guide time costs less than maintaining a verifier.

If the pilot shows photo checks frustrate more families than they help, keep the photo-taking and drop the automated scoring.

## Source register

URLs were not preserved in the pasted answer; publishers and titles as the run gave them. "Read" means read by the run on 3 Nov 2026 unless dated.

| Publisher · date | Source | Used for | Kind |
|---|---|---|---|
| OpenCV · live docs | Features2D + homography; AKAZE/ORB tracking; licence page | ORB/RANSAC workflow; Apache 2.0 | Primary |
| HPatches authors · 2017 | HPatches benchmark | Protocol | Primary |
| SOTA2 · read 3 Nov 2026 | HPatches illumination and viewpoint leaderboards | ORB vs SIFT figures | Secondary |
| MDPI · 2026 review | Review describing the HPatches protocol | 108-scene protocol | Secondary |
| Meta AI · 2023 | DINOv2 repository | Retrieval, licence | Primary |
| Google Research | big_vision / SigLIP | Model, licence | Primary |
| Google AI Edge | MediaPipe Image Embedder, Face Detector | Browser embeddings, face blur | Primary |
| Hugging Face · Mar 2026 | WebGPU guide | ~85 % WebGPU availability; Safari varies | Primary |
| Google Cloud | Vision pricing; Vertex multimodal embedding pricing; OCR languages; Vision data usage | Prices, Hebrew, retention | Primary |
| AWS · 2 Nov 2026 | Textract multilingual announcement; Textract and Rekognition pricing; Textract limits page | Hebrew (conflicting), prices | Primary |
| Microsoft | Azure OCR language support; Azure Vision pricing | Hebrew; free tier (paid region prices not resolved) | Primary |
| OpenAI | API pricing; vision token rules; data controls | LLM cost; retention, ZDR | Primary |
| Anthropic | Pricing; image tokenisation | LLM cost | Primary |
| Google AI for Developers | Gemini pricing; Gemini API terms | LLM cost; paid vs free data terms | Primary |
| Replicate | CLIP model page | Per-second price | Primary |
| Chen et al. · CVPR, June 2024 | Screen-recapture detection | 16.78 % vs 26.82 % EER | Primary |
| MDN | HTML `capture` attribute; Geolocation API | Browser behaviour | Primary docs |
| Israeli Privacy Protection Authority · 14 Aug 2025 (updated 18 Aug) | Amendment 13 guidance | Israeli obligations | Primary |
| EU · 2016; EDPB · 2019 | GDPR Art. 3; Guidelines 3/2018 | Territorial scope | Primary |
| Google ML Kit; Apple; Google Pixel | Input image guidelines; camera focus help | ~16 px per character; tap to focus | Primary |
| S. Birchfield | Feature matching and homography (course text) | Overlapping features | Educational |
