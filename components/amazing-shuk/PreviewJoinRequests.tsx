import ActionButton from "@/components/ui/ActionButton";
import type { JoinRequestView, MemberRow, MembershipView, TEAM_MEMBERS_COPY } from "@/lib/amazing-shuk/team-membership";
import styles from "./PreviewJoinRequests.module.scss";

type Props = {
  copy: typeof TEAM_MEMBERS_COPY; membership: MembershipView; requests: readonly JoinRequestView[]; members: readonly MemberRow[];
  holdsLink: boolean; confirmingReplace: boolean; confirmingRemove: string | null; busy: boolean; linkBusy: boolean; notice: string;
  onInvite: () => void; onAskReplace: () => void; onReplace: () => void; onCancelReplace: () => void; onShare: () => void; onCopy: () => void;
  onLetIn: (id: string) => void; onDecline: (id: string) => void; onAskRemove: (id: string) => void; onCancelRemove: () => void; onRemove: (id: string) => void;
};
/** The leader's membership panel: space, the join link, who is asking (with their check code), and the members. */
export default function PreviewJoinRequests({ copy, membership, requests, members, holdsLink, confirmingReplace, confirmingRemove, busy, linkBusy, notice,
  onInvite, onAskReplace, onReplace, onCancelReplace, onShare, onCopy, onLetIn, onDecline, onAskRemove, onCancelRemove, onRemove }: Props) {
  const full = membership.taken >= membership.capacity;
  return <section className={styles.panel} aria-labelledby="members-title">
    <div className={styles.heading}>
      <h2 id="members-title" className={styles.title}>{copy.title}</h2>
      <p className={styles.space}>{copy.space(membership.taken, membership.capacity)}</p>
    </div>
    {full ? <p className={styles.help}>{copy.full}</p> : null}

    <div className={styles.card}>
      {holdsLink ? <>
        <p className={styles.help}>{copy.linkHelp}</p>
        <div className={styles.actions}>
          <ActionButton onClick={onShare}>{copy.share}</ActionButton>
          <ActionButton variant="quiet" onClick={onCopy}>{copy.copy}</ActionButton>
        </div>
      </> : !membership.hasLink ? <ActionButton icon="team" disabled={linkBusy} onClick={onInvite}>{copy.invite}</ActionButton>
      : confirmingReplace ? <>
        <p className={styles.help}>{copy.hasLink}</p>
        <div className={styles.actions}>
          <ActionButton disabled={linkBusy} onClick={onReplace}>{copy.confirmReplace}</ActionButton>
          <ActionButton variant="quiet" onClick={onCancelReplace}>{copy.cancel}</ActionButton>
        </div>
      </> : <>
        <p className={styles.help}>{copy.hasLink}</p>
        <ActionButton variant="quiet" onClick={onAskReplace}>{copy.replace}</ActionButton>
      </>}
      <p className={styles.notice} role="status">{notice}</p>
    </div>

    <h3 className={styles.subtitle}>{copy.requestsTitle}</h3>
    {requests.length ? <ul className={styles.list}>
      {requests.map(request => <li key={request.id} className={styles.row}>
        <div className={styles.who}>
          <span className={styles.name}>{request.name ?? copy.unnamed}</span>
          <span className={styles.code}><span className={styles.codeLabel}>{copy.code}</span> {request.code}</span>
        </div>
        {request.status === "approved" ? <p className={styles.help}>{copy.joiningNow}</p> : <div className={styles.actions}>
          <ActionButton disabled={busy || full} onClick={() => onLetIn(request.id)}>{copy.letIn}</ActionButton>
          <ActionButton variant="quiet" disabled={busy} onClick={() => onDecline(request.id)}>{copy.decline}</ActionButton>
        </div>}
      </li>)}
    </ul> : <p className={styles.help}>{copy.noRequests}</p>}

    <ul className={styles.list} aria-label={copy.title}>
      {members.map(member => <li key={member.id} className={styles.row}>
        <span className={styles.name}>{member.name}{member.you ? <span className={styles.tag}>{copy.you}</span> : null}
          {member.id === membership.leaderId ? <span className={styles.tag}>{copy.leader}</span> : null}</span>
        {!member.removable ? null : confirmingRemove === member.id ? <div className={styles.actions}>
          <ActionButton disabled={busy} onClick={() => onRemove(member.id)}>{copy.confirmRemove}</ActionButton>
          <ActionButton variant="quiet" onClick={onCancelRemove}>{copy.cancel}</ActionButton>
        </div> : <ActionButton variant="quiet" disabled={busy} onClick={() => onAskRemove(member.id)}>{copy.remove}</ActionButton>}
      </li>)}
    </ul>
  </section>;
}
