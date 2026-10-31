import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { shukAccess, shukPublicOrigin } from "./shuk-access.ts";
import { shukRoute } from "./shuk-routes.ts";
import { handleParticipantRequest } from "./participant-http.ts";
import { issueInvitation, redeemInvitation, sessionView } from "./participant-store.ts";
import { basePathFor, BASE_PATH } from "../base-path.ts";

const APP = { NODE_ENV: "production", NEXT_PUBLIC_DORI_APP: "shuk", SHUK_APP: "1", SHUK_PUBLIC_ORIGIN: "https://doriisrael.com" } as const;
const DEV = { NODE_ENV: "development", SHUK_DEV_SIMULATION: "1" } as const;

test("two builds, two prefixes: the Shuk build is /shuk, everything else stays /memory-protocol", () => {
  assert.equal(basePathFor("shuk"), "/shuk");
  assert.equal(basePathFor(undefined), "/memory-protocol"); assert.equal(basePathFor("memory-protocol"), "/memory-protocol");
});

test("the app gate: only the Shuk build in production with SHUK_APP=1, on the configured host", () => {
  assert.equal(shukAccess(APP, "doriisrael.com"), "app");
  assert.equal(shukAccess(APP, "DoriIsrael.com"), "app");
  for (const host of ["www.doriisrael.com", "doriisrael.com:8443", "dori-shuk:3000", "127.0.0.1:3000", "localhost", "evil.example", null]) {
    assert.equal(shukAccess(APP, host), null, String(host));
  }
  assert.equal(shukAccess({ ...APP, SHUK_APP: undefined }, "doriisrael.com"), null);
  assert.equal(shukAccess({ ...APP, NEXT_PUBLIC_DORI_APP: undefined }, "doriisrael.com"), null, "the Memory Protocol image never serves the Shuk");
  assert.equal(shukAccess({ ...APP, NODE_ENV: "development" }, "doriisrael.com"), null);
  assert.equal(shukAccess({ ...APP, SHUK_PUBLIC_ORIGIN: undefined }, "doriisrael.com"), null);
  assert.equal(shukAccess({ ...APP, SHUK_PUBLIC_ORIGIN: "https://doriisrael.com/shuk" }, "doriisrael.com"), null, "an origin, not a URL with a path");
  assert.equal(shukAccess({ ...APP, SHUK_PUBLIC_ORIGIN: "https://user:pw@doriisrael.com" }, "doriisrael.com"), null);
  // The local simulation is unchanged, and a loopback Host never opens the app.
  assert.equal(shukAccess(DEV, "127.0.0.1:3300"), "dev"); assert.equal(shukAccess(DEV, "doriisrael.com"), null);
  assert.equal(shukPublicOrigin({ SHUK_PUBLIC_ORIGIN: "https://doriisrael.com/" })?.origin, "https://doriisrael.com");
});

test("the Shuk build serves only the Shuk: Memory Protocol pages, APIs and dev tools are 404", () => {
  assert.equal(shukRoute("/"), "home"); assert.equal(shukRoute(""), "home");
  for (const path of ["/amazing-shuk", "/api/amazing-shuk/dev", "/api/health", "/manifest.webmanifest", "/favicon.ico",
    "/_next/static/chunks/app.js", "/shuk/gan-hatut-gate.jpg", "/map/nahlaot-illustrated-candidate.jpg"]) assert.equal(shukRoute(path), "allow", path);
  for (const path of ["/dev/amazing-shuk/water", "/dev/map", "/dev/icons", "/api/sessions", "/library/timeline-1946-entry.jpg",
    "/protocol", "/amazing-shuk/extra", "/shuk/../api/sessions", "/api/amazing-shukx", "//api/health"]) assert.equal(shukRoute(path), "block", path);
});

