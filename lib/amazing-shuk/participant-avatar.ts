import { BASE_PATH } from "../base-path.ts";
import { Avatar, Style } from "@dicebear/core";
import thumbs from "@dicebear/styles/thumbs.json" with { type: "json" };

// Thumbs (CC0 1.0, DiceBear): a round, friendly shape that stays readable at 24px.
export const PARTICIPANT_AVATAR_STYLE = "thumbs@10.6.0/core@10.7.0";
// DiceBear's SVG color API requires literal values, not page CSS variables.
// Exact approved tokens from app/globals.scss; a test prevents palette drift.
export const AVATAR_COLORS = Object.freeze({ ink: "#252b2a", chalk: "#f3efe6", sumac: "#934a3a", zaatar: "#667054", amber: "#c07a2e" });
let style: Style<typeof thumbs> | undefined;

/** Only the immutable ID is a seed. Nicknames never enter generated SVG markup. */
export function createParticipantAvatar(participantId: string): string | null {
  if (!participantId.trim()) return null;
  try {
    style ??= new Style(thumbs);
    return new Avatar(style, {
      seed: participantId, size: 96, idRandomization: false,
      // The shape colour varies by ID; the face takes whichever of ink or chalk contrasts with it.
      backgroundColor: [AVATAR_COLORS.chalk], shapeColor: [AVATAR_COLORS.sumac, AVATAR_COLORS.zaatar, AVATAR_COLORS.amber],
      eyesColor: [AVATAR_COLORS.ink, AVATAR_COLORS.chalk], mouthColor: [AVATAR_COLORS.ink, AVATAR_COLORS.chalk],
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
