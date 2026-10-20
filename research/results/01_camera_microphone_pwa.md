# 01_camera_microphone_pwa.md

- **Asked:** 2026-10-16T00:36:58.045Z
- **Preset:** `high` (Perplexity Agent API) · run `resp_acc4c906-2d5b-48ba-9000-5c86a73d9607` · completed
- **Cost:** 0.71494

> True as of the date above. Re-run the prompt rather than quoting this file as current.

## Answer

# Camera and microphone decision for *The Memory Protocol* — 16 October 2026

**Recommendation: use the phone’s native camera picker for optional photos, and short, foreground-only `MediaRecorder` sessions for optional audio. Save a typed account or guide confirmation as an equally valid completion path at every stop.** Do not make live camera preview, speech recognition, uninterrupted background recording, or automatic background upload a pilot dependency. **INFERRED:** This is the simplest arrangement that retains useful evidence without making a family’s progress depend on fragile capture or connectivity behavior.[web:32][web:74][web:78][web:252][web:48]

**Assumptions.** The pilot uses reasonably updated phones and a public HTTPS origin, not an in-app browser. “Installed iPhone PWA” means a Home Screen web app, rather than a Home Screen bookmark that opens in Safari; iOS 26 lets the person adding it choose between those behaviors. The three pairs can choose text without explaining why.[web:33] **UNKNOWN:** The actual phones, OS builds, Samsung Internet builds, and Library permissions for particular items have not been tested.

## 1. Capability matrix

**Key:** **Yes** means the basic feature is available, not that every capture succeeds; **Partial** means it needs feature detection, foreground use, or a fallback; **No** means do not plan on that API. Assessments apply **as of 16 October 2026**. Each cell gives the practical qualification.

| Question | iPhone Safari | Installed iPhone PWA | Android Chrome | Installed Android PWA | Samsung Internet |
|---|---|---|---|---|---|
| **1. Button opens native camera: `<input type="file" accept="image/*" capture>`** | **Yes — OBSERVED:** native capture is available; `capture` requests a camera, not an irrevocable choice or particular lens.[web:32][web:136] | **Yes — INFERRED:** the Home Screen web app uses the same web capture control; test the actual installation mode.[web:32][web:33] | **Yes — OBSERVED:** native capture works; the picker may also offer existing images.[web:32] | **Yes — INFERRED:** installation does not require a different capture API; test the device’s picker.[web:32] | **Yes — OBSERVED:** HTML Media Capture is listed as supported; picker choices remain device-dependent.[web:57][web:136] |
| **2. Live `getUserMedia()` preview; still from canvas or `ImageCapture`** | **Partial — OBSERVED:** live preview and canvas capture work, but require permission and a working stream. WebKit says `ImageCapture` arrived in Safari 18.4; a broad Can I Use table disagrees with its method-specific table—feature-test it.[web:32][web:35][web:195][web:197] | **Partial — OBSERVED:** live capture exists, but PWA-only black-preview and repeat-prompt reports make canvas/`ImageCapture` unsuitable as the sole photo route.[web:77][web:76][web:78] | **Yes — OBSERVED:** `getUserMedia()` and `ImageCapture` are supported; canvas is the simpler preview-still fallback.[web:32][web:197] | **Yes — INFERRED:** the installed app retains the web APIs, subject to permission and interruption; feature-test the actual installation.[web:32][web:197] | **Yes — OBSERVED:** Samsung documents a `getUserMedia()` camera app, and compatibility data lists `ImageCapture`; still feature-test methods.[web:59][web:197] |
| **3. `MediaRecorder` audio and replay before submit** | **Partial — OBSERVED:** record and replay a completed Blob. Probe `audio/webm;codecs=opus` (Safari 18.4+), then `audio/mp4` (historically AAC); Safari 26 also documents `audio/mp4; codecs=alac`. Check actual output and playback.[web:35][web:40][web:160][web:143] | **Partial — INFERRED:** same format probes, but microphone re-prompts and capture failures merit an immediate text path.[web:35][web:78][web:86] | **Yes — OBSERVED:** `MediaRecorder` supports audio WebM; probe `audio/webm;codecs=opus`, then browser default, and replay the assembled Blob.[web:7][web:158][web:154] | **Yes — INFERRED:** use the Chrome format probe and replay test; installation does not guarantee uninterrupted recording.[web:7][web:74] | **Partial — OBSERVED/UNKNOWN:** `MediaRecorder` is supported; probe WebM/Opus then default. An exact current codec set for each Samsung build was not verified.[web:49][web:158] |
| **4. Temporary offline storage; eventual upload** | **Partial — OBSERVED:** IndexedDB, Cache API and OPFS are available, but storage is best-effort; no Background Sync. Safari tabs face the seven-*days-of-Safari-use* inactivity rule.[web:21][web:16][web:90][web:220] | **Partial — OBSERVED:** separate storage from Safari, approximately the browser-app quota, and an explicit first-party exemption from that seven-day ITP removal; pressure or user deletion still matters. No Background Sync.[web:21][web:22][web:91][web:220] | **Partial — OBSERVED:** origin storage is best-effort unless persistence is granted; one-off Background Sync exists but is not a delivery guarantee.[web:16][web:46] | **Partial — INFERRED:** same Chrome storage and optional Sync; keep an in-app retry button regardless.[web:16][web:48] | **Partial — OBSERVED:** browser storage and one-off Background Sync are listed, but eviction and sync timing are not an upload SLA.[web:16][web:220][web:48] |
| **5. Permission timing, persistence, denial** | **Partial — OBSERVED:** `getUserMedia()` prompts when requested; Safari has per-site persistent settings, but permission must not be assumed. Denial or policy blocking can produce `NotAllowedError`.[web:60][web:78] | **Partial — OBSERVED:** Safari’s prior grant need not carry into the installed app; reports through 2026 describe prompts after reopening. Treat each request as fresh.[web:78] | **Yes — OBSERVED:** Android Chrome offers “Allow this time,” “Allow while visiting the site,” and “Never allow”; a block can be changed in Site settings.[web:180][web:182] | **Partial — INFERRED:** plan for those Chrome choices, but verify whether a particular installed app preserves its site grant across launches.[web:180] | **Partial — OBSERVED/UNKNOWN:** the phone can also deny Samsung Internet camera/mic permission at OS level; exact per-site persistence across Samsung builds was not verified.[web:181][web:60] |
| **6. Lock screen, background, incoming call during capture** | **Partial — OBSERVED/INFERRED:** page visibility and recorder chunk timing can change; do **not** promise that a recording survives a lock or call intact.[web:74][web:240] | **Partial — OBSERVED:** backgrounding or reopening has produced ended or apparently live-but-black camera tracks; recovery needs checking, not blind continuation.[web:76] | **Partial — OBSERVED:** locking Android can delay `dataavailable`; chunk count is not elapsed time. Call-specific continuity is **UNKNOWN**.[web:74] | **Partial — INFERRED:** treat lock, app switch and call as an interruption requiring review or retake, not dependable background capture.[web:74][web:241] | **Partial — INFERRED/UNKNOWN:** use the same interruption rule; call- and lock-specific Samsung recording results need device testing.[web:74][web:181] |
| **7. Web Speech recognition versus transcription** | **Partial — OBSERVED:** recognition is listed as partial, not an offline or accurate bilingual evidence source; offer typing. Server transcription works only after upload and consent.[web:58][web:105][web:222] | **Partial — INFERRED:** installation does not establish speech-language availability or reliable offline recognition; typing remains primary.[web:105][web:107] | **Partial — OBSERVED:** recognition exists with partial support; some Chrome recognition sends audio to a service and fails offline.[web:58][web:105] | **Partial — INFERRED:** the same recognition/network limitations apply; do not gate a task on it.[web:105] | **Partial — OBSERVED:** recognition is listed as partial; Hebrew/English performance on the pilot’s devices is **UNKNOWN**.[web:58] |
| **8. HTTPS, policy and network prerequisites** | **Partial — OBSERVED:** `getUserMedia()` needs a secure context; a camera/mic `Permissions-Policy` block yields `NotAllowedError`. Library-network-only resources are a separate access issue.[web:60][web:67][web:232] | **Partial — INFERRED:** preinstall/cache over valid HTTPS; an installed shell cannot make a Library-restricted source available off-network.[web:99][web:232] | **Partial — OBSERVED:** secure context and policy rules apply; a cached shell does not prove that an upload endpoint is reachable.[web:60][web:99] | **Partial — INFERRED:** valid HTTPS and working endpoint access remain necessary after installation; retry uploads in the open app.[web:60][web:48] | **Partial — INFERRED:** apply the same HTTPS/policy checks; test guest-Wi-Fi login and uploads on the actual browser.[web:60][web:99] |

