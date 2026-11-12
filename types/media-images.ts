// Copied from the DORI platform repo (types/media-images.ts) on 8 Nov 2026, unchanged; see docs/images-howto.md.
// Shared shape of the image manifests written by scripts/images/build-images.mjs
// (data/places-images.json and data/module-images.json). Never hand-edit sizes.

export type MediaImageFormat = "avif" | "webp";
export type MediaImageKind = "photo" | "render" | "diagram";

export interface MediaImageVariant {
  format: MediaImageFormat;
  width: number;
  height: number;
  bytes: number;
  src: string; // /media/<places|modules>/…/<id>-<width>.<hash8>.<format>
}

export interface MediaImageAsset {
  id: string;
  kind: MediaImageKind;
  width: number; // master size after orientation and crop
  height: number;
  sourceFile: string;
  sourceSha256: string;
  credit: string;
  licence: string;
  blurDataURL?: string; // /places only
  variants: MediaImageVariant[];
}

// An image of an older module, looked up by the /public path its data file has always used.
export interface ModuleImageAsset extends MediaImageAsset {
  module: string;
  legacySrc: string;
}
