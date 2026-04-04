# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project follows semantic-ish release communication even when the repository is still evolving.

## [Unreleased]

## [0.1.5] - 2026-04-03

### Fixed

- aligned the public SDK/web URL helper boundary so the extracted SDK keeps the same route-building contract the web shell expects
- bumped the public CLI and TypeScript SDK package versions to `0.1.5` so the next release line matches the current patch-release head

## [0.1.4] - 2026-04-03

### Added

- first public builder packages under `packages/sourceharbor-cli` and `packages/sourceharbor-sdk`
- first public compatibility docs and starter packs for Codex / Claude Code under `docs/compat/*`, `docs/public-skills.md`, and `templates/public-skills/**`
- first public builder examples under `examples/cli` and `examples/sdk`

### Changed

- upgraded the builder story from repo-local-only CLI substrate to a split model: repo-local operator CLI plus thin public CLI and TypeScript SDK
- refreshed README, builders, project-status, proof, compare, start-here, see-it-fast, docs index, and GitHub profile intent to match the new thin public surfaces
- narrowed the YouTube external blocker wording from a generic hard `403` claim to an exact secure-rotation result: one validated winner key plus a remaining operator secret-rotation action

## [0.1.3] - 2026-04-03

### Changed

- tightened the durable ecosystem decision ledger so Switchyard stays explicitly out of the current cycle, alongside the existing no-go or later buckets for packaged CLI, public SDK, public Skills, and plugin-market positioning
- refreshed the README non-promises so the public front door stays aligned with the shipped repo-local CLI surface, current builder-facing truth, and the still-deferred ecosystem bets
- refreshed project-status and proof so protected-lane and release-current wording no longer stays pinned to an older pre-closeout world
- fail-closed stale upstream compat rows so aged provider receipts no longer present themselves as current verification
- registered the ecosystem decision ledger in the docs governance control plane
- marked the tracked `v0.1.2` release manifest as a historical example to match the release-artifact governance rules

## [0.1.2] - 2026-04-03

### Added

- first-run doctor and operator diagnostics surfaces for local runtime truth
- watchlists and cross-run trend pages for persistent tracking
- job evidence bundle export for internal reuse and async collaboration
- read-only sample corpus and playground surfaces
- truthful use-case landing pages for YouTube, Bilibili, RSS, MCP, and research pipeline discovery
- a thin `./bin/sourceharbor` facade that exposes the existing repo-owned `bin/*` entrypoints as one discoverable local CLI/help surface

### Changed

- docs governance now treats `pre-commit` as a first-class required check and stops misreading workflow event rows as branch-protection checks
- hosted GHCR publish lanes now prefer the repository-scoped `GITHUB_TOKEN` path for login and SBOM registry auth in current workspace fixes
- release evidence readiness now fail-closes on rollback gate drift, invalid rollback drill evidence, and failing required prechecks instead of checking file presence alone
- rollback guidance now documents the destructive `content_type` down migration path as schema-restoring rather than lossless
- builder docs now separate the truthful repo-local CLI substrate from the future packaged CLI / SDK path
- README, start-here, and MCP quickstart now expose the repo-local command surface without overclaiming a packaged public CLI

## [0.1.1] - 2026-03-26

### Added

- a result-first README that sells outcomes before governance
- layered docs entrypoints for start-here, proof, comparison, and FAQ
- public visual assets for hero, architecture, and social preview
- a GitHub profile manifest and apply script for description, topics, and discussions
- a release note categorization file for sustainable public release communication
- a no-boot product tour page for newcomers who want to evaluate the repo before setup

### Changed

- public quickstart now follows a result path instead of an installation-only path
- public proof is now treated as a dedicated evidence layer instead of being implied by test directories
- docs navigation now favors newcomer flow over deep governance-first reading
- README first screen now leads with visible result surfaces instead of a concept-only product story
