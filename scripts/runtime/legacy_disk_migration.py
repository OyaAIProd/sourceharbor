#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
from collections import defaultdict
from datetime import UTC, datetime
from pathlib import Path
from typing import Any
from uuid import uuid4

from disk_space_common import (
    collect_legacy_compatibility,
    expand_policy_path,
    human_bytes,
    load_policy,
    parse_env_assignments,
    repo_root,
    size_bytes,
    update_env_assignments,
    write_report,
)
from report_disk_space import build_report


def _canonical_entry_map(policy: dict[str, Any]) -> dict[str, dict[str, Any]]:
    return {
        str(entry.get("name") or ""): entry
        for entry in policy.get("migration_variables", [])
        if str(entry.get("name") or "").strip()
    }


def _build_plan(root: Path, policy: dict[str, Any]) -> dict[str, Any]:
    env_path = root / ".env"
    env_assignments = parse_env_assignments(env_path)
    legacy_status = collect_legacy_compatibility(root, policy)
    variables: list[dict[str, Any]] = []
    source_to_keys: dict[str, list[str]] = defaultdict(list)
    canonical_map = _canonical_entry_map(policy)

    for name, entry in canonical_map.items():
        canonical_raw = str(entry["canonical_path"])
        target_path = expand_policy_path(canonical_raw, root=root)
        current_value = env_assignments.get(name)
        source_path = expand_policy_path(current_value, root=root) if current_value else None
        if source_path is not None:
            source_to_keys[str(source_path)].append(name)
        variables.append(
            {
                "name": name,
                "current_value": current_value,
                "source_path": None if source_path is None else str(source_path),
                "source_exists": False if source_path is None else source_path.exists(),
                "canonical_value": canonical_raw,
                "target_path": str(target_path),
                "target_exists": target_path.exists(),
                "path_kind": str(entry["path_kind"]),
                "allow_existing_target": bool(entry.get("allow_existing_target", False)),
                "existing_target_verify_command": list(
                    entry.get("existing_target_verify_command", [])
                ),
                "retire_source_on_migrate": bool(entry.get("retire_source_on_migrate", True)),
                "ownership": str(entry.get("ownership") or ""),
            }
        )

    for item in variables:
        reasons: list[str] = []
        source_path = item["source_path"]
        target_path = item["target_path"]
        if not item["current_value"]:
            reasons.append("missing-local-env-value")
            recommended_action = "missing-local-env-value"
        elif source_path == target_path:
            recommended_action = "already-canonical"
        elif item["target_exists"] and not item["allow_existing_target"]:
            reasons.append("target-already-exists")
            recommended_action = "blocked-target-exists"
        elif item["target_exists"] and item["allow_existing_target"]:
            recommended_action = "env-only"
        elif not item["source_exists"]:
            reasons.append("missing-source-path")
            recommended_action = "blocked-missing-source"
        else:
            recommended_action = "move"

        shared_source_keys = source_to_keys.get(str(source_path), []) if source_path else []
        if source_path and len(shared_source_keys) > 1:
            if item["path_kind"] == "directory":
                reasons.append("shared-directory-source")
                recommended_action = "blocked-shared-directory-source"
            else:
                recommended_action = "copy"

        item["shared_source_keys"] = shared_source_keys
        item["recommended_action"] = recommended_action
        item["eligible_for_apply"] = bool(item["current_value"]) and not reasons
        item["reasons"] = reasons

    return {
        "version": 1,
        "generated_at": datetime.now(UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
        "repo_root": str(root),
        "env_path": str(env_path),
        "mode": "dry-run",
        "audit_report_path": str(expand_policy_path(str(policy["report_path"]), root=root)),
        "canonical_paths": policy.get("canonical_paths", {}),
        "legacy_compatibility": legacy_status,
        "canonical_capacity": {
            "user_state_root": {
                "path": str(
                    expand_policy_path(str(policy["canonical_paths"]["user_state_root"]), root=root)
                ),
                "exists": expand_policy_path(
                    str(policy["canonical_paths"]["user_state_root"]), root=root
                ).exists(),
            },
            "user_cache_root": {
                "path": str(
                    expand_policy_path(str(policy["canonical_paths"]["user_cache_root"]), root=root)
                ),
                "exists": expand_policy_path(
                    str(policy["canonical_paths"]["user_cache_root"]), root=root
                ).exists(),
            },
        },
        "variables": variables,
    }


def _parse_mapping_specs(raw_values: list[str], root: Path) -> dict[str, tuple[Path, Path]]:
    parsed: dict[str, tuple[Path, Path]] = {}
    for raw in raw_values:
        if "=" not in raw or "::" not in raw:
            raise ValueError(f"invalid mapping `{raw}`; expected KEY=SOURCE::TARGET")
        key, remainder = raw.split("=", 1)
        source_raw, target_raw = remainder.split("::", 1)
        key = key.strip()
        if not key:
            raise ValueError(f"invalid mapping `{raw}`; missing key")
        parsed[key] = (
            expand_policy_path(source_raw.strip(), root=root),
            expand_policy_path(target_raw.strip(), root=root),
        )
    return parsed


def _copy_file(source: Path, target: Path) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, target)


