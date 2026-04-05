from __future__ import annotations

import importlib.util
import json
from pathlib import Path

import pytest


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[3]


def _load_module():
    module_path = _repo_root() / "scripts" / "runtime" / "resolve_chrome_profile.py"
    spec = importlib.util.spec_from_file_location("resolve_chrome_profile", module_path)
    assert spec is not None
    assert spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_resolve_chrome_profile_by_display_name(tmp_path: Path) -> None:
    module = _load_module()
    user_data_dir = tmp_path / "Chrome"
    profile_dir = user_data_dir / "Profile 27"
    profile_dir.mkdir(parents=True)
    (user_data_dir / "Local State").write_text(
        json.dumps(
            {
                "profile": {
                    "info_cache": {
                        "Profile 27": {
                            "name": "sourceharbor",
                            "user_name": "xiao176jiou@gmail.com",
                        }
                    }
                }
            }
        ),
        encoding="utf-8",
    )

    payload = module.resolve_chrome_profile(
        user_data_dir=str(user_data_dir),
        profile_name="sourceharbor",
        profile_dir="",
    )

    assert payload["chrome_channel"] == "chrome"
    assert payload["user_data_dir"] == str(user_data_dir)
    assert payload["profile_dir"] == "Profile 27"
    assert payload["profile_path"] == str(profile_dir)


def test_resolve_chrome_profile_prefers_explicit_profile_dir(tmp_path: Path) -> None:
    module = _load_module()
    profile_path = tmp_path / "Profile 42"
    profile_path.mkdir(parents=True)

    payload = module.resolve_chrome_profile(
        user_data_dir="",
        profile_name="",
        profile_dir=str(profile_path),
    )

    assert payload["user_data_dir"] == str(tmp_path)
    assert payload["profile_dir"] == "Profile 42"
    assert payload["profile_path"] == str(profile_path)


def test_resolve_chrome_profile_fails_when_name_missing(tmp_path: Path) -> None:
    module = _load_module()
    user_data_dir = tmp_path / "Chrome"
    user_data_dir.mkdir(parents=True)
    (user_data_dir / "Local State").write_text(
        json.dumps({"profile": {"info_cache": {"Default": {"name": "other"}}}}),
        encoding="utf-8",
    )

    with pytest.raises(RuntimeError, match="unable to resolve Chrome profile name"):
        module.resolve_chrome_profile(
            user_data_dir=str(user_data_dir),
            profile_name="sourceharbor",
            profile_dir="",
        )
