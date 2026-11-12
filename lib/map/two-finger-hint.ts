/** When a map in two-finger mode shows its "use two fingers" hint. Pure: the map passes what it saw during one touch gesture. */
export const TWO_FINGER_HINT = Object.freeze({
  /** A one-finger drag this far (CSS px) is an attempt to move the map, not a tap. */
  moveThreshold: 16,
  /** How long the hint stays up (ms). */
  showFor: 3000,
  /** The shortest gap between two hints (ms), so ordinary use isn't interrupted again and again. */
  cooldown: 30000,
});

/** What the page remembers between gestures: when the hint last showed, and whether the player has used two fingers (then it never shows again). */
export type TwoFingerHintMemory = Readonly<{ lastShownAt: number | null; learned: boolean }>;
export const NEW_HINT_MEMORY: TwoFingerHintMemory = Object.freeze({ lastShownAt: null, learned: false });

/** One one-finger gesture so far: how far it moved, whether the page scrolled (then the finger was scrolling, as intended), and whether this gesture already showed the hint. */
export type OneFingerGesture = Readonly<{ distance: number; pageScrolled: boolean; alreadyShown: boolean }>;

export function shouldShowTwoFingerHint(gesture: OneFingerGesture, memory: TwoFingerHintMemory, now: number): boolean {
  if (memory.learned || gesture.alreadyShown || gesture.pageScrolled || gesture.distance < TWO_FINGER_HINT.moveThreshold) return false;
  return memory.lastShownAt === null || now - memory.lastShownAt >= TWO_FINGER_HINT.cooldown;
}
