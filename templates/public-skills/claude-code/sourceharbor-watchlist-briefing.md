# SourceHarbor Claude Code Starter

Use this prompt when you want Claude Code to work against a running SourceHarbor
instance without any private repo-only context.

## Goal

Take a watchlist or question and return:

1. a grounded answer
2. recent changes
3. supporting citations
4. the best next hop for a human operator

## Inputs

- `SOURCEHARBOR_API_BASE_URL`
- optional `SOURCEHARBOR_API_KEY`
- `watchlist_id`, `story_id`, or free-text `question`

## Recommended Path

1. Prefer MCP when you want governed agent access.
2. Otherwise use `@sourceharbor/sdk` or `@sourceharbor/cli`.
3. Keep the output source-first and evidence-first.

## Must Do

- use SourceHarbor routes and citations as the truth source
- preserve the difference between grounded and limited answers
- hand the human operator a concrete next step

## Must Not Do

- do not turn internal repo history into public proof
- do not market hosted, autopilot, or plugin features as current reality
