import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createRequire } from "node:module";
import { createElement, type ComponentType } from "react";
import ts from "typescript";
import { renderToStaticMarkup } from "react-dom/server";
import type { MediaImageAsset } from "../../types/media-images.ts";

// The DORI platform's image pipeline in this game (docs/images-howto.md): the helpers and <Picture>, loaded from their real
// sources with the "@/" alias mapped, as the app's other render tests do. The only change from the platform is the base path.
const nativeRequire = createRequire(import.meta.url);
function load(path: string, manifest: unknown = []): Record<string, unknown> {
  const source = readFileSync(resolve(path), "utf8");
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText;
  const exports: Record<string, unknown> = {};
  const localRequire = (id: string): unknown => {
    if (id.endsWith(".json")) return manifest;
    if (id.startsWith("@/") || id.startsWith("./")) {
      const base = id.startsWith("@/") ? resolve(id.slice(2)) : resolve(dirname(path), id);
      const file = [".ts", ".tsx"].map(ext => base + ext).find(existsSync);
      assert.ok(file, `module ${id}`);
      return load(file, manifest);
    }
    return nativeRequire(id);
  };
  new Function("require", "exports", output)(localRequire, exports);
  return exports;
}

const asset = (legacySrc: string): MediaImageAsset & { module: string; legacySrc: string } => ({
  id: "mural-street", module: "shuk", legacySrc, kind: "photo", width: 901, height: 1600, sourceFile: "mural-street.jpg", sourceSha256: "0".repeat(64),
  credit: "The owner's photograph", licence: "Own photo",
  variants: [
    { format: "avif", width: 1600, height: 2841, bytes: 1, src: "/media/modules/shuk/mural-street-1600.aaaaaaaa.avif" },
    { format: "avif", width: 640, height: 1137, bytes: 1, src: "/media/modules/shuk/mural-street-640.bbbbbbbb.avif" },
    { format: "webp", width: 640, height: 1137, bytes: 1, src: "/media/modules/shuk/mural-street-640.cccccccc.webp" },
    { format: "avif", width: 1080, height: 1918, bytes: 1, src: "/media/modules/shuk/mural-street-1080.dddddddd.avif" },
    { format: "webp", width: 1080, height: 1918, bytes: 1, src: "/media/modules/shuk/mural-street-1080.eeeeeeee.webp" },
  ],
});

test("the helpers keep the platform's /media paths in the manifest and add this app's base path when serving", () => {
  const helpers = load("data/media-images.ts") as {
    mediaSrc: (src: string) => string; srcSetOf: (variants: MediaImageAsset["variants"]) => string;
    imageVariants: (image: MediaImageAsset, format: "avif" | "webp", widths: readonly number[]) => MediaImageAsset["variants"];
    inlineWidths: readonly number[]; fullSizeSources: (image: MediaImageAsset) => { avif?: { width: number }; fallback: { width: number; format: string } };
  };
  const image = asset("/shuk/mural-street.jpg");
  assert.equal(helpers.mediaSrc("/media/modules/shuk/x.avif"), "/memory-protocol/media/modules/shuk/x.avif");
  // Inline images stop at 1080 and are ordered by width; 1600 is the full-size view's.
  const avif = helpers.imageVariants(image, "avif", helpers.inlineWidths);
  assert.deepEqual(avif.map(variant => variant.width), [640, 1080]);
  assert.equal(helpers.srcSetOf(avif), "/memory-protocol/media/modules/shuk/mural-street-640.bbbbbbbb.avif 640w, /memory-protocol/media/modules/shuk/mural-street-1080.dddddddd.avif 1080w");
  const full = helpers.fullSizeSources(image);
  assert.deepEqual([full.avif?.width, full.fallback.width, full.fallback.format], [1600, 1080, "webp"]);
});

test("<Picture> renders AVIF first and WebP as the fallback from the manifest, under the base path; never next/image", () => {
  const Picture = load("components/media/Picture.tsx", [asset("/shuk/mural-street.jpg")]).default as ComponentType<Record<string, unknown>>;
  const html = renderToStaticMarkup(createElement(Picture, { src: "/shuk/mural-street.jpg", alt: "The corner", sizes: "100vw", className: "photo" }));
  assert.match(html, /^<picture style="display:contents"><source type="image\/avif" srcSet="\/memory-protocol\/media\/modules\/shuk\/mural-street-640\.bbbbbbbb\.avif 640w/);
  assert.match(html, /<img class="photo" src="\/memory-protocol\/media\/modules\/shuk\/mural-street-1080\.eeeeeeee\.webp"/);
  assert.match(html, /alt="The corner"/); assert.match(html, /width="901" height="1600"/); assert.match(html, /loading="lazy"/);
  assert.doesNotMatch(html, /_next\/image/);
  // A path the manifest doesn't hold (before the pipeline has run) is a plain <img>, still under the base path.
  const plain = renderToStaticMarkup(createElement(Picture, { src: "/library/not-in-the-manifest.jpg", alt: "", loading: "eager" }));
  assert.match(plain, /<img src="\/memory-protocol\/library\/not-in-the-manifest\.jpg" alt="" style="color:transparent" decoding="async" loading="eager"\/>$/);
  assert.doesNotMatch(plain, /<picture/);
});
