"""
WellKOC — Gamification Worker
Celery tasks to award WK after real events.
Called from: order_service, commission_worker, content_service, etc.
"""
import asyncio
import logging
from uuid import UUID

from celery import shared_task

logger = logging.getLogger(__name__)


@shared_task(name="app.workers.gamification_worker.award_order_wk", queue="default")
def award_order_wk(user_id: str, order_id: str, role: str) -> dict:
    """Award WK after order is delivered. Triggered by order state machine."""
    async def _run():
        from app.core.database import async_session
        from app.services.gamification_service import GamificationService
        from app.models.gamification import WKEvent

        async with async_session() as db:
            svc = GamificationService(db)
            uid = UUID(user_id)

            # Buyer: WK for completing order
            if role == "buyer":
                result = await svc.award_wk(uid, WKEvent.ORDER_COMPLETED, reference_id=order_id)
                await db.commit()
                return result

            # KOC: WK for T1 referral order
            elif role == "koc_t1":
                result = await svc.award_wk(uid, WKEvent.ORDER_REFERRED, reference_id=order_id)
                # Check GMV milestones
                await _check_gmv_milestones(db, svc, uid)
                await db.commit()
                return result

            # KOC T2
            elif role == "koc_t2":
                result = await svc.award_wk(uid, WKEvent.ORDER_T2_REFERRED, reference_id=order_id)
                await db.commit()
                return result

        return {}

    async def _check_gmv_milestones(db, svc, user_id):
        """Check if KOC hit a GMV milestone achievement"""
        from sqlalchemy import select, func
        from app.models.order import Commission, CommissionStatus
        from app.models.order import Order

        # Get total GMV this KOC has generated
        r = await db.execute(
            select(func.sum(Commission.base_amount)).where(
                Commission.koc_id == user_id,
                Commission.status == CommissionStatus.SETTLED,
                Commission.commission_type == "t1",
            )
        )
        total_gmv = float(r.scalar() or 0)

        # GMV milestone achievements
        milestones = {
            1_000_000:   "sales_1m",
            10_000_000:  "sales_10m",
            100_000_000: "sales_100m",
        }
        for threshold, ach_id in milestones.items():
            if total_gmv >= threshold:
                await svc.unlock_achievement(user_id, ach_id)

    return asyncio.run(_run())


@shared_task(name="app.workers.gamification_worker.award_content_wk", queue="default")
def award_content_wk(user_id: str, content_type: str, metadata: dict = None) -> dict:
    """Award WK when KOC posts content or goes live."""
    async def _run():
        from app.core.database import async_session
        from app.services.gamification_service import GamificationService
        from app.models.gamification import WKEvent

        async with async_session() as db:
            svc = GamificationService(db)
            uid = UUID(user_id)
            event_map = {
                "post":      WKEvent.CONTENT_POSTED,
                "live":      WKEvent.LIVE_HOSTED,
                "live_1k":   WKEvent.LIVE_1K_VIEWERS,
            }
            event = event_map.get(content_type)
            if not event:
                return {}

            result = await svc.award_wk(uid, event, metadata=metadata)

            # Check content achievements
            if content_type == "live":
                await svc.unlock_achievement(uid, "first_live")
            if content_type == "live_1k":
                await svc.unlock_achievement(uid, "live_1k_viewers")

            await db.commit()
            return result

    return asyncio.run(_run())


@shared_task(name="app.workers.gamification_worker.award_web3_wk", queue="blockchain")
def award_web3_wk(user_id: str, action: str, metadata: dict = None) -> dict:
    """Award WK for Web3/blockchain actions."""
    async def _run():
        from app.core.database import async_session
        from app.services.gamification_service import GamificationService
        from app.models.gamification import WKEvent

        async with async_session() as db:
            svc = GamificationService(db)
            uid = UUID(user_id)

            action_map = {
                "dpp_scan":         (WKEvent.DPP_VERIFIED_PURCHASE, "first_dpp_scan"),
                "wallet_connected": (WKEvent.ORDER_COMPLETED, "wallet_connected"),  # placeholder WK
                "first_onchain_tx": (WKEvent.ORDER_COMPLETED, "first_onchain_tx"),
                "nft_minted":       (WKEvent.ORDER_COMPLETED, "nft_minted"),
                "creator_token":    (WKEvent.ORDER_COMPLETED, "creator_token"),
                "dpp_mint":         (WKEvent.VENDOR_FIRST_DPP, "first_dpp_mint"),
            }

            if action in action_map:
                event, ach_id = action_map[action]
                await svc.award_wk(uid, event, metadata=metadata)
                if ach_id:
                    await svc.unlock_achievement(uid, ach_id)

            await db.commit()
            return {"action": action, "user_id": user_id}

    return asyncio.run(_run())


@shared_task(name="app.workers.gamification_worker.reset_weekly_wk", queue="analytics")
def reset_weekly_wk() -> dict:
    """Reset weekly WK every Monday (Celery Beat scheduled)"""
    async def _run():
        from app.core.database import async_session
        from sqlalchemy import update
        from app.models.gamification import UserWK

        async with async_session() as db:
            await db.execute(update(UserWK).values(weekly_wk=0))
            await db.commit()
            return {"reset": "weekly_wk"}

    return asyncio.run(_run())


@shared_task(name="app.workers.gamification_worker.snapshot_leaderboard", queue="analytics")
def snapshot_leaderboard() -> dict:
    """Build weekly leaderboard snapshot. Run every Monday after reset_weekly_wk."""
    async def _run():
        from app.core.database import async_session
        from sqlalchemy import select, func, desc
        from app.models.user import User
        from app.models.order import Commission, CommissionStatus
        from app.models.gamification import LeaderboardEntry
        from datetime import date

        today = date.today()
        period = f"{today.year}-W{today.isocalendar().week:02d}"

        async with async_session() as db:
            # KOC GMV ranking
            r = await db.execute(
                select(
                    Commission.koc_id,
                    func.sum(Commission.base_amount).label("gmv"),
                    func.count(Commission.id).label("orders"),
                ).where(
                    Commission.commission_type == "t1",
                    Commission.status == CommissionStatus.SETTLED,
                ).group_by(Commission.koc_id)
                .order_by(desc("gmv"))
                .limit(1000)
            )
            rows = r.all()
            total = len(rows)

            for i, row in enumerate(rows):
                rank = i + 1
                pool_tier = "A" if rank <= max(1, total // 20) else "B" if rank <= max(1, total // 5) else "C" if rank <= total // 2 else None

                entry = LeaderboardEntry(
                    user_id=row.koc_id,
                    board_type="koc_weekly_gmv",
                    period=period,
                    rank=rank,
                    score=float(row.gmv or 0),
                    pool_tier=pool_tier,
                )
                db.add(entry)

            await db.commit()
            return {"period": period, "koc_ranked": total}

    return asyncio.run(_run())
