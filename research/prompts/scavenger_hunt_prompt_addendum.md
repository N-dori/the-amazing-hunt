# ADDENDUM — Experience Engineering, Animated Puzzles, Media Assets, Camera, Audio and AI

Add these research requirements to the existing technical architecture brief for **DORI — The Memory Protocol**.

This addendum extends the previous requirements. Preserve all existing decisions about the illustrated map, progressive historical layers, self-hosted VPS, Docker deployment, team competition and historical evidence.

The goal is to specify **every user-facing experience component and supporting technical capability needed to build the actual game**.

Do not limit the analysis to infrastructure and mapping.

---

# 17. Complete game experience and screen inventory

Research and recommend the complete mobile-first UX architecture.

The game consists of these phases:

1. Welcome and preparation
2. Player registration and team joining
3. Science-fiction story introduction
4. National Library investigator certification
5. National Library evidence collection
6. Illustrated-map navigation
7. Physical-location discovery
8. Historical interpretation
9. Contemporary HARMONY crisis
10. Team proposal and feedback
11. Optional competitive puzzles
12. Historical map restoration
13. Rewards and progress
14. Final family-memory mission
15. Completion and evidence dossier

For **each phase**, define the screens, states and interactions required.

Consider:

- Welcome and splash screen
- Initial game briefing
- Mission acceptance
- Access code or QR-based joining
- Player/team registration
- Team naming
- Join existing game session
- Guide-controlled starting sequence
- Fictional incoming transmission
- Audio playback with subtitles
- Illustrated map
- Mission marker
- Destination preview
- Navigation clue
- Hint reveal
- External navigation
- Camera capture
- Audio recording
- Text answer
- Multiple-choice answer
- Historical-source viewer
- Hebrew translation support
- Interactive puzzle
- Crisis resolution
- Open-ended response
- HARMONY feedback
- Scoring summary
- Team leaderboard
- Historical-layer reveal
- Evidence inventory
- Reward redemption
- Final family conversation
- Personal memory capture
- Completion certificate
- Technical error/recovery screens

For each screen or state specify:

| Field | Required information |
|---|---|
| Screen ID | Unique identifier |
| Purpose | Why it exists |
| Known information | What the participant already knows |
| New information | What this screen introduces |
| UI components | Visual and interactive elements |
| Media | Image, illustration, animation, video, audio |
| Input | Text, photo, microphone, tap, choice, etc. |
| System response | What happens after interaction |
| Success trigger | What advances the game |
| Error/fallback | What happens if interaction fails |
| Scoring | Points and verification |
| Accessibility | Required alternatives |
| Content needed | Copy, sources, translations, answer key |
| Implementation complexity | Low / medium / high |

Do not create unnecessary screens. Preserve progressive disclosure: one important idea, question and action at a time.

---

# 18. Research animated and interactive puzzle technologies

The game should include a reusable library of visually engaging puzzles.

Some puzzles teach historical observation. Others provide logical or mathematical challenges purely for competitive enjoyment.

Research suitable technologies including:

- SVG and CSS animations
- React-based interactive components
- Motion for React
- GSAP
- Lottie
- Rive
- Konva.js
- PixiJS
- Lightweight Canvas interactions
- Simple HTML/CSS/JavaScript puzzles

Compare license requirements, mobile performance, responsiveness, accessibility, offline support, file sizes, React compatibility, authoring workflows and development complexity.

Assess whether each puzzle should use DOM/SVG, Canvas or an animation runtime.

## Puzzle A — The 3-liter and 5-liter water containers

Historical location: Gan HaTut water cistern.

Participants must measure exactly four liters using containers holding three and five liters.

Requirements:

- Two illustrated containers
- Animated fill, empty and pour actions
- Visible water levels
- Valid action constraints
- Clear reset button
- Optional hint
- Move counting
- Deterministic solution validation
- Optional bonus for an optimal solution
- Sound effects that can be disabled
- Accessible non-drag alternative

Research the simplest technical implementation.

Specify the mathematical state model and animation approach.

## Puzzle B — The Tomato Agreement

