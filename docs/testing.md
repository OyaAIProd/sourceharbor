# Testing

SourceHarbor uses layered verification.

Think of it like product evidence in layers:

1. **Fast checks** catch broken contracts and fake tests
2. **Core suites** verify Python surfaces and shared behavior
3. **Full-stack smoke** proves the operator path end to end

## Fast Local Checks

```bash
python3 scripts/governance/check_env_contract.py --strict
python3 scripts/governance/check_test_assertions.py
npm --prefix apps/web run lint
```

What they cover:

- environment contract drift
- placebo test detection
- web lint regressions

## Core Python Test Suite

```bash
bash scripts/ci/python_tests.sh
```

What it covers:

- API services and routers
- worker pipeline logic
- MCP tool contracts

## Full-Stack Smoke

```bash
./bin/bootstrap-full-stack
./bin/full-stack up
./bin/smoke-full-stack --offline-fallback 0
```

What it proves:

- the local stack can boot
- the main runtime surfaces can talk to each other
- the public quickstart story is grounded in runnable commands

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

Think of them like specialist inspectors after the core exam:

- the required path proves the repo is locally honest and rerunnable
- the advisory or external lanes prove harder claims when you actually need them
- publication or attestation happens only after an owner deliberately opens that lane and approves the protected environment

## Public-Proof Boundary

- Passing local checks means the repo is locally credible.
- It does **not** mean a hosted or remote distribution claim is automatically proven for the current `main`.

For the public evidence ladder, read [proof.md](./proof.md).
