# Amazing Shuk — Agent Handoff

**Last contributor:** Codex · **Session date:** 24 Oct 2026

## Milestone

First local task slice: idea #24, a digital 300 ml/500 ml cup puzzle shared by one simulated group. Six independently verified playable tasks are the initial MVP target; ten are ideal. Use Claude's existing content index and research as source leads.

## Implemented

- Server-side development session/action rules, deterministic exact-400 ml puzzle validation, fictional local personas, role switching, guide role assignment/approval, one shared in-memory state, and polling across local browser sessions.
- Navigator and answer-submitter may be the same participant.
- Dev page/API require development mode, SHUK_DEV_SIMULATION=1, and loopback Host. Production rejection is code-reviewed but not HTTP integration-tested.
- No reward values, image, map, persistent state, or authenticated production route. The task remains draft; balances stay zero.

## Exact implementation files

- lib/amazing-shuk/roles.ts and roles.test.ts
- lib/amazing-shuk/water-measurement.ts and water-measurement.test.ts
- lib/amazing-shuk/dev-water-session.ts and dev-water-session.test.ts
- app/api/amazing-shuk/dev/route.ts
- app/dev/amazing-shuk/water/page.tsx
- components/amazing-shuk/dev/IndexWaterTask.tsx, PreviewWaterTask.tsx, IndexWaterTask.module.scss

## Shared project files updated

- AGENTS.md and CLAUDE.md: shared-context discovery references; Claude's UX agent file was not changed.
- docs/project/product-decisions.md, current-state.md, agent-handoff.md
- design/amazing-shuk-roadmap.md and design/inputs/content/README.md
- design/output/01_assumptions.md and research/results/07_citecreation_market_mural.md
- docs/design/codex-amazing-shuk-partner.md

## Verification

- Focused Shuk tests: 13 passed.
- npm test: 61 passed (Memory Protocol regression suite only).
- git diff --check passed before the checkpoint updates; rerun after them.
- Next build, lint, browser/API and production-404 tests remain unverified. npm ci failed with ENOTEMPTY; Next/ESLint executables are unavailable.

## Decisions and source links

One shared group; shared progress/rewards; same participant may be navigator and answer-submitter. Self-hosted magic-link auth with VPS local JSON is approved but deferred; playable gameplay comes first. Temporary fictional users are local development only. Six verified tasks are the initial target, ten ideal. Preserve Claude UX agent files; do not modify them without explicit approval. Use design/inputs/content/README.md to navigate task, food, photo and research sources.

## Checkpoint commit

At checkpoint start, all files in the Git status were uncommitted. The owner then explicitly authorized staging, committing and pushing this listed project work. No deployment is authorized. The Claude UX agent file remains untouched.

## Next smallest task

Run the local harness after dependencies are repaired, then connect this task to a legally usable, geographically verified map/list entry.

Acceptance: one localhost session can operate the task; a second local browser sees the same state through polling; answer-submitter succeeds only at exactly 400 ml; follower submission is rejected; guide role assignment/approval works; production route/API return 404; no point/token reward is added until its value is approved.