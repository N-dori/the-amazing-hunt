# ROLE / DECISION

Act as an engineer who ships LLM features in education products. Your research decides **whether the OpenAI API should write HARMONY's in-character responses to the pairs' open-ended answers at all**, and if so how. The other option is fully scripted responses. The decision is wanted for the one-family pilot and for a later reusable product.

# THE INTERACTION

In the story, HARMONY is the quantum system that erased a parallel Earth's history of conflict, and it is now learning from the players why that failed. At a heritage site, a pair receives a fictional present-day dilemma. Example: residents of an apartment building disagree about the cost and operating hours of a Shabbat elevator, after the pair has seen a historical shared water cistern at Gan HaTut. The pair submits a short written or spoken proposal and explains how the history informed it.

**The guide scores the proposal with a human-readable rubric** (stakeholders named, evidence-to-analogy, trade-offs recognised; up to 20 points). The app never scores it. HARMONY's reply is narrative feedback: it names the stakeholders the pair mentioned, points out possibly overlooked needs, separates historical evidence from new assumptions, asks one follow-up question, and says briefly what it has "learned".

**Hard constraints:** the model must not invent historical facts. It may use only a bounded, approved source packet for each site. It must keep fiction separate from history, never present a moral or political judgement as objective, and never change scores or unlocks. API keys stay server-side. The game must still be completable with no connection. The guide can hide or override any reply. Players include minors.

# RESEARCH QUESTIONS

1. **API surface (as of October 2026):** the Responses API vs Chat Completions, and Structured Outputs with JSON Schema (strict mode), including its limits and refusal handling. Which current models fit a short, low-latency, low-cost call? Give current per-token prices with the date you read them.
2. **Grounding:** the best current practice for restricting a reply to a supplied source packet, and how to detect and handle replies that go beyond it.
3. **Safety and moderation:** the Moderation API, prompt-injection risk from player-typed text, and handling minors' input. Also OpenAI's API data-retention and training defaults, the zero-data-retention options, and the Israeli Privacy Protection Law (Amendment 13) only where a source supports the point.
4. **Operations:** latency, rate limits, prompt caching, cost per game for 3 pairs × about 6 dilemmas, and timeouts with fallback to scripted replies.
5. **Evaluation:** how to test LLM feedback before a pilot, using golden answer sets, guide-agreement checks and red-team inputs.
6. **Voice (optional):** prerecorded HARMONY transmissions vs dynamic TTS vs realtime voice. Is dynamic voice worth its cost and complexity for a walking tour?

# COMPARE THREE OPTIONS

- **A. Fully scripted:** no API. The guide picks from predefined HARMONY replies for each dilemma, keyed to rubric outcomes.
- **B. AI-written replies:** the guide's rubric scores; the model only writes HARMONY's narrative reply, and the guide approves it before the pair sees it.
- **C. AI-assisted rubric suggestions:** the model suggests rubric marks to the guide, who confirms or changes them.

Compare them on technical complexity, fairness, learning value, cost, reliability and the chance of a wrong historical claim. Recommend one for a single-family pilot and one for a reusable product. Say plainly if the evidence suggests that, at this scale, an LLM adds risk without enough benefit.

# OUTPUT

1. Option comparison table (cited where facts are involved, INFERRED where it is judgement).
2. A draft JSON Schema for the reply, with these fields: historical_evidence_used, stakeholders_identified, needs_considered, tradeoffs_recognized, unsupported_assumptions, missing_perspectives, suggested_followup_question, harmony_character_response, needs_guide_review. Add validation and error-handling notes.
3. Backend flow: phone → own server → OpenAI → validation → guide approval queue → phone, plus the offline fallback.
4. A cost estimate table with dated prices and stated assumptions.
5. The strongest arguments against using an LLM here, with research on LLM feedback in education where it exists.

**Source priorities:** OpenAI platform docs, pricing page and API data-usage policy (dated); OpenAI cookbook; peer-reviewed or well-documented studies on LLM formative feedback (2023–2026); published education-sector guidance on AI and minors.
