#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from disk_space_common import (
    collect_disk_governance_signals,
    collect_legacy_compatibility,
    detect_docker_named_volumes,
    expand_policy_path,
    human_bytes,
    load_policy,
    rel_path,
    repo_root,
    size_bytes,
    write_report,
)


def _entry_payload(root: Path, target: dict[str, Any]) -> dict[str, Any]:
    path = expand_policy_path(str(target["path"]), root=root)
    exists = path.exists()
    size = size_bytes(path) if exists else 0
    return {
        "id": str(target["id"]),
        "label": str(target["label"]),
        "path": rel_path(path),
        "layer": str(target["layer"]),
        "ownership": str(target["ownership"]),
        "category": str(target["category"]),
        "exists": exists,
        "size_bytes": size,
        "size_human": human_bytes(size),
        "count_in_layer_total": bool(target.get("count_in_layer_total", False)),
    }


def _docker_entries(docker: dict[str, Any]) -> tuple[list[dict[str, Any]], bool]:
    entries: list[dict[str, Any]] = []
    has_unverified = docker.get("status") != "ok"
    for volume in docker.get("volumes", []):
        status = str(volume.get("status") or "unverified")
        if status == "present":
            size = volume.get("size_bytes")
            entries.append(
                {
                    "id": f"docker:{volume['name']}",
                    "label": f"Docker volume {volume['name']}",
                    "path": str(volume.get("mountpoint") or volume["name"]),
                    "layer": "repo-external-repo-owned",
                    "ownership": "repo-primary",
                    "category": "docker-volume",
                    "exists": True,
                    "size_bytes": int(size or 0),
                    "size_human": human_bytes(int(size or 0)),
                    "count_in_layer_total": True,
                }
            )
            continue
        if status == "missing":
            entries.append(
                {
                    "id": f"docker:{volume['name']}",
                    "label": f"Docker volume {volume['name']}",
                    "path": str(volume["name"]),
                    "layer": "repo-external-repo-owned",
                    "ownership": "repo-primary",
                    "category": "docker-volume",
                    "exists": False,
                    "size_bytes": 0,
                    "size_human": human_bytes(0),
                    "count_in_layer_total": True,
                }
            )
            continue
        has_unverified = True
        entries.append(
            {
                "id": f"docker:{volume['name']}",
                "label": f"Docker volume {volume['name']}",
                "path": str(volume["name"]),
                "layer": "unverified-layer",
                "ownership": "unverified",
                "category": "docker-volume",
                "exists": False,
                "size_bytes": None,
                "size_human": "unknown",
                "count_in_layer_total": False,
            }
        )
    return entries, has_unverified


