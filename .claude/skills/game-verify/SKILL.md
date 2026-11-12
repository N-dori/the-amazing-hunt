---
name: game-verify
description: Build the Memory Protocol game image (or, with "shuk", the Amazing Shuk image) and smoke-test it in an isolated container, without touching anything live
allowed-tools: Bash(free *) Bash(df *) Bash(tmux *) Bash(docker build *) Bash(docker run *) Bash(docker exec *) Bash(docker inspect *) Bash(docker stats *) Bash(docker rm -f dori-game-test*) Bash(docker rm -f dori-shuk-test*) Bash(docker images *) Bash(tail *) Bash(grep *) Bash(git diff --check*)
---

Check a game app the way it will run in production, from the repo root. Nothing here touches `dori-game` or `dori-shuk` (the live containers) or any other service.

One codebase builds two apps. Pick by argument:

| Argument | Image | Test container | Build arg | Prefix |
|---|---|---|---|---|
| none | `dori-game:test` | `dori-game-test` | none | `/memory-protocol` |
| `shuk` | `dori-shuk:test` | `dori-shuk-test` | `--build-arg DORI_APP=shuk` | `/shuk` |

## Current state

- Resources: !`free -h | head -2; df -h / | tail -1`

## Steps

1. **Preflight.** Stop and tell me if available memory is under 800 MB or disk use is over 85%.

2. **Build** in detached tmux (it takes a minute or two), logging to the scratchpad:
   ```bash
   tmux new -d -s game-verify "docker build <build arg> -t <image> /root/projects/The-Amazing-Hunt > <scratchpad>/game-verify.log 2>&1; echo \$? > <scratchpad>/game-verify.done"
   ```
   Wait for the `.done` file. On failure, quote the TypeScript, Sass or build error from the log and stop.

3. **Run isolated**, with the production lockdown and no network:
   ```bash
   docker run -d --name <test container> --network none --read-only --tmpfs /tmp --cap-drop ALL \
     --security-opt no-new-privileges:true --memory 256m \
     --health-cmd 'wget -q -O /dev/null http://127.0.0.1:3000/<prefix>/api/health' --health-interval 3s \
     <image>
   ```
   For `shuk`, also pass the app's settings and a writable data folder:
   `--tmpfs /data:uid=1000,gid=1000 -e SHUK_APP=1 -e SHUK_PUBLIC_ORIGIN=https://doriisrael.com -e SHUK_DATA_FILE=/data/state.json`.
   Wait up to 40 s for `docker inspect -f '{{.State.Health.Status}}' <test container>` to report `healthy`.

4. **Smoke check** from inside the container with `docker exec <test container> node -e '…'`.
   - **Memory Protocol:** fetch `/memory-protocol`, `/memory-protocol/api/health`, `/memory-protocol/manifest.webmanifest` and every route listed in the build output under `/memory-protocol`; each must return 200. Also check `/memory-protocol/amazing-shuk` returns 404 (the Shuk never answers in this image).
   - **Shuk:** use `node:http` with an explicit `Host` header (fetch can't set it). With `Host: doriisrael.com`: `/shuk/api/health`, `/shuk/manifest.webmanifest` and `/shuk/amazing-shuk` return 200; `/shuk/dev/map`, `/shuk/dev/amazing-shuk/water` and `/shuk/api/sessions` return 404; `/shuk/api/amazing-shuk/dev` without a cookie returns 401. With `Host: 127.0.0.1:3000`, `/shuk/amazing-shuk` returns 404. Run `node --experimental-strip-types --disable-warning=ExperimentalWarning tools/scripts/shuk-invite.ts player-7 https://doriisrael.com` and check it prints a `https://doriisrael.com/shuk/amazing-shuk#invite=` link; don't print the token in the report.
   - Report the status per path and `docker stats --no-stream` memory use.

5. **Clean up:** `docker rm -f <test container>`, always, even after a failure.

6. Run `git diff --check`. Report what passed, and say plainly that nothing was checked visually in a browser.
