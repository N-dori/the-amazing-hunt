---
name: commit
description: Safe commits and pushes for this public repo. Stage only the files the work changed, scan for secrets, invite links, real names, the owner's files and media, then commit with the project's message format, and push only when asked. Use it whenever the owner asks to commit, push, "commit the docs", "leave RUN_PREVIEW out", or wants to know what's staged or unpushed. It also covers what to do when adding a secret (API key, password) to the project.
argument-hint: "[<what to commit>] | push | status | secret <NAME> | install-hooks"
allowed-tools: Bash(git status *) Bash(git diff *) Bash(git log *) Bash(git add *) Bash(git restore --staged *) Bash(git commit *) Bash(git fetch *) Bash(git rev-parse *) Bash(git ls-files *) Bash(git check-ignore *) Bash(.claude/skills/commit/scripts/scan.sh *) Bash(.claude/skills/commit/scripts/scan.sh)
---

# Commit and push for The Amazing Shuk

**The repo is public** (`github.com/N-dori/the-amazing-hunt`). Anything committed and pushed is world-readable, and it stays in history after deletion. So treat a pushed secret as leaked.

The owner usually pushes from VS Code. Claude commits only when asked, and pushes only when asked.

## Ground rules (and why)

- **Stage explicit paths, never `git add -A`, `git add .` or a whole folder.** A folder picked up the owner's untracked `trip-doriisrael-paths.md` once (2 Nov 2026). Name each file the work changed.
- **The owner's files stay out:** the paths in `.claude/skills/commit/owner-files.txt` (`docs/RUN_PREVIEW.md` with live invite links, the undecided trip paths, the deferred UX backlog, the Stitch exports, the photos in `public/shuk/`). Commit one only when the owner names it explicitly, and even then let the scanner check it.
- **No secrets in git.** Secrets live in `.env` files, which `.gitignore` already ignores (`.env*`, except `.env.example`). Never read or print a `.env` file. Never print a token, key, password or invite link in a reply, a commit message or a log; refer to it by its file and name.
- **Nothing that rewrites shared history** without the owner's explicit request: no `--force` push, no `reset --hard`, no rebase or `--amend` of a pushed commit. Never `--no-verify`: the hooks are the safety net for VS Code commits too.
- **No real people:** participants' names stay on the server and in `.local/`, never in git. Tests use made-up names. The scanner checks the real ones without printing them.

## Commit (the default: `/commit <what>`, or the owner saying "commit…")

1. `git status --short` and `git diff --stat`. Decide the scope from the request: "commit the docs" means the docs this work changed, not every changed file. If the scope is unclear, list the candidates and ask.
2. Stage the in-scope files by explicit path. Then check `git diff --cached --name-only`:
   - Nothing out of scope or on the owner list. If something slipped in, `git restore --staged <path>`.
3. **Scan:** `.claude/skills/commit/scripts/scan.sh`. It reports by file and rule, never by value.
   - **BLOCK:** unstage that file and tell the owner what kind of problem it is. If it's a real secret, see "If a secret got in" below.
   - **WARN** (an email, a photo in `public/`): ask the owner before keeping it. A photo in `public/shuk/` also needs its `!` line in `.dockerignore`, or it 404s live.
   - Then `git diff --cached --check` (whitespace).
4. **Message:**
   - The subject is imperative and specific, at most about 72 characters ("Record the I3b review…", "Phase 1: solo-first play…").
   - The body says what changed and why, in plain sentences.
   - End with the attribution line the session gives, e.g. `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
   - Use a heredoc (`git commit -F - <<'EOF'`) so quotes survive.
5. **Report:**
   - the short hash and what's in it;
   - what was deliberately left out (e.g. `RUN_PREVIEW.md`);
   - whether it's pushed (normally not). The owner pushes from VS Code, or asks for `push`.

## `push`

1. `git fetch origin`. Check that you're on `main`, then `git status -sb` for ahead and behind.
   - **Behind:** stop. Never merge or rebase without asking.
2. Scan what will leave the machine: `.claude/skills/commit/scripts/scan.sh origin/main..HEAD`. Stop on any BLOCK.
3. `git push origin main` (it asks for permission; that's intended). Report what was pushed.

## `status`

Report:
- the branch, and ahead/behind `origin/main`;
- staged, modified and untracked files, with the owner's files marked;
- unpushed commits (`git log --oneline origin/main..HEAD`).

Change nothing.

## `secret <NAME>`: adding a key or password to the project

1. The value goes in `.env` at the repo root (git-ignored). The owner puts it there. Claude never writes, reads or prints the value.
2. Add the name to `.env.example` with a placeholder (`NAME=change-me`) and a one-line comment saying what it's for. Commit that file, which has no values.
3. Code reads it from `process.env.NAME`, server side only, and never with a `NEXT_PUBLIC_` prefix (those are shipped to browsers).
4. For the live container, the deploy compose file passes it in. Check `deploy/shuk-compose.yml`, and propose the change to the owner before editing deployment config.
5. Confirm it's ignored with `git check-ignore -v .env`.

## If a secret got in

- **Staged but not committed:** `git restore --staged <file>`, move the value to `.env`, and scan again.
- **Committed, not pushed:** stop and tell the owner. The fix is to rewrite the local commit, which needs their OK.
- **Pushed:** tell the owner at once, and that the first step is to **revoke and replace the key** at its provider. The repo is public, so assume it's already copied. Deleting it in a new commit doesn't remove it from history. A history rewrite is a separate decision for the owner.

## `install-hooks`

`.claude/skills/commit/scripts/install-hooks.sh` installs `pre-commit` and `pre-push` hooks that run the same scan on every commit and push, including from VS Code. Hooks live in `.git/hooks` (not tracked): ask the owner before installing, and rerun after a fresh clone. A hook blocks with the same BLOCK lines; the fix is to unstage or rewrite, never `--no-verify`.

For a false alarm in code or tests (e.g. a fake key in a test fixture), add `git-scan: allow` on that line. Never use it on a real value.
