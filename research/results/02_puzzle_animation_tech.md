# 02_puzzle_animation_tech.md

- **Asked:** 2026-10-16T00:36:41.451Z
- **Preset:** `high` (Perplexity Agent API) · run `resp_f443cd3c-1a97-4db9-8af8-6c22698db857` · completed
- **Cost:** 0.76225

> True as of the date above. Re-run the prompt rather than quoting this file as current.

## Answer

# The Memory Protocol: rendering decision for the October 2026 pilot

**Recommendation — INFERRED:** Build all seven pilot puzzles with **ordinary React DOM controls, small illustrated SVGs and CSS transitions**. Use no Canvas engine or animation runtime in the pilot. Keep puzzle rules and scoring in pure functions, separate from rendering; introduce **Motion** later only if a tested interaction genuinely needs it. This fits three phones, short tasks, quiet Library play and a small self-hosted PWA better than building miniature game scenes. A January 2026 cross-device benchmark found DOM animation stable at 100 objects but degraded by 500; these puzzles should have far fewer moving objects. That is evidence for *testing this choice*, not a measured frame-rate guarantee on the family’s phones. [web:219][web:202]

**Assumptions — INFERRED:** DORI controls the game’s original illustrations and text; the example catalog number and shelf mark are **test data, not verified answers**; each pair can finish locally during a signal loss, while shared-dossier and guide-score updates wait to synchronize. Fictional HARMONY messages remain visibly labelled **Fiction**, and catalog facts, interpretations and attributed guide stories receive distinct labels.

## 1. Technology comparison

**Reading the table:** Assessments and quoted prices are **as checked by 16 October 2026**, unless a more specific date appears. Sizes are **additional minified-and-gzipped JavaScript**, not a prediction of the finished Next.js route: image files, animation files, WASM, React already in the app, and tree-shaking can change the total. **UNKNOWN** means no reliable pilot-device measurement or comparable package figure was established—not that the technology is slow. For any row, “offline” means assets are self-hosted **and cached before departure**; merely installing a PWA does not cache every puzzle. [web:187][web:194]

| Option | License and cost | Bundle size (min+gzip) | Mid-range Android performance | React 19 / Next.js compatibility, including server components and SSR | Accessibility: screen readers, keyboard, reduced motion | Offline use | Non-developer illustrator workflow | Development complexity |
|---|---|---|---|---|---|---|---|---|
| **SVG + CSS animation** | **OBSERVED:** Browser platform features; no rendering-library fee. Artwork rights remain a separate question. [web:205] | **INFERRED:** **0 KB library JS**; each SVG/CSS asset still has a size. [web:205] | **INFERRED:** Good fit for a few vessels, letters or indicators; animate transforms/opacity preferentially, not layout. **UNKNOWN:** pilot-phone FPS. [web:202][web:219] | **INFERRED:** Inline SVG can render with server HTML; interactive controls belong in a Client Component. [web:205] | **OBSERVED:** Inline SVG supports accessible titles/descriptions, but put operable actions in labelled controls; suppress nonessential animation for reduced motion. [web:205][web:76] | **INFERRED:** Yes, if SVG/CSS is served and precached locally. [web:187] | **INFERRED:** Illustrator delivers optimized, layered SVG and a static state sheet; developer wires changing levels/states. [web:205] | **INFERRED:** **Low–Medium**. |
| **Plain React DOM components** | **INFERRED:** No *additional* rendering-library license or fee beyond the app’s React stack. | **INFERRED:** **0 KB incremental rendering library**; application code and existing React/React DOM still count. | **INFERRED:** Best default for these few controls; avoid rerendering on every animation frame. **UNKNOWN:** actual device timings. [web:219][web:202] | **INFERRED:** Server-render instructions and evidence; isolate sliders, buttons and local state in Client Components. | **INFERRED:** Native buttons, inputs and text provide the clearest screen-reader and keyboard path; application authors must supply labels, focus handling and reduced-motion styling. [web:116][web:76] | **INFERRED:** Yes after routes, data and assets are cached; persist unfinished answers locally. [web:187][web:193] | **INFERRED:** Illustrator supplies static SVG/images and typography guidance; developer implements interaction. | **INFERRED:** **Low**. |
| **Motion, formerly Framer Motion** | **OBSERVED:** MIT, free core; commercial use permitted. [web:60][web:67] | **OBSERVED:** Official Rollup examples: `LazyMotion` initial render **just over 5 KB**, full `motion` component **43 KB**; actual Next/Webpack output varies. These are different imports, not competing measurements of one bundle. [web:65] | **INFERRED:** Suitable for a handful of DOM/SVG transitions; excessive animation still costs paint or layout. **UNKNOWN:** pilot-device FPS. [web:89][web:202] | **OBSERVED:** Supports React ≥18.2, App Router Client Components and `motion/react-client`; initial animated state can be SSR output. [web:91][web:89] | **INFERRED:** Preserves DOM/SVG semantics when used on semantic elements; keyboard behavior remains the developer’s job. Honor reduced motion. [web:89][web:76] | **INFERRED:** Yes, when the selected package chunks are precached. [web:187] | **INFERRED:** Illustrator supplies assets and motion examples; implementation is chiefly code, not an illustrator-authored state machine. | **INFERRED:** **Medium**; unnecessary for pilot-scale fills and reveals. |
| **GSAP** | **OBSERVED:** Since **30 April 2025**, all plugins are free for commercial *permitted uses*. Its Webflow-owned **custom “no charge” license is not MIT** and excludes specified competing no-code visual-animation builders. This game appears permitted; retain a license review for future products. [web:3][web:4] | **OBSERVED:** Motion’s comparison quotes **23.5 KB** for GSAP core; a September 2026 published-tarball measurement gives **28.3 KB gzip** for `dist/gsap.min.js`. **INFERRED:** Different measurement inputs/methods; budget for the measured import, not either number as a universal total. [web:60][web:59] | **INFERRED:** Strong for elaborate timelines, with no demonstrated advantage for six water-jug moves. Avoid paint-heavy properties. [web:202] | **OBSERVED:** `@gsap/react`’s `useGSAP` handles cleanup; App Router usage requires a Client Component. [web:176] | **INFERRED:** Animating real DOM retains its underlying semantics; GSAP supplies neither puzzle keyboard rules nor reduced-motion policy. [web:176][web:76] | **INFERRED:** Yes when code/plugins are bundled locally. [web:187] | **INFERRED:** Illustrator storyboards; developer builds timelines. | **INFERRED:** **Medium**, plus custom-license review. |
| **Lottie: `lottie-web` / dotLottie** | **OBSERVED:** Both runtimes are MIT. **Separate asset/service terms matter:** LottieFiles says its Free and Individual service plans are noncommercial; Team, **$24.99/user/month billed annually**, permits commercial projects. Its *public downloadable animations* instead fall under the Lottie Simple License, which permits commercial use but attaches its own distribution terms. [web:172][web:163][web:232][web:29][web:235] | **OBSERVED:** `lottie-web` **75 KB** at Bundlephobia’s listed version; official dotLottie **React player 45 KB**. **Critical omission from either JS figure:** dotLottie’s renderer WASM is approximately **500 KB compressed** and must load before drawing. [web:44][web:303][web:351] | **INFERRED:** Useful for brief illustrated flourishes, not necessary for numeric game state; measure asset complexity and first-animation delay. [web:290][web:351] | **INFERRED:** Mount players in a Client Component; SSR supplies a labelled static placeholder rather than the running animation. dotLottie’s official React player supports `.lottie` and JSON. [web:311] | **INFERRED:** Supply separate semantic controls/text and a still frame for reduced motion; do not make a visual animation the sole answer. [web:170][web:76] | **OBSERVED:** Possible with self-hosted files and WASM; dotLottie defaults to a CDN WASM fetch unless `setWasmUrl()` is configured before rendering. [web:345][web:347] | **OBSERVED:** After Effects and Figma export workflows exist, but supported-feature warnings must be checked. DotLottie can carry interactive state machines; exporting the same Figma work as plain JSON removes that interactivity. [web:289][web:295][web:301] | **INFERRED:** **Medium–High**, especially for licensing, export QA and offline WASM. |
| **Rive** | **OBSERVED:** Runtimes are MIT, with no runtime fee. Official **29 September 2026** announcement says exports moved to paid plans: Cadet **$9/seat/month annually**, **$17 monthly**. **Conflicting official evidence:** the pricing page checked in October advertises **Free `.riv` export with a splash screen**, Cadet **$9**, Voyager **$32**, and Enterprise **$120/seat/month**; its billing display is ambiguous. Budget for Cadet and confirm export terms before commissioning. [web:20][web:334] | **OBSERVED:** Bundlephobia reports **62.8 KB** for `@rive-app/react-canvas`, **excluding the separately fetched WASM and `.riv` file**. [web:304][web:180] | **INFERRED:** Capable state-machine renderer, but startup and canvas lifecycle are unnecessary risks here. **UNKNOWN:** pilot-phone FPS. [web:178] | **OBSERVED:** React runtime exists; keep its canvas mounted in a dedicated wrapper. **INFERRED:** Use a client-only interactive boundary and an SSR text/still fallback. [web:338][web:178] | **OBSERVED:** Editor-authored semantics and a React opt-in exist, but semantics are **Early Access/experimental** and unmarked elements are not exposed. Keep equivalent DOM controls. [web:182] | **OBSERVED:** Self-host `.riv` **and matching-version WASM**; the React runtime otherwise fetches WASM from unpkg. Exports already shipped keep working without a subscription. [web:180][web:20] | **OBSERVED:** Illustrator/Figma SVG can become editable Rive shapes; some SVG effects do not import. Illustrator must also learn timelines/state machines. [web:331][web:343] | **INFERRED:** **High** for this pilot. |
| **Konva.js / `react-konva`** | **OBSERVED:** MIT, no license key or runtime fee. [web:248][web:260] | **OBSERVED:** Best of JS lists **109 KB gzip** for the React Konva project; imports and Konva shape selection can alter a production build. [web:231] | **INFERRED:** Appropriate if a later game has many interactive canvas objects; no demonstrated benefit for these seven small tasks. [web:219] | **OBSERVED:** `react-konva` major version must match React’s; Konva 10+ works with Next.js without older canvas setup, in a Client Component. Canvas shapes are not server-rendered HTML puzzle controls. [web:99][web:207] | **OBSERVED:** Shapes are not DOM elements found by Testing Library. **INFERRED:** Mirror all operable information/actions in DOM, including keyboard and reduced-motion behavior. [web:100][web:175] | **INFERRED:** Yes when packages and illustrations are local and cached. [web:187] | **INFERRED:** Illustrator exports images/vectors; developer builds scene, hit areas and DOM equivalent. | **INFERRED:** **High** relative to pilot needs. |
| **PixiJS** | **OBSERVED:** MIT, free. [web:247] | **OBSERVED:** Best of JS lists **263 KB gzip** for its project listing; **UNKNOWN:** a comparable, tree-shaken bundle for this particular puzzle implementation. [web:217] | **OBSERVED:** WebGL is its production-recommended renderer; WebGPU remains browser-inconsistent. **INFERRED:** Its throughput advantage is relevant to much larger scenes, not these puzzles. [web:133][web:219] | **OBSERVED:** PixiJS React integration requires React 19+. Browser setup is imperative/asynchronous. **INFERRED:** mount inside a Client Component; SSR a separate DOM fallback. [web:262][web:134] | **INFERRED:** Drawn content needs a maintained DOM text/control equivalent and a reduced-motion mode. [web:175][web:76] | **INFERRED:** Yes with precached scripts, textures and route data; test graphics-context recovery. [web:187][web:133] | **INFERRED:** Illustrator supplies sprites/textures; developer builds scenes and interactions. | **INFERRED:** **High**. |
| **Plain Canvas 2D** | **OBSERVED:** Browser API; no rendering-library fee. [web:175] | **INFERRED:** **0 KB library JS**; drawing, hit testing and accessible UI are application code. [web:175] | **OBSERVED:** The 2026 benchmark found canvas usable at higher object counts than DOM. **INFERRED:** That does not justify it for this small UI. [web:219] | **INFERRED:** Client draws after mount; SSR a separate textual/still representation. [web:175] | **OBSERVED:** Canvas is a bitmap, not semantic HTML; provide fallback or parallel DOM and controls. [web:175][web:170] | **INFERRED:** Yes if scripts and artwork are cached. [web:187] | **INFERRED:** Illustrator supplies raster/vector artwork; developer writes rendering and input mapping. | **INFERRED:** **Medium–High**. |

