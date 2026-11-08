#!/usr/bin/env node
// Copied from the DORI platform repo (deploy/check-assets.mjs) on 8 Nov 2026, with this repo's changes marked "Game:".
// Static asset check (no server, no dependencies: runs on the host before npm ci). Fails if app/,
// data/ or types/ reference a local media path that is not present in public/, including case
// differences. Image pipeline variants (/media/places/*, /media/modules/*) also get size budgets, the
// hashed filename shape and the absence of EXIF/XMP metadata. An older module's path (e.g.
// "/Judicial-Reform-conflict/Smotritch.png") is resolved through data/module-images.json to its variants.
// next/image is allowed only for SVG literals: raster images render through <Picture>, never re-encoded.
//
//   node check-assets.mjs <app-dir> [--media <dir>]           check, exit 1 on any problem
//   node check-assets.mjs <app-dir> [--media <dir>] --list    print the served paths (for the smoke crawl)
//
// --media: the folder served at /media. Default <app-dir>/public/media; on the server /srv/dori/media,
// which is bind-mounted into the container and never part of the image.

import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";

const appDir = process.argv[2];
const listOnly = process.argv.includes("--list");
const mediaFlag = process.argv.indexOf("--media");
const MEDIA_URL = "/media";
if (!appDir || !existsSync(join(appDir, "package.json"))) {
  console.error("usage: check-assets.mjs <app-dir> [--media <dir>] [--list]");
  process.exit(2);
}

// Game: this repo keeps components and data code in components/ and lib/ too.
const SOURCE_DIRS = ["app", "components", "data", "lib", "types"];
// Game: tests name made-up paths on purpose.
const isTest = (file) => /\.test\.[cm]?[jt]sx?$/.test(file);
// Game: paths Next answers itself, named in the Shuk's route allowlist (lib/amazing-shuk/shuk-routes.ts), not files.
const NEXT_ROUTES = new Set(["/favicon.ico"]);
const SOURCE_EXT = /\.(tsx?|jsx?|mjs|json|s?css|mdx?)$/;
const MEDIA_EXT = "png|jpe?g|webp|svg|gif|avif|ico|mp4|webm|mp3|pdf";
// A quoted string that starts with "/" and ends in a media extension.
const LITERAL = new RegExp("([\"'`])(/(?:(?!\\1)[^\\n])*?\\.(?:" + MEDIA_EXT + "))\\1", "gi");
// The same, but built with ${...}: cannot be verified statically.
const TEMPLATED = new RegExp("`[^`\\n]*\\$\\{[^`\\n]*\\.(?:" + MEDIA_EXT + ")`", "gi");

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const publicDir = join(appDir, "public");
const mediaDir = mediaFlag === -1 ? join(publicDir, "media") : process.argv[mediaFlag + 1];
const toUrl = (root, prefix) => (f) => prefix + "/" + relative(root, f).split(sep).join("/");
const mediaFiles = walk(mediaDir);
const available = new Set([
  // The media folder replaces public/media, whether or not a local copy also exists there.
  ...walk(publicDir).map(toUrl(publicDir, "")).filter((p) => !p.startsWith(MEDIA_URL + "/")),
  ...mediaFiles.map(toUrl(mediaDir, MEDIA_URL)),
]);
const availableLower = new Map([...available].map((p) => [p.toLowerCase(), p]));

// Older modules: legacy /public path -> its variant URLs (data/module-images.json, written by npm run images).
const moduleManifestPath = join(appDir, "data", "module-images.json");
const legacy = new Map(existsSync(moduleManifestPath)
  ? JSON.parse(readFileSync(moduleManifestPath, "utf8")).map((entry) => [entry.legacySrc, entry.variants.map((v) => v.src)])
  : []);

