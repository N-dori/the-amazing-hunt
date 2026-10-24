import type { NextConfig } from "next";
import { BASE_PATH } from "./lib/base-path";

const nextConfig: NextConfig = {
  basePath: BASE_PATH,
  allowedDevOrigins: ["127.0.0.1"],
  // A self-contained server.js with only the traced node_modules: a smaller image and less
  // memory on the 4 GB host than shipping the full install.
  output: "standalone",
};

export default nextConfig;
