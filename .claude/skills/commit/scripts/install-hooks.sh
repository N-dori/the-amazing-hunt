#!/usr/bin/env bash
# Installs local git hooks that run scan.sh on every commit and push, including those made from VS Code.
# Hooks live in .git/hooks (not tracked); rerun after a fresh clone. An existing hook of the same name is kept as *.before-scan.
set -euo pipefail
root=$(git rev-parse --show-toplevel)
hooks=$(git rev-parse --git-path hooks)
scan='"$(git rev-parse --show-toplevel)"/.claude/skills/commit/scripts/scan.sh'
for hook in pre-commit pre-push; do
  [ -e "$hooks/$hook" ] && ! grep -q 'scan.sh' "$hooks/$hook" && mv "$hooks/$hook" "$hooks/$hook.before-scan"
done
cat > "$hooks/pre-commit" <<HOOK
#!/usr/bin/env bash
# Public repo guard (.claude/skills/commit): blocks secrets, invite links, real names, the owner's files and media.
exec $scan
HOOK
cat > "$hooks/pre-push" <<HOOK
#!/usr/bin/env bash
# Scans every commit about to be pushed. Refuses to push a branch deletion check-free; new branches are compared with origin/main.
zero=0000000000000000000000000000000000000000
while read -r local_ref local_sha remote_ref remote_sha; do
  [ "\$local_sha" = "\$zero" ] && continue
  if [ "\$remote_sha" = "\$zero" ]; then base=\$(git merge-base origin/main "\$local_sha" 2>/dev/null || echo "\$local_sha~1"); else base=\$remote_sha; fi
  $scan "\$base..\$local_sha" || { echo "pre-push: blocked; fix the commits above (and rotate any real secret) before pushing" >&2; exit 1; }
done
HOOK
chmod +x "$hooks/pre-commit" "$hooks/pre-push"
echo "hooks: pre-commit and pre-push installed in $hooks (repo $root)"
