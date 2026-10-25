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

### Where Claude's Shuk work stands (25 Oct 2026)

Start from the top entries of `docs/project/agent-handoff.md` and `docs/project/current-state.md`.

- Committed and pushed, the first three missions: three playable missions (the well; the mural; Chesed VeRachamim with its optional novel bonus and Eshet Chayil moment), the redesigned mission preview, the profile panel and role badges, the bottom navigation bar (Map, Mission, Food, Group), the mural's checkbox-card UX and the owner's location photos.
- Committed and pushed on 25 Oct:
  - Mission 4, the Montefiore gate (three languages; optional bonus, the year תרמ"ב hidden in בתמר).
  - Mission 5, Rabbi Aryeh Levin and Olei HaGardom (untimed, no hints; bonus at the Kramer-Rechtman plaque).
- Committed and pushed on 25 Oct, the Stitch design's first slice: the owner's Stitch mockups are in `docs/design/stitch-reference/` (untracked, the owner's), as a layout reference only. Built so far:
  - Plex Serif headings and Stitch surface tokens;
  - Thumbs avatars in a round frame;
  - the sticky slim header with the points and tokens chips;
  - the map as a rounded card;
  - the mission preview overlapping the map, with View Location always in view;
  - the location view as cards, with food tokens (no points) under Open Challenge.
- All missions share the dev page `/memory-protocol/dev/amazing-shuk/water`.

To run it on this server, the dev container must use the host network with Next bound to `127.0.0.1:3300` (`--network host`, `next dev --hostname 127.0.0.1 --port 3300`). With Docker's usual port mapping Next listens on `0.0.0.0`, and the Shuk API's loopback check then returns 404. The dev server writes the repo's `.next/`: don't delete it while `shuk-dev` runs. Invitation links: `docker exec -w /w shuk-dev npm run -s shuk:invite -- <player-1|player-2|…|guide> http://localhost:3300`.

Next:
- the owner's browser review of the Stitch slice (the eight preview checks in the handoff);
- possibly compact role pills on phones narrower than 22rem;
- then the challenge screens (C1) and Food (E1) in the Stitch style. The approved challenge rules win over Stitch: no moves counter, contextual controls, no hint penalties on buttons. Re-export the C1 and E1 screenshots first.

The photo rights audit is deferred by the owner.

Waiting on the owner:
- draft copy for all five missions, the UI labels and the alt texts (listed per slice in the handoff);
- rewards: every mission's rewards and both bonuses are provisional;
- mural image rights (product-decisions still says unresolved) and the before photo's source and rights;
- field checks:
  - every marker placement;
  - GPS points for Gan HaTut, the synagogue, the gate and Levin's home;
  - the gate's Arabic panel and its rosette;
  - whether the Kramer plaque is legible;
  - missions 1 and 4 share the gate photo;
- Luna: no source gives her relationship to Yitzhak Armoza; only the literary version is built;
- the well: keep the two-move solution? Story wording (cistern vs. well, the question answered too soon, the title)?
- the original photos left untracked in `public/shuk/` (move them to `design/inputs/photos/`);
- the Stitch slice's draft labels ("pts", "tokens", "Mission N · status", "+N food tokens"), whether to restyle the map markers (shared with the Memory Protocol), and whether to add the filter chips, map scale, path line or audio button;
- the app split (option 2 in `design/amazing-shuk-roadmap.md`), planned for before real-phone testing.
