"""
WellKOC — Async SQLAlchemy Database Configuration
"""
import ssl
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    AsyncEngine,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import NullPool

from app.core.config import settings

# ── Engine ──────────────────────────────────────────────────
_is_production = settings.APP_ENV == "production"
_is_test = settings.APP_ENV == "test"

# In production, prefer the Supabase TRANSACTION pooler (port 6543).
# Auto-rewrite so we don't need a Render env var change.
_db_url = settings.DATABASE_URL
if _is_production and "pooler.supabase.com:5432/" in _db_url:
    _db_url = _db_url.replace("pooler.supabase.com:5432/", "pooler.supabase.com:6543/")

if _is_production:
    # Supabase Supavisor uses a self-signed cert in the chain.
    # Use PROTOCOL_TLS_CLIENT with check_hostname/verify disabled.
    _ssl_ctx = ssl.create_default_context()
    _ssl_ctx.check_hostname = False
    _ssl_ctx.verify_mode = ssl.CERT_NONE

    _pool_kwargs: dict = {}
    _connect_args: dict = {
        "ssl": _ssl_ctx,
        "prepared_statement_cache_size": 0,   # required for PgBouncer
        "timeout": 15,
        "command_timeout": 30,
    }
    _poolclass = NullPool
elif _is_test:
    _pool_kwargs = {}
    _connect_args = {}
    _poolclass = NullPool
else:
    _pool_kwargs = {"pool_size": settings.DB_POOL_SIZE, "max_overflow": settings.DB_MAX_OVERFLOW}
    _connect_args = {}
    _poolclass = None

engine: AsyncEngine = create_async_engine(
    _db_url,
    **_pool_kwargs,
    echo=settings.DB_ECHO,
    future=True,
    poolclass=_poolclass,
    connect_args=_connect_args,
)

# ── Session factory ─────────────────────────────────────────
async_session: async_sessionmaker[AsyncSession] = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)


# ── Base model class ────────────────────────────────────────
class Base(DeclarativeBase):
    pass


# ── Lifecycle ───────────────────────────────────────────────
async def init_db() -> None:
    """Import all models to register them with SQLAlchemy metadata.
    In development: auto-creates tables via create_all.
    In production: use Alembic migrations; no DB connection needed here.
    """
    from app.models import (  # noqa: F401
        user, product, order, cart, review,
        koc_profile, vendor, shipment, dpp_nft, membership,
        return_request, group_buy, live_stream, social,
        pool_ranking, flash_sale,
        recommendation, social_comment, coaching_report,
        publish_job, fraud,
        shopping_event, compliance, analytics, gamification,
    )
    # Only connect to DB in development — production uses Alembic migrations
    if settings.is_development:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)


async def close_db() -> None:
    await engine.dispose()


# ── Dependency injection ─────────────────────────────────────
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
