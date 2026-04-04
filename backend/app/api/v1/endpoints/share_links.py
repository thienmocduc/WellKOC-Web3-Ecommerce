"""WellKOC — Share Links & Social Platform Endpoints"""
import hashlib
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.v1.deps import CurrentUser, get_current_user, require_role
from app.models.user import User, UserRole
from app.models.koc_profile import KOCProfile

router = APIRouter(prefix="/share", tags=["Share Links"])

SUPPORTED_PLATFORMS = {"tiktok", "instagram", "facebook", "youtube", "zalo", "telegram"}


# ── Schemas ──────────────────────────────────────────────────

class SocialLinksUpdate(BaseModel):
    tiktok: Optional[str] = None
    instagram: Optional[str] = None
    facebook: Optional[str] = None
    youtube: Optional[str] = None
    zalo: Optional[str] = None
    telegram: Optional[str] = None


class GenerateLinkRequest(BaseModel):
    product_id: UUID
    platform: str  # tiktok|instagram|facebook|youtube|zalo|telegram
    campaign_name: Optional[str] = None


# ── Social Links ─────────────────────────────────────────────

@router.put("/social-links")
async def update_social_links(
    body: SocialLinksUpdate,
    current_user: User = Depends(require_role([UserRole.KOC])),
    db: AsyncSession = Depends(get_db),
):
    """Save/update KOC's social platform profiles."""
    r = await db.execute(
        select(KOCProfile).where(KOCProfile.user_id == current_user.id)
    )
    profile = r.scalar_one_or_none()

    if not profile:
        profile = KOCProfile(user_id=current_user.id, social_links={})
        db.add(profile)

    links = profile.social_links or {}
    update_data = body.model_dump(exclude_none=True)
    links.update(update_data)
    profile.social_links = links

    await db.commit()
    return {"status": "updated", "social_links": links}


@router.get("/social-links/{koc_id}")
async def get_social_links(
    koc_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get public social links for a KOC."""
    r = await db.execute(
        select(KOCProfile).where(KOCProfile.user_id == koc_id)
    )
    profile = r.scalar_one_or_none()
    if not profile:
        raise HTTPException(404, "KOC profile không tồn tại")

    return {"koc_id": str(koc_id), "social_links": profile.social_links or {}}


# ── Generate Affiliate Link ─────────────────────────────────

@router.post("/generate-link")
async def generate_link(
    body: GenerateLinkRequest,
    current_user: User = Depends(require_role([UserRole.KOC])),
    db: AsyncSession = Depends(get_db),
):
    """Generate affiliate link with UTM tracking for a specific platform."""
    if body.platform not in SUPPORTED_PLATFORMS:
        raise HTTPException(400, f"Platform không hỗ trợ. Chọn: {', '.join(SUPPORTED_PLATFORMS)}")

    ref_code = current_user.referral_code
    campaign = body.campaign_name or f"{body.platform}_share"

    # Build full URL with UTM params
    base_url = f"https://wellkoc.com/p/{body.product_id}"
    utm = (
        f"ref={ref_code}"
        f"&utm_source={body.platform}"
        f"&utm_medium=koc"
        f"&utm_campaign={campaign}"
    )
    full_url = f"{base_url}?{utm}"

    # Generate short code
    hash_input = f"{current_user.id}-{body.product_id}-{body.platform}"
    short_code = hashlib.sha256(hash_input.encode()).hexdigest()[:8].upper()
    short_url = f"https://wkc.io/{short_code}"

    # QR code URL (via public QR API)
    qr_code_url = f"https://api.qrserver.com/v1/create-qr-code/?size=300x300&data={short_url}"

    return {
        "url": full_url,
        "short_url": short_url,
        "short_code": short_code,
        "qr_code_url": qr_code_url,
        "platform": body.platform,
        "referral_code": ref_code,
    }


# ── Share Analytics ──────────────────────────────────────────

@router.get("/analytics")
async def share_analytics(
    current_user: User = Depends(require_role([UserRole.KOC])),
    db: AsyncSession = Depends(get_db),
):
    """Get share performance aggregated per platform.

    NOTE: Full click/conversion tracking requires an analytics events table.
    This endpoint returns a scaffold with commission-based revenue per platform.
    Extend with real tracking data when the analytics pipeline is ready.
    """
    from app.models.order import Order, Commission, CommissionStatus

    # Total commission as proxy for revenue
    r = await db.execute(
        select(func.sum(Commission.amount), func.count(Commission.id))
        .where(
            Commission.koc_id == current_user.id,
            Commission.status == CommissionStatus.SETTLED,
        )
    )
    total_revenue, total_conversions = r.one()
    total_revenue = float(total_revenue or 0)
    total_conversions = total_conversions or 0

    # Placeholder per-platform breakdown
    # In production, this would query an analytics/events table keyed by utm_source
    platforms = []
    for platform in SUPPORTED_PLATFORMS:
        platforms.append({
            "name": platform,
            "clicks": 0,
            "conversions": 0,
            "revenue": "0₫",
            "cvr": "0%",
        })

    return {
        "total_revenue": total_revenue,
        "total_conversions": total_conversions,
        "platforms": platforms,
    }


@router.get("/affiliate-links")
async def get_affiliate_links(
    current_user: User = Depends(require_role([UserRole.KOC])),
    db: AsyncSession = Depends(get_db),
):
    """Return KOC's affiliate links as an array (frontend-compatible format)."""
    from app.models.order import Commission, CommissionStatus
    r = await db.execute(
        select(func.sum(Commission.amount), func.count(Commission.id))
        .where(Commission.koc_id == current_user.id, Commission.status == CommissionStatus.SETTLED)
    )
    total_revenue, total_orders = r.one()
    # Return empty array — populated when affiliate_links table is available
    # Frontend will show empty state and use the generate-link flow to add new links
    return []


@router.get("/analytics/links")
async def analytics_links(
    current_user: User = Depends(require_role([UserRole.KOC])),
    db: AsyncSession = Depends(get_db),
):
    """Get all active share links with stats.

    NOTE: Requires a share_links / affiliate_links tracking table for full
    per-link stats. This returns a summary based on available data.
    """
    from app.models.order import Commission, CommissionStatus

    r = await db.execute(
        select(func.sum(Commission.amount), func.count(Commission.id))
        .where(
            Commission.koc_id == current_user.id,
            Commission.status == CommissionStatus.SETTLED,
        )
    )
    total_revenue, total_orders = r.one()

    return {
        "referral_code": current_user.referral_code,
        "total_revenue": float(total_revenue or 0),
        "total_orders": total_orders or 0,
        "links": [],  # Populate when affiliate_links table is available
    }
