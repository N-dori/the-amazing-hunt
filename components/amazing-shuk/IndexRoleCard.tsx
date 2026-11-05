"use client";
import { useState } from "react";
import { newlyHeldRoles, type AssignableGroupRole, type GroupRoleAssignments } from "@/lib/amazing-shuk/roles";
import { LOBBY_COPY } from "@/lib/amazing-shuk/welcome-copy";
import PreviewRoleCard from "./PreviewRoleCard";

type Props = { roles: GroupRoleAssignments; currentId: string };
/** Shows a role card when this player is given a role (owner, 5 Nov 2026), in the lobby and during play. It compares each new read of
 * the roles with the last one it saw; the first read announces nothing, so a reload or a new sign-in doesn't repeat a card. */
export default function IndexRoleCard({ roles, currentId }: Props) {
  const key = `${currentId}|${roles.navigator}|${roles.answerSubmitter}`;
  const [seen, setSeen] = useState<{ key: string; roles: GroupRoleAssignments } | undefined>(undefined);
  const [queue, setQueue] = useState<readonly AssignableGroupRole[]>([]);
  // Adjusting state while rendering when the roles change, as React recommends over an effect: one render, no flash of an old card.
  if (seen?.key !== key) {
    const gained = seen ? newlyHeldRoles(seen.roles, roles, currentId) : [];
    setSeen({ key, roles });
    if (gained.length) setQueue(current => [...current.filter(role => !gained.includes(role)), ...gained]);
  }
  // A role moved on to someone else before its card was read (a mis-tap, quickly fixed) isn't announced.
  const role = queue.find(held => roles[held] === currentId);
  if (!role) return null;
  const card = LOBBY_COPY.roleCards[role];
  return <PreviewRoleCard key={role} open role={role} title={card.title} text={card.text} ok={LOBBY_COPY.roleCardOk}
    onClose={() => setQueue(current => current.filter(held => held !== role))} />;
}
