# Perplexity research runner

A minimal runner for Perplexity deep research. It runs in its own container, apart from the live site. It is adapted from mentor's `tools/mentor-research` and uses the same Agent API calls and the same source handling. There are no dependencies and no ports. It uses Node 22 with the built-in `fetch`.

- `ask.mjs`: sends each prompt file as one run, all in parallel. Each answer is saved with its cited sources and the prompt as sent.
- `compose.yml`: the `scavenger-hunt` job. It reads `research/prompts/` and writes to `research/results/`.
- `PROMPTING_GUIDE.md`: how to write prompts for it.

## Run the scavenger hunt research

```bash
cd research/perplexity
cp .env.example .env            # then put the new API key in .env
docker compose run --rm scavenger-hunt
```

Six deep runs take several minutes, so run them in tmux. Every run that is accepted is billed, including one that later fails.

If a run is still going when the timeout ends, resume it with the id it printed:

```bash
docker compose run --rm scavenger-hunt --resume <run-id> --prepend /prompts/_context.md \
  --append /prompts/_rules.md --out-dir /results /prompts/<that prompt>.md
```

## Another research job

Put the prompt files in a folder and either add a service to `compose.yml` or run the script directly:

```bash
node ask.mjs --preset high --out-dir ../results my_prompt.md
```

Whatever you send is visible to Perplexity. Never include secrets or private data in a prompt.
