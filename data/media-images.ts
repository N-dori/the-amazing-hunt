// Copied from the DORI platform repo (data/media-images.ts) on 8 Nov 2026. One change: srcSetOf and mediaSrc add
// this app's base path (lib/base-path.ts), which the platform doesn't have.
import type { MediaImageAsset, MediaImageFormat, MediaImageVariant } from "@/types/media-images";
import { BASE_PATH } from "@/lib/base-path";

// The manifest keeps the platform's "/media/..." paths; this app serves them under its base path (/memory-protocol or /shuk).
export const mediaSrc = (src: string) => BASE_PATH + src;

// Helpers shared by both image manifests (data/places-images.ts, data/module-images.ts).

// Inline images offer up to 1080 (a 3× phone picks 1080); 1600 is for the full-size view only.
// 320 exists for module images only (small avatars and thumbnails).
export const inlineWidths = [320, 640, 1080] as const;
export const fullSizeWidth = 1600;

export function imageVariants(image: MediaImageAsset, format: MediaImageFormat, widths: readonly number[]): MediaImageVariant[] {
  return image.variants
    .filter((variant) => variant.format === format && widths.some((width) => variant.src.includes(`-${width}.`)))
    .sort((first, second) => first.width - second.width);
}

// A source smaller than a requested width is never enlarged, so two variants can share a width: keep the first.
export function srcSetOf(variants: MediaImageVariant[]): string {
  const seen = new Set<number>();
  return variants.filter((variant) => !seen.has(variant.width) && seen.add(variant.width))
    .map((variant) => `${mediaSrc(variant.src)} ${variant.width}w`).join(", ");
}

// The full-size view: AVIF at 1600 for photos and renders, with the largest WebP as the <img> fallback
// (1080 for photos, since WebP stops there; 1600 for diagrams, which have no AVIF).
export function fullSizeSources(image: MediaImageAsset): { avif?: MediaImageVariant; fallback: MediaImageVariant } {
  const avif = imageVariants(image, "avif", [fullSizeWidth])[0];
  const webp = image.variants.filter((variant) => variant.format === "webp").sort((first, second) => first.width - second.width);
  return { avif, fallback: webp[webp.length - 1] ?? image.variants[image.variants.length - 1] };
}
