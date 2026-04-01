from __future__ import annotations

import os

from fastapi.testclient import TestClient

os.environ.setdefault("DATABASE_URL", "sqlite:////tmp/sourceharbor-watchlists-route.db")
os.environ.setdefault("TEMPORAL_TARGET_HOST", "127.0.0.1:7233")
os.environ.setdefault("TEMPORAL_NAMESPACE", "default")
os.environ.setdefault("TEMPORAL_TASK_QUEUE", "sourceharbor-worker")
os.environ.setdefault("SQLITE_STATE_PATH", "/tmp/sourceharbor-watchlists-route-state.db")

from apps.api.app.main import app


def test_watchlists_routes(monkeypatch) -> None:
    from apps.api.app.routers import watchlists as watchlists_router

    class StubWatchlistsService:
        def __init__(self, db) -> None:  # noqa: ANN001
            self.db = db

        def list_watchlists(self):
            return [
                {
                    "id": "wl-1",
                    "name": "Retry policy",
                    "matcher_type": "topic_key",
                    "matcher_value": "retry-policy",
                    "delivery_channel": "dashboard",
                    "enabled": True,
                    "created_at": "2026-03-31T10:00:00Z",
                    "updated_at": "2026-03-31T10:00:00Z",
                }
            ]

        def get_watchlist_trend(self, *, watchlist_id, limit_runs=3, limit_cards=18):  # noqa: ANN001
            return {
                "watchlist": {
                    "id": watchlist_id,
                    "name": "Retry policy",
                    "matcher_type": "topic_key",
                    "matcher_value": "retry-policy",
                    "delivery_channel": "dashboard",
                    "enabled": True,
                    "created_at": "2026-03-31T10:00:00Z",
                    "updated_at": "2026-03-31T10:00:00Z",
                },
                "summary": {
                    "recent_runs": 2,
                    "matched_cards": 4,
                    "matcher_type": "topic_key",
                    "matcher_value": "retry-policy",
                },
                "timeline": [],
            }

    monkeypatch.setattr(
        watchlists_router.WatchlistsService,
        "list_watchlists",
        lambda self: [
            {
                "id": "wl-1",
                "name": "Retry policy",
                "matcher_type": "topic_key",
                "matcher_value": "retry-policy",
                "delivery_channel": "dashboard",
                "enabled": True,
                "created_at": "2026-03-31T10:00:00Z",
                "updated_at": "2026-03-31T10:00:00Z",
            }
        ],
    )
    monkeypatch.setattr(
        watchlists_router.WatchlistsService,
        "get_watchlist_trend",
        lambda self, watchlist_id, limit_runs=3, limit_cards=18: {  # noqa: ARG005
            "watchlist": {
                "id": watchlist_id,
                "name": "Retry policy",
                "matcher_type": "topic_key",
                "matcher_value": "retry-policy",
                "delivery_channel": "dashboard",
                "enabled": True,
                "created_at": "2026-03-31T10:00:00Z",
                "updated_at": "2026-03-31T10:00:00Z",
            },
            "summary": {
                "recent_runs": 2,
                "matched_cards": 4,
                "matcher_type": "topic_key",
                "matcher_value": "retry-policy",
            },
            "timeline": [],
        },
    )
    monkeypatch.setattr(watchlists_router, "WatchlistsService", StubWatchlistsService)

    client = TestClient(app)
    list_response = client.get("/api/v1/watchlists")
    assert list_response.status_code == 200
    assert list_response.json()[0]["id"] == "wl-1"

    trend_response = client.get("/api/v1/watchlists/wl-1/trend")
    assert trend_response.status_code == 200
    assert trend_response.json()["summary"]["recent_runs"] == 2
