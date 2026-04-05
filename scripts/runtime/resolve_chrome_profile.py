#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import os
import shlex
import sys
from pathlib import Path
from typing import Any


def _env_value(name: str) -> str:
    raw = os.getenv(name)
    return raw.strip() if raw and raw.strip() else ""


def _read_local_state(user_data_dir: Path) -> dict[str, Any]:
    local_state_path = user_data_dir / "Local State"
    if not local_state_path.is_file():
        raise RuntimeError(f"Chrome Local State missing: {local_state_path}")
    try:
        payload = json.loads(local_state_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError, UnicodeDecodeError) as exc:
        raise RuntimeError(f"unable to parse Chrome Local State: {exc}") from exc
    if not isinstance(payload, dict):
        raise RuntimeError("Chrome Local State must be a JSON object")
    return payload


def _profile_info_cache(user_data_dir: Path) -> dict[str, Any]:
    payload = _read_local_state(user_data_dir)
    profile = payload.get("profile") or {}
    if not isinstance(profile, dict):
        raise RuntimeError("Chrome Local State missing profile section")
    info_cache = profile.get("info_cache") or {}
    if not isinstance(info_cache, dict):
        raise RuntimeError("Chrome Local State missing profile.info_cache")
    return info_cache


def _resolve_profile_dir_from_name(user_data_dir: Path, profile_name: str) -> str:
    target_name = profile_name.strip().lower()
    if not target_name:
        raise RuntimeError("SOURCE_HARBOR_CHROME_PROFILE_NAME is empty")
    matches: list[str] = []
    for profile_dir, payload in _profile_info_cache(user_data_dir).items():
        if not isinstance(payload, dict):
            continue
        display_name = str(payload.get("name") or "").strip().lower()
        if display_name == target_name:
            matches.append(str(profile_dir))
    if not matches:
        raise RuntimeError(
            f"unable to resolve Chrome profile name `{profile_name}` under {user_data_dir}"
        )
    if len(matches) > 1:
        raise RuntimeError(
            f"Chrome profile name `{profile_name}` is ambiguous under {user_data_dir}: {', '.join(matches)}"
        )
    return matches[0]


def resolve_chrome_profile(
    *,
    user_data_dir: str,
    profile_name: str,
    profile_dir: str,
) -> dict[str, str]:
    resolved_profile_dir = profile_dir.strip()
    resolved_user_data_dir = user_data_dir.strip()

    if resolved_profile_dir:
        profile_path = Path(resolved_profile_dir).expanduser()
        if profile_path.is_absolute():
            if not profile_path.is_dir():
                raise RuntimeError(f"Chrome profile path does not exist: {profile_path}")
            resolved_user_data_dir = str(profile_path.parent)
            resolved_profile_dir = profile_path.name
        else:
            if not resolved_user_data_dir:
                raise RuntimeError(
                    "SOURCE_HARBOR_CHROME_USER_DATA_DIR is required when SOURCE_HARBOR_CHROME_PROFILE_DIR is relative"
                )
            user_data_path = Path(resolved_user_data_dir).expanduser()
            if not user_data_path.is_dir():
                raise RuntimeError(f"Chrome user data dir does not exist: {user_data_path}")
            profile_path = user_data_path / resolved_profile_dir
            if not profile_path.is_dir():
                raise RuntimeError(f"Chrome profile dir does not exist: {profile_path}")
            resolved_user_data_dir = str(user_data_path)
    else:
        if not resolved_user_data_dir:
            raise RuntimeError("SOURCE_HARBOR_CHROME_USER_DATA_DIR is required")
        user_data_path = Path(resolved_user_data_dir).expanduser()
        if not user_data_path.is_dir():
            raise RuntimeError(f"Chrome user data dir does not exist: {user_data_path}")
        resolved_profile_dir = _resolve_profile_dir_from_name(user_data_path, profile_name)
        profile_path = user_data_path / resolved_profile_dir
        resolved_user_data_dir = str(user_data_path)

    return {
        "chrome_channel": "chrome",
        "user_data_dir": resolved_user_data_dir,
        "profile_dir": resolved_profile_dir,
        "profile_path": str(profile_path),
    }


def _shell_exports(payload: dict[str, str]) -> str:
    lines = []
    for key, value in (
        ("SOURCE_HARBOR_CHROME_CHANNEL", payload["chrome_channel"]),
        ("SOURCE_HARBOR_CHROME_USER_DATA_DIR", payload["user_data_dir"]),
        ("SOURCE_HARBOR_CHROME_PROFILE_DIR", payload["profile_dir"]),
        ("SOURCE_HARBOR_CHROME_PROFILE_PATH", payload["profile_path"]),
    ):
        lines.append(f"export {key}={shlex.quote(value)}")
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Resolve the repo-configured real Chrome profile for local-only login-dependent browser flows."
    )
    parser.add_argument("--user-data-dir", default=_env_value("SOURCE_HARBOR_CHROME_USER_DATA_DIR"))
    parser.add_argument("--profile-name", default=_env_value("SOURCE_HARBOR_CHROME_PROFILE_NAME"))
    parser.add_argument("--profile-dir", default=_env_value("SOURCE_HARBOR_CHROME_PROFILE_DIR"))
    parser.add_argument("--json", action="store_true")
    parser.add_argument("--shell-exports", action="store_true")
    args = parser.parse_args()

    try:
        payload = resolve_chrome_profile(
            user_data_dir=args.user_data_dir,
            profile_name=args.profile_name,
            profile_dir=args.profile_dir,
        )
    except RuntimeError as exc:
        print(f"[resolve-chrome-profile] FAIL\n  - {exc}", file=sys.stderr)
        return 1

    if args.json:
        print(json.dumps(payload, ensure_ascii=False, indent=2))
    elif args.shell_exports:
        print(_shell_exports(payload))
    else:
        print(payload["profile_path"])
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
