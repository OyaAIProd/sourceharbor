# @sourceharbor/cli

Thin public CLI bridge for the SourceHarbor repo-local command surface.

This package is intentionally smaller than the repo-local `./bin/sourceharbor`
operator facade. Its job is not to invent a second runtime manager. Its job is
to make the existing repo-owned command surface easier to discover and reuse.

## Install

From a SourceHarbor checkout:

```bash
npm install -g ./packages/sourceharbor-cli
```

If you later publish this package to a registry, replace the local path with
the published package name.

## Examples

```bash
cd /path/to/sourceharbor
sourceharbor help
sourceharbor doctor
sourceharbor mcp
sourceharbor templates
sourceharbor search "agent workflows"
sourceharbor ask "What changed this week?"
```

## Boundary

- This package is a **repo-aware delegate**, not a second runtime stack.
- Inside a checkout it forwards to `./bin/sourceharbor`.
- Outside a checkout it falls back to public docs guidance.
- For typed application integration, use `@sourceharbor/sdk`.
- The public HTTP helpers stay intentionally thin: `templates`, `search`, `ask`,
  and `job` only call the current SourceHarbor HTTP contract.
