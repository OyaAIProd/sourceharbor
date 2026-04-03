# Start Here

This is the shortest truthful path from clone to visible product value.

If you only want a fast fit check first, go to [see-it-fast.md](./see-it-fast.md). This page starts when you are ready to install dependencies and boot the stack locally.

Think of it like a guided first local run:

- first boot the stack
- then queue one real job
- then inspect the feed and the job trace
- then run the smoke path that backs up the public story

## What You Should See By The End

- the web command center at the route recorded in `.runtime-cache/run/full-stack/resolved.env`
- the API health endpoint recorded in `.runtime-cache/run/full-stack/resolved.env`, with the canonical default local health URL remaining `http://127.0.0.1:9000/healthz` only when that port is still free
- at least one queued or completed processing job
- a digest feed entry or an inspectable job payload
- a local supervisor check you can rerun before you decide whether to open the long live-smoke lane

## Run Locally: Fastest Result Path

### 1. Install dependencies

```bash
cp .env.example .env
UV_PROJECT_ENVIRONMENT="${UV_PROJECT_ENVIRONMENT:-$HOME/.cache/sourceharbor/project-venv}" \
  uv sync --frozen --extra dev --extra e2e
bash scripts/ci/prepare_web_runtime.sh >/dev/null
```

The default local database path is container-first:

- `CORE_POSTGRES_PORT=15432`
- `DATABASE_URL=postgresql+psycopg://postgres:postgres@127.0.0.1:${CORE_POSTGRES_PORT}/sourceharbor`

This avoids a silent split-brain when your machine already has a host Postgres
on `127.0.0.1:5432`.

### 2. Bootstrap the local stack

```bash
./bin/bootstrap-full-stack
./bin/full-stack up
source .runtime-cache/run/full-stack/resolved.env
```

Open:

- web command center: `http://127.0.0.1:${WEB_PORT}`
- API health: `${SOURCE_HARBOR_API_BASE_URL}/healthz`
- canonical local fallback before any port re-home: `http://127.0.0.1:9000/healthz`

If anything feels off before you continue, run:

```bash
./bin/doctor
```

Why source the runtime snapshot:

- bootstrap/full-stack may move off `9000/3000` when those ports are already occupied
- the snapshot is the repo-managed local truth for API/Web routes
- if the snapshot and actual services disagree, run `./bin/full-stack down` and restart the clean path

### 3. Set the local write token

Direct write endpoints require a local write token.

For local development, use:

```bash
export SOURCE_HARBOR_API_KEY="${SOURCE_HARBOR_API_KEY:-sourceharbor-local-dev-token}"
```

If you start the API outside the repo-managed `./bin/full-stack up` path, also
export:

```bash
export WEB_ACTION_SESSION_TOKEN="${WEB_ACTION_SESSION_TOKEN:-$SOURCE_HARBOR_API_KEY}"
```

That keeps direct write calls and web server actions on the same local token
contract instead of creating a false auth blocker.

### 4. Queue a first video job

Replace the sample URL with any public YouTube or Bilibili URL you can access:

```bash
curl -sS -X POST "${SOURCE_HARBOR_API_BASE_URL}/api/v1/videos/process" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ${SOURCE_HARBOR_API_KEY}" \
  -d '{
    "video": {
      "platform": "youtube",
      "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    },
    "mode": "full"
  }'
```

What this gives you:

- a `job_id`
- a pipeline run you can inspect
- a future digest or artifact trail tied to that job

### 5. Inspect the result surfaces

```bash
curl -sS "${SOURCE_HARBOR_API_BASE_URL}/api/v1/videos" | jq
curl -sS "${SOURCE_HARBOR_API_BASE_URL}/api/v1/feed/digests" | jq
curl -sS "${SOURCE_HARBOR_API_BASE_URL}/api/v1/jobs/<job-id>" | jq
curl -sS -X POST "${SOURCE_HARBOR_API_BASE_URL}/api/v1/retrieval/search" \
  -H "Content-Type: application/json" \
  -d '{"query":"summary","top_k":5,"mode":"keyword"}' | jq
```

Open these UI views:

