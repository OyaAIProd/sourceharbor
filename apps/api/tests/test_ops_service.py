from __future__ import annotations

import importlib
import os


def _load_ops_module():
    os.environ.setdefault("DATABASE_URL", "sqlite:////tmp/sourceharbor-ops-test.db")
    os.environ.setdefault("TEMPORAL_TARGET_HOST", "127.0.0.1:7233")
    os.environ.setdefault("TEMPORAL_NAMESPACE", "default")
    os.environ.setdefault("TEMPORAL_TASK_QUEUE", "sourceharbor-worker")
    os.environ.setdefault("SQLITE_STATE_PATH", "/tmp/sourceharbor-ops-test-state.db")
    module = importlib.import_module("apps.api.app.services.ops")
    return importlib.reload(module)


def test_build_retrieval_gate_blocks_when_corpus_is_effectively_empty() -> None:
    module = _load_ops_module()
    payload = module.build_retrieval_gate(
        videos=0,
        jobs_with_artifacts=0,
        knowledge_cards=0,
        video_embeddings=0,
    )

    assert payload["status"] == "blocked"
    assert "empty" in payload["summary"].lower()


def test_build_notifications_gate_blocks_without_resend_secrets() -> None:
    module = _load_ops_module()
    payload = module.build_notifications_gate(
        notification_enabled=False,
        config_enabled=False,
        resend_api_key_present=False,
        resend_from_email_present=False,
        to_email=None,
    )

    assert payload["status"] == "blocked"
    assert "Resend provider configuration" in payload["summary"]
    assert payload["details"]["missing_requirements"] == [
        "RESEND_API_KEY",
        "RESEND_FROM_EMAIL",
    ]


def test_build_notifications_gate_identifies_missing_sender_email_separately() -> None:
    module = _load_ops_module()
    payload = module.build_notifications_gate(
        notification_enabled=True,
        config_enabled=True,
        resend_api_key_present=True,
        resend_from_email_present=False,
        to_email="ops@example.com",
    )

    assert payload["status"] == "blocked"
    assert payload["details"]["missing_requirements"] == ["RESEND_FROM_EMAIL"]
    assert "RESEND_FROM_EMAIL" in payload["next_step"]


def test_build_ui_audit_gate_stays_ready_when_only_gemini_review_is_missing() -> None:
    module = _load_ops_module()
    payload = module.build_ui_audit_gate(
        artifact_base_root="/tmp",
        gemini_review_enabled=True,
        gemini_api_key_present=False,
    )

    assert payload["status"] == "ready"
    assert "Gemini review layer is blocked" in payload["summary"]


def test_build_computer_use_gate_blocks_without_gemini_key() -> None:
    module = _load_ops_module()
    payload = module.build_computer_use_gate(
        gemini_api_key_present=False,
        model="gemini-2.5-computer-use-preview-10-2025",
    )

    assert payload["status"] == "blocked"
    assert payload["details"]["input_contract"] == "instruction + screenshot_base64 + safety"
