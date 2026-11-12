#!/usr/bin/env bash
# Pre-commit / pre-push guard for a PUBLIC repo. Reports problems by file and rule, never by value.
#   scan.sh              the staged changes (before a commit)
#   scan.sh A..B         the commits in a range (before a push), e.g. origin/main..HEAD
# Exit 1 on any BLOCK; WARN lines need a human look but don't stop. A line with "git-scan: allow" is skipped.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
here=$(dirname "$(readlink -f "$0")")
range=${1:-}
if [ -n "$range" ]; then
  files=$(git diff --name-only --diff-filter=ACMR "$range")
  added() { git diff -U0 --no-color "$range" -- "$1" | grep '^+' | grep -v '^+++' | grep -v 'git-scan: allow' || true; }
  size() { git cat-file -s "${range##*..}:$1" 2>/dev/null || echo 0; }
else
  files=$(git diff --cached --name-only --diff-filter=ACMR)
  added() { git diff --cached -U0 --no-color -- "$1" | grep '^+' | grep -v '^+++' | grep -v 'git-scan: allow' || true; }
  size() { git cat-file -s ":$1" 2>/dev/null || echo 0; }
fi
[ -n "$files" ] || { echo "scan: nothing to check"; exit 0; }
blocks=0; warns=0
block() { echo "BLOCK $1: $2"; blocks=$((blocks + 1)); }
warn() { echo "WARN  $1: $2"; warns=$((warns + 1)); }

# Participants' real names live only on the server and in .local (owner's rule); load them without ever printing them.
names=$(mktemp); trap 'rm -f "$names"' EXIT; chmod 600 "$names"
read_names='const fs=require("fs");const f=process.argv[1];if(!fs.existsSync(f))process.exit(0);const d=JSON.parse(fs.readFileSync(f,"utf8"));
const out=new Set();for(const v of Object.values(d.seatNames??{}))out.add(v);for(const p of Object.values(d.participants??{}))if(p&&p.name)out.add(p.name);
for(const r of Object.values(d.teams??{}).flatMap(t=>Object.values(t.joinRequests??{})))if(r&&r.name)out.add(r.name);
for(const n of out)for(const w of String(n).split(/\s+/))if(w.length>=3)console.log(w);'
{ node -e "$read_names" .local/amazing-shuk/state.json 2>/dev/null || true
  docker exec dori-shuk node -e "$read_names" /data/state.json 2>/dev/null || true; } | sort -u > "$names"

# Secret shapes. Named by kind only; the matching text is never shown.
rules=(
  'private key|-----BEGIN [A-Z ]*PRIVATE KEY-----'
  'AWS access key|AKIA[0-9A-Z]{16}'
  'GitHub token|gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}'
  'Anthropic/OpenAI key|sk-(ant-|proj-)?[A-Za-z0-9_-]{20,}'
  'Slack token|xox[abprs]-[A-Za-z0-9-]{10,}'
  'Google API key|AIza[0-9A-Za-z_-]{35}'
  'Stripe live key|(sk|rk)_live_[0-9A-Za-z]{16,}'
  'JWT|eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.'
  'Shuk invite link|#invite=[A-Za-z0-9_-]{20,}'
  'credential assignment|(api[_-]?key|secret|passw(or)?d|token|auth[_-]?key|client[_-]?secret)["'"'"']?[[:space:]]*[:=][[:space:]]*["'"'"'][^"'"'"'[:space:]]{12,}'
  'URL with password|[a-z]+://[^/[:space:]:@]+:[^/[:space:]@]{6,}@'
)
owner=$(grep -v '^#' "$here/../owner-files.txt" | grep -v '^$' || true)
while IFS= read -r f; do
  [ -n "$f" ] || continue
  # Files that must never be in git, whatever they contain.
  case "$f" in
    .env.example) ;;
    .env|.env.*|*/.env|*/.env.*) block "$f" "environment file (secrets go in .env, which git ignores)" ;;
    *.pem|*.key|*.p12|*.pfx|*id_rsa*|*id_ed25519*|*credentials*.json|*service-account*.json) block "$f" "key or credential file" ;;
    .local/*|*/state.json|*state.json.before-*) block "$f" "local or live game state" ;;
  esac
  while IFS= read -r pattern; do
    [ -n "$pattern" ] || continue
    # shellcheck disable=SC2053
    [[ "$f" == $pattern ]] && block "$f" "the owner's file (owner-files.txt); only the owner commits it"
  done <<<"$owner"
  case "$f" in
    public/*.png|public/*.jpg|public/*.jpeg|public/*.webp|public/*.gif|public/*.heic) warn "$f" "a photo in public/: only with the owner's OK, and add its ! line to .dockerignore" ;;
    design/inputs/brand/*) ;;
    *.png|*.jpg|*.jpeg|*.webp|*.gif|*.heic|*.mp3|*.m4a|*.wav|*.mp4|*.mov) block "$f" "media outside public/ (photos and recordings stay on disk)" ;;
  esac
  [ "$(size "$f")" -le 5242880 ] || block "$f" "over 5 MB"
  lines=$(added "$f")
  [ -n "$lines" ] || continue
  for rule in "${rules[@]}"; do
    name=${rule%%|*}; regex=${rule#*|}
    grep -Eqi -- "$regex" <<<"$lines" && block "$f" "$name"
  done
  [ -s "$names" ] && grep -Fqiw -f "$names" <<<"$lines" && block "$f" "a participant's real name (names stay on the server and in .local)"
  emails=$(grep -Eo '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}' <<<"$lines" | grep -Eviq '@(example\.(com|org)|anthropic\.com|users\.noreply\.github\.com)$' && echo y || true)
  [ -n "$emails" ] && warn "$f" "an email address (personal ones don't belong in a public repo)"
done <<<"$files"
echo "scan: $(wc -l <<<"$files") files, $blocks blocking, $warns to review"
[ "$blocks" -eq 0 ]
