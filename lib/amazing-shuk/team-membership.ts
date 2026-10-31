/** The team's membership as its leader session and the guide see it (I3b). Requests carry a public ID, never their secret. */
export type JoinRequestView = Readonly<{ id: string; code: string; name: string | null; status: "pending" | "approved"; expiresAt: number }>;
export type MembershipView = Readonly<{ capacity: number; taken: number; leaderId: string | null; hasLink: boolean; requests: readonly JoinRequestView[] }>;
/** The joining device's request, from its own poll; "gone" when it has none or it expired. `ended`: the device sent a request
 * cookie, so it had a request that has now ended (expired, declined and expired, or cancelled by a new link). */
export type JoinStatusView = Readonly<{ status: "pending" | "approved" | "declined"; code: string; name: string | null }> | Readonly<{ status: "gone"; ended?: true }>;
/** Stable codes the server sends with these refusals (`{ error, code }`). The app decides by code, never by the message's words. */
export const JOIN_ERROR = {
  linksOff: "join-links-off",
  alreadyIn: "already-in",
  linkUnusable: "join-link-unusable",
  requestGone: "join-request-gone",
  sessionEnded: "session-ended",
} as const;
export type JoinErrorCode = (typeof JOIN_ERROR)[keyof typeof JOIN_ERROR];
export type TeamJoinStage = "checking" | "ask" | "waiting" | "declined" | "ended" | "unavailable";
/**
 * Which joining screen a phone without a session shows; null hands over to the signed-out welcome. Join links switched off hide
 * the form (only a phone that came with a link learns why); a request that ended after a reload, when no link is held, says so.
 */
export function joinStage(request: JoinStatusView | null, link: string | null, linksOff: boolean): TeamJoinStage | null {
  if (linksOff) return link || (request !== null && request.status !== "gone") ? "unavailable" : null;
  if (request === null) return "checking";
  if (request.status === "pending" || request.status === "approved") return "waiting";
  if (request.status === "declined") return "declined";
  if (link) return "ask";
  return request.status === "gone" && request.ended ? "ended" : null;
}
export type MemberRow = Readonly<{ id: string; name: string; you: boolean; removable: boolean }>;

/** The members' rows: anyone but the leader (who can't be removed until leadership can pass on, I4), the guide and yourself can be removed. */
export function buildMemberRows(participants: readonly Readonly<{ id: string; name: string }>[], membership: MembershipView, currentId: string, guideId: string): MemberRow[] {
  return participants.filter(participant => participant.id !== guideId).map(participant => ({ id: participant.id, name: participant.name,
    you: participant.id === currentId, removable: participant.id !== membership.leaderId && participant.id !== currentId }));
}
/** Requests waiting for a decision first, then those let in and still joining; each group oldest first. */
export const orderRequests = (requests: readonly JoinRequestView[]) => [...requests].sort((a, b) =>
  (a.status === b.status ? 0 : a.status === "pending" ? -1 : 1) || a.expiresAt - b.expiresAt);
/** The link players open: this page with the join token in the fragment, which browsers never send to the server or its logs. */
export const joinUrl = (origin: string, pathname: string, link: string) => `${origin}${pathname}#join=${link}`;

// TODO(copy): every line below is a draft for owner review (O16). "Ask to join", "Let in", "Waiting for your leader",
// "You're already in" and "Space" come from the I3 plan; the rest is new.
export const TEAM_JOIN_COPY = {
  eyebrow: "The Amazing Shuk",
  title: "Join your team",
  lead: "Ask to join, and your team leader will let you in.",
  nameLabel: "Your name (optional)",
  nameHelp: "Your team sees it next to your picture.",
  ask: "Ask to join",
  asking: "Asking…",
  waitingTitle: "Waiting for your leader",
  codeIntro: "Your leader will see this code. Check it matches:",
  joining: "You're in! Joining…",
  declined: "Your leader didn't let this phone in. Talk to them or your guide.",
  gone: "This request has expired. Ask to join again.",
  noLink: "This join link isn't valid anymore. Ask your team leader for a new one.",
  failed: "Could not reach the game. Check your connection and try again.",
  alreadyIn: "You're already in.",
  // The next three are the dori-ux-designer's O16 drafts (design/output/join-flow-copy-o16-2026-10-31.md J2.8, J5.2, J6.3).
  linksOff: "This join link doesn't work. Ask your team leader or guide for a new one.",
  ended: "Your request expired. Open the join link again, or ask your team leader to send it.",
  sessionEnded: "You're no longer in this team. Talk to your guide.",
} as const;
export const TEAM_MEMBERS_COPY = {
  title: "Team members",
  space: (taken: number, capacity: number) => `Space: ${taken} of ${capacity}`,
  full: "Your team is full.",
  invite: "Invite players",
  share: "Share link",
  copy: "Copy link",
  copied: "Link copied.",
  shareTitle: "Join our team in The Amazing Shuk",
  linkHelp: "Anyone with this link can ask to join. You decide who gets in.",
  hasLink: "Your team already has a join link, but this phone doesn't hold it. A new link stops the old one and cancels requests still waiting.",
  replace: "Get a new link",
  confirmReplace: "Yes, replace the link",
  cancel: "Cancel",
  requestsTitle: "Asking to join",
  noRequests: "No one is waiting to join.",
  unnamed: "No name given",
  code: "Code",
  letIn: "Let in",
  decline: "Decline",
  joiningNow: "Let in, joining…",
  remove: "Remove",
  confirmRemove: "Yes, remove",
  you: "You",
  leader: "Leader",
  linkFailed: "Could not get a join link. Try again.",
  // New, not in the O16 deck: a queued Let in, Decline or Remove refused because join links were switched off meanwhile.
  linksOff: "Letting players in by link is switched off right now.",
} as const;
