# Architecture

SourceHarbor is easiest to understand as a single knowledge pipeline with four outward-facing surfaces.

<p>
  <img
    src="./assets/sourceharbor-architecture.svg"
    alt="SourceHarbor architecture showing source intake, API and worker pipeline, artifact generation, retrieval and MCP surfaces, and the web command center."
    width="100%"
  />
</p>

## The Product Model

Long-form sources come in.

Artifacts, digests, and traceable jobs come out.

Everything else in the repository exists to make that loop reliable, inspectable, and reusable.

## The Four Runtime Surfaces

### API

`apps/api` exposes HTTP endpoints for:

- subscriptions
- ingestion
- videos and jobs
- digest feed
- artifacts
- retrieval
- notifications
- operator-facing controls

### Worker

`apps/worker` runs the asynchronous pipeline:

- poll feeds
- queue and process jobs
- write artifacts
- send video digests
- send daily digests
- retry delivery failures

### MCP

`apps/mcp` exposes the same system as agent tools:

- ingest
- subscriptions
- jobs
- artifacts
- retrieval
- notifications
- reports
- UI audit hooks

### Web

`apps/web` is the operator command center:

- command overview
- digest reading flow
- subscription management
- job trace
- notification settings

## Shared Surfaces

- `contracts`: shared schemas and contract artifacts
- `infra`: compose, migrations, runtime infrastructure, and deployment assets
- `scripts` and `bin`: reproducible operator and CI entrypoints

## Design Principles

- **Result-first operations:** a newcomer should be able to produce a real job before reading deep internals
- **One truth, many surfaces:** API, MCP, and web all point at the same pipeline state
- **Proof over promises:** jobs, artifacts, smoke scripts, and CI back up public claims
- **Thin public docs, rich executable source:** docs should direct people; source should prove the details

## Read Next

- [start-here.md](./start-here.md)
- [proof.md](./proof.md)
- [testing.md](./testing.md)
