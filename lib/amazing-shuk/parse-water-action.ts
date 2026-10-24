import type { DevWaterAction } from "./dev-water-session.ts";
import { WATER_MOVES } from "./water-measurement.ts";
function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }

export function parseAction(value: unknown): DevWaterAction | null {
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
      if (typeof value.move === "string" && (WATER_MOVES as readonly string[]).includes(value.move)) {
        return { type: value.type, move: value.move as Extract<DevWaterAction, { type: "move" }>["move"] };
      }
      return null;
    case "start":
      return { type: "start" };
    case "hint":
      return Number.isInteger(value.hint) && (value.hint as number) >= 1 && (value.hint as number) <= 3 ? { type: "hint", hint: value.hint as number } : null;
    case "timing":
      return value.operation === "pause" || value.operation === "resume" || value.operation === "reset" || value.operation === "exclude" ? { type: "timing", operation: value.operation } : null;
    case "submit":
    case "guide-approve":
    case "reset":
      return { type: value.type };
    default:
      return null;
  }
}
