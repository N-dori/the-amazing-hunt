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
// "Start Adventure" is the owner's approved name and "How many are playing?" the plan's (29 Oct 2026).
// TODO(copy): every other line here is a draft for owner review.
export type LobbyCopy = {
  eyebrow: string;
  title: string;
  hostLead: string;
  guideLead: string;
  waiting: string;
  countQuestion: string;
  countHelp: string;
  countEmpty: string;
  decrease: string;
  increase: string;
  recommendationHeading: string;
  /** The recommendation, never presented as teams that exist: e.g. "6 teams: 5, 5, 5, 5, 5 and 5 players". */
  recommendation: (teams: number, sizes: readonly number[]) => string;
  notYet: string;
  start: string;
  startAsOneTeam: string;
  starting: string;
  needCount: string;
};

const listSizes = (sizes: readonly number[]) => sizes.length === 1 ? String(sizes[0]) : `${sizes.slice(0, -1).join(", ")} and ${sizes[sizes.length - 1]}`;

export const LOBBY_COPY: LobbyCopy = Object.freeze({
  eyebrow: "Nahlaot · Mahane Yehuda",
  title: "Before you set off",
  hostLead: "You're the host. Tell us how many are playing, then start the adventure when everyone is here.",
  guideLead: "The host or you can set up the adventure.",
  waiting: "Waiting for the host to start the adventure.",
  countQuestion: "How many are playing?",
  countHelp: "Count everyone in your group, including you.",
  countEmpty: "Not set",
  decrease: "One fewer player",
  increase: "One more player",
  recommendationHeading: "Recommended teams",
  recommendation: (teams: number, sizes: readonly number[]) => teams === 1 ? `One team of ${sizes[0]}` : `${teams} teams: ${listSizes(sizes)} players`,
  notYet: "Playing in several teams isn't available yet. For now, everyone plays as one team.",
  start: "Start Adventure",
  startAsOneTeam: "Start as one team",
  starting: "Starting…",
  needCount: "Say how many are playing first.",
}) as LobbyCopy;
