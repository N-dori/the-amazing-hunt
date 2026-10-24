/** The four bottom-bar destinations. Map and Mission reuse the mission journey's stages; Food and Group are their own views. */
export type ShukTab = "map" | "mission" | "food" | "group";
export type JourneyStage = "map" | "preview" | "location" | "challenge";
type MissionScreen = "location" | "challenge";

/**
 * Where the player is. `missionId` is the mission on screen or in the preview; `openMission` is the last mission the group
 * actually opened (location or challenge), which the Mission tab returns to. `noMission` is the Mission tab before any.
 */
export type ShukNavState = Readonly<{
  area: "journey" | "noMission" | "food" | "group";
  stage: JourneyStage; missionId: string;
  openMission: Readonly<{ id: string; screen: MissionScreen }> | null;
}>;

export const initialNavState = (missionId: string): ShukNavState => ({ area: "journey", stage: "map", missionId, openMission: null });

/** A step inside the journey (map, preview, location or challenge). Opening a mission screen remembers it for the Mission tab. */
export function goToStage(state: ShukNavState, stage: JourneyStage): ShukNavState {
  const openMission = stage === "location" || stage === "challenge" ? { id: state.missionId, screen: stage } : state.openMission;
  return { ...state, area: "journey", stage, openMission };
}

/** A tap on a map marker: preview that mission without forgetting the one the group last opened. */
export function previewMission(state: ShukNavState, missionId: string): ShukNavState {
  return { ...state, area: "journey", stage: "preview", missionId };
}

/** A bottom-bar tap. It never changes shared progress; it only chooses what's on screen. */
export function goToTab(state: ShukNavState, tab: ShukTab): ShukNavState {
  switch (tab) {
    case "map": return { ...state, area: "journey", stage: "map" };
    case "mission": return state.openMission
      ? { ...state, area: "journey", stage: state.openMission.screen, missionId: state.openMission.id }
      : { ...state, area: "noMission" };
    case "food": return { ...state, area: "food" };
    case "group": return { ...state, area: "group" };
  }
}

export function activeTab(state: ShukNavState): ShukTab {
  if (state.area === "food" || state.area === "group") return state.area;
  if (state.area === "noMission") return "mission";
  return state.stage === "location" || state.stage === "challenge" ? "mission" : "map";
}

const AREAS = ["journey", "noMission", "food", "group"] as const;
const STAGES = ["map", "preview", "location", "challenge"] as const;
/** Validates a state read back from browser history or session storage; anything unknown falls back to null. */
export function parseNavState(value: unknown, isMission: (id: string) => boolean): ShukNavState | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  if (!AREAS.includes(v.area as never) || !STAGES.includes(v.stage as never) || typeof v.missionId !== "string" || !isMission(v.missionId)) return null;
  const open = v.openMission as Record<string, unknown> | null | undefined;
  const openMission = open && typeof open.id === "string" && isMission(open.id) && (open.screen === "location" || open.screen === "challenge")
    ? { id: open.id, screen: open.screen as MissionScreen } : null;
  return { area: v.area as ShukNavState["area"], stage: v.stage as JourneyStage, missionId: v.missionId, openMission };
}
