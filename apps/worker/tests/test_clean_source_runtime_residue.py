from __future__ import annotations

import importlib.util
from pathlib import Path


def _load_module():
    script_path = (
        Path(__file__).resolve().parents[3]
        / "scripts"
        / "runtime"
        / "clean_source_runtime_residue.py"
    )
    spec = importlib.util.spec_from_file_location("clean_source_runtime_residue", script_path)
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_remove_path_ignores_file_not_found_race_for_directories(tmp_path: Path) -> None:
    module = _load_module()
    module.ROOT = tmp_path

    residue_dir = tmp_path / "pkg" / "__pycache__"
    residue_dir.mkdir(parents=True)

    def _raise_file_not_found(target: Path) -> None:
        raise FileNotFoundError(target)

    original_rmtree = module.shutil.rmtree
    try:
        module.shutil.rmtree = _raise_file_not_found
        module._remove_path("pkg/__pycache__")
    finally:
        module.shutil.rmtree = original_rmtree
