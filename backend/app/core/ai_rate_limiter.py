"""
WellKOC — AI Rate Limiter (Redis sliding-window)
Enforces AI_RATE_LIMIT_PER_MIN per user (authenticated) or per IP (public).

Usage:
    @router.post("/caption")
    async def generate_caption(
        body: CaptionRequest,
        current_user: User = Depends(get_current_user),
        _: None = Depends(ai_rate_limit),
    ):
        ...

For public (no-auth) endpoints use ai_rate_limit_ip dependency instead.
"""
from __future__ import annotations

from fastapi import Depends, HTTPException, Request

from app.core.config import settings
from app.core.redis_client import redis_client
from app.api.v1.deps import get_current_user, CurrentUser
from app.models.user import User


async def _check_limit(key: str, limit: int, window: int = 60) -> None:
    """
    Sliding-window rate limiter backed by Redis.
    key    — unique identifier (user:{id} or ip:{addr})
    limit  — max calls allowed per window
    window — window size in seconds (default 60)
    Raises HTTP 429 if limit exceeded.
    Falls through silently if Redis is unavailable (graceful degradation).
    """
    if not redis_client:
        return  # Redis not running — skip enforcement, log warning
    try:
        rkey = f"ai_rl:{key}"
        count = await redis_client.incr(rkey)
        if count == 1:
            await redis_client.expire(rkey, window)
        if count > limit:
            ttl = await redis_client.ttl(rkey)
            raise HTTPException(
                status_code=429,
                detail={
                    "error": "ai_rate_limit_exceeded",
                    "message": f"Giới hạn {limit} yêu cầu AI/phút. Thử lại sau {ttl}s.",
                    "retry_after": ttl,
                    "limit": limit,
                },
                headers={"Retry-After": str(max(ttl, 1))},
            )
    except HTTPException:
        raise
    except Exception:
        pass  # Redis error — graceful degradation


async def ai_rate_limit(
    current_user: User = Depends(get_current_user),
) -> None:
    """Authenticated AI rate limit — per user ID."""
    await _check_limit(
        key=f"user:{current_user.id}",
        limit=settings.AI_RATE_LIMIT_PER_MIN,
    )


async def ai_rate_limit_ip(request: Request) -> None:
    """Public AI rate limit — per client IP (stricter: 20/min)."""
    ip = (
        request.headers.get("X-Forwarded-For", "").split(",")[0].strip()
        or request.client.host
        or "unknown"
    )
    await _check_limit(
        key=f"ip:{ip}",
        limit=20,  # Stricter for unauthenticated
    )
