# Build With SourceHarbor

SourceHarbor is not only a Web UI.

It already exposes four real builder-facing layers:

1. **HTTP API contract** for system integrations
2. **MCP surface** for agent clients such as Codex and Claude Code
3. **Repo-local CLI/help facade** for discoverable operator and builder entrypoints
4. **Shared TypeScript client and types** that show the current substrate path

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

### 3. Repo-Local CLI Surface

If you want one discoverable command surface before you memorize the bin
directory:

- `./bin/sourceharbor help`
- `./bin/sourceharbor bootstrap`
- `./bin/sourceharbor full-stack up`
- `./bin/sourceharbor doctor`
- `./bin/sourceharbor mcp`

This is the honest current status:

- it is a **thin repo-local facade**
- it routes into the existing `bin/*` entrypoints
- it is **not** marketed as a separately packaged public CLI

### 4. Shared TypeScript Client Layer

These files are not marketed as a standalone SDK yet, but they are already the
real substrate path inside the repo:

- [`apps/web/lib/api/client.ts`](../apps/web/lib/api/client.ts)
- [`apps/web/lib/api/types.ts`](../apps/web/lib/api/types.ts)

This is the honest current status:

- there is a **shared client layer**
- there are **shared TypeScript types**
- there is **not yet** a separately packaged public SDK

## Future SDK Path

SourceHarbor should not overclaim here.

The most truthful next packaging sequence is:

1. keep the HTTP contract stable
2. keep the MCP surface stable
3. keep the shared TypeScript client and types stable
4. keep the repo-local CLI facade thin and honest over `bin/*`
5. extract a thin TypeScript SDK only when the builder contract stops moving
6. treat a Python SDK as later

That means:

- **Repo-local CLI facade:** shipped now as a thin discoverability surface
- **TypeScript SDK:** later, but clearly on-path
- **Python SDK:** later
- **Public skills / template packs:** later, after the builder contract stabilizes
- **Codex / Claude Code fit via MCP + HTTP API + repo-local CLI:** shipped now
- **Plugin / marketplace positioning:** no-go for now
- **generic multi-language platform claim:** no-go for now

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
