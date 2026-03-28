# Start Here

This is the shortest truthful path from clone to visible product value.

If you only want a fast fit check first, go to [see-it-fast.md](./see-it-fast.md). This page starts when you are ready to install dependencies and boot the stack locally.

Think of it like a guided first local run:

- first boot the stack
- then queue one real job
- then inspect the feed and the job trace
- then run the smoke path that backs up the public story

## What You Should See By The End

- the web command center at `http://127.0.0.1:3000`
- the API health endpoint responding at `http://127.0.0.1:9000/healthz`
- at least one queued or completed processing job
- a digest feed entry or an inspectable job payload
- a smoke command you can rerun as public proof

## Run Locally: Fastest Result Path

### 1. Install dependencies

```bash
cp .env.example .env
UV_PROJECT_ENVIRONMENT="${UV_PROJECT_ENVIRONMENT:-$HOME/.cache/sourceharbor/project-venv}" \
  uv sync --frozen --extra dev --extra e2e
npm --prefix apps/web ci
```

### 2. Bootstrap the local stack

```bash
./bin/bootstrap-full-stack
./bin/full-stack up
```

Open:

- web command center: `http://127.0.0.1:3000`
- API health: `http://127.0.0.1:9000/healthz`

### 3. Set the local write token

Direct write endpoints require a local write token.

For local development, use:

```bash
export SOURCE_HARBOR_API_KEY="${SOURCE_HARBOR_API_KEY:-sourceharbor-local-dev-token}"
```

### 4. Queue a first video job

Replace the sample URL with any public YouTube or Bilibili URL you can access:

```bash
curl -sS -X POST http://127.0.0.1:9000/api/v1/videos/process \
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
curl -sS http://127.0.0.1:9000/api/v1/videos | jq
curl -sS http://127.0.0.1:9000/api/v1/feed/digests | jq
curl -sS http://127.0.0.1:9000/api/v1/jobs/<job-id> | jq
curl -sS -X POST http://127.0.0.1:9000/api/v1/retrieval/search \
  -H "Content-Type: application/json" \
  -d '{"query":"summary","top_k":5,"mode":"keyword"}' | jq
```

Open these UI views:

- `/` for the command center
- `/feed` for the digest reading flow
- `/jobs?job_id=<job-id>` for pipeline trace and artifacts
- `/settings` for notifications and test sends

## Operator Path: Continuous Intake

If you want the longer-lived workflow instead of one-off processing:

1. Add one or more subscriptions in the web UI or via `POST /api/v1/subscriptions`
2. Trigger `POST /api/v1/ingest/poll`
3. Read the resulting entries in `/feed`
4. Inspect the job page for retries, degradations, and artifact links

That path is what turns SourceHarbor from a one-shot processor into a knowledge intake system.

## Minimum Verification

These are the smallest checks that support the public story:

```bash
curl -sS http://127.0.0.1:9000/healthz
python3 scripts/governance/check_env_contract.py --strict
python3 scripts/governance/check_test_assertions.py
npm --prefix apps/web run lint
./bin/smoke-full-stack --offline-fallback 0
```

## Boundaries

- This repository is **inspectable and runnable locally**, but not marketed as a turnkey hosted product.
- Local proof is different from remote release proof.
- Public screenshots and diagrams are presentation assets, not a substitute for live verification.

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
