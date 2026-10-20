import { errorResponse, GUIDE_HEADER, json } from "@/lib/game/http.ts";
import { isGuide, loadSession } from "@/lib/game/store.ts";
import { guideView, playerView } from "@/lib/game/views.ts";

export const dynamic = "force-dynamic";

// Polled by every phone (players) and the guide dashboard. The guide token selects the full view.
export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;
    const loaded = loadSession(code);
    if (!loaded) return json({ error: "session not found" }, 404);
    if (isGuide(code, request.headers.get(GUIDE_HEADER))) return json(guideView(loaded.state, loaded.version));
    const deviceId = new URL(request.url).searchParams.get("device") ?? "";
    return json(playerView(loaded.state, loaded.version, deviceId));
  } catch (error) {
    return errorResponse(error);
  }
}
