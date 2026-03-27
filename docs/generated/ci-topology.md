<!-- generated: docs governance control plane -->
# CI Topology

Current merge-relevant CI in this repository is intentionally small and local-proof-first.

- root allowlist entries: `40`
- runtime root: `.runtime-cache`
- CI jobs in `.github/workflows/ci.yml`: `python-tests`, `web-lint`
- Pre-commit workflow jobs in `.github/workflows/pre-commit.yml`: `pre-commit`
- canonical python-tests command: `bash scripts/ci/python_tests.sh`
- pre-push mirrors the same python-tests command before web lint.
- GHCR image publish workflow runs on `ubuntu-latest` and sets up Docker Buildx before calling `scripts/ci/build_standard_image.sh`
- release evidence attestation stays in `.github/workflows/release-evidence-attest.yml`.
