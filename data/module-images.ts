// Copied from the DORI platform repo (data/module-images.ts) on 8 Nov 2026; only the example path below is this game's.
import type { ModuleImageAsset } from "@/types/media-images";
import manifest from "./module-images.json";

// The older modules' images, keyed by the /public path their data files have always used
// (in this game, e.g. /shuk/mural-street.jpg). The files themselves are no longer in public/: the pipeline
// (npm run images) turns each original in media-originals/modules/ into hashed variants under /media/modules/.
const moduleImagesBySrc = new Map((manifest as ModuleImageAsset[]).map((image) => [image.legacySrc, image]));

// undefined = not in the manifest. deploy/check-assets.mjs fails the deploy on such a path, so this only
// happens in tests and in development before npm run images.
export function moduleImage(src: string): ModuleImageAsset | undefined {
  return moduleImagesBySrc.get(src);
}
