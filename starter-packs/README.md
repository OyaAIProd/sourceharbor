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

## Pick The Right Pack Fast

| If you want to... | Open this first | Current truth |
| --- | --- | --- |
| drive SourceHarbor from Codex | `starter-packs/codex/AGENTS.md` | primary public pack today |
| drive it from Claude Code | `starter-packs/claude-code/CLAUDE.md` | primary public pack today |
| start from SDK code instead of an agent | `starter-packs/typescript-sdk/example.ts` | public example, not a full framework pack |
| look for an OpenClaw pack | `docs/builders.md` | no dedicated OpenClaw pack is shipped yet; stay on the generic MCP / API path for now |

What does **not** live here:

- internal L1/L2 delegation rules
- repo-private `.agents/Plans` or `.runtime-cache` assumptions
- hosted/autopilot/plugin-market promises

Use these packs when you want a versionable, documented, reproducible starting point.
