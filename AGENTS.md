# Repository Guidelines

## Project Structure

This repository/project is `the-amazing-hunt` and contains two games. The current Next.js app (`app/`, `components/`, `lib/game/`) is The Memory Protocol; The Amazing Shuk design lives under `design/`, and its isolated domain code belongs under `lib/amazing-shuk/`. Keep Shuk production features out of the app until a separate protected boundary is established. A local Shuk development simulation may live in this app only when both page and API require development mode, explicit opt-in, and loopback Host, and return 404 otherwise. `public/` holds served assets; `docs/` and `research/` hold project guidance and sources. `lib/base-path.ts` is the only source for the current app deployment prefix.

## Build, Test, and Development

- `npm run dev` starts the local Next.js server.
- `npm run build` creates a production build; `npm start` serves it.
- `npm run lint` runs ESLint.
- `npm test` runs Node tests in `lib/game/*.test.ts`.

Run lint and relevant tests for code changes; build after route, asset or deployment changes.

## Coding Style

Use TypeScript, typed props and existing ESLint conventions. Import app modules through `@/`. Keep domain types and non-trivial pure helpers in `lib/`; do not mutate inputs. Use stable IDs instead of duplicate domain objects. Keep components focused and files reviewable. Only `lib/base-path.ts` may contain `/memory-protocol` or `/shuk` (the Shuk build's prefix); use `next/link` for links and prefix `next/image` sources and manifest URLs manually. Keep owner photos out of Git; version only the photo index CSV.

## Game Architecture and Rules

Routes (`app/**/page.tsx`) compose features and metadata only. `Index<Entity>` assembles data and owns loading, error and empty states. `List<Entity>` uses pure, typed functions to filter, sort, group and map view models; it never fetches. `Preview<Entity>` renders props and emits callbacks; it never fetches, handles raw domain objects or invents copy. Use `IndexMission -> ListMission -> PreviewMission` and the same pattern for Evidence (shared dossier), Puzzle and Group (the single group, participant roles and shared progress). Do not build team-count selection or competing-team UI for The Amazing Shuk. Keep the guide dashboard in its own `IndexGuide...` feature, separate from player UI.

Use focused typed React Context near `Index<Entity>` for stable state or actions shared by nested components. Memoise values; expose a `use<Entity>Context` hook that throws outside its provider. Use props for direct parent-child data. Do not use Context to hide dependencies or replace data boundaries.

Scores, unlocks and objective-answer validation must be deterministic code with tests. The guide records crisis rubric marks; the app does not calculate them. Queue shared-state player actions locally and sync them so dropped connections do not lose them. Follow approved sources for visitor-facing copy. Do not import from the DORI platform repository; document the source when deliberately copying shared code.

## Tests and Contributions

Add or update `*.test.ts` coverage for game logic, especially scoring, unlocks and answer validation. Recent commit subjects are short and descriptive, often imperative (for example, â€œKeep photos out of gitâ€). PRs should describe scope and behavior, link a relevant plan or issue when available, list checks run, and include screenshots for visible UI changes.
## Content Rules

### Sources of Truth

The repository contains two separate games with separate sources. For **The Memory Protocol**, docs/scavenger_hunt/The_Memory_Protocol_Story_V1(1).md is locked: do not rewrite it, rename the Israelianes or HARMONY, or change its premise without explicit user approval. Use docs/scavenger_hunt/Memory_Protocol_New_Chat_Handoff_v02.md for gameplay, scoring proposals, evidence boundaries and open questions.

For **The Amazing Shuk** (Nahlaot and Mahane Yehuda), use Part 2 of research/prompts/DORI_UXUI_Designer_Agent_Prompt(1).md, plus mission/task ideas and the photo index in design/inputs/content/. Do not use the Memory Protocol story as a source: this game has no HARMONY, Israelianes, parallel Earth, library act or crisis layer. Map idea tags DOC and FIELD to **Historical fact**; map ORAL and FOLK to **Attributed tradition**.

For both games, research/results/ contains research, not approved content; claims need user approval before entering the game. Follow docs/content/methodology.md and keep treatment, interaction, question, source, guide move and renderer distinct.

### Copy and Evidence

Do not invent or paraphrase visitor-facing copy. If approved wording is missing, mark a content gap (for example, TODO(copy): ... in data) and report it; never show it as final. Write English first. Apply .rtl to Hebrew, Ladino or Arabic text as needed, with transliteration where players need it.

Every content item must have one visible label: **Historical fact** (cited source), **Interpretation** (reasoned reading), **Attributed tradition** (uncorroborated guide/community story), or **Fiction**. Fiction is for the Memory Protocol's HARMONY, Israelianes, parallel Earth and contemporary crisis scenarios. The Amazing Shuk has no fictional frame; use Fiction only for an invented game device, such as an altered "what's missing" image. The Amazing Shuk is the exception: by the owner's decision of 26 Oct 2026 it shows no labels on screen; the data still labels every statement and the wording carries the hedges (see `docs/project/product-decisions.md`). Never mix labels in one statement. A novel such as *The Beauty Queen of Jerusalem* documents its author's portrayal, not historical events.

### Evidence, Consent and Play Boundaries

- Do not attribute specific contracts or market-wide price effects to Rami Levy without a source.
- A catalog identifier alone does not prove a book was read; pair it with a passage-dependent answer.
- Confirm what an archival photo depicts before designing a visual task around it.
- Do not photograph or record bystanders or vendors without consent. Family-memory recording is opt-in and never published automatically.
- Camera, microphone and location must never be the only way to complete a task; always provide a text or guide-confirmation path.
- Do not use timed or competitive play at the hostage remembrance exhibit.
## Shared Project Memory

Before meaningful Amazing Shuk work, read `docs/project/product-decisions.md`, `docs/project/current-state.md`, `docs/project/agent-handoff.md`, and `design/amazing-shuk-roadmap.md`. Follow the decision priority recorded in the product decisions. After meaningful work, update current state and handoff with verified facts only. Keep Shuk production features isolated from the Memory Protocol until a separate protected app boundary is established; the opt-in loopback-only development simulation is the exception. Check Git status and preserve other agents' changes.

@CLAUDE.md
