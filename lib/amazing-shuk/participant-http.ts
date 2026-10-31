import { WATER_PUZZLE_REVISION } from "./water-measurement.ts";
import { BASE_PATH } from "../base-path.ts";
import { isLocalDevelopmentHost } from "./dev-water-session.ts";
import { shukAccess, shukPublicOrigin } from "./shuk-access.ts";
import { parseAction } from "./parse-water-action.ts";
import { AccessError, ALREADY_IN, APPROVED_MS, askToJoin, createJoinLink, defaultStorePath, exchangeJoin, isSignedIn, joinStatus, logout, PENDING_MS,
  redeemInvitation, SESSION_COOKIE, sessionAction, sessionView } from "./participant-store.ts";
import { allowJoinAsk } from "./join-rate-limit.ts";

/** The joining device's request secret (I3b): the same flags as the session cookie, and no longer than its request can live. */
export const JOIN_COOKIE = "shuk_join";
const JOIN_COOKIE_SECONDS = (PENDING_MS + APPROVED_MS) / 1000;
// TODO(copy): draft (O16).
const TOO_MANY_ASKS = "Too many people are asking right now. Try again in a minute.";
const cookieValue = (header: string | null, name: string) => header?.split(";").map(p => p.trim()).find(p => p.startsWith(name + "="))?.slice(name.length + 1) ?? "";

export async function handleParticipantRequest(request: Request, path = defaultStorePath(), environment = process.env): Promise<Response> {
  const url = new URL(request.url);
  const host = request.headers.get("host");
  const headers = { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" };
  const json = (data: unknown, status = 200) => Response.json(data, { status, headers });
  const access = shukAccess(environment, host);
  // The local simulation also checks the URL Next built; the app sits behind Caddy, so only its configured Host counts.
  if (!access || (access === "dev" && !isLocalDevelopmentHost(url.host))) return new Response(null, { status: 404, headers });
  // TLS ends at Caddy, so the app's browser origin is the configured one, never one built from forwarded headers.
  const publicOrigin = access === "app" ? shukPublicOrigin(environment) : null;
  const token = cookieValue(request.headers.get("cookie"), SESSION_COOKIE);
  const joinSecret = cookieValue(request.headers.get("cookie"), JOIN_COOKIE);
  // Kill switch for join links (I3b): off, the ask, status, exchange and link calls answer 404, and the view carries no membership,
  // so the app hides Invite players. Operator invitations always work.
  const joinLinks = environment.SHUK_JOIN_LINKS === "1";
  const secure = (publicOrigin?.protocol ?? url.protocol) === "https:" ? "; Secure" : "";
  const cookie = (name: string, value: string, seconds: number) => `${name}=${value}; Path=${BASE_PATH}/; HttpOnly; SameSite=Strict; Max-Age=${value ? seconds : 0}${secure}`;
  const view = async (missionId?: string) => {
    const { membership, ...rest } = await sessionView(path, token, Date.now(), missionId);
    return joinLinks && membership ? { ...rest, membership } : rest;
  };
  try {
    if (request.method === "GET" && url.searchParams.get("join") === "status") {
      // The joining device's poll: a read with no lock and no side effects. A request that has gone takes its cookie with it.
      if (!joinLinks) return new Response(null, { status: 404, headers });
      const status = await joinStatus(path, joinSecret);
      const response = json(status ?? { status: "gone" });
      if (!status && joinSecret) response.headers.set("Set-Cookie", cookie(JOIN_COOKIE, "", 0));
      return response;
    }
    if (request.method === "GET") return json(await view(url.searchParams.get("mission") ?? undefined));
    if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
    // Next may construct request.url from its listening hostname rather than the
    // browser's Host (localhost versus 127.0.0.1). Compare against the actual
    // gated Host, preserving exact scheme/port checks; never trust forwarded hosts.
    const browserOrigin = publicOrigin?.origin ?? new URL(url.protocol + "//" + host).origin;
    if (request.headers.get("origin") !== browserOrigin || request.headers.get("content-type")?.split(";")[0] !== "application/json") throw new AccessError("Same-origin JSON required");
    const text = await request.text();
    if (text.length > 4096) return json({ error: "Request too large" }, 413);
    let body;
    try { body = JSON.parse(text); } catch { return json({ error: "Invalid JSON" }, 400); }
    if (!body || typeof body !== "object" || Array.isArray(body)) return json({ error: "Invalid request" }, 400);
    if (body.type === "login" || body.type === "logout") {
      let value = "";
      if (body.type === "login") {
        if (typeof body.token !== "string") return json({ error: "Invitation required" }, 400);
        // Validate the invitation before replacing an existing browser session.
        value = await redeemInvitation(path, body.token, Date.now(), token);
      }
      if (body.type === "logout" && token) await logout(path, token);
      const response = json({ ok: true });
      response.headers.set("Set-Cookie", cookie(SESSION_COOKIE, value, 604800));
      return response;
    }
    if (body.type === "join-ask" || body.type === "join-exchange" || body.type === "join-link") {
      if (!joinLinks) return new Response(null, { status: 404, headers });
      if (body.type === "join-link") return json({ link: await createJoinLink(path, token, body.replace === true) });
      // A device already signed in makes nothing: no second identity, no switching teams.
      if (await isSignedIn(path, token)) throw new AccessError(ALREADY_IN, 409);
      if (body.type === "join-ask") {
        if (typeof body.link !== "string" || !(body.name === undefined || body.name === null || typeof body.name === "string")) return json({ error: "Invalid request" }, 400);
        if (!allowJoinAsk(body.link)) throw new AccessError(TOO_MANY_ASKS, 429);
        const { secret, ...status } = await askToJoin(path, body.link, typeof body.name === "string" && body.name.trim() ? body.name : null, joinSecret);
        const response = json(status);
        if (secret) response.headers.set("Set-Cookie", cookie(JOIN_COOKIE, secret, JOIN_COOKIE_SECONDS));
        return response;
      }
      const session = await exchangeJoin(path, joinSecret);
      const response = json({ ok: true });
      response.headers.append("Set-Cookie", cookie(SESSION_COOKIE, session, 604800));
      response.headers.append("Set-Cookie", cookie(JOIN_COOKIE, "", 0));
      return response;
    }
    const action = parseAction(body);
    if (!action || typeof body.actionId !== "string") return json({ error: "Invalid action" }, 400);
    if (body.puzzleRevision !== WATER_PUZZLE_REVISION) throw new AccessError("Puzzle updated; reload before continuing", 422);
    if (typeof body.expectedParticipantId !== "string") return json({ error: "Expected participant required" }, 400);
    const message = await sessionAction(path, token, action, body.actionId, Date.now(), body.expectedParticipantId);
    return json({ ...await view("missionId" in action ? action.missionId : undefined), message });
  } catch (error) {
    if (error instanceof AccessError) return json({ error: error.message }, error.status);
    return json({ error: "Local storage unavailable" }, 503);
  }
}
