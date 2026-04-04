#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

SOURCEHARBOR_API_BASE_URL="${SOURCEHARBOR_API_BASE_URL:-http://127.0.0.1:9000}" \
node "$ROOT_DIR/packages/sourceharbor-cli/bin/sourceharbor.js" search "agent workflows"
