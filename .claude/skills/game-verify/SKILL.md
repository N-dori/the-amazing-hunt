---
name: game-verify
description: Build the Memory Protocol game image and smoke-test it in an isolated container, without touching anything live
allowed-tools: Bash(free *) Bash(df *) Bash(tmux *) Bash(docker build *) Bash(docker run *) Bash(docker exec *) Bash(docker inspect *) Bash(docker stats *) Bash(docker rm -f dori-game-test*) Bash(docker images *) Bash(tail *) Bash(grep *) Bash(git diff --check*)
---

Check the game app the way it will run in production, from the repo root. Nothing here touches `dori-game` (the live container) or any other service.

## Current state

- Resources: !`free -h | head -2; df -h / | tail -1`

## Steps

1. **Preflight.** Stop and tell me if available memory is under 800 MB or disk use is over 85%.

2. **Build** in detached tmux (it takes a minute or two), logging to the scratchpad:
   ```bash
   tmux new -d -s game-verify "docker build -t dori-game:test /root/projects/The-Amazing-Hunt > <scratchpad>/game-verify.log 2>&1; echo \$? > <scratchpad>/game-verify.done"
   ```
   Wait for the `.done` file. On failure, quote the TypeScript, Sass or build error from the log and stop.

3. **Run isolated**, with the production lockdown and no network:
   ```bash
   docker run -d --name dori-game-test --network none --read-only --tmpfs /tmp --cap-drop ALL \
     --security-opt no-new-privileges:true --memory 256m \
     --health-cmd 'wget -q -O /dev/null http://127.0.0.1:3000/memory-protocol/api/health' --health-interval 3s \
     dori-game:test
   ```
   Wait up to 40 s for `docker inspect -f '{{.State.Health.Status}}' dori-game-test` to report `healthy`.

4. **Smoke check** from inside the container with `docker exec dori-game-test node --input-type=module -e '…'`. Fetch `/memory-protocol`, `/memory-protocol/api/health`, `/memory-protocol/manifest.webmanifest` and every route listed in the build output under `/memory-protocol`; each must return 200. Report the status per path and `docker stats --no-stream` memory use.

5. **Clean up:** `docker rm -f dori-game-test`, always, even after a failure.

6. Run `git diff --check`. Report what passed, and say plainly that nothing was checked visually in a browser.
