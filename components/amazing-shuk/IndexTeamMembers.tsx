"use client";

import { useMemo, useState } from "react";
import { BASE_PATH } from "@/lib/base-path";
import { DEV_GUIDE_ID } from "@/lib/amazing-shuk/dev-water-session";
import type { MembershipAction } from "@/lib/amazing-shuk/group-action";
import { buildMemberRows, joinUrl, orderRequests, TEAM_MEMBERS_COPY, type MembershipView } from "@/lib/amazing-shuk/team-membership";
import PreviewJoinRequests from "./PreviewJoinRequests";

const API = BASE_PATH + "/api/amazing-shuk/dev";
type Props = { membership: MembershipView; participants: readonly { id: string; name: string }[]; currentId: string; busy: boolean;
  onAction: (action: MembershipAction) => Promise<void> };

/**
 * The team's leader (or the guide) lets people in (I3b): the join link with Share and Copy, the requests with their check codes,
 * the members with Remove, and the space left. The link is stored hashed, so the server shows it once: this phone keeps it in
 * memory only while the screen is open. Getting a new one is an explicit, confirmed step. Decisions go through the action queue.
 */
export default function IndexTeamMembers({ membership, participants, currentId, busy, onAction }: Props) {
  const [link, setLink] = useState<string | null>(null);
  const [confirmingReplace, setConfirmingReplace] = useState(false);
  const [confirmingRemove, setConfirmingRemove] = useState<string | null>(null);
  const [linkBusy, setLinkBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const members = useMemo(() => buildMemberRows(participants, membership, currentId, DEV_GUIDE_ID), [participants, membership, currentId]);
  const url = link ? joinUrl(window.location.origin, window.location.pathname, link) : null;
  const getLink = async (replace: boolean) => {
    setLinkBusy(true); setNotice("");
    try {
      const response = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "join-link", replace }) });
      const data = await response.json().catch(() => ({})) as { link?: string; error?: string };
      if (!response.ok || !data.link) { setNotice(data.error ?? TEAM_MEMBERS_COPY.linkFailed); return; }
      setLink(data.link); setConfirmingReplace(false);
    } catch { setNotice(TEAM_MEMBERS_COPY.linkFailed); }
    finally { setLinkBusy(false); }
  };
  const copy = async () => {
    if (!url) return;
    try { await navigator.clipboard.writeText(url); setNotice(TEAM_MEMBERS_COPY.copied); } catch { setNotice(TEAM_MEMBERS_COPY.linkFailed); }
  };
  const share = async () => {
    if (!url) return;
    if (typeof navigator.share !== "function") { await copy(); return; }
    // Closing the share sheet rejects; nothing to report.
    try { await navigator.share({ title: TEAM_MEMBERS_COPY.shareTitle, url }); } catch { /* Cancelled. */ }
  };
  return <PreviewJoinRequests copy={TEAM_MEMBERS_COPY} membership={membership} requests={orderRequests(membership.requests)} members={members}
    holdsLink={link !== null} confirmingReplace={confirmingReplace} confirmingRemove={confirmingRemove} busy={busy} linkBusy={linkBusy} notice={notice}
    onInvite={() => void getLink(false)} onAskReplace={() => setConfirmingReplace(true)} onReplace={() => void getLink(true)}
    onCancelReplace={() => setConfirmingReplace(false)} onShare={() => void share()} onCopy={() => void copy()}
    onLetIn={id => void onAction({ type: "let-in", requestId: id })} onDecline={id => void onAction({ type: "decline", requestId: id })}
    onAskRemove={id => setConfirmingRemove(id)} onCancelRemove={() => setConfirmingRemove(null)}
    onRemove={id => { setConfirmingRemove(null); void onAction({ type: "remove-member", participantId: id }); }} />;
}
