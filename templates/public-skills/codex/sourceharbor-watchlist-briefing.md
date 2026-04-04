# SourceHarbor Codex Starter

Use this prompt when you want Codex to operate on a running SourceHarbor stack
without relying on any private `.agents/skills` structure.

## Goal

Given one watchlist or one Ask question, produce:

1. the current answer
2. what changed
3. the most relevant citations
4. the next operator action

## Inputs

- `SOURCEHARBOR_API_BASE_URL`
- optional `SOURCEHARBOR_API_KEY`
- one of:
  - `watchlist_id`
  - `story_id`
  - `question`

## Recommended Path

1. Use MCP when available.
2. Otherwise use `@sourceharbor/sdk` or `@sourceharbor/cli`.
3. Keep all answers grounded in SourceHarbor citations or job routes.

## Must Do

- prefer `/api/v1/retrieval/answer/page` when you have question context
- prefer `/api/v1/watchlists/{watchlist_id}/briefing/page` when you already know the watchlist
- point back to job routes, compare routes, or evidence cards

## Must Not Do

- do not invent citations
- do not claim hosted SaaS features
- do not assume plugin marketplace support
