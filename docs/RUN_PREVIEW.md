# Run the local preview

The preview is the container `dori-game-preview`, on `127.0.0.1:3200` of the server. It is not live: only the server itself can reach it, and Caddy does not route to it. It runs with `MP_DEV_PREVIEW=1`, so the dev tools and `/memory-protocol/dev/map` work.

## 1. Build the image

Check resources first (stop if available memory is under 800 MB or disk use is over 85%):

```bash
free -h && df -h /
tmux new -s game-verify 'docker build -t dori-game:test /root/projects/The-Amazing-Hunt'
```

Or run `/game-verify` in Claude Code, which builds and smoke-tests it.

## 2. Start (or restart) the preview

A running preview keeps the image it was started from, so recreate it after every build:

```bash
docker rm -f dori-game-preview
docker run -d --name dori-game-preview -p 127.0.0.1:3200:3000 \
  --read-only --tmpfs /tmp --cap-drop ALL --security-opt no-new-privileges:true \
  --memory 256m -e MP_DEV_PREVIEW=1 dori-game:test
```

Check it: `curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3200/memory-protocol` prints `200`.

## 3. Open it in your browser

Forward the port from the server to your computer:

- **VS Code Remote SSH:** Ports panel → Forward a Port → `3200`.
- **Plain SSH:** `ssh -L 3200:127.0.0.1:3200 root@<server>`, and keep it open.

Then open:

- `http://localhost:3200/memory-protocol`: the game
- `http://localhost:3200/memory-protocol/dev/map`: the map preview

## Stop it

```bash
docker rm -f dori-game-preview
```

Only touch `dori-game-preview` (and `dori-game-test`). Never stop `dori-game`, `dori-platform`, `dori-site` or anything `revivo-*`.
