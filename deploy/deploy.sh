#!/usr/bin/env bash
# Deploy one of the two game apps: pull -> build image -> switch -> wait healthy -> smoke check ->
# roll back automatically if either check fails. Touches only that app's container.
#   (no argument) THE MEMORY PROTOCOL, container dori-game
#   shuk          THE AMAZING SHUK, container dori-shuk (built with DORI_APP=shuk)
#
# Run inside tmux:   tmux new -s game-deploy /root/projects/The-Amazing-Hunt/deploy/deploy.sh
#                    tmux new -s shuk-deploy '/root/projects/The-Amazing-Hunt/deploy/deploy.sh shuk'
set -euo pipefail

# The repo is the game app; it is found from this script's own location.
REPO=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
BRANCH=main
KEEP=3
TARGET=${1:-game}
case "$TARGET" in
  game) COMPOSE=$REPO/deploy/compose.yml IMAGE=dori-game CONTAINER=dori-game SERVICE=game BUILD_ARGS=() ;;
  shuk) COMPOSE=$REPO/deploy/shuk-compose.yml IMAGE=dori-shuk CONTAINER=dori-shuk SERVICE=shuk BUILD_ARGS=(--build-arg DORI_APP=shuk) ;;
  *) echo "game-deploy: unknown target '$TARGET' (use no argument, or shuk)" >&2; exit 1 ;;
esac

die() { echo "game-deploy: $*" >&2; exit 1; }
step() { echo; echo "== $*"; }

wait_healthy() {
  local status=missing
  for _ in $(seq 1 45); do
    status=$(docker inspect -f '{{.State.Health.Status}}' "$CONTAINER" 2>/dev/null || echo missing)
    [ "$status" = "healthy" ] && { echo "$CONTAINER: healthy"; return 0; }
    sleep 2
  done
  echo "$CONTAINER: $status after 90 s" >&2
  docker logs --tail 30 "$CONTAINER" >&2 || true
  return 1
}

# Swap current and previous and restart only the game. Fails when there is no previous image.
rollback() {
  docker image inspect "$IMAGE:previous" >/dev/null 2>&1 || { echo "game-deploy: no previous image to roll back to" >&2; return 1; }
  local bad
  bad=$(docker image inspect -f '{{.Id}}' "$IMAGE:current")
  docker tag "$IMAGE:previous" "$IMAGE:current"
  docker tag "$bad" "$IMAGE:previous"
  docker compose -f "$COMPOSE" up -d "$SERVICE"
  wait_healthy
}

# What a release must answer, from inside the container. The Shuk is also checked to refuse every other host,
# and to hide the Memory Protocol's pages, with the Host header Caddy would pass.
smoke() {
  [ "$TARGET" = shuk ] && { smoke_shuk; return; }
  docker exec "$CONTAINER" node -e '
    const paths = ["/memory-protocol", "/memory-protocol/api/health", "/memory-protocol/manifest.webmanifest"];
    Promise.all(paths.map(async (p) => {
      const r = await fetch("http://127.0.0.1:3000" + p, { redirect: "manual" });
      console.log(r.status, p);
      return r.status === 200;
    })).then((ok) => process.exit(ok.every(Boolean) ? 0 : 1), () => process.exit(1));'
}
smoke_shuk() {
  docker exec "$CONTAINER" node -e '
    const http = require("node:http");
    const checks = [["/shuk/api/health", "doriisrael.com", 200], ["/shuk/manifest.webmanifest", "doriisrael.com", 200],
      ["/shuk/amazing-shuk", "doriisrael.com", 200], ["/shuk/amazing-shuk", "127.0.0.1:3000", 404],
      ["/shuk/dev/map", "doriisrael.com", 404], ["/shuk/api/sessions", "doriisrael.com", 404]];
    const get = ([path, host]) => new Promise((done) => http.get({ host: "127.0.0.1", port: 3000, path, headers: { host } },
      (r) => { r.resume(); done(r.statusCode); }).on("error", () => done(0)));
    // The root must lead to the Shuk game, never render the Memory Protocol it shares a codebase with.
    const root = () => new Promise((done) => http.get({ host: "127.0.0.1", port: 3000, path: "/shuk", headers: { host: "doriisrael.com" } }, (r) => {
      let body = ""; r.on("data", (c) => body += c); r.on("end", () => done(!/Memory Protocol|HARMONY/.test(body) && (r.statusCode === 200 || /\/shuk\/amazing-shuk$/.test(r.headers.location ?? ""))));
    }).on("error", () => done(false)));
    Promise.all([...checks.map(async (check) => {
      const status = await get(check);
      console.log(status, check[0], "Host:", check[1], "expected", check[2]);
      return status === check[2];
    }), root().then((ok) => { console.log(ok ? "ok" : "FAIL", "/shuk leads to the Shuk game"); return ok; })])
      .then((ok) => process.exit(ok.every(Boolean) ? 0 : 1), () => process.exit(1));'
}

# Everything runs inside main(), which bash reads in full before starting, so a pull that
# changes this file cannot change the run already in progress.
main() {
[ -n "${TMUX:-}" ] || die "run this inside tmux (the build takes minutes)"

step "Resource check"
avail_mb=$(awk '/MemAvailable/ {print int($2/1024)}' /proc/meminfo)
disk_pct=$(df --output=pcent / | tail -1 | tr -dc '0-9')
echo "available memory: ${avail_mb} MB, disk used: ${disk_pct}%"
[ "$avail_mb" -ge 800 ] || die "under 800 MB available memory; close VS Code or wait"
[ "$disk_pct" -le 85 ] || die "disk over 85% used; free space first"

step "Pull $BRANCH"
[ "$(git -C "$REPO" rev-parse --abbrev-ref HEAD)" = "$BRANCH" ] || die "repo is not on $BRANCH"
[ -z "$(git -C "$REPO" status --porcelain --untracked-files=no)" ] || die "repo has local changes to tracked files"
# Pull only when a remote is configured; otherwise build the local HEAD as it is.
if git -C "$REPO" remote get-url origin >/dev/null 2>&1; then
  git -C "$REPO" fetch origin
  git -C "$REPO" merge --ff-only "origin/$BRANCH"
else
  echo "no origin remote: building local HEAD"
fi
commit=$(git -C "$REPO" rev-parse --short HEAD)

step "Build image"
tag="$(date +%Y%m%d-%H%M%S)-$commit"
docker build "${BUILD_ARGS[@]}" -t "$IMAGE:$tag" "$REPO"

step "Switch to $IMAGE:$tag"
if docker image inspect "$IMAGE:current" >/dev/null 2>&1; then
  docker tag "$IMAGE:current" "$IMAGE:previous"
fi
docker tag "$IMAGE:$tag" "$IMAGE:current"
docker compose -f "$COMPOSE" up -d "$SERVICE"

step "Wait for healthy"
wait_healthy || { rollback || true; die "new release never became healthy"; }

step "Smoke check"
if ! smoke; then
  echo "game-deploy: smoke check FAILED, rolling back" >&2
  rollback || die "rollback failed too: check 'docker ps' now"
  die "rolled back to the previous release"
fi

step "Clean up old images (keeping $KEEP)"
docker images "$IMAGE" --format '{{.Tag}}' | grep -E '^[0-9]{8}-' | sort -r | tail -n +$((KEEP + 1)) \
  | while read -r old; do docker rmi "$IMAGE:$old" >/dev/null 2>&1 || true; done

echo
echo "game-deploy: OK, $IMAGE:$tag is live"
}

main "$@"
exit
