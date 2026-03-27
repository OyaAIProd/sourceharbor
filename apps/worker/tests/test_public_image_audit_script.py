from __future__ import annotations

import importlib.util
from pathlib import Path

import pytest


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[3]


def _load_module():
    script_path = _repo_root() / "scripts" / "governance" / "audit_public_images_with_gemini.py"
    spec = importlib.util.spec_from_file_location("audit_public_images_with_gemini", script_path)
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_resolve_report_path_accepts_repo_relative_location() -> None:
    module = _load_module()

    resolved = module.resolve_report_path(".runtime-cache/reports/governance/custom.json")

    assert (
        resolved
        == (_repo_root() / ".runtime-cache" / "reports" / "governance" / "custom.json").resolve()
    )


@pytest.mark.parametrize("candidate", ["/tmp/public-image-audit.json", "../outside.json"])
def test_resolve_report_path_rejects_escape(candidate: str) -> None:
    module = _load_module()

    with pytest.raises(ValueError, match="repo root"):
        module.resolve_report_path(candidate)
