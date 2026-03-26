"""WellKOC — Redis async client"""
from typing import Optional
import redis.asyncio as aioredis
from app.core.config import settings

redis_client: Optional[aioredis.Redis] = None

async def init_redis() -> None:
    global redis_client
    redis_client = await aioredis.from_url(
        settings.REDIS_URL,
        encoding="utf-8",
        decode_responses=True,
        max_connections=20,
    )

async def close_redis() -> None:
    if redis_client:
        await redis_client.aclose()

async def get_redis() -> aioredis.Redis:
    if not redis_client:
        raise RuntimeError("Redis not initialized")
    return redis_client
