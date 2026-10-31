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
// TODO(copy): drafts for owner review (30 Oct 2026): the button's name, the role count, the sheet's title, labels and its link.
const COPY = { button: "Group status", needed: "roles needed", neededOne: "role needed", title: "Your group", close: "Close group status",
  rolesHint: "Anyone can take a free role in the Group tab.", openGroup: "Open the Group tab" };
/** The header's group button: a quick look at the group's real shared state in a sheet. While a role is free, a count on the button
 * says how many (only a role holder or the guide can start or submit a challenge; the challenge says so where it blocks). The Group
 * tab stays the place for the roster and for taking a role, so the sheet links there only while one is free. */
export default function IndexGroupSheet({ participants, roles, currentId, missions, balance, onOpenGroupTab }: Props) {
  const [open, setOpen] = useState(false);
  // The tab change waits until the sheet's history entry is gone (PreviewBottomSheet).
  const afterClose = useRef<(() => void) | null>(null);
  const { unassigned } = buildParticipantIdentities(participants, roles, currentId);
  const completed = missions.filter(mission => mission.state === "completed").length;
  const free = unassigned.length;
  const label = free ? `${COPY.button}: ${free} ${free === 1 ? COPY.neededOne : COPY.needed}` : COPY.button;
  return <>
    <button type="button" className={styles.toggle} aria-label={label} aria-haspopup="dialog" onClick={() => setOpen(true)}>
      <Icon name="team" className={styles.icon} />
      {free ? <span className={styles.count} aria-hidden="true">{free}</span> : null}
    </button>
    <PreviewBottomSheet open={open} title={COPY.title} closeLabel={COPY.close} onClose={() => setOpen(false)} afterClose={afterClose}>
      <div className={styles.content}>
        <dl className={styles.balance} aria-label="Shared progress">
          <div><dt>Points</dt><dd>{balance.points}</dd></div>
          <div><dt>Food tokens</dt><dd>{balance.foodTokens}</dd></div>
          <div><dt>Missions</dt><dd>{completed} of {missions.length}</dd></div>
        </dl>
        <section className={styles.roles} aria-labelledby="group-sheet-roles">
          <h3 id="group-sheet-roles" className={styles.subTitle}>Roles</h3>
          <ListParticipantBadges participants={participants} roles={roles} currentId={currentId} />
          {free ? <p className={styles.hint}>{COPY.rolesHint}</p> : null}
        </section>
        {free ? <ActionButton variant="quiet" icon="arrowForward" onClick={() => {
          afterClose.current = () => { afterClose.current = null; onOpenGroupTab(); };
          setOpen(false);
        }}>{COPY.openGroup}</ActionButton> : null}
      </div>
    </PreviewBottomSheet>
  </>;
}
