"""WellKOC — Reviews Endpoints"""
from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.v1.deps import CurrentUser
from app.models.order import Order

router = APIRouter(prefix="/reviews", tags=["Reviews"])

class ReviewCreate(BaseModel):
    product_id: UUID
    order_id: UUID
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = Field(None, max_length=2000)
    images: Optional[list] = None

@router.post("", status_code=201)
async def create_review(body: ReviewCreate, current_user: CurrentUser, db: AsyncSession = Depends(get_db)):
    r = await db.execute(select(Order).where(Order.id == body.order_id, Order.buyer_id == current_user.id, Order.review_unlocked == True))
    order = r.scalar_one_or_none()
    if not order: raise HTTPException(403, "Cần hoàn thành đơn hàng trước khi đánh giá")
    # In production: save to reviews table, update product.rating_avg
    order.reviewed_at = __import__('datetime').datetime.now(__import__('datetime').timezone.utc)
    db.add(order)
    from app.services.gamification_service import GamificationService
    from app.models.gamification import WKEvent  # noqa
    svc = GamificationService(db)
    await svc.award_wk(current_user.id, WKEvent.PRODUCT_REVIEWED, reference_id=str(body.order_id))
    return {"status": "created", "rating": body.rating, "wk_earned": 20}

@router.get("/product/{product_id}")
async def product_reviews(product_id: UUID, page: int = Query(1,ge=1), per_page: int = Query(10,ge=1,le=50), db: AsyncSession = Depends(get_db)):
    return {"items": [], "total": 0, "avg_rating": 0, "page": page}
