# MCP Quickstart

SourceHarbor already exposes an MCP surface for agents and automation.

In plain language:

- Web is for operators
- API is the shared service contract
- MCP is the agent-facing doorway into that same system

## Start MCP Locally

```bash
./bin/bootstrap-full-stack --install-deps 0
./bin/full-stack up
source .runtime-cache/run/full-stack/resolved.env
./bin/dev-mcp
```

This starts the FastMCP server wired in [apps/mcp/server.py](../apps/mcp/server.py).

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
- advanced lanes such as UI audit and computer-use may still require extra runtime conditions or secrets

## Why It Matters

Think of MCP as the control panel for assistants:

- operators use the command center
- system integrations use the API
- agents use MCP

All three surfaces point at the same pipeline state.
