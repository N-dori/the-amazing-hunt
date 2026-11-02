#!/usr/bin/env bash
# Keeps only the live (current) and rollback (previous) dori-shuk images, with their dated tags; removes every other
# dori-shuk image (older releases, the :test build), then the unused build cache. --dry-run lists what would go.
set -euo pipefail
dry=${1:-}
keep=$(for t in current previous; do docker image inspect -f '{{.Id}}' "dori-shuk:$t" 2>/dev/null || true; done | sort -u)
[ -n "$keep" ] || { echo "prune: no dori-shuk:current image; refusing to prune" >&2; exit 1; }
docker images dori-shuk --format '{{.Tag}} {{.ID}}' | while read -r tag id; do
  if [ "$tag" = current ] || [ "$tag" = previous ]; then continue; fi
  full=$(docker image inspect -f '{{.Id}}' "dori-shuk:$tag")
  # A dated tag on the current or previous image costs no space and says which commit is live: keep it.
  if grep -qx "$full" <<<"$keep"; then echo "prune: keeping dori-shuk:$tag (live or rollback)"; continue; fi
  if [ "$dry" = --dry-run ]; then echo "prune: would remove dori-shuk:$tag"
  else docker rmi "dori-shuk:$tag" >/dev/null && echo "prune: removed dori-shuk:$tag"; fi
done
if [ "$dry" = --dry-run ]; then docker system df --format '{{.Type}} {{.Reclaimable}}' | grep -i "build cache" | sed 's/^/prune: would clear /'
else docker builder prune -f >/dev/null && echo "prune: build cache cleared"; fi
df -h / | tail -1 | awk '{print "prune: disk " $5 " used, " $4 " free"}'
