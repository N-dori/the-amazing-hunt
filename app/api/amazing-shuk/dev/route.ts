import { NextResponse } from "next/server";
import { applyDevWaterAction, createDevWaterSession, DEV_GUIDE_ID, DEV_PARTICIPANTS, isDevSimulationEnabled, isLocalDevelopmentHost, type DevWaterAction, type DevWaterSession } from "@/lib/amazing-shuk/dev-water-session.ts";
import { WATER_TASK_ID } from "@/lib/amazing-shuk/water-measurement.ts";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
type DevGlobal = typeof globalThis & { __amazingShukDevWater?: DevWaterSession };

function session(): DevWaterSession {
  const store = globalThis as DevGlobal;
  store.__amazingShukDevWater ??= createDevWaterSession();
  return store.__amazingShukDevWater;
}
function disabled() { return new Response(null, { status: 404, headers: { "Cache-Control": "no-store" } }); }
function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }

function parseAction(value: unknown): DevWaterAction | null {
  if (!isRecord(value) || typeof value.type !== "string") return null;
  switch (value.type) {
    case "switch-actor":
      return typeof value.actorId === "string" ? { type: value.type, actorId: value.actorId } : null;
    case "assign-role":
      if ((value.role === "navigator" || value.role === "answerSubmitter") && (value.participantId === null || typeof value.participantId === "string")) {
        return { type: value.type, role: value.role, participantId: value.participantId };
      }
      return null;
    case "move":
      if (typeof value.move === "string" && ["fill-small", "fill-large", "empty-small", "empty-large", "pour-small-into-large", "pour-large-into-small"].includes(value.move)) {
        return { type: value.type, move: value.move as Extract<DevWaterAction, { type: "move" }>["move"] };
      }
      return null;
    case "submit":
    case "guide-approve":
    case "reset":
      return { type: value.type };
    default:
      return null;
  }
}
function view(current: DevWaterSession) {
  return {
    taskId: WATER_TASK_ID, session: current, participants: DEV_PARTICIPANTS, guideId: DEV_GUIDE_ID,
    sharedBalance: { points: 0, foodTokens: 0, status: "Reward values pending owner approval" },
  };
}
export async function GET(request: Request) {
  if (!isDevSimulationEnabled(process.env) || !isLocalDevelopmentHost(new URL(request.url).host)) return disabled();
  return NextResponse.json(view(session()), { headers: { "Cache-Control": "no-store" } });
}
export async function POST(request: Request) {
  if (!isDevSimulationEnabled(process.env) || !isLocalDevelopmentHost(new URL(request.url).host)) return disabled();
  try {
    const action = parseAction(await request.json());
    if (!action) return NextResponse.json({ error: "Invalid development action." }, { status: 400 });
    const store = globalThis as DevGlobal;
    const result = applyDevWaterAction(session(), action);
    store.__amazingShukDevWater = result.session;
    return NextResponse.json({ ...view(result.session), message: result.message }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Development action failed.";
    return NextResponse.json({ error: message }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
}
