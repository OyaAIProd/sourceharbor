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
    rel_path_from,
    repo_root,
    resolve_candidate_paths,
    size_bytes,
    write_report,
)

REPO_INTERNAL_RESIDUE_BUCKETS: dict[str, list[str]] = {
    "proof_scratch": [
        ".runtime-cache/tmp/manual-image-audit",
        ".runtime-cache/tmp/public-image-audit",
        ".runtime-cache/tmp/audit-images",
        ".runtime-cache/tmp/audit-images-direct",
        ".runtime-cache/tmp/image-audit",
    ],
    "active_logs": [
        ".runtime-cache/logs/app",
    ],
    "local_private_ledgers": [
        ".runtime-cache/evidence/ai-ledgers",
        ".agents",
    ],
    "tracked_release_evidence": [
        "artifacts/releases",
    ],
    "orphan_residue": [
        "apps/web/node_modules.broken.*",
    ],
}


def _entry_payload(root: Path, target: dict[str, Any]) -> dict[str, Any]:
    path = expand_policy_path(str(target["path"]), root=root)
    exists = path.exists()
    size = size_bytes(path) if exists else 0
    return {
        "id": str(target["id"]),
        "label": str(target["label"]),
        "path": rel_path_from(root, path),
        "layer": str(target["layer"]),
        "ownership": str(target["ownership"]),
        "category": str(target["category"]),
        "exists": exists,
        "size_bytes": size,
        "size_human": human_bytes(size),
        "count_in_layer_total": bool(target.get("count_in_layer_total", False)),
        "highlight": bool(target.get("highlight", False)),
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


def _residue_bucket_entries(root: Path, patterns: list[str]) -> list[dict[str, Any]]:
    entries: list[dict[str, Any]] = []
    seen: set[Path] = set()
    for pattern in patterns:
        resolved_paths = resolve_candidate_paths(pattern, root=root)
        if not resolved_paths and not any(token in pattern for token in ("*", "?", "[")):
            resolved_paths = [expand_policy_path(pattern, root=root)]
        for path in resolved_paths:
            if path in seen:
                continue
            seen.add(path)
            exists = path.exists()
            size = size_bytes(path) if exists else 0
            entries.append(
                {
                    "path": rel_path_from(root, path),
                    "exists": exists,
                    "size_bytes": size,
                    "size_human": human_bytes(size),
                }
            )
    return sorted(
        entries,
        key=lambda item: (not item["exists"], -int(item["size_bytes"]), str(item["path"])),
    )


def _repo_internal_residue(root: Path) -> dict[str, dict[str, Any]]:
    residue: dict[str, dict[str, Any]] = {}
    for bucket, patterns in REPO_INTERNAL_RESIDUE_BUCKETS.items():
        entries = _residue_bucket_entries(root, patterns)
        total = sum(int(item["size_bytes"]) for item in entries if item["exists"])
        residue[bucket] = {
            "size_bytes": total,
            "size_human": human_bytes(total),
            "paths": entries,
        }
    return residue


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
    governance["repo_internal_residue"] = _repo_internal_residue(root)
    highlights = sorted(
        (item for item in entries if item.get("highlight")),
        key=lambda item: int(item.get("size_bytes") or 0),
        reverse=True,
    )
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
    for bucket, payload in report["governance"].get("repo_internal_residue", {}).items():
        lines.append(f"repo-internal-residue: {bucket} | size={payload['size_human']}")
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
