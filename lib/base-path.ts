// The game is served under a path of an existing DORI domain, proxied by Caddy to its own
// container. It is inlined at build time, so changing it means a rebuild and a Caddy change.
export const BASE_PATH = "/memory-protocol";
