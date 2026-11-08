#!/usr/bin/env node
// Copied from the DORI platform repo (scripts/images/build-images.mjs) on 8 Nov 2026, unchanged apart from this line.
// Image pipeline for every raster image on the site: /places and the older modules. Runs on the laptop only
// (sharp is a devDependency).
//
//   npm run images -- --in media-originals/<places|modules>/<name> [--review <dir>] [--only <id>]
//
// Input: a folder in media-originals/ (gitignored) with sources.json and the original files (any filename,
// Hebrew included). Output: content-hashed AVIF + WebP variants under public/media/ (gitignored and
// dockerignored; they reach the server by rsync only) and a committed manifest. Research and decisions:
// docs/images-research.md; how-to: docs/images-howto.md.
//
// A place (/places):
// {
//   "place": "old-city-jerusalem",
//   "images": [{ "file": "…", "id": "g03-jaffa-gate-1948", "stop": "jaffa-gate", "gid": "G03",
//                "kind": "photo" | "render" | "diagram", "credit": "…", "licence": "…",   // gid may be null
//                "crop": { "left": 0, "top": 0, "width": 4000, "height": 3000 } }],   // crop optional
//   "pairs": [["g20-…", "g23-…"]]                                                       // compare pairs, optional
// }
//   -> public/media/places/<place>/<stop>/<id>-<w>.<hash8>.<fmt>, manifest data/places-images.json
//
// A module (the older chapters; components render <Picture src="/the/old/public/path.png">):
// {
//   "module": "judicial-reform-conflict",
//   "images": [{ "file": "Smotritch.png", "id": "smotritch", "legacySrc": "/Judicial-Reform-conflict/Smotritch.png",
//                "kind": "render", "credit": "…", "licence": "…" }]
// }
//   -> public/media/modules/<module>/<id>-<w>.<hash8>.<fmt>, manifest data/module-images.json
//   legacySrc is the path the data files use; the manifest maps it to the variants.

import sharp from "sharp";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
// Modules add a 320 px AVIF for small avatars and thumbnails.
const COLLECTIONS = {
  place: { dir: "places", manifest: "places-images.json", widths: [640, 1080, 1600] },
  module: { dir: "modules", manifest: "module-images.json", widths: [320, 640, 1080, 1600] },
};
// WebP is only the fallback for browsers without AVIF, so it is 640 and 1080 only: their full-size view shows the 1080.
// A diagram has no AVIF, so its WebP covers every width.
const formatWidths = (widths, kind, format) => (format === "webp" && kind !== "diagram" ? [640, 1080] : widths);
// Targets warn, caps fail. Same caps as deploy/check-assets.mjs (KB, 1 KB = 1024 bytes).
const TARGET_KB = { avif: { 320: 15, 640: 45, 1080: 110, 1600: 220 }, webp: { 320: 25, 640: 70, 1080: 160, 1600: 320 } };
const CAP_KB = { 320: 40, 640: 100, 1080: 220, 1600: 400 };
const ENCODERS = {
  photo: { avif: { quality: 58, effort: 6, chromaSubsampling: "4:4:4" }, webp: { quality: 80, effort: 6, smartSubsample: true } },
  render: { avif: { quality: 54, effort: 6, chromaSubsampling: "4:4:4" }, webp: { quality: 78, effort: 6, smartSubsample: true } },
  diagram: { webp: { lossless: true, effort: 6 } },
};
// Quality ladder: when a variant is over its target, step quality down to this floor (never lower, to keep
// stone texture and inscriptions). Only a variant still over the hard cap at the floor steps on, down to
// CAP_FLOOR (a tall portrait or a very detailed photo; the WebP is only the fallback for browsers without AVIF).
// Still over the cap at CAP_FLOOR = fail.
const QUALITY_FLOOR = { avif: 44, webp: 66 };
const CAP_FLOOR = { avif: 36, webp: 58 };
const QUALITY_STEP = 4;
// Targets assume a 4:3 landscape frame; taller images get a proportionally larger target.
const areaScale = (width, height) => Math.max(1, height / (width * 0.75));
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const GID = /^G\d+b?$/;

