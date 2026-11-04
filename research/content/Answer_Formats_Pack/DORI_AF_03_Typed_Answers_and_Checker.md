# Typed Answers: Short Answer, Fill-in-the-Blank, and the Tiered Checker

**Status:** research synthesis, 4 Nov 2026; checker = owner design direction, not approved.

## Bottom line

Typing an answer can strengthen memory, but **only if players can produce it and get feedback**. Typing is not automatically better than choosing. DORI's three-tier checker closes the feedback gap. Children's ability to type in the street is still unknown.

## Evidence

| Finding | Label |
|---|---|
| Generation effect: producing beats reading, d = 0.40; whole answers 0.55; delays over a day 0.64; letter-scramble puzzles no benefit (−0.05) | OBSERVED: [Bertsch et al. 2007](https://mcdaniel97.github.io/Publications/Bertsch%20et%20al.%202007.pdf) |
| Short answer without feedback didn't help children in grade 6 and below; fill-in-the-blank helped 3rd graders; 5th graders benefited only with feedback | OBSERVED: [Moreira et al. 2019](https://www.frontiersin.org/articles/10.3389/feduc.2019.00005) |
| Very short answers were no better than multiple choice for retention and had lower first-try success | OBSERVED: [van Wijk et al. 2024](https://pmc.ncbi.nlm.nih.gov/articles/PMC11684041) |
| Adults type ~36 words per minute on phones, with 2.3% uncorrected errors | OBSERVED: [Palin et al. 2019](https://www.repository.cam.ac.uk/items/809c909b-9301-4cad-955d-998bdce7e0e0) |
| Children's phone typing | UNKNOWN |

## When typing fits (INFERRED)

- The word is **visible on site**: an inscription, a sign, a name on a plaque. This is fill-in-the-blank or short answer.
- Older children, teens and adults.
- The answer is short and meaningful, not an obscure spelling.

## When it doesn't

- Young children recalling unfamiliar names.
- Typing while walking.
- When the typing is harder than the thinking.

## Tiered checker (owner design, 4 Nov 2026)

| Tier | Method | Cost per 1,000 |
|---|---|---|
| 1. Deterministic | Normalise (case, spaces, Hebrew vowel marks, final letters), then exact match against accepted answers; numbers within a tolerance | $0 |
| 2. Semi-deterministic | Fuzzy (edit distance) match, synonyms, English↔Hebrew transliteration | $0 |
| 3. LLM via API | Only if tiers 1–2 fail. Returns `correct` / `partly` / `incorrect` / `unsure` | ~$0.04 with Claude Haiku 5.5, text only (rates read 4 Nov 2026) |

**Rules (INFERRED):**
- The LLM only classifies; the words players see come from approved content.
- Typed text is untrusted input; the model returns only the enum.
- Accept spelling near misses and show the correct spelling.
- Offline: run tiers 1–2 on the phone, and send `unsure` to self-confirm.
- Log tier-3 verdicts to grow the accepted-answer list.

## Competitor practice

- Every platform matches typed answers against an author-written list: Actionbound (pipe-separated variants), Loquiz ("several correct options"), Scavify ("must match").
- **No platform documents fuzzy matching or AI grading** (OBSERVED), so the tiered checker goes beyond the field.

## Unknown

- The checker's false-accept and false-reject rates on real family answers.
- Tier-3 latency.
- Children's typing speed.
