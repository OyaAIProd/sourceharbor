# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project follows semantic-ish release communication even when the repository is still evolving.

## [Unreleased]

### Added

- first-run doctor and operator diagnostics surfaces for local runtime truth
- watchlists and cross-run trend pages for persistent tracking
- job evidence bundle export for internal reuse and async collaboration
- read-only sample corpus and playground surfaces
- truthful use-case landing pages for YouTube, Bilibili, RSS, MCP, and research pipeline discovery

### Changed

- docs governance now treats `pre-commit` as a first-class required check and stops misreading workflow event rows as branch-protection checks
- hosted GHCR publish lanes now prefer the repository-scoped `GITHUB_TOKEN` path for login and SBOM registry auth in current workspace fixes
- release evidence readiness now fail-closes on rollback gate drift, invalid rollback drill evidence, and failing required prechecks instead of checking file presence alone
- rollback guidance now documents the destructive `content_type` down migration path as schema-restoring rather than lossless

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
