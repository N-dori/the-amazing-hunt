# The Memory Protocol (game app)

A standalone Next.js app in its own Docker image (`dori-game`), served at `/memory-protocol`. See `README.md` for layout, deploy and routing.

**Repo and branch:** this repo (`/root/projects/The-Amazing-Hunt`, remote `github.com/N-dori/the-amazing-hunt`) is the game, at the repo root. Work happens on `main`. The game used to live in the DORI platform monorepo (`apps/memory-protocol/`, branch `scavenger_hunt`); it now imports nothing from there.

Ground rules: never commit or push unless the user asks, no secrets in git, no photos or other images in git (they stay on disk, ignored by `.gitignore`; only `photo_index_ALL.csv` is versioned, the exceptions are app assets in `public/` and brand files in `design/inputs/brand/`), never read `.env` files, no browser review (the user reviews in the browser). This Next version differs from training data: read `node_modules/next/dist/docs/` before writing Next code. The host has no `node_modules`; the docs are inside a throwaway `node:22-alpine` container after `npm ci`.

Follow the rules in `.claude/rules/`:

- `coding.md`: component responsibilities (`Index → List → Preview`), types and data boundaries
- `scss.md`: styling, the same conventions as the editorial platform
- `content.md`: story, copy and evidence rules for game content
- `verify.md`: how to check work on this server

`docs/coding-rules.md`, `docs/content/methodology.md` and `docs/design/` are copies of the platform's documents, kept here for reference; the platform repo holds the originals.

Commands (`.claude/skills/`):

| Command | Does |
|---|---|
| `/game-verify` | Builds the game image and smoke-tests it in an isolated container; touches nothing live |
| `/game-deploy` | Deploys `dori-game` with `deploy/deploy.sh` (pull, build, health, smoke, rollback) |

Usual loop: change code, `npm test`, lint and type-check, `/game-verify`, commit when the user asks, `/game-deploy`.
