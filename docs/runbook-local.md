# Local Runbook

This is the operator runbook for local proof, not a hosted deployment guide.

## What To Run First

1. Copy `.env.example` to `.env`.
2. Install dependencies with:

```bash
UV_PROJECT_ENVIRONMENT="${UV_PROJECT_ENVIRONMENT:-$HOME/.cache/sourceharbor/project-venv}" \
  uv sync --frozen --extra dev --extra e2e
```

1. Boot the stack with `./bin/bootstrap-full-stack` and `./bin/full-stack up`.
2. Use [start-here.md](./start-here.md) to queue the first real job.

## Where To Look When Something Feels Off

- API health: `http://127.0.0.1:9000/healthz`
- Web command center: `http://127.0.0.1:3000`
- Python gate: `bash scripts/ci/python_tests.sh`
- Structured full-stack logs: `.runtime-cache/logs/components/full-stack`
- Generated evidence and reports: `.runtime-cache/reports`
- Canonical repo-side web runtime: `.runtime-cache/tmp/web-runtime/workspace/apps/web`
- Disk-space audit: `./bin/disk-space-audit`
- Disk-space audit report check: `./bin/disk-space-audit-check`
- Dry-run cleanup planning: `./bin/disk-space-cleanup --wave safe`
- Legacy-path migration dry-run: `./bin/disk-space-legacy-migration --json`
- Local-private ledger migration: `python3 scripts/governance/migrate_local_private_ledgers.py --json`
- Worktree status closure: `python3 scripts/governance/report_worktree_status.py`
  This report now fail-closes to `partial` when no authoritative local-private plan ledger exists yet, instead of exiting without a report.

## Quick Diagnosis Loop

1. Re-run the smallest failing command.
2. Check `.runtime-cache/logs/` for the matching component log.
3. Inspect `/api/v1/jobs/<job-id>` or `/api/v1/feed/digests` if the issue is inside a pipeline run.
4. Use [proof.md](./proof.md) to keep local proof separate from remote proof claims.

## Boundaries

- Local success means the repo is inspectable and rerunnable on your machine.
- Local success does not automatically prove remote release, hosted availability, or third-party uptime.

For the disk-space map, safe cleanup boundary, and legacy-path migration rules, read [reference/disk-space-governance.md](./reference/disk-space-governance.md).
