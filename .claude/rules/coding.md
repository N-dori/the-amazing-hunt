# Coding rules (game)

These follow the platform's `docs/coding-rules.md`. Read it for the full reasoning; the game applies it with these entity names.

## Responsibility levels

- **Route or page** (`app/**/page.tsx`): route composition and metadata only. It selects the feature entry point and does no feature data manipulation.
- **`Index<Entity>`**: the smart feature entry point. It assembles source data, owns loading, error and empty states, and passes typed props and callbacks down.
- **`List<Entity>`**: the data-preparation boundary. It filters, sorts, groups and maps into view models with pure, typed functions. It never fetches.
- **`Preview<Entity>`**: presentational only. It renders props and emits user actions through callbacks. It never fetches, never touches raw domain objects, and never invents copy.

Expected game entities, for naming:

```text
IndexMission    →   ListMission    →   PreviewMission
IndexEvidence   →   ListEvidence   →   PreviewEvidence     (the shared evidence dossier)
IndexPuzzle     →   ListPuzzle     →   PreviewPuzzle
IndexTeam       →   ListTeam       →   PreviewTeam         (pairs and scores)
```

The guide dashboard is its own feature (`IndexGuide…`) and never shares a component with the player view only to save code.

## Context and props

- Put a typed React Context at the feature boundary, near `Index<Entity>`, when several nested components need the same stable state or actions. Prefer several small contexts over one global object.
- Expose a `use<Entity>Context` hook that throws a clear error outside its provider. Memoise context values.
- Use props for direct parent-to-child values. Do not use Context to hide dependencies or replace a data boundary.

## Game state

- Scores, unlocks and validation of objective answers (puzzles, catalog identifiers, observation answers) are deterministic code with tests. Never let a model or free text decide them.
- Crisis answers are scored by the guide's rubric. The app records the guide's marks and never computes them.
- Every player action that changes shared state must survive a dropped connection: queue it locally, then sync it. Design that in from the first feature, not later.

## General

- One clear responsibility per component; extract only for a distinct responsibility, repeated structure or testable behaviour.
- Domain types and non-trivial helpers live outside JSX files (`lib/`). Pure functions; never mutate inputs.
- Stable IDs for missions, stops, sources and evidence. Reference by ID rather than duplicating objects.
- Import from `@/` (the app root). Never import from the DORI platform repo; copy a shared piece deliberately and note where it came from.
- `lib/base-path.ts` is the only place the `/memory-protocol` path is written. Use `next/link` (which adds it); `next/image` `src` and manifest URLs need it added by hand.
- Keep files reviewable; split a file when unrelated responsibilities start to collect in it.
