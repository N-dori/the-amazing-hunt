# 03_media_formats_audio_offline.md

- **Asked:** 2026-10-16T00:37:02.334Z
- **Preset:** `high` (Perplexity Agent API) · run `resp_4580bfeb-ac0c-470e-9138-fdcac6252ae1` · completed
- **Cost:** 0.62552

> True as of the date above. Re-run the prompt rather than quoting this file as current.

## Answer

# The Memory Protocol: media and offline-delivery decision

**Decision for the late-October 2026 pilot:** ship a **text-complete, offline-capable game** with pre-generated WebP/JPEG images, a vector route map where practical, H.264/AAC MP4 video, and short, optional human-recorded MP3 transmissions. Keep the playable download near **100 MB per phone**, rather than making 50–150 MB of media a mandatory service-worker installation. Store each pair’s actions in a local outbox and reconcile them with a small server-side event log whenever a connection returns. **INFERRED.** These are engineering targets, not measured outputs from the as-yet-unbuilt game.

**Assumptions — INFERRED from the project brief:** six players use three phones, one per competing pair, plus a guide dashboard; the outing lasts about 4–5 hours including meals; cellular service is 4G with weak spots; and the Library portion starts on guest Wi-Fi. Library-only network resources may cease to work after departure. Historical evidence and its provenance remain distinct from interpretation, attributed anecdotes and expressly labelled fiction. Neither a camera, location fix nor audio playback is required to advance.

## 1. Formats

### Browser and device trade-offs

All support assessments below are **OBSERVED as documented by 16 October 2026**; decode-cost judgments without a device benchmark are marked **INFERRED**.

| Format | iOS Safari and wider-browser position | Compression, transparency and mid-range-phone consequence |
|---|---|---|
| SVG | **OBSERVED:** A browser-rendered vector format suited to diagrams and precise shapes. **INFERRED:** Suitable for a bounded, simplified zoomable route, not an enormous DOM of tiny map features. [web:76] | **OBSERVED:** Resolution-independent. **INFERRED:** Small for line work; rendering cost grows with path and DOM complexity. Transparent by design. [web:76] |
| WebP | **OBSERVED:** iOS Safari supports it from **iOS 14**; it supports lossy or lossless images, animation and alpha transparency. [web:19][web:77] | **INFERRED:** Best default raster compromise for these phones. Decode and memory still depend strongly on pixel dimensions, so do not use one giant image merely because its compressed file is small. [web:77] |
| AVIF | **OBSERVED:** Can I Use lists iOS Safari support from **iOS 16.0**; desktop Safari’s 16.1–16.3 entry is partial and becomes full at 16.4. AVIF supports alpha and often compresses better than WebP, but does not progressively render. [web:18][web:76][web:78] | **INFERRED:** Worth testing for photographs, not necessary as the pilot’s sole format. Its smaller transfer can outweigh decode cost, but first-render performance on the *actual* phones is unverified. Next.js documents roughly **50% longer encoding** for roughly **20% smaller files** than WebP—an encoding comparison, not a phone-decode benchmark. [web:148] |
| PNG | **OBSERVED:** Broadly compatible, lossless and alpha-capable; it is a dependable transparency fallback. [web:76][web:89] | **INFERRED:** Reserve for crisp source material, small overlays or fallbacks; photographic PNGs consume unnecessary storage. |
| JPEG | **OBSERVED:** Broadly compatible, lossy and without alpha. [web:76][web:81] | **INFERRED:** Reliable photographic fallback with inexpensive, familiar decoding; preserve archival text legibility rather than chasing the smallest file. |
| Lottie JSON / `.lottie` | **OBSERVED:** These need a player, rather than native browser image support. `.lottie` is a compressed package; LottieFiles reports **60–80%** reduction against JSON in suitable exports. Its dotLottie web player rasterizes to canvas and brings an approximately **500 KB compressed WASM engine** before the first frame. [web:140][web:136] | **INFERRED:** Good for a few authored vector motions, but runtime download, compilation and continuous rendering can cost more than a tiny animation warrants. |
| Rive `.riv` | **OBSERVED:** Also needs a WASM/canvas runtime. Rive lists **222 KB compressed** for `canvas-lite`, **567 KB** for canvas and **648 KB** for WebGL2; these are runtime sizes, not animation-file sizes. [web:146][web:147] | **INFERRED:** Strong candidate when interactive state machines justify that runtime; excessive for a handful of simple pilot objects. Pause off-screen animations. |
| MP4 H.264 / HEVC | **OBSERVED:** H.264 is broadly browser-compatible and commonly hardware-decoded. HEVC can be materially smaller but has device- and platform-dependent browser support and licensing considerations. [web:16] | **INFERRED:** H.264 is the low-risk, low-decode-cost baseline; do not make HEVC the only clue. Video alpha is not part of this recommendation. |
| WebM VP9 / AV1 | **OBSERVED:** VP9 is broadly supported and offers useful compression; Safari does **not** support VP9 alpha. AV1 compresses further, but Safari AV1 playback requires suitable hardware—MDN identifies iPhone **15 Pro** and **16 or later**—so a Safari-version check alone is insufficient. [web:16] | **INFERRED:** An optional tested VP9 rendition may save bytes. Do not require AV1 decoding on unspecified family phones; retain MP4/H.264. |
| MP3 | **OBSERVED:** Supported by major browsers, including Safari; less efficient than AAC at comparable fidelity in MDN’s guidance. [web:175] | **INFERRED:** Excellent single-file speech fallback and operationally simplest for this pilot. Audio has no transparency requirement. |
| AAC | **OBSERVED:** AAC in MP4 is a broadly usable audio choice and is more compression-efficient than MP3; MDN notes platform-codec qualifications for some browser builds. [web:175] | **INFERRED:** Use with H.264 video; test an audio-only AAC/MP4 alternative if speech-file savings matter. |
| Opus | **OBSERVED:** Efficient for speech. The compatibility history is **container-dependent**: iOS 11-era support was limited/partial; Can I Use marks iOS Safari **18.4** as fully supported, and MDN specifically documents **Ogg Opus on iOS 18.4+**. [web:17][web:58][web:175] | **INFERRED:** Offer a tested Ogg/Opus source ahead of MP3 if useful, but not Opus alone. **Source disagreement:** MDN’s audio-codec page still says Safari `<audio>` accepts Opus *only* in CAF, contradicting its newer container-page note about Ogg on iOS 18.4+. Test the intended container on each pilot iPhone. [web:175][web:58] |

### Production budgets

**Every target in this table is INFERRED**: it is a per-file or per-set production ceiling, not a claimed benchmark. Reasons marked **OBSERVED** cite the underlying format behavior. Keep original archival images separately; the game copy is a legible derivative, not a replacement for the source.

| Asset type | Format | Fallback | Target file size | Reason |
|---|---|---|---|---|
| Illustrated route map: Library → Nahlaot → Mahane Yehuda | Simplified, self-hosted SVG for route and labels; if illustration is too complex, pre-render WebP map tiles at two zoom levels | One complete JPEG/PNG overview plus typed directions and guide confirmation | **≤1 MB** overview; **≤8 MB** total for selected tiles | **OBSERVED:** SVG keeps linework sharp; WebP efficiently compresses raster illustration. **INFERRED:** Bound the number of paths and cached tiles; a map is orientation aid, never the only route clue. [web:76][web:77] |
| Transparent historical map overlays | Separate transparent WebP layers, loaded only when revealed | PNG layers; equivalent dated text description | **≤250 KB each; ≤3 MB** pilot set | **OBSERVED:** WebP and PNG support alpha; JPEG does not. **INFERRED:** Separate layers make historical provenance and dates easier to display and prevent fictional additions being mistaken for an archival map. [web:76][web:77] |
| Destination photographs | Pre-generated, responsive WebP at roughly 480/960/1440 px widths | JPEG at matching widths | **80–250 KB** ordinary display; **≤500 KB** enlarged view | **OBSERVED:** WebP commonly improves on JPEG transfer size. **INFERRED:** Supply only the displayed resolution and an accessible description, rather than decoding full originals on every phone. [web:77][web:155] |
| Dated archival photographs and document crops | Pre-generated WebP, with a separately available higher-resolution crop where reading detail matters | JPEG; PNG for line art or text that visibly suffers lossy artifacts | **150–400 KB** normal view; **≤1 MB** necessary detail view | **INFERRED:** Legibility and source/date credit outrank aggressive compression; keep a typed transcription where appropriate. PNG remains a lossless option. [web:76][web:89] |
| Animated puzzle objects | CSS/SVG transitions for simple movements; one small `.lottie` only where authored motion improves the puzzle | Static SVG/PNG frame and equivalent tap/typed interaction | **≤100 KB** each; **≤2 MB** animation set, excluding a locally bundled player | **OBSERVED:** `.lottie` compresses JSON but incurs a WASM player download. **INFERRED:** Avoid adding Rive merely for decorative motion; benchmark either runtime before adopting it for genuinely stateful puzzles. [web:136][web:140][web:146] |
| Short video clues, 10–30 seconds | Self-hosted **MP4 H.264 + AAC**, 480–720p, `playsinline`, poster and explicit Play | Complete captioned still sequence/transcript; optional tested WebM/VP9 rendition | **1–3 MB per clip**, **≤45 MB** pilot set | **OBSERVED:** H.264 has broad, often hardware-assisted playback; WebM/VP9 can be offered as another source. **INFERRED:** Author and subtitle every clue so video is never essential. [web:16][web:179][web:51] |
| HARMONY transmissions, 15–45 seconds | **MP3 mono speech**, approximately 48–64 kbps, paired with a text-first transcript and timed WebVTT | Text alone; optional tested Ogg/Opus source | **0.1–0.4 MB per transmission**, **≤9 MB** pilot set | **OBSERVED:** MP3 is broadly supported; WebVTT supplies timed text. **INFERRED:** The transcript is the authoritative silent path; speech is an optional presentation of the same words. [web:175][web:47] |
| Ambient sound | Short, licensed/original **AAC-in-MP4** or MP3 loop, opt-in outside the Library | Silence; optional tested Opus loop | **≤1 MB per loop; ≤3 MB** pilot set | **OBSERVED:** AAC compresses better than MP3 at comparable fidelity; MP3 is a broad fallback. **INFERRED:** Atmosphere should not compete with conversation, obscure spoken clues or start in a reading hall. [web:175] |

