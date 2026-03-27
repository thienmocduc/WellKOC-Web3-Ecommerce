"""
WellKOC — Celery Worker Configuration
Tasks: commission settlement, DPP minting, notifications, AI jobs
"""
from celery import Celery
from celery.schedules import crontab

from app.core.config import settings

# ── Celery app ────────────────────────────────────────────────
celery_app = Celery(
    "wellkoc",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=[
        "app.workers.commission_worker",
        "app.workers.dpp_worker",
        "app.workers.notification_worker",
        "app.workers.ai_worker",
        "app.workers.pool_ranking_worker",
        "app.workers.gamification_worker",
        "app.workers.inventory_worker",
        "app.workers.report_worker",
        "app.workers.publisher_worker",
    ],
)

celery_app.conf.update(
    # Serialization
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],

    # Timezone
    timezone="Asia/Ho_Chi_Minh",
    enable_utc=True,

    # Task routing by priority queue
    task_default_queue="default",
    task_routes={
        "app.workers.commission_worker.*": {"queue": "critical"},  # Highest priority
        "app.workers.dpp_worker.*":        {"queue": "blockchain"},
        "app.workers.ai_worker.*":         {"queue": "ai"},
        "app.workers.notification_worker.*": {"queue": "notifications"},
        "app.workers.pool_ranking_worker.*": {"queue": "analytics"},
        "app.workers.inventory_worker.*":  {"queue": "default"},
        "app.workers.report_worker.*":     {"queue": "default"},
        "app.workers.publisher_worker.*":  {"queue": "publisher"},
    },

    # Retry settings
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    task_max_retries=3,
    task_soft_time_limit=120,  # 2 min soft limit
    task_time_limit=300,       # 5 min hard limit

    # Result expiry
    result_expires=3600,  # 1 hour
)

# ── Scheduled tasks (Celery Beat) ────────────────────────────
celery_app.conf.beat_schedule = {
    # Batch commission settlement every 15 minutes
    "settle-commissions": {
        "task": "app.workers.commission_worker.settle_pending_commissions",
        "schedule": crontab(minute="*/15"),
    },
    # Weekly Pool A/B/C ranking (Monday 00:00 VN time)
    "weekly-pool-ranking": {
        "task": "app.workers.pool_ranking_worker.calculate_weekly_pool",
        "schedule": crontab(hour=0, minute=0, day_of_week=1),
    },
    # Daily inventory check + auto reorder alerts
    "inventory-check": {
        "task": "app.workers.inventory_worker.check_low_stock",
        "schedule": crontab(hour=8, minute=0),  # 8am daily
    },
    # Daily KOC performance report (7am)
    "koc-daily-report": {
        "task": "app.workers.report_worker.generate_koc_reports",
        "schedule": crontab(hour=7, minute=0),
    },
    # AI model metrics collect (every hour)
    "ai-metrics": {
        "task": "app.workers.ai_worker.collect_agent_metrics",
        "schedule": crontab(minute=0),
    },
    # Weekly XP reset (Monday 00:00 before leaderboard snapshot)
    "reset-weekly-xp": {
        "task": "app.workers.gamification_worker.reset_weekly_xp",
        "schedule": crontab(hour=0, minute=0, day_of_week=1),
    },
    # Leaderboard snapshot (Monday 00:05)
    "snapshot-leaderboard": {
        "task": "app.workers.gamification_worker.snapshot_leaderboard",
        "schedule": crontab(hour=0, minute=5, day_of_week=1),
    },
    # Auto-expire group buys (every 5 min)
    "groupbuy-expire": {
        "task": "app.workers.commission_worker.expire_group_buys",
        "schedule": crontab(minute="*/5"),
    },
}
