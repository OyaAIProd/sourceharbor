# SourceHarbor Starter Packs

These starter packs are the first public workflow surface for SourceHarbor.

They are intentionally **not** the same thing as `.agents/skills/`.

Think of the naming this way:

- `starter-packs/` is the public entry directory
- `templates/public-skills/**` contains the copyable prompt/template assets that those starter packs reference

What lives here:

- public adoption paths for Codex and Claude Code
- reusable workflow templates built on MCP, HTTP API, and repo-local CLI
- examples that stay honest about sample vs live proof

What does **not** live here:

- internal L1/L2 delegation rules
- repo-private `.agents/Plans` or `.runtime-cache` assumptions
- hosted/autopilot/plugin-market promises

Use these packs when you want a versionable, documented, reproducible starting point.
