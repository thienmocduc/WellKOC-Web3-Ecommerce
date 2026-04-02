"""
WellKOC — Vendor BI Analytics Dashboard Endpoints (Module #29)
Vendor analytics, real-time metrics, KOC/product performance, platform stats.
"""
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func, and_, case, cast, Date
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.v1.deps import CurrentUser, require_role
from app.models.user import User, UserRole
from app.models.order import Order, Commission, CommissionStatus
from app.models.analytics import AnalyticsEvent, AnalyticsEventType, AnalyticsSnapshot

router = APIRouter(prefix="/analytics", tags=["Vendor BI Analytics"])


# ── Helpers ──────────────────────────────────────────────────

def _default_date_range(from_date: Optional[datetime], to_date: Optional[datetime]):
    """Default to last 30 days if not specified."""
    if not to_date:
        to_date = datetime.now(timezone.utc)
    if not from_date:
        from_date = to_date - timedelta(days=30)
    return from_date, to_date


# ── Vendor Dashboard ─────────────────────────────────────────

@router.get("/vendor")
async def vendor_dashboard(
    from_date: Optional[datetime] = None,
    to_date: Optional[datetime] = None,
    metric: str = Query("gmv", regex="^(gmv|orders|aov|conversion|koc_performance)$"),
    *,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Vendor dashboard analytics with time series, totals, and period comparison."""
    if current_user.role not in (UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPER_ADMIN):
        raise HTTPException(403, "Chỉ vendor hoặc admin mới truy cập được")

    from_date, to_date = _default_date_range(from_date, to_date)
    period_length = (to_date - from_date).days
    prev_from = from_date - timedelta(days=period_length)
    prev_to = from_date

    vendor_filter = (
        Order.vendor_id == current_user.id
        if current_user.role == UserRole.VENDOR
        else True  # Admin sees all
    )

    # Current period
    cur_q = select(
        func.sum(Order.total).label("gmv"),
        func.count(Order.id).label("orders"),
        func.avg(Order.total).label("aov"),
    ).where(
        vendor_filter,
        Order.status == "completed",
        Order.created_at >= from_date,
        Order.created_at < to_date,
    )
    cur_r = await db.execute(cur_q)
    cur = cur_r.one()

    # Previous period
    prev_q = select(
        func.sum(Order.total).label("gmv"),
        func.count(Order.id).label("orders"),
        func.avg(Order.total).label("aov"),
    ).where(
        vendor_filter,
        Order.status == "completed",
        Order.created_at >= prev_from,
        Order.created_at < prev_to,
    )
    prev_r = await db.execute(prev_q)
    prev = prev_r.one()

    # Daily time series
    daily_q = select(
        cast(Order.created_at, Date).label("date"),
        func.sum(Order.total).label("gmv"),
        func.count(Order.id).label("orders"),
    ).where(
        vendor_filter,
        Order.status == "completed",
        Order.created_at >= from_date,
        Order.created_at < to_date,
    ).group_by(cast(Order.created_at, Date)).order_by(cast(Order.created_at, Date))
    daily_r = await db.execute(daily_q)
    daily_rows = daily_r.all()

    time_series = [
        {
            "date": str(row.date),
            "gmv": float(row.gmv or 0),
            "orders": row.orders,
        }
        for row in daily_rows
    ]

    def _pct_change(cur_val, prev_val):
        if not prev_val:
            return None
        return round((float(cur_val or 0) - float(prev_val)) / float(prev_val) * 100, 2)

    return {
        "period": {"from": from_date.isoformat(), "to": to_date.isoformat()},
        "current": {
            "gmv": float(cur.gmv or 0),
            "orders": cur.orders or 0,
            "aov": float(cur.aov or 0),
        },
        "previous": {
            "gmv": float(prev.gmv or 0),
            "orders": prev.orders or 0,
            "aov": float(prev.aov or 0),
        },
        "change_pct": {
            "gmv": _pct_change(cur.gmv, prev.gmv),
            "orders": _pct_change(cur.orders, prev.orders),
            "aov": _pct_change(cur.aov, prev.aov),
        },
        "time_series": time_series,
    }


# ── Real-time Metrics ────────────────────────────────────────

@router.get("/vendor/realtime")
async def vendor_realtime(
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Real-time metrics (last 1 hour): active users, orders in progress, live GMV."""
    if current_user.role not in (UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPER_ADMIN):
        raise HTTPException(403, "Chỉ vendor hoặc admin")

    one_hour_ago = datetime.now(timezone.utc) - timedelta(hours=1)

    vendor_filter = (
        Order.vendor_id == current_user.id
        if current_user.role == UserRole.VENDOR
        else True
    )

    # Orders in last hour
    orders_q = select(
        func.count(Order.id).label("orders"),
        func.sum(Order.total).label("gmv"),
    ).where(
        vendor_filter,
        Order.created_at >= one_hour_ago,
    )
    r = await db.execute(orders_q)
    row = r.one()

    # Active users (views in last hour)
    active_q = select(
        func.count(func.distinct(AnalyticsEvent.user_id))
    ).where(
        AnalyticsEvent.event_type == AnalyticsEventType.VIEW,
        AnalyticsEvent.created_at >= one_hour_ago,
    )
    if current_user.role == UserRole.VENDOR:
        active_q = active_q.where(AnalyticsEvent.vendor_id == current_user.id)
    active_r = await db.execute(active_q)
    active_users = active_r.scalar() or 0

    # Orders in progress (not completed/cancelled)
    in_progress_q = select(func.count(Order.id)).where(
        vendor_filter,
        Order.status.in_(["pending", "confirmed", "packing", "shipping"]),
    )
    ip_r = await db.execute(in_progress_q)
    in_progress = ip_r.scalar() or 0

    return {
        "window": "1h",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "active_users": active_users,
        "orders_last_hour": row.orders or 0,
        "gmv_last_hour": float(row.gmv or 0),
        "orders_in_progress": in_progress,
    }


# ── KOC Performance ──────────────────────────────────────────

@router.get("/vendor/koc-performance")
async def vendor_koc_performance(
    from_date: Optional[datetime] = None,
    to_date: Optional[datetime] = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    *,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """KOC performance for vendor's products: orders, GMV, conversion, commission."""
    if current_user.role not in (UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPER_ADMIN):
        raise HTTPException(403, "Chỉ vendor hoặc admin")

    from_date, to_date = _default_date_range(from_date, to_date)

    vendor_filter = (
        Commission.koc_id.isnot(None)  # Always true, just a placeholder
        if current_user.role != UserRole.VENDOR
        else Order.vendor_id == current_user.id
    )

    # KOC stats from commissions joined with orders
    q = select(
        Commission.koc_id,
        func.count(func.distinct(Commission.order_id)).label("orders"),
        func.sum(Commission.base_amount).label("gmv"),
        func.sum(Commission.amount).label("commission_paid"),
    ).join(
        Order, Commission.order_id == Order.id,
    ).where(
        vendor_filter,
        Commission.status == CommissionStatus.SETTLED,
        Commission.created_at >= from_date,
        Commission.created_at < to_date,
    ).group_by(Commission.koc_id).order_by(
        func.sum(Commission.base_amount).desc()
    ).offset((page - 1) * per_page).limit(per_page)

    result = await db.execute(q)
    rows = result.all()

    # Get view counts for conversion rate
    koc_stats = []
    for koc_id, orders, gmv, comm_paid in rows:
        views_r = await db.execute(
            select(func.count(AnalyticsEvent.id)).where(
                AnalyticsEvent.koc_id == koc_id,
                AnalyticsEvent.event_type == AnalyticsEventType.VIEW,
                AnalyticsEvent.created_at >= from_date,
                AnalyticsEvent.created_at < to_date,
            )
        )
        views = views_r.scalar() or 0
        conversion = round(orders / views * 100, 2) if views > 0 else 0.0

        koc_stats.append({
            "koc_id": str(koc_id),
            "orders": orders,
            "gmv": float(gmv or 0),
            "commission_paid": float(comm_paid or 0),
            "views": views,
            "conversion_rate": conversion,
        })

    return {
        "period": {"from": from_date.isoformat(), "to": to_date.isoformat()},
        "koc_performance": koc_stats,
        "page": page,
        "count": len(koc_stats),
    }


# ── Product Performance ──────────────────────────────────────

@router.get("/vendor/product-performance")
async def vendor_product_performance(
    from_date: Optional[datetime] = None,
    to_date: Optional[datetime] = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    *,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Product-level analytics: views, add-to-cart, purchase, revenue, refund rate."""
    if current_user.role not in (UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPER_ADMIN):
        raise HTTPException(403, "Chỉ vendor hoặc admin")

    from_date, to_date = _default_date_range(from_date, to_date)

    vendor_filter = (
        AnalyticsEvent.vendor_id == current_user.id
        if current_user.role == UserRole.VENDOR
        else True
    )

    # Aggregate events per product
    q = select(
        AnalyticsEvent.product_id,
        func.count(case(
            (AnalyticsEvent.event_type == AnalyticsEventType.VIEW, 1),
        )).label("views"),
        func.count(case(
            (AnalyticsEvent.event_type == AnalyticsEventType.CART, 1),
        )).label("add_to_cart"),
        func.count(case(
            (AnalyticsEvent.event_type == AnalyticsEventType.PURCHASE, 1),
        )).label("purchases"),
        func.count(case(
            (AnalyticsEvent.event_type == AnalyticsEventType.REFUND, 1),
        )).label("refunds"),
        func.sum(case(
            (AnalyticsEvent.event_type == AnalyticsEventType.PURCHASE, AnalyticsEvent.amount),
            else_=0,
        )).label("revenue"),
    ).where(
        vendor_filter,
        AnalyticsEvent.product_id.isnot(None),
        AnalyticsEvent.created_at >= from_date,
        AnalyticsEvent.created_at < to_date,
    ).group_by(AnalyticsEvent.product_id).order_by(
        func.sum(case(
            (AnalyticsEvent.event_type == AnalyticsEventType.PURCHASE, AnalyticsEvent.amount),
            else_=0,
        )).desc()
    ).offset((page - 1) * per_page).limit(per_page)

    result = await db.execute(q)
    rows = result.all()

    products = []
    for product_id, views, carts, purchases, refunds, revenue in rows:
        products.append({
            "product_id": str(product_id),
            "views": views,
            "add_to_cart": carts,
            "add_to_cart_rate": round(carts / views * 100, 2) if views > 0 else 0,
            "purchases": purchases,
            "purchase_rate": round(purchases / views * 100, 2) if views > 0 else 0,
            "revenue": float(revenue or 0),
            "refunds": refunds,
            "refund_rate": round(refunds / purchases * 100, 2) if purchases > 0 else 0,
        })

    return {
        "period": {"from": from_date.isoformat(), "to": to_date.isoformat()},
        "product_performance": products,
        "page": page,
        "count": len(products),
    }


# ── Export ────────────────────────────────────────────────────

@router.get("/vendor/export")
async def vendor_export(
    from_date: Optional[datetime] = None,
    to_date: Optional[datetime] = None,
    *,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Export vendor analytics as CSV. Returns download URL."""
    if current_user.role not in (UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPER_ADMIN):
        raise HTTPException(403, "Chỉ vendor hoặc admin")

    from_date, to_date = _default_date_range(from_date, to_date)

    # In production: generate CSV via background task, upload to S3
    file_name = f"analytics_{current_user.id}_{from_date.strftime('%Y%m%d')}_{to_date.strftime('%Y%m%d')}.csv"
    file_url = f"/exports/{file_name}"

    return {
        "file_url": file_url,
        "period": {"from": from_date.isoformat(), "to": to_date.isoformat()},
        "status": "generating",
        "message": "File CSV sẽ sẵn sàng trong vài phút",
    }


# ── Platform-wide Analytics (Admin) ──────────────────────────

@router.get("/platform")
async def platform_analytics(
    from_date: Optional[datetime] = None,
    to_date: Optional[datetime] = None,
    current_user=Depends(require_role([UserRole.ADMIN, UserRole.SUPER_ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    """Platform-wide analytics: total GMV, users, KOCs, DPP stats, commissions."""
    from_date, to_date = _default_date_range(from_date, to_date)

    # Total GMV & orders
    gmv_q = select(
        func.sum(Order.total).label("gmv"),
        func.count(Order.id).label("orders"),
    ).where(
        Order.status == "completed",
        Order.created_at >= from_date,
        Order.created_at < to_date,
    )
    gmv_r = await db.execute(gmv_q)
    gmv_row = gmv_r.one()

    # Total users by role
    users_q = select(
        User.role,
        func.count(User.id),
    ).group_by(User.role)
    users_r = await db.execute(users_q)
    user_counts = {role: count for role, count in users_r.all()}

    # Commission distributed
    comm_q = select(
        func.sum(Commission.amount),
        func.count(Commission.id),
    ).where(
        Commission.status == CommissionStatus.SETTLED,
        Commission.created_at >= from_date,
        Commission.created_at < to_date,
    )
    comm_r = await db.execute(comm_q)
    comm_total, comm_count = comm_r.one()

    # Active KOCs in period
    active_koc_q = select(
        func.count(func.distinct(Commission.koc_id))
    ).where(
        Commission.created_at >= from_date,
        Commission.created_at < to_date,
    )
    akoc_r = await db.execute(active_koc_q)
    active_kocs = akoc_r.scalar() or 0

    return {
        "period": {"from": from_date.isoformat(), "to": to_date.isoformat()},
        "total_gmv": float(gmv_row.gmv or 0),
        "total_orders": gmv_row.orders or 0,
        "total_users": sum(user_counts.values()),
        "users_by_role": user_counts,
        "total_kocs": user_counts.get(UserRole.KOC, 0),
        "active_kocs": active_kocs,
        "commission_distributed": float(comm_total or 0),
        "commission_transactions": comm_count or 0,
    }
