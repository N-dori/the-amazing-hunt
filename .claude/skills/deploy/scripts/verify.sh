#!/usr/bin/env bash
# Read-only checks after a release: container health, the public pages, the game's state (counts only), the join-link switch,
# the images left, the link files and their expiry, and how many safety copies sit in /data. Never prints a link or token.
set -euo pipefail
cd /root/projects/The-Amazing-Hunt
docker ps --filter name=dori-shuk --format 'container: {{.Image}} {{.Status}}'
for p in api/health amazing-shuk; do echo "public: $(curl -s -o /dev/null -w '%{http_code}' "https://doriisrael.com/shuk/$p") /shuk/$p (expect 200)"; done
.claude/skills/deploy/scripts/live-activity.sh
echo "join links: $(docker exec dori-shuk printenv SHUK_JOIN_LINKS >/dev/null 2>&1 && echo ON || echo off)"
echo "images: $(docker images dori-shuk --format '{{.Tag}}' | tr '\n' ' ')"
links=.local/amazing-shuk/live-links
for f in "$links"/*.txt; do
  [ -e "$f" ] || { echo "links: none"; break; }
  echo "links: $(basename "$f") $(stat -c %A "$f"), expires about $(date -u -d "@$(( $(stat -c %Y "$f") + 86400 ))" '+%d %b %H:%M UTC')"
done
echo "safety copies in /data: $(docker exec dori-shuk sh -c 'ls /data | grep -c before-' || echo 0) (the owner decides about removing them)"
df -h / | tail -1 | awk '{print "disk: " $5 " used, " $4 " free"}'
