# Public Skills And Starter Packs

SourceHarbor now has a first public starter surface for builder workflows.

Think of it like the difference between a private workshop notebook and a
public starter kit:

- `.agents/skills/**` is still the internal workshop notebook
- `starter-packs/` is the public starter-kit directory a newcomer should open first
- `templates/public-skills/**` holds the copyable prompt/template assets that those starter packs point to
- this page and the examples below explain how those public pieces fit together

## What Is Shipped Now

| Surface | What it is | Current boundary |
| --- | --- | --- |
| `docs/compat/codex.md` | shortest Codex adoption path | public, documented, reproducible |
| `docs/compat/claude-code.md` | shortest Claude Code adoption path | public, documented, reproducible |
| generic MCP / HTTP path for OpenClaw | no dedicated pack yet | keep it on the shared substrate until the repo grows a proven OpenClaw-specific pack |
| `starter-packs/**` | primary public starter-pack directory | public top-level adoption surface |
| `templates/public-skills/**` | copyable prompt/template assets referenced by the starter packs | public starter surface, not internal skill export |
| `examples/sdk/search.ts` | minimal SDK example | public example for `@sourceharbor/sdk` |
| `examples/cli/search.sh` | minimal CLI example | public example for `@sourceharbor/cli` |

## Why This Surface Exists

Codex and Claude Code already fit SourceHarbor through MCP + HTTP API.

The missing piece was a public first hop that does not depend on reading our
private `.agents/skills` tree. These starter packs solve that gap by giving a
newcomer:

1. the right doorway
2. the shortest command or prompt
3. the honest boundary
4. one example they can run immediately

Use the naming like this:

- open `starter-packs/` when you want the public entry directory
- use `templates/public-skills/**` when you want the copyable prompt/template files inside that starter surface

## Fastest Adoption Ladder

| I want to... | Open this first | Current truth |
| --- | --- | --- |
| drive the same operator truth from Codex | [docs/compat/codex.md](./compat/codex.md) | ship-now fit through MCP + HTTP API + CLI / SDK |
| do the same from Claude Code | [docs/compat/claude-code.md](./compat/claude-code.md) | ship-now fit through MCP + HTTP API + CLI / SDK |
| start from typed code integration | [packages/sourceharbor-sdk/README.md](../packages/sourceharbor-sdk/README.md) | thin contract-first public SDK |
| start from shell and commands | [packages/sourceharbor-cli/README.md](../packages/sourceharbor-cli/README.md) | thin installable CLI over the same repo-owned truth |
| evaluate OpenClaw specifically | [docs/builders.md](./builders.md) | the generic MCP / HTTP substrate is real, but there is still no dedicated OpenClaw pack or plugin claim |

## Start Here

| I am... | Use this first | Why |
| --- | --- | --- |
| a Codex operator | [docs/compat/codex.md](./compat/codex.md) | best path when you want MCP/API/CLI choices explained quickly |
| a Claude Code operator | [docs/compat/claude-code.md](./compat/claude-code.md) | same story, phrased for Claude Code workflows |
| an OpenClaw operator | [docs/builders.md](./builders.md) | the shared MCP / HTTP substrate is real, but the repo still does not ship an OpenClaw-specific public pack |
| a builder writing code | [packages/sourceharbor-sdk/README.md](../packages/sourceharbor-sdk/README.md) | typed HTTP integration first |
| a builder who prefers shell | [packages/sourceharbor-cli/README.md](../packages/sourceharbor-cli/README.md) | thin CLI over current HTTP contract |

## Guardrails

- Do not treat these public starter packs as proof that SourceHarbor ships a
  plugin marketplace.
- Do not treat these docs as a promise that every internal agent workflow is
  supported publicly.
- Keep the public surface thin: starters should point at MCP, HTTP API, CLI,
  SDK, and the existing proof surfaces instead of inventing a parallel runtime.
