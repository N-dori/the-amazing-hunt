/** A sign-in link carries its secret after `#` (`#invite=…` or a team's `#join=…`), so the server never sees it in a URL.
 * The page reads it when it opens and again on every `hashchange`: a link pasted into a tab already on the page changes only
 * the fragment, which reloads nothing (owner's PC test, 2 Nov 2026). */
export type LinkFragment = { kind: "invite" | "join"; value: string } | null;

/** The invitation or join link in a page fragment. An invitation wins when both are present; anything else is no link. */
export function readLinkFragment(hash: string): LinkFragment {
  const fragment = new URLSearchParams(hash.replace(/^#/, ""));
  const invite = fragment.get("invite");
  if (invite) return { kind: "invite", value: invite };
  const join = fragment.get("join");
  return join ? { kind: "join", value: join } : null;
}
