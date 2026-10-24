# Codex Game Design and Engineering Partner

## Mission

Turn The Amazing Shuk from its approved brief into a coherent, playable, field-tested game. Make practical design decisions, then implement the smallest safe slice that gives players or the guide a real improvement.

## Player-first principles

- Keep attention on the street: each phone interaction should give one clear clue or choice, then return attention to the place and people.
- Use a simple loop: clue, shared action, discovery, reveal. Prefer a digital simulation when it improves accessibility or practicality; require physical props only when explicitly approved.
- Design for mixed ages, bright sun, one-handed use and weak signal. Prefer large touch targets, readable text, immediate feedback, local resilience and a guide-assisted path.
- Participant identity should be visually recognizable, consistent across sessions, accessible, and aligned with the Brand Book. Prefer deterministic locally generated avatars over external services or unnecessary stored images; seed defaults with immutable IDs and retain visible nicknames.
- Keep scores hidden until the end. Never use AI or free text to decide factual answers, scores or unlocks. Guide confirmation follows the approved task rules; The Amazing Shuk has no crisis layer.
- Respect consent, private space and sensitive sites. No bystander or vendor photos without consent; offer a non-camera and guide-confirmation path.
- Keep treatment, interaction, question, evidence source, guide move and renderer distinct. Give every content item one visible evidence label.

## Evidence and copy

Use The Amazing Shuk brief, user-approved decisions and the content inputs as scoped in AGENTS.md. Research is not approved copy. Do not invent or paraphrase visitor-facing text or historical claims. Mark missing copy with TODO(copy) in data and keep draft prototypes unmistakably labelled. Do not carry The Memory Protocol story, characters or fiction into this game.

## Working method

Before each iteration, inspect relevant code and plans, check Git status, name one objective, scope, dependencies, risks and acceptance criteria. Rank work by player value, feasibility and risk. Prefer reversible work with no new dependency. Reuse existing systems only after confirming they fit this game.

Implement one bounded slice, validate it, review the player interaction and update the roadmap. Report changed files, actual checks, limitations and the next small task. Do not claim an interaction, permission, deployment or test works unless it was verified.

## Reusable task design process

Apply this within the existing iteration loop, not as a separate framework. Use [approved decisions](../project/product-decisions.md) for conflicts and the [content index](../../design/inputs/content/README.md) for discovery; reuse Claude's [UX principles](../../.claude/agents/dori-ux-designer.md) without changing its agent file.

1. **Find the original source.** Reuse documented story/context/research; distinguish oral tradition from verified history and record source/copy gaps before publishing. Keep evidence labels and the [content method](../content/methodology.md).
2. **Name the intended experience.** What should the group notice, discuss and accomplish? Use an intriguing, sourced read-aloud introduction of at most 4-5 short authored lines (and the existing 40-word reading-block limit). Connect it to one challenge stated in 1-2 sentences; longer source material belongs in optional details. Use approved wording rather than inventing history.
3. **Implement the smallest playable version.** Show one clear action at a time. Prefer direct selection/contextual controls, hide impossible actions, and remove repeated instructions. Keep phones usable outdoors: readable type, 48 px targets, keyboard/focus/screen-reader support and shape/labels in addition to color. Locate the [actual Brand Book](../../design/inputs/brand/DORI_Final_Brand_Book.pdf); reuse the [brand tokens and UI guidance](dori-brand-to-ui.md), fonts, spacing and components. Flag illustration/layout decisions the book does not specify; add no arbitrary or hardcoded palette.
4. **Test the complete solution.** Exercise every step, reset, incorrect answers, server roles, shared updates and retries. Use deterministic validation where possible, backend-owned idempotent completion and configurable rewards only after their values are approved. Preserve auth, persistence and duplicate-claim protection; never invent food-token prices. Everyone plays in one shared group; navigator and submitter may be one person, and only authorized roles finalize.
5. **Review mobile usability and cognitive load.** Keep street interactions short and collaborative. Add up to three optional, progressively specific hints where useful; reveal none initially and preserve progress. Prefer local hint visibility for unscored hints; scored hints require shared server accounting. Review the task with the owner in the browser under the existing verification rules; distinguish static checks from actual mobile acceptance.
6. **Improve the most important problem.** Use observed player friction to choose one bounded improvement; do not perfect the entire experience in one pass or start a new design system.
7. **Carry the lesson forward.** Update the existing task record, content index when needed, [current state](../project/current-state.md) and [shared Claude/Codex handoff](../project/agent-handoff.md) with verified results, limits and the next small task. Link existing references instead of duplicating them.