Historical inspiration: Rami Levy's retail business and the broader economic relationship between farmers, buyers and consumers.

Participants compare fictional purchase agreements with different guaranteed quantities, prices and risks.

Requirements:

- Illustrated tomato crates or produce quantities
- Adjustable offer parameters
- Revenue calculation
- A threshold-price question
- Immediate numeric feedback
- A subsequent human negotiation challenge

Research how to distinguish objectively correct arithmetic from a judgment-based business decision.

## Puzzle C — Evidence reconstruction

Participants assemble a historical clue from:

- Catalog identifier
- Source title
- Date
- Historical photograph
- Short passage or caption

Evaluate matching, ordering, drag-and-drop, and tap-to-select implementations.

Do not imply that reassembling these fields proves more than the sources establish.

## Puzzle D — Historical photograph comparison

Participants compare an archival image with a present-day location.

Consider:

- Before/after slider
- Image alignment
- Spot-the-difference
- Detail magnification
- Photo overlay
- Identify an architectural feature

Investigate alignment requirements and rights constraints.

## Puzzle E — Hebrew decoding

English-speaking visitors encounter selected Hebrew or Ladino terms.

Research:

- Letter-selection puzzles
- Right-to-left display
- Word matching
- Transliteration
- Optional pronunciation
- Progressive clues
- Small, readable source excerpts
- Avoiding dependence on fluent Hebrew

## Puzzle F — Visual-location hunt

Participants receive a cropped image of a building, sign, inscription, doorway or landmark.

They must identify it in the physical environment.

Research photo-based verification options, but do not assume automated computer vision is necessary.

## Puzzle G — Stakeholder negotiation

Participants receive a contemporary fictional crisis with several stakeholders and limited resources.

They propose a balanced arrangement.

Research an interaction combining:

- Stakeholder cards
- Needs and constraints
- Resource allocation
- Consequence preview
- Short written explanation
- Optional HARMONY feedback

Do not reduce moral judgments to an arbitrary single correct answer.

## Required output

For every puzzle provide:

1. Educational or entertainment purpose
2. Interaction design
3. Illustrated assets required
4. Animation assets required
5. Recommended rendering technology
6. State model
7. Answer-validation method
8. Hint logic
9. Scoring approach
10. Mobile interaction constraints
11. Accessibility alternative
12. Estimated development complexity
13. Reusability across future DORI games

Identify which puzzle components should be developed as reusable templates.

---

# 19. Visual, audio and animation asset production

Create a complete asset-production plan.

The DORI visual identity must remain restrained, warm, editorial and culturally grounded.

Do not recommend a generic neon science-fiction game aesthetic.

Separate **reusable system assets** from **mission-specific assets**.

## Reusable visual assets

Investigate the requirements for:

- Welcome screen background
- Main Memory Protocol identity
- HARMONY transmission design
- Israelianes spacecraft illustration
- Parallel Earth imagery
- Team identification
- Investigator credential
- Evidence dossier
- Illustrated Jerusalem map
- Map markers and state variations
- Historical restoration overlays
- Puzzle illustrations
- Hint icons
- Audio controls
- Loading states
- Success and failure feedback
- Score indicators
- Reward icons
- Completion certificate
- Guide dashboard

## Mission-specific assets

Produce an asset inventory for the following planned activities.

### National Library

- Letters of Light
- Reading-hall architecture
- The Library catalog and MARC identifiers
- Robotic book retrieval
- Broken Time
- National Library illustrated timeline
- Cypresses
- Physical book investigation

### Nahlaot

- Hesed VeRahamim Synagogue
- The Armoza family historical source
- Gan HaTut
- Water cistern
- Montefiore inscriptions
- Ohel Moshe
- Picture in Stone
- Rabbi Aryeh Levin
- Batei Goral

### Mahane Yehuda

- The Beauty Queen of Jerusalem / borekitas
- Rami Levy's original shop location
- Historical market photographs
- Farmer and retailer negotiation
- Market affordability
- Rahamim and charitable giving
- Yemenite food traditions
- Rugelach and other verified culinary stories

For each proposed asset, indicate:

