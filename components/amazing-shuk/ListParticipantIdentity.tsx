import { buildParticipantIdentities, roleLabel, type ParticipantIdentity } from "@/lib/amazing-shuk/participant-identity";
import { heldRoles, type GroupRoleAssignments, type ParticipantRole } from "@/lib/amazing-shuk/roles";
import { LOBBY_COPY } from "@/lib/amazing-shuk/welcome-copy";
import PreviewParticipantIdentity from "./PreviewParticipantIdentity";
import styles from "./ListParticipantIdentity.module.scss";
type Props = { participants: readonly ParticipantIdentity[]; roles: GroupRoleAssignments; currentId: string; currentRole: ParticipantRole | "guide"; solo?: boolean };
/** The profile's identity: who is signed in and their own main roles (owner, 5 Nov 2026: Navigator, Submitter, Researcher, Photographer;
 * a solo player holds them all). The group's roles live in the group sheet and the Group tab. A player with no main role has no role
 * line: Advisor was removed. */
export default function ListParticipantIdentity({ participants, roles, currentId, currentRole, solo = false }: Props) {
  const view = buildParticipantIdentities(participants, roles, currentId);
  const mine = currentRole === "guide" ? [] : heldRoles(roles, currentId, solo).map(role => LOBBY_COPY.roleNames[role]);
  const line = currentRole === "guide" ? `Your role: ${roleLabel("guide")}` : mine.length ? LOBBY_COPY.profileRoles(mine) : null;
  return <div className={styles.group}>
    {view.current ? <PreviewParticipantIdentity {...view.current} label="Signed in as" showResponsibilities={false} /> : null}
    {line ? <p>{line}</p> : null}
  </div>;
}
