import { applyWaterMove, isWaterPuzzleSolved, WATER_CAPACITY, type WaterCups, type WaterMove, type WaterSubmissionRole } from "./water-measurement.ts";

export type WaterContainerId = keyof WaterCups;
export type WaterInteraction = Readonly<{ selected: WaterContainerId | null; pouring: boolean }>;
export const INITIAL_WATER_INTERACTION: WaterInteraction = { selected: null, pouring: false };
export type WaterContainerView = Readonly<{
  id: WaterContainerId; label: string; amount: number; capacity: number; percentage: number;
  selected: boolean; disabled: boolean; destinationMove: WaterMove | null; accessibleLabel: string;
}>;
export type WaterActionView = Readonly<{ id: WaterMove | "pour"; label: string }>;
export type WaterTaskView = Readonly<{
  containers: readonly WaterContainerView[]; actions: readonly WaterActionView[];
  solved: boolean; completed: boolean; canSubmit: boolean; canReset: boolean;
  busy: boolean; submitDisabled: boolean; status: string; prompt: string; pouring: boolean;
}>;
function pourMove(from: WaterContainerId | null, to: WaterContainerId): WaterMove | null {
  if (!from || from === "jar" || from === to) return null;
  return `pour-${from}-into-${to}` as WaterMove;
}
/** Internal empty-* IDs stay compatible with existing queued return actions. */
export function buildWaterTaskView(cups: WaterCups, completed: boolean, role: WaterSubmissionRole, busy: boolean, interaction = INITIAL_WATER_INTERACTION, started = true): WaterTaskView {
  const solved = isWaterPuzzleSolved(cups);
  const available = (move: WaterMove | null) => {
    if (!move || !started || busy || completed || solved) return false;
    const next = applyWaterMove(cups, move);
    return next !== null && (next.small !== cups.small || next.large !== cups.large || next.jar !== cups.jar);
  };
  const destinations = (["small", "large", "jar"] as const).filter(id => available(pourMove(interaction.selected, id)));
  // Other participants can empty this source or fill its destination while selected.
  const pouring = interaction.pouring && destinations.length > 0;
  const actions: WaterActionView[] = [];
  const selected = interaction.selected;
  if (!pouring && selected && selected !== "jar") {
    const fill: WaterMove = selected === "small" ? "fill-small" : "fill-large";
    const back: WaterMove = selected === "small" ? "empty-small" : "empty-large";
    if (available(fill)) actions.push({ id: fill, label: "Fill from well" });
    if (destinations.length) actions.push({ id: "pour", label: "Pour into..." });
    if (available(back)) actions.push({ id: back, label: "Return water to the well" });
  }
  return {
    containers: (["small", "large", "jar"] as const).map(id => {
      const label = id === "jar" ? "4 L — Your family's jar" : `${WATER_CAPACITY[id]} L — Well measuring vessel`;
      const destinationMove = pouring && destinations.includes(id) ? pourMove(selected, id) : null;
      return {
        id, label, amount: cups[id], capacity: WATER_CAPACITY[id], percentage: cups[id] / WATER_CAPACITY[id] * 100,
        selected: id === selected, destinationMove,
        disabled: !started || busy || completed || solved || (pouring && !destinationMove),
        accessibleLabel: `${pouring && destinationMove ? "Pour into " : "Select "}${label}, ${cups[id]} of ${WATER_CAPACITY[id]} liters`,
      };
    }),
    actions, pouring, solved, completed, busy,
    prompt: !started || solved || completed ? "" : pouring ? "Choose a container to pour into." : selected === "jar" ? "Your family's jar collects the water. Select a measuring vessel to fill it." : selected ? `${WATER_CAPACITY[selected]} L measuring vessel selected` : "Tap a measuring vessel to begin.",
    canSubmit: ["guide", "answerSubmitter", "navigatorAndAnswerSubmitter"].includes(role),
    canReset: !completed && !busy && (cups.small + cups.large + cups.jar > 0),
    submitDisabled: busy || completed || !solved,
    status: completed ? "Group answer accepted." : solved ? "Solved! Your family's jar holds exactly 4 liters. Submit your group answer." : "",
  };
}
