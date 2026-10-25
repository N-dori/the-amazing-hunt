import type { GatewayProgress } from "./gateway-progress.ts";
import type { WaterSubmissionRole } from "./water-measurement.ts";
export function buildGatewayView(progress: GatewayProgress, role: WaterSubmissionRole, busy: boolean) {
  return { stage: progress.stage, yearAnswer: progress.yearAnswer, attempts: progress.attempts,
    canSubmit: ["guide", "answerSubmitter", "navigatorAndAnswerSubmitter"].includes(role), busy };
}
export type GatewayView = ReturnType<typeof buildGatewayView>;
