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
    assert payload["merged_stories"][0]["story_key"] == "topic:retry-policy"
    assert payload["merged_stories"][0]["headline"] == "Retry Policy"
    assert payload["merged_stories"][0]["platforms"] == ["youtube"]
    assert payload["merged_stories"][0]["run_ids"] == ["job-2"]
    assert payload["merged_stories"][1]["story_key"] == "topic:delivery"


def test_get_watchlist_trend_returns_none_when_watchlist_is_missing() -> None:
    module = _load_watchlists_module()
    service = module.WatchlistsService(FakeDb())
    service.list_watchlists = list

    assert service.get_watchlist_trend(watchlist_id="missing") is None


def test_get_watchlist_briefing_builds_summary_differences_and_evidence(monkeypatch) -> None:
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
    monkeypatch.setattr(
        service,
        "get_watchlist_trend",
        lambda **_: {
            "watchlist": watchlist,
            "summary": {
                "recent_runs": 2,
                "matched_cards": 4,
                "matcher_type": "topic_key",
                "matcher_value": "retry-policy",
            },
            "timeline": [
                {
                    "job_id": "job-2",
                    "video_id": "video-2",
                    "platform": "youtube",
                    "title": "Second run",
                    "source_url": "https://example.com/2",
                    "created_at": "2026-04-01T11:00:00Z",
                    "matched_card_count": 2,
                    "cards": [],
                    "topics": ["retry-policy"],
                    "claim_kinds": ["recommendation"],
                    "added_topics": ["retry-policy"],
                    "removed_topics": [],
                    "added_claim_kinds": ["recommendation"],
                    "removed_claim_kinds": [],
                },
                {
                    "job_id": "job-1",
                    "video_id": "video-1",
                    "platform": "rss",
                    "title": "First run",
                    "source_url": "https://example.com/1",
                    "created_at": "2026-03-31T11:00:00Z",
                    "matched_card_count": 2,
                    "cards": [],
                    "topics": ["delivery"],
                    "claim_kinds": ["risk"],
                    "added_topics": [],
                    "removed_topics": ["delivery"],
                    "added_claim_kinds": [],
                    "removed_claim_kinds": ["risk"],
                },
            ],
            "merged_stories": [
                {
                    "id": "story-1",
                    "story_key": "topic:retry-policy",
                    "headline": "Retry Policy",
                    "topic_key": "retry-policy",
                    "topic_label": "Retry Policy",
                    "latest_created_at": "2026-04-01T11:00:00Z",
                    "matched_card_count": 2,
                    "platforms": ["youtube", "rss"],
                    "claim_kinds": ["recommendation"],
                    "source_urls": ["https://example.com/1", "https://example.com/2"],
                    "run_ids": ["job-1", "job-2"],
                    "cards": [
                        {
                            "card_id": "card-1",
                            "job_id": "job-2",
                            "video_id": "video-2",
                            "platform": "youtube",
                            "video_title": "Second run",
                            "source_url": "https://example.com/2",
                            "created_at": "2026-04-01T11:00:00Z",
                            "card_type": "claim",
                            "card_title": "Retry policy claim",
                            "card_body": "Retry policy is now explicit.",
                            "source_section": "summary",
                            "topic_key": "retry-policy",
                            "topic_label": "Retry Policy",
                            "claim_kind": "recommendation",
                        }
                    ],
                }
            ],
        },
    )
    monkeypatch.setattr(
        service,
        "_build_briefing_compare",
        lambda **_: {
            "job_id": "job-2",
            "has_previous": True,
            "previous_job_id": "job-1",
            "changed": True,
            "added_lines": 3,
            "removed_lines": 1,
            "diff_excerpt": "--- old\n+++ new",
            "compare_route": "/jobs?job_id=job-2",
        },
    )

    payload = service.get_watchlist_briefing(watchlist_id="wl-1")

    assert payload is not None
    assert "Retry policy currently converges on Retry Policy." in payload["summary"]["overview"]
    assert payload["summary"]["signals"][0]["story_key"] == "topic:retry-policy"
    assert payload["differences"]["latest_job_id"] == "job-2"
    assert payload["differences"]["new_story_keys"] == []
    assert payload["differences"]["compare"]["compare_route"] == "/jobs?job_id=job-2"
    assert payload["differences"]["compare"]["job_id"] == "job-2"
    assert payload["evidence"]["stories"][0]["routes"]["job_bundle"] == "/api/v1/jobs/job-2/bundle"
    assert (
        payload["evidence"]["stories"][0]["routes"]["job_knowledge_cards"]
        == "/knowledge?job_id=job-2"
    )
    assert (
        payload["evidence"]["featured_runs"][0]["routes"]["watchlist_trend"]
        == "/trends?watchlist_id=wl-1"
    )