**Storage numbers, not promises — OBSERVED:** MDN’s January 2026 account gives Chromium origins *up to approximately 60% of total disk*; since iOS 17, Safari browser origins and standalone Home Screen web apps also have an approximately **60%** per-origin ceiling and **80%** browser-wide ceiling. Available free space and eviction can reduce practical capacity; quota exhaustion throws `QuotaExceededError`. These are ceilings, not amounts DORI should reserve or advertise.[web:16][web:22] **OBSERVED:** WebKit explicitly exempts a Home Screen app’s first-party domain from ITP’s seven-day storage removal, while keeping its data isolated from Safari; this does **not** exempt it from storage pressure, user clearing, or uninstalling.[web:91][web:22]

**ImageCapture disagreement — OBSERVED:** WebKit’s March 2025 Safari 18.4 announcement and Apple’s release notes say support was added, and Can I Use marks `takePhoto()` supported from 18.4; Can I Use’s broad `imagecapture` feature table still marks Safari unsupported. **INFERRED:** use method-by-method runtime tests and canvas as the live-preview fallback; neither should displace the native camera picker for this pilot.[web:35][web:198][web:195][web:197]

## 2. Recommended MVP implementation

**Photo, in fallback order — INFERRED:**

1. At an *allowed* stop, show **Take photo** backed by a user-tapped, labelled `<input type="file" accept="image/*" capture="environment">`. Provide **Choose existing photo** using a second input without `capture`. Inspect the returned `File`; orient/downscale a *working copy*, remove unnecessary metadata, and show it for review. Native capture is preferable here because it avoids maintaining a live stream or a `getUserMedia()` permission path.[web:32][web:136][web:60]
2. Offer **Describe what you found** and **Ask guide to confirm** alongside—not hidden behind—a camera failure. For a plaque, accept its wording and location; for architecture, a description; for a market comparison, observed similarities and differences. For a catalog screen/title page, accept the **catalog identifier, one checkable fact and its provenance**, with the guide verifying the item. **INFERRED:** a photo is supporting evidence, not proof by itself that the fact was understood.
3. Build live preview only if a later game demonstrably needs it: on tap, `getUserMedia({video:{facingMode:"environment"},audio:false})`; `<video autoplay muted playsInline>`; wait for a real frame; use canvas `drawImage`/`toBlob`, optionally `ImageCapture.takePhoto()` if tested; stop **all** tracks immediately on exit. Time out a black preview and return to native capture or text.[web:32][web:35][web:76]

**Audio, in fallback order — INFERRED:** offer **Record a short answer**, **Type it**, and **Tell the guide**. Request `{audio:true,video:false}` only after Record is tapped. Probe `MediaRecorder.isTypeSupported("audio/webm;codecs=opus")`, then `"audio/mp4"` and the browser default; verify constructor, nonempty output, the recorder’s actual `mimeType`, and local playback rather than trusting a support test alone. Stop, assemble chunks into **one** Blob, set an `<audio controls>` Blob URL, and present **Replay · Retake · Submit**. Persist only the submitted recording; do not transcribe automatically.[web:35][web:160][web:158][web:143][web:144] **OBSERVED:** Safari 26 also offers ALAC/PCM recording, but these are not reasons to require a particular codec from participants.[web:40]

```text
photo button -> native file input -> validate/review -> queue-or-submit
                                  ↘ describe / guide confirms

record button -> consent check -> getUserMedia(audio) -> MIME probe
              -> MediaRecorder -> stop -> assemble Blob -> replay
              -> retake | submit to outbox | type / guide confirms

outbox item: {idempotencyKey, pair, stop, kind, consent, MIME, bytes, status}
submit -> POST to DORI over HTTPS -> await durable server acknowledgement
       -> mark sent, then delete local media copy
failure -> retain locally; Retry now on reopen/online/checkpoint
```

**Offline/upload — INFERRED:** pre-cache the game shell and *DORI-owned, permitted* task assets with a service worker. Keep the small outbox and media Blobs in **IndexedDB**; Cache API is for shell/assets, not the authoritative upload queue. OPFS is an optional future choice for larger files, not a pilot dependency. Set modest per-capture limits; catch quota errors and immediately offer text. Retry on app open, `online`, a visible **Retry now** button and guide checkpoints; verify a server acknowledgement before deleting the local copy. One-off Background Sync may *add* retries on Chrome and Samsung Internet, but Safari lacks it, and even supported sync is scheduled by the browser.[web:21][web:16][web:99][web:48][web:220] **INFERRED:** `navigator.onLine` or a captive-portal login screen must not count as successful delivery; an acknowledged request to DORI’s endpoint must.

**For this game — INFERRED:** disable recording controls in Library reading halls; use silent typing there. Do not photograph a catalog screen showing another reader’s details. At the market, frame fixed objects rather than people, and skip the photo if that cannot be done respectfully. The Library permits personal photography subject to its rules, non-disturbance and care of items; special-collections copying may require attendant approval. Its catalog’s “Possible uses” information, not a successful camera capture, governs later reuse of collection images.[web:225][web:226][web:234]

## 3. Permission UX and interruptions

**Ask at the action, not onboarding — INFERRED.** Before invoking the OS prompt, show one idea, one question and one action: *“A photo of this plaque can support your answer. Check that no one is in frame. Take photo, describe it instead, or ask the guide to confirm.”* For audio: *“Record up to [pilot limit] seconds. You can replay, retake, delete or type instead. Recording stays private unless you choose Submit. Ready?”* The separate OS camera/mic prompt then has context. Native photo picking need not open a continuous `getUserMedia()` stream.[web:32][web:60]

**On denial — OBSERVED/INFERRED:** handle absent `navigator.mediaDevices`, `NotAllowedError`, recorder/track errors and an indefinitely unanswered prompt without an error-loop. Say *“Camera/microphone isn’t available. Type your answer or ask the guide; the task counts the same.”* Offer settings instructions only if requested. `NotAllowedError` can also mean an insecure context, OS/site block or Permissions Policy—not necessarily that the participant refused.[web:60][web:67][web:181] Safari-tab per-site settings can persist; installed-iOS grants have been reported not to persist across launches, so do not promise “allow once.” Android Chrome explicitly offers one-visit, future-visit and never-allow choices.[web:78][web:180]

**Interruption rule — INFERRED:** capture only while the app is foregrounded and the screen awake. Watch `visibilitychange`, `pagehide`, recorder `error`/`stop`, and track `mute`/`ended`. On return, show **Recording interrupted—replay what was saved, retake, or type**; never silently submit a possibly truncated recording. A recording’s chunk count is not a clock, especially on locked Android; an incoming-call outcome is not established consistently enough to promise continuity on any of these five surfaces.[web:74][web:240][web:76]

## 4. Speech-to-text, privacy and consent

**Do not put Web Speech recognition in the scored pilot path — INFERRED.** Support is partial across the requested browsers, and MDN says some implementations, including Chrome’s, send audio to a recognition service and will not work offline. On-device recognition requires implementation support and an available, installed language pack; `en` or `he` accuracy cannot be inferred from API presence. Require a participant to check and edit any transcript; score the proposal, not automatic recognition.[web:58][web:105][web:107][web:111]

**Optional later server transcription — OBSERVED/INFERRED:** after a separately consented upload, a bounded file can go from DORI’s server to OpenAI’s file-transcription endpoint; do **not** expose an API key in the PWA. OpenAI currently recommends `gpt-transcribe`, accepts WebM and MP4 among its formats, and specifies a **25 MB** file maximum. Its guidance calls for tests with target languages, code-switching, noise, names and dates. **UNKNOWN:** no retrieved independent result establishes English/Hebrew accuracy for this family’s speech, so a transcript must never replace the original checked evidence.[web:116][web:222][web:210] **OBSERVED:** the OpenAI pricing page available in October 2026 estimates `gpt-transcribe` at **US$0.0045/minute**, `gpt-4o-mini-transcribe` at **US$0.003/minute**, and `gpt-4o-transcribe` at **US$0.006/minute**; these are provider charges, not VPS, transfer or review costs. OpenAI’s October 2026 changelog says the older `gpt-4o` transcription models are deprecated for shutdown in February 2027.[web:109][web:117] **OBSERVED:** OpenAI’s data-controls table specifically lists **no abuse-monitoring or application-state retention** for `/v1/audio/transcriptions` and says API inputs are not used for model training by default; do not mistakenly apply its general “up to 30 days” log statement to that endpoint. Sending a file to any external processor still requires a clear participant choice.[web:167]

