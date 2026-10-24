import { BASE_PATH } from "../base-path.ts";
import { Avatar, Style } from "@dicebear/core";
import lineFace from "@dicebear/styles/line-face.json" with { type: "json" };

export const PARTICIPANT_AVATAR_STYLE = "line-face@10.6.0/core@10.7.0";
// DiceBear's SVG color API requires literal values, not page CSS variables.
// Exact approved tokens from app/globals.scss; a test prevents palette drift.
export const AVATAR_COLORS = Object.freeze({ ink: "#252b2a", chalk: "#f3efe6", sumac: "#934a3a" });
let style: Style<typeof lineFace> | undefined;

/** Only the immutable ID is a seed. Nicknames never enter generated SVG markup. */
export function createParticipantAvatar(participantId: string): string | null {
  if (!participantId.trim()) return null;
  try {
    style ??= new Style(lineFace);
    return new Avatar(style, {
      seed: participantId, size: 96, idRandomization: false,
      backgroundColor: [AVATAR_COLORS.chalk], inkColor: [AVATAR_COLORS.ink, AVATAR_COLORS.sumac],
    }).toDataUri();
  } catch { return null; }
}
export function participantInitials(displayName: string): string {
  const words = displayName.trim().split(/\s+/u).filter(Boolean);
  return words.slice(0, 2).map(word => Array.from(word)[0]).join("").toLocaleUpperCase("en") || "?";
}
export function customParticipantImage(source?: string | null): string | null {
  if (!source || /[\u0000-\u001f\u007f\\]/u.test(source)) return null;
  if (source.startsWith("/") && !source.startsWith("//")) return source.startsWith(BASE_PATH + "/") ? source : BASE_PATH + source;
  try { const url = new URL(source); return url.protocol === "https:" && !url.username && !url.password ? source : null; }
  catch { return null; }
}
export function availableAvatarSource(custom: string | null, generated: string | null, failed: readonly string[]): string | null {
  return [custom, generated].find((source): source is string => source !== null && !failed.includes(source)) ?? null;
}
