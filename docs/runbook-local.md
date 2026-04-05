# Local Runbook

This is the operator runbook for local proof, not a hosted deployment guide.

## What To Run First

1. Copy `.env.example` to `.env`.
2. Install dependencies with:

```bash
SOURCE_HARBOR_CACHE_ROOT="${SOURCE_HARBOR_CACHE_ROOT:-$HOME/.cache/sourceharbor}"
UV_PROJECT_ENVIRONMENT="${UV_PROJECT_ENVIRONMENT:-$SOURCE_HARBOR_CACHE_ROOT/project-venv}" \
  uv sync --frozen --extra dev --extra e2e
```

1. Run `./bin/doctor` to see env/runtime blockers before boot.
2. Boot the stack with `./bin/bootstrap-full-stack` and `./bin/full-stack up`.
3. Use [start-here.md](./start-here.md) to queue the first real job.

## Where To Look When Something Feels Off

- API health: default is `http://127.0.0.1:9000/healthz` when that port stays free, but current local truth should always be read from `.runtime-cache/run/full-stack/resolved.env`
- Web command center: default is `http://127.0.0.1:3000` only when that port stays free; otherwise trust `.runtime-cache/run/full-stack/resolved.env`
- First-run diagnosis: `./bin/doctor`
- Supervisor view of what is actually running: `./bin/full-stack status`
- Operator diagnostics page: `/ops`
- Python gate: `bash scripts/ci/python_tests.sh`
- Structured full-stack logs: `.runtime-cache/logs/components/full-stack`
- Generated evidence and reports: `.runtime-cache/reports`
- Canonical repo-side web runtime: `.runtime-cache/tmp/web-runtime/workspace/apps/web`
- Disk-space audit: `./bin/disk-space-audit`
- Disk-space audit report check: `./bin/disk-space-audit-check`
- Dry-run cleanup planning: `./bin/disk-space-cleanup --wave safe`
- Repo-side runtime maintenance: `./bin/runtime-cache-maintenance`
- External cache maintenance report: `python3 scripts/runtime/maintain_external_cache.py --json`
- Docker hygiene report: `python3 scripts/runtime/docker_hygiene.py --json`
- Legacy-path migration dry-run: `./bin/disk-space-legacy-migration --json`
- Legacy-path migration apply (canonical auto-mappings): `./bin/disk-space-legacy-migration --apply --yes --auto-mappings`
- Local-private ledger migration: `python3 scripts/governance/migrate_local_private_ledgers.py --json`
- Worktree status closure: `python3 scripts/governance/report_worktree_status.py`
  This report now fail-closes to `partial` when no authoritative local-private plan ledger exists yet, instead of exiting without a report.

Do not hand-delete `.runtime-cache/` when local verification expands the repo
footprint. Use `runtime-cache-maintenance` for repo-side maintenance, and use
`disk-space-cleanup --wave ...` only when you are intentionally running a
governed cleanup wave from
[reference/disk-space-governance.md](./reference/disk-space-governance.md).

Do not hand-delete `~/.cache/sourceharbor/` either.

- `project-venv/` and `state/*.db` are protected runtime objects
- `workspace/`, `artifacts/`, `browser/`, and `tmp/` are governed by TTL,
  quiet-window, and budget rules
- duplicate `project-venv-*` directories are verify-first cleanup candidates,
  not random junk
- repo-scoped Docker hygiene inventories named volumes but keeps them
  verify-first/report-only, and only deletes local debug images after the quiet
  window clears and no repo-owned containers still point at them

## Local Browser Login State

If a local browser proof actually needs login state, use the real Chrome profile
contract instead of Playwright's bundled Chromium:

```bash
export SOURCE_HARBOR_CHROME_USER_DATA_DIR="$HOME/Library/Application Support/Google/Chrome"
export SOURCE_HARBOR_CHROME_PROFILE_NAME="${SOURCE_HARBOR_CHROME_PROFILE_NAME:-sourceharbor}"
python3 scripts/runtime/resolve_chrome_profile.py --json
```

Hosted CI stays login-free. Real-profile browser proof is a local-only lane.

## Quick Diagnosis Loop

1. Re-run the smallest failing command.
2. Check `.runtime-cache/logs/` for the matching component log.
3. Inspect `/api/v1/jobs/<job-id>` or `/api/v1/feed/digests` if the issue is inside a pipeline run.
4. Use [proof.md](./proof.md) to keep local proof separate from remote proof claims.
5. Use [runtime-truth.md](./runtime-truth.md) when Postgres, SQLite, artifacts, and release truth start sounding like one mixed story.
6. Treat `./bin/smoke-full-stack --offline-fallback 0` as the long live-smoke lane, not as the same thing as the local supervisor proof.

## Boundaries

- Local success means the repo is inspectable and rerunnable on your machine.
- Local success does not automatically prove remote release, hosted availability, or third-party uptime.

For the disk-space map, safe cleanup boundary, and legacy-path migration rules, read [reference/disk-space-governance.md](./reference/disk-space-governance.md).
