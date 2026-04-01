from __future__ import annotations

import os

from fastapi.testclient import TestClient

os.environ.setdefault("DATABASE_URL", "sqlite:////tmp/sourceharbor-bundle-route.db")
os.environ.setdefault("TEMPORAL_TARGET_HOST", "127.0.0.1:7233")
os.environ.setdefault("TEMPORAL_NAMESPACE", "default")
os.environ.setdefault("TEMPORAL_TASK_QUEUE", "sourceharbor-worker")
os.environ.setdefault("SQLITE_STATE_PATH", "/tmp/sourceharbor-bundle-route-state.db")

from apps.api.app.main import app


def test_job_bundle_route_returns_bundle(monkeypatch) -> None:
    from apps.api.app.services.jobs import JobsService
    from apps.api.app.routers import jobs as jobs_router

    class StubJobsService:
        def __init__(self, db) -> None:  # noqa: ANN001
            self.db = db

        def build_evidence_bundle(self, *, job_id):  # noqa: ANN001
            return {
                "bundle_kind": "sourceharbor_job_evidence_bundle_v1",
                "sharing_scope": "internal",
                "sample": False,
                "generated_at": "2026-03-31T10:00:00Z",
                "proof_boundary": "Internal only.",
                "job": {"id": "job-1"},
                "trace_summary": {"step_count": 3},
                "digest": "# Sample",
                "digest_meta": None,
                "comparison": None,
                "knowledge_cards": [],
                "artifact_manifest": {},
                "step_summary": [],
            }

    monkeypatch.setattr(
        JobsService,
        "build_evidence_bundle",
        lambda self, job_id: {  # noqa: ARG005
            "bundle_kind": "sourceharbor_job_evidence_bundle_v1",
            "sharing_scope": "internal",
            "sample": False,
            "generated_at": "2026-03-31T10:00:00Z",
            "proof_boundary": "Internal only.",
            "job": {"id": "job-1"},
            "trace_summary": {"step_count": 3},
            "digest": "# Sample",
            "digest_meta": None,
            "comparison": None,
            "knowledge_cards": [],
            "artifact_manifest": {},
            "step_summary": [],
        },
    )
    monkeypatch.setattr(jobs_router, "JobsService", StubJobsService)

    client = TestClient(app)
    response = client.get("/api/v1/jobs/11111111-1111-1111-1111-111111111111/bundle")

    assert response.status_code == 200
    assert response.json()["bundle_kind"] == "sourceharbor_job_evidence_bundle_v1"
