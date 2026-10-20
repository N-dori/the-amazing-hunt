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
