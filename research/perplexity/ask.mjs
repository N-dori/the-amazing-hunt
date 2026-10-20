#!/usr/bin/env node
// Minimal Perplexity research runner (Agent API, background mode, polled).
// Adapted from mentor's tools/mentor-research: same API calls and source handling,
// without mentor's database, usage counter or archive conventions.
//
// Usage:
//   node ask.mjs [--preset high] [--prepend F] [--append F] [--out-dir DIR] PROMPT.md [PROMPT.md ...]
//   node ask.mjs --resume RUN_ID --out-dir DIR [--prepend F] [--append F] PROMPT.md
//
// Each prompt file is sent as one run, with --prepend and --append files wrapped around it.
// All runs are submitted in parallel; each answer is saved as DIR/<prompt name>.md.
// Exit codes: 0 all saved · 1 caller error · 2 a run or the environment failed.

import fs from "node:fs";
import path from "node:path";

const BASE_URL = process.env.PERPLEXITY_BASE_URL || "https://api.perplexity.ai";
const PRESETS = ["fast", "low", "medium", "high"];
const POLL_MS = 5000;
const REQUEST_TIMEOUT_MS = 60000;

const args = parseArgs(process.argv.slice(2));
const apiKey = process.env.PERPLEXITY_API_KEY;
if (!apiKey) fail("PERPLEXITY_API_KEY is not set (see .env.example)", 2);
if (!PRESETS.includes(args.preset)) fail(`unknown preset "${args.preset}", use one of ${PRESETS.join(", ")}`);
if (!args.files.length) fail("no prompt files given");
if (args.resume && args.files.length !== 1) fail("--resume takes exactly one prompt file");

const prefix = args.prepend ? readFile(args.prepend) + "\n\n" : "";
const suffix = args.append ? "\n\n" + readFile(args.append) : "";
fs.mkdirSync(args.outDir, { recursive: true });

const results = await Promise.allSettled(args.files.map((file) => runOne(file)));
let failed = 0;
results.forEach((result, index) => {
  if (result.status === "fulfilled") {
    log(`${path.basename(args.files[index])}: saved ${result.value}`);
  } else {
    failed += 1;
    log(`${path.basename(args.files[index])}: FAILED ${result.reason.message}`);
  }
});
process.exit(failed ? 2 : 0);

async function runOne(file) {
  const name = path.basename(file);
  const question = prefix + readFile(file) + suffix;
  let id = args.resume;
  if (!id) {
    const submitted = await callApi("POST", "/v1/agent", { preset: args.preset, input: question, background: true });
    if (!submitted.id) throw new Error(`accepted but no run id: ${JSON.stringify(submitted).slice(0, 300)}`);
    id = submitted.id;
    log(`${name}: submitted ${id} (${args.preset}); resume with --resume ${id} ${name}`);
  }

  const deadline = Date.now() + args.timeoutSeconds * 1000;
  let response = await poll(id);
  while (["queued", "in_progress", "rate_limited"].includes(response.status)) {
    if (Date.now() > deadline) throw new Error(`still ${response.status} after ${args.timeoutSeconds}s; resume with --resume ${id}`);
    await sleep(response.waitMs || POLL_MS);
    response = await poll(id);
  }
  if (response.status !== "completed" && response.status !== "incomplete") {
    throw new Error(`run ${id} ended ${response.status}: ${JSON.stringify(response.error || {}).slice(0, 500)}`);
  }

  const answer = answerText(response);
  const run = {
    id,
    preset: args.preset,
    status: response.status,
    cost: response.usage?.cost?.total_cost ?? response.usage?.total_cost ?? null,
  };
  const target = uniquePath(path.join(args.outDir, name));
  fs.writeFileSync(target, renderTranscript({ name, question, answer, run, sources: citedSources(response, answer), pages: pagesRead(response) }));
  return target;
}

async function poll(id) {
  return callApi("GET", `/v1/agent/${id}`, undefined, true);
}

