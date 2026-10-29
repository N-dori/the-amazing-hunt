import { validArrivalReading } from "./mission-arrival.ts";
import type { DevWaterAction } from "./dev-water-session.ts";
import type { GroupAction, MissionAction } from "./group-action.ts";
import { WATER_MOVES } from "./water-measurement.ts";
function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }
const MISSION_SCOPED: ReadonlySet<string> = new Set(["move", "start", "hint", "timing", "submit", "guide-approve", "reset", "toggle-choice"]);

const BONUS_ACTIONS: ReadonlySet<string> = new Set(["toggle-choice", "reset", "submit"]);

/** Role changes and lobby actions are group-wide; every other action must name its mission. Only a toggle, reset or submit may name the bonus. */
export function parseAction(value: unknown): GroupAction | null {
  if (!isRecord(value) || !("part" in value)) return parseMissionAction(value);
  if (value.part !== "bonus" || !BONUS_ACTIONS.has(value.type as string)) return null;
  const action = parseMissionAction(value);
  return action && "missionId" in action ? { ...action, part: "bonus" } as GroupAction : null;
}

function parseMissionAction(value: unknown): GroupAction | null {
  if (isRecord(value) && (value.type === "claim-role" || value.type === "release-role")) {
    return value.role === "navigator" || value.role === "answerSubmitter" ? { type: value.type, role: value.role } : null;
  }
  if (isRecord(value) && value.type === "set-intended-count") {
    return Number.isSafeInteger(value.count) ? { type: value.type, count: value.count as number } : null;
  }
  if (isRecord(value) && value.type === "start-adventure") {
    if (value.asOneTeam !== undefined && typeof value.asOneTeam !== "boolean") return null;
    return value.asOneTeam === true ? { type: value.type, asOneTeam: true } : { type: value.type };
  }
  if (isRecord(value) && value.type === "toggle-choice") {
    return typeof value.missionId === "string" && typeof value.optionId === "string" ? { type: "toggle-choice", optionId: value.optionId, missionId: value.missionId } : null;
  }
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
      // `step` names the question a hint belongs to, so a hint queued before the group moved on can't open the next question's.
      if (value.step !== undefined && !(Number.isInteger(value.step) && (value.step as number) >= 0 && (value.step as number) <= 9)) return null;
      return Number.isInteger(value.hint) && (value.hint as number) >= 1 && (value.hint as number) <= 3
        ? { type: "hint", hint: value.hint as number, ...(value.step === undefined ? {} : { step: value.step as number }) } : null;
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
