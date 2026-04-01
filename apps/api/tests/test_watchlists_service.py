from __future__ import annotations

import importlib
import os
from types import SimpleNamespace


def _load_watchlists_module():
    os.environ.setdefault("DATABASE_URL", "sqlite:////tmp/sourceharbor-watchlists-test.db")
    os.environ.setdefault("TEMPORAL_TARGET_HOST", "127.0.0.1:7233")
    os.environ.setdefault("TEMPORAL_NAMESPACE", "default")
    os.environ.setdefault("TEMPORAL_TASK_QUEUE", "sourceharbor-worker")
    os.environ.setdefault("SQLITE_STATE_PATH", "/tmp/sourceharbor-watchlists-test-state.db")
    module = importlib.import_module("apps.api.app.services.watchlists")
    return importlib.reload(module)


class FakeDb:
    def commit(self) -> None:
        return None

    def refresh(self, _obj) -> None:
        return None


def test_upsert_and_delete_watchlist_on_notification_config(monkeypatch) -> None:
    module = _load_watchlists_module()
    config = SimpleNamespace(category_rules={})
    monkeypatch.setattr(module, "get_notification_config", lambda db: config)

    service = module.WatchlistsService(FakeDb())
    created = service.upsert_watchlist(
        watchlist_id=None,
        name="Retry policy",
        matcher_type="topic_key",
        matcher_value="retry-policy",
        delivery_channel="dashboard",
        enabled=True,
    )

    assert created["name"] == "Retry policy"
    assert service.list_watchlists()[0]["matcher_value"] == "retry-policy"
    assert service.delete_watchlist(watchlist_id=created["id"]) is True
    assert service.list_watchlists() == []


def test_list_watchlists_normalizes_root_and_skips_invalid_items(monkeypatch) -> None:
    module = _load_watchlists_module()
    config = SimpleNamespace(
        category_rules={
            "watchlists": [
                {
                    "id": "wl-1",
                    "name": "Retry policy",
                    "matcher_type": "topic_key",
                    "matcher_value": "retry-policy",
                    "delivery_channel": "dashboard",
                    "enabled": True,
                    "created_at": "2026-03-31T10:00:00Z",
                    "updated_at": "2026-03-31T10:00:00Z",
                },
                {
                    "id": "",
                    "name": "Broken",
                    "matcher_type": "topic_key",
                    "matcher_value": "broken",
                    "delivery_channel": "dashboard",
                    "enabled": True,
                    "created_at": "2026-03-31T10:00:00Z",
                    "updated_at": "2026-03-31T10:00:00Z",
                },
            ],
            "youtube": {"channel": "UC123"},
        }
    )
    monkeypatch.setattr(module, "get_notification_config", lambda db: config)

    service = module.WatchlistsService(FakeDb())
    items = service.list_watchlists()

    assert items == [
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


def test_get_watchlist_trend_groups_cards_and_tracks_added_removed(monkeypatch) -> None:
    module = _load_watchlists_module()
    service = module.WatchlistsService(FakeDb())
    watchlist = {
        "id": "wl-1",
        "name": "Retry policy",
        "matcher_type": "topic_key",
        "matcher_value": "retry-policy",
        "delivery_channel": "dashboard",
        "enabled": True,
        "created_at": "2026-03-31T10:00:00Z",
        "updated_at": "2026-03-31T10:00:00Z",
    }
    monkeypatch.setattr(service, "list_watchlists", lambda: [watchlist])
    monkeypatch.setattr(
        service,
        "_load_matching_cards",
        lambda matcher_type, matcher_value, limit_cards: [
            {
                "card_id": "card-1",
                "job_id": "job-2",
                "video_id": "video-2",
                "platform": "youtube",
                "video_title": "Second run",
                "source_url": "https://example.com/2",
                "created_at": "2026-04-01T11:00:00Z",
                "card_type": "claim",
                "card_title": "Claim 1",
                "card_body": "Body 1",
                "source_section": "summary",
                "topic_key": "retry-policy",
                "topic_label": "Retry Policy",
                "claim_kind": "recommendation",
            },
            {
                "card_id": "card-2",
                "job_id": "job-1",
                "video_id": "video-1",
                "platform": "youtube",
                "video_title": "First run",
                "source_url": "https://example.com/1",
                "created_at": "2026-03-31T11:00:00Z",
                "card_type": "claim",
                "card_title": "Claim 2",
                "card_body": "Body 2",
                "source_section": "summary",
                "topic_key": "delivery",
                "topic_label": "Delivery",
                "claim_kind": "risk",
            },
        ],
    )

    payload = service.get_watchlist_trend(watchlist_id="wl-1", limit_runs=2, limit_cards=5)

    assert payload is not None
    assert payload["summary"]["recent_runs"] == 2
    assert payload["summary"]["matched_cards"] == 2
    assert payload["timeline"][0]["job_id"] == "job-2"
    assert payload["timeline"][0]["added_topics"] == ["retry-policy"]
    assert payload["timeline"][1]["removed_topics"] == ["retry-policy"]
    assert payload["timeline"][1]["added_claim_kinds"] == ["risk"]
    assert payload["timeline"][1]["removed_claim_kinds"] == ["recommendation"]


def test_get_watchlist_trend_returns_none_when_watchlist_is_missing() -> None:
    module = _load_watchlists_module()
    service = module.WatchlistsService(FakeDb())
    service.list_watchlists = list

    assert service.get_watchlist_trend(watchlist_id="missing") is None
