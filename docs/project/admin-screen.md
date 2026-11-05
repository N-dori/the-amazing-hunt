# The Amazing Shuk: admin screen (ideas)

**Status: ideas for the owner, 5 Nov 2026. Not approved; nothing built.** Each item needs its own approval before any design or code. Started at the owner's request, after the question "how do we support players who change phone or lose their sign-in?"

## Why

Today every sign-in problem needs the operator on the server: `scripts/shuk-invite.ts` inside the `dori-shuk` container, over SSH. The other system jobs are command-line only too:
- a new adventure: `shuk-new-adventure.ts`;
- display names: `shuk-name.ts`;
- the join-link switch: a compose override and a container restart;
- backups: `docker exec … cat /data/state.json`.

The guide's in-game view already covers play (confirm arrival, approve a task, timing, roles through `assign-role`). The admin screen is for running the system, not for playing the route.

### What a player loses, and why they need help

A player is signed in by one cookie, `shuk_session`. The server makes it when a single-use invitation is redeemed, and it lasts 7 days. The invitation itself is then deleted. See [local participant login](local-participant-login.md).

| What happens | What's lost | What they need today |
|---|---|---|
| **A new phone** | The sign-in (no cookie on the new phone) | A new link for the same seat. They come back as the same member, with progress, roles and points. The old phone stays signed in up to 7 days |
| **The browser clears cookies** | The sign-in | The same: a new link |
| **The browser clears local storage** | Only actions queued while offline and not yet sent. Progress is on the server | Nothing |
| **A private tab is closed** | The sign-in | A new link |
| **The link opened inside WhatsApp, Instagram or another app** | Those apps have their own browser with separate cookies, so the game is signed out in Safari or Chrome | Keep playing in the app's browser, or a new link |
| **A lost or stolen phone** | Nothing for the player; but the old phone keeps access | A new link, and today nothing signs out the old phone short of removing the member |

## Who it's for

- The **operator / owner**. Open: should the **guide** get some actions (for example idea 1) on their phone?
- Admin and guide stay **separate features**, as the coding rules require (`IndexGuide…` never shares components with the player view; the admin screen is its own feature too).

## Ideas

### 1. Get a player back in (suggested first)
- Tap a member → **New sign-in link** → a new single-use link for that member's seat, shown **once as a QR code** on the admin's or guide's phone. The player scans it on the spot: no messaging, no SSH. Also Copy and Share.
- Redeeming it signs in **the same member** (progress, roles, points), as the CLI link does today.
- **"Rejoin as myself" (idea):** a signed-out player asks with the team's join link, and the leader or guide picks which existing member they are, instead of the join making a new member.

### 2. Sessions (suggested first)
- Per member: how many devices are signed in, and when each was last seen. Counts and times only, never a secret.
- **Sign out other devices**: for a lost or stolen phone. Issuing a link doesn't do this today.

### 3. People and teams
- Members per team: seat, display name, team, main roles.
- Edit display names (today `shuk-name.ts`). Names are personal data: they live only in the server state, never in git.
- **Assign team leaders** ([onboarding and roles, 5 Nov 2026](product-decisions.md#onboarding-and-roles-owner-5-nov-2026)), move the host or leader rights, remove a member.

### 4. Invitations
- The list of links: seat, kind (player or host), issued, used or expired. Never the secret, which isn't stored anyway (only its fingerprint).
- Cancel an unused link.

### 5. The adventure
- Open a new adventure, with a backup taken first (as `shuk-new-adventure.ts` does), the lobby, Start, End.
- The **join-link switch** on or off, without a container restart.

### 6. Progress
- Per team: each mission's status, hints used, "I'm completely stuck" requests, points and food tokens.
- Links to the guide's actions (approve, timing), not copies of them.

### 7. Health
- Disk use (89% on 5 Nov 2026, over the 85% build limit), the last backup and its age, the state file's size, "Storage busy" errors, container uptime.

### 8. Audit log
- Who did what, and when, for every admin action.

## Security rules for the screen itself

- **Its own sign-in**, never only a hidden URL. Admin rights belong to one session, as host rights do today. Open: a passkey or a second factor.
- Same-origin JSON POSTs only, as the player API already requires.
- A confirmation step for anything destructive (a new adventure, removing a member, signing out devices).
- A new link's secret is shown once, never stored in plain text and never logged.
- Nothing personal in git; no names in this file or its tests.
- Only in the Shuk build: it 404s in the Memory Protocol build, as the Shuk API does.
- No live-data change from the screen until the owner approves each action.

## Open questions for the owner

1. Who gets admin rights: the owner only, or the guide as well (for which actions)?
2. Phone, PC or both?
3. Which ideas come first? Suggested: **1 (the QR rescue) and 2 (sign out other devices)**, because they cover every case in the table above.

## Related

- [Multiplayer plan](multiplayer-plan.md): §4's edge cases (lost session, lost leader phone), I3c (QR), I7a (leader invitations).
- [Current state](current-state.md).
- [Local participant login](local-participant-login.md): how invitations and sessions work today.
