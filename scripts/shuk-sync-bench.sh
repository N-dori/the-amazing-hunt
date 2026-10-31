#!/bin/sh
# S0-A benchmark: a throwaway Shuk server on a private Docker network (no internet, no host ports), with production's limits
# and its own data folder, driven by simulated phones in a separate node:22-alpine container. Never touches dori-shuk or its data.
#   WORKLOAD=realistic|stress CLIENTS=8|30 [SECONDS_RUN] [RESTART_AT] [IMAGE=dori-shuk:current] [OUT=.local/shuk-bench/<time>] scripts/shuk-sync-bench.sh
# realistic: 600 s, no restart. stress: 180 s, and the server is killed and started again at RESTART_AT (default 68% of the run;
# 0 for none), as an out-of-memory kill or a reboot would, so a write may leave its lock behind.
# Sessions are real: invitations issued in the test server and redeemed through POST login. The roster has 8 seats (guide and
# player-1…7) and a seat keeps every session it redeems, so 30 clients are about four devices on each seat.
set -eu
cd "$(dirname "$0")/.."
IMAGE=${IMAGE:-dori-shuk:current}
WORKLOAD=${WORKLOAD:-stress}
CLIENTS=${CLIENTS:-8}
case $WORKLOAD in
  realistic) SECONDS_RUN=${SECONDS_RUN:-600}; RESTART_AT=${RESTART_AT:-0} ;;
  stress) SECONDS_RUN=${SECONDS_RUN:-180}; RESTART_AT=${RESTART_AT:-$((SECONDS_RUN * 68 / 100))} ;;
  *) echo "WORKLOAD must be realistic or stress"; exit 1 ;;
esac
OUT=${OUT:-.local/shuk-bench/$(date -u +%Y%m%dT%H%M%SZ)-$WORKLOAD-c$CLIENTS}
NET=shuk-bench-net SRV=shuk-bench-server TARGET=http://shuk-bench-server:3000
NODE="docker run --rm --network $NET -v $PWD:/w:ro -v $PWD/$OUT:/out -w /w node:22-alpine node --experimental-strip-types --disable-warning=ExperimentalWarning scripts/shuk-sync-bench.mjs"

avail=$(free -m | awk '/^Mem:/ {print $7}'); disk=$(df --output=pcent / | tail -1 | tr -dc 0-9)
[ "$avail" -ge 800 ] && [ "$disk" -le 85 ] || { echo "preflight: ${avail} MB available, disk ${disk}%: stopping"; exit 1; }

mkdir -p "$OUT/data" && chown 1000:1000 "$OUT/data" && chmod 700 "$OUT"
# Only background jobs that were started: `kill 0` would signal this script's whole process group.
cleanup() { for job in ${SAMPLER:-} ${RESTARTER:-}; do kill "$job" 2>/dev/null || true; done; docker rm -f $SRV >/dev/null 2>&1 || true; docker network rm $NET >/dev/null 2>&1 || true; }
trap cleanup EXIT
docker network create --internal $NET >/dev/null
docker run -d --name $SRV --network $NET --read-only --tmpfs /tmp --cap-drop ALL --security-opt no-new-privileges:true \
  --memory 256m --cpus 1 --pids-limit 100 -v "$PWD/$OUT/data:/data" \
  -e NEXT_PUBLIC_DORI_APP=shuk -e SHUK_APP=1 -e SHUK_PUBLIC_ORIGIN=https://doriisrael.com -e SHUK_DATA_FILE=/data/state.json \
  --health-cmd 'wget -q -O /dev/null http://127.0.0.1:3000/shuk/api/health' --health-interval 2s "$IMAGE" >/dev/null
i=0; until [ "$(docker inspect -f '{{.State.Health.Status}}' $SRV)" = healthy ]; do i=$((i+1)); [ $i -lt 30 ] || { echo "server not healthy"; exit 1; }; sleep 2; done

