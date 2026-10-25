import type { ParticipantIdentityView } from "@/lib/amazing-shuk/participant-identity";
import ActionButton from "@/components/ui/ActionButton";
import PreviewParticipantIdentity from "./PreviewParticipantIdentity";
import styles from "./ListGroupRoles.module.scss";
type Props = { title: string; responsibility?: string; holder: ParticipantIdentityView | null; candidates: readonly ParticipantIdentityView[];
  volunteerLabel: string; active: boolean; volunteered: boolean; guide: boolean; busy: boolean; onVolunteer: () => void; onWithdraw: () => void; onStepDown: () => void };
export default function PreviewGroupRole({ title, responsibility, holder, candidates, volunteerLabel, active, volunteered, guide, busy, onVolunteer, onWithdraw, onStepDown }: Props) {
  return <section className={styles.role} aria-label={title}>
    <h4>{title}</h4>
    {responsibility ? <p>{responsibility}</p> : null}
    {holder ? <PreviewParticipantIdentity {...holder} showResponsibilities={false} /> : <p>Unassigned</p>}
    <ul className={styles.candidates} aria-label={`${title} volunteers`}>
      {candidates.map(candidate => <li key={candidate.participantId}><PreviewParticipantIdentity {...candidate} label="Volunteered" showResponsibilities={false} /></li>)}
    </ul>
    {!guide ? active
      ? <ActionButton variant="quiet" disabled={busy} onClick={onStepDown}>Step down</ActionButton>
      : volunteered
        ? <><p role="status">Volunteered; awaiting guide</p><ActionButton variant="quiet" disabled={busy} onClick={onWithdraw}>Withdraw volunteer</ActionButton></>
        : <ActionButton variant="quiet" disabled={busy} onClick={onVolunteer}>{volunteerLabel}</ActionButton> : null}
  </section>;
}
