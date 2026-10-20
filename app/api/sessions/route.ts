import { GameError } from "@/lib/game/engine.ts";
import { errorResponse, json, readJson } from "@/lib/game/http.ts";
import { createSession } from "@/lib/game/store.ts";
import { guideView } from "@/lib/game/views.ts";

export const dynamic = "force-dynamic";

// The guide creates a session. The whole app sits behind Caddy's basic auth; GUIDE_CREATE_KEY,
// when set, is a second key for creating sessions only.
export async function POST(request: Request) {
  try {
    const body = await readJson(request);
    const key = process.env.GUIDE_CREATE_KEY;
    if (key && body.createKey !== key) throw new GameError("wrong guide key", 403);
    const { code, guideToken, state } = createSession();
    return json({ code, guideToken, view: guideView(state, 1) }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
