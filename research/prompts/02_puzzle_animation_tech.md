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
