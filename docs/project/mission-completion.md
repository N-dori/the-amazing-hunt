# Mission completion — 25 Oct 2026

One reusable player experience: celebrate the achievement, reveal the discovery, invite exploration. This presents the existing server result; it does not add a reward system.

## Review and iterations

Previously Well, choice missions and gateway each rendered their own reward markup. The Well retained vessels/reset, choice missions retained their original heading/options, and the gateway retained its year question. Synagogue extras followed completion. Guide timing sat beside a separate guide-controls disclosure. Rewards already came from persisted performance results.

**A:** Added shared `PreviewMissionVictory` for completed Montefiore. Its main question/form, hints/reset and read-aloud introduction disappear after acceptance. Four focused gateway/shared-victory checks passed, plus TypeScript, targeted lint and Sass. Tests include arbitrary persisted values, legitimate zeros and legacy completion with no award. Missing values display accessible “not recorded” dashes; no amounts/awards are invented.

**B:** Added `PreviewMissionDiscovery`: existing gateway explanation, Hebrew inscription → 5643 → 1883, and the requested heading. The explanation retains that 5643 spans 1882–1883 and the gateway is recorded as dating to 1883. Four focused checks passed again. Explore Next Mission uses the existing Index-owned map transition, not another route or destination selection.

**C:** Reused both presenters for Well, Mural and Synagogue through the existing Lists. Twenty-five focused UI checks passed, followed by a callback check across all four missions. Completed main questions, choices/vessels, start/submit/reset/hint controls and repeated answer feedback are replaced. Original historical information remains accessible in a collapsed story disclosure, without Source sections. Optional Luna bonus and Eshet Chayil appreciation remain in separate, initially collapsed disclosures after the next-mission action; validation/scoring/storage are unchanged. Timing review is nested in guide-only Guide controls; completed diagnostics are inside Development.

## Historical content and imagery

- Gateway uses existing `MONTEFIORE_TASK.reveal` and `GATEWAY_YEAR`. Roundel sources and distinction from the separate 1882 plaque remain in `montefiore-task.ts` and [handoff](agent-handoff.md). No new factual claims or photograph.
- Well reuses two existing story lines about children cleaning the cistern before the rains, retaining “According to the local account”. This is an attributed account, not new evidence of an event at this exact destination. Its historical story portion remains available without the active “Now measure” prompt. Original Hebrew/source metadata remain in the task and [well record](water-task.md).
- Mural reuses its first story paragraph as a short introduction to the existing before-image reveal. Photograph, alt text and caption are unchanged. Existing rights/source gaps remain unresolved; no new image or clearance is inferred.
- Synagogue retains the blue-sign/Armoza reveal, original introduction, fictional illustration and exact reconstruction caption. Luna remains literary fiction, with no invented connection to the real family. See [source/rights record](synagogue-story-ux.md). No archival family photo was added.

Victory copy is separate in `mission-completion.ts`: Montefiore uses the owner's “You cracked the code!” and mystery-solved sentence; the other missions retain “Challenge completed!”. Evidence classifications/citations remain in existing task metadata/documentation. No calculations, amounts, answers, hint penalties, authorization, GPS or mission records changed.

## Accessibility and mobile

The victory heading receives focus once on mount, making the transition discoverable without repeating an announcement on each shared-state poll. Rewards use a three-column definition list with wrapping labels/tabular numbers. The short entrance fade is disabled by `prefers-reduced-motion`. No confetti, timer, sound, leaderboard or new decorative asset. Existing IBM Plex and Ink/Chalk/Sumac tokens follow the Brand Book's subtraction/consistency, colour, typography and restraint guidance.

The full-width, normal-flow action, page padding and scroll margins reuse the measured bottom navigation/safe-area offset. Optional extras use native disclosures with 48 px summary targets and visible focus. Browser/device acceptance is still required.

## Verification

- Final Shuk regression: **129/129 pass**. Isolated fixture stores; no live invitations/actions/progress changes. Existing tests cover duplicate submissions/one-time awards, independent sessions/shared rewards and store/process reopen persistence.
- Memory Protocol regression: **61/61 pass**; its source is untouched.
- TypeScript `--noEmit --incremental false`, Shuk component/domain ESLint, new victory/discovery Sass, changed page Sass and `git diff --check`: pass.
- Full `npm.cmd run lint` retains the existing three `no-require-imports` errors in `design/prototypes/amazing-shuk-team-format/prototype.test.cjs` and eleven unrelated warnings.
- Real TSX static rendering checks all four completed/uncompleted states, one reward display, control removal, retained reveals/captions, Hebrew markup and missing rewards. Actual Explore callbacks restore the map stage without selecting a destination, retain the same map center/zoom object and completed marker states, and leave the server-view object unchanged.
- No production build over active `.next/`, restart, reset, commit, push or deployment.

Browser review: complete/revisit each mission in independent player/guide profiles; check remote completion, refresh and once-only rewards. Inspect heading announcement/focus, reduced motion, 320 px widths, enlarged text, home-indicator/keyboard spacing, imagery/captions, optional synagogue disclosures and map pan/zoom/completed markers after Explore. Fixture/static checks do not establish real two-browser or screen-reader acceptance.

## Files changed in this slice

- New: `lib/amazing-shuk/mission-completion.ts`; `components/amazing-shuk/dev/PreviewMissionVictory.tsx`, `PreviewMissionVictory.module.scss`, `PreviewMissionDiscovery.tsx`, `PreviewMissionDiscovery.module.scss`.
- Composition/presenters under `components/amazing-shuk/dev/`: `IndexGatewayTask.tsx`, `PreviewGatewayTask.tsx`, `ListChoiceTask.tsx`, `PreviewChoiceTask.tsx`, `ListWaterTask.tsx`, `PreviewWaterTask.tsx`, `IndexWaterTask.tsx`, `IndexWaterTask.module.scss`, `IndexGuideWaterTask.tsx`.
- Tests under `lib/amazing-shuk/`: `mission-arrival-ui.test.ts`, `mural-task-ui.test.ts`, `water-participant-ui.test.ts`.
- Documentation: this record, `product-decisions.md`, `current-state.md`, `agent-handoff.md`, canonical roadmap. Earlier local source/settings/photo changes are preserved.