## 2. Pilot puzzle decisions

**Common rules — INFERRED:** Render one question and action at a time. Make important tap targets approximately **44 × 44 CSS px where space allows**—above WCAG 2.2’s 24 × 24 minimum—and provide a tap/keyboard route for every drag action. Offer an in-app motion and sound setting as well as respecting `prefers-reduced-motion`. Do not require location, camera, live Library-network access or recording to complete any puzzle. [web:118][web:124][web:374][web:76]

| Puzzle | Rendering approach | Recommended library | State model in one line | Validation method | Hint logic | Mobile touch constraints | Accessible alternative | Complexity |
|---|---|---|---|---|---|---|---|---|
| **A. Water containers** | **INFERRED:** DOM controls plus illustrated SVG vessels; short CSS level/pour transitions. | **INFERRED:** React + SVG/CSS; no animation runtime. | **INFERRED:** `(a,b,moves,hints,status,soundOn)` with `0≤a≤3`, `0≤b≤5`; moves `{fill3,fill5,empty3,empty5,pour3→5,pour5→3}`; a pour transfers `min(source, destinationCapacity−destinationLevel)` and no-op moves are disabled. | **INFERRED:** Pure reducer enforces moves and wins at `b=4`; breadth-first search confirms the six-move optimum. Example six moves: fill5 → pour5→3 → empty3 → pour5→3 → fill5 → pour5→3, ending `(3,4)`. Award the optimum bonus only at six valid moves; reset starts a new attempt. | **INFERRED:** At current `(a,b)`, BFS gives one legal next move on a shortest remaining path; reveal it and deduct ~2 points once per requested hint. | **INFERRED:** Big named **Fill / Empty / Pour into…** buttons; lock rapid repeat taps during a transition, but commit state immediately; sound defaults to off in the quiet Library. | **INFERRED:** Same labelled buttons, numeric “3 L: 3; 5 L: 4” status and restrained live announcement; instant level changes with reduced motion. | **Medium** |
| **B. Tomato deal** | **INFERRED:** DOM form, text revenue comparison and optional simple SVG bars. | **INFERRED:** React with native range **and numeric inputs**. | **INFERRED:** `(Q,marketPrice,buyerPrice,share,targetRevenue,answer)`; compute sold quantity `sQ`, remaining quantity `(1−s)Q`, and revenue `sQ·buyerPrice+(1−s)Q·marketPrice`. | **INFERRED:** Score only stated arithmetic and the threshold against a **specified target revenue**: if `s>0`, `buyerPrice_min=[targetRevenue−(1−s)Q·marketPrice]/(sQ)`; if `s=0`, mark threshold not applicable. State explicitly that selling the remainder at the displayed market price is a hypothetical assumption. | **INFERRED:** First show “quantity × price,” then isolate the guaranteed-buyer and remaining-crop terms; hints cost ~2. | **INFERRED:** Sliders need labelled values, sensible steps and separate typed number fields; never rely on fine thumb placement. | **INFERRED:** Number inputs, readable scenario table and keyboard-operable sliders; discussion follows separately. [web:116] | **Low–Medium** |
| **C. Evidence reconstruction** | **INFERRED:** DOM cards and form fields; visual sorting is enhancement only. | **INFERRED:** React; reusable tap-to-select/match component. | **INFERRED:** `(recordId,shelfMark,title,date,passageFact,sourceRef,selections)`; keep identifier as a **string**, never a JavaScript number. | **INFERRED:** Match and ordering checks compare against a curator-verified record; the passage fact and provenance need source review or guide confirmation, not a guessed answer key. `990035772790205171` is illustrative until verified. | **INFERRED:** Reveal record type, then where to find identifier, then one field distinction; penalize per reveal. | **INFERRED:** Tap source then destination; large cards and no timed reading-hall interaction. | **INFERRED:** Labelled fields and **Select item → Select destination**, plus Move up/down for ordering; do not require drag. [web:124] | **Medium** |
| **D. Photo comparison** | **INFERRED:** Two responsive images in DOM with CSS clipping and a **native range** reveal control; no pixel-processing Canvas. | **INFERRED:** React + CSS. | **INFERRED:** `(archiveAssetId,presentAssetId,revealPercent,chosenFeature,sourceCredit)`. | **INFERRED:** Score a curated, observable change with an answer key; never infer a historical claim merely from pixels. | **INFERRED:** Direct attention to one region, then offer two possible features. | **INFERRED:** Large handle, avoid page-scroll hijacking; include **Before / After** buttons. | **INFERRED:** Individually labelled images, textual descriptions of the relevant change, range keyboard controls and a text-choice answer. [web:116][web:378] | **Medium** |
| **E. Letters and languages** | **INFERRED:** DOM letter choices plus static SVG illustrations; real RTL text, not text baked into animation. | **INFERRED:** React + SVG/CSS. | **INFERRED:** `(script,displayWord,transliteration,selectedLetters,pronunciationEnabled)`; curated answer mappings. | **INFERRED:** Verify each spelling, direction, transliteration and optional audio with a competent language reviewer; score selections, not accent. The Library describes Hebrew alef, Arabic alif and Latin A together at *Letters of Light*. [web:273] | **INFERRED:** Show script label, then first grapheme/reading direction, then transliteration; charge per hint. | **INFERRED:** Large isolated choices; set `dir` per text span and test mixed English/Hebrew/Arabic/Ladino punctuation. | **INFERRED:** Written names and transliterations, keyboard choices, optional captioned pronunciation; audio never required. | **Medium** |
| **F. Visual-location hunt** | **INFERRED:** Responsive cropped image in DOM and a typed/tap answer; no computer vision. | **INFERRED:** React + image/CSS. | **INFERRED:** `(clueAsset,siteId,answer,guideConfirmed,hints)`. | **INFERRED:** Match a stable site detail against a curated answer, or accept guide confirmation if obscured or inaccessible. | **INFERRED:** Widen the crop, then give a non-location-bearing textual landmark cue. | **INFERRED:** No GPS-only unlock or compulsory camera; safely stop before examining an entrance or inscription. | **INFERRED:** Text description/clue and typed answer or guide confirmation, with an equivalent achievable task if visual identification is inaccessible. [web:378] | **Low** |
| **G. Stakeholder dilemma** | **INFERRED:** DOM cards, allocation inputs, consequence text and short rationale field. | **INFERRED:** React forms; no animation library. | **INFERRED:** `(stakeholderNeeds,constraints,allocation,preview,rationale,guideRubricScore)`; guide score stored separately. | **INFERRED:** App checks only mechanical constraints, such as budget totals; **guide scores reasoning up to 20**, not whether players chose one morally “correct” allocation. | **INFERRED:** Prompt one overlooked constraint or stakeholder; no “best moral answer” hint. | **INFERRED:** Tap-to-assign or number fields instead of drag; save draft; no speed score. | **INFERRED:** Fully labelled cards/forms and readable consequence summary; guide may transcribe an oral rationale with consent. | **Medium** |

For **D**, using an archival photograph in a paid tour is a **rights decision separate from rendering**. **OBSERVED:** NLI says to check the individual record’s **“Possible uses”** and required credit; different collection records have different permissions. Do not precache a chosen photograph until its rights are cleared. [web:317][web:327]

## 3. Reusable templates

| Component | Future-game contract | Pilot uses |
|---|---|---|
| **INFERRED — `ChoiceMatchOrder`** | Data-defined source items, destinations and answer validator; tap-select first, with optional drag enhancement; move-up/down and announcements. The tap route satisfies the non-drag requirement. [web:118][web:124] | C, E; stakeholder-card placement in G. |
| **INFERRED — `EvidenceField`** | `value`, `sourceRef`, `sourceType` (**Fact / Interpretation / Fiction / Attributed story**), verification status and guide-confirmation flag; preserve identifier strings. | C and every later evidence-backed stop. |
| **INFERRED — `ImageCompare`** | Two credited, rights-cleared assets; native range, Before/After buttons, descriptions and a separately scored question. [web:116][web:378] | D; future streetscape comparisons. |
| **INFERRED — `SequencedHint`** | Ordered disclosures, per-hint cost, persistent count and a content-neutral scoring event; never assumes that speed matters. | A–F; carefully limited prompts in G. |
| **INFERRED — `ScenarioWorksheet`** | Numeric constraints and calculation output **separate** from consequence preview, written rationale and guide-rubric result. | B and G; future economics/civic dilemmas. |

