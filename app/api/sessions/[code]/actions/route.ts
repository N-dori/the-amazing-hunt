import { applyTeamAction, GameError, teamOfDevice } from "@/lib/game/engine.ts";
import { generateReply } from "@/lib/game/harmony.ts";
import { errorResponse, json, readJson } from "@/lib/game/http.ts";
import { loadSession, updateSession } from "@/lib/game/store.ts";
import type { TeamAction } from "@/lib/game/types.ts";
import { playerView } from "@/lib/game/views.ts";

export const dynamic = "force-dynamic";

// A phone proposes a team action; the engine decides. For a proposal, the server writes
// HARMONY's reply itself (model or scripted) and ignores any reply the client sent.
export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;
    const body = await readJson(request);
    const deviceId = typeof body.deviceId === "string" ? body.deviceId : "";
    let action = body.action as TeamAction | undefined;
    if (!action || typeof action !== "object" || typeof action.type !== "string") throw new GameError("an action is required", 400);

    if (action.type === "submitProposal") {
      // Check the stage before any paid call, so a stale or repeated tap costs nothing.
      const loaded = loadSession(code);
      if (!loaded) throw new GameError("session not found", 404);
      const teamId = teamOfDevice(loaded.state, deviceId);
      if (!teamId) throw new GameError("join a team first", 403);
      if (loaded.state.teams[teamId].stage !== "crisis") throw new GameError("this team has already submitted a proposal");
      const proposal = action.proposal ?? { text: "", stakeholders: "", tradeoffs: "" };
      const reply = await generateReply(teamId, {
        text: String(proposal.text ?? ""), stakeholders: String(proposal.stakeholders ?? ""), tradeoffs: String(proposal.tradeoffs ?? ""),
      });
      action = { type: "submitProposal", proposal, reply };
    }

    const now = new Date();
    const finalAction = action;
    const { state, version } = updateSession(code, (current) => applyTeamAction(current, deviceId, finalAction, now), now);
    return json(playerView(state, version, deviceId));
  } catch (error) {
    return errorResponse(error);
  }
}
