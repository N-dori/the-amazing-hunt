# The Amazing Shuk — Development Roadmap

**Scope:** The Amazing Shuk only. The current Next.js app also serves The Memory Protocol at /memory-protocol.
**Updated:** 24 Oct 2026

## Now

**Rank 1 — Complete the first task loop: idea #24, water measurement.**
- **Objective:** let a simulated single group solve an existing research-bank task in the app.
- **Implemented slice:** virtual 300 ml/500 ml cup mechanics, exact 400 ml deterministic validation, one shared development session, answer-submitter enforcement, guide approval and fictional role switching.
- **Remaining acceptance:** verify the page/API in a running local Next server; confirm production returns 404; add approved reward values before task completion awards points or tokens.
- **Access:** set SHUK_DEV_SIMULATION=1 and bind Next to 127.0.0.1. Both page and API require development mode and a loopback Host; production always returns 404.

## Next

1. **Task-to-map flow:** add a usable market map with markers only for locations verified for navigation; open task details from a marker and report missing photo assets instead of substituting unrelated images.
2. **Shared progress and rewards:** add backend-owned task completion, idempotent shared points/tokens and guide-controlled redemption after reward values are approved. Persist safely and test duplicate/concurrent requests and restart.
3. **Four-screen onboarding:** explain the one-group route, task interactions, shared progress/rewards, and roles using approved copy.
4. **Operational task set:** reach six independently verified playable tasks first; ten is ideal if validated content and route time allow; use the task/source inventory in design/inputs/content/README.md.

## Later

- Self-hosted magic-link authentication and concurrency-safe local JSON storage on the VPS are approved but deferred until before real participants are invited.
- Offline queue/sync and consent-based photo verification follow a reliable shared task loop.

## Open Questions

- Approve point/token awards and food redemption costs; source research does not define token prices.
- Confirm vendors, current offers, prices, hours, allergens and group arrangements.
- Confirm deployment isolation before real access. Do not alter Caddy/VPS or deploy without explicit approval.

## Superseded experiment

design/prototypes/amazing-shuk-team-format/ remains isolated. Its team-count selection and competitive scoring are superseded by the one-group MVP.
