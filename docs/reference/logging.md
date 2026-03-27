# Logging Contract

SourceHarbor keeps runtime and governance logs under `.runtime-cache/logs/`.

## Required Vocabulary

- `run_id`: ties together one local or CI execution.
- `trace_id`: follows a request or command through the system.
- `request_id`: identifies a single API or task request.
- `upstream_contract_surface`: marks whether an upstream interaction is `public` or `internal`.

## Channel Layout

- app logs: `.runtime-cache/logs/app`
- component logs: `.runtime-cache/logs/components`
- test logs: `.runtime-cache/logs/tests`
- governance logs: `.runtime-cache/logs/governance`
- infra logs: `.runtime-cache/logs/infra`
- upstream logs: `.runtime-cache/logs/upstreams`

## Why This Exists

The goal is simple: when a run fails, operators should be able to trace it with receipts instead of guesswork.
