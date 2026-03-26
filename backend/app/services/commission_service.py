"""
WellKOC — Commission Service
Implements T1 40% + T2 13% + Pool A/B/C + Platform 30%
All commissions queued for on-chain settlement via Polygon smart contract
"""
import logging
from decimal import Decimal
from typing import Optional
from uuid import UUID

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.order import Order, Commission, CommissionStatus
from app.models.user import User

logger = logging.getLogger(__name__)


class CommissionService:
    """
    Commission calculation engine.
    Called after order.status transitions to DELIVERED.
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    async def calculate_and_queue(self, order_id: UUID) -> list[Commission]:
        """
        Main entry point: calculate all commissions for an order.
        Creates Commission records and queues for on-chain settlement.
        """
        order = await self._get_order(order_id)
        if not order or order.commission_calculated:
            logger.warning(f"Order {order_id}: already calculated or not found")
            return []

        commissions = []
        base = Decimal(str(order.total))

        # ── T1: Direct KOC commission ────────────────────────
        if order.koc_t1_id:
            t1_amount = base * Decimal(str(settings.COMMISSION_T1_RATE))
            t1 = Commission(
                order_id=order.id,
                koc_id=order.koc_t1_id,
                commission_type="t1",
                rate=settings.COMMISSION_T1_RATE,
                base_amount=float(base),
                amount=float(t1_amount),
                status=CommissionStatus.QUEUED,
            )
            commissions.append(t1)
            logger.info(f"T1 commission: KOC {order.koc_t1_id} → ₫{t1_amount:,.0f}")

        # ── T2: Referral KOC commission ──────────────────────
        if order.koc_t2_id and order.koc_t2_id != order.koc_t1_id:
            t2_amount = base * Decimal(str(settings.COMMISSION_T2_RATE))
            t2 = Commission(
                order_id=order.id,
                koc_id=order.koc_t2_id,
                commission_type="t2",
                rate=settings.COMMISSION_T2_RATE,
                base_amount=float(base),
                amount=float(t2_amount),
                status=CommissionStatus.QUEUED,
            )
            commissions.append(t2)
            logger.info(f"T2 commission: KOC {order.koc_t2_id} → ₫{t2_amount:,.0f}")

        # ── Pool commissions are calculated weekly via Celery ─
        # Pool A/B/C are distributed from the pool reserve weekly
        # Not per-order, so we don't create records here

        # ── Save to DB ───────────────────────────────────────
        for c in commissions:
            self.db.add(c)

        order.commission_calculated = True
        self.db.add(order)
        await self.db.flush()

        # ── Queue for on-chain settlement ────────────────────
        from app.workers.commission_worker import settle_commissions_batch
        commission_ids = [str(c.id) for c in commissions]
        settle_commissions_batch.apply_async(
            args=[commission_ids],
            countdown=10,  # 10s delay to batch with other orders
        )
        logger.info(f"Queued {len(commissions)} commissions for settlement")

        return commissions

    async def get_koc_summary(
        self,
        koc_id: UUID,
        period: Optional[str] = None,  # "2026-W12" format
    ) -> dict:
        """Get commission summary for a KOC dashboard"""
        q = select(
            func.sum(Commission.amount).label("total"),
            func.count(Commission.id).label("count"),
            Commission.commission_type,
        ).where(
            Commission.koc_id == koc_id,
            Commission.status == CommissionStatus.SETTLED,
        ).group_by(Commission.commission_type)

        if period:
            q = q.where(Commission.period_week == period)

        result = await self.db.execute(q)
        rows = result.all()

        summary = {"total": 0, "count": 0, "by_type": {}}
        for row in rows:
            summary["total"] += float(row.total or 0)
            summary["count"] += row.count
            summary["by_type"][row.commission_type] = {
                "amount": float(row.total or 0),
                "count": row.count,
            }
        return summary

    async def clawback(self, order_id: UUID, reason: str) -> int:
        """
        Reverse commissions (e.g. on return/refund).
        Creates negative commission records and triggers on-chain clawback.
        """
        q = select(Commission).where(
            Commission.order_id == order_id,
            Commission.status == CommissionStatus.SETTLED,
        )
        result = await self.db.execute(q)
        commissions = result.scalars().all()

        clawback_records = []
        for c in commissions:
            cb = Commission(
                order_id=c.order_id,
                koc_id=c.koc_id,
                commission_type=c.commission_type,
                rate=c.rate,
                base_amount=c.base_amount,
                amount=-c.amount,  # Negative = clawback
                status=CommissionStatus.CLAWBACK,
            )
            clawback_records.append(cb)
            self.db.add(cb)

            c.status = CommissionStatus.CLAWBACK
            self.db.add(c)

        await self.db.flush()
        logger.info(f"Clawback {len(clawback_records)} commissions for order {order_id}: {reason}")
        return len(clawback_records)

    async def _get_order(self, order_id: UUID) -> Optional[Order]:
        result = await self.db.execute(select(Order).where(Order.id == order_id))
        return result.scalar_one_or_none()
