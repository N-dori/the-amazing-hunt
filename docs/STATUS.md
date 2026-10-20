# The Memory Protocol: its own repo - 2026-10-20

- The game moved out of the DORI platform monorepo (`apps/memory-protocol/`, branch `scavenger_hunt`) into this repo, `/root/projects/The-Amazing-Hunt`, at the repo root, on branch `main`. Image, container, compose project, `dori_net`, `game_data` and the `/memory-protocol` basePath are unchanged.
- Copied in: the owner's source photos (`docs/National_library/`, `docs/Nahlaot_Map/`), the story and tour texts (`docs/scavenger_hunt/`), the research prompts, results and runner (`research/`), and the platform documents the rules cite. Paths in older entries below refer to the monorepo layout.

# The Memory Protocol: game foundation in its own container - 2026-10-16

- New app `apps/memory-protocol/` (Next 16.3.8, standalone output, `basePath` `/memory-protocol`). It has a placeholder screen quoting only the Story V1 title and tagline, a PWA manifest and `/api/health`. There is no game logic yet.
- Own image `dori-game` and own compose project `dori-game` on `dori_net`. `deploy/deploy.sh` touches only the `dori-game` container. The platform image and root `tsconfig.json` exclude `apps/`.
- Verified: image built (332 MB) and ran isolated with no network, read-only and capped at 256 MB. It reported healthy, the game routes returned 200 and it used 36 MB.
- Not deployed, not routed: the Caddy `handle /memory-protocol*` block is written in the app README but not applied. Not checked in a browser.
- Research for the game: six Perplexity deep-research results in `prompts/resualts_preplexity/` (about $4.44 in total), from the prompts in `prompts/scavenger_hunt_research/`. The runner is `research/perplexity/`.
