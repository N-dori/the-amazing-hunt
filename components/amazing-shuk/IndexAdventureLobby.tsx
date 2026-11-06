"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { AdventureView, LobbyStage } from "@/lib/amazing-shuk/adventure-lobby";
import { buildLobbyView, groupSummary, lobbyStep, requiredRolesMissing, stepCount, stepperStates, waitingStage } from "@/lib/amazing-shuk/adventure-lobby";
import type { AdventureAction } from "@/lib/amazing-shuk/group-action";
import { buildLobbyRoleRows, teamPlayers, type ParticipantIdentity } from "@/lib/amazing-shuk/participant-identity";
import { heldRoles, type AssignableGroupRole, type GroupRoleAssignments } from "@/lib/amazing-shuk/roles";
import { LOBBY_COPY, WELCOME_COPY } from "@/lib/amazing-shuk/welcome-copy";
import PreviewAdventureLobby from "./PreviewAdventureLobby";
import PreviewLobbyWaiting from "./PreviewLobbyWaiting";
import PreviewStartBlocked from "./PreviewStartBlocked";

type AssignRoleAction = Readonly<{ type: "assign-role"; role: AssignableGroupRole; participantId: string | null }>;
type Props = { adventure: AdventureView; guide: boolean; participants: readonly ParticipantIdentity[]; roles: GroupRoleAssignments; currentId: string;
  busy: boolean; message: string; onAction: (action: AdventureAction | AssignRoleAction) => Promise<void> };

/** The step before or after this one, for the host's Continue and Back. The solo and teams paths skip the steps they don't need. */
const NEXT: Record<LobbyStage, LobbyStage> = { count: "here", here: "roles", roles: "ready", ready: "ready" };
const PREVIOUS: Record<LobbyStage, LobbyStage> = { count: "count", here: "count", roles: "here", ready: "roles" };

/** The lobby before Start Adventure (onboarding and roles, owner, 5 Nov 2026). The host or guide goes through the steps on this phone:
 * the count (sent at once, so the players' screens follow), who's here, the roles, Ready. The players wait on a screen that shows
 * where the host has got to. Start with the Navigator or the Submitter empty opens the warning; the server refuses it too. */
export default function IndexAdventureLobby({ adventure, guide, participants: everyone, roles, currentId, busy, message, onAction }: Props) {
  // The players only: the guide is never counted, listed or given a role here.
  const participants = useMemo(() => teamPlayers(everyone), [everyone]);
  const [draft, setDraft] = useState<number | null>(null);
  const [stage, setStage] = useState<LobbyStage>("count");
  const [blocked, setBlocked] = useState(false);
  const lobby = useMemo(() => buildLobbyView(adventure, draft), [adventure, draft]);
  const step = lobbyStep(lobby, stage);
  const memberIds = useMemo(() => participants.map(participant => participant.id), [participants]);
  const missing = requiredRolesMissing(roles, memberIds);
  const solo = lobby.count === 1;
  // Players without lobby powers get the waiting state instead of a lead.
  const lead = adventure.host ? LOBBY_COPY.hostLead : guide ? LOBBY_COPY.guideLead : null;
  // A new step replaces the screen's content, so keyboard and screen-reader focus starts again at its heading.
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstStep = useRef(true);
  useEffect(() => {
    if (firstStep.current) { firstStep.current = false; return; }
    headingRef.current?.focus();
  }, [step]);

  const roleNames = (list: readonly AssignableGroupRole[]) => list.map(role => LOBBY_COPY.roleNames[role]);
  if (step === "waiting") {
    const waiting = waitingStage(adventure, roles, memberIds);
    const mine = heldRoles(roles, currentId);
    return <PreviewLobbyWaiting copy={LOBBY_COPY} brand={WELCOME_COPY.title} states={stepperStates(waiting, false)} stageLine={LOBBY_COPY.waitingStages[waiting]}
      yourRoles={mine.length ? LOBBY_COPY.yourRoles(roleNames(mine)) : null} message={message} headingRef={headingRef} />;
  }

  const sendCount = async () => {
    if (lobby.count !== null && lobby.count !== adventure.intendedCount) await onAction({ type: "set-intended-count", count: lobby.count });
  };
  const start = async () => {
    if (!lobby.canStart || lobby.count === null) return;
    if (missing.length) { setBlocked(true); return; }
    // Both go through the offline queue in order: the count first, then Start.
    await sendCount();
    await onAction({ type: "start-adventure" });
  };
  // "Give them to me": the leader takes each missing role, then starts, all in order through the same queue.
  const giveToMeAndStart = async () => {
    setBlocked(false);
    for (const role of missing) await onAction({ type: "assign-role", role, participantId: currentId });
    await sendCount();
    await onAction({ type: "start-adventure" });
  };
  const members = participants.map(participant => ({ id: participant.id, name: participant.name, roles: roleNames(heldRoles(roles, participant.id)) }));
  // The stepper shows the host's steps for one group or a solo player; the 6–30 note has none (those groups can't start yet).
  const current: LobbyStage = step === "teams" ? "count" : step;
  const stepper = step === "teams" ? null : stepperStates(step, solo);
  return <>
    <PreviewAdventureLobby copy={LOBBY_COPY} lobby={lobby} step={step} stepper={stepper} summary={groupSummary(lobby.count)} lead={lead}
      members={members} roleRows={buildLobbyRoleRows(participants, roles, currentId)} busy={busy} message={message} headingRef={headingRef}
      onStep={delta => setDraft(stepCount(lobby.count, delta))}
      onContinue={() => { void sendCount(); setStage(NEXT.count); }}
      onNext={() => setStage(NEXT[current])}
      onBack={() => setStage(solo ? "count" : PREVIOUS[current])}
      onGive={(role, participantId) => void onAction({ type: "assign-role", role, participantId })}
      onStart={() => void start()} />
    <PreviewStartBlocked copy={LOBBY_COPY} open={blocked} missing={roleNames(missing)} canGiveToMe={adventure.leader && memberIds.includes(currentId)} busy={busy}
      onSetRoles={() => { setBlocked(false); setStage("roles"); }} onGiveToMe={() => void giveToMeAndStart()} onClose={() => setBlocked(false)} />
  </>;
}
