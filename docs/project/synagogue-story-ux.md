# Synagogue story, navigation and illustration — 25 Oct 2026

Owner requested a focused refinement using the existing DORI UX designer guidance, Brand Book system and shared mission presenters. Existing Ink/Chalk/Sumac tokens, IBM Plex typography, ActionButton and mission-image presenter remain. Continuous prose and reduced navigation follow the designer's restraint and outdoor readability guidance. No new palette, design system or agent file.

## Story evidence retained

The five short introduction lines adapt the existing synagogue story, retaining 1925; Sephardi families from the Old City; Chesed VeRachamim/Kindness and Mercy; the Ladino-speaking synagogue community; kindergarten, soup kitchens and Mazor's free care with volunteer doctors. Classification remains Historical fact in `lib/amazing-shuk/synagogue-task.ts`, together with the existing source constants. Only the visible labels are removed. Main answer, hints, blue-sign reveal, literary Luna bonus and unscored Eshet Chayil invitation retain their existing logic. The tavern explanation and family illustration render only after accepted completion; the tavern remains one of four unmarked answer options before submission.

Existing evidence/reference records:

- Owner photo #47: bilingual municipal heritage sign; #21: tiled founding inscription. These remain distinct from the fictional artwork.
- [Armoza family archive transcription](../armoza/Armoza_fam.md): Yad Izhak Ben-Zvi family collection via Lev Ha'Ir; existing catalogue account of 1925, synagogue and charitable services.
- [English tour, Stop 7](../scavenger_hunt/Machane_Yehuda_Tour_EN.md) and corresponding Hebrew tour/transcript: preserve historical sources and their limits.
- Novel references remain in `synagogue-task.ts`. The literary family is invented; no verified connection to the real synagogue family is asserted.

Well and mural retain natural attribution (“According to the local account”, “The story goes”) rather than presenting traditions as established events. Classification/source metadata and original Hebrew are retained. No collapsed Source section returns. Existing mural photograph caption is unchanged.

## Artwork provenance and rights boundary

Asset: `public/shuk/amazing_shuk_Armoza_period_family_illustration.png` (1312 × 1200), already supplied locally by the owner and described by them as newly generated period-inspired artwork. Inspected during this iteration; reused unchanged through the existing post-answer figure. Visible caption: **Illustrative reconstruction — not an archival photograph.** Alt text describes a fictional family in a stone courtyard. The filename does not identify the fictional subjects as actual people.

No new image was generated, copied from an archive, retouched, or redistributed from the original family photographs by this implementation. Existing archival originals under `public/Gan_ha_Tot/shuk/` and archive/source references remain untouched and are not referenced by the challenge UI. Their presence on disk is not clearance to publish them. No generation prompt, reference-input history, or separate licence grant was supplied for the new artwork; the owner's description and instruction are recorded here without inferring rights to any archival input. Replacing faces in an uncleared source would not clear that source's rights. The supplied artwork is untracked and remains on disk; it was not staged or committed.

## Navigation and accessibility

All four challenges use the shared left-arrow Back to location action and persistent Map tab. Existing history/session navigation and map view state remain; shared answers/progress still come from the server. Gateway's unsubmitted year draft is owned by the Index so it survives challenge unmounts during back/tab navigation, yields to a changed shared answer, and clears on successful sign-out. It remains a local draft, not an official submission.

Existing bottom-nav ResizeObserver measures the actual bar including safe-area padding; page padding, preview sheets and sticky choice submission bars reuse that offset. Added control scroll margins provide clearance for focus/scrollIntoView. No claim of real-device layout or screen-reader acceptance: check narrow phones, enlarged text, keyboard focus, home-indicator/keyboard spacing, browser Back, map pan/zoom restoration and the illustration/caption in the owner's browser.

## Modified files and verification

- Components under `components/amazing-shuk/dev/`: `IndexWaterTask.tsx`, `IndexWaterTask.module.scss`, `IndexGatewayTask.tsx`, `PreviewChoiceStory.tsx`, `PreviewChoiceStory.module.scss`, `PreviewWellStory.tsx`, `PreviewChoiceTask.tsx`, `PreviewChoiceBonus.tsx`, `PreviewAppreciation.tsx`, `PreviewGatewayTask.tsx`.
- Content/tests under `lib/amazing-shuk/`: `synagogue-task.ts`, `mission-arrival-ui.test.ts`, `mural-task-ui.test.ts`, `water-participant-ui.test.ts`, `shuk-navigation.test.ts`.
- Documentation: this record, `product-decisions.md`, `current-state.md`, `agent-handoff.md`.

Final Shuk suite: 127/127 pass. Memory Protocol: 61/61 pass. TypeScript no-emit/nonincremental passes. Shuk component/domain ESLint passes; full repository lint still fails on three pre-existing `no-require-imports` errors in `design/prototypes/amazing-shuk-team-format/prototype.test.cjs`, with eleven unrelated existing warnings. Both changed Sass modules compile. Diff whitespace check passes. No production build over the active development output; no server restart, live game action, commit, push or deployment.