// A 429 while polling means "ask again later", never that the paid run failed.
async function callApi(method, apiPath, body, rateLimitIsWait = false) {
  const response = await fetch(`${BASE_URL}${apiPath}`, {
    method,
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  const text = await response.text();
  if (response.status === 429 && rateLimitIsWait) {
    return { status: "rate_limited", waitMs: Math.max((Number(response.headers.get("retry-after")) || 0) * 1000, 10000) };
  }
  if (!response.ok) throw new Error(`Perplexity HTTP ${response.status} on ${method} ${apiPath}: ${text.slice(0, 500)}`);
  return JSON.parse(text);
}

// The answer is the text parts of the `message` items.
function answerText(response) {
  return (response.output || [])
    .filter((item) => item.type === "message")
    .flatMap((item) => item.content || [])
    .filter((part) => part.type === "output_text" && part.text)
    .map((part) => part.text)
    .join("\n\n");
}

// A `[31]` (formerly `[web:31]`) marker names the search result whose own `id` is 31, not the 31st URL.
function citedSources(response, answer) {
  const citedIds = new Set([...answer.matchAll(/\[(?:web:)?(\d+)\]/g)].map((match) => Number(match[1])));
  const byId = new Map();
  (response.output || [])
    .filter((item) => item.type === "search_results")
    .flatMap((item) => item.results || [])
    .forEach((result, index) => {
      const id = result.id ?? index + 1;
      if (result.url && !byId.has(id)) byId.set(id, { id, url: result.url, title: result.title || "", cited: citedIds.has(id) });
    });
  return [...byId.values()].sort((first, second) => first.id - second.id);
}

// Pages the agent read in full carry no id, so list them to keep opaque markers traceable.
function pagesRead(response) {
  const byUrl = new Map();
  (response.output || [])
    .filter((item) => item.type === "fetch_url_results")
    .flatMap((item) => item.contents || [])
    .forEach((page) => {
      if (page.url && !byUrl.has(page.url)) byUrl.set(page.url, { url: page.url, title: page.title || "" });
    });
  return [...byUrl.values()];
}

function renderTranscript({ name, question, answer, run, sources, pages }) {
  const line = (source) => `- [${source.id}] ${source.title ? `${source.title} — ` : ""}${source.url}`;
  const cited = sources.filter((source) => source.cited);
  const uncited = sources.filter((source) => !source.cited);
  const sourceSection = !sources.length
    ? "_None returned — treat every claim above as unverified._"
    : `### Cited in the answer\n\n${cited.map(line).join("\n") || "_None of the markers matched a source._"}\n\n`
      + `### Retrieved but not cited\n\n${uncited.map(line).join("\n") || "_None._"}`;
  const pageSection = pages.length
    ? `\n\n### Pages read in full\n\n${pages.map((page) => `- ${page.title ? `${page.title} — ` : ""}${page.url}`).join("\n")}`
    : "";
  return `# ${name}\n\n`
    + `- **Asked:** ${new Date().toISOString()}\n`
    + `- **Preset:** \`${run.preset}\` (Perplexity Agent API) · run \`${run.id}\` · ${run.status}\n`
    + (run.cost === null ? "" : `- **Cost:** ${run.cost}\n`)
    + "\n> True as of the date above. Re-run the prompt rather than quoting this file as current.\n\n"
    + `## Answer\n\n${answer.trim()}\n\n## Sources\n\n${sourceSection}${pageSection}\n\n`
    + `<details><summary>Prompt as sent</summary>\n\n${question}\n\n</details>\n`;
}

function parseArgs(argv) {
  const parsed = { preset: process.env.PERPLEXITY_PRESET || "high", outDir: "results", timeoutSeconds: 2400, files: [] };
  const flags = { "--preset": "preset", "--prepend": "prepend", "--append": "append", "--out-dir": "outDir", "--resume": "resume", "--timeout": "timeoutSeconds" };
  for (let index = 0; index < argv.length; index += 1) {
    const key = flags[argv[index]];
    if (key) {
      parsed[key] = key === "timeoutSeconds" ? Number(argv[index + 1]) : argv[index + 1];
      index += 1;
    } else if (argv[index].startsWith("--")) {
      fail(`unknown flag ${argv[index]}`);
    } else {
      parsed.files.push(argv[index]);
    }
  }
  return parsed;
}

// Two runs of the same prompt must never overwrite a paid answer.
function uniquePath(candidate) {
  let target = candidate;
  for (let counter = 2; fs.existsSync(target); counter += 1) target = candidate.replace(/\.md$/, `-${counter}.md`);
  return target;
}

function readFile(file) {
  try {
    return fs.readFileSync(file, "utf8").trim();
  } catch (error) {
    fail(`cannot read ${file}: ${error.message}`);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function log(message) {
  process.stderr.write(`perplexity: ${message}\n`);
}

function fail(message, code = 1) {
  log(message);
  process.exit(code);
}