**Delivery rule — INFERRED:** publish immutable, content-hashed variants; keep both the compact source and its fallback where required, but avoid downloading both to a phone unless compatibility demands it. Use authored alt text and, for video, a poster and complete equivalent text.

## 2. Offline delivery and three-phone sync

### What downloads, when, and how much

**OBSERVED:** Serwist supports the current Next.js App Router. Its documented webpack setup uses `@serwist/next`, `app/sw.ts`, a generated precache manifest, `public/sw.js` and an offline document fallback; its documentation also points Turbopack users to a separate guide. Serwist says infrequently used, large media is often a poor precache candidate. [web:38][web:35]

**INFERRED pilot plan:**

| Stage | Phone behavior | Budget and failure behavior |
|---|---|---|
| Installation/check-in on Library guest Wi-Fi | Precache the versioned app shell, essential fonts, offline/error pages, text for *every* mission, route overview, guide-confirmation controls and the evidence-entry form. Explicitly download the **first mission’s** media; display a verified “Ready offline” indicator only after each required fetch has finished and opened from cache. | **~10 MB shell/text/overview + ~8 MB first mission = ~18 MB.** Do not put the entire media catalog in the service worker’s install transaction: one failed large fetch could hold up the new worker. **INFERRED**, consistent with Serwist’s large-asset advice. [web:35] |
| While still on Wi-Fi; then before each departure/mission | Offer a clearly labelled **Download rest of route** action on Wi-Fi. Warm full files into a versioned runtime media cache in small batches, checking success and available storage. Later, fetch only the next mission’s chosen media and one mission ahead over 4G. | **~80 MB** further core media, for **~98 MB core per phone**; optional high-detail imagery/alternate renditions **≤30 MB**, making **~128 MB maximum**. **INFERRED budget.** |
| When a file is absent or storage has been cleared | Show the locally held text task, map overview/directions or guide-confirmation route. Mark optional media “Unavailable offline”; retry on reconnection without blocking scoring or evidence entry. | **INFERRED:** Never interpret a cache hit, GPS fix, photo or video watch as proof that a history task was completed. |

The **~98 MB** planning total is **10 MB** shell/text/overview + **8 MB** first mission + **8 MB** map tiles + **3 MB** overlays + **24 MB** photographs + **40 MB** videos + **3 MB** audio + **2 MB** animations. The separate **30 MB** allowance covers optional detail and encoding alternatives. These are **INFERRED caps** to validate against actual exports; downloading the 98 MB core to three phones means roughly **294 MB transferred** if none of the files is already cached. A full 128 MB on each would be roughly **384 MB**. Do not precache Library-network-only catalog pages or assume permission to retain their content: let players record the identifier, the verifiable fact and its provenance in the dossier.

**Storage reality — OBSERVED, as documented by October 2026:** WebKit’s **Safari 17/iOS 17** policy gives a browser origin *up to* roughly **60% of total disk**, and an installed, standalone Home Screen web app the same origin quota; embedded WebKit apps instead have roughly **15%**. These are ceilings, **not reservations or guarantees**. Best-effort data can still be evicted under storage pressure or overall-quota pressure, usually by origin. [web:7] WebKit’s Intelligent Tracking Prevention clears script-writable data after **seven days of Safari use without interaction with that site**; WebKit expressly exempts the first-party domain of a **Home Screen web app** from that particular cap. Installation does *not* prevent user deletion or other storage-pressure eviction. [web:3][web:7] Chrome/Chromium documents an origin ceiling of **up to 60% of total disk** and browser-wide use of **up to 80%**; Samsung Internet documents service-worker offline caching, but a Samsung-specific guaranteed MB quota was **UNKNOWN** in the reviewed official material. Measure the actual device instead of assigning Samsung a fixed allowance. [web:183][web:215]

**INFERRED operational safeguards:** request `navigator.storage.persist()` where available, but do not treat a request as approval; log `navigator.storage.estimate()` usage/quota, leave ample free-device space, and run a cold-start offline rehearsal on every pilot phone. Both methods provide permission/estimates rather than guaranteed bytes. [web:182][web:189] Keep the server’s authoritative event log and evidence copies so a wiped phone can rejoin; if it was wiped **before** its unsent actions reached the server, those actions require guide-assisted reconstruction. Warn on pending unsynced actions.

**Caching mechanics — OBSERVED and INFERRED:** precache hashed shell files and text; use a bounded, versioned `CacheFirst` cache for explicitly downloaded media and a network-first strategy with a short timeout for non-sensitive mission documents. Do **not** runtime-cache private API responses or quietly cache partial streaming responses as if they were complete files. Workbox documents that offline audio/video seeking needs a **complete cached response** plus range-request handling; media playback often asks for byte ranges, and merely caching streamed partial responses will not populate the full file. Apply an equivalent range-request handler in the chosen Serwist setup and test 206 responses offline. [web:35][web:61][web:74]

**VPS and Caddy — OBSERVED:** self-hosted `next/image` optimization happens **at request time, not build time**. Next.js can use Sharp and cache results, but AVIF adds first-request encoding time and each extra output format creates another cached variant. Next.js already makes its genuinely hashed static assets immutable. [web:33][web:148][web:150] **INFERRED recommendation:** pre-generate the known image widths and formats in CI/build tooling; serve them as static files through Caddy, and use an `<picture>` element or a custom/static image loader for width selection. This avoids concurrent first-view transformations consuming the pilot’s **2 vCPU/4 GB RAM** alongside the game API. Leave dynamic `next/image` for later measured demand.

**INFERRED Caddy policy:** serve `/media/<content-hash>/…` directly with `Cache-Control: public, max-age=31536000, immutable`; use revalidation or `no-cache` for mutable mission manifests, and `private, no-store` for scores, dossiers and authentication. Preserve `Range`/`If-Range` requests and `206 Partial Content` responses for MP4/audio; do not compress already compressed media or place an opaque proxy cache over personal data. Caddy documents both static file serving, response-header configuration and range support. Test `curl` with and without `Range` through the **actual** reverse-proxy route. [web:154][web:158][web:42]

### Shared state: an offline outbox, not a real-time server

**INFERRED simplest proven pattern:** an **IndexedDB transactional outbox + idempotent HTTP sync + server-authoritative event log**, with short polling while a mission/dashboard is visible. Workbox documents an IndexedDB-backed retry queue, but its replay in browsers without native Background Sync is tied to later service-worker starts; do not depend on an iPhone synchronizing while the page is closed. [web:62][web:65]

1. Each phone writes its action **and** an outbox event in the same local transaction: `eventId` (UUID), game/pair/device IDs, local sequence, action type, payload and last-seen server revision. Give submitted evidence its identifier, fact, provenance and fact/interpretation/fiction label. **INFERRED design.**
2. On app open, return to foreground, connection recovery and after an action, `POST` queued events. The server deduplicates by `eventId`, validates authorization and returns accepted events, authoritative revision and events since the caller’s revision. The guide dashboard polls the same revision endpoint. Three phones and a guide do not justify WebSockets or a message broker. **INFERRED design.**
3. Append independent observations and evidence; the guide alone issues **rubric-score and unlock decisions**. A score is an event referring to its submission/rubric version, not a last-writer-wins field. Flag competing edits or offline unlock conflicts for the guide; show provisional local progress until acknowledgement. Never award speed points on ethical reasoning. **INFERRED design.**
4. Keep family oral history opt-in, private and unpublished by default. A participant may enter only the memory they choose to preserve; recording or photographing a person requires consent. **INFERRED implementation of the stated pilot rules.**

## 3. Narration decision

**Pilot recommendation — INFERRED:** write every transmission as concise screen text first; then record a small number of HARMONY lines with **one contracted, bilingual-capable human performer**, directed and checked by a local Hebrew speaker for Nahlaot, Mahane Yehuda, personal names and any Ladino terms. Keep the delivery restrained rather than “robotic sci-fi.” Pay for expressly documented reuse in this paid web game, edits and future tours. Store the mastered files on the VPS; audio must add character, **not information unavailable in text**.

