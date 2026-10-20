// Shared helpers for the game's route handlers. Server-only.

import { GameError } from "./engine.ts";

export const GUIDE_HEADER = "x-guide-token";

export function json(data: unknown, status = 200): Response {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

// GameError and store errors carry a status; anything else is a 500 without internals.
export function errorResponse(error: unknown): Response {
  if (error instanceof GameError) return json({ error: error.message }, error.status);
  const status = (error as { status?: number })?.status;
  if (status && status >= 400 && status < 500) return json({ error: (error as Error).message }, status);
  console.error(error);
  return json({ error: "server error" }, 500);
}

export async function readJson(request: Request): Promise<Record<string, unknown>> {
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > 32_000) throw new GameError("request too large", 413);
  try {
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error();
    return body as Record<string, unknown>;
  } catch {
    throw new GameError("expected a JSON object", 400);
  }
}
