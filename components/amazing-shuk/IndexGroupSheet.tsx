"use client";
import { useRef, useState } from "react";
import { Icon } from "@/components/icons";
import ActionButton from "@/components/ui/ActionButton";
import { buildParticipantIdentities, type ParticipantIdentity } from "@/lib/amazing-shuk/participant-identity";
import type { GroupRoleAssignments } from "@/lib/amazing-shuk/roles";
import ListParticipantBadges from "./ListParticipantBadges";
import PreviewBottomSheet from "./PreviewBottomSheet";
import styles from "./IndexGroupSheet.module.scss";

type Props = { participants: readonly ParticipantIdentity[]; roles: GroupRoleAssignments; currentId: string;
  missions: readonly { state: string }[]; balance: { points: number; foodTokens: number }; onOpenGroupTab: () => void };
// TODO(copy): drafts for owner review (30 Oct 2026): the button's name, the role line, the sheet's title, labels and its link.
const COPY = { button: "Group status", needed: "Roles needed", title: "Your group", close: "Close group status",
  rolesHint: "Anyone can take a free role in the Group tab.", openGroup: "Open the Group tab" };
/** The header's group button: a quick look at the group's real shared state in a sheet. While a role is free, a line under the
 * title says so, since only a role holder or the guide can start or submit a challenge. The Group tab stays the place to act. */
export default function IndexGroupSheet({ participants, roles, currentId, missions, balance, onOpenGroupTab }: Props) {
  const [open, setOpen] = useState(false);
  // The tab change waits until the sheet's history entry is gone (PreviewBottomSheet).
  const afterClose = useRef<(() => void) | null>(null);
  const { unassigned } = buildParticipantIdentities(participants, roles, currentId);
  const completed = missions.filter(mission => mission.state === "completed").length;
  const label = unassigned.length ? `${COPY.button}: ${COPY.needed.toLowerCase()}` : COPY.button;
  return <>
    <button type="button" className={styles.toggle} aria-label={label} aria-haspopup="dialog" onClick={() => setOpen(true)}>
      <Icon name="team" className={styles.icon} />
      {unassigned.length ? <span className={styles.dot} aria-hidden="true" /> : null}
    </button>
    {unassigned.length ? <button type="button" className={styles.needed} onClick={() => setOpen(true)}>
      <Icon name="info" className={styles.neededIcon} /><span>{COPY.needed}: {unassigned.join(", ")}</span>
    </button> : null}
    <PreviewBottomSheet open={open} title={COPY.title} closeLabel={COPY.close} onClose={() => setOpen(false)} afterClose={afterClose}>
      <div className={styles.content}>
        <dl className={styles.balance} aria-label="Shared progress">
          <div><dt>Group points</dt><dd>{balance.points}</dd></div>
          <div><dt>Food tokens</dt><dd>{balance.foodTokens}</dd></div>
          <div><dt>Missions completed</dt><dd>{completed} of {missions.length}</dd></div>
        </dl>
        <section className={styles.roles} aria-labelledby="group-sheet-roles">
          <h3 id="group-sheet-roles" className={styles.subTitle}>Roles</h3>
          <ListParticipantBadges participants={participants} roles={roles} currentId={currentId} />
          {unassigned.length ? <p className={styles.hint}>{COPY.rolesHint}</p> : null}
        </section>
        <ActionButton variant="quiet" icon="arrowForward" onClick={() => {
          afterClose.current = () => { afterClose.current = null; onOpenGroupTab(); };
          setOpen(false);
        }}>{COPY.openGroup}</ActionButton>
      </div>
    </PreviewBottomSheet>
  </>;
}