| Approach | Quality, English/Hebrew and recurring HARMONY voice | Cost per finished minute and commercial terms, as available by 16 October 2026 | Pilot verdict |
|---|---|---|---|
| Human-recorded | **INFERRED:** Best controllable pronunciation and emotional nuance after directed takes; a recurring voice is stable if the same performer remains available. Ladino and place-name competence must be auditioned, not presumed. | **OBSERVED:** A voice-actor marketplace’s **2026** indicative US non-union e-learning range is **$30–$55 per finished minute**, often with a **$350–$450 minimum**; a character performance or this paid-game use may be quoted differently. Usage rights and duration must be contracted; a Jerusalem-local quote is **UNKNOWN**. [web:227][web:236] | **INFERRED:** Record the limited pilot script and budget for a minimum session, direction and corrections—not merely minutes × the advertised rate. |
| Browser `speechSynthesis` | **OBSERVED:** `getVoices()` returns the voices available on the **current device**. **INFERRED:** Sound and Hebrew availability can differ between the three phones; a stable, directed character and reliable mixed-language names cannot be promised. [web:163] | **INFERRED:** No per-generated-minute vendor charge, but device variation and QA have a real cost. Commercial rights to the *script* remain DORI’s responsibility; no verified browser-wide promise about each system voice’s contractual terms was found. | **INFERRED:** Optional accessibility/user-controlled read-aloud only; never the canonical HARMONY performance. |
| Prerecorded OpenAI API TTS | **OBSERVED:** As listed in the API pricing material available in **October 2026**, `tts-1` costs **$15 per million characters** and `tts-1-hd` **$30 per million characters**. At an **assumed 900 characters per finished minute**, generation is about **$0.014** or **$0.027/minute**, respectively, before revisions, storage and taxes. `gpt-4o-mini-tts` instead has separate text/audio-token prices, so these character estimates do **not** apply to it. OpenAI lists Hebrew among its speech-guide languages but says voices are optimized for English; pronunciation of these particular names is **UNKNOWN**. Its guide requires clear AI-voice disclosure. [web:106][web:199] | **OBSERVED:** OpenAI’s API agreement assigns output rights to the customer to the extent permitted by law, subject to terms and input rights. **Important distinction:** its separate **ChatGPT Voice Output** service term says that output is non-commercial; do not substitute or redistribute ChatGPT voice audio as if it were licensed API TTS. A built-in API voice aids repeatability, but identical direction across takes is **INFERRED**, not guaranteed. [web:118][web:108][web:196] | **INFERRED:** Affordable alternative if human recording misses the schedule; disclose AI, audition and manually approve every name. |
| Prerecorded ElevenLabs TTS | **OBSERVED:** Its **October 2026** pricing lists Starter at **$6/month**, with a temporary **$1 first-month** promotion shown through **18 October**, and **30,000 monthly credits**; approximately **one credit per character** for the stated TTS example. At **900 characters/minute**, a fully used normal-price Starter allowance implies about **$0.18/minute**, but the subscription minimum, model, regeneration and API billing can change effective cost; the API page separately lists **$0.08/1,000 characters** for multilingual models. Paid plans include a commercial licence; **free-plan generation does not** acquire one. [web:92][web:96][web:94] | **OBSERVED:** ElevenLabs advertises Hebrew among supported languages and pronunciation dictionaries, but documentation distinguishes model families; an English-origin voice may acquire an accent or drift. Ladino performance is **UNKNOWN**. A licensed recurring voice may be consistent after testing; do not clone any real person without permission. [web:91][web:202][web:209] | **INFERRED:** Revisit for expanded, frequently revised games only after model-specific Hebrew/Ladino auditions and a rights review. |

**Silent-first playback — OBSERVED and INFERRED:** In Library reading halls, start **muted with no autoplay**; present the entire transmission as readable text, one idea/question/action at a time. Outside, require a deliberate **Play audio** tap and provide prominent mute, pause, replay and volume controls; respect the phone’s volume and never switch sound on just because a mission unlocks. Apple permits muted/no-audio inline video autoplay under conditions, but that is **not** a reason to autoplay audible clues; use `playsinline` for video. Supply WebVTT captions/subtitles and an independently readable transcript, and test track rendering on each phone. [web:160][web:51][web:47] **INFERRED:** Pause narration and ambience on `visibilitychange`, require a fresh tap to resume, and never rely on uninterrupted locked-screen/background playback; MDN documents visibility changes when a mobile user switches apps or locks the screen. [web:239]

**Commercial-song boundary — OBSERVED:** ACUM says protected repertoire in a **commercial internet service** requires contacting its digital department and obtaining a licence **before use**; its posted tariffs are **not themselves a licence**. ACUM separately says incorporating music into an audiovisual soundtrack requires permission. Consequently, **INFERRED:** do not embed, cache, synchronize, reproduce lyrics from, or play a well-known Israeli song in this paid game without checking the composition/publishing, recording/master and applicable synchronization and playback rights. [web:121][web:122] A plain outbound **link to an official stream**, opened by the visitor in that service rather than played or controlled inside DORI’s app, is the lower-risk interpretive pointer; **INFERRED:** it grants DORI no right to reuse audio, cover art or lyrics, and must not be treated as a licence for the guide to play a personal Spotify account publicly. Spotify describes its service as personal/non-commercial and restricts commercial streaming integrations and synchronization. [web:124][web:131]

**Revisit after the pilot — INFERRED:** measure actual download completion, cache survival, battery/animation behavior and comprehension when sound is off. If scripts change frequently, audition a *specific* paid AI voice/model on English, Hebrew and Ladino names, document pronunciation corrections, disclosure and licence, then compare total editing time—not API price alone—with booking the same human performer again.

## 4. Strongest evidence against this decision

| Recommendation challenged | Strongest counter-evidence and response |
|---|---|
| Prefer WebP to AVIF for the pilot | **OBSERVED:** AVIF has supported iOS Safari since **iOS 16**, supports transparency and can yield materially smaller images; Next.js describes approximately **20% smaller** output than WebP in its comparison. **INFERRED response:** benchmark AVIF on the actual phones, especially image-heavy missions. Pre-generated AVIF plus WebP/JPEG fallback may beat the simpler plan without taxing the VPS. [web:18][web:78][web:148] |
| Prefer H.264 to VP9/AV1 | **OBSERVED:** VP9 has broad support and good compression; AV1 offers still greater compression on supported hardware. **INFERRED response:** optional alternate renditions may cut the Wi-Fi/4G download. They do not remove the H.264 fallback for an unidentified older iPhone. [web:16] |
| Prefer MP3 speech to Opus | **OBSERVED:** Opus is efficient, and iOS Safari’s **18.4+ Ogg Opus** support is documented despite MDN’s conflicting CAF-only audio-page wording. **INFERRED response:** if all pilot phones pass playback *and offline seeking* tests, Opus plus MP3 fallback is a sound improvement; MP3 alone is not a claim that Opus is unsupported. [web:58][web:175][web:17] |
| Avoid full precaching of 50–150 MB | **OBSERVED:** Modern Safari/WebKit and Chromium publish disk-percentage origin ceilings far above 150 MB on many devices; an installed iOS PWA is exempt from WebKit’s particular seven-day cap. **INFERRED response:** a deliberately requested, verified full-route download on Library Wi-Fi may be safer than relying on 4G later. Offer it; avoid making its completion a condition of service-worker installation or promising the cache cannot be evicted. [web:7][web:3][web:183][web:35] |
| Commission a human HARMONY voice | **OBSERVED:** API TTS is orders of magnitude cheaper per generated minute than indicative professional recording rates, supports reusable prerecorded files, and at least one vendor advertises Hebrew/pronunciation tools. **INFERRED response:** human narration is a pilot-quality choice, not a demonstrated cost optimum; switch if audition and comprehension testing favour licensed AI. [web:106][web:227][web:91][web:202] |

## What remains unknown

| Unknown | Test or source that would settle it |
|---|---|
| **UNKNOWN:** The family’s precise iOS/Android versions, storage headroom, supported Opus containers, AVIF first-render cost and AV1 hardware decoding. | Inventory each phone; run a same-file image/audio/video test in its actual browser and installed PWA, including cold offline restart, seeking, battery and storage-pressure trials. |
| **UNKNOWN:** Real exported asset totals, first-mission download time and Caddy/VPS performance under concurrent image requests. | Export the final assets, record a byte manifest, throttle three phones to weak 4G, and load-test the production Docker/Caddy path; inspect CPU, RAM, 206 responses and cache hits. |
| **UNKNOWN:** Whether a particular Library resource can lawfully and technically be retained offline or reached on guest Wi-Fi. | Confirm the item’s rights and network conditions with the Library; rehearse identifier/fact/provenance entry on guest Wi-Fi and again after leaving it. |
| **UNKNOWN:** Samsung Internet’s dependable free space on the actual device, and whether any browser will retain this game’s cache through the outing. | Inspect `navigator.storage.estimate()` and persistence result on each device; perform installation, offline, restart and deliberately low-storage tests. |
| **UNKNOWN:** The actual cost and scope of a Jerusalem performer’s commercial game rights, and the quality of any specific human or AI Hebrew/Ladino reading. | Obtain a written usage/retake quote and matched auditions using the final script, reviewed by local speakers. |
| **UNKNOWN:** Rights and price for any particular commercial recording or lyric excerpt. | Identify the recording and rightsholders; obtain written answers from ACUM and the recording/master rightsholder before inclusion. |

## Source register

Dates below identify the **publication or page-update information available in the research results by 16 October 2026**, not a promise that a vendor policy or price remains unchanged.

