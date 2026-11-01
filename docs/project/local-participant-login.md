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

## Development reset (local simulation only)

`scripts/shuk-dev-reset.ts` (`npm run shuk:dev-reset`) puts a **development** state file back to a known point, so a test can be repeated. On this server, run it inside the dev container, from the repo root:

```sh
# Preview (changes nothing): the target, its counts and what the reset would do.
docker exec -w /w shuk-dev npm run -s shuk:dev-reset -- progress --file .local/amazing-shuk/state.json
# Reset progress: challenges, arrivals, timers, hints, points, food tokens and bonuses. Members, roles and sessions stay.
docker exec -w /w shuk-dev npm run -s shuk:dev-reset -- progress --file .local/amazing-shuk/state.json --confirm
# Reset the adventure: a fresh lobby with no members, sessions, invitations, join links or progress; then fresh links for a scenario.
docker exec -w /w shuk-dev npm run -s shuk:dev-reset -- adventure --file .local/amazing-shuk/state.json --scenario pair --confirm
```

- **Scenarios** (`adventure` only): `solo` (host `player-1`), `pair` (host `player-1`, `player-2`) and `team` (host `player-1`, `player-2`…`player-5`), each plus the guide. Without `--scenario`, no invitations are issued; use `shuk:invite` as usual. `--origin` defaults to `http://localhost:3300`.
- **The links are new and single-use** every time (24 hours). They go to `.local/shuk-dev-reset/links-<UTC time>.txt` (mode 600), one `seat<TAB>link` per line, and never to the terminal. Old links and sessions stop working after an adventure reset.
- **Backup:** before writing, the exact old file is kept beside it as `state.json.before-dev-reset-<mode>-<UTC time>` (mode 600). If the backup can't be kept, nothing changes. To undo, copy the backup over the state file while nothing else writes.
- **Queued actions:** a reset sets a new reset epoch. An action a phone queued before the reset is refused (410) and dropped from its queue; an action that already applied never applies again. After a reset, reload each browser.
- **Refused:** the Shuk app's environment (`SHUK_APP=1` or `NEXT_PUBLIC_DORI_APP=shuk`), anything but `NODE_ENV=development` with `SHUK_DEV_SIMULATION=1`, a missing `--file` (there is no default), `/data` or a Docker volume path, a file outside this repo's `.local/`, a link, a missing file, a different `SHUK_DATA_FILE`, and running outside the repo root. The script isn't copied into the app image. Never point it at a copy of live state that holds real names unless that copy stays in `.local/`.

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
