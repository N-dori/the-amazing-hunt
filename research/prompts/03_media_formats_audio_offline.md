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
