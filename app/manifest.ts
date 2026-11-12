import type { MetadataRoute } from "next";
import { BASE_PATH, IS_SHUK_APP } from "@/lib/base-path";

// The manifest is not prefixed with basePath automatically, so scope and start_url name it.
// Icons are added when the game's own artwork exists.
export default function manifest(): MetadataRoute.Manifest {
  return {
    // The Shuk build is its own app (lib/base-path.ts).
    name: IS_SHUK_APP ? "The Amazing Shuk" : "The Memory Protocol",
    short_name: IS_SHUK_APP ? "Amazing Shuk" : "Memory Protocol",
    start_url: IS_SHUK_APP ? `${BASE_PATH}/amazing-shuk` : `${BASE_PATH}/`,
    scope: `${BASE_PATH}/`,
    display: "standalone",
    background_color: "#f3efe6",
    theme_color: "#f3efe6",
  };
}
