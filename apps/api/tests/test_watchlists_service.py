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
