"""
WellKOC Platform — FastAPI Application Entry Point
"""
import time
from contextlib import asynccontextmanager

import sentry_sdk
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from prometheus_fastapi_instrumentator import Instrumentator

from app.core.config import settings
from app.core.database import init_db, close_db
from app.core.redis_client import init_redis, close_redis
from app.api.v1.router import api_router


# ── Sentry (production error tracking) ──────────────────────
if settings.SENTRY_DSN and settings.is_production:
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        environment=settings.APP_ENV,
        traces_sample_rate=0.1,
        release=settings.APP_VERSION,
    )


# ── Lifespan (startup / shutdown) ───────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    await init_redis()
    print(f"✅ WellKOC {settings.APP_VERSION} started [{settings.APP_ENV}]")
    yield
    # Shutdown
    await close_db()
    await close_redis()
    print("🛑 WellKOC shutdown complete")


# ── App factory ─────────────────────────────────────────────
def create_app() -> FastAPI:
    app = FastAPI(
        title="WellKOC API",
        description="Web3 Social Commerce Platform API — Vietnam",
        version=settings.APP_VERSION,
        docs_url="/docs" if not settings.is_production else None,
        redoc_url="/redoc" if not settings.is_production else None,
        openapi_url="/openapi.json" if not settings.is_production else None,
        lifespan=lifespan,
    )

    # ── Middleware ───────────────────────────────────────────
    app.add_middleware(GZipMiddleware, minimum_size=1000)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["X-Request-ID", "X-RateLimit-Remaining"],
    )

    # ── Request timing middleware ────────────────────────────
    @app.middleware("http")
    async def add_process_time(request: Request, call_next):
        start = time.perf_counter()
        response = await call_next(request)
        duration = time.perf_counter() - start
        response.headers["X-Process-Time"] = f"{duration:.4f}"
        return response

    # ── Prometheus metrics ───────────────────────────────────
    Instrumentator(
        should_group_status_codes=False,
        should_ignore_untemplated=True,
        excluded_handlers=["/health", "/metrics"],
    ).instrument(app).expose(app, endpoint=settings.PROMETHEUS_METRICS_PATH)

    # ── Routers ──────────────────────────────────────────────
    app.include_router(api_router, prefix="/api/v1")

    # ── Health check ─────────────────────────────────────────
    @app.get("/health", tags=["System"])
    async def health():
        return {
            "status": "ok",
            "app": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "env": settings.APP_ENV,
        }

    @app.get("/ready", tags=["System"])
    async def readiness():
        """Deep readiness: checks DB + Redis + Polygon RPC"""
        checks = {"database": False, "redis": False}
        try:
            from app.core.database import async_session
            async with async_session() as session:
                await session.execute("SELECT 1")
            checks["database"] = True
        except Exception:
            pass
        try:
            from app.core.redis_client import redis_client
            await redis_client.ping()
            checks["redis"] = True
        except Exception:
            pass

        all_ok = all(checks.values())
        return JSONResponse(
            status_code=200 if all_ok else 503,
            content={"status": "ready" if all_ok else "degraded", "checks": checks},
        )

    # ── Global exception handler ─────────────────────────────
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        if settings.is_development:
            raise exc
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error", "type": type(exc).__name__},
        )

    return app


app = create_app()