const referenced = new Map(); // path -> first file that references it
const templated = [];
const reencoded = []; // files that put a raster image through next/image
for (const dir of SOURCE_DIRS) {
  for (const file of walk(join(appDir, dir)).filter((f) => SOURCE_EXT.test(f) && !isTest(f))) {
    // Game: the app's base path prefix (`${BASE_PATH}/library/x.jpg`) is not part of the path; read it as the literal it is.
    const text = readFileSync(file, "utf8").replace(/\$\{BASE_PATH\}(?=\/)/g, "");
    const where = relative(appDir, file);
    for (const m of text.matchAll(LITERAL)) {
      if (m[2].startsWith("//") || m[2].startsWith("/_next/") || NEXT_ROUTES.has(m[2])) continue;
      if (!referenced.has(m[2])) referenced.set(m[2], where);
    }
    for (const m of text.matchAll(TEMPLATED)) templated.push(`${where}: ${m[0]}`);
    // next/image only for SVG literals (the wordmark); any other src would go through the server's re-encoder.
    // Game: <Image unoptimized> (the avatar's generated SVG data URI) is never re-encoded either.
    if (/from\s+["']next\/image["']/.test(text) && [...text.matchAll(/<Image\b([^>]*?)\bsrc=([^\s>]+)/g)].some((m) => !/\bunoptimized\b/.test(m[1]) && !/^["'][^"']+\.svg["']$/.test(m[2]))) {
      reencoded.push(where);
    }
  }
}

// Pipeline budgets for everything in the media folder (same caps as scripts/images/build-images.mjs).
const KB = 1024;
const CAP = { 320: 40 * KB, 640: 100 * KB, 1080: 220 * KB, 1600: 400 * KB };
const STOP_BUDGET = 900 * KB; // /places: sum of the 1080 AVIF variants per stop (the inline default)
const VARIANT_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*-(320|640|1080|1600)\.[0-9a-f]{8}\.(avif|webp)$/;
// Byte markers: JPEG/AVIF EXIF payload header, WebP EXIF/XMP chunks, AVIF "Exif" item type, XMP packets, GPS tags.
const METADATA_MARKERS = ["Exif\0\0", "EXIF", "XMP ", "Exif", "<x:xmpmeta", "exif:GPS"].map((m) => Buffer.from(m, "latin1"));
const budget = [];
const stopTotals = new Map();
for (const file of mediaFiles) {
  const url = toUrl(mediaDir, MEDIA_URL)(file);
  const name = url.split("/").pop();
  const bytes = statSync(file).size;
  const shape = name.match(VARIANT_NAME);
  if (!shape) { budget.push(`${url}: name is not <id>-<320|640|1080|1600>.<hash8>.<avif|webp>`); continue; }
  const width = Number(shape[1]);
  if (bytes > CAP[width]) budget.push(`${url}: ${(bytes / KB).toFixed(0)} KB > cap ${CAP[width] / KB} KB`);
  const head = readFileSync(file);
  // RIFF/ISOBMFF chunk names sit in the container header, so scan the whole (small) file.
  const marker = METADATA_MARKERS.find((m) => head.includes(m));
  if (marker) budget.push(`${url}: contains metadata marker ${JSON.stringify(marker.toString("latin1"))} (EXIF/XMP must be stripped)`);
  if (width === 1080 && shape[2] === "avif" && url.startsWith(MEDIA_URL + "/places/")) {
    const stop = url.split("/").slice(0, -1).join("/");
    stopTotals.set(stop, (stopTotals.get(stop) ?? 0) + bytes);
  }
}
for (const [stop, total] of stopTotals) {
  if (total > STOP_BUDGET) budget.push(`${stop}: 1080 AVIF total ${(total / KB).toFixed(0)} KB > ${STOP_BUDGET / KB} KB per stop`);
}
// A legacy module path is served as its variants: list those for the smoke crawl, check those for existence.
const served = new Map();
for (const [path, where] of referenced) {
  for (const url of legacy.get(path) ?? [path]) if (!served.has(url)) served.set(url, where);
}
const unreferencedMedia = mediaFiles.map(toUrl(mediaDir, MEDIA_URL)).filter((p) => !served.has(p));

if (listOnly) {
  console.log([...served.keys()].sort().join("\n"));
  process.exit(0);
}

const missing = [];
const caseMismatch = [];
for (const [path, where] of served) {
  if (available.has(path)) continue;
  const other = availableLower.get(path.toLowerCase());
  if (other) caseMismatch.push(`${path}  (file on disk: ${other})  in ${where}`);
  else missing.push(`${path}  in ${where}`);
}

console.log(`check-assets: ${referenced.size} referenced, ${served.size} served paths, ${available.size} files in public/ and the media folder`);
if (templated.length) {
  console.error(`\nTemplate-built media paths (cannot be checked statically):\n  ${templated.join("\n  ")}`);
}
if (caseMismatch.length) console.error(`\nCase mismatch (breaks on Linux):\n  ${caseMismatch.join("\n  ")}`);
if (missing.length) console.error(`\nMissing from public/ (or the --media folder):\n  ${missing.join("\n  ")}`);
if (budget.length) console.error(`\nImage variant budget or metadata:\n  ${budget.join("\n  ")}`);
if (reencoded.length) console.error(`\nnext/image used for a raster image (render it with <Picture> from app/components/media, never re-encode):\n  ${reencoded.join("\n  ")}`);
if (unreferencedMedia.length) {
  console.warn(`\nWarning: ${unreferencedMedia.length} file(s) in ${mediaDir} are in no manifest; review with\n  node deploy/prune-media.mjs ${mediaDir} data/places-images.json data/module-images.json`);
}

if (missing.length || caseMismatch.length || templated.length || budget.length || reencoded.length) {
  console.error("\ncheck-assets: FAILED");
  process.exit(1);
}
console.log("check-assets: OK");
