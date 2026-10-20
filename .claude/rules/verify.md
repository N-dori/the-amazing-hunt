# Verifying work (game)

This runs on a production server (4 GB RAM) with live sites. See the user's global rules: check `free -h && df -h /` before any build and stop if available memory is under 800 MB or disk use is over 85%. Long commands go in tmux.

- The host has **no `node_modules`**. Do not run `npm install` or `npm run build` on the host.
- Type-check and build happen inside `docker build`; use `/game-verify`, which builds `dori-game:test` and smoke-tests it in an isolated container (no network, read-only, 256 MB).
- Unit tests run on the host: `npm test` (Node 22, no dependencies).
- Lint and type-check run in a one-shot container, with `node_modules` in an anonymous volume that `--rm` deletes when it exits (do not stop it with `docker rm -f`, which leaves the volume behind):
  `docker run --rm -v "$PWD":/w -v /w/node_modules -w /w -e NEXT_TELEMETRY_DISABLED=1 --memory 1536m node:22-alpine sh -c 'npm ci --no-audit --no-fund && npm run lint && npx next typegen && npx tsc --noEmit'`
  Then remove the root-owned `.next/`, `next-env.d.ts` and `tsconfig.tsbuildinfo` it leaves.
- When a dependency changes, regenerate `package-lock.json` in a throwaway container: `docker run --rm -v "$PWD":/w -w /w node:22-alpine npm install --package-lock-only`. Then delete any `node_modules` it left.
- Do not review in a browser or take screenshots. Say plainly what was not checked visually.
- Run `git diff --check` before handing back.
- Never restart, stop or recreate `dori-platform`, `dori-site` or anything `revivo-*`. Game work touches only `dori-game` and `dori-game-test`.
