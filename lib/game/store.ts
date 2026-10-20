// Server-authoritative persistence [spec 2]: one SQLite file on the game's own named volume,
// via Node 22's built-in node:sqlite (no native dependency to compile). Server-only.
//
// Writes are synchronous read-modify-write inside one transaction. The app runs as a single
// Node process, so two requests can never interleave inside it.

import { createHash, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { newSession } from "./engine.ts";
import type { SessionState } from "./types.ts";

// No 0/O or 1/I/L, so a code read aloud or off a screen is unambiguous.
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 6;

let db: DatabaseSync | null = null;

export function dbPath(): string {
  return process.env.GAME_DB_PATH || path.join(process.cwd(), "data", "game.sqlite");
}

function open(): DatabaseSync {
  if (db) return db;
  const file = dbPath();
  if (file !== ":memory:") mkdirSync(path.dirname(file), { recursive: true });
  db = new DatabaseSync(file);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA busy_timeout = 3000;
    CREATE TABLE IF NOT EXISTS sessions (
      code        TEXT PRIMARY KEY,
      guide_hash  TEXT NOT NULL,
      state       TEXT NOT NULL,
      version     INTEGER NOT NULL DEFAULT 1,
      created_at  TEXT NOT NULL,
      updated_at  TEXT NOT NULL
    );
  `);
  return db;
}

// For tests: start from an empty database.
export function resetForTests(): void {
  db?.close();
  db = null;
}

const hash = (token: string) => createHash("sha256").update(token).digest("hex");

function newCode(): string {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i += 1) code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return code;
}

export function normaliseCode(code: string): string {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, CODE_LENGTH);
}

// Creates a session. The guide token is returned once and stored only as a hash.
export function createSession(now = new Date()): { code: string; guideToken: string; state: SessionState } {
  const database = open();
  const guideToken = randomBytes(24).toString("base64url");
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const code = newCode();
    const state = newSession(code, now);
    const result = database.prepare(
      "INSERT OR IGNORE INTO sessions (code, guide_hash, state, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
    ).run(code, hash(guideToken), JSON.stringify(state), now.toISOString(), now.toISOString());
    if (result.changes === 1) return { code, guideToken, state };
  }
  throw new Error("could not allocate a session code");
}

export function loadSession(code: string): { state: SessionState; version: number } | null {
  const row = open().prepare("SELECT state, version FROM sessions WHERE code = ?").get(normaliseCode(code)) as
    { state: string; version: number } | undefined;
  return row ? { state: JSON.parse(row.state) as SessionState, version: row.version } : null;
}

export function isGuide(code: string, token: string | null | undefined): boolean {
  if (!token) return false;
  const row = open().prepare("SELECT guide_hash FROM sessions WHERE code = ?").get(normaliseCode(code)) as
    { guide_hash: string } | undefined;
  if (!row) return false;
  const a = Buffer.from(row.guide_hash, "hex");
  const b = Buffer.from(hash(token), "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

// Applies `change` to the stored state atomically. `change` must be synchronous and pure; if it
// throws, nothing is written and the error propagates.
export function updateSession(code: string, change: (state: SessionState) => SessionState, now = new Date()): { state: SessionState; version: number } {
  const database = open();
  database.exec("BEGIN IMMEDIATE");
  try {
    const current = loadSession(code);
    if (!current) throw Object.assign(new Error("session not found"), { status: 404 });
    const next = change(current.state);
    if (next === current.state) {
      database.exec("COMMIT");
      return current;
    }
    const version = current.version + 1;
    database.prepare("UPDATE sessions SET state = ?, version = ?, updated_at = ? WHERE code = ?")
      .run(JSON.stringify(next), version, now.toISOString(), current.state.code);
    database.exec("COMMIT");
    return { state: next, version };
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}