**Participant notice and defaults — INFERRED:** tell each pair, in accessible English with Hebrew available: what a photo/voice clip contains; that it is optional; whether it remains on their shared phone pending upload; who at DORI/the family can see it; whether an external transcription service is used; and how to delete it. Make submissions private to the game/authorized guide by default, authenticated on DORI’s VPS, with transport encryption, restricted staff access and no automatic publication. For the pilot, propose **delete unsubmitted captures immediately on Retake/Discard; delete acknowledged phone copies promptly; delete ordinary server media within 30 days after the tour; retain the minimal scored text/evidence only as long as the stated pilot purpose needs it**. These are **proposed DORI policies**, not browser or statutory retention periods. A shared phone’s outbox must not be treated as a private vault.

**Family-memory recording — INFERRED:** ask the *speaker* and, where applicable, the teenager and their parent/guardian separately before starting. First offer **no recording, just a spoken conversation or a privately typed memory**. Obtain explicit opt-in for the recording **and a separate opt-in for any later transcription or sharing**; allow replay and deletion before submission. Keep it outside the shared competitive dossier, visible only to the designated family recipient(s) and necessary DORI administrator, never published automatically. Offer deletion on request and a short, stated retention choice rather than quietly applying the ordinary-game default. Do not include a bystander’s or vendor’s voice without consent.

**Law — OBSERVED:** Israel’s Privacy Protection Law, 5741-1981, was amended by **Amendment 13 (2024), effective 14 August 2025**. Its revised framework includes personal-information and security duties; information about *family life* can be especially sensitive. The Israeli authority describes a notice duty when collecting personal information, including purposes and access/correction rights. **INFERRED:** DORI should give a concrete collection notice and assess its actual controller, security, processor and minors’ arrangements; a small family pilot should not be described as automatically requiring database registration or a DPO merely because it records voices.[web:120][web:165][web:169] **OBSERVED:** if GDPR applies to a participant or DORI’s processing in a particular case, its data-minimisation, lawful-processing and storage-limitation analysis is additional; the EDPB says personal data should not be stored longer than necessary. **UNKNOWN:** the project facts alone do not establish GDPR territorial applicability.[web:126][web:127]

## 5. Deployment checks and dated gotchas

- **HTTPS and Caddy — OBSERVED/INFERRED:** use one valid public HTTPS origin for Next.js, service worker and upload API. Confirm Caddy preserves the origin and returns a deliberate `Permissions-Policy: camera=(self), microphone=(self)` rather than `camera=(), microphone=()`; test the *served response header*, not just configuration files. `getUserMedia()` is absent outside a secure context, and a policy block can look like permission denial.[web:60][web:61][web:67]
- **Library connectivity — OBSERVED/INFERRED:** NLI says some subscribed databases have full access in its building or on its Wi-Fi, while some digital items are building-only. Do not proxy, bulk-cache or reproduce restricted material merely to make the game offline. Preload permissible clues; have the guide verify a restricted page while on the Library network; record its identifier and provenance for later stops. Test the guest-Wi-Fi sign-in **before** play: a captive portal or network change may leave a cached shell working while external Library pages or DORI uploads fail.[web:232][web:234][web:99]
- **iOS Home Screen permissions — OBSERVED:** WebKit bug **215884**, first reported in 2020, records hash-navigation capture loss; WebKit distinguished that original issue from later requests for persistent PWA permission. Reports through **February 2026** still describe installed-app prompts across launches. Avoid keeping a stream alive across routes and do not rely on Safari-tab settings carrying over.[web:78]
- **Black PWA preview — OBSERVED:** WebKit bug **252465** is marked fixed, yet its thread contains **2024–June 2025** reports of a Home Screen camera that appears live but renders black. A successful `getUserMedia()` promise alone is insufficient: require a visible frame and a timeout, then offer native photo/text.[web:76]
- **Safari 26 recorder corruption—the strongest evidence against optional web audio — OBSERVED:** bug **299164**, reported **September 2025**, describes MP4 recordings losing their end; WebKit says its fix shipped in iOS **26.2**, while a later reporter still observed related behavior. Bug **315091**, reported **May 2026** and still open in the evidence reviewed, documents frozen MP4 *video* with intact audio and reports that one-second `start(1000)` chunks or WebM avoided that particular video failure. These do **not** establish that every audio-only recording fails. They **do** justify replaying every submitted clip and retaining text as an equal route.[web:253][web:252]
- **iOS 26 microphone failure — OBSERVED:** bug **319706**, reported **July 2026**, records `NotAllowedError: No AVAudioSessionCaptureDevice` after an audio-services reset despite prior permission. WebKit landed fixes in July and September; whether a given pilot phone contains the branch fix must be checked. Do not translate that exception into “you denied permission.”[web:86]
- **Chunks and replay — OBSERVED:** Safari pausing a device and Android screen locking can delay `dataavailable`; sliced Blobs may not play individually. Assemble and test the finished clip, record elapsed time independently, and offer a retake if playback fails.[web:74][web:143]

**Pre-tour acceptance test — INFERRED:** on each of the three actual phones, test native photo and a **20–30-second** audio clip in its intended browser *and*, if installed, its Home Screen app; replay after stopping, lock/unlock once, simulate a call/app switch if practical, deny permission once, switch Wi-Fi to mobile data, submit a queued item twice to check idempotency, and verify deletion. Test Library Wi-Fi and the chosen catalog item on site. If any capture test fails, run that pair on text/guide confirmation without changing its available points.[web:74][web:78][web:232]

## What remains unknown

| Unknown | Test or source that would settle it |
|---|---|
| **UNKNOWN:** exact capture, codec, replay and permission persistence on the family’s five browser/installation combinations. | Record OS/browser versions; run the pre-tour device matrix above, including cold relaunch. |
| **UNKNOWN:** whether the actual iPhones include the WebKit microphone fix and whether any audio-only Safari 26 regression affects them. | Check installed iOS build against Apple release notes; make, replay and inspect several short recordings on each iPhone.[web:86][web:253] |
| **UNKNOWN:** which `ImageCapture` methods work reliably on each pilot iPhone despite conflicting compatibility tables. | Feature-test constructor, `takePhoto()` and `grabFrame()` on the device; compare the result with native capture and canvas.[web:35][web:195][web:197] |
| **UNKNOWN:** Samsung Internet’s precise available encoder MIME types, installed-app permission persistence and call interruption on the pilot handset. | Log `MediaRecorder.isTypeSupported()` results and actual output MIME; test cold relaunch, lock and call on its exact Samsung build.[web:49][web:158] |
| **UNKNOWN:** English/Hebrew recognition or optional transcription accuracy for this family, especially names, dates and mixed-language speech. | Obtain separate consent for representative clips; compare edited human transcripts with each candidate system, or omit transcription.[web:222] |
| **UNKNOWN:** permission to photograph or retain each selected Library item or screen, and access to its linked source after leaving NLI Wi-Fi. | Check the item’s “Possible uses,” ask the reading-room attendant where appropriate, and open the source both on and off Library Wi-Fi.[web:226][web:234] |
| **UNKNOWN:** whether GDPR applies to DORI’s specific participants and processing. | Determine participant locations and DORI’s actual offering/processing arrangements with qualified privacy advice; do not infer applicability from nationality alone. |

## Source register

The dates below identify the publication or dated capability relied on; a page’s later update timestamp is not evidence that an older reported bug persists on every current device.

