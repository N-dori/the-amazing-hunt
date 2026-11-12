import type { ReactNode, Ref } from "react";
import { Icon } from "@/components/icons";
import ActionButton from "@/components/ui/ActionButton";
import type { GroupSummary, LobbyStep, LobbyView, StepperState } from "@/lib/amazing-shuk/adventure-lobby";
import type { LobbyRoleRowView } from "@/lib/amazing-shuk/participant-identity";
import type { AssignableGroupRole } from "@/lib/amazing-shuk/roles";
import type { LobbyCopy } from "@/lib/amazing-shuk/welcome-copy";
import ParticipantAvatar from "./ParticipantAvatar";
import PreviewLobbyRoles from "./PreviewLobbyRoles";
import PreviewLobbyStepper from "./PreviewLobbyStepper";
import styles from "./PreviewAdventureLobby.module.scss";

export type LobbyMemberView = Readonly<{ id: string; name: string; roles: readonly string[] }>;
type Props = { copy: LobbyCopy; lobby: LobbyView; step: Exclude<LobbyStep, "waiting">; stepper: readonly StepperState[] | null; summary: GroupSummary;
  lead: string | null; members: readonly LobbyMemberView[]; roleRows: readonly LobbyRoleRowView[]; busy: boolean; message: string;
  headingRef: Ref<HTMLHeadingElement>; onStep: (delta: -1 | 1) => void; onContinue: () => void; onNext: () => void; onBack: () => void;
  onGive: (role: AssignableGroupRole, participantId: string | null) => void; onStart: () => void;
  // I7a: the host's teams step and the naming step, rendered by the caller; their headings; and on Ready, who the host waits for (or,
  // for another team's leader, the line that the host starts). `canStart` false hides Start (a team's leader never starts).
  teams?: ReactNode; naming?: ReactNode; namingTitle?: string; readyNote?: string; canStart?: boolean; backLabel?: string };
/** The host's or guide's lobby, one purpose per screen (owner's note, 5 Nov 2026: states with a stepper): how many are playing, who's
 * here, who does what, then Ready to Start. A solo player goes from the count to Ready; 6–30 see the groups note and can't start yet. */
