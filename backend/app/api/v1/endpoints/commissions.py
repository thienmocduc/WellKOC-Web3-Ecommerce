"""WellKOC — Commissions Endpoints"""
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.v1.deps import CurrentUser
from app.models.order import Commission, CommissionStatus

router = APIRouter(prefix="/commissions", tags=["Commissions"])

@router.get("")
async def list_commissions(
    status: Optional[str]=None, period: Optional[str]=None,
    page: int=Query(1,ge=1), per_page: int=Query(20,ge=1,le=100),
    *,
    current_user: CurrentUser, db: AsyncSession=Depends(get_db),
):
    q = select(Commission).where(Commission.koc_id == current_user.id)
    if status: q = q.where(Commission.status == status)
    if period: q = q.where(Commission.period_week == period)
    total_r = await db.execute(select(func.count()).select_from(q.subquery()))
    q = q.offset((page-1)*per_page).limit(per_page).order_by(Commission.created_at.desc())
    r = await db.execute(q); comms = r.scalars().all()
    return {"items": [{"id":str(c.id),"type":c.commission_type,"amount":float(c.amount),"status":c.status,"tx_hash":c.tx_hash,"block":c.block_number,"created_at":c.created_at.isoformat() if c.created_at else None} for c in comms], "total": total_r.scalar() or 0, "page": page}

@router.get("/summary")
async def commission_summary(current_user: CurrentUser, db: AsyncSession=Depends(get_db)):
    r = await db.execute(select(func.sum(Commission.amount),func.count(Commission.id)).where(Commission.koc_id==current_user.id, Commission.status==CommissionStatus.SETTLED))
    total, count = r.one()
    r2 = await db.execute(select(func.sum(Commission.amount)).where(Commission.koc_id==current_user.id,Commission.status==CommissionStatus.QUEUED))
    pending = r2.scalar() or 0
    return {"total_settled": float(total or 0), "count": count or 0, "pending_amount": float(pending), "currency": "VND"}

@router.get("/pending")
async def pending_commissions(current_user: CurrentUser, db: AsyncSession=Depends(get_db)):
    r = await db.execute(select(Commission).where(Commission.koc_id==current_user.id,Commission.status.in_([CommissionStatus.QUEUED,CommissionStatus.SETTLING])))
    comms = r.scalars().all()
    return {"items": [{"id":str(c.id),"amount":float(c.amount),"type":c.commission_type,"status":c.status} for c in comms], "total_pending": sum(float(c.amount) for c in comms)}
