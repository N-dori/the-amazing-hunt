"use client";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import ActionButton from "@/components/ui/ActionButton";
import type { ParticipantIdentity } from "@/lib/amazing-shuk/participant-identity";
import { heldRoles, type GroupRoleAssignments, type ParticipantRole } from "@/lib/amazing-shuk/roles";
import { ROLE_EMBLEM } from "@/lib/amazing-shuk/role-emblems";
import { LOBBY_COPY } from "@/lib/amazing-shuk/welcome-copy";
import ListParticipantIdentity from "./ListParticipantIdentity";
import ParticipantAvatar from "./ParticipantAvatar";
import styles from "./IndexParticipantMenu.module.scss";

type Props = { participants: readonly ParticipantIdentity[]; roles: GroupRoleAssignments; currentId: string; currentRole: ParticipantRole | "guide"; solo?: boolean; busy: boolean; onSignOut: () => void };
/** The signed-in participant's avatar, opening a small panel anchored to it: who is signed in, their role, and Sign out. */
export default function IndexParticipantMenu({ participants, roles, currentId, currentRole, solo = false, busy, onSignOut }: Props) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const current = participants.find(participant => participant.id === currentId);
  const name = current?.name ?? "Participant";
  // A role emblem on the player's own avatar for each main role held (owner, 5 Nov 2026); the guide holds none.
  const held = currentRole === "guide" ? [] : heldRoles(roles, currentId, solo);
  const close = () => { setOpen(false); toggle.current?.focus(); };
  useEffect(() => {
    if (!open) return;
    root.current?.querySelector<HTMLElement>("[data-profile-close]")?.focus();
    // A tap anywhere outside closes the panel; Escape closes it and returns to the avatar.
    const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); toggle.current?.focus(); } };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); };
  }, [open]);
  return <div className={styles.menu} ref={root}>
    <button type="button" ref={toggle} className={styles.toggle} aria-expanded={open} aria-controls="participant-profile"
      aria-label={`Profile: ${name}`} onClick={() => setOpen(!open)}>
      <ParticipantAvatar participantId={currentId} displayName={name} customImageSrc={current?.customImageSrc} size={40} label="" />
      {held.length ? <span className={styles.emblems} aria-hidden="true" title={held.map(role => LOBBY_COPY.roleNames[role]).join(", ")}>
        {held.map(role => <span key={role} className={styles.emblem}><Icon name={ROLE_EMBLEM[role]} className={styles.emblemIcon} /></span>)}
      </span> : null}
    </button>
    {open ? <section className={styles.panel} id="participant-profile" aria-labelledby="participant-profile-title">
      <div className={styles.top}>
        <h2 id="participant-profile-title" className={styles.title}>Profile</h2>
        <button type="button" className={styles.close} aria-label="Close profile" data-profile-close onClick={close}><Icon name="close" className={styles.icon} /></button>
      </div>
      <ListParticipantIdentity participants={participants} roles={roles} currentId={currentId} currentRole={currentRole} solo={solo} />
      <ActionButton variant="quiet" disabled={busy} onClick={onSignOut}>Sign out</ActionButton>
    </section> : null}
  </div>;
}
