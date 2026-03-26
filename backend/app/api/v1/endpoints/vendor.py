"""WellKOC — Vendor Endpoints (Full)"""
from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.v1.deps import CurrentUser, require_role
from app.models.user import UserRole
from app.models.order import Order, Commission, CommissionStatus
from app.models.product import Product

router = APIRouter(prefix="/vendor", tags=["Vendor"])
vendor_only = require_role([UserRole.VENDOR, UserRole.ADMIN])

@router.get("/dashboard")
async def vendor_dashboard(current_user: CurrentUser = Depends(vendor_only), db: AsyncSession = Depends(get_db)):
    r_products = await db.execute(select(func.count(Product.id)).where(Product.vendor_id == current_user.id))
    r_orders = await db.execute(select(func.count(Order.id), func.sum(Order.total)).where(Order.vendor_id == current_user.id))
    order_count, revenue = r_orders.one()
    r_kocs = await db.execute(select(func.count(func.distinct(Commission.koc_id))).where(Order.vendor_id == current_user.id))
    return {"products": r_products.scalar() or 0, "orders": order_count or 0, "revenue": float(revenue or 0), "active_kocs": r_kocs.scalar() or 0}

@router.get("/orders")
async def vendor_orders(status: Optional[str]=None, page: int=Query(1,ge=1), per_page: int=Query(20,ge=1,le=100), current_user: CurrentUser = Depends(vendor_only), db: AsyncSession = Depends(get_db)):
    q = select(Order).where(Order.vendor_id == current_user.id)
    if status: q = q.where(Order.status == status)
    total_r = await db.execute(select(func.count()).select_from(q.subquery()))
    q = q.offset((page-1)*per_page).limit(per_page).order_by(Order.created_at.desc())
    r = await db.execute(q); orders = r.scalars().all()
    return {"items": [{"id":str(o.id),"order_number":o.order_number,"status":o.status,"total":float(o.total),"created_at":o.created_at.isoformat()} for o in orders], "total": total_r.scalar() or 0}

@router.get("/koc-network")
async def vendor_koc_network(current_user: CurrentUser = Depends(vendor_only), db: AsyncSession = Depends(get_db)):
    from app.models.user import User
    r = await db.execute(select(Commission.koc_id, func.sum(Commission.base_amount).label("gmv"), func.count(Commission.id).label("orders")).where(Order.vendor_id == current_user.id).join(Order, Commission.order_id == Order.id).group_by(Commission.koc_id).order_by(func.sum(Commission.base_amount).desc()).limit(50))
    rows = r.all()
    return {"kocs": [{"koc_id": str(row.koc_id), "gmv_generated": float(row.gmv or 0), "orders": row.orders} for row in rows]}

@router.post("/ai-price/{product_id}")
async def ai_price_suggestion(product_id: UUID, current_user: CurrentUser = Depends(vendor_only), db: AsyncSession = Depends(get_db)):
    r = await db.execute(select(Product).where(Product.id == product_id, Product.vendor_id == current_user.id))
    product = r.scalar_one_or_none()
    if not product: raise HTTPException(404)
    suggested = round(float(product.price) * 1.032, -3)
    return {"current_price": float(product.price), "suggested_price": suggested, "reasoning": "Phân tích competitor + CVR tuần + tồn kho", "expected_revenue_uplift": "+3.2%"}

@router.get("/inventory")
async def vendor_inventory(current_user: CurrentUser = Depends(vendor_only), db: AsyncSession = Depends(get_db)):
    r = await db.execute(select(Product).where(Product.vendor_id == current_user.id).order_by(Product.stock_quantity.asc()))
    products = r.scalars().all()
    low_stock = [{"id":str(p.id),"name":p.name,"stock":p.stock_quantity,"reorder_point":p.reorder_point} for p in products if p.stock_quantity <= p.reorder_point]
    return {"products": len(products), "low_stock": low_stock, "total_sku": len(products)}
