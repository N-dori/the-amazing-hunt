"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { AdventureView, LobbyStage, TeamOverviewView, TeamView } from "@/lib/amazing-shuk/adventure-lobby";
import { buildLobbyView, expectedTeamSize, groupSummary, lobbyFlow, lobbyStep, nextStage, previousStage, recommendedTeamCount, requiredRolesMissing,
  stepCount, stepperStates, teamsNotReady, waitingStage } from "@/lib/amazing-shuk/adventure-lobby";
import type { AdventureAction, TeamNameAction } from "@/lib/amazing-shuk/group-action";
import { buildLobbyRoleRows, teamPlayers, type ParticipantIdentity } from "@/lib/amazing-shuk/participant-identity";
import { heldRoles, type AssignableGroupRole, type GroupRoleAssignments } from "@/lib/amazing-shuk/roles";
import { TEAM_NAME_COPY, TEAM_NAME_MAX, teamNameMessage, teamNameSuggestions, validateTeamName } from "@/lib/amazing-shuk/team-name";
import { LOBBY_COPY, WELCOME_COPY } from "@/lib/amazing-shuk/welcome-copy";
import { BASE_PATH } from "@/lib/base-path";
import PreviewAdventureLobby from "./PreviewAdventureLobby";
import PreviewLobbyTeams from "./PreviewLobbyTeams";
import PreviewLobbyWaiting from "./PreviewLobbyWaiting";
import PreviewStartBlocked from "./PreviewStartBlocked";
import PreviewTeamName from "./PreviewTeamName";

type AssignRoleAction = Readonly<{ type: "assign-role"; role: AssignableGroupRole; participantId: string | null }>;
type Props = { adventure: AdventureView; guide: boolean; participants: readonly ParticipantIdentity[]; roles: GroupRoleAssignments; currentId: string;
  // I7a: this phone's team, and for the host and guide the overview of every team.
  team?: TeamView; teams?: readonly TeamOverviewView[];
  busy: boolean; message: string; onAction: (action: AdventureAction | AssignRoleAction | TeamNameAction) => Promise<void> };
const API = BASE_PATH + "/api/amazing-shuk/dev";

/**
 * The lobby before Start Adventure (onboarding and roles, owner, 5 Nov 2026; multiple teams, I7a). Each phone goes through its own
 * flow (`lobbyFlow`): the host of one group counts, sees who's here and gives the roles; the host of 6–30 also creates the teams, shares
 * each team's leader invitation and names team A; another team's leader names their team, lets their players in and gives the roles.
 * Players wait on a screen that follows their team. The host starts once every team is ready; the server checks every rule again.
 */
