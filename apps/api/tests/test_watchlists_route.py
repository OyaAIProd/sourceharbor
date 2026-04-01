from __future__ import annotations

from fastapi import FastAPI
from fastapi.testclient import TestClient


def test_watchlists_routes(monkeypatch) -> None:
    from apps.api.app.db import get_db
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

    def _fake_db():
        return object()

    app = FastAPI()
    app.include_router(watchlists_router.router)
    app.dependency_overrides[get_db] = _fake_db

    client = TestClient(app)
    list_response = client.get("/api/v1/watchlists")
    assert list_response.status_code == 200
    assert list_response.json()[0]["id"] == "wl-1"

    trend_response = client.get("/api/v1/watchlists/wl-1/trend")
    assert trend_response.status_code == 200
    assert trend_response.json()["summary"]["recent_runs"] == 2


def test_watchlists_upsert_maps_value_error_to_400(monkeypatch) -> None:
    from apps.api.app.db import get_db
    from apps.api.app.routers import watchlists as watchlists_router

    class StubWatchlistsService:
        def __init__(self, db) -> None:  # noqa: ANN001
            self.db = db

        def upsert_watchlist(self, **kwargs):  # noqa: ANN003
            raise ValueError("invalid matcher_type")

    def _fake_db():
        return object()

    def _allow_write():
        return None

    app = FastAPI()
    app.include_router(watchlists_router.router)
    app.dependency_overrides[get_db] = _fake_db
    app.dependency_overrides[watchlists_router.require_write_access] = _allow_write
    monkeypatch.setattr(watchlists_router, "WatchlistsService", StubWatchlistsService)

    client = TestClient(app)
    response = client.post(
        "/api/v1/watchlists",
        json={
            "name": "Retry policy",
            "matcher_type": "topic_key",
            "matcher_value": "retry-policy",
            "delivery_channel": "dashboard",
            "enabled": True,
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "invalid matcher_type"


def test_watchlists_delete_and_trend_return_404_when_missing(monkeypatch) -> None:
    from apps.api.app.db import get_db
    from apps.api.app.routers import watchlists as watchlists_router

    class StubWatchlistsService:
        def __init__(self, db) -> None:  # noqa: ANN001
            self.db = db

        def delete_watchlist(self, *, watchlist_id: str) -> bool:
            return False

        def get_watchlist_trend(self, *, watchlist_id, limit_runs=3, limit_cards=18):  # noqa: ANN001
            return None

    def _fake_db():
        return object()

    def _allow_write():
        return None

    app = FastAPI()
    app.include_router(watchlists_router.router)
    app.dependency_overrides[get_db] = _fake_db
    app.dependency_overrides[watchlists_router.require_write_access] = _allow_write
    monkeypatch.setattr(watchlists_router, "WatchlistsService", StubWatchlistsService)

    client = TestClient(app)

    delete_response = client.delete("/api/v1/watchlists/wl-missing")
    assert delete_response.status_code == 404

    trend_response = client.get("/api/v1/watchlists/wl-missing/trend")
    assert trend_response.status_code == 404
