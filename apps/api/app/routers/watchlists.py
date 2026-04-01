from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ..db import get_db
from ..security import require_write_access
from ..services.watchlists import WatchlistsService

router = APIRouter(prefix="/api/v1/watchlists", tags=["watchlists"])


class WatchlistResponse(BaseModel):
    id: str
    name: str
    matcher_type: str
    matcher_value: str
    delivery_channel: str
    enabled: bool
    created_at: str
    updated_at: str


class WatchlistUpsertRequest(BaseModel):
    id: str | None = None
    name: str = Field(min_length=1, max_length=120)
    matcher_type: str = Field(pattern="^(topic_key|claim_kind|platform|source_match)$")
    matcher_value: str = Field(min_length=1, max_length=200)
    delivery_channel: str = Field(default="dashboard", pattern="^(dashboard|email)$")
    enabled: bool = True


class WatchlistTrendCard(BaseModel):
    card_id: str
    job_id: str
    video_id: str
    platform: str
    video_title: str | None = None
    source_url: str | None = None
    created_at: str
    card_type: str
    card_title: str | None = None
    card_body: str
    source_section: str
    topic_key: str | None = None
    topic_label: str | None = None
    claim_kind: str | None = None


class WatchlistTrendRun(BaseModel):
    job_id: str
    video_id: str
    platform: str
    title: str
    source_url: str | None = None
    created_at: str
    matched_card_count: int
    cards: list[WatchlistTrendCard]
    topics: list[str]
    claim_kinds: list[str]
    added_topics: list[str]
    removed_topics: list[str]
    added_claim_kinds: list[str]
    removed_claim_kinds: list[str]


class WatchlistTrendSummary(BaseModel):
    recent_runs: int
    matched_cards: int
    matcher_type: str
    matcher_value: str


class WatchlistTrendResponse(BaseModel):
    watchlist: WatchlistResponse
    summary: WatchlistTrendSummary
    timeline: list[WatchlistTrendRun]


@router.get("", response_model=list[WatchlistResponse])
def list_watchlists(db: Session = Depends(get_db)):
    service = WatchlistsService(db)
    return [WatchlistResponse(**item) for item in service.list_watchlists()]


@router.post(
    "",
    response_model=WatchlistResponse,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(require_write_access)],
)
def upsert_watchlist(payload: WatchlistUpsertRequest, db: Session = Depends(get_db)):
    service = WatchlistsService(db)
    try:
        item = service.upsert_watchlist(
            watchlist_id=payload.id,
            name=payload.name,
            matcher_type=payload.matcher_type,
            matcher_value=payload.matcher_value,
            delivery_channel=payload.delivery_channel,
            enabled=payload.enabled,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return WatchlistResponse(**item)


@router.delete(
    "/{watchlist_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_write_access)],
)
def delete_watchlist(watchlist_id: str, db: Session = Depends(get_db)):
    service = WatchlistsService(db)
    deleted = service.delete_watchlist(watchlist_id=watchlist_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="watchlist not found")
    return None


@router.get("/{watchlist_id}/trend", response_model=WatchlistTrendResponse)
def get_watchlist_trend(
    watchlist_id: str,
    limit_runs: int = Query(default=3, ge=1, le=10),
    limit_cards: int = Query(default=18, ge=1, le=60),
    db: Session = Depends(get_db),
):
    service = WatchlistsService(db)
    payload = service.get_watchlist_trend(
        watchlist_id=watchlist_id,
        limit_runs=limit_runs,
        limit_cards=limit_cards,
    )
    if payload is None:
        raise HTTPException(status_code=404, detail="watchlist not found")
    return WatchlistTrendResponse(**payload)
