# Coding rules

These rules apply to application implementation. Keep components small, cohesive, and separated by responsibility. Do not create one large component that fetches data, transforms domain objects, owns interaction state, and renders the entire screen.

## Responsibility levels

### Route or page

Owns route composition and page-level metadata. It should select the feature entry point and avoid feature-specific data manipulation.

## Entity component convention

The `Index → List → Preview` pattern applies per entity or feature, not only to the Mosaic.

Use this naming shape:

```text
Index<Entity>   →   List<Entity>   →   Preview<Entity>
```

Examples:

```text
IndexMosaic     →   ListMosaic     →   PreviewMosaic
IndexSite       →   ListSite       →   PreviewSite
IndexDayTour    →   ListDayTour    →   PreviewDayTour
```

The convention makes responsibility discoverable for the whole team: `Index` coordinates, `List` prepares entity data, and `Preview` renders it.

### `Index<Entity>` — smart feature component

`Index<Entity>` is the feature entry point and smart component. For the Mosaic, the concrete name is `IndexMosaic`.

- Fetches or assembles the source data required by the Mosaic.
- Owns feature-level loading, error, and empty states when needed.
- Passes data and callbacks to child components through typed props.
- Does not contain detailed list transformations or presentational markup for every item.

### `List<Entity>` — data preparation boundary

`List<Entity>` is the data-manipulation boundary between the smart component and the preview. For the Mosaic, the concrete name is `ListMosaic` or `List` only when the feature context already makes the entity unambiguous.

- Receives source objects through props.
- Performs filtering, sorting, grouping, mapping, selection shaping, and other view-model preparation on those objects.
- Keeps transformations local, explicit, and typed.
- Does not fetch data or call external services.
- Passes the prepared props to `Preview<Entity>`; for the Mosaic, this is `PreviewMosaic`.

### `Preview<Entity>` — presentational component

`Preview<Entity>` renders the prepared entity preview. For the Mosaic, the concrete name is `PreviewMosaic`.

- Receives all display data through props.
- Renders layout, labels, states, and user-facing interactions.
- Does not fetch data, access repositories, or manipulate raw domain objects.
- Does not invent or paraphrase visitor-facing copy.
- Emits user actions through callbacks supplied by its parent.

## Prop volume and Context

The pattern may require many props. Do not solve that by moving all state into one oversized component or by passing unrelated props through every layer.

Use a typed React Context at the entity feature boundary when several deeply nested components need the same stable feature state, actions, or configuration.

- Put the provider near `Index<Entity>` so the feature owns its context lifecycle.
- Keep context values focused by concern, such as entity data, selection state, or actions; prefer multiple small contexts over one global object.
- Keep `List<Entity>` responsible for data preparation and `Preview<Entity>` responsible for rendering, even when they read context.
- Use props for direct parent-to-child data and one-off values; use Context for shared values that would otherwise be threaded through multiple layers.
- Expose a typed `use<Entity>Context` hook that fails clearly when used outside its provider.
- Memoize context values and callbacks when needed to avoid unnecessary subtree renders.
- Do not use Context to hide unrelated dependencies or replace a data-fetching boundary.

## General component rules

- Prefer one clear responsibility per component.
- Extract a component when it has a distinct responsibility, repeated structure, or independently testable behavior.
- Keep domain types and transformation helpers outside large JSX files when they are reusable or non-trivial.
- Prefer pure transformation functions for list manipulation; do not mutate input objects in place.
- Use typed props and stable IDs for related data.
- Keep data fetching at the smart/container boundary unless a feature-specific hook is explicitly responsible for it.
- Keep presentational components easy to render with fixture props in isolation.
- Avoid premature abstraction: do not create wrappers without a real responsibility or reuse case.
- Keep files reviewable; split a file when unrelated responsibilities begin to accumulate.

## Language direction and typography

- English is the application baseline. Set the default language and direction at the document level, and keep general typography and base layout rules on the global `html` and `body` SCSS rules.
- The application must support mixed English and Hebrew content without changing the global baseline.
- Use one reusable global `.rtl` SCSS utility class for Hebrew or other right-to-left content. Apply it to the smallest content boundary that needs RTL, such as a label, text block, or component subsection.
- Do not add one-off direction declarations to individual components when the reusable `.rtl` class is appropriate.
- RTL content must still inherit the shared typography tokens and remain accessible in mixed-direction interfaces.

## Data and copy boundaries

- Use the existing static data conventions until a different data layer is explicitly approved.
- Do not duplicate complete related objects when an ID reference is sufficient.
- Use `docs/content/israeli-mosaic-screen-copy.md` as the authoritative visitor-facing copy source.
- Do not paraphrase or invent screen wording during implementation.
- If approved copy is missing, stop and mark the content gap rather than writing placeholder copy as fact.

## Expected Mosaic flow

```text
route/page
  → IndexMosaic (fetch and assemble)
    → List (filter, sort, group, map, prepare view data)
      → PreviewMosaic (render and emit user actions)
```

If a future change makes this flow insufficient, document the reason in the active plan before changing the convention.
