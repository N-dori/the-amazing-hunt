import { applyGuideAction, GameError } from "@/lib/game/engine.ts";
import { errorResponse, GUIDE_HEADER, json, readJson } from "@/lib/game/http.ts";
import { isGuide, updateSession } from "@/lib/game/store.ts";
import type { GuideAction } from "@/lib/game/types.ts";
import { guideView } from "@/lib/game/views.ts";

export const dynamic = "force-dynamic";

// Guide-only actions: arrival confirmation, logged bypasses, rubric marks, the shared reveal and
// reward redemption. Every one of them is written to the session's audit log by the engine.
export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;
    if (!isGuide(code, request.headers.get(GUIDE_HEADER))) throw new GameError("guide access only", 403);
    const body = await readJson(request);
    const action = body.action as GuideAction | undefined;
    if (!action || typeof action !== "object" || typeof action.type !== "string") throw new GameError("an action is required", 400);
    const now = new Date();
    const { state, version } = updateSession(code, (current) => applyGuideAction(current, action, now), now);
    return json(guideView(state, version));
  } catch (error) {
    return errorResponse(error);
  }
}
