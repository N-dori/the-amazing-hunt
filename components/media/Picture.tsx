// Copied from the DORI platform repo (app/components/media/Picture.tsx) on 8 Nov 2026. One change: every src gets this app's
// base path (mediaSrc), which the platform doesn't have. Callers pass the platform-style paths (e.g. /library/x.jpg), without it.
import type { CSSProperties, ImgHTMLAttributes } from "react";
import type { MediaImageAsset } from "@/types/media-images";
import { imageVariants, inlineWidths, mediaSrc, srcSetOf } from "@/data/media-images";
import { moduleImage } from "@/data/module-images";

type PictureProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet" | "width" | "height" | "loading" | "alt"> & {
  // A module image by the /public path its data file uses, or a manifest asset (/places: placeImage(id)).
  src?: string;
  image?: MediaImageAsset;
  alt: string;
  // Fills the nearest positioned ancestor, like next/image `fill`.
  fill?: boolean;
  // Rendered size; defaults to the image's own size (which only sets the aspect ratio when CSS sizes it).
  width?: number;
  height?: number;
  loading?: "eager" | "lazy";
};

// Every raster image on the site renders through here: <picture> with the AVIF variants first and WebP as the
// fallback, srcset up to 1080 from the image manifests (data/places-images.json, data/module-images.json).
// Never next/image: the variants are already encoded by npm run images, and the server must not re-encode them.
// <picture> is display: contents, so a parent's `.frame img { … }` styles apply as they did to a bare <img>.
export default function Picture({ src, image, alt, fill = false, width, height, sizes, loading = "lazy", style, ...rest }: PictureProps) {
  const asset = image ?? (src ? moduleImage(src) : undefined);
  const fillStyle: CSSProperties | undefined = fill ? { position: "absolute", inset: 0, width: "100%", height: "100%" } : undefined;
  const blurStyle: CSSProperties | undefined = asset?.blurDataURL && !fill
    ? { backgroundImage: `url("${asset.blurDataURL}")`, backgroundSize: "cover" } : undefined;
  const imgStyle: CSSProperties = { color: "transparent", ...fillStyle, ...blurStyle, ...style };
  const size = fill ? {} : { width: width ?? asset?.width, height: height ?? asset?.height };
  // Without sizes, a fixed-size image asks for its own CSS width; a fill image for the viewport width.
  const resolvedSizes = sizes ?? (fill ? "100vw" : width ? `${width}px` : undefined);

  // Not in a manifest (tests, or development before npm run images): a plain <img>. deploy/check-assets.mjs
  // fails the deploy on any such path.
  if (!asset) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...rest} src={src ? mediaSrc(src) : undefined} alt={alt} {...size} style={imgStyle} decoding="async" loading={loading} />;
  }
  const avif = imageVariants(asset, "avif", inlineWidths);
  const webp = imageVariants(asset, "webp", inlineWidths);
  const fallback = webp[webp.length - 1] ?? avif[avif.length - 1] ?? asset.variants[0];
  return <picture style={{ display: "contents" }}>
    {avif.length > 0 && <source type="image/avif" srcSet={srcSetOf(avif)} sizes={resolvedSizes} />}
    <img
      {...rest}
      src={mediaSrc(fallback.src)}
      srcSet={webp.length > 0 ? srcSetOf(webp) : undefined}
      sizes={webp.length > 0 ? resolvedSizes : undefined}
      alt={alt}
      {...size}
      style={imgStyle}
      decoding="async"
      loading={loading}
    />
  </picture>;
}
