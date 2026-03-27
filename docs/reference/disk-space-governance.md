# Disk Space Governance

This is the disk-space runbook for SourceHarbor.

Think of it as a warehouse map, not a trash guide.

The point is to answer four different questions separately:

1. **Does it exist?**
2. **Is it really owned by this repo?**
3. **Can it be rebuilt?**
4. **Is it allowed to be cleaned right now?**

Those are not the same question.

## Canonical Path Model

SourceHarbor uses three path classes:

| Class | Canonical root | What belongs there |
| :-- | :-- | :-- |
| Repo-side runtime | `.runtime-cache/` | short-lived repo-local runtime state |
| User-side persistent state | `$HOME/.sourceharbor/` | worker state, pipeline workspace, pipeline artifacts |
| User-side Python cache | `$HOME/.cache/sourceharbor/` | managed project venvs and repo-owned Python cache roots |

The canonical repo-side web runtime workspace is:

- `.runtime-cache/tmp/web-runtime/workspace/apps/web`

Legacy `video-digestor` paths are compatibility surfaces only.

They may still exist locally, but they must be treated as:

- **present**
- maybe **still referenced**
- not automatically **cleanable**

Legacy retirement is a separate question from legacy detection.

Use this state machine:

1. **detected**
2. **recently active**
3. **still referenced by local `.env`**
4. **retirement blocked or clear**

## The Four Audit Layers

Every disk report must classify findings into exactly one of these layers:

| Layer | Meaning |
| :-- | :-- |
| `repo-internal` | under the repo root |
| `repo-external-repo-owned` | outside the repo, but clearly generated or owned by this repo |
| `shared-layer` | global cache/toolchain state that other projects may also use |
| `unverified-layer` | objects we know may exist, but could not safely measure or attribute yet |

Examples:

- `.runtime-cache/tmp` → `repo-internal`
- `$HOME/.video-digestor` → `repo-external-repo-owned`
- `$HOME/Library/Caches/ms-playwright` → `shared-layer`
- Docker named volumes when the daemon is unavailable → `unverified-layer`

## Cleanup States

Use these states in order:

| State | What it means in plain language |
| :-- | :-- |
| `exists` | the object is on disk |
| `ownership-confirmed` | we have enough evidence that this repo owns or depends on it |
| `rebuildability-confirmed` | we know how to recreate it safely |
| `cleanup-allowed` | policy and gates both say it may be removed now |

Large is not enough.

Rebuildable is not enough.

Outside the repo is not enough.

## Cleanup Waves

### Wave 1: Safe

These are rebuildable caches that do not carry current pipeline state:

- `.mypy_cache`
- source-tree `__pycache__`
- small `pytest` and `ruff` index residues
- tiny stale `run/` files that are below the micro-state threshold

Default mode is dry-run:

```bash
./bin/disk-space-cleanup --wave safe
```

Authorized apply requires explicit confirmation:

```bash
./bin/disk-space-cleanup --wave safe --apply --yes
```

### Wave 2: Repo tmp duplicates

These are larger and need extra gates:

- `.runtime-cache/tmp/web-runtime`
- `.runtime-cache/tmp/sourceharbor-verify-venv`
- `.runtime-cache/tmp/ws6-test-venv`

Before these can be deleted, the cleanup gate must prove:

1. the path has been quiet for at least 10 minutes
2. explicit runtime lock paths are clear
3. `lsof` does not show active users
4. the configured rebuild command succeeds after deletion

### Wave 3: External history copies

These are repo-owned external history candidates such as:

- `$HOME/.cache/sourceharbor/root-venv-backup`
- `$HOME/.cache/sourceharbor/codex-ghcr-*`
- `$HOME/.cache/sourceharbor/ws6-test-venv`
- `$HOME/.cache/video-digestor/closure-fix-venv`

They are **verify-first**, not safe-by-name.

They must prove:

1. current `.env`, fallback scripts, and systemd fallbacks do not reference them
2. they are outside the active change window
3. an equivalent mainline environment exists

## Explicit Non-Targets

These are intentionally excluded from automatic cleanup planning:

- `apps/web/node_modules`
- `.venv`
- `$HOME/.cache/video-digestor/project-venv`
- `$HOME/.video-digestor/state/worker_state.db`
- `$HOME/.video-digestor/artifacts`
- `$HOME/Library/Caches/ms-playwright`
- `$HOME/.cache/uv`
- `$HOME/.local/share/uv/python`

Reason:

- some are active mainline dependencies
- some are legacy compatibility roots still in use
- some are shared caches that can hurt other projects

## Operator Commands

Audit only:

```bash
./bin/disk-space-audit
```

Dry-run a specific cleanup wave:

```bash
./bin/disk-space-cleanup --wave repo-tmp
```

JSON output for automation:

```bash
./bin/disk-space-audit --json
./bin/disk-space-cleanup --wave safe --json
```

Validate the generated audit report shape:

```bash
./bin/disk-space-audit-check
```

Dry-run the legacy-path migration plan:

```bash
./bin/disk-space-legacy-migration --json
```

Authorized migration requires explicit source and target mappings:

```bash
./bin/disk-space-legacy-migration \
  --apply --yes \
  --mapping 'PIPELINE_ARTIFACT_ROOT=$HOME/.video-digestor/artifacts::$HOME/.sourceharbor/artifacts'
```

## Important Boundary

These tools are designed to separate:

- **what exists**
- **what is owned**
- **what is rebuildable**
- **what is cleanable right now**

If those four states are collapsed into one sentence, the report is not trustworthy.

The real execution order is fixed:

1. `./bin/disk-space-audit --json`
2. `./bin/disk-space-legacy-migration --json`
3. `./bin/disk-space-cleanup --wave safe --apply --yes`
4. `./bin/disk-space-cleanup --wave repo-tmp --apply --yes`
5. `./bin/disk-space-cleanup --wave external-history --apply --yes` only after legacy retirement is clear
