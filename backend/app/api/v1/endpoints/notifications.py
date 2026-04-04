"""
WellKOC — Notifications Endpoints
GET    /notifications                List notifications (paginated, filterable)
PUT    /notifications/{id}/read      Mark single notification read
PUT    /notifications/read-all       Mark all as read
GET    /notifications/unread-count   Count of unread notifications
"""
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.v1.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/notifications", tags=["Notifications"])

# ─────────────────────────────────────────────────────────────────────────────
# NOTE: Full notification model (app/models/notification.py) should be added
# in a future migration. For now, we use a lightweight in-memory + Redis cache
# approach that degrades gracefully when no DB table exists.
# ─────────────────────────────────────────────────────────────────────────────


async def _get_notifications_from_redis(user_id: str) -> list:
    """Fetch notifications from Redis (fallback when DB table not yet created)."""
    try:
        from app.core.redis import get_redis
        r = await get_redis()
        import json
        raw = await r.lrange(f"notifs:{user_id}", 0, 99)
        return [json.loads(item) for item in raw]
    except Exception:
        return []


@router.get("")
async def list_notifications(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    unread_only: bool = Query(False),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List notifications for the current user."""
    items = await _get_notifications_from_redis(str(current_user.id))
    if unread_only:
        items = [n for n in items if not n.get("read", False)]
    total = len(items)
    start = (page - 1) * per_page
    page_items = items[start: start + per_page]
    return {"items": page_items, "total": total, "page": page, "unread": sum(1 for n in items if not n.get("read", False))}


@router.get("/unread-count")
async def unread_count(
    current_user: User = Depends(get_current_user),
):
    """Return count of unread notifications."""
    try:
        from app.core.redis import get_redis
        import json
        r = await get_redis()
        raw = await r.lrange(f"notifs:{current_user.id}", 0, 199)
        count = sum(1 for item in raw if not json.loads(item).get("read", False))
    except Exception:
        count = 0
    return {"count": count}


@router.put("/read-all", status_code=200)
async def mark_all_read(
    current_user: User = Depends(get_current_user),
):
    """Mark all notifications as read."""
    try:
        from app.core.redis import get_redis
        import json
        r = await get_redis()
        key = f"notifs:{current_user.id}"
        raw = await r.lrange(key, 0, -1)
        if raw:
            updated = []
            for item in raw:
                n = json.loads(item)
                n["read"] = True
                updated.append(json.dumps(n))
            await r.delete(key)
            await r.rpush(key, *updated)
    except Exception:
        pass
    return {"status": "all read"}


@router.put("/{notification_id}/read", status_code=200)
async def mark_read(
    notification_id: str,
    current_user: User = Depends(get_current_user),
):
    """Mark a single notification as read."""
    try:
        from app.core.redis import get_redis
        import json
        r = await get_redis()
        key = f"notifs:{current_user.id}"
        raw = await r.lrange(key, 0, -1)
        updated = []
        found = False
        for item in raw:
            n = json.loads(item)
            if str(n.get("id")) == notification_id:
                n["read"] = True
                found = True
            updated.append(json.dumps(n))
        if found and updated:
            await r.delete(key)
            await r.rpush(key, *updated)
    except Exception:
        pass
    return {"id": notification_id, "read": True}
