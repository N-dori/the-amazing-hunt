import type { NextConfig } from "next";
import { BASE_PATH } from "./lib/base-path";

const nextConfig: NextConfig = {
  basePath: BASE_PATH,
  allowedDevOrigins: ["127.0.0.1"],
  // A self-contained server.js with only the traced node_modules: a smaller image and less
  // memory on the 4 GB host than shipping the full install.
  output: "standalone",
  // Don't advertise the framework (security review, 25 Oct 2026).
  poweredByHeader: false,
  // The image pipeline's variants (docs/images-howto.md): every file under /media has a content hash in its name
  // (deploy/check-assets.mjs enforces it), so browsers may keep it for a year. Next adds the base path itself.
  async headers() {
    return [{ source: "/media/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] }];
  },
};

export default nextConfig;
