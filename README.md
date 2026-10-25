# The Memory Protocol (game)

The scavenger-hunt game, as its own Next.js app in its own Docker image (`dori-game`), deployed separately from the DORI platform. It is served at the path `/memory-protocol` on an existing DORI domain.

- **Story and plan:** `docs/scavenger_hunt/` (Story V1 is locked). The product scope is `docs/DORI_Memory_Protocol_Approved_Build_Spec_v1.md` here, as amended on 16 Oct 2026. Current state and open items are in `docs/HANDOFF.md`.
- **Research:** dated Perplexity results in `research/results/`, from the prompts in `research/prompts/`, run with `research/perplexity/`.
- **Source material** (the owner's photos and references, not served by the app): `docs/National_library/` (Library displays and artworks), `docs/Nahlaot_Map/` (map references), `docs/armoza/` (Armoza family archive), `docs/map/` (map audit). `docs/archive/` holds the pre-amendment spec. `docs/STATUS.md` is the game's status log.
- **Platform references:** `docs/coding-rules.md`, `docs/content/methodology.md` and `docs/design/` are copies of the DORI platform's documents that `.claude/rules/` cite.
- **Status:** a clickable visual prototype on local state.
  - **National Library chapter** (a fixed sequence): **00A** introduction (welcome, team, HARMONY transmission) → **00B** historical timeline, 1946 → **00C** parallel discoveries (Team A, The Traveler's Prayer; Team B, Broken Time) → **00D** Armoza archival investigations → **00E** shared evidence reveal and Nahlaot unlock. 00A–00C are built; 00D and 00E are not.
  - **Map:** the illustrated Investigation Map is in the player flow, as a concept map that is not for navigation.
  - **Server:** a session engine with SQLite persistence and guide overrides exists, with tests, but the UI doesn't use it yet.

## Layout

| Path | What |
|---|---|
| `app/`, `components/`, `lib/` | App Router pages (`api/health` is the container healthcheck), components, game logic and its tests |
| `lib/base-path.ts` | `/memory-protocol`, used by `next.config.ts` and the manifest |
| `Dockerfile` | Two-stage build to Next's `standalone` output; runs as `node` |
| `deploy/compose.yml` | Compose project `dori-game`: one container on `dori_net`, read-only, 256 MB, no host ports |
| `deploy/deploy.sh` | Pull, build, switch, wait for healthy, smoke check, automatic rollback. It touches only `dori-game` |
| `docs/`, `research/` | Planning, source material and research; excluded from the image by `.dockerignore` |

The app pins the same Next and React versions as the DORI platform. It used to live in the platform monorepo at `apps/memory-protocol/` and imports nothing from it.

## Local preview

`dori-game-preview` on `127.0.0.1:3200`, not live. How to build, start and open it: `docs/RUN_PREVIEW.md`.

## Deploy

```bash
tmux new -s game-deploy /root/projects/The-Amazing-Hunt/deploy/deploy.sh
```

It refuses to run outside tmux, with under 800 MB of free memory, with disk use over 85%, off `main`, or with uncommitted changes to tracked files. When an `origin` remote is configured it fast-forwards to `origin/main` first, so deploy only what has been pushed; without a remote it builds the local `HEAD`.

## The Amazing Shuk app

The same repo also builds the Amazing Shuk as its own app: `docker build --build-arg DORI_APP=shuk`, base path `/shuk`, container `dori-shuk` (`deploy/shuk-compose.yml`).

- **Deploy:** `tmux new -s shuk-deploy '/root/projects/The-Amazing-Hunt/deploy/deploy.sh shuk'`.
- **Address:** `https://doriisrael.com/shuk`, through the `@shuk` handle in the `doriisrael.com` block of `/root/projects/Tour-Tech/caddy/dori.caddy`.
- **Access:** single-use invitations from `tools/scripts/shuk-invite.ts` inside the container.

## Routing (Caddy)

The container is only reachable once revivo's Caddy routes the path to it. The change goes in `/root/projects/Tour-Tech/caddy/dori.caddy`, inside the shared `(dori_platform)` snippet and before the catch-all `handle`. It then applies to both `trip.` and `app.`, behind their existing passwords:

```caddy
	handle /memory-protocol* {
		reverse_proxy dori-game:3000
	}
```

No path stripping is needed: the app's `basePath` expects the prefix. Reload Caddy with a config reload, not a container restart. The proxy serves live traffic, so validate the config first.
