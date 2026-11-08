> **Copied from the DORI platform repo** (`docs/images-research.md`, 7 Nov 2026) as the source of the image pipeline's decisions. In this game: one "module" collection (the Memory Protocol's library, the map, the Shuk), served under each app's base path from `/srv/dori/game-media`. See [images-howto.md](images-howto.md).

# Images for /places: research and decisions

2026-11-07, branch `images-pipeline`. Plan: [`docs/plans/active/images-pipeline.md`](plans/active/images-pipeline.md).

## Setting
- **Hosting:** Next.js 16.3.8 runs with `next start` in Docker (512 MB, 1.5 CPU) on a Hetzner VPS behind revivo's Caddy.
- **Sources:**
  - phone photos of 3–6 MB
  - AI reconstructions
  - SVG diagrams
- **Originals:** kept outside the repo.
- **Before/after pairs:** must stay pixel-aligned.
- **Visitors:** phones outdoors on patchy 4G, 2–6 images per stop, 7–9 stops.

## Decision table

| # | Question | Chosen | Why | Source |
|---|---|---|---|---|
| 1a | Photo and AI-render format | **AVIF** primary, **WebP** fallback, in `<picture>`. No JPEG. | AVIF has been in all core browsers since January 2024 (iOS 16+). It compresses about 20% smaller than WebP at about 50% longer encode, which only costs laptop time. WebP is the universal fallback. | [web.dev Baseline 2024](https://web.dev/blog/baseline-project-2024); [choose the right format](https://web.dev/articles/choose-the-right-image-format); local `node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md` (`formats`) |
| 1b | Encoder settings | **Photo:** AVIF q58, effort 6, 4:4:4; WebP q80, effort 6, smartSubsample. **Render:** AVIF q54 / WebP q78. **Quality ladder:** if a variant is over its target, quality steps down by 4 to a floor of AVIF 44 / WebP 66. | Defaults are AVIF q50/effort 4/4:4:4 (iq-tuned since sharp 0.35) and WebP q80/effort 4. 4:4:4 keeps stone edges, thin lines and inscriptions. Effort 7 was tried, but it took about 30 s per image without changing the outcome. | [sharp output](https://sharp.pixelplumbing.com/api-output/); [sharp 0.35 changelog](https://sharp.pixelplumbing.com/changelog/v0.35.0/) |
| 1c | Diagrams | **Inline SVG components** (`ExplanatoryIllustration` pattern). A raster diagram gets WebP lossless at every width. | Sharp at any pixel density, and tiny. | local image.md (`unoptimized`: SVG does not benefit) |
| 1d | Widths and KB targets | **Widths:** AVIF 640/1080/1600; WebP 640/1080 only (diagrams: all three). **Targets for a 4:3 frame:** AVIF 45/110/220 KB, WebP 70/160 KB; taller images get proportionally more. **Hard caps:** 100/220/400 KB. | Inline images offer 640+1080 only, so a 390 px 3× phone picks 1080. The 1600 is for the full-size view; there, a browser without AVIF shows the 1080 WebP. Measured: a grainy 1967 scan made a 505 KB WebP at 1600 even at q68, while the AVIF was 198 KB. | [MDN responsive images](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images); samples below |
| 2 | Pre-generated or on-demand | **Pre-generated** on the laptop. /places never goes through `/_next/image`. | sharp decodes in native memory outside the V8 heap, and the container has 512 MB. A cold cache pays the AVIF encode on a visitor's request (`imgOptTimeoutInSeconds` defaults to 7). The disk cache has no invalidation; `minimumCacheTTL` defaults to 4 h. | local image.md (`minimumCacheTTL`, `maximumDiskCacheSize`); `next/dist/server/config-shared.js` (`imgOpt*`); [mit-learn PR #3983](https://github.com/mitodl/mit-learn/pull/3983); [next.js discussion #88603](https://github.com/vercel/next.js/discussions/88603) |
| 3a | Serving | **Next serves a read-only bind mount** (`/srv/dori/media/places` → `/app/public/media/places`). `headers()` sets `public, max-age=31536000, immutable` **only on content-hashed variant names**. | No change to revivo's Caddyfile, which lives outside this repo. Next serves `public/` with `max-age=0` by default. `headers()` may set Cache-Control except on Next's own hashed assets. `immutable` is only safe for versioned URLs. `next start` lists `public/` once at startup (`next/dist/server/lib/router-utils/filesystem.js`), so restart after rsync. | local `03-file-conventions/public-folder.md`, `05-config/01-next-config-js/headers.md` (Cache-Control, regex paths); [MDN Cache-Control](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control) |
| 3b | Caddy direct | **Later**, if Node's static serving shows up in CPU or memory. It would be `handle /media/places/* { root * /srv/dori/media; file_server; header Cache-Control "public, max-age=31536000, immutable" }` in revivo. | The `header` directive takes path matchers. | [Caddy file_server](https://caddyserver.com/docs/caddyfile/directives/file_server); [Caddy header](https://caddyserver.com/docs/caddyfile/directives/header) |
| 3c | CDN / object store | **Not now.** About 50 groups × 5 phones × 7 stops × ~1 MB ≈ 1.75 GB a month. Bunny EU is about $0.01/GB with a $1 monthly minimum; R2 has free egress and 10 GB of free storage. **Revisit for:** video, more than 10× the traffic, or measured latency from Israel. | The money is trivial; the extra moving part is not. | [Bunny pricing](https://bunny.net/pricing/cdn/); [R2 pricing](https://developers.cloudflare.com/r2/pricing/) |
| 4 | Page weight and loading | **Budget:** the 1080 AVIFs of one stop total ≤ 900 KB (≈4.5 s on Lighthouse's slow 4G, 1.6 Mbps). The lead image is ≤ ~110 KB (≈0.6 s). **Loading:** the lead image is eager with `fetchPriority="high"`, the rest are `loading="lazy"`; never both on one image. **Prefetch:** the next stop's lead image, by `fetch()` after load, skipped on `saveData`. | Lazy-loading the LCP image delays it. `fetchpriority` is a hint. | [web.dev lazy loading](https://web.dev/articles/browser-level-image-lazy-loading); [web.dev fetch priority](https://web.dev/articles/fetch-priority); [Lighthouse slow 4G](https://github.com/GoogleChrome/lighthouse/pull/6163) |
| 5 | Metadata | `autoOrient()`, then sharp's default output: converted to sRGB, **all metadata stripped** (EXIF including GPS, XMP, IPTC, ICC). Credit and licence live only in `data/places-images.json`. | sharp strips metadata and converts to sRGB unless `keepMetadata`/`withMetadata` is called. `autoOrient` reads EXIF orientation only. | [sharp output](https://sharp.pixelplumbing.com/api-output/); [sharp operations](https://sharp.pixelplumbing.com/api-operation/) |
| 6 | Git and Docker | **No /places binaries in git or in the Docker image.** Git holds the pipeline, the manifest, config and each place's hand-written `media-originals/<place>/sources.json` (credit, licence, crop, pairs); the manifest's source SHA-256 ties each record to its original in Drive. `public/media/` is in `.gitignore` and `deploy/Dockerfile.dockerignore`. No Git LFS. `.git` is already 293 MB. | GitHub recommends repos ideally under 1 GB and objects up to 1 MB, and blocks files at 100 MiB. LFS adds quotas and needs an LFS-aware server clone. Images baked into Docker multiply with `KEEP=3`. | [GitHub repository limits](https://docs.github.com/en/repositories/creating-and-managing-repositories/repository-limits); [large files](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github); [Git LFS](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-git-large-file-storage) |
| 7 | Service worker pre-cache | **No.** | The guide's tablet covers offline (DISCOVERY §8). WebKit deletes service worker registrations and caches after 7 days of Safari use without interaction (Home Screen apps are exempt), and drops unused caches after a few weeks. HTTP cache + `immutable` + prefetch gives most of the gain. | [WebKit tracking prevention](https://webkit.org/tracking-prevention/); [Workers at your service](https://webkit.org/blog/8090/workers-at-your-service/); [Safari 17 storage](https://webkit.org/blog/14445/webkit-features-in-safari-17-0/) |
| 8 | Review copies for Claude | `npm run images -- … --review <dir>`, outside the repo: JPEG q80, 1568 px long edge, metadata stripped. | Standard-tier models cap at 1568 px and about 1568 visual tokens (28×28 px patches); high-resolution models go to 2576 px. The limit is 10 MB per image; keep images ≤ 3000 px when many go in one request. | [Claude vision](https://platform.claude.com/docs/en/build-with-claude/vision) |

## Measured on stand-in samples (2026-11-07)

These are three Old City photos from `docs/sites/JLM_old_city/02_images_existing/`, standing in until the user supplies the real samples.

| Image | Original | 640 AVIF / WebP | 1080 AVIF / WebP | 1600 AVIF |
|---|---:|---:|---:|---:|
| pre-1967 border (grainy scan, 4:3) | 6093 KB | 31 / 36 KB | 97 (q54) / 156 KB | 198 KB (q50) |
| Jaffa Gate today (4:3, had GPS) | 3260 KB | 39 / 55 KB | 102 / 141 KB | 202 KB |
| Dormition (portrait, EXIF-rotated) | 3111 KB | 61 / 80 KB | 154 / 200 KB | 292 KB |

## Not verified
- caniuse tables, which were unreachable; AVIF support comes from web.dev Baseline and Apple release coverage.
- The KB targets beyond these three stand-ins; AI renders are not yet measured.
- Safari `rel=prefetch` support, and whether iOS Safari reuses a `fetch()` response for the `<img>`; a device check is needed.
- Hetzner's included traffic.
- Whether revivo's Caddy `encode` skips AVIF/WebP.
- ~~The server-side bind mount and restart~~: verified on the first deploy, 2026-11-07 (mount read-only, 200 + `immutable` inside the container and through Caddy).
