#!/usr/bin/env bash
# Read-only: how busy the live Shuk game is, in counts only (never names, tokens or IDs).
set -euo pipefail
docker exec dori-shuk node -e '
const fs = require("node:fs");
const file = "/data/state.json";
if (!fs.existsSync(file)) { console.log("state: none yet"); process.exit(0); }
const d = JSON.parse(fs.readFileSync(file, "utf8"));
const now = Date.now();
const minutes = Math.round((now - fs.statSync(file).mtimeMs) / 60000);
const sessions = Object.values(d.sessions ?? {}).filter(s => s && s.expiresAt > now).length;
const members = Object.keys(d.participants ?? {}).length;
const missions = Object.values(d.teams ?? {}).flatMap(t => Object.values(t.missions ?? {}));
const touched = missions.filter(m => m && (m.completed || m.arrival || m.performance?.startedAt != null)).length;
const done = missions.filter(m => m && m.completed).length;
console.log(`adventure: ${d.adventure?.status ?? "unknown"} | members: ${members} | live sessions: ${sessions} | missions touched: ${touched} (completed ${done}) | last write: ${minutes} min ago`);'