| Publisher | Date | URL | Used for | Status |
|---|---|---|---|---|
| web.dev | Updated October 2026 | https://web.dev/articles/media-capturing-images | Native image input, `capture`, `getUserMedia()` | Primary browser-developer guidance [web:32] |
| MDN | April 2026 | https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/capture | Advisory nature of `capture` | Primary documentation [web:136] |
| WebKit | March 2025 | https://webkit.org/blog/16574/webkit-features-in-safari-18-4/ | Safari WebM/Opus and `ImageCapture` announcement | Primary release announcement [web:35] |
| Apple Developer | March 2025 | https://developer.apple.com/documentation/safari-release-notes/safari-18_4-release-notes | Confirms Safari 18.4 `ImageCapture` announcement | Primary release notes [web:198] |
| WebKit | September 2025 | https://webkit.org/blog/17333/webkit-features-in-safari-26-0/ | Safari 26 audio format and Home Screen behavior | Primary release announcement [web:33] |
| Can I Use | Data consulted October 2026 | https://caniuse.com/imagecapture | Conflicting broad `ImageCapture` listing | Secondary compatibility table [web:197] |
| Can I Use | Data consulted October 2026 | https://caniuse.com/mdn-api_imagecapture_takephoto | Method-specific Safari `takePhoto()` listing | Secondary compatibility table [web:195] |
| MDN | January 2026 | https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria | Quotas, persistence and eviction | Primary documentation [web:16] |
| WebKit | August 2023 | https://webkit.org/blog/14403/updates-to-storage-policy/ | Safari 17/Home Screen quota policy | Primary historical policy source [web:22] |
| WebKit | November 2020 | https://webkit.org/blog/11338/cname-cloaking-and-bounce-tracking-defense/ | Explicit installed-web-app ITP exemption | Primary historical policy source [web:91] |
| Can I Use | Data consulted October 2026 | https://caniuse.com/background-sync | Browser one-off Sync availability | Secondary compatibility table [web:220] |
| Chrome for Developers | Updated October 2026 | https://developer.chrome.com/docs/workbox/retrying-requests-when-back-online/ | Sync retries and fallback limits | Primary developer documentation [web:47] |
| MDN | November 2025 | https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia | Secure context, policy and errors | Primary documentation [web:60] |
| Google Chrome Help | Updated October 2026 | https://support.google.com/chrome/answer/114662?hl=en&co=GENIE.Platform=Android | Android permission choices | Primary product guidance [web:180] |
| MDN | May 2025 | https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/dataavailable_event | Delayed chunks on Safari/locked Android | Primary documentation [web:74] |
| WebKit Bugzilla | Reported August 2020; comments through February 2026 | https://bugs.webkit.org/show_bug.cgi?id=215884 | Installed-app prompt history; issue distinctions | Primary bug record [web:78] |
| WebKit Bugzilla | Reported February 2023; comments through June 2025 | https://bugs.webkit.org/show_bug.cgi?id=252465 | Installed-app black-preview reports | Primary bug record [web:76] |
| WebKit Bugzilla | Reported September 2025; discussion through May 2026 | https://bugs.webkit.org/show_bug.cgi?id=299164 | Safari 26 MP4 truncation and disputed follow-up | Primary bug record [web:253] |
| WebKit Bugzilla | Reported May 2026; discussion through September 2026 | https://bugs.webkit.org/show_bug.cgi?id=315091 | Separate MP4 video-freeze report and workaround | Primary bug record [web:252] |
| WebKit Bugzilla | Reported July 2026; fix commits through September 2026 | https://bugs.webkit.org/show_bug.cgi?id=319706 | iOS 26 microphone-reset failure | Primary bug record [web:86] |
| MDN | August 2026 | https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition | Recognition availability and service processing | Primary documentation [web:105] |
| OpenAI | October 2026 | https://developers.openai.com/api/docs/guides/speech-to-text | File transcription, formats, size and language testing | Primary provider documentation [web:222] |
| OpenAI | October 2026 | https://developers.openai.com/api/docs/pricing | Dated per-minute transcription estimates | Primary provider price list [web:109] |
| OpenAI | October 2026 | https://developers.openai.com/api/docs/guides/your-data | Transcription-endpoint data controls | Primary provider documentation [web:167] |
| National Library of Israel | Consulted October 2026 | https://www.nli.org.il/en/at-your-service/services/codes-of-conduct | On-premises personal-photography rules | Primary institution policy [web:225] |
| National Library of Israel | Consulted October 2026 | https://www.nli.org.il/en/research-and-teach/databases | In-building/Wi-Fi source access | Primary institution guidance [web:232] |
| Israel Privacy Protection Authority | August 2025 guide | https://www.gov.il/BlobFolder/reports/guide_tikon13_professional/he/tikun%2013%20_170825.pdf | Amendment 13 and collection-notice context | Primary regulator guidance [web:165] |
| Library of Congress | November 2025 | https://www.loc.gov/item/global-legal-monitor/2025-11-17/israel-amendment-to-privacy-protection-law-goes-into-effect/ | Effective date and scope of Israeli amendment | Official secondary legal account [web:120] |
| European Data Protection Board | Consulted October 2026 | https://www.edpb.europa.eu/sme/find-practical-info/faq_en?page=1 | Conditional GDPR storage-limitation point | Primary regulator guidance [web:126] |

## Sources

### Cited in the answer

- [7] developer.chrome.com › blog › mediarecorderRecord audio and video with MediaRecorder | Blog | Chrome for ... — https://developer.chrome.com/blog/mediarecorder/
- [16] Storage quotas and eviction criteria — https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria
- [21] Storage for the web | Articles — https://web.dev/articles/storage-for-the-web
- [22] Updates to Storage Policy | WebKit — https://webkit.org/blog/14403/updates-to-storage-policy/
- [32] Capturing an image from the user | Articles - web.dev — https://web.dev/articles/media-capturing-images
- [33] WebKit Features in Safari 26.0 — https://webkit.org/blog/17333/webkit-features-in-safari-26-0/
- [35] WebKit Features in Safari 18.4 — https://webkit.org/blog/16574/webkit-features-in-safari-18-4/
- [40] webkit.org · blog · 16993News from WWDC25: WebKit in Safari 26 beta | WebKit — https://webkit.org/blog/16993/news-from-wwdc25-web-technology-coming-this-fall-in-safari-26-beta/
- [46] Introducing Background Sync | Blog | Chrome for Developers — https://developer.chrome.com/blog/background-sync/
- [47] developer.chrome.com · docs · workboxRetrying requests when back online | Workbox | Chrome for ... — https://developer.chrome.com/docs/workbox/retrying-requests-when-back-online/
- [48] workbox-background-sync | Modules | Chrome for Developers — https://developer.chrome.com/docs/workbox/modules/workbox-background-sync
- [49] MediaRecorder API | Can I use... Support tables for HTML5, CSS3, etc — https://caniuse.com/mediarecorder
- [57] HTML Media Capture | Can I use... Support tables for HTML5 ... — https://caniuse.com/html-media-capture
- [58] Speech Recognition API | Can I use... Support tables for ... — https://caniuse.com/speech-recognition
- [59] Let's create a web camera app ready for foldable devices. — https://developer.samsung.com/internet/blog/en/2021/11/10/lets-create-a-web-camera-app-ready-for-foldable-devices
- [60] MediaDevices: getUserMedia () method - Web APIs | MDN — https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia.
- [61] Permissions-Policy: microphone directive - HTTP | MDN — https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Permissions-Policy/microphone
- [67] Permissions-Policy header — https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Permissions-Policy
- [74] MediaRecorder: dataavailable event - Web APIs | MDN — https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/dataavailable_event
- [76] 252465 – In PWA, HTML Video Element may be unable to play ... — https://bugs.webkit.org/show_bug.cgi?id=252465
- [77] 185448 – getUserMedia not working in apps added to home screen ... — https://bugs.webkit.org/show_bug.cgi?id=185448
- [78] getUserMedia recurring permissions prompts in standalone when ... — https://bugs.webkit.org/show_bug.cgi?id=215884
- [86] bugs.webkit.org › show_bug319706 – getUserMedia audio permanently fails with ... — https://bugs.webkit.org/show_bug.cgi?id=319706
- [90] Full Third-Party Cookie Blocking and More - WebKit — https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/
- [91] CNAME Cloaking and Bounce Tracking Defense — https://webkit.org/blog/11338/cname-cloaking-and-bounce-tracking-defense/
- [99] Service workers — https://web.dev/learn/pwa/service-workers
- [105] SpeechRecognition - Web APIs | MDN — https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition
- [107] Using the Web Speech API — https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API
- [109] Pricing | OpenAI API — https://developers.openai.com/api/docs/pricing
- [111] developer.mozilla.org › API › SpeechRecognitionSpeechRecognition: lang property - Web APIs | MDN — https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/lang
- [116] Transcription | OpenAI API — https://developers.openai.com/api/docs/guides/transcription
- [117] Changelog | OpenAI API — https://developers.openai.com/api/docs/changelog
- [120] Israel: Amendment to Privacy Protection Law Goes into Effect — https://www.loc.gov/item/global-legal-monitor/2025-11-17/israel-amendment-to-privacy-protection-law-goes-into-effect/
- [126] Frequently asked questions - European Data Protection Board — https://www.edpb.europa.eu/sme/find-practical-info/faq_en?page=1
- [127] Process personal data lawfully - European Data Protection Board — https://www.edpb.europa.eu/sme/be-compliant/process-personal-data-lawfully_en
- [136] capture HTML attribute — https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/capture
- [143] MediaStream Recording API — https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API
- [144] Capturing the media stream — https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API/Using_the_MediaStream_Recording_API
- [154] Service worker caching, PlaybackRate and Blob URLs for ... — https://developer.chrome.com/blog/ump
- [158] MediaRecorder: isTypeSupported() static method — https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/isTypeSupported_static
- [160] MediaRecorder API - WebKit — https://webkit.org/blog/11353/mediarecorder-api/
- [165] מדריך | תיקון מס' 13 לחוק הגנת הפרטיות — https://www.gov.il/BlobFolder/reports/guide_tikon13_professional/he/tikun%2013%20_170825.pdf
- [167] Data controls in the OpenAI platform — https://developers.openai.com/api/docs/guides/your-data
- [169] חובת יידוע במסגרת איסוף ושימוש במידע אישי — https://www.gov.il/BlobFolder/legalinfo/duty_to_notify/he/notify13.pdf
- [180] Change site settings permissions - Android - Google Chrome Help — https://support.google.com/chrome/answer/114662?hl=en&co=GENIE.Platform=Android
- [181] Use Security and privacy settings on Galaxy phones and tablets — https://www.samsung.com/us/support/answer/ANS10002544/
- [182] Use your camera and microphone in Chrome - Android - Google Help — https://support.google.com/chrome/answer/2693767?hl=en&co=GENIE.Platform=Android
- [195] ImageCapture API: takePhoto | Can I use... Support tables ... - CanIUse — https://caniuse.com/mdn-api_imagecapture_takephoto
- [197] ImageCapture API | Can I use... Support tables for HTML5 ... — https://caniuse.com/imagecapture
- [198] Safari 18.4 Release Notes | Apple Developer Documentation — https://developer.apple.com/documentation/safari-release-notes/safari-18_4-release-notes
- [210] Nov 2025 -- Tech Vocabulary... — https://github.com/danielrosehill/Speech-And-ASR-Evaluations
- [220] OpenAI Whisper vs Google STT vs Amazon Transcribe - Gladia — https://www.gladia.io/blog/openai-whisper-vs-google-speech-to-text-vs-amazon-transcribe
- [222] File transcription | OpenAI API — https://developers.openai.com/api/docs/guides/speech-to-text
- [225] Guidelines and Code of Conduct at the National Library ... — https://www.nli.org.il/en/at-your-service/services/codes-of-conduct
- [226] www.nli.org.il · en · at-your-serviceReading Halls - הספרייה הלאומית של ישראל — https://www.nli.org.il/en/at-your-service/reading-rooms
- [232] Databases and E-Journals - הספרייה הלאומית של ... — https://www.nli.org.il/en/research-and-teach/databases
- [234] How to Access Items From the NLI Collections Online — https://www.nli.org.il/en/at-your-service/reference/online-access
- [240] Page Visibility API - Web APIs | MDN — https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API.
- [241] Document: visibilitychange event — https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilitychange_event
- [252] bugs.webkit.org › show_bug315091 – MediaRecorder produces broken file for video/mp4 — https://bugs.webkit.org/show_bug.cgi?id=315091
- [253] 299164 – REGRESSION (iOS 26): MediaRecorder produces ... — https://bugs.webkit.org/show_bug.cgi?id=299164