function fail(message) {
  console.error(`images: ${message}`);
  process.exit(1);
}

function argValue(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

const inputDir = argValue("--in");
const reviewDir = argValue("--review");
const onlyId = argValue("--only");
if (!inputDir) fail("usage: npm run images -- --in media-originals/<places|modules>/<name> [--review <dir>] [--only <id>]");
const sourcesPath = join(inputDir, "sources.json");
if (!existsSync(sourcesPath)) fail(`missing ${sourcesPath}`);
// media-originals/ is the gitignored, dockerignored home for originals inside the repo; anywhere else in the repo is a risk.
if (resolve(inputDir).startsWith(repoRoot + sep) && !resolve(inputDir).startsWith(join(repoRoot, "media-originals") + sep)) {
  console.warn("images: warning: originals are inside the repo outside media-originals/; move them there or outside the repo");
}

const sources = JSON.parse(readFileSync(sourcesPath, "utf8"));
const type = "place" in sources ? "place" : "module" in sources ? "module" : fail('sources.json needs "place" or "module"');
const collection = COLLECTIONS[type];
const name = sources[type];
if (!SLUG.test(name ?? "")) fail(`"${type}" must be an ASCII kebab-case slug, got ${JSON.stringify(name)}`);
const WIDTHS = collection.widths;
const mediaRoot = join(repoRoot, "public", "media", collection.dir);
const manifestPath = join(repoRoot, "data", collection.manifest);
const images = sources.images ?? [];
const pairs = sources.pairs ?? [];

// 1. Validate input.
const byId = new Map();
for (const image of images) {
  const label = `image ${JSON.stringify(image.id ?? image.file)}`;
  if (!SLUG.test(image.id ?? "")) fail(`${label}: id must be ASCII kebab-case`);
  if (byId.has(image.id)) fail(`${label}: duplicate id`);
  if (type === "place") {
    if (!SLUG.test(image.stop ?? "")) fail(`${label}: stop must be ASCII kebab-case`);
    // null = no row in the generation list yet (say why in "note").
    if (image.gid !== null && !GID.test(image.gid ?? "")) fail(`${label}: gid must look like G03 or G15b, or be null`);
  } else if (!/^\/[^\n]+\.[a-z0-9]+$/i.test(image.legacySrc ?? "") || images.some((other) => other !== image && other.legacySrc === image.legacySrc)) {
    fail(`${label}: legacySrc must be the unique /public path the data files use`);
  }
  if (!ENCODERS[image.kind]) fail(`${label}: kind must be photo, render or diagram`);
  if (!image.credit || !image.licence) fail(`${label}: credit and licence are required`);
  if (!existsSync(join(inputDir, image.file ?? ""))) fail(`${label}: file not found: ${image.file}`);
  byId.set(image.id, image);
}
const pairIdsOf = new Map();
for (const pair of pairs) {
  if (!Array.isArray(pair) || pair.length !== 2) fail(`pair ${JSON.stringify(pair)}: must list exactly two ids`);
  for (const id of pair) {
    if (!byId.has(id)) fail(`pair ${JSON.stringify(pair)}: unknown id ${id}`);
    const partner = pair.find((other) => other !== id);
    pairIdsOf.set(id, [...new Set([...(pairIdsOf.get(id) ?? []), partner])].sort());
  }
}

// 2. Masters: orientation from EXIF applied, then the optional crop. Metadata is dropped at encode time.
// Masters are lossless PNG: a plain toBuffer() would re-encode a JPEG original at q80 before the variants.
const lossless = (pipeline) => pipeline.png({ compressionLevel: 1 }).toBuffer();
async function loadMaster(image) {
  const input = readFileSync(join(inputDir, image.file));
  let buffer = await lossless(sharp(input).autoOrient());
  if (image.crop) buffer = await lossless(sharp(buffer).extract(image.crop));
  // A fully opaque alpha channel carries nothing but costs bytes in every variant: drop it.
  if ((await sharp(buffer).metadata()).hasAlpha && (await sharp(buffer).stats()).isOpaque) buffer = await lossless(sharp(buffer).removeAlpha());
  const { width, height } = await sharp(buffer).metadata();
  return { buffer, width, height, sourceBytes: input.length, sourceSha256: createHash("sha256").update(input).digest("hex") };
}

const masters = new Map();
for (const image of images) masters.set(image.id, await loadMaster(image));

// 3. Pair check before encoding: same master dimensions and same crop, or nothing is written.
const sameCrop = (a, b) => JSON.stringify(a.crop ?? null) === JSON.stringify(b.crop ?? null);
for (const [idA, idB] of pairs) {
  const [a, b] = [masters.get(idA), masters.get(idB)];
  if (a.width !== b.width || a.height !== b.height) {
    fail(`pair ${idA} / ${idB} is not aligned: ${a.width}×${a.height} vs ${b.width}×${b.height}. Re-export both at the same size, or give both the same crop.`);
  }
  if (!sameCrop(byId.get(idA), byId.get(idB))) fail(`pair ${idA} / ${idB} is not aligned: the crops differ`);
}

// 4–5. Variants and blur placeholder.
const shortHash = (buffer) => createHash("sha256").update(buffer).digest("hex").slice(0, 8);
const toPosix = (path) => path.split(sep).join("/");
const previous = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : [];
const entries = previous.filter((entry) => entry[type] !== name || (onlyId && entry.id !== onlyId));
const rows = [];
const overCap = [];

for (const image of images) {
  if (onlyId && image.id !== onlyId) {
    if (!entries.some((entry) => entry.id === image.id)) fail(`--only ${onlyId}: ${image.id} has no previous manifest entry; run without --only first`);
    continue;
  }
  const master = masters.get(image.id);
  const outDir = type === "place" ? join(mediaRoot, name, image.stop) : join(mediaRoot, name);
  mkdirSync(outDir, { recursive: true });
  const variants = [];
  for (const width of WIDTHS) {
    for (const [format, options] of Object.entries(ENCODERS[image.kind])) {
      if (!formatWidths(WIDTHS, image.kind, format).includes(width)) continue;
      // No keepMetadata/withMetadata: sharp converts to sRGB and strips EXIF (incl. GPS), XMP, IPTC and ICC.
      const resized = await sharp(master.buffer).resize({ width, withoutEnlargement: true }).toBuffer();
      const encode = (quality) => sharp(resized)[format](quality === undefined ? options : { ...options, quality }).toBuffer({ resolveWithObject: true });
      let quality = options.quality;
      let { data, info } = await encode(quality);
      const target = TARGET_KB[format]?.[width] && TARGET_KB[format][width] * areaScale(info.width, info.height) * 1024;
      while (!options.lossless && target && data.length > target && quality - QUALITY_STEP >= QUALITY_FLOOR[format]) {
        quality -= QUALITY_STEP;
        ({ data, info } = await encode(quality));
      }
      while (!options.lossless && data.length > CAP_KB[width] * 1024 && quality - QUALITY_STEP >= CAP_FLOOR[format]) {
        quality -= QUALITY_STEP;
        ({ data, info } = await encode(quality));
      }
      const fileName = `${image.id}-${width}.${shortHash(data)}.${format}`;
      writeFileSync(join(outDir, fileName), data);
      const src = "/" + toPosix(relative(join(repoRoot, "public"), join(outDir, fileName)));
      variants.push({ format, width: info.width, height: info.height, bytes: data.length, src });
      const kb = data.length / 1024;
      rows.push({ id: image.id, originalKb: master.sourceBytes / 1024, format, width: info.width, height: info.height, kb, quality: options.lossless ? "lossless" : quality, target: target ? target / 1024 : undefined });
      if (kb > CAP_KB[width]) overCap.push(`${src}: ${kb.toFixed(0)} KB > cap ${CAP_KB[width]} KB`);
    }
  }
  if (type === "place") {
    const blur = await sharp(master.buffer).resize({ width: 16 }).webp({ quality: 40 }).toBuffer();
    entries.push({
      id: image.id, place: name, stop: image.stop, gid: image.gid, kind: image.kind,
      width: master.width, height: master.height,
      sourceFile: image.file, sourceSha256: master.sourceSha256,
      credit: image.credit, licence: image.licence,
      pairIds: pairIdsOf.get(image.id) ?? [],
      blurDataURL: `data:image/webp;base64,${blur.toString("base64")}`,
      variants,
    });
  } else {
    // No blur placeholder: this manifest is bundled into client pages, so it stays lean.
    entries.push({
      id: image.id, module: name, legacySrc: image.legacySrc, kind: image.kind,
      width: master.width, height: master.height,
      sourceFile: image.file, sourceSha256: master.sourceSha256,
      credit: image.credit, licence: image.licence,
      variants,
    });
  }
}

// Pair check after encoding: every variant of a pair has the same dimensions.
for (const [idA, idB] of pairs) {
  const [a, b] = [entries.find((entry) => entry.id === idA), entries.find((entry) => entry.id === idB)];
  for (const variant of a.variants) {
    const match = b.variants.find((other) => other.format === variant.format && other.width === variant.width && other.height === variant.height);
    if (!match) fail(`pair ${idA} / ${idB}: variant ${variant.format} ${variant.width}×${variant.height} has no same-size partner`);
  }
}

// 6. Manifest, sorted for readable diffs.
entries.sort((a, b) => (a[type] ?? "").localeCompare(b[type] ?? "") || a.id.localeCompare(b.id));
writeFileSync(manifestPath, JSON.stringify(entries, null, 2) + "\n");

// 7. Report.
console.log(`\nimages: ${type} ${name}, ${rows.length} variants\n`);
console.log("| id | original KB | format | width × height | quality | KB | target KB |");
console.log("|---|---:|---|---|---:|---:|---:|");
for (const row of rows) {
  const flag = row.target && row.kb > row.target ? " ⚠ over target" : "";
  console.log(`| ${row.id} | ${row.originalKb.toFixed(0)} | ${row.format} | ${row.width} × ${row.height} | ${row.quality} | ${row.kb.toFixed(1)}${flag} | ${row.target ? row.target.toFixed(0) : "-"} |`);
}

// 8. Review copies for Claude (outside the repo): 1568 px long edge, metadata stripped.
if (reviewDir) {
  if (resolve(reviewDir).startsWith(repoRoot + sep)) fail("--review must point outside the repo");
  mkdirSync(reviewDir, { recursive: true });
  for (const image of images.filter((item) => !onlyId || item.id === onlyId)) {
    await sharp(masters.get(image.id).buffer).resize({ width: 1568, height: 1568, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 80, mozjpeg: true }).toFile(join(reviewDir, `${image.id}.jpg`));
  }
  console.log(`\nimages: review copies in ${reviewDir}`);
}

// Local stale variants: list what the manifest no longer references (delete with npm run images:prune -- --apply).
const referenced = new Set(entries.flatMap((entry) => entry.variants.map((variant) => variant.src)));
const walk = (dir) => (existsSync(dir) ? readdirSync(dir).flatMap((name) => {
  const full = join(dir, name);
  return statSync(full).isDirectory() ? walk(full) : [full];
}) : []);
const stale = walk(mediaRoot).map((file) => "/" + toPosix(relative(join(repoRoot, "public"), file))).filter((src) => !referenced.has(src));
if (stale.length) console.log(`\nimages: ${stale.length} stale local variant(s) in public/media/${collection.dir}; review with npm run images:prune, delete with npm run images:prune -- --apply`);

if (overCap.length) {
  console.error(`\nimages: over the hard cap (deploy would fail):\n  ${overCap.join("\n  ")}`);
  process.exit(1);
}
console.log("\nimages: OK");
