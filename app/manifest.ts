import type { MetadataRoute } from "next";
import { BASE_PATH } from "@/lib/base-path";

// The manifest is not prefixed with basePath automatically, so scope and start_url name it.
// Icons are added when the game's own artwork exists.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "The Memory Protocol",
    short_name: "Memory Protocol",
    start_url: `${BASE_PATH}/`,
    scope: `${BASE_PATH}/`,
    display: "standalone",
    background_color: "#f3efe6",
    theme_color: "#f3efe6",
  };
}
