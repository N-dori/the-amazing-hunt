# The Memory Protocol (game app)

A standalone Next.js app in its own Docker image (`dori-game`), served at `/memory-protocol`. See `README.md` for layout, deploy and routing.

**Two games in this repo.** The repo holds two separate games:

- **The Memory Protocol**: the HARMONY story game. Its story stays locked for this game.
- **The Amazing Shuk**: a real-world walking game in Nahlaot and Mahane Yehuda, with no sci-fi. Its sources are the brief in `research/prompts/DORI_UXUI_Designer_Agent_Prompt(1).md` (Part 2) and `design/inputs/content/`, not the Memory Protocol story. Design work happens under `design/` with the `dori-ux-designer` agent (`.claude/agents/`), which writes only to `design/output/`.

Don't mix the two: no HARMONY, Israelianes or crisis framing in The Amazing Shuk, and no Amazing Shuk content in the Memory Protocol.

**Repo and branch:** this repo (`/root/projects/The-Amazing-Hunt`, remote `github.com/N-dori/the-amazing-hunt`) is the game, at the repo root. Work happens on `main`. The game used to live in the DORI platform monorepo (`apps/memory-protocol/`, branch `scavenger_hunt`); it now imports nothing from there.

Ground rules: never commit or push unless the user asks, no secrets in git, no photos or other images in git (they stay on disk, ignored by `.gitignore`; only `photo_index_ALL.csv` is versioned, the exceptions are app assets in `public/` and brand files in `design/inputs/brand/`), never read `.env` files, no browser review (the user reviews in the browser). This Next version differs from training data: read `node_modules/next/dist/docs/` before writing Next code. The host has no `node_modules`; the docs are inside a throwaway `node:22-alpine` container after `npm ci`.

Follow the rules in `.claude/rules/`:

- `coding.md`: component responsibilities (`Index → List → Preview`), types and data boundaries
- `scss.md`: styling, the same conventions as the editorial platform
- `content.md`: story, copy and evidence rules for both games
- `verify.md`: how to check work on this server

`docs/coding-rules.md`, `docs/content/methodology.md` and `docs/design/` are copies of the platform's documents, kept here for reference; the platform repo holds the originals.

Commands (`.claude/skills/`):

| Command | Does |
|---|---|
| `/game-verify` | Builds the game image and smoke-tests it in an isolated container; touches nothing live |
| `/game-deploy` | Deploys `dori-game` with `deploy/deploy.sh` (pull, build, health, smoke, rollback) |

Usual loop: change code, `npm test`, lint and type-check, `/game-verify`, commit when the user asks, `/game-deploy`.

## Shared Amazing Shuk project memory

For Amazing Shuk work, follow the shared memory workflow referenced in `AGENTS.md` and read its linked decisions, current state, handoff, and canonical roadmap before meaningful changes. Keep this separate from the Memory Protocol app and preserve this file's existing instructions and Claude agent roles.

### Claude's next Shuk changes (24 Oct 2026)

Claude's review of the Codex work (`969ae8d..ca9cf1e`) and its findings are in `docs/project/agent-handoff.md`, under "Latest handoff - Claude review of Codex work". Planned, in this order:

1. Done, pushed as `61996f8`: `sessionView` in `lib/amazing-shuk/participant-store.ts` reads `state.json` without the lock or a write, so polling browsers don't contend with moves; tested with concurrent pollers.
2. Done, committed locally (not pushed): cups, performance, arrival and award are keyed by mission ID (schema 5, protocol revision 5), with a migration that keeps the well's data, credentials, roles and receipts; the catalogue in `lib/amazing-shuk/missions.ts` feeds the map.
3. Mission 2 is the mural challenge, "Is It Real or Is It Painted?" (owner decision, 24 Oct 2026), not the twelve-tribes door. Build it on the per-mission state with its own progress shape, only with a verified answer and approved copy.

Waiting on the owner: whether to keep the well puzzle's two-move solution, and whether to revise the well story's wording (cistern vs. well, the question answered too soon, the title).
