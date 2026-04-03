# Project Status

This page is the shortest truthful answer to:

- what is already real in SourceHarbor
- what is still gated by external dependencies
- what is sample or local-only proof
- what is future direction rather than current capability

Use it like a status board, not like a sales page.

If you need the exhaustive ledger instead of the short board, read
[2026-03-31-program-closeout-matrix.md](./blueprints/2026-03-31-program-closeout-matrix.md).

Release-current truth is a separate ledger from current remote `main`.
Always verify the latest live tag together with the current remote head before
repeating any “release-aligned” claim, because docs/governance closeout commits
can move `main` forward again after a release is cut.

## Current Program State

SourceHarbor is already a real, source-first product-shaped repository.

It has:

- local first-run and doctor flows
- a thin repo-local CLI facade over the existing `bin/*` entrypoints
- Search, story-aware briefing-backed Ask, shared-story Briefings, MCP, and Ops front doors
- strong-supported YouTube/Bilibili intake plus generalized RSSHub/RSS source intake templates
- watchlists, merged stories, trends, briefings, bundles, and a sample playground
- proof and runtime-truth surfaces that explain where confidence comes from

What it does **not** have today:

- a hosted workspace promise
- autopilot product claims
- a separately packaged public CLI or public SDK
- public Skills or plugin-marketplace distribution as a shipped surface
- live external notification proof without sender configuration
- universal no-secret proof for Gemini-backed lanes
- route-by-route verification across the full RSSHub universe

## Verified And Ready

These are the strongest current claims:

- **First-run base path:** `./bin/bootstrap-full-stack`, `./bin/full-stack up`, `./bin/doctor`, and the runtime route snapshot under `.runtime-cache/run/full-stack/resolved.env`
- **CLI substrate:** existing `bin/*` entrypoints are now discoverable through `./bin/sourceharbor help`, while still remaining repo-local rather than a packaged public CLI
- **Local write-route contract:** direct write APIs can be exercised with the local dev token path instead of pretending auth is an unresolved product gap
- **Source intake contract:** strong-supported YouTube/Bilibili templates plus generalized RSSHub/RSS substrate without overclaiming full-universe proof, with the `/subscriptions` front door now consuming the same template catalog exposed through API and MCP
- **Front doors:** `/search`, `/ask` (story-aware, briefing-backed answer/change/evidence flow with truthful raw-retrieval fallback, selected-story drill-down, and a server-owned story page payload that now reuses one canonical selected-story object from Briefings), `/briefings` (server-owned briefing page payload for selected story, compare route, and Ask handoff), `/mcp`, `/ops`, `/subscriptions`
- **Compounder layer:** `/watchlists`, `/trends` (merged stories + recent evidence), `/briefings` (summary -> differences -> evidence for one watchlist, now with one shared selected-story payload that carries forward into Ask), `/playground`, and `GET /api/v1/jobs/{job_id}/bundle`
- **Truth surfaces:** [proof.md](./proof.md), [runtime-truth.md](./runtime-truth.md), [start-here.md](./start-here.md), [testing.md](./testing.md)

## Implemented But Still Gated

These surfaces are real, but their strongest proof still depends on external conditions:

| Surface | Current truth | Gate |
| --- | --- | --- |
| Notifications / reports | implemented routes and settings exist | verified sender configuration, especially `RESEND_FROM_EMAIL`, plus a target mailbox |
| UI audit Gemini review | base audit is real and the maintainer env has local Gemini proof | other environments still need Gemini access if they want the review layer |
| Computer use | contract and service exist, and the maintainer env can reach the provider | valid Gemini access, supported account capability, and a real screenshot/input contract |
| Long live smoke | repo path exists, the repo-managed `bootstrap -> up -> status -> doctor` path was re-proven again, and the short smoke path now passes under the current maintainer env | the strict live-smoke lane still hits a provider-side `quota_or_permission` / `403` response for the current YouTube key/project |

## Sample And Local-Proof Boundaries

These are intentionally **not** live hosted proof:

- [samples/README.md](./samples/README.md)
- `/playground`
- seeded local watchlist / trend / bundle proofs used for Wave 3 validation

Safe interpretation:

- they prove the product shape and local runtime path
- they do **not** prove remote production traffic, hosted delivery, or current release distribution

## Future Directions, Not Current Capability

Two directions remain explicitly in the bet bucket:

| Direction | Current decision |
| --- | --- |
| Agent Autopilot / advanced agent workflows | human-in-the-loop spike is worth considering; product claim is not |
| Hosted / managed workspace | no-go for current positioning; only a small hosted-shaped evaluation slice is worth reconsidering later |