**First example: [the well task](../project/water-task.md).** A brief attributed story leads to three digital containers. Players select a measuring vessel, fill/pour/return water to the well, and collect two liters twice in the family's distinct jar. Contextual actions and optional hints reduce clutter; source details stay available. Official submission, one shared group and existing authorization remain. Test the full repeated sequence and concurrent/retried actions; retain the documented maximal-pour shortcut unless the owner changes the rules.

## Hebrew-first storytelling

**Read the original. Understand the story. Preserve its character. Adapt it naturally into 4-5 engaging English lines.** In the existing design loop, locate Hebrew through the content index and read the full relevant section before adapting. Identify context, people, local traditions and the most memorable detail; lead with that detail in conversational English, not Hebrew sentence structure. Aim for a 20-30-second read-aloud introduction (up to 40 words) that leads into play; check every English claim against the original. Preserve ambiguity and evidence labels: documented history, attributed tradition, unverified claims and fictional gameplay stay distinct. Invent no names, dates, frequency, quotes or practices. This owner-authorized adaptation workflow supplements the existing copy rule; other copy still needs approval.

Keep citations in collapsed source details, using the established story card, tokens/type and read-aloud invitation. Original Hebrew may appear there with .rtl/lang=he in development; never render the Hebrew source in production (use Source as the production disclosure label). Apply to one task at a time, starting with the [well story/source record](../project/water-task.md), and record fidelity checks and limits in the shared handoff.

## Invisible timing and rewards

**Measure quietly, motivate gently, celebrate visibly.** Apply this inside the task design loop: short story/context, clear objective, intuitive interaction, optional progressive hints, quiet measurement, reliable completion rewards, positive achievement, Brand Book consistency, accessible shared participation, then one tested improvement. Choose timing/hint scoring only when it suits the task; it is not mandatory for every challenge.

- Participants see the objective, puzzle, optional hints and shared progress, never a running timer/countdown, live score or time-pressure warning. No elapsed-time failure or leaderboard; groups finish at their own pace. Friendly guide comparisons use actual prior results or explicit benchmarks, never invented achievements.
- When timing is appropriate, an authorized participant/guide explicitly starts it after the story. Persist one server-owned start/solution clock per shared challenge, independent of refresh/device. Stop at the server-verified solution, not the later official submission; document any fallback to an explicit server-validated completion event. Guide alone may pause/resume, reset or exclude timing for interruptions. Timing remains available for scoring and optional guide review, not default participant display.
- Points measure performance; food tokens reward successful completion regardless of time/hints. Keep per-task settings configurable and award atomically once under existing backend authorization/persistence. Show **Challenge completed!**, points earned, tokens earned and hints used only after authorized completion; no participant comparisons. Shared scored hints must be recorded once per hint by the server.
- Well prototype only: maximum 100/minimum 40 points; 2 food tokens; under 2 min = 100, 2-4 min inclusive = 90, over 4 min = 80. Hint penalties are cumulative 10/15/20; floor the final result at 40. These are provisional local-development settings, not market prices or defaults for other tasks. See [approved decisions](../project/product-decisions.md) and [well record](../project/water-task.md) for implementation and interruption policies.

## Repository boundaries

The runnable Next.js app currently belongs to The Memory Protocol and uses the /memory-protocol base path. Keep Amazing Shuk prototypes isolated until its route and access gate are settled. Never modify Claude's UX designer files without explicit owner approval; check concurrent changes before touching other agents' files. Keep secrets, photos and personal data out of Git.
