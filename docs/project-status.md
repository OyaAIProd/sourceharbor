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
- a packaged public CLI bridge that delegates into that repo-local substrate
- a first public TypeScript SDK over the HTTP contract
- public compatibility docs, starter prompts, and examples for Codex / Claude Code builders
- Search, story-aware briefing-backed Ask, shared-story Briefings, MCP, and Ops front doors
- strong-supported YouTube/Bilibili intake plus generalized RSSHub/RSS source intake templates
- watchlists, merged stories, trends, briefings, bundles, and a sample playground
- proof and runtime-truth surfaces that explain where confidence comes from

What it does **not** have today:

- a hosted workspace promise
- autopilot product claims
- live external notification proof without sender configuration
- universal no-secret proof for Gemini-backed lanes
- route-by-route verification across the full RSSHub universe

## Verified And Ready

These are the strongest current claims:

- **First-run base path:** `./bin/bootstrap-full-stack`, `./bin/full-stack up`, `./bin/doctor`, and the runtime route snapshot under `.runtime-cache/run/full-stack/resolved.env`
- **CLI surfaces:** existing `bin/*` entrypoints remain the repo-local command truth, while `packages/sourceharbor-cli` adds a thin installable bridge for public discovery and starter flows
- **Public TypeScript SDK:** `packages/sourceharbor-sdk` now exposes a thin contract-first SDK over the same HTTP contract and shared route semantics
- **Public starter surface:** `starter-packs/` is the public entry directory, while `docs/public-skills.md`, `docs/compat/*`, `templates/public-skills/*`, and `examples/*` act as companion first-cut starter assets without exposing internal `.agents/skills`
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
| Long live smoke | repo path exists, the repo-managed `bootstrap -> up -> status -> doctor` path was re-proven again, the short smoke path now passes under the current maintainer env, and secure YouTube key rotation found one winner that clears direct probe plus strict preflight | the full end-to-end live receipt still depends on keeping that validated winner key in the shared operator environment and reopening the intentionally deferred Resend sender-identity lane |

## Sample And Local-Proof Boundaries

These are intentionally **not** live hosted proof:

- [samples/README.md](./samples/README.md)
- `/playground`
- seeded local watchlist / trend / bundle proofs used for seeded local validation

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
| Packaged public CLI bridge | **ship-now** | `packages/sourceharbor-cli` is now the installable public bridge, while the fuller repo-local operator CLI remains `./bin/sourceharbor` |
| Public TypeScript SDK | **ship-now** | `packages/sourceharbor-sdk` now exposes the contract-first builder layer over the existing HTTP contract |
| Public Python SDK | **later** | no public package surface exists yet |
| Public skills pack / templates | **first-cut** | `docs/public-skills.md`, `docs/compat/*`, `templates/public-skills/*`, and `examples/*` now provide a usable first public starter surface, but not a fully hardened ecosystem product yet |
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
- the strict YouTube live-smoke lane now has one validated winner key, but the shared operator environment still needs that winner persisted before the full live lane is reopened

Raw non-empty values for `YOUTUBE_API_KEY`, `RESEND_API_KEY`, and
`GEMINI_API_KEY` are no longer the main blocker story on the maintainer
machine. The remaining blockers are more specific than "secret missing".

### Exact External Action Pack

| Blocker | Freshly verified state | Why this is external/human-only | Exact action |
| --- | --- | --- | --- |
| Resend sender identity | maintainer-side provider canary still reports `config_error`; `RESEND_API_KEY` is present on the maintainer machine, but `RESEND_FROM_EMAIL` is still missing | repo code already exposes notifications and settings; GitHub/release truth is no longer the missing piece | set `RESEND_FROM_EMAIL`, verify the sender/domain in Resend, choose a real destination mailbox, then rerun the provider canary or strict live-smoke lane |
| YouTube strict live-smoke | secure rotation on 2026-04-03 found one user-supplied winner key that now passes direct probe, provider canary, and strict live-smoke preflight; the previously configured key still points at blocked Google project states | repo-side implementation is no longer the blocker; the remaining action is keeping the validated project-bound key in the operator environment and rerunning the full live lane when needed | replace the stale local YouTube key with the validated winner key in the operator secret store, then rerun the strict live-smoke lane if you want the full end-to-end receipt |

## Remote Truth Reading Rules

Fresh GitHub-side verification must be rerun against the current remote head
whenever `main` moves again. The safe reading rules are:

- treat current `main`, latest release, and workflow-dispatch evidence as separate ledgers
- only treat GitHub checks and workflow-dispatch runs as current remote proof when their recorded `headSha` still matches the current remote head
- workflow-dispatch lanes such as standard-image publish or release attestation may require repo-scope environment approval, but they now run successfully on the current `main` when approved
- latest-release truth must still be checked live against the current remote `main`, because post-release docs/governance closeouts can move `main` ahead again before the next tag is cut
- live GitHub description, homepage, topics, and discussions should be checked live against `config/public/github-profile.json` before repeating the claim
- live provider proof still stays a separate ledger from GitHub/release proof

## Read Next

- [README.md](../README.md)
- [start-here.md](./start-here.md)
- [proof.md](./proof.md)
- [runtime-truth.md](./runtime-truth.md)
- [testing.md](./testing.md)