| Publisher | Date | URL | What it was used for | Primary/official or secondary |
|---|---|---|---|---|
| Can I Use | Updated 14 October 2026 | https://caniuse.com/avif | iOS Safari AVIF version [web:18] | Secondary compatibility data |
| Can I Use | Updated 14 October 2026 | https://caniuse.com/opus | iOS Safari Opus version and partial-support history [web:17] | Secondary compatibility data |
| Can I Use | Updated 14 October 2026 | https://caniuse.com/webp | iOS Safari WebP version [web:19] | Secondary compatibility data |
| MDN | Updated 9 October 2026 | https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types | Image formats, alpha and AVIF progressive-render limitation [web:76] | Secondary technical documentation |
| web.dev | Updated 3 October 2026 | https://web.dev/learn/performance/image-performance | WebP/AVIF compression and alpha [web:77] | Official platform guidance |
| MDN | Updated 3 October 2026 | https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Video_codecs | Video compatibility, hardware, compression and licensing cautions [web:16] | Secondary technical documentation |
| MDN | Updated 14 October 2026 | https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Audio_codecs | MP3/AAC/Opus; contradictory Safari CAF sentence [web:175] | Secondary technical documentation |
| MDN | Updated 3 October 2026 | https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Containers | Ogg Opus on iOS 18.4+ and media containers [web:58] | Secondary technical documentation |
| LottieFiles | Updated 8–9 October 2026 | https://docs.lottiefiles.com/en/runtimes/distributions/js/v0.x/core-concepts | Player/WASM overhead [web:136] | Primary/official vendor documentation |
| LottieFiles | Updated 9 October 2026 | https://docs.lottiefiles.com/en/creator/10_exporting | `.lottie` compression claim [web:140] | Primary/official vendor documentation |
| Rive | Updated 7 October 2026 | https://rive.app/docs/runtimes/runtime-sizes | Web runtime sizes [web:146] | Primary/official vendor documentation |
| WebKit | 10 August 2023; page updated September 2026 | https://webkit.org/blog/14403/updates-to-storage-policy/ | Safari 17/iOS 17 quotas and eviction [web:7] | Primary/official |
| WebKit | 24 June 2020; page updated October 2026 | https://webkit.org/tracking-prevention/ | Seven-day rule and Home Screen exemption [web:3] | Primary/official |
| web.dev | Updated 2 October 2026 | https://web.dev/articles/storage-for-the-web | Chromium quota and best-effort storage [web:183] | Official platform guidance |
| Samsung Internet | Updated September 2026 | https://samsunginternet.github.io/docs/progressive-web-apps | Samsung service-worker/PWA support [web:215] | Primary/official |
| Serwist | Updated 6–7 October 2026 | https://serwist.pages.dev/docs/next/getting-started | App Router integration [web:38] | Primary/official |
| Serwist | Updated 7 October 2026 | https://serwist.pages.dev/docs/serwist/runtime-caching | Large-media caching choices [web:35] | Primary/official |
| Chrome Developers | Updated 28 April 2026 | https://developer.chrome.com/docs/workbox/serving-cached-audio-and-video/ | Complete-media caching and range requests [web:61] | Primary/official |
| Chrome Developers | Updated 2 October 2026 | https://developer.chrome.com/docs/workbox/modules/workbox-background-sync | IndexedDB retry queue and replay limits [web:62] | Primary/official |
| Next.js | Updated 13–15 October 2026 | https://nextjs.org/docs/app/guides/self-hosting | Runtime image optimization and hashed-cache behavior [web:33] | Primary/official |
| Next.js | Updated 15 October 2026 | https://nextjs.org/docs/app/api-reference/components/image | AVIF/WebP encoding and variant-cache trade-offs [web:148] | Primary/official |
| Caddy | Updated 3 October 2026 | https://caddyserver.com/docs/caddyfile/directives/header | Cache-header configuration [web:158] | Primary/official |
| Caddy | Updated October 2026 | https://caddyserver.com/features | Byte-range support [web:42] | Primary/official |
| Apple Developer | Updated September 2026 | https://developer.apple.com/documentation/webkit/delivering-video-content-for-safari.md | iOS inline video and autoplay rules [web:160] | Primary/official |
| MDN | Updated 2–3 October 2026 | https://developer.mozilla.org/en-US/docs/Web/API/WebVTT_API/Web_Video_Text_Tracks_Format | Timed subtitles/captions [web:47] | Secondary technical documentation |
| MDN | Updated 3 October 2026 | https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/getVoices | Device-dependent browser voices [web:163] | Secondary technical documentation |
| OpenAI | Updated 9 October 2026 | https://developers.openai.com/api/docs/pricing.md | API TTS prices [web:106] | Primary/official vendor pricing |
| OpenAI | Updated October 2026 | https://developers.openai.com/api/docs/guides/text-to-speech | Language guidance and AI disclosure [web:199] | Primary/official vendor documentation |
| OpenAI | 1 December 2025; page updated October 2026 | https://openai.com/policies/services-agreement/ | API output rights and customer responsibilities [web:118] | Primary/official terms |
| OpenAI | Updated 9 October 2026 | https://openai.com/policies/service-terms/ | Distinction for non-commercial ChatGPT Voice Output [web:108] | Primary/official terms |
| ElevenLabs | Updated October 2026 | https://elevenlabs.io/pricing | Plan prices and credits [web:92] | Primary/official vendor pricing |
| ElevenLabs | Updated 6 February 2026 | https://help.elevenlabs.io/hc/en-us/articles/13313564601361-Can-I-publish-the-content-I-generate-on-the-platform | Free versus paid commercial-use terms [web:94] | Primary/official vendor terms guidance |
| ElevenLabs | Updated October 2026 | https://elevenlabs.io/docs/eleven-api/guides/how-to/text-to-speech/pronunciation-dictionaries | Pronunciation controls and model qualifications [web:202] | Primary/official vendor documentation |
| Voice Crafters | Updated August–October 2026 | https://www.voicecrafters.com/industry-standard-voice-over-rates/ | Indicative professional narration pricing [web:227] | Secondary marketplace guidance |
| ACUM | Updated August 2026 | https://apps.acum.org.il/licenses/general/register-payment?action=info&sourceTypeCode=T65-1&lang=en | Commercial internet licensing and written-licence requirement [web:121] | Primary/official rights-society guidance |
| ACUM | Updated October 2026 | https://apps.acum.org.il/licenses/general/register-payment?action=info&sourceTypeCode=T08&lang=en | Music in audiovisual soundtracks [web:122] | Primary/official rights-society guidance |
| Spotify | Updated October 2026 | https://developer.spotify.com/policy | Commercial-streaming and synchronization restrictions [web:124] | Primary/official platform policy |

## Sources

### Cited in the answer

