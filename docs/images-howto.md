# How to handle images (the game)

The DORI platform's image pipeline, brought into this repo on 8 Nov 2026 and reused as it is: the platform's how-to, with only what this repo changes. The reasons behind each rule are in [images-research.md](images-research.md).

**The rule:** every raster image the game shows goes through `<Picture>` (`components/media/Picture.tsx`) from pre-made AVIF and WebP copies. Never through `next/image`, which would re-encode it on the server. SVGs and the avatar's data URI are the exceptions.

## What lives where

| What | Where | In git? |
|---|---|---|
| Originals | `media-originals/modules/<name>/` (`library`, `map`, `shuk`) | **No** |
| Each original's description (`sources.json`) | the same folder | **Yes** |
| The copies ("variants": content-hashed AVIF and WebP) | `public/media/modules/…` locally; **`/srv/dori/game-media/`** on the server, bind-mounted read-only into `dori-game` and `dori-shuk` | **No** |
| The manifest | `data/module-images.json` (generated; don't edit by hand) | **Yes** |

**Why a separate root:** `/srv/dori/game-media` is this game's own, apart from the platform's `/srv/dori/media`. Each project's prune deletes whatever its manifests don't list, so a shared folder would let one project delete the other's files.

## sources.json

One entry per image, as the platform's older modules use:

```json
{ "file": "mural-street.jpg", "id": "mural-street", "legacySrc": "/shuk/mural-street.jpg", "kind": "photo",
  "credit": "The owner's photograph", "licence": "Own photo", "crop": { "left": 0, "top": 0, "width": 901, "height": 1500 } }
```

- **`legacySrc`** is the path the data files use (e.g. `lib/amazing-shuk/mural-task.ts`). The data files don't change: `<Picture src="/shuk/mural-street.jpg">` finds the copies through the manifest.
- **`kind`:** `photo`, `render` or `diagram`.
- **`credit` and `licence`** are required. "unrecorded" marks the ones still to find.
- **`crop`** is optional, in pixels of the upright original. It's the platform's fix for an image whose copies are over the caps.

## Running the pipeline

**On a laptop:**

```bash
npm run images -- --in media-originals/modules/shuk
npm run images:prune          # lists stale copies
npm run images:prune -- --apply
node deploy/check-assets.mjs .
```

**On this server** (no `node_modules` on the host): the same commands in a throwaway container. Check `free -h` first; the AVIF encode is slow, so run it in the background or in tmux.

```bash
docker run --rm -v "$PWD":/w -v /w/node_modules -w /w --memory 900m node:22-alpine sh -c \
  'npm ci --no-audit --no-fund && npm run images -- --in media-originals/modules/shuk'
```

The pipeline does everything the platform's does:
- strips all metadata, GPS included;
- makes AVIF at 320/640/1080/1600 and WebP at 640/1080;
- steps the quality down to meet the targets;
- **stops on anything over its hard cap** (100 KB at 640, 220 KB at 1080, 400 KB at 1600).

## Putting images on the server

1. Copy the copies to the server. Here that's `rsync -a --delete public/media/modules/ /srv/dori/game-media/modules/` on the same machine; from a laptop, `scp -r` or rsync.
2. Commit the manifest and `sources.json`, then `/deploy` or `/game-deploy`. `deploy/deploy.sh` runs `check-assets` against `/srv/dori/game-media` before it builds, and stops if a copy is missing, over its cap or carries metadata.
3. On the server, prune: `node deploy/prune-media.mjs /srv/dori/game-media data/module-images.json` (a dry run), then add `--apply`.
4. For an image-only change: restart `dori-game` and `dori-shuk` (Next lists `public/` once at startup). This is a live restart: the owner's OK first.

## What this repo changes from the platform

- **The base path:** the manifest keeps `/media/...`; `mediaSrc` (`data/media-images.ts`) and `<Picture>` add `/memory-protocol` or `/shuk`. `next.config.ts` sets `immutable` on `/media/:path*`.
- **The Shuk's route list** (`lib/amazing-shuk/shuk-routes.ts`) allows only `/media/modules/shuk/` and `/media/modules/map/`. The Memory Protocol's library copies stay a 404 there.
- **`check-assets`** also scans `components/` and `lib/`, skips tests, reads `` `${BASE_PATH}/…` `` paths as the literal paths they are, allows `next/image` with `unoptimized` (the avatar), and treats `/favicon.ico` as a route.
- **The map:** Leaflet needs one file, so `public/map/nahlaot-illustrated-candidate.jpg` stays; the copies serve the Shuk's welcome screen.
- **Not brought over:** `/places`, its manifest, blur placeholders and before/after pairs (the code is there, unused).

## Don't

- Don't commit originals or copies. Don't edit the manifest by hand.
- Don't use `next/image` for a raster image; the deploy's check fails.
- Don't put the game's copies in `/srv/dori/media` (the platform's).