Read the spike artifacts:

- [Program Closeout Matrix](./blueprints/2026-03-31-program-closeout-matrix.md)
- [Agent Autopilot Spike](./blueprints/2026-03-31-agent-autopilot-spike.md)
- [Hosted Readiness Spike](./blueprints/2026-03-31-hosted-readiness-spike.md)
- [Ecosystem And Big-Bet Decisions](./reference/ecosystem-and-big-bet-decisions.md)

## Ecosystem And Big-Bet Buckets

This is the short scoreboard for the directions most likely to get overstated.

| Track | Current bucket | Why now |
| --- | --- | --- |
| Codex / Claude Code via MCP + HTTP API | **ship-now** | the repo already has real MCP, API, search, ask, and job-trace surfaces |
| Repo-local CLI/help facade | **ship-now** | `./bin/sourceharbor` is already a truthful discoverability layer over `bin/*` |
| Packaged public CLI | **later** | the repo-local CLI is real, but the external package contract should stay thin until the builder contract is quieter |
| Public TypeScript SDK | **later** | shared client/types exist, but they are still repo-internal substrate rather than a frozen external package |
| Public Python SDK | **later** | no public package surface exists yet |
| Public skills pack / templates | **later** | the fit story is real, but the repo does not yet ship a packaged public skills surface |
| Plugin / extension marketplace | **no-go now** | plugin-first positioning would overstate the current repo truth |
| Agent Autopilot (approval-first research ops) | **spike-only** | only the approval-first research-ops slice is worth reopening |
| Full autonomous autopilot | **no-go now** | approval, rollback, identity, and provider readiness are not strong enough |
| Thin managed evaluation slice | **later** | only a narrow managed bridge is worth reconsidering after current proof boundaries stay intact |
| Full hosted workspace | **no-go now** | multi-tenant auth, custody, isolation, and support contracts are not ready |
| Growth / moat thesis | **ship-now** | the current moat is the proof-first control tower story plus reusable compounder surfaces, not hosted scale or plugin sprawl |

## External Blockers

These are the genuine external or human-only dependencies still left after the
current maintainer re-audit:

- Resend live delivery still needs a real sender identity chain: `RESEND_FROM_EMAIL`, a verified sender/domain, and a destination mailbox
- the strict YouTube live-smoke lane still needs a key/project/quota/policy state that no longer returns `quota_or_permission` / `403`

Raw non-empty values for `YOUTUBE_API_KEY`, `RESEND_API_KEY`, and
`GEMINI_API_KEY` are no longer the main blocker story on the maintainer
machine. The remaining blockers are more specific than "secret missing".

### Exact External Action Pack

| Blocker | Freshly verified state | Why this is external/human-only | Exact action |
| --- | --- | --- | --- |
| Resend sender identity | maintainer-side provider canary still reports `config_error`; `RESEND_API_KEY` is present on the maintainer machine, but `RESEND_FROM_EMAIL` is still missing | repo code already exposes notifications and settings; GitHub/release truth is no longer the missing piece | set `RESEND_FROM_EMAIL`, verify the sender/domain in Resend, choose a real destination mailbox, then rerun the provider canary or strict live-smoke lane |
| YouTube strict live-smoke | maintainer-side provider canary still reports `auth/http_error:403`; the current response says YouTube Data API v3 has not been used in or enabled for Google project `1025401548407` | this is a Google project/API/quota/policy gate, not a repo-local implementation gap | confirm YouTube Data API v3 is enabled for project `1025401548407`, confirm the current key is attached to that project, wait for propagation if it was just enabled, then rerun the strict live-smoke lane |

## Remote Truth Snapshot

Fresh GitHub-side verification now shows:

- current `main` now includes the landed shared-story and JK front-door consolidation
- current `main` has fresh successful `ci`, `pre-commit`, `codeql`, and `CodeQL` runs
- the latest successful `build-ci-standard-image` and `release-evidence-attest` workflow_dispatch runs now align with the current remote `main` instead of an older head
- latest-release truth must still be checked live against the current remote `main`, because post-release docs/governance closeouts can move `main` ahead again before the next tag is cut
- live provider proof still stays a separate ledger from GitHub/release proof
- the story-aware `/ask`, `/briefings`, `/subscriptions`, `/watchlists`, and `/trends` front-door line is now part of remote `main`
- live repo description, homepage, topics, and discussions now match `config/public/github-profile.json` for the current remote `main`

## Read Next

- [README.md](../README.md)
- [start-here.md](./start-here.md)
- [proof.md](./proof.md)
- [runtime-truth.md](./runtime-truth.md)
- [testing.md](./testing.md)
