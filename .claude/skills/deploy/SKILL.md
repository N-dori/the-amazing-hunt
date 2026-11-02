---
name: deploy
description: Release The Amazing Shuk to https://doriisrael.com/shuk end to end. Back up the live game, deploy main with deploy/deploy.sh shuk in tmux, remove old images, start a fresh adventure and issue fresh invitation links into .local. Run it only when the owner types /deploy.
argument-hint: "[keep-game] [seats…]  (default seats: host player-1, guide)"
disable-model-invocation: true
allowed-tools: Bash(free *) Bash(df *) Bash(git status *) Bash(git log *) Bash(git fetch *) Bash(git rev-parse *) Bash(tmux *) Bash(tail *) Bash(grep *) Bash(docker ps *) Bash(docker images *) Bash(curl *) Bash(.claude/skills/deploy/scripts/*) Bash(docker exec dori-shuk node --experimental-strip-types --no-warnings tools/scripts/shuk-new-adventure.ts --confirm)
---

# Deploy The Amazing Shuk

This releases the Shuk in one pass:
1. back up the live state;
2. deploy `main`;
3. keep only the live and rollback images;
4. open a fresh adventure;
5. replace the invitation links.

It touches only `dori-shuk`, never `dori-game`, `dori-platform`, `dori-site` or anything `revivo-*`. (The Memory Protocol has its own `/game-deploy`.)

The deploy restarts the container, and the reset signs everyone out. That is why this runs only when the owner asks, and why step 2 stops if people are playing.

**Arguments** (`$ARGUMENTS`):
- Empty: the full release, with links for `host player-1` and `guide`.
- `keep-game`: deploy and clean up only. No reset, and the current links stay.
- Any other words are the link seats for `fresh-links.sh`, e.g. `host player-1 guide player-2`. `host <seat>` makes that seat's single-use host link.

## Current state

- Resources: !`free -h | head -2; df -h / | tail -1`
- Branch: !`git status -sb | head -3`
- Live: !`docker ps --filter name=dori-shuk --format '{{.Names}} {{.Image}} {{.Status}}'`
- Images: !`docker images dori-shuk --format '{{.Tag}} {{.Size}}'`

## Steps

Stop and tell the owner at the first failure. Never retry a failed deploy by yourself: `deploy.sh` has already rolled back, and a second attempt hides the first error.

1. **Preflight** (stop if any fails):
   - **Resources:** at least 800 MB available memory and at most 85% disk. The box has 4 GB and live sites; a build beyond that has hung it before.
   - **Git:** on `main`, with no uncommitted changes to tracked files (untracked files are fine). Never commit for the owner.
   - **What will ship:** run `git fetch origin`, then show `git log --oneline -5` and `git log --oneline origin/main..HEAD`. If local commits aren't pushed, say so. The owner usually pushes from VS Code, so ask whether to wait for the push or deploy local `HEAD`.
   - **No other deploy running:** neither `shuk-deploy` nor `dori-deploy` exists (`tmux has-session -t …` fails). Two builds at once exhaust the memory.

2. **Is anyone playing?** Run `.claude/skills/deploy/scripts/live-activity.sh`. It prints counts only.
   - **Stop and ask** if there are live sessions and the last write was under 30 minutes ago, or if any mission is touched and the adventure is active. A deploy interrupts them, and the reset wipes their progress.
   - Go on only if the owner confirms the game is finished.

3. **Back up the live state:** `.claude/skills/deploy/scripts/backup-state.sh`. It writes `/root/backups/amazing-shuk/live-state-before-deploy-<UTC>.json` (mode 600), checks it byte for byte, and deletes the older backups (the owner keeps only the latest). If it fails, stop: without a backup, the reset is not safe.

4. **Deploy** in detached tmux. It takes a few minutes; long foreground commands have hung this server before.
   ```bash
   tmux new -d -s shuk-deploy '/root/projects/The-Amazing-Hunt/deploy/deploy.sh shuk 2>&1 | tee /root/projects/shuk-deploy.log'
   ```
   - Wait until `tmux has-session -t shuk-deploy` fails, checking about every 30 s (the Monitor tool if available). Give a one-line update from the latest `== step` in the log.
   - **Success** ends with `game-deploy: OK, dori-shuk:<tag> is live`.
   - **Anything else:** quote the last `game-deploy:` line, say whether it rolled back, diagnose from the log, and stop. Skip steps 5–7.

5. **Remove old images:** `.claude/skills/deploy/scripts/prune-images.sh`.
   - It keeps `dori-shuk:current` and `dori-shuk:previous`, with their dated tags, so the live commit stays readable and one rollback stays possible.
   - It removes every other `dori-shuk` image (older releases, `:test`) and clears the build cache.
   - Run it with `--dry-run` first if anything looks unusual.

6. **Fresh game** (skip with `keep-game`):
   ```bash
   docker exec dori-shuk node --experimental-strip-types --no-warnings tools/scripts/shuk-new-adventure.ts --confirm
   ```
   - This opens a new adventure in its lobby: everyone is signed out, and roles and progress are cleared. Seat names and action receipts stay.
   - It keeps its own copy in `/data` (`state.json.before-new-adventure-*`). Leave those copies; the owner decides about them.

7. **Fresh links** (skip with `keep-game`): `.claude/skills/deploy/scripts/fresh-links.sh <seats>`, with the seats from the arguments or the default `host player-1 guide`.
   - It deletes every old link file in `.local/amazing-shuk/live-links/` (there is one live set; void links aren't kept) and writes one file per seat, mode 600.
   - It prints file names only. **Never print, cat or paste a link or token**: the repo and this transcript aren't private, and a link is a login.
   - Links are valid for 24 h and are single-use.

8. **Verify from outside:**
   - `docker ps --filter name=dori-shuk` shows `healthy`.
   - `curl -s -o /dev/null -w "%{http_code}" https://doriisrael.com/shuk/api/health` → 200, and `https://doriisrael.com/shuk/amazing-shuk` → 200.
   - Run `live-activity.sh` again: after a reset, expect `adventure: lobby | members: 0`.
   - Join links are **off** after every deploy, because compose runs without the override. Say so; turning them on is a separate owner decision.

9. **Report**, in a few lines:
   - the commit and tag now live, and the rollback tag;
   - the backup file;
   - the images removed and the disk now used;
   - whether the game was reset;
   - the link files written, with their expiry: their paths, never their contents.

   Then offer to record the release in `docs/project/agent-handoff.md` and `current-state.md`, and commit only if asked. Nothing was checked visually in a browser; say so.
