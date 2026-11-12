#!/usr/bin/env bash
# Replaces the live invitation links: deletes every old link file, then issues one single-use link per seat into
# .local/amazing-shuk/live-links/<seat>.txt (mode 600). It prints file names and checks only, never a link or token.
#   fresh-links.sh host player-1 guide player-2   ("host <seat>" makes that seat's host link; other words are plain seats)
set -euo pipefail
dir=/root/projects/The-Amazing-Hunt/.local/amazing-shuk/live-links
origin=https://doriisrael.com
[ $# -gt 0 ] || set -- host player-1 guide player-2
mkdir -p "$dir" && chmod 700 "$dir"
find "$dir" -maxdepth 1 -type f -print -delete | sed 's#^.*/#links: deleted old #'
umask 077
issue() { docker exec dori-shuk node --experimental-strip-types --no-warnings tools/scripts/shuk-invite.ts "$@" "$origin"; }
while [ $# -gt 0 ]; do
  if [ "$1" = host ]; then seat=$2; file="$dir/host-$seat.txt"; issue host "$seat" > "$file"; shift 2
  else seat=$1; file="$dir/$seat.txt"; issue "$seat" > "$file"; shift; fi
  chmod 600 "$file"
  if [ "$(grep -c "^$origin/shuk/amazing-shuk#invite=" "$file")" = 1 ] && [ "$(wc -l < "$file")" = 1 ]; then echo "links: wrote $(basename "$file") (valid 24 h)"
  else echo "links: $(basename "$file") is not a single valid link; check it without printing it" >&2; exit 1; fi
done