- [3] Tracking Prevention in WebKit — https://webkit.org/tracking-prevention/
- [7] Updates to Storage Policy | WebKit — https://webkit.org/blog/14403/updates-to-storage-policy/
- [16] developer.mozilla.org › Formats › Video_codecsWeb video codec guide - Media | MDN - MDN Web Docs — https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Video_codecs
- [17] Opus audio format | Can I use... Support tables for HTML5, ... — https://caniuse.com/opus
- [18] Avif — https://caniuse.com/avif
- [19] WebP image format | Can I use... Support tables for HTML5, CSS3, etc — https://caniuse.com/webp,avif
- [33] Guides: Self-Hosting | Next.js — https://nextjs.org/docs/app/guides/self-hosting
- [35] Runtime caching - Serwist — https://serwist.pages.dev/docs/serwist/runtime-caching
- [38] Step 2: Update tsconfig.json — https://serwist.pages.dev/docs/next/getting-started
- [42] All features of the Caddy Web Server — https://caddyserver.com/features
- [47] Web Video Text Tracks Format (WebVTT) - Web APIs | MDN — https://developer.mozilla.org/en-US/docs/Web/API/WebVTT_API/Web_Video_Text_Tracks_Format
- [51] Examples — https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/track
- [58] Try it — https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Containers
- [61] Serving cached audio and video | Workbox | Chrome for Developers — https://developer.chrome.com/docs/workbox/serving-cached-audio-and-video/
- [62] workbox-background-sync | Modules | Chrome for Developers — https://developer.chrome.com/docs/workbox/modules/workbox-background-sync
- [65] Retrying requests when back online | Workbox — https://developer.chrome.com/docs/workbox/retrying-requests-when-back-online
- [74] Traiter les requêtes de plage dans un service worker — https://web.dev/articles/sw-range-requests?hl=fr
- [76] Image file type and format guide - Media | MDN - MDN Web Docs — https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types
- [77] Image performance - web.dev — https://web.dev/learn/performance/image-performance
- [78] Image formats: AVIF - web.dev — https://web.dev/learn/images/avif
- [81] Image formats: Pixel data from encoders to decoders - MDN Web Docs — https://developer.mozilla.org/en-US/blog/image-formats-pixels-graphics/
- [89] PNG - Glossary - MDN Web Docs - Mozilla — https://developer.mozilla.org/en-US/docs/Glossary/PNG
- [91] Text to Speech — https://elevenlabs.io/text-to-speech
- [92] ElevenLabs Pricing for Creators & Businesses of All Sizes — https://elevenlabs.io/pricing
- [94] Can I publish the content I generate on the platform? - ElevenLabs — https://help.elevenlabs.io/hc/en-us/articles/13313564601361-Can-I-publish-the-content-I-generate-on-the-platform
- [96] ElevenAPI Pricing for creators and businesses of all sizes — https://elevenlabs.io/pricing/api
- [106] developers.openai.com › api › docsdevelopers.openai.com — https://developers.openai.com/api/docs/pricing.md
- [108] Service terms — https://openai.com/policies/service-terms/
- [118] OpenAI Services Agreement — https://openai.com/policies/services-agreement/
- [121] LICENSES — https://apps.acum.org.il/licenses/general/register-payment?action=info&sourceTypeCode=T65-1&lang=en
- [122] LICENSES - אקו"ם — https://apps.acum.org.il/licenses/general/register-payment?action=info&sourceTypeCode=T08&lang=en
- [124] developer.spotify.com › policySpotify Developer Policy - Spotify for Developers — https://developer.spotify.com/policy
- [131] Spotify for public or commercial use — https://support.spotify.com/us/article/spotify-public-commercial-use/
- [136] How the dotLottie Web Player Works — https://docs.lottiefiles.com/en/runtimes/distributions/js/v0.x/core-concepts
- [140] Exporting — https://docs.lottiefiles.com/en/creator/10_exporting
- [146] rive.app · docs · runtimesRuntime Sizes - Rive — https://rive.app/docs/runtimes/runtime-sizes
- [147] FAQ — https://rive.app/docs/runtimes/web/faq
- [148] image — https://nextjs.org/docs/app/api-reference/components/image
- [150] Deploying Next.js to different platforms — https://nextjs.org/docs/app/guides/deploying-to-platforms
- [154] caddyserver.com · docs · caddyfilefile_server (Caddyfile directive) — Caddy Documentation — https://caddyserver.com/docs/caddyfile/directives/file_server
- [155] Getting Started: Image Optimization | Next.js — https://nextjs.org/docs/app/getting-started/images
- [158] header (Caddyfile directive) — https://caddyserver.com/docs/caddyfile/directives/header
- [160] developer.apple.com · documentation · webkitApple Developer — https://developer.apple.com/documentation/webkit/delivering-video-content-for-safari.md
- [163] developer.mozilla.org · Web · APISpeechSynthesis: getVoices () method - Web APIs | MDN — https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/getVoices
- [175] Web audio codec guide - Media - MDN Web Docs - Mozilla — https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Audio_codecs
- [179] Embeds — https://web.dev/learn/performance/video-performance
- [182] StorageManager: persist() method - Web APIs | MDN — https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/persist
- [183] Storage for the web | Articles — https://web.dev/articles/storage-for-the-web
- [189] StorageManager: estimate () method - Web APIs | MDN — https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/estimate
- [196] developers.openai.com — https://developers.openai.com/api/reference/resources/audio/subresources/speech/methods/create.md
- [199] Text to speech | OpenAI API — https://developers.openai.com/api/docs/guides/text-to-speech
- [202] Using pronunciation dictionaries | ElevenLabs Documentation — https://elevenlabs.io/docs/eleven-api/guides/how-to/text-to-speech/pronunciation-dictionaries
- [209] What languages can the AI speak? | ElevenLabs Documentation — https://elevenlabs.io/docs/help-center/product/core-capabilities/text-to-speech/what-languages-can-the-ai-speak
- [215] Progressive Web Apps — https://samsunginternet.github.io/docs/progressive-web-apps
- [227] Voice Over Rates 2026: Industry Standard Pricing Guide — https://www.voicecrafters.com/industry-standard-voice-over-rates/
- [236] FAQs: Voice over pricing - VoiceTalks - Voice123 — https://voice123.com/blog/voice123/voice-over-pricing/
- [239] Document: visibilitychange event — https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilitychange_event

### Retrieved but not cited

