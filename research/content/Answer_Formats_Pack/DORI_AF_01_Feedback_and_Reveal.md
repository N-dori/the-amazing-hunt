# Feedback and Reveal: The Part of the Format That Matters Most

**Status:** research synthesis, 4 Nov 2026; pending owner decision.

## Bottom line

Small differences between formats matter less than **what happens after the answer**. The unit to design is *commit → reveal → short explanation tied to what is visible*, not *question → right or wrong*.

## Evidence

| Finding | Population | Label |
|---|---|---|
| Short answers **with** feedback gave the best 3-day retention. Without feedback, multiple choice was no better than rereading | 96 undergraduates | OBSERVED: [Kang et al. 2007](https://www.gwern.net/docs/spaced-repetition/2007-kang.pdf) |
| Corrective feedback (immediate or delayed) raised later recall and reduced wrong-answer intrusions from multiple choice | Adults | OBSERVED: Butler & Roediger 2008, via [Learning Scientists](https://www.learningscientists.org/blog/2018/8/2) |
| Meta-analysis of 116 digital feedback interventions: overall effect g = 0.41 (0.23 after bias correction). **Simple correctness feedback had the highest effect; the most elaborate the lowest.** Process-focused feedback beat task-focused. Delayed feedback was slightly stronger than immediate. Primary-school effect not significant | Ages 5+, studies 2004–2019 | OBSERVED: [Learning Environments Research, 2024](https://link.springer.com/article/10.1007/s10984-024-09501-4) |
| Pre-questions improve memory for the asked fact; spill-over to other facts is inconsistent | Review | OBSERVED: [Pan & Carpenter 2023](https://link.springer.com/10.1007/s10648-023-09814-5) |
| Children aged 9–12 learned from wrong predictions only if they had stronger inhibitory control | 51 children | OBSERVED: [Brod et al. 2020](https://www.pedocs.de/volltexte/2021/23315/pdf/Developmental_Science_2020_3_Brod_et_al_Being_proven_wrong_A.pdf) |
| In classrooms, short answers helped 5th graders **only with feedback** | Schools | OBSERVED: [Moreira et al. 2019](https://www.frontiersin.org/articles/10.3389/feduc.2019.00005) |

**Conflict to note:** the GPT run said "process-focused feedback was particularly useful". The meta-analysis also found that **simple** feedback outperformed **elaborate** feedback. Reading both together (INFERRED): keep the explanation short and about *how to see it*, not long.

## Design rules (INFERRED)

- Always show the **correct answer**; add **one short line on why**, pointing at the physical evidence.
- Label the reveal as fact, legend or interpretation (DORI principle).
- **Immediate feedback by default:** the family is standing at the evidence now. Delayed feedback is acceptable when the check is slow or offline.
- For children, make the correction **explicit**; don't rely on them noticing the gap.
- Never let a wrong option, or a legend, be the last thing a family sees.

## Competitor practice

- Explorama allows an explanation after each game (OBSERVED).
- Loquiz shows separate comments for correct and incorrect answers (OBSERVED, [feature list](https://loquiz.com/support/feature-list/)).
- Actionbound has hints after wrong answers and an answer reveal, but **no feedback tied to a specific wrong answer** ([forum, 2021](https://forum.actionbound.com/t/multiple-choice-answer-specific-hints/3932)).

## Unknown

- The ideal reveal length outdoors.
- Whether feedback timing matters for families as it does in schools.
