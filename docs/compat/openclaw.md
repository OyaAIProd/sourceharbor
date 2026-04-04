# OpenClaw Compatibility

This is the shortest honest OpenClaw adoption path for SourceHarbor.

## Pick Your Door

| If you want to... | Use this | Why |
| --- | --- | --- |
| reuse the same operator truth from OpenClaw | MCP | strongest fit when you want jobs, retrieval, artifacts, and watchlists through the shared agent doorway |
| call SourceHarbor from OpenClaw-managed tools or scripts | `@sourceharbor/sdk` | typed HTTP client over the same public contract |
| do quick command-line inspection | `@sourceharbor/cli` | thin shell doorway into search, Ask, jobs, and templates |
| manage the full runtime in a local clone | `./bin/sourceharbor` | repo-local operator/runtime commands stay in the checkout |
| seed one OpenClaw skill first | `examples/openclaw/skills/sourceharbor-watchlist-briefing/SKILL.md` | public OpenClaw-shaped skill example without exposing repo-private `.agents/skills` |

## Fastest Path

1. Read [docs/mcp-quickstart.md](../mcp-quickstart.md).
2. If OpenClaw is already talking to MCP or HTTP tools, start with MCP first and keep the API as the fallback path.
3. If you want a public OpenClaw-shaped skill file, start from [examples/openclaw/skills/sourceharbor-watchlist-briefing/SKILL.md](../../examples/openclaw/skills/sourceharbor-watchlist-briefing/SKILL.md).
4. If you need the full local stack, follow [docs/start-here.md](../start-here.md).

## Public Starter Assets

- [starter-packs/openclaw/README.md](../../starter-packs/openclaw/README.md)
- [starter-packs/openclaw/sourceharbor-mcp-template.json](../../starter-packs/openclaw/sourceharbor-mcp-template.json)
- [templates/public-skills/openclaw/sourceharbor-watchlist-briefing.md](../../templates/public-skills/openclaw/sourceharbor-watchlist-briefing.md)
- [examples/openclaw/README.md](../../examples/openclaw/README.md)
- [examples/openclaw/skills/sourceharbor-watchlist-briefing/SKILL.md](../../examples/openclaw/skills/sourceharbor-watchlist-briefing/SKILL.md)

## Honest Boundary

- OpenClaw is now a **first-cut compatibility path** through MCP + HTTP API + the new public starter/skill example layer.
- This does **not** mean SourceHarbor ships a registry-published OpenClaw plugin today.
- This does **not** mean SourceHarbor ships an OpenClaw plugin marketplace.
- This does **not** turn internal `.agents/skills` into a public support promise.
