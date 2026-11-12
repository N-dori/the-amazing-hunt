import type { IconName } from "@/components/icons";
import type { AssignableGroupRole } from "./roles.ts";

/** One emblem per main role (owner, 5 Nov 2026): on the lobby's role rows, the role card, and the player's own avatar. Stroke icons from
 * the icon set stand in until the emblems' artwork exists (its illustrator and licence are still open). */
export const ROLE_EMBLEM: Readonly<Record<AssignableGroupRole, IconName>> = Object.freeze({
  navigator: "compass", answerSubmitter: "textAnswer", researcher: "search", photographer: "camera",
});