### Retrieved but not cited

- [1] developers.openai.com › api › docsdevelopers.openai.com — https://developers.openai.com/api/docs/pricing.md
- [2] www.testmuai.com · learning-hub · mediarecorderMediaRecorder: Browser Support, Codecs, Limitations — https://www.testmuai.com/learning-hub/mediarecorder-browser-support/
- [3] OpenAI platform pricing — https://platform.openai.com/pricing
- [4] Web Speech API: Speech to Text in JavaScript - Micdrop — https://micdrop.dev/blog/web-speech-api
- [5] developers.openai.com › gpt-4o-mini-transcribeGPT-4o Mini Transcribe Model | OpenAI API — https://developers.openai.com/api/docs/models/gpt-4o-mini-transcribe
- [6] Web Speech API Browser Support — Chrome, Edge, Safari ... — https://textintoaudio.com/browser-support
- [8] Business Pricing — https://openai.com/api/pricing/?client_id
- [9] Best Speech-to-Text and Transcription Models - OpenRouter — https://openrouter.ai/collections/speech-to-text-models
- [10] Changelog | OpenAI API — https://developers.openai.com/api/docs/changelog
- [11] Audio API FAQ — https://help.openai.com/en/articles/7031512-audio-api-faq
- [12] How to Add Voice Search in Website in 2026 — https://www.youstable.com/blog/add-voice-search-in-website/
- [13] Talk to your PWA and have it talk back — Speech Recognition ... — https://dev.to/alex_truhniy/talk-to-your-pwa-and-have-it-talk-back-speech-recognition-synthesis-fieldkit-companion-3dlm
- [14] Speech Recognition API: Browser Support, Features — https://www.testmuai.com/learning-hub/speech-recognition-api-browser-support/
- [15] Web Speech API: browser speech recognition and its limits — https://www.assemblyai.com/blog/speech-recognition-javascript-web-speech-api
- [17] Background Synchronization API - Web APIs | MDN — https://developer.mozilla.org/en-US/docs/Web/API/Background_Synchronization_API
- [18] PWA Offline Architecture: Lessons from Building CarerNotes — https://davidslv.uk/web-development/pwa/architecture/2025/12/20/pwa-offline.html
- [19] How real is the IndexedDB data-loss risk on iOS? #3 - GitHub — https://github.com/dbgeek/vape-off/issues/3
- [20] web.dev · learn · pwaAssets and data - web.dev — https://web.dev/learn/pwa/assets-and-data/
- [23] openpwa.net · compatibility · background-syncBackground Sync | OpenPWA — https://openpwa.net/compatibility/background-sync/
- [24] How Much Chat History Can Your Browser Store? — https://secret-chat.ai/blog/browser-storage-limits-indexeddb-opfs/
- [25] webkit.org › blog › categoryStorage – WebKit — https://webkit.org/blog/category/storage/feed/
- [26] Browser Storage APIs: localStorage, IndexedDB, and Beyond — Sujeet Jaiswal - Principal Software Engineer — https://sujeet.pro/articles/storage-apis-local-indexeddb
- [27] Persistent Storage in Web Browsers: The Complete Guide - BytePlus — https://www.byteplus.com/en/topic/581741
- [28] So, what exactly did Apple break in the EU? - Blogccasion — https://blog.tomayac.com/2024/02/28/so-what-exactly-did-apple-break-in-the-eu/
- [29] Browser Storage & Offline-First — IndexedDB, Cache API, OPFS, and Service Workers — jvinhit — https://jvinhit.github.io/blog/browser-storage-offline-first-deep-dive/
- [30] Periodic background sync: refreshing content while the app is ... — https://openpwa.net/reference/service-worker/periodic-background-sync/
- [31] www.media-processing-workflows.com › uploadCapturing Photos with the capture Attribute | MPW — https://www.media-processing-workflows.com/upload-fundamentals-browser-apis/mobile-and-camera-capture-uploads/capturing-photos-with-the-capture-attribute/
- [34] bugs.webkit.org › show_bug315091 – MediaRecorder produces broken file for video/mp4 — https://bugs.webkit.org/show_bug.cgi?id=315091
- [36] Recording Video from the User | Articles | web.dev — https://web.dev/articles/media-recording-video
- [37] www.testmuai.com · learning-hub · mediarecorderMediaRecorder: Browser Support, Codecs, Limitations — https://www.testmuai.com/learning-hub/mediarecorder-browser-support/
- [38] Apple iOS 26 Update Urgent: Protect Your iPhone from ... — https://www.linkedin.com/posts/victormeloasm_your-iphone-can-be-compromised-simply-by-activity-7420993161063452672-BCB2
- [39] About the security content of iOS 26 and iPadOS 26 — https://support.apple.com/en-us/125108
- [41] Multiple permission prompting for getUserMedia() on iOS 14.3 Beta and Beta 3 — https://developer.apple.com/forums/thread/669011
- [42] MediaRecorder: mimeType property - Web APIs | MDN — https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/mimeType
- [43] navigator.getUserMedia alternative API for iOS safari mobile browser? — https://stackoverflow.com/questions/31294422/navigator-getusermedia-alternative-api-for-ios-safari-mobile-browser
- [44] WKPermissionDecision | Apple Developer Documentation — https://developer.apple.com/documentation/webkit/wkpermissiondecision
- [45] Understanding The... — https://blog.addpipe.com/getusermedia-getting-started/
- [50] MediaRecorder API: audioBitrateMode | Can I use... Support tables ... — https://caniuse.com/mdn-api_mediarecorder_audiobitratemode
- [51] MediaRecorder API: state | Can I use... Support tables for HTML5 ... — https://caniuse.com/mdn-api_mediarecorder_state
- [52] caniuse.com · mdn-api_mediarecorderMediaRecorder API | Can I use... Support tables for HTML5, CSS3,... — https://caniuse.com/mdn-api_mediarecorder
- [53] caniuse.com · streamgetUserMedia/Stream API | Can I use... Support tables for ... — https://caniuse.com/stream
- [54] MediaRecorder API: start | Can I use... Support tables for HTML5, CSS3, etc — https://caniuse.com/mdn-api_mediarecorder_start
- [55] MediaStream recording | Can I use... Support tables for HTML5 ... — https://caniuse.com/wf-mediastream-recording
- [56] ImageCapture API: track | Can I use... Support tables for ... — https://caniuse.com/mdn-api_imagecapture_track
- [62] Navigator: getUserMedia() method — https://developer.mozilla.org/en-US/docs/Web/API/Navigator/getUserMedia
- [63] MediaDevices - Web APIs | MDN - MDN Web Docs — https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices
- [64] Permissions Policy - HTTP - MDN Web Docs — https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Permissions_Policy
- [65] Getting browser microphone permission - Web APIs | MDN — https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Build_a_phone_with_peerjs/Connect_peers/Get_microphone_permission
- [66] Navigator — https://developer.mozilla.org/en-US/docs/Web/API/Navigator
- [68] Firefox 68 release notes for developers - MDN Web Docs — https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Releases/68
- [69] developer.mozilla.org › Web › APIMediaRecorder - Web APIs - MDN — https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder.
- [70] Using the Element Capture and Region Capture APIs — https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API/Element_Region_Capture
- [71] Example — https://developer.mozilla.org/en-US/docs/Web/API/ImageCapture
- [72] MediaRecorder: start () method - Web APIs | MDN — https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/start
- [73] Permissions API - Web APIs - MDN — https://developer.mozilla.org/en-US/docs/Web/API/Permissions_API
- [75] 259465 – No permission prompt for getUserMedia — https://bugs.webkit.org/show_bug.cgi?id=259465
- [79] 208667 – getUserMedia does not work in WKWebView- ... — https://bugs.webkit.org/show_bug.cgi?id=208667
- [80] bugs.webkit.org · show_bug273938 – getUserMedia camera stream does not work in PWA on ... — https://bugs.webkit.org/show_bug.cgi?id=273938
- [81] Full Text Bug Listing - WebKit Bugzilla — https://bugs.webkit.org/show_bug.cgi?format=multiple&id=212040
- [82] 220184 – WKWebView should expose navigator.mediaDevices ... — https://bugs.webkit.org/show_bug.cgi?id=220184
- [83] 282327 – Camera doesn't start in PWA — https://bugs.webkit.org/show_bug.cgi?id=282327
- [84] 180551 – getUserMedia fails with HOME SCREEN mode on iOS ... — https://bugs.webkit.org/show_bug.cgi?id=180551
- [85] REGRESSION iOS 16.4 beta selects ultra-wide for facingMode — https://bugs.webkit.org/show_bug.cgi?id=253186
- [87] 323550 – REGRESSION(? - iOS 26.6): MediaRecorder portrait ... — https://bugs.webkit.org/show_bug.cgi?id=323550
- [88] 220416 – WKWebView getUserMedia persistent permissions — https://bugs.webkit.org/show_bug.cgi?id=220416
- [89] WebKit Features in Safari 26.0 — https://webkit.org/blog/17333/webkit-features-in-safari-26-0/
- [92] Tracking Prevention in WebKit — https://webkit.org/tracking-prevention/
- [93] bugs.webkit.org · show_bug211775 – ITP: 7-Day Cap on All Script-Writable Storage does not... — https://bugs.webkit.org/show_bug.cgi?id=211775
- [94] bugs.webkit.org · show_bug237350 – Web App Added to Home Screen Cookies Deleted After 7... — https://bugs.webkit.org/show_bug.cgi?id=237350
- [95] Debug Progressive Web Apps | Chrome DevTools — https://developer.chrome.com/docs/devtools/progressive-web-apps
- [96] Support longterm persistent storage (re: default ITP 7 ... — https://bugs.webkit.org/show_bug.cgi?id=209563
- [97] Serving — https://web.dev/learn/pwa/serving
- [98] การแคช - web.dev — https://web.dev/learn/pwa/caching?hl=th
- [100] 232302 – Service worker and storage deleted after 7 days on ... — https://bugs.webkit.org/show_bug.cgi?id=232302
- [101] Não registra um service worker que controla a página e o ... — https://developer.chrome.com/docs/lighthouse/pwa/service-worker?hl=pt-br
- [102] Bieżąca strona nie wyświetla błędu 200, gdy jest offline — https://developer.chrome.com/docs/lighthouse/pwa/works-offline?hl=pl
- [103] Progresywne aplikacje... — https://developer.chrome.com/blog/getting-started-pwa?hl=pl
- [104] Tools and debug - web.dev — https://web.dev/learn/pwa/tools-and-debug/
- [106] developers.openai.com › models › gpt-live-transcribeGPT-Live-Transcribe Model | OpenAI API — https://developers.openai.com/api/docs/models/gpt-live-transcribe
- [108] SpeechRecognition: available() static method - Web APIs | MDN — https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/available_static
- [110] GPT-4o Transcribe Model | OpenAI API — https://developers.openai.com/api/docs/models/gpt-4o-transcribe
- [112] developers.openai.com › api › docsdevelopers.openai.com — https://developers.openai.com/api/docs/pricing.md
- [113] SpeechRecognition() constructor - Web APIs - MDN Web Docs — https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/SpeechRecognition
- [114] Realtime transcription | OpenAI API — https://developers.openai.com/api/docs/guides/realtime-transcription
- [115] Web Speech API Interfaces — https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
- [118] developers.openai.com › api › docsdevelopers.openai.com — https://developers.openai.com/api/docs/changelog.md
- [119] developers.openai.com › api › docsCost optimization | OpenAI API — https://developers.openai.com/api/docs/guides/voice-latency-cost
- [121] Data Protected Israel - Linklaters — https://www.linklaters.com/en/insights/data-protected/data-protected---israel
- [122] Data Protection & Privacy 2026 - Global Practice Guides — https://practiceguides.chambers.com/practice-guides/comparison/1129/18505/29027-29028-29029-29030-29031
- [123] Q&A on Amendment No. 13 to the Israeli Privacy Protection Law — https://techpolicy.org.il/wp-content/uploads/2025/08/FAQ-amendment-no-13-.pdf
- [124] Authority — https://www.dlapiperdataprotection.com/index.html?t=authority&c=IL
- [125] Data Protection & Privacy 2026 - Israel | Global Practice ... — https://practiceguides.chambers.com/practice-guides/data-protection-privacy-2026/israel
- [128] Israel Protection of Privacy Law — 5741-1981 — https://www.smartsuite.com/frameworks/israel-protection-of-privacy-law-5741-1981
- [129] New Amendment to Israeli Privacy Protection Law and ... — https://www.inplp.com/publications/new-amendment-to-israeli-privacy-protection-law-and-mandatory-dpo-appointment
- [130] Data Protection in Israel — https://www.dlapiperdataprotection.com/index.html?t=contacts-section&c=IL
- [131] www.dlapiperdataprotection.com › indexData protection laws in Israel - Data Protection Laws of the ... — https://www.dlapiperdataprotection.com/index.html?t=law&c=IL
- [132] Guidelines 02/2021 on virtual voice assistants Version 2 - Europa — https://www.edpb.europa.eu/system/files/documents/2021-07/edpb_guidelines_202102_on_vva_v2.0_adopted_en.pdf
- [133] מדריך | תיקון מס' 13 לחוק הגנת הפרטיות — https://www.gov.il/BlobFolder/reports/guide_tikon13_professional/he/tikun%2013%20_170825.pdf
- [134] מהם "מידע" ו"ידיעה על ענייניו הפרטיים של אדם" בחוק הגנת הפרטיות — https://www.gov.il/BlobFolder/legalinfo/legat_terms2022/he/note_privacy_tikon13.pdf
- [135] <input type="file"> HTML attribute value - MDN Web Docs - Mozilla — https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/file
- [137] MDN Web Docs — https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/capture/index.json
- [138] MediaRecorder: isTypeSupported() static method — https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/isTypeSupported_static
- [139] HTMLInputElement: capture property - Web APIs | MDN — https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/capture
- [140] MediaRecorder - Web APIs | MDN — https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder
- [141] MediaRecorder() constructor - Web APIs - MDN Web Docs — https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/MediaRecorder
- [142] <input> HTML input element — https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input
- [145] developer.mozilla.org › en-US › docsAudio and video delivery - Media | MDN - MDN Web Docs — https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Audio_and_video_delivery
- [146] Serving — https://web.dev/learn/pwa/serving
- [147] Recording a media element - Web APIs | MDN - MDN Web Docs — https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API/Recording_a_media_element
- [148] MediaSource: isTypeSupported() static method - Web APIs - MDN — https://developer.mozilla.org/en-US/docs/Web/API/MediaSource/isTypeSupported_static
- [149] MediaRecorder.requestData() — https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/requestData
- [150] MediaRecorder: mimeType property - Web APIs | MDN — https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/mimeType
- [151] MediaRecorder - Web APIs | MDN — https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder
- [152] Record audio and video with MediaRecorder - Chrome for Developers — https://developer.chrome.com/blog/mediarecorder
- [153] WebKit Features in Safari 18.4 — https://webkit.org/blog/16574/webkit-features-in-safari-18-4/
- [155] MediaRecorder() constructor - Web APIs - MDN Web Docs — https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/MediaRecorder
- [156] Try it — https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Containers
- [157] MediaStream Recording API — https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API
- [159] Capturing the media stream — https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API/Using_the_MediaStream_Recording_API
- [161] Codec selection - Web APIs | MDN - MDN Web Docs — https://developer.mozilla.org/en-US/docs/Web/API/WebCodecs_API/Codec_selection
- [162] Codecs in common media types - MDN Web Docs - Mozilla — https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/codecs_parameter
- [163] developer.mozilla.org › en-US › docsAudio and video delivery - Media | MDN - MDN Web Docs — https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Audio_and_video_delivery
- [164] 293310 – Incorrect media time for Opus audio in an Ogg container. — https://bugs.webkit.org/show_bug.cgi?id=293310
- [166] Managing GPT-Live sessions | OpenAI API — https://developers.openai.com/api/docs/guides/live-conversations
- [168] חוק הגנת הפרטיות (תיקון מס' 13), התשפ"ד-2024 1430תיקונים עקיפים: — https://www.gov.il/BlobFolder/legalinfo/standards_law/he/laws_standards-law_law3287.pdf
- [170] טיוטת הנחיית הרשות בינה מלאכותית — https://www.gov.il/BlobFolder/rfp/ai_reg/he/ai%20regu_draft.pdf
- [171] חוק הגנת הפרטיות (תיקון מס' 13), התשפ"ד–2024 — https://fs.knesset.gov.il/25/law/25_lsh_4900389.docx
- [172] How to parse PDF docs for RAG — https://developers.openai.com/cookbook/examples/parse_pdf_docs_for_rag
- [173] מהם "מידע" ו"ידיעה על ענייניו הפרטיים של אדם" בחוק הגנת הפרטיות — https://www.gov.il/BlobFolder/legalinfo/legat_terms2022/he/note_privacy_tikon13.pdf
- [174] הנחית רשם מאגרי מידע-מכוני מיון — https://www.gov.il/BlobFolder/service/registration_in_the_database/he/22012.pdf
- [175] התשנ"ו1996 הפרטיות (תיקון מס' 4) (מאגרי מידע), חוק הגנת — https://fs.knesset.gov.il/13/law/13_lsr_211276.PDF
- [176] [PDF] ספר﻿החוקים - Gov.il — https://www.gov.il/BlobFolder/news/13_amendment/he/%D7%AA%D7%99%D7%A7%D7%95%D7%9F%2013%20-%20%D7%A4%D7%A8%D7%A1%D7%95%D7%9D%20%D7%91%D7%A1%D7%A4%D7%A8%20%D7%94%D7%97%D7%95%D7%A7%D7%99%D7%9D.pdf
- [177] Audio transcriptions | OpenAI API Reference — https://developers.openai.com/api/reference/resources/admin/subresources/organization/subresources/usage/methods/audio_transcriptions
- [178] Admin — https://developers.openai.com/api/reference/resources/admin
- [179] developers.openai.com — https://developers.openai.com/api/llms-full.txt
- [183] Change site settings permissions - Computer - Google Chrome Help — https://support.google.com/chrome/answer/114662?hl=en&co=GENIE.Platform=Desktop
- [184] Use your camera & microphone - Android - Google Chrome Help — https://support.google.com/chrome/answer/2693767?hl=en&co=genie.platform=android
- [185] www.samsung.com · sa_en · supportWhat does the green dot mean on my Samsung phone and how do I... — https://www.samsung.com/sa_en/support/mobile-devices/know-what-the-green-dot-at-the-top-of-your-screen-means/
- [186] How to know which apps are using your camera or microphone — https://www.samsung.com/ae/support/mobile-devices/how-to-know-which-apps-are-using-your-camera-or-microphone/?msockid=2e4a78d99536659c08116ed3943764a5
- [187] Security — https://www.samsung.com/us/support/answer/ANS00091485/
- [188] Use your camera and microphone in Chrome - Android - Google ... — https://support.google.com/chrome/answer/2693767?hl=en-GB&co=GENIE.Platform=Android&co=GENIE.Platform=iOS
- [189] Disable the webcam on your Samsung PC — https://www.samsung.com/us/support/answer/ANS10002812/
- [190] Know what the green dot at the top of your screen means — https://www.samsung.com/africa_en/support/mobile-devices/know-what-the-green-dot-at-the-top-of-your-screen-means/
- [191] Privacy protection for you to feel secure | Samsung US — https://samsung.com/us/sustainability/security-and-privacy/privacy/
- [192] Privacy protection for you to feel secure | Samsung Caribbean — https://www.samsung.com/latin_en/sustainability/security-and-privacy/privacy/
- [193] Privacy protection for you to feel secure | Samsung Africa — https://www.samsung.com/africa_en/sustainability/security-and-privacy/privacy/
- [194] How to See Which Apps Use Your Camera or Microphone — https://www.samsung.com/ae/support/mobile-devices/how-to-know-which-apps-are-using-your-camera-or-microphone/
- [196] ImageCapture API: Browser Support, Methods, Limitations — https://www.testmuai.com/learning-hub/image-capture-api-browser-support/
- [199] ImageCapture API: getPhotoCapabilities | Can I use... Support ... — https://caniuse.com/mdn-api_imagecapture_getphotocapabilities
- [200] Release Notes for Safari Technology Preview 244 — https://webkit.org/blog/17962/release-notes-for-safari-technology-preview-244/
- [201] About the security content of Safari 18.4 — https://support.apple.com/en-us/122379
- [202] WebKit Features in Safari 18.4 — https://webkit.org/blog/16574/webkit-features-in-safari-18-4/
- [203] "imagecapture" | Can I use... Support tables for HTML5, CSS3, etc — https://caniuse.com/?search=imagecapture
- [204] ImageCapture: getPhotoCapabilities() method - Web APIs | MDN — https://developer.mozilla.org/en-US/docs/Web/API/ImageCapture/getPhotoCapabilities
- [205] ImageCapture: getPhotoSettings() method — https://developer.mozilla.org/en-US/docs/Web/API/ImageCapture/getPhotoSettings
- [206] The Can I use... test suite — https://tests.caniuse.com/?feat=imagecapture
- [207] ImageCapture: grabFrame () method - Web APIs | MDN — https://developer.mozilla.org/en-US/docs/Web/API/ImageCapture/grabFrame
- [208] developer.mozilla.org › MediaStream › getVideoTracksMediaStream: getVideoTracks () method - Web APIs | MDN — https://developer.mozilla.org/en-US/docs/Web/API/MediaStream/getVideoTracks
- [209] ImageCapture: ImageCapture() constructor — https://developer.mozilla.org/en-US/docs/Web/API/ImageCapture/ImageCapture
- [211] danielrosehill/STT-Voice-Note-Evaluation — https://github.com/danielrosehill/STT-Voice-Note-Evaluation
- [212] Soniox vs OpenAI for Hebrew speech-to-text — https://soniox.com/compare-stt/soniox-vs-openai/hebrew
- [213] Can Voice Agents Handle Bilingual Customers ... — https://huggingface.co/blog/ServiceNow-AI/code-switching
- [214] Introducing next-generation audio models in the API - OpenAI — https://openai.com/index/introducing-our-next-generation-audio-models/
- [215] What Is Code-Switching? A Complete Guide for ASR Builders — https://deepgram.com/learn/what-is-code-switching-asr-guide
- [216] Building an Accurate Open-Source Hebrew ASR System through ... — https://www.isca-archive.org/interspeech_2025/marmor25_interspeech.pdf
- [217] Benchmarking Commercial ASR Systems on Code-Switching Speech: Arabic, Persian, and German — https://arxiv.org/pdf/2605.19069v3
- [218] A Switch-Aware Evaluation of ASR and Audio Language ... — https://arxiv.org/html/2609.11786v1
- [219] Create transcription | OpenAI API Reference — https://developers.openai.com/api/reference/python/resources/audio/subresources/transcriptions/methods/create
- [221] Realtime transcription | OpenAI API — https://developers.openai.com/api/docs/guides/realtime-transcription
- [223] Create transcription | OpenAI API Reference — https://developers.openai.com/api/reference/cli/resources/audio/subresources/transcriptions/methods/create
- [224] developers.openai.com · api · referenceCreate transcription | OpenAI API Reference — https://developers.openai.com/api/reference/resources/audio/subresources/transcriptions/methods/create
- [227] Viewing and Borrowing Items at the National Library — https://www.nli.org.il/en/at-your-service/reference/view-and-order-items
- [228] Ordering Archival Items — https://www.nli.org.il/en/at-your-service/viewing-library-items/archive-order
- [229] A Digital Guide for Your Visit to the National Library — https://www.nli.org.il/en/visit/bloomberg
- [230] Library Services - הספרייה הלאומית של ישראל — https://www.nli.org.il/en/at-your-service/services
- [231] The National Library of Israel — https://www.nli.org.il/en
- [233] Printing, Photocopying and Scanning — https://www.nli.org.il/en/at-your-service/services/photocopy
- [235] www.nli.org.il · en · visitVisitor Information - הספרייה הלאומית של ... — https://www.nli.org.il/en/visit/information
- [236] Terms of Use; The National Library of Israel — https://www.nli.org.il/en/at-your-service/terms-of-use
- [237] National Library of Israel Renewal — https://www.nli.org.il/en/at-your-service/who-we-are/library-renewal
- [238] Copyright Queries — https://www.nli.org.il/en/at-your-service/copyright-service
- [239] The Archives Collection — https://www.nli.org.il/en/at-your-service/who-we-are/collections/archives-collection
- [242] Using the Page Visibility API - MDN Web Docs — https://developer.mozilla.org/en-US/blog/using-the-page-visibility-api/
- [243] Document: visibilityState property — https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilityState
- [244] Timing element visibility with the Intersection Observer API — https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API/Timing_element_visibility
- [245] developer.mozilla.org › docs › WebUsing the Notifications API - Web APIs | MDN - MDN Web Docs — https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API/Using_the_Notifications_API
- [246] developer.mozilla.org › en-US › docsWeb performance | MDN - MDN Web Docs — https://developer.mozilla.org/en-US/docs/Web/Performance
- [247] Window: pageshow event — https://developer.mozilla.org/en-US/docs/Web/API/Window/pageshow_event
- [248] Web APIs — https://developer.mozilla.org/en-US/docs/Web/API
- [249] Window: unload Event - Web-APIs | MDN — https://developer.mozilla.org/de/docs/Web/API/Window/unload_event
- [250] 294623 – MediaRecorder severely reduces input audio volume ... — https://bugs.webkit.org/show_bug.cgi?id=294623
- [251] MediaRecorder generates huge chunks when pausing & resuming ... — https://bugs.webkit.org/show_bug.cgi?id=279432
- [254] 291465 – macOS 15.4 and iOS/Safari 18.4 - Mediarecorder in ... — https://bugs.webkit.org/show_bug.cgi?id=291465

### Pages read in full

- WebKit Features in Safari 18.4 — https://webkit.org/blog/16574/webkit-features-in-safari-18-4/
- WebKit Features in Safari 26.0 — https://webkit.org/blog/17333/webkit-features-in-safari-26-0/
- Storage quotas and eviction criteria - Web APIs | MDN — https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria
- bugs.webkit.org › show_bug319706 – getUserMedia audio permanently fails with ... — https://bugs.webkit.org/show_bug.cgi?id=319706
- 215884 – getUserMedia recurring permissions prompts in ... — https://bugs.webkit.org/show_bug.cgi?id=215884
- 252465 – In PWA, HTML Video Element may be unable to ... — https://bugs.webkit.org/show_bug.cgi?id=252465
- bugs.webkit.org › show_bug315091 – MediaRecorder produces broken file for video/mp4 — https://bugs.webkit.org/show_bug.cgi?id=315091
- Speech Recognition API | Can I use... Support tables for ... — https://caniuse.com/speech-recognition
- Transcription | OpenAI API — https://developers.openai.com/api/docs/guides/transcription
- File transcription | OpenAI API — https://developers.openai.com/api/docs/guides/speech-to-text
- Background Sync API | Can I use... Support tables for HTML5 ... — https://caniuse.com/background-sync
- ImageCapture API | Can I use... Support tables for HTML5 ... — https://caniuse.com/imagecapture
- Israel: Amendment to Privacy Protection Law Goes into Effect — https://www.loc.gov/item/global-legal-monitor/2025-11-17/israel-amendment-to-privacy-protection-law-goes-into-effect/
- Data controls in the OpenAI platform — https://developers.openai.com/api/docs/guides/your-data
- 299164 – REGRESSION (iOS 26): MediaRecorder produces ... — https://bugs.webkit.org/show_bug.cgi?id=299164

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

Act as a senior mobile-web engineer. Your research decides **the simplest reliable way to add photo capture and voice recording to the pilot**, and what must fall back to text or the guide's confirmation.

# RESEARCH QUESTION

As of October 2026, what can a mobile web app or installed PWA reliably do with the camera and microphone on **iPhone Safari, installed iPhone PWA (home-screen web app), Android Chrome, installed Android PWA and Samsung Internet**?

Answer each, per platform:
1. Open the camera from a button; launch the native camera UI (`<input type="file" accept="image/*" capture>`).
2. Show a live in-game preview (`MediaDevices.getUserMedia()`), and capture a still via canvas or `ImageCapture`.
3. Record audio (`MediaRecorder`): supported MIME types/codecs per browser, and let the user replay before submitting.
4. Store photos and recordings offline temporarily (IndexedDB, Cache API, OPFS): quotas, eviction, iOS storage-clearing rules for PWAs vs Safari tabs. Then upload when signal returns (Background Sync support, or a manual retry pattern).
5. Permission behaviour: prompt timing, persistence across sessions, differences in installed iOS PWAs, and what the app sees when permission is denied.
6. Screen lock, app backgrounding and incoming calls during a recording or live preview.
7. Web Speech API (speech recognition) support, vs server-side transcription (e.g. OpenAI transcription API): reliability, English/Hebrew accuracy, privacy, cost per minute (dated).
8. HTTPS and secure-context requirements, Permissions-Policy headers, and what a reverse proxy or captive-portal Wi-Fi (such as a library's guest network) can break.

# USE CASES IN THIS GAME

- **Photo:** an inscription or plaque, a building feature, a present-day market scene compared with a dated archival photo, and a photo of a catalog request screen or a book's title page as evidence that a pair found the item.
- **Audio:** a pair's short spoken proposal for a dilemma, a short spoken observation, and the final family-memory recording (opt-in, private by default, never published automatically).
- **Constraints:** no sound and no recording in the Library reading halls. Never photograph or record bystanders or market vendors without consent. Each pair shares one phone. Each capture task needs an equal text or guide-confirmation path.

# OUTPUT

1. **Capability matrix**: rows are the 8 questions, columns the 5 platforms; each cell Yes / Partial / No with a one-line caveat and a citation.
2. **Recommended MVP implementation**: which APIs, in which order of fallback, with a short code-level sketch of the flow (no full code).
3. **Permission UX**: when to ask, the copy pattern, and behaviour when denied.
4. **Privacy and consent**: what to tell participants (including minors and recorded family members), on-device vs server storage, retention defaults and deletion, and the family-memory recording specifically. Mention the Israeli Privacy Protection Law (including its 2024–2025 Amendment 13) and GDPR only where a source supports the point.
5. **Known bugs and gotchas**: dated, with links to WebKit/Chromium bug trackers or release notes where possible.

**Source priorities:** MDN, WebKit blog and Safari release notes, Chrome/Chromium docs and release notes, Samsung Internet developer docs, caniuse.com, web.dev, and the browser bug trackers. Use blogs only to corroborate.

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