**Offline implementation — INFERRED:** Precache the pilot route, fonts, approved images, SVGs and puzzle data before leaving reliable service; save each pair’s event log and evidence draft in IndexedDB, then reconcile on the VPS with stable pair/event IDs. Make guide confirmation available without a connection and show **saved locally / synchronized** distinctly. A service worker can serve cached assets offline; IndexedDB is the appropriate browser store for structured local data. Neither caching nor reconciliation grants offline access to Library-only material that was never lawfully available to the app: collect or verify that fact while on the Library network and retain only permitted notes/provenance. [web:187][web:193]

## 4. Scoring B and G without turning judgement into an answer key

| Puzzle | Observed educational-game example | Recommended scoring boundary |
|---|---|---|
| **B — tomato deal** | **OBSERVED:** PBS NOVA’s *Financial Lab* has bounded budgeting and financial mini-games **and** accompanying teaching material with discussion questions; its description does **not** establish that every personal decision has one objectively correct score. [web:104] | **INFERRED:** Award optional-puzzle points for reproducible revenue/threshold calculations under the displayed assumptions. Record the separate risk, dependence and bargaining discussion for the guide rubric; do not reward choosing either the fictional buyer or open market. |
| **G — stakeholder dilemma** | **OBSERVED:** iCivics’ *People’s Pie* asks players to balance taxes, funding and borrowing; its developer describes reviewing fiscal outcomes **and** evaluating policy trade-offs. A published player-impact guide awards reflection points for explaining difficult choices, illustrating that explanation can be assessed separately from an in-game fiscal balance—not proof that the game itself automates ethical scoring. [web:150][web:154][web:146] | **INFERRED:** Let the app check `sum(allocation) ≤ available resources` and expose consequences as **modelled possibilities**, labelled Fiction/Scenario. The guide awards up to 20 for recognizing stakeholders, citing constraints/evidence, explaining trade-offs and responding to a counterargument; no timer or automated “ethical optimum.” |

## 5. Strongest case against the recommendation

**OBSERVED:** The January 2026 cross-device benchmark reports notable DOM-animation degradation by **500 objects**; Canvas lasts longer and WebGL is most stable at very large counts. **INFERRED:** The recommendation would be wrong if artwork expands into hundreds of independently animated droplets, letters or photo hotspots—or if CSS fill effects trigger extensive repaint on the actual Android devices. Prototype A and D early, record frame times and long tasks on the oldest available pilot phone, and move **only the failing visual layer** to Canvas/Konva if necessary while retaining DOM controls. [web:219][web:202]

**OBSERVED:** A stronger illustrator-authoring argument also exists against code-driven SVG: Rive accepts editable Illustrator SVG and has state machines. But its September announcement and October pricing page **disagree about free exports**, its accessibility semantics are Early Access, and its default WASM fetch needs deliberate self-hosting for this PWA. Those are concrete pilot risks, not reasons to rule Rive out forever. Conversely, an “abandoned since 2024” claim about Motion is unsupported: its repository showed commits on **15 October 2026**. [web:331][web:20][web:334][web:182][web:180][web:364]

## What remains unknown

| Unknown | Test or source that would settle it |
|---|---|
| **UNKNOWN — Actual load time, frame pacing and battery use** on the three pilot phones. | Profile A’s pour sequence and D’s image reveal on the oldest available Android, in Chrome with CPU throttling and an offline reload; compare DOM prototype with an isolated Canvas prototype only if it fails. |
| **UNKNOWN — A production Next.js chunk size** for each optional runtime; published figures mix versions, imports and measurement methods. | Lock package versions and inspect the built route’s JS, WASM and media transfer sizes; test cold and repeat loads. [web:65][web:351] |
| **UNKNOWN — Which Rive free-export rule governs a new DORI project** given contradictory official pages. | Obtain written confirmation from Rive for account, export date and intended self-hosted commercial use; otherwise budget Cadet. [web:20][web:334] |
| **UNKNOWN — Whether the example Library number and shelf mark refer to the intended item, and which fact its passage supports.** | Retrieve the actual catalog record and book on site; have the guide record exact title, page/passage, identifier, shelf mark and permitted provenance note. |
| **UNKNOWN — Rights to the particular archival market image and adequacy of a same-view present-day photograph.** | Check that NLI item’s “Possible uses,” secure permissions/credit if required, then photograph an uncrowded view without identifiable people—or substitute licensed imagery. [web:317] |
| **UNKNOWN — Whether each route works entirely through a signal loss and the Library-network transition.** | On all three installed PWAs, precache, turn on airplane mode at each stop, complete and restart every puzzle, then reconnect and verify duplicate-free dossier/guide-score synchronization. [web:187] |
| **UNKNOWN — Hebrew, Arabic and Ladino wording, audio consent and screen-reader behavior on the actual devices.** | Obtain language review; test mixed-direction strings, transliterations and optional audio with English/Hebrew mobile screen readers and keyboard/switch access. |

## Source register

Dates below are publication dates where given, otherwise the **page’s indexed update/check date, no later than 16 October 2026**. A register entry identifies the cited evidence; it does not imply that all linked prices or licenses will remain unchanged.

| Publisher | Date | URL | Used for | Primary/official or secondary |
|---|---|---|---|---|
| Webflow / GSAP [web:3][web:4] | 30 Apr 2025; checked Oct 2026 | https://gsap.com/community/standard-license/ ; https://gsap.com/blog/3-13/ | Post-acquisition commercial license and plugins | Primary/official |
| GSAP [web:176] | Checked 11 Oct 2026 | https://gsap.com/resources/React/ | React cleanup, Next client boundary | Primary/official |
| Motion [web:60][web:65][web:89][web:91] | Checked 14–15 Oct 2026 | https://motion.dev/docs/gsap-vs-motion ; https://motion.dev/docs/react-reduce-bundle-size ; https://motion.dev/docs/react-motion-component ; https://motion.dev/docs/react-installation | MIT, measured import sizes, SSR and React support | Primary/official; comparison figures are vendor-reported |
| Motion/GitHub [web:364] | 15 Oct 2026 | https://github.com/motiondivision/motion/commits | Maintenance activity | Primary repository |
| Bundlephobia [web:44][web:304] | Checked 12–15 Oct 2026 | https://bundlephobia.com/package/lottie-web ; https://bundlephobia.com/package/@rive-app/react-canvas | Package min+gzip estimates | Secondary measurement |
| Best of JS [web:231][web:217] | Checked Sep–Oct 2026 | https://bestofjs.org/projects/react-konva ; https://bestofjs.org/projects/pixijs | Project bundle-size listings | Secondary measurement |
| Published-tarball comparison [web:59] | 21 Sep 2026 | https://www.shipgarden.com/gallery/gsap-vs-framer-motion-vs-react-spring-nextjs-animation-2026 | Alternative GSAP size and method | Secondary |
| LottieFiles [web:29][web:232][web:235] | Checked Sep–Oct 2026 | https://lottiefiles.com/pricing ; https://help.lottiefiles.com/commercial-use-guide ; https://lottiefiles.com/page/license | Plan prices, commercial-service terms, public-asset license | Primary/official |
| Airbnb / LottieFiles [web:172][web:163] | Checked Oct 2026 | https://github.com/airbnb/lottie-web/blob/master/LICENSE.md ; https://github.com/LottieFiles/dotlottie-web/blob/main/LICENSE | Runtime MIT licenses | Primary repositories |
| LottieFiles docs [web:303][web:351][web:345][web:295] | Checked 8–9 Oct 2026 | https://docs.lottiefiles.com/en/runtimes ; https://docs.lottiefiles.com/en/runtimes/distributions/js/v0.x/core-concepts ; https://docs.lottiefiles.com/en/runtimes/distributions/js/v0.x/advanced/performance ; https://docs.lottiefiles.com/en/integrations/figma/04_figma-to-lottie | Player size, WASM/offline setup, export capabilities | Primary/official |
| Rive [web:20][web:334] | 29 Sep 2026; pricing checked 3 Oct | https://rive.app/blog/rive-s-new-9-mo-plan ; https://rive.app/pricing | Conflicting export statements and editor prices | Primary/official |
| Rive docs [web:180][web:182][web:331] | Checked Sep 2026 | https://rive.app/docs/runtimes/react/preloading-wasm ; https://rive.app/docs/runtimes/react/semantics ; https://rive.app/docs/editor/assets/svg | WASM, experimental semantics, illustrator import | Primary/official |
| Konva [web:99][web:207][web:248] | Checked 3–15 Oct 2026 | https://konvajs.org/docs/react/index.html ; https://github.com/konvajs/react-konva ; https://github.com/konvajs/konva | React/Next support and MIT license | Primary/official |
| PixiJS [web:247][web:262][web:133] | Checked 2–15 Oct 2026 | https://github.com/pixijs/pixijs ; https://pixijs.com/8.x/guides/getting-started/ecosystem ; https://pixijs.com/8.x/guides/components/renderers | MIT, React 19, renderer limits | Primary/official |
| MDN / web.dev [web:175][web:205][web:202][web:187][web:193] | Checked Oct 2026 | https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API ; https://developer.mozilla.org/en-US/docs/Web/SVG/Guides/SVG_in_HTML ; https://web.dev/articles/animations-and-performance ; https://web.dev/learn/pwa/assets-and-data ; https://web.dev/learn/pwa/offline-data | Canvas/SVG accessibility, animation cost, offline storage | Primary documentation |
| W3C WAI [web:118][web:124][web:116][web:76][web:374][web:378] | Checked Oct 2026 | https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html ; https://www.w3.org/WAI/WCAG22/Techniques/general/G219 ; https://www.w3.org/WAI/ARIA/apg/patterns/slider/ ; https://www.w3.org/WAI/WCAG22/Techniques/css/C39 ; https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum ; https://www.w3.org/WAI/tutorials/images/ | Non-drag actions, sliders, motion, targets, image alternatives | Primary/official |
| Ivančević, Ježić and Loknar [web:219] | 15 Jan 2026 | https://pubmed.ncbi.nlm.nih.gov/41590930/ | Cross-device object-count performance benchmark | Primary research |
| PBS NOVA [web:104] | Checked 3 Nov 2025 | https://www.pbs.org/wgbh/nova/article/financial-literacy-education-game/ | Financial mini-games and discussion context | Primary/publisher |
| iCivics / Filament Games / Games and Impact [web:150][web:154][web:146] | Checked Oct 2026; guide older | https://ed.icivics.org/resources/game/33765/people-s-pie ; https://www.filamentgames.com/project/peoples-pie ; https://gamesandimpact.org/wp-content/uploads/2013/05/Peoples-Pie-Player-Guide-Balancing-the-Budget.pdf | Budget simulation, trade-offs and separate reflection example | Primary game/publisher; third-party guide |
| National Library of Israel [web:273][web:317][web:327] | Checked Oct 2026 | https://www.nli.org.il/en/visit/letters-of-light ; https://www.nli.org.il/en/at-your-service/copyright-service ; https://www.nli.org.il/en/at-your-service/reference/online-access | Sculpture identification and item-by-item image rights | Primary/official |

