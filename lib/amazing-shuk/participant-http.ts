import { WATER_PUZZLE_REVISION } from "./water-measurement.ts";
import { BASE_PATH } from "../base-path.ts";
import { isDevSimulationEnabled, isLocalDevelopmentHost } from "./dev-water-session.ts";
import { parseAction } from "./parse-water-action.ts";
import { AccessError, defaultStorePath, logout, redeemInvitation, SESSION_COOKIE, sessionAction, sessionView } from "./participant-store.ts";

export async function handleParticipantRequest(request: Request, path = defaultStorePath(), environment = process.env): Promise<Response> {
  const url = new URL(request.url);
  const host = request.headers.get("host");
  const headers = { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" };
  const json = (data: unknown, status = 200) => Response.json(data, { status, headers });
  if (!isDevSimulationEnabled(environment) || !isLocalDevelopmentHost(host) || !isLocalDevelopmentHost(url.host)) return new Response(null, { status: 404, headers });
  const token = request.headers.get("cookie")?.split(";").map(p => p.trim()).find(p => p.startsWith(SESSION_COOKIE + "="))?.slice(SESSION_COOKIE.length + 1) ?? "";
  try {
    if (request.method === "GET") return json(await sessionView(path, token));
    if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
    // Next may construct request.url from its listening hostname rather than the
    // browser's Host (localhost versus 127.0.0.1). Compare against the actual
    // gated Host, preserving exact scheme/port checks; never trust forwarded hosts.
    const browserOrigin = new URL(url.protocol + "//" + host).origin;
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
      response.headers.set("Set-Cookie", `${SESSION_COOKIE}=${value}; Path=${BASE_PATH}/; HttpOnly; SameSite=Strict; Max-Age=${value ? 604800 : 0}${url.protocol === "https:" ? "; Secure" : ""}`);
      return response;
    }
    const action = parseAction(body);
    if (!action || typeof body.actionId !== "string") return json({ error: "Invalid action" }, 400);
    if (body.puzzleRevision !== WATER_PUZZLE_REVISION) throw new AccessError("Puzzle updated; reload before continuing", 422);
    if (typeof body.expectedParticipantId !== "string") return json({ error: "Expected participant required" }, 400);
    const message = await sessionAction(path, token, action, body.actionId, Date.now(), body.expectedParticipantId);
    return json({ ...await sessionView(path, token), message });
  } catch (error) {
    if (error instanceof AccessError) return json({ error: error.message }, error.status);
    return json({ error: "Local storage unavailable" }, 503);
  }
}
