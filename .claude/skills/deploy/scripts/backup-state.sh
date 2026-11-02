#!/usr/bin/env bash
# Copies the live state to /root/backups/amazing-shuk/<label>-<UTC>.json (mode 600), checks it byte for byte,
# then deletes the older backups there, so only the newest one is kept (owner's rule, 1 Nov 2026).
set -euo pipefail
label=${1:-live-state-before-deploy}
dir=/root/backups/amazing-shuk
mkdir -p "$dir" && chmod 700 "$dir"
out="$dir/$label-$(date -u +%Y%m%dT%H%M%SZ).json"
umask 077
docker exec dori-shuk cat /data/state.json > "$out"
docker exec dori-shuk cat /data/state.json | cmp -s - "$out" || { echo "backup: copy differs from the live file (it changed mid-copy?); kept $out, deleted nothing" >&2; exit 1; }
chmod 600 "$out"
find "$dir" -maxdepth 1 -type f -name '*.json' ! -path "$out" -print -delete | sed 's/^/backup: deleted older /'
echo "backup: $out ($(stat -c %s "$out") bytes)"
