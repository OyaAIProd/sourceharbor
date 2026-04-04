# OpenClaw Compatibility

This is the shortest honest OpenClaw adoption path for SourceHarbor.

OpenClaw is no longer limited here to a vague "generic MCP / HTTP only" story.
SourceHarbor now ships a first-cut local OpenClaw starter pack on top of the
same MCP and HTTP API surfaces already documented for Codex and Claude Code.

## Pick Your Door

| If you want to... | Use this | Why |
| --- | --- | --- |
| install a local OpenClaw-ready pack | `starter-packs/openclaw/` | first-cut local pack with plugin manifest, MCP template, and starter skill |
| reuse the same operator truth from OpenClaw | MCP | strongest fit when you want jobs, retrieval, artifacts, and watchlists through the shared agent doorway |
| call SourceHarbor from OpenClaw-managed tools or scripts | `@sourceharbor/sdk` | typed HTTP client over the same public contract |
| do quick command-line inspection | `@sourceharbor/cli` | thin shell doorway into search, Ask, jobs, and templates |
| manage the full runtime in a local clone | `./bin/sourceharbor` | repo-local operator/runtime commands stay in the checkout |

## Fastest Path

1. Read [docs/mcp-quickstart.md](../mcp-quickstart.md).
2. Use `starter-packs/openclaw/` as the local starter-pack directory in your
   normal OpenClaw local-plugin or workspace-skill flow.
3. If you need a full SourceHarbor stack first, follow
   [docs/start-here.md](../start-here.md).

## Public Starter Assets

- [starter-packs/openclaw/README.md](../../starter-packs/openclaw/README.md)
- [starter-packs/openclaw/openclaw.plugin.json](../../starter-packs/openclaw/openclaw.plugin.json)
- [starter-packs/openclaw/skills/sourceharbor-watchlist-briefing/SKILL.md](../../starter-packs/openclaw/skills/sourceharbor-watchlist-briefing/SKILL.md)
- [starter-packs/openclaw/sourceharbor-mcp-template.json](../../starter-packs/openclaw/sourceharbor-mcp-template.json)
- [templates/public-skills/openclaw/sourceharbor-watchlist-briefing.md](../../templates/public-skills/openclaw/sourceharbor-watchlist-briefing.md)

## Honest Boundary

- OpenClaw is now a **first-cut local starter-pack fit** through MCP + HTTP API
  plus the new public starter layer.
- This does **not** mean SourceHarbor ships a registry-published OpenClaw
  plugin today.
- This does **not** mean SourceHarbor ships an OpenClaw plugin marketplace.
- This still does **not** turn internal `.agents/skills` into a public support
  promise.
