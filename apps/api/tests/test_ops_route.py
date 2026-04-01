from __future__ import annotations

import os

from fastapi.testclient import TestClient

os.environ.setdefault("DATABASE_URL", "sqlite:////tmp/sourceharbor-ops-route.db")
os.environ.setdefault("TEMPORAL_TARGET_HOST", "127.0.0.1:7233")
os.environ.setdefault("TEMPORAL_NAMESPACE", "default")
os.environ.setdefault("TEMPORAL_TASK_QUEUE", "sourceharbor-worker")
os.environ.setdefault("SQLITE_STATE_PATH", "/tmp/sourceharbor-ops-route-state.db")

from apps.api.app.main import app


def test_ops_inbox_route_returns_payload(monkeypatch) -> None:
    from apps.api.app.routers import ops as ops_router

    class StubOpsService:
        def __init__(self, db) -> None:  # noqa: ANN001
            self.db = db

        def get_inbox(self, *, limit=5, window_hours=24):  # noqa: ANN001
            return {
                "generated_at": "2026-03-31T10:00:00Z",
                "overview": {
                    "attention_items": 1,
                    "failed_jobs": 1,
                    "failed_ingest_runs": 0,
                    "notification_or_gate_issues": 1,
                },
                "failed_jobs": {"status": "ok", "total": 1, "error": None, "items": []},
                "failed_ingest_runs": {"status": "ok", "total": 0, "error": None, "items": []},
                "notification_deliveries": {"status": "ok", "total": 0, "error": None, "items": []},
                "provider_health": {"window_hours": window_hours, "providers": []},
                "gates": {
                    "retrieval": {
                        "status": "blocked",
                        "summary": "x",
                        "next_step": "x",
                        "details": {},
                    },
                    "notifications": {
                        "status": "warn",
                        "summary": "x",
                        "next_step": "x",
                        "details": {},
                    },
                    "ui_audit": {
                        "status": "ready",
                        "summary": "x",
                        "next_step": "x",
                        "details": {},
                    },
                    "computer_use": {
                        "status": "blocked",
                        "summary": "x",
                        "next_step": "x",
                        "details": {},
                    },
                },
                "inbox_items": [],
            }

    monkeypatch.setattr(
        ops_router.OpsService,
        "get_inbox",
        lambda self, limit=5, window_hours=24: {  # noqa: ARG005
            "generated_at": "2026-03-31T10:00:00Z",
            "overview": {
                "attention_items": 1,
                "failed_jobs": 1,
                "failed_ingest_runs": 0,
                "notification_or_gate_issues": 1,
            },
            "failed_jobs": {"status": "ok", "total": 1, "error": None, "items": []},
            "failed_ingest_runs": {"status": "ok", "total": 0, "error": None, "items": []},
            "notification_deliveries": {"status": "ok", "total": 0, "error": None, "items": []},
            "provider_health": {"window_hours": 24, "providers": []},
            "gates": {
                "retrieval": {"status": "blocked", "summary": "x", "next_step": "x", "details": {}},
                "notifications": {
                    "status": "warn",
                    "summary": "x",
                    "next_step": "x",
                    "details": {},
                },
                "ui_audit": {"status": "ready", "summary": "x", "next_step": "x", "details": {}},
                "computer_use": {
                    "status": "blocked",
                    "summary": "x",
                    "next_step": "x",
                    "details": {},
                },
            },
            "inbox_items": [],
        },
    )
    monkeypatch.setattr(ops_router, "OpsService", StubOpsService)

    client = TestClient(app)
    response = client.get("/api/v1/ops/inbox?limit=4&window_hours=12")

    assert response.status_code == 200
    payload = response.json()
    assert payload["overview"]["failed_jobs"] == 1
    assert payload["gates"]["retrieval"]["status"] == "blocked"
