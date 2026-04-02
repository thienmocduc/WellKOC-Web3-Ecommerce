"""WellKOC — KOC Endpoints (Full)"""
from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.v1.deps import CurrentUser, require_role
from app.models.user import User, UserRole

router = APIRouter(prefix="/koc", tags=["KOC"])

class KOCProfileUpdate(BaseModel):
    display_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    social_links: Optional[dict] = None

@router.get("/profile/{koc_id}")
async def get_koc_profile(koc_id: UUID, db: AsyncSession = Depends(get_db)):
    r = await db.execute(select(User).where(User.id == koc_id, User.role == UserRole.KOC))
    koc = r.scalar_one_or_none()
    if not koc: raise HTTPException(404, "KOC không tồn tại")
    return {"id": str(koc.id), "display_name": koc.display_name, "bio": koc.bio, "avatar_url": koc.avatar_url, "reputation_score": koc.reputation_score, "total_commission_earned": float(koc.total_commission_earned), "tier": koc.membership_tier, "referral_code": koc.referral_code}

@router.put("/profile")
async def update_koc_profile(body: KOCProfileUpdate, current_user: User = Depends(require_role([UserRole.KOC])), db: AsyncSession = Depends(get_db)):
    if body.display_name: current_user.display_name = body.display_name
    if body.bio: current_user.bio = body.bio
    if body.avatar_url: current_user.avatar_url = body.avatar_url
    db.add(current_user)
    return {"status": "updated"}

@router.get("/leaderboard")
async def koc_leaderboard(limit: int = Query(50, ge=10, le=200), db: AsyncSession = Depends(get_db)):
    r = await db.execute(select(User).where(User.role == UserRole.KOC, User.is_active == True).order_by(User.total_commission_earned.desc()).limit(limit))
    kocs = r.scalars().all()
    return {"items": [{"rank": i+1, "id": str(k.id), "display_name": k.display_name, "avatar_url": k.avatar_url, "total_earned": float(k.total_commission_earned), "reputation_score": k.reputation_score} for i, k in enumerate(kocs)]}

@router.get("/affiliate-link")
async def generate_affiliate_link(product_id: UUID, current_user: User = Depends(require_role([UserRole.KOC]))):
    import hashlib
    code = hashlib.sha256(f"{current_user.id}-{product_id}".encode()).hexdigest()[:8].upper()
    return {"short_url": f"https://wkc.io/{code}", "full_url": f"https://wellkoc.com/products/{product_id}?ref={current_user.referral_code}", "short_code": code}

@router.get("/analytics")
async def koc_analytics(current_user: User = Depends(require_role([UserRole.KOC])), db: AsyncSession = Depends(get_db)):
    from app.models.order import Commission, CommissionStatus
    from sqlalchemy import func
    r = await db.execute(select(func.sum(Commission.base_amount), func.count(Commission.id)).where(Commission.koc_id == current_user.id, Commission.status == CommissionStatus.SETTLED))
    gmv, orders = r.one()
    return {"gmv_total": float(gmv or 0), "orders_total": orders or 0, "commission_total": float(current_user.total_commission_earned), "reputation_score": current_user.reputation_score, "referral_code": current_user.referral_code}
