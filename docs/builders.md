# Build With SourceHarbor

SourceHarbor is not only a Web UI.

It already exposes six real builder-facing layers:

1. **HTTP API contract** for system integrations
2. **MCP surface** for agent clients such as Codex and Claude Code
3. **Packaged public CLI** for installable command discovery
4. **Repo-local CLI/help facade** as the underlying direct substrate
5. **Public TypeScript SDK** for typed HTTP reuse
6. **Public starter packs** for reproducible Codex / Claude Code / SDK setup

Think of the product like one control tower with multiple doors:

- operators use the Web command center
- integrations use the HTTP API
- assistants use MCP
- future SDKs should stay thin wrappers over those same contracts
- the same contracts now distinguish **strong-supported video intake** from **generalized RSSHub/RSS intake**

The easiest way to keep the builder story honest is to map it to the same front
doors operators already see:

| Product door | Builder meaning | Current truth |
| --- | --- | --- |
| **`/subscriptions`** | intake contract over one shared template catalog | Web, API, and MCP now all point at the same strong-supported vs generalized intake split |
| **`/watchlists`** | durable tracking-object substrate | builders can treat watchlists as saved operator intent, not a temporary browser filter |
| **`/trends`** | compounder front door | repeated runs become merged stories and evidence surfaces instead of one-off search sessions |
| **`/briefings` + `/ask`** | story-aware answer/change/evidence lane | the same server-owned story payload now carries selected-story context into Ask |
| **`/mcp`** | agent-facing reuse doorway | assistants reuse the same jobs, retrieval, artifacts, and operator truth instead of a second business-logic stack |

## Best-Fit Clients Today

| Surface | Best fit today | Why |
| --- | --- | --- |
| **Codex** | Primary fit | SourceHarbor already exposes a real MCP server plus operator-safe HTTP contracts |
| **Claude Code** | Primary fit | Same MCP surface, same API-backed state, same retrieval and job evidence |
| **Repo-local CLI users** | Primary fit | `./bin/sourceharbor help` gives one discoverable facade over the real `bin/*` entrypoints without duplicating business logic |
| **Custom MCP clients** | Primary fit | `./bin/dev-mcp` starts a real FastMCP server over the current pipeline |
| **Direct HTTP builders** | Primary fit | The repo already carries a public OpenAPI contract and typed client helpers |
| **OpenHands / OpenCode** | Secondary fit | They are ecosystem-adjacent if you integrate through MCP or HTTP, but they are not the main front door today |
| **OpenClaw** | Not a primary fit today | There is no first-class repo-side contract or product path that justifies leading with it |

## Builder Entry Points

### 1. HTTP API

- Contract source: [`contracts/source/openapi.yaml`](../contracts/source/openapi.yaml)
- Service entry: [`apps/api/app/main.py`](../apps/api/app/main.py)
- Start path: [`docs/start-here.md`](./start-here.md)

Representative routes:

- `GET /api/v1/subscriptions/templates`
- `POST /api/v1/videos/process`
- `GET /api/v1/jobs/{job_id}`
- `POST /api/v1/retrieval/search`
- `POST /api/v1/retrieval/answer/page`
- `GET /api/v1/ops/inbox`
- `GET /api/v1/watchlists`

### 2. MCP

- Quickstart: [`docs/mcp-quickstart.md`](./mcp-quickstart.md)
- Server: [`apps/mcp/server.py`](../apps/mcp/server.py)
- Local start: `./bin/dev-mcp`

Representative tools:

- `sourceharbor.jobs.get`
- `sourceharbor.jobs.compare`
- `sourceharbor.knowledge.cards.list`
- `sourceharbor.retrieval.search`
- `sourceharbor.ingest.poll`

### 3. Packaged Public CLI

If you want one installable command surface first:

```bash
npm install --global ./packages/sourceharbor-cli
cd /path/to/sourceharbor
sourceharbor help
sourceharbor mcp
```

Current truth:

- package path: [`packages/sourceharbor-cli`](../packages/sourceharbor-cli/README.md)
- it is a **thin repo-aware public wrapper**
- inside a checkout it delegates to the repo-local `bin/sourceharbor`
- it does not replace the repo-local runtime manager
- outside a checkout it falls back to public docs guidance instead of inventing a second runtime stack

### 4. Repo-Local CLI Substrate

These remain the direct command truth:

- `./bin/sourceharbor help`
- `./bin/sourceharbor bootstrap`
- `./bin/sourceharbor full-stack up`
- `./bin/sourceharbor doctor`
- `./bin/sourceharbor mcp`

The packaged CLI above does not replace this substrate. It only makes it easier
to discover and reuse.

### 5. Public TypeScript SDK

If you want a public, typed HTTP client first:

```bash
npm install ./packages/sourceharbor-sdk
```

Package path:

- [`packages/sourceharbor-sdk`](../packages/sourceharbor-sdk/README.md)

Current truth:

- it is a **thin contract-first SDK**
- it stays on top of the HTTP API contract instead of opening a second business-logic stack
- it intentionally covers the builder-facing API layer, not every web-only operator helper

### 6. Public Starter Packs

If you want public templates instead of internal raw skills:

- [`starter-packs/README.md`](../starter-packs/README.md)
- [`starter-packs/compatibility.md`](../starter-packs/compatibility.md)
- [`starter-packs/codex/AGENTS.md`](../starter-packs/codex/AGENTS.md)
- [`starter-packs/claude-code/CLAUDE.md`](../starter-packs/claude-code/CLAUDE.md)
- [`starter-packs/typescript-sdk/example.ts`](../starter-packs/typescript-sdk/example.ts)

## Public Packaging Status

SourceHarbor should still stay honest here.

What ships now:

- **Packaged public CLI:** now
- **Public TypeScript SDK:** now
- **Public starter packs / compatibility docs:** now
- **Codex / Claude Code fit via MCP + HTTP API + CLI + SDK:** now

What stays later:

- **Python SDK:** later

What stays no-go this wave:

- **Plugin / marketplace positioning**
- **Hosted workspace claims**
- **generic autonomous agent loops**

If you want the bucketed decision ledger instead of the packaging sequence, read
[docs/reference/ecosystem-and-big-bet-decisions.md](./reference/ecosystem-and-big-bet-decisions.md).

## Risk Boundaries

These are intentionally not opened in the current builder story:

- write-capable MCP as a default public promise
- hosted SaaS claims
- generic autonomous agent loops
- plugin-first positioning

If you need the public proof boundary before integrating, read
[`docs/proof.md`](./proof.md).
