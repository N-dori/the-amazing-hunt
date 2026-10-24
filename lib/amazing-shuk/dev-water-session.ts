import type { WaterPerformanceAction } from "./water-performance.ts";
import { roleForParticipant, setGroupRole, type AssignableGroupRole, type GroupRoleAssignments, type ParticipantRole } from "./roles.ts";
import { applyWaterMove, EMPTY_WATER_CUPS, evaluateWaterSubmission, type WaterCups, type WaterMove } from "./water-measurement.ts";

export const DEV_PARTICIPANTS = Object.freeze([
  Object.freeze({ id: "player-1", name: "Player 1" }),
  Object.freeze({ id: "player-2", name: "Player 2" }),
  Object.freeze({ id: "player-3", name: "Player 3" }),
  Object.freeze({ id: "player-4", name: "Player 4" }),
  Object.freeze({ id: "player-5", name: "Player 5" }),
  Object.freeze({ id: "player-6", name: "Player 6" }),
  Object.freeze({ id: "player-7", name: "Player 7" }),
]);
export const DEV_GUIDE_ID = "guide";

export type DevWaterSession = Readonly<{
  activeActorId: string;
  roles: GroupRoleAssignments;
  cups: WaterCups;
  completed: boolean;
}>;

export type DevWaterAction =
  | WaterPerformanceAction
  | Readonly<{ type: "switch-actor"; actorId: string }>
  | Readonly<{ type: "assign-role"; role: AssignableGroupRole; participantId: string | null }>
  | Readonly<{ type: "move"; move: WaterMove }>
  | Readonly<{ type: "submit" }>
  | Readonly<{ type: "guide-approve" }>
  | Readonly<{ type: "reset" }>;

export type DevWaterActionResult = Readonly<{
  session: DevWaterSession;
  message: string;
}>;

export function isDevSimulationEnabled(environment: NodeJS.ProcessEnv): boolean {
  return environment.NODE_ENV === "development" && environment.SHUK_DEV_SIMULATION === "1";
}

export function isLocalDevelopmentHost(host: string | null): boolean {
  if (!host) return false;
  try {
    const hostname = new URL("http://" + host).hostname.toLowerCase();
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]" || hostname === "::1";
  } catch {
    return false;
  }
}

export function createDevWaterSession(): DevWaterSession {
  return Object.freeze({
    activeActorId: DEV_PARTICIPANTS[0].id,
    roles: Object.freeze({ navigator: DEV_PARTICIPANTS[0].id, answerSubmitter: DEV_PARTICIPANTS[1].id }),
    cups: EMPTY_WATER_CUPS,
    completed: false,
  });
}

export function getDevWaterActorRole(session: DevWaterSession): ParticipantRole | "guide" {
  if (session.activeActorId === DEV_GUIDE_ID) return "guide";
  return roleForParticipant(session.activeActorId, session.roles);
}

function withMessage(session: DevWaterSession, message: string): DevWaterActionResult {
  return Object.freeze({ session, message });
}

export function applyDevWaterAction(session: DevWaterSession, action: DevWaterAction): DevWaterActionResult {
  const participantIds: readonly string[] = DEV_PARTICIPANTS.map((participant) => participant.id);
  switch (action.type) {
    case "switch-actor":
      if (action.actorId !== DEV_GUIDE_ID && !participantIds.includes(action.actorId)) throw new Error("unknown development actor");
      return withMessage(Object.freeze({ ...session, activeActorId: action.actorId }), "Acting persona changed.");
    case "assign-role": {
      if (getDevWaterActorRole(session) !== "guide") throw new Error("Only the simulated guide may assign roles.");
      const roles = setGroupRole(participantIds, session.roles, action.role, action.participantId);
      return withMessage(Object.freeze({ ...session, roles }), "Group role updated.");
    }
    case "move": {
      if (session.completed) throw new Error("This task is already complete.");
      const cups = applyWaterMove(session.cups, action.move);
      if (!cups) throw new Error("Invalid cup state or move.");
      return withMessage(Object.freeze({ ...session, cups }), "Water updated for the shared group.");
    }
    case "submit": {
      if (session.completed) return withMessage(session, "This task is already complete.");
      const result = evaluateWaterSubmission(getDevWaterActorRole(session), session.cups);
      if (result === "unauthorized") throw new Error("Only the answer-submitter or guide can submit the group's answer.");
      if (result !== "accepted") return withMessage(session, "Fill your family's jar with exactly 4 liters before submitting.");
      return withMessage(Object.freeze({ ...session, completed: true }), "The group's answer is correct. Task complete.");
    }
    case "guide-approve": {
      if (getDevWaterActorRole(session) !== "guide") throw new Error("Only the simulated guide may approve a task.");
      if (session.completed) return withMessage(session, "This task is already complete.");
      const result = evaluateWaterSubmission("guide", session.cups);
      if (result !== "accepted") return withMessage(session, "Fill your family's jar with exactly 4 liters before submitting.");
      return withMessage(Object.freeze({ ...session, completed: true }), "The group's answer is correct. Task complete.");
    }
    case "reset":
      if (session.completed) throw new Error("The completed group answer cannot be reset.");
      return withMessage(Object.freeze({ ...session, cups: EMPTY_WATER_CUPS }), "Puzzle reset. All three containers are empty.");
    default:
      throw new Error("Unknown development action.");
  }
}
