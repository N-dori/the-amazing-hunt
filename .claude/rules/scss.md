# SCSS rules (game)

Same conventions as the editorial platform (the platform repo's `app/globals.scss` and `*.module.scss` files). Visual identity comes from `docs/design/dori-brand-to-ui.md` and `docs/design/israeli-mosaic-ux.md`.

## Files

- `app/globals.scss` holds **only** the DORI tokens, the reset, the `html`/`body` baseline and shared utilities (`.rtl`, `.container`, `.stack`, `.cluster`, `.srOnly`). No component styles.
- Every component has its own `ComponentName.module.scss` next to its `.tsx`, imported as `styles`. Pages use `page.module.scss`.
- Shared styles between closely related components use `@forward "./Other.module";` (as the platform's Mosaic stages do), not copy-paste and not global classes.
- Use `@use "sass:math"` and other Sass modules only when needed. Never use `@import`.
- No Tailwind, no CSS-in-JS, no inline `style={}` except for a truly dynamic value (e.g. a water level percentage), and even then prefer a CSS custom property set inline and consumed in SCSS.

## Tokens

- Colours come from the custom properties: `--ink`, `--chalk`, `--zaatar`, `--sumac`, `--amber`, the derived neutrals and `--background` / `--foreground`. Never hard-code a hex in a module.
- Fonts come from `--font-body` and `--font-mono`: IBM Plex Sans and IBM Plex Sans Hebrew for body, IBM Plex Mono for mono, loaded in `app/layout.tsx`.
- Add a new token to `globals.scss` only when the brand doc supports it, and mark derived values as "not yet confirmed against the brand book", as the platform does.

## Naming and units

- Class names are camelCase (`.journeysHeading`, `.evidenceCard`). A modifier is its own class (`.cardActive`), not BEM `--`.
- Use `rem` for spacing, type and layout. Use `px` only for hairlines and other fixed details.
- Use `clamp()` for fluid type and spacing where the platform does (e.g. `clamp(2rem, 6vw, 4.5rem)`).

## Layout and responsiveness

- Mobile first: base styles are for phones at a 16 px side gutter, with no horizontal scroll.
- Widen with the platform's breakpoints: `@media (min-width: 48rem)`, then `@media (min-width: 64rem)`. Use a `max-width` query only when a rule truly applies to small screens only (the platform uses `max-width: 47.99rem`).
- Touch targets are at least `2.75rem` (44 px).
- Outdoor game screens (The Amazing Shuk, played in sun and on the move by every age) use at least `3rem` (48 px). This overrides the 44 px rule for those screens.
- Use `100svh`/`100dvh` rather than `100vh` for full-height phone screens.

## Icons

- Use `<Icon name="…" />` from `@/components/icons` for every UI icon. Never paste an inline `<svg>` into a component.
- A new icon is a new entry in `components/icons/iconPaths.tsx`: 24 × 24 grid, stroke only (the component supplies `currentColor`, 1.75 width, round caps and joins), and a zero-length `h.01` path for a dot.
- Size an icon from the parent module with `className` (e.g. `width: 1.25rem; height: 1.25rem;`); colour comes from the text colour.
- Icons are decorative by default. Pass `label` only when an icon stands alone and carries meaning, using approved copy. An icon-only button puts its label on the button.
- Illustrations (map, characters, puzzle artwork) are not icons; they are assets under `public/`.
- `app/dev/icons` lists the set in `next dev`; it returns 404 in production builds.

## Motion and direction

- Every animation or transition has a `@media (prefers-reduced-motion: reduce)` override that removes or shortens it.
- Hebrew and other RTL text uses the global `.rtl` class on the smallest boundary that needs it. Never add one-off `direction:` rules in a module.
- Use logical properties (`margin-inline`, `padding-block`, `inset-inline-start`) so mixed-direction layouts work.

## Look

Stitch mockups (`docs/design/stitch-reference/`) are a visual reference only, last in priority: follow the Stitch reference policy in `docs/project/product-decisions.md` and never paste their HTML, Tailwind, scripts or copy into the app. Colours always come from the brand tokens, never from a mockup.

Restrained, warm, editorial and illustrated. No neon sci-fi dashboard styling, even for HARMONY screens: the fiction is carried by the content and illustration, not by glowing UI chrome.
