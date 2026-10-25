/**
 * What the Shuk build serves, by path without the base path. The Memory Protocol's pages and APIs share the codebase but
 * must not answer in the Shuk app, so anything not listed here is a 404. "home" is the app's root, shown as the game.
 */
export type ShukRoute = "allow" | "home" | "block";
const EXACT: ReadonlySet<string> = new Set(["/amazing-shuk", "/api/health", "/manifest.webmanifest", "/favicon.ico"]);
// Next's own files, the Shuk API, and the public folders the Shuk uses (mission photos, the illustrated map).
const PREFIXES = ["/_next/", "/api/amazing-shuk/", "/shuk/", "/map/"] as const;

export function shukRoute(pathname: string): ShukRoute {
  if (pathname === "" || pathname === "/") return "home";
  if (pathname.includes("..") || pathname.includes("//")) return "block";
  return EXACT.has(pathname) || PREFIXES.some(prefix => pathname.startsWith(prefix)) ? "allow" : "block";
}
