# Public Proof

SourceHarbor should not rely on vibes, adjectives, or hidden test folders to justify its public story.

This page defines the public proof ladder.

It is the evidence map for human readers. It is not a machine-rendered current verdict page, and it should not be read as a substitute for commit-sensitive runtime reports.

## Proof Layer 1: Product Surface

These prove that the public narrative maps to visible product surfaces:

- [README.md](../README.md)
- [docs/start-here.md](./start-here.md)
- [docs/architecture.md](./architecture.md)
- the web command center routes
- the API route map
- the MCP tool map

What this layer answers:

- What does SourceHarbor do?
- What can a new operator see?
- What surfaces exist for humans and agents?

## Proof Layer 2: Runnable Local Evidence

These prove that the repo is not just presentation:

```bash
curl -sS http://127.0.0.1:9000/healthz
python3 scripts/governance/check_env_contract.py --strict
python3 scripts/governance/check_test_assertions.py
npm --prefix apps/web run lint
./bin/smoke-full-stack --offline-fallback 0
```

What this layer answers:

- Does the stack boot locally?
- Are the public contracts wired?
- Are tests and lint gates meaningful?

## Proof Layer 3: Runtime Artifact Evidence

These prove that a pipeline run leaves inspectable evidence behind:

- `GET /api/v1/jobs/{job_id}`
- `GET /api/v1/feed/digests`
- `POST /api/v1/retrieval/search`
- artifact references exposed by job payloads
- step summaries, degradations, and notification retry details

What this layer answers:

- What happened in a run?
- Where did a digest come from?
- Can an operator inspect failure, degradation, and retry state?

## Proof Layer 4: Release And Remote Evidence

This layer is stricter:

- GitHub Actions on the current `main`
- published releases
- release notes and changelog
- any remote or external distribution proof attached to a release
- live GitHub profile settings such as description, homepage, topics, discussions, and uploaded social preview state

What this layer answers:

- Can the current public branch back up external distribution claims?
- Is the release surface active and legible?
- Do the live GitHub profile settings still match the tracked repo intent?

## What Counts As Publicly Honest

These are fair claims:

- SourceHarbor is a source-first engineering repository
- SourceHarbor exposes API, MCP, web, and worker surfaces
- SourceHarbor can be run locally and inspected end to end
- SourceHarbor has step-level job evidence and artifact access

These require stronger evidence:

- production-ready hosted service
- turnkey managed deployment
- externally verified distribution on every release
- live GitHub profile settings applied and verified against `config/public/github-profile.json`

Tracked manifests and public presentation assets are inputs to this layer, not proof on their own.

For the tracked render-only pointer into the external lane, see [docs/generated/external-lane-truth-entry.md](./generated/external-lane-truth-entry.md). That page is a signpost, not the verdict.

Historical plans under `.agents/Plans/` are archived execution context only. They can explain how the repo arrived here, but they must not be treated as the current public truth for SourceHarbor.

## Short Version

SourceHarbor can be boldly presented, but it must stay truthful:

- **sell the result first**
- **show the proof right after**
- **never swap local proof for remote proof**
