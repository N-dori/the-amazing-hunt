import { sessionAction, sessionView } from "./participant-store.ts";

/** Test fixture: each signed-in seat's participant ID. Schema 7 gives a seat's member a random ID when the seat is first redeemed. */
export async function seatIds(path: string, tokens: Readonly<Record<string, string>>): Promise<Record<string, string>> {
  const ids: Record<string, string> = {};
  for (const [seat, token] of Object.entries(tokens)) ids[seat] = (await sessionView(path, token)).session.activeActorId;
  return ids;
}

/** Test fixture: the roles a fresh file used to start with (player-1 navigates, player-2 submits), given by the guide through the
 * ordinary assign-role action. Schema 7 starts with no members and no roles; the seats must be signed in first. */
export async function classicRoles(path: string, tokens: Readonly<Record<string, string>>, now = Date.now()): Promise<Record<string, string>> {
  const ids = await seatIds(path, tokens);
  await sessionAction(path, tokens.guide, { type: "assign-role", role: "navigator", participantId: ids["player-1"] }, "fixture-classic-navigator", now);
  await sessionAction(path, tokens.guide, { type: "assign-role", role: "answerSubmitter", participantId: ids["player-2"] }, "fixture-classic-submitter", now);
  return ids;
}
