import { validArrivalReading } from "./mission-arrival.ts";
import type { DevWaterAction } from "./dev-water-session.ts";
import type { GroupAction, MissionAction } from "./group-action.ts";
import { WATER_MOVES } from "./water-measurement.ts";
function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }
const MISSION_SCOPED: ReadonlySet<string> = new Set(["move", "start", "hint", "timing", "submit", "guide-approve", "reset"]);

/** Role changes are group-wide; every other action must name its mission. */
export function parseAction(value: unknown): GroupAction | null {
  const action = parseActionBody(value);
  if (!action || !MISSION_SCOPED.has(action.type)) return action as GroupAction | null;
  return isRecord(value) && typeof value.missionId === "string" ? { ...action, missionId: value.missionId } as MissionAction : null;
}

function parseActionBody(value: unknown): DevWaterAction | null {
  if (!isRecord(value) || typeof value.type !== "string") return null;
  switch (value.type) {
    case "confirm-arrival":
      return typeof value.missionId === "string" ? { type: value.type, missionId: value.missionId } : null;
    case "arrival": {
      if (typeof value.missionId !== "string" || !validArrivalReading(value.reading)) return null;
      const { latitude, longitude, accuracy, timestamp } = value.reading;
      return { type: value.type, missionId: value.missionId, reading: { latitude, longitude, accuracy, timestamp } };
    }
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