def test_get_watchlist_briefing_exposes_summary_differences_and_evidence(monkeypatch) -> None:
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
                "job_id": "00000000-0000-4000-8000-000000000002",
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
                "job_id": "00000000-0000-4000-8000-000000000001",
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
    monkeypatch.setattr(
        service,
        "_build_briefing_compare",
        lambda latest_run: {
            "job_id": "00000000-0000-4000-8000-000000000002",
            "has_previous": True,
            "previous_job_id": "00000000-0000-4000-8000-000000000001",
            "changed": True,
            "added_lines": 2,
            "removed_lines": 1,
            "diff_excerpt": "@@ latest diff @@",
            "compare_route": "/jobs?job_id=00000000-0000-4000-8000-000000000002",
        },
    )

    payload = service.get_watchlist_briefing(
        watchlist_id="wl-1",
        limit_runs=2,
        limit_cards=5,
        limit_stories=2,
        limit_evidence_per_story=1,
    )

    assert payload is not None
    assert payload["summary"]["primary_story_headline"] == "Retry Policy"
    assert payload["summary"]["signals"][0]["story_key"] == "topic:retry-policy"
    assert payload["differences"]["new_story_keys"] == ["topic:retry-policy"]
    assert payload["differences"]["removed_story_keys"] == ["topic:delivery"]
    assert (
        payload["differences"]["compare"]["compare_route"]
        == "/jobs?job_id=00000000-0000-4000-8000-000000000002"
    )
    assert (
        payload["evidence"]["suggested_story_id"] == payload["evidence"]["stories"][0]["story_id"]
    )
    assert (
        payload["evidence"]["stories"][0]["routes"]["watchlist_trend"]
        == "/trends?watchlist_id=wl-1"
    )
    assert payload["evidence"]["stories"][0]["routes"]["job_bundle"].endswith("/bundle")
    assert (
        payload["evidence"]["featured_runs"][0]["routes"]["job_knowledge_cards"]
        == "/knowledge?job_id=00000000-0000-4000-8000-000000000002"
    )


def test_get_watchlist_briefing_returns_none_when_watchlist_is_missing() -> None:
    module = _load_watchlists_module()
    service = module.WatchlistsService(FakeDb())
    service.list_watchlists = list

    assert service.get_watchlist_briefing(watchlist_id="missing") is None


def test_get_watchlist_briefing_page_adds_selected_story_and_routes(monkeypatch) -> None:
    module = _load_watchlists_module()
    service = module.WatchlistsService(FakeDb())
    briefing_payload = {
        "watchlist": {
            "id": "wl-1",
            "name": "Retry policy",
            "matcher_type": "topic_key",
            "matcher_value": "retry-policy",
            "delivery_channel": "dashboard",
            "enabled": True,
            "created_at": "2026-03-31T10:00:00Z",
            "updated_at": "2026-03-31T10:00:00Z",
        },
        "summary": {
            "overview": "Retry policy currently converges across recent sources.",
            "source_count": 2,
            "run_count": 2,
            "story_count": 1,
            "matched_cards": 2,
            "primary_story_headline": "Retry Policy",
            "signals": [],
        },
        "differences": {
            "compare": {
                "job_id": "job-2",
                "has_previous": True,
                "previous_job_id": "job-1",
                "changed": True,
                "added_lines": 2,
                "removed_lines": 1,
                "diff_excerpt": "@@ latest diff @@",
                "compare_route": "/jobs?job_id=job-2",
            }
        },
        "evidence": {
            "suggested_story_id": "story-1",
            "stories": [
                {
                    "story_id": "story-1",
                    "story_key": "topic:retry-policy",
                    "headline": "Retry Policy",
                    "topic_key": "retry-policy",
                    "topic_label": "Retry Policy",
                    "source_count": 2,
                    "run_count": 2,
                    "matched_card_count": 1,
                    "platforms": ["youtube"],
                    "claim_kinds": ["recommendation"],
                    "source_urls": ["https://example.com/retry"],
                    "latest_run_job_id": "job-2",
                    "evidence_cards": [],
                    "routes": {
                        "watchlist_trend": "/trends?watchlist_id=wl-1",
                        "briefing": "/briefings?watchlist_id=wl-1&story_id=story-1",
                        "ask": "/ask?watchlist_id=wl-1&question=Retry+Policy&story_id=story-1&topic_key=retry-policy",
                        "job_compare": "/jobs?job_id=job-2",
                        "job_bundle": "/api/v1/jobs/job-2/bundle",
                        "job_knowledge_cards": "/knowledge?job_id=job-2",
                    },
                }
            ],
            "featured_runs": [],
        },
    }
    monkeypatch.setattr(service, "get_watchlist_briefing", lambda **_: briefing_payload)

    payload = service.get_watchlist_briefing_page(watchlist_id="wl-1")

    assert payload is not None
    assert payload["context"]["selected_story_id"] == "story-1"
    assert payload["context"]["selection_basis"] == "suggested_story_id"
    assert payload["briefing"]["selection"]["selected_story_id"] == "story-1"
    assert payload["selected_story"]["story_id"] == "story-1"
    assert payload["compare_route"] == "/jobs?job_id=job-2"
    assert payload["ask_route"].endswith("story_id=story-1&topic_key=retry-policy")
