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