def _run_command(
    command: list[str],
    *,
    cwd: Path,
    extra_env: dict[str, str] | None = None,
) -> tuple[bool, str]:
    if not command:
        return (True, "")
    env = dict(os.environ)
    if extra_env:
        env.update(extra_env)
    result = subprocess.run(
        command,
        cwd=cwd,
        env=env,
        capture_output=True,
        text=True,
        check=False,
    )
    detail = "\n".join(
        part for part in (result.stdout.strip(), result.stderr.strip()) if part
    ).strip()
    return (result.returncode == 0, detail)


def _stage_path(target: Path) -> Path:
    return target.parent / f".{target.name}.migration-stage-{uuid4().hex}"


def _rollback_migration(
    *,
    promoted_ops: list[dict[str, Any]],
    staged_ops: list[dict[str, Any]],
) -> None:
    for operation in reversed(promoted_ops):
        target = Path(operation["target"])
        source = Path(operation["source"])
        if target.exists():
            if source.exists():
                if target.is_dir():
                    shutil.rmtree(target)
                else:
                    target.unlink(missing_ok=True)
            else:
                target.replace(source)
    for operation in reversed(staged_ops):
        staging = Path(operation["staging"])
        source = Path(operation["source"])
        if staging.exists():
            if source.exists():
                if staging.is_dir():
                    shutil.rmtree(staging)
                else:
                    staging.unlink(missing_ok=True)
            else:
                staging.replace(source)


def _build_apply_operations(
    *,
    root: Path,
    plan: dict[str, Any],
    mappings: dict[str, tuple[Path, Path]],
) -> list[dict[str, Any]]:
    operations: list[dict[str, Any]] = []
    seen_targets: set[Path] = set()
    for item in plan["variables"]:
        name = str(item["name"])
        if name not in mappings:
            continue
        source, target = mappings[name]
        if str(source) != str(item["source_path"]):
            raise RuntimeError(f"{name}: mapping source does not match current .env value")
        if str(target) != str(item["target_path"]):
            raise RuntimeError(f"{name}: mapping target does not match canonical target")
        if target in seen_targets:
            raise RuntimeError(f"{name}: duplicate target path is not allowed: {target}")
        seen_targets.add(target)

        shared_source_keys = list(item.get("shared_source_keys") or [])
        if len(shared_source_keys) > 1:
            if set(shared_source_keys) == {"SQLITE_PATH", "SQLITE_STATE_PATH"}:
                raise RuntimeError(
                    "shared SQLite source is not safe to auto-split; migrate it manually with an explicit runbook"
                )
            raise RuntimeError(
                f"{name}: shared source is not supported for automatic migration ({', '.join(shared_source_keys)})"
            )

        if not item["current_value"]:
            raise RuntimeError(f"{name}: missing local .env value")

        if str(source) == str(target):
            operations.append(
                {
                    "variable": name,
                    "mode": "already-canonical",
                    "source": str(source),
                    "target": str(target),
                    "canonical_value": str(item["canonical_value"]),
                }
            )
            continue

        if not source.exists():
            raise RuntimeError(f"{name}: source path is missing: {source}")

        verify_command = list(item.get("existing_target_verify_command") or [])
        if item["target_exists"]:
            if not bool(item["allow_existing_target"]):
                raise RuntimeError(f"{name}: target already exists: {target}")
            ok, detail = _run_command(
                verify_command,
                cwd=root,
                extra_env={
                    "TARGET_PATH": str(target),
                    "TARGET_VALUE": str(item["canonical_value"]),
                },
            )
            if not ok:
                raise RuntimeError(
                    f"{name}: existing target failed healthcheck: {detail or 'verification command failed'}"
                )
            operations.append(
                {
                    "variable": name,
                    "mode": "env-only-existing-target",
                    "source": str(source),
                    "target": str(target),
                    "canonical_value": str(item["canonical_value"]),
                    "verification_command": verify_command,
                }
            )
            continue

        operations.append(
            {
                "variable": name,
                "mode": "move",
                "source": str(source),
                "target": str(target),
                "canonical_value": str(item["canonical_value"]),
                "staging": str(_stage_path(target)),
                "source_size_bytes": size_bytes(source),
                "path_kind": str(item["path_kind"]),
            }
        )
    return operations