# A fresh data file holds an adventure that has already started; the host invitation needs one waiting in its lobby.
TOOL="docker exec $SRV node --experimental-strip-types --disable-warning=ExperimentalWarning --disable-warning=MODULE_TYPELESS_PACKAGE_JSON"
$TOOL tools/scripts/shuk-new-adventure.ts --confirm >/dev/null
# Invitations in rounds of eight (a new invitation replaces the seat's unredeemed one), each round redeemed before the next.
# The command's errors stay visible and an empty token stops the run (it would otherwise surface later as a 400 at sign-in).
invite() { link=$($TOOL tools/scripts/shuk-invite.ts "$@" https://doriisrael.com) || exit 1
  t=${link#*#invite=}; [ -n "$t" ] && [ "$t" != "$link" ] || { echo "no invitation token for $*"; exit 1; }; echo "$t"; }
n=0; round=0
while [ $n -lt "$CLIENTS" ]; do
  : > "$OUT/tokens-$round.txt"
  for seat in player-1 player-2 player-3 player-4 player-5 player-6 player-7 guide; do
    [ $n -lt "$CLIENTS" ] || break
    if [ $n -eq 0 ]; then t=$(invite host player-1); else t=$(invite $seat); fi
    echo "$seat $t" >> "$OUT/tokens-$round.txt"; n=$((n+1))
  done
  $NODE login $TARGET /out/tokens-$round.txt /out/sessions.jsonl
  round=$((round+1))
done
chmod 600 "$OUT"/tokens-*.txt "$OUT/sessions.jsonl"
$NODE start $TARGET /out/sessions.jsonl

# Server CPU and memory every 2 s, and the state file's size, while the scenario runs.
( while :; do printf '%s,%s,%s\n' "$(date +%s)" "$(docker stats --no-stream --format '{{.CPUPerc}},{{.MemUsage}}' $SRV)" "$(stat -c %s "$OUT/data/state.json" 2>/dev/null || echo 0)"; sleep 2; done ) > "$OUT/resources.csv" &
SAMPLER=$!
# The restart: SIGKILL (no clean shutdown) and a fresh start of the same container on the same data.
if [ "$RESTART_AT" -gt 0 ]; then
  ( sleep "$RESTART_AT"; killed=$(date +%s%3N); docker kill $SRV >/dev/null; docker start $SRV >/dev/null
    until [ "$(docker inspect -f '{{.State.Health.Status}}' $SRV)" = healthy ]; do sleep 0.2; done
    printf '{"killedAt":%s,"healthyAt":%s}\n' "$killed" "$(date +%s%3N)" > "$OUT/restart.json"; echo "restart: down $(( $(date +%s%3N) - killed )) ms" ) &
  RESTARTER=$!
fi
$NODE run $TARGET /out/sessions.jsonl "$WORKLOAD" "$CLIENTS" "$SECONDS_RUN" "$RESTART_AT" /out/result.json
kill $SAMPLER 2>/dev/null || true

# The server's own count of applied actions, from the state file (test data).
node -e 'const d=require(process.argv[1]); const r=require(process.argv[2]); const n=Object.values(d.applied).reduce((s,a)=>s+a.length,0);
  const ids=new Set(Object.values(d.applied).flat()); console.log(JSON.stringify({receiptsInFile:n, startAndSetupReceipts:n-r.appliedIds.length, everyAppliedIdRecorded:r.appliedIds.every(id=>ids.has(id))}))' \
  "$PWD/$OUT/data/state.json" "$PWD/$OUT/result.json" 2>/dev/null || docker run --rm -v "$PWD/$OUT:/out" node:22-alpine node -e 'const d=require("/out/data/state.json"); const r=require("/out/result.json"); const n=Object.values(d.applied).reduce((s,a)=>s+a.length,0); const ids=new Set(Object.values(d.applied).flat()); console.log(JSON.stringify({receiptsInFile:n, otherReceipts:n-r.appliedIds.length, everyAppliedIdRecorded:r.appliedIds.every(id=>ids.has(id))}))'
awk -F, 'NR>1 { gsub("%","",$2); v=$2+0; c+=v; if (v>m) m=v; n++; mem=$3; size=$NF } END { printf "server CPU avg %.1f%% max %.1f%% (of one core), last memory %s, state file %d bytes\n", c/n, m, mem, size }' "$OUT/resources.csv"
echo "results in $OUT"