export default function IndexAdventureLobby({ adventure, guide, participants: everyone, roles, currentId, team, teams, busy, message, onAction }: Props) {
  // The players only: the guide is never counted, listed or given a role here.
  const participants = useMemo(() => teamPlayers(everyone), [everyone]);
  const leaderOnly = adventure.leader && !adventure.canManage;
  const [draft, setDraft] = useState<number | null>(null);
  const [stage, setStage] = useState<LobbyStage>(leaderOnly ? "name" : "count");
  const [blocked, setBlocked] = useState(false);
  const [nameDraft, setNameDraft] = useState<string | null>(null);
  const [nameError, setNameError] = useState("");
  const [linkBusy, setLinkBusy] = useState<string | null>(null);
  const [inviteNotice, setInviteNotice] = useState("");
  const base = useMemo(() => buildLobbyView(adventure, draft), [adventure, draft]);
  const flow = lobbyFlow(base, leaderOnly);
  const created = (team?.count ?? 1) > 1 && base.count !== null && (team?.count ?? 1) === recommendedTeamCount(base.count);
  const waitingFor = teams ? teamsNotReady(teams) : [];
  // With several teams, Start waits until every team is ready (the server checks it again).
  const lobby = flow === "multi" ? { ...base, canStart: base.canManage && created && waitingFor.length === 0 } : base;
  const step = lobbyStep(lobby, stage, leaderOnly);
  const memberIds = useMemo(() => participants.map(participant => participant.id), [participants]);
  const missing = requiredRolesMissing(roles, memberIds);
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
    const waiting = waitingStage(adventure, roles, memberIds, team);
    const mine = heldRoles(roles, currentId);
    return <PreviewLobbyWaiting copy={LOBBY_COPY} brand={team && team.count > 1 && team.name ? team.name : WELCOME_COPY.title}
      states={stepperStates(waiting, team && team.count > 1 ? "leader" : "group")} stageLine={LOBBY_COPY.waitingStages[waiting]}
      yourRoles={mine.length ? LOBBY_COPY.yourRoles(roleNames(mine)) : null} message={message} headingRef={headingRef} />;
  }

  const sendCount = async () => {
    if (lobby.count !== null && lobby.count !== adventure.intendedCount) await onAction({ type: "set-intended-count", count: lobby.count });
  };
  // Continue from the count: the count, then the teams resized to it when the count needs teams or teams already exist.
  const continueFromCount = async () => {
    const next = nextStage(flow, "count");
    setStage(next);
    await sendCount();
    if (lobby.count !== null && (recommendedTeamCount(lobby.count) > 1 || (team?.count ?? 1) > 1)) await onAction({ type: "set-teams" });
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
  // A team leader's invitation: made on the server, then handed on with the phone's Share sheet, or copied. Never shown on screen.
  const shareInvite = async (teamId: string) => {
    setLinkBusy(teamId); setInviteNotice("");
    try {
      const response = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "leader-link", teamId }) });
      const data = await response.json().catch(() => ({})) as { link?: string; error?: string };
      if (!response.ok || !data.link) { setInviteNotice(data.error ?? LOBBY_COPY.inviteFailed); return; }
      const url = `${window.location.origin}${window.location.pathname}#invite=${data.link}`;
      const label = teams?.find(row => row.id === teamId)?.name ?? LOBBY_COPY.teamLabel(teamId);
      if (typeof navigator.share === "function") {
        try { await navigator.share({ title: LOBBY_COPY.inviteShareTitle(label), url }); return; } catch { /* Cancelled: copy instead. */ }
      }
      try { await navigator.clipboard.writeText(url); setInviteNotice(LOBBY_COPY.inviteCopied); } catch { setInviteNotice(LOBBY_COPY.inviteFailed); }
    } catch { setInviteNotice(LOBBY_COPY.inviteFailed); }
    finally { setLinkBusy(null); }
  };
  // The team's name: checked here for instant feedback, and by the server, whose answer is final.
  const taken = new Set(team?.taken ?? []);
  const nameValue = nameDraft ?? team?.name ?? "";
  const confirmName = async () => {
    const result = validateTeamName(nameValue, taken);
    if (!result.ok) { setNameError(teamNameMessage(result.error)); return; }
    setNameError("");
    await onAction({ type: "name-team", name: result.name });
    setNameDraft(null);
  };
  const naming = <PreviewTeamName copy={TEAM_NAME_COPY} value={nameValue} error={nameError} saved={team?.name ?? null} saving={busy && nameDraft !== null}
    suggestions={teamNameSuggestions(taken)} maxLength={TEAM_NAME_MAX} onChange={value => { setNameDraft(value); setNameError(""); }}
    onPick={name => { setNameDraft(name); setNameError(""); }} onConfirm={() => void confirmName()} />;

  const members = participants.map(participant => ({ id: participant.id, name: participant.name, roles: roleNames(heldRoles(roles, participant.id)) }));
  const readyNote = flow === "leader" ? (team?.name && missing.length === 0 ? LOBBY_COPY.leaderReady : LOBBY_COPY.leaderNotReady)
    : flow === "multi" ? (waitingFor.length ? LOBBY_COPY.waitingForTeams(waitingFor) : LOBBY_COPY.allTeamsReady) : undefined;
  // Who's here counts this team's expected players: the whole count for one group, this team's share of it with several.
  const expected = flow === "multi" || flow === "leader" ? expectedTeamSize(base.count, team?.id ?? "A") : base.count;
  return <>
    <PreviewAdventureLobby copy={LOBBY_COPY} lobby={{ ...lobby, count: step === "here" ? expected : lobby.count }} step={step} stepper={stepperStates(step, flow)}
      summary={groupSummary(base.count)} lead={lead} members={members} roleRows={buildLobbyRoleRows(participants, roles, currentId)} busy={busy} message={message}
      headingRef={headingRef} teams={<PreviewLobbyTeams copy={LOBBY_COPY} summary={groupSummary(base.count)} teams={teams ?? []} created={created} busy={busy}
        linkBusy={linkBusy} notice={inviteNotice} onCreate={() => void onAction({ type: "set-teams" })} onShare={teamId => void shareInvite(teamId)} />}
      naming={naming} namingTitle={TEAM_NAME_COPY.heading} readyNote={readyNote} canStart={flow !== "leader"}
      backLabel={flow === "leader" && step === "name" ? "" : previousStage(flow, step) === "count" ? LOBBY_COPY.changeCount : LOBBY_COPY.back}
      onStep={delta => setDraft(stepCount(lobby.count, delta))}
      onContinue={() => void continueFromCount()}
      onNext={() => setStage(nextStage(flow, step))}
      onBack={() => setStage(previousStage(flow, step))}
      onGive={(role, participantId) => void onAction({ type: "assign-role", role, participantId })}
      onStart={() => void start()} />
    <PreviewStartBlocked copy={LOBBY_COPY} open={blocked} missing={roleNames(missing)} canGiveToMe={adventure.leader && memberIds.includes(currentId)} busy={busy}
      onSetRoles={() => { setBlocked(false); setStage("roles"); }} onGiveToMe={() => void giveToMeAndStart()} onClose={() => setBlocked(false)} />
  </>;
}
