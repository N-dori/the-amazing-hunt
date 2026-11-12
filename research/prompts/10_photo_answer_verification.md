# Research prompt 10: verifying a photo answer, cheapest first

Written 3 Nov 2026 for Claude on the web (web search on). The answer goes to `research/results/app-tech/10_photo_answer_verification.md`; the parts that can serve a challenge are then imported into `docs/knowledge/`.

---

**Role and purpose.** You are a technical researcher advising a small Jerusalem tour operator. It runs an outdoor, team-based walking game for families and visitors (mobile web app, Next.js, self-hosted on one small VPS: 2 vCPU, 4 GB RAM, already running live sites). One answer type will be **"take a photo"**: at a stop, the team photographs a specific real object (e.g. a small metal plaque on a wall naming the artists of a street mural, or a detail of the mural itself) and the app must decide **"is this the right thing, photographed here?"** We want the **cheapest solution that works**, not necessarily an LLM.

**Instruction.** Compare the technical ways to verify such a photo, and recommend one primary approach and one fallback, with costs and an architecture.

**Approaches to compare (add others you find):**
1. **Image-similarity embeddings** against 3–10 reference photos taken by us: CLIP, SigLIP, DINOv2 and similar; hosted embedding APIs (e.g. Google Vertex AI multimodal embeddings, AWS Titan Multimodal Embeddings, Cohere, Jina, Hugging Face Inference, Replicate) vs self-hosted on CPU vs in the browser (transformers.js, MediaPipe Image Embedder, TensorFlow.js). Typical thresholds and false-accept rates for "same object, different angle, sun and shadow".
2. **Classic feature matching** (ORB, AKAZE, SIFT + homography / RANSAC), e.g. OpenCV.js in the browser: accuracy on flat objects like plaques and painted walls, speed on mid-range phones.
3. **OCR** of the plaque's text (Latin and Hebrew script): on-device (Tesseract.js, the browser Shape Detection / Text Detection API where it exists) vs cloud (Google Cloud Vision, AWS Textract or Rekognition text, Azure AI Vision Read). Hebrew support and accuracy on engraved or shiny metal.
4. **Landmark / object detection** services (e.g. Google Cloud Vision landmark and label detection).
5. **Multimodal LLMs** (OpenAI, Anthropic Claude, Google Gemini vision): price per image at small sizes, latency, reliability of a yes/no judgement, prompt-injection or trickery risks.
6. **Simple signals that cost nothing:** GPS and time at capture, EXIF (and its absence in browser captures), a live camera capture vs an upload from the gallery.

**Questions each approach must answer (a comparison table, one row per approach):**
- Cost per verification and per 1,000, with the provider's price page and its date; free tiers.
- Latency on a 4G connection with a phone photo resized to ~1024 px; whether it works offline.
- Accuracy for our case: outdoor sun, glare on metal, angle, partial occlusion, people walking past. Cite benchmarks or practitioner reports; say where evidence is thin.
- **Cheating resistance:** can a team pass by photographing a picture of the object from a website or a screen, or a printed photo? What detects that (screen moiré, GPS, liveness)?
- Privacy: does the image leave the phone; the provider's data retention and training policy (zero-retention options); handling of bystanders' faces in the frame (blurring before upload, e.g. on-device face detection); obligations under Israeli privacy law and GDPR for visitors from the EU; children in the groups.
- Footprint if self-hosted: RAM and CPU on a 2 vCPU / 4 GB server shared with live sites; model size; cold start.
- Browser support: iOS Safari and Android Chrome, current versions (2025–2026).
- Licence of models and libraries (commercial use).

**Architecture.** Sketch the recommended flow: phone (capture, resize, optional on-device check or face blur) → our server's separate verify service (holds any API key, rate limits, a spend cap; the key never reaches the browser) → provider → a yes / no / unsure result → the game's code awards points. What to do on "unsure" (retry, the guide confirms, or a typed answer).

**Keywords:** image retrieval, near-duplicate detection, visual place recognition, CLIP zero-shot, SigLIP, DINOv2 embeddings, cosine similarity threshold, ORB homography inliers, OpenCV.js, transformers.js, MediaPipe, Tesseract Hebrew, Cloud Vision OCR, presentation attack detection, screen recapture detection, zero data retention.

**Sources and timeframe.** Prefer official documentation and price pages, peer-reviewed or arXiv papers, and benchmarks from 2024 to November 2026. Older sources only for background. Give the date of every price or limit.

**Counter-arguments.** Include the strongest case against using photo verification at all for an outdoor family game (failure rates, frustration, privacy), and when a human (the group or the guide) confirming is simply better.

**Evidence rules.** Label every substantive claim OBSERVED (a cited source says it), INFERRED (your reasoning from sources) or UNKNOWN. Where sources disagree, show both. Do not answer from memory where a current source exists.

**Output.**
1. A one-paragraph recommendation (primary + fallback) with the expected cost for 1,000 verifications a month.
2. The comparison table.
3. The architecture sketch.
4. A small test plan we can run ourselves: 30 photos of one plaque and one mural detail (sun, shade, angles, with a phone screen showing the same object), and how to pick the threshold.
5. What remains unknown, and the test or source that would settle each item.
6. A source register: publisher · date · URL · what it was used for · primary or secondary.

Write a report that stands on its own: do not ask clarifying questions; state your assumptions and proceed.
