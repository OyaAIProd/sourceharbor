# MCP Quickstart

SourceHarbor already exposes an MCP surface for agents and automation.

In plain language:

- Web is for operators
- API is the shared service contract
- MCP is the agent-facing doorway into that same system

That same system truth now stretches across the product line:

- `/subscriptions` defines source intake through one shared template catalog
- `/watchlists` stores the tracking object
- `/trends` and `/briefings` turn repeated runs into reusable story surfaces
- `/ask` consumes that story context instead of pretending every answer starts from nowhere
- MCP reuses those same contracts for agents

This is the strongest ecosystem binding for SourceHarbor today:

- **Codex** and **Claude Code** are a real fit because they can talk through MCP or HTTP while staying source-first and local-proof-first
- **OpenHands** and **OpenCode** are worth mentioning as ecosystem neighbors, but they are not the best primary product label for this repo
- **OpenClaw** should stay out of the front door until there is a stronger repo-proven integration story

If you want one packaged command surface first from inside a local checkout, run:

```bash
npm install --global ./packages/sourceharbor-cli
source .runtime-cache/run/full-stack/resolved.env
SOURCEHARBOR_API_BASE_URL="http://127.0.0.1:${SOURCE_HARBOR_API_PORT}"
sourceharbor templates --base-url "$SOURCEHARBOR_API_BASE_URL"
```

If your stack is not using the repo-managed runtime snapshot, pass the real API
base URL explicitly instead of assuming port `9000`.

If you are already inside the repo and only want the direct substrate, run:

```bash
./bin/sourceharbor help
```

## Start MCP Locally

```bash
./bin/bootstrap-full-stack --install-deps 0
./bin/full-stack up
source .runtime-cache/run/full-stack/resolved.env
./bin/sourceharbor mcp
```

The thin facade above routes to the same underlying entrypoint as
`./bin/dev-mcp`. This starts the FastMCP server wired in
[apps/mcp/server.py](../apps/mcp/server.py).

## Representative Tools

- `sourceharbor.jobs.get`
- `sourceharbor.jobs.compare`
- `sourceharbor.knowledge.cards.list`
- `sourceharbor.retrieval.search`
- `sourceharbor.ingest.poll`

The full manifest lives in [apps/mcp/schemas/tools.json](../apps/mcp/schemas/tools.json).

## Honest Boundary

- MCP is real and already wired
- MCP is not a second copy of the business logic
- `@sourceharbor/cli` is a thin builder-facing wrapper over the HTTP API, and
  inside a checkout its convenience commands can delegate back into the
  repo-local substrate
- the public TypeScript SDK lives next to this flow in `packages/sourceharbor-sdk`; Python SDK still stays later
- advanced lanes such as UI audit and computer-use may still require extra runtime conditions or secrets

## Why It Matters

Think of MCP as the control panel for assistants:

- operators use the command center
- system integrations use the API
- agents use MCP

All three surfaces point at the same pipeline state.

If you want the honest builder-facing map instead of just the quickstart, read
[builders.md](./builders.md).
