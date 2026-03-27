from __future__ import annotations

import importlib.util
from pathlib import Path


def _load_module():
    root = Path(__file__).resolve().parents[3]
    module_path = root / "scripts" / "governance" / "report_worktree_status.py"
    spec = importlib.util.spec_from_file_location("report_worktree_status", module_path)
    assert spec is not None
    assert spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_extract_declared_dirty_sets_reads_plan_sections() -> None:
    module = _load_module()
    plan_text = """
### Current Status

- current dirty sets:
  - in-scope: `README.md`, `docs/index.md`
  - out-of-scope existing drift: `config/governance/upstream-compat-matrix.json`

### Next Actions
"""

    in_scope, out_of_scope = module._extract_declared_dirty_sets(plan_text)

    assert in_scope == ["README.md", "docs/index.md"]
    assert out_of_scope == ["config/governance/upstream-compat-matrix.json"]