export default function PreviewAdventureLobby({ copy, lobby, step, stepper, summary, lead, members, roleRows, busy, message, headingRef,
  onStep, onContinue, onNext, onBack, onGive, onStart, teams, naming, namingTitle, readyNote, canStart = true, backLabel }: Props) {
  const title = step === "here" ? copy.hereTitle : step === "roles" ? copy.rolesTitle : step === "teams" ? copy.teamsTitle
    : step === "name" ? namingTitle ?? copy.title : copy.title;
  const back = backLabel ?? copy.back;
  return <section className={styles.lobby} aria-labelledby="lobby-title">
    <p className={styles.eyebrow}>{copy.eyebrow}</p>
    {stepper ? <PreviewLobbyStepper label={copy.stepperLabel} states={stepper} names={copy.stages} /> : null}
    <h1 id="lobby-title" className={styles.title} ref={headingRef} tabIndex={-1}>{title}</h1>

    {step === "count" ? <>
      {lead ? <p className={styles.lead}>{lead}</p> : null}
      <fieldset className={styles.card}>
        <legend className={styles.question}>{copy.countQuestion}</legend>
        <p className={styles.help}>{copy.countHelp}</p>
        <div className={styles.stepper}>
          <button type="button" className={styles.step} aria-label={copy.decrease} disabled={busy || !lobby.canDecrease} onClick={() => onStep(-1)}>
            <Icon name="minus" className={styles.stepIcon} />
          </button>
          <output className={`${styles.count} ${lobby.count === null ? styles.countEmpty : ""}`} aria-live="polite">{lobby.count ?? copy.countEmpty}</output>
          <button type="button" className={styles.step} aria-label={copy.increase} disabled={busy || !lobby.canIncrease} onClick={() => onStep(1)}>
            <Icon name="plus" className={styles.stepIcon} />
          </button>
        </div>
      </fieldset>
      <div className={styles.action}>
        <ActionButton block icon="arrowForward" className={styles.primary} disabled={busy || lobby.count === null} onClick={onContinue}
          aria-describedby={lobby.count === null ? "lobby-need-count" : undefined}>{copy.next}</ActionButton>
        {lobby.count === null ? <p className={styles.help} id="lobby-need-count">{copy.needCount}</p> : null}
      </div>
    </> : null}

    {step === "here" ? <>
      <div className={styles.card}>
        <p className={styles.question}>{copy.hereCount(members.length, lobby.count ?? members.length)}</p>
        <ul className={styles.members}>
          {members.map(member => <li key={member.id} className={styles.member}>
            <ParticipantAvatar participantId={member.id} displayName={member.name} size={40} label="" /><span>{member.name}</span>
          </li>)}
        </ul>
        <p className={styles.help}>{copy.hereHelp}</p>
      </div>
      <div className={styles.action}>
        <ActionButton block icon="arrowForward" className={styles.primary} disabled={busy} onClick={onNext}>{copy.next}</ActionButton>
        <ActionButton variant="quiet" className={styles.back} disabled={busy} onClick={onBack}>{back}</ActionButton>
      </div>
    </> : null}

    {step === "roles" ? <>
      <p className={styles.lead}>{copy.rolesLead}</p>
      <PreviewLobbyRoles copy={copy} rows={roleRows} busy={busy} onGive={onGive} />
      <div className={styles.action}>
        <ActionButton block icon="arrowForward" className={styles.primary} disabled={busy} onClick={onNext}>{copy.next}</ActionButton>
        <ActionButton variant="quiet" className={styles.back} disabled={busy} onClick={onBack}>{copy.back}</ActionButton>
      </div>
    </> : null}

    {step === "teams" ? <>
      <p className={styles.lead}>{copy.teamsLead}</p>
      {teams}
      <div className={styles.action}>
        <ActionButton block icon="arrowForward" className={styles.primary} disabled={busy} onClick={onNext}>{copy.next}</ActionButton>
        <ActionButton variant="quiet" className={styles.back} disabled={busy} onClick={onBack}>{back}</ActionButton>
      </div>
    </> : null}

    {step === "name" ? <>
      {naming}
      <div className={styles.action}>
        <ActionButton block icon="arrowForward" className={styles.primary} disabled={busy} onClick={onNext}>{copy.next}</ActionButton>
        {backLabel !== "" ? <ActionButton variant="quiet" className={styles.back} disabled={busy} onClick={onBack}>{back}</ActionButton> : null}
      </div>
    </> : null}

    {step === "ready" ? <>
      <div className={styles.card}>
        <p className={styles.summary}><span className={styles.help}>{copy.countQuestion}</span><span className={styles.summaryCount}>{lobby.count}</span></p>
        {/* One group needs no group count and no split (owner's note, 5 Nov 2026): only solo, or 6 and more, say anything here. */}
        {summary?.kind === "solo" ? <p className={styles.recommendation}><Icon name="team" className={styles.recommendationIcon} />{copy.solo}</p> : null}
        {summary?.kind === "groups" ? <p className={styles.recommendation}><Icon name="team" className={styles.recommendationIcon} />{copy.groups(summary.groups)}</p> : null}
        {summary?.kind !== "solo" ? <ul className={styles.members}>
          {members.map(member => <li key={member.id} className={styles.member}>
            <ParticipantAvatar participantId={member.id} displayName={member.name} size={40} label="" />
            <span><strong>{member.name}</strong>{member.roles.length ? <span className={styles.memberRoles}> {member.roles.join(" · ")}</span> : null}</span>
          </li>)}
        </ul> : null}
        {readyNote ? <div className={styles.notYet}><Icon name="info" className={styles.notYetIcon} /><p>{readyNote}</p></div> : null}
      </div>
      {/* Ready to Start is the only step that can start; the server checks every team too. */}
      <div className={styles.action}>
        {canStart ? <ActionButton block icon="arrowForward" className={styles.primary} disabled={busy || !lobby.canStart} onClick={onStart}>
          {busy ? copy.starting : copy.start}</ActionButton> : null}
        <ActionButton variant="quiet" className={styles.back} disabled={busy} onClick={onBack}>{back}</ActionButton>
      </div>
    </> : null}
    <p className={styles.message} role="status">{message}</p>
  </section>;
}