- [1] Storage for the web | Articles — https://web.dev/articles/storage-for-the-web
- [2] Storage quotas and eviction criteria — https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria
- [4] Quotas and StorageManager.estimate () | OpenPWA — https://openpwa.net/reference/storage/quota-estimate/
- [5] WebKit Storage Limits: ITP and Disappearing Data - Deska — https://deska.dev/blog/webkit-storage-itp-limits
- [6] webkit.org › blog › categoryStorage – WebKit — https://webkit.org/blog/category/storage/feed/
- [8] IndexedDB Storage Limits & Eviction Rules: Chrome vs Safari ... — https://qnotepad.com/blog/indexeddb-storage-limits-safari-firefox-chrome
- [9] How Do Browser Games Save Data Without a Server? — https://egmatic.com/blog/how-do-browser-games-save-data
- [10] How real is the IndexedDB data-loss risk on iOS? #3 - GitHub — https://github.com/dbgeek/vape-off/issues/3
- [11] [Docs] [Web]: Record WebKit's seven-day storage ... - GitHub — https://github.com/kortiene/jeliya/issues/120
- [12] Service worker caching: network-first, cache-first, SWR — https://botmonster.com/web-dev/service-workers-deep-dive-caching-strategies-static-sites/
- [13] openpwa.net · reference · platformsPWAs on iOS and Safari | OpenPWA — https://openpwa.net/reference/platforms/ios-safari/
- [14] Flutter ATT Handling for WebView Cookie Consent | Ishita Shukla ... — https://www.linkedin.com/posts/ishita-shukla-b40041131_flutter-iosdevelopment-apptrackingtransparency-activity-7497601058509307905-Lvvq
- [15] Browser Storage APIs: localStorage, IndexedDB, and Beyond — Sujeet Jaiswal - Principal Software Engineer — https://sujeet.pro/articles/storage-apis-local-indexeddb
- [20] JPEG XL image format | Can I use... Support tables for HTML5 ... — https://caniuse.com/jpegxl,avif,webp
- [21] AVIF image format — https://tests.caniuse.com/?feat=avif
- [22] Codec selection - Web APIs | MDN - MDN Web Docs — https://developer.mozilla.org/en-US/docs/Web/API/WebCodecs_API/Codec_selection
- [23] AVIF finally coming to safari with IOS 16 and macOS Ventura — https://www.reddit.com/r/AV1/comments/vn9nep/avif_finally_coming_to_safari_with_ios_16_and/
- [24] www.xconvert.com › blog › convert-jpg-png-to-avifConvert JPG or PNG to AVIF: Smaller Than WebP? (2026 Guide) — https://www.xconvert.com/blog/convert-jpg-png-to-avif
- [25] iOS 16 supports AVIF video · Issue #6999 · Fyrd/caniuse — https://github.com/Fyrd/caniuse/issues/6999
- [26] HTML element: a: download | Can I use... Support tables for HTML5 ... — https://caniuse.com/mdn-html_elements_a_download
- [27] Codecs used by WebRTC - Media - MDN Web Docs - Mozilla — https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/WebRTC_codecs
- [28] Best Video Format for a Website in 2026 — https://swarmify.com/blog/best-video-format-for-website/
- [29] AVIF coming to Safari & Safari on iOS 16 by Schweinepriester · Pull Request #6348 · Fyrd/caniuse — https://github.com/Fyrd/caniuse/pull/6348
- [30] AudioEncoder API: configure - opus.application - CanIUse — https://caniuse.com/mdn-api_audioencoder_configure_opus_opus_application
- [31] Guides: Self-Hosting — https://nextjs.org/docs/pages/guides/self-hosting
- [32] How to self-host your Next.js application — https://nextjs.org/docs/15/pages/guides/self-hosting
- [34] What is the purpose of the file_server directive? | Javapedia — https://www.javapedia.net/caddy-server-interview-questions/11907/what-is-the-purpose-of-the-file-server-directive
- [36] Routing - Runtime caching - serwist — https://serwist.pages.dev/docs/serwist/runtime-caching/routing
- [37] PrecacheRoute - Routing - Runtime caching — https://serwist.pages.dev/docs/serwist/runtime-caching/routing/precache-route
- [39] nextjs.org · docs · 15Guides: Caching | Next.js — https://nextjs.org/docs/15/app/guides/caching
- [40] caddy.unisbadri.com · en · 05-web-serverFile Server | Learn Caddy — https://caddy.unisbadri.com/en/05-web-server/file-server/
- [41] Deploying - Next.js — https://nextjs.org/docs/14/app/building-your-application/deploying
- [43] Serwist/Service-worker research for expense-tracker #32 — https://gist.github.com/fer-ri/a8812c9979f0959781d9cd1f4dd07dd7
- [44] deepwiki.com · caddyserver · caddyFile Serving and Precompression | caddyserver/caddy | DeepWiki — https://deepwiki.com/caddyserver/caddy/5.2.1-file-serving-and-precompression
- [45] nextjs.org › docs › appRoute Handlers - Next.js — https://nextjs.org/docs/app/getting-started/route-handlers
- [46] Web audio codec guide - Media - MDN Web Docs - Mozilla — https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Audio_codecs
- [48] www.testmuai.com · learning-hub · mediarecorderMediaRecorder: Browser Support, Codecs, Limitations — https://www.testmuai.com/learning-hub/mediarecorder-browser-support/
- [49] ppc.land › safari-18-4-release-brings-major-webSafari 18.4 release brings major web platform enhancements — https://ppc.land/safari-18-4-release-brings-major-web-platform-enhancements/
- [50] WebKit Features in Safari 18.4 — https://webkit.org/blog/16574/webkit-features-in-safari-18-4/
- [52] Opus (audio format) - Wikipedia — https://en.wikipedia.org/wiki/Opus_(audio_format)
- [53] content/files/en-us/web/media/guides/audio_and_video_delivery/adding_captions_and_subtitles_to_html5_video/index.md at main · mdn/content — https://github.com/mdn/content/blob/main/files/en-us/web/media/guides/audio_and_video_delivery/adding_captions_and_subtitles_to_html5_video/index.md?plain=1
- [54] Accessible multimedia - Learn web development | MDN — https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/Multimedia
- [55] Recording Format Options and Settings | Ninja Docs — https://docs.vdo.ninja/guides/recording-format-options-and-settings
- [56] Recording cross browser compatible media - Article by ... — https://media-codings.com/articles/recording-cross-browser-compatible-media
- [57] Opus (audio format) - Wikipedia — https://en.wikipedia.org/?title=Opus_(audio_codec)
- [59] MDN Web Docs — https://developer.mozilla.org/en-US/docs/Web/API/WebVTT_API/index.json
- [60] Web platform features explorer - WebVTT - GitHub Pages — https://web-platform-dx.github.io/web-features-explorer/features/webvtt/
- [63] solicitudes de rango de trabajo | Modules | Chrome for Developers — https://developer.chrome.com/docs/workbox/modules/workbox-range-requests?hl=es-419
- [64] Managing video storage on the web - Google for Developers — https://developers.google.com/chromeos/app-development/learn/managing-video-storage-on-the-web
- [66] Service workers for game asset caching — https://app.cinevva.com/tutorials/service-workers-caching
- [67] Background sync fallback in Safari not working · Issue #2386 · GoogleChrome/workbox — https://github.com/GoogleChrome/workbox/issues/2386
- [68] Workbox Background Sync that survives iOS Safari and ... — https://arturbasak.dev/garden/workbox-background-sync_en
- [69] IndexedDB for PWAs: Schemas & Sync Patterns - beefed.ai — https://beefed.ai/en/indexeddb-pwa-schemas-sync-migrations
- [70] Workbox - Chrome Developers — https://chrome.jscn.org/docs/workbox/
- [71] Workbox - Background Sync - Offline Post - Replay Events when the browser is back online doesn't get triggered — https://stackoverflow.com/questions/57863098/workbox-background-sync-offline-post-replay-events-when-the-browser-is-bac
- [72] Background Sync: Browser Support, Features, Limitations - TestMu AI — https://www.testmuai.com/learning-hub/background-sync-browser-support/
- [73] PWA Advanced Implementation Guide - Service Worker Cache ... — https://hidekazu-konishi.com/entry/pwa_advanced_implementation_guide.html
- [75] PWA Series: Service Workers, the basics about offline — https://samsunginternet.github.io/pwa-series-service-workers-the-basics-about-offline/
- [79] Multimedia: Images - Learn web development | MDN - MDN Web Docs — https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Performance/Multimedia
- [80] MIME タイプ（IANA メディア種別） - HTTP - MDN Web Docs — https://developer.mozilla.org/ja/docs/Web/HTTP/Guides/MIME_types
- [82] Image formats compared: JPG, PNG, WebP, AVIF - LivreImage — https://livreimage.com/en/guides/image-formats/
- [83] dotLottie Players — https://docs.lottiefiles.com/en/runtimes
- [84] Supported image formats shows no bad choices #45286 - GitHub — https://github.com/mdn/content/issues/45286
- [85] Modern Image Formats: WebP vs. AVIF Guide - DreamHost — https://www.dreamhost.com/blog/modern-image-formats/
- [86] WebP vs AVIF: Which Next-Gen Image Format Wins in 2026? — https://dev.to/pixotter/webp-vs-avif-which-next-gen-image-format-wins-in-2026-3m1d
- [87] patrickstox.com › on-page › image-seoImage Formats for SEO: JPEG vs. PNG vs. WebP vs. AVIF — https://patrickstox.com/technical-seo/on-page/image-seo/image-formats/
- [88] Best Practices and Troubleshooting for dotLottie Player — https://docs.lottiefiles.com/en/runtimes/best-practices/troubleshooting
- [90] Web Images Learning Resources - Frontend Masters — https://master.dev/guides/learning-roadmap/web-images/
- [93] ElevenAgents Pricing for creators and businesses of all sizes — https://elevenlabs.io/pricing/agents
- [95] Voice AI SDK for Devs | Low Latency TTS API | TTS API with Low Latency — https://start.elevenlabs.io/cp/for-developers
- [97] Voice Cloning: Clone Your Voice In Minutes - start.elevenlabs.io — https://start.elevenlabs.io/voice-cloning/v2
- [98] AI Music Generator | Free Song Maker & Music Creator — https://elevenlabs.io/music
- [99] Studio 4.0 - AI audio and video editor for creators — https://elevenlabs.io/studio?ref=a1.gallery
- [100] The Top Narakeet Alternatives in 2026 — https://elevenlabs.io/blog/narakeet-alternatives
- [101] Best AI voices for YouTube videos or faceless content — https://elevenlabs.io/blog/the-5-best-ai-voices-for-youtube-automation-and-faceless-videos
- [102] Eleven Music Model-Specific Terms — https://elevenlabs.io/eleven-music-model-specific-terms
- [103] Legal and Safety - ElevenLabs — https://help.elevenlabs.io/hc/en-us/sections/14163402172433-Legal-and-Safety
- [104] What happens to my content after my subscription ends? — https://help.elevenlabs.io/hc/en-us/articles/15993008593297-What-happens-to-my-content-after-my-subscription-ends
- [105] What languages are supported with Professional Voice ... — https://elevenlabs.io/docs/help-center/product/voices/voice-cloning/what-languages-are-supported-with-professional-voice-cloning-pvc
- [107] GPT-4o Mini TTS Model | OpenAI API — https://developers.openai.com/api/docs/models/gpt-4o-mini-tts
- [109] help.openai.com › en › articlesWhat is ChatGPT? - OpenAI Help Center — https://help.openai.com/en/articles/6783457-what-is-chatgpt
- [110] Changelog | OpenAI API — https://developers.openai.com/api/docs/changelog
- [111] developers.openai.com › api › docsGPT-4o Mini Model | OpenAI API — https://developers.openai.com/api/docs/models/gpt-4o-mini
- [112] TTS-1 Model | OpenAI API — https://developers.openai.com/api/docs/models/tts-1
- [113] Models | OpenAI API — https://developers.openai.com/api/docs/models
- [114] ChatGPT-4o Model — https://developers.openai.com/api/docs/models/chatgpt-4o-latest
- [115] developers.openai.com › gpt-4o-mini-transcribeGPT-4o Mini Transcribe Model | OpenAI API — https://developers.openai.com/api/docs/models/gpt-4o-mini-transcribe
- [116] GPT-4.1 Mini Model | OpenAI API — https://developers.openai.com/api/docs/models/gpt-4.1-mini
- [117] GPT-4 Model | OpenAI API — https://developers.openai.com/api/docs/models/gpt-4
- [119] Enterprise privacy at OpenAI — https://openai.com/enterprise-privacy/
- [120] Terms of Use — https://openai.com/terms/
- [123] Spotify Developer Terms - Spotify for Developers — https://developer.spotify.com/terms
- [125] LICENSES — https://apps.acum.org.il/licenses/general/register-payment?action=info&sourceTypeCode=T016-1B&lang=en
- [126] developer.spotify.com · compliance-tipsCompliance Tips - Spotify for Developers — https://developer.spotify.com/compliance-tips
- [127] Widget Terms of Use - Spotify for Developers — https://developer.spotify.com/documentation/embeds/terms
- [128] אינטרנט - שירות עם היקף פעילות והכנסות נמוך - רישיונות ותשלומים — https://apps.acum.org.il/licenses/internet/register-payment?action=info&sourceTypeCode=T65
- [129] 1-/legal/spotify-for-creators-terms/ - Spotify — https://www.spotify.com/us/legal/spotify-for-creators-terms/
- [130] Design & Branding Guidelines - Spotify for Developers — https://developer.spotify.com/documentation/design?is_listing=false
- [132] רישיון עבור השמעת מוסיקה באירוע עסקי כמוסיקת רקע בלבד כגון — https://apps.acum.org.il/licenses/general/register-payment?action=info&sourceTypeCode=T016-2
- [133] Conversion Program Terms. - Spotify — https://www.spotify.com/us/brands/legal/advertiser-conversion-program-terms/
- [134] רישיון להשמעת מוסיקה ושימוש בטקסטים בדרך של Streaming on ... — https://apps.acum.org.il/licenses/internet/register-payment?action=calculate&sourceTypeCode=T65
- [135] מעכשיו, תוכלו גם אתם לשמור על זכויות היוצרים בדרך נוחה ומהירה. — https://apps.acum.org.il/licenses/
- [137] docs.lottiefiles.com › v0 › advanceddotLottie Web Player Performance Optimization — https://docs.lottiefiles.com/en/runtimes/distributions/js/v0.x/advanced/performance
- [138] Terminology - LottieFiles Developer Portal — Lottie Animation Docs — https://docs.lottiefiles.com/en/creator/01_introduction/terminology
- [139] Export Formats — https://docs.lottiefiles.com/en/creator/10_exporting/formats
- [141] docs.lottiefiles.com › en › formatLottie JSON — https://docs.lottiefiles.com/en/format/lottie-json
- [142] File Format - LottieFiles Developer Portal — Lottie Animation Docs — https://docs.lottiefiles.com/en/format
- [143] Choosing an output format — https://docs.lottiefiles.com/en/integrations/vscode/05_integrate/choosing-an-output-format
- [144] .lottie Format — https://docs.lottiefiles.com/en/format/dotlottie
- [145] Importing Files - LottieFiles Developer Portal — Lottie Animation Docs — https://docs.lottiefiles.com/en/creator/09_assets-and-importing/importing
- [149] Guides: Self-Hosting | Next.js — https://nextjs.org/docs/app/guides/self-hosting
- [151] Next.js — https://nextjs.org/docs/app/guides/production-checklist.md
- [152] App Router: Glossary — https://nextjs.org/docs/app/glossary
- [153] Guides: Static Exports — https://nextjs.org/docs/app/guides/static-exports
- [156] images - next.config.js — https://nextjs.org/docs/app/api-reference/config/next-config-js/images
- [157] Parallel Routes default.js... — https://nextjs.org/docs/app/guides/upgrading/version-16
- [159] nextjs.org › docs › appGetting Started: Metadata and OG images | Next.js — https://nextjs.org/docs/app/getting-started/metadata-and-og-images
- [161] docs.developer.apple.com — https://developer.apple.com/tutorials/data/documentation/webkit/delivering-video-content-for-safari.md
- [162] SpeechSynthesisVoice - Web APIs - MDN Web Docs — https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisVoice
- [164] New <video> Policies for iOS — https://webkit.org/blog/6784/new-video-policies-for-ios/
- [165] iOS and Safari: The Native Player You Can't Escape - Fora Soft — https://www.forasoft.com/learn/video-streaming/articles-streaming/ios-safari-native-player
- [166] SpeechSynthesis - Web APIs | MDN — https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis
- [167] Video background performance, autoplay and Core Web Vitals — https://wppoland.com/en/performance-video-backgrounds-autoplay-guide-en/
- [168] SpeechSynthesisUtterance: voice property - Web APIs | MDN — https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance/voice
- [169] Using the Web Speech API - Web APIs | MDN — https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API.
- [170] translated-content/files/zh-cn/web/api/speechsynthesis ... - GitHub — https://github.com/mdn/translated-content/blob/main/files/zh-cn/web/api/speechsynthesis/getvoices/index.md?plain=1
- [171] Window: speechSynthesis property - Web APIs | MDN — https://developer.mozilla.org/en-US/docs/Web/API/Window/speechSynthesis
- [172] Autoplay muted videos stop playback of any streaming app ... — https://bugs.webkit.org/show_bug.cgi?id=163993
- [173] Video and Audio Autoplay Policies Across Browsers — https://www.testmuai.com/blog/video-audio-autoplay-policies-across-browsers/
- [174] www.testmuai.com · learning-hub · speech-synthesisSpeech Synthesis API: Browser Support, Voices, Limitations — https://www.testmuai.com/learning-hub/speech-synthesis-api-browser-support/
- [176] Going beyond images with basic video for the web | Articles — https://web.dev/articles/video-basics
- [177] Lazy loading video | Articles — https://web.dev/articles/lazy-loading-video
- [178] The <video> and <source> tags | Articles — https://web.dev/articles/video-and-source-tags
- [180] Fast playback with audio and video preload | Articles - web.dev — https://web.dev/articles/fast-playback-with-preload
- [181] developer.mozilla.org › docs › WebStorageManager - Web APIs | MDN - MDN Web Docs — https://developer.mozilla.org/en-US/docs/Web/API/StorageManager
- [184] Offline data - web.dev — https://web.dev/learn/pwa/offline-data
- [185] WorkerNavigator: storage property - Web APIs - MDN Web Docs — https://developer.mozilla.org/en-US/docs/Web/API/WorkerNavigator/storage
- [186] Navigator: storage property — https://developer.mozilla.org/en-US/docs/Web/API/Navigator/storage
- [187] Persistent storage | Articles - web.dev — https://web.dev/articles/persistent-storage
- [188] Cache — https://developer.mozilla.org/en-US/docs/Web/API/Cache
- [190] Storage quotas and eviction criteria — https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria
- [191] Navigator — https://developer.mozilla.org/en-US/docs/Web/API/Navigator
- [192] WorkerNavigator - Web APIs | MDN — https://developer.mozilla.org/en-US/docs/Web/API/WorkerNavigator
- [193] Interfaces — https://developer.mozilla.org/en-US/docs/Web/API/Storage_API
- [194] A beginner's guide to making Progressive Web Apps - GitHub Pages — https://samsunginternet.github.io/A-beginner-s-guide-to-making-Progressive-Web-Apps/
- [195] PWA Series: Service Workers, the basics about offline — https://samsunginternet.github.io/pwa-series-service-workers-the-basics-about-offline/
- [197] Create speech | OpenAI API Reference — https://developers.openai.com/api/reference/typescript/resources/audio/subresources/speech/methods/create
- [198] Create speech | OpenAI API Reference — https://developers.openai.com/api/reference/resources/audio/subresources/speech/methods/create
- [200] developers.openai.com — https://developers.openai.com/api/docs/guides/text-to-speech.md
- [201] Transmitir voz | ElevenLabs Documentation — https://elevenlabs.io/docs/es/api-reference/text-to-speech/stream
- [203] Text to Speech | ElevenLabs Documentation — https://elevenlabs.io/docs/overview/capabilities/text-to-speech
- [204] Get pronunciation dictionary by version — https://elevenlabs.io/docs/api-reference/pronunciation-dictionaries/download
- [205] Pronunciation dictionaries | ElevenLabs Documentation — https://elevenlabs.io/docs/eleven-agents/customization/voice/pronunciation-dictionary
- [206] developers.openai.com · api · docsAudio and voice | OpenAI API — https://developers.openai.com/api/docs/guides/audio
- [207] audio.md — https://developers.openai.com/api/docs/guides/audio.md
- [208] Create dialogue with timestamps — https://elevenlabs.io/docs/api-reference/text-to-dialogue/convert-with-timestamps
- [210] Prompting GPT-Live | OpenAI API — https://developers.openai.com/api/docs/guides/live-prompting
- [211] Storage quotas and eviction criteria — https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria
- [212] PWA Series: Service Workers, the basics about offline — https://samsunginternet.github.io/pwa-series-service-workers-the-basics-about-offline/
- [213] StorageArea.set() - Mozilla - MDN Web Docs — https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage/StorageArea/set
- [214] storage.session - Mozilla - MDN Web Docs — https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage/session
- [216] Progressive Web Apps: Making app-like experiences in the browser — https://samsunginternet.github.io/progressive-web-apps-making-app-like-experiences-in-the-browser/
- [217] A beginner's guide to making Progressive Web Apps - GitHub Pages — https://samsunginternet.github.io/A-beginner-s-guide-to-making-Progressive-Web-Apps/
- [218] Developer Hub — https://samsunginternet.github.io/
- [219] A beginner’s guide to Service Workers — https://samsunginternet.github.io/A-beginner-s-guide-to-Service-Workers/
- [220] Optimising A-Frame Assets for Faster Starts — https://samsunginternet.github.io/Beyond-the-Browser/
- [221] Using the Web Storage API - Web APIs - MDN Web Docs — https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
- [222] storage.local - Mozilla - MDN Web Docs — https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage/local
- [223] developer.samsung.com · automation · progressive-webProgressive Web App - Samsung Developer — https://developer.samsung.com/automation/progressive-web-app.html
- [224] StorageManager: estimate () method - Web APIs | MDN — https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/estimate
- [225] developer.mozilla.org › docs › WebStorageManager - Web APIs | MDN - MDN Web Docs — https://developer.mozilla.org/en-US/docs/Web/API/StorageManager
- [226] What Type of Voice Acting Pays the Most? 2026 Rates — https://kveeky.com/blog/voice-acting-pay-careers
- [228] Voice Over Rates: What to Charge in 2026 | Take One — https://www.onetakevo.com/blog-vo-rates-2026.html
- [229] Faceless Channel Cost: What Each AI Video Costs to Make — https://aitachyon.com/blog/faceless-channel-cost
- [230] simplyshannonscott.com · voiceover-rates-2026Voiceover Rates 2026: 7 Truths Smart Clients Never Ignore — https://simplyshannonscott.com/voiceover-rates-2026/
- [231] Voice Cloning vs. Traditional Voice Acting: A Cost and Time Analysis — https://www.kukarella.com/resources/ai-voice-cloning/voice-cloning-vs-traditional-voice-acting-a-cost-and-time-analysis
- [232] Voiceover Rates, Pricing & Licensing - Voice Crafters — https://www.voicecrafters.com/faqs-tips-client/voiceover-rates-pricing-and-licensing/
- [233] www.votrainer.com › blog › how-much-do-voice-actorsHow Much Do Voice Actors Make? Income Guide for 2026 — https://www.votrainer.com/blog/how-much-do-voice-actors-make-income-guide-for-2026
- [234] What Does it Cost to Hire a Professional Voice Over Artist? - Zelios — https://zelios.agency/voice-over-rates/
- [235] Voiceover Rates 2026: Rate Guide Data for Buyers | RealVOTalent — https://www.realvotalent.com/voiceover-rates
- [237] Page Visibility API — https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
- [238] Using the Page Visibility API - MDN Web Docs — https://developer.mozilla.org/en-US/blog/using-the-page-visibility-api/
- [240] Delivering Video Content for Safari — https://developer.apple.com/documentation/webkit/delivering-video-content-for-safari
- [241] Safari HTML5 Audio and Video Guide - Apple Developer — https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/Using_HTML5_Audio_Video/Introduction/Introduction.html
- [242] Restrictions | Apple Developer Documentation — https://developer.apple.com/documentation/devicemanagement/restrictions
- [243] Safari | Apple Developer Forums — https://developer.apple.com/forums/tags/safari?page=9
- [244] Playing audio | Apple Developer Documentation — https://developer.apple.com/design/human-interface-guidelines/playing-audio
- [245] Safari Should Allow Background WebRTC for Real-Time Audio Apps — https://developer.apple.com/forums/thread/774239
- [246] Web APIs — https://developer.mozilla.org/en-US/docs/Web/API
- [247] Safari and Web | Apple Developer Forums — https://developer.apple.com/forums/topics/safari-and-web?page=2&sortBy=oldest&sortOrder=DESC
- [248] 264473 – No sound from HTMLAudioElement when navigator. ... — https://bugs.webkit.org/show_bug.cgi?id=264473
- [249] Safari and Web — https://developer.apple.com/forums/tags/safari-and-web?page=2
- [250] docs.developer.apple.com — https://developer.apple.com/tutorials/data/documentation/webkit/delivering-video-content-for-safari.md
- [251] Audio Q&A — https://developer.apple.com/go/?id=wwdc26-audio-q-and-a-wednesday&ext=true

