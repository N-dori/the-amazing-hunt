import type { ReactNode } from "react";

// Shape data for the game's line icons, drawn on a 24 × 24 grid and stroked by <Icon>
// (currentColor, 1.75 stroke, round caps and joins), the same style as the platform's
// app/components/navigation/ArrowIcon.tsx. A dot is a zero-length path ("h.01"), which the
// round cap renders as a filled circle.
//
// These are a working set for building screens. Replace a shape here when the illustrator's
// artwork arrives; every screen that uses the name picks it up.
export const iconPaths = {
  // Navigation
  arrowForward: <><path d="M4 12h15" /><path d="M13 6l6 6-6 6" /></>,
  arrowBack: <><path d="M20 12H5" /><path d="M11 6l-6 6 6 6" /></>,
  close: <><path d="M6 6l12 12" /><path d="M18 6L6 18" /></>,
  externalLink: <><path d="M14 4h6v6" /><path d="M20 4l-9 9" /><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></>,

  // Map and places
  mapMarker: <><path d="M12 21s-6-5.6-6-11a6 6 0 0 1 12 0c0 5.4-6 11-6 11z" /><circle cx="12" cy="10" r="2.25" /></>,
  compass: <><circle cx="12" cy="12" r="9" /><path d="M15.5 8.5l-2 5-5 2 2-5z" /></>,
  // A magnifier: what to look for at a place.
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="M15.5 15.5L20 20" /></>,

  // Answer inputs
  camera: <><path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" /><circle cx="12" cy="13.5" r="3.5" /></>,
  microphone: <><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5.5 11a6.5 6.5 0 0 0 13 0" /><path d="M12 17.5V21" /><path d="M9 21h6" /></>,
  textAnswer: <><path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17z" /><path d="M14 7l3 3" /></>,

  // Evidence
  source: <><path d="M12 6.5C10.5 5 8 4.5 4 4.5v14c4 0 6.5.5 8 2 1.5-1.5 4-2 8-2v-14c-4 0-6.5.5-8 2z" /><path d="M12 6.5v14" /></>,
  catalogId: <><path d="M5 9h14" /><path d="M5 15h14" /><path d="M10 4L8 20" /><path d="M16 4l-2 16" /></>,
  dossier: <><path d="M3 7a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" /></>,

  // Play
  hint: <><path d="M9 18h6" /><path d="M10 21h4" /><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z" /></>,
  puzzle: <><path d="M5 8h3a2 2 0 1 1 4 0h3v3a2 2 0 1 1 0 4v3h-3a2 2 0 1 0-4 0H5v-3a2 2 0 1 0 0-4z" /></>,
  timer: <><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 2.5" /><path d="M9.5 2.5h5" /></>,
  score: <><path d="M12 3.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.8l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z" /></>,
  team: <><circle cx="9" cy="8" r="3" /><path d="M3.5 19a5.5 5.5 0 0 1 11 0" /><circle cx="16.5" cy="9" r="2.5" /><path d="M15 14.2a4.5 4.5 0 0 1 5.5 4.8" /></>,
  // A folded paper map: the mission map tab.
  map: <><path d="M3 6.5l6-2.5 6 2.5 6-2.5v13.5l-6 2.5-6-2.5-6 2.5z" /><path d="M9 4v13.5" /><path d="M15 6.5V20" /></>,
  // A bowl with rising steam: food rewards.
  food: <><path d="M3.5 12h17a8.5 8.5 0 0 1-17 0z" /><path d="M9 8c0-1 1-1.5 1-2.5S9 4 9 3" /><path d="M14 8c0-1 1-1.5 1-2.5S14 4 14 3" /></>,
  reward: <><path d="M4 10h16v10H4z" /><path d="M3 7h18v3H3z" /><path d="M12 7v13" /><path d="M12 7c-2.5 0-4.5-.6-4.5-2s2.5-1.5 4.5 2" /><path d="M12 7c2.5 0 4.5-.6 4.5-2S14 3.5 12 7" /></>,
  locked: <><rect x="5" y="11" width="14" height="9" rx="1.5" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  unlocked: <><rect x="5" y="11" width="14" height="9" rx="1.5" /><path d="M8 11V8a4 4 0 0 1 7.5-2" /></>,
  check: <><path d="M5 12.5l4.5 4.5L19 7" /></>,
  guide: <><path d="M5 21V4" /><path d="M5 4h11l-2 4 2 4H5" /></>,

  // HARMONY and media
  transmission: <><path d="M12 12h.01" /><path d="M8.5 15.5a5 5 0 0 1 0-7" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M5.6 18.4a9 9 0 0 1 0-12.8" /><path d="M18.4 5.6a9 9 0 0 1 0 12.8" /></>,
  audioOn: <><path d="M4 9.5h3l4.5-4v13l-4.5-4H4z" /><path d="M15 9a4 4 0 0 1 0 6" /><path d="M17.5 6.5a7.5 7.5 0 0 1 0 11" /></>,
  audioOff: <><path d="M4 9.5h3l4.5-4v13l-4.5-4H4z" /><path d="M16 9.5l5 5" /><path d="M21 9.5l-5 5" /></>,

  // System states
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><path d="M12 8h.01" /></>,
  offline: <><path d="M3 3l18 18" /><path d="M8.5 16a5 5 0 0 1 7 0" /><path d="M5 12.5a10 10 0 0 1 4-2.3" /><path d="M19 12.5a10 10 0 0 0-3.4-2.1" /><path d="M2 8.8a15 15 0 0 1 4.2-2.6" /><path d="M22 8.8a15 15 0 0 0-11.3-3.7" /><path d="M12 19.5h.01" /></>,
  retry: <><path d="M20 12a8 8 0 1 1-2.3-5.7" /><path d="M20 4v4.5h-4.5" /></>,
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof iconPaths;

export const iconNames = Object.keys(iconPaths) as IconName[];
