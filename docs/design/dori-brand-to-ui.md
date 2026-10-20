# DORI brand to UI

The DORI system is restrained, precise, editorial, warm, mature, culturally rooted without literal clichés, and human rather than corporate. Subtraction, precision, consistency, and intentional whitespace are core design behaviors.

## Approved palette

| Token | Hex | Intended role |
| --- | --- | --- |
| Ink | `#252B2A` | Text and structural elements |
| Warm Chalk | `#F3EFE6` | Primary background and warm surfaces |
| Za’atar | `#667054` | Supporting/context accents |
| Sumac | `#934A3A` | Emotional emphasis and selected states |
| Amber | `#C07A2E` | Secondary highlight |

Use the source brand prompt for the full rules: `docs/GPT_DORI_UI_Designer_Brand_to_Screen_Prompt(1).md`.

The supplied DORI brand assets are preserved under `docs/design/Dori_Brand/`. Use `DORI_Final_Brand_Book.pdf` as the visual reference and the supplied SVG/PNG logo files as approved assets when logo treatment is introduced. Do not infer or invent additional brand rules from filenames alone.

## Product translation

Avoid generic SaaS dashboards, glassmorphism, neon gradients, tourism clichés, decorative symbols, excessive cards, pills, shadows, and borders. Prefer editorial composition, clear hierarchy, calm motion, and content-led layouts.

## Implementation tokens

The palette is defined once as CSS custom properties in `app/globals.scss` (`--ink`, `--chalk`, `--zaatar`, `--sumac`, `--amber`). Components use these tokens, not raw hex values. Existing derived neutrals and states (`--chalk-tint`, `--chalk-shade`, `--chalk-highlight`, `--neutral-line`, `--sumac-deep`) are kept as tokens pending confirmation against the brand book.

Contrast roles on Warm Chalk (WCAG 2.2 AA):

- Ink 12.6:1 and Sumac 5.6:1 are safe for text at any size.
- Za'atar 4.6:1 is only for text on plain Warm Chalk. On any tint (`--chalk-tint` or Za'atar/Amber panel washes) it drops to about 4.0–4.2:1, so secondary text inside tinted panels uses Ink.
- Amber 3.0:1 is not used for small text. Use it for lines, borders, underlines, fills, or large display text.