async function fixture(run: (path: string) => Promise<void>) {
  await mkdir(".local", { recursive: true });
  const directory = await mkdtemp(join(process.cwd(), ".local", "shuk-app-"));
  try { await run(join(directory, "state.json")); } finally { await rm(directory, { recursive: true, force: true }); }
}
// Behind Caddy the container sees plain HTTP on its own port, but the browser's Host is the public one.
const login = (token: string, origin: string, host = "doriisrael.com") => new Request("http://0.0.0.0:3000/shuk/api/amazing-shuk/dev", {
  method: "POST", headers: { host, origin, "content-type": "application/json" }, body: JSON.stringify({ type: "login", token }),
});

test("app mode over HTTP: the configured origin only, a Secure HttpOnly cookie, 404 for any other host", () => fixture(async path => {
  const token = await issueInvitation(path, "player-4");
  for (const origin of ["http://doriisrael.com", "https://www.doriisrael.com", "https://attacker.example", "null"]) {
    assert.equal((await handleParticipantRequest(login(token, origin), path, APP)).status, 403, origin);
  }
  assert.equal((await handleParticipantRequest(login(token, "https://doriisrael.com", "127.0.0.1:3000"), path, APP)).status, 404);
  assert.equal((await handleParticipantRequest(login(token, "https://doriisrael.com"), path, DEV)).status, 404, "the dev gate never accepts the public host");
  const response = await handleParticipantRequest(login(token, "https://doriisrael.com"), path, APP);
  assert.equal(response.status, 200);
  const cookie = response.headers.get("set-cookie")!;
  assert.match(cookie, /HttpOnly; SameSite=Strict/); assert.match(cookie, /; Secure/); assert.match(cookie, new RegExp(`Path=${BASE_PATH}/;`));
  // The session works for reads, and the single-use invitation is spent.
  const session = cookie.split(";")[0];
  const read = await handleParticipantRequest(new Request("http://0.0.0.0:3000/shuk/api/amazing-shuk/dev", { headers: { host: "doriisrael.com", cookie: session } }), path, APP);
  assert.equal(read.status, 200); assert.match((await read.json()).session.activeActorId, /^p_[A-Za-z0-9_-]{22}$/, "a new member gets a random ID, not the seat");
  assert.equal((await handleParticipantRequest(login(token, "https://doriisrael.com"), path, APP)).status, 401);
  const anonymous = await handleParticipantRequest(new Request("http://0.0.0.0:3000/shuk/api/amazing-shuk/dev", { headers: { host: "doriisrael.com" } }), path, APP);
  assert.equal(anonymous.status, 401);
}));

const cli = (args: string[], env: Record<string, string> & { NODE_ENV: "production" | "development" }) => promisify(execFile)(process.execPath,
  ["--experimental-strip-types", "--disable-warning=ExperimentalWarning", "scripts/shuk-invite.ts", ...args], { env: { PATH: process.env.PATH ?? "", ...env } });

test("the invite script in the app links to the public https page, and refuses any other origin", () => fixture(async path => {
  const result = await cli(["player-5", "https://doriisrael.com"], { ...APP, SHUK_DATA_FILE: path });
  const link = new URL(result.stdout.trim());
  assert.equal(link.origin, "https://doriisrael.com"); assert.equal(link.pathname, "/shuk/amazing-shuk");
  const token = new URLSearchParams(link.hash.slice(1)).get("invite")!;
  assert.match((await sessionView(path, await redeemInvitation(path, token))).session.activeActorId, /^p_[A-Za-z0-9_-]{22}$/);
  for (const origin of ["http://doriisrael.com", "https://evil.example", "https://doriisrael.com/shuk", "http://127.0.0.1:3000"]) {
    await assert.rejects(cli(["player-5", origin], { ...APP, SHUK_DATA_FILE: path }), origin);
  }
  await assert.rejects(cli(["player-5", "https://doriisrael.com"], { ...APP, SHUK_PUBLIC_ORIGIN: "http://doriisrael.com", SHUK_DATA_FILE: path }));
}));
