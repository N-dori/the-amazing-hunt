#!/usr/bin/env node
// Copied from the DORI platform repo (deploy/prune-media.mjs) on 8 Nov 2026. On this server the game's media root is /srv/dori/game-media
// (never the platform's /srv/dori/media), and the container restart is dori-game and dori-shuk.
// Delete image variants that no manifest references any more. No dependencies:
// runs on the laptop (npm run images:prune) and on the server (plain node).
//
//   node deploy/prune-media.mjs <media-dir> <manifest.json>... [--apply]
//   e.g. node deploy/prune-media.mjs /srv/dori/media data/places-images.json data/module-images.json
//
// <media-dir> is the folder served at /media (laptop: public/media, server: /srv/dori/media), holding
// places/ and modules/. Pass every manifest: a variant listed in none of them is stale. Without --apply it is
// a dry run. On the server, run it AFTER the deploy that brought the new manifests, so the live container never
// loses a file it still references; then `docker restart dori-platform` (next start lists public/ once at startup).

import { existsSync, readFileSync, readdirSync, rmdirSync, statSync, unlinkSync } from "node:fs";
import { join, relative, sep } from "node:path";

const [mediaDir, ...manifestPaths] = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
const apply = process.argv.includes("--apply");
if (!mediaDir || manifestPaths.length === 0) {
  console.error("usage: prune-media.mjs <media-dir> <manifest.json>... [--apply]");
  process.exit(2);
}
if (!existsSync(mediaDir)) {
  console.log(`prune-media: ${mediaDir} does not exist, nothing to do`);
  process.exit(0);
}
// The media root holds only places/ and modules/. Anything else means a wrong folder (for example the old
// /srv/dori/media/places form of this command), where every file would look stale: refuse.
const unexpected = readdirSync(mediaDir).filter((name) => !["places", "modules"].includes(name));
if (unexpected.length) {
  console.error(`prune-media: ${mediaDir} should hold only places/ and modules/, found ${unexpected.join(", ")} (refusing to prune)`);
  process.exit(1);
}
const referenced = new Set();
for (const manifestPath of manifestPaths) {
  if (!existsSync(manifestPath)) {
    console.error(`prune-media: manifest not found: ${manifestPath} (refusing to prune)`);
    process.exit(1);
  }
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  // A missing or empty manifest would mark a whole folder stale: refuse instead of wiping it.
  if (!Array.isArray(manifest) || manifest.length === 0) {
    console.error(`prune-media: ${manifestPath} lists no variants (refusing to prune)`);
    process.exit(1);
  }
  for (const entry of manifest) for (const variant of entry.variants ?? []) referenced.add(variant.src);
}
// Every collection folder on disk needs its manifest, or all its files would look stale.
const covered = new Set([...referenced].map((src) => src.split("/")[2]));
const uncovered = readdirSync(mediaDir).filter((name) => !covered.has(name));
if (uncovered.length) {
  console.error(`prune-media: no manifest given for ${uncovered.join(", ")} (refusing to prune)`);
  process.exit(1);
}

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const urlOf = (file) => "/media/" + relative(mediaDir, file).split(sep).join("/");
const stale = walk(mediaDir).filter((file) => !referenced.has(urlOf(file)));

for (const file of stale) console.log(`${apply ? "deleted" : "would delete"}: ${urlOf(file)}`);
if (apply) {
  for (const file of stale) unlinkSync(file);
  // Remove folders left empty, deepest first; keep the media root itself.
  const dirs = [];
  const collect = (dir) => {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) { collect(full); dirs.push(full); }
    }
  };
  collect(mediaDir);
  for (const dir of dirs) if (readdirSync(dir).length === 0) rmdirSync(dir);
}
console.log(`prune-media: ${stale.length} stale file(s) ${apply ? "deleted" : "found (dry run; add --apply to delete)"}, ${referenced.size} referenced`);
