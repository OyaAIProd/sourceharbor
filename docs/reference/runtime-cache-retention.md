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
| `evidence/` | debugging evidence | screenshots, traces, persisted audit artifacts | retained for proof, then pruned |
| `tmp/` | disposable workbench | temporary workdirs, copied runtime web workspace, short-lived venvs | aggressively bounded |

## Guardrails

- `tmp/` is allowed to exist, but it is not allowed to grow forever.
- `logs/`, `reports/`, and `evidence/` are proof surfaces, not random junk drawers.
- a compartment having a TTL does **not** mean every file under it is automatically safe to delete at any moment.
- the canonical repo-side web runtime path is `.runtime-cache/tmp/web-runtime/workspace/apps/web`, not `.runtime/web`.

For the larger repo-wide disk map, including repo-external and shared caches, use [disk-space-governance.md](./disk-space-governance.md).
