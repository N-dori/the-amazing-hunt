import { isDevSimulationEnabled, isLocalDevelopmentHost } from "./dev-water-session.ts";

/**
 * Who may reach the Shuk page and API, from the server's environment and the request's Host header.
 * - "dev": the local simulation (development, SHUK_DEV_SIMULATION=1, a loopback Host), as before.
 * - "app": the protected Shuk app (the Shuk build, production, SHUK_APP=1) on the one public host in SHUK_PUBLIC_ORIGIN.
 * - null: neither, so the caller answers 404. Forwarded headers are never trusted: the public origin comes from config.
 */
export type ShukAccess = "dev" | "app" | null;
type Environment = Readonly<Record<string, string | undefined>>;

/** The configured public origin (e.g. https://doriisrael.com), or null when it is missing or not a bare origin. */
export function shukPublicOrigin(environment: Environment): URL | null {
  const value = environment.SHUK_PUBLIC_ORIGIN;
  if (!value) return null;
  try {
    const url = new URL(value);
    const bare = url.origin === value.replace(/\/$/, "") && !url.username && !url.password;
    return bare && (url.protocol === "https:" || url.protocol === "http:") ? url : null;
  } catch { return null; }
}

export function shukAccess(environment: Environment, host: string | null): ShukAccess {
  if (isDevSimulationEnabled(environment as NodeJS.ProcessEnv) && isLocalDevelopmentHost(host)) return "dev";
  if (environment.NEXT_PUBLIC_DORI_APP !== "shuk" || environment.NODE_ENV !== "production" || environment.SHUK_APP !== "1") return null;
  const origin = shukPublicOrigin(environment);
  return origin && host !== null && host.toLowerCase() === origin.host ? "app" : null;
}