### Pages read in full

- developer.mozilla.org › Guides › FormatsMedia container formats (file types) - MDN Web Docs — https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Containers
- Web video codec guide - Media - MDN Web Docs - Mozilla — https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Video_codecs
- Updates to Storage Policy - WebKit — https://webkit.org/blog/14403/updates-to-storage-policy/
- developers.openai.com — https://developers.openai.com/api/docs/pricing.md
- Step 2: Update tsconfig.json — https://serwist.pages.dev/docs/next/getting-started
- LICENSES — https://apps.acum.org.il/licenses/general/register-payment?action=info&sourceTypeCode=T65-1&lang=en
- ElevenLabs Pricing for Creators & Businesses of All Sizes — https://elevenlabs.io/pricing
- Web audio codec guide - Media - MDN Web Docs - Mozilla — https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Audio_codecs

<details><summary>Prompt as sent</summary>

# PROJECT CONTEXT (read before the research question)

DORI is a small, Jerusalem-based educational tour operator building **"The Memory Protocol"**: a guided, team-based, mobile-first web game played on foot through the National Library of Israel, the Nahlaot neighbourhood and the Mahane Yehuda market.

**The story (fiction, always labelled as such in the app):** scientists observe a parallel Earth scarred by centuries of war. Peace-seeking aliens, the **Israelianes**, activate **HARMONY**, a quantum system aboard their spacecraft, which rewrites people's memory and the historical record to erase war, conflict and injustice. When new disagreements arise, a society with no truthful past cannot handle them, and violence gets worse. Players are **Memory Keepers**: they rebuild authentic history from real evidence in our world, starting at the National Library. At each site they help HARMONY learn that peace comes from understanding differences and learning from history, not from erasing them.

