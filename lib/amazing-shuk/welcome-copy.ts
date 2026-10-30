import type { IconName } from "@/components/icons";

// The first screen a player sees: opening an invitation link, or coming back signed out.
// TODO(copy): every line here is a draft for owner review.
export type WelcomeCopy = {
  eyebrow: string;
  title: string;
  lead: string;
  highlights: readonly { icon: IconName; text: string }[];
  start: string;
  starting: string;
  personal: string;
  signedOut: string;
};

export const WELCOME_COPY: WelcomeCopy = Object.freeze({
  eyebrow: "Nahlaot · Mahane Yehuda",
  title: "The Amazing Shuk",
  lead: "A walking game through the lanes of Nahlaot and the Mahane Yehuda market. Solve each stop together, and taste the market on the way.",
  highlights: Object.freeze([
    Object.freeze({ icon: "map", text: "Six stops on foot" }),
    Object.freeze({ icon: "team", text: "One group, one score" }),
    Object.freeze({ icon: "food", text: "Earn food tokens" }),
  ]),
  start: "Start the game",
  starting: "Signing in…",
  personal: "This link is just for you and works once. Your phone then stays signed in for 7 days.",
  signedOut: "Open your personal invitation link to join the game, or ask your guide for a new one.",
}) as WelcomeCopy;

// The lobby, after the host's invitation and before Start Adventure (gate O16).
// Approved by the owner (29 Oct 2026): the host welcome, the waiting state, the participant count, the recommendation, "Start Adventure"
// and the multiple-team limitation. The other lines below were kept by the owner as they are; those marked TODO(copy) are still drafts.
export type LobbyCopy = {
  eyebrow: string;
  title: string;
  hostLead: string;
  guideLead: string;
  waitingTitle: string;
  waiting: string;
  countQuestion: string;
  countHelp: string;
  countEmpty: string;
  decrease: string;
  increase: string;
  /** "Recommended teams: 3", from the actual count. */
  recommendedTeams: (teams: number) => string;
  /** "Suggested split: 4 + 4 + 3", from the actual count. */
  suggestedSplit: (sizes: readonly number[]) => string;
  needsTeamsTitle: string;
  needsTeams: string;
  start: string;
  starting: string;
  needCount: string;
};

export const LOBBY_COPY: LobbyCopy = Object.freeze({
  eyebrow: "Nahlaot · Mahane Yehuda",
  // TODO(copy): draft.
  title: "Before you set off",
  hostLead: "You're the host! Tell us how many people are playing. When everyone is ready, start the adventure.",
  // TODO(copy): draft.
  guideLead: "You can set up the adventure here, or leave it to the host.",
  waitingTitle: "Waiting for the adventure to begin",
  waiting: "Your host is getting everything ready. You'll be exploring soon!",
  countQuestion: "How many are playing?",
  countHelp: "Include yourself in the total.",
  // TODO(copy): drafts (the empty count and the stepper buttons' spoken labels).
  countEmpty: "Not set yet",
  decrease: "One fewer player",
  increase: "One more player",
  recommendedTeams: (teams: number) => `Recommended teams: ${teams}`,
  suggestedSplit: (sizes: readonly number[]) => `Suggested split: ${sizes.join(" + ")}`,
  needsTeamsTitle: "Your adventure needs multiple teams.",
  needsTeams: "We recommend splitting into teams of up to five. Multi-team adventures are coming soon. For now, adventures can start with up to five players.",
  start: "Start Adventure",
  starting: "Starting…",
  needCount: "First, tell us how many are playing.",
}) as LobbyCopy;
