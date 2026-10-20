---
name: game-deploy
description: Deploy the Memory Protocol game container (dori-game) with deploy/deploy.sh, then verify it
allowed-tools: Bash(free *) Bash(df *) Bash(git status *) Bash(git rev-parse *) Bash(git log *) Bash(git fetch *) Bash(git remote *) Bash(tmux *) Bash(tail *) Bash(grep *) Bash(docker ps *) Bash(docker images *) Bash(docker exec dori-game *)
disable-model-invocation: true
---

Deploy the latest `main` game code (from this repo, `/root/projects/The-Amazing-Hunt`) with `deploy/deploy.sh`. It does the whole job: pull, build the image, switch `dori-game` to it, wait for healthy, smoke-check, and roll back by itself if anything fails. It never touches `dori-platform`, `dori-site` or revivo.

Do not run `docker build` or `docker compose` by hand for a deploy.

## Current state

- Resources: !`free -h | head -2; df -h / | tail -1`
- Branch and status: !`git status -sb | head -5`
- Live game: !`docker ps --filter name=dori-game --format '{{.Image}} {{.Status}}'`

## Steps

1. **Preflight.** Stop and tell me if any of these fails:
   - Available memory is at least 800 MB and disk use is at most 85%.
   - The repo is on `main` and there are no uncommitted changes to tracked files (untracked files are fine). If there are, tell me; never commit by yourself.
   - `tmux has-session -t game-deploy` fails (no game deploy already running), and `tmux has-session -t dori-deploy` fails (no platform deploy building at the same time on this 4 GB box).

2. **Show what will deploy.** `git fetch origin` then `git log --oneline HEAD..origin/main`. If it is empty, say so and ask whether to rebuild anyway. With no `origin` remote, `deploy.sh` builds the local `HEAD`; show `git log --oneline -3` instead.

3. **Run the deploy in detached tmux:**
   ```bash
   tmux new -d -s game-deploy '/root/projects/The-Amazing-Hunt/deploy/deploy.sh 2>&1 | tee /root/projects/game-deploy.log'
   ```

4. **Wait for it to finish:** until `tmux has-session -t game-deploy` fails, checking about every 30 seconds (use the Monitor tool if available). Give a one-line update on the current `== step` from `/root/projects/game-deploy.log`.

5. **Report** from `tail -15 /root/projects/game-deploy.log`:
   - Success ends with `game-deploy: OK, dori-game:<tag> is live`.
   - Failure ends with another `game-deploy: ...` line. Quote it, say whether it rolled back, and diagnose from the log. Do not rerun automatically.

6. **Verify:** `docker ps --filter name=dori-game` shows healthy. If Caddy already routes `/memory-protocol` (see `README.md`), also check `curl -s -o /dev/null -w "%{http_code}" https://app.doriisrael.com/memory-protocol`, where 401 is expected without a password. If it is not routed yet, say so; do not change Caddy from this skill.

7. If disk use is now above 80%, suggest `docker builder prune -f`.
