# Local participant invitations

This is an authenticated local development iteration, not a deployed Shuk app. The page and API still require development mode, `SHUK_DEV_SIMULATION=1`, and loopback Host. No SMTP, OAuth, Auth.js or external authentication service is used.

PowerShell, after a working dependency install:

```powershell
$env:SHUK_DEV_SIMULATION = '1'
$env:NODE_ENV = 'development'
npm.cmd run dev -- --hostname 127.0.0.1
```

In another terminal with the same environment and repository working directory:

```powershell
$env:SHUK_DEV_SIMULATION = '1'
$env:NODE_ENV = 'development'
npm.cmd run shuk:invite -- player-1 http://127.0.0.1:3000
npm.cmd run shuk:invite -- player-2 http://127.0.0.1:3000
npm.cmd run shuk:invite -- guide http://127.0.0.1:3000
```

Manually distribute each printed link only to its intended holder. Links are bearer credentials. Use separate browser profiles or different browsers, not ordinary tabs sharing a cookie jar. Each link expires after 24 hours and can be redeemed once with an explicit sign-in click. Reissuing an invitation invalidates older unused invitations for that ID. The fixed development roster is `guide` and `player-1` through `player-7`; real names/enrollment remain pending. No public invitation-creation endpoint exists.

The fragment token is removed from the address bar before redemption, is not sent in the page request, and is stored only as a SHA-256 hash. Sessions last seven days, are checked server-side for every read/action, and use a host-only HttpOnly, SameSite=Strict cookie scoped to the app prefix. Secure is set for HTTPS; this local-only iteration uses loopback HTTP. Sign-out revokes the current session; signing into a new invitation replaces that browser's session atomically.

`player-1` starts as navigator and `player-2` as answer-submitter. Both read and operate the same cups. Only the authenticated submitter can submit; only the guide can assign roles, approve, or reset. Client identity switching is rejected. Guide controls have a separate feature component. Shared rewards remain zero.

Shared progress and hashed credentials live in ignored `.local/amazing-shuk/state.json` (or `SHUK_DATA_FILE`). Run the CLI and server with the same absolute storage path if their working directories differ. Back up this directory privately; never publish or commit it. Writes use an exclusive filesystem lock, a synced temporary file, then atomic rename. Contention returns 503; retry the same action ID. If a process crashes leaving `state.json.lock`, stop all writers, inspect the state and remove only that lock directory before restarting. Never remove an active writer's lock. Power-loss durability, VPS volume permissions/backups and network-filesystem behavior remain unverified.

Player/guide actions are queued in browser localStorage per participant ID, retry on transient failure and use server-recorded IDs to prevent duplicate moves. Identity mismatch is rejected. Browser queue/reconnect behavior still needs visual/runtime verification; the receipt behavior is covered by backend tests.

Checks:

```powershell
npm.cmd run test:shuk
npm.cmd test
# Optional actual loopback HTTP transport, where the host permits connections:
$env:SHUK_HTTP_TESTS = '1'
npm.cmd run test:shuk
```

The default tests use independent cookie jars against Web Request/Response handlers, plus a fresh Node child process to verify persisted session/progress. The optional transport uses an isolated Node HTTP adapter, not Next. Neither substitutes for a running Next page/API check and two real browser profiles.

Manual acceptance after dependencies are restored: sign in using two profiles; fill/pour cups in one and observe the other; solve exactly 400 ml and submit as player-2; verify player-1 cannot submit or assign roles; use a third guide profile to assign roles and approve/reset; restart Next and confirm both identities and shared progress persist; disconnect/reconnect with a queued move and check it applies once. Production page/API must return 404 even with opt-in. No deployment is authorized.

TODO(copy): invitation, login/error and participant-facing onboarding wording need owner approval. This screen remains explicitly a local draft. No additional market claims, photo assets or reward amounts are approved by this iteration.

## Water revision 2

Task now uses liters and a third 4 L family jar. Existing logins/roles survive JSON migration; old cup progress resets once. Any authenticated participant can reset before finalization. Guide/submitter finalize only jar===4; completed tasks cannot reset/re-award. Earlier guide-only reset/unsolved-approval descriptions are superseded. Queues/actions use puzzle revision 2: refresh both browser profiles after upgrade. Check source story, collapse persistence and shapes on mobile. [Task record](water-task.md).