- Exact purpose
- Whether it should be photographed, illustrated, animated or sourced from an archive
- Whether its existence and location are verified
- Required resolution and aspect ratios
- Rights and attribution
- Reusability
- Priority
- Estimated preparation effort

## Media formats and optimization

Compare:

- SVG
- WebP
- AVIF
- PNG
- JPEG
- Lottie JSON
- Rive files
- MP4/WebM
- MP3/AAC/Opus

Recommend format choices for:

- Illustrated map
- Transparent historical overlays
- Destination photographs
- Animated puzzle objects
- Video clues
- Voice narration
- Ambient sound
- Short HARMONY transmissions

Specify mobile file-size targets and offline-caching strategy, explaining assumptions.

## Audio production

Investigate:

- Human-recorded narration
- Text-to-speech
- Prerecorded AI voice narration
- Contextual sound effects
- Multi-language audio
- Subtitles and transcripts
- Background-audio limitations on mobile
- Mute and volume controls

Avoid audio that requires playing sound aloud inside Library reading rooms.

---

# 20. Camera, microphone and media permissions

Research precisely what is possible inside a mobile web application or PWA.

Target devices:

- iPhone Safari
- Installed iPhone PWA
- Android Chrome
- Installed Android PWA
- Samsung Internet

Answer these questions:

1. Can the game open the device camera from a button?
2. Can it launch the native camera interface?
3. Can it show a live camera preview inside the game?
4. Can it capture photographs without leaving the game?
5. Can it use the microphone for audio recording?
6. Can users record and replay their response before submission?
7. Can photos and recordings be stored temporarily offline?
8. What happens if permissions are denied?
9. What happens when the phone screen locks or the app moves to the background?
10. Which browser and operating-system limitations apply?

Compare:

- HTML file input with capture attribute
- MediaDevices.getUserMedia()
- Canvas photo capture
- MediaRecorder
- Native file picker fallback
- Web Speech API
- Server-side transcription

Specify HTTPS, permission, data-retention and user-consent requirements.

Recommend the simplest reliable implementation for the MVP.

### Camera use cases

- Photograph an inscription
- Photograph a destination feature
- Capture an observed market detail
- Submit optional visual evidence
- Compare current and historical photographs

Do not require camera access for every challenge.

### Microphone use cases

- Record a proposed solution to HARMONY
- Record a family memory
- Record a short spoken observation
- Record a consenting participant's testimony

Recording must always be intentional, visible and user-controlled.

Provide an equivalent text-input path.

---

# 21. OpenAI API integration for HARMONY responses

Investigate whether OpenAI's API should be used to provide interactive feedback on open-ended player responses.

The AI should function as **HARMONY**, the fictional system learning to understand human disagreement and historical complexity.

It must not act as an unquestionable judge of morality.

## Proposed interaction

A team submits a proposal for resolving a fictional contemporary crisis.

Example:

A building's residents disagree about the costs and operating hours of a Shabbat elevator.

The team proposes an agreement, explaining how its historical investigation at Gan HaTut informed the response.

HARMONY then:

1. Identifies the main stakeholders mentioned.
2. Recognizes which needs were considered.
3. Identifies possible overlooked needs.
4. Distinguishes historical evidence from new assumptions.
5. Asks one useful follow-up question.
6. Provides short, encouraging, intellectually serious feedback.
7. Updates its fictional understanding of human disagreement.

## Research technical design

Evaluate:

- OpenAI Responses API
- Structured Outputs / JSON Schema
- Prompt templates
- Model selection
- Context management
- Mission-specific rubrics
- Approved historical-source retrieval
- Moderation
- Rate limiting
- Caching
- Latency
- Token and cost budgets
- Server-side API-key protection
- Data retention and privacy
- Offline fallback
- Manual guide review

## Required output format

Investigate structured responses containing fields such as:

- Historical_evidence_used
- Stakeholders_identified
- Needs_considered
- Tradeoffs_recognized
- Unsupported_assumptions
- Missing_perspectives
- Suggested_followup_question
- Harmony_character_response
- Needs_guide_review

Design a validated schema and error-handling approach.

## Crucial constraints