**The pilot (late October 2026):** one family of six (grandparents, parents and two English-speaking teenagers), playing as **three competing pairs**, so about three phones, with a human guide. The platform should be reusable for future groups and games.

**How play works:**
1. **Library**: while preordered books come up from the robotic storage (30–60 min), pairs do short art and architecture "investigator certification" tasks. They then find a specific catalog item, copy its identifier, pull out a verifiable fact from the text, note its provenance, and save it to a shared evidence dossier. Reading halls require silence.
2. **Nahlaot and the market**: a clue leads to a real heritage site, where a pair uses its Library evidence to reconstruct the story. Only there is a fictional present-day dilemma revealed. It is linked to the human dilemma behind the history, for example a shared historical water cistern leading to a residents' dispute over the costs of a Shabbat elevator.
3. Each stop has three layers: an easy observation or history task (10 points), crisis reasoning **scored by the guide with a rubric** (up to 20 points), and an optional objective puzzle (10–30 points). Hints cost points. Speed never counts on ethical questions.
4. It ends with a family oral-history moment: each teenager asks a parent or grandparent which family memory should be carried forward. This is opt-in, and nothing is published automatically.

**Rules the app must keep:** historical fact, interpretation and fiction are labelled separately. Unverified guide anecdotes stay labelled as attributed stories. The app shows one idea, question and action at a time. Camera or location is never the only way to complete a task; the guide's confirmation or a typed answer must always work too. People are never photographed or recorded without consent. The UI is English first, with Hebrew support.

**Technology:** a React / Next.js web app, installable as a PWA, **self-hosted on one small VPS** (2 vCPU, 4 GB RAM) with Docker behind a Caddy reverse proxy. Mobile signal in old-city alleys can be weak, and some Library content only works on the Library's own network. The visual identity is restrained, warm, editorial and illustrated, never a neon sci-fi look.

Write a report that stands on its own: do not ask clarifying questions; state your assumptions and proceed.

# ROLE / DECISION

Act as a web-performance and media engineer. Your research decides **the media formats, file-size budgets, offline-caching strategy and narration approach** for the pilot.

# RESEARCH QUESTION 1: FORMATS

As of October 2026, compare SVG, WebP, AVIF, PNG, JPEG, Lottie JSON / dotLottie, Rive (.riv), MP4 (H.264/HEVC), WebM (VP9/AV1), MP3, AAC and Opus on browser support (especially iOS Safari, including the iOS version AVIF and Opus became reliable), compression, transparency and decode cost on mid-range phones.

Recommend a format and a size target for each of:
- the illustrated map of the route (Library → Nahlaot → Mahane Yehuda; large, zoomable, possibly tiled)
- transparent historical overlays on that map
- destination photographs and dated archival photographs
- animated puzzle objects
- short video clues (10–30 s)
- HARMONY "transmissions" (audio + subtitle, 15–45 s), which must also work silently as text
- ambient sound

State your assumptions: three phones (one per pair), 4G with weak spots, a game of about 4–5 hours including meals, and a Library section on guest Wi-Fi.

# RESEARCH QUESTION 2: OFFLINE AND DELIVERY

- Service-worker precaching vs runtime caching for about 50–150 MB of game media. What do iOS Safari and installed iOS PWAs allow (quota, eviction, the 7-day script-writable storage cap), and what do Android Chrome and Samsung Internet allow?
- Serwist / Workbox (or the current recommended equivalent) with the current Next.js App Router.
- Next.js image optimisation (`next/image`) when self-hosted on a 2 vCPU / 4 GB VPS: CPU and memory cost, whether to pre-generate variants at build time instead, and Caddy settings for caching headers and range requests (audio/video).
- A sync model for game state shared by three phones and a guide dashboard (scores, evidence dossier, unlocks) that keeps working through dropouts, using only a local queue and later sync. Name the simplest proven pattern; avoid heavy real-time infrastructure on a 4 GB VPS.

# RESEARCH QUESTION 3: AUDIO AND NARRATION

Compare human-recorded narration, browser text-to-speech (Web Speech `speechSynthesis`) and prerecorded AI voice (e.g. OpenAI TTS, ElevenLabs) on quality, English and Hebrew pronunciation (including Hebrew and Ladino place names), cost per finished minute (dated), licensing and commercial-use terms, and consistency of a recurring character voice for HARMONY.

Also cover: mobile autoplay and background-audio limits, mute/volume UX, subtitles and transcripts (WebVTT), and designing for silent use inside library reading halls, where sound must not play aloud. Cover copyright limits on playing a commercial song inside a paid tour app (for example a well-known Israeli song about a place on the route), versus linking to an official stream.

# OUTPUT

1. **Format table**: asset type → format → fallback → target file size → reason (cited).
2. **Offline and sync strategy**: what to precache, what to load per mission, the storage-budget math, what happens when storage is evicted, and the state-sync pattern.
3. **Narration recommendation for the pilot**, and what to revisit later.
4. The strongest evidence against your recommendations.

**Source priorities:** MDN, caniuse.com, WebKit blog (storage policy posts), web.dev, Chrome developer docs, Next.js official docs, Serwist/Workbox docs, vendor pricing and terms pages (dated), and ACUM (the Israeli music-rights society) for music licensing.

# EVIDENCE RULES

- **Timeframe:** prefer sources from 2024 to October 2026. Older sources may establish history; never present an old browser, license or price fact as current. Give the date of every capability, limit, license or price you report.
- Label every substantive claim **OBSERVED** (a cited source says it), **INFERRED** (your reasoning from cited sources) or **UNKNOWN** (no reliable source found).
- Where sources disagree, say so and show both sides. Include the strongest evidence against your own recommendation.
- Do not answer from memory where a current source exists. If you could not verify something, say so plainly instead of filling the gap.

# OUTPUT ENDING

Finish with:
1. **What remains unknown**: and the test or source that would settle each item.
2. **Source register**: publisher · date · URL · what it was used for · primary/official or secondary.

</details>
