# Runtime Cache Retention

This page explains the repo-side runtime cache like a labeled storage room.

The important idea is simple:

- `.runtime-cache/` is the **only** repo-side runtime root.
- each child compartment has a different job
- retention policy is about **when to refresh or prune**, not a blanket “delete everything”

## Canonical Compartments

- `run/`
- `logs/`
- `reports/`
- `evidence/`
- `tmp/`

## What Each Compartment Means

| Compartment | Plain-English meaning | Typical contents | Default retention shape |
| :-- | :-- | :-- | :-- |
| `run/` | live process scratch | pid files, resolved env, lock state | shortest-lived |
| `logs/` | structured activity trail | app logs, governance logs, smoke logs | retained long enough for debugging |
| `reports/` | machine-readable summaries | junit, coverage, governance summaries | retained for proof and automation |
| `evidence/` | debugging evidence | screenshots, traces, persisted audit artifacts, local-private ai ledgers | retained for proof, then pruned |
| `tmp/` | disposable workbench | temporary workdirs, copied runtime web workspace, short-lived venvs | aggressively bounded |

## Guardrails

- `tmp/` is allowed to exist, but it is not allowed to grow forever.
- `logs/`, `reports/`, and `evidence/` are proof surfaces, not random junk drawers.
- a compartment having a TTL does **not** mean every file under it is automatically safe to delete at any moment.
- the canonical repo-side web runtime path is `.runtime-cache/tmp/web-runtime/workspace/apps/web`, not `.runtime/web`.
- the repo-side web runtime duplicate and repo-external project env duplicates are different responsibility buckets: `.runtime-cache/tmp/web-runtime` is repo-local duplicate runtime, while `$HOME/.cache/sourceharbor/project-venv*` is repo-external environment state.
- image-audit directories under `tmp/` are repo-side proof scratch.
- examples include `.runtime-cache/tmp/manual-image-audit`, `.runtime-cache/tmp/public-image-audit`, `.runtime-cache/tmp/audit-images`, `.runtime-cache/tmp/audit-images-direct`, and `.runtime-cache/tmp/image-audit`.
- treat those paths as "requires verification" rather than generic safe-clear cache.
- `.runtime-cache/evidence/ai-ledgers` is the authoritative local-private execution ledger root; `.agents/Plans` is only an optional compatibility bridge when it still exists locally.
- rebuildable does **not** mean ignorable: repo-local duplicate runtime and repo-external duplicate envs should still be measured, surfaced, and explained even when cleanup remains verify-first.

For the larger repo-wide disk map, including repo-external and shared caches, use [disk-space-governance.md](./disk-space-governance.md).