## Sources

### Cited in the answer

- [3] Standard "No Charge" GSAP License — https://gsap.com/community/standard-license/
- [4] gsap.com · blog · 3-133.13 release | GSAP | Docs & Learning — https://gsap.com/blog/3-13/
- [20] Rive's new $9/mo plan — https://rive.app/blog/rive-s-new-9-mo-plan
- [29] LottieFiles Plans & Pricing - Individual, Team & Enterprise — https://lottiefiles.com/pricing
- [44] lottie-web — https://bundlephobia.com/package/lottie-web
- [59] GSAP vs Framer Motion vs React Spring for Next.js in 2026 — https://www.shipgarden.com/gallery/gsap-vs-framer-motion-vs-react-spring-nextjs-animation-2026
- [60] GSAP vs Motion: A detailed comparison — https://motion.dev/docs/gsap-vs-motion
- [65] Reduce bundle size of Framer Motion | Motion for React — https://motion.dev/docs/react-reduce-bundle-size
- [67] README.md — https://unpkg.com/motion@12.15.0/README.md
- [76] Using the CSS prefers-reduced-motion query to prevent ... — https://www.w3.org/WAI/WCAG22/Techniques/css/C39
- [89] React motion component | Motion for React — https://motion.dev/docs/react-motion-component
- [91] How to install Motion for React | Motion for React — https://motion.dev/docs/react-installation
- [99] konvajs.org · docs · reactReact Canvas Library — Getting Started with react-konva — https://konvajs.org/docs/react/index.html
- [100] How to test react-konva components — https://konvajs.org/docs/react/Testing.html
- [104] A new game teaches financial literacy and decision-making — https://www.pbs.org/wgbh/nova/article/financial-literacy-education-game/
- [116] Slider Pattern | APG | WAI - W3C — https://www.w3.org/WAI/ARIA/apg/patterns/slider/
- [118] Understanding Success Criterion 2.5.7: Dragging Movements — https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html
- [124] Technique G219: Ensuring that an alternative is available for ... - W3C — https://www.w3.org/WAI/WCAG22/Techniques/general/G219
- [133] Rendering A Scene​ — https://pixijs.com/8.x/guides/components/renderers
- [134] Application — https://pixijs.com/8.x/guides/components/application
- [146] [PDF] PEOPLE'S PIE: PLAYER IMPACT GUIDE — https://gamesandimpact.org/wp-content/uploads/2013/05/Peoples-Pie-Player-Guide-Balancing-the-Budget.pdf
- [150] People's Pie — https://ed.icivics.org/resources/game/33765/people-s-pie
- [154] People's Pie - Filament Games — https://www.filamentgames.com/project/peoples-pie
- [163] dotlottie-web/LICENSE at main · LottieFiles ... - GitHub — https://github.com/LottieFiles/dotlottie-web/blob/main/LICENSE
- [170] Basic usage of canvas - Web APIs | MDN - MDN Web Docs — https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Basic_usage
- [172] lottie-web/LICENSE.md at master · airbnb/lottie-web — https://github.com/airbnb/lottie-web/blob/master/LICENSE.md
- [175] Canvas API — https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
- [176] React & GSAP | GSAP | Docs & Learning — https://gsap.com/resources/React/
- [178] Best Practices - Rive — https://rive.app/docs/runtimes/react/best-practices
- [180] Preloading WASM - Rive — https://rive.app/docs/runtimes/react/preloading-wasm
- [182] Semantics - Rive — https://rive.app/docs/runtimes/react/semantics
- [187] Assets and data - web.dev — https://web.dev/learn/pwa/assets-and-data
- [193] web.dev › learn › pwaDados off-line - web.dev — https://web.dev/learn/pwa/offline-data?hl=pt-br
- [194] Caching — https://web.dev/learn/pwa/caching
- [202] Animations and performance | Articles — https://web.dev/articles/animations-and-performance
- [205] SVG in HTML introduction - MDN Web Docs — https://developer.mozilla.org/en-US/docs/Web/SVG/Guides/SVG_in_HTML
- [207] GitHub - konvajs/react-konva: React components for the Konva ... — https://github.com/konvajs/react-konva
- [217] Pixi.js — https://bestofjs.org/projects/pixijs
- [219] A Cross-Device and Cross-OS Benchmark of Modern Web ... — https://pubmed.ncbi.nlm.nih.gov/41590930/
- [231] React Konva — https://bestofjs.org/projects/react-konva
- [232] LottieFiles Commercial Use Policies — https://help.lottiefiles.com/commercial-use-guide
- [235] Lottie Simple License — https://lottiefiles.com/page/license
- [247] GitHub - pixijs/pixijs: The HTML5 Creation Engine: Create ... — https://github.com/pixijs/pixijs
- [248] Konva.js is an HTML5 Canvas JavaScript framework for ... - GitHub — https://github.com/konvajs/konva
- [260] konva/LICENSE at master · konvajs/konva · GitHub — https://github.com/konvajs/konva/blob/master/LICENSE
- [262] Ecosystem - PixiJS — https://pixijs.com/8.x/guides/getting-started/ecosystem
- [273] Letters of Light - A Sculpture by Micha Ullman — https://www.nli.org.il/en/visit/letters-of-light
- [289] After Effects - docs.lottiefiles.com — https://docs.lottiefiles.com/en/integrations/after-effects
- [290] Features · airbnb/lottie-web Wiki — https://github.com/airbnb/lottie-web/wiki/Features
- [295] Figma to Lottie — https://docs.lottiefiles.com/en/integrations/figma/04_figma-to-lottie
- [301] Reading export warnings — https://docs.lottiefiles.com/en/integrations/figma/06_feature-checking/reading-export-warnings
- [303] dotLottie Players — https://docs.lottiefiles.com/en/runtimes
- [304] @rive-app/react-canvas v4.34.3 Bundlephobia — https://bundlephobia.com/package/@rive-app/react-canvas
- [311] dotLottie React Player Documentation - LottieFiles — https://docs.lottiefiles.com/en/runtimes/distributions/react
- [317] Copyright Queries — https://www.nli.org.il/en/at-your-service/copyright-service
- [327] How to Access Items From the NLI Collections Online — https://www.nli.org.il/en/at-your-service/reference/online-access
- [331] SVG & Vector Assets - Rive — https://rive.app/docs/editor/assets/svg
- [334] Pricing — https://rive.app/pricing
- [338] React — https://rive.app/docs/runtimes/react/react
- [343] rive.app › docs › editorToolbar - Rive — https://rive.app/docs/editor/interface-overview/toolbar
- [345] docs.lottiefiles.com › v0 › advanceddotLottie Web Player Performance Optimization — https://docs.lottiefiles.com/en/runtimes/distributions/js/v0.x/advanced/performance
- [347] dotLottie React Player API Reference — https://docs.lottiefiles.com/en/runtimes/distributions/react/v0.x/api-reference
- [351] How the dotLottie Web Player Works — https://docs.lottiefiles.com/en/runtimes/distributions/js/v0.x/core-concepts
- [364] Commits · motiondivision/motion · GitHub — https://github.com/motiondivision/motion/commits
- [374] www.w3.org · WAI · WCAG22Understanding Success Criterion 2.5.8: Target Size (Minimum ... — https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum
- [378] Images Tutorial | Web Accessibility Initiative (WAI) — https://www.w3.org/WAI/tutorials/images/

### Retrieved but not cited

- [1] Webflow makes GSAP 100% free — plus more exciting ... — https://webflow.com/blog/gsap-becomes-free
- [2] Webflow makes GSAP 100% free — https://webflow.com/updates/gsap-becomes-free
- [5] GSAP (GreenSock Animation Platform), a JavaScript ... - GitHub — https://github.com/greensock/gsap
- [6] Learn GSAP Website Page Template for Webflow — https://webflow.com/templates/html/learn-gsap-website-template
- [7] The GSAP Field Website Page Template for Webflow — https://webflow.com/templates/html/the-gsap-field-website-template
- [8] Pricing — https://gsap.com/pricing/
- [9] Goodwill goes a long way: How building trust with our ... — https://webflow.com/blog/community-viral-gsap-relaunch
- [10] GSAP Draggable Website Page Template for Webflow — https://webflow.com/templates/html/gsap-draggable-website-template
- [11] GSAP vs Framer Motion vs React Spring for Next.js in 2026 — https://www.shipgarden.com/gallery/gsap-vs-framer-motion-vs-react-spring-nextjs-animation-2026
- [12] GSAP vs Anime.js vs Motion Compared - GSAP Vault — https://gsapvault.com/blog/gsap-vs-animejs-vs-motion
- [13] Gsap — NPM Package Health & Stats - PkgPulse — https://www.pkgpulse.com/packages/gsap
- [14] Pricing — https://rive.app/pricing
- [15] Rive Review (2026): Pricing, Pros & Cons — https://www.itechguides.com/products/rive/
- [16] Is Rive free for commercial use? | ExodeUI Motion Questions — https://www.exodeui.com/questions/is-rive-free-for-commercial-use/
- [17] Rive Review (2026) - MakerStack — https://makerstack.co/reviews/rive-review/
- [18] Rive Pricing 2026: Zero License Fee — Full Cost Breakdown — https://www.spotsaas.com/product/rive/pricing
- [19] Rive Web Integration | YourWebTeam — https://yourwebteam.io/rive-animations/rive-integration/
- [21] Animated Libraries for Next.js & React 2026 — https://snigdhachandrapaik.vercel.app/blogs/animated-website-libraries-nextjs-react
- [22] Rive for creating interactive animations - ICS MEDIA — https://ics.media/en/entry/241206/
- [23] everythingxiaomi.com · apps · riveRive in 2026: Pricing, Plans and Alternatives | Everything Xiaomi — https://everythingxiaomi.com/apps/rive/
- [24] Rive Reviews and Pricing 2026 | F6S — https://www.f6s.com/software/rive
- [25] Rive Free Tier 2026: Limits, Pricing & What Changed | AgentDeals — https://agentdeals.dev/vendor/rive
- [26] @rive-app/react-canvas v4.34.3 Bundlephobia — https://bundlephobia.com/package/@rive-app/react-canvas
- [27] How to Add Animated Icons to a Next.js App (Lottie & Rive) | Unicorn ... — https://unicornicons.com/blog/how-to-add-animated-icons-to-nextjs
- [28] @rive-app/react-canvas - npm — https://www.npmjs.com/package/@rive-app/react-canvas
- [30] Terms and Conditions — https://lottiefiles.com/es/page/terms-and-conditions
- [31] Choosing the Right Plan for You — https://help.lottiefiles.com/choosing-the-right-plan-for-you
- [32] LottieFiles Commercial Use Policies — https://help.lottiefiles.com/commercial-use-guide
- [33] 価格 — https://lottiefiles.com/jp/pricing
- [34] LottieFiles Platform: Design Motion Once, Ship Everywhere — https://lottiefiles.com/es/platform
- [35] Animating with Lottie: JSON, dotLottie, Web, React Native, and More — https://www.itechguides.com/animating-with-lottie-create-export-integrate-optimize-and-ship/
- [36] llms.txt - LottieFiles — https://lottiefiles.com/llms.txt
- [37] LottieFiles Review 2026: AI, Download, Company, Alternatives, Free Plan & FAQs — https://nubiapage.com/lottiefiles-review-2026-ai-download-company-alternatives-free-plan-and-faqs/
- [38] Education Plan — https://help.lottiefiles.com/hc/en-us/articles/43330871491481-lottiefiles-education-plan
- [39] @lottiefiles/dotlottie-web - JSR — https://jsr.io/@lottiefiles/dotlottie-web
- [40] dotLottie Players — https://docs.lottiefiles.com/en/runtimes
- [41] lottie-web - npm.io — https://npm.io/package/lottie-web
- [42] Build software better, together — https://github.com/LottieFiles/dotlottie-web/pkgs/npm/dotlottie-react/796876735
- [43] GitHub - LottieFiles/dotlottie-react-native: Official ... — https://github.com/LottieFiles/dotlottie-react-native
- [45] rc-motion v2.9.5 ❘ Bundlephobia — https://bundlephobia.com/package/rc-motion
- [46] motion v13.2.0 ❘ Bundlephobia — https://bundlephobia.com/package/motion
- [47] motion v12.8.0 Bundlephobia — https://bundlephobia.com/package/motion@12.8.0
- [48] pixi.js v6.4.2 ❘ Bundlephobia — https://bundlephobia.com/package/pixi.js@6.4.2
- [49] React — https://bundlephobia.com/package/react
- [50] @pixi/app Bundlephobia — https://bundlephobia.com/package/@pixi/app
- [51] @ant-design/pro-provider v2.16.2 ❘ Bundlephobia — https://bundlephobia.com/package/@ant-design/pro-provider
- [52] Reduce bundle size of Framer Motion | Motion for React — https://motion.dev/docs/react-reduce-bundle-size
- [53] Bundlephobia Scraper - npm Package Size & Gzip Data API · Apify — https://apify.com/parseforge/bundlephobia-scraper
- [54] GitHub - grimmbraten/bundlephobia-cli: Analyze npm package sizes from the comfort of your cli — https://github.com/grimmbraten/bundlephobia-cli
- [55] Bundlephobia — free developer tool | Powerful Websites — https://powerfulwebsites.io/site/bundlephobia.com
- [56] GSAP vs Framer Motion 2026: Real Numbers, Clear Verdict — https://www.hontran.dev/blog/gsap-vs-framer-motion
- [57] Bundlephobia Reviews, Pricing & Alternatives (2026) - Toolradar — https://toolradar.com/tools/bundlephobia
- [58] react-admin-kit — https://bundlephobia.com/package/react-admin-kit
- [61] React Konva — https://bestofjs.org/projects/react-konva
- [62] react-konva - npmx — https://npmx.dev/package/react-konva
- [63] react-konva - UNPKG — https://app.unpkg.com/react-konva@19.0.7
- [64] Phaser vs Pixi.js: Renderer vs Game Framework Comparison (2025) — https://generalistprogrammer.com/tutorials/phaser-vs-pixijs-renderer-comparison
- [66] hysenlabs.com · projects · motiondivision-motionMotion: React and JavaScript Animation Library Guide — https://hysenlabs.com/projects/motiondivision-motion
- [68] github.com · blob · mainclaude-skills/plugins/motion/skills/motion/SKILL.md at main -... — https://github.com/secondsky/claude-skills/blob/main/plugins/motion/skills/motion/SKILL.md
- [69] Motion - Best of JS — https://bestofjs.org/projects/motion
- [70] hysenlabs.com › projects › konvajs-react-konvareact-konva: install, examples and editor limits — https://hysenlabs.com/projects/konvajs-react-konva
- [71] Pixi.js — https://bestofjs.org/projects/pixijs
- [72] What Is PixiJS? A Guide to the 2D Rendering Engine - WPDean — https://wpdean.com/what-is-pixijs/
- [73] LazyMotion | Optimise size of React bundle | Motion for React — https://motion.dev/docs/react-lazy-motion
- [74] www.w3.org › WAI › WCAG21Understanding Success Criterion 2.3.3: Animation from ... — https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html
- [75] Understanding SC 2.3.3 Animation from Interactions (Level AAA) — https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html
- [77] C39: Using the CSS prefers-reduced-motion query to prevent ... — https://www.w3.org/WAI/WCAG21/Techniques/css/C39.html
- [78] Clarification regarding success criterion 2.2.2 Pause, Stop, ... — https://github.com/w3c/wcag/issues/3766
- [79] Are browser/OS settings (exposed to web content as `prefers ... — https://github.com/w3c/wcag/issues/2909
- [80] Direct Manipulation - UI/UX Atlas — https://www.uiuxatlas.com/lessons/interaction-design/direct-manipulation/
- [81] Public Comment on 2.3.3 Animation from Interactions and prefers-reduced-motion · Issue #183 · w3c/wcag3 — https://github.com/w3c/wcag3/issues/183
- [82] Konva: a scene graph for interactive canvas apps - Hysen Labs — https://hysenlabs.com/projects/konvajs-konva
- [83] Understanding S.C. 2.3.3 Animation from Interaction - clarify who is responsible for providing the feature to disable? · Issue #2250 · w3c/wcag — https://github.com/w3c/wcag/issues/2250
- [84] Fabric.js vs Konva vs PixiJS: Canvas & 2D Graphics 2026 — https://www.pkgpulse.com/guides/fabricjs-vs-konva-vs-pixijs-canvas-2d-graphics-2026
- [85] Reduced motion · Website Spec — https://specification.website/spec/accessibility/reduced-motion/
- [86] www.w3.org › wiki › PFPF/ARIA/BestPractices/DragDrop - W3C Wiki — https://www.w3.org/wiki/PF/ARIA/BestPractices/DragDrop
- [87] Animation and motion | web.dev — https://web.dev/learn/accessibility/motion
- [88] WAI-ARIA Authoring Practices 1.1 — https://www.w3.org/TR/2015/WD-wai-aria-practices-1.1-20151119/
- [90] Motion Studio: install and edit animations | Motion for AI — https://motion.dev/docs/studio
- [92] motion.dev › docs › cssCSS spring animations for React, Astro and Vue | Motion — https://motion.dev/docs/css
- [93] Get started - React Animation Library - Framer Motion — https://motion.dev/docs/react
- [94] llms.txt — https://motion.dev/llms.txt
- [95] motion.dev · docs · react-motion-configMotionConfig | Configure Motion for React | Motion for React — https://motion.dev/docs/react-motion-config
- [96] Docs | Motion — https://motion.dev/docs
- [97] Gestures — https://motion.dev/docs/react-gestures
- [98] Framer — https://motion.dev/docs/framer
- [101] Want your kids to learn the power of money? Start a ... — https://www.pbs.org/newshour/economy/want-your-kids-to-learn-the-power-of-money-start-a-lemonade-stand
- [102] Night of the Living Debt - Games for Change — https://www.gamesforchange.org/games/night-of-the-living-debt/
- [103] New Animated PBS KIDS Series, SKILLSVILLE, Harnesses Gaming to Open a World of Possibilities — https://www.pbs.org/about/about-pbs/blogs/news/new-animated-pbs-kids-series-skillsville-harnesses-gaming-to-open-a-world-of-possibilities/
- [105] www.gamesforchange.org · games · dragonbox-numbersDragonBox Numbers - Games for Change — https://www.gamesforchange.org/games/dragonbox-numbers/
- [106] Today's kids start lemonade stands with a business plan — https://www.pbs.org/newshour/show/todays-kids-start-lemonade-stands-with-a-business-plan
- [107] learn.gamesforchange.org › student-arcadeGames for Change Student Arcade — https://learn.gamesforchange.org/student-arcade
- [108] learn.gamesforchange.org · programs · student-challengeGames for Change Student Challenge — https://learn.gamesforchange.org/programs/student-challenge
- [109] Our Region's Largest Classroom! — https://bento.pbs.org/prod/filer_public/ketc-bento-live-pbs/ninenet/pdf/education/2b4d44404b_ToolkitUpdate-20241216.pdf
- [110] Pinkalicious & Peterrific | Pink Lemonade/Pink Shoes | Season 1 | Episode 11 — https://www.pbs.org/video/pink-lemonadepink-shoes-fmxu2n/
- [111] Funexpected Math - Games for Change — https://www.gamesforchange.org/games/funexpected-math/
- [112] Fake it to Make it — https://www.gamesforchange.org/games/fake-it-to-make-it/
- [113] Better Learning — https://education.mit.edu/wp-content/uploads/2018/10/BalancedDesignGuide2015.pdf
- [114] Attentat 1942 - Games for Change — https://www.gamesforchange.org/games/attentat-1942/
- [115] Games for Change — https://gamesforchange.org/wp-content/uploads/2025/01/2024-G4C-Impact-Report-2.pdf
- [117] Understanding Success Criterion 2.5.1: Pointer Gestures | WAI ... — https://www.w3.org/WAI/WCAG22/Understanding/pointer-gestures
- [119] New in 2.2 Draft — https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/
- [120] Media Seek Slider Example | APG | WAI - W3C — https://www.w3.org/WAI/ARIA/apg/patterns/slider/examples/slider-seek/
- [121] Coverage and Quality Reports | APG | WAI — https://www.w3.org/WAI/ARIA/apg/about/coverage-and-quality/
- [122] F108: Failure of Success Criterion 2.5.7 Dragging Movements due to ... — https://www.w3.org/WAI/WCAG22/Techniques/failures/F108
- [123] Horizontal Multi-Thumb Slider Example | APG | WAI - W3C — https://www.w3.org/WAI/ARIA/apg/patterns/slider-multithumb/examples/slider-multithumb/
- [125] Simple pointer input available — https://www.w3.org/WAI/WCAG3/informative/input-operation/pointer-input/simple-pointer-input-available/
- [126] Toolbar Pattern | APG | WAI | W3C — https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/
- [127] Accessible Rich Internet Applications (WAI-ARIA) 1.1 — https://www.w3.org/TR/wai-aria-1.1/
- [128] How to Meet WCAG (Quick Reference) — https://www.w3.org/WAI/WCAG22/quickref/?versions=2.1
- [129] Understanding Success Criterion 2.5.1: Pointer Gestures | WAI - W3C — https://www.w3.org/WAI/WCAG21/Understanding/pointer-gestures
- [130] Slider (Multi-Thumb) Pattern | APG | WAI - W3C — https://www.w3.org/WAI/ARIA/apg/patterns/slider-multithumb/
- [131] Performance Tips - PixiJS — https://pixijs.com/8.x/guides/concepts/performance-tips
- [132] llms-medium.txt — https://pixijs.com/llms-medium.txt
- [135] Architecture - PixiJS — https://pixijs.com/8.x/guides/concepts/architecture
- [136] Render Loop - PixiJS — https://pixijs.com/8.x/guides/concepts/render-loop
- [137] Docs — https://pixijs.com/8.x/guides/getting-started/intro
- [138] llms.txt — https://pixijs.com/llms.txt
- [139] konvajs.org · docsGetting Started with Konva — HTML5 Canvas 2D Framework — https://konvajs.org/docs/index.html
- [140] Render Groups - PixiJS — https://pixijs.com/8.x/guides/concepts/render-groups
- [141] How to test react-konva components — https://konvajs.org/docs/react/Testing.html
- [142] konvajs.org · docs · reactReact Canvas Library — Getting Started with react-konva — https://konvajs.org/docs/react/index.html
- [143] konvajs.org · docs · reactDrawing canvas shapes with React | Konva - JavaScript Canvas 2d... — https://konvajs.org/docs/react/Shapes.html
- [144] Events — https://konvajs.org/docs/react/Events.html
- [145] Konva.js FAQ - Frequently Asked Questions — https://konvajs.org/docs/faq.html
- [147] Icivics The Great State — https://ftp.richmondbizsense.com/ProductPdf/mL6A2F/603187/Icivics%20The%20Great%20State.pdf
- [148] iCivics People's Pie Name — https://iblog.dearbornschools.org/rauscher/wp-content/uploads/sites/2756/2018/12/iCivics-Peoples-Pie.pdf
- [149] NOVA Financial Lab - PBS Learning Media — https://www.pbslearningmedia.org/collection/nova-premium-collection/nova-labs-and-interactives/financial-lab/
- [151] Financial Responsibility and Decision Making — https://www.pbslearningmedia.org/subjects/social-studies/economics/personal-finance/financial-responsibility-and-decision-making/
- [152] Personal Finance - Economics - PBS Learning Media — https://www.pbslearningmedia.org/subjects/social-studies/economics/personal-finance/
- [153] Income, Budgeting, and Saving | Georgia Stories — https://www.pbslearningmedia.org/resource/personal-money-management-video/georgia-stories/
- [155] Teacher Tips — https://ed.icivics.org/resources/game/35917/counties-work
- [156] [PDF] Government Spending Icivics - www.yic.edu.et — https://www.yic.edu.et/HomePages/textbook-solutions/1s7VOt/Government%20Spending%20Icivics.pdf
- [157] NOVA Evolution Lab Game — https://www.pbslearningmedia.org/resource/nvev-sci-evolab/nova-evolution-lab-game/
- [158] Counties Work Icivics Answer Key - Welcome Home Vets of NJ — https://www.welcomehomevetsofnj.org/textbook-ga-24-1-04/counties-work-icivics-answer-key.pdf
- [159] Economic Incentives | PBS LearningMedia — https://www.pbslearningmedia.org/subjects/social-studies/economics/microeconomics/economic-incentives/
- [160] Student Login & Dashboard | iCivics Games & Videos — https://ed.icivics.org/students
- [161] LottieFiles/dotlottie-web: High-performance Lottie & ... — https://github.com/lottiefiles/dotlottie-web
- [162] LottieFiles/dotlottie-io — https://github.com/LottieFiles/dotlottie-io
- [164] Package dotlottie-web — https://github.com/LottieFiles/dotlottie-web/pkgs/npm/dotlottie-web
- [165] GitHub - LottieFiles/dotlottie-react-native: Official ... — https://github.com/LottieFiles/dotlottie-react-native
- [166] GitHub - LottieFiles/dotlottie-web: Official LottieFiles player for rendering Lottie and dotLottie animations in the web. Supports React, Vue, Svelte, SolidJS and Web Components. — https://github.com/LottieFiles/dotlottie-web?tab=readme-ov-file
- [167] LottieFiles repositories - GitHub — https://github.com/orgs/LottieFiles/repositories
- [168] Airbnb — https://github.com/orgs/airbnb/repositories?type=all
- [169] lottie/LICENSE at master · airbnb/lottie - GitHub — https://github.com/airbnb/lottie/blob/master/LICENSE
- [171] dotlottie-web/SKILL.md at main · LottieFiles ... — https://github.com/LottieFiles/dotlottie-web/blob/main/SKILL.md
- [173] MIT License - LottieFiles/dotlottie-rs - GitHub — https://github.com/LottieFiles/dotlottie-rs/blob/main/LICENSE
- [174] LottieFiles/dotlottie-rs: High-performance Lottie & ... — https://github.com/LottieFiles/dotlottie-rs
- [177] Parameters and Return Values — https://rive.app/docs/runtimes/react/parameters-and-return-values
- [179] GPU Canvas — https://rive.app/docs/runtimes/react/gpu-canvas
- [181] Data Binding — https://rive.app/docs/runtimes/react/data-binding
- [183] Migration Guides — https://rive.app/docs/runtimes/react/migration-guides
- [184] State Machine Playback - Rive — https://rive.app/docs/runtimes/react/state-machines
- [185] Rendering to a Bitmap - Rive — https://rive.app/docs/runtimes/react/rendering-to-a-bitmap
- [186] gsap v3.15.0 ❘ Bundlephobia — https://bundlephobia.com/package/gsap
- [188] js13kGames: Making the PWA work offline with service workers — https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Tutorials/js13kGames/Offline_Service_workers
- [189] Pubblicazione | web.dev — https://web.dev/learn/pwa/serving?hl=it
- [190] Offline and background operation - Progressive web apps | MDN — https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation
- [191] Progressive Web Apps: Going Offline — https://web.dev/codelabs/pwa-training
- [192] Using Service Workers - Web APIs | MDN - MDN Web Docs — https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers
- [195] Workbox — https://web.dev/learn/pwa/workbox
- [196] Service workers — https://web.dev/learn/pwa/service-workers
- [197] CycleTracker: Service workers - Progressive web apps | MDN — https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Tutorials/CycleTracker/Service_workers
- [198] Client-side storage - Learn web development | MDN — https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Client-side_APIs/Client-side_storage
- [199] Service Worker API — https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
- [200] Caching - Progressive web apps | MDN — https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Caching
- [201] Cache - Web APIs | MDN - MDN Web Docs — https://developer.mozilla.org/en-US/docs/Web/API/Cache.
- [203] How to create high-performance CSS animations | Articles | web.dev — https://web.dev/articles/animations-guide
- [204] Why are some animations slow? | Articles — https://web.dev/articles/animations-overview
- [206] Por que algumas animações estão lentas? | Articles | web.dev ... — https://web.developers.google.cn/articles/animations-overview?hl=pt-br
- [208] developer.mozilla.org › en-US › docsSVG: Scalable Vector Graphics - MDN Web Docs — https://developer.mozilla.org/en-US/docs/Web/SVG
- [209] konvajs.org · docs · reactReact Canvas Library — Getting Started with react-konva — https://konvajs.org/docs/react/index.html
- [210] Next.js Integration | konvajs/react-konva | DeepWiki — https://deepwiki.com/konvajs/react-konva/5.1-next.js-integration
- [211] SVG: Scalable Vector Graphics - MDN Web Docs — https://mdn2.netlify.app/en-us/docs/web/svg/element/svg/
- [212] How to test react-konva components — https://konvajs.org/docs/react/Testing.html
- [213] Konva.js FAQ - Frequently Asked Questions — https://konvajs.org/docs/faq.html
- [214] <desc> - SVG: Scalable Vector Graphics — https://mdn2.netlify.app/en-us/docs/web/svg/element/desc/
- [215] konva · GitHub — https://github.com/konvajs
- [216] <title> — the SVG accessible name element - MDN Web Docs — https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/title
- [218] Releases · pixijs/pixijs — https://github.com/pixijs/pixijs/releases
- [220] pixi.js: downloads, bundle size, alternatives | JavaScripts.com — https://javascripts.com/packages/pixi.js
- [221] How to Fix Custom Shapes: Common Issues and Solutions — https://www.johal.in/fix-custom-shapes-common-issues-solutions
- [222] JointJS performance overview: Testing diagrams with 100000 nodes — https://www.jointjs.com/blog/jointjs-performance-overview-testing-diagrams-with-100-000-nodes
- [223] SVG vs Canvas Charts: What Actually Matters (2026) — https://apexcharts.com/blog/svg-vs-canvas-charts/
- [224] SVG from Zero to Senior · Part 19 — Performance & Rendering ... — https://jvinhit.github.io/blog/svg-19-performance-and-rendering/
- [225] velt.dev › blog › best-canvas-library-web-mobile-appsBest Canvas Libraries for Web & Mobile (Jan 2026) - velt.dev — https://velt.dev/blog/best-canvas-library-web-mobile-apps
- [226] What Are Canvas Animations? - WPDean — https://wpdean.com/canvas-animations/
- [227] SVG vs Canvas: Performance Cut‑offs, Benchmarking & Hybrid ... — https://blog.vijayt.com/svg-vs-canvas-performance-cut-offs-benchmarking-hybrid-strategies/
- [228] kalamo/docs/research/02-web-vector-tech-landscape.md at main · 286486/kalamo — https://github.com/286486/kalamo/blob/main/docs/research/02-web-vector-tech-landscape.md
- [229] Best Chart Libraries for Developers in 2026 - Strapi — https://strapi.io/blog/chart-libraries
- [230] cx-react-konva - Bundlephobia — https://bundlephobia.com/package/cx-react-konva
- [233] Animation Licensing Basics - help.lottiefiles.com — https://help.lottiefiles.com/animation-licensing-basics-
- [234] lottiefiles.com › page › terms-and-conditionsLottieFiles Terms and Conditions: Your Guide to Using Our ... — https://lottiefiles.com/page/terms-and-conditions
- [236] Choosing the Right Plan for You — https://help.lottiefiles.com/choosing-the-right-plan-for-you
- [237] Giving Attribution for Lottie Animations — https://help.lottiefiles.com/hc/en-us/articles/900002475966-how-do-i-give-attribution-for-a-lottie-animation-i-ve-used
- [238] llms.txt - LottieFiles — https://lottiefiles.com/llms.txt
- [239] help.lottiefiles.com · discovering-downloading-andDiscovering, Downloading, and Uploading Animations — https://help.lottiefiles.com/discovering-downloading-and-uploading-animations
- [240] Animation Upload Guidelines — https://lottiefiles.com/page/upload-guidelines
- [241] Free Gif Animations — https://lottiefiles.com/free-animations/gif
- [242] LottieFiles 플랜 및 가격 - 기본, 개인, 팀, 또는 기업을 위한 플랜 — https://lottiefiles.com/kr/pricing
- [243] LottieFiles Plans & Pricing - Individual, Team & Enterprise — https://lottiefiles.com/pricing?platform=app
- [244] Premium Animations — https://help.lottiefiles.com/hc/en-us/articles/24484503354137-premium-animations
- [245] Understanding Upload and Download Limits on the Free Plan — https://help.lottiefiles.com/hc/en-us/articles/16240626895385-file-upload-and-download-limits-on-free-workspace
- [246] Publishing Animations to the Community - help.lottiefiles.com — https://help.lottiefiles.com/hc/en-us/articles/9548261862425-how-do-i-upload-an-animation-to-public
- [249] GitHub - pixijs/pixijs at v6.x — https://github.com/pixijs/pixijs/tree/v6.x
- [250] konva-devtool/LICENSE at main · konvajs/konva-devtool — https://github.com/konvajs/konva-devtool/blob/main/LICENSE
- [251] pixijs/LICENSE at dev — https://github.com/pixijs/pixijs/blob/dev/LICENSE
- [252] GitHub - pixijs/pixijs: The HTML5 Creation Engine: Create beautiful digital content with the fastest, most flexible 2D WebGL renderer. — https://github.com/pixijs/pixijs/tree/dev
- [253] haystackeditor/pixijs — https://github.com/haystackeditor/pixijs
- [254] Official AI skills for PixiJS. These skills teach AI coding ... — https://github.com/pixijs/pixijs-skills
- [255] spine-v8/LICENSE at main · pixijs/spine-v8 — https://github.com/pixijs/spine-v8/blob/main/LICENSE
- [256] konvajs/ng2-konva - GitHub — https://github.com/konvajs/ng2-konva
- [257] pr-pixijs-pixijs/skills/pixijs-scene-mesh/SKILL.md at dev ... — https://github.com/cpruijsen/pr-pixijs-pixijs/blob/dev/skills/pixijs-scene-mesh/SKILL.md
- [258] A Yoga powered layout library for PixiJS. - GitHub — https://github.com/pixijs/layout
- [259] Commonly used UI components for PixiJS — https://github.com/pixijs/ui
- [261] GitHub - konvajs/vue-konva: Vue & Canvas - JavaScript library for drawing complex canvas graphics using Vue. — http://github.com/konvajs/vue-konva
- [263] Mixing PixiJS and Three.js — https://pixijs.com/8.x/guides/third-party/mixing-three-and-pixi
- [264] Quick Start — https://pixijs.com/8.x/guides/getting-started/quick-start
- [265] Environments | PixiJS — https://pixijs.com/8.x/guides/concepts/environments
- [266] Application — https://pixijs.com/8.x/guides/components/application
- [267] Rendering A Scene​ — https://pixijs.com/8.x/guides/components/renderers
- [268] Manifests & Bundles — https://pixijs.com/8.x/guides/components/assets/manifest
- [269] Math | PixiJS — https://pixijs.com/8.x/guides/components/math
- [270] Assets - PixiJS — https://pixijs.com/8.x/guides/components/assets
- [271] Events / Interaction - PixiJS — https://pixijs.com/8.x/guides/components/events
- [272] react-dom v19.3.0 Bundlephobia — https://bundlephobia.com/package/react-dom
- [274] Letters of Light | Micah Ullman — https://www.nli.org.il/en/visit/exhibitions-and-displays/art-works/letters-of-light-artwork
- [275] www.nli.org.il · en · visitVisit the National Library of Israel – Your Story. Our Story. — https://www.nli.org.il/en/visit
- [276] [PDF] national-library-of-israel-construction-update-report-september ... — https://www.nli.org.il/media/11587/national-library-of-israel-construction-update-report-september-2021-final.pdf
- [277] The New National Library of Israel Building & Campus — https://www.nli.org.il/media/17410/building-report-nli-construction-update-may-2022.pdf
- [278] Letters of Light at the National Library of Israel — https://jonathankligler.substack.com/p/the-national-library-of-israel-celebrating
- [279] See Jerusalem's beautiful art parks, where (almost) no graven images can be found — https://www.timesofisrael.com/see-jerusalems-beautiful-art-parks-where-almost-no-graven-images-can-be-found/
- [280] Unveiling the new National Library of Israel's building — https://www.jpost.com/israel-news/culture/article-774764
- [281] First peek: This is what the new National Library looks like ... — https://www.ynetnews.com/culture/article/rkurpdp0n
- [282] Catalogs — https://www.nli.org.il/en/research-and-teach/catalogs
- [283] Israel’s National Library gets a new home - The Jerusalem Post — https://www.jpost.com/israel-news/culture/article-761487
- [284] Catalogs. | The National Library of Israel — https://www.nli.org.il/en/a-topic/987007284862005171
- [285] Books - הספרייה הלאומית של ישראל — https://www.nli.org.il/en/discover/books
- [286] Archives - הספרייה הלאומית של ישראל — https://www.nli.org.il/en/discover/archives
- [287] Bibliographic Databases — https://www.nli.org.il/en/research-and-teach/catalogs/bibliographic-databases
- [288] Best Motion Design Tools in 2026: Ranked by Use Case — https://lottiefiles.com/blog/design-guides-and-tips/best-motion-design-tools-ranked-by-use-case
- [291] docs.lottiefiles.com › en › integrationsFigma - docs.lottiefiles.com — https://docs.lottiefiles.com/en/integrations/figma
- [292] AfterEffects Plugin Information · airbnb/lottie-web Wiki - GitHub — https://github.com/airbnb/lottie-web/wiki/AfterEffects-Plugin-Information
- [293] lottie-web/History.md at master · airbnb/lottie-web — https://github.com/airbnb/lottie-web/blob/master/History.md
- [294] Interface — https://docs.lottiefiles.com/en/integrations/figma/01_quickstart/interface
- [296] docs.lottiefiles.com › en › integrationsExport and handoff — https://docs.lottiefiles.com/en/integrations/figma/05_export-and-handoff
- [297] lottie-web/ at master · airbnb/lottie-web — https://github.com/airbnb/lottie-web/tree/master?search=1
- [298] Downloading files — https://docs.lottiefiles.com/en/integrations/figma/05_export-and-handoff/downloading-files
- [299] lottie-web/ at master · airbnb/lottie-web — https://github.com/airbnb/lottie-web?search=1
- [300] Figma Motion designs it, Lottie ships it — https://lottiefiles.com/plugins/figma
- [302] docs.lottiefiles.com · after-effects · 06_exportExport - docs.lottiefiles.com — https://docs.lottiefiles.com/en/integrations/after-effects/06_export
- [305] dotLottie React Player WebGL and WebGPU Renderers — https://docs.lottiefiles.com/en/runtimes/distributions/react/v0.x/gpu-rendering
- [306] Distributions - docs.lottiefiles.com — https://docs.lottiefiles.com/en/runtimes/distributions
- [307] Getting Started with the dotLottie React Native Player — https://docs.lottiefiles.com/en/runtimes/distributions/react-native/v0.x
- [308] How the dotLottie Web Player Works — https://docs.lottiefiles.com/en/runtimes/distributions/js/v0.x/core-concepts
- [309] dotLottie React Native Player Examples — http://docs.lottiefiles.com/en/runtimes/distributions/react-native/v0.x/examples
- [310] dotLottie React Native Player API Reference — https://docs.lottiefiles.com/en/runtimes/distributions/react-native/v0.x/api-reference
- [312] dotLottie React Native Player Documentation — https://docs.lottiefiles.com/en/runtimes/distributions/react-native
- [313] dotLottie React Player Examples — https://docs.lottiefiles.com/en/runtimes/distributions/react/v0.x/examples
- [314] Terms of Use; The National Library of Israel — https://www.nli.org.il/en/at-your-service/terms-of-use
- [315] יום העצמאות תש"י בירושלים | Photograph ... - הספרייה הלאומית — https://www.nli.org.il/en/images/NNL_ARCHIVE_AL997008136725305171/NLI
- [316] יום העצמאות 1971 | Photograph — https://www.nli.org.il/en/images/NNL_ARCHIVE_AL990039997930205171/NLI
- [318] TERMS OF USE AND COPYRIGHTS — https://www.nli.org.il/en/newspapers/terms-of-use
- [319] Terms of Use — https://www.nli.org.il/en/discover/manuscripts/hebrew-manuscripts/terms-of-use
- [320] Artistic photos | Photograph | NNL_ARCHIVE_AL990048818870205171 | The National Library of Israel — https://www.nli.org.il/en/archives/NNL_ARCHIVE_AL990048818870205171/NLI
- [321] Ordering Archival Items — https://www.nli.org.il/en/at-your-service/viewing-library-items/archive-order
- [322] Zichron-Yaakov | Photograph — https://www.nli.org.il/en/images/NNL_ARCHIVE_AL997009563660805171/NLI
- [323] Photo Collection - Zionist Events | Photograph | NNL_ARCHIVE_AL997010821297305171 | The National Library of Israel — https://www.nli.org.il/en/archives/NNL_ARCHIVE_AL997010821297305171/NLI
- [324] Preservation and Access Policy - internet archive — https://www.nli.org.il/en/research-and-teach/internet-archive/preservation-access-policy
- [325] Ben Gurion David used to march every day - הספרייה הלאומית — https://www.nli.org.il/en/images/NNL_ARCHIVE_AL990039956560205171/NLI
- [326] Photo Collection - With Golda Meir | Photograph | NNL_ARCHIVE_AL997011217607505171 | The National Library of Israel — https://www.nli.org.il/en/archives/NNL_ARCHIVE_AL997011217607505171/NLI
- [328] בה"ד 1, בית הספר לקצינים, רחבת המסדרים | Photograph — https://www.nli.org.il/en/images/nnl_archive_al997009327282505171/NLI
- [329] rive.app · docsIntroduction - Rive — https://rive.app/docs/getting-started/introduction
- [330] Getting Started - Rive — https://rive.app/docs/runtimes/web/web-js
- [332] React Native - Rive — https://rive.app/docs/runtimes/react-native/react-native
- [333] Getting Started with the Rive Runtimes — https://rive.app/docs/runtimes/getting-started
- [335] Migration Guide — https://rive.app/docs/runtimes/react-native/migration-guide
- [336] Feature Support - Rive — https://rive.app/docs/feature-support
- [337] Assets — https://rive.app/docs/editor/fundamentals/assets-overview
- [339] Protocols - Rive — https://rive.app/docs/scripting/protocols/overview
- [340] Apple - Rive — https://rive.app/docs/runtimes/apple/apple
- [341] Layout — https://rive.app/docs/runtimes/android/layouts
- [342] rive.app › docs › editorFundamentals Overview - Rive — https://rive.app/docs/editor/fundamentals/overview
- [344] dotLottie React Player WebGL and WebGPU Renderers — https://docs.lottiefiles.com/en/runtimes/distributions/react/v0.x/gpu-rendering
- [346] dotLottie Web Player WebGL and WebGPU Renderers — https://docs.lottiefiles.com/en/runtimes/distributions/js/v0.x/advanced/gpu-rendering
- [348] dotLottie Web Player API Reference - LottieFiles — https://docs.lottiefiles.com/en/runtimes/distributions/js/v0.x/api/reference
- [349] dotLottie Web Component Player API Reference — https://docs.lottiefiles.com/en/runtimes/distributions/web-component/v0.x/api-reference
- [350] dotLottie Vue Player API Reference — https://docs.lottiefiles.com/en/runtimes/distributions/vue/v0.x/api-reference
- [352] help.rive.app › runtimes › webPreloading WASM - Rive — https://rive.app/docs/runtimes/web/preloading-wasm
- [353] Installation Guide for dotLottie Web Player — https://docs.lottiefiles.com/en/runtimes/distributions/js/v0.x/getting-started/installation
- [354] docs.lottiefiles.com › en › runtimesdotLottie Web Component Player Documentation - LottieFiles — https://docs.lottiefiles.com/en/runtimes/distributions/web-component
- [355] Preloading WASM - Rive — https://rive.app/docs/runtimes/react/preloading-wasm
- [356] Low-level API Usage — https://rive.app/docs/runtimes/web/low-level-api-usage
- [357] Rive Parameters — https://rive.app/docs/runtimes/web/rive-parameters
- [358] Publishing with CDN — https://docs.lottiefiles.com/en/integrations/vscode/05_integrate/publishing-with-cdn
- [359] Releases · motiondivision/motion-vue — https://github.com/motiondivision/motion-vue/releases
- [360] Releases · airbnb/lottie-web — https://github.com/airbnb/lottie-web/releases
- [361] Releases · motiondivision/motion - GitHub — https://github.com/motiondivision/motion/releases
- [362] Motion - GitHub — https://github.com/motiondivision
- [363] ai-kit/CHANGELOG.md at main · motiondivision/ai-kit — https://github.com/motiondivision/ai-kit/blob/main/CHANGELOG.md
- [365] GitHub - Lumen5/lottie-web: Render After Effects animations ... — https://github.com/Lumen5/lottie-web
- [366] Issues 768 — https://github.com/airbnb/lottie-web/issues
- [367] Repositories - Airbnb — https://github.com/orgs/airbnb/repositories
- [368] Build software better, together — https://github.com/topics/airbnb-lottie
- [369] v7 Migration Guide — https://pixijs.com/8.x/guides/migrations/v7
- [370] Airbnb - GitHub — https://github.com/airbnb
- [371] Issues · motiondivision/motion - GitHub — https://github.com/motiondivision/motion/issues
- [372] motiondivision repositories — https://github.com/orgs/motiondivision/repositories
- [373] Environments | PixiJS — https://pixijs.com/8.x/guides/concepts/environments
- [375] C42: Using min-height and min-width on target container to ... — https://www.w3.org/WAI/WCAG22/Techniques/css/C42
- [376] New in 2.2 Draft — https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/
- [377] How to Meet WCAG (Quick Reference) — https://www.w3.org/WAI/WCAG22/quickref/?versions=2.1
- [379] www.w3.org › WAI › WCAG21Understanding Success Criterion 2.5.5: Target Size | WAI | W3C — https://www.w3.org/WAI/WCAG21/Understanding/target-size
- [380] www.w3.org · WAI · WCAG22Understanding Success Criterion 2.5.5: Target Size (Enhanced ... — https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html
- [381] WCAG 2.1/targets — https://www.w3.org/WAI/GL/wiki/WCAG_2.1/targets
- [382] New in 2.1 — https://www.w3.org/WAI/standards-guidelines/wcag/new-in-21/
- [383] All ACT Rules | | WAI — https://www.w3.org/WAI/standards-guidelines/act/rules/
- [384] Complex Images | Web Accessibility Initiative (WAI) — https://www.w3.org/WAI/tutorials/images/complex/
- [385] 4: Images in Content Author Modules | Curricula — https://www.w3.org/WAI/curricula/content-author-modules/images/
- [386] Complex Images — https://www.w3.org/WAI/EO/Drafts/tutorials/images/complex/
- [387] Proposed SC Target Size - Mobile Accessibility Task Force — https://www.w3.org/WAI/GL/mobile-a11y-tf/wiki/Proposed_SC_Target_Size
- [388] WCAG 3.0 Image Alternatives Outcome - — https://www.w3.org/WAI/WCAG3/how-to/image-alternatives/

### Pages read in full

- Rive's new $9/mo plan — https://rive.app/blog/rive-s-new-9-mo-plan
- LottieFiles Plans & Pricing - Individual, Team, Team+ & ... — https://lottiefiles.com/pricing
- Semantics — https://rive.app/docs/runtimes/react/semantics
- https://konvajs.org/docs/react/NextJS.html
- A Cross-Device and Cross-OS Benchmark of Modern Web ... — https://pubmed.ncbi.nlm.nih.gov/41590930/
- How the dotLottie Web Player Works — https://docs.lottiefiles.com/en/runtimes/distributions/js/v0.x/core-concepts
- Pricing — https://rive.app/pricing

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

Act as a front-end architect for small educational games. Your research decides **which rendering and animation technology each pilot puzzle should use**, and which puzzle components should become reusable templates.

# RESEARCH QUESTION

As of October 2026, compare these options for short, touch-first puzzles in a React / Next.js PWA:

SVG + CSS animation · plain React DOM components · Motion (formerly Framer Motion) · GSAP · Lottie (lottie-web / dotLottie) · Rive · Konva.js (react-konva) · PixiJS · plain Canvas 2D.

For each compare: **license and cost** (including GSAP's current license after the Webflow acquisition, Rive's runtime and editor pricing, and LottieFiles terms); bundle size (min+gzip); mid-range Android performance; React 19 / Next.js compatibility (including server components and SSR); accessibility (screen readers, keyboard, reduced motion); offline use; the authoring workflow for a non-developer illustrator; and development complexity.

# THE PUZZLES

Puzzles are the optional, objectively scored bonus layer at a stop (10–30 points, hints cost about −2). Three pairs compete, one phone each. Timed scoring is allowed only on these bounded puzzles, never on ethical questions.

- **A. Water containers (Gan HaTut, a historic shared water cistern):** measure exactly 4 L with 3 L and 5 L containers. It is a digital puzzle, not a pour into the real cistern. It needs animated fill/empty/pour, visible levels, valid-move constraints, reset, a hint, a move count, a bonus for the 6-move optimum, sounds that can be turned off, and a non-drag alternative.
- **B. The tomato deal (Mahane Yehuda economics):** a fictional large buyer offers to buy a farmer's whole crop at a lower price per kilo. Players use sliders for quantity, price and the share of the crop sold, and see revenue under each scenario and a threshold-price question. A separate, unscored-by-formula discussion follows on risk, dependency and bargaining power. No real company is portrayed.
- **C. Evidence reconstruction (Library):** assemble a record from a catalog identifier (an 18-digit system number such as `990035772790205171`), a shelf mark (e.g. `2013 A 11950`), title, date and a passage-dependent fact. Compare matching, ordering, drag-and-drop and tap-to-select.
- **D. Photo comparison:** a dated archival market photograph vs the present-day scene, using a before/after slider, magnifier, overlay or spot-the-difference.
- **E. Letters and languages:** at the Library's *Letters of Light* sculpture, Hebrew Alef, Latin A and Arabic Alif appear together; on site, Ladino words appear too. The puzzle covers letter selection, right-to-left words, transliteration and optional pronunciation, for players who don't read Hebrew.
- **F. Visual-location hunt:** a cropped image of a doorway, plaque, mosaic or inscription to find on site (no computer vision assumed).
- **G. Stakeholder dilemma:** stakeholder cards, needs and constraints, resource allocation, a consequence preview and a short written rationale. It is scored by the guide's rubric, not by the app, so the interaction only needs to capture and present the reasoning.

# OUTPUT

1. **Technology comparison table**: one row per option, columns as listed above, each cell cited and dated.
2. **Per-puzzle recommendation table**: rendering approach (DOM/SVG, Canvas or animation runtime), recommended library, state model in one line (for A, give the actual state tuple and the move set), validation method, hint logic, mobile touch constraints, accessible alternative, complexity (Low/Medium/High).
3. **Reusable templates**: which 3–5 components would serve future games (e.g. a drag/tap-to-match engine, an image-comparison slider, a sequenced-hint component).
4. **Puzzle B and G**: how other educational games separate objectively correct arithmetic from judgement-based decisions in scoring. Cite examples.
5. **Strongest case against** your recommended stack, such as license risk, a dependency abandoned since 2024, or a performance trap.

**Source priorities:** official docs, license pages and pricing pages of each library; npm and bundlephobia (or pkg-size.dev) for sizes; GitHub release activity; W3C WAI/ARIA Authoring Practices for accessible drag-and-drop alternatives; published performance benchmarks with dates.

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
