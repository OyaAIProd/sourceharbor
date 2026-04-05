# Testing

SourceHarbor uses layered verification.

Think of it like product evidence in layers:

1. **Fast checks** catch broken contracts and fake tests
2. **Doctor** classifies first-run blockers before you burn time on deeper smoke
3. **Core suites** verify Python surfaces and shared behavior
4. **Supervisor clean path** proves the repo-managed operator path locally
5. **Long live smoke** extends into secret and provider gates on purpose

## Fast Local Checks

```bash
python3 scripts/governance/check_env_contract.py --strict
python3 scripts/governance/check_test_assertions.py
python3 scripts/governance/check_route_contract_alignment.py
python3 scripts/governance/check_public_entrypoint_references.py
python3 scripts/governance/check_local_private_ledger_migration.py
python3 scripts/governance/check_external_lane_contract.py
eval "$(bash scripts/ci/prepare_web_runtime.sh --shell-exports)"
( cd "$WEB_RUNTIME_WEB_DIR" && npm run lint )
python3 scripts/runtime/maintain_external_cache.py --json
```

## First-Run Doctor

```bash
./bin/doctor
```

What it tells you:

- env contract vs runtime blockers
- DB target and split-brain risk
- Temporal reachability
- API / worker / web readiness
- write-token and secret gates for live validation

What they cover:

- environment contract drift
- placebo test detection
- route and public-entrypoint contract drift
- local-private ledger migration drift
- external-lane contract drift
- web lint regressions

## Core Python Test Suite

```bash
bash scripts/ci/python_tests.sh
```

What it covers:

- API services and routers
- worker pipeline logic
- MCP tool contracts

## Supervisor Clean Path

```bash
./bin/bootstrap-full-stack
./bin/full-stack up
source .runtime-cache/run/full-stack/resolved.env
./bin/full-stack status
curl -sS "${SOURCE_HARBOR_API_BASE_URL}/healthz"
curl -I "http://127.0.0.1:${WEB_PORT}/ops"
```

What it proves:

- the repo-managed local stack can boot
- the runtime route snapshot matches the services you are actually talking to
- API, worker, and web are visible to the local supervisor
- the public quickstart story is grounded in runnable local commands

Important local-truth notes:

- do not assume `9000/3000`; bootstrap/full-stack may move to other free ports and record them in `.runtime-cache/run/full-stack/resolved.env`
- the default local Postgres path is container-first on `CORE_POSTGRES_PORT=15432`
- if your machine already has a host Postgres on `127.0.0.1:5432`, that is a different data plane from the core-services container path

## Long Live Smoke Lane

```bash
./bin/smoke-full-stack --offline-fallback 0
```

What it proves:

- the stricter live lane can run after the local supervisor path is already healthy
- YouTube, Resend, and Gemini-backed checks are wired into a repeatable command
- provider-side gates stay explicit instead of being hand-waved as local repo truth

Important boundary:

- passing the supervisor clean path means the repo is locally runnable
- passing the long live-smoke lane requires additional provider and sender conditions
- failing the long live-smoke lane does **not** automatically mean the local bootstrap/up/status path is broken

## Local-Only Login Browser Lane

GitHub-hosted CI stays login-free.

If a browser flow genuinely depends on a real signed-in Chrome session, treat it
as a **local-only** proof lane instead of a hosted CI lane.

Use the real local Chrome profile contract:

```bash
export SOURCE_HARBOR_CHROME_USER_DATA_DIR="$HOME/Library/Application Support/Google/Chrome"
export SOURCE_HARBOR_CHROME_PROFILE_NAME="${SOURCE_HARBOR_CHROME_PROFILE_NAME:-sourceharbor}"
python3 scripts/runtime/resolve_chrome_profile.py --json
bash scripts/ci/external_playwright_smoke.sh --browser chromium --real-profile --url https://example.com
```

Hosted workflows must not reference `SOURCE_HARBOR_CHROME_*` or try to reuse a
local persistent browser profile.

## Git Hooks

Install hooks with:

```bash
./bin/install-git-hooks
```

Pre-commit and pre-push should block:

- real regressions
- secret leaks
- broken public workflows

## Advisory Security And Dependency Lanes

These are repo-visible checks that help with supply-chain and long-tail risk, but they are not the same as the small merge-required path above:

- `dependency-review.yml` inspects pull-request dependency changes
- `codeql.yml` runs code scanning on the tracked languages
- `build-ci-standard-image.yml` and `release-evidence-attest.yml` stay in the external-proof lane, not the default pull-request gate
- those external lanes are `workflow_dispatch` only and run behind protected environments so ordinary pull requests never touch their secrets or publication paths
- all active GitHub workflows run on `ubuntu-latest`; local `repo-side-strict-ci`
  remains a repo-side proof command, not a self-hosted CI runner

Think of them like specialist inspectors after the core exam:

- the required path proves the repo is locally honest and rerunnable
- the advisory or external lanes prove harder claims when you actually need them
- publication or attestation happens only after an owner deliberately opens that lane and approves the protected environment

## Public-Proof Boundary

- Passing local checks means the repo is locally credible.
- It does **not** mean a hosted or remote distribution claim is automatically proven for the current `main`.

For the public evidence ladder, read [proof.md](./proof.md).
