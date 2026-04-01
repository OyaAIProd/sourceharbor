from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ..db import get_db
from ..services.ops import OpsService

router = APIRouter(prefix="/api/v1/ops", tags=["ops"])


@router.get("/inbox")
def get_ops_inbox(
    limit: int = Query(default=5, ge=1, le=20),
    window_hours: int = Query(default=24, ge=1, le=168),
    db: Session = Depends(get_db),
):
    service = OpsService(db)
    return service.get_inbox(limit=limit, window_hours=window_hours)