- `/` for the command center
- `/ops` for operator diagnostics and live-hardening gates
- `/subscriptions` for strong-supported video templates plus generalized RSSHub/RSS intake, backed by the same template catalog contract that the API and MCP surfaces expose
- `/search` for grounded search across SourceHarbor artifacts
- `/ask` for the story-aware, briefing-backed Ask front door, with a server-owned story page payload over the answer/change/evidence view
- `/feed` for the digest reading flow
- `/jobs?job_id=<job-id>` for pipeline trace and artifacts
- `/watchlists` for long-lived tracking objects
- `/trends` for merged stories plus recent evidence runs
- `/briefings` for the summary-first watchlist briefing: current story, then changes, then evidence drill-down, with selected-story focus and Ask handoff now owned by the server
- `/mcp` for the MCP front door and quickstart
- `/settings` for notifications and test sends

## Operator Path: Continuous Intake

If you want the longer-lived workflow instead of one-off processing:

1. Add one or more subscriptions in the web UI or via `POST /api/v1/subscriptions`
2. Use the built-in template split honestly:
   - strong-supported YouTube/Bilibili presets when you want the richer video lane
   - generalized RSSHub / generic RSS intake when the source universe widens
   - do not treat generalized intake as route-by-route RSSHub proof
3. Trigger `POST /api/v1/ingest/poll`
4. Keep the returned `run_id` so you can inspect `GET /api/v1/ingest/runs/<run-id>`
5. Read the resulting entries in `/feed`
6. Inspect `/trends` when you want the merged-story view over repeated themes
7. Inspect `/briefings` when you want the lower-cognitive-load unified story view for one watchlist; the selected story and Ask handoff should now stay on the same server-owned story truth
8. Inspect the job page for retries, degradations, and artifact links

That path is what turns SourceHarbor from a one-shot processor into a knowledge intake system.

## Minimum Verification

These are the smallest checks that support the local supervisor story:

```bash
source .runtime-cache/run/full-stack/resolved.env
./bin/full-stack status
curl -sS "${SOURCE_HARBOR_API_BASE_URL}/healthz"
curl -I "http://127.0.0.1:${WEB_PORT}/ops"
python3 scripts/governance/check_env_contract.py --strict
python3 scripts/governance/check_test_assertions.py
./bin/doctor
eval "$(bash scripts/ci/prepare_web_runtime.sh --shell-exports)"
( cd "$WEB_RUNTIME_WEB_DIR" && npm run lint )
```

## Optional Long Live Smoke Lane

When you intentionally want the stricter live lane, run:

```bash
./bin/smoke-full-stack --offline-fallback 0
```

That command is not the same thing as the local supervisor proof above. It
continues into external provider checks and can still stop on current
YouTube/Resend/Gemini-side gates even after `bootstrap -> up -> status ->
doctor` is already healthy.

## Boundaries

- This repository is **inspectable and runnable locally**, but not marketed as a turnkey hosted product.
- Local proof is different from remote release proof.
- Public screenshots and diagrams are presentation assets, not a substitute for live verification.
- For the shortest delivered-vs-bet summary, read [project-status.md](./project-status.md).
- For the exhaustive Prompt 1-5 closeout ledger, read [2026-03-31-program-closeout-matrix.md](./blueprints/2026-03-31-program-closeout-matrix.md).
- Agent autopilot and hosted workspace directions remain spike artifacts, not current operator promises. See [reference/project-positioning.md](./reference/project-positioning.md) and the related files in [blueprints/](./blueprints/).

## Public Trust Links

- Contribution path: [CONTRIBUTING.md](../CONTRIBUTING.md)
- Support path: [SUPPORT.md](../SUPPORT.md)
- Security path: [SECURITY.md](../SECURITY.md)
- Code of conduct: [CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md)
- Code owners: [.github/CODEOWNERS](../.github/CODEOWNERS)
- Third-party notices: [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md)
- Rights and provenance: [docs/reference/public-rights-and-provenance.md](./reference/public-rights-and-provenance.md)
- Public asset provenance: [docs/reference/public-assets-provenance.md](./reference/public-assets-provenance.md)
- Privacy and data boundary: [docs/reference/public-privacy-and-data-boundary.md](./reference/public-privacy-and-data-boundary.md)
- Public artifact exposure: [docs/reference/public-artifact-exposure.md](./reference/public-artifact-exposure.md)

For the explicit evidence ladder, go to [proof.md](./proof.md).
For the storage/runtime truth split, read [runtime-truth.md](./runtime-truth.md).
