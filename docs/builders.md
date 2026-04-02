# Build With SourceHarbor

SourceHarbor is not only a Web UI.

It already exposes three real builder-facing layers:

1. **HTTP API contract** for system integrations
2. **MCP surface** for agent clients such as Codex and Claude Code
3. **Shared TypeScript client and types** that show the current substrate path

Think of the product like one control tower with multiple doors:

- operators use the Web command center
- integrations use the HTTP API
- assistants use MCP
- future SDKs should stay thin wrappers over those same contracts
- the same contracts now distinguish **strong-supported video intake** from **generalized RSSHub/RSS intake**

## Best-Fit Clients Today

| Surface | Best fit today | Why |
| --- | --- | --- |
| **Codex** | Primary fit | SourceHarbor already exposes a real MCP server plus operator-safe HTTP contracts |
| **Claude Code** | Primary fit | Same MCP surface, same API-backed state, same retrieval and job evidence |
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

### 3. Shared TypeScript Client Layer

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
4. extract a thin TypeScript SDK only when the builder contract stops moving
5. treat a Python SDK as later

That means:

- **TypeScript SDK:** later, but clearly on-path
- **Python SDK:** later
- **generic multi-language platform claim:** no-go for now

## Risk Boundaries

These are intentionally not opened in the current builder story:

- write-capable MCP as a default public promise
- hosted SaaS claims
- generic autonomous agent loops
- plugin-first positioning

If you need the public proof boundary before integrating, read
[`docs/proof.md`](./proof.md).
