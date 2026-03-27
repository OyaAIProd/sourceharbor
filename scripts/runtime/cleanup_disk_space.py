#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import os
import subprocess
from datetime import UTC, datetime
from pathlib import Path
from typing import Any
from uuid import uuid4

from disk_space_common import (
    collect_legacy_compatibility,
    collect_reference_hits,
    expand_policy_path,
    explicit_lock_path_hits,
    human_bytes,
    is_quiet_for_minutes,
    load_policy,
    lock_marker_hits,
    lsof_hits,
    remove_path,
    repo_root,
    resolve_candidate_paths,
    size_bytes,
    write_report,
)


def _evaluate_candidate(
    *,
    root: Path,
    wave_name: str,
    candidate: dict[str, Any],
    policy: dict[str, Any],
    legacy_status: dict[str, Any],
) -> list[dict[str, Any]]:
    raw_path = str(candidate.get("path") or candidate.get("path_glob") or "")
    exclude_globs = [str(item) for item in candidate.get("exclude_globs", [])]
    paths = resolve_candidate_paths(raw_path, root=root, exclude_globs=exclude_globs)
    results: list[dict[str, Any]] = []
    for path in paths:
        if not path.exists():
            continue
        if candidate.get("file_only") and not path.is_file():
            continue
        if candidate.get("max_size_bytes") is not None and size_bytes(path) > int(
            candidate["max_size_bytes"]
        ):
            continue
        gates: list[dict[str, Any]] = []
        if candidate.get("quiet_minutes") is not None:
            quiet_ok, age_minutes = is_quiet_for_minutes(path, int(candidate["quiet_minutes"]))
            gates.append(
                {
                    "name": "quiet-window",
                    "ok": quiet_ok,
                    "detail": None
                    if age_minutes is None
                    else f"{age_minutes:.1f}m since latest change",
                }
            )
        explicit_paths = [str(item) for item in candidate.get("lock_paths", [])]
        if explicit_paths:
            hits = explicit_lock_path_hits(explicit_paths, root=root)
            gates.append(
                {
                    "name": "lock-paths",
                    "ok": not hits,
                    "detail": "" if not hits else ", ".join(hits[:10]),
                }
            )
        patterns = [str(item) for item in candidate.get("lock_markers", [])]
        if patterns:
            hits = lock_marker_hits(path, patterns)
            gates.append(
                {
                    "name": "lock-markers",
                    "ok": not hits,
                    "detail": "" if not hits else ", ".join(hits[:10]),
                }
            )
        if candidate.get("requires_lsof_clear"):
            lsof_state, hits = lsof_hits(path)
            gates.append(
                {
                    "name": "lsof-clear",
                    "ok": lsof_state == "clear",
                    "detail": lsof_state if not hits else "; ".join(hits),
                }
            )
        if wave_name == "external-history":
            gates.append(
                {
                    "name": "legacy-retired",
                    "ok": not bool(legacy_status.get("legacy_retirement_blocked")),
                    "detail": (
                        ""
                        if not legacy_status.get("legacy_retirement_blocked")
                        else "legacy compatibility still active"
                    ),
                }
            )
            markers = list(candidate.get("reference_markers", []))
            ref_hits = collect_reference_hits(
                root, markers, list(policy.get("legacy_reference_files", []))
            )
            gates.append(
                {
                    "name": "reference-clear",
                    "ok": not ref_hits,
                    "detail": "" if not ref_hits else ", ".join(ref_hits),
                }
            )
            equivalent_paths = [
                expand_policy_path(str(item), root=root)
                for item in candidate.get("equivalent_paths", [])
            ]
            existing_equivalent = [str(path) for path in equivalent_paths if path.exists()]
            gates.append(
                {
                    "name": "equivalent-mainline-exists",
                    "ok": bool(existing_equivalent),
                    "detail": ", ".join(existing_equivalent),
                }
            )
        results.append(
            {
                "id": str(candidate["id"]),
                "wave": wave_name,
                "path": str(path),
                "size_bytes": size_bytes(path),
                "size_human": human_bytes(size_bytes(path)),
                "classification": str(candidate["classification"]),
                "layer": str(candidate["layer"]),
                "ownership": str(candidate["ownership"]),
                "lock_paths": explicit_paths,
                "rebuild_command": list(candidate.get("rebuild_command", [])),
                "verify_command": list(candidate.get("verify_command", [])),
                "gates": gates,
                "eligible": all(bool(gate["ok"]) for gate in gates),
            }
        )
    return results


def _run_command(command: list[str], *, cwd: Path) -> tuple[bool, str]:
    if not command:
        return (True, "")
    result = subprocess.run(
        command,
        cwd=cwd,
        env=os.environ.copy(),
        capture_output=True,
        text=True,
        check=False,
    )
    detail = "\n".join(
        part for part in (result.stdout.strip(), result.stderr.strip()) if part
    ).strip()
    return (result.returncode == 0, detail)


