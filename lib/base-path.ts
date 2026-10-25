// Each app is served under a path of an existing DORI domain, proxied by Caddy to its own container.
// One codebase builds two images: the Memory Protocol, and the Amazing Shuk when NEXT_PUBLIC_DORI_APP=shuk
// (deploy/shuk-compose.yml). The value is inlined at build time, so changing it means a rebuild and a Caddy change.
export const basePathFor = (app: string | undefined) => app === "shuk" ? "/shuk" : "/memory-protocol";
export const IS_SHUK_APP = process.env.NEXT_PUBLIC_DORI_APP === "shuk";
export const BASE_PATH = basePathFor(process.env.NEXT_PUBLIC_DORI_APP);
