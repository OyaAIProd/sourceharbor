<!-- generated: docs governance control plane -->
# Required Checks

These are the repository-local merge gates currently declared in GitHub Actions workflows and mirrored by branch protection.

| Check | Workflow | Why it exists |
| --- | --- | --- |
| `python-tests` | `ci.yml` | Verifies API, worker, and MCP Python surfaces with the documented in-memory SQLite test path. |
| `web-lint` | `ci.yml` | Keeps the web command center lint-clean. |
| `pre-commit` | `pre-commit.yml` | Runs the all-files hygiene gate for YAML, secrets, Ruff, Biome, Markdown, ShellCheck, and Actionlint. |