def _quarantine_path(path: Path) -> Path:
    return path.parent / f".{path.name}.cleanup-quarantine-{uuid4().hex}"


def build_cleanup_plan(
    root: Path, policy: dict[str, Any], selected_waves: list[str]
) -> dict[str, Any]:
    waves = policy.get("cleanup_waves", {})
    wave_names = selected_waves or list(waves.keys())
    evaluated: list[dict[str, Any]] = []
    legacy_status = collect_legacy_compatibility(root, policy)
    for wave_name in wave_names:
        wave = waves.get(wave_name)
        if wave is None:
            continue
        for candidate in wave.get("candidates", []):
            evaluated.extend(
                _evaluate_candidate(
                    root=root,
                    wave_name=wave_name,
                    candidate=candidate,
                    policy=policy,
                    legacy_status=legacy_status,
                )
            )
    release_potential = sum(item["size_bytes"] for item in evaluated if item["eligible"])
    return {
        "version": 1,
        "generated_at": datetime.now(UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
        "repo_root": str(root),
        "mode": "dry-run",
        "selected_waves": wave_names,
        "legacy_compatibility": legacy_status,
        "release_potential_bytes": release_potential,
        "release_potential_human": human_bytes(release_potential),
        "candidates": evaluated,
    }


def apply_cleanup(root: Path, plan: dict[str, Any]) -> tuple[bool, list[dict[str, Any]]]:
    actions: list[dict[str, Any]] = []
    ok = True
    for item in plan["candidates"]:
        path = Path(str(item["path"]))
        if not item["eligible"]:
            actions.append({"path": str(path), "status": "skipped", "reason": "gates-failed"})
            continue
        quarantine = _quarantine_path(path)
        if quarantine.exists():
            actions.append(
                {
                    "path": str(path),
                    "status": "failed",
                    "reason": f"quarantine-path-exists:{quarantine}",
                }
            )
            ok = False
            continue
        path.replace(quarantine)
        verify_command = list(item.get("verify_command") or [])
        rebuild_command = list(item.get("rebuild_command") or [])
        command = rebuild_command or verify_command
        command_ok, detail = _run_command(command, cwd=root)
        if not command_ok:
            if path.exists():
                remove_path(path)
            quarantine.replace(path)
        actions.append(
            {
                "path": str(path),
                "status": "applied" if command_ok else "failed-restored",
                "verification_detail": detail,
                "verification_command": command,
            }
        )
        if command_ok:
            remove_path(quarantine)
        ok = ok and command_ok
    return ok, actions


def render_text(plan: dict[str, Any]) -> str:
    lines = [
        "[disk-space-cleanup] " + ("APPLY" if plan["mode"] == "apply" else "DRY-RUN"),
        f"waves: {', '.join(plan['selected_waves'])}",
        f"release-potential: {plan['release_potential_human']}",
        "legacy-retirement-blocked: "
        + str(plan["legacy_compatibility"]["legacy_retirement_blocked"]).lower(),
    ]
    for item in plan["candidates"]:
        lines.append(
            f"candidate: {item['path']} | wave={item['wave']} | eligible={str(item['eligible']).lower()} | size={item['size_human']}"
        )
        for gate in item["gates"]:
            lines.append(
                f"  gate: {gate['name']} | ok={str(gate['ok']).lower()}"
                + (f" | {gate['detail']}" if gate.get("detail") else "")
            )
    for action in plan.get("actions", []):
        lines.append(
            f"action: {action['path']} | status={action['status']}"
            + (f" | {action.get('reason')}" if action.get("reason") else "")
        )
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Plan or apply SourceHarbor disk-space cleanup with strict gates."
    )
    parser.add_argument("--repo-root", default=str(repo_root()))
    parser.add_argument("--policy", default="")
    parser.add_argument("--wave", action="append", dest="waves")
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--yes", action="store_true", help="Required together with --apply.")
    parser.add_argument("--json", action="store_true")
    parser.add_argument("--write-report", default="")
    args = parser.parse_args()

    root = Path(args.repo_root).resolve()
    policy = load_policy(root, args.policy or None)
    plan = build_cleanup_plan(root, policy, list(args.waves or []))

    if args.apply:
        if not args.yes:
            parser.error("--apply requires --yes")
        if not args.waves:
            parser.error("--apply requires at least one explicit --wave")
        plan["mode"] = "apply"
        ok, actions = apply_cleanup(root, plan)
        plan["actions"] = actions
        report_path = args.write_report or str(policy["cleanup_report_path"])
        write_report(root, report_path, plan, scope="cleanup_disk_space")
        if args.json:
            print(json.dumps(plan, ensure_ascii=False, indent=2))
        else:
            print(render_text(plan))
        return 0 if ok else 1

    report_path = args.write_report or str(policy["cleanup_report_path"])
    write_report(root, report_path, plan, scope="cleanup_disk_space")
    if args.json:
        print(json.dumps(plan, ensure_ascii=False, indent=2))
    else:
        print(render_text(plan))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