def build_report(root: Path, policy: dict[str, Any]) -> dict[str, Any]:
    entries = [_entry_payload(root, target) for target in policy.get("audit_targets", [])]
    docker = detect_docker_named_volumes(list(policy.get("docker_named_volumes", [])))
    docker_entries, has_unverified = _docker_entries(docker)
    entries.extend(docker_entries)
    totals: dict[str, int] = {}
    for item in entries:
        if not item["count_in_layer_total"]:
            continue
        layer = str(item["layer"])
        totals[layer] = totals.get(layer, 0) + int(item["size_bytes"])
    legacy_status = collect_legacy_compatibility(root, policy)
    governance = collect_disk_governance_signals(root, policy, entries, legacy_status)
    highlights = [
        item
        for item in entries
        if item["path"]
        in {
            ".runtime-cache/tmp",
            "apps/web/node_modules",
            ".venv",
            str(Path.home() / ".cache" / "sourceharbor"),
            str(Path.home() / ".cache" / "video-digestor"),
            str(Path.home() / ".video-digestor"),
            str(Path.home() / "Library" / "Caches" / "ms-playwright"),
            str(Path.home() / ".cache" / "uv"),
        }
    ]
    report = {
        "version": 1,
        "generated_at": datetime.now(UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
        "repo_root": str(root),
        "canonical_paths": policy.get("canonical_paths", {}),
        "entries": entries,
        "totals": {
            "repo-internal": {
                "size_bytes": totals.get("repo-internal", 0),
                "size_human": human_bytes(totals.get("repo-internal", 0)),
            },
            "repo-external-repo-owned": {
                "size_bytes": totals.get("repo-external-repo-owned", 0),
                "size_human": human_bytes(totals.get("repo-external-repo-owned", 0)),
            },
            "shared-layer": {
                "size_bytes": totals.get("shared-layer", 0),
                "size_human": human_bytes(totals.get("shared-layer", 0)),
            },
            "unverified-layer": {
                "size_bytes": None if has_unverified else 0,
                "size_human": "unknown" if has_unverified else human_bytes(0),
            },
            "confirmed_total": {
                "size_bytes": sum(totals.values()),
                "size_human": human_bytes(sum(totals.values())),
            },
        },
        "docker": docker,
        "highlights": highlights,
        "legacy_compatibility": legacy_status,
        "governance": governance,
    }
    if has_unverified:
        report["totals"]["unverified-layer"] = {
            "size_bytes": None,
            "size_human": "unknown",
            "reason": docker.get("reason") or "docker-unverified",
        }
    return report


def render_text(report: dict[str, Any]) -> str:
    totals = report["totals"]
    lines = [
        "[disk-space-audit] PASS",
        f"repo-internal: {totals['repo-internal']['size_human']}",
        f"repo-external-repo-owned: {totals['repo-external-repo-owned']['size_human']}",
        f"shared-layer: {totals['shared-layer']['size_human']}",
        f"confirmed-total: {totals['confirmed_total']['size_human']}",
    ]
    unverified = totals["unverified-layer"]
    if unverified["size_bytes"] is None:
        lines.append(
            f"unverified-layer: {unverified['size_human']} ({unverified.get('reason', 'unverified')})"
        )
    else:
        lines.append(f"unverified-layer: {unverified['size_human']}")
    if report["legacy_compatibility"]["active_markers_detected"]:
        lines.append("legacy-compatibility: active")
        for rel in report["legacy_compatibility"]["legacy_reference_hits"]:
            lines.append(f"  - {rel}")
    else:
        lines.append("legacy-compatibility: clear")
    lines.append(
        "legacy-retirement-blocked: "
        + str(report["legacy_compatibility"]["legacy_retirement_blocked"]).lower()
    )
    governance = report["governance"]
    runtime_tmp = governance["runtime_tmp_over_budget"]
    lines.append(
        "runtime-tmp-budget: "
        + ("over" if runtime_tmp["detected"] else "ok")
        + f" | size={runtime_tmp['size_human']}"
        + (
            f" | budget={runtime_tmp['budget_human']}"
            if runtime_tmp["budget_human"] != "unknown"
            else ""
        )
    )
    legacy_drift = governance["legacy_default_write_drift"]
    lines.append(
        "legacy-default-write-drift: " + ("detected" if legacy_drift["detected"] else "clear")
    )
    unexpected = governance["unexpected_repo_external_paths"]
    lines.append(
        "unexpected-repo-external-paths: " + ("detected" if unexpected["detected"] else "clear")
    )
    for item in report["highlights"]:
        lines.append(
            f"highlight: {item['path']} | layer={item['layer']} | size={item['size_human']}"
        )
    docker = report["docker"]
    if docker.get("status") != "ok":
        lines.append(
            f"docker-volumes: unverified ({docker.get('reason', 'unknown')})"
            + (f" | {docker.get('detail')}" if docker.get("detail") else "")
        )
    else:
        for volume in docker.get("volumes", []):
            lines.append(
                f"docker-volume: {volume['name']} | status={volume['status']} | size={volume.get('size_human', 'unknown')}"
            )
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Build a four-layer disk-space audit for SourceHarbor."
    )
    parser.add_argument("--repo-root", default=str(repo_root()))
    parser.add_argument("--policy", default="")
    parser.add_argument("--json", action="store_true", help="Print JSON instead of human text.")
    parser.add_argument("--write-report", default="")
    args = parser.parse_args()

    root = Path(args.repo_root).resolve()
    policy = load_policy(root, args.policy or None)
    report = build_report(root, policy)
    report_path = args.write_report or str(policy["report_path"])
    write_report(root, report_path, report, scope="report_disk_space")
    if args.json:
        print(json.dumps(report, ensure_ascii=False, indent=2))
    else:
        print(render_text(report))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