def _apply_plan(
    *,
    root: Path,
    policy: dict[str, Any],
    plan: dict[str, Any],
    mappings: dict[str, tuple[Path, Path]],
) -> tuple[bool, list[dict[str, Any]]]:
    audit_report_path = Path(str(plan["audit_report_path"]))
    if not audit_report_path.is_file():
        raise RuntimeError("disk-space migration requires an existing disk-space audit report")
    required_keys = {
        item["name"]
        for item in plan["variables"]
        if item["current_value"] and item["source_path"] != item["target_path"]
    }
    missing = sorted(required_keys - set(mappings))
    if missing:
        raise RuntimeError("missing explicit mappings for: " + ", ".join(missing))

    operations = _build_apply_operations(root=root, plan=plan, mappings=mappings)
    actions: list[dict[str, Any]] = []
    env_updates: dict[str, str] = {}
    staged_ops: list[dict[str, Any]] = []
    promoted_ops: list[dict[str, Any]] = []
    try:
        for operation in operations:
            env_updates[operation["variable"]] = operation["canonical_value"]
            if operation["mode"] in {"env-only-existing-target", "already-canonical"}:
                actions.append(
                    {
                        "variable": operation["variable"],
                        "status": operation["mode"],
                        "source": operation["source"],
                        "target": operation["target"],
                    }
                )
                continue

            source = Path(operation["source"])
            staging = Path(operation["staging"])
            if staging.exists():
                raise RuntimeError(
                    f"{operation['variable']}: staging path already exists: {staging}"
                )
            staging.parent.mkdir(parents=True, exist_ok=True)
            source.replace(staging)
            staged_ops.append(operation)

        for operation in staged_ops:
            staging = Path(operation["staging"])
            target = Path(operation["target"])
            if target.exists():
                raise RuntimeError(
                    f"{operation['variable']}: target already exists during promote: {target}"
                )
            target.parent.mkdir(parents=True, exist_ok=True)
            staging.replace(target)
            promoted_ops.append(operation)
            actions.append(
                {
                    "variable": operation["variable"],
                    "status": "moved",
                    "source": operation["source"],
                    "target": operation["target"],
                    "size_human": human_bytes(int(operation["source_size_bytes"])),
                }
            )

        update_env_assignments(root / ".env", env_updates)
    except Exception:
        _rollback_migration(promoted_ops=promoted_ops, staged_ops=staged_ops)
        raise

    refreshed_plan = _build_plan(root, policy)
    plan["legacy_compatibility"] = refreshed_plan["legacy_compatibility"]
    plan["canonical_capacity"] = refreshed_plan["canonical_capacity"]
    return (True, actions)


def _render_text(report: dict[str, Any]) -> str:
    lines = [
        "[disk-space-legacy-migration] " + ("APPLY" if report["mode"] == "apply" else "DRY-RUN"),
        "legacy-retirement-blocked: "
        + str(report["legacy_compatibility"]["legacy_retirement_blocked"]).lower(),
    ]
    for item in report["variables"]:
        lines.append(
            f"variable: {item['name']} | action={item['recommended_action']} | eligible={str(item['eligible_for_apply']).lower()}"
        )
        if item["current_value"]:
            lines.append(f"  source: {item['current_value']}")
        lines.append(f"  target: {item['canonical_value']}")
        if item["reasons"]:
            lines.append("  reasons: " + ", ".join(item["reasons"]))
    for action in report.get("actions", []):
        lines.append(
            "action: "
            + action.get("variable", action.get("source", "unknown"))
            + f" | status={action['status']}"
        )
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Detect or migrate legacy SourceHarbor disk paths into canonical roots."
    )
    parser.add_argument("--repo-root", default=str(repo_root()))
    parser.add_argument("--policy", default="")
    parser.add_argument("--mapping", action="append", default=[])
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--yes", action="store_true")
    parser.add_argument("--json", action="store_true")
    parser.add_argument("--write-report", default="")
    args = parser.parse_args()

    root = Path(args.repo_root).resolve()
    policy = load_policy(root, args.policy or None)
    report = _build_plan(root, policy)

    if args.apply:
        if not args.yes:
            parser.error("--apply requires --yes")
        try:
            mappings = _parse_mapping_specs(list(args.mapping), root)
        except ValueError as exc:
            print(f"[disk-space-legacy-migration] FAIL: {exc}", file=sys.stderr)
            return 1
        report["mode"] = "apply"
        try:
            ok, actions = _apply_plan(root=root, policy=policy, plan=report, mappings=mappings)
        except RuntimeError as exc:
            print(f"[disk-space-legacy-migration] FAIL: {exc}", file=sys.stderr)
            return 1
        report["actions"] = actions
        refreshed_audit = build_report(root, policy)
        audit_path = str(policy["report_path"])
        write_report(root, audit_path, refreshed_audit, scope="report_disk_space")
        report["legacy_compatibility"] = refreshed_audit["legacy_compatibility"]
        report["governance"] = refreshed_audit["governance"]
        report["audit_report_path"] = str(expand_policy_path(audit_path, root=root))
        output_path = args.write_report or str(policy["migration_report_path"])
        write_report(root, output_path, report, scope="legacy_disk_migration")
        if args.json:
            print(json.dumps(report, ensure_ascii=False, indent=2))
        else:
            print(_render_text(report))
        return 0 if ok else 1

    output_path = args.write_report or str(policy["migration_report_path"])
    write_report(root, output_path, report, scope="legacy_disk_migration")
    if args.json:
        print(json.dumps(report, ensure_ascii=False, indent=2))
    else:
        print(_render_text(report))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
