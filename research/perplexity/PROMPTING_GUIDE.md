> Copied from `mentor/docs/constructor/prompts/perplexity-research-prompting.md` on 2026-10-16. The same rules apply to ChatGPT Deep Research prompts.
# Perplexity Prompting Best Practices for Research

A prompt is the starting point of every session with Perplexity, and the quality of the output is tightly bound to how the question is framed. Vague prompts make Perplexity behave like a smart search box; structured prompts make it behave like a disciplined research assistant. Below is Perplexity's official five-element framework, followed by the research-specific practices that build on it — each with an explanation of *why* it matters.

---

## The Five Core Elements (Perplexity's Official Framework)

Perplexity's team recommends every prompt contain these five components.

### 1. Instruction — *say exactly what you want done*
State the action verb clearly: summarize, compare, synthesize, list, critique, outline.

**Significance:** Perplexity is a retrieval-and-synthesis engine, not a mind reader. "Summarize this research" is ambiguous — it doesn't know whether to summarize findings, methodology, or implications. A precise instruction narrows the response scope and reduces variability, so you get the *shape* of answer you actually need instead of a generic overview you have to re-prompt.

### 2. Context — *give background so the task is understood*
Supply audience, purpose, your role, and why you're asking.

**Significance:** Context lets Perplexity select the *right* information and pitch it correctly. "As an environmental scientist, explain the impact of climate change on coastal ecosystems" produces a fundamentally different (and more useful) answer than a bare "What is climate change?" Without context, the model fills the gap with assumptions — usually the most generic ones.

### 3. Input — *include the specific data or text to work on*
Paste the text, data, quotes, or upload the document Perplexity should operate on.

**Significance:** Grounding the prompt in concrete material keeps the answer anchored to *your* source rather than the open web's average take. This is what enables cross-referencing your own notes against live studies, and it dramatically cuts the risk of off-target or fabricated content because the model has something specific to reason over.

### 4. Keywords — *use the key terms of the domain*
Include precise technical or domain vocabulary.

**Significance:** Because Perplexity searches the live web in real time, the terms you use directly steer which sources it retrieves. Domain-accurate keywords surface authoritative, specialist sources; loose everyday language surfaces blogs and surface-level content. Keywords are effectively your search-quality dial.

### 5. Output Format — *specify how the answer should be structured*
Ask for a table, bulleted list, step-by-step guide, literature-review format, comparison matrix, etc.

**Significance:** Format isn't cosmetic — it changes how information is organized and how easy it is to scrutinize. Asking for a table instead of prose forces Perplexity to fill discrete cells, exposing gaps and making claims comparable side-by-side. For research, a demanded structure (e.g. authors / journal / year / DOI / key finding) makes the output verifiable and survivable under scrutiny.

---

## Research-Specific Best Practices

These extend the five elements for serious research work.

### 6. Constrain the timeframe
Specify a window: "from the past 90 days," "studies from the last decade," "since 2023."

**Significance:** Perplexity's core advantage is real-time web retrieval. Without a date bound it may blend stale and current material. A timeframe forces recency (or an explicit historical scope) so you're not reasoning over outdated conclusions.

### 7. Direct the sources
Tell it what to prioritize: "augment with academic papers," "prioritize peer-reviewed sources," "reference primary sources, not aggregators."

**Significance:** Every Perplexity answer is cited, but source *quality* varies. Explicitly nudging toward credible sources shifts it away from blog posts toward papers and primary data — the difference between a claim that survives review and one that doesn't.

### 8. Narrow the scope; don't ask for everything at once
Break broad topics into focused sub-questions. "Tell me about fashion" is too broad; "the environmental impact of fast fashion, with cost comparisons of sustainable alternatives" is workable.

**Significance:** Overloaded prompts spread the model thin and produce shallow coverage of everything. A narrow scope produces depth. Chain follow-up prompts to build breadth iteratively — Perplexity threads context across a session, so refinement compounds.

### 9. Request unresolved questions and counter-arguments
Ask it to surface open debates, limitations, and the strongest opposing view: "summarize the main arguments for and against X, with supporting data."

**Significance:** This adds analytical depth and guards against one-sided synthesis. Forcing the model to name gaps and disagreements turns a summary into a genuine research snapshot and helps you see where the evidence is actually contested.

### 10. Demand verifiable detail for citations
For literature work, require full publication details: authors, journal, year, DOI, methodology, sample.

**Significance:** Complete citation metadata lets you independently verify each source — essential because any AI can misattribute. Requiring DOIs and methodology also organizes findings by theme and framework, making the output a usable foundation rather than a list you have to re-research.

### 11. Use Deep Research / Research mode for large syntheses
For comprehensive reviews, invoke Perplexity's dedicated research mode, which runs dozens of searches and reads hundreds of sources.

**Significance:** Standard answers do a handful of searches; Research mode is built for breadth and produces structured reports. Matching the tool to the task scale is what turns hours of manual review into a single well-sourced pass.

### 12. Test, tweak, and iterate
Treat the first answer as a draft. Refine wording, tighten scope, and follow up.

**Significance:** Prompting is a method, not a one-shot trick. Because outputs carry some randomness and the web changes, iterative refinement within a threaded session is how you converge on a reliable, decision-grade result.

---

## Worked Example

**Weak prompt:**
> Tell me about GLP-1 drugs.

**Strong research prompt (all elements applied):**
> As a healthcare policy analyst *(context)*, create a comparison table *(output format)* of GLP-1 receptor agonists — semaglutide, tirzepatide, liraglutide *(keywords/input)* — summarizing efficacy, common adverse effects, and cost *(instruction)*, using peer-reviewed studies and regulatory filings from the last 3 years *(sources + timeframe)*. Include full citations with authors, journal, year, and DOI, and note any unresolved safety debates *(verifiable detail + counter-arguments)*.

---

## Quick Checklist

- [ ] Clear **instruction** (specific action verb)
- [ ] **Context** (audience, role, purpose)
- [ ] **Input** (the actual data/text/document)
- [ ] Domain **keywords**
- [ ] **Output format** specified
- [ ] **Timeframe** constrained
- [ ] **Sources** directed (academic/primary)
- [ ] **Scope** narrowed, not overloaded
- [ ] **Counter-arguments / open questions** requested
- [ ] **Verifiable citation detail** demanded
- [ ] Right **mode** chosen (Deep Research for large syntheses)
- [ ] Plan to **iterate**

---


*Sources: Perplexity Help Center — "Practical Tips for Using Perplexity" (updated May 1, 2026) and "Tips for Getting Better Answers"; supplementary guidance from DataStudios, Perplexity AI Magazine, and community Deep Search guides.*
