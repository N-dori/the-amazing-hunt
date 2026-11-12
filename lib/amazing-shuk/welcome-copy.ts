import type { IconName } from "@/components/icons";
import type { LobbyStage } from "./adventure-lobby.ts";
import type { AssignableGroupRole } from "./roles.ts";

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
  /** "Groups: 3", only from 6 players up: one group needs no group count (owner's note, 5 Nov 2026). */
  groups: (groups: number) => string;
  /** "Players per group: 4 + 4 + 3", from the actual count, only from 6 players up. */
  groupSizes: (sizes: readonly number[]) => string;
  /** A count of 1: the solo note in place of any group count. */
  solo: string;
  needsTeamsTitle: string;
  needsTeams: string;
  start: string;
  starting: string;
  needCount: string;
  /** The count step's one action: on to Ready to Start or the teams recommendation. */
  next: string;
  /** Back from Ready to Start or the teams recommendation to the count. */
  changeCount: string;
  /** The stepper (owner's note, 5 Nov 2026): its accessible name and one short label per state. */
  stepperLabel: string;
  stages: Readonly<Record<LobbyStage, string>>;
  /** Who's here: the signed-in players, then on to the roles. */
  hereTitle: string;
  hereCount: (here: number, expected: number) => string;
  hereHelp: string;
  /** The roles step, the casting call: one question per role, read out to the group. */
  rolesTitle: string;
  rolesLead: string;
  roleNames: Readonly<Record<AssignableGroupRole, string>>;
  roleQuestions: Readonly<Record<AssignableGroupRole, string>>;
  roleNobody: string;
  /** Spoken label of a player's chip in a role's row. */
  giveRole: (name: string, role: string) => string;
  back: string;
  /** Start with a required role empty: the warning and its two ways on. */
  blockedTitle: string;
  blockedText: (roles: readonly string[]) => string;
  blockedSetRoles: string;
  blockedGiveToMe: string;
  /** The players' waiting screen: what the host is doing now, and the player's own roles once given. */
  waitingStages: Readonly<Record<LobbyStage, string>>;
  yourRoles: (roles: readonly string[]) => string;
  /** The role card, on the phone of the player who has just been given a role. */
  roleCards: Readonly<Record<AssignableGroupRole, Readonly<{ title: string; text: string }>>>;
  roleCardOk: string;
  /** The profile panel: the player's own main roles. */
  profileRoles: (roles: readonly string[]) => string;
  /** I7a, the host's teams step: create the teams, then one row per team with its leader's invitation and readiness. */
  teamsTitle: string;
  teamsLead: string;
  createTeams: string;
  teamLabel: (id: string) => string;
  leaderStatus: Readonly<Record<"host" | "none" | "waiting" | "expired" | "accepted", string>>;
  teamMembers: (members: number) => string;
  teamReady: string;
  teamNotReady: string;
  shareInvite: string;
  newInvite: string;
  inviteShareTitle: (team: string) => string;
  inviteCopied: string;
  inviteFailed: string;
  /** Ready, with several teams: who the host is still waiting for; a team leader's own Ready, where the host starts. */
  waitingForTeams: (teams: readonly string[]) => string;
  allTeamsReady: string;
  leaderReady: string;
  leaderNotReady: string;
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
  // TODO(copy): drafts (owner's note, 5 Nov 2026: "Groups", shown only for more than one group or a solo player).
  groups: (groups: number) => `Groups: ${groups}`,
  groupSizes: (sizes: readonly number[]) => `Players per group: ${sizes.join(" + ")}`,
  solo: "Playing solo: you'll hold every role.",
  needsTeamsTitle: "Your adventure needs multiple teams.",
  needsTeams: "We recommend splitting into teams of up to five. Multi-team adventures are coming soon. For now, adventures can start with up to five players.",
  start: "Start Adventure",
  starting: "Starting…",
  needCount: "First, tell us how many are playing.",
  // TODO(copy): drafts for the compact onboarding steps (30 Oct 2026).
  next: "Continue",
  changeCount: "Change the number",
  // TODO(copy): every line below is a draft (onboarding and roles, 5 Nov 2026), pending the owner's approval (O16).
  stepperLabel: "Getting ready",
  stages: Object.freeze({ count: "Players", teams: "Teams", name: "Name", here: "Who's here", roles: "Roles", ready: "Ready" }),
  hereTitle: "Who's here?",
  hereCount: (here: number, expected: number) => `${here} of ${expected} here`,
  hereHelp: "Everyone opens their own link on their own phone. Anyone who comes later can still join.",
  rolesTitle: "Who does what?",
  rolesLead: "Read these out and decide together. One person can hold more than one role, and you can change roles at any stop.",
  roleNames: Object.freeze({ navigator: "Navigator", answerSubmitter: "Submitter", researcher: "Researcher", photographer: "Photographer" }),
  roleQuestions: Object.freeze({ navigator: "Who'll find the way?", answerSubmitter: "Who'll send our answers?",
    researcher: "Who'll look things up online?", photographer: "Who'll take the photos?" }),
  roleNobody: "No one yet",
  giveRole: (name: string, role: string) => `${name} as ${role}`,
  back: "Back",
  blockedTitle: "Roles still needed",
  blockedText: (roles: readonly string[]) => `No one is the ${roles.join(" or the ")} yet. Every group needs both before the start. One person can hold both.`,
  blockedSetRoles: "Set the roles",
  blockedGiveToMe: "Give them to me",
  waitingStages: Object.freeze({ count: "Your host is getting ready…", teams: "Your host is setting up the teams…", name: "Your team is choosing its name…",
    here: "Your host is getting ready…", roles: "Your leader is choosing roles…", ready: "Almost ready…" }),
  yourRoles: (roles: readonly string[]) => `You're the ${roles.join(" and the ")}.`,
  roleCards: Object.freeze({
    navigator: Object.freeze({ title: "You're the Navigator", text: "You lead the way to each stop, and tell the group when you've arrived." }),
    answerSubmitter: Object.freeze({ title: "You're the Submitter", text: "You choose and send the group's answers. Listen to everyone first." }),
    researcher: Object.freeze({ title: "You're the Researcher", text: "When a challenge needs the web, the app gives you a link. You look it up for the group." }),
    photographer: Object.freeze({ title: "You're the Photographer", text: "When a challenge asks for a photo, you take it and send it for the group." }),
  }),
  roleCardOk: "Got it",
  profileRoles: (roles: readonly string[]) => `${roles.length === 1 ? "Your role" : "Your roles"}: ${roles.join(" · ")}`,
  teamsTitle: "Your teams",
  teamsLead: "Pick a leader for each team and send them their invite. Each leader names their team and lets their players in.",
  createTeams: "Create the teams",
  teamLabel: (id: string) => `Team ${id}`,
  leaderStatus: Object.freeze({ host: "You lead this team", none: "Invite not sent", waiting: "Waiting for the leader", expired: "Invite expired", accepted: "Leader is in" }),
  teamMembers: (members: number) => members === 1 ? "1 player" : `${members} players`,
  teamReady: "Ready",
  teamNotReady: "Not ready yet",
  shareInvite: "Share invite",
  newInvite: "Make a new invite",
  inviteShareTitle: (team: string) => `Lead ${team} in The Amazing Shuk`,
  inviteCopied: "Invite copied. Send it to this team's leader only.",
  inviteFailed: "The invite couldn't be made. Try again.",
  waitingForTeams: (teams: readonly string[]) => `Waiting for ${teams.join(", ")}.`,
  allTeamsReady: "Every team is ready.",
  leaderReady: "Your team is ready. The host will start the adventure.",
  leaderNotReady: "Name your team and give the Navigator and Submitter roles to be ready.",
}) as LobbyCopy;

// "Leave the game?" (owner, 5 Nov 2026), on the phone's Back from the game's first screen.
// TODO(copy): the body line and the labels are drafts.
export const LEAVE_COPY = Object.freeze({
  title: "Leave the game?",
  text: "Your group's progress is saved, and this phone stays signed in. You can come back any time.",
  stay: "Stay",
  leave: "Leave",
});
