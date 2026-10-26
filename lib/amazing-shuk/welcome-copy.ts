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
