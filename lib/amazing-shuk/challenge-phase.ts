/** UX-3 (owner, 2 Nov 2026): the story first, then Start, then the challenge. Screen-only hiding on one page (option A):
 * Start is the only gate, and the server's accepted start decides the side, so a refresh or a second phone agrees.
 * Marzipan keeps its old screen (`storyFirst: false`) until its rework. */

export type ChallengePhase = "story" | "play" | "done";

export function challengePhase(started: boolean, completed: boolean, storyFirst: boolean): ChallengePhase {
  if (completed) return "done";
  return started || !storyFirst ? "play" : "story";
}

/** Before Start the story is always open (no toggle). After it, the story folds to one line, one tap from reopening.
 * A mission without the gate keeps the old default: open. */
export function storyDefaultOpen(phase: ChallengePhase, storyFirst: boolean): boolean {
  return !storyFirst || phase === "story";
}

/** The fold state is kept per mission and per phase, so folding one stop's story never folds the next stop's. */
export function storyKey(missionId: string, phase: ChallengePhase): string {
  return `${missionId}:${phase}`;
}