- Never let the model invent historical facts.
- Supply a bounded, approved source packet for each mission.
- Keep fictional events clearly separated from history.
- Do not present subjective political or moral judgments as objective scoring.
- Do not send API keys from the browser.
- Do not award points merely because an AI response sounds persuasive.
- Do not let the AI independently change official scores or unlock conditions.
- Do not require continuous internet access to complete the game.
- The guide must be able to override or review uncertain outcomes.

## Compare three alternatives

**Option A — Fully scripted feedback**

No API required. Responses are selected from predefined feedback paths.

**Option B — AI-assisted feedback**

Players submit an answer; deterministic rules govern game progression while the model generates contextual feedback.

**Option C — AI-assisted evaluation plus guide review**

The model analyzes the answer against a rubric. The guide confirms any scored evaluation.

Evaluate technical complexity, fairness, learning value, operational cost and reliability.

Recommend a solution for the pilot and a potential longer-term product.

---

# 22. AI-generated narration and adaptive characters

Investigate whether HARMONY should have a visual identity, a voice and limited conversational behavior.

Possible features:

- Prerecorded emergency transmissions
- Text-to-speech responses
- Context-sensitive dialogue
- Animated transmission effects
- One-question-at-a-time conversations
- Mission-completion narration

Compare prerecorded content with dynamic generation.

Determine whether dynamic audio or live voice interaction would meaningfully improve the experience or introduce excessive complexity and cost.

Recommend how to ensure consistent personality, tone, historical accuracy and response length.

Include accessibility and participant privacy.

---

# 23. Production plan, priorities and acceptance criteria

Organize the entire product into practical development stages.

## Stage 1 — Minimal playable prototype

The pilot should support:

- Welcome screen
- Join team
- Illustrated map
- Three clickable missions
- Destination photographs and clues
- External navigation fallback
- Text answers
- One photo capture task
- One interactive water puzzle
- One contemporary HARMONY crisis
- Prewritten feedback
- Team scores
- Historical overlay reveal
- Guide controls
- VPS + Docker deployment

## Stage 2 — Extended family game

Add:

- Full National Library task flow
- Physical/digital evidence alternatives
- Additional Nahlaot and market missions
- Additional animated puzzles
- Voice narration
- Audio recording
- More sophisticated rewards
- Family-memory capture
- Improved offline functionality

## Stage 3 — AI-supported experience

Add only after controlled testing:

- GPT-generated feedback
- Mission-specific rubrics
- Guide-reviewed analysis
- AI narration where beneficial
- Cost controls and evaluation tests

## Required final deliverables

In addition to the previous technical research deliverables, provide:

### A. Complete screen inventory

All screens, states, actions and triggers.

### B. Interaction-component catalogue

Reusable UI and game components.

### C. Animated puzzle feasibility matrix

Technology, effort, assets, scoring and mobile constraints.

### D. Asset production register

Every illustration, photograph, animation, audio file and video required.

### E. Camera and microphone implementation plan

Browser support, permission UX, privacy and fallback behavior.

### F. OpenAI API architecture

Backend flow, request/response schema, prompt safety, evaluation, cost and failure handling.

### G. UX prototype specification

Clickable flow for the three planned Jerusalem pilot missions.

### H. Docker deployment consequences

Explain how the new media, AI and puzzle capabilities affect VPS sizing, upload storage, reverse-proxy limits, backups, API secrets and monitoring.

### I. Dependency and effort map

Identify what must be prepared before development, what can be built independently, and which components are reusable.

### J. Acceptance tests

Include tests for camera-denied, microphone-denied, network-offline, missing source, incorrect answer, invalid AI response, device refresh and guide override.

### K. Cost and risk analysis

Add API inference costs, audio transcription, image storage, bandwidth, animation production and media asset preparation to the original hosting estimates.

### L. MVP recommendation

Choose the smallest set of features that produces a complete and enjoyable game, not merely a technical demonstration.

**Final goal: Build a reusable, beautiful, self-hosted experience platform in which historical investigation, physical discovery, illustrated navigation, puzzles and thoughtful human decisions form one coherent adventure.**