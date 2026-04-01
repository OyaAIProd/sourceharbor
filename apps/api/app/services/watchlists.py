from __future__ import annotations

from collections import defaultdict
from datetime import UTC, datetime
from typing import Any
from uuid import uuid4

from sqlalchemy import text
from sqlalchemy.exc import DBAPIError
from sqlalchemy.orm import Session

from ..models import NotificationConfig
from .notifications import get_notification_config

WATCHLIST_MATCHER_TYPES = {"topic_key", "claim_kind", "platform", "source_match"}
WATCHLIST_DELIVERY_CHANNELS = {"dashboard", "email"}


class WatchlistsService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_watchlists(self) -> list[dict[str, Any]]:
        config = get_notification_config(self.db)
        return self._read_watchlists(config)

    def upsert_watchlist(
        self,
        *,
        watchlist_id: str | None,
        name: str,
        matcher_type: str,
        matcher_value: str,
        delivery_channel: str,
        enabled: bool,
    ) -> dict[str, Any]:
        config = get_notification_config(self.db)
        items = self._read_watchlists(config)
        now = datetime.now(UTC).isoformat()
        normalized_matcher_type = self._normalize_matcher_type(matcher_type)
        normalized_delivery = self._normalize_delivery_channel(delivery_channel)

        if watchlist_id:
            for item in items:
                if item["id"] == watchlist_id:
                    item.update(
                        {
                            "name": name.strip(),
                            "matcher_type": normalized_matcher_type,
                            "matcher_value": matcher_value.strip(),
                            "delivery_channel": normalized_delivery,
                            "enabled": enabled,
                            "updated_at": now,
                        }
                    )
                    self._write_watchlists(config, items)
                    return item

        created = {
            "id": str(uuid4()),
            "name": name.strip(),
            "matcher_type": normalized_matcher_type,
            "matcher_value": matcher_value.strip(),
            "delivery_channel": normalized_delivery,
            "enabled": enabled,
            "created_at": now,
            "updated_at": now,
        }
        items.append(created)
        self._write_watchlists(config, items)
        return created

    def delete_watchlist(self, *, watchlist_id: str) -> bool:
        config = get_notification_config(self.db)
        items = self._read_watchlists(config)
        remaining = [item for item in items if item["id"] != watchlist_id]
        if len(remaining) == len(items):
            return False
        self._write_watchlists(config, remaining)
        return True

    def get_watchlist_trend(
        self,
        *,
        watchlist_id: str,
        limit_runs: int = 3,
        limit_cards: int = 18,
    ) -> dict[str, Any] | None:
        watchlist = next(
            (item for item in self.list_watchlists() if item["id"] == watchlist_id),
            None,
        )
        if watchlist is None:
            return None

        rows = self._load_matching_cards(
            matcher_type=watchlist["matcher_type"],
            matcher_value=watchlist["matcher_value"],
            limit_cards=max(limit_cards, limit_runs * 6),
        )
        grouped: dict[str, dict[str, Any]] = {}
        cards_per_job: dict[str, list[dict[str, Any]]] = defaultdict(list)
        for row in rows:
            job_id = row["job_id"]
            cards_per_job[job_id].append(row)
            if job_id not in grouped:
                grouped[job_id] = {
                    "job_id": job_id,
                    "video_id": row["video_id"],
                    "platform": row["platform"],
                    "title": row["video_title"] or row["job_id"],
                    "source_url": row["source_url"],
                    "created_at": row["created_at"],
                }

        recent_runs = sorted(grouped.values(), key=lambda item: item["created_at"], reverse=True)[
            :limit_runs
        ]

        timeline: list[dict[str, Any]] = []
        previous_topics: set[str] = set()
        previous_claims: set[str] = set()
        for run in recent_runs:
            cards = cards_per_job.get(run["job_id"], [])
            topics = {
                str(card.get("topic_key") or "").strip()
                for card in cards
                if str(card.get("topic_key") or "").strip()
            }
            claims = {
                str(card.get("claim_kind") or "").strip()
                for card in cards
                if str(card.get("claim_kind") or "").strip()
            }
            timeline.append(
                {
                    **run,
                    "matched_card_count": len(cards),
                    "cards": cards[:limit_cards],
                    "topics": sorted(topics),
                    "claim_kinds": sorted(claims),
                    "added_topics": sorted(topics - previous_topics),
                    "removed_topics": sorted(previous_topics - topics),
                    "added_claim_kinds": sorted(claims - previous_claims),
                    "removed_claim_kinds": sorted(previous_claims - claims),
                }
            )
            previous_topics = topics
            previous_claims = claims

        return {
            "watchlist": watchlist,
            "summary": {
                "recent_runs": len(timeline),
                "matched_cards": len(rows),
                "matcher_type": watchlist["matcher_type"],
                "matcher_value": watchlist["matcher_value"],
            },
            "timeline": timeline,
        }

    def _load_matching_cards(
        self,
        *,
        matcher_type: str,
        matcher_value: str,
        limit_cards: int,
    ) -> list[dict[str, Any]]:
        normalized_type = self._normalize_matcher_type(matcher_type)
        normalized_value = matcher_value.strip().lower()
        conditions = {
            "topic_key": "LOWER(COALESCE(k.metadata_json->>'topic_key', '')) = :matcher_value",
            "claim_kind": "LOWER(COALESCE(k.metadata_json->>'claim_kind', '')) = :matcher_value",
            "platform": "LOWER(COALESCE(v.platform, '')) = :matcher_value",
            "source_match": (
                "LOWER(COALESCE(v.source_url, '')) LIKE :matcher_like "
                "OR LOWER(COALESCE(v.title, '')) LIKE :matcher_like"
            ),
        }
        statement = text(
            f"""
            SELECT
                CAST(k.id AS TEXT) AS card_id,
                CAST(k.job_id AS TEXT) AS job_id,
                CAST(k.video_id AS TEXT) AS video_id,
                COALESCE(v.platform, '') AS platform,
                COALESCE(v.title, '') AS video_title,
                COALESCE(v.source_url, '') AS source_url,
                CAST(j.created_at AS TEXT) AS created_at,
                COALESCE(k.card_type, '') AS card_type,
                COALESCE(k.title, '') AS card_title,
                COALESCE(k.body, '') AS card_body,
                COALESCE(k.source_section, '') AS source_section,
                COALESCE(k.metadata_json->>'topic_key', '') AS topic_key,
                COALESCE(k.metadata_json->>'topic_label', '') AS topic_label,
                COALESCE(k.metadata_json->>'claim_kind', '') AS claim_kind
            FROM knowledge_cards k
            JOIN jobs j ON j.id = k.job_id
            JOIN videos v ON v.id = k.video_id
            WHERE {conditions[normalized_type]}
            ORDER BY j.created_at DESC, k.ordinal ASC
            LIMIT :limit_cards
            """
        )
        params = {
            "matcher_value": normalized_value,
            "matcher_like": f"%{normalized_value}%",
            "limit_cards": max(1, limit_cards),
        }
        try:
            rows = self.db.execute(statement, params).mappings().all()
        except DBAPIError:
            self.db.rollback()
            return []
        return [
            {
                "card_id": row["card_id"],
                "job_id": row["job_id"],
                "video_id": row["video_id"],
                "platform": row["platform"] or "unknown",
                "video_title": row["video_title"] or None,
                "source_url": row["source_url"] or None,
                "created_at": row["created_at"],
                "card_type": row["card_type"] or "unknown",
                "card_title": row["card_title"] or None,
                "card_body": row["card_body"] or "",
                "source_section": row["source_section"] or "",
                "topic_key": row["topic_key"] or None,
                "topic_label": row["topic_label"] or None,
                "claim_kind": row["claim_kind"] or None,
            }
            for row in rows
        ]

    def _read_watchlists(self, config: NotificationConfig) -> list[dict[str, Any]]:
        raw = config.category_rules if isinstance(config.category_rules, dict) else {}
        normalized_root = self._normalize_category_rules_root(raw)
        items = normalized_root.get("watchlists")
        if not isinstance(items, list):
            return []
        normalized_items: list[dict[str, Any]] = []
        for item in items:
            if not isinstance(item, dict):
                continue
            try:
                normalized_items.append(
                    {
                        "id": str(item.get("id") or "").strip(),
                        "name": str(item.get("name") or "").strip(),
                        "matcher_type": self._normalize_matcher_type(str(item.get("matcher_type") or "")),
                        "matcher_value": str(item.get("matcher_value") or "").strip(),
                        "delivery_channel": self._normalize_delivery_channel(
                            str(item.get("delivery_channel") or "")
                        ),
                        "enabled": bool(item.get("enabled", True)),
                        "created_at": str(item.get("created_at") or "").strip(),
                        "updated_at": str(item.get("updated_at") or "").strip(),
                    }
                )
            except ValueError:
                continue
        return [item for item in normalized_items if item["id"] and item["name"] and item["matcher_value"]]

    def _write_watchlists(self, config: NotificationConfig, items: list[dict[str, Any]]) -> None:
        raw = config.category_rules if isinstance(config.category_rules, dict) else {}
        normalized_root = self._normalize_category_rules_root(raw)
        normalized_root["watchlists"] = items
        config.category_rules = normalized_root
        self.db.commit()
        self.db.refresh(config)

    def _normalize_category_rules_root(self, raw: dict[str, Any]) -> dict[str, Any]:
        if isinstance(raw.get("category_rules"), dict):
            normalized = dict(raw)
            normalized["category_rules"] = dict(raw["category_rules"])
            return normalized

        category_rules = {
            key: value for key, value in raw.items() if isinstance(value, dict) and key != "watchlists"
        }
        normalized: dict[str, Any] = {"category_rules": category_rules}
        default_rule = raw.get("default_rule")
        if isinstance(default_rule, dict):
            normalized["default_rule"] = default_rule
        watchlists = raw.get("watchlists")
        if isinstance(watchlists, list):
            normalized["watchlists"] = watchlists
        return normalized

    def _normalize_matcher_type(self, raw: str) -> str:
        value = raw.strip().lower()
        if value not in WATCHLIST_MATCHER_TYPES:
            raise ValueError("invalid matcher_type")
        return value

    def _normalize_delivery_channel(self, raw: str) -> str:
        value = raw.strip().lower() or "dashboard"
        if value not in WATCHLIST_DELIVERY_CHANNELS:
            raise ValueError("invalid delivery_channel")
        return value
