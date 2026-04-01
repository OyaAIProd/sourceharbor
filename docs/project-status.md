# Project Status

This page is the shortest truthful answer to:

- what is already real in SourceHarbor
- what is still gated by external dependencies
- what is sample or local-only proof
- what is future direction rather than current capability

Use it like a status board, not like a sales page.

If you need the exhaustive ledger instead of the short board, read
[2026-03-31-program-closeout-matrix.md](./blueprints/2026-03-31-program-closeout-matrix.md).

## Current Program State

SourceHarbor is already a real, source-first product-shaped repository.

It has:

- local first-run and doctor flows
- Search, Ask, MCP, and Ops front doors
- watchlists, trends, bundles, and a sample playground
- proof and runtime-truth surfaces that explain where confidence comes from

What it does **not** have today:

- a hosted workspace promise
- autopilot product claims
- live external notification proof without sender configuration
- universal no-secret proof for Gemini-backed lanes

## Verified And Ready

These are the strongest current claims:

- **First-run base path:** `./bin/bootstrap-full-stack`, `./bin/full-stack up`, `./bin/doctor`, and the runtime route snapshot under `.runtime-cache/run/full-stack/resolved.env`
- **Local write-route contract:** direct write APIs can be exercised with the local dev token path instead of pretending auth is an unresolved product gap
- **Front doors:** `/search`, `/ask`, `/mcp`, `/ops`
- **Compounder layer:** `/watchlists`, `/trends`, `/playground`, and `GET /api/v1/jobs/{job_id}/bundle`
- **Truth surfaces:** [proof.md](./proof.md), [runtime-truth.md](./runtime-truth.md), [start-here.md](./start-here.md), [testing.md](./testing.md)

## Implemented But Still Gated

These surfaces are real, but their strongest proof still depends on external conditions:

| Surface | Current truth | Gate |
| --- | --- | --- |
| Notifications / reports | implemented routes and settings exist | verified sender configuration, especially `RESEND_FROM_EMAIL`, plus a target mailbox |
| UI audit Gemini review | base audit is real and the maintainer env has local Gemini proof | other environments still need Gemini access if they want the review layer |
| Computer use | contract and service exist, and the maintainer env can reach the provider | valid Gemini access, supported account capability, and a real screenshot/input contract |
| Long live smoke | repo path exists and the local supervisor path was re-proven in the current maintainer env | YouTube Data API preflight / provider project enablement for the current key |

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

## External Blockers

These are the genuine external or human-only dependencies still left after the
current maintainer re-audit:

- `RESEND_FROM_EMAIL`
- a verified Resend sender/domain and a real destination mailbox
- YouTube Data API project enablement or policy approval for the strict live-smoke probe
- landing the current local closure work on remote `main` before treating the newer front-door surfaces as remote-current truth
- a new tagged release if you need release-aligned remote distribution proof for the current `main`

Raw non-empty values for `YOUTUBE_API_KEY`, `RESEND_API_KEY`, and
`GEMINI_API_KEY` are no longer the main blocker story on the maintainer
machine. The remaining blockers are more specific than \"secret missing\".

## Remote Truth Snapshot

Fresh GitHub-side verification now shows:

- current `main` (`4a59b462c6d624985b5ca5ae58c527ba95a1f0f3`) has successful `ci`, `pre-commit`, `release-evidence-attest`, and `build-ci-standard-image` runs
- latest release tag `v0.1.1` is still older than current `main`, so release proof and current-branch proof remain different layers
- the current local Prompt 6/7 front doors are still dirty local worktree state rather than remote `main`
- live repo description, homepage, and topics were re-checked and then kept on a safer remote-main wording instead of advertising those newer local-only surfaces

## Read Next

- [README.md](../README.md)
- [start-here.md](./start-here.md)
- [proof.md](./proof.md)
- [runtime-truth.md](./runtime-truth.md)
- [testing.md](./testing.md)
